# Product Requirements Document

## Proyecto

**Nombre propuesto:** QA Automation Academy Web  
**Ubicación propuesta en el repo:** `qa-automation-academy-web/`  
**Objetivo de despliegue:** sitio estático en Render

## Contexto

El repositorio actual contiene un curso práctico de TypeScript para QA en `typescript-qa-course/`. La siguiente etapa del proyecto es convertir el repo en una plataforma de aprendizaje más amplia, donde convivan rutas prácticas de:

- TypeScript
- Git y GitHub
- Playwright

La nueva web no debe reemplazar el curso actual. Debe vivir en una carpeta separada y funcionar como landing page / hub de navegación para los ejercicios y rutas formativas.

## Problema

Hoy el contenido existe como curso local y estructura de archivos, pero no como experiencia web pública. Hace falta una página deployable que:

- presente claramente la propuesta de valor del repositorio;
- proyecte una identidad visual técnica y moderna;
- prepare el terreno para agregar futuras rutas de Git/GitHub y Playwright;
- pueda hospedarse fácilmente en Render.

## Objetivo del producto

Crear una landing page moderna para Render que tome:

- la intención de conversión y bloques narrativos de la experiencia tipo Cypress "Create";
- la claridad estructural, jerarquía y densidad técnica de Playwright;
- una estética cyberpunk limpia usando la paleta de la imagen de referencia.

## Usuarios objetivo

1. QA manual que quiere entrar a automatización.
2. QA junior que necesita ejercicios prácticos, no solo teoría.
3. Recruiters / hiring managers que necesitan entender rápido el valor del proyecto.
4. Estudiantes de automatización que quieren una ruta clara: TypeScript -> Git/GitHub -> Playwright.

## Metas

1. Publicar una landing page responsive y rápida en Render.
2. Explicar en menos de 10 segundos qué ofrece el proyecto.
3. Mostrar las tres rutas de aprendizaje, aunque al inicio solo TypeScript esté completa.
4. Tener una base escalable para agregar páginas internas o secciones por ruta.
5. Dejar lista una estructura mantenible para futuras pruebas con Playwright.

## No metas

1. No construir una plataforma LMS completa.
2. No agregar backend ni autenticación en esta fase.
3. No migrar el curso actual a MDX ni a un motor de docs en esta primera iteración.
4. No clonar literalmente Cypress o Playwright; solo tomar referencias de composición y look and feel.

## Inspiración de producto

### De Cypress

Referencia: https://www.cypress.io/  
Tomar:

- secciones con foco de conversión;
- storytelling por bloques;
- módulos tipo producto/feature;
- pairing visual entre texto fuerte + screenshot/mockup/código;
- CTA claros.

### De Playwright

Referencia: https://playwright.dev/  
Tomar:

- hero técnico con mensaje directo;
- layout limpio, documentación-first;
- snippets de código visibles;
- bloques de capacidades con grid simple;
- tono para developer audience.

## Propuesta de contenido inicial

### Hero

- headline fuerte orientado a práctica real;
- subheadline que conecte TypeScript, Git/GitHub y Playwright;
- CTA principal: explorar ejercicios;
- CTA secundario: ver el repo / comenzar con TypeScript;
- área de código visible inspirada en Cypress "Create", con bloques o tabs tipo editor;
- mock visual de terminal/editor/browser.

### Sección de código tipo Cypress

Debe existir una sección dedicada que recuerde el patrón visual de código usado por Cypress:

- panel prominente tipo editor;
- tabs o selector visual para cambiar entre ejemplos;
- snippets visibles de TypeScript, Git/GitHub y Playwright;
- copy corto explicando que el aprendizaje es práctico;
- tratamiento visual premium, no un bloque de código genérico.

### Sección de rutas

Tres cards principales:

1. TypeScript para QA
2. Git y GitHub para testers
3. Playwright para automatización web

Cada card debe mostrar:

- estado actual;
- objetivo;
- tipo de ejercicios;
- nivel;
- CTA.

### Sección “Cómo aprendes aquí”

- ejercicios prácticos;
- progresión guiada;
- contexto real de QA;
- enfoque hands-on;
- preparado para automatización moderna.

### Sección de highlights

