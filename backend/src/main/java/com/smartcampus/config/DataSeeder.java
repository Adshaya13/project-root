package com.smartcampus.config;

import com.smartcampus.model.Resource;
import com.smartcampus.repository.BookingRepository;
import com.smartcampus.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Seeds sample campus resources into MongoDB on startup.
 * Only runs if the "resources" collection is empty, so it won't
 * duplicate data on subsequent restarts.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final ResourceRepository resourceRepository;

    private final BookingRepository bookingRepository;

    @Override
    public void run(String... args) {
        syncResourceStatuses();
        
        if (resourceRepository.count() > 0) {
            log.info("[DataSeeder] Resources collection already has {} document(s) — skipping seed.",
                    resourceRepository.count());
            return;
        }

        log.info("[DataSeeder] Seeding sample resources into MongoDB...");

        List<Resource> sampleResources = List.of(

            // ── Lecture Halls ─────────────────────────────────────────────────
            Resource.builder()
                .name("Main Auditorium")
                .type(Resource.ResourceType.LECTURE_HALL)
                .capacity(500)
                .location("Block A – Ground Floor")
                .availabilityWindows("Mon–Fri 7:30 AM – 8:00 PM")
                .status(Resource.ResourceStatus.ACTIVE)
                .description("Large lecture hall with projector, surround sound, and air conditioning. "
                        + "Suitable for university-wide events, seminars, and large-batch lectures.")
                .imageUrl("https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=800")
                .build(),

            Resource.builder()
                .name("Lecture Hall LH-101")
                .type(Resource.ResourceType.LECTURE_HALL)
                .capacity(120)
                .location("Block A – Level 1")
                .availabilityWindows("Mon–Fri 8:00 AM – 6:00 PM")
                .status(Resource.ResourceStatus.ACTIVE)
                .description("Standard lecture hall equipped with dual projectors, whiteboard, "
                        + "and tiered seating. Used for undergraduate module sessions.")
                .imageUrl("https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800")
                .build(),

            Resource.builder()
                .name("Lecture Hall LH-203")
                .type(Resource.ResourceType.LECTURE_HALL)
                .capacity(80)
                .location("Block B – Level 2")
                .availabilityWindows("Mon–Sat 8:00 AM – 5:00 PM")
                .status(Resource.ResourceStatus.ACTIVE)
                .description("Mid-size lecture hall ideal for postgraduate classes. "
                        + "Equipped with smart board and high-speed Wi-Fi.")
                .imageUrl("https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800")
                .build(),

            // ── Labs ──────────────────────────────────────────────────────────
            Resource.builder()
                .name("Computer Lab – Alpha")
                .type(Resource.ResourceType.LAB)
                .capacity(40)
                .location("Block C – Level 1")
                .availabilityWindows("Mon–Fri 8:00 AM – 9:00 PM, Sat 9:00 AM – 5:00 PM")
                .status(Resource.ResourceStatus.ACTIVE)
                .description("40-seat computer lab running Windows 11 & Ubuntu dual-boot. "
                        + "Installed with development tools: IntelliJ, VS Code, Eclipse, and MATLAB.")
                .imageUrl("https://images.unsplash.com/photo-1562774053-701939374585?w=800")
                .build(),

            Resource.builder()
                .name("Computer Lab – Beta")
                .type(Resource.ResourceType.LAB)
                .capacity(40)
                .location("Block C – Level 2")
                .availabilityWindows("Mon–Fri 8:00 AM – 9:00 PM")
                .status(Resource.ResourceStatus.ACTIVE)
                .description("High-performance computing lab with GPU workstations. "
                        + "Primarily used for AI/ML and data science practicals.")
                .imageUrl("https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800")
                .build(),

            Resource.builder()
                .name("Electronics & Embedded Systems Lab")
                .type(Resource.ResourceType.LAB)
                .capacity(25)
                .location("Block D – Level 1")
                .availabilityWindows("Mon–Fri 9:00 AM – 5:00 PM")
                .status(Resource.ResourceStatus.ACTIVE)
                .description("Equipped with oscilloscopes, multimeters, breadboards, "
                        + "Arduino/Raspberry Pi kits, and soldering stations.")
                .imageUrl("https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800")
                .build(),

            Resource.builder()
                .name("Network & Security Lab")
                .type(Resource.ResourceType.LAB)
                .capacity(30)
                .location("Block D – Level 2")
                .availabilityWindows("Mon–Fri 8:00 AM – 6:00 PM")
                .status(Resource.ResourceStatus.OUT_OF_SERVICE)
                .description("Lab for networking practicals. Currently under maintenance for "
                        + "Cisco switch and router rack upgrades. Expected back: end of April.")
                .imageUrl("https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800")
                .build(),

            // ── Meeting Rooms ─────────────────────────────────────────────────
            Resource.builder()
                .name("Conference Room – Executive Suite")
                .type(Resource.ResourceType.MEETING_ROOM)
                .capacity(20)
                .location("Administration Block – Level 3")
                .availabilityWindows("Mon–Fri 9:00 AM – 6:00 PM")
                .status(Resource.ResourceStatus.ACTIVE)
                .description("Premium conference room with 4K video conferencing setup, "
                        + "interactive whiteboard, and catering facilities. For senior management use.")
                .imageUrl("https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800")
                .build(),

            Resource.builder()
                .name("Meeting Room MR-01")
                .type(Resource.ResourceType.MEETING_ROOM)
                .capacity(10)
                .location("Block A – Level 2")
                .availabilityWindows("Mon–Fri 8:00 AM – 7:00 PM")
                .status(Resource.ResourceStatus.ACTIVE)
                .description("Small meeting room equipped with a projector and whiteboard. "
                        + "Ideal for project discussions, tutorials, and group study sessions.")
                .imageUrl("https://images.unsplash.com/photo-1497366216548-37526070297c?w=800")
                .build(),

            Resource.builder()
                .name("Meeting Room MR-02")
                .type(Resource.ResourceType.MEETING_ROOM)
                .capacity(12)
                .location("Block B – Level 1")
                .availabilityWindows("Mon–Sat 8:00 AM – 6:00 PM")
                .status(Resource.ResourceStatus.ACTIVE)
                .description("Collaborative workspace with a large monitor for screen sharing, "
                        + "video call support, and a round table for inclusive discussions.")
                .imageUrl("https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800")
                .build(),

            // ── Equipment ─────────────────────────────────────────────────────
            Resource.builder()
                .name("Portable Projector Set (×5)")
                .type(Resource.ResourceType.EQUIPMENT)
                .capacity(1)
                .location("Equipment Store – Block A Ground Floor")
                .availabilityWindows("Mon–Fri 8:00 AM – 6:00 PM")
                .status(Resource.ResourceStatus.ACTIVE)
                .description("Set of 5 portable Full-HD projectors with HDMI & VGA connectors, "
                        + "tripod stands, and extension cables. Bookable for outdoor events or classrooms.")
                .imageUrl("https://images.unsplash.com/photo-1590012314607-cda9d9b699ae?w=800")
                .build(),

            Resource.builder()
                .name("Wireless Microphone Kit")
                .type(Resource.ResourceType.EQUIPMENT)
                .capacity(1)
                .location("Equipment Store – Block A Ground Floor")
                .availabilityWindows("Mon–Sat 8:00 AM – 8:00 PM")
                .status(Resource.ResourceStatus.ACTIVE)
                .description("Kit includes 2 lapel mics, 2 handheld mics, a receiver unit, "
                        + "and speaker. Suitable for events, seminars, and panel discussions.")
                .imageUrl("https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800")
                .build(),

            Resource.builder()
                .name("VR Headset Station (×4 Oculus Quest 2)")
                .type(Resource.ResourceType.EQUIPMENT)
                .capacity(4)
                .location("Innovation Lab – Block E Level 1")
                .availabilityWindows("Mon–Fri 10:00 AM – 5:00 PM")
                .status(Resource.ResourceStatus.ACTIVE)
                .description("4 Oculus Quest 2 standalone VR headsets with charging dock. "
                        + "Used for immersive learning, AR/VR course modules, and student demos.")
                .imageUrl("https://images.unsplash.com/photo-1617802690992-15d93263d3a9?w=800")
                .build()
        );

        resourceRepository.saveAll(sampleResources);
        log.info("[DataSeeder] ✅ Successfully seeded {} resources into MongoDB.", sampleResources.size());
    }

    private void syncResourceStatuses() {
        log.info("[DataSeeder] Synchronizing resource statuses with active bookings...");
        List<Resource> allResources = resourceRepository.findAll();
        int updatedCount = 0;
        
        for (Resource resource : allResources) {
            boolean hasApproved = bookingRepository.existsByResourceIdAndStatusAndDateGreaterThanEqual(
                resource.getId(), 
                com.smartcampus.model.Booking.BookingStatus.APPROVED, 
                java.time.LocalDate.now()
            );
            
            if (hasApproved && resource.getStatus() != Resource.ResourceStatus.OUT_OF_SERVICE) {
                resource.setStatus(Resource.ResourceStatus.OUT_OF_SERVICE);
                resourceRepository.save(resource);
                updatedCount++;
            } else if (!hasApproved && resource.getStatus() != Resource.ResourceStatus.ACTIVE) {
                resource.setStatus(Resource.ResourceStatus.ACTIVE);
                resourceRepository.save(resource);
                updatedCount++;
            }
        }
        
        if (updatedCount > 0) {
            log.info("[DataSeeder] ✅ Synchronized {} resource statuses based on booking data.", updatedCount);
        }
    }
}
