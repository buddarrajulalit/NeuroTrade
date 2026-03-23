package com.neurotrade.service;

import com.neurotrade.model.*;
import com.neurotrade.repository.*;
import lombok.*;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

/**
 * Portfolio Service – aggregates holding and performance metrics.
 */
@Service
@RequiredArgsConstructor
public class PortfolioService {

    private final UserRepository userRepository;
    private final HoldingRepository holdingRepository;
    private final TransactionRepository transactionRepository;

    @Transactional(readOnly = true)
    public Map<String, Object> getSummary(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Holding> holdings = holdingRepository.findByUser(user);

        BigDecimal totalInvested = BigDecimal.ZERO;
        BigDecimal totalMarketValue = BigDecimal.ZERO;
        BigDecimal totalUnrealizedPnl = BigDecimal.ZERO;

        List<Map<String, Object>> holdingDtos = new ArrayList<>();
        for (Holding h : holdings) {
            BigDecimal mv = h.getCurrentValue();
            BigDecimal cost = h.getTotalCost();
            BigDecimal pnl = h.getPnl();
            double pnlPct = h.getPnlPercent();

            totalInvested = totalInvested.add(cost);
            totalMarketValue = totalMarketValue.add(mv);
            totalUnrealizedPnl = totalUnrealizedPnl.add(pnl);

            Map<String, Object> dto = new LinkedHashMap<>();
            dto.put("id", h.getId());
            dto.put("symbol", h.getStock().getSymbol());
            dto.put("name", h.getStock().getName());
            dto.put("sector", h.getStock().getSector());
            dto.put("quantity", h.getQuantity());
            dto.put("avgCostPrice", h.getAvgCostPrice());
            dto.put("currentPrice", h.getStock().getCurrentPrice());
            dto.put("totalCost", cost);
            dto.put("marketValue", mv);
            dto.put("pnl", pnl);
            dto.put("pnlPercent", pnlPct);
            holdingDtos.add(dto);
        }

        BigDecimal totalAssets = user.getWalletBalance().add(totalMarketValue);
        double portfolioGrowth = totalInvested.compareTo(BigDecimal.ZERO) == 0 ? 0.0
                : totalUnrealizedPnl.divide(totalInvested, 6, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100)).doubleValue();

        BigDecimal realizedPnl = transactionRepository.sumRealizedPnlByUser(user);
        long wins = transactionRepository.countWinsByUser(user);
        long totalSells = transactionRepository.countSellsByUser(user);
        double winRate = totalSells == 0 ? 0.0 : (double) wins / totalSells * 100;

        return Map.of(
                "walletBalance", user.getWalletBalance(),
                "totalInvested", totalInvested,
                "totalMarketValue", totalMarketValue,
                "totalAssets", totalAssets,
                "unrealizedPnl", totalUnrealizedPnl,
                "realizedPnl", realizedPnl,
                "portfolioGrowthPct", portfolioGrowth,
                "winRate", winRate,
                "holdings", holdingDtos,
                "holdingsCount", holdings.size());
    }

    @Transactional(readOnly = true)
    public List<Transaction> getRecentTransactions(String username, int limit) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return transactionRepository
                .findByUserOrderByCreatedAtDesc(user, PageRequest.of(0, limit))
                .getContent();
    }

    /** Computes per-sector allocation for heatmap chart */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getSectorAllocation(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<Holding> holdings = holdingRepository.findByUser(user);

        Map<String, BigDecimal> sectorMap = new LinkedHashMap<>();
        for (Holding h : holdings) {
            String sector = h.getStock().getSector();
            sectorMap.merge(sector, h.getCurrentValue(), BigDecimal::add);
        }

        BigDecimal total = sectorMap.values().stream().reduce(BigDecimal.ZERO, BigDecimal::add);

        return sectorMap.entrySet().stream()
                .map(e -> Map.<String, Object>of(
                        "sector", e.getKey(),
                        "value", e.getValue(),
                        "percent", total.compareTo(BigDecimal.ZERO) == 0 ? 0.0
                                : e.getValue().divide(total, 4, RoundingMode.HALF_UP)
                                        .multiply(BigDecimal.valueOf(100)).doubleValue()))
                .toList();
    }
}
