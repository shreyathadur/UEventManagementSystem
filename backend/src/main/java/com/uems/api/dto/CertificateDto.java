package com.uems.api.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CertificateDto {
    private Long id;
    private Long userId;
    private String userName;
    private Long eventId;
    private String eventTitle;
    private LocalDateTime eventDate;
    private String certificateCode;
    private String role; // PARTICIPANT, VOLUNTEER
    private LocalDateTime issuedAt;
}
