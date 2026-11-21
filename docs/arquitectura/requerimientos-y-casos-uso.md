# Documento de Requerimientos y Casos de Uso
## Sistema de Trivia Multijugador Individual (Angular + Spring Boot + PostgreSQL)

---

## 1. Introducción y Alcance
El presente documento define los requerimientos funcionales, actores, reglas de negocio y especificación formal de casos de uso para la plataforma web de **Trivia**. El sistema está diseñado sobre una arquitectura desacoplada basada en un frontend en **Angular (v17+)**, un backend en **Spring Boot 3 (Java 21)** y persistencia relacional en **PostgreSQL 16**.

El objetivo central es proveer una experiencia de juego ágil, competitiva, justa y a prueba de manipulaciones o trampas en el lado del cliente (anti-cheat server-side verification).

---

## 2. Actores del Sistema

| Actor | Rol en Sistema (Spring Security) | Responsabilidades y Permisos |
| :--- | :--- | :--- |
| **Jugador (Player)** | `ROLE_PLAYER` | - Registro y autenticación mediante JWT.<br>- Configuración y arranque de partidas (Rápida o por Categoría).<br>- Recepción de preguntas sanitizadas y envío de respuestas dentro del tiempo límite.<br>- Consulta de estadísticas personales, historial y rankings (Global, Semanal y por Categoría). |
| **Administrador (Admin)** | `ROLE_ADMIN` | - Todos los permisos del Jugador.<br>- Gestión integral (CRUD) de Categorías.<br>- Gestión integral (CRUD) del Banco de Preguntas y Opciones (incluyendo definición de respuestas correctas, dificultad y explicaciones).<br>- Moderación de usuarios y monitoreo de partidas sospechosas. |
| **Sistema / Motor de Partida** | `SYSTEM` (Proceso Interno) | - Orquestación de tiempos, validación server-side de respuestas.<br>- Cálculo de puntaje y multiplicadores de racha.<br>- Consolidación de tablas de clasificación y revocación de partidas expiradas. |

---

## 3. Reglas de Negocio (RN)

### RN-01: Configuración Estándar de Partida
- Cada partida consta de un número fijo de preguntas: **10 preguntas por defecto**.
- Tipos de partida:
  - **Partida Rápida (Mix)**: Selección aleatoria ponderada de preguntas de todas las categorías activas.
  - **Partida Temática**: Selección aleatoria de preguntas pertenecientes exclusivamente a la categoría seleccionada por el usuario.
- En una misma partida no puede repetirse ninguna pregunta.

---

### RN-02: Límite de Tiempo por Pregunta y Penalizaciones
- Cada pregunta tiene una ventana de respuesta de **15 segundos** (configurable por dificultad entre 10 y 20 segundos).
- El temporizador inicia en el backend en el momento exacto en que se entrega la pregunta al cliente (`question_served_at`).
- Si el jugador no responde en el tiempo límite estipulado:
  - La respuesta se califica como **TIMEOUT**.
  - El puntaje asignado para esa pregunta es **0 puntos**.
  - La racha de aciertos se reinicia inmediatamente a **0**.
- **Ventana de Gracia de Red (Network Latency Buffer)**: El backend concede un margen de gracia de máximo **1.500 ms (1.5 segundos)** sobre el tiempo nominal para compensar la latencia de red en el transporte HTTP. Cualquier respuesta recibida posterior a `tiempo_limite + 1500ms` es rechazada con código `408 Request Timeout` o evaluada como no respondida.

---

### RN-03: Mecanismo de Puntuación por Velocidad y Racha (Streak Bonus)
El puntaje final de cada pregunta acertada es producto de tres componentes: **Puntaje Base**, **Bonificación por Velocidad** y **Multiplicador por Racha Consecutiva**.

#### 1. Fórmula de Puntaje por Pregunta Acertada:
$$\text{Puntaje Pregunta} = \left( \text{Puntaje Base} + \text{Bonus Velocidad} \right) \times \text{Multiplicador Racha}$$

Donde:
- **Puntaje Base ($P_{base}$)**: Determinado por la dificultad de la pregunta:
  - Fácil: 100 puntos
  - Media: 200 puntos
  - Difícil: 300 puntos
- **Bonus de Velocidad ($B_{vel}$)**:
  $$B_{vel} = \left\lfloor P_{base} \times \left( \frac{t_{restante}}{t_{total}} \right) \times 0.5 \right\rfloor$$
  - Si el tiempo restante $t_{restante} \le 0$, $B_{vel} = 0$.
