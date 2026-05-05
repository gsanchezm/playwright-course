# Curso de Playwright para QA Automation — OmniPizza (v3)

Curso práctico de **Playwright con TypeScript** para Ingenieros de QA que ya pasaron por el curso de [TypeScript](../typescript-qa-course/). **Git/GitHub está integrado aquí** — este curso es autónomo: no necesitas hacer otro curso antes.

**Filosofía v3 — arquitectura incremental:** cada módulo **añade una capa** al framework. Los conceptos de TS / Playwright / Git entran *just-in-time* cuando se necesitan, no como bloques teóricos sueltos. Al terminar M06 tienes un framework E2E + API producción-grade y un flujo Git/GitHub real (commits, branches, PRs, CI).

| Aspecto | Valor |
|---|---|
| Frontend live | https://omnipizza-frontend.onrender.com |
| Backend live | https://omnipizza-backend.onrender.com |
| Swagger | https://omnipizza-backend.onrender.com/api/docs |
| Stack | React + Vite (front), FastAPI (back) |
| Auth | JWT con usuarios deterministas |
| Mercados | MX / US / CH / JP |
| Duración | 5.5 – 7 horas, 7 módulos (M00 + 6) |

> ⚠️ Render free tier: backend dormido tarda 30-40s en despertar. El `tests/setup/auth.setup.ts` (M04) hace el warmup automático.

---

## Los 7 módulos

| # | Módulo | Pieza que añade al framework |
|---|---------|-------------|
| 0 | [Git esencial](./modulo-00-git-esencial/) | Config + `.gitignore` + ciclo `add`/`commit` + `log` (versión condensada) |
| 1 | [Smoke feo](./modulo-01-smoke-feo/) | `ejemplo.spec.ts` plano + `.env` + `dotenv` |
| 2 | [Locators + Data tipada](./modulo-02-locators-data/) | `types/*` + `data/*.json` + `test.each()` |
| 3 | [POM incremental](./modulo-03-pom/) | `pages/BasePage.ts` + Login/Catalog/Checkout · *Git break:* feature branches + conflictos |
| 4 | [Setup project + Fixtures](./modulo-04-setup-fixtures/) | `tests/setup/auth.setup.ts` + `fixtures/` + `helpers/unique-data.ts` + `page.route()` · *Git break:* push/PR + deshacer cambios |
| 5 | [API Layer](./modulo-05-api-layer/) | `services/BaseService.ts` (abstract) + 3 services + `tests/api/` |
| 6 | [CI/CD + Trace Viewer](./modulo-06-ci-debugging/) | `.github/workflows/playwright.yml` con matrix por browser |

### Mapa de Git embebido

