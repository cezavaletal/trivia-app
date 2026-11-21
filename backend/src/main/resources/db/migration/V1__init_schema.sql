-- ============================================================================
-- MIGRACIÓN FLYWAY V1: Inicialización del Esquema Relacional de Trivia
-- Motor: PostgreSQL 16
-- Stack: Spring Boot 3 + Hibernate 6 + PostgreSQL 16
-- Convención: snake_case estricto, integridad referencial y tipos explícitos
-- ============================================================================

-- 1. TIPOS ENUMERADOS (ENUMS)
-- ----------------------------------------------------------------------------
CREATE TYPE rol_usuario_enum AS ENUM (
    'ROLE_PLAYER',
    'ROLE_ADMIN'
);

CREATE TYPE dificultad_pregunta_enum AS ENUM (
    'FACIL',
    'MEDIA',
    'DIFICIL'
);

CREATE TYPE estado_partida_enum AS ENUM (
    'IN_PROGRESS',
    'COMPLETED',
    'ABANDONED'
);

CREATE TYPE modo_partida_enum AS ENUM (
    'RAPIDA',
    'CATEGORIA'
);

-- 2. FUNCIONES Y DISPARADORES AUXILIARES
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION actualizar_timestamp_modificacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. TABLAS PRINCIPALES
-- ----------------------------------------------------------------------------

