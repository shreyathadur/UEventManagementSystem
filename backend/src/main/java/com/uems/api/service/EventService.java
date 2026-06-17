package com.uems.api.service;

import com.uems.api.dto.EventDto;
import com.uems.api.entity.Event;
import com.uems.api.exception.ResourceNotFoundException;
import com.uems.api.repository.CheckInRepository;
import com.uems.api.repository.EventRepository;
import com.uems.api.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;
    private final TicketRepository ticketRepository;
    private final CheckInRepository checkInRepository;

    public List<EventDto> getAllEvents() {
        return eventRepository.findAllByOrderByStartDateAsc().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public EventDto getEventById(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));
        return mapToDto(event);
    }

    public EventDto createEvent(EventDto dto) {
        Event event = Event.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .location(dto.getLocation())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .maxCapacity(dto.getMaxCapacity())
                .status(dto.getStatus() != null ? dto.getStatus() : "UPCOMING")
                .build();

        Event savedEvent = eventRepository.save(event);
        return mapToDto(savedEvent);
    }

    public EventDto updateEvent(Long id, EventDto dto) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));

        event.setTitle(dto.getTitle());
        event.setDescription(dto.getDescription());
        event.setLocation(dto.getLocation());
        event.setStartDate(dto.getStartDate());
        event.setEndDate(dto.getEndDate());
        event.setMaxCapacity(dto.getMaxCapacity());
        if (dto.getStatus() != null) {
            event.setStatus(dto.getStatus());
        }

        Event updatedEvent = eventRepository.save(event);
        return mapToDto(updatedEvent);
    }

    public void deleteEvent(Long id) {
        if (!eventRepository.existsById(id)) {
            throw new ResourceNotFoundException("Event not found");
        }
        eventRepository.deleteById(id);
    }

    public EventDto mapToDto(Event event) {
        long regCount = ticketRepository.countByEventId(event.getId());
        long checkInCount = checkInRepository.countByEventId(event.getId());

        return EventDto.builder()
                .id(event.getId())
                .title(event.getTitle())
                .description(event.getDescription())
                .location(event.getLocation())
                .startDate(event.getStartDate())
                .endDate(event.getEndDate())
                .maxCapacity(event.getMaxCapacity())
                .status(event.getStatus())
                .registeredCount(regCount)
                .checkInCount(checkInCount)
                .build();
    }
}