- **Multiplicador de Racha ($M_{racha}$)**:
  El multiplicador premia aciertos continuos sin fallos dentro de la misma partida:
  
  | Aciertos Consecutivos (Racha) | Multiplicador ($M_{racha}$) |
  | :---: | :---: |
  | 0 - 1 | 1.0x |
  | 2 | 1.2x |
  | 3 | 1.4x |
  | 4 | 1.7x |
  | $\ge$ 5 | 2.0x (Máximo) |

#### 2. Respuesta Incorrecta o Timeout:
- Puntos obtenidos: **0**.
- La racha actual se reajusta inmediatamente a **0**.

---

### RN-04: Prevención Estricta de Trampas (Anti-Cheat Server-Side Verification)
Para garantizar la integridad competitiva:
1. **Ocultamiento Total de Respuestas Correctas (Data Sanitization)**:
   - Al iniciar una partida o servir preguntas al frontend, el DTO (`QuestionDto` / `AnswerOptionDto`) **NUNCA** debe incluir el campo `is_correct` ni pistas equivalentes.
   - La opción correcta se mantiene almacenada única y exclusivamente en la base de datos de PostgreSQL y en el contexto protegido de la sesión del servidor.
   - La revelación de si la opción elegida fue correcta o incorrecta ocurre **únicamente después** de que el jugador ha enviado formalmente su respuesta mediante `POST /api/v1/games/{id}/answers`.
2. **Validación de Respuestas en Servidor**:
   - El cliente envía exclusivamente: `gameId`, `questionId`, `selectedOptionId` y el tiempo transcurrido percibido por el cliente en milisegundos (`clientDurationMs`).
   - El backend contrasta `clientDurationMs` con el delta de tiempo real registrado en servidor:
     $$\Delta t_{server} = t_{recibido} - t_{entregado}$$
   - Si $\Delta t_{server} > (\text{tiempo\_limite} + \text{tolerancia})$, se marca timeout automáticamente.
3. **Unicidad e Idempotencia de Envío**:
   - Cada pregunta de una partida sólo puede ser respondida una única vez.
   - Intentos posteriores de responder a la misma `questionId` dentro de la partida devuelven un error HTTP `409 Conflict` ("Pregunta ya respondida").
4. **Vínculo y Autorización de Partida**:
   - El `gameId` está asociado criptográfica y relacionalmente al `userId` del token JWT. Ningún usuario puede enviar respuestas o consultar el progreso de la partida de otro jugador (HTTP `403 Forbidden`).

---

### RN-05: Ciclo de Vida y Expiración de la Partida
- Los estados posibles de una partida son: `IN_PROGRESS`, `COMPLETED`, `ABANDONED`.
- Una partida en estado `IN_PROGRESS` tiene un tiempo máximo global de validez de **10 minutos**. Pasado este periodo sin actividad, el sistema la marca automáticamente como `ABANDONED` y no permite nuevos envíos.
- Al completar la décima pregunta (o al invocar el endpoint de cierre), la partida transiciona a `COMPLETED` y su puntaje total se registra de forma inmutable en el historial y se propaga a los rankings.

---

### RN-06: Tablas de Clasificación (Leaderboards)
- **Ranking Global**: Muestra el puntaje acumulado histórico de cada jugador o el récord de mejor puntaje en partida única (conmutador en vista).
- **Ranking Semanal**: Se calcula sobre las partidas completadas en la semana ISO en curso (lunes 00:00:00 UTC a domingo 23:59:59 UTC).
- **Ranking por Categoría**: Refleja el desempeño de los jugadores filtrado por una categoría específica.
- Los empates en puntaje se resuelven a favor del jugador que haya registrado menor tiempo acumulado total de respuesta.

---

## 4. Casos de Uso del Sistema

---

### CU-01: Registro y Autenticación con JWT

- **Identificador**: CU-01
- **Nombre**: Registro y Autenticación de Usuario
- **Actor Principal**: Jugador / Administrador
- **Precondiciones**:
  - Ninguna para registro/login.
- **Disparador**: El usuario accede al formulario de ingreso o registro en la SPA de Angular.
- **Flujo Principal (Registro y Login)**:
  1. El usuario introduce sus datos: username, email y contraseña.
  2. El frontend valida formatos (email válido, contraseña de mínimo 8 caracteres con mayúscula, número y símbolo).
  3. El frontend envía `POST /api/v1/auth/register` o `POST /api/v1/auth/login`.
  4. El backend valida credenciales (hasheadas con BCrypt).
  5. El backend genera un par de tokens: **Access Token JWT** (vida útil: 60 minutos) y opcionalmente Refresh Token.
  6. El backend retorna el JWT con los claims de identidad (`sub`, `roles`, `userId`).
  7. El frontend almacena el JWT en almacenamiento seguro del navegador (memoria/LocalStorage) y redirige al Dashboard.
