# 02. Bitácora de la Fase 1: Prompts, Razonamiento y Ejecución
## Caso Práctico: Diseño y Cimientos de la Trivia Web App

---

## 1. El Prompt del Usuario (Entrada Real)

A continuación se transcribe textualmente el prompt que inició la Fase 1:

```text
Vamos a construir desde cero una aplicación web de preguntas de elección multiple de conocimiento global (tipo Trivia) con sistema de ranking global y por categorías.
Stack tecnológico: Angular (frontend), Spring Boot (backend API REST) y PostgreSQL (base de datos).

Ejecuta únicamente la FASE 1 (Diseño y Cimientos) coordinando a los siguientes subagentes:

1. Pídele a arquitecto-software que cree en docs/arquitectura/:
   - requerimientos-y-casos-uso.md: Actores (Jugador, Administrador), reglas de negocio (puntuación por velocidad/racha, límite de tiempo por pregunta, prevención de trampas enviando respuestas sin la opción correcta al frontend) y casos de uso principales (Registro/Login, Jugar partida rápida/por categoría, Calcular puntaje, Ver Ranking Global/Semanal, Gestionar banco de preguntas).
   - diagramas.md: Diagramas en Mermaid de Casos de Uso, Diagrama de Secuencia del flujo de una partida (desde pedir preguntas hasta registrar el puntaje), Diagrama de Componentes y Diagrama de Despliegue.
   - contratos-api.md: Especificación de endpoints REST (rutas, métodos HTTP, request/response JSON y códigos de error) para Auth, Partidas, Preguntas y Ranking.

2. En paralelo, pídele a experto-ux-ui que cree en docs/ux-ui/:
   - design-system.md: Paleta de colores con alto contraste (modo oscuro/claro para juego), tipografía, tokens de espaciado y estados de botones de respuesta (normal, seleccionada, correcta, incorrecta, tiempo agotado).
   - flujos-y-componentes.md: Wireframes estructurales y lista de componentes Angular para: Pantalla de Inicio/Categorías, Sala de Juego (con temporizador visual y barra de progreso), Pantalla de Resultados y Tabla de Ranking (Leaderboard).

3. Una vez listos los documentos anteriores, pídele a experto-db que cree en db/:
   - schema.sql y el diagrama Entidad-Relación en Mermaid con las tablas: usuarios, categorias, preguntas, opciones_respuesta, partidas, respuestas_usuario y una vista o consulta optimizada con índices para el ranking.

No escribas código en backend/ ni en frontend/ todavía. Avísame cuando la documentación y el esquema SQL estén listos para revisarlos.
```

---

## 2. ¿Por Qué Este Prompt Fue Extraordinariamente Efectivo?

Al dar una charla, resalta las siguientes 5 técnicas de **Prompt Engineering para Agentes**:

1. **Delimitación de Alcance Estricta**: *"Ejecuta únicamente la FASE 1"* y *"No escribas código en backend/ ni en frontend/ todavía"*. Esto evitó que el agente intentara generar 50 archivos de código a medias antes de tener clara la arquitectura.
2. **Definición de Roles y Responsabilidades**: En lugar de pedirle a un solo agente generalista que hiciera todo, asignó tareas por especialidad (`arquitecto-software`, `experto-ux-ui`, `experto-db`).
3. **Instrucción Explícita de Paralelismo**: *"En paralelo, pídele a experto-ux-ui..."*. Permitió al agente Coordinador disparar dos hilos de trabajo independientes simultáneamente.
4. **Control de Dependencias**: *"Una vez listos los documentos anteriores, pídele a experto-db..."*. El diseño de base de datos requería conocer previamente los tipos de datos y atributos acordados en los contratos de API y las reglas de negocio.
5. **Criterio de Aceptación Claro**: *"Avísame cuando la documentación y el esquema SQL estén listos para revisarlos"*.

---

## 3. La Orquestación Interna en Antigravity

### Paso A: Detección de Configuración y Creación de Subagentes
El Coordinador revisó la carpeta `.agents/` del proyecto donde ya existían definiciones base:
- `01-arquitecto.md`
- `02-ux-ui.md`
- `03-db-postgres.md`

Utilizando la herramienta nativa `define_subagent`, el Coordinador registró en la sesión:
1. `arquitecto-software` (herramientas de escritura, alcance exclusivo en `docs/arquitectura/`).
2. `experto-ux-ui` (herramientas de escritura, alcance exclusivo en `docs/ux-ui/`).

### Paso B: Despacho Paralelo (Forking de Tareas)
En un único turno de ejecución, el Coordinador ejecutó:
- `invoke_subagent` $\rightarrow$ `arquitecto-software` (Tarea: Generar los 3 documentos de arquitectura).
- `invoke_subagent` $\rightarrow$ `experto-ux-ui` (Tarea: Generar Design System y Wireframes/Componentes).

Ambos subagentes comenzaron su trabajo en paralelo en el sistema, mientras el Coordinador entró en estado de reposo esperando sus notificaciones de finalización (*Reactive Wakeup*).

