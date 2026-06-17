package com.uems.api.controller;

import com.uems.api.dto.SponsorDto;
import com.uems.api.service.SponsorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sponsors")
@RequiredArgsConstructor
public class SponsorController {

    private final SponsorService sponsorService;

    @GetMapping
    public ResponseEntity<List<SponsorDto>> getAllSponsors() {
        return ResponseEntity.ok(sponsorService.getAllSponsors());
    }

    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<SponsorDto>> getSponsorsByEvent(@PathVariable Long eventId) {
        return ResponseEntity.ok(sponsorService.getSponsorsByEvent(eventId));
    }

    // Admin endpoints
    @PostMapping
    public ResponseEntity<SponsorDto> addSponsor(@Valid @RequestBody SponsorDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(sponsorService.addSponsor(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SponsorDto> updateSponsor(@PathVariable Long id, @Valid @RequestBody SponsorDto dto) {
        return ResponseEntity.ok(sponsorService.updateSponsor(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSponsor(@PathVariable Long id) {
        sponsorService.deleteSponsor(id);
        return ResponseEntity.noContent().build();
    }
}
