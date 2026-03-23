package com.neurotrade.service;

import com.neurotrade.dto.StockDto;
import com.neurotrade.model.Stock;
import com.neurotrade.repository.StockRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.PostConstruct;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;

/**
 * Stock Price Simulation Engine.
 *
 * Generates realistic price movements using:
 * - Gaussian noise (volatility)
 * - Trend persistence (momentum)
 * - Mean reversion bias (prevents runaway prices)
 *
 * Broadcasts updates via STOMP WebSocket every second.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class StockSimulationService {

    private final StockRepository stockRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Value("${neurotrade.stock.simulation.volatility-base}")
    private double volatilityBase;

    @Value("${neurotrade.stock.simulation.trend-strength}")
    private double trendStrength;

    // ─────────────────── Seed Default Stocks ─────────────────

    @PostConstruct
    @Transactional
    public void seedStocks() {
        if (stockRepository.count() > 0)
            return;

        List<Stock> stocks = List.of(
                buildStock("AAPL", "Apple Inc.", "Technology", 178.50, 0.022, 0.0003),
                buildStock("GOOGL", "Alphabet Inc.", "Technology", 140.20, 0.018, 0.0002),
                buildStock("MSFT", "Microsoft Corp.", "Technology", 415.30, 0.015, 0.0004),
                buildStock("TSLA", "Tesla Inc.", "Automotive", 187.60, 0.045, -0.0002),
                buildStock("AMZN", "Amazon.com Inc.", "E-Commerce", 178.90, 0.020, 0.0005),
                buildStock("NVDA", "NVIDIA Corp.", "Semiconductors", 820.40, 0.040, 0.0010),
                buildStock("META", "Meta Platforms", "Social Media", 510.70, 0.028, 0.0003),
                buildStock("JPM", "JPMorgan Chase", "Banking", 197.30, 0.012, 0.0001),
                buildStock("BRK", "Berkshire Hathaway", "Finance", 350.00, 0.010, 0.0001),
                buildStock("XOM", "Exxon Mobil", "Energy", 118.40, 0.020, -0.0002),
                buildStock("WMT", "Walmart Inc.", "Retail", 66.80, 0.012, 0.0002),
                buildStock("DIS", "Walt Disney", "Entertainment", 96.50, 0.025, -0.0001),
                buildStock("NFLX", "Netflix Inc.", "Streaming", 625.00, 0.032, 0.0004),
                buildStock("PYPL", "PayPal Holdings", "Fintech", 64.30, 0.030, -0.0003),
                buildStock("COIN", "Coinbase Global", "Crypto", 218.50, 0.060, 0.0008));

        stockRepository.saveAll(stocks);
        log.info("Seeded {} stocks into the database", stocks.size());
    }

    private Stock buildStock(String sym, String name, String sector,
            double price, double vol, double trend) {
        BigDecimal p = BigDecimal.valueOf(price);
        return Stock.builder()
                .symbol(sym).name(name).sector(sector)
                .currentPrice(p).previousClose(p).openPrice(p)
                .dayHigh(p).dayLow(p)
                .marketCap(p.multiply(
                        BigDecimal.valueOf(ThreadLocalRandom.current().nextLong(1_000_000_000L, 3_000_000_000_000L))))
                .volume(0L)
                .volatility(vol)
                .trendFactor(trend)
                .build();
    }

    // ─────────────────── Simulation Loop ─────────────────────

    /**
     * Runs every 1 second. Updates each stock price and broadcasts via WebSocket.
     */
    @Scheduled(fixedRateString = "${neurotrade.stock.simulation.interval-ms}")
    @Transactional
    public void simulatePrices() {
        List<Stock> stocks = stockRepository.findByActiveTrue();
        List<StockDto> updates = new ArrayList<>();

        for (Stock stock : stocks) {
            BigDecimal newPrice = computeNewPrice(stock);
            BigDecimal oldPrice = stock.getCurrentPrice();

            // Update day high/low
            if (newPrice.compareTo(stock.getDayHigh()) > 0)
                stock.setDayHigh(newPrice);
            if (newPrice.compareTo(stock.getDayLow()) < 0)
                stock.setDayLow(newPrice);

            // Slightly shift trend (random walk mutation)
            double trendMutation = (ThreadLocalRandom.current().nextDouble() - 0.5) * 0.0001;
            stock.setTrendFactor(clamp(stock.getTrendFactor() + trendMutation, -0.005, 0.005));

            // Accumulate simulated volume
            long volumeDelta = ThreadLocalRandom.current().nextLong(100, 10_000);
            stock.setVolume(stock.getVolume() + volumeDelta);

            stock.setCurrentPrice(newPrice);
            updates.add(toDto(stock, oldPrice));
        }

        stockRepository.saveAll(stocks);

        // Broadcast all stock updates to subscribed clients
        messagingTemplate.convertAndSend("/topic/stocks", updates);
    }

    /**
     * Gaussian price model:
     * newPrice = prevPrice * e^(trend + volatility * Z)
     * where Z ~ N(0,1) — Geometric Brownian Motion approximation.
     */
    private BigDecimal computeNewPrice(Stock stock) {
        double z = ThreadLocalRandom.current().nextGaussian();
        double vol = stock.getVolatility() != null ? stock.getVolatility() : volatilityBase;
        double trend = stock.getTrendFactor() != null ? stock.getTrendFactor() : 0;

        // Mean reversion: slight pull toward initial price prevents runaway
        double meanReversion = (stock.getOpenPrice().doubleValue() - stock.getCurrentPrice().doubleValue())
                / stock.getOpenPrice().doubleValue() * 0.005;

        double returnRate = trend + meanReversion + vol * z;
        double newPriceRaw = stock.getCurrentPrice().doubleValue() * Math.exp(returnRate);

        // Floor at $0.01 to prevent negative prices
        newPriceRaw = Math.max(0.01, newPriceRaw);

        return BigDecimal.valueOf(newPriceRaw).setScale(4, RoundingMode.HALF_UP);
    }

    public List<StockDto> getAllStocks() {
        return stockRepository.findByActiveTrue().stream()
                .map(s -> toDto(s, s.getPreviousClose()))
                .toList();
    }

    public StockDto getStockBySymbol(String symbol) {
        Stock s = stockRepository.findBySymbol(symbol)
                .orElseThrow(() -> new RuntimeException("Stock not found: " + symbol));
        return toDto(s, s.getPreviousClose());
    }

    // ─────────────────── DTO Mapping ─────────────────────────

    private StockDto toDto(Stock stock, BigDecimal previousPrice) {
        BigDecimal change = stock.getCurrentPrice().subtract(stock.getPreviousClose());
        double changePercent = stock.getChangePercent();
        String direction = change.compareTo(BigDecimal.ZERO) > 0 ? "UP"
                : change.compareTo(BigDecimal.ZERO) < 0 ? "DOWN" : "NEUTRAL";

        return StockDto.builder()
                .id(stock.getId())
                .symbol(stock.getSymbol())
                .name(stock.getName())
                .sector(stock.getSector())
                .currentPrice(stock.getCurrentPrice())
                .previousClose(stock.getPreviousClose())
                .change(change)
                .changePercent(changePercent)
                .dayHigh(stock.getDayHigh())
                .dayLow(stock.getDayLow())
                .marketCap(stock.getMarketCap())
                .volume(stock.getVolume())
                .priceDirection(direction)
                .volatility(stock.getVolatility())
                .trendFactor(stock.getTrendFactor())
                .updatedAt(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME))
                .build();
    }

    private double clamp(double value, double min, double max) {
        return Math.max(min, Math.min(max, value));
    }
}
