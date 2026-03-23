package com.neurotrade.repository;

import com.neurotrade.model.User;
import com.neurotrade.model.WatchlistItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for Watchlist operations.
 */
public interface WatchlistRepository extends JpaRepository<WatchlistItem, Long> {

    List<WatchlistItem> findByUser(User user);

    Optional<WatchlistItem> findByUserAndStockSymbol(User user, String stockSymbol);

    void deleteByUserAndStockSymbol(User user, String stockSymbol);

    boolean existsByUserAndStockSymbol(User user, String stockSymbol);
}
