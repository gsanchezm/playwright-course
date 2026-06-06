# M07 · Guía del módulo: IA + Playwright MCP

**Duración estimada:** 45-60 min
**Pieza que suma al framework:** integración de un **asistente de IA** (Claude / Copilot / ChatGPT / Gemini) capaz de **controlar el navegador real** vía Playwright MCP, para generar, depurar y mantener tests usando lenguaje natural. No agrega código nuevo al framework — agrega un **copiloto operativo** sobre la suite que ya tienes desde M01..M06.

> ⚠️ Este módulo es **opcional** y se hace mejor *después* de M06. Asume que ya entiendes locators, POM, fixtures, API layer y CI — porque la IA va a generar contra ese framework.

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
│   │ Gemini CLI      │          │   40+ tools:         │      │
│   └─────────────────┘          │   · navigate         │      │
│           ▲                    │   · click            │      │
│           │ "Genera un test    │   · fill             │      │
│           │  de login para     │   · screenshot       │      │
│           │  OmniPizza"        │   · evaluate         │      │
│                                │   · pdf, trace, ...  │      │
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
                              https://omnipizza.onrender.com
                              (la app real, sobre la que la
                               IA explora y genera tests)
```

**Qué cambia en tu workflow:**

| Antes de M07 | Después de M07 |
|---|---|
| Escribes selectors a mano viendo DevTools | Le pides a la IA *"abre la página de login y dame los locators role-based"* |
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

**Playwright MCP** (`@playwright/mcp` de Microsoft) expone Playwright **como tools MCP**: `navigate`, `click`, `fill`, `screenshot`, `evaluate`, etc. El LLM invoca esas tools como funciones; cada llamada **abre/manipula un browser real** en tu máquina.

> 📚 Spec oficial: [Model Context Protocol](https://modelcontextprotocol.io/) · Repo: [microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp)

---

## ¿Qué LLM elegir? Comparativa (mayo 2026)

Los 4 ecosistemas grandes soportan MCP de forma nativa. Las diferencias están en **dónde corres el cliente**, **cómo lo configuras** y **fortalezas para código**.

| LLM | Cliente MCP | Setup | Mejor para | Costo |
|---|---|---|---|---|
| **Claude (Anthropic)** | Claude Desktop · Claude Code (CLI) · Cursor | `claude_desktop_config.json` con `mcpServers` | Razonamiento largo, refactor complejo, **review de PRs**. Es el cliente de referencia (Anthropic creó MCP). | Pro ~$20/mes; API por tokens |
| **GitHub Copilot** | VS Code (Agent mode) · Visual Studio | `.vscode/mcp.json` con clave `servers` | Trabajo **dentro del editor**, autocompletado + agent en el mismo flujo. Ideal si ya pagas Copilot. | $10–$19/mes |
| **ChatGPT (OpenAI)** | ChatGPT app (web/desktop) vía Connectors · Apps SDK | Connectors UI o `mcp-config.json` | UI visual, plugins/Apps SDK, multiplataforma. Útil para **demos a stakeholders no-técnicos**. | Plus $20/mes |
| **Gemini (Google)** | Gemini CLI · Vertex AI Agent Builder · Gemini API | `~/.gemini/settings.json` (CLI) o config de Vertex | Integración con **Google Workspace** (Sheets de bug-tracking), contexto largo barato. | Free tier generoso; CLI gratis |

> 💡 **Recomendación didáctica:** para el curso usa **Claude Code** o **VS Code + Copilot agent mode** — los dos están maduros, viven en la terminal/editor (no requieren cambiar de ventana) y tienen los mejores docs para Playwright MCP.

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

### 2) Setup para Claude Desktop

Edita `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) o `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

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

Crea `.vscode/mcp.json` en la raíz de `playwright-course/`:

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
$ npm i -g @google/gemini-cli
$ gemini auth login
```

Edita `~/.gemini/settings.json`:

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
2. **MCP remoto via HTTP/SSE** — corre `@playwright/mcp` con transport `--transport sse --port 9000` y conéctalo desde ChatGPT como custom connector.

