package com.uems.api.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
    name = "volunteers",
    uniqueConstraints = {@UniqueConstraint(columnNames = {"user_id", "event_id"})}
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Volunteer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @Column(name = "assigned_role")
    private String assignedRole;

    @Column(name = "assigned_tasks", columnDefinition = "TEXT")
    private String assignedTasks;

    @Column(name = "hours_worked")
    private Double hoursWorked;

    @Column(name = "performance_rating")
    private Integer performanceRating; // Rating 1-5 scale

    @Column(nullable = false)
    private String status; // PENDING, APPROVED, REJECTED

    @PrePersist
    protected void onCreate() {
        if (hoursWorked == null) {
            hoursWorked = 0.0;
        }
        if (status == null) {
            status = "PENDING";
        }
    }
}
