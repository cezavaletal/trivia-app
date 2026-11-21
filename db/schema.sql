-- ============================================================================
-- ESQUEMA DE BASE DE DATOS RELACIONAL - SISTEMA DE TRIVIA
-- Motor: PostgreSQL 16
-- Stack: Angular 17+ | Spring Boot 3 (Java 21) | PostgreSQL 16
-- Convención: snake_case estricto, claves compuestas e integridad referencial
-- ============================================================================

-- Configuración inicial de sesión
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

-- ============================================================================
-- 1. LIMPIEZA PREVIA (DROP TABLES, VIEWS & TYPES)
-- ============================================================================
DROP VIEW IF EXISTS vista_ranking_categoria CASCADE;
DROP VIEW IF EXISTS vista_ranking_semanal CASCADE;
DROP VIEW IF EXISTS vista_ranking_global CASCADE;

DROP TABLE IF EXISTS respuestas_usuario CASCADE;
DROP TABLE IF EXISTS partidas CASCADE;
DROP TABLE IF EXISTS opciones_respuesta CASCADE;
DROP TABLE IF EXISTS preguntas CASCADE;
DROP TABLE IF EXISTS categorias CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

DROP TYPE IF EXISTS modo_partida_enum CASCADE;
DROP TYPE IF EXISTS estado_partida_enum CASCADE;
DROP TYPE IF EXISTS dificultad_pregunta_enum CASCADE;
DROP TYPE IF EXISTS rol_usuario_enum CASCADE;

-- ============================================================================
-- 2. TIPOS ENUMERADOS (ENUMS)
-- ============================================================================

-- Roles de acceso al sistema (alineado con Spring Security)
CREATE TYPE rol_usuario_enum AS ENUM (
    'ROLE_PLAYER',
    'ROLE_ADMIN'
);

-- Niveles de dificultad estandarizados para el banco de preguntas
CREATE TYPE dificultad_pregunta_enum AS ENUM (
    'FACIL',
    'MEDIA',
    'DIFICIL'
);

-- Ciclo de vida y estados de una partida
CREATE TYPE estado_partida_enum AS ENUM (
    'IN_PROGRESS',
    'COMPLETED',
    'ABANDONED'
);

-- Modalidades de juego soportadas
CREATE TYPE modo_partida_enum AS ENUM (
    'RAPIDA',
    'CATEGORIA'
);

-- ============================================================================
-- 3. FUNCIONES Y DISPARADORES AUXILIARES
-- ============================================================================

