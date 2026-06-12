# M07 · Guía del módulo: IA + Playwright MCP

**Duración estimada:** 45-60 min
**Pieza que suma al framework:** integración de un **asistente de IA** (Claude / Copilot / ChatGPT / Gemini) capaz de **controlar el navegador real** vía Playwright MCP, para generar, depurar y mantener tests usando lenguaje natural. No agrega código nuevo al framework — agrega un **copiloto operativo** sobre la suite que ya tienes desde M01..M06.

> ⚠️ Este módulo es **opcional** y se hace mejor *después* de M06. Asume que ya entiendes locators, POM, fixtures, API layer y CI — porque la IA va a generar contra ese framework.

---

## 🧭 Reencuadre: CLI-first (lee esto antes de configurar nada)

Antes de tocar MCP o Agents, ubica este módulo en el mapa del curso. **Los fundamentos AI-assisted *reales* — los que de verdad te hacen mejor automatizando — son CLI y ya viven en el core del curso:**

| Herramienta AI-assisted (CLI) | Dónde la aprendiste | Para qué sirve |
|---|---|---|
| `playwright codegen <url>` | **M02** | Graba tus clics y **genera locators role-first** automáticamente |
| `playwright test --debug` (Inspector) | **M01** | Pausa, ejecuta paso a paso, **te sugiere selectors** en vivo |
| `playwright show-trace` (Trace Viewer) | **M06** | Reproduce el fallo con DOM/red/screenshots para **diagnosticar flakiness** |

Esas tres no necesitan ningún LLM: son determinísticas, gratis y offline. **Son tu base.** M07 es el **apéndice acelerador**: MCP y Agents valen la pena *cuando ya dominas locators y el modelo mental del framework* — porque tú vas a revisar y endurecer lo que la IA genera. Si todavía no distingues un locator frágil de uno robusto, la IA te va a sepultar en slop sin que lo notes.

> 🎯 **Lema del módulo:** **CLI para aprender · MCP + Agents para acelerar.** No saltes la columna izquierda de la tabla para llegar a la derecha; el orden importa.

---

## 🏗️ Arquitectura al terminar este módulo

M07 **no agrega archivos nuevos al framework de producción** — agrega una **capa de tooling** (MCP server + cliente LLM) que vive *afuera* del repo o en archivos de configuración locales (`.vscode/mcp.json`, `~/Library/Application Support/Claude/claude_desktop_config.json`, etc.).

```
TU MÁQUINA
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│   Cliente LLM                  Playwright MCP server         │
│   ┌─────────────────┐          ┌──────────────────────┐      │
│   │ Claude Desktop  │          │  @playwright/mcp     │      │
│   │ VS Code Copilot │ ◄──MCP──►│  (npx, stdio o sse)  │      │
│   │ ChatGPT app     │          │                      │      │
│   │ Gemini CLI      │          │   ~25 tools:         │      │
│   └─────────────────┘          │   · browser_navigate │      │
│           ▲                    │   · browser_click    │      │
│           │ "Genera un test    │   · browser_type     │      │
│           │  de login para     │   · browser_snapshot │      │
│           │  OmniPizza"        │   · browser_evaluate │      │
│                                │   · ...y más         │      │
│                                └──────────┬───────────┘      │
│                                           │                  │
│                                           ▼                  │
│                                    ┌─────────────┐           │
│                                    │  Chromium   │           │
│                                    │  Firefox    │           │
│                                    │  WebKit     │           │
│                                    └─────┬───────┘           │
│                                          │ HTTP              │
└──────────────────────────────────────────┼──────────────────┘
                                           ▼
                          https://omnipizza-frontend.onrender.com
                              (la app real, sobre la que la
                               IA explora y genera tests)
```

**Qué cambia en tu workflow:**

