package com.uems.api.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
public class HealthController {

    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> root() {
        return ResponseEntity.ok(Map.of(
                "service", "UEMS Backend API",
                "status", "UP",
                "timestamp", LocalDateTime.now().toString(),
                "docs", "/api/events — List all events (public)",
                "version", "1.0.0"
        ));
    }
}
