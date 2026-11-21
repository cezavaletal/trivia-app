package com.trivia.repository;

import com.trivia.entity.RespuestaUsuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RespuestaUsuarioRepository extends JpaRepository<RespuestaUsuario, Long> {

    boolean existsByPartidaIdAndPreguntaId(Long partidaId, Long preguntaId);

    long countByPartidaId(Long partidaId);

    List<RespuestaUsuario> findByPartidaIdOrderByRespondidaEnDesc(Long partidaId);

    Optional<RespuestaUsuario> findTopByPartidaIdOrderByRespondidaEnDesc(Long partidaId);

    List<RespuestaUsuario> findByPartidaId(Long partidaId);
}
