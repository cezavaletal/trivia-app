package com.trivia.repository.projection;

public interface RankingCategoriaProjection {
    Long getCategoriaId();
    String getCategoriaNombre();
    Long getRank();
    Long getUsuarioId();
    String getUsername();
    Long getPuntajeTotalCategoria();
    Integer getPartidasJugadasCategoria();
    Integer getAciertosTotales();
    Integer getErroresTotales();
    Integer getMejorRachaCategoria();
    Double getPrecisionPorcentaje();
}
