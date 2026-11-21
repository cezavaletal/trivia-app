# Especificación de Contratos de API REST
## Sistema de Trivia Multijugador Individual (Angular + Spring Boot + PostgreSQL)

---

## 1. Convenciones Globales y Estándares

### 1.1 Formato y Versionado
- **Prefijo base**: `/api/v1`
- **Formato de datos**: `application/json; charset=UTF-8`
- **Codificación temporal**: ISO-8601 UTC (`YYYY-MM-DDTHH:mm:ss.sssZ`)
- **Nombres de atributos en JSON**: `camelCase`

### 1.2 Cabeceras HTTP Estándar

| Cabecera | Requerida en | Descripción |
| :--- | :--- | :--- |
| `Content-Type` | Peticiones con cuerpo (POST, PUT, PATCH) | Debe ser `application/json`. |
| `Accept` | Todas las peticiones | Debe ser `application/json`. |
| `Authorization` | Endpoints protegidos | Formato: `Bearer <token_jwt>`. |

### 1.3 Estructura Estándar de Respuesta de Error (RFC 7807 Compliant)
Todos los errores HTTP (códigos 4xx y 5xx) retornan de manera estricta el siguiente esquema:

```json
{
  "timestamp": "2026-11-20T10:15:30.123Z",
  "status": 400,
  "error": "Bad Request",
  "message": "La opción seleccionada no pertenece a la pregunta activa",
  "path": "/api/v1/games/101/answers",
  "validationErrors": [
    {
      "field": "selectedOptionId",
      "rejectedValue": -1,
      "message": "Debe ser un identificador válido mayor a 0"
    }
  ]
}
```

### 1.4 Catálogo de Códigos de Respuesta HTTP
- `200 OK`: Operación exitosa con cuerpo de respuesta.
- `201 Created`: Recurso creado exitosamente (retorna ubicación/cuerpo creado).
- `204 No Content`: Operación exitosa sin cuerpo de retorno (ej. borrado lógico).
- `400 Bad Request`: Payload malformado o error en validación de campos.
- `401 Unauthorized`: Token JWT ausente, expirado o con firma inválida.
- `403 Forbidden`: El usuario autenticado no posee los permisos requeridos (ej. rol insuficiente o recurso de otro usuario).
- `404 Not Found`: Recurso no encontrado.
- `409 Conflict`: Conflicto de estado de negocio (ej. pregunta ya respondida o username ya registrado).
- `422 Unprocessable Entity`: La petición es sintácticamente correcta pero viola reglas de negocio (ej. banco de preguntas insuficiente).
- `500 Internal Server Error`: Falla no controlada en el servidor.

---

## 2. Prevención Estricta de Trampas: Demostración en el Contrato

> [!IMPORTANT]
> **Aislamiento de la respuesta correcta (`isCorrect`) en la API:**
> Para erradicar cualquier posibilidad de ingeniería inversa o inspección en la consola del navegador:
> - En **todos** los endpoints de juego (`/api/v1/games/**`), las opciones de respuesta se exponen mediante el contrato **`AnswerOptionPublicDto`**, el cual **NUNCA** contiene la propiedad `isCorrect`.
> - La propiedad `isCorrect` **únicamente** se expone en la API administrativa (`/api/v1/admin/**`) protegida estrictamente por el rol `ROLE_ADMIN`.

### Comparación de Contratos:

```json
// ========================================================
// 1. DTO EN MODO JUEGO: GET /api/v1/games/{id}
// (Sanitizado: Seguro para el cliente Web)
// ========================================================
{
  "id": 501,
  "text": "¿En qué año se descubrió la estructura del ADN por Watson y Crick?",
  "options": [
    { "id": 2001, "text": "1945" },
    { "id": 2002, "text": "1953" },
    { "id": 2003, "text": "1962" },
    { "id": 2004, "text": "1971" }
  ]
  // NOTA: NO existe "isCorrect". El cliente desconoce cuál es la correcta.
}

// ========================================================
// 2. DTO EN MODO ADMINISTRADOR: GET /api/v1/admin/questions/{id}
// (Exclusivo ROLE_ADMIN para gestión)
// ========================================================
{
  "id": 501,
  "text": "¿En qué año se descubrió la estructura del ADN por Watson y Crick?",
  "options": [
    { "id": 2001, "text": "1945", "isCorrect": false },
    { "id": 2002, "text": "1953", "isCorrect": true },
    { "id": 2003, "text": "1962", "isCorrect": false },
    { "id": 2004, "text": "1971", "isCorrect": false }
  ]
}
```

