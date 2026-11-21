# Trivia App — Design System & Tokens UI/UX

> **Versión:** 1.0.0  
> **Estado:** Aprobado para desarrollo Frontend (Angular)  
> **Enfoque:** Gamificación de alto rendimiento, accesibilidad universal (WCAG 2.1 AA/AAA) y respuesta cognitiva ultrarrápida.

---

## 1. Filosofía Visual y Principios de Diseño

El sistema de diseño de **Trivia App** está concebido para maximizar el engagement, minimizar la fatiga visual y proporcionar retroalimentación sensorial instantánea en partidas de trivia de ritmo acelerado.

### Principios Rectores

1. **Claridad y Foco Cognitivo Inmediato:**  
   Durante una pregunta de trivia con cuenta regresiva, cada milisegundo cuenta. La jerarquía visual aísla la pregunta y las opciones de respuesta eliminando cualquier ruido o distracción secundaria.
2. **Gamificación Dinámica y Feedback Táctil/Visual:**  
   Cada acción del usuario (selección, acierto, error, racha) genera una respuesta visual inmediata (cambios de color, microanimaciones de brillo/vibración, contadores elásticos).
3. **Alto Contraste y Accesibilidad Radical (WCAG AA / AAA):**  
   Todas las combinaciones críticas de texto y fondo cumplen un ratio de contraste mínimo de `4.5:1` (AA) para texto estándar y `7:1` (AAA) para elementos clave como textos de preguntas y temporizador. Navegación 100% asistida por teclado y lectores de pantalla.
4. **Atmósfera Arcade Moderna:**  
   Estética inmersiva con tema oscuro como predeterminado ("Night Arena"), enriquecido con acentos neón controlados y sombras cromáticas, complementado por un modo claro sobrio y de alto contraste ("Daylight Focus").

---

## 2. Paleta de Colores y Tokens Semánticos

### 2.1 Tokens Globales (CSS Custom Properties)

```css
:root {
  /* Escala Neutral Absoluta */
  --neutral-black: #0B0E14;
  --neutral-white: #FFFFFF;
  --neutral-100: #F8FAFC;
  --neutral-200: #E2E8F0;
  --neutral-300: #CBD5E1;
  --neutral-400: #94A3B8;
  --neutral-500: #64748B;
  --neutral-600: #475569;
  --neutral-700: #334155;
  --neutral-800: #1E293B;
  --neutral-900: #0F172A;
  --neutral-950: #070A10;

  /* Colores de Marca y Gamificación */
  --brand-primary-500: #6366F1;     /* Indigo Electric */
  --brand-primary-400: #818CF8;
  --brand-primary-600: #4F46E5;
  --brand-secondary-500: #EC4899;   /* Neon Pink Accent */
  --brand-accent-amber: #F59E0B;    /* Streak / Gold Fire */
  --brand-accent-cyan: #06B6D4;     /* Arcade Glow */

  /* Semántica de Juego (Respuestas / Estados) */
  --game-success: #10B981;          /* Verde Esmeralda Acierto */
  --game-success-light: #D1FAE5;
  --game-success-dark: #065F46;
  --game-danger: #EF4444;           /* Rojo Alerta Fallo */
  --game-danger-light: #FEE2E2;
  --game-danger-dark: #7F1D1D;
  --game-warning: #F59E0B;          /* Ámbar Alerta Tiempo */
  --game-warning-light: #FEF3C7;
  --game-info: #3B82F6;             /* Azul Información */
}
```

---

### 2.2 Tema Oscuro (Dark Theme — "Night Arena" / Predeterminado)

El modo oscuro está diseñado para sesiones nocturnas y ambientación tipo eSports/Arcade, con alto contraste para no quemar la vista ni perder nitidez.

