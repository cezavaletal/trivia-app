package com.trivia.entity;

import com.trivia.entity.enums.EstadoPartida;
import com.trivia.entity.enums.ModoPartida;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcType;
import org.hibernate.dialect.PostgreSQLEnumJdbcType;

import java.time.Instant;

@Entity
@Table(name = "partidas")
public class Partida {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoria_id")
    private Categoria categoria;

    @Enumerated(EnumType.STRING)
    @JdbcType(PostgreSQLEnumJdbcType.class)
    @Column(name = "modo", nullable = false)
    private ModoPartida modo = ModoPartida.RAPIDA;

    @Enumerated(EnumType.STRING)
    @JdbcType(PostgreSQLEnumJdbcType.class)
    @Column(name = "estado", nullable = false)
    private EstadoPartida estado = EstadoPartida.IN_PROGRESS;

    @Column(name = "puntaje_total", nullable = false)
    private Integer puntajeTotal = 0;

    @Column(name = "aciertos", nullable = false)
    private Integer aciertos = 0;

    @Column(name = "errores", nullable = false)
    private Integer errores = 0;

    @Column(name = "racha_maxima", nullable = false)
    private Integer rachaMaxima = 0;

    @Column(name = "tiempo_inicio", nullable = false, updatable = false)
    private Instant tiempoInicio = Instant.now();

    @Column(name = "tiempo_fin")
    private Instant tiempoFin;

    public Partida() {
    }

    public Partida(Long id, Usuario usuario, Categoria categoria, ModoPartida modo, EstadoPartida estado) {
        this.id = id;
        this.usuario = usuario;
        this.categoria = categoria;
        this.modo = modo != null ? modo : ModoPartida.RAPIDA;
        this.estado = estado != null ? estado : EstadoPartida.IN_PROGRESS;
        this.puntajeTotal = 0;
        this.aciertos = 0;
        this.errores = 0;
        this.rachaMaxima = 0;
        this.tiempoInicio = Instant.now();
    }

    @PrePersist
    protected void onCreate() {
        if (tiempoInicio == null) {
            tiempoInicio = Instant.now();
        }
        if (modo == null) {
            modo = ModoPartida.RAPIDA;
        }
        if (estado == null) {
            estado = EstadoPartida.IN_PROGRESS;
        }
        if (puntajeTotal == null) {
            puntajeTotal = 0;
        }
        if (aciertos == null) {
            aciertos = 0;
        }
        if (errores == null) {
            errores = 0;
        }
        if (rachaMaxima == null) {
            rachaMaxima = 0;
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public Categoria getCategoria() {
        return categoria;
    }

    public void setCategoria(Categoria categoria) {
        this.categoria = categoria;
    }

    public ModoPartida getModo() {
        return modo;
    }

    public void setModo(ModoPartida modo) {
        this.modo = modo;
    }

    public EstadoPartida getEstado() {
        return estado;
    }

    public void setEstado(EstadoPartida estado) {
        this.estado = estado;
    }

    public Integer getPuntajeTotal() {
        return puntajeTotal;
    }

    public void setPuntajeTotal(Integer puntajeTotal) {
        this.puntajeTotal = puntajeTotal;
    }

    public Integer getAciertos() {
        return aciertos;
    }

    public void setAciertos(Integer aciertos) {
        this.aciertos = aciertos;
    }

    public Integer getErrores() {
        return errores;
    }

    public void setErrores(Integer errores) {
        this.errores = errores;
    }

    public Integer getRachaMaxima() {
        return rachaMaxima;
    }

    public void setRachaMaxima(Integer rachaMaxima) {
        this.rachaMaxima = rachaMaxima;
    }

    public Instant getTiempoInicio() {
        return tiempoInicio;
    }

    public void setTiempoInicio(Instant tiempoInicio) {
        this.tiempoInicio = tiempoInicio;
    }

    public Instant getTiempoFin() {
        return tiempoFin;
    }

    public void setTiempoFin(Instant tiempoFin) {
        this.tiempoFin = tiempoFin;
    }
}
