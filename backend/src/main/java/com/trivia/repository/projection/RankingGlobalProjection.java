package com.trivia.repository.projection;

public interface RankingGlobalProjection {
    Long getRank();
    Long getUsuarioId();
    String getUsername();
    Long getPuntajeTotal();
    Integer getPartidasJugadas();
    Integer getAciertosTotales();
    Integer getErroresTotales();
    Integer getMejorRacha();
    Double getPrecisionPorcentaje();
}
