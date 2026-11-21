package com.trivia.service;

import com.trivia.dto.category.CategoryDto;
import com.trivia.entity.Categoria;
import com.trivia.repository.CategoriaRepository;
import com.trivia.repository.PreguntaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;

@Service
public class CategoryService {

    private final CategoriaRepository categoriaRepository;
    private final PreguntaRepository preguntaRepository;

    public CategoryService(CategoriaRepository categoriaRepository, PreguntaRepository preguntaRepository) {
        this.categoriaRepository = categoriaRepository;
        this.preguntaRepository = preguntaRepository;
    }

    @Transactional(readOnly = true)
    public List<CategoryDto> getActiveCategories() {
        List<Categoria> categorias = categoriaRepository.findAllByIsActiveTrue();
        return categorias.stream()
            .map(c -> {
                long totalQuestions = preguntaRepository.countByCategoriaIdAndIsActiveTrue(c.getId());
                return new CategoryDto(
                    c.getId(),
                    c.getNombre(),
                    toSlug(c.getNombre()),
                    c.getDescripcion(),
                    c.getIcono(),
                    c.getColor(),
                    totalQuestions
                );
            })
            .toList();
    }

    private String toSlug(String input) {
        if (input == null) return "";
        String nowhitespace = input.trim().replaceAll("\\s+", "-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        return normalized.replaceAll("[\\p{InCombiningDiacriticalMarks}]", "")
                         .replaceAll("[^a-zA-Z0-9-]", "")
                         .toLowerCase(Locale.ROOT);
    }
}