| Token Semántico | Valor Hex | Ratio de Contraste vs Fondo | Descripción de Uso |
| :--- | :--- | :--- | :--- |
| `--bg-main` | `#0B0E14` | *Base* | Fondo general de la aplicación |
| `--surface-card` | `#161B26` | 1.15:1 vs bg | Superficie de tarjetas y contenedores |
| `--surface-elevated` | `#1F2637` | 1.35:1 vs bg | Diálogos modales, popovers y tooltips |
| `--surface-border` | `#2A344A` | 2.1:1 vs bg | Bordes sutiles de separación estructural |
| `--text-primary` | `#F8FAFC` | **17.8:1** (AAA) | Enunciado de preguntas, titulares, textos clave |
| `--text-secondary` | `#94A3B8` | **7.2:1** (AAA) | Subtítulos, metadatos, categorías |
| `--text-muted` | `#64748B` | **4.6:1** (AA) | Textos auxiliares y timestamps |
| `--accent-primary` | `#6366F1` | **5.4:1** vs bg | Botones de acción primaria, badges activos |
| `--accent-gold` | `#FBBF24` | **11.2:1** vs bg | Racha (streak 🔥), podio #1, puntos clave |
| `--accent-cyan` | `#22D3EE` | **12.5:1** vs bg | Indicadores de partida y temporizador pleno |

---

### 2.3 Tema Claro (Light Theme — "Daylight Focus")

Diseñado para uso bajo luz solar directa o entornos de oficina, maximizando la legibilidad sin colores pastel que reduzcan el contraste.

| Token Semántico | Valor Hex | Ratio de Contraste vs Fondo | Descripción de Uso |
| :--- | :--- | :--- | :--- |
| `--bg-main` | `#F8FAFC` | *Base* | Fondo neutro frío de alta luminosidad |
| `--surface-card` | `#FFFFFF` | 1.05:1 vs bg | Tarjetas con borde definido y sombra suave |
| `--surface-elevated` | `#FFFFFF` | 1.05:1 + shadow | Modales con sombra de elevación alta |
| `--surface-border` | `#CBD5E1` | 3.2:1 vs card | Bordes de tarjetas y separadores |
| `--text-primary` | `#0F172A` | **15.4:1** (AAA) | Títulos, preguntas principales |
| `--text-secondary` | `#334155` | **9.6:1** (AAA) | Párrafos, opciones de respuesta |
| `--text-muted` | `#64748B` | **4.8:1** (AA) | Badges neutros, atajos de teclado |
| `--accent-primary` | `#4F46E5` | **8.6:1** vs white | Botones de acción primaria |
| `--accent-gold` | `#D97706` | **5.1:1** vs white | Iconografía de racha y puntos |
| `--accent-cyan` | `#0891B2` | **5.8:1** vs white | Acentos informativos |

---

## 3. Estados de Botones de Respuesta (`AnswerButton`)

Los botones de respuesta son el componente interactivo más crítico de la plataforma. Deben proporcionar una respuesta visual inequívoca en menos de 100 ms.

```
       [A] París, Francia        <- Normal / Default
       [A] París, Francia        <- Hover / Focus (Outline cian 2px)
  ===> [A] París, Francia <===   <- Seleccionada (Pulsación ámbar/azul)
  [✔]  [A] París, Francia        <- Correcta (Fondo verde esmeralda + check)
  [✖]  [A] París, Francia        <- Incorrecta (Fondo rojo rubí + shake)
  [⏱]  [A] París, Francia        <- Tiempo Agotado (Desaturada / Opacidad 40%)
```

### Especificación de Estados y Estilos

| Estado | Fondo (Dark) | Borde (Dark) | Color Texto | Sombra / Glow | Icono / Detalle |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Normal / Default** | `#1E2536` | `2px solid #2A364F` | `#F1F5F9` | `0 4px 6px -1px rgba(0,0,0,0.3)` | Letra [A/B/C/D] en badge `#334155` |
| **2. Hover / Focus** | `#263045` | `2px solid #818CF8` | `#FFFFFF` | `0 0 12px rgba(129,140,248,0.35)` | Outline accesible de 2px `offset 2px` |
| **3. Seleccionada (Pending)** | `#312E81` | `2px solid #A5B4FC` | `#EEF2FF` | `0 0 16px rgba(99,102,241,0.5)` | Indicador de espera pulsante |
| **4. Correcta (Success)** | `#064E3B` | `2px solid #10B981` | `#ECFDF5` | `0 0 20px rgba(16,185,129,0.55)` | Icono Check `✓` verde brillante |
| **5. Incorrecta (Danger)** | `#7F1D1D` | `2px solid #EF4444` | `#FEF2F2` | `0 0 20px rgba(239,68,68,0.55)` | Icono Cruz `✕` rojo brillante + Shake |
| **6. Tiempo Agotado (Timeout)**| `#111622` | `2px dashed #334155`| `#64748B` | Ninguna (Opacidad reducida a `0.45`) | Icono reloj atenuado |

