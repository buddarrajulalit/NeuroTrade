package com.neurotrade.dto;

import lombok.*;
import java.math.BigDecimal;

/** DTO carrying stock data to the frontend via REST or WebSocket. */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockDto {
    private Long id;
    private String symbol;
    private String name;
    private String sector;
    private BigDecimal currentPrice;
    private BigDecimal previousClose;
    private BigDecimal change;
    private Double changePercent;
    private BigDecimal dayHigh;
    private BigDecimal dayLow;
    private BigDecimal marketCap;
    private Long volume;
    private String priceDirection; // UP | DOWN | NEUTRAL
    private String updatedAt;
    private Double volatility;
    private Double trendFactor;

    // Convenience alias for alternative naming
    public BigDecimal getPrice() {
        return currentPrice;
    }
}
