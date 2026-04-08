# QA Automation Academy

Monorepo con todos los cursos prácticos para Ingenieros de QA que están migrando de pruebas manuales hacia automatización profesional. Cuatro contenidos independientes pero diseñados para tomarse en orden.

> **Empieza aquí 👉 [00-setup/](./00-setup/)**

---

## 📂 Contenido del repositorio

| # | Carpeta | Tipo | Descripción |
|---|---------|------|-------------|
| 0 | [00-setup/](./00-setup/) | Setup | Instalación de Node.js, pnpm, Git, VS Code, GitHub, Playwright (con navegadores) y herramientas de IA opcionales. **Empieza aquí.** |
| 1 | [typescript-qa-course/](./typescript-qa-course/) | Curso | TypeScript desde cero con analogías de QA. 6 módulos. ~6 h. |
| 2 | [git-github-course/](./git-github-course/) | Curso | Git + GitHub para automatizadores y equipos de QA. 6 módulos. ~8 h. |
| 3 | [playwright-course/](./playwright-course/) | Curso | Playwright + TypeScript: anotaciones, locators, parametrización, reports, API, POM e IA. 11 módulos. ~12 h. |
| 4 | [qa-automation-academy-web/](./qa-automation-academy-web/) | Landing | Web pública (React + Vite + Tailwind) que presenta los 3 cursos como rutas. Hosteada en Render. |
| 5 | [docs/](./docs/) | Docs | Documentación interna del proyecto y la landing. |

---

## 🎯 ¿Para quién es este repo?

- **Testers manuales** que quieren dar el salto a automatización.
- **Automatizadores junior/mid** que tienen huecos en TypeScript, Git o Playwright.
- **Líderes de QA** que necesitan material de onboarding para su equipo.
- **Bootcamps y academias** que quieran usar el contenido como base (es público).

---

## 🛤 Ruta recomendada

```
00-setup  →  TypeScript  →  Git/GitHub  →  Playwright
 (75 min)     (~6 h)         (~8 h)         (~12 h)
```

Cada curso es independiente, pero el orden recomendado tiene sentido: necesitas TypeScript para escribir tests, necesitas Git para colaborar en equipo, y Playwright unifica todo en automatización E2E real.

---

## 🚀 Quick start (resumen ultracorto)

```bash
# 1. Clonar
git clone git@github.com:gilbertosanchez/typescript.git
cd typescript

# 2. Setup completo (sigue el README de 00-setup)
open 00-setup/README.md

# 3. Empezar el primer curso
cd typescript-qa-course
pnpm install
pnpm m1
```

---

## 📘 Curso 1 — TypeScript para QA

📂 [`typescript-qa-course/`](./typescript-qa-course/)

| # | Módulo | Tema |
|---|--------|------|
| 1 | `modulo-01-hello-world` | Hola mundo, variables básicas |
| 2 | `modulo-02-types` | boolean, number, string, any, arrays, tuples, enums, void, null (modular: 1 archivo por tipo) |
| 3 | `modulo-03-functions` | Parámetros, opcionales, defaults, arrow, void |
| 4 | `modulo-04-objects-types` | Objetos, type aliases, opcionales, union, intersection |
| 5 | `modulo-05-classes` | Clases, herencia, getters/setters, POM básico |
| 6 | `modulo-06-interfaces` | Interfaces, implements, contratos para tests |

**Comandos:**
```bash
cd typescript-qa-course
pnpm install
pnpm m1   # módulo 1
pnpm m2   # módulo 2 (corre todas las mini-clases)
# ...
pnpm tsx modulo-02-types/01-booleans.ts   # mini-clase específica
```

---

## 🔀 Curso 2 — Git y GitHub para testers

📂 [`git-github-course/`](./git-github-course/)

| # | Módulo | Tema |
|---|--------|------|
| 1 | `modulo-01-introduccion-git` | ¿Qué es Git? Instalación y configuración inicial |
| 2 | `modulo-02-git-basico` | init, clone, add, commit, log, .gitignore |
| 3 | `modulo-03-undo-remotos-tags` | Deshacer cambios, remotos, tags, aliases |
| 4 | `modulo-04-ramas-y-merge` | Branches, merge fast-forward y 3-way, conflictos |
| 5 | `modulo-05-workflows-rebase` | Workflows de equipo, rebase interactivo |
| 6 | `modulo-06-github` | Cuenta, PRs, code review, branch protection, releases |

