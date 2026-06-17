package com.uems.api.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsDto {
    private long totalEvents;
    private long totalRegistrations;
    private long totalCheckIns;
    private double totalVolunteerHours;
    private BigDecimal totalSponsorshipRevenue;
    private List<EventStatDto> eventStats;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EventStatDto {
        private String eventTitle;
        private long registrations;
        private long checkIns;
        private BigDecimal sponsorshipRevenue;
        private double volunteerHours;
    }
}