- **Flujos Alternos**:
  - **4a. Credenciales inválidas**: El backend responde HTTP `401 Unauthorized` ("Credenciales incorrectas"). El frontend muestra mensaje de error.
  - **4b. Email o Username duplicado (en registro)**: El backend responde HTTP `409 Conflict` ("El usuario o correo ya se encuentra registrado").
- **Postcondiciones**: El usuario queda autenticado y sus peticiones subsecuentes adjuntan la cabecera `Authorization: Bearer <token>`.

---

### CU-02: Jugar Partida Rápida (Mix Aleatorio de Categorías)

- **Identificador**: CU-02
- **Nombre**: Iniciar y jugar partida rápida
- **Actor Principal**: Jugador (`ROLE_PLAYER`)
- **Precondiciones**:
  - El usuario debe estar autenticado con un JWT válido.
- **Disparador**: El jugador pulsa el botón "Partida Rápida" en el menú principal.
- **Flujo Principal**:
  1. El jugador selecciona la modalidad "Partida Rápida" (10 preguntas aleatorias).
  2. El frontend realiza la petición `POST /api/v1/games` enviando payload `{ "gameMode": "QUICK_PLAY", "categoryId": null }`.
  3. El backend valida el usuario y selecciona aleatoriamente 10 preguntas activas de categorías variadas desde PostgreSQL.
  4. El backend persiste la entidad `Game` en estado `IN_PROGRESS` con racha inicial = 0 y puntaje = 0.
  5. El backend retorna el ID de la partida y el listado de preguntas **sanitizadas** (cada una con sus 4 opciones de respuesta donde el atributo `isCorrect` ha sido omitido).
  6. El frontend carga la primera pregunta, presenta las opciones y activa el temporizador regresivo de 15 segundos.
- **Flujos Alternos**:
  - **3a. Banco de preguntas insuficiente**: Si no hay al menos 10 preguntas disponibles, el backend responde HTTP `422 Unprocessable Entity` ("Banco de preguntas insuficiente").
- **Postcondiciones**: La partida queda creada y en estado `IN_PROGRESS`.

---

### CU-03: Jugar Partida por Categoría Específica

- **Identificador**: CU-03
- **Nombre**: Iniciar y jugar partida por categoría
- **Actor Principal**: Jugador (`ROLE_PLAYER`)
- **Precondiciones**:
  - Usuario autenticado con JWT válido.
- **Disparador**: El jugador selecciona una categoría específica (ej. "Ciencia", "Historia") y pulsa "Iniciar Reto".
- **Flujo Principal**:
  1. El jugador consulta las categorías activas disponibles mediante `GET /api/v1/categories`.
  2. El jugador escoge una categoría y solicita inicio de juego.
  3. El frontend envía `POST /api/v1/games` con `{ "gameMode": "CATEGORY", "categoryId": 3 }`.
  4. El backend selecciona 10 preguntas aleatorias asociadas al `categoryId` especificado.
  5. El backend crea la partida y responde con la estructura sanitizada de preguntas y opciones.
  6. El frontend renderiza la interfaz temática e inicia la primera pregunta.
- **Flujos Alternos**:
  - **4a. Categoría inexistente o inactiva**: El backend retorna HTTP `404 Not Found`.
  - **4b. Preguntas insuficientes en la categoría**: El backend retorna HTTP `422 Unprocessable Entity`.
- **Postcondiciones**: Partida en curso vinculada a la categoría elegida.

---

### CU-04: Enviar Respuesta y Calcular Puntaje (Server-Side)

- **Identificador**: CU-04
- **Nombre**: Enviar respuesta a pregunta individual y calcular puntaje
- **Actor Principal**: Jugador (`ROLE_PLAYER`)
- **Precondiciones**:
  - La partida debe estar en estado `IN_PROGRESS`.
  - La pregunta a responder debe pertenecer a la partida actual y no haber sido respondida previamente.
- **Disparador**: El jugador hace clic en una opción de respuesta antes del vencimiento del tiempo o el cronómetro llega a 0.
- **Flujo Principal**:
  1. El jugador selecciona una opción o se agota el tiempo límite.
  2. El frontend detiene el reloj y envía `POST /api/v1/games/{id}/answers` con `{ "questionId": 45, "selectedOptionId": 180, "clientDurationMs": 4200 }`.
  3. El backend verifica la pertenencia de la partida al usuario autenticado.
  4. El backend valida que la pregunta no fue respondida anteriormente y evalúa la marca temporal contra el margen de tolerancia.
  5. El backend consulta en PostgreSQL la respuesta correcta real.
  6. **Si la respuesta es correcta**:
     - Calcula el puntaje según RN-03 (Puntaje base + Bonus de velocidad).
     - Incrementa la racha actual (`currentStreak++`).
     - Aplica el multiplicador correspondiente a la racha.
     - Suma los puntos al puntaje acumulado de la partida (`totalScore`).
  7. **Si la respuesta es incorrecta o timeout**:
     - Asigna 0 puntos.
     - Reinicia la racha a 0 (`currentStreak = 0`).
  8. El backend persiste el detalle del intento (`GameAnswer`) y el nuevo estado de la partida.
  9. El backend responde con el resultado: `{ "isCorrect": true, "pointsAwarded": 280, "currentStreak": 3, "streakMultiplier": 1.4, "correctOptionId": 180, "totalScore": 650 }`.
  10. El frontend resalta visualmente en verde la opción correcta (y en rojo si el usuario erró) y muestra los puntos y racha ganada.
  11. Tras una pausa de retroalimentación de 2 segundos, el frontend avanza a la siguiente pregunta.
