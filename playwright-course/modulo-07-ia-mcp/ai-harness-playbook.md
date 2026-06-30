# Playbook — Generar un framework E2E con IA (AI Test Harness)

> 🧪 **Apéndice avanzado de M07.** Aquí no usas la IA como copiloto sobre un
> framework existente (eso es el resto de M07): aquí le das un **harness de prompts**
> para que **genere desde cero** un framework E2E completo (UI+API) con patrones de
> diseño, principios SOLID/DRY/KISS, **clean code** y **vertical slicing**.

---

## 🧭 Idea en una frase

Un **AI Test Harness** = un **contrato de arquitectura** (`AGENTS.md`) + una
**secuencia corta de prompts**. Corres un **master prompt** una vez (crea el
esqueleto y el contrato), luego un **prompt de slice** una vez por feature, y dos
prompts cross-cutting (DI y CI). La IA ancla locators reales con **Playwright MCP**.

> 🎯 **Por qué funciona:** el contrato + el primer slice (semilla) le dan a la IA
> *tus* convenciones; cada slice nuevo las **copia** en vez de inventar. Es el mismo
> truco que el `seed.spec.ts` de los Playwright Agents.

---

## ✅ Prerrequisitos

1. Un cliente con **Playwright MCP** conectado (ver [`README.md`](./README.md) §Setup —
   Claude Code / Copilot Agent / Gemini CLI / Claude Desktop).
2. Verifica la conexión (debe **invocar una tool**, no responder de memoria):
   ```
   Call "browser_navigate" with url "https://example.com", then "browser_snapshot",
   and tell me how many links the page has.
   ```
3. Una carpeta destino vacía (ej. `mi-framework/`). Todo lo que genere la IA cae ahí.