-- Función para actualizar automáticamente el timestamp `updated_at`
CREATE OR REPLACE FUNCTION actualizar_timestamp_modificacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 4. DEFINICIÓN DE TABLAS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Tabla: usuarios
-- Descripción: Almacena las credenciales, rol y estado de los jugadores y admins.
-- ----------------------------------------------------------------------------
CREATE TABLE usuarios (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol rol_usuario_enum NOT NULL DEFAULT 'ROLE_PLAYER',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Restricciones de integridad y formato
    CONSTRAINT uk_usuarios_username UNIQUE (username),
    CONSTRAINT uk_usuarios_email UNIQUE (email),
    CONSTRAINT chk_usuarios_username_length CHECK (char_length(username) >= 3),
    CONSTRAINT chk_usuarios_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

COMMENT ON TABLE usuarios IS 'Cuentas de usuario del sistema (jugadores y administradores)';
COMMENT ON COLUMN usuarios.id IS 'Identificador secuencial único de usuario';
COMMENT ON COLUMN usuarios.password_hash IS 'Hash BCrypt (costo 10+) de la contraseña';
COMMENT ON COLUMN usuarios.rol IS 'Rol asignado para Spring Security (ROLE_PLAYER o ROLE_ADMIN)';

-- Trigger para mantener actualizado `updated_at` en usuarios
CREATE TRIGGER trg_usuarios_actualizar_timestamp
BEFORE UPDATE ON usuarios
FOR EACH ROW
EXECUTE FUNCTION actualizar_timestamp_modificacion();

-- ----------------------------------------------------------------------------
-- Tabla: categorias
-- Descripción: Agrupación temática para partidas y clasificación de preguntas.
-- ----------------------------------------------------------------------------
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

COMMENT ON TABLE categorias IS 'Temáticas disponibles en el juego (Ciencia, Historia, Geografía, etc.)';
COMMENT ON COLUMN categorias.icono IS 'Identificador de icono Lucide/FontAwesome para la interfaz';
COMMENT ON COLUMN categorias.color IS 'Código de color HEX representativo de la categoría';

-- ----------------------------------------------------------------------------
-- Tabla: preguntas
-- Descripción: Banco de preguntas asociadas a una categoría con nivel de dificultad.
-- ----------------------------------------------------------------------------
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

COMMENT ON TABLE preguntas IS 'Banco de preguntas del juego gestionable por administradores';
COMMENT ON COLUMN preguntas.explicacion IS 'Justificación didáctica mostrada tras responder';
COMMENT ON COLUMN preguntas.is_active IS 'Bandera para borrado lógico (Soft Delete)';

-- ----------------------------------------------------------------------------
-- Tabla: opciones_respuesta
-- Descripción: Opciones de respuesta para cada pregunta (exactamente 1 correcta por pregunta).
-- ----------------------------------------------------------------------------
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

COMMENT ON TABLE opciones_respuesta IS 'Opciones de selección múltiple (4 por pregunta recomendadas)';
COMMENT ON COLUMN opciones_respuesta.es_correcta IS 'Indica si es la respuesta acertada. NUNCA se expone en DTOs públicos de juego';

-- Regla Anti-Trampas & Consistencia a Nivel de Motor:
-- Garantiza que como máximo EXISTA UNA SOLA opción marcada como es_correcta = TRUE por pregunta
CREATE UNIQUE INDEX idx_opciones_unica_correcta
ON opciones_respuesta (pregunta_id)
WHERE es_correcta = TRUE;

-- ----------------------------------------------------------------------------
-- Tabla: partidas
-- Descripción: Sesión de juego de 10 preguntas iniciada por un usuario.
-- ----------------------------------------------------------------------------
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

    -- Restricciones de coherencia de negocio
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

COMMENT ON TABLE partidas IS 'Sesiones de juego individuales y resultados acumulados';
COMMENT ON COLUMN partidas.categoria_id IS 'Nulo si la partida es de modalidad RAPIDA (mix aleatorio de categorías)';
COMMENT ON COLUMN partidas.racha_maxima IS 'Mayor seguidilla ininterrumpida de aciertos lograda en la partida';

-- ----------------------------------------------------------------------------
-- Tabla: respuestas_usuario
-- Descripción: Respuestas enviadas por el usuario a cada pregunta de la partida.
-- ----------------------------------------------------------------------------
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

    -- Unicidad estricta e idempotencia: una pregunta sólo puede ser respondida una vez por partida
    CONSTRAINT uk_respuestas_partida_pregunta UNIQUE (partida_id, pregunta_id),

    -- Restricciones de valores numéricos
    CONSTRAINT chk_respuestas_puntos CHECK (puntos_obtenidos >= 0),
    CONSTRAINT chk_respuestas_tiempo CHECK (tiempo_respuesta_ms >= 0),
    CONSTRAINT chk_respuestas_racha CHECK (racha_momento >= 0)
);

COMMENT ON TABLE respuestas_usuario IS 'Historial auditable e inmutable de respuestas por pregunta en cada partida';
COMMENT ON COLUMN respuestas_usuario.opcion_seleccionada_id IS 'Nulo si la pregunta expiró por límite de tiempo (TIMEOUT)';
COMMENT ON COLUMN respuestas_usuario.tiempo_respuesta_ms IS 'Tiempo en milisegundos empleado por el usuario para responder';
COMMENT ON COLUMN respuestas_usuario.racha_momento IS 'Racha de aciertos en el instante en que se respondió';

-- ============================================================================
-- 5. ÍNDICES ESTRATÉGICOS PARA ALTO RENDIMIENTO
-- ============================================================================

-- Índices sobre Foreign Keys (evitan Table Scans en JOINs y comprobaciones de integridad)
CREATE INDEX idx_preguntas_categoria ON preguntas (categoria_id);
CREATE INDEX idx_opciones_pregunta ON opciones_respuesta (pregunta_id);
CREATE INDEX idx_partidas_usuario ON partidas (usuario_id);
CREATE INDEX idx_partidas_categoria ON partidas (categoria_id);
CREATE INDEX idx_respuestas_partida ON respuestas_usuario (partida_id);
CREATE INDEX idx_respuestas_pregunta ON respuestas_usuario (pregunta_id);
CREATE INDEX idx_respuestas_opcion ON respuestas_usuario (opcion_seleccionada_id);

-- Índice optimizado para selección aleatoria de preguntas activas por categoría y dificultad
-- Clave para el endpoint POST /api/v1/games (selección rápida sin full table scan)
CREATE INDEX idx_preguntas_seleccion 
ON preguntas (categoria_id, dificultad) 
WHERE is_active = TRUE;

-- Índice para selección rápida de preguntas activas de cualquier categoría (Modo Partida Rápida)
CREATE INDEX idx_preguntas_activas_id 
ON preguntas (id) 
WHERE is_active = TRUE;

