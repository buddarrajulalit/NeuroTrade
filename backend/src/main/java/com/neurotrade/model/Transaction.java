package com.neurotrade.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Transaction – immutable record of every buy/sell event.
 */
@Entity
@Table(name = "transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "stock_id", nullable = false)
    private Stock stock;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Type type;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "price_per_share", precision = 18, scale = 4)
    private BigDecimal pricePerShare;

    @Column(name = "total_amount", precision = 18, scale = 4)
    private BigDecimal totalAmount;

    /** Realized P&L – only relevant for SELL transactions */
    @Column(name = "realized_pnl", precision = 18, scale = 4)
    private BigDecimal realizedPnl;

    @Column(name = "wallet_balance_after", precision = 18, scale = 2)
    private BigDecimal walletBalanceAfter;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum Type {
        BUY, SELL
    }
}
