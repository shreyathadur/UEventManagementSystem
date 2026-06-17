package com.uems.api.config;

import com.uems.api.entity.Event;
import com.uems.api.entity.Sponsor;
import com.uems.api.entity.Ticket;
import com.uems.api.entity.User;
import com.uems.api.entity.CheckIn;
import com.uems.api.entity.Volunteer;
import com.uems.api.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final SponsorRepository sponsorRepository;
    private final TicketRepository ticketRepository;
    private final CheckInRepository checkInRepository;
    private final VolunteerRepository volunteerRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            return; // Already seeded
        }

        // 1. Seed Users
        User admin = User.builder()
                .name("Dr. Aditi Sharma")
                .email("admin@uems.edu")
                .password(passwordEncoder.encode("admin123"))
                .role("ROLE_ADMIN")
                .build();
        userRepository.save(admin);

        User volunteer = User.builder()
                .name("Rahul Verma")
                .email("volunteer@uems.edu")
                .password(passwordEncoder.encode("volunteer123"))
                .role("ROLE_VOLUNTEER")
                .build();
        userRepository.save(volunteer);

        User student = User.builder()
                .name("Shreya Sen")
                .email("student@uems.edu")
                .password(passwordEncoder.encode("student123"))
                .role("ROLE_USER")
                .build();
        userRepository.save(student);

        User volunteerCandidate = User.builder()
                .name("Amit Patel")
                .email("amit@uems.edu")
                .password(passwordEncoder.encode("student123"))
                .role("ROLE_USER")
                .build();
        userRepository.save(volunteerCandidate);

        // 2. Seed Events
        Event hackfest = Event.builder()
                .title("Hackfest 2026")
                .description("A 24-hour national level coding hackathon focusing on AI-driven solutions for social challenges. Teams of 2-4 compete for major prizes.")
                .location("Main Seminar Hall, CSE Dept")
                .startDate(LocalDateTime.now().minusDays(1)) // started yesterday
                .endDate(LocalDateTime.now().plusDays(1))    // ends tomorrow
                .maxCapacity(100)
                .status("ACTIVE")
                .build();
        eventRepository.save(hackfest);

        Event techExpo = Event.builder()
                .title("Tech Expo 2026")
                .description("Annual project showcase exhibiting innovative projects in IoT, Robotics, Green Energy, and Aerospace Engineering by university students.")
                .location("University Main Auditorium")
                .startDate(LocalDateTime.now().plusDays(5)) // upcoming
                .endDate(LocalDateTime.now().plusDays(7))
                .maxCapacity(500)
                .status("UPCOMING")
                .build();
        eventRepository.save(techExpo);

        Event alumniMeet = Event.builder()
                .title("Alumni Meet 2026")
                .description("Silver Jubilee Networking Dinner and panel discussion on industrial trends. Welcoming batches of 1999-2005.")
                .location("Campus Club Grounds & Gardens")
                .startDate(LocalDateTime.now().minusDays(10)) // completed
                .endDate(LocalDateTime.now().minusDays(10).plusHours(6))
                .maxCapacity(150)
                .status("COMPLETED")
                .build();
        eventRepository.save(alumniMeet);

        Event sportsMeet = Event.builder()
                .title("Inter-College Sports Fest")
                .description("High-intensity sports events covering Basketball, Volleyball, and Football tournaments with top colleges in the region.")
                .location("Sports Arena & Ground A")
                .startDate(LocalDateTime.now().plusDays(12)) // upcoming
                .endDate(LocalDateTime.now().plusDays(15))
                .maxCapacity(300)
                .status("UPCOMING")
                .build();
        eventRepository.save(sportsMeet);

        // 3. Seed Sponsors
        Sponsor intel = Sponsor.builder()
                .event(hackfest)
                .name("Intel Corporation")
                .logoUrl("https://logo.clearbit.com/intel.com")
                .tier("PLATINUM")
                .contactEmail("sponsorship@intel.com")
                .contributionAmount(new BigDecimal("5000.00"))
                .build();
        sponsorRepository.save(intel);

        Sponsor gcloud = Sponsor.builder()
                .event(techExpo)
                .name("Google Cloud")
                .logoUrl("https://logo.clearbit.com/cloud.google.com")
                .tier("PLATINUM")
                .contactEmail("edu-sponsors@google.com")
                .contributionAmount(new BigDecimal("7500.00"))
                .build();
        sponsorRepository.save(gcloud);

        Sponsor github = Sponsor.builder()
                .event(hackfest)
                .name("GitHub")
                .logoUrl("https://logo.clearbit.com/github.com")
                .tier("GOLD")
                .contactEmail("education@github.com")
                .contributionAmount(new BigDecimal("2500.00"))
                .build();
        sponsorRepository.save(github);

        Sponsor redbull = Sponsor.builder()
                .event(sportsMeet)
                .name("Red Bull")
                .logoUrl("https://logo.clearbit.com/redbull.com")
                .tier("SILVER")
                .contactEmail("campus-events@redbull.com")
                .contributionAmount(new BigDecimal("1500.00"))
                .build();
        sponsorRepository.save(redbull);

        // 4. Seed Tickets & CheckIns
        // Book student to Hackfest and check them in
        String studentHackfestPayload = String.format("%d:%d:%d", student.getId(), hackfest.getId(), LocalDateTime.now().minusHours(2).getSecond());
        Ticket t1 = Ticket.builder()
                .user(student)
                .event(hackfest)
                .ticketCode("uems:ticket:" + studentHackfestPayload + ":mockSig123xyz")
                .build();
        ticketRepository.save(t1);

        CheckIn c1 = CheckIn.builder()
                .ticket(t1)
                .scannedBy(volunteer)
                .build();
        checkInRepository.save(c1);

        // Book student to Tech Expo (not checked in yet)
        String studentTechExpoPayload = String.format("%d:%d:%d", student.getId(), techExpo.getId(), LocalDateTime.now().getSecond());
        Ticket t2 = Ticket.builder()
                .user(student)
                .event(techExpo)
                .ticketCode("uems:ticket:" + studentTechExpoPayload + ":mockSig789abc")
                .build();
        ticketRepository.save(t2);

        // 5. Seed Volunteer records
        // Rahul is already approved for Hackfest
        Volunteer v1 = Volunteer.builder()
                .user(volunteer)
                .event(hackfest)
                .assignedRole("Check-In Scanning Desk")
                .assignedTasks("Verify attendee QR codes at the main lobby entry gate. Assist with ID card distribution.")
                .hoursWorked(8.5)
                .performanceRating(5)
                .status("APPROVED")
                .build();
        volunteerRepository.save(v1);

        // Amit is pending for Tech Expo
        Volunteer v2 = Volunteer.builder()
                .user(volunteerCandidate)
                .event(techExpo)
                .assignedRole("Logistics Helper")
                .assignedTasks("Manage desk setups and banners for the showcases. Help exhibitors set up power sockets.")
                .hoursWorked(0.0)
                .status("PENDING")
                .build();
        volunteerRepository.save(v2);
    }
}