-- Tabla: usuarios
CREATE TABLE usuarios (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol rol_usuario_enum NOT NULL DEFAULT 'ROLE_PLAYER',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uk_usuarios_username UNIQUE (username),
    CONSTRAINT uk_usuarios_email UNIQUE (email),
    CONSTRAINT chk_usuarios_username_length CHECK (char_length(username) >= 3),
    CONSTRAINT chk_usuarios_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE TRIGGER trg_usuarios_actualizar_timestamp
BEFORE UPDATE ON usuarios
FOR EACH ROW
EXECUTE FUNCTION actualizar_timestamp_modificacion();

-- Tabla: categorias
CREATE TABLE categorias (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    icono VARCHAR(50) NOT NULL DEFAULT 'help-circle',
    color VARCHAR(20) NOT NULL DEFAULT '#3B82F6',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uk_categorias_nombre UNIQUE (nombre),
    CONSTRAINT chk_categorias_nombre_not_empty CHECK (char_length(trim(nombre)) > 0)
);

-- Tabla: preguntas
CREATE TABLE preguntas (
    id BIGSERIAL PRIMARY KEY,
    categoria_id BIGINT NOT NULL,
    enunciado TEXT NOT NULL,
    dificultad dificultad_pregunta_enum NOT NULL DEFAULT 'MEDIA',
    explicacion TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_preguntas_categoria FOREIGN KEY (categoria_id)
        REFERENCES categorias (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_preguntas_enunciado_not_empty CHECK (char_length(trim(enunciado)) > 0)
);

-- Tabla: opciones_respuesta
CREATE TABLE opciones_respuesta (
    id BIGSERIAL PRIMARY KEY,
    pregunta_id BIGINT NOT NULL,
    texto TEXT NOT NULL,
    es_correcta BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_opciones_pregunta FOREIGN KEY (pregunta_id)
        REFERENCES preguntas (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_opciones_texto_not_empty CHECK (char_length(trim(texto)) > 0)
);

-- Regla Anti-Trampas a nivel de Motor:
-- Garantiza que como máximo EXISTA UNA SOLA opción marcada como es_correcta = TRUE por pregunta
CREATE UNIQUE INDEX idx_opciones_unica_correcta
ON opciones_respuesta (pregunta_id)
WHERE es_correcta = TRUE;

-- Tabla: partidas
CREATE TABLE partidas (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    categoria_id BIGINT,
    modo modo_partida_enum NOT NULL,
    estado estado_partida_enum NOT NULL DEFAULT 'IN_PROGRESS',
    puntaje_total INT NOT NULL DEFAULT 0,
    aciertos INT NOT NULL DEFAULT 0,
    errores INT NOT NULL DEFAULT 0,
    racha_maxima INT NOT NULL DEFAULT 0,
    tiempo_inicio TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    tiempo_fin TIMESTAMP WITH TIME ZONE,

    CONSTRAINT fk_partidas_usuario FOREIGN KEY (usuario_id)
        REFERENCES usuarios (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_partidas_categoria FOREIGN KEY (categoria_id)
        REFERENCES categorias (id) ON DELETE SET NULL ON UPDATE CASCADE,

    CONSTRAINT chk_partidas_puntaje CHECK (puntaje_total >= 0),
    CONSTRAINT chk_partidas_aciertos CHECK (aciertos >= 0),
    CONSTRAINT chk_partidas_errores CHECK (errores >= 0),
    CONSTRAINT chk_partidas_racha CHECK (racha_maxima >= 0),
    CONSTRAINT chk_partidas_tiempos CHECK (tiempo_fin IS NULL OR tiempo_fin >= tiempo_inicio),
    CONSTRAINT chk_partidas_modo_categoria CHECK (
        (modo = 'CATEGORIA' AND categoria_id IS NOT NULL) OR
        (modo = 'RAPIDA')
    )
);

-- Tabla: respuestas_usuario
CREATE TABLE respuestas_usuario (
    id BIGSERIAL PRIMARY KEY,
    partida_id BIGINT NOT NULL,
    pregunta_id BIGINT NOT NULL,
    opcion_seleccionada_id BIGINT,
    es_correcta BOOLEAN NOT NULL DEFAULT FALSE,
    puntos_obtenidos INT NOT NULL DEFAULT 0,
    tiempo_respuesta_ms INT NOT NULL DEFAULT 0,
    racha_momento INT NOT NULL DEFAULT 0,
    respondida_en TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_respuestas_partida FOREIGN KEY (partida_id)
        REFERENCES partidas (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_respuestas_pregunta FOREIGN KEY (pregunta_id)
        REFERENCES preguntas (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_respuestas_opcion FOREIGN KEY (opcion_seleccionada_id)
        REFERENCES opciones_respuesta (id) ON DELETE SET NULL ON UPDATE CASCADE,

    CONSTRAINT uk_respuestas_partida_pregunta UNIQUE (partida_id, pregunta_id),
    CONSTRAINT chk_respuestas_puntos CHECK (puntos_obtenidos >= 0),
    CONSTRAINT chk_respuestas_tiempo CHECK (tiempo_respuesta_ms >= 0),
    CONSTRAINT chk_respuestas_racha CHECK (racha_momento >= 0)
);

-- 4. ÍNDICES ESTRATÉGICOS
-- ----------------------------------------------------------------------------
-- Índices para optimizar JOINs en Foreign Keys
CREATE INDEX idx_preguntas_categoria ON preguntas (categoria_id);
CREATE INDEX idx_opciones_pregunta ON opciones_respuesta (pregunta_id);
CREATE INDEX idx_partidas_usuario ON partidas (usuario_id);
CREATE INDEX idx_partidas_categoria ON partidas (categoria_id);
CREATE INDEX idx_respuestas_partida ON respuestas_usuario (partida_id);
CREATE INDEX idx_respuestas_pregunta ON respuestas_usuario (pregunta_id);
CREATE INDEX idx_respuestas_opcion ON respuestas_usuario (opcion_seleccionada_id);

-- Índices para selección rápida de preguntas activas en juego
CREATE INDEX idx_preguntas_seleccion 
ON preguntas (categoria_id, dificultad) 
WHERE is_active = TRUE;

CREATE INDEX idx_preguntas_activas_id 
ON preguntas (id) 
WHERE is_active = TRUE;

-- Índices compuestos para leaderboards / ranking
CREATE INDEX idx_partidas_ranking_global 
ON partidas (usuario_id, puntaje_total DESC, aciertos DESC) 
WHERE estado = 'COMPLETED';

CREATE INDEX idx_partidas_ranking_semanal 
ON partidas (usuario_id, tiempo_fin, puntaje_total DESC) 
WHERE estado = 'COMPLETED';

CREATE INDEX idx_partidas_ranking_categoria 
ON partidas (categoria_id, usuario_id, puntaje_total DESC) 
WHERE estado = 'COMPLETED';

-- 5. VISTAS DE CLASIFICACIÓN / LEADERBOARDS
-- ----------------------------------------------------------------------------

-- Vista: vista_ranking_global
CREATE OR REPLACE VIEW vista_ranking_global AS
SELECT 
    ROW_NUMBER() OVER (
        ORDER BY 
            COALESCE(SUM(p.puntaje_total), 0) DESC, 
            COALESCE(SUM(p.aciertos), 0) DESC,
            u.created_at ASC
    ) AS rank,
    u.id AS usuario_id,
    u.username,
    COALESCE(SUM(p.puntaje_total), 0)::BIGINT AS puntaje_total,
    COUNT(p.id)::INT AS partidas_jugadas,
    COALESCE(SUM(p.aciertos), 0)::INT AS aciertos_totales,
    COALESCE(SUM(p.errores), 0)::INT AS errores_totales,
    COALESCE(MAX(p.racha_maxima), 0)::INT AS mejor_racha,
    ROUND(
        CASE 
            WHEN SUM(p.aciertos + p.errores) > 0 
            THEN (SUM(p.aciertos)::NUMERIC / SUM(p.aciertos + p.errores)::NUMERIC) * 100.0 
            ELSE 0.0 
        END, 
        2
    ) AS precision_porcentaje
FROM usuarios u
JOIN partidas p ON u.id = p.usuario_id
WHERE u.is_active = TRUE 
  AND p.estado = 'COMPLETED'
GROUP BY u.id, u.username;

-- Vista: vista_ranking_semanal
CREATE OR REPLACE VIEW vista_ranking_semanal AS
SELECT 
    ROW_NUMBER() OVER (
        ORDER BY 
            COALESCE(SUM(p.puntaje_total), 0) DESC, 
            COALESCE(SUM(p.aciertos), 0) DESC,
            u.created_at ASC
    ) AS rank,
    u.id AS usuario_id,
    u.username,
    COALESCE(SUM(p.puntaje_total), 0)::BIGINT AS puntaje_total_semanal,
    COUNT(p.id)::INT AS partidas_jugadas_semana,
    COALESCE(SUM(p.aciertos), 0)::INT AS aciertos_totales,
    COALESCE(SUM(p.errores), 0)::INT AS errores_totales,
    COALESCE(MAX(p.racha_maxima), 0)::INT AS mejor_racha_semana,
    ROUND(
        CASE 
            WHEN SUM(p.aciertos + p.errores) > 0 
            THEN (SUM(p.aciertos)::NUMERIC / SUM(p.aciertos + p.errores)::NUMERIC) * 100.0 
            ELSE 0.0 
        END, 
        2
    ) AS precision_porcentaje
FROM usuarios u
JOIN partidas p ON u.id = p.usuario_id
WHERE u.is_active = TRUE 
  AND p.estado = 'COMPLETED'
  AND p.tiempo_fin >= (CURRENT_TIMESTAMP - INTERVAL '7 days')
GROUP BY u.id, u.username;

-- Vista: vista_ranking_categoria
CREATE OR REPLACE VIEW vista_ranking_categoria AS
SELECT 
    c.id AS categoria_id,
    c.nombre AS categoria_nombre,
    ROW_NUMBER() OVER (
        PARTITION BY c.id 
        ORDER BY 
            COALESCE(SUM(p.puntaje_total), 0) DESC, 
            COALESCE(SUM(p.aciertos), 0) DESC,
            u.created_at ASC
    ) AS rank,
    u.id AS usuario_id,
    u.username,
    COALESCE(SUM(p.puntaje_total), 0)::BIGINT AS puntaje_total_categoria,
    COUNT(p.id)::INT AS partidas_jugadas_categoria,
    COALESCE(SUM(p.aciertos), 0)::INT AS aciertos_totales,
    COALESCE(SUM(p.errores), 0)::INT AS errores_totales,
    COALESCE(MAX(p.racha_maxima), 0)::INT AS mejor_racha_categoria,
    ROUND(
        CASE 
            WHEN SUM(p.aciertos + p.errores) > 0 
            THEN (SUM(p.aciertos)::NUMERIC / SUM(p.aciertos + p.errores)::NUMERIC) * 100.0 
            ELSE 0.0 
        END, 
        2
    ) AS precision_porcentaje
FROM categorias c
JOIN partidas p ON c.id = p.categoria_id
JOIN usuarios u ON u.id = p.usuario_id
WHERE c.is_active = TRUE 
  AND u.is_active = TRUE 
  AND p.estado = 'COMPLETED'
  AND p.modo = 'CATEGORIA'
GROUP BY c.id, c.nombre, u.id, u.username;
