package com.uems.api.service;

import com.uems.api.dto.VolunteerDto;
import com.uems.api.entity.Event;
import com.uems.api.entity.User;
import com.uems.api.entity.Volunteer;
import com.uems.api.exception.BadRequestException;
import com.uems.api.exception.ResourceNotFoundException;
import com.uems.api.repository.EventRepository;
import com.uems.api.repository.UserRepository;
import com.uems.api.repository.VolunteerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VolunteerService {

    private final VolunteerRepository volunteerRepository;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;

    public VolunteerDto applyToVolunteer(Long userId, Long eventId, String requestedRole) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));

        if (volunteerRepository.findByUserIdAndEventId(userId, eventId).isPresent()) {
            throw new BadRequestException("You have already applied or registered to volunteer for this event");
        }

        Volunteer volunteer = Volunteer.builder()
                .user(user)
                .event(event)
                .assignedRole(requestedRole != null ? requestedRole : "General Volunteer")
                .status("PENDING")
                .assignedTasks("Awaiting review from Admin")
                .hoursWorked(0.0)
                .build();

        Volunteer saved = volunteerRepository.save(volunteer);
        return mapToDto(saved);
    }

    public VolunteerDto reviewApplication(Long volunteerId, String status, String assignedRole, String assignedTasks) {
        Volunteer volunteer = volunteerRepository.findById(volunteerId)
                .orElseThrow(() -> new ResourceNotFoundException("Volunteer record not found"));

        if (!status.equals("APPROVED") && !status.equals("REJECTED") && !status.equals("PENDING")) {
            throw new BadRequestException("Invalid application status");
        }

        volunteer.setStatus(status);
        if (assignedRole != null && !assignedRole.trim().isEmpty()) {
            volunteer.setAssignedRole(assignedRole);
        }
        if (assignedTasks != null) {
            volunteer.setAssignedTasks(assignedTasks);
        }

        // If approved, elevate user's role to ROLE_VOLUNTEER to grant scanning and volunteer dashboard permissions!
        if ("APPROVED".equals(status)) {
            User user = volunteer.getUser();
            if ("ROLE_USER".equals(user.getRole())) {
                user.setRole("ROLE_VOLUNTEER");
                userRepository.save(user);
            }
        }

        Volunteer updated = volunteerRepository.save(volunteer);
        return mapToDto(updated);
    }

    public VolunteerDto logHoursAndPerformance(Long volunteerId, Double hoursWorked, Integer rating) {
        Volunteer volunteer = volunteerRepository.findById(volunteerId)
                .orElseThrow(() -> new ResourceNotFoundException("Volunteer record not found"));

        if (!"APPROVED".equals(volunteer.getStatus())) {
            throw new BadRequestException("Cannot log details for non-approved volunteer applications");
        }

        if (hoursWorked != null) {
            if (hoursWorked < 0) throw new BadRequestException("Hours worked cannot be negative");
            volunteer.setHoursWorked(hoursWorked);
        }

        if (rating != null) {
            if (rating < 1 || rating > 5) throw new BadRequestException("Performance rating must be between 1 and 5");
            volunteer.setPerformanceRating(rating);
        }

        Volunteer updated = volunteerRepository.save(volunteer);
        return mapToDto(updated);
    }

    public List<VolunteerDto> getVolunteersByEvent(Long eventId) {
        return volunteerRepository.findByEventId(eventId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<VolunteerDto> getVolunteersByUser(Long userId) {
        return volunteerRepository.findByUserId(userId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<VolunteerDto> getAllVolunteers() {
        return volunteerRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private VolunteerDto mapToDto(Volunteer volunteer) {
        return VolunteerDto.builder()
                .id(volunteer.getId())
                .userId(volunteer.getUser().getId())
                .userName(volunteer.getUser().getName())
                .userEmail(volunteer.getUser().getEmail())
                .eventId(volunteer.getEvent().getId())
                .eventTitle(volunteer.getEvent().getTitle())
                .assignedRole(volunteer.getAssignedRole())
                .assignedTasks(volunteer.getAssignedTasks())
                .hoursWorked(volunteer.getHoursWorked())
                .performanceRating(volunteer.getPerformanceRating())
                .status(volunteer.getStatus())
                .build();
    }
}
