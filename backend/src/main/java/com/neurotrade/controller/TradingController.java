package com.neurotrade.controller;

import com.neurotrade.dto.TradeRequest;
import com.neurotrade.model.Transaction;
import com.neurotrade.service.TradingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

/**
 * Trading REST endpoint – executes BUY and SELL orders.
 */
@RestController
@RequestMapping("/api/trade")
@RequiredArgsConstructor
public class TradingController {

    private final TradingService tradingService;

    @PostMapping("/execute")
    public ResponseEntity<Transaction> executeTrade(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody TradeRequest request) {
        Transaction tx = tradingService.executeTrade(userDetails.getUsername(), request);
        return ResponseEntity.ok(tx);
    }
}
