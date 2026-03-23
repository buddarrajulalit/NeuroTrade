package com.neurotrade.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/** Response payload returned after successful authentication. */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String accessToken;
    private String tokenType = "Bearer";
    private Long userId;
    private String username;
    private String email;
    private String displayName;
    private String role;
    private BigDecimal walletBalance;
    private LocalDateTime expiresAt;

    // Convenience aliases matching alternative field naming
    public String getToken() {
        return accessToken;
    }

    public Long getId() {
        return userId;
    }
}
