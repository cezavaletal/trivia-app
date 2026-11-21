-- ============================================================================
-- MIGRACIÓN FLYWAY V2: Datos Semilla (Usuarios, Categorías, Preguntas y Opciones)
-- Motor: PostgreSQL 16
-- ============================================================================

-- 1. USUARIOS INICIALES DE PRUEBA
-- ----------------------------------------------------------------------------
-- Contraseña en texto claro para ambos usuarios: "Password123!"
-- Hash BCrypt estándar (costo 10): $2a$10$wKz0bBfxjLzE9k9R6BqGqO6b5O.eM0Cq1x0q.9x.2.K3y7F3L7lvy
INSERT INTO usuarios (id, username, email, password_hash, rol, is_active, created_at, updated_at) VALUES
(1, 'admin', 'admin@trivia.com', '$2a$10$3joQJjM9AOgtpiozfzcWGewdvNrc.p9g7sWqpnT13s7UkpabVxprq', 'ROLE_ADMIN', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'jugador1', 'jugador1@trivia.com', '$2a$10$3joQJjM9AOgtpiozfzcWGewdvNrc.p9g7sWqpnT13s7UkpabVxprq', 'ROLE_PLAYER', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 2. CATEGORÍAS TEMÁTICAS
-- ----------------------------------------------------------------------------
INSERT INTO categorias (id, nombre, descripcion, icono, color, is_active, created_at) VALUES
(1, 'Ciencia y Tecnología', 'Física, química, biología, informática, astronomía e innovaciones.', 'flask-conical', '#3B82F6', TRUE, CURRENT_TIMESTAMP),
(2, 'Historia Universal', 'Grandes civilizaciones, batallas, tratados y personajes legendarios.', 'landmark', '#F59E0B', TRUE, CURRENT_TIMESTAMP),
(3, 'Geografía y Lugares', 'Países, capitales, cordilleras, océanos, banderas y maravillas.', 'globe', '#10B981', TRUE, CURRENT_TIMESTAMP),
(4, 'Arte y Literatura', 'Obras clásicas, autores, pintura, escultura, mitología y poesía.', 'palette', '#8B5CF6', TRUE, CURRENT_TIMESTAMP),
(5, 'Deportes y Retos', 'Fútbol, básquetbol, Juegos Olímpicos, tenis, marcas y leyendas.', 'trophy', '#EF4444', TRUE, CURRENT_TIMESTAMP),
(6, 'Cultura General y Entretenimiento', 'Cine, música, televisión, cultura popular y saberes cotidianos.', 'sparkles', '#EC4899', TRUE, CURRENT_TIMESTAMP);

-- 3. BANCO DE PREGUNTAS (30 PREGUNTAS: 5 POR CATEGORÍA CON DIVERSIDAD DE DIFICULTAD)
-- ----------------------------------------------------------------------------
INSERT INTO preguntas (id, categoria_id, enunciado, dificultad, explicacion, is_active, created_at) VALUES
-- Categoría 1: Ciencia y Tecnología (IDs 1 - 5)
(1, 1, '¿Cuál es el elemento químico más abundante en el universo observable?', 'FACIL', 'El hidrógeno compone aproximadamente el 74% de la masa bariónica normal del universo.', TRUE, CURRENT_TIMESTAMP),
(2, 1, '¿Qué tipo de partícula subatómica posee carga eléctrica negativa?', 'FACIL', 'Los electrones tienen carga negativa y orbitan el núcleo atómico compuesto por protones y neutrones.', TRUE, CURRENT_TIMESTAMP),
(3, 1, '¿En qué año publicaron Watson y Crick el modelo de la doble hélice del ADN?', 'MEDIA', 'El histórico artículo de Watson y Crick fue publicado en la revista Nature en abril de 1953.', TRUE, CURRENT_TIMESTAMP),
(4, 1, '¿Qué protocolo de red asigna dinámicamente direcciones IP a los dispositivos en una red local?', 'MEDIA', 'DHCP (Dynamic Host Configuration Protocol) automatiza la asignación de parámetros de red e IPs.', TRUE, CURRENT_TIMESTAMP),
(5, 1, '¿Qué partícula subatómica confirmada en 2012 otorga masa a otras partículas en el Modelo Estándar?', 'DIFICIL', 'El bosón de Higgs fue descubierto por los experimentos ATLAS y CMS del CERN en el Gran Colisionador de Hadrones.', TRUE, CURRENT_TIMESTAMP),

-- Categoría 2: Historia Universal (IDs 6 - 10)
(6, 2, '¿En qué año comenzó la Revolución Francesa con la histórica toma de la Bastilla?', 'FACIL', 'La toma de la Bastilla tuvo lugar el 14 de julio de 1789, desatando la Revolución Francesa.', TRUE, CURRENT_TIMESTAMP),
(7, 2, '¿Quién fue el primer gobernante en ostentar el título oficial de Emperador de Roma?', 'FACIL', 'Cayo Julio César Octaviano asumió el título de Augusto en el año 27 a.C., inaugurando el Principado.', TRUE, CURRENT_TIMESTAMP),
(8, 2, '¿Qué civilización mesoamericana construyó la majestuosa ciudadela piramidal de Chichén Itzá?', 'MEDIA', 'Los mayas construyeron Chichén Itzá en la península de Yucatán, destacando el Templo de Kukulcán.', TRUE, CURRENT_TIMESTAMP),
(9, 2, '¿Qué batalla naval de 1805 consolidó la supremacía marítima británica sobre Napoleón Bonaparte?', 'MEDIA', 'La Batalla de Trafalgar fue liderada victoriosamente por el almirante Horatio Nelson frente a Cádiz.', TRUE, CURRENT_TIMESTAMP),
(10, 2, '¿Cuál tratado de paz en 1648 puso fin a la Guerra de los Treinta Años en Europa?', 'DIFICIL', 'La Paz de Westfalia sentó las bases del orden internacional y la soberanía territorial moderna de los Estados.', TRUE, CURRENT_TIMESTAMP),

-- Categoría 3: Geografía y Lugares (IDs 11 - 15)
(11, 3, '¿Cuál es el río más largo y caudaloso del planeta Tierra?', 'FACIL', 'El río Amazonas transporta más agua que los ríos Nilo, Yangtsé y Misisipi combinados.', TRUE, CURRENT_TIMESTAMP),
(12, 3, '¿Cuál es el país más extenso del mundo en superficie territorial?', 'FACIL', 'Rusia cuenta con más de 17 millones de kilómetros cuadrados de territorio a través de dos continentes.', TRUE, CURRENT_TIMESTAMP),
(13, 3, '¿Cuál es la capital oficial de Australia?', 'MEDIA', 'Canberra fue elegida como compromiso neutral entre las dos urbes más grandes: Sídney y Melbourne.', TRUE, CURRENT_TIMESTAMP),
(14, 3, '¿Cuál es el país independiente sin salida al mar más grande del mundo?', 'MEDIA', 'Kazajistán abarca 2.7 millones de km², siendo el estado interior sin litoral marítimo más grande.', TRUE, CURRENT_TIMESTAMP),
(15, 3, '¿Qué estrecho marítimo separa la península de Chukotka en Rusia de Alaska en América del Norte?', 'DIFICIL', 'El estrecho de Bering une el mar de Bering con el mar de Chukotka y mide unos 82 km en su punto más estrecho.', TRUE, CURRENT_TIMESTAMP),

-- Categoría 4: Arte y Literatura (IDs 16 - 20)
(16, 4, '¿Quién escribió la célebre novela cumbre "Cien años de soledad"?', 'FACIL', 'El escritor colombiano Gabriel García Márquez la publicó en 1967, cumbre del realismo mágico.', TRUE, CURRENT_TIMESTAMP),
(17, 4, '¿Quién pintó la icónica obra renacentista "La última cena" en Milán?', 'FACIL', 'Leonardo da Vinci pintó esta obra maestra en el refectorio del convento de Santa Maria delle Grazie.', TRUE, CURRENT_TIMESTAMP),
(18, 4, '¿Qué pintor holandés postimpresionista creó "La noche estrellada" en 1889?', 'MEDIA', 'Vincent van Gogh la pintó mientras residía en el hospital psiquiátrico de Saint-Paul-de-Mausole.', TRUE, CURRENT_TIMESTAMP),
(19, 4, '¿En qué museo parisino se encuentra expuesta permanentemente la escultura "Venus de Milo"?', 'MEDIA', 'La Venus de Milo se exhibe de manera permanente en el Museo del Louvre en París.', TRUE, CURRENT_TIMESTAMP),
(20, 4, '¿Qué poeta renacentista florentino compuso "La Divina Comedia" a inicios del siglo XIV?', 'DIFICIL', 'Dante Alighieri escribió los tres cantos (Infierno, Purgatorio y Paraíso) entre 1304 y 1321.', TRUE, CURRENT_TIMESTAMP),

-- Categoría 5: Deportes y Retos (IDs 21 - 25)
(21, 5, '¿Cada cuántos años se celebran tradicionalmente los Juegos Olímpicos de Verano?', 'FACIL', 'Desde su restauración moderna en Atenas 1896, se celebran en periodos de olimpiadas de 4 años.', TRUE, CURRENT_TIMESTAMP),
(22, 5, '¿Cuántos jugadores conforman el equipo titular en cancha en un partido oficial de baloncesto?', 'FACIL', 'Cada equipo compite con 5 jugadores simultáneos en pista (base, escolta, alero, ala-pívot y pívot).', TRUE, CURRENT_TIMESTAMP),
(23, 5, '¿Qué tenista masculino ostenta el récord histórico con 14 títulos en el torneo de Roland Garros?', 'MEDIA', 'Rafael Nadal posee la marca legendaria de 14 copas en la tierra batida del complejo parisino.', TRUE, CURRENT_TIMESTAMP),
(24, 5, '¿En qué país sudamericano se disputó la primera Copa Mundial de Fútbol de la FIFA en 1930?', 'MEDIA', 'Uruguay fue la sede y primer campeón mundial al vencer 4-2 a Argentina en el Estadio Centenario.', TRUE, CURRENT_TIMESTAMP),
(25, 5, '¿A qué distancia oficial exacta en metros equivale la prueba atlética de la maratón?', 'DIFICIL', 'La distancia oficial de 42.195 metros (26 millas y 385 yardas) fue fijada en los Juegos de Londres 1908.', TRUE, CURRENT_TIMESTAMP),

-- Categoría 6: Cultura General y Entretenimiento (IDs 26 - 30)
(26, 6, '¿Qué cineasta dirigió la aclamada película de ciencia ficción "Inception" (2010)?', 'FACIL', 'Christopher Nolan escribió y dirigió "Inception", protagonizada por Leonardo DiCaprio.', TRUE, CURRENT_TIMESTAMP),
(27, 6, '¿Cómo se llama la inteligencia artificial del traje de Iron Man con la voz de Paul Bettany?', 'FACIL', 'J.A.R.V.I.S. (Just A Rather Very Intelligent System) asiste a Tony Stark en sus primeros trajes.', TRUE, CURRENT_TIMESTAMP),
(28, 6, '¿Qué célebre saga de videojuegos de Nintendo está protagonizada por Samus Aran?', 'MEDIA', 'Metroid es una franquicia pionera de acción y exploración no lineal creada por Nintendo en 1986.', TRUE, CURRENT_TIMESTAMP),
(29, 6, '¿Cuál es el océano más extenso y profundo del planeta Tierra?', 'MEDIA', 'El océano Pacífico abarca más de 165 millones de km² y alberga la Fosa de las Marianas.', TRUE, CURRENT_TIMESTAMP),
(30, 6, '¿Cuál fue la primera película en ganar el premio Óscar a Mejor Película de Animación en 2002?', 'DIFICIL', 'Shrek de DreamWorks Pictures inauguró la estatuilla dorada derrotando a Monsters, Inc. de Pixar.', TRUE, CURRENT_TIMESTAMP);

-- 4. OPCIONES DE RESPUESTA (120 OPCIONES: EXACTAMENTE 1 CORRECTA Y 3 INCORRECTAS POR PREGUNTA)
-- ----------------------------------------------------------------------------
INSERT INTO opciones_respuesta (id, pregunta_id, texto, es_correcta, created_at) VALUES
-- Pregunta 1 (Ciencia: Hidrógeno)
(1, 1, 'Hidrógeno', TRUE, CURRENT_TIMESTAMP),
(2, 1, 'Helio', FALSE, CURRENT_TIMESTAMP),
(3, 1, 'Oxígeno', FALSE, CURRENT_TIMESTAMP),
(4, 1, 'Carbono', FALSE, CURRENT_TIMESTAMP),

-- Pregunta 2 (Ciencia: Electrón)
(5, 2, 'Electrón', TRUE, CURRENT_TIMESTAMP),
(6, 2, 'Protón', FALSE, CURRENT_TIMESTAMP),
(7, 2, 'Neutrón', FALSE, CURRENT_TIMESTAMP),
(8, 2, 'Positrón', FALSE, CURRENT_TIMESTAMP),

-- Pregunta 3 (Ciencia: 1953)
(9, 3, '1953', TRUE, CURRENT_TIMESTAMP),
(10, 3, '1945', FALSE, CURRENT_TIMESTAMP),
(11, 3, '1962', FALSE, CURRENT_TIMESTAMP),
(12, 3, '1971', FALSE, CURRENT_TIMESTAMP),

-- Pregunta 4 (Ciencia: DHCP)
(13, 4, 'DHCP', TRUE, CURRENT_TIMESTAMP),
(14, 4, 'DNS', FALSE, CURRENT_TIMESTAMP),
(15, 4, 'SNMP', FALSE, CURRENT_TIMESTAMP),
(16, 4, 'BGP', FALSE, CURRENT_TIMESTAMP),

-- Pregunta 5 (Ciencia: Bosón de Higgs)
(17, 5, 'Bosón de Higgs', TRUE, CURRENT_TIMESTAMP),
(18, 5, 'Neutrino tauónico', FALSE, CURRENT_TIMESTAMP),
(19, 5, 'Quark top', FALSE, CURRENT_TIMESTAMP),
(20, 5, 'Gravitón', FALSE, CURRENT_TIMESTAMP),

-- Pregunta 6 (Historia: 1789)
(21, 6, '1789', TRUE, CURRENT_TIMESTAMP),
(22, 6, '1776', FALSE, CURRENT_TIMESTAMP),
(23, 6, '1804', FALSE, CURRENT_TIMESTAMP),
(24, 6, '1799', FALSE, CURRENT_TIMESTAMP),

-- Pregunta 7 (Historia: César Augusto)
(25, 7, 'César Augusto', TRUE, CURRENT_TIMESTAMP),
(26, 7, 'Julio César', FALSE, CURRENT_TIMESTAMP),
(27, 7, 'Nerón', FALSE, CURRENT_TIMESTAMP),
(28, 7, 'Marco Aurelio', FALSE, CURRENT_TIMESTAMP),

-- Pregunta 8 (Historia: Maya)
(29, 8, 'Maya', TRUE, CURRENT_TIMESTAMP),
(30, 8, 'Azteca', FALSE, CURRENT_TIMESTAMP),
(31, 8, 'Olmeca', FALSE, CURRENT_TIMESTAMP),
(32, 8, 'Tolteca', FALSE, CURRENT_TIMESTAMP),

-- Pregunta 9 (Historia: Trafalgar)
(33, 9, 'Batalla de Trafalgar', TRUE, CURRENT_TIMESTAMP),
(34, 9, 'Batalla de Waterloo', FALSE, CURRENT_TIMESTAMP),
(35, 9, 'Batalla de Lepanto', FALSE, CURRENT_TIMESTAMP),
(36, 9, 'Batalla de Jutlandia', FALSE, CURRENT_TIMESTAMP),

-- Pregunta 10 (Historia: Westfalia)
(37, 10, 'Paz de Westfalia', TRUE, CURRENT_TIMESTAMP),
(38, 10, 'Tratado de Utrecht', FALSE, CURRENT_TIMESTAMP),
(39, 10, 'Edicto de Nantes', FALSE, CURRENT_TIMESTAMP),
(40, 10, 'Paz de Augsburgo', FALSE, CURRENT_TIMESTAMP),

-- Pregunta 11 (Geografía: Amazonas)
(41, 11, 'Río Amazonas', TRUE, CURRENT_TIMESTAMP),
(42, 11, 'Río Nilo', FALSE, CURRENT_TIMESTAMP),
(43, 11, 'Río Yangtsé', FALSE, CURRENT_TIMESTAMP),
(44, 11, 'Río Misisipi', FALSE, CURRENT_TIMESTAMP),

-- Pregunta 12 (Geografía: Rusia)
(45, 12, 'Rusia', TRUE, CURRENT_TIMESTAMP),
(46, 12, 'Canadá', FALSE, CURRENT_TIMESTAMP),
(47, 12, 'China', FALSE, CURRENT_TIMESTAMP),
(48, 12, 'Estados Unidos', FALSE, CURRENT_TIMESTAMP),

-- Pregunta 13 (Geografía: Canberra)
(49, 13, 'Canberra', TRUE, CURRENT_TIMESTAMP),
(50, 13, 'Sídney', FALSE, CURRENT_TIMESTAMP),
(51, 13, 'Melbourne', FALSE, CURRENT_TIMESTAMP),
(52, 13, 'Brisbane', FALSE, CURRENT_TIMESTAMP),

-- Pregunta 14 (Geografía: Kazajistán)
(53, 14, 'Kazajistán', TRUE, CURRENT_TIMESTAMP),
(54, 14, 'Mongolia', FALSE, CURRENT_TIMESTAMP),
(55, 14, 'Bolivia', FALSE, CURRENT_TIMESTAMP),
(56, 14, 'Chad', FALSE, CURRENT_TIMESTAMP),

-- Pregunta 15 (Geografía: Bering)
(57, 15, 'Estrecho de Bering', TRUE, CURRENT_TIMESTAMP),
(58, 15, 'Estrecho de Magallanes', FALSE, CURRENT_TIMESTAMP),
(59, 15, 'Estrecho de Gibraltar', FALSE, CURRENT_TIMESTAMP),
(60, 15, 'Estrecho de Malaca', FALSE, CURRENT_TIMESTAMP),

-- Pregunta 16 (Arte: García Márquez)
(61, 16, 'Gabriel García Márquez', TRUE, CURRENT_TIMESTAMP),
(62, 16, 'Mario Vargas Llosa', FALSE, CURRENT_TIMESTAMP),
(63, 16, 'Julio Cortázar', FALSE, CURRENT_TIMESTAMP),
(64, 16, 'Jorge Luis Borges', FALSE, CURRENT_TIMESTAMP),

-- Pregunta 17 (Arte: Leonardo da Vinci)
(65, 17, 'Leonardo da Vinci', TRUE, CURRENT_TIMESTAMP),
(66, 17, 'Miguel Ángel Buonarroti', FALSE, CURRENT_TIMESTAMP),
(67, 17, 'Rafael Sanzio', FALSE, CURRENT_TIMESTAMP),
(68, 17, 'Sandro Botticelli', FALSE, CURRENT_TIMESTAMP),

-- Pregunta 18 (Arte: Van Gogh)
(69, 18, 'Vincent van Gogh', TRUE, CURRENT_TIMESTAMP),
(70, 18, 'Claude Monet', FALSE, CURRENT_TIMESTAMP),
(71, 18, 'Paul Cézanne', FALSE, CURRENT_TIMESTAMP),
(72, 18, 'Gustav Klimt', FALSE, CURRENT_TIMESTAMP),

-- Pregunta 19 (Arte: Louvre)
(73, 19, 'Museo del Louvre', TRUE, CURRENT_TIMESTAMP),
(74, 19, 'Museo Británico', FALSE, CURRENT_TIMESTAMP),
(75, 19, 'Galería Uffizi', FALSE, CURRENT_TIMESTAMP),
(76, 19, 'Museo del Prado', FALSE, CURRENT_TIMESTAMP),

-- Pregunta 20 (Arte: Dante)
(77, 20, 'Dante Alighieri', TRUE, CURRENT_TIMESTAMP),
(78, 20, 'Francesco Petrarca', FALSE, CURRENT_TIMESTAMP),
(79, 20, 'Giovanni Boccaccio', FALSE, CURRENT_TIMESTAMP),
(80, 20, 'Ludovico Ariosto', FALSE, CURRENT_TIMESTAMP),

-- Pregunta 21 (Deportes: 4 años)
(81, 21, '4 años', TRUE, CURRENT_TIMESTAMP),
(82, 21, '2 años', FALSE, CURRENT_TIMESTAMP),
(83, 21, '5 años', FALSE, CURRENT_TIMESTAMP),
(84, 21, '6 años', FALSE, CURRENT_TIMESTAMP),

-- Pregunta 22 (Deportes: 5 jugadores)
(85, 22, '5 jugadores', TRUE, CURRENT_TIMESTAMP),
(86, 22, '6 jugadores', FALSE, CURRENT_TIMESTAMP),
(87, 22, '7 jugadores', FALSE, CURRENT_TIMESTAMP),
(88, 22, '4 jugadores', FALSE, CURRENT_TIMESTAMP),

-- Pregunta 23 (Deportes: Nadal)
(89, 23, 'Rafael Nadal', TRUE, CURRENT_TIMESTAMP),
(90, 23, 'Roger Federer', FALSE, CURRENT_TIMESTAMP),
(91, 23, 'Novak Djokovic', FALSE, CURRENT_TIMESTAMP),
(92, 23, 'Björn Borg', FALSE, CURRENT_TIMESTAMP),

-- Pregunta 24 (Deportes: Uruguay 1930)
(93, 24, 'Uruguay', TRUE, CURRENT_TIMESTAMP),
(94, 24, 'Brasil', FALSE, CURRENT_TIMESTAMP),
(95, 24, 'Argentina', FALSE, CURRENT_TIMESTAMP),
(96, 24, 'Chile', FALSE, CURRENT_TIMESTAMP),

-- Pregunta 25 (Deportes: 42.195 metros)
(97, 25, '42.195 metros', TRUE, CURRENT_TIMESTAMP),
(98, 25, '40.000 metros', FALSE, CURRENT_TIMESTAMP),
(99, 25, '45.500 metros', FALSE, CURRENT_TIMESTAMP),
(100, 25, '41.195 metros', FALSE, CURRENT_TIMESTAMP),

-- Pregunta 26 (Entretenimiento: Nolan)
(101, 26, 'Christopher Nolan', TRUE, CURRENT_TIMESTAMP),
(102, 26, 'Denis Villeneuve', FALSE, CURRENT_TIMESTAMP),
(103, 26, 'James Cameron', FALSE, CURRENT_TIMESTAMP),
(104, 26, 'David Fincher', FALSE, CURRENT_TIMESTAMP),

-- Pregunta 27 (Entretenimiento: JARVIS)
(105, 27, 'J.A.R.V.I.S.', TRUE, CURRENT_TIMESTAMP),
(106, 27, 'F.R.I.D.A.Y.', FALSE, CURRENT_TIMESTAMP),
(107, 27, 'H.A.L. 9000', FALSE, CURRENT_TIMESTAMP),
(108, 27, 'K.A.R.E.N.', FALSE, CURRENT_TIMESTAMP),

-- Pregunta 28 (Entretenimiento: Metroid)
(109, 28, 'Metroid', TRUE, CURRENT_TIMESTAMP),
(110, 28, 'Star Fox', FALSE, CURRENT_TIMESTAMP),
(111, 28, 'The Legend of Zelda', FALSE, CURRENT_TIMESTAMP),
(112, 28, 'F-Zero', FALSE, CURRENT_TIMESTAMP),

-- Pregunta 29 (Entretenimiento: Océano Pacífico)
(113, 29, 'Océano Pacífico', TRUE, CURRENT_TIMESTAMP),
(114, 29, 'Océano Atlántico', FALSE, CURRENT_TIMESTAMP),
(115, 29, 'Océano Índico', FALSE, CURRENT_TIMESTAMP),
(116, 29, 'Océano Ártico', FALSE, CURRENT_TIMESTAMP),

-- Pregunta 30 (Entretenimiento: Shrek)
(117, 30, 'Shrek', TRUE, CURRENT_TIMESTAMP),
(118, 30, 'Monsters, Inc.', FALSE, CURRENT_TIMESTAMP),
(119, 30, 'Toy Story 2', FALSE, CURRENT_TIMESTAMP),
(120, 30, 'Ice Age', FALSE, CURRENT_TIMESTAMP);

-- 5. SINCRONIZACIÓN DE SECUENCIAS
-- ----------------------------------------------------------------------------
-- Garantiza que las llamadas a nextval() en Spring Boot / Hibernate no colisionen con los IDs insertados
SELECT setval('usuarios_id_seq', (SELECT COALESCE(MAX(id), 1) FROM usuarios));
SELECT setval('categorias_id_seq', (SELECT COALESCE(MAX(id), 1) FROM categorias));
SELECT setval('preguntas_id_seq', (SELECT COALESCE(MAX(id), 1) FROM preguntas));
SELECT setval('opciones_respuesta_id_seq', (SELECT COALESCE(MAX(id), 1) FROM opciones_respuesta));
