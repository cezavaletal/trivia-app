package com.trivia.repository;

import com.trivia.entity.Partida;
import com.trivia.entity.enums.EstadoPartida;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PartidaRepository extends JpaRepository<Partida, Long> {

    Optional<Partida> findByIdAndUsuarioId(Long id, Long usuarioId);

    long countByUsuarioIdAndEstado(Long usuarioId, EstadoPartida estado);

    @Query("SELECT COALESCE(MAX(p.puntajeTotal), 0) FROM Partida p WHERE p.usuario.id = :usuarioId AND p.estado = :estado")
    int findMaxScoreByUsuarioIdAndEstado(@Param("usuarioId") Long usuarioId, @Param("estado") EstadoPartida estado);

    @Query("SELECT COALESCE(SUM(p.aciertos), 0) FROM Partida p WHERE p.usuario.id = :usuarioId AND p.estado = :estado")
    int sumAciertosByUsuarioIdAndEstado(@Param("usuarioId") Long usuarioId, @Param("estado") EstadoPartida estado);

    @Query("SELECT COALESCE(MAX(p.rachaMaxima), 0) FROM Partida p WHERE p.usuario.id = :usuarioId AND p.estado = :estado")
    int findMaxRachaByUsuarioIdAndEstado(@Param("usuarioId") Long usuarioId, @Param("estado") EstadoPartida estado);

    Page<Partida> findByUsuarioIdOrderByTiempoInicioDesc(Long usuarioId, Pageable pageable);
}
