package com.neurotrade.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Holding – tracks how many shares of a stock a user currently owns.
 */
@Entity
@Table(name = "holdings", uniqueConstraints = @UniqueConstraint(columnNames = { "user_id", "stock_id" }))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Holding {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "stock_id", nullable = false)
    private Stock stock;

    @Column(nullable = false)
    private Integer quantity;

    /** Weighted average cost basis per share */
    @Column(name = "avg_cost_price", precision = 18, scale = 4)
    private BigDecimal avgCostPrice;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /** Convenience: total invested value */
    @Transient
    public BigDecimal getTotalCost() {
        return avgCostPrice.multiply(BigDecimal.valueOf(quantity));
    }

    /** Convenience: current market value */
    @Transient
    public BigDecimal getCurrentValue() {
        return stock.getCurrentPrice().multiply(BigDecimal.valueOf(quantity));
    }

    /** Convenience: unrealized P&L */
    @Transient
    public BigDecimal getPnl() {
        return getCurrentValue().subtract(getTotalCost());
    }

    /** Convenience: unrealized P&L percentage */
    @Transient
    public double getPnlPercent() {
        if (getTotalCost().compareTo(BigDecimal.ZERO) == 0)
            return 0.0;
        return getPnl().divide(getTotalCost(), 6, java.math.RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .doubleValue();
    }
}
