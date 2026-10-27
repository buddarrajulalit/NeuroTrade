package com.neurotrade;

import com.neurotrade.dto.AuthResponse;
import com.neurotrade.dto.LoginRequest;
import com.neurotrade.dto.RegisterRequest;
import com.neurotrade.service.AuthService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.*;
import org.springframework.test.context.ActiveProfiles;

import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class NeuroTradeApplicationTests {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private AuthService authService;

    @Test
    @DisplayName("Actuator health endpoint returns UP")
    void testHealthEndpoint() {
        ResponseEntity<Map> response = restTemplate.getForEntity(
                "http://localhost:" + port + "/actuator/health", Map.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().get("status")).isEqualTo("UP");
    }

    @Test
    @DisplayName("Public stocks endpoint is accessible without authentication")
    void testPublicStocksEndpoint() {
        ResponseEntity<String> response = restTemplate.getForEntity(
                "http://localhost:" + port + "/api/stocks/public", String.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).contains("AAPL");
    }

    @Test
    @DisplayName("Protected endpoint rejects unauthenticated requests with 401/403")
    void testProtectedEndpointRequiresAuth() {
        ResponseEntity<String> response = restTemplate.getForEntity(
                "http://localhost:" + port + "/api/portfolio/summary", String.class);
        assertThat(response.getStatusCode().value()).isIn(401, 403);
    }

    @Test
    @DisplayName("User registration, password hashing verification, and login flow")
    void testRegistrationAndLogin() {
        String randomSuffix = UUID.randomUUID().toString().substring(0, 8);
        String username = "testuser_" + randomSuffix;
        String email = "test_" + randomSuffix + "@example.com";
        String password = "SecretPassword123!";

        // 1. Register
        RegisterRequest registerReq = RegisterRequest.builder()
                .username(username)
                .email(email)
                .password(password)
                .displayName("Test Trader")
                .build();

        ResponseEntity<AuthResponse> regResponse = restTemplate.postForEntity(
                "http://localhost:" + port + "/api/auth/register", registerReq, AuthResponse.class);

        assertThat(regResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(regResponse.getBody()).isNotNull();
        assertThat(regResponse.getBody().getAccessToken()).isNotBlank();
        assertThat(regResponse.getBody().getUsername()).isEqualTo(username);

        // 2. Login with valid credentials
        LoginRequest loginReq = LoginRequest.builder()
                .username(username)
                .password(password)
                .build();

        ResponseEntity<AuthResponse> loginResponse = restTemplate.postForEntity(
                "http://localhost:" + port + "/api/auth/login", loginReq, AuthResponse.class);

        assertThat(loginResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(loginResponse.getBody()).isNotNull();
        String jwtToken = loginResponse.getBody().getAccessToken();
        assertThat(jwtToken).isNotBlank();

        // 3. Access protected endpoint with valid JWT
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(jwtToken);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<Map> summaryResponse = restTemplate.exchange(
                "http://localhost:" + port + "/api/portfolio/summary",
                HttpMethod.GET,
                entity,
                Map.class);

        assertThat(summaryResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(summaryResponse.getBody()).isNotNull();
        assertThat(summaryResponse.getBody()).containsKey("walletBalance");
    }

    @Test
    @DisplayName("Registration rejects duplicate username with 400 Bad Request")
    void testDuplicateUsernameRejected() {
        String randomSuffix = UUID.randomUUID().toString().substring(0, 8);
        String username = "dupuser_" + randomSuffix;

        RegisterRequest req1 = RegisterRequest.builder()
                .username(username)
                .email("dup1_" + randomSuffix + "@example.com")
                .password("Password123!")
                .build();

        ResponseEntity<AuthResponse> res1 = restTemplate.postForEntity(
                "http://localhost:" + port + "/api/auth/register", req1, AuthResponse.class);
        assertThat(res1.getStatusCode()).isEqualTo(HttpStatus.CREATED);

        RegisterRequest req2 = RegisterRequest.builder()
                .username(username)
                .email("dup2_" + randomSuffix + "@example.com")
                .password("Password123!")
                .build();

        ResponseEntity<Map> res2 = restTemplate.postForEntity(
                "http://localhost:" + port + "/api/auth/register", req2, Map.class);
        assertThat(res2.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }
}
