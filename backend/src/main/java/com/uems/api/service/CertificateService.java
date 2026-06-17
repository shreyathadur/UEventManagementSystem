package com.uems.api.service;

import com.lowagie.text.*;
import com.lowagie.text.alignment.HorizontalAlignment;
import com.lowagie.text.pdf.PdfWriter;
import com.uems.api.entity.Certificate;
import com.uems.api.entity.Event;
import com.uems.api.entity.User;
import com.uems.api.exception.ResourceNotFoundException;
import com.uems.api.repository.CertificateRepository;
import com.uems.api.repository.EventRepository;
import com.uems.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import com.uems.api.dto.CertificateDto;
import java.awt.Color;

@Service
@RequiredArgsConstructor
public class CertificateService {

    private final CertificateRepository certificateRepository;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;

    public Certificate issueCertificate(Long userId, Long eventId, String role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));

        // Check if certificate already exists for this user/event/role combination
        if (certificateRepository.existsByUserIdAndEventIdAndRole(userId, eventId, role)) {
            // Return the existing certificate rather than creating a duplicate
            return certificateRepository.findByUserId(userId).stream()
                    .filter(c -> c.getEvent().getId().equals(eventId) && c.getRole().equalsIgnoreCase(role))
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("Certificate not found"));
        }

        String certCode = "CERT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        Certificate certificate = Certificate.builder()
                .user(user)
                .event(event)
                .certificateCode(certCode)
                .role(role)
                .build();
        return certificateRepository.save(certificate);
    }

    public List<CertificateDto> getCertificatesByUserId(Long userId) {
        return certificateRepository.findByUserId(userId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public CertificateDto getCertificateById(Long id) {
        Certificate certificate = certificateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Certificate not found"));
        return mapToDto(certificate);
    }

    public byte[] generateCertificatePdf(Long id) throws Exception {
        Certificate cert = certificateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Certificate not found"));

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        
        // Setup landscape A4 document
        Document document = new Document(PageSize.A4.rotate(), 36, 36, 36, 36);
        PdfWriter.getInstance(document, baos);
        document.open();

        // Color Palette
        Color primaryColor = new Color(30, 41, 59); // Deep Slate
        Color accentColor = new Color(99, 102, 241); // Indigo
        Color secondaryColor = new Color(100, 116, 139); // Slate Grey

        // Fonts
        Font titleFont = new Font(Font.HELVETICA, 28, Font.BOLD, primaryColor);
        Font subtitleFont = new Font(Font.HELVETICA, 16, Font.ITALIC, secondaryColor);
        Font nameFont = new Font(Font.TIMES_ROMAN, 32, Font.BOLD | Font.ITALIC, accentColor);
        Font bodyFont = new Font(Font.HELVETICA, 14, Font.NORMAL, primaryColor);
        Font footerFont = new Font(Font.COURIER, 10, Font.NORMAL, secondaryColor);

        // Border Design (A simple rectangular outline to look like a frame)
        Table borderTable = new Table(1);
        borderTable.setWidth(95f);
        borderTable.setBorderWidth(5f);
        borderTable.setBorderColor(accentColor);
        borderTable.setPadding(30f);

        Cell cell = new Cell();
        cell.setBorderWidth(1f);
        cell.setBorderColor(primaryColor);
        cell.setHorizontalAlignment(HorizontalAlignment.CENTER);

        // Spacers
        Paragraph spacer = new Paragraph(" ");
        spacer.setSpacingAfter(10f);

        // Header Title
        Paragraph title = new Paragraph("CERTIFICATE OF EXCELLENCE", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        cell.add(title);
        cell.add(spacer);

        // Subtitle
        Paragraph sub = new Paragraph("THIS IS PROUDLY PRESENTED TO", subtitleFont);
        sub.setAlignment(Element.ALIGN_CENTER);
        cell.add(sub);
        cell.add(spacer);

        // Recipient Name
        Paragraph name = new Paragraph(cert.getUser().getName(), nameFont);
        name.setAlignment(Element.ALIGN_CENTER);
        cell.add(name);
        cell.add(spacer);

        // Description
        String text = String.format("for outstanding contribution as a %s during the event\n\"%s\"\nheld at UEMS Campus on %s.",
                cert.getRole().toUpperCase(),
                cert.getEvent().getTitle(),
                cert.getEvent().getStartDate().format(DateTimeFormatter.ofPattern("MMMM dd, yyyy")));
        Paragraph description = new Paragraph(text, bodyFont);
        description.setAlignment(Element.ALIGN_CENTER);
        description.setLeading(22f);
        cell.add(description);
        cell.add(spacer);
        cell.add(spacer);

        // Signature Layout
        Table sigTable = new Table(2);
        sigTable.setBorder(Table.NO_BORDER);
        sigTable.setWidth(80f);
        
        Cell sig1 = new Cell(new Paragraph("___________________________\nEvent Coordinator", bodyFont));
        sig1.setBorder(Cell.NO_BORDER);
        sig1.setHorizontalAlignment(HorizontalAlignment.CENTER);
        
        Cell sig2 = new Cell(new Paragraph("___________________________\nDean of Student Affairs", bodyFont));
        sig2.setBorder(Cell.NO_BORDER);
        sig2.setHorizontalAlignment(HorizontalAlignment.CENTER);
        
        sigTable.addCell(sig1);
        sigTable.addCell(sig2);
        cell.add(sigTable);
        cell.add(spacer);

        // Certificate ID and code footer
        Paragraph certId = new Paragraph("Verification ID: " + cert.getCertificateCode(), footerFont);
        certId.setAlignment(Element.ALIGN_CENTER);
        cell.add(certId);

        borderTable.addCell(cell);
        document.add(borderTable);

        document.close();
        return baos.toByteArray();
    }

    private CertificateDto mapToDto(Certificate c) {
        return CertificateDto.builder()
                .id(c.getId())
                .userId(c.getUser().getId())
                .userName(c.getUser().getName())
                .eventId(c.getEvent().getId())
                .eventTitle(c.getEvent().getTitle())
                .eventDate(c.getEvent().getStartDate())
                .certificateCode(c.getCertificateCode())
                .role(c.getRole())
                .issuedAt(c.getIssuedAt())
                .build();
    }
}
