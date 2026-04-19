# Curso de Playwright para QA Automation — sobre OmniPizza

Curso práctico de **Playwright con TypeScript** para Ingenieros de QA que ya pasaron por los cursos de [TypeScript](../typescript-qa-course/) y de [Git/GitHub](../git-github-course/).

**Hilo conductor:** todos los ejemplos, retos y ejercicios del curso son pruebas contra **OmniPizza**, una app real de pedidos de pizza. Al terminar los 10 módulos habrás construido un **mini framework E2E + API** completo.

| Aspecto | Valor |
|---|---|
| Frontend live | https://omnipizza-frontend.onrender.com |
| Backend live | https://omnipizza-backend.onrender.com |
| Repo del producto | https://github.com/gsanchezm/OmniPizza |
| Stack | React + Vite (front), FastAPI (back) |
| Auth | JWT con 5 usuarios deterministas |
| Mercados | MX / US / CH / JP |

> ⚠️ El backend vive en Render free tier: si está dormido, el primer request tarda ~30-40s. El curso tiene timeouts generosos y un patrón `beforeAll` para despertarlo.

---

## Narrativa — 10 módulos, un framework

Cada módulo **añade una pieza** al framework. Al terminar M10 el framework está completo.

| # | Módulo | Pieza del framework |
|---|---------|---------------------|
| 1 | [Visión general](./modulo-01-vision-general/) | `hello.spec.ts` — primer smoke |
| 2 | [Anotaciones](./modulo-02-anotaciones/) | `describe` + hooks + tags `@smoke`/`@regression` |
| 3 | [Ejecuciones](./modulo-03-ejecuciones/) | Correr la suite: headed/UI/tag/browser |
| 4 | [Localizadores](./modulo-04-localizadores/) | Las 12 estrategias de locator de Playwright |
| 5 | [Parametrización](./modulo-05-parametrizacion/) | Data-driven con los 4 mercados |
| 6 | [Codegen](./modulo-06-codegen/) | Grabar specs automáticamente |
| 7 | [Reports](./modulo-07-reports/) | HTML + Trace Viewer + flakiness |
| 8 | [Repositorios/CI](./modulo-08-repositorios/) | GitHub + Actions contra el deploy live |
| 9 | [API testing](./modulo-09-api-testing/) | Pruebas **puras** de API (aisladas del UI) |
| 10 | [POM](./modulo-10-pom/) | Refactor final: Page Object Model |

> **Nota:** M9 (API testing) y el resto del framework UI son **suites independientes**. El curso NO enseña el patrón "login vía API + sembrar JWT" (atomic testing); eso queda para un curso avanzado.

---

## Framework final (entregable)

```
omnipizza-e2e/
├── playwright.config.ts        # multi-browser, multi-mercado, CI-ready
├── fixtures/
│   ├── auth.ts                 # authenticatedPage (login por UI)
│   ├── market.ts               # worker fixture con X-Country-Code
│   └── test-data.json          # 4 mercados + 5 usuarios
├── api/                        # solo para tests/api/ (aislado del UI)
├── pages/                      # BasePage + LoginPage + CatalogPage + ...
├── tests/
│   ├── smoke/                  # @smoke — flows críticos
│   ├── regression/             # @regression — flows completos
│   └── api/                    # API pura (M9)
└── .github/workflows/playwright.yml
```

---

## Requisitos

- Node.js **v18+** (ideal v20 LTS).
- **pnpm** 9+ (`npm install -g pnpm`).
- VS Code con la extensión oficial **Playwright Test for VSCode**.
- Haber completado [TypeScript](../typescript-qa-course/) (módulos 1–6) y [Git/GitHub](../git-github-course/).

## Setup inicial

```bash
cd playwright-course
pnpm install
pnpm install-browsers    # alias de "playwright install"
```

## Cómo correr

```bash
# Todo el suite
pnpm test

# Un módulo
pnpm test modulo-02-anotaciones

# UI mode (recomendado mientras aprendes)
pnpm test:ui

# Con browser visible
pnpm test:headed

# Debug con Inspector
pnpm test:debug modulo-02-anotaciones/01-test-basico.spec.ts

# Smoke / Regression
pnpm test:smoke
pnpm test:regression

# Reporte HTML del último run
pnpm report
```

---

## Filosofía del curso

1. **Un concepto = un archivo.** Nada de megaarchivos con 20 conceptos mezclados.
2. **Una historia continua.** Cada módulo **suma** al mini framework anterior — nada es teórico aislado.
3. **Tests ejecutables contra el deploy real.** Todos los ejemplos corren contra OmniPizza live.
4. **Reto al final.** Cada módulo cierra con un `reto.spec.ts` (o `reto.md` si es módulo de docs).

## Convenciones

- **Código:** nombres, funciones, clases y selectores en **inglés**.
- **Comentarios y documentación:** **español**.
- **Selectores:** priorizamos `getByRole`, `getByLabel`, `getByTestId` sobre CSS/XPath.
- **Deploy:** OmniPizza live en Render; `docker-compose` del repo como fallback local si Render está dormido.

➡️ Empieza por el [Módulo 1 — Visión General](./modulo-01-vision-general/).