-- Índices compuestos para agregación eficiente y consultas de Leaderboards / Rankings
CREATE INDEX idx_partidas_ranking_global 
ON partidas (usuario_id, puntaje_total DESC, aciertos DESC) 
WHERE estado = 'COMPLETED';

CREATE INDEX idx_partidas_ranking_semanal 
ON partidas (usuario_id, tiempo_fin, puntaje_total DESC) 
WHERE estado = 'COMPLETED';

CREATE INDEX idx_partidas_ranking_categoria 
ON partidas (categoria_id, usuario_id, puntaje_total DESC) 
WHERE estado = 'COMPLETED';

-- ============================================================================
-- 6. VISTAS OPTIMIZADAS PARA RANKING Y LEADERBOARDS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Vista: vista_ranking_global
-- Descripción: Clasificación histórica consolidada de todos los jugadores activos.
-- ----------------------------------------------------------------------------
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

COMMENT ON VIEW vista_ranking_global IS 'Tabla de clasificación global histórica por puntos totales acumulados';

-- ----------------------------------------------------------------------------
-- Vista: vista_ranking_semanal
-- Descripción: Clasificación acumulada de partidas completadas en los últimos 7 días.
-- ----------------------------------------------------------------------------
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

COMMENT ON VIEW vista_ranking_semanal IS 'Tabla de clasificación semanal con ventana deslizante de 7 días';

-- ----------------------------------------------------------------------------
-- Vista: vista_ranking_categoria
-- Descripción: Clasificación de jugadores por categoría tematica específica.
-- ----------------------------------------------------------------------------
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

COMMENT ON VIEW vista_ranking_categoria IS 'Clasificación desglosada por categoría temática para premiar especialistas';

-- ============================================================================
-- 7. DATOS SEMILLA INICIALES (SEED DATA)
-- ============================================================================

-- Contraseña en texto claro de prueba para todos los usuarios:
-- Admin:    "Admin123!"     -> Hash BCrypt: $2a$10$7Zz4eL3q56pDoxC/lZJ0G.4p1Yp0YQc3c0lP0o7X9W2oI7mQv9Oiq
-- Jugadores: "Password123!" -> Hash BCrypt: $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi

-- 7.1 Inserción de Usuarios de Prueba
INSERT INTO usuarios (id, username, email, password_hash, rol, is_active, created_at, updated_at) VALUES
(1, 'admin', 'admin@trivia.com', '$2a$10$7Zz4eL3q56pDoxC/lZJ0G.4p1Yp0YQc3c0lP0o7X9W2oI7mQv9Oiq', 'ROLE_ADMIN', TRUE, CURRENT_TIMESTAMP - INTERVAL '30 days', CURRENT_TIMESTAMP - INTERVAL '30 days'),
(2, 'trivia_champion', 'champion@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ROLE_PLAYER', TRUE, CURRENT_TIMESTAMP - INTERVAL '25 days', CURRENT_TIMESTAMP - INTERVAL '25 days'),
(3, 'brain_master', 'master@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ROLE_PLAYER', TRUE, CURRENT_TIMESTAMP - INTERVAL '20 days', CURRENT_TIMESTAMP - INTERVAL '20 days'),
(4, 'quizz_wizard', 'wizard@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ROLE_PLAYER', TRUE, CURRENT_TIMESTAMP - INTERVAL '15 days', CURRENT_TIMESTAMP - INTERVAL '15 days'),
(5, 'speedy_cortex', 'cortex@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ROLE_PLAYER', TRUE, CURRENT_TIMESTAMP - INTERVAL '10 days', CURRENT_TIMESTAMP - INTERVAL '10 days');

SELECT setval('usuarios_id_seq', (SELECT MAX(id) FROM usuarios));

-- 7.2 Inserción de 6 Categorías Temáticas
INSERT INTO categorias (id, nombre, descripcion, icono, color, is_active, created_at) VALUES
(1, 'Ciencia y Tecnología', 'Física, química, biología, informática, astronomía e innovaciones.', 'flask-conical', '#3B82F6', TRUE, CURRENT_TIMESTAMP - INTERVAL '30 days'),
(2, 'Historia Universal', 'Grandes civilizaciones, batallas, tratados y personajes legendarios.', 'landmark', '#F59E0B', TRUE, CURRENT_TIMESTAMP - INTERVAL '30 days'),
(3, 'Geografía y Lugares', 'Países, capitales, cordilleras, océanos, banderas y maravillas.', 'globe', '#10B981', TRUE, CURRENT_TIMESTAMP - INTERVAL '30 days'),
(4, 'Arte y Literatura', 'Obras clásicas, autores, pintura, escultura, mitología y poesía.', 'palette', '#8B5CF6', TRUE, CURRENT_TIMESTAMP - INTERVAL '30 days'),
(5, 'Entretenimiento y Cine', 'Películas, series, música, videojuegos y cultura pop contemporánea.', 'film', '#EC4899', TRUE, CURRENT_TIMESTAMP - INTERVAL '30 days'),
(6, 'Deportes y Retos', 'Fútbol, básquetbol, Juegos Olímpicos, tenis, marcas y leyendas.', 'trophy', '#EF4444', TRUE, CURRENT_TIMESTAMP - INTERVAL '30 days');

