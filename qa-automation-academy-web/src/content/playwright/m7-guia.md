# M07 · Guía del módulo: AI Test Harness con Claude Code

**Duración estimada:** 90-120 min
**Pieza que suma al framework:** un **AI Test Harness** completo — un framework E2E de Playwright + TypeScript generado **desde cero por Claude Code** en una carpeta externa, con arquitectura vertical-slice, patrones de diseño, principios SOLID/DRY/KISS, ejecución **en paralelo** y una matriz **cross-browser + responsive** — para cualquier SUT indicando solo la URL de UI y la de API.

> ⚠️ Este módulo es el **capstone** del curso y se hace *después* de M01–M06. Todo lo que aprendiste (locators, POM, fixtures, API layer, CI, debugging) es lo que ahora vas a **dirigir y verificar** en el código que la IA genera. Si no distingues un locator frágil de uno robusto, la IA te va a sepultar en slop sin que lo notes.

---

## 🧭 Reencuadre: de "un test suelto" a "un framework generado"

En M07 dejamos de pedirle a la IA "un test". El salto profesional es usar **Claude Code** como un ingeniero asistido para **crear, verificar, refactorizar y mantener** un framework E2E completo. La diferencia con el ingeniero novato es el **método**:

| Ingeniero novato | Este módulo |
|---|---|
| *"Claude, hazme un framework de Playwright completo."* | Carpeta externa vacía → contrato persistente → prompts pequeños → una slice a la vez |
| Código grande, frágil, imposible de revisar | Slices verticales verificadas una por una |
| La IA decide la arquitectura | **Tú** fijas arquitectura (`AGENTS.md`), alcance (`TEST_PLAN.md`) y calidad |

> 🎯 **Lema del módulo:** **la IA ejecuta el trabajo mecánico; tú controlas arquitectura, alcance, verificación y calidad.** El contrato (`AGENTS.md`) es lo que hace que cada prompt sea corto y no gaste tokens repitiendo reglas.

---

## 🏗️ Arquitectura al terminar este módulo

El harness vive en una **carpeta externa** (fuera del repo del curso, separado del SUT). Su forma es **vertical-slice**: cada feature es autocontenida.

```
omnipizza-ai-harness/                estado FINAL
├── AGENTS.md              ← 🆕 contrato de arquitectura (lo lee la IA antes de cada slice)
├── PROJECT_BRIEF.md       ← 🆕 misión + URLs del SUT
├── TEST_PLAN.md           ← 🆕 matriz de casos UI/API descubierta con MCP
├── package.json           ← 🆕 scripts: test:ui · test:cross · test:api · test:smoke ...
├── playwright.config.ts   ← 🆕 fullyParallel + matriz cross-browser + responsive
├── tsconfig.json
└── src/
    ├── core/              ← 🆕 infraestructura (NO negocio)
    │   ├── env.ts             Singleton de config
    │   ├── BasePage.ts        Template Method (POM) + helper tid() viewport-aware
    │   ├── BaseService.ts     Template Method (API)
    │   ├── reporter.ts        Observer
    │   └── auth/LoginStrategy.ts   Strategy (login UI vs API)
    ├── shared/
    │   ├── types.ts           contratos de dominio
    │   ├── fixtures.ts        Dependency Injection (test extendido)
    │   └── data/*.json        datos tipados para casos data-driven
    └── features/          ← 🆕 slices verticales (una carpeta por feature)
        └── <slice>/
            ├── <slice>.page.ts      ├── <slice>.flow.ts   ├── <slice>.service.ts
            ├── <slice>.factory.ts   (solo si se necesita)
            ├── <slice>.spec.ts      ← spec UI co-localizada
            └── <slice>.api.spec.ts  ← spec API co-localizada
```

> 🎯 **Regla estructural no negociable:** **NO** hay carpetas de capa (`src/pages/`, `src/services/`, `src/flows/`, `src/tests/ui`, `src/tests/api`). Todo lo que una feature necesita vive **dentro** de `src/features/<slice>/`, con los specs **co-localizados**. Vertical slice, no capas horizontales.