- **Flujos Alternos**:
  - **4a. Envío duplicado de la misma pregunta**: El backend retorna HTTP `409 Conflict`.
  - **4b. Tiempo excedido sin tolerancia**: El backend califica la respuesta como TIMEOUT (0 puntos, racha rota).
  - **3a. Partida no pertenece al usuario**: El backend retorna HTTP `403 Forbidden`.
- **Postcondiciones**: El puntaje y la racha de la partida quedan actualizados atómicamente en PostgreSQL.

---

### CU-05: Ver Ranking Global y Semanal

- **Identificador**: CU-05
- **Nombre**: Consultar Tablas de Clasificación
- **Actor Principal**: Jugador (`ROLE_PLAYER`) / Administrador (`ROLE_ADMIN`)
- **Precondiciones**:
  - Usuario autenticado.
- **Disparador**: El usuario navega a la sección "Clasificación / Leaderboard".
- **Flujo Principal**:
  1. El usuario selecciona la pestaña deseada: "Global", "Semanal" o "Por Categoría".
  2. El frontend solicita los datos a:
     - `GET /api/v1/leaderboard/global?page=0&size=20` o
     - `GET /api/v1/leaderboard/weekly?page=0&size=20` o
     - `GET /api/v1/leaderboard/category/{categoryId}?page=0&size=20`.
  3. El backend ejecuta la consulta optimizada (con índices sobre puntajes y fechas) y recupera la página solicitada junto con la posición exacta y puntaje del usuario autenticado actual (`currentUserRank`).
  4. El backend responde con la lista paginada y la tarjeta destacada del usuario.
  5. El frontend renderiza el top 20, destacando el podio (puestos 1, 2 y 3 con insignias) y la posición relativa del jugador.
- **Postcondiciones**: Los datos del ranking son presentados en modo de solo lectura.

---

### CU-06: Gestionar Banco de Preguntas (CRUD Administrador)

- **Identificador**: CU-06
- **Nombre**: Administrar Preguntas, Categorías y Opciones
- **Actor Principal**: Administrador (`ROLE_ADMIN`)
- **Precondiciones**:
  - El usuario debe contar con el rol `ROLE_ADMIN` verificado en su JWT.
- **Disparador**: El administrador ingresa al módulo "Gestión de Preguntas" en el panel administrativo.
- **Flujo Principal (Creación de Pregunta)**:
  1. El administrador visualiza el listado de preguntas existentes filtrable por categoría y dificultad (`GET /api/v1/admin/questions`).
  2. El administrador pulsa "Nueva Pregunta".
  3. El administrador ingresa: texto de la pregunta, categoría, nivel de dificultad (`EASY`, `MEDIUM`, `HARD`), tiempo límite en segundos y define 4 opciones de respuesta, marcando exactamente una de ellas como correcta (`isCorrect: true`).
  4. El frontend valida que exista exactamente una opción verdadera y tres falsas.
  5. El frontend envía `POST /api/v1/admin/questions`.
  6. El backend valida la existencia de la categoría y las reglas de unicidad.
  7. El backend persiste la pregunta y sus opciones dentro de una transacción `@Transactional` en PostgreSQL.
  8. El backend responde con HTTP `201 Created` y los datos completos de la entidad creada.
- **Flujos Alternos**:
  - **4a. Datos inconsistentes (ej. 2 opciones correctas o ninguna)**: El backend rechaza con HTTP `400 Bad Request`.
  - **Edición / Eliminación**:
    - Edición: `PUT /api/v1/admin/questions/{id}` actualiza enunciado, dificultad o respuestas.
    - Eliminación: `DELETE /api/v1/admin/questions/{id}` realiza un soft-delete (`active = false`) para preservar la integridad referencial de partidas históricas.
  - **1a. Acceso no autorizado (Jugador regular)**: El filtro de seguridad de Spring Security intercepta la petición y responde HTTP `403 Forbidden`.
- **Postcondiciones**: La pregunta queda registrada y disponible para futuras partidas.