SELECT setval('categorias_id_seq', (SELECT MAX(id) FROM categorias));

-- 7.3 Inserción de Banco Inicial de Preguntas (24 preguntas: 4 por categoría con varias dificultades)
INSERT INTO preguntas (id, categoria_id, enunciado, dificultad, explicacion, is_active, created_at) VALUES
-- Categoría 1: Ciencia y Tecnología
(1, 1, '¿Cuál es el elemento químico más abundante en el universo observable?', 'FACIL', 'El hidrógeno compone aproximadamente el 74% de la masa bariónica normal del universo.', TRUE, CURRENT_TIMESTAMP),
(2, 1, '¿En qué año publicaron Watson y Crick el modelo de la estructura de doble hélice del ADN?', 'MEDIA', 'El histórico artículo de Watson y Crick fue publicado en Nature en abril de 1953.', TRUE, CURRENT_TIMESTAMP),
(3, 1, '¿Qué partícula subatómica descubierta en 2012 otorga masa a otras partículas elementales?', 'DIFICIL', 'El bosón de Higgs fue confirmado por los experimentos ATLAS y CMS del CERN en 2012.', TRUE, CURRENT_TIMESTAMP),
(4, 1, '¿Qué protocolo de red asigna dinámicamente direcciones IP a los dispositivos en una red local?', 'MEDIA', 'DHCP (Dynamic Host Configuration Protocol) automatiza la asignación de parámetros de red e IPs.', TRUE, CURRENT_TIMESTAMP),

-- Categoría 2: Historia Universal
(5, 2, '¿En qué año dio inicio la Revolución Francesa con la toma de la Bastilla?', 'FACIL', 'La toma de la Bastilla ocurrió el 14 de julio de 1789, marcando el inicio formal de la Revolución Francesa.', TRUE, CURRENT_TIMESTAMP),
(6, 2, '¿Quién fue el primer gobernante en ostentar el título oficial de Emperador de Roma?', 'MEDIA', 'Cayo Julio César Octaviano se convirtió en Augusto y primer Emperador de Roma en el año 27 a.C.', TRUE, CURRENT_TIMESTAMP),
(7, 2, '¿Qué batalla naval librada en 1805 consolidó la supremacía marítima británica sobre Francia y España?', 'MEDIA', 'La Batalla de Trafalgar fue liderada por el almirante Horatio Nelson frente a las costas de Cádiz.', TRUE, CURRENT_TIMESTAMP),
(8, 2, '¿Cuál tratado de paz en 1648 puso fin a la Guerra de los Treinta Años en Europa Central?', 'DIFICIL', 'La Paz de Westfalia sentó las bases del concepto moderno de soberanía de los Estados nacionales.', TRUE, CURRENT_TIMESTAMP),

-- Categoría 3: Geografía y Lugares
(9, 3, '¿Cuál es el río más largo y caudaloso del planeta Tierra?', 'FACIL', 'El río Amazonas es el más caudaloso del mundo y transporta más agua que los siguientes 7 ríos combinados.', TRUE, CURRENT_TIMESTAMP),
(10, 3, '¿Cuál es la capital oficial de Australia?', 'MEDIA', 'Canberra fue elegida en 1908 como un compromiso salomónico entre las dos mayores ciudades: Sídney y Melbourne.', TRUE, CURRENT_TIMESTAMP),
(11, 3, '¿Cuál es el país independiente más extenso del mundo que no cuenta con salida al mar?', 'MEDIA', 'Kazajistán tiene una superficie de 2.7 millones de km², siendo el estado sin litoral más grande del planeta.', TRUE, CURRENT_TIMESTAMP),
(12, 3, '¿Qué estrecho marítimo separa la península de Chukotka en Rusia de la península de Seward en Alaska?', 'DIFICIL', 'El estrecho de Bering mide aproximadamente 82 kilómetros de ancho en su punto más angosto.', TRUE, CURRENT_TIMESTAMP),