- snippets de código;
- prácticas de Git/GitHub;
- testing web con Playwright;
- despliegue simple y rápido.

### Footer

- enlace al repo;
- enlace a módulos actuales;
- placeholder para futuras rutas.

## Requerimientos funcionales

1. El proyecto web debe existir en un folder separado del curso actual.
2. Debe correr localmente con comandos claros de desarrollo y build.
3. Debe poder desplegarse como Static Site en Render.
4. Debe ser responsive desde móvil hasta desktop.
5. Debe tener navegación mínima de una sola página en esta fase.
6. Debe incluir una sección prominente de código inspirada en Cypress con apariencia de editor y snippets estilizados.
7. Debe reflejar estados de rutas: disponible, próximamente, en construcción.
8. Debe permitir luego conectar links internos a carpetas o futuras páginas.

## Requerimientos no funcionales

1. Stack principal: React + TypeScript + Tailwind CSS.
2. Build estático simple.
3. Performance objetivo: Lighthouse >= 90 en Performance, Best Practices y Accessibility.
4. Accesibilidad base WCAG AA.
5. Código mantenible y listo para pruebas E2E con Playwright.

## Recomendación técnica

### Stack

- Vite
- React
- TypeScript
- Tailwind CSS
- Deploy como Static Site en Render

### Razón

Vite reduce complejidad innecesaria para esta fase. Next.js no es indispensable si solo se publicará una landing estática y el objetivo principal es velocidad de implementación y despliegue.

## Estructura propuesta

```text
/
├── typescript-qa-course/
├── qa-automation-academy-web/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── vite.config.ts
│   └── README.md
└── docs/
    └── render-landing/
        ├── PRD.md
        └── DESIGN.md
```

## Criterios de aceptación

1. Existe un proyecto separado llamado `qa-automation-academy-web/`.
2. `pnpm install` y `pnpm build` funcionan dentro de esa carpeta.
3. Render puede desplegar el build estático sin pasos manuales especiales.
4. La home contiene hero, rutas, metodología, highlights y footer.
5. El look general recuerda a Playwright en claridad estructural.
6. La energía visual recuerda a una estética cyberpunk controlada, no recargada.
7. La paleta deriva de la imagen de referencia: navy profundo, cyan eléctrico, azules brillantes, lavandas y violetas.
8. Existe una sección de código estilo Cypress con snippets de aprendizaje visibles.
9. No rompe ni modifica el curso TypeScript existente.

## Riesgos

1. El estilo “cyberpunk” puede degradar legibilidad si se exagera.
2. El skill `ui-ux-pro-max` tiende a derivar a patrones genéricos si el prompt no restringe fuerte el estilo.
3. Si se intenta copiar literal Cypress o Playwright, el resultado se verá derivativo y menos propio.

## Hallazgos del análisis de skills de Claude

### `ui-ux-pro-max`

Útil para:

- sistema visual;
- patrones de landing;
- tipografía;
- color;
- lineamientos Tailwind.

Observación:

- el script tenía un `SyntaxError` en `.claude/skills/ui-ux-pro-max/scripts/design_system.py`; ya quedó corregido en este repo para permitir su ejecución;
- aun funcionando, su salida automática para el query “education” se fue a una estética infantil, así que necesita prompts con restricciones visuales muy concretas.

### `senior-frontend`

Útil para:

- scaffold del proyecto frontend;
- arquitectura de componentes;
- implementación React + TypeScript + Tailwind;
- saneamiento de estructura.

### `senior-architect`

Útil para:

- definir folder separado;
- stack;
- convenciones;
- decisiones de despliegue en Render.

### `playwright-tester`

Útil para:

- revisar la landing ya construida;
- generar smoke tests;
- validar CTA, navegación, hero y responsive básico.

## Secuencia recomendada para Claude

1. `senior-architect` para crear la estructura del proyecto y setup de Render.
2. `ui-ux-pro-max` para definir sistema visual y tokens.
3. `senior-frontend` para implementar la landing.
4. `playwright-tester` para validar la experiencia final.

## Prompt maestro para Claude Code