---

## 3. Módulo de Autenticación (`/api/v1/auth`)

---

### 3.1 Registrar Nuevo Usuario
- **Ruta**: `POST /api/v1/auth/register`
- **Seguridad**: Pública (No requiere token).
- **Descripción**: Registra una nueva cuenta de jugador en el sistema.

#### Request Headers:
```http
Content-Type: application/json
```

#### Request Body:
```json
{
  "username": "trivia_champion",
  "email": "champion@example.com",
  "password": "Password123!"
}
```

#### Response 201 Created:
```json
{
  "tokenType": "Bearer",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjaGFtcGlvbiIsImlkIjo0Miwi...",
  "expiresInSeconds": 3600,
  "user": {
    "id": 42,
    "username": "trivia_champion",
    "email": "champion@example.com",
    "roles": ["ROLE_PLAYER"],
    "createdAt": "2026-11-20T10:00:00Z"
  }
}
```

#### Errores Posibles:
- `400 Bad Request`: Parámetros inválidos (ej. contraseña menor a 8 caracteres).
- `409 Conflict`: El `username` o `email` ya existen.

---

### 3.2 Iniciar Sesión (Login)
- **Ruta**: `POST /api/v1/auth/login`
- **Seguridad**: Pública.
- **Descripción**: Autentica credenciales y emite un token JWT.

#### Request Body:
```json
{
  "usernameOrEmail": "trivia_champion",
  "password": "Password123!"
}
```

#### Response 200 OK:
```json
{
  "tokenType": "Bearer",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjaGFtcGlvbiIsImlkIjo0Miwi...",
  "expiresInSeconds": 3600,
  "user": {
    "id": 42,
    "username": "trivia_champion",
    "email": "champion@example.com",
    "roles": ["ROLE_PLAYER"]
  }
}
```

#### Errores Posibles:
- `401 Unauthorized`: Credenciales erróneas o usuario inexistente.

---

### 3.3 Obtener Perfil del Usuario Autenticado
- **Ruta**: `GET /api/v1/auth/me`
- **Seguridad**: `ROLE_PLAYER` o `ROLE_ADMIN`.
- **Descripción**: Retorna la información del usuario en base a su JWT.

#### Request Headers:
```http
Authorization: Bearer <token_jwt>
```

#### Response 200 OK:
```json
{
  "id": 42,
  "username": "trivia_champion",
  "email": "champion@example.com",
  "roles": ["ROLE_PLAYER"],
  "stats": {
    "gamesPlayed": 45,
    "highestScore": 3850,
    "totalCorrectAnswers": 380,
    "bestStreak": 10
  }
}
```

---

## 4. Módulo de Partidas (`/api/v1/games`)

---

### 4.1 Iniciar Partida (Rápida o por Categoría)
- **Ruta**: `POST /api/v1/games`
- **Seguridad**: `ROLE_PLAYER` / `ROLE_ADMIN`.
- **Descripción**: Genera una nueva partida de 10 preguntas aleatorias en estado `IN_PROGRESS`. Retorna las preguntas sanitizadas.

#### Request Headers:
```http
Authorization: Bearer <token_jwt>
Content-Type: application/json
```

#### Request Body:
```json
{
  "gameMode": "QUICK_PLAY",
  "categoryId": null
}
```
*(Para modalidad temática: `"gameMode": "CATEGORY"`, `"categoryId": 3`)*