-- Categoría 4: Arte y Literatura
(13, 4, '¿Quién escribió la célebre novela cumbre "Cien años de soledad"?', 'FACIL', 'Gabriel García Márquez, premio Nobel colombiano, la publicó en 1967 en Buenos Aires.', TRUE, CURRENT_TIMESTAMP),
(14, 4, '¿Qué pintor holandés postimpresionista creó la obra maestra "La noche estrellada" en 1889?', 'MEDIA', 'Vincent van Gogh pintó esta obra maestra desde la ventana de su asilo en Saint-Rémy-de-Provence.', TRUE, CURRENT_TIMESTAMP),
(15, 4, '¿En qué museo parisino se encuentra expuesta permanentemente la estatua helenística "Venus de Milo"?', 'MEDIA', 'La Venus de Milo se exhibe de forma destacada en las galerías de arte clásico del Museo del Louvre.', TRUE, CURRENT_TIMESTAMP),
(16, 4, '¿Qué poeta renacentista florentino compuso "La Divina Comedia" a inicios del siglo XIV?', 'DIFICIL', 'Dante Alighieri escribió esta obra cumbre de la literatura universal entre 1304 y 1321.', TRUE, CURRENT_TIMESTAMP),

-- Categoría 5: Entretenimiento y Cine
(17, 5, '¿Qué director cinematográfico dirigió la exitosa película de ciencia ficción "Inception" (2010)?', 'FACIL', 'Christopher Nolan escribió y dirigió "Inception", película aclamada por su trama sobre los sueños lúcidos.', TRUE, CURRENT_TIMESTAMP),
(18, 5, '¿Cómo se llama la inteligencia artificial del traje de Iron Man interpretada por Paul Bettany?', 'MEDIA', 'J.A.R.V.I.S. (Just A Rather Very Intelligent System) asiste a Tony Stark antes de convertirse en Visión.', TRUE, CURRENT_TIMESTAMP),
(19, 5, '¿Qué franquicia de videojuegos presenta al legendario cazador de recompensas Samus Aran?', 'MEDIA', 'Metroid fue creada por Nintendo en 1986 y revolucionó el diseño no lineal de videojuegos exploratorios.', TRUE, CURRENT_TIMESTAMP),
(20, 5, '¿Cuál fue la primera película de animación en la historia en ganar el premio Óscar a Mejor Película Animada en 2002?', 'DIFICIL', 'Shrek de DreamWorks ganó la primera estatuilla de la categoría compitiendo contra Monsters, Inc. de Pixar.', TRUE, CURRENT_TIMESTAMP),

-- Categoría 6: Deportes y Retos
(21, 6, '¿Cada cuántos años se celebran tradicionalmente los Juegos Olímpicos de Verano?', 'FACIL', 'Los Juegos Olímpicos de la era moderna se celebran cada cuatro años desde Atenas 1896.', TRUE, CURRENT_TIMESTAMP),
(22, 6, '¿Qué tenista masculino ostenta el récord histórico con 14 títulos individuales de Roland Garros?', 'MEDIA', 'Rafael Nadal posee el récord inigualable de 14 copas de los Mosqueteros en la tierra batida de París.', TRUE, CURRENT_TIMESTAMP),
(23, 6, '¿En qué país se disputó la primera Copa Mundial de Fútbol de la FIFA en 1930?', 'MEDIA', 'Uruguay albergó y se coronó campeón del primer Mundial de la historia al derrotar a Argentina 4-2.', TRUE, CURRENT_TIMESTAMP),
(24, 6, '¿A qué distancia oficial exacta en metros equivale la prueba atlética de la maratón?', 'DIFICIL', 'La distancia oficial de 42.195 metros fue establecida formalmente en los Juegos Olímpicos de Londres 1908.', TRUE, CURRENT_TIMESTAMP);

SELECT setval('preguntas_id_seq', (SELECT MAX(id) FROM preguntas));

-- 7.4 Inserción de Opciones de Respuesta (4 opciones por pregunta: 1 correcta y 3 incorrectas)
INSERT INTO opciones_respuesta (id, pregunta_id, texto, es_correcta, created_at) VALUES
-- Pregunta 1 (Ciencia: Hidrógeno)
(1, 1, 'Hidrógeno', TRUE, CURRENT_TIMESTAMP),
(2, 1, 'Helio', FALSE, CURRENT_TIMESTAMP),
(3, 1, 'Oxígeno', FALSE, CURRENT_TIMESTAMP),
(4, 1, 'Carbono', FALSE, CURRENT_TIMESTAMP),

-- Pregunta 2 (Ciencia: Watson y Crick ADN)
(5, 2, '1953', TRUE, CURRENT_TIMESTAMP),
(6, 2, '1945', FALSE, CURRENT_TIMESTAMP),
(7, 2, '1962', FALSE, CURRENT_TIMESTAMP),
(8, 2, '1971', FALSE, CURRENT_TIMESTAMP),

