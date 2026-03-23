package com.neurotrade.repository;

import com.neurotrade.model.Transaction;
import com.neurotrade.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    Page<Transaction> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);

    List<Transaction> findByUserAndTypeOrderByCreatedAtDesc(User user, Transaction.Type type);

    @Query("SELECT COALESCE(SUM(t.realizedPnl), 0) FROM Transaction t WHERE t.user = :user AND t.type = 'SELL'")
    BigDecimal sumRealizedPnlByUser(User user);

    @Query("SELECT COUNT(t) FROM Transaction t WHERE t.user = :user AND t.type = 'SELL' AND t.realizedPnl > 0")
    Long countWinsByUser(User user);

    @Query("SELECT COUNT(t) FROM Transaction t WHERE t.user = :user AND t.type = 'SELL'")
    Long countSellsByUser(User user);
}