| Tema | Dónde se enseña |
|---|---|
| Identidad, 3 estados, init/add/commit, `.gitignore`, log básico | [M00](./modulo-00-git-esencial/) |
| Feature branches, merge fast-forward / 3-way, conflictos | [M03 Git break](./modulo-03-pom/#-git-break--refactoriza-en-una-rama-no-en-main) |
| Push, PR, code review, deshacer cambios (`restore`/`revert`/`reflog`) | [M04 Git break](./modulo-04-setup-fixtures/#-git-break--sube-tu-trabajo-a-github-y-abre-un-pr) |
| GitHub Actions matrix CI, `secrets.*`, artefactos, traces | [M06](./modulo-06-ci-debugging/) |
| Workflows de equipo, rebase interactivo, tags, aliases, branch protection | [`git-github-course/`](../git-github-course/) (referencia profunda, opcional) |

### Apéndices opcionales (fuera de las 4-6 h)

- **A1 — Codegen:** `pnpm codegen` para prototipar specs rápido.
- **A2 — Playwright MCP + agentes AI:** revive del commit `58d61c2` si se quiere recuperar.

---

## Framework final

```
playwright-course/
├── playwright.config.ts              # projects: setup, ui-chromium/firefox/webkit, api, anonymous
├── .env.example                      # plantilla versionada
├── .env                              # secretos locales (gitignored)
├── .auth/                            # storageState por rol (gitignored)
├── types/                            # User, Market, Pizza, Order, …
├── data/                             # users.json, markets.json
├── helpers/                          # unique-data.ts (data isolation)
├── pages/                            # BasePage (normal) + LoginPage + CatalogPage + CheckoutPage
├── services/                         # BaseService (abstract) + Auth/Order/PizzaService
├── fixtures/                         # omnipizza.ts — custom fixtures
├── tests/
│   ├── setup/auth.setup.ts           # login vía API, persiste storageState
│   ├── smoke/                        # @smoke
│   ├── regression/                   # @regression
│   └── api/                          # API pura (project "api", sin storageState de UI)
├── .github/workflows/
│   └── playwright.yml                # matrix: 3 browsers × 2 shards + api
└── modulo-0X-*/                      # 6 módulos con README + ejemplo + reto
```

---

## Requisitos

- Node.js **v20+** (v18+ mínimo).
- **pnpm** 10+ (`npm install -g pnpm`).
- VS Code con la extensión oficial **Playwright Test for VSCode**.
- GitHub CLI (`gh`) para el módulo M06.
- Recomendado: haber completado [TypeScript para QA](../typescript-qa-course/). Git/GitHub se enseña embebido aquí (M00 + *Git breaks* en M03/M04); el [curso completo de Git/GitHub](../git-github-course/) es referencia profunda opcional.

## Setup inicial

```bash
cd playwright-course
pnpm install
pnpm exec playwright install           # descarga chromium/firefox/webkit

# Variables de entorno
cp .env.example .env                   # .env NO se commitea
```

## Cómo correr

```bash
# Toda la suite (incluye setup project como dependencia)
pnpm test

# Un módulo específico
# M00 — Git esencial: sólo Markdown, sin script (lee modulo-00-git-esencial/README.md)
pnpm m1   # M01 — Smoke feo
pnpm m2   # M02 — Locators + Data
pnpm m3   # M03 — POM
pnpm m4   # M04 — Setup + Fixtures
pnpm m5   # M05 — API Layer
pnpm m6   # M06 — CI/CD + Trace Viewer

# Por project
pnpm test:setup                        # sólo tests/setup/
pnpm test:chromium                     # sólo ui-chromium
pnpm test:api                          # sólo tests/api/

# Modos de ejecución
pnpm test:ui                           # UI mode (recomendado para aprender)
pnpm test:headed                       # con browser visible
pnpm test:debug                        # Inspector paso a paso

# Tags
pnpm test:smoke                        # --grep @smoke
pnpm test:regression                   # --grep @regression

# Reportes
pnpm report                            # HTML report del último run

# Type-check
pnpm typecheck                         # tsc --noEmit
```

---

## Filosofía del curso

1. **Un módulo = una pieza del framework.** Nada es teoría aislada.
2. **Conceptos JIT.** `abstract`, `extends`, fixtures aparecen cuando el problema los pide.
3. **Smoke feo → dolor → refactor.** El patrón se gana, no se impone.
4. **Analogías QA.** Cada concepto se ancla al mundo que ya conoces (bugs, test plans, Postman).
5. **Tests contra el deploy real.** Todo corre contra OmniPizza live.
6. **Reto al final de cada módulo.** Práctica activa > lectura pasiva.

---

## Convenciones

- **Código:** nombres, funciones, clases y selectores en **inglés**.
- **Comentarios y documentación:** **español**.
- **Selectores:** jerarquía `getByRole` > `getByLabel`/`getByText` > `getByTestId` > CSS > XPath.
- **Paralelismo:** `fullyParallel: true` con data isolation (`uniqueEmail`/`uniqueOrderId`).
- **Deploy:** OmniPizza live en Render (backend con cold start ~30-40s).

➡️ Empieza por el [Módulo 1 — Smoke feo](./modulo-01-smoke-feo/).
