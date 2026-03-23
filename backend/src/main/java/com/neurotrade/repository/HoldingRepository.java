package com.neurotrade.repository;

import com.neurotrade.model.Holding;
import com.neurotrade.model.Stock;
import com.neurotrade.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HoldingRepository extends JpaRepository<Holding, Long> {
    List<Holding> findByUser(User user);

    Optional<Holding> findByUserAndStock(User user, Stock stock);

    @Query("SELECT SUM(h.quantity) FROM Holding h WHERE h.user = :user")
    Integer sumQuantityByUser(User user);
}
