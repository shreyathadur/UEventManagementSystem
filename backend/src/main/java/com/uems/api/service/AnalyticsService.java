package com.uems.api.service;

import com.uems.api.dto.AnalyticsDto;
import com.uems.api.entity.Event;
import com.uems.api.entity.Sponsor;
import com.uems.api.entity.Volunteer;
import com.uems.api.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final EventRepository eventRepository;
    private final TicketRepository ticketRepository;
    private final CheckInRepository checkInRepository;
    private final VolunteerRepository volunteerRepository;
    private final SponsorRepository sponsorRepository;

    public AnalyticsDto getOverviewStats() {
        long totalEvents = eventRepository.count();
        long totalRegistrations = ticketRepository.count();
        long totalCheckIns = checkInRepository.count();

        Double hours = volunteerRepository.sumTotalHoursWorked();
        double totalVolunteerHours = hours != null ? hours : 0.0;

        BigDecimal totalSponsorshipRevenue = sponsorRepository.sumTotalContributions();

        List<Event> events = eventRepository.findAll();
        List<AnalyticsDto.EventStatDto> eventStats = new ArrayList<>();

        for (Event event : events) {
            long regCount = ticketRepository.countByEventId(event.getId());
            long checkInCount = checkInRepository.countByEventId(event.getId());

            // Calculate sponsor contributions for this event
            List<Sponsor> sponsors = sponsorRepository.findByEventId(event.getId());
            BigDecimal sponsorSum = sponsors.stream()
                    .map(Sponsor::getContributionAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            // Calculate volunteer hours for this event
            List<Volunteer> volunteers = volunteerRepository.findByEventId(event.getId());
            double volunteerHoursSum = volunteers.stream()
                    .filter(v -> "APPROVED".equals(v.getStatus()) && v.getHoursWorked() != null)
                    .mapToDouble(Volunteer::getHoursWorked)
                    .sum();

            eventStats.add(AnalyticsDto.EventStatDto.builder()
                    .eventTitle(event.getTitle())
                    .registrations(regCount)
                    .checkIns(checkInCount)
                    .sponsorshipRevenue(sponsorSum)
                    .volunteerHours(volunteerHoursSum)
                    .build());
        }

        return AnalyticsDto.builder()
                .totalEvents(totalEvents)
                .totalRegistrations(totalRegistrations)
                .totalCheckIns(totalCheckIns)
                .totalVolunteerHours(totalVolunteerHours)
                .totalSponsorshipRevenue(totalSponsorshipRevenue)
                .eventStats(eventStats)
                .build();
    }
}
