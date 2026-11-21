# 06. Prompts para Generar Video Motion Graphics en Claude
## Guion, Storyboard y Código para Video Animado Explicativo del Proyecto Trivia

Este documento contiene los prompts diseñados para que **Claude** (Claude 3.5 Sonnet / Opus) genere el código (en **Remotion / React** o **Manim / Python**) o el guion técnico detallado de **Motion Graphics** que explique el trabajo de Antigravity en cada fase.

---

## 🎨 Parámetros Estéticos Globales (Para Todos los Prompts)
- **Estilo Visual**: Tech / Cyber-clean / Arcade moderno ("Night Arena"). Fondo oscuro (`#0F172A`), acentos en Azul Neón (`#3B82F6`), Violeta Eléctrico (`#8B5CF6`), Esmeralda (`#10B981`) y Ámbar (`#F59E0B`).
- **Ritmo**: Dinámico, transiciones fluidas de cámara (zoom-in a código, pan a diagramas, partículas de sincronización), tipografía cinética (*Kinetic Typography*).
- **Formato**: 16:9 (1920x1080), 60 FPS o Vertical 9:16 para Reels/Shorts.

---

## 🎬 PROMPT 1: FASE 1 — Diseño, Cimientos y Blindaje Anti-Trampas

```text
Actúa como un Director de Arte y Programador Experto en Motion Graphics (Remotion / React / After Effects).

Quiero generar un video animado (duración: 45-60 segundos) que explique visualmente la "FASE 1: DISEÑO Y CIMIENTOS" de una aplicación web de Trivia construida por Google Antigravity mediante subagentes autónomos.

### HISTORIA Y NARRATIVA VISUAL QUE DEBES MOSTRAR:
1. [00:00 - 00:10] EL DESAFÍO: Un líder técnico escribe un prompt declarativo en Antigravity delimitando roles: "Ejecuta únicamente la Fase 1, no programes código todavía". En pantalla aparece el nodo central "Agente Coordinador".
2. [00:10 - 00:25] PARALELISMO EN ACCIÓN: El Coordinador se bifurca en dos ramas brillantes simultáneas:
   - Rama 1 (Izquierda): Subagente 'arquitecto-software' generando diagramas Mermaid y congelando contratos REST OpenAPI.
   - Rama 2 (Derecha): Subagente 'experto-ux-ui' creando el Design System (tokens Dark/Light, estados del botón de respuesta con microinteracciones y wireframes).
3. [00:25 - 00:40] EL BLINDAJE ANTI-TRAMPAS (MOMENTO WOW):
   - Primer plano a un DTO JSON. Un rayo láser rojo escanea y elimina el campo 'isCorrect' de las opciones que viajan al frontend.
   - Un candado se cierra en el servidor: la validación ocurrirá exclusivamente en el backend.
4. [00:40 - 00:55] SÍNTESIS EN BASE DE DATOS (ORDEN SECUENCIAL):
   - Una vez listos los contratos, entra en escena el subagente 'experto-db'.
   - Las ramas se fusionan y crean 'db/schema.sql' con un diagrama Entidad-Relación animado, índices parciales y vistas de ranking.
5. [00:55 - 01:00] RESULTADO: 7 documentos generados, 0 líneas de código espagueti, cimientos 100% blindados.

### ENTREGABLE QUE DEBES PROPORCIONAR:
1. Guion técnico escena por escena con: Tiempo (segundos), Descripción Visual (cámara, elementos gráficos, animaciones SVG/Lottie), Texto en Pantalla (Kinetic Typography) y Voz en Off (Audio script en español enérgico).
2. Código listo para ejecutar en Remotion (React + Tailwind + @remotion/animation) para renderizar esta escena en video MP4 full HD.
```

---

## 🎬 PROMPT 2: FASE 2 — La Implementación del MVP Fullstack

```text
Actúa como un Director de Animación Digital y Desarrollador de Motion Graphics (Remotion / Manim).

Genera un video motion graphics de alto impacto (duración: 50-60 segundos) que explique la "FASE 2: IMPLEMENTACIÓN DEL MVP FULLSTACK" de la aplicación Trivia construida con Google Antigravity.

### HISTORIA Y NARRATIVA VISUAL:
1. [00:00 - 00:10] EL PIPELINE POR DEPENDENCIAS:
   - Mostrar una línea de tiempo industrial/futurista. No se programa todo al azar; los agentes avanzan en cadena de valor lógica: DevOps + DB ➔ Backend ➔ Frontend.
2. [00:10 - 00:22] ETAPA 1 - INFRAESTRUCTURA & FLYWAY:
   - Los subagentes 'devops-seguridad' y 'experto-db' levantan un contenedor PostgreSQL 16 con Docker Compose.
   - Dos pergaminos digitales se despliegan: 'V1__init_schema.sql' y 'V2__seed_preguntas.sql' (30 preguntas reales y 6 categorías temáticas cargadas instantáneamente).
3. [00:22 - 00:38] ETAPA 2 - BACKEND SPRING BOOT 3 (JAVA 21):
   - Entra 'experto-backend'. Engranajes de Java 21 y Spring Security 6 se ensamblan a gran velocidad.
   - Animación de la fórmula matemática de puntaje flotando en el aire: Puntaje = (PuntajeBase + BonusVelocidad) × MultiplicadorRacha.
   - Terminal flotante: ejecuta './mvnw test-compile' ➔ Destello verde: BUILD SUCCESS (73 clases compiladas limpiamente).
4. [00:38 - 00:52] ETAPA 3 - FRONTEND ANGULAR 19 (SIGNALS):
   - Entra 'experto-frontend'. Se despliegan componentes Standalone y Signals reactivos.
   - Aparece la Sala de Juego (Game Arena): el temporizador visual cambia dinámicamente de verde a rojo pulsante, los botones de respuesta reaccionan a teclas '1-4', y la llama de racha se enciende.
   - Terminal: 'npm run build' ➔ 0 errores, bundle optimizado de 81 KB.
5. [00:52 - 01:00] CIERRE: Los tres mundos (DB + Spring + Angular) se conectan mediante un cable de fibra óptica que pulsa con tokens JWT. El MVP está vivo y compilando.

### ENTREGABLE:
- Storyboard técnico detallado (marcas de tiempo, transiciones, audio y locución en español).
- Componente interactivo en Remotion o especificación de animación con CSS/Canvas para renderizar el flujo.
```

