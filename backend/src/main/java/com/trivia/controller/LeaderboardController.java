package com.trivia.controller;

import com.trivia.dto.leaderboard.CategoryLeaderboardResponse;
import com.trivia.dto.leaderboard.GlobalLeaderboardResponse;
import com.trivia.dto.leaderboard.WeeklyLeaderboardResponse;
import com.trivia.security.UserPrincipal;
import com.trivia.service.RankingService;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/v1/leaderboard", "/api/ranking"})
public class LeaderboardController {

    private final RankingService rankingService;

    public LeaderboardController(RankingService rankingService) {
        this.rankingService = rankingService;
    }

    @GetMapping("/global")
    public ResponseEntity<GlobalLeaderboardResponse> getGlobalRanking(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        GlobalLeaderboardResponse response = rankingService.getGlobalRanking(
            userPrincipal.getId(),
            PageRequest.of(page, size)
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/weekly")
    public ResponseEntity<WeeklyLeaderboardResponse> getWeeklyRanking(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        WeeklyLeaderboardResponse response = rankingService.getWeeklyRanking(
            userPrincipal.getId(),
            PageRequest.of(page, size)
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<CategoryLeaderboardResponse> getCategoryRanking(
        @PathVariable("categoryId") Long categoryId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        CategoryLeaderboardResponse response = rankingService.getCategoryRanking(
            categoryId,
            userPrincipal.getId(),
            PageRequest.of(page, size)
        );
        return ResponseEntity.ok(response);
    }
}
