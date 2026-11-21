package com.trivia.repository;

import com.trivia.entity.Usuario;
import com.trivia.repository.projection.RankingCategoriaProjection;
import com.trivia.repository.projection.RankingGlobalProjection;
import com.trivia.repository.projection.RankingSemanalProjection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RankingRepository extends JpaRepository<Usuario, Long> {

    @Query(value = "SELECT rank, usuario_id, username, puntaje_total, partidas_jugadas, aciertos_totales, errores_totales, mejor_racha, precision_porcentaje FROM vista_ranking_global",
           countQuery = "SELECT COUNT(*) FROM vista_ranking_global",
           nativeQuery = true)
    Page<RankingGlobalProjection> findGlobalRanking(Pageable pageable);

    @Query(value = "SELECT rank, usuario_id, username, puntaje_total, partidas_jugadas, aciertos_totales, errores_totales, mejor_racha, precision_porcentaje FROM vista_ranking_global WHERE usuario_id = :userId",
           nativeQuery = true)
    Optional<RankingGlobalProjection> findUserGlobalRanking(@Param("userId") Long userId);

    @Query(value = "SELECT rank, usuario_id, username, puntaje_total_semanal, partidas_jugadas_semana, aciertos_totales, errores_totales, mejor_racha_semana, precision_porcentaje FROM vista_ranking_semanal",
           countQuery = "SELECT COUNT(*) FROM vista_ranking_semanal",
           nativeQuery = true)
    Page<RankingSemanalProjection> findWeeklyRanking(Pageable pageable);

    @Query(value = "SELECT rank, usuario_id, username, puntaje_total_semanal, partidas_jugadas_semana, aciertos_totales, errores_totales, mejor_racha_semana, precision_porcentaje FROM vista_ranking_semanal WHERE usuario_id = :userId",
           nativeQuery = true)
    Optional<RankingSemanalProjection> findUserWeeklyRanking(@Param("userId") Long userId);

    @Query(value = "SELECT categoria_id, categoria_nombre, rank, usuario_id, username, puntaje_total_categoria, partidas_jugadas_categoria, aciertos_totales, errores_totales, mejor_racha_categoria, precision_porcentaje FROM vista_ranking_categoria WHERE categoria_id = :categoryId",
           countQuery = "SELECT COUNT(*) FROM vista_ranking_categoria WHERE categoria_id = :categoryId",
           nativeQuery = true)
    Page<RankingCategoriaProjection> findCategoryRanking(@Param("categoryId") Long categoryId, Pageable pageable);

    @Query(value = "SELECT categoria_id, categoria_nombre, rank, usuario_id, username, puntaje_total_categoria, partidas_jugadas_categoria, aciertos_totales, errores_totales, mejor_racha_categoria, precision_porcentaje FROM vista_ranking_categoria WHERE categoria_id = :categoryId AND usuario_id = :userId",
           nativeQuery = true)
    Optional<RankingCategoriaProjection> findUserCategoryRanking(@Param("categoryId") Long categoryId, @Param("userId") Long userId);
}