---

## 🎬 PROMPT 3: FASE 3 — Calidad Rigurosa, DevSecOps y Despliegue en 1 Clic

```text
Actúa como un Diseñador de Motion Graphics y Storyteller Tecnológico Senior.

Genera un video animado (duración: 45-60 segundos) que ilustre la "FASE 3: CALIDAD, DEVSECOPS Y DESPLIEGUE EN 1 CLIC" del proyecto Trivia en Google Antigravity.

### HISTORIA Y NARRATIVA VISUAL:
1. [00:00 - 00:10] EL GUARDIÁN DE LA CALIDAD:
   - Entra el subagente 'experto-qa' con un escudo holográfico de verificación. El objetivo: probar cada milisegundo de lógica antes del despliegue.
2. [00:10 - 00:25] LA PIRÁMIDE DE PRUEBAS EN LLAMAS VERDES:
   - Una pirámide holográfica 3D se construye desde la base:
     * 22 pruebas unitarias de backend (JUnit 5 + Mockito).
     * 13 pruebas de integración MockMvc (un escáner confirma en tiempo real: "isCorrect NUNCA viaja al cliente").
     * 21 pruebas de componentes en Angular (Jasmine/Karma).
     * 2 pruebas E2E con Playwright simulando a un usuario real que juega las 10 preguntas y llega al Top 1 del Podio.
   - Contador en pantalla que sube a toda velocidad: 58 / 58 TESTS PASSED (100% VERDE).
3. [00:25 - 00:42] DESPLIEGUE MULTI-STAGE Y DEVSECOPS:
   - El subagente 'devops-seguridad' compacta las imágenes:
     * Backend: De 800MB a menos de 200MB con JRE Alpine no root.
     * Frontend: Bundle optimizado servido por Nginx con proxy inverso '/api/' y headers de seguridad.
   - Escáner de seguridad verde: 0 contraseñas en texto claro, BCrypt de costo 10 activo.
4. [00:42 - 00:55] EL COMANDO MÁGICO:
   - En una consola central aparece en letras gigantes neón:
     `docker compose up --build -d`
   - Los 3 contenedores (Postgres, Spring Boot API, Angular Web) se encienden como reactores.
5. [00:55 - 01:00] OUTRO / LLAMADO A LA ACCIÓN:
   - Pantalla dividida mostrando la app funcionando en http://localhost:4200.
   - Frase final en tipografía cinética: "De la idea al despliegue empresarial en 3 fases coordinadas por Inteligencia Artificial".

### ENTREGABLE:
- Desglose segundo a segundo (Storyboard) con diseño de sonido (SFX: whoosh, ticks de reloj, chime de acierto, arranque de motor).
- Código Remotion o Manim con animaciones vectoriales de la pirámide de tests y los contenedores.
```

---

## 🎬 PROMPT 4 (BONUS COMPLETO): Video Resumen Ejecutivo (El Pitch de 90 Segundos)

```text
Actúa como un Director Creativo de Videos Tecnológicos de Silicon Valley.

Escribe el guion y código de animación Motion Graphics para un video trailer/resumen de 90 segundos titulado:
"Cómo un escuadrón de agentes de Google Antigravity construyó una plataforma Fullstack desde cero".

Estructura requerida:
1. INTRO (15s): El problema de la IA tradicional (alucinaciones, código espagueti) vs el enfoque Agentic de Antigravity (roles, especialización, cero polling).
2. FASE 1 (25s): Arquitectura, contratos sin trampas y diseño de UI en paralelo.
3. FASE 2 (25s): Spring Boot 3 + Angular 19 + PostgreSQL sincronizados a la perfección.
4. FASE 3 (20s): 58 pruebas automatizadas en verde y despliegue Docker en 1 comando.
5. CIERRE (5s): Logotipo del proyecto Trivia y llamada a la acción para la charla técnica.

Incluye la locución completa en español neutro, efectos de sonido sugeridos (SFX) y estructura de componentes en Remotion (React).
```
