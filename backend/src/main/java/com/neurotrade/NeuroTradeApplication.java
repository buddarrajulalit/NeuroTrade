package com.neurotrade;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * NeuroTrade – AI Virtual Stock Market
 * Main application entry point
 */
@SpringBootApplication
@EnableScheduling
public class NeuroTradeApplication {
    public static void main(String[] args) {
        SpringApplication.run(NeuroTradeApplication.class, args);
    }
}
