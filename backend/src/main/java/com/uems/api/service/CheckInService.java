package com.uems.api.service;

import com.uems.api.dto.TicketDto;
import com.uems.api.entity.CheckIn;
import com.uems.api.entity.Ticket;
import com.uems.api.entity.User;
import com.uems.api.exception.BadRequestException;
import com.uems.api.exception.ResourceNotFoundException;
import com.uems.api.repository.CheckInRepository;
import com.uems.api.repository.TicketRepository;
import com.uems.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CheckInService {

    private final CheckInRepository checkInRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final TicketService ticketService;

    public TicketDto processCheckIn(String ticketCode, Long scannerUserId) {
        // 1. Verify cryptographic HMAC signature
        if (!ticketService.verifyTicketCode(ticketCode)) {
            throw new BadRequestException("Invalid or tampered ticket QR code");
        }

        // 2. Fetch the corresponding ticket record
        Ticket ticket = ticketRepository.findByTicketCode(ticketCode)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket registration not found in the database"));

        // 3. Prevent duplicate check-ins
        if (checkInRepository.existsByTicketId(ticket.getId())) {
            throw new BadRequestException("Participant is already checked in for this event");
        }

        // 4. Fetch the scanner (volunteer/admin)
        User scanner = userRepository.findById(scannerUserId)
                .orElse(null);

        // 5. Create CheckIn record
        CheckIn checkIn = CheckIn.builder()
                .ticket(ticket)
                .scannedBy(scanner)
                .build();
        checkInRepository.save(checkIn);

        // Return updated Ticket details
        return ticketService.getTicketById(ticket.getId());
    }

    public long getCheckInCountForEvent(Long eventId) {
        return checkInRepository.countByEventId(eventId);
    }
}
