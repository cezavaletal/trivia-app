package com.trivia.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "respuestas_usuario",
       uniqueConstraints = @UniqueConstraint(name = "uk_respuestas_partida_pregunta", columnNames = {"partida_id", "pregunta_id"}))
public class RespuestaUsuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "partida_id", nullable = false)
    private Partida partida;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pregunta_id", nullable = false)
    private Pregunta pregunta;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "opcion_seleccionada_id")
    private OpcionRespuesta opcionSeleccionada;

    @Column(name = "es_correcta", nullable = false)
    private Boolean esCorrecta = false;

    @Column(name = "puntos_obtenidos", nullable = false)
    private Integer puntosObtenidos = 0;

    @Column(name = "tiempo_respuesta_ms", nullable = false)
    private Integer tiempoRespuestaMs = 0;

    @Column(name = "racha_momento", nullable = false)
    private Integer rachaMomento = 0;

    @Column(name = "respondida_en", nullable = false, updatable = false)
    private Instant respondidaEn = Instant.now();

    public RespuestaUsuario() {
    }

    public RespuestaUsuario(Long id, Partida partida, Pregunta pregunta, OpcionRespuesta opcionSeleccionada,
                            Boolean esCorrecta, Integer puntosObtenidos, Integer tiempoRespuestaMs, Integer rachaMomento) {
        this.id = id;
        this.partida = partida;
        this.pregunta = pregunta;
        this.opcionSeleccionada = opcionSeleccionada;
        this.esCorrecta = esCorrecta != null ? esCorrecta : false;
        this.puntosObtenidos = puntosObtenidos != null ? puntosObtenidos : 0;
        this.tiempoRespuestaMs = tiempoRespuestaMs != null ? tiempoRespuestaMs : 0;
        this.rachaMomento = rachaMomento != null ? rachaMomento : 0;
        this.respondidaEn = Instant.now();
    }

    @PrePersist
    protected void onCreate() {
        if (respondidaEn == null) {
            respondidaEn = Instant.now();
        }
        if (esCorrecta == null) {
            esCorrecta = false;
        }
        if (puntosObtenidos == null) {
            puntosObtenidos = 0;
        }
        if (tiempoRespuestaMs == null) {
            tiempoRespuestaMs = 0;
        }
        if (rachaMomento == null) {
            rachaMomento = 0;
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Partida getPartida() {
        return partida;
    }

    public void setPartida(Partida partida) {
        this.partida = partida;
    }

    public Pregunta getPregunta() {
        return pregunta;
    }

    public void setPregunta(Pregunta pregunta) {
        this.pregunta = pregunta;
    }

    public OpcionRespuesta getOpcionSeleccionada() {
        return opcionSeleccionada;
    }

    public void setOpcionSeleccionada(OpcionRespuesta opcionSeleccionada) {
        this.opcionSeleccionada = opcionSeleccionada;
    }

    public Boolean getEsCorrecta() {
        return esCorrecta;
    }

    public void setEsCorrecta(Boolean esCorrecta) {
        this.esCorrecta = esCorrecta;
    }

    public Integer getPuntosObtenidos() {
        return puntosObtenidos;
    }

    public void setPuntosObtenidos(Integer puntosObtenidos) {
        this.puntosObtenidos = puntosObtenidos;
    }

    public Integer getTiempoRespuestaMs() {
        return tiempoRespuestaMs;
    }

    public void setTiempoRespuestaMs(Integer tiempoRespuestaMs) {
        this.tiempoRespuestaMs = tiempoRespuestaMs;
    }

    public Integer getRachaMomento() {
        return rachaMomento;
    }

    public void setRachaMomento(Integer rachaMomento) {
        this.rachaMomento = rachaMomento;
    }

    public Instant getRespondidaEn() {
        return respondidaEn;
    }

    public void setRespondidaEn(Instant respondidaEn) {
        this.respondidaEn = respondidaEn;
    }
}
