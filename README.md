# QA Automation Academy

Monorepo con todos los cursos prácticos para Ingenieros de QA que están migrando de pruebas manuales hacia automatización profesional. Cuatro contenidos independientes pero diseñados para tomarse en orden.

> **Empieza aquí 👉 [00-setup/](./00-setup/)**

---

## 📂 Contenido del repositorio

| # | Carpeta | Tipo | Descripción |
|---|---------|------|-------------|
| 0 | [00-setup/](./00-setup/) | Setup | Instalación de Node.js, pnpm, Git, VS Code, GitHub, Playwright (con navegadores) y herramientas de IA opcionales. **Empieza aquí.** |
| 1 | [typescript-qa-course/](./typescript-qa-course/) | Curso | TypeScript desde cero con analogías de QA. 6 módulos. ~6 h. |
| 2 | [playwright-course/](./playwright-course/) | Curso | Playwright + TypeScript con **Git/GitHub esencial integrado** (M00 + Git breaks en M03/M04). 7 módulos. ~5.5–7 h. |
| 3 | [git-github-course/](./git-github-course/) | Curso (opcional) | Git + GitHub completo para profundizar: workflows de equipo, rebase interactivo, tags, branch protection. 6 módulos. ~8 h. |
| 4 | [qa-automation-academy-web/](./qa-automation-academy-web/) | Landing | Web pública (React + Vite + Tailwind) que presenta los cursos como rutas. Hosteada en Render. |
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
00-setup  →  TypeScript  →  Playwright (incluye Git esencial)  →  Git/GitHub completo (opcional)
 (75 min)     (~6 h)         (~5.5–7 h)                            (~8 h)
```

El curso de Playwright es **autónomo**: trae Git/GitHub esencial integrado (M00 + Git breaks en M03/M04) para que lo puedas tomar sin haber hecho otro curso de Git. El [`git-github-course/`](./git-github-course/) sigue disponible como **referencia profunda opcional** para quien quiera dominar workflows de equipo, rebase interactivo y mantenimiento de proyectos.

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

## 🎭 Curso 2 — Playwright para automatización web (con Git esencial integrado)

📂 [`playwright-course/`](./playwright-course/)

| # | Módulo | Tema |
|---|--------|------|
| 0 | `modulo-00-git-esencial` | **Git esencial:** config, 3 estados, init/add/commit, `.gitignore`, log |
| 1 | `modulo-01-smoke-feo` | Primer spec plano, `.env`, `dotenv` |
| 2 | `modulo-02-locators-data` | Locators + data tipada + `test.each()` |
| 3 | `modulo-03-pom` | POM incremental con `BasePage` · *Git break:* feature branches + conflictos |
| 4 | `modulo-04-setup-fixtures` | Setup project + fixtures + `page.route()` · *Git break:* push/PR + deshacer cambios |
| 5 | `modulo-05-api-layer` | API Layer con `BaseService` (abstract) |
| 6 | `modulo-06-ci-debugging` | GitHub Actions matrix CI + Trace Viewer |

**Comandos:**
```bash
cd playwright-course
pnpm install
pnpm exec playwright install
pnpm test:ui   # ⭐ recomendado para aprender
pnpm m3        # un módulo específico
```

---

## 🔀 Curso opcional — Git y GitHub completo

📂 [`git-github-course/`](./git-github-course/) — **referencia profunda**

Lo esencial ya está dentro de Playwright (M00 + Git breaks). Toma este curso si quieres dominar workflows de equipo, rebase interactivo, tags, ramas remotas avanzadas, branch protection y mantenimiento de proyectos.

| # | Módulo | Tema |
|---|--------|------|
| 1 | `modulo-01-introduccion-git` | ¿Qué es Git? Snapshots, 3 estados (versión extendida) |
| 2 | `modulo-02-git-basico` | init, clone, add, commit, log, .gitignore (versión extendida) |
| 3 | `modulo-03-undo-remotos-tags` | Deshacer, remotos, tags, aliases |
| 4 | `modulo-04-ramas-y-merge` | Branches, merge, conflictos (versión extendida) |
| 5 | `modulo-05-workflows-rebase` | Workflows de equipo + rebase interactivo |
| 6 | `modulo-06-github` | Cuenta, PRs, code review, branch protection, releases |

---

## 🌐 Landing web — QA Automation Academy

📂 [`qa-automation-academy-web/`](./qa-automation-academy-web/)

Sitio público (React + Vite + Tailwind) que presenta los 3 cursos como rutas de aprendizaje. Incluye:

- Hero con CTAs.
- Grid de rutas (TypeScript / Git / Playwright).
- **CodeShowcase con tabs** que muestran código real de cada carpeta del repo.
- Sección de metodología y highlights.
- **Documentación navegable en `/docs`** con los cursos completos de TypeScript (M1–M6) y Git/GitHub (M1–M6) en formato lección por lección.
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
| **Gestor de paquetes** | pnpm 10+ (no npm, no yarn) |
| **Versión de Node** | 24 LTS recomendada (mínimo 20) |
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
