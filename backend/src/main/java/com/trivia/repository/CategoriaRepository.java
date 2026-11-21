package com.trivia.repository;

import com.trivia.entity.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, Long> {

    List<Categoria> findAllByIsActiveTrue();

    Optional<Categoria> findByNombre(String nombre);
}