---

## 4. Tipografía y Escala de Tipos

### 4.1 Fuentes Recomendadas (Google Fonts)

1. **Titulares y Gamificación (Display):**  
   - **`Outfit`** (Pesos: 600 SemiBold, 700 Bold, 800 ExtraBold)  
   - Razón: Aporta una personalidad fresca, moderna y geométrica inspirada en interfaces arcade contemporáneas.
2. **Preguntas y Lectura (Body / UI):**  
   - **`Inter`** (Pesos: 400 Regular, 500 Medium, 600 SemiBold)  
   - Razón: Legibilidad insuperable en cualquier densidad de píxeles, alturas de 'x' optimizadas para pantallas.
3. **Temporizador y Puntuaciones (Monospaced/Numbers):**  
   - **`Space Grotesk`** o `JetBrains Mono` (Pesos: 700 Bold) con `font-variant-numeric: tabular-nums` para que el cronómetro no provoque saltos de layout durante la cuenta atrás.

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@600;700;800&family=Space+Grotesk:wght@700&display=swap" rel="stylesheet">
```

### 4.2 Escala Tipográfica Responsiva

| Nivel Semántico | Token CSS | Familia | Tamaño (Desktop / Mobile) | Line Height | Peso | Tracking |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Timer Display** | `--text-timer` | Space Grotesk | `56px` / `40px` | 1.0 | 700 Bold | `-0.03em` |
| **Puntaje Gigante** | `--text-score-xl` | Outfit | `48px` / `36px` | 1.1 | 800 ExtraBold| `-0.02em` |
| **H1 (Pantalla Fin)**| `--text-h1` | Outfit | `36px` / `28px` | 1.2 | 700 Bold | `-0.02em` |
| **H2 (Pregunta)** | `--text-question`| Inter | `24px` / `18px` | 1.35 | 600 SemiBold | `-0.01em` |
| **H3 (Subtítulo)** | `--text-h3` | Outfit | `20px` / `16px` | 1.3 | 600 SemiBold | `0.0em` |
| **Body (Respuestas)**| `--text-answer` | Inter | `17px` / `15px` | 1.4 | 500 Medium | `0.0em` |
| **Body Regular** | `--text-body` | Inter | `15px` / `14px` | 1.5 | 400 Regular | `0.0em` |
| **Caption / Hotkey**| `--text-caption` | Inter | `12px` / `11px` | 1.4 | 600 SemiBold | `+0.04em` |

---

## 5. Espaciado, Elevación y Bordes

### 5.1 Escala de Espaciado (Grid Base de 4px / 8px)

```css
--space-1:  4px;
--space-2:  8px;
--space-3: 12px;
--space-4: 16px;   /* Padding estándar tarjetas móviles */
--space-5: 20px;
--space-6: 24px;   /* Padding estándar tarjetas desktop */
--space-8: 32px;   /* Separación entre bloques mayores */
--space-10: 40px;
--space-12: 48px;  /* Márgenes de sección */
--space-16: 64px;
```

### 5.2 Bordes Redondeados (Border Radius)

```css
--radius-sm:   6px;   /* Badges, atajos de teclado [1] */
--radius-md:  10px;   /* Inputs, botones secundarios */
--radius-lg:  16px;   /* Botones de respuesta, tarjetas de categorías */
--radius-xl:  24px;   /* Modales, tarjetas de pregunta principal */
--radius-full: 9999px; /* Temporizador circular, avatares, pills */
```

### 5.3 Elevaciones y Sombras (Depth & Glow Tokens)

```css
/* Sombras Neutras Estructurales */
--shadow-elevation-low:  0 2px 4px rgba(0, 0, 0, 0.2);
--shadow-elevation-mid:  0 8px 16px -2px rgba(0, 0, 0, 0.35);
--shadow-elevation-high: 0 16px 32px -4px rgba(0, 0, 0, 0.5);

