package com.neurotrade.controller;

import com.neurotrade.service.WatchlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Watchlist REST endpoints – add/remove/get user's watchlist symbols.
 */
@RestController
@RequestMapping("/api/watchlist")
@RequiredArgsConstructor
public class WatchlistController {

    private final WatchlistService watchlistService;

    @GetMapping
    public ResponseEntity<List<String>> getWatchlist(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(watchlistService.getWatchlist(userDetails.getUsername()));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> addToWatchlist(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, String> body) {
        String symbol = body.getOrDefault("symbol", "");
        if (symbol.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Symbol is required"));
        }
        return ResponseEntity.ok(watchlistService.addToWatchlist(userDetails.getUsername(), symbol));
    }

    @DeleteMapping("/{symbol}")
    public ResponseEntity<Map<String, Object>> removeFromWatchlist(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String symbol) {
        return ResponseEntity.ok(watchlistService.removeFromWatchlist(userDetails.getUsername(), symbol));
    }
}
