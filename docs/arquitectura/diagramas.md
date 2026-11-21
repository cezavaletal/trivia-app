# Diagramas de Arquitectura
## Sistema de Trivia Multijugador Individual (Angular + Spring Boot + PostgreSQL)

---

## 1. Diagrama de Casos de Uso

El siguiente diagrama modela las interacciones entre los actores del sistema y los casos de uso definidos para la plataforma.

```mermaid
flowchart LR
    %% Actores
    subgraph Actores["Actores del Sistema"]
        Player["fa:fa-user Jugador\n(ROLE_PLAYER)"]
        Admin["fa:fa-user-shield Administrador\n(ROLE_ADMIN)"]
    end

    %% Límite del Sistema
    subgraph SistemaTrivia["Límite del Sistema: Plataforma de Trivia"]
        direction TB

        subgraph ModuloAuth["Módulo de Autenticación"]
            CU01["CU-01: Registro e Inicio de Sesión (JWT)"]
        end

        subgraph ModuloJuego["Módulo de Partidas"]
            CU02["CU-02: Jugar Partida Rápida (Mix Aleatorio)"]
            CU03["CU-03: Jugar Partida por Categoría"]
            CU04["CU-04: Enviar Respuesta y Calcular Puntaje"]
            CU04_Val["<<include>>\nValidación Server-Side y Anticheat"]
        end

        subgraph ModuloRanking["Módulo de Clasificación"]
            CU05["CU-05: Ver Ranking Global y Semanal"]
        end

        subgraph ModuloAdmin["Módulo Administrativo"]
            CU06["CU-06: Gestionar Banco de Preguntas y Categorías"]
        end
    end

    %% Relaciones Jugador
    Player --> CU01
    Player --> CU02
    Player --> CU03
    Player --> CU04
    Player --> CU05

    %% Relaciones Administrador (Herencia conceptual)
    Admin --> CU01
    Admin --> CU05
    Admin --> CU06

    %% Relaciones internas de Casos de Uso
    CU04 -.->|include| CU04_Val
    CU02 -.->|include| CU04
    CU03 -.->|include| CU04
```

---

## 2. Diagrama de Secuencia: Flujo Completo de Partida

Este diagrama detalla la interacción paso a paso entre la SPA Angular, los filtros de seguridad, el controlador REST, el motor de juego en Spring Boot y PostgreSQL. Se ilustra la entrega de preguntas **sanitizadas** (sin opciones correctas), el envío de respuestas con validación temporal estricta y el cálculo de puntaje server-side.

