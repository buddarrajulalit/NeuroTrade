package com.neurotrade.controller;

import com.neurotrade.ai.AiInsightsService;
import com.neurotrade.dto.StockDto;
import com.neurotrade.service.StockSimulationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * AI Market Insights REST endpoints.
 */
@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiInsightsController {

    private final AiInsightsService aiInsightsService;
    private final StockSimulationService stockSimulationService;

    @GetMapping("/insights")
    public ResponseEntity<Map<String, Object>> getInsights(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(aiInsightsService.generateInsights(userDetails.getUsername()));
    }

    /**
     * AI Stock Score – rule-based score for a given symbol.
     * Returns BUY/SELL/HOLD signal with confidence and analysis.
     */
    @GetMapping("/score/{symbol}")
    public ResponseEntity<Map<String, Object>> getStockScore(@PathVariable String symbol) {
        try {
            StockDto stock = stockSimulationService.getStockBySymbol(symbol.toUpperCase());

            double changePct = stock.getChangePercent();
            long volume = stock.getVolume();
            double volatility = stock.getVolatility() != null ? stock.getVolatility() : 0.02;

            // Rule-based scoring algorithm
            double score = 50;
            score += changePct * 3;           // Momentum component
            score += volume > 1_000_000 ? 10 : volume > 500_000 ? 5 : 0; // Volume component
            score -= volatility * 200;        // Risk penalty
            score += (Math.random() - 0.5) * 10; // Market noise

            score = Math.max(10, Math.min(95, Math.round(score)));

            String signal = score >= 70 ? "BUY" : score <= 35 ? "SELL" : "HOLD";
            String strength = score >= 80 ? "STRONG" : score >= 60 ? "MODERATE" : score <= 25 ? "URGENT" : "WEAK";
            double confidence = Math.min(0.95, 0.5 + Math.abs(score - 50) / 100.0);

            Map<String, Object> result = new LinkedHashMap<>();
            result.put("symbol", stock.getSymbol());
            result.put("name", stock.getName());
            result.put("score", (int) score);
            result.put("signal", signal);
            result.put("strength", strength);
            result.put("confidence", Math.round(confidence * 100) / 100.0);
            result.put("currentPrice", stock.getCurrentPrice());
            result.put("changePercent", changePct);
            result.put("analysis", generateStockAnalysis(signal, stock));

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Stock not found",
                    "symbol", symbol.toUpperCase()));
        }
    }

    private String generateStockAnalysis(String signal, StockDto stock) {
        return switch (signal) {
            case "BUY" ->
                String.format("%s shows strong positive momentum with %.2f%% change. Volume supports upward trend. Consider accumulating.",
                        stock.getSymbol(), stock.getChangePercent());
            case "SELL" ->
                String.format("%s appears overvalued or in a downtrend with %.2f%% change. Consider taking profits or setting stop-losses.",
                        stock.getSymbol(), stock.getChangePercent());
            default ->
                String.format("%s is trading in a stable range. Monitor for breakout signals before taking action.",
                        stock.getSymbol());
        };
    }
}
