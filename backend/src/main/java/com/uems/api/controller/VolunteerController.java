package com.uems.api.controller;

import com.uems.api.dto.VolunteerDto;
import com.uems.api.entity.User;
import com.uems.api.service.AuthService;
import com.uems.api.service.VolunteerService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/volunteers")
@RequiredArgsConstructor
public class VolunteerController {

    private final VolunteerService volunteerService;
    private final AuthService authService;

    @PostMapping("/apply")
    public ResponseEntity<VolunteerDto> apply(@RequestParam Long eventId, @RequestParam(required = false) String requestedRole) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = authService.getCurrentUserByEmail(email);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(volunteerService.applyToVolunteer(user.getId(), eventId, requestedRole));
    }

    @GetMapping("/my-tasks")
    public ResponseEntity<List<VolunteerDto>> getMyTasks() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = authService.getCurrentUserByEmail(email);
        return ResponseEntity.ok(volunteerService.getVolunteersByUser(user.getId()));
    }

    // Admin endpoints
    @GetMapping("/admin/list")
    public ResponseEntity<List<VolunteerDto>> listAllVolunteers() {
        return ResponseEntity.ok(volunteerService.getAllVolunteers());
    }

    @GetMapping("/admin/event/{eventId}")
    public ResponseEntity<List<VolunteerDto>> listEventVolunteers(@PathVariable Long eventId) {
        return ResponseEntity.ok(volunteerService.getVolunteersByEvent(eventId));
    }

    @PutMapping("/admin/review/{id}")
    public ResponseEntity<VolunteerDto> reviewApplication(
            @PathVariable Long id,
            @RequestBody ReviewRequest request) {
        return ResponseEntity.ok(volunteerService.reviewApplication(
                id, 
                request.getStatus(), 
                request.getAssignedRole(), 
                request.getAssignedTasks()
        ));
    }

    @PutMapping("/admin/log/{id}")
    public ResponseEntity<VolunteerDto> logHoursAndRating(
            @PathVariable Long id,
            @RequestBody LogRequest request) {
        return ResponseEntity.ok(volunteerService.logHoursAndPerformance(
                id, 
                request.getHoursWorked(), 
                request.getPerformanceRating()
        ));
    }

    @Data
    public static class ReviewRequest {
        private String status; // APPROVED, REJECTED
        private String assignedRole;
        private String assignedTasks;
    }

    @Data
    public static class LogRequest {
        private Double hoursWorked;
        private Integer performanceRating;
    }
}
