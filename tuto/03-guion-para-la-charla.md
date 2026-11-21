# 03. Guion de Presentación para la Charla Técnica
## "Construyendo Software Empresarial con Google Antigravity & Agentic AI"

---

## ⏱️ Ficha Técnica de la Presentación
- **Duración sugerida**: 35 a 45 minutos (30 min exposición + 10-15 min Q&A).
- **Audiencia objetivo**: Desarrolladores de software, arquitectos, Tech Leads, DevOps y entusiastas de IA.
- **Nivel técnico**: Intermedio - Avanzado.
- **Requisitos de la sala**: Proyector para diapositivas y terminal/navegador para mostrar los archivos generados en Markdown y Mermaid.

---

## 📑 Estructura Minuto a Minuto

```
[00:00 - 05:00] Bloque 1: El Problema con la IA Tradicional en Desarrollo
[05:00 - 12:00] Bloque 2: ¿Qué es Google Antigravity? Arquitectura de Agentes
[12:00 - 25:00] Bloque 3: Demostración en Vivo - Caso de Estudio: Trivia Fullstack
[25:00 - 32:00] Bloque 4: Buenas Prácticas de Ingeniería Agentic
[32:00 - 45:00] Bloque 5: Preguntas y Respuestas (Q&A)
```

---

## 🎤 Desarrollo Diapositiva por Diapositiva

### Diapositiva 1: Portada
- **Título**: *Más Allá del Copilot: Orquestación de Equipos de Agentes con Google Antigravity*.
- **Subtítulo**: *Diseño y Construcción de una Aplicación Fullstack con Subagentes Especializados*.
- **Punto de Apertura**:
  > *"¿Cuántos de ustedes han usado ChatGPT o un Copilot para crear un proyecto y, después de 3 mensajes, el código se volvió inconsistente, los nombres de las variables cambiaron y la base de datos no coincidía con el backend? Hoy vamos a ver cómo la arquitectura de agentes autónomos de Google Antigravity resuelve este problema de raíz."*

---

### Diapositiva 2: La Brecha del Desarrollo con LLMs
- **Mensaje Clave**: Un modelo de lenguaje solo es un predictor de texto; un sistema de software requiere planificación, contratos y roles.
- **Conceptos a Explicar**:
  - El "Efecto Alucinación Cruzada": el frontend inventa un endpoint que el backend nunca creó.
  - El "Vómito de Código": 2.000 líneas generadas de golpe sin pruebas ni arquitectura.
  - La necesidad de **Fases de Desarrollo**: En el mundo real ningún equipo senior pica código sin contratos ni esquema de base de datos.

---

