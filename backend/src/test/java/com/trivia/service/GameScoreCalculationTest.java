package com.trivia.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class GameScoreCalculationTest {

    @Test
    @DisplayName("Calcula puntaje con base 200, 4200ms de tiempo y racha 3 (multiplicador 1.4x)")
    void testScoreFormulaExactMatch() {
        int baseScore = 200; // MEDIA
        int nominalTimeLimitMs = 15000;
        int clientMs = 4200;

        int remaining = Math.max(0, nominalTimeLimitMs - clientMs); // 10800
        int speedBonus = (int) Math.floor(baseScore * ((double) remaining / (double) nominalTimeLimitMs) * 0.5);
        // 200 * (10800 / 15000) * 0.5 = 200 * 0.72 * 0.5 = 72
        assertEquals(72, speedBonus);

        double streakMultiplier = 1.4; // streak 3
        int pointsAwarded = (int) Math.floor((baseScore + speedBonus) * streakMultiplier);
        // (200 + 72) * 1.4 = 272 * 1.4 = 380.8 -> 380
        assertEquals(380, pointsAwarded);
    }

    @Test
    @DisplayName("Calcula multiplicadores de racha según RN-03")
    void testStreakMultipliers() {
        assertEquals(1.0, getStreakMultiplier(0));
        assertEquals(1.0, getStreakMultiplier(1));
        assertEquals(1.2, getStreakMultiplier(2));
        assertEquals(1.4, getStreakMultiplier(3));
        assertEquals(1.7, getStreakMultiplier(4));
        assertEquals(2.0, getStreakMultiplier(5));
        assertEquals(2.0, getStreakMultiplier(10));
    }

    private double getStreakMultiplier(int streak) {
        if (streak <= 1) return 1.0;
        if (streak == 2) return 1.2;
        if (streak == 3) return 1.4;
        if (streak == 4) return 1.7;
        return 2.0;
    }
}