> 💡 Si estás explorando solo, Claude Code, Claude Desktop, Copilot o Gemini CLI son más simples para empezar.

---

## Verificación: el primer "hola navegador"

Con el cliente configurado, escribe este prompt:

```
Abre https://omnipizza.onrender.com, espera a que cargue la home
y dame una lista de los botones visibles en el header con sus
atributos role + accessible name.
```

Lo que debe pasar:
1. La IA invoca la tool `browser_navigate`.
2. Se abre una ventana de Chromium (cabezas visible si no usaste `--headless`).
3. Invoca `browser_snapshot` para leer el accessibility tree.
4. Te devuelve la lista de botones con `getByRole('button', { name: '...' })` listos para pegar.

> ⚠️ **Si OmniPizza está dormido** (Render free tier), la primera carga tarda 30-40s — igual que en M01. La IA debe **esperar el `load`**, no fallar al primer intento.

---

## Casos de uso prácticos (lo que vas a usar en el día a día)

### Caso 1 — Generar un test desde lenguaje natural

**Prompt:**
```
Genera un test de Playwright que:
1. Inicie sesión como user@test.com / Password123
2. Agregue una Margherita grande al carrito
3. Vaya al checkout
4. Verifique que el total es mayor a 0

Usa el patrón POM del proyecto (revisa pages/LoginPage.ts y pages/CatalogPage.ts).
Pega el archivo en modulo-07-ia-mcp/sandbox/checkout.spec.ts.
```

**Qué hace la IA:**
- Lee tus POMs existentes (Claude/Copilot leen el filesystem).
- Navega OmniPizza, identifica selectors reales con MCP.
- Genera el spec usando *tus* convenciones, no plantillas genéricas.

### Caso 2 — Refactor de un test flaky

**Prompt:**
```
Este test falla 1 de cada 5 veces en CI con "locator timeout". Aquí está el código:

<<pega el .spec.ts>>

Aquí está el último trace de un fallo (test-results/.../trace.zip ya extraído).

Encuentra la causa probable y dame el fix con web-first assertions.
```

### Caso 3 — Migración manual → automatizado

**Prompt:**
```
Tengo este caso de prueba manual:

Título: "Aplicar cupón inválido"
Pasos:
1. Login como user@test.com
2. Agregar 1 pizza al carrito
3. Ir a checkout
4. Aplicar cupón "INVALID123"
5. Verificar mensaje de error rojo

Conviértelo en un Playwright test. Antes de escribir, navega OmniPizza
y confírmame los selectors reales del input de cupón y del mensaje de error.
```

### Caso 4 — Generar data sintética para fixtures

**Prompt:**
```
Necesito 20 usuarios para data/users.json siguiendo este shape:

{ email, password, market: 'us' | 'mx' | 'br', tier: 'free' | 'pro' }

Distribución: 50% us, 30% mx, 20% br. 70% free, 30% pro.
Genera el JSON listo para commitear.
```

(Para esto MCP no es estrictamente necesario, pero muestra la otra mitad del valor del LLM: ayudante para tareas tediosas alrededor del framework.)

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

- [ ] Tienes al menos **un cliente MCP configurado** (Claude, Copilot, ChatGPT o Gemini) y `mcp list` muestra `playwright ✓ connected`.
- [ ] Ejecutaste el prompt de verificación y la IA navegó OmniPizza con éxito.
- [ ] Generaste **un test nuevo** usando IA + MCP, lo corriste y pasó.
- [ ] Identificaste qué LLM se adapta mejor a tu flujo y por qué.
- [ ] Conoces los 7 anti-patterns para evitar al usar IA en tu suite.

---

> 📚 **Profundización opcional:**
> - [Playwright MCP — README oficial](https://github.com/microsoft/playwright-mcp) — lista completa de tools y opciones (`--isolated`, `--storage-state`, `--transport sse`)
> - [Model Context Protocol — Spec](https://modelcontextprotocol.io/specification) — para entender cómo escribir tu propio MCP server (por ejemplo, exponer tu sistema de bug-tracking interno)
> - [Anthropic — Building effective agents](https://www.anthropic.com/engineering/building-effective-agents) — patrones para agentes que generan/mantienen tests