```mermaid
sequenceDiagram
    autonumber
    actor Player as Jugador (Browser)
    participant UI as Angular SPA (Frontend)
    participant Interceptor as JwtInterceptor
    participant AuthFilter as Spring Security (JwtFilter)
    participant GameCtrl as GameController (REST)
    participant GameEngine as GameEngineService
    participant Repo as Spring Data JPA Repositories
    participant DB as PostgreSQL 16

    Note over Player, DB: Fase 1: Creación de Partida y Sanitización
    Player->>UI: Clic en "Partida Rápida"
    UI->>Interceptor: POST /api/v1/games { mode: "QUICK_PLAY" }
    Interceptor->>AuthFilter: Inyecta cabecera Authorization: Bearer <JWT>
    AuthFilter->>AuthFilter: Valida firma JWT y carga UserDetails
    AuthFilter->>GameCtrl: Petición autenticada (userId = 42)
    GameCtrl->>GameEngine: createGame(userId: 42, mode: QUICK_PLAY)
    GameEngine->>Repo: findRandomQuestions(limit: 10, active: true)
    Repo->>DB: SELECT * FROM questions WHERE active=true ORDER BY RANDOM() LIMIT 10
    DB-->>Repo: 10 preguntas con sus opciones (incluye is_correct)
    Repo-->>GameEngine: List<QuestionEntity>
    GameEngine->>GameEngine: Crea GameEntity (status = IN_PROGRESS, score = 0, streak = 0)
    GameEngine->>Repo: save(gameEntity)
    Repo->>DB: INSERT INTO games (...)
    DB-->>Repo: Saved Game
    GameEngine->>GameEngine: Sanitiza DTO: Elimina atributo "isCorrect" de cada opción
    GameEngine-->>GameCtrl: GameResponseDto (Preguntas sanitizadas)
    GameCtrl-->>UI: HTTP 201 Created (ID partida, preguntas sin respuestas)
    UI-->>Player: Renderiza pregunta 1 y activa temporizador (15s)

    Note over Player, DB: Fase 2: Envío de Respuesta y Evaluación Server-Side
    Player->>UI: Selecciona Opción 3 (a los 4.2 segundos)
    UI->>Interceptor: POST /api/v1/games/101/answers\n{ questionId: 5, selectedOptionId: 19, clientDurationMs: 4200 }
    Interceptor->>AuthFilter: Adjunta JWT
    AuthFilter->>GameCtrl: Request verificado
    GameCtrl->>GameEngine: submitAnswer(gameId: 101, userId: 42, answerDto)
    
    critical Verificación de Integridad y Anticheat
        GameEngine->>GameEngine: Verifica que Game(101).userId == 42
        GameEngine->>GameEngine: Verifica estado IN_PROGRESS
        GameEngine->>Repo: findAnswerByGameAndQuestion(101, 5)
        Repo-->>GameEngine: Optional.empty (No ha sido respondida previamente)
        GameEngine->>GameEngine: Valida tiempo: deltaServer <= (timeLimit + 1500ms grace)
    end

    GameEngine->>Repo: findOptionById(19)
    Repo->>DB: SELECT * FROM answer_options WHERE id = 19
    DB-->>Repo: OptionEntity (is_correct = true)
    
    Note over GameEngine: Cálculo de Puntaje Server-Side
    GameEngine->>GameEngine: Opción CORRECTA detectada
    GameEngine->>GameEngine: Base = 200 pts (Dificultad Media)
    GameEngine->>GameEngine: Bonus Vel = floor(200 * (10.8s / 15s) * 0.5) = 72 pts
    GameEngine->>GameEngine: Streak = streak + 1 = 3 (Multiplicador = 1.4x)
    GameEngine->>GameEngine: PointsAwarded = floor((200 + 72) * 1.4) = 380 pts
    GameEngine->>GameEngine: TotalScore = TotalScore + 380
    
    GameEngine->>Repo: save(gameAnswerEntity) & save(gameEntity)
    Repo->>DB: INSERT INTO game_answers (...) & UPDATE games SET score=..., streak=...
    DB-->>Repo: OK
    
    GameEngine-->>GameCtrl: AnswerResultDto (isCorrect: true, awarded: 380, correctOptionId: 19)
    GameCtrl-->>UI: HTTP 200 OK con feedback y opción correcta revelada
    UI-->>Player: Muestra opción en verde, +380 pts y racha x1.4

    Note over Player, DB: Fase 3: Cierre de Partida y Actualización de Ranking
    Player->>UI: Responde pregunta final (10/10)
    UI->>Interceptor: POST /api/v1/games/101/finish
    Interceptor->>AuthFilter: Adjunta JWT
    AuthFilter->>GameCtrl: Cierre de juego
    GameCtrl->>GameEngine: finishGame(gameId: 101, userId: 42)
    GameEngine->>GameEngine: Transiciona estado a COMPLETED
    GameEngine->>Repo: updateGameStatus(101, COMPLETED)
    Repo->>DB: UPDATE games SET status='COMPLETED', finished_at=NOW()
    GameEngine->>Repo: updateLeaderboards(userId, totalScore)
    Repo->>DB: INSERT INTO leaderboard_entries ... ON CONFLICT DO UPDATE
    DB-->>Repo: OK
    GameEngine-->>GameCtrl: GameSummaryDto (Score Final, Aciertos, Racha Máxima, Posición)
    GameCtrl-->>UI: HTTP 200 OK
    UI-->>Player: Despliega pantalla de resumen, trofeos y ranking alcanzado
```

