# Design Document

## Objetivo visual

Diseñar una landing page para una academia práctica de QA Automation con una mezcla intencional de:

- claridad estructural tipo Playwright;
- ritmo narrativo y bloques de conversión tipo Cypress;
- identidad cromática cyberpunk basada en la imagen de referencia.

La página debe sentirse técnica, contemporánea y aspiracional, sin caer en estética gamer ruidosa ni en dashboard sci-fi sobrecargado.

## Principios visuales

1. **Developer-first clarity**: primero comprensión, luego espectáculo.
2. **Cyberpunk controlled**: usar glow y gradientes con disciplina.
3. **Code-native feel**: el sitio debe verse cercano a tooling, documentación y terminales.
4. **Conversion with substance**: los CTA deben convivir con evidencia visual de aprendizaje real.
5. **Dark surface, bright intent**: base oscura profunda, acentos luminosos.

## Síntesis de referencias

### Cypress

Tomar de la referencia:

- home orientada a producto;
- alternancia entre bloques narrativos y visuales;
- CTAs visibles;
- secciones que explican “qué puedes hacer”.

No tomar:

- copy demasiado comercial;
- exceso de visuales de marketing;
- patrón exacto de composición.

### Playwright

Tomar de la referencia:

- hero técnico y directo;
- fuerte legibilidad;
- snippets y lenguaje de tooling;
- grids simples y funcionales;
- aire de documentación confiable.

No tomar:

- neutralidad cromática total;
- sobriedad excesiva;
- copia literal de layout.

## Dirección creativa

### Mood

- technical
- sharp
- modern
- luminous
- precise
- credible

### Anti-mood

- childish
- NFT cliché
- gaming UI exagerada
- hacker-movie parody
- purple fog genérico

## Paleta principal

Paleta derivada visualmente de la imagen de referencia.

| Token | Hex | Uso |
|------|-----|-----|
| `bg.base` | `#050816` | fondo principal |
| `bg.elevated` | `#0C1226` | secciones y panels |
| `bg.panel` | `#101A35` | cards y snippets |
| `line.soft` | `#213052` | bordes sutiles |
| `text.primary` | `#EAF2FF` | texto principal |
| `text.secondary` | `#A9B9D6` | texto secundario |
| `brand.cyan` | `#77F2FF` | acento luminoso |
| `brand.blue` | `#56B8FF` | acento principal |
| `brand.periwinkle` | `#8FA9FF` | gradientes y detalles |
| `brand.lavender` | `#B495FF` | acento secundario |
| `brand.violet` | `#8C5BFF` | profundidad y CTA secundarios |
| `brand.ice` | `#D9F7FF` | highlights suaves |

## Gradientes recomendados

### Hero gradient

```css
background:
  radial-gradient(circle at 20% 20%, rgba(119, 242, 255, 0.18), transparent 28%),
  radial-gradient(circle at 80% 10%, rgba(140, 91, 255, 0.16), transparent 26%),
  radial-gradient(circle at 50% 80%, rgba(86, 184, 255, 0.12), transparent 30%),
  linear-gradient(180deg, #050816 0%, #0A1124 50%, #050816 100%);
```

### Accent gradient

```css
background-image: linear-gradient(135deg, #77F2FF 0%, #56B8FF 42%, #8FA9FF 72%, #B495FF 100%);
```

## Tipografía

### Recomendación principal

- Headings: `Space Grotesk`
- Body: `IBM Plex Sans`
- Code/UI secondary: `JetBrains Mono`

### Razón

- `Space Grotesk` aporta personalidad tecnológica sin perder legibilidad.
- `IBM Plex Sans` mantiene tono técnico-editorial.
- `JetBrains Mono` refuerza el carácter de tooling y snippets.

### Uso

- H1/H2/H3: `Space Grotesk`
- párrafos y labels: `IBM Plex Sans`
- snippets, badges de estado, metadata: `JetBrains Mono`

## Tailwind theme propuesto

```ts
theme: {
  extend: {
    colors: {
      qa: {
        base: "#050816",
        elevated: "#0C1226",
        panel: "#101A35",
        line: "#213052",
        text: "#EAF2FF",
        muted: "#A9B9D6",
        cyan: "#77F2FF",
        blue: "#56B8FF",
        periwinkle: "#8FA9FF",
        lavender: "#B495FF",
        violet: "#8C5BFF",
        ice: "#D9F7FF",
      },
    },
    fontFamily: {
      display: ["Space Grotesk", "sans-serif"],
      sans: ["IBM Plex Sans", "sans-serif"],
      mono: ["JetBrains Mono", "monospace"],
    },
    boxShadow: {
      glow: "0 0 0 1px rgba(119,242,255,.18), 0 0 30px rgba(86,184,255,.12)",
      card: "0 20px 60px rgba(3, 8, 24, .45)",
    },
    backgroundImage: {
      "qa-hero":
        "radial-gradient(circle at 20% 20%, rgba(119,242,255,0.18), transparent 28%), radial-gradient(circle at 80% 10%, rgba(140,91,255,0.16), transparent 26%), radial-gradient(circle at 50% 80%, rgba(86,184,255,0.12), transparent 30%), linear-gradient(180deg, #050816 0%, #0A1124 50%, #050816 100%)",
      "qa-accent":
        "linear-gradient(135deg, #77F2FF 0%, #56B8FF 42%, #8FA9FF 72%, #B495FF 100%)",
    },
  },
}
```

## Composición general

### Hero

