package com.uems.api.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventDto {
    private Long id;
    private String title;
    private String description;
    private String location;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Integer maxCapacity;
    private String status;
    private String category;
    private Long organizerId;
    private Long registeredCount;
    private Long checkInCount;
}