> 📐 **Backend: MCP (no CLI).** En eficiencia de tokens el **CLI gana ~4×**, pero
> **MCP es más sencillo de aprender** (setup de 1 línea, conversacional, igual en
> todos los clientes) y a escala de aprendizaje el costo de tokens no es el cuello de
> botella. Cuando lleves esto a volumen real, cambia al backend CLI / Playwright
> Agents — ver [§Apéndice scale-up](#-apéndice-scale-up-cli--playwright-agents).

---

## 📋 Orden de ejecución

| # | Prompt | Cuándo | Produce |
|---|---|---|---|
| 1 | 🎯 **MASTER / ARCHITECT** | una vez | `AGENTS.md` + config + `core/` + `shared/` |
| 2 | 🔁 **SLICE GENERATOR** | **1× por feature** | `features/<feature>/` completo |
| 3 | 🔌 **FIXTURES / DI** | después de los slices | `shared/fixtures.ts` cableado |
| 4 | ⚙️ **CI + scripts** | una vez | `package.json` scripts + GitHub Actions |
| 5 | 🩹 **HEALER / SELF-REVIEW** | al final (y al fallar) | suite verde, sin anti-patterns |

> ⚠️ **Regla de oro:** **un prompt = un alcance acotado.** No pidas "genera todo el
> framework" — vas a obtener slop sin revisar. El harness está *diseñado* en pasos
> chicos por eso.

---

## 1) 🎯 Master prompt (Architect)

Córrelo **una sola vez** en la carpeta destino. Crea el contrato y el esqueleto, **sin
código de feature todavía**.

```
CONTEXT:
I am bootstrapping a NEW Playwright + TypeScript E2E framework in this empty folder.
Target app under test: <APP_URL>  (UI) and <API_URL>  (REST API).
If you have Playwright MCP / browser tools, navigate <APP_URL> to learn its structure.
The FOUNDATION below needs NO real selectors yet (those arrive in the slice prompt), so
if you lack browser tools, proceed anyway and record any app-specific guess in AGENTS.md.

TASK:
Scaffold the FOUNDATION (no feature code yet):
1. AGENTS.md  — the architecture contract: folder tree, the pattern->home table, the
   principles, the EXPORT-NAMING rules (below), and the locator/API rules. ALSO record
   the concrete choices you make (env var names, tsconfig module setting, the
   LoginStrategy/fixture shapes) so every later prompt stays consistent. Later prompts
   read this file first.
2. playwright.config.ts (projects: ui-chromium + api), tsconfig.json, package.json,
   .env.example, .gitignore, README.md.
3. src/core/   — cross-cutting, NO feature logic:
     env.ts          # Singleton: a frozen config object read once from process.env
     BasePage.ts     # Template Method: base POM (constructor(page), tid(), waitForUrl)
     BaseService.ts  # Template Method: abstract API base (basePath(), url(), dispose())
     reporter.ts     # Observer: a custom Playwright Reporter (onBegin/onTestEnd/onEnd)
     auth/LoginStrategy.ts  # Strategy: UiLoginStrategy vs ApiLoginStrategy (each takes
                            # its dependency — page vs request — via constructor)
4. src/shared/ — types.ts (domain contracts), fixtures.ts (DI: extended test — ready to
   wire slices later; do NOT import slices that don't exist yet), data/ (seed JSON).

EXPORT-NAMING (FIXED — later prompts import these exact names):
- Page = <Feature>Page (e.g. AuthPage)   Service = <Feature>Service   Flow = <Feature>Flow
- Factory named by ENTITY = <Entity>Factory (e.g. UserFactory)   Builder = <Entity>Builder
- File names: *.page.ts / *.service.ts / *.factory.ts / *.flow.ts / *.builder.ts
- reporter.ts = default export; env.ts exports a frozen `env` singleton (never `new`).

ARCHITECTURE (encode in AGENTS.md; each pattern appears EXACTLY ONCE):
- POM = src/features/*/*.page.ts        - Service/Adapter = src/features/*/*.service.ts
- Template Method = src/core/BasePage.ts + BaseService.ts   - Factory = *.factory.ts
- Builder = the complex entity's *.builder.ts   - Facade = src/features/*/*.flow.ts
- Singleton = src/core/env.ts   - Observer = src/core/reporter.ts   - Strategy = src/core/auth/
- DI = src/shared/fixtures.ts
PRINCIPLES: SOLID (SRP per file, OCP=add a slice without touching core, DIP=tests
depend on flows/fixtures), DRY (core+shared), KISS/YAGNI (a layer exists only when it
earns its place — not every slice has every layer), vertical slicing (src/features/<f>/).

RULES:
- Locators (when slices arrive): ONLY getByRole / getByLabel / getByTestId. No deep CSS, no XPath.
- NEVER use waitForTimeout. Use web-first assertions / waitFor.
- Identifiers in English; comments in Spanish.
- Real, compiling TypeScript. No placeholders, no TODOs.

DELIVERY: write the files; give me a one-line tree of what you created. Do not explain.
```

**→ Rellenado para OmniPizza:**

| Placeholder | Valor |
|---|---|
| `<APP_URL>` | `https://omnipizza-frontend.onrender.com` |
| `<API_URL>` | `https://omnipizza-backend.onrender.com` |

> 🔍 Este es **el** "master prompt" que preguntabas: es el único que fija el contrato.
> Los siguientes prompts **dependen** de que `AGENTS.md` exista.

---

## 2) 🔁 Slice generator (repetible — 1× por feature)

Este es el caballo de batalla. Córrelo **una vez por cada feature**
(`auth`, luego `catalog`, luego `cart`, luego `checkout`, …). El **primer slice que
generes es la semilla**: revísalo a fondo, porque los demás lo van a imitar.

```
CONTEXT:
Read AGENTS.md (the architecture contract) and, if it exists, the previous slice
src/features/<SEED_FEATURE>/ as the pattern to mirror EXACTLY.
Now navigate <APP_URL> for the "<FEATURE>" feature using Playwright MCP and confirm
the REAL selectors (role + accessible name, or data-testid). Do not invent any.

TASK:
Generate the "<FEATURE>" vertical slice under src/features/<FEATURE>/ following the
contract. Typical files (omit a layer if the feature doesn't need it — KISS):
- <FEATURE>.page.ts     # POM extending BasePage; private locator getters + public actions
- <FEATURE>.service.ts  # only if the feature has an API; extends BaseService
- <FEATURE>.factory.ts  # only if it needs test entities; name it by ENTITY
- <FEATURE>.flow.ts     # Facade: one method = one business journey
- <FEATURE>.spec.ts     # import { test, expect } from "../../shared/fixtures"
The main domain entity here is <ENTITY>. If <ENTITY> is complex (many fields /
variants), add <FEATURE>.builder.ts (Builder) instead of a flat factory.

RULES:
- Mirror the seed slice's structure, naming and comment style 1:1.
- Locators ONLY getByRole/getByLabel/getByTestId. No waitForTimeout.
- Tag at least one happy-path test @smoke.
- Real compiling TypeScript. Do NOT edit fixtures.ts or files outside this slice.

DELIVERY: only the slice files; one-line list of what you wrote.
```

**→ Rellenado para OmniPizza (corre uno por fila, en este orden):**

| Vuelta | `<FEATURE>` | `<SEED_FEATURE>` | `<ENTITY>` | Capas |
|---|---|---|---|---|
| 1 (semilla) | `auth` | — | `User` | page · service · factory · flow · spec + **Strategy** |
| 2 | `catalog` | `auth` | `Pizza` | page · service · flow · spec |
| 3 | `cart` | `auth` | — | page · flow · spec *(UI-only, sin service)* |
| 4 | `checkout` | `auth` | `Order` | page · service · **builder** · factory · flow · spec |

> 🔍 Fíjate que **no todo slice tiene todas las capas**: `cart` es UI pura, `checkout`
> es el más rico (lleva Builder). Eso **es** KISS/YAGNI en acción — la capa aparece
> sólo cuando se gana su lugar.

> ⚠️ **Verifica después de CADA slice:** la IA debe **abrir el browser por MCP**
> antes de escribir. Si genera sin navegar, los selectors están inventados — recházalo.

---

## 3) 🔌 Fixtures / DI

Cuando ya existen los slices, cablea la inyección de dependencias.

```
CONTEXT: Read AGENTS.md and every src/features/*/*.page.ts and *.flow.ts.
TASK: Wire src/shared/fixtures.ts (Dependency Injection): an extended Playwright
`test` that provides each slice's Page and Flow already constructed (authPage,
authFlow, catalogPage, catalogFlow, ...), plus data fixtures (e.g. standardUser,
defaultMarket) read from shared/data. Re-export { test, expect }.
RULES: import slices by their exact exported class names. No logic in fixtures beyond
construction. Real compiling TypeScript.
DELIVERY: only fixtures.ts.
```

---

## 4) ⚙️ CI + scripts

```
CONTEXT: Read package.json and playwright.config.ts.
TASK:
1. Add pnpm scripts: test, test:ui (--project=ui-chromium), test:api (--project=api),
   test:smoke (--grep @smoke), typecheck (tsc --noEmit), report.
2. Create .github/workflows/e2e.yml: on push/PR, node 20, install deps + browsers,
   run typecheck then the smoke suite, upload the HTML report as an artifact.
RULES: pin actions by major version; cache the store; do not commit secrets — read
URLs/creds from repo secrets / env.
DELIVERY: the two files only.
```

---

## 5) 🩹 Healer / self-review

Córrelo al final, y cada vez que un test falle.

```
CONTEXT: The framework is generated. Here is the failing output:
<<paste the `playwright test` / `tsc` output>>

TASK:
1. Run the suite (or typecheck) and find the root cause of each failure.
2. Fix WITHOUT weakening the architecture: keep the patterns, the export names and the
   contract in AGENTS.md.
3. Remove any anti-patterns you find (waitForTimeout, deep CSS, hardcoded sleeps,
   duplicated logic that belongs in core/shared).
4. Re-run until green (max 3 iterations). If still red, list exactly what is blocked.

RULES: web-first assertions only. Show me the diff before applying.
DELIVERY: the fixes + a one-line summary per file changed.
```

> ⚠️ **Review humano obligatorio en el healing.** Un "auto-fix" de locators puede
> agarrar un elemento *parecido pero equivocado*. Lee el diff antes de aceptar.

---

## 🔬 Cómo manejar el flujo (resumen operativo)

1. Master prompt → revisa el `AGENTS.md` y el esqueleto.
2. Slice `auth` (semilla) → **revísalo bien**; es el molde de los demás.
3. Slices `catalog` → `cart` → `checkout` → corre cada `.spec` antes de seguir.
4. Fixtures → CI.
5. Healer hasta verde.
6. **Nunca commitees lo que la IA no haya corrido.** Mide: ¿cuántas iteraciones por
   slice? Ése es el límite real de tu stack hoy.

---

## 📦 Output esperado (referencia, no diff exacto)

La carpeta [`ejemplo-harness/`](./ejemplo-harness/) es una **referencia de la forma
esperada** — la estructura, las capas y los patrones que este playbook produce — con
los locators **ya anclados a testids verificados** de OmniPizza (4 slices: auth,
catalog, cart, checkout, + un `catalog.api.spec.ts` que ejercita la capa de API).

> ⚠️ **No es la salida literal de pegar estos prompts.** Se generó con un arnés interno
> que ya tenía el contrato y los selectores verificados **inyectados**, a propósito,
> para darte un **objetivo estable de comparación**. Tu corrida real con MCP **variará**
> (orden de archivos, nombres de tests, los locators que la IA confirme en vivo). Úsala
> como brújula, no como `diff`. Está **type-checkeada** (`tsc --noEmit`) y **listada**
> (`playwright test --list`), pero **no** corrida verde contra el OmniPizza en vivo —
> eso es tu ejercicio.

```
ejemplo-harness/
├─ AGENTS.md
├─ playwright.config.ts · tsconfig.json · package.json
└─ src/
   ├─ core/   env.ts(Singleton) · BasePage/BaseService(Template Method) · reporter.ts(Observer) · auth/LoginStrategy.ts(Strategy)
   ├─ shared/ types.ts · fixtures.ts(DI) · data/
   └─ features/  auth · catalog · cart · checkout   (vertical slices)
```

> 🔍 **Convención UI vs API:** los specs de UI son `*.spec.ts` (project `ui-chromium`);
> los de API son `*.api.spec.ts` (project `api`, apuntan al backend, sin browser).

### Mapa de patrones (referencia)

| Patrón | Dónde | Patrón | Dónde |
|---|---|---|---|
| POM | `*.page.ts` | Singleton | `core/env.ts` |
| Service/Adapter | `*.service.ts` | Observer | `core/reporter.ts` |
| Template Method | `core/Base*.ts` | Strategy | `core/auth/LoginStrategy.ts` |
| Factory | `*.factory.ts` | Facade | `*.flow.ts` |
| Builder | `checkout.builder.ts` | DI | `shared/fixtures.ts` |

---

## 🚀 Apéndice scale-up (CLI + Playwright Agents)

Cuando esto sea **trabajo real y a volumen**, cambia el motor para ahorrar ~4× en
tokens y automatizar el ciclo plan→genera→cura:

```bash
# instala los 3 agentes nativos (planner / generator / healer) para tu cliente
$ pnpm exec playwright init-agents --loop=claude   # o vscode | gemini | opencode
```

- **planner** → explora la app y produce un plan en Markdown (`specs/`).
- **generator** → convierte el plan en los `.spec.ts`, anclando contra la app real.
- **healer** → corre la suite y repara locators rotos.

El `AGENTS.md` de este playbook sirve **tal cual** como semilla del generator. El
backend **CLI** escribe los snapshots a disco (no inyecta el accessibility tree en el
contexto cada turno) → **~4× menos tokens** que MCP, sin context-pollution en sesiones
largas. Trade-off: es **experimental** y el healer necesita **review humano**.

| | MCP (este playbook) | CLI / Agents (scale-up) |
|---|---|---|
| Tokens / tarea | ~114K | ~27K (≈4×, hasta 10× en sesiones largas) |
| Aprender | 1 línea, conversacional | `init-agents`, pipeline, seed |
| Madurez | estable | experimental |
| Mejor para | aprender, exploración, debug | codegen + mantenimiento a escala |

---

> 📚 **Fuentes:** [Playwright Test Agents](https://playwright.dev/docs/test-agents) ·
> [MCP vs CLI vs Agents 2026](https://www.halmurattahir.com/blog/ai-testing/playwright-mcp-vs-cli-vs-agents-2026/) ·
> [Token efficiency MCP vs CLI](https://docs.bswen.com/blog/2026-03-18-playwright-mcp-vs-cli-token-efficiency/)
