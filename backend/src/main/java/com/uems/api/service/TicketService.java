package com.uems.api.service;

import com.uems.api.dto.TicketDto;
import com.uems.api.entity.Event;
import com.uems.api.entity.Ticket;
import com.uems.api.entity.User;
import com.uems.api.entity.CheckIn;
import com.uems.api.exception.BadRequestException;
import com.uems.api.exception.ResourceNotFoundException;
import com.uems.api.repository.CheckInRepository;
import com.uems.api.repository.EventRepository;
import com.uems.api.repository.TicketRepository;
import com.uems.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final CheckInRepository checkInRepository;

    @Value("${app.jwt.secret}")
    private String hmacSecret;

    public TicketDto bookTicket(Long userId, Long eventId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));

        if (ticketRepository.existsByUserIdAndEventId(userId, eventId)) {
            throw new BadRequestException("You are already registered for this event");
        }

        long registered = ticketRepository.countByEventId(eventId);
        if (registered >= event.getMaxCapacity()) {
            throw new BadRequestException("This event has reached its maximum capacity");
        }

        long timestamp = Instant.now().getEpochSecond();
        String payload = String.format("%d:%d:%d", userId, eventId, timestamp);
        String signature = calculateHmac(payload);
        String ticketCode = String.format("uems:ticket:%s:%s", payload, signature);

        Ticket ticket = Ticket.builder()
                .user(user)
                .event(event)
                .ticketCode(ticketCode)
                .build();

        Ticket savedTicket = ticketRepository.save(ticket);
        return mapToDto(savedTicket);
    }

    public List<TicketDto> getTicketsByUserId(Long userId) {
        return ticketRepository.findByUserId(userId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<TicketDto> getTicketsByEventId(Long eventId) {
        return ticketRepository.findByEventId(eventId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public TicketDto getTicketById(Long id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));
        return mapToDto(ticket);
    }

    public TicketDto getTicketByCode(String ticketCode) {
        Ticket ticket = ticketRepository.findByTicketCode(ticketCode)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));
        return mapToDto(ticket);
    }

    public boolean verifyTicketCode(String ticketCode) {
        try {
            if (!ticketCode.startsWith("uems:ticket:")) {
                return false;
            }
            
            // Format: uems:ticket:userId:eventId:timestamp:signature
            String[] parts = ticketCode.split(":");
            if (parts.length != 6) {
                return false;
            }

            String userIdStr = parts[2];
            String eventIdStr = parts[3];
            String timestampStr = parts[4];
            String signature = parts[5];

            String payload = String.format("%s:%s:%s", userIdStr, eventIdStr, timestampStr);
            String computedSig = calculateHmac(payload);

            return signature.equals(computedSig);
        } catch (Exception e) {
            return false;
        }
    }

    private String calculateHmac(String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(hmacSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKey);
            byte[] hmacBytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hmacBytes);
        } catch (Exception e) {
            throw new RuntimeException("Error computing cryptographic HMAC signature", e);
        }
    }

    private TicketDto mapToDto(Ticket ticket) {
        Optional<CheckIn> checkIn = checkInRepository.findByTicketId(ticket.getId());
        return TicketDto.builder()
                .id(ticket.getId())
                .userId(ticket.getUser().getId())
                .userName(ticket.getUser().getName())
                .userEmail(ticket.getUser().getEmail())
                .eventId(ticket.getEvent().getId())
                .eventTitle(ticket.getEvent().getTitle())
                .eventLocation(ticket.getEvent().getLocation())
                .eventDate(ticket.getEvent().getStartDate())
                .ticketCode(ticket.getTicketCode())
                .checkedIn(checkIn.isPresent())
                .checkInTime(checkIn.map(CheckIn::getCheckInTime).orElse(null))
                .build();
    }
}
