package com.neurotrade.controller;

import com.neurotrade.dto.StockDto;
import com.neurotrade.service.StockSimulationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Stock market REST endpoints (public + authenticated).
 */
@RestController
@RequestMapping("/api/stocks")
@RequiredArgsConstructor
public class StockController {

    private final StockSimulationService stockSimulationService;

    /** Public endpoint – no auth required (for guest mode). */
    @GetMapping("/public")
    public ResponseEntity<List<StockDto>> getAllStocksPublic() {
        return ResponseEntity.ok(stockSimulationService.getAllStocks());
    }

    @GetMapping
    public ResponseEntity<List<StockDto>> getAllStocks() {
        return ResponseEntity.ok(stockSimulationService.getAllStocks());
    }

    @GetMapping("/{symbol}")
    public ResponseEntity<StockDto> getStock(@PathVariable String symbol) {
        return ResponseEntity.ok(stockSimulationService.getStockBySymbol(symbol.toUpperCase()));
    }
}