### Diapositiva 3: Arquitectura de Google Antigravity
- **Mensaje Clave**: Descomposición en Orquestador, Subagentes y Herramientas Desacopladas.
- **Mostrar el Diagrama Mermaid**:
  - Utilizar el diagrama presente en [01-que-es-antigravity-y-como-funciona.md](file:///d:/DEV/trivia/tuto/01-que-es-antigravity-y-como-funciona.md).
- **Puntos de Énfasis**:
  - **Dispatcher / Coordinador**: Actúa como el Tech Lead.
  - **Subagentes de Dominio Específico**: `arquitecto-software`, `experto-ux-ui`, `experto-db`.
  - **Reactive Wakeup**: Cero polling. El sistema es reactivo y asíncrono.
  - **Herramientas de bajo nivel**: Capacidad controlada de leer, editar, correr comandos y consultar documentación oficial.

---

### Diapositiva 4: Caso Práctico - La Trivia Fullstack
- **Mensaje Clave**: Stack tecnológico real y requerimientos estrictos.
  - **Frontend**: Angular (Standalone Components, Signals, Modo Oscuro/Claro).
  - **Backend**: Spring Boot 3 + Java 21 (API REST, JWT, Motor de Reglas).
  - **Base de Datos**: PostgreSQL 16 (Índices parciales, vistas agregadas).
  - **Reto Crítico de Negocio**: Prevención estricta de trampas en el navegador (ocultamiento de respuestas correctas).

---

### Diapositiva 5: El Prompt Maestro y el Paralelismo en Acción
- **Mensaje Clave**: Cómo instruir a Antigravity para lograr resultados de calidad enterprise.
- **Mostrar el Prompt Real** (ver [02-bitacora-fase1-prompts-y-ejecucion.md](file:///d:/DEV/trivia/tuto/02-bitacora-fase1-prompts-y-ejecucion.md)):
  - Señalar la cláusula: *"Ejecuta únicamente la FASE 1 (Diseño y Cimientos)"*.
  - Señalar la orden de paralelismo: *"En paralelo, pídele a experto-ux-ui..."*.
  - Señalar el orden secuencial condicionado: *"Una vez listos los documentos anteriores, pídele a experto-db..."*.
- **Impacto**:
  > *"Antigravity no improvisó. Lanzó al Arquitecto y al Diseñador simultáneamente. Esperó de forma reactiva a que ambos terminaran, y luego le entregó los contratos al DBA para que diseñara el SQL. Cero contradicciones entre las tres capas."*

---

### Diapositiva 6: Paseo por los Entregables de Arquitectura (Fase 1)
- **Archivos a Abrir y Mostrar en Vivo**:
  1. `docs/arquitectura/diagramas.md`: Mostrar el diagrama de secuencia Mermaid renderizado.
  2. `docs/arquitectura/contratos-api.md`: Resaltar la diferencia entre `AnswerOptionPublicDto` (sin `isCorrect`) y `AnswerOptionAdminDto`.
  3. `docs/ux-ui/design-system.md`: Mostrar la especificación de los 6 estados del botón de respuesta con accesibilidad WCAG.
  4. `db/schema.sql`: Mostrar el índice parcial único `idx_opciones_unica_correcta` y las vistas de ranking semanal y global.

---

### Diapositiva 7: La Implementación del MVP en Acción (Fase 2)
- **Mensaje Clave**: De los contratos al código de producción sin divergencias ni alucinaciones.
- **Demostración en Vivo**:
  1. **Levantar PostgreSQL con Docker Compose**:
     `docker compose up -d postgres` (explicar persistencia y Flyway aplicando V1 y V2).
  2. **Compilación y Tests del Backend Spring Boot 3**:
     `mvn test` dentro de `backend/` (mostrar 73 archivos compilados y fórmula matemática de puntaje validada).
  3. **Compilación y Build de Angular 19**:
     `npm run build` dentro de `frontend/` (mostrar bundle ligero de ~81 KB comprimido, 0 errores de TypeScript).
  4. **Navegación en Vivo**:
     Abrir `http://localhost:4200`, loguearse como `jugador1`, jugar una partida rápida respondiendo con teclado `1-4`, ver el temporizador en rojo pulsante y llegar a la pantalla de resultados y leaderboard.

---

### Diapositiva 8: Lecciones Aprendidas y Buenas Prácticas
- **Mensaje Clave**: Cómo convertirse en un ingeniero 10x utilizando Agentic AI.
  1. **Divide y Vencerás**: Define roles en archivos `.agents/` claros y concisos.
  2. **Contratos Primero**: Congele los contratos REST en Markdown antes de escribir código Java o TypeScript.
  3. **Aislamiento de Tareas y Dependencias Lógicas**: No le pidas al mismo subagente que haga UI y base de datos a la vez; organízalos en un pipeline.
  4. **Validación Continua**: Exigir a cada subagente que ejecute `mvn test-compile` o `npm run build` antes de dar por cerrada su tarea.
  5. **Persistencia y Trazabilidad**: Todo queda registrado en `transcript.jsonl` para auditoría y aprendizaje.

---

### Diapositiva 9: Calidad Rigurosa y Despliegue en 1 Comando (Fase 3)
- **Mensaje Clave**: La IA no solo genera código; también puede garantizar calidad y seguridad como un equipo de QA y DevSecOps.
- **Métricas de Impacto para la Audiencia**:
  - **58 pruebas automatizadas ejecutadas con 100% de éxito (0 fallos)**:
    - 22 pruebas unitarias de backend (fórmula matemática de puntuación y racha validada).
    - 13 pruebas de integración MockMvc (blindaje anti-trampas: verificación formal de que `isCorrect` no viaja al cliente).
    - 21 pruebas unitarias de frontend (temporizador, botón accesible y señales reactivas).
    - 2 pruebas E2E con Playwright en Chromium simulando el viaje completo del usuario.
  - **Contenedores Docker Multi-Stage**: Backend optimizado a <200MB y Frontend servido con Nginx y proxy inverso `/api/`.
  - **Auditoría DevSecOps**: Cero credenciales hardcodeadas, contraseñas con hash BCrypt (factor 10) y JWT obligatorio.
- **Comando Estrella para Cerrar la Charla**:
  ```bash
  docker compose up --build -d
  ```
  *(Toda la aplicación levanta y se conecta en cuestión de segundos).*

---

### Diapositiva 10: Conclusiones y Preguntas (Q&A)
- **Cierre**:
  > *"El futuro de la ingeniería de software no es pedirle a un chat que te escriba una función; es orquestar escuadrones de agentes autónomos con rigor arquitectónico, calidad continua y despliegue profesional."*

---

## ❓ Preguntas Frecuentes del Público (Q&A Cheat Sheet)

### P1: *"¿Por qué usar subagentes en lugar de una ventana de contexto enorme con un solo prompt?"*
**Respuesta**:
> *"La ventana de contexto grande ayuda a leer mucha información, pero mezclar directrices de SQL, TypeScript, CSS y reglas de negocio en un solo contexto genera fatiga en la atención del modelo (*attention drift*). Al aislar a cada subagente con un System Prompt estricto y su propio conjunto de herramientas, la precisión sube drásticamente y se eliminan las alucinaciones cruzadas."*

### P2: *"¿Cómo se sincronizan el Frontend y el Backend cuando comience la programación?"*
**Respuesta**:
> *"Gracias al archivo `docs/arquitectura/contratos-api.md` creado en la Fase 1. Tanto el subagente de Spring Boot como el de Angular reciben como restricción inamovible respetar los esquemas de ese archivo. No hay margen para que uno use `userId` y el otro `id_usuario`."*

### P3: *"¿Qué pasa si un subagente comete un error en un comando o sintaxis?"*
**Respuesta**:
> *"A diferencia de los chats pasivos, Antigravity tiene capacidades de ejecución. Si un comando o script falla, el agente recibe el stack trace del error de forma inmediata y aplica autocorrección en el siguiente turno antes de dar la tarea por completada."*

### P4: *"¿Antigravity consume muchos recursos esperando a los subagentes?"*
**Respuesta**:
> *"No, gracias al patrón 'Reactive Wakeup'. Cuando un subagente trabaja en segundo plano, el agente coordinador no ejecuta bucles de espera activa (`while(true)` o `sleep`). El proceso se suspende y sólo se despierta cuando entra un mensaje del subagente en el canal de eventos."*
