# Curso de Playwright para QA Automation — OmniPizza (v3)

Curso práctico de **Playwright con TypeScript** para Ingenieros de QA que ya pasaron por el curso de [TypeScript](../typescript-qa-course/). **Git/GitHub está integrado aquí** — este curso es autónomo: no necesitas hacer otro curso antes.

**Filosofía v3 — arquitectura incremental:** cada módulo **añade una capa** al framework. Los conceptos de TS / Playwright / Git entran *just-in-time* cuando se necesitan, no como bloques teóricos sueltos. Al terminar M08 tienes un framework E2E + API producción-grade y un flujo Git/GitHub real (commits, branches, PRs, CI).

> 🧱 **Modelo por módulo (v3.1).** Ya **no hay un monorepo raíz**: cada módulo trae su propia carpeta **[`proyecto/`](./modulo-01-smoke-feo/proyecto/)** — un proyecto Playwright **autocontenido y ejecutable** (su propio `package.json` · `playwright.config.ts` · `tsconfig.json` · `.env.example`). El README de cada módulo enseña; su `proyecto/` es el estado "ya resuelto" para clonar, correr y comparar.

| Aspecto | Valor |
|---|---|
| Frontend live | https://omnipizza-frontend.onrender.com |
| Backend live | https://omnipizza-backend.onrender.com |
| Swagger | https://omnipizza-backend.onrender.com/api/docs |
| Stack | React + Vite (front), FastAPI (back) |
| Auth | JWT con usuarios deterministas |
| Mercados | MX / US / CH / JP / SA |
| Duración | 7 – 9 horas, 10 módulos (M00 + 9) |

> ⚠️ Render free tier: backend dormido tarda 30-40s en despertar. El `tests/setup/auth.setup.ts` (M06) absorbe ese cold start con un timeout generoso.

---

## Los 10 módulos (+ M09 opcional)

| # | Módulo | Pieza que añade al framework |
|---|---------|-------------|
| 0 | [Git esencial](./modulo-00-git-esencial/) | Config + `.gitignore` + ciclo `add`/`commit` + `log` (versión condensada) |
| 1 | [Primer smoke](./modulo-01-smoke-feo/) | `ejemplo.spec.ts` plano + `.env` + `dotenv` |
| 2 | [Locators](./modulo-02-locators/) | Jerarquía `getByRole`→`getByTestId`→CSS · filtros/combinadores · scoping · Codegen |
| 3 | [Data-driven](./modulo-03-data-driven/) | `types/*` + `data/*.json` + `for...of` parametrizado por mercado (Playwright no tiene `test.each()`) |
| 4 | [POM incremental](./modulo-04-pom/) | `pages/BasePage.ts` + Login/Catalog/Checkout · *Git break:* feature branches + conflictos |
| 5 | [Fixtures](./modulo-05-fixtures/) | `fixtures/omnipizza.ts` (`test.extend`) + `helpers/unique-data.ts` + `page.route()` · *Git break:* push/PR |
| 6 | [Setup & auth](./modulo-06-setup/) | `tests/setup/auth.setup.ts` (login por UI → `storageState`) + `dependencies: ['setup']` · *Git break:* deshacer cambios |
| 7 | [API Layer](./modulo-07-api-layer/) | `services/BaseService.ts` (abstract) + 3 services + `tests/api/` |
| 8 | [CI/CD + Trace Viewer](./modulo-08-ci-debugging/) | `.github/workflows/playwright.yml` con **matrix cross-browser** (firefox/webkit viven aquí) |
| 9 | [IA + Playwright MCP](./modulo-09-ia-mcp/) *(opcional)* | Cliente LLM + Playwright MCP — copiloto que genera/depura/mantiene tests (no agrega código al framework) |

### Mapa de Git embebido