-- Pregunta 3 (Ciencia: Bosón de Higgs)
(9, 3, 'Bosón de Higgs', TRUE, CURRENT_TIMESTAMP),
(10, 3, 'Neutrino tauónico', FALSE, CURRENT_TIMESTAMP),
(11, 3, 'Quark top', FALSE, CURRENT_TIMESTAMP),
(12, 3, 'Gravitón', FALSE, CURRENT_TIMESTAMP),

-- Pregunta 4 (Ciencia: DHCP)
(13, 4, 'DHCP', TRUE, CURRENT_TIMESTAMP),
(14, 4, 'DNS', FALSE, CURRENT_TIMESTAMP),
(15, 4, 'SNMP', FALSE, CURRENT_TIMESTAMP),
(16, 4, 'BGP', FALSE, CURRENT_TIMESTAMP),

-- Pregunta 5 (Historia: 1789)
(17, 5, '1789', TRUE, CURRENT_TIMESTAMP),
(18, 5, '1776', FALSE, CURRENT_TIMESTAMP),
(19, 5, '1804', FALSE, CURRENT_TIMESTAMP),
(20, 5, '1799', FALSE, CURRENT_TIMESTAMP),

-- Pregunta 6 (Historia: Augusto)
(21, 6, 'César Augusto', TRUE, CURRENT_TIMESTAMP),
(22, 6, 'Julio César', FALSE, CURRENT_TIMESTAMP),
(23, 6, 'Nerón', FALSE, CURRENT_TIMESTAMP),
(24, 6, 'Marco Aurelio', FALSE, CURRENT_TIMESTAMP),

-- Pregunta 7 (Historia: Trafalgar)
(25, 7, 'Batalla de Trafalgar', TRUE, CURRENT_TIMESTAMP),
(26, 7, 'Batalla de Waterloo', FALSE, CURRENT_TIMESTAMP),
(27, 7, 'Batalla de Lepanto', FALSE, CURRENT_TIMESTAMP),
(28, 7, 'Batalla de Jutlandia', FALSE, CURRENT_TIMESTAMP),

-- Pregunta 8 (Historia: Westfalia)
(29, 8, 'Paz de Westfalia', TRUE, CURRENT_TIMESTAMP),
(30, 8, 'Tratado de Utrecht', FALSE, CURRENT_TIMESTAMP),
(31, 8, 'Edicto de Nantes', FALSE, CURRENT_TIMESTAMP),
(32, 8, 'Paz de Augsburgo', FALSE, CURRENT_TIMESTAMP),

-- Pregunta 9 (Geografía: Amazonas)
(33, 9, 'Río Amazonas', TRUE, CURRENT_TIMESTAMP),
(34, 9, 'Río Nilo', FALSE, CURRENT_TIMESTAMP),
(35, 9, 'Río Yangtsé', FALSE, CURRENT_TIMESTAMP),
(36, 9, 'Río Misisipi', FALSE, CURRENT_TIMESTAMP),

-- Pregunta 10 (Geografía: Canberra)
(37, 10, 'Canberra', TRUE, CURRENT_TIMESTAMP),
(38, 10, 'Sídney', FALSE, CURRENT_TIMESTAMP),
(39, 10, 'Melbourne', FALSE, CURRENT_TIMESTAMP),
(40, 10, 'Brisbane', FALSE, CURRENT_TIMESTAMP),

-- Pregunta 11 (Geografía: Kazajistán)
(41, 11, 'Kazajistán', TRUE, CURRENT_TIMESTAMP),
(42, 11, 'Mongolia', FALSE, CURRENT_TIMESTAMP),
(43, 11, 'Bolivia', FALSE, CURRENT_TIMESTAMP),
(44, 11, 'Chad', FALSE, CURRENT_TIMESTAMP),

-- Pregunta 12 (Geografía: Bering)
(45, 12, 'Estrecho de Bering', TRUE, CURRENT_TIMESTAMP),
(46, 12, 'Estrecho de Magallanes', FALSE, CURRENT_TIMESTAMP),
(47, 12, 'Estrecho de Gibraltar', FALSE, CURRENT_TIMESTAMP),
(48, 12, 'Estrecho de Malaca', FALSE, CURRENT_TIMESTAMP),

-- Pregunta 13 (Arte: García Márquez)
(49, 13, 'Gabriel García Márquez', TRUE, CURRENT_TIMESTAMP),
(50, 13, 'Mario Vargas Llosa', FALSE, CURRENT_TIMESTAMP),
(51, 13, 'Julio Cortázar', FALSE, CURRENT_TIMESTAMP),
(52, 13, 'Jorge Luis Borges', FALSE, CURRENT_TIMESTAMP),