Cada módulo tiene `ejemplo.md` (teoría con analogías) y `reto.md` (ejercicios para resolver).

---

## 🎭 Curso 3 — Playwright para automatización web

📂 [`playwright-course/`](./playwright-course/)

| # | Módulo | Tema |
|---|--------|------|
| 1 | `modulo-01-vision-general` | ¿Qué es Playwright? Instalación + primer test |
| 2 | `modulo-02-anotaciones` | `test`, `describe`, hooks, `skip/only/fixme`, tags |
| 3 | `modulo-03-ejecuciones` | Headed/headless, UI mode, debug, por tag, proyectos |
| 4 | `modulo-04-localizadores` | `getByRole`, `getByLabel`, `getByText`, `getByTestId`, filtros |
| 5 | `modulo-05-parametrizacion` | Data-driven con `forEach`, JSON, env vars, fixtures |
| 6 | `modulo-06-codegen` | Generador de código y Inspector |
| 7 | `modulo-07-reports` | HTML, JUnit, Trace Viewer |
| 8 | `modulo-08-repositorios` | Integración con GitHub Actions |
| 9 | `modulo-09-api-testing` | GET/POST/PUT/DELETE, auth, UI + API combinados |
| 10 | `modulo-10-pom` | Page Object Model con `BasePage` y herencia |
| 11 | `modulo-11-ia` | GitHub Copilot, MCP, prompts efectivos para QA |

**Comandos:**
```bash
cd playwright-course
pnpm install
pnpm exec playwright install
pnpm test:ui   # ⭐ recomendado para aprender
pnpm test modulo-04-localizadores/01-get-by-role.spec.ts   # un solo archivo
```

---

## 🌐 Landing web — QA Automation Academy

📂 [`qa-automation-academy-web/`](./qa-automation-academy-web/)

Sitio público (React + Vite + Tailwind) que presenta los 3 cursos como rutas de aprendizaje. Incluye:

- Hero con CTAs.
- Grid de rutas (TypeScript / Git / Playwright).
- **CodeShowcase con tabs** que muestran código real de cada carpeta del repo.
- Sección de metodología y highlights.
- Tests E2E con Playwright.
- Deploy automático en Render.

```bash
cd qa-automation-academy-web
pnpm install
pnpm dev          # http://localhost:5173
pnpm test:e2e:ui  # tests con UI mode
```

---

## 🧠 Convenciones del proyecto

| Aspecto | Convención |
|---------|------------|
| **Idioma de comentarios** | Español (la audiencia es LATAM) |
| **Idioma de código** | Inglés (variables, funciones, clases, selectores) |
| **Gestor de paquetes** | pnpm 9+ (no npm, no yarn) |
| **Versión de Node** | 20 LTS recomendada (mínimo 18) |
| **TypeScript** | strict: true en todos los proyectos |
| **Locators de Playwright** | `getByRole` / `getByLabel` / `getByTestId` (nunca CSS frágil) |
| **Estilo de commits** | `<tipo>: <descripción imperativa>` (ver curso de Git, módulo 2) |
| **Rama principal** | `main` (no master) |

---

## 🤝 Contribuir

Este repo está abierto a sugerencias, correcciones y mejoras. Si encuentras un error o quieres aportar:

1. Abre un issue describiendo el problema o la mejora propuesta.
2. Forkea el repo, crea una rama `fix/...` o `docs/...`.
3. Abre un PR con descripción clara.

Sigue las convenciones de commits y formato del proyecto.

---

## 📄 Licencia

MIT — usa el contenido libremente para enseñar, estudiar o adaptar a tu equipo.

---

## 🔗 Enlaces útiles

- [Playwright oficial](https://playwright.dev/)
- [TypeScript oficial](https://www.typescriptlang.org/)
- [Pro Git Book (gratis, en español)](https://git-scm.com/book/es/v2)
- [GitHub Docs](https://docs.github.com/)
- [pnpm](https://pnpm.io/)

---

**Hecho con ♥ para la comunidad de QA en LATAM.**