#### Response 201 Created:
```json
{
  "gameId": 101,
  "gameMode": "QUICK_PLAY",
  "status": "IN_PROGRESS",
  "totalQuestions": 10,
  "totalScore": 0,
  "currentStreak": 0,
  "createdAt": "2026-11-20T10:15:00Z",
  "questions": [
    {
      "id": 501,
      "order": 1,
      "categoryName": "Ciencia",
      "difficulty": "MEDIUM",
      "timeLimitSeconds": 15,
      "text": "¿En qué año se descubrió la estructura del ADN por Watson y Crick?",
      "options": [
        { "id": 2001, "text": "1945" },
        { "id": 2002, "text": "1953" },
        { "id": 2003, "text": "1962" },
        { "id": 2004, "text": "1971" }
      ]
    },
    {
      "id": 502,
      "order": 2,
      "categoryName": "Historia",
      "difficulty": "EASY",
      "timeLimitSeconds": 15,
      "text": "¿Quién fue el primer presidente de los Estados Unidos?",
      "options": [
        { "id": 2005, "text": "Thomas Jefferson" },
        { "id": 2006, "text": "George Washington" },
        { "id": 2007, "text": "Abraham Lincoln" },
        { "id": 2008, "text": "John Adams" }
      ]
    }
  ]
}
```

#### Errores Posibles:
- `400 Bad Request`: `gameMode` inválido o `categoryId` nulo en modo `CATEGORY`.
- `404 Not Found`: Categoría especificada inexistente.
- `422 Unprocessable Entity`: No hay suficientes preguntas activas en el banco para crear la partida.

---

### 4.2 Obtener Estado Actual de la Partida
- **Ruta**: `GET /api/v1/games/{id}`
- **Seguridad**: `ROLE_PLAYER` / `ROLE_ADMIN` (sólo el dueño de la partida).
- **Descripción**: Recupera el estado actual de la partida, preguntas respondidas y pendientes.

#### Response 200 OK:
```json
{
  "gameId": 101,
  "status": "IN_PROGRESS",
  "totalScore": 650,
  "currentStreak": 2,
  "answeredCount": 2,
  "totalQuestions": 10,
  "currentQuestionIndex": 3
}
```

#### Errores Posibles:
- `403 Forbidden`: La partida pertenece a otro usuario.
- `404 Not Found`: ID de partida inexistente.

---

### 4.3 Enviar Respuesta a Pregunta Individual
- **Ruta**: `POST /api/v1/games/{id}/answers`
- **Seguridad**: `ROLE_PLAYER` / `ROLE_ADMIN` (dueño de la partida).
- **Descripción**: Valida la respuesta enviada por el jugador, calcula puntaje en servidor, actualiza racha y devuelve la retroalimentación.

#### Request Body:
```json
{
  "questionId": 501,
  "selectedOptionId": 2002,
  "clientDurationMs": 4200
}
```
*(Si expiró el tiempo, se envía `selectedOptionId: null`)*

#### Response 200 OK:
```json
{
  "questionId": 501,
  "isCorrect": true,
  "correctOptionId": 2002,
  "explanation": "Watson y Crick publicaron su famoso artículo sobre la doble hélice en Nature en abril de 1953.",
  "scoreCalculation": {
    "baseScore": 200,
    "speedBonus": 72,
    "currentStreak": 3,
    "streakMultiplier": 1.4,
    "pointsAwarded": 380
  },
  "gameProgress": {
    "totalScore": 1030,
    "currentStreak": 3,
    "remainingQuestions": 8
  }
}
```

#### Response 200 OK (En caso de Respuesta Incorrecta o Timeout):
```json
{
  "questionId": 501,
  "isCorrect": false,
  "correctOptionId": 2002,
  "explanation": "La respuesta correcta era 1953.",
  "scoreCalculation": {
    "baseScore": 0,
    "speedBonus": 0,
    "currentStreak": 0,
    "streakMultiplier": 1.0,
    "pointsAwarded": 0
  },
  "gameProgress": {
    "totalScore": 650,
    "currentStreak": 0,
    "remainingQuestions": 8
  }
}
```

#### Errores Posibles:
- `403 Forbidden`: La partida pertenece a otro jugador.
- `408 Request Timeout`: Respuesta enviada fuera del tiempo de gracia del servidor.
- `409 Conflict`: La pregunta ya fue respondida previamente dentro de esta partida.

---

### 4.4 Finalizar Partida y Obtener Resumen
- **Ruta**: `POST /api/v1/games/{id}/finish`
- **Seguridad**: `ROLE_PLAYER` / `ROLE_ADMIN` (dueño de la partida).
- **Descripción**: Concluye la partida, transiciona el estado a `COMPLETED` y actualiza las tablas de clasificación.

