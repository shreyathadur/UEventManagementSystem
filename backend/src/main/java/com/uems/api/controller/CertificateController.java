package com.uems.api.controller;

import com.uems.api.dto.CertificateDto;
import com.uems.api.entity.Certificate;
import com.uems.api.entity.User;
import com.uems.api.entity.Ticket;
import com.uems.api.entity.Volunteer;
import com.uems.api.exception.BadRequestException;
import com.uems.api.repository.CheckInRepository;
import com.uems.api.repository.TicketRepository;
import com.uems.api.repository.VolunteerRepository;
import com.uems.api.service.AuthService;
import com.uems.api.service.CertificateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/certificates")
@RequiredArgsConstructor
public class CertificateController {

    private final CertificateService certificateService;
    private final AuthService authService;
    private final TicketRepository ticketRepository;
    private final CheckInRepository checkInRepository;
    private final VolunteerRepository volunteerRepository;

    @GetMapping("/my")
    public ResponseEntity<List<CertificateDto>> getMyCertificates() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = authService.getCurrentUserByEmail(email);
        return ResponseEntity.ok(certificateService.getCertificatesByUserId(user.getId()));
    }

    @PostMapping("/claim")
    public ResponseEntity<CertificateDto> claimCertificate(@RequestParam Long eventId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = authService.getCurrentUserByEmail(email);

        // Check if user is a volunteer with approved status
        Optional<Volunteer> volunteerOpt = volunteerRepository.findByUserIdAndEventId(user.getId(), eventId);
        boolean isApprovedVolunteer = volunteerOpt.map(v -> "APPROVED".equals(v.getStatus())).orElse(false);

        // Check if user is a participant who checked in
        Optional<Ticket> ticketOpt = ticketRepository.findByUserIdAndEventId(user.getId(), eventId);
        boolean isCheckedInParticipant = ticketOpt.map(t -> checkInRepository.existsByTicketId(t.getId())).orElse(false);

        String role = null;
        if (isApprovedVolunteer) {
            role = "VOLUNTEER";
        } else if (isCheckedInParticipant) {
            role = "PARTICIPANT";
        } else {
            throw new BadRequestException("You are not eligible for a certificate. You must either be a checked-in participant or an approved volunteer.");
        }

        Certificate cert = certificateService.issueCertificate(user.getId(), eventId, role);
        return ResponseEntity.ok(certificateService.getCertificateById(cert.getId()));
    }

    @GetMapping(value = "/{id}/download", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> downloadCertificate(@PathVariable Long id) {
        try {
            byte[] pdfBytes = certificateService.generateCertificatePdf(id);
            CertificateDto certDto = certificateService.getCertificateById(id);
            String filename = "Certificate_" 
                    + certDto.getUserName().replace(" ", "_") 
                    + "_" 
                    + certDto.getEventTitle().replace(" ", "_") 
                    + ".pdf";
                    
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdfBytes);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
