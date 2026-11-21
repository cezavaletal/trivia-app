package com.trivia.entity;

import com.trivia.entity.enums.DificultadPregunta;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcType;
import org.hibernate.dialect.PostgreSQLEnumJdbcType;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "preguntas")
public class Pregunta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "categoria_id", nullable = false)
    private Categoria categoria;

    @Column(name = "enunciado", nullable = false, columnDefinition = "TEXT")
    private String enunciado;

    @Enumerated(EnumType.STRING)
    @JdbcType(PostgreSQLEnumJdbcType.class)
    @Column(name = "dificultad", nullable = false)
    private DificultadPregunta dificultad = DificultadPregunta.MEDIA;

    @Column(name = "explicacion", columnDefinition = "TEXT")
    private String explicacion;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @OneToMany(mappedBy = "pregunta", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<OpcionRespuesta> opciones = new ArrayList<>();

    public Pregunta() {
    }

    public Pregunta(Long id, Categoria categoria, String enunciado, DificultadPregunta dificultad, String explicacion, Boolean isActive) {
        this.id = id;
        this.categoria = categoria;
        this.enunciado = enunciado;
        this.dificultad = dificultad != null ? dificultad : DificultadPregunta.MEDIA;
        this.explicacion = explicacion;
        this.isActive = isActive != null ? isActive : true;
        this.createdAt = Instant.now();
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
        if (isActive == null) {
            isActive = true;
        }
        if (dificultad == null) {
            dificultad = DificultadPregunta.MEDIA;
        }
    }

    public void addOpcion(OpcionRespuesta opcion) {
        opciones.add(opcion);
        opcion.setPregunta(this);
    }

    public void removeOpcion(OpcionRespuesta opcion) {
        opciones.remove(opcion);
        opcion.setPregunta(null);
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Categoria getCategoria() {
        return categoria;
    }

    public void setCategoria(Categoria categoria) {
        this.categoria = categoria;
    }

    public String getEnunciado() {
        return enunciado;
    }

    public void setEnunciado(String enunciado) {
        this.enunciado = enunciado;
    }

    public DificultadPregunta getDificultad() {
        return dificultad;
    }

    public void setDificultad(DificultadPregunta dificultad) {
        this.dificultad = dificultad;
    }

    public String getExplicacion() {
        return explicacion;
    }

    public void setExplicacion(String explicacion) {
        this.explicacion = explicacion;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean active) {
        isActive = active;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public List<OpcionRespuesta> getOpciones() {
        return opciones;
    }

    public void setOpciones(List<OpcionRespuesta> opciones) {
        this.opciones = opciones;
    }
}