#### Response 200 OK:
```json
{
  "gameId": 101,
  "status": "COMPLETED",
  "finalScore": 2840,
  "correctAnswers": 8,
  "incorrectAnswers": 2,
  "maxStreak": 5,
  "totalDurationSeconds": 112,
  "accuracyPercentage": 80.0,
  "leaderboardUpdate": {
    "globalRank": 14,
    "weeklyRank": 3,
    "isPersonalBest": true
  },
  "completedAt": "2026-11-20T10:18:15Z"
}
```

---

## 5. Módulo de Categorías y Preguntas

---

### 5.1 Listar Categorías Activas
- **Ruta**: `GET /api/v1/categories`
- **Seguridad**: Pública / Autenticado.
- **Descripción**: Retorna las categorías disponibles para jugar partidas temáticas.

#### Response 200 OK:
```json
[
  {
    "id": 1,
    "name": "Ciencia y Naturaleza",
    "slug": "ciencia-y-naturaleza",
    "description": "Preguntas de física, química, biología y astronomía",
    "icon": "flask",
    "totalQuestions": 150
  },
  {
    "id": 2,
    "name": "Historia Universal",
    "slug": "historia-universal",
    "description": "Acontecimientos, civilizaciones y personajes históricos",
    "icon": "landmark",
    "totalQuestions": 120
  }
]
```

---

### 5.2 Listar Preguntas (Gestión Administrador)
- **Ruta**: `GET /api/v1/admin/questions?page=0&size=20&categoryId=1&difficulty=MEDIUM`
- **Seguridad**: Exclusivo `ROLE_ADMIN`.
- **Descripción**: Consulta paginada del banco de preguntas con datos completos (incluye `isCorrect`).

#### Response 200 OK:
```json
{
  "content": [
    {
      "id": 501,
      "text": "¿En qué año se descubrió la estructura del ADN por Watson y Crick?",
      "category": { "id": 1, "name": "Ciencia y Naturaleza" },
      "difficulty": "MEDIUM",
      "timeLimitSeconds": 15,
      "active": true,
      "options": [
        { "id": 2001, "text": "1945", "isCorrect": false },
        { "id": 2002, "text": "1953", "isCorrect": true },
        { "id": 2003, "text": "1962", "isCorrect": false },
        { "id": 2004, "text": "1971", "isCorrect": false }
      ],
      "createdAt": "2026-11-15T12:00:00Z"
    }
  ],
  "pageNumber": 0,
  "pageSize": 20,
  "totalElements": 270,
  "totalPages": 14,
  "last": false
}
```

---

### 5.3 Crear Pregunta (Administrador)
- **Ruta**: `POST /api/v1/admin/questions`
- **Seguridad**: Exclusivo `ROLE_ADMIN`.
- **Descripción**: Registra una nueva pregunta y sus opciones en PostgreSQL dentro de una transacción.

#### Request Body:
```json
{
  "text": "¿Cuál es el elemento químico más abundante en el universo?",
  "categoryId": 1,
  "difficulty": "EASY",
  "timeLimitSeconds": 15,
  "explanation": "El hidrógeno compone aproximadamente el 75% de la masa bariónica del universo.",
  "options": [
    { "text": "Hidrógeno", "isCorrect": true },
    { "text": "Helio", "isCorrect": false },
    { "text": "Oxígeno", "isCorrect": false },
    { "text": "Carbono", "isCorrect": false }
  ]
}
```

#### Response 201 Created:
```json
{
  "id": 503,
  "text": "¿Cuál es el elemento químico más abundante en el universo?",
  "categoryId": 1,
  "difficulty": "EASY",
  "timeLimitSeconds": 15,
  "active": true,
  "options": [
    { "id": 2009, "text": "Hidrógeno", "isCorrect": true },
    { "id": 2010, "text": "Helio", "isCorrect": false },
    { "id": 2011, "text": "Oxígeno", "isCorrect": false },
    { "id": 2012, "text": "Carbono", "isCorrect": false }
  ]
}
```

#### Errores Posibles:
- `400 Bad Request`: No se enviaron exactamente 4 opciones, o no existe exactamente una opción marcada con `isCorrect: true`.
- `403 Forbidden`: Usuario sin permisos administrativos.

---