```
   [Coordinador Antigravity]
            │
            ├──────────────────────────────────────────┐
            ▼                                          ▼
   [arquitecto-software]                       [experto-ux-ui]
   • requerimientos-y-casos-uso.md             • design-system.md
   • diagramas.md                              • flujos-y-componentes.md
   • contratos-api.md                                  │
            │                                          │
            └────────────────────┬─────────────────────┘
                                 ▼
                     [Notificaciones de éxito]
                                 │
                                 ▼
                   [Invocación de experto-db]
                   • db/schema.sql
                   • db/er-diagram.md
                                 │
                                 ▼
                    [Informe Final al Usuario]
```

### Paso C: Recepción Asíncrona y Despacho de la Tercera Tarea
1. `experto-ux-ui` completó sus 2 documentos y envió su mensaje de notificación.
2. Minutos después, `arquitecto-software` completó sus 3 documentos y diagramas Mermaid.
3. Con los contratos congelados y validados, el Coordinador definió e invocó a `experto-db`.
4. `experto-db` leyó `docs/arquitectura/contratos-api.md` y `docs/arquitectura/requerimientos-y-casos-uso.md`, garantizando que:
   - Los nombres de tablas y columnas en SQL coincidieran con los DTOs de la API.
   - La regla anti-trampa se protegiera no sólo a nivel backend, sino también a nivel de motor de base de datos con un índice parcial único (`idx_opciones_unica_correcta`).
   - Se incluyera una vista de ranking optimizada acorde con la fórmula de puntuación acordada.

---

## 4. Matriz de Entregables de la Fase 1

| Archivo Generado | Tamaño | Responsable | Aporte Crítico al Proyecto |
| :--- | :---: | :---: | :--- |
| [requerimientos-y-casos-uso.md](file:///d:/DEV/trivia/docs/arquitectura/requerimientos-y-casos-uso.md) | ~17 KB | `arquitecto-software` | Especificación de reglas de puntaje ($P_{base} + B_{vel} \times M_{racha}$), tolerancia de red (1.5s) y anti-cheat. |
| [diagramas.md](file:///d:/DEV/trivia/docs/arquitectura/diagramas.md) | ~13 KB | `arquitecto-software` | 4 diagramas Mermaid interactivos (Casos de Uso, Secuencia, Componentes y Despliegue Docker). |
| [contratos-api.md](file:///d:/DEV/trivia/docs/arquitectura/contratos-api.md) | ~18 KB | `arquitecto-software` | Fuente de la verdad OpenAPI para Angular y Spring Boot. Oculta `isCorrect` en modo juego. |
| [design-system.md](file:///d:/DEV/trivia/docs/ux-ui/design-system.md) | ~14 KB | `experto-ux-ui` | Tokens de alto contraste (Dark/Light), 6 estados de respuesta, WCAG 2.1 AA/AAA. |
| [flujos-y-componentes.md](file:///d:/DEV/trivia/docs/ux-ui/flujos-y-componentes.md) | ~23 KB | `experto-ux-ui` | Wireframes ASCII detallados de las 4 pantallas y catálogo de 10 componentes Angular reutilizables. |
| [schema.sql](file:///d:/DEV/trivia/db/schema.sql) | ~36 KB | `experto-db` | DDL PostgreSQL 16 con enums, FKs, vistas de ranking, triggers, índices B-Tree y 24 preguntas semilla. |
| [er-diagram.md](file:///d:/DEV/trivia/db/er-diagram.md) | ~16 KB | `experto-db` | Diagrama ER en Mermaid con cardinalidades y diccionario exhaustivo de datos. |

---

## 5. El Blindaje Anti-Trampas: Ejemplo de Coherencia Multi-Agente

Para demostrar en la charla cómo los agentes colaboran para resolver un problema de seguridad complejo:

1. **El Arquitecto** definió en los contratos que el endpoint de juego `GET /api/v1/games/{id}` entrega un DTO público sin el atributo `isCorrect`.
2. **El Diseñador UX** diseñó la interfaz de juego asumiendo que el botón sólo conoce el estado de la respuesta *después* de que el usuario hace clic y el servidor responde.
3. **El DBA** implementó en `db/schema.sql`:
   - El flag `es_correcta` en `opciones_respuesta`.
   - El índice parcial:
     ```sql
     CREATE UNIQUE INDEX idx_opciones_unica_correcta 
     ON opciones_respuesta(pregunta_id) 
     WHERE es_correcta = TRUE;
     ```
   - La restricción de unicidad:
     ```sql
     CONSTRAINT uq_partida_pregunta UNIQUE (partida_id, pregunta_id)
     ```
     que impide que un usuario envíe dos respuestas a la misma pregunta en la misma partida.

> **Conclusión para la charla**: Esta coherencia transversal entre capas es prácticamente imposible de lograr con prompts tradicionales de una sola pasada.
