package com.uems.api.controller;

import com.uems.api.dto.TicketDto;
import com.uems.api.entity.User;
import com.uems.api.service.AuthService;
import com.uems.api.service.QrCodeService;
import com.uems.api.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;
    private final AuthService authService;
    private final QrCodeService qrCodeService;

    @PostMapping("/book")
    public ResponseEntity<TicketDto> bookTicket(@RequestParam Long eventId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = authService.getCurrentUserByEmail(email);
        return ResponseEntity.status(HttpStatus.CREATED).body(ticketService.bookTicket(user.getId(), eventId));
    }

    @GetMapping("/my")
    public ResponseEntity<List<TicketDto>> getMyTickets() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = authService.getCurrentUserByEmail(email);
        return ResponseEntity.ok(ticketService.getTicketsByUserId(user.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketDto> getTicketById(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    @GetMapping(value = "/{id}/qrcode", produces = MediaType.IMAGE_PNG_VALUE)
    public ResponseEntity<byte[]> getTicketQrCode(@PathVariable Long id) {
        TicketDto ticket = ticketService.getTicketById(id);
        try {
            byte[] qrBytes = qrCodeService.generateQrCodeBytes(ticket.getTicketCode(), 250, 250);
            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_PNG)
                    .body(qrBytes);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