| Tema | Dónde se enseña |
|---|---|
| Identidad, 3 estados, init/add/commit, `.gitignore`, log básico | [M00](./modulo-00-git-esencial/) |
| Feature branches, merge fast-forward / 3-way, conflictos | [M04 Git break](./modulo-04-pom/) (refactor a POM) |
| Push, PR, code review | [M05 Git break](./modulo-05-fixtures/) (revisar fixtures) |
| Deshacer cambios (`restore`/`revert`/`reflog`) | [M06 Git break](./modulo-06-setup/) (`auth.setup.ts` frágil) |
| GitHub Actions matrix CI, `secrets.*`, artefactos, traces | [M08](./modulo-08-ci-debugging/) |
| Workflows de equipo, rebase interactivo, tags, aliases, branch protection | [`git-github-course/`](../git-github-course/) (referencia profunda, opcional) |

### Apéndices opcionales

- **A1 — Codegen:** `pnpm exec playwright codegen` para prototipar specs rápido (se enseña en M02).
- **A2 — [IA + Playwright MCP](./modulo-09-ia-mcp/)** (opcional, 45-60 min): configura un cliente LLM (Claude / Copilot / Gemini / ChatGPT) con Playwright MCP y Playwright Agents.

---

## Arquitectura del framework (capa por capa)

Cada módulo añade una pieza. No hay un `playwright.config.ts` raíz único: **cada `proyecto/` la trae ya integrada** en su propia config, y el estado más completo vive en el `proyecto/` de los módulos finales.

```
Capa                         Nace en   Pieza
──────────────────────────   ───────   ─────────────────────────────────────
Smoke + .env/dotenv          M01       tests/ejemplo.spec.ts, .env
Locators jerárquicos         M02       (técnica; sin archivos nuevos)
Data tipada                  M03       types/*, data/*.json  (for...of por mercado)
Page Object Model            M04       pages/BasePage.ts + Login/Catalog/Checkout
Fixtures + isolation         M05       fixtures/omnipizza.ts, helpers/unique-data.ts, page.route()
Setup project + storageState M06       tests/setup/auth.setup.ts, .auth/ (gitignored)
API layer                    M07       services/BaseService.ts + Auth/Order/PizzaService, tests/api/
CI + cross-browser           M08       .github/workflows/playwright.yml (matrix firefox/webkit)
AI Test Harness (opcional)   M09       cliente LLM + Playwright MCP
```

---

## Requisitos

- Node.js **v24 LTS** (v20+ mínimo).
- **pnpm** 10+ (`npm install -g pnpm`).
- VS Code con la extensión oficial **Playwright Test for VSCode**.
- GitHub CLI (`gh`) para el módulo M08.
- Recomendado: haber completado [TypeScript para QA](../typescript-qa-course/). Git/GitHub se enseña embebido aquí (M00 fundamentos; crear y conectar el repo a GitHub en M04; PRs y push de trabajo en M05); el [curso completo de Git/GitHub](../git-github-course/) es referencia profunda opcional.

## Cómo correr un módulo

Cada módulo es independiente: entra a **su** `proyecto/` y córrelo aislado.

```bash
# Ejemplo con el Módulo 1
cd modulo-01-smoke-feo/proyecto
pnpm install
pnpm exec playwright install           # descarga chromium (y firefox/webkit en M08)
cp .env.example .env                   # .env NO se commitea

pnpm test                              # corre el módulo
pnpm mN                                # atajo del módulo (m1, m2, … según la carpeta)

# Modos de ejecución (dentro del proyecto/)
pnpm test:ui                           # UI mode (recomendado para aprender)
pnpm test:headed                       # con browser visible
pnpm test:debug                        # Inspector paso a paso
pnpm typecheck                         # tsc --noEmit
pnpm report                            # HTML report del último run
```

> 🪟 **Windows / PowerShell:** para variables de entorno usa `$env:VAR="x"; pnpm test` (no `VAR=x pnpm test`, que es sintaxis bash).

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

➡️ Empieza por el [Módulo 1 — Primer smoke](./modulo-01-smoke-feo/).
