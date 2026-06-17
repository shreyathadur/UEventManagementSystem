package com.uems.api.repository;

import com.uems.api.entity.Sponsor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;

@Repository
public interface SponsorRepository extends JpaRepository<Sponsor, Long> {
    List<Sponsor> findByEventId(Long eventId);
    
    @Query("SELECT COALESCE(SUM(s.contributionAmount), 0) FROM Sponsor s")
    BigDecimal sumTotalContributions();
}