---

## 3. Diagrama de Componentes (Arquitectura en Capas)

El siguiente diagrama ilustra la arquitectura de software por capas y la separación de responsabilidades entre el cliente Angular, el backend Spring Boot y la base de datos PostgreSQL.

```mermaid
flowchart TD
    %% Capa Frontend
    subgraph Frontend["Capa Frontend: Angular 17+ (SPA)"]
        direction TB

        subgraph UI_Views["Componentes / Vistas (Standalone Components)"]
            AuthView["AuthComponent\n(Login / Registro)"]
            DashView["DashboardComponent\n(Menú / Perfil)"]
            GameView["GamePlayComponent\n(Trivia, Timer, Opciones)"]
            RankView["LeaderboardComponent\n(Global, Semanal)"]
            AdminView["AdminQuestionComponent\n(Gestor Preguntas CRUD)"]
        end

        subgraph Angular_Guards["Guards de Enrutamiento"]
            AuthGuard["AuthGuard\n(Protección de rutas)"]
            RoleGuard["AdminRoleGuard\n(Exclusivo ROLE_ADMIN)"]
        end

        subgraph Angular_Services["Capa de Servicios"]
            AuthSvc["AuthService\n(Login, Session, Tokens)"]
            GameSvc["GameService\n(Start, Answer, Finish)"]
            RankSvc["LeaderboardService\n(Get rankings)"]
            AdminSvc["QuestionAdminService\n(CRUD Preguntas)"]
        end

        subgraph Angular_Interceptors["Interceptores HTTP"]
            JwtInterceptor["JwtInterceptor\n(Inyección Bearer Token)"]
            ErrInterceptor["ErrorInterceptor\n(Gestión 401, 403, 500)"]
        end

        UI_Views --> Angular_Guards
        UI_Views --> Angular_Services
        Angular_Services --> JwtInterceptor
        JwtInterceptor --> ErrInterceptor
    end

    %% Capa Backend Spring Boot
    subgraph Backend["Capa Backend: Spring Boot 3 / Java 21"]
        direction TB

        subgraph SecLayer["Capa de Seguridad (Spring Security 6)"]
            SecConfig["SecurityFilterChain"]
            JwtFilter["JwtAuthenticationFilter"]
            TokenProv["JwtTokenProvider\n(Claims, HMAC-SHA256)"]
            SecConfig --> JwtFilter
            JwtFilter --> TokenProv
        end

        subgraph CtrlLayer["Controladores REST (@RestController)"]
            AuthCtrl["AuthController\n(/api/v1/auth)"]
            GameCtrl["GameController\n(/api/v1/games)"]
            CatCtrl["CategoryController\n(/api/v1/categories)"]
            RankCtrl["LeaderboardController\n(/api/v1/leaderboard)"]
            AdmQCtrl["AdminQuestionController\n(/api/v1/admin/questions)"]
        end

        subgraph SvcLayer["Capa de Negocio (@Service)"]
            AuthSvcB["AuthServiceImpl"]
            GameEngineSvc["GameEngineServiceImpl\n(Anti-cheat, Scoring, Streaks)"]
            RankSvcB["LeaderboardServiceImpl"]
            QuestSvcB["QuestionServiceImpl"]
        end

        subgraph DtoMapperLayer["Modelos, DTOs y Mappers"]
            GameDtoSanitized["QuestionResponseDto\n(Sin isCorrect)"]
            GameDtoAdmin["QuestionAdminDto\n(Con isCorrect)"]
        end

        subgraph RepoLayer["Capa de Persistencia (Spring Data JPA)"]
            UserRepo["UserRepository"]
            GameRepo["GameRepository"]
            GameAnsRepo["GameAnswerRepository"]
            QuestRepo["QuestionRepository"]
            OptRepo["AnswerOptionRepository"]
            RankRepo["LeaderboardRepository"]
        end

        SecFilterHook["Filtro HTTP"] --> CtrlLayer
        CtrlLayer --> SvcLayer
        SvcLayer --> DtoMapperLayer
        SvcLayer --> RepoLayer
    end

    %% Capa Base de Datos
    subgraph Database["Capa de Persistencia: PostgreSQL 16"]
        direction TB
        T_Users[("users & roles")]
        T_Games[("games")]
        T_Answers[("game_answers")]
        T_Questions[("questions")]
        T_Options[("answer_options")]
        T_Categories[("categories")]
        T_Leaderboard[("leaderboard_snapshots")]
    end

    %% Conexiones entre Frontend y Backend
    ErrInterceptor -->|HTTPS REST / JSON| SecFilterHook
    JwtFilter --> CtrlLayer

    %% Conexiones Repositorios a BD
    UserRepo --> T_Users
    GameRepo --> T_Games
    GameAnsRepo --> T_Answers
    QuestRepo --> T_Questions
    OptRepo --> T_Options
    QuestRepo --> T_Categories
    RankRepo --> T_Leaderboard
```

