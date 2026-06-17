package com.uems.api.dto;

import lombok.*;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SponsorDto {
    private Long id;
    private Long eventId;
    private String eventTitle;
    private String name;
    private String logoUrl;
    private String tier; // PLATINUM, GOLD, SILVER
    private String contactEmail;
    private BigDecimal contributionAmount;
}
