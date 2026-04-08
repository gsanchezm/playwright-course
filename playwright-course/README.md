# Curso de Playwright para QA Automation

Curso práctico de **Playwright con TypeScript** para Ingenieros de QA que ya pasaron por el curso de [TypeScript](../typescript-qa-course/) y el de [Git/GitHub](../git-github-course/), y están listos para escribir su primer framework de automatización E2E real.

> Todos los ejercicios usan como sitio de pruebas páginas públicas (Playwright demo, reqres.in para APIs), así que **no necesitas backend propio**. Solo tu terminal y un navegador.

---

## Estructura del curso

| # | Carpeta | Tema | Formato principal |
|---|---------|------|-------------------|
| 1 | [modulo-01-vision-general](./modulo-01-vision-general/) | Playwright — visión general | Teoría (`README.md`) |
| 2 | [modulo-02-anotaciones](./modulo-02-anotaciones/) | Anotaciones básicas: `test`, `describe`, `hooks`, `skip`, `only`, `tags` | `.spec.ts` |
| 3 | [modulo-03-ejecuciones](./modulo-03-ejecuciones/) | Cómo ejecutar: headed/headless, UI mode, debug, por tag, proyectos | Teoría + comandos |
| 4 | [modulo-04-localizadores](./modulo-04-localizadores/) | Locators: `getByRole`, `getByText`, `getByLabel`, `getByTestId`, CSS, XPath, filtros | `.spec.ts` |
| 5 | [modulo-05-parametrizacion](./modulo-05-parametrizacion/) | Data-driven testing: `forEach`, JSON, fixtures, variables de entorno | `.spec.ts` |
| 6 | [modulo-06-codegen](./modulo-06-codegen/) | Generador de código: `codegen`, Inspector, grabación | Teoría + comandos |
| 7 | [modulo-07-reports](./modulo-07-reports/) | Reporters: HTML, list, line, JUnit, custom | Teoría + config |
| 8 | [modulo-08-repositorios](./modulo-08-repositorios/) | Integrar el framework a Git/GitHub + GitHub Actions | Teoría |
| 9 | [modulo-09-api-testing](./modulo-09-api-testing/) | API testing con `request`: GET, POST, PUT, DELETE, auth, UI+API | `.spec.ts` |
| 10 | [modulo-10-pom](./modulo-10-pom/) | Introducción al Page Object Model | `.ts` + `.spec.ts` |
| 11 | [modulo-11-ia](./modulo-11-ia/) | Introducción a la IA en testing (MCP, Copilot, aserciones AI) | Teoría + ejemplos |

---

## Requisitos

- Node.js **v18+** (ideal v20 LTS).
- **pnpm** 9+ (`npm install -g pnpm`).
- VS Code con la extensión oficial **Playwright Test for VSCode**.
- Haber completado el curso de [TypeScript](../typescript-qa-course/) (al menos módulos 1–6).

---

## Setup inicial

```bash
$ cd playwright-course
$ pnpm install
$ pnpm exec playwright install
```

Esto descarga Playwright + los 3 navegadores (Chromium, Firefox, WebKit).

---

## Cómo correr los ejemplos

```bash
# Todos los tests
$ pnpm test

# Solo un módulo
$ pnpm test modulo-02-anotaciones

# Un archivo específico
$ pnpm test modulo-04-localizadores/01-get-by-role.spec.ts

# Modo UI (el favorito para aprender)
$ pnpm test:ui

# Con navegador visible (headed)
$ pnpm test:headed

# Debug paso a paso
$ pnpm test:debug modulo-02-anotaciones/01-test-basico.spec.ts

# Ver el último reporte HTML
$ pnpm report
```

---

## Filosofía del curso

1. **Un concepto = un archivo.** Nada de ejemplos gigantes con 20 conceptos mezclados.
2. **Analogías de QA en cada módulo.** Si ya haces pruebas manuales, traducimos cada idea nueva a tu mundo.
3. **Pasos explícitos.** Cada `README.md` tiene una sección "Pasos para explicar en clase" con el guion literal.
4. **Reto al final.** Cada módulo cierra con un `reto.spec.ts` o `reto.md` que tú completas.

---

## Convenciones

- **Código:** nombres, funciones, clases y selectores en **inglés**.
- **Comentarios y documentación:** **español**.
- **Selectores:** siempre preferimos `getByRole`, `getByLabel`, `getByTestId` (nunca CSS frágiles).
- **Sitio de pruebas principal:** `https://playwright.dev` y `https://demo.playwright.dev/todomvc` (oficiales).
- **APIs de prueba:** `https://reqres.in/api` (REST mock gratuito).

➡️ Empieza por el [Módulo 1: Visión General](./modulo-01-vision-general/).
