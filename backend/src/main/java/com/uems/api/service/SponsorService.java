package com.uems.api.service;

import com.uems.api.dto.SponsorDto;
import com.uems.api.entity.Event;
import com.uems.api.entity.Sponsor;
import com.uems.api.exception.ResourceNotFoundException;
import com.uems.api.repository.EventRepository;
import com.uems.api.repository.SponsorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SponsorService {

    private final SponsorRepository sponsorRepository;
    private final EventRepository eventRepository;

    public List<SponsorDto> getAllSponsors() {
        return sponsorRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<SponsorDto> getSponsorsByEvent(Long eventId) {
        return sponsorRepository.findByEventId(eventId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public SponsorDto addSponsor(SponsorDto dto) {
        Event event = eventRepository.findById(dto.getEventId())
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));

        Sponsor sponsor = Sponsor.builder()
                .event(event)
                .name(dto.getName())
                .logoUrl(dto.getLogoUrl())
                .tier(dto.getTier())
                .contactEmail(dto.getContactEmail())
                .contributionAmount(dto.getContributionAmount())
                .build();

        Sponsor saved = sponsorRepository.save(sponsor);
        return mapToDto(saved);
    }

    public SponsorDto updateSponsor(Long id, SponsorDto dto) {
        Sponsor sponsor = sponsorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sponsor not found"));

        if (dto.getEventId() != null) {
            Event event = eventRepository.findById(dto.getEventId())
                    .orElseThrow(() -> new ResourceNotFoundException("Event not found"));
            sponsor.setEvent(event);
        }

        sponsor.setName(dto.getName());
        sponsor.setLogoUrl(dto.getLogoUrl());
        sponsor.setTier(dto.getTier());
        sponsor.setContactEmail(dto.getContactEmail());
        sponsor.setContributionAmount(dto.getContributionAmount());

        Sponsor updated = sponsorRepository.save(sponsor);
        return mapToDto(updated);
    }

    public void deleteSponsor(Long id) {
        if (!sponsorRepository.existsById(id)) {
            throw new ResourceNotFoundException("Sponsor not found");
        }
        sponsorRepository.deleteById(id);
    }

    private SponsorDto mapToDto(Sponsor sponsor) {
        return SponsorDto.builder()
                .id(sponsor.getId())
                .eventId(sponsor.getEvent().getId())
                .eventTitle(sponsor.getEvent().getTitle())
                .name(sponsor.getName())
                .logoUrl(sponsor.getLogoUrl())
                .tier(sponsor.getTier())
                .contactEmail(sponsor.getContactEmail())
                .contributionAmount(sponsor.getContributionAmount())
                .build();
    }
}