| Antes de M07 | Después de M07 |
|---|---|
| Escribes selectors a mano viendo DevTools | Le pides a la IA *"abre el catálogo y dame los locators role-based de las pizzas y los filtros"* |
| Debug de tests flakey leyendo trace | Le pegas el trace a la IA, te explica la causa probable |
| Migración de tests de Cypress / Selenium | Le pasas el test viejo + URL, te devuelve la versión en Playwright |
| Mantenimiento cuando la UI cambia | La IA navega la nueva UI y actualiza locators rotos |

---

## Analogía de apertura

Sin MCP, un LLM es un **consultor remoto**: le describes el bug por teléfono y él te dicta el fix sin ver la app. Útil, pero ciego.

Con **Playwright MCP**, ese consultor **se sienta a tu lado y abre tu navegador**. Ve la página, hace clic, lee el DOM, captura un screenshot. Cuando le pides *"genera un test que compre una pizza vegana"*, primero **navega** OmniPizza, **observa** los botones reales, y *luego* escribe el `.spec.ts` con locators que sí existen.

> 🎯 **En breve:** MCP convierte al LLM de **autocompletado** a **operador real del browser**, con la misma API que usas tú en Playwright.

---

## ¿Qué es MCP y por qué importa para QA?

**MCP (Model Context Protocol)** es un estándar abierto creado por Anthropic en 2024 que define **cómo un LLM habla con herramientas externas** — bases de datos, APIs, sistemas de archivos… o un browser.

| MCP en 1 línea | Analogía QA |
|---|---|
| Un **puerto USB-C universal** entre LLMs y herramientas | Como TestRail/Xray: el LLM no inventa, **consulta la fuente de verdad** y opera sobre ella |

**Playwright MCP** (`@playwright/mcp` de Microsoft) expone Playwright **como tools MCP** con prefijo `browser_`: `browser_navigate`, `browser_click`, `browser_type`, `browser_take_screenshot`, `browser_snapshot`, `browser_evaluate`, etc. El LLM invoca esas tools como funciones; cada llamada **abre/manipula un browser real** en tu máquina.

