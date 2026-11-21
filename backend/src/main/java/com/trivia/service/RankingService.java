package com.trivia.service;

import com.trivia.dto.leaderboard.*;
import com.trivia.entity.Categoria;
import com.trivia.exception.ResourceNotFoundException;
import com.trivia.repository.CategoriaRepository;
import com.trivia.repository.RankingRepository;
import com.trivia.repository.UsuarioRepository;
import com.trivia.repository.projection.RankingCategoriaProjection;
import com.trivia.repository.projection.RankingGlobalProjection;
import com.trivia.repository.projection.RankingSemanalProjection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.time.temporal.TemporalAdjusters;
import java.time.temporal.WeekFields;
import java.util.List;
import java.util.Locale;

@Service
public class RankingService {

    private final RankingRepository rankingRepository;
    private final CategoriaRepository categoriaRepository;
    private final UsuarioRepository usuarioRepository;

    public RankingService(
        RankingRepository rankingRepository,
        CategoriaRepository categoriaRepository,
        UsuarioRepository usuarioRepository
    ) {
        this.rankingRepository = rankingRepository;
        this.categoriaRepository = categoriaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional(readOnly = true)
    public GlobalLeaderboardResponse getGlobalRanking(Long currentUserId, Pageable pageable) {
        Page<RankingGlobalProjection> page = rankingRepository.findGlobalRanking(pageable);

        List<GlobalPlayerDto> players = page.getContent().stream()
            .map(p -> new GlobalPlayerDto(
                p.getRank(),
                p.getUsuarioId(),
                p.getUsername(),
                p.getPuntajeTotal(),
                p.getPartidasJugadas(),
                p.getPrecisionPorcentaje(),
                assignBadge(p.getRank())
            ))
            .toList();

        PageResponse<GlobalPlayerDto> pageResponse = new PageResponse<>(
            players,
            page.getNumber(),
            page.getSize(),
            page.getTotalElements(),
            page.getTotalPages(),
            page.isLast()
        );

        CurrentUserRankDto currentUserRank = rankingRepository.findUserGlobalRanking(currentUserId)
            .map(p -> CurrentUserRankDto.ofGlobal(
                p.getRank(),
                p.getUsuarioId(),
                p.getUsername(),
                p.getPuntajeTotal(),
                p.getPartidasJugadas(),
                p.getPrecisionPorcentaje()
            ))
            .orElseGet(() -> fallbackCurrentUserRank(currentUserId));

        return new GlobalLeaderboardResponse(currentUserRank, pageResponse);
    }

    @Transactional(readOnly = true)
    public WeeklyLeaderboardResponse getWeeklyRanking(Long currentUserId, Pageable pageable) {
        Page<RankingSemanalProjection> page = rankingRepository.findWeeklyRanking(pageable);

        List<WeeklyPlayerDto> players = page.getContent().stream()
            .map(p -> new WeeklyPlayerDto(
                p.getRank(),
                p.getUsuarioId(),
                p.getUsername(),
                p.getPuntajeTotalSemanal(),
                p.getRank() != null && p.getRank() == 1 ? "WEEKLY_LEADER" : (p.getRank() != null && p.getRank() <= 3 ? "PODIUM" : null)
            ))
            .toList();

        PageResponse<WeeklyPlayerDto> pageResponse = new PageResponse<>(
            players,
            page.getNumber(),
            page.getSize(),
            page.getTotalElements(),
            page.getTotalPages(),
            page.isLast()
        );

        CurrentUserRankDto currentUserRank = rankingRepository.findUserWeeklyRanking(currentUserId)
            .map(p -> CurrentUserRankDto.ofScoped(
                p.getRank(),
                p.getUsuarioId(),
                p.getUsername(),
                p.getPuntajeTotalSemanal()
            ))
            .orElseGet(() -> fallbackCurrentUserRank(currentUserId));

        LocalDate now = LocalDate.now(ZoneOffset.UTC);
        int weekNumber = now.get(WeekFields.of(Locale.getDefault()).weekOfYear());
        int year = now.getYear();

        LocalDate startOfWeek = now.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate endOfWeek = now.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));
        Instant startsAt = startOfWeek.atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant endsAt = endOfWeek.atTime(23, 59, 59, 999_000_000).toInstant(ZoneOffset.UTC);

        return new WeeklyLeaderboardResponse(
            weekNumber,
            year,
            startsAt,
            endsAt,
            currentUserRank,
            pageResponse
        );
    }

    @Transactional(readOnly = true)
    public CategoryLeaderboardResponse getCategoryRanking(Long categoryId, Long currentUserId, Pageable pageable) {
        Categoria categoria = categoriaRepository.findById(categoryId)
            .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada con id: " + categoryId));

        Page<RankingCategoriaProjection> page = rankingRepository.findCategoryRanking(categoryId, pageable);

        List<CategoryPlayerDto> players = page.getContent().stream()
            .map(p -> new CategoryPlayerDto(
                p.getRank(),
                p.getUsuarioId(),
                p.getUsername(),
                p.getPuntajeTotalCategoria()
            ))
            .toList();

        PageResponse<CategoryPlayerDto> pageResponse = new PageResponse<>(
            players,
            page.getNumber(),
            page.getSize(),
            page.getTotalElements(),
            page.getTotalPages(),
            page.isLast()
        );

        CurrentUserRankDto currentUserRank = rankingRepository.findUserCategoryRanking(categoryId, currentUserId)
            .map(p -> CurrentUserRankDto.ofScoped(
                p.getRank(),
                p.getUsuarioId(),
                p.getUsername(),
                p.getPuntajeTotalCategoria()
            ))
            .orElseGet(() -> fallbackCurrentUserRank(currentUserId));

        return new CategoryLeaderboardResponse(
            categoria.getId(),
            categoria.getNombre(),
            currentUserRank,
            pageResponse
        );
    }

    private CurrentUserRankDto fallbackCurrentUserRank(Long currentUserId) {
        if (currentUserId == null) return null;
        return usuarioRepository.findById(currentUserId)
            .map(u -> new CurrentUserRankDto(null, u.getId(), u.getUsername(), 0L, 0, 0.0, 0L))
            .orElse(null);
    }

    private String assignBadge(Long rank) {
        if (rank == null) return null;
        if (rank == 1) return "DIAMOND";
        if (rank == 2) return "PLATINUM";
        if (rank == 3) return "GOLD";
        if (rank <= 10) return "SILVER";
        return "BRONZE";
    }
}
