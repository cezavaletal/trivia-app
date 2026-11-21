package com.trivia.repository;

import com.trivia.entity.OpcionRespuesta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OpcionRespuestaRepository extends JpaRepository<OpcionRespuesta, Long> {

    List<OpcionRespuesta> findByPreguntaId(Long preguntaId);

    Optional<OpcionRespuesta> findByPreguntaIdAndEsCorrectaTrue(Long preguntaId);

    Optional<OpcionRespuesta> findByIdAndPreguntaId(Long id, Long preguntaId);
}
