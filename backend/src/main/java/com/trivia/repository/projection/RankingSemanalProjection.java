package com.trivia.repository.projection;

public interface RankingSemanalProjection {
    Long getRank();
    Long getUsuarioId();
    String getUsername();
    Long getPuntajeTotalSemanal();
    Integer getPartidasJugadasSemana();
    Integer getAciertosTotales();
    Integer getErroresTotales();
    Integer getMejorRachaSemana();
    Double getPrecisionPorcentaje();
}