> 📚 Spec oficial: [Model Context Protocol](https://modelcontextprotocol.io/) · Repo: [microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp)

---

## ⚠️ No confundas: tres cosas distintas con nombres parecidos

El ecosistema "Playwright + IA" tiene **tres herramientas** cuyos nombres se confunden todo el tiempo. Sepáralas en tu cabeza desde ya:

| Herramienta | Qué es | Cómo "ve" la página | Para quién / cuándo |
|---|---|---|---|
| **`npx playwright …`** (CLI clásico) | El binario de siempre: `test`, `codegen`, `show-trace`, `--debug`. **No usa IA.** | N/A (lo manejas tú) | **Todos**, siempre. Es el core (M01–M06). |
| **`@playwright/mcp`** (MCP server) | Expone Playwright como **tools MCP**; el LLM las invoca para abrir/manipular un browser real. Lee la página vía **accessibility tree**. | Accessibility tree (texto estructurado, roles + nombres) | Un **cliente LLM con MCP** (Claude, Copilot agent, Gemini CLI). Es lo que configuras en este módulo. |
| **`@playwright/cli`** (agent-cli) | El motor detrás de los **Playwright Agents** (planner/generator/healer). Da al agente **snapshots YAML** de la página. | Snapshots YAML | **Agentes de codegen** dentro de Claude Code / Copilot. Ver la sección "Playwright Agents" más abajo. |

> 🎯 **Regla mnemónica:** `npx playwright` = *tú* manejas · `@playwright/mcp` = *el LLM* maneja un browser en vivo (accessibility-tree) · `@playwright/cli` = *el agente de codegen* trabaja sobre snapshots YAML. Las tres conviven; no son sustitutas.

> 📚 Guía oficial de MCP con Playwright: [playwright.dev/docs/getting-started-mcp](https://playwright.dev/docs/getting-started-mcp).

---

## ¿Qué LLM elegir? Comparativa (mayo 2026)

Los 4 ecosistemas grandes soportan MCP de forma nativa. Las diferencias están en **dónde corres el cliente**, **cómo lo configuras** y **fortalezas para código**.

| LLM | Cliente MCP | Setup | Mejor para | Costo |
|---|---|---|---|---|
| **Claude (Anthropic)** | Claude Desktop · Claude Code (CLI) · Cursor | `claude_desktop_config.json` con `mcpServers` | Razonamiento largo, refactor complejo, **review de PRs**. Es el cliente de referencia (Anthropic creó MCP). | Pro ~$20/mes; API por tokens |
| **GitHub Copilot** | VS Code (Agent mode) · Visual Studio | `.vscode/mcp.json` con clave `servers` | Trabajo **dentro del editor**, autocompletado + agent en el mismo flujo. Ideal si ya pagas Copilot. | $10–$19/mes |
| **ChatGPT (OpenAI)** | ChatGPT app (web/desktop) vía Connectors · Apps SDK | Connectors UI o `mcp-config.json` | UI visual, plugins/Apps SDK, multiplataforma. Útil para **demos a stakeholders no-técnicos**. | Plus $20/mes |
| **Gemini (Google)** | Gemini CLI · Vertex AI Agent Builder · Gemini API | `~/.gemini/settings.json` (CLI) o config de Vertex | Integración con **Google Workspace** (Sheets de bug-tracking), contexto largo barato. | Free tier generoso; CLI gratis |

> 💡 **Recomendación didáctica:** para este módulo usa **Claude Code** o **VS Code + Copilot agent mode** — los dos están maduros, viven en la terminal/editor (no requieren cambiar de ventana) y tienen los mejores docs para Playwright MCP.

### Cuál elegir según tu contexto

```
¿Ya pagas Copilot y vives en VS Code?         →  Copilot Agent + MCP
¿Quieres el flujo más estable para Playwright? →  Claude Code o Claude Desktop
¿Stack 100% Google / GCP?                      →  Gemini CLI
¿Necesitas mostrar la IA a stakeholders?       →  ChatGPT (UI más amigable)
¿Apenas explorando, presupuesto 0?             →  Gemini CLI (free tier)
```

---

## Setup paso a paso

### 0) Prerequisitos comunes

```bash
$ node --version        # ≥ 20
$ pnpm --version        # ≥ 9
$ npx --version
```

Playwright MCP se descarga con `npx`. **No requiere instalación previa** — la primera invocación baja el paquete.

> ⚠️ Tu repo de `playwright-course/` debe estar limpio y con `pnpm install` ya corrido (M01). El MCP server abre el browser **independiente** de tu suite, pero el LLM va a leer tus archivos de tests.

### 1) Setup para Claude Code (recomendado)

```bash
# 1. Asegúrate de tener Claude Code instalado
$ claude --version

# 2. Agrega Playwright MCP al config global
$ claude mcp add playwright npx @playwright/mcp@latest

# 3. Reinicia Claude Code y verifica
$ claude mcp list
playwright    npx @playwright/mcp@latest    ✓ connected
```

Alternativa manual editando `~/.claude.json`:

```json
# @file ~/.claude.json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

📐 Las dos claves del bloque `mcpServers` significan lo mismo en los cuatro setups de abajo (en VS Code la clave externa se llama `servers` en vez de `mcpServers`, pero `command`/`args` funcionan igual):

| Clave | Qué es |
|---|---|
| `command` | El **ejecutable** que lanza el server. `npx` lo descarga al vuelo — por eso no instalas nada antes. |
| `args` | El **paquete + los flags** del server. Ejemplo: `"args": ["@playwright/mcp@latest", "--headless"]`. |

Flags útiles del server (verificados con `npx @playwright/mcp@latest --help`, v0.0.76):

- `--headless` — corre el browser **sin ventana** (por defecto es headed: ves la ventana).
- `--isolated` — mantiene el perfil del browser **en memoria**, sin guardarlo a disco: cada sesión arranca limpia.
- `--storage-state <ruta>` — carga un storage state (p. ej. tu `.auth/user.json` de M04) en las sesiones aisladas: el browser arranca ya logueado.
- `--port <puerto>` — levanta el server en modo **SSE/HTTP** en ese puerto (en vez de stdio); necesario para clientes remotos como ChatGPT.

### 2) Setup para Claude Desktop

Abre el config en VS Code y pega el bloque de abajo. Si el archivo no existe (instalación fresca), créalo con ese mismo comando — `code` abre el archivo nuevo y lo crea al guardar:

```bash
# macOS
$ code ~/"Library/Application Support/Claude/claude_desktop_config.json"
```

> 🪟 **Windows / PowerShell:** `code $env:APPDATA\Claude\claude_desktop_config.json`

```json
# @file claude_desktop_config.json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

Cierra y reabre Claude Desktop. En el chat verás el icono 🔧 con las tools de Playwright disponibles.

### 3) Setup para VS Code + Copilot Agent

Crea `.vscode/mcp.json` en la raíz de `playwright-course/` (si la carpeta `.vscode/` ya existe, salta el `mkdir`) y pega el bloque de abajo:

```bash
$ mkdir .vscode
$ code .vscode/mcp.json
```

```json
# @file .vscode/mcp.json
{
  "servers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

Abre VS Code, activa **Agent mode** en el panel de Copilot Chat, y verifica que Playwright aparezca como tool disponible.

### 4) Setup para Gemini CLI

```bash
$ pnpm add -g @google/gemini-cli
$ gemini auth login
```

Abre `~/.gemini/settings.json` en VS Code y pega el bloque de abajo (si no existe, ese mismo comando lo crea al guardar):

```bash
$ code ~/.gemini/settings.json
```

> 🪟 **Windows / PowerShell:** `code $env:USERPROFILE\.gemini\settings.json`

```json
# @file ~/.gemini/settings.json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

### 5) Setup para ChatGPT

ChatGPT no acepta un comando local arbitrario por seguridad. Las dos rutas viables son:

1. **Connectors / Apps SDK** — si tu org tiene OpenAI Business y publica el MCP server remoto.
2. **MCP remoto via HTTP/SSE** — corre `npx @playwright/mcp@latest --port 9000` y conéctalo desde ChatGPT como custom connector. El flag `--port` es el que habilita el modo SSE/HTTP (sin él, el server habla stdio); no existe un flag `--transport`.

> 💡 Si estás explorando solo, Claude Code, Claude Desktop, Copilot o Gemini CLI son más simples para empezar.

---

## Verificación: el primer "hola navegador"

Con el cliente configurado, escribe este prompt (cópialo en inglés — los modelos rinden mejor con prompts de tooling en inglés):

```
Open https://omnipizza-frontend.onrender.com, wait for the home page
to finish loading, and give me a list of the buttons visible in the
header with their role + accessible name attributes.
```

Lo que debe pasar:
1. La IA invoca la tool `browser_navigate`.
2. Se abre una ventana de Chromium (ventana visible — modo headed — si no usaste `--headless`).
3. Invoca `browser_snapshot` para leer el accessibility tree.
4. Te devuelve la lista de botones con `getByRole('button', { name: '...' })` listos para pegar.

> ⚠️ **Si OmniPizza está dormido** (Render free tier), la primera carga tarda 30-40s — igual que en M01. La IA debe **esperar el `load`**, no fallar al primer intento.

---

## Casos de uso prácticos (lo que vas a usar en el día a día)

### Caso 1 — Generar un test desde lenguaje natural

**Prompt (en inglés):**
```
Generate a Playwright test that:
1. Logs in as standard_user / pizza123
2. Adds a large Margarita to the cart
3. Goes to checkout
4. Verifies the total is greater than 0

Use the project's POM pattern (read pages/LoginPage.ts and pages/CatalogPage.ts).
Write the file to modulo-07-ia-mcp/sandbox/checkout.spec.ts.
```

> 🔍 `standard_user` / `pizza123` es una de las 5 personas reales de OmniPizza (Quick-Login, estilo SauceDemo); la pizza se llama **Margarita** (no "Margherita"). El login usa **username**, no email.

**Qué hace la IA:**
- Lee tus POMs existentes (Claude/Copilot leen el filesystem).
- Navega OmniPizza, identifica selectors reales con MCP.
- Genera el spec usando *tus* convenciones, no plantillas genéricas.

### Caso 2 — Refactor de un test flaky

**Prompt (en inglés):**
```
This test fails 1 out of every 5 runs in CI with "locator timeout".
Here is the code:

<<paste the .spec.ts>>

Here is the trace from the latest failure (test-results/.../trace.zip,
already extracted).

Find the most likely root cause and give me the fix using web-first assertions.
```

### Caso 3 — Migración manual → automatizado

**Prompt (en inglés):**
```
I have this manual test case:

Title: "Apply invalid coupon"
Steps:
1. Log in as standard_user / pizza123
2. Add 1 pizza to the cart
3. Go to checkout
4. Apply coupon "INVALID123"
5. Verify a red error message appears

Convert it into a Playwright test. Before writing any code, navigate
OmniPizza and confirm the real selectors for the coupon input and the
error message.
```

### Caso 4 — Generar data sintética para fixtures

**Prompt (en inglés):**
```
I need 12 sample shipping customers for data/customers.json following
this shape:

{ fullName, phone, address, zipCode, market: 'MX' | 'US' | 'CH' | 'JP' }

Distribution: 4 MX, 4 US, 2 CH, 2 JP. Use realistic localized data per market.
Output the JSON, ready to commit.
```

> 🔍 Ojo: NO le pidas regenerar `data/users.json` — ese archivo contiene las **5 personas reales** de OmniPizza (`standard_user`, `locked_out_user`, `problem_user`, `performance_glitch_user`, `error_user`, todas con rol `customer`). Aquí generas data de *clientes* (direcciones de envío), que es lo tedioso de inventar a mano.

(Para esto MCP no es estrictamente necesario, pero muestra la otra mitad del valor del LLM: ayudante para tareas tediosas alrededor del framework.)

---

## Playwright Agents (planner / generator / healer) — 🧪 experimental

> ⚠️ **EXPERIMENTAL.** Esta feature llegó en **Playwright v1.56 (octubre 2025)**, tiene **bugs abiertos**, y requiere **VS Code 1.105+** (o un cliente compatible). La API y los archivos generados **van a cambiar**: cada vez que actualices Playwright, **regenera las definiciones**. No la lleves a producción todavía; aquí la conoces para estar listo cuando madure.

Mientras MCP te da un **browser en vivo** controlado por el LLM (un copiloto operativo, paso a paso), los **Playwright Agents** son tres **roles especializados** que cubren el ciclo *plan → genera → mantén* de un test, cada uno con un prompt-chatmode propio:

| Agente | Qué hace |
|---|---|
| 🧭 **planner** | Lee un requisito/PRD y lo descompone en un **plan de prueba** (escenarios, casos, pasos) — un `spec` en lenguaje estructurado, todavía sin código. |
| 🎭 **generator** | Toma ese plan y **genera el código** del test (los `.spec.ts`), navegando la app real para anclar locators (sobre snapshots YAML de la página, vía `@playwright/cli`). |
| 🔧 **healer** | Cuando un test **falla por un cambio de UI**, navega la nueva pantalla y **repara los locators rotos** en vez de borrarlos. Es el caso "mantenimiento" del flujo, automatizado. |

> 🎯 **Diferencia clave con MCP:** MCP = *tú* conversas con un LLM que opera un browser. Agents = un **pipeline de roles** (plan → genera → cura) pensado para **codegen y mantenimiento a escala**, no para exploración manual.

### Cómo inicializar los Agents

Desde la raíz del proyecto, corre el comando de scaffolding eligiendo tu cliente con `--loop`. Cada cliente (VS Code/Copilot, Claude Code, OpenCode) consume los chatmodes en un formato propio, así que `--loop` genera las definiciones **para ese loop concreto** — elegir mal el loop significa que los agentes no aparecen en tu cliente:

```bash
$ npx playwright init-agents --loop=vscode
# alternativas según tu cliente:
$ npx playwright init-agents --loop=claude
$ npx playwright init-agents --loop=opencode
```

El init deja en el repo tres piezas que conviene inspeccionar para no tratarlas como caja negra:

- `.github/*.chatmode.md` — las definiciones de los tres agentes (planner/generator/healer) como **chatmodes** que tu cliente carga.
- `specs/` — carpeta donde el **planner** deja sus planes de prueba en lenguaje estructurado.
- `tests/seed.spec.ts` — un test **semilla** que da contexto al generator (convenciones, imports, patrón base del que partir). Es tu palanca para que el generator copie *tus* convenciones, igual que en MCP le pasas los POMs.

Para verificar, tres `ls` separados listan las tres piezas — `ls .github/*.chatmode.md`, `ls specs`, `ls tests/seed.spec.ts`; al abrir tu cliente compatible, los chatmodes planner/generator/healer aparecen seleccionables.

> 💡 **Recordatorio:** al ser experimental, el formato de los chatmodes y del seed cambia entre releases. Cada vez que subas la versión de Playwright, vuelve a correr `npx playwright init-agents --loop=<...>` — definiciones viejas + Playwright nuevo = agentes que fallan en silencio.

> 📚 Doc oficial (sigue la **última** versión, no fijes un número): [playwright.dev/docs/test-agents](https://playwright.dev/docs/test-agents).

---

## Buenas prácticas con IA + Playwright

1. **No commitees código que la IA no haya probado.** Si te genera un test, córrelo (`pnpm exec playwright test ...`) antes de hacer commit.
2. **Pide locators role-based**, no XPath ni CSS profundo. Tu prompt debe incluir *"prefiere `getByRole`, `getByLabel`, `getByTestId`"*.
3. **Dale contexto del framework**, no archivos sueltos. *"Lee `playwright.config.ts` y `pages/BasePage.ts` antes de generar"* funciona mejor que pegar fragmentos.
4. **Limita el alcance.** "Genera 1 test para checkout" → ✅. "Genera la suite completa" → ❌ (vas a obtener slop sin revisar).
5. **Revisa el diff.** La IA tiende a meter `waitForTimeout(3000)` y otros anti-patterns. Quítalos antes de mergear.
6. **Cuidado con secrets.** Nunca pegues `.env` real en el prompt. Usa placeholders (`<API_TOKEN>`).
7. **MCP corre browsers reales.** Si tu prompt dice "borra todos los pedidos", la IA puede *de verdad* borrarlos. Apunta a **staging**, no producción.

---

## Outcome esperado

- [ ] Tienes al menos **un cliente MCP configurado** (Claude, Copilot, ChatGPT o Gemini) y tu cliente muestra el server conectado (Claude Code: `claude mcp list`; VS Code: la lista de tools en Agent mode; Gemini CLI: `/mcp` dentro de la sesión).
- [ ] Ejecutaste el prompt de verificación y la IA navegó OmniPizza con éxito.
- [ ] Generaste **un test nuevo** usando IA + MCP, lo corriste y pasó.
- [ ] Identificaste qué LLM se adapta mejor a tu flujo y por qué.
- [ ] Conoces las 7 buenas prácticas con IA (y los anti-patterns que evitan) al usarla en tu suite.

---

> 📚 **Profundización opcional:**
> - [Playwright MCP — README oficial](https://github.com/microsoft/playwright-mcp) — lista completa de tools y opciones (`--isolated`, `--storage-state`, `--port`)
> - [Model Context Protocol — Spec](https://modelcontextprotocol.io/specification) — para entender cómo escribir tu propio MCP server (por ejemplo, exponer tu sistema de bug-tracking interno)
> - [Anthropic — Building effective agents](https://www.anthropic.com/engineering/building-effective-agents) — patrones para agentes que generan/mantienen tests