```md
Quiero que trabajes dentro de este repositorio sin modificar el curso actual `typescript-qa-course/`.

Objetivo:
Crear una nueva app web en un folder separado llamado `qa-automation-academy-web/` para desplegarla en Render como sitio estático.

Contexto del producto:
- El repo actual enseña TypeScript para QA.
- Próximamente agregará rutas de Git/GitHub y Playwright.
- La landing debe presentar estas rutas como una academia práctica de automatización.

Referencias de diseño:
- Tomar de Cypress la lógica de secciones con storytelling, bloques de producto y CTAs claros.
- Tomar también de Cypress el patrón de área de código/editor visible para mostrar ejemplos prácticos.
- Tomar de Playwright la jerarquía técnica, limpieza visual, snippets de código, spacing y tono para developers.
- No copiar literal ninguna de las dos páginas.

Estilo visual obligatorio:
- Look and feel técnico, moderno y con energía cyberpunk controlada.
- Usar la paleta cyberpunk azul/cyan/lavanda/violeta del documento `docs/render-landing/DESIGN.md`.
- Mantener alta legibilidad y accesibilidad.
- Implementar con Tailwind CSS.

Stack requerido:
- Vite
- React
- TypeScript
- Tailwind CSS

Alcance mínimo:
- Hero con headline, subheadline, CTA principal y secundario.
- Área de código estilo Cypress con ejemplos de TypeScript, Git/GitHub y Playwright.
- Sección de rutas: TypeScript, Git/GitHub, Playwright.
- Sección de metodología o “cómo aprendes aquí”.
- Sección de highlights con código/mockups.
- Footer.

Restricciones:
- No tocar ni reestructurar `typescript-qa-course/`.
- Crear la app web en una carpeta totalmente distinta: `qa-automation-academy-web/`.
- No agregar backend.
- No introducir dependencias innecesarias.
- Preparar comandos claros para Render.

Proceso esperado:
1. Analiza el repo.
2. Propón la estructura del nuevo proyecto.
3. Implementa la app completa.
4. Agrega README del nuevo proyecto con instrucciones de Render.
5. Si es viable, agrega smoke tests básicos con Playwright.

Usa como guía principal:
- `docs/render-landing/PRD.md`
- `docs/render-landing/DESIGN.md`
```

## Prompt para `ui-ux-pro-max`

```md
Necesito un sistema visual para una landing page de academia técnica de QA Automation.

Producto:
- plataforma de ejercicios prácticos de TypeScript, Git/GitHub y Playwright.

Quiero:
- estética cyberpunk limpia;
- no gamer, no NFT, no sci-fi caricaturesco;
- más Playwright que gaming dashboard;
- alta legibilidad;
- layout docs-first con hero potente;
- una sección de código prominente tipo Cypress editor.

Usa:
- navy muy oscuro;
- cyan brillante;
- electric blue;
- periwinkle/lavender;
- violeta digital;
- superficies translúcidas sutiles.

Evita:
- magenta dominante;
- tipografías infantiles;
- glassmorphism excesivo;
- HUD recargado;
- glow agresivo;
- contrastes pobres.

Salida esperada:
- design tokens;
- tipografías;
- reglas de hero;
- sistema de cards;
- CTA styles;
- guidelines de motion;
- recomendaciones Tailwind.
```

## Prompt para `senior-frontend`

```md
Implementa una landing page en `qa-automation-academy-web/` usando React + TypeScript + Tailwind + Vite.

Requisitos:
- seguir `docs/render-landing/PRD.md`;
- seguir `docs/render-landing/DESIGN.md`;
- no modificar `typescript-qa-course/`;
- crear todo en `qa-automation-academy-web/` y no dentro de otra carpeta existente;
- dejar lista para deploy en Render;
- priorizar componentes reutilizables y semántica HTML.

Entregables:
- proyecto funcional;
- comandos `dev`, `build`, `preview`;
- README con instrucciones de Render;
- layout responsive;
- código limpio;
- accesibilidad base.
```

## Prompt para `playwright-tester`

```md
Explora la landing localmente y genera smoke tests de Playwright para validar:

- el hero principal;
- visibilidad de CTAs;
- cards de TypeScript, Git/GitHub y Playwright;
- responsive básico;
- navegación de anchors o botones principales;
- ausencia de errores evidentes en la home.

No inventes locators.
Primero explora la página como usuario y luego escribe tests mantenibles en TypeScript.
```
