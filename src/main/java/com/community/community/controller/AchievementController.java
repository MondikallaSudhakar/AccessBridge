package com.community.community.controller;

import com.community.community.model.Achievement;
import com.community.community.repository.AchievementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/achievements")
@RequiredArgsConstructor
public class AchievementController {

    private final AchievementRepository achievementRepository;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> listAchievements() {
        List<Achievement> items = achievementRepository.findAll();
        List<Map<String, Object>> out = items.stream().map(a -> {
            java.util.Map<String, Object> m = new java.util.HashMap<>();
            m.put("id", a.getId());
            m.put("title", a.getTitle());
            m.put("description", a.getDescription());
            m.put("achievement", a.getDescription());
            m.put("sourceId", a.getId());
            m.put("organizationName", a.getUser() != null ? a.getUser().getName() : "Community");
            return m;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(out);
    }
}
