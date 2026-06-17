package com.uems.api.controller;

import com.uems.api.dto.TicketDto;
import com.uems.api.entity.User;
import com.uems.api.service.AuthService;
import com.uems.api.service.CheckInService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/checkins")
@RequiredArgsConstructor
public class CheckInController {

    private final CheckInService checkInService;
    private final AuthService authService;

    @PostMapping("/scan")
    public ResponseEntity<TicketDto> scanTicket(@RequestBody ScanRequest request) {
        String scannerEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User scanner = authService.getCurrentUserByEmail(scannerEmail);
        TicketDto updatedTicket = checkInService.processCheckIn(request.getTicketCode(), scanner.getId());
        return ResponseEntity.ok(updatedTicket);
    }

    @Data
    public static class ScanRequest {
        private String ticketCode;
    }
}
