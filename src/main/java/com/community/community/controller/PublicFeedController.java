package com.community.community.controller;

import com.community.community.model.*;
import com.community.community.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"}, allowCredentials = "true")
public class PublicFeedController {

    private final EventRepository eventRepository;
    private final NGOJobRepository ngoJobRepository;
    private final NeedRepository needRepository;
    private final NGOProductRepository ngoProductRepository;
    private final ProductRepository productRepository;
    private final NGORepository ngoRepository;
    private final SchoolRepository schoolRepository;
    private final StartupRepository startupRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final DonationRepository donationRepository;

    @GetMapping("/ping")
    public ResponseEntity<Map<String, String>> ping() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "ok");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/recent")
    public ResponseEntity<List<Map<String, Object>>> getRecentData() {
        List<Map<String, Object>> recentItems = new ArrayList<>();

        // Events
        for (Event event : eventRepository.findAll()) {
            if (event.getCreatedAt() == null) continue;
            if (event.getStatus() != null && !"UPCOMING".equals(event.getStatus())) continue;

            Map<String, Object> item = new HashMap<>();
            item.put("id", "event-" + event.getId());
            item.put("type", "events");
            item.put("title", event.getTitle() != null ? event.getTitle() : "Untitled Event");
            item.put("subtitle", event.getDescription() != null ? event.getDescription() : "Public event.");
            item.put("meta", event.getLocation() != null ? event.getLocation() : "Location not specified");
            item.put("verified", true);
            item.put("cta", "View Event");
            item.put("href", "/search");
            item.put("logo", event.getImageUrl());
            item.put("openDate", toText(event.getEventDate()));
            item.put("closeDate", toText(event.getEndDate()));
            item.put("createdTimestamp", event.getCreatedAt().atZone(java.time.ZoneId.systemDefault()).toInstant().toEpochMilli());
            recentItems.add(item);
        }

        // Jobs
        for (NGOJob job : ngoJobRepository.findAll()) {
            if (job.getCreatedAt() == null) continue;
            if ("CLOSED".equals(job.getStatus())) continue;

            Map<String, Object> item = new HashMap<>();
            item.put("id", "job-" + job.getId());
            item.put("type", "jobs");
            item.put("title", job.getTitle() != null ? job.getTitle() : "Untitled Job");
            item.put("subtitle", job.getDescription() != null ? job.getDescription() : "Open role.");
            item.put("meta", job.getLocation() != null ? job.getLocation() : "Location not specified");
            item.put("verified", false);
            item.put("cta", "View Details");
            item.put("href", "/search");
            item.put("logo", null);
            item.put("openDate", toText(job.getCreatedAt()));
            item.put("closeDate", toText(job.getLastDateToApply()));
            item.put("createdTimestamp", job.getCreatedAt().atZone(java.time.ZoneId.systemDefault()).toInstant().toEpochMilli());
            recentItems.add(item);
        }

        // Requirements
        for (Need need : needRepository.findAll()) {
            if (need.getCreatedAt() == null) continue;
            if ("CLOSED".equals(need.getStatus())) continue;

            Map<String, Object> item = new HashMap<>();
            item.put("id", "need-" + need.getId());
            item.put("type", "requirements");
            item.put("title", need.getTitle() != null ? need.getTitle() : "Untitled Requirement");
            item.put("subtitle", need.getDescription() != null ? need.getDescription() : "Support request.");
            item.put("meta", need.getCategory() != null ? need.getCategory() : "Community need");
            item.put("verified", false);
            item.put("cta", "View Details");
            item.put("href", "/search");
            item.put("logo", need.getImageUrl());
            item.put("openDate", toText(need.getCreatedAt()));
            item.put("closeDate", toText(need.getDeadline()));
            item.put("createdTimestamp", need.getCreatedAt().atZone(java.time.ZoneId.systemDefault()).toInstant().toEpochMilli());
            recentItems.add(item);
        }

        // NGO products
        for (NGOProduct product : ngoProductRepository.findAll()) {
            if (product.getCreatedAt() == null) continue;
            if (Boolean.FALSE.equals(product.getAvailable())) continue;
            if (product.getStockQuantity() != null && product.getStockQuantity() <= 0) continue;

            Map<String, Object> item = new HashMap<>();
            item.put("id", "ngo-product-" + product.getId());
            item.put("type", "products");
            item.put("title", product.getName() != null ? product.getName() : "Untitled Product");
            item.put("subtitle", product.getDescription() != null ? product.getDescription() : "Product listing.");
            item.put("meta", product.getPrice() != null ? ("Rs " + product.getPrice()) : "Price not specified");
            item.put("verified", false);
            item.put("cta", "View Marketplace");
            item.put("href", "/marketplace");
            item.put("logo", product.getImageUrl());
            item.put("createdTimestamp", product.getCreatedAt().atZone(java.time.ZoneId.systemDefault()).toInstant().toEpochMilli());
            recentItems.add(item);
        }

        // Startup products
        for (Product product : productRepository.findAll()) {
            if (product.getCreatedAt() == null) continue;
            if (Boolean.FALSE.equals(product.getAvailable())) continue;
            if (product.getStockQuantity() != null && product.getStockQuantity() <= 0) continue;

            Map<String, Object> item = new HashMap<>();
            item.put("id", "startup-product-" + product.getId());
            item.put("type", "products");
            item.put("title", product.getName() != null ? product.getName() : "Untitled Product");
            item.put("subtitle", product.getDescription() != null ? product.getDescription() : "Product listing.");
            item.put("meta", product.getPrice() != null ? ("Rs " + product.getPrice()) : "Price not specified");
            item.put("verified", true);
            item.put("cta", "View Marketplace");
            item.put("href", "/marketplace");
            item.put("logo", product.getImageUrl());
            item.put("createdTimestamp", product.getCreatedAt().atZone(java.time.ZoneId.systemDefault()).toInstant().toEpochMilli());
            recentItems.add(item);
        }

        List<Map<String, Object>> sortedItems = recentItems.stream()
                .sorted((a, b) -> Long.compare(((Number) b.get("createdTimestamp")).longValue(), ((Number) a.get("createdTimestamp")).longValue()))
                .limit(50)
                .peek(item -> item.remove("createdTimestamp"))
                .collect(Collectors.toList());

        return ResponseEntity.ok(sortedItems);
    }

    private Map<String, Object> formatEvent(Event event) {
        Map<String, Object> item = new HashMap<>();
        item.put("id", "event-" + event.getId());
        item.put("type", "events");
        item.put("title", event.getTitle() != null ? event.getTitle() : "Untitled Event");
        item.put("subtitle", event.getDescription() != null ? event.getDescription() : "Event organized by community organization.");
        item.put("location", event.getLocation() != null ? event.getLocation() : "");
        item.put("city", event.getCity() != null ? event.getCity() : "");
        item.put("state", event.getState() != null ? event.getState() : "");
        item.put("verified", true);
        item.put("cta", "View Event");
        item.put("href", "/events/" + event.getId());
        item.put("logo", event.getImageUrl());
        item.put("eventDate", toText(event.getEventDate()));
        item.put("registeredParticipants", event.getRegisteredParticipants() != null ? event.getRegisteredParticipants() : 0);
        item.put("maxParticipants", event.getMaxParticipants() != null ? event.getMaxParticipants() : 0);
        
        // Determine meta
        String meta = event.getEventType() != null ? event.getEventType() : "Event";
        if (event.getCity() != null && !event.getCity().isEmpty()) {
            meta += " • " + event.getCity();
            if (event.getState() != null && !event.getState().isEmpty()) meta += ", " + event.getState();
        }
        item.put("meta", meta);
        
        long timestamp = event.getCreatedAt() != null ? event.getCreatedAt().atZone(java.time.ZoneId.systemDefault()).toInstant().toEpochMilli() : System.currentTimeMillis();
        item.put("createdTimestamp", timestamp);
        return item;
    }

    private Map<String, Object> formatNGOJob(NGOJob job) {
        Map<String, Object> item = new HashMap<>();
        item.put("id", "job-" + job.getId());
        item.put("type", "jobs");
        item.put("title", job.getTitle() != null ? job.getTitle() : "Untitled Job");
        item.put("subtitle", job.getDescription() != null ? job.getDescription() : "Job posting by NGO.");
        item.put("location", job.getLocation() != null ? job.getLocation() : "Not specified");
        item.put("verified", job.getNgo() != null && job.getNgo().isVerified());
        item.put("cta", "View NGO Profile");
        item.put("href", "/ngos/" + (job.getNgo() != null ? job.getNgo().getId() : ""));
        item.put("logo", job.getNgo() != null ? job.getNgo().getLogoUrl() : null);
        item.put("jobType", null);
        
        // Calculate applicant count
        long applicantCount = jobApplicationRepository.countByJobId(job.getId());
        if (applicantCount > 0) {
            item.put("applied", applicantCount);
        }
        
        item.put("openDate", toText(job.getCreatedAt()));
        item.put("closeDate", toText(job.getLastDateToApply()));
        
        String meta = (job.getNgo() != null ? job.getNgo().getName() : "NGO") + " • " + (job.getLocation() != null ? job.getLocation() : "Location not specified");
        item.put("meta", meta);
        
        long timestamp = job.getCreatedAt() != null ? job.getCreatedAt().atZone(java.time.ZoneId.systemDefault()).toInstant().toEpochMilli() : System.currentTimeMillis();
        item.put("createdTimestamp", timestamp);
        return item;
    }

    private Map<String, Object> formatNeed(Need need) {
        Map<String, Object> item = new HashMap<>();
        item.put("id", "need-" + need.getId());
        item.put("type", "requirements");
        item.put("title", need.getTitle() != null ? need.getTitle() : "Untitled Requirement");
        item.put("subtitle", need.getDescription() != null ? need.getDescription() : "Support request from organization.");
        item.put("verified", need.getNgo() != null ? need.getNgo().isVerified() : (need.getSchool() != null && need.getSchool().isVerified()));
        item.put("cta", "View Profile");
        
        String meta = "Organization";
        String href = "/";
        String logo = null;
        
        if (need.getNgo() != null) {
            meta = need.getNgo().getName();
            href = "/ngos/" + need.getNgo().getId();
            logo = need.getNgo().getLogoUrl();
        } else if (need.getSchool() != null) {
            meta = need.getSchool().getName();
            href = "/schools/" + need.getSchool().getId();
            logo = need.getSchool().getLogoUrl();
        }
        
        item.put("href", href);
        item.put("logo", logo);
        
        // Calculate donation count
        try {
            long donationCount = donationRepository.findByNeed(need).size();
            if (donationCount > 0) {
                item.put("applied", donationCount);
            }
        } catch (Throwable ex) {
            // Ignore donation count if there's an error
        }
        
        item.put("openDate", toText(need.getCreatedAt()));
        item.put("closeDate", toText(need.getDeadline()));
        item.put("meta", meta);
        
        long timestamp = need.getCreatedAt() != null ? need.getCreatedAt().atZone(java.time.ZoneId.systemDefault()).toInstant().toEpochMilli() : System.currentTimeMillis();
        item.put("createdTimestamp", timestamp);
        return item;
    }

    private Map<String, Object> formatNGOProduct(NGOProduct product) {
        Map<String, Object> item = new HashMap<>();
        item.put("id", "ngo-product-" + product.getId());
        item.put("type", "products");
        item.put("title", product.getName() != null ? product.getName() : "Untitled Product");
        item.put("subtitle", product.getDescription() != null ? product.getDescription() : "Product listed by NGO.");
        item.put("verified", product.getNgo() != null && product.getNgo().isVerified());
        item.put("cta", "View NGO Profile");
        item.put("href", "/ngos/" + (product.getNgo() != null ? product.getNgo().getId() : ""));
        item.put("logo", product.getImageUrl() != null ? product.getImageUrl() : (product.getNgo() != null ? product.getNgo().getLogoUrl() : null));
        item.put("price", product.getPrice());
        item.put("stockQuantity", product.getStockQuantity());
        
        String meta = (product.getNgo() != null ? product.getNgo().getName() : "NGO");
        if (product.getPrice() != null) {
            meta += " • Rs " + String.format("%.2f", product.getPrice());
        }
        if (product.getStockQuantity() != null) {
            meta += " • Stock " + product.getStockQuantity();
        }
        item.put("meta", meta);
        
        long timestamp = product.getCreatedAt() != null ? product.getCreatedAt().atZone(java.time.ZoneId.systemDefault()).toInstant().toEpochMilli() : System.currentTimeMillis();
        item.put("createdTimestamp", timestamp);
        return item;
    }

    private Map<String, Object> formatProduct(Product product) {
        Map<String, Object> item = new HashMap<>();
        item.put("id", "startup-product-" + product.getId());
        item.put("type", "products");
        item.put("title", product.getName() != null ? product.getName() : "Untitled Product");
        item.put("subtitle", product.getDescription() != null ? product.getDescription() : "Product listed by startup.");
        item.put("verified", true);
        
        String startupName = product.getStartup() != null ? product.getStartup().getName() : "Startup";
        item.put("cta", "View Marketplace");
        item.put("href", "/marketplace");
        item.put("logo", product.getImageUrl());
        item.put("price", product.getPrice());
        item.put("stockQuantity", product.getStockQuantity());
        
        String meta = startupName;
        if (product.getPrice() != null) {
            meta += " • Rs " + String.format("%.2f", product.getPrice());
        }
        if (product.getStockQuantity() != null) {
            meta += " • Stock " + product.getStockQuantity();
        }
        item.put("meta", meta);
        
        long timestamp = product.getCreatedAt() != null ? product.getCreatedAt().atZone(java.time.ZoneId.systemDefault()).toInstant().toEpochMilli() : System.currentTimeMillis();
        item.put("createdTimestamp", timestamp);
        return item;
    }

    private String toText(Object value) {
        return value == null ? null : String.valueOf(value);
    }
}
