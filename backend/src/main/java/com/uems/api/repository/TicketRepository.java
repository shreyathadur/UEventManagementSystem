package com.uems.api.repository;

import com.uems.api.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    Optional<Ticket> findByTicketCode(String ticketCode);
    Optional<Ticket> findByUserIdAndEventId(Long userId, Long eventId);
    List<Ticket> findByUserId(Long userId);
    List<Ticket> findByEventId(Long eventId);
    long countByEventId(Long eventId);
    boolean existsByUserIdAndEventId(Long userId, Long eventId);
}