-- Pregunta 14 (Arte: Van Gogh)
(53, 14, 'Vincent van Gogh', TRUE, CURRENT_TIMESTAMP),
(54, 14, 'Claude Monet', FALSE, CURRENT_TIMESTAMP),
(55, 14, 'Paul Cézanne', FALSE, CURRENT_TIMESTAMP),
(56, 14, 'Gustav Klimt', FALSE, CURRENT_TIMESTAMP),

-- Pregunta 15 (Arte: Louvre)
(57, 15, 'Museo del Louvre', TRUE, CURRENT_TIMESTAMP),
(58, 15, 'Museo Británico', FALSE, CURRENT_TIMESTAMP),
(59, 15, 'Galería Uffizi', FALSE, CURRENT_TIMESTAMP),
(60, 15, 'Museo del Prado', FALSE, CURRENT_TIMESTAMP),

-- Pregunta 16 (Arte: Dante)
(61, 16, 'Dante Alighieri', TRUE, CURRENT_TIMESTAMP),
(62, 16, 'Francesco Petrarca', FALSE, CURRENT_TIMESTAMP),
(63, 16, 'Giovanni Boccaccio', FALSE, CURRENT_TIMESTAMP),
(64, 16, 'Ludovico Ariosto', FALSE, CURRENT_TIMESTAMP),

-- Pregunta 17 (Entretenimiento: Nolan)
(65, 17, 'Christopher Nolan', TRUE, CURRENT_TIMESTAMP),
(66, 17, 'Denis Villeneuve', FALSE, CURRENT_TIMESTAMP),
(67, 17, 'James Cameron', FALSE, CURRENT_TIMESTAMP),
(68, 17, 'David Fincher', FALSE, CURRENT_TIMESTAMP),

-- Pregunta 18 (Entretenimiento: JARVIS)
(69, 18, 'J.A.R.V.I.S.', TRUE, CURRENT_TIMESTAMP),
(70, 18, 'F.R.I.D.A.Y.', FALSE, CURRENT_TIMESTAMP),
(71, 18, 'H.A.L. 9000', FALSE, CURRENT_TIMESTAMP),
(72, 18, 'K.A.R.E.N.', FALSE, CURRENT_TIMESTAMP),

-- Pregunta 19 (Entretenimiento: Metroid)
(73, 19, 'Metroid', TRUE, CURRENT_TIMESTAMP),
(74, 19, 'Star Fox', FALSE, CURRENT_TIMESTAMP),
(75, 19, 'The Legend of Zelda', FALSE, CURRENT_TIMESTAMP),
(76, 19, 'F-Zero', FALSE, CURRENT_TIMESTAMP),

-- Pregunta 20 (Entretenimiento: Shrek)
(77, 20, 'Shrek', TRUE, CURRENT_TIMESTAMP),
(78, 20, 'Monsters, Inc.', FALSE, CURRENT_TIMESTAMP),
(79, 20, 'Toy Story 2', FALSE, CURRENT_TIMESTAMP),
(80, 20, 'Ice Age', FALSE, CURRENT_TIMESTAMP),

-- Pregunta 21 (Deportes: 4 años)
(81, 21, '4 años', TRUE, CURRENT_TIMESTAMP),
(82, 21, '2 años', FALSE, CURRENT_TIMESTAMP),
(83, 21, '5 años', FALSE, CURRENT_TIMESTAMP),
(84, 21, '6 años', FALSE, CURRENT_TIMESTAMP),

-- Pregunta 22 (Deportes: Nadal)
(85, 22, 'Rafael Nadal', TRUE, CURRENT_TIMESTAMP),
(86, 22, 'Roger Federer', FALSE, CURRENT_TIMESTAMP),
(87, 22, 'Novak Djokovic', FALSE, CURRENT_TIMESTAMP),
(88, 22, 'Björn Borg', FALSE, CURRENT_TIMESTAMP),

-- Pregunta 23 (Deportes: Uruguay 1930)
(89, 23, 'Uruguay', TRUE, CURRENT_TIMESTAMP),
(90, 23, 'Brasil', FALSE, CURRENT_TIMESTAMP),
(91, 23, 'Italia', FALSE, CURRENT_TIMESTAMP),
(92, 23, 'Francia', FALSE, CURRENT_TIMESTAMP),

-- Pregunta 24 (Deportes: 42.195 metros)
(93, 24, '42.195 metros', TRUE, CURRENT_TIMESTAMP),
(94, 24, '40.000 metros', FALSE, CURRENT_TIMESTAMP),
(95, 24, '45.500 metros', FALSE, CURRENT_TIMESTAMP),
(96, 24, '41.195 metros', FALSE, CURRENT_TIMESTAMP);

