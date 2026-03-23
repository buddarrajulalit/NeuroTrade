package com.neurotrade.dto;

import jakarta.validation.constraints.*;
import lombok.*;

/** Login request payload. */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {
    @NotBlank(message = "Username is required")
    private String username;

    @NotBlank(message = "Password is required")
    private String password;
}
