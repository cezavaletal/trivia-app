# Material de Exposición y Charla: Desarrollo de Software con Google Antigravity

Bienvenido a la carpeta `tuto/`. Este repositorio de documentación está diseñado como material de apoyo, bitácora técnica y guía de presentación para una charla o taller sobre **Google Antigravity** y el nuevo paradigma de **Ingeniería de Software Asistida por Agentes Autónomos (Agentic AI)**.

---

## 🎯 Objetivo de la Charla
Demostrar cómo un desarrollador o líder técnico puede dirigir a un **equipo coordinado de subagentes de IA especializados** (Arquitecto, Diseñador UX/UI, DBA, Backend, Frontend, QA, DevOps) para diseñar y construir desde cero una solución empresarial completa (en este caso, una aplicación web de Trivia con Angular, Spring Boot y PostgreSQL), manteniendo rigor arquitectónico, prevención de trampas y cero código espagueti.

---

## 📁 Estructura del Material

| Archivo | Descripción y Contenido | Audiencia / Uso |
| :--- | :--- | :--- |
| [01-que-es-antigravity-y-como-funciona.md](file:///d:/DEV/trivia/tuto/01-que-es-antigravity-y-como-funciona.md) | Fundamentos teóricos: Diferencia entre asistentes convencionales y Agentic AI, cómo opera el agente orquestador, subagentes especializados, llamadas a herramientas (*tool calling*) y el mecanismo de *Reactive Wakeup*. | Marco teórico de la presentación |
| [02-bitacora-fase1-prompts-y-ejecucion.md](file:///d:/DEV/trivia/tuto/02-bitacora-fase1-prompts-y-ejecucion.md) | Caso práctico paso a paso de la **FASE 1 (Diseño y Cimientos)**: Los prompts exactos ingresados, cómo Antigravity razonó, invocó subagentes en paralelo y secuencial, y los 7 entregables producidos. | Demo en vivo / Desglose técnico |
| [04-bitacora-fase2-implementacion-mvp.md](file:///d:/DEV/trivia/tuto/04-bitacora-fase2-implementacion-mvp.md) | Caso práctico de la **FASE 2 (Implementación del MVP)**: Pipeline por dependencias, Docker Compose, Flyway, Backend Spring Boot 3 y Frontend Angular 19. | Demo en vivo / Desglose de código |
| [05-bitacora-fase3-calidad-seguridad-despliegue.md](file:///d:/DEV/trivia/tuto/05-bitacora-fase3-calidad-seguridad-despliegue.md) | Caso práctico de la **FASE 3 (Calidad, DevSecOps y Despliegue)**: 58 tests automatizados en verde (JUnit, MockMvc, Jasmine, Playwright), Docker multi-stage y auditoría de seguridad. | Demo en vivo / Testing & DevOps |
| [06-prompts-motion-graphics-video.md](file:///d:/DEV/trivia/tuto/06-prompts-motion-graphics-video.md) | Prompts estructurados para **Claude** para generar videos motion graphics (en Remotion/React o storyboard cuadro a cuadro) explicando cada fase. | Contenido audiovisual para la charla |
| [03-guion-para-la-charla.md](file:///d:/DEV/trivia/tuto/03-guion-para-la-charla.md) | Guion para el ponente diapositiva por diapositiva (30-45 min), analogías efectivas, puntos clave de impacto, demostración práctica y respuestas a preguntas frecuentes del público. | Guía para el orador |
| [capturar-pantalla.bat](file:///d:/DEV/trivia/tuto/capturar-pantalla.bat) | Utilidad de un solo clic para capturar la ventana del IDE de Antigravity en Windows y guardarla automáticamente en `tuto/img/`. | Utilidad para ilustrar diapositivas |
| `img/` | Carpeta para almacenar capturas del IDE, diagramas visuales y capturas de pantalla para la presentación. | Recursos visuales |

---

## 🚀 Cómo Usar Este Material en Tu Exposición

1. **Antes de la charla**:
   - Revisa el archivo [03-guion-para-la-charla.md](file:///d:/DEV/trivia/tuto/03-guion-para-la-charla.md) para familiarizarte con los tiempos y puntos de énfasis.
   - Si deseas mostrar capturas reales de la interfaz del IDE de Antigravity, ejecuta `capturar-pantalla.bat` para generar capturas limpias en `tuto/img/`.
2. **Durante la charla**:
   - Apóyate en los diagramas Mermaid ya generados en `docs/arquitectura/diagramas.md` y `db/er-diagram.md`.
   - Muestra cómo los contratos de API y el esquema SQL se sincronizaron perfectamente entre agentes sin contradicciones.
3. **Continuidad del proyecto**:
   - A medida que avancemos con las siguientes fases (Fase 2: Backend Spring Boot, Fase 3: Frontend Angular, Fase 4: Testing & QA), se irán agregando los capítulos correspondientes en esta misma carpeta `tuto/`.