La **referencia de forma esperada** vive en [`test-ia-harness`](https://github.com/gsanchezm/playwright-course/tree/main/playwright-course/modulo-07-ia-mcp/test-ia-harness). No es para copiarla: sirve para comparar si la salida de la IA tiene la forma correcta.

---

## Analogía de apertura

Pedirle a la IA "hazme todo el framework" es como contratar a un albañil y decirle *"constrúyeme una casa"* sin planos: te la entrega, pero cada pared está donde él quiso.

Este módulo te da los **planos** primero: `AGENTS.md` es el contrato (dónde va cada patrón, cómo se nombran los exports, qué locators se permiten), `TEST_PLAN.md` es la lista de obra (qué casos UI/API existen), y **Playwright MCP** es el metro con el que la IA **mide la app real** antes de escribir un locator. Con planos + medición, cada slice sale igual a la anterior y tú solo apruebas.

> 🎯 **En breve:** el valor no es que la IA escriba tests, es que los escribe **contra un contrato que tú controlas** y **midiendo la app real** (MCP), no de memoria.

---

## Conceptos JIT

| Concepto | Analogía QA |
|---|---|
| **Vertical slice** (`features/<slice>/`) | Cada feature es un expediente completo: su Page, su Service, su Flow y sus specs en la misma carpeta. |
| **`AGENTS.md`** | El *manual de estilo* del equipo: la IA lo lee antes de cada slice para no reinventar reglas. |
| **`TEST_PLAN.md`** | El *plan maestro de pruebas*: matriz de casos UI/API descubierta con evidencia, no inventada. |
| **Playwright MCP** | Un *browser en vivo* que la IA maneja para leer roles/labels/testids reales antes de codificar. |
| **`fullyParallel`** | Varias cajas registradoras abiertas: los tests corren a la vez, no en fila. |
| **Matriz cross-browser** | Probar el mismo checkout en Chrome, Firefox y Safari — motores distintos, mismos requisitos. |
| **Responsive (`<768px`)** | El viewport móvil activa la rama `-responsive` de los testids: valida que la UI chica también funciona. |
| **Skill reutilizable** | Encapsular todo el protocolo para repetirlo en otro SUT con menos instrucciones. |

---

## Setup paso a paso

### Paso 0 — Pre-requisitos

```bash
$ node --version        # ≥ 20
$ pnpm --version        # ≥ 9  (o habilítalo con: corepack enable pnpm)
$ claude --version      # Claude Code instalado y con sesión
$ git --version
$ gh --version          # opcional, solo para el commit + push final (prompt 08)
```

Playwright MCP se descarga con `npx` a la primera invocación — no instalas nada antes.

### Paso 1 — Genera los scripts de setup (prompt 00)

Desde el repo del curso, pega [`prompts/00-create-setup-scripts.md`](https://github.com/gsanchezm/playwright-course/blob/main/playwright-course/modulo-07-ia-mcp/prompts/00-create-setup-scripts.md). La IA crea/refresca `scripts/setup-ai-harness.ps1` (Windows) y `.sh` (macOS/Linux). Usar IA para preparar tu propio ambiente ya es parte del ejercicio.

### Paso 2 — Crea la carpeta externa y entra a Claude Code

```bash
$ ./playwright-course/modulo-07-ia-mcp/scripts/setup-ai-harness.sh "$HOME/tmp/omnipizza-ai-harness"
$ cd "$HOME/tmp/omnipizza-ai-harness"
$ claude
```

> 🪟 **Windows / PowerShell:** `.\playwright-course\modulo-07-ia-mcp\scripts\setup-ai-harness.ps1 -TargetDir C:\tmp\omnipizza-ai-harness`

El script escribe `PROJECT_BRIEF.md`, `CLAUDE.md`, `.mcp.json` (config de Playwright MCP), `.vscode/mcp.json`, copia los `prompts/` y hace `git init`. **No** crea `src/` ni `package.json`: eso lo genera la IA en el paso 4. Para otro SUT, cambia solo las URLs: `--ui-url`/`--api-url` (bash) o `-UiUrl`/`-ApiUrl` (PowerShell).

### Paso 3 — Verifica ambiente + MCP (prompt 01)

Pega `prompts/01-bootstrap-environment.md`. La IA confirma versiones reales y **prueba MCP navegando a una página real** (no de memoria). Verifícalo tú también:

```bash
$ claude mcp list
playwright    npx @playwright/mcp@latest    ✓ connected
```

> ⚠️ Si la IA responde "hay N links" **sin invocar la tool del browser**, MCP no está conectado. Revisa `.mcp.json` antes de seguir.

### Paso 4 — Fundación + `AGENTS.md` (prompt 02)

Pega `prompts/02-master-architect.md`. Crea **solo la fundación** (sin features todavía): `AGENTS.md`, `package.json`, `playwright.config.ts`, `tsconfig.json`, `.env.example`, `src/core/`, `src/shared/`. Aquí es donde entra el harness **paralelo + cross-browser + responsive** 👇

> **📐 Config — `playwright.config.ts` corre en paralelo y cross-browser**
>
> ```diff
>   export default defineConfig({
>     testDir: "./src/features",
> +   fullyParallel: true,
> +   forbidOnly: !!process.env.CI,
> +   retries: process.env.CI ? 2 : 0,
> +   workers: process.env.CI ? 2 : undefined,   // CI: 2 · local: ~50% de cores
>     reporter: [["list"], ["./src/core/reporter.ts"]],
>     use: { baseURL: process.env.BASE_URL, trace: "retain-on-failure" },
>     projects: [
> -     { name: "ui-chromium", use: { ...devices["Desktop Chrome"] }, testIgnore: /.*\.api\.spec\.ts/ },
> +     { name: "ui-chromium",      use: { ...devices["Desktop Chrome"] },  testIgnore: /.*\.api\.spec\.ts/ },
> +     { name: "ui-firefox",       use: { ...devices["Desktop Firefox"] }, testIgnore: /.*\.api\.spec\.ts/ },
> +     { name: "ui-webkit",        use: { ...devices["Desktop Safari"] },  testIgnore: /.*\.api\.spec\.ts/ },
> +     { name: "ui-mobile-chrome", use: { ...devices["Pixel 5"] },         testIgnore: /.*\.api\.spec\.ts/ },
> +     { name: "ui-mobile-safari", use: { ...devices["iPhone 13"] },       testIgnore: /.*\.api\.spec\.ts/ },
>       { name: "api", use: { baseURL: process.env.API_URL }, testMatch: /.*\.api\.spec\.ts/ },
>     ],
>   });
> ```

Tres piezas que debes entender de ese bloque:

| Pieza | Qué hace |
|---|---|
| `fullyParallel: true` | Cada archivo corre en su propio worker y, dentro del archivo, los tests también van en paralelo. |
| Los **5 projects de UI** | Prueban los mismos `*.spec.ts` en Chromium, Firefox, WebKit y dos viewports móviles. Todos comparten `testIgnore` para que las specs de API **nunca** abran un browser. |
| El project `api` | Corre **solo** los `*.api.spec.ts` (`testMatch`), sin navegador — las pruebas de API no necesitan uno. |

> 🔍 **Detalle que parece obvio — los projects móviles (`Pixel 5`, `iPhone 13`)**
>
> **Qué es:** dos projects con viewport <768px que corren la misma suite de UI.
> **Por qué así (y no solo desktop):** el `BasePage.tid()` del harness resuelve testids con sufijo `-desktop` (≥768px) o `-responsive` (<768px). Los projects móviles ejercitan **la otra mitad** de los testids.
> **Qué pasa si lo cambias:** si quitas los projects móviles, un locator que solo resuelve `-desktop` pasa en CI y **explota en producción móvil**. La matriz responsive es tu red de seguridad.

### Paso 5 — Descubre la app y crea `TEST_PLAN.md` (prompt 03)

Pega `prompts/03-test-plan.md`. La IA **navega la UI con MCP**, descubre endpoints (`/openapi.json`, `/docs`, `/health`, probes livianos) y escribe `TEST_PLAN.md` con la matriz de casos UI/API. Si el SUT tiene menú/sidebar/tabs, el plan exige un Page Object llamado `MenuPage`. Tu trabajo: revisar que el plan sea razonable **antes** de dejar que implemente.

### Paso 6 — Genera slices (prompt 04, una por slice)

Pega `prompts/04-slice-generator.md` una vez por slice del plan:

```
SLICE=<slice folder name from TEST_PLAN.md>
SEED_SLICE=<empty para la primera; una slice ya hecha para las siguientes>
```

La IA **navega con MCP para confirmar selectores reales**, luego genera `src/features/<slice>/` con specs co-localizados. Verifica cada slice:

```bash
$ pnpm typecheck
$ pnpm exec playwright test src/features/<slice> --project=ui-chromium
$ pnpm exec playwright test src/features/<slice> --project=api   # si hay *.api.spec.ts
```

> 💡 `ui-chromium` es el loop rápido. Cuando la slice quede verde, corre `pnpm test:cross` para pasarla por toda la matriz (Firefox, WebKit y los dos móviles). Ahí saltan los problemas de motor o de viewport responsive.

### Paso 7 — Fixtures/DI y CI (prompts 05 y 06)

`prompts/05-fixtures-di.md` cablea `src/shared/fixtures.ts` (inyección de dependencias) sin meter lógica de feature en `shared/`. `prompts/06-ci-scripts.md` agrega scripts y un workflow de GitHub Actions con **dos jobs**:

- **`test`** — corre en cada push/PR, rápido: instala solo Chromium y corre `typecheck` + `test:smoke` + `test:api` + `test:ui`.
- **`cross-browser`** — opt-in (`workflow_dispatch` o nightly): instala Chromium/Firefox/WebKit y corre `pnpm test:cross`.

> 🎯 **Por qué dos jobs:** los PRs quedan rápidos (chromium) y la matriz completa corre bajo demanda. Instalar 3 motores en cada push sería lento y caro sin agregar señal en el 99% de los cambios.

### Paso 8 — Healer, commit y skill (prompts 07 → 10)

- `prompts/07-healer-review.md`: pégale los outputs reales de `typecheck`/`test:ui`/`test:api` y corrige lo mínimo.
- `prompts/08-git-github-pr.md` (opcional): commit + `gh repo create` + push a `main`; ahí corre el CI por fin en GitHub.
- `prompts/09-create-reusable-skill.md` y `10-use-skill-to-bootstrap-harness.md` (opcional): encapsulan el protocolo en una **skill** agnóstica de IA para repetirlo en otro SUT.

---

## ▶️ Cómo ejecutar este módulo

- **Comando del módulo:** los prompts se pegan en Claude Code, en orden (`00 → 10`). El orden importa: cada prompt asume el contrato y el plan de los anteriores.
- **Loop rápido de UI:** `pnpm test:ui` (solo Chromium).
- **Matriz completa:** `pnpm test:cross` (Chromium + Firefox + WebKit + Pixel 5 + iPhone 13).
- **Solo móvil / responsive:** `pnpm test:mobile`.
- **Solo API:** `pnpm test:api`. **Smoke:** `pnpm test:smoke` (Chromium, rápido).
- **Reporte:** `pnpm report`.

> 🪟 **Windows / PowerShell:** los scripts `pnpm ...` son idénticos; solo cambia el comando del setup script (`.ps1` con `-TargetDir`).

---

## Señales de mala salida de IA (recházalas)

1. **Carpetas de capa** (`src/pages`, `src/services`, `src/tests/ui`): estructura equivocada — todo va en `src/features/<slice>/`.
2. Locators CSS profundos o **XPath**, o `waitForTimeout`.
3. Slices que tocan archivos de otra feature sin necesidad.
4. `core/` importando de `features/`.
5. Tests con >2 assertions sueltas, o login UI repetido en cada spec sin razón.
6. Locators inventados **sin haber navegado con MCP** primero.
7. `TODO` en archivos del harness o código que no compila.

---

## Outcome esperado

- [ ] Tienes una **carpeta externa** con un harness generado por Claude Code, versionado con git.
- [ ] `AGENTS.md` define patrones, nombres de export y reglas; `TEST_PLAN.md` tiene matriz UI/API basada en evidencia MCP.
- [ ] La estructura es **vertical-slice**: `src/features/<slice>/` con specs co-localizados y **sin** carpetas de capa.
- [ ] `playwright.config.ts` corre `fullyParallel` con matriz **cross-browser + responsive** (`ui-chromium/firefox/webkit` + `ui-mobile-chrome/ui-mobile-safari`) y un project `api` sin browser.
- [ ] `pnpm typecheck` verde y al menos un spec UI + un spec API (o un bloqueo API documentado con evidencia).
- [ ] Corriste `pnpm test:cross` y entiendes qué agrega cada motor/viewport.
- [ ] Sabes qué hizo bien Claude Code y qué tuviste que corregir tú.

---

> 📚 **Profundización opcional:**
> - [Playwright — Test projects & parallelism](https://playwright.dev/docs/test-parallel) — `fullyParallel`, `workers`, projects.
> - [Playwright — Emulation (devices)](https://playwright.dev/docs/emulation) — viewports móviles y `devices`.
> - [Playwright MCP — README oficial](https://github.com/microsoft/playwright-mcp) — tools del browser para discovery.
> - [Anthropic — Building effective agents](https://www.anthropic.com/engineering/building-effective-agents) — patrones para agentes que generan/mantienen código.
