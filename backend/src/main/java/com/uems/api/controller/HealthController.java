package com.uems.api.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
public class HealthController {

    @Autowired
    private DataSource dataSource;

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

    @GetMapping("/api/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> healthInfo = new HashMap<>();
        healthInfo.put("service", "UEMS Backend API");
        healthInfo.put("status", "UP");
        healthInfo.put("timestamp", LocalDateTime.now().toString());
        healthInfo.put("version", "1.0.0");

        boolean dbConnected = false;
        try (Connection connection = dataSource.getConnection()) {
            if (connection.isValid(2)) { // 2 seconds timeout
                dbConnected = true;
            }
        } catch (Exception e) {
            // Log warning or store error info
            healthInfo.put("error", e.getMessage());
        }

        if (dbConnected) {
            healthInfo.put("database", "CONNECTED");
            return ResponseEntity.ok(healthInfo);
        } else {
            healthInfo.put("database", "DISCONNECTED");
            healthInfo.put("status", "DEGRADED");
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(healthInfo);
        }
    }
}
