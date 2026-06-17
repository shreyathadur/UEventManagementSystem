package com.uems.api.repository;

import com.uems.api.entity.CheckIn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CheckInRepository extends JpaRepository<CheckIn, Long> {
    Optional<CheckIn> findByTicketId(Long ticketId);
    boolean existsByTicketId(Long ticketId);
    
    @Query("SELECT COUNT(c) FROM CheckIn c WHERE c.ticket.event.id = :eventId")
    long countByEventId(Long eventId);
}
