package com.neurotrade.service;

import com.neurotrade.model.User;
import com.neurotrade.model.WatchlistItem;
import com.neurotrade.repository.UserRepository;
import com.neurotrade.repository.WatchlistRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Watchlist Service – manages user's stock watchlist.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class WatchlistService {

    private final WatchlistRepository watchlistRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<String> getWatchlist(String username) {
        User user = findUser(username);
        return watchlistRepository.findByUser(user).stream()
                .map(WatchlistItem::getStockSymbol)
                .collect(Collectors.toList());
    }

    @Transactional
    public Map<String, Object> addToWatchlist(String username, String symbol) {
        User user = findUser(username);
        String sym = symbol.toUpperCase().trim();

        if (watchlistRepository.existsByUserAndStockSymbol(user, sym)) {
            return Map.of("message", "Already in watchlist", "symbol", sym);
        }

        WatchlistItem item = WatchlistItem.builder()
                .user(user)
                .stockSymbol(sym)
                .build();
        watchlistRepository.save(item);

        log.info("User {} added {} to watchlist", username, sym);
        return Map.of("message", "Added to watchlist", "symbol", sym);
    }

    @Transactional
    public Map<String, Object> removeFromWatchlist(String username, String symbol) {
        User user = findUser(username);
        String sym = symbol.toUpperCase().trim();
        watchlistRepository.deleteByUserAndStockSymbol(user, sym);

        log.info("User {} removed {} from watchlist", username, sym);
        return Map.of("message", "Removed from watchlist", "symbol", sym);
    }

    private User findUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
