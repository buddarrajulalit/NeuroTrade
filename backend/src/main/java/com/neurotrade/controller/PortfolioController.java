package com.neurotrade.controller;

import com.neurotrade.model.Transaction;
import com.neurotrade.service.PortfolioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Portfolio REST endpoints – holdings, P&L, transactions, sector allocation.
 */
@RestController
@RequestMapping("/api/portfolio")
@RequiredArgsConstructor
public class PortfolioController {

    private final PortfolioService portfolioService;

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(portfolioService.getSummary(userDetails.getUsername()));
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<Transaction>> getTransactions(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "20") int limit) {
        return ResponseEntity.ok(portfolioService.getRecentTransactions(userDetails.getUsername(), limit));
    }

    @GetMapping("/allocation")
    public ResponseEntity<List<Map<String, Object>>> getSectorAllocation(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(portfolioService.getSectorAllocation(userDetails.getUsername()));
    }
}
