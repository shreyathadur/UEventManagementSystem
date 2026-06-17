package com.uems.api.repository;

import com.uems.api.entity.Volunteer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface VolunteerRepository extends JpaRepository<Volunteer, Long> {
    List<Volunteer> findByEventId(Long eventId);
    List<Volunteer> findByUserId(Long userId);
    Optional<Volunteer> findByUserIdAndEventId(Long userId, Long eventId);
    List<Volunteer> findByEventIdAndStatus(Long eventId, String status);
    
    @Query("SELECT SUM(v.hoursWorked) FROM Volunteer v")
    Double sumTotalHoursWorked();

    @Query("SELECT SUM(v.hoursWorked) FROM Volunteer v WHERE v.user.id = :userId")
    Double sumHoursWorkedByUserId(Long userId);
}
