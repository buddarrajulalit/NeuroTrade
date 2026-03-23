package com.neurotrade.ai;

import com.neurotrade.model.*;
import com.neurotrade.repository.*;
import lombok.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

/**
 * AI Market Insights Engine – Rule-Based Analyst.
 *
 * This module is designed as a PLUGGABLE architecture:
 * - Currently uses deterministic rule-based logic.
 * - Swap out analyzePortfolio() implementation to call OpenAI GPT, Anthropic
 * Claude,
 * or any LLM API without changing the controller interface.
 *
 * Output schema:
 * {
 * sentiment: "bullish" | "bearish" | "neutral",
 * confidence: 0.0 - 1.0,
 * advice: string,
 * riskScore: 0-100,
 * traderSkill: { winRate, discipline, riskScore },
 * marketSignals: [...],
 * aiModel: "rule-based" | "openai-gpt4" | "anthropic-claude"
 * }
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AiInsightsService {

    private final UserRepository userRepository;
    private final HoldingRepository holdingRepository;
    private final TransactionRepository transactionRepository;
    private final com.neurotrade.repository.StockRepository stockRepository;

    @Transactional(readOnly = true)
    public Map<String, Object> generateInsights(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Holding> holdings = holdingRepository.findByUser(user);
        long totalSells = transactionRepository.countSellsByUser(user);
        long wins = transactionRepository.countWinsByUser(user);

        // ── Metric Calculations ──
        double winRate = totalSells == 0 ? 0 : (double) wins / totalSells * 100;

        double avgVolatility = computeAvgPortfolioVolatility(holdings);
        int riskScore = computeRiskScore(holdings, user.getWalletBalance(), avgVolatility);
        String sentiment = computeSentiment(holdings);
        double confidence = computeConfidence(holdings, winRate);
        String advice = generateAdvice(holdings, riskScore, winRate, user.getWalletBalance());
        int disciplineScore = computeDisciplineScore(totalSells, winRate);

        List<Map<String, Object>> signals = generateMarketSignals(holdings);

        return Map.of(
                "sentiment", sentiment,
                "confidence", confidence,
                "advice", advice,
                "riskScore", riskScore,
                "aiModel", "rule-based",
                "traderSkill", Map.of(
                        "winRate", Math.round(winRate * 10.0) / 10.0,
                        "discipline", disciplineScore,
                        "riskScore", riskScore,
                        "totalTrades", totalSells,
                        "profitableTrades", wins),
                "marketSignals", signals,
                "portfolioHealth", computePortfolioHealth(riskScore, winRate, holdings));
    }

    // ─────────── Private analysis methods ──────────────────────

    private double computeAvgPortfolioVolatility(List<Holding> holdings) {
        if (holdings.isEmpty())
            return 0;
        return holdings.stream()
                .mapToDouble(h -> h.getStock().getVolatility() != null ? h.getStock().getVolatility() : 0.02)
                .average().orElse(0.02);
    }

    private int computeRiskScore(List<Holding> holdings, BigDecimal wallet, double avgVol) {
        if (holdings.isEmpty())
            return 10;
        BigDecimal totalInvested = holdings.stream()
                .map(Holding::getTotalCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalAssets = wallet.add(totalInvested);

        // Concentration risk: how much is in stocks vs cash
        double investedRatio = totalAssets.compareTo(BigDecimal.ZERO) == 0 ? 0
                : totalInvested.divide(totalAssets, 4, RoundingMode.HALF_UP).doubleValue();

        // Diversification: penalise if >50% in single stock
        double maxConcentration = holdings.stream()
                .mapToDouble(h -> totalInvested.compareTo(BigDecimal.ZERO) == 0 ? 0
                        : h.getTotalCost().divide(totalInvested, 4, RoundingMode.HALF_UP).doubleValue())
                .max().orElse(0);

        return (int) Math.min(100, Math.round(
                investedRatio * 40 + avgVol * 1000 + maxConcentration * 30));
    }

    private String computeSentiment(List<Holding> holdings) {
        if (holdings.isEmpty())
            return "neutral";
        long gainers = holdings.stream().filter(h -> h.getPnl().compareTo(BigDecimal.ZERO) > 0).count();
        long losers = holdings.stream().filter(h -> h.getPnl().compareTo(BigDecimal.ZERO) < 0).count();
        if (gainers > losers * 1.5)
            return "bullish";
        if (losers > gainers * 1.5)
            return "bearish";
        return "neutral";
    }

    private double computeConfidence(List<Holding> holdings, double winRate) {
        double base = 0.5;
        if (!holdings.isEmpty())
            base += 0.1;
        if (winRate > 60)
            base += 0.2;
        else if (winRate < 40)
            base -= 0.1;
        return Math.round(Math.min(0.99, Math.max(0.1, base)) * 100) / 100.0;
    }

    private String generateAdvice(List<Holding> holdings, int riskScore, double winRate, BigDecimal wallet) {
        if (holdings.isEmpty())
            return "Start building your portfolio. Consider diversifying across sectors.";
        if (riskScore > 75)
            return "High portfolio risk detected. Consider taking profits or diversifying.";
        if (riskScore > 50 && winRate < 40)
            return "Moderate risk with low win rate. Review your trading strategy.";
        if (winRate > 70)
            return "Strong performance! Maintain discipline and consider scaling winning positions.";
        if (wallet.compareTo(BigDecimal.valueOf(10_000)) < 0)
            return "Preserve remaining capital. Avoid leveraging high-volatility stocks.";
        return "Portfolio is balanced. Monitor sector concentrations and rebalance quarterly.";
    }

    private int computeDisciplineScore(long totalSells, double winRate) {
        int base = 50;
        if (totalSells >= 10 && winRate > 55)
            base += 30;
        else if (totalSells >= 5 && winRate > 45)
            base += 15;
        else if (totalSells == 0)
            base = 50; // untested
        return Math.min(100, base);
    }

    private List<Map<String, Object>> generateMarketSignals(List<Holding> holdings) {
        List<Map<String, Object>> signals = new ArrayList<>();
        for (Holding h : holdings) {
            double pnlPct = h.getPnlPercent();
            String signal;
            String strength;
            if (pnlPct > 10) {
                signal = "TAKE_PROFIT";
                strength = "STRONG";
            } else if (pnlPct < -10) {
                signal = "STOP_LOSS";
                strength = "URGENT";
            } else if (pnlPct > 5) {
                signal = "HOLD";
                strength = "MODERATE";
            } else {
                signal = "ACCUMULATE";
                strength = "WEAK";
            }

            signals.add(Map.of(
                    "symbol", h.getStock().getSymbol(),
                    "signal", signal,
                    "strength", strength,
                    "pnlPct", Math.round(pnlPct * 100.0) / 100.0));
        }
        return signals;
    }

    private String computePortfolioHealth(int riskScore, double winRate, List<Holding> holdings) {
        if (holdings.isEmpty())
            return "EMPTY";
        if (riskScore < 30 && winRate > 55)
            return "EXCELLENT";
        if (riskScore < 50 && winRate >= 45)
            return "GOOD";
        if (riskScore < 70)
            return "FAIR";
        return "POOR";
    }
}