SELECT setval('opciones_respuesta_id_seq', (SELECT MAX(id) FROM opciones_respuesta));

-- 7.5 Inserción de Partidas de Prueba (Históricas y Semanales para poblar Vistas de Ranking)
INSERT INTO partidas (id, usuario_id, categoria_id, modo, estado, puntaje_total, aciertos, errores, racha_maxima, tiempo_inicio, tiempo_fin) VALUES
-- Partida 1: brain_master (Partida de Categoría Ciencia completada hace 2 días)
(1, 3, 1, 'CATEGORIA', 'COMPLETED', 2850, 9, 1, 6, CURRENT_TIMESTAMP - INTERVAL '2 days 30 minutes', CURRENT_TIMESTAMP - INTERVAL '2 days 18 minutes'),
-- Partida 2: trivia_champion (Partida Rápida completada hace 3 días)
(2, 2, NULL, 'RAPIDA', 'COMPLETED', 2640, 8, 2, 5, CURRENT_TIMESTAMP - INTERVAL '3 days 1 hour', CURRENT_TIMESTAMP - INTERVAL '3 days 48 minutes'),
-- Partida 3: quizz_wizard (Partida de Historia completada hace 1 día)
(3, 4, 2, 'CATEGORIA', 'COMPLETED', 2420, 8, 2, 4, CURRENT_TIMESTAMP - INTERVAL '1 day 4 hours', CURRENT_TIMESTAMP - INTERVAL '1 day 3 hours 50 minutes'),
-- Partida 4: speedy_cortex (Partida Rápida completada hoy)
(4, 5, NULL, 'RAPIDA', 'COMPLETED', 3150, 10, 0, 10, CURRENT_TIMESTAMP - INTERVAL '4 hours', CURRENT_TIMESTAMP - INTERVAL '3 hours 50 minutes'),
-- Partida 5: trivia_champion (Partida de Ciencia hace 4 días)
(5, 2, 1, 'CATEGORIA', 'COMPLETED', 2180, 7, 3, 4, CURRENT_TIMESTAMP - INTERVAL '4 days 2 hours', CURRENT_TIMESTAMP - INTERVAL '4 days 1 hour 48 minutes'),
-- Partida 6: brain_master (Partida histórica hace 20 días)
(6, 3, 2, 'CATEGORIA', 'COMPLETED', 2900, 9, 1, 7, CURRENT_TIMESTAMP - INTERVAL '20 days', CURRENT_TIMESTAMP - INTERVAL '20 days - 12 minutes');

SELECT setval('partidas_id_seq', (SELECT MAX(id) FROM partidas));

-- 7.6 Inserción de Respuestas de Muestra (Partida 4: Partida perfecta de speedy_cortex)
INSERT INTO respuestas_usuario (partida_id, pregunta_id, opcion_seleccionada_id, es_correcta, puntos_obtenidos, tiempo_respuesta_ms, racha_momento, respondida_en) VALUES
(4, 1, 1, TRUE, 220, 3200, 1, CURRENT_TIMESTAMP - INTERVAL '3 hours 59 minutes'),
(4, 5, 17, TRUE, 240, 2800, 2, CURRENT_TIMESTAMP - INTERVAL '3 hours 58 minutes'),
(4, 9, 33, TRUE, 260, 2100, 3, CURRENT_TIMESTAMP - INTERVAL '3 hours 57 minutes'),
(4, 13, 49, TRUE, 290, 1900, 4, CURRENT_TIMESTAMP - INTERVAL '3 hours 56 minutes'),
(4, 17, 65, TRUE, 320, 2400, 5, CURRENT_TIMESTAMP - INTERVAL '3 hours 55 minutes'),
(4, 21, 81, TRUE, 350, 1800, 6, CURRENT_TIMESTAMP - INTERVAL '3 hours 54 minutes'),
(4, 2, 5, TRUE, 360, 4100, 7, CURRENT_TIMESTAMP - INTERVAL '3 hours 53 minutes'),
(4, 6, 21, TRUE, 370, 3900, 8, CURRENT_TIMESTAMP - INTERVAL '3 hours 52 minutes'),
(4, 10, 37, TRUE, 370, 3500, 9, CURRENT_TIMESTAMP - INTERVAL '3 hours 51 minutes'),
(4, 14, 53, TRUE, 370, 2900, 10, CURRENT_TIMESTAMP - INTERVAL '3 hours 50 minutes');

SELECT setval('respuestas_usuario_id_seq', (SELECT MAX(id) FROM respuestas_usuario));

-- ============================================================================
-- FIN DEL ESQUEMA DDL
-- ============================================================================
