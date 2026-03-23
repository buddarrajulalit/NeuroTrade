package com.neurotrade.service;

import com.neurotrade.dto.TradeRequest;
import com.neurotrade.model.*;
import com.neurotrade.repository.*;
import lombok.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

/**
 * Core Trading Engine.
 * Executes BUY / SELL orders atomically within a DB transaction.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TradingService {

    private final UserRepository userRepository;
    private final StockRepository stockRepository;
    private final HoldingRepository holdingRepository;
    private final TransactionRepository transactionRepository;

    // ─────────────────── BUY ─────────────────────────────────

    @Transactional
    public Transaction executeTrade(String username, TradeRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Stock stock = stockRepository.findBySymbol(request.getSymbol())
                .orElseThrow(() -> new RuntimeException("Stock not found: " + request.getSymbol()));

        return switch (request.getType().toUpperCase()) {
            case "BUY" -> executeBuy(user, stock, request.getQuantity());
            case "SELL" -> executeSell(user, stock, request.getQuantity());
            default -> throw new IllegalArgumentException("Invalid trade type: " + request.getType());
        };
    }

    private Transaction executeBuy(User user, Stock stock, int quantity) {
        BigDecimal price = stock.getCurrentPrice();
        BigDecimal totalCost = price.multiply(BigDecimal.valueOf(quantity));

        if (user.getWalletBalance().compareTo(totalCost) < 0) {
            throw new IllegalStateException(
                    String.format("Insufficient funds. Need $%.2f, available $%.2f",
                            totalCost, user.getWalletBalance()));
        }

        // Deduct from wallet
        user.setWalletBalance(user.getWalletBalance().subtract(totalCost));

        // Update or create holding (weighted average cost basis)
        Holding holding = holdingRepository.findByUserAndStock(user, stock)
                .orElse(Holding.builder().user(user).stock(stock).quantity(0)
                        .avgCostPrice(BigDecimal.ZERO).build());

        int newQty = holding.getQuantity() + quantity;
        BigDecimal newAvg = holding.getTotalCost().add(totalCost)
                .divide(BigDecimal.valueOf(newQty), 4, RoundingMode.HALF_UP);
        holding.setQuantity(newQty);
        holding.setAvgCostPrice(newAvg);
        holding.setUpdatedAt(LocalDateTime.now());
        holdingRepository.save(holding);

        userRepository.save(user);

        Transaction tx = Transaction.builder()
                .user(user).stock(stock)
                .type(Transaction.Type.BUY)
                .quantity(quantity)
                .pricePerShare(price)
                .totalAmount(totalCost)
                .realizedPnl(BigDecimal.ZERO)
                .walletBalanceAfter(user.getWalletBalance())
                .build();

        log.info("BUY executed: {} x {} @ ${} by {}", quantity, stock.getSymbol(), price, user.getUsername());
        return transactionRepository.save(tx);
    }

    private Transaction executeSell(User user, Stock stock, int quantity) {
        Holding holding = holdingRepository.findByUserAndStock(user, stock)
                .orElseThrow(() -> new IllegalStateException(
                        "You don't hold any shares of " + stock.getSymbol()));

        if (holding.getQuantity() < quantity) {
            throw new IllegalStateException(
                    String.format("Insufficient shares. Holding %d, trying to sell %d",
                            holding.getQuantity(), quantity));
        }

        BigDecimal price = stock.getCurrentPrice();
        BigDecimal proceeds = price.multiply(BigDecimal.valueOf(quantity));

        // Realized P&L = (sell price - avg cost) * quantity
        BigDecimal realizedPnl = price.subtract(holding.getAvgCostPrice())
                .multiply(BigDecimal.valueOf(quantity));

        // Credit wallet
        user.setWalletBalance(user.getWalletBalance().add(proceeds));

        // Reduce or remove holding
        int remainingQty = holding.getQuantity() - quantity;
        if (remainingQty == 0) {
            holdingRepository.delete(holding);
        } else {
            holding.setQuantity(remainingQty);
            holding.setUpdatedAt(LocalDateTime.now());
            holdingRepository.save(holding);
        }

        userRepository.save(user);

        Transaction tx = Transaction.builder()
                .user(user).stock(stock)
                .type(Transaction.Type.SELL)
                .quantity(quantity)
                .pricePerShare(price)
                .totalAmount(proceeds)
                .realizedPnl(realizedPnl)
                .walletBalanceAfter(user.getWalletBalance())
                .build();

        log.info("SELL executed: {} x {} @ ${} (PnL: ${}) by {}",
                quantity, stock.getSymbol(), price, realizedPnl, user.getUsername());
        return transactionRepository.save(tx);
    }
}