Debe incluir:

- headline de 2 a 3 líneas;
- subheadline concreto;
- CTA primario;
- CTA secundario;
- panel visual derecho o inferior con snippet/code-mockup;
- opción preferida: panel tipo editor inspirado en Cypress Create;
- indicadores de rutas o badges de tecnologías.

Headline sugerido:

`Aprende automatización con ejercicios reales, desde TypeScript hasta Playwright.`

### Grid de rutas

Tres cards con diseño consistente:

- TypeScript: disponible;
- Git y GitHub: próximo;
- Playwright: próximo.

Cada card debe incluir:

- estado;
- breve promesa de valor;
- lista de 3 capacidades;
- CTA;
- color accent diferenciado sutilmente.

### Sección de metodología

Formato recomendado:

- bloque editorial a la izquierda;
- bullets o mini-steps a la derecha;
- fondo elevado;
- detalles de borde y glow muy sutil.

### Sección visual / proof

Usar uno de estos recursos:

1. panel de código tipo editor inspirado en Cypress;
2. mock de estructura de carpetas;
3. mini terminal con comandos como `pnpm`, `git`, `playwright`.

### Área de código estilo Cypress

Debe existir un bloque destacado con comportamiento visual de "code showcase":

- contenedor grande con fondo `qa.panel`;
- header tipo window chrome o tabs;
- tabs sugeridos: `TypeScript`, `GitHub`, `Playwright`;
- snippets cortos, legibles y creíbles;
- posibilidad de resaltar línea activa;
- glow muy sutil en borde o tab activo;
- nunca parecer un componente genérico de docs sin intención visual.

Contenido sugerido:

- `TypeScript`: tipado básico o union types;
- `GitHub`: flujo `git checkout`, `git add`, `git commit`, `git push`;
- `Playwright`: `test`, `page.goto`, `getByRole`, `expect`.

## Componentes base

### Botón primario

- fondo con gradiente `qa-accent`;
- texto oscuro o navy muy profundo;
- borde luminoso sutil;
- hover con elevación y leve bloom;
- mínimo 44px de alto.

### Botón secundario

- fondo translúcido oscuro;
- borde `qa.line`;
- texto `qa.text`;
- hover con borde `qa.cyan`.

### Card

- `rounded-2xl`;
- fondo `qa.panel` con transparencia ligera;
- borde sutil;
- sombra profunda;
- highlight line superior o esquina con gradiente.

### Badge

- usar `JetBrains Mono`;
- uppercase suave;
- tracking amplio;
- estados: `Live`, `Soon`, `In Progress`.

## Motion

Usar animación breve y funcional.

- fade-up de entrada por secciones;
- hover suave en cards;
- glow leve en CTA;
- background orbs casi estáticos;
- respetar `prefers-reduced-motion`.

No usar:

- glitches agresivos;
- flicker constante;
- parallax excesivo;
- scanlines permanentes sobre texto.

## Accesibilidad

1. Contraste AA real sobre fondos oscuros.
2. El cyan no debe usarse para párrafos largos.
3. Focus states visibles en botones y links.
4. Tamaño base mínimo de 16px en mobile.
5. Anchura de lectura controlada.

## Responsive

### Mobile

- hero en columna;
- CTAs apilados;
- cards a una columna;
- snippets recortados con buen padding;
- sin sobrecargar con decoraciones.

### Tablet

- hero parcialmente split;
- grid de rutas en 2 columnas si funciona;
- spacing más amplio.

### Desktop

- hero 2 columnas;
- visual prominente;
- respiración amplia tipo docs/product landing.

## Contenido visual sugerido

### Snippets

Usar ejemplos que conecten con el repo:

```ts
type LearningPath = "TypeScript" | "GitHub" | "Playwright";

const currentPath: LearningPath = "TypeScript";
```

```bash
pnpm install
pnpm tsx modulo-01-hello-world/ejemplo.ts
git checkout -b feature/playwright-path
```

## Reglas para Claude

1. No usar plantillas SaaS genéricas.
2. No introducir morado dominante sobre fondo plano blanco.
3. No usar paletas cálidas como base.
4. No elegir fuentes infantiles ni overly playful.
5. No copiar literalmente Cypress ni Playwright.
6. Sí mantener una mezcla de docs + product marketing.
7. Sí incluir un panel de código protagonista inspirado en Cypress.
8. El proyecto web debe vivir en una carpeta separada: `qa-automation-academy-web/`.

## Prompt de diseño para Claude

```md
Diseña una landing page para una academia práctica de QA Automation.

Debes combinar:
- claridad y jerarquía técnica tipo Playwright;
- ritmo de conversión y bloques narrativos tipo Cypress;
- estética cyberpunk controlada basada en estos colores:
  - #050816
  - #0C1226
  - #101A35
  - #77F2FF
  - #56B8FF
  - #8FA9FF
  - #B495FF
  - #8C5BFF
  - #EAF2FF

Tipografías:
- Space Grotesk para headings
- IBM Plex Sans para body
- JetBrains Mono para code/badges

Necesito:
- hero potente;
- panel de código tipo Cypress con tabs o selector visual;
- grid de 3 rutas;
- componentes con Tailwind;
- cards elegantes;
- snippets de código;
- glow muy sutil;
- accesibilidad real;
- responsive sólido.

Evita:
- look gamer exagerado;
- magenta dominante;
- NFT/web3 vibe;
- glassmorphism pesado;
- layouts genéricos de startup.
```
