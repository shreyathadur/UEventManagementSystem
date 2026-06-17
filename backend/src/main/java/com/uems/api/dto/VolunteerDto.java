package com.uems.api.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VolunteerDto {
    private Long id;
    private Long userId;
    private String userName;
    private String userEmail;
    private Long eventId;
    private String eventTitle;
    private String assignedRole;
    private String assignedTasks;
    private Double hoursWorked;
    private Integer performanceRating;
    private String status; // PENDING, APPROVED, REJECTED
}