### 5.4 Actualizar Pregunta (Administrador)
- **Ruta**: `PUT /api/v1/admin/questions/{id}`
- **Seguridad**: Exclusivo `ROLE_ADMIN`.

#### Request Body:
```json
{
  "text": "¿Cuál es el elemento más abundante en la corteza terrestre?",
  "categoryId": 1,
  "difficulty": "MEDIUM",
  "timeLimitSeconds": 15,
  "active": true,
  "options": [
    { "id": 2009, "text": "Oxígeno", "isCorrect": true },
    { "id": 2010, "text": "Silicio", "isCorrect": false },
    { "id": 2011, "text": "Aluminio", "isCorrect": false },
    { "id": 2012, "text": "Hierro", "isCorrect": false }
  ]
}
```

#### Response 200 OK:
```json
{
  "id": 503,
  "text": "¿Cuál es el elemento más abundante en la corteza terrestre?",
  "difficulty": "MEDIUM",
  "active": true
}
```

---

### 5.5 Eliminar Pregunta (Soft Delete)
- **Ruta**: `DELETE /api/v1/admin/questions/{id}`
- **Seguridad**: Exclusivo `ROLE_ADMIN`.
- **Descripción**: Realiza una baja lógica (`active = false`) para salvaguardar la consistencia histórica.

#### Response 204 No Content

---

## 6. Módulo de Tablas de Clasificación (`/api/v1/leaderboard`)

---

### 6.1 Ranking Global
- **Ruta**: `GET /api/v1/leaderboard/global?page=0&size=20`
- **Seguridad**: Autenticado (`ROLE_PLAYER` / `ROLE_ADMIN`).
- **Descripción**: Retorna la tabla de clasificación histórica paginada y la posición del usuario actual.

#### Response 200 OK:
```json
{
  "currentUserRank": {
    "rank": 14,
    "userId": 42,
    "username": "trivia_champion",
    "totalScore": 48250,
    "gamesPlayed": 45,
    "winRate": 78.5
  },
  "topPlayers": {
    "content": [
      {
        "rank": 1,
        "userId": 8,
        "username": "brain_master",
        "totalScore": 128400,
        "gamesPlayed": 110,
        "accuracyPercentage": 92.4,
        "badge": "DIAMOND"
      },
      {
        "rank": 2,
        "userId": 15,
        "username": "quizz_wizard",
        "totalScore": 115200,
        "gamesPlayed": 98,
        "accuracyPercentage": 89.1,
        "badge": "GOLD"
      }
    ],
    "pageNumber": 0,
    "pageSize": 20,
    "totalElements": 1520,
    "totalPages": 76
  }
}
```

---

### 6.2 Ranking Semanal
- **Ruta**: `GET /api/v1/leaderboard/weekly?page=0&size=20`
- **Seguridad**: Autenticado (`ROLE_PLAYER` / `ROLE_ADMIN`).
- **Descripción**: Muestra las puntuaciones acumuladas en la semana calendario ISO actual.

#### Response 200 OK:
```json
{
  "weekNumber": 47,
  "year": 2026,
  "startsAt": "2026-11-16T00:00:00Z",
  "endsAt": "2026-11-22T23:59:59Z",
  "currentUserRank": {
    "rank": 3,
    "userId": 42,
    "username": "trivia_champion",
    "score": 11450
  },
  "topPlayers": {
    "content": [
      {
        "rank": 1,
        "userId": 33,
        "username": "speedy_cortex",
        "score": 14800,
        "badge": "WEEKLY_LEADER"
      }
    ],
    "totalElements": 480
  }
}
```

---

### 6.3 Ranking por Categoría
- **Ruta**: `GET /api/v1/leaderboard/category/{categoryId}?page=0&size=20`
- **Seguridad**: Autenticado.
- **Descripción**: Clasificación específica para los especialistas de una temática particular.

#### Response 200 OK:
```json
{
  "categoryId": 1,
  "categoryName": "Ciencia y Naturaleza",
  "currentUserRank": {
    "rank": 2,
    "userId": 42,
    "username": "trivia_champion",
    "score": 8950
  },
  "topPlayers": {
    "content": [
      {
        "rank": 1,
        "userId": 99,
        "username": "einstein_fan",
        "score": 12400
      }
    ],
    "totalElements": 210
  }
}
```
