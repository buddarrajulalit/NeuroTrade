package com.neurotrade.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Stock entity – represents a tradable instrument in the simulation.
 */
@Entity
@Table(name = "stocks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Stock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 10)
    private String symbol;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, length = 50)
    private String sector;

    @Column(name = "current_price", precision = 18, scale = 4)
    private BigDecimal currentPrice;

    @Column(name = "previous_close", precision = 18, scale = 4)
    private BigDecimal previousClose;

    @Column(name = "open_price", precision = 18, scale = 4)
    private BigDecimal openPrice;

    @Column(name = "day_high", precision = 18, scale = 4)
    private BigDecimal dayHigh;

    @Column(name = "day_low", precision = 18, scale = 4)
    private BigDecimal dayLow;

    @Column(name = "market_cap", precision = 22, scale = 2)
    private BigDecimal marketCap;

    @Column(name = "volume")
    @Builder.Default
    private Long volume = 0L;

    /** Simulated trend: positive = bullish, negative = bearish */
    @Column(name = "trend_factor")
    @Builder.Default
    private Double trendFactor = 0.0;

    @Column(name = "volatility")
    @Builder.Default
    private Double volatility = 0.02;

    @Column(name = "is_active")
    @Builder.Default
    private boolean active = true;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /** Convenience: % change from previous close */
    @Transient
    public double getChangePercent() {
        if (previousClose == null || previousClose.compareTo(BigDecimal.ZERO) == 0)
            return 0.0;
        return currentPrice.subtract(previousClose)
                .divide(previousClose, 6, java.math.RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .doubleValue();
    }

    @Transient
    public BigDecimal getChange() {
        if (previousClose == null)
            return BigDecimal.ZERO;
        return currentPrice.subtract(previousClose);
    }
}