---

## 4. Diagrama de Despliegue (Infraestructura de Contenedores Docker)

El siguiente diagrama describe la topología de contenedores desplegada mediante Docker Compose, aislamiento de redes, volúmenes de almacenamiento persistente y exposición de puertos.

```mermaid
flowchart TD
    %% Cliente Externo
    subgraph Cliente["Cliente / Internet"]
        UserBrowser["Navegador Web del Usuario\n(Chrome / Firefox / Safari)"]
    end

    %% Host Docker
    subgraph Host["Servidor de Producción / Host Docker"]
        
        subgraph Ports["Puertos Expuestos al Host"]
            Port80["Puerto 80: HTTP (Redirección)"]
            Port443["Puerto 443: HTTPS (TLS/SSL)"]
        end

        %% Red Interna de Docker
        subgraph DockerBridge["Red Interna Docker (trivia-bridge-net / bridge)"]
            
            subgraph C_Frontend["Contenedor: trivia-frontend"]
                NginxServer["Servidor Web Nginx Alpine\n- Archivos estáticos SPA Angular compilada\n- Reverse Proxy para /api/v1 hacia backend\n- Compresión Gzip y headers de seguridad"]
            end

            subgraph C_Backend["Contenedor: trivia-backend"]
                AppSpring["JVM Container (Eclipse Temurin JDK 21 Alpine)\n- Spring Boot 3 Executable JAR\n- Puerto interno: 8080\n- Pool HikariCP (Max 20 conexiones)\n- JVM Flags: -Xms512m -Xmx1024m"]
            end

            subgraph C_Database["Contenedor: trivia-postgres"]
                PostgreServer["PostgreSQL 16 Alpine\n- Puerto interno: 5432 (Sin exponer a internet)\n- Charset: UTF-8\n- Timezone: UTC"]
            end
        end

        %% Almacenamiento Persistente
        subgraph Storage["Almacenamiento Persistente"]
            VolPgData[("Docker Volume:\npostgres_data\n(/var/lib/postgresql/data)")]
            VolNginxCerts[("Host Mount:\n/etc/letsencrypt\n(Certificados SSL)")]
        end
    end

    %% Flujos de Red y Puertos
    UserBrowser -->|HTTPS :443| Port443
    Port443 --> NginxServer
    Port80 -.->|301 Redirect| Port443

    VolNginxCerts -.->|Montado en| NginxServer

    NginxServer -->|Proxy Pass /api/v1\nhttp://trivia-backend:8080| AppSpring
    NginxServer -->|Sirve /index.html y bundles| UserBrowser

    AppSpring -->|JDBC postgresql://trivia-postgres:5432/triviadb| PostgreServer

    PostgreServer -->|Persiste datos| VolPgData
```