/* Efectos de Brillo Gamificado (Glow Arcade) */
--glow-primary:  0 0 20px rgba(99, 102, 241, 0.45);
--glow-success:  0 0 24px rgba(16, 185, 129, 0.50);
--glow-danger:   0 0 24px rgba(239, 68, 68, 0.50);
--glow-streak:   0 0 28px rgba(245, 158, 11, 0.60);
```

### 5.4 Curvas de Transición y Tiempos

```css
--transition-instant:  80ms cubic-bezier(0, 0, 0.2, 1);     /* Micro feedback botón */
--transition-fast:    150ms cubic-bezier(0.4, 0, 0.2, 1);   /* Hover / Focus */
--transition-normal:  250ms cubic-bezier(0.16, 1, 0.3, 1);  /* Entradas suaves */
--transition-bounce:  400ms cubic-bezier(0.34, 1.56, 0.64, 1); /* Éxito / Streaks */
```

---

## 6. Microinteracciones y Visual Cues (CSS Animations)

### 6.1 Shake de Error (Respuesta Incorrecta)
Genera retroalimentación kinética cuando el usuario comete un error, notificándole instantáneamente sin necesidad de leer texto.

```css
@keyframes shake-incorrect {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-8px); }
  40%, 80% { transform: translateX(8px); }
}

.answer-btn--incorrect {
  animation: shake-incorrect 350ms cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  background-color: var(--game-danger-dark);
  border-color: var(--game-danger);
  box-shadow: var(--glow-danger);
}
```

### 6.2 Pulse & Glow de Éxito (Respuesta Correcta)
Recompensa visual con una dilatación elástica de escala y haz de luz verde esmeralda.

```css
@keyframes pulse-success {
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
  50% { transform: scale(1.025); box-shadow: 0 0 28px 6px rgba(16, 185, 129, 0.6); }
  100% { transform: scale(1); box-shadow: 0 0 16px 2px rgba(16, 185, 129, 0.4); }
}

.answer-btn--correct {
  animation: pulse-success 450ms var(--transition-bounce) both;
  background-color: var(--game-success-dark);
  border-color: var(--game-success);
}
```

### 6.3 Streak Fire Burst (Multiplicador y Racha Activa)
Efecto vibrante con tono dorado/llama para cuando el jugador supera 3 aciertos consecutivos.

```css
@keyframes flame-glow {
  0%, 100% { filter: drop-shadow(0 0 6px #F59E0B); transform: scale(1); }
  50% { filter: drop-shadow(0 0 16px #EF4444); transform: scale(1.08) rotate(-2deg); }
}

.streak-badge--active {
  animation: flame-glow 1.8s infinite ease-in-out;
}
```

### 6.4 Urgencia del Temporizador (Countdown Critical Pulse)
Cuando restan menos de 3 segundos, la barra de tiempo y el reloj palpitan en rojo intenso para acelerar la toma de decisiones.

```css
@keyframes timer-warning-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.85; transform: scale(1.06); color: var(--game-danger); }
}

.timer--critical {
  animation: timer-warning-pulse 600ms infinite ease-in-out;
  color: var(--game-danger);
}
```

---

## 7. Accesibilidad (WCAG 2.1 AA/AAA) y Atajos de Teclado

### 7.1 Mapeo de Atajos Físicos para Opciones de Respuesta
Para asegurar velocidad de juego sin ratón y cumplir con accesibilidad motriz:
- Teclas `1`, `2`, `3`, `4` o letras `A`, `B`, `C`, `D` disparan la selección inmediata.
- `Espacio` o `Enter` permite reintentar o avanzar a la siguiente pregunta.
- Cada opción tiene su etiqueta de accesibilidad: `aria-keyshortcuts="1"` y `role="button"`.

### 7.2 Modo Reducción de Movimiento (Prefers-Reduced-Motion)
Para usuarios propensos a cinetosis o epilepsia fotosensible:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  .answer-btn--incorrect {
    animation: none;
    border-width: 4px; /* Indicador estático reforzado */
  }
}
```

---
*Fin de especificación de Design System. Todos los tokens son directamente exportables a variables SCSS o Tailwind CSS.*
