package com.trivia.repository;

import com.trivia.entity.Pregunta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PreguntaRepository extends JpaRepository<Pregunta, Long> {

    List<Pregunta> findAllByIsActiveTrue();

    List<Pregunta> findByCategoriaIdAndIsActiveTrue(Long categoriaId);

    long countByCategoriaIdAndIsActiveTrue(Long categoriaId);

    long countByIsActiveTrue();

    @Query(value = "SELECT * FROM preguntas WHERE is_active = true ORDER BY RANDOM() LIMIT :limit", nativeQuery = true)
    List<Pregunta> findRandomActiveQuestions(@Param("limit") int limit);

    @Query(value = "SELECT * FROM preguntas WHERE categoria_id = :categoriaId AND is_active = true ORDER BY RANDOM() LIMIT :limit", nativeQuery = true)
    List<Pregunta> findRandomActiveQuestionsByCategoria(@Param("categoriaId") Long categoriaId, @Param("limit") int limit);
}
