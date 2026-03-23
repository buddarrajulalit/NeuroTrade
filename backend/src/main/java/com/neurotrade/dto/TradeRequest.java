package com.neurotrade.dto;

import jakarta.validation.constraints.*;
import lombok.*;

/** Trade execution request. */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TradeRequest {
    @NotBlank(message = "Stock symbol is required")
    private String symbol;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    @NotBlank(message = "Trade type is required (BUY or SELL)")
    private String type; // BUY | SELL
}
