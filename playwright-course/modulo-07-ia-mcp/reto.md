# Reto — M07 IA + Playwright MCP

## Objetivo

Generar un test E2E **completo y verde** usando **solo prompts** + Playwright MCP, sin escribir código a mano. Mide qué tan productivo es realmente tu stack de IA hoy.

## Setup

1. Tener el framework de M01..M06 funcionando (`pnpm test:smoke` debe pasar en local).
2. Un cliente MCP configurado (ver [`README.md`](./README.md) — Claude Code, Copilot Agent, Gemini CLI o Claude Desktop).
3. OmniPizza despierto: corre `pnpm m1` una vez para warmup antes de empezar.

```bash
$ mkdir modulo-07-ia-mcp/sandbox
```

Todos los archivos generados por la IA caen en `modulo-07-ia-mcp/sandbox/` (la carpeta ya está gitignored en el `.gitignore` del curso — compruébalo con `git check-ignore modulo-07-ia-mcp/sandbox/`).

---

## Pasos

### 1. Verifica conexión MCP

Prompt (en inglés):
```
Call the "browser_navigate" tool with url "https://example.com",
then "browser_snapshot", and tell me how many links the page has.
```

✅ **Cómo verificar:** la IA debe responder con un número concreto (ej. "1 enlace: More information..."). Si responde sin invocar tool, **MCP no está conectado** — revisa el setup.

### 2. Genera el test de "happy path checkout"

Prompt (cópialo tal cual en inglés y adáptalo a tu cliente):
```
CONTEXT: I am in the playwright-course repo. Read these files before generating:
- playwright.config.ts
- pages/BasePage.ts
- pages/LoginPage.ts
- pages/CatalogPage.ts
- pages/CheckoutPage.ts (if it exists; otherwise ignore)
- tests/setup/auth.setup.ts

TASK: generate modulo-07-ia-mcp/sandbox/checkout-happy.spec.ts that:
1. Uses the storageState from .auth/user.json (does NOT log in via the UI).
2. Navigates to the catalog.
3. Adds 1 "Large" Margarita to the cart.
4. Goes to checkout.
5. Asserts with web-first assertions that:
   - The displayed total is > 0
   - The "Margarita" item appears in the order summary

RULES:
- Role-based locators (getByRole, getByLabel, getByTestId). No deep CSS.
- No waitForTimeout. If you need to wait, use expect(...).toBeVisible() or waitFor.
- Follow the repo naming conventions (English for identifiers, Spanish for comments).
- Before writing any code, navigate OmniPizza with MCP and confirm the real selectors.

DELIVERY: only the .spec.ts file; do not explain, I will read it.
```

✅ **Cómo verificar:** la IA debe **abrir el browser via MCP** (lo ves en tu pantalla o reporta la URL navegada), **luego** escribir el spec. Si genera sin navegar, los selectors van a estar inventados.

### 3. Corre el test

```bash
$ pnpm exec playwright test modulo-07-ia-mcp/sandbox/checkout-happy.spec.ts --project=ui-chromium --headed
```

✅ **Cómo verificar:** el test pasa al primer intento. Si falla:
- **No edites a mano.** Pasa el output del fallo a la IA y pide el fix.
- Repite máximo 3 iteraciones. Si después de 3 sigue rojo, anota qué falló — ése es el límite real de tu stack hoy.

### 4. Genera el caso negativo

Prompt (en inglés):
```
Generate modulo-07-ia-mcp/sandbox/checkout-empty-cart.spec.ts:
- Authenticated storage state (same as the previous one).
- Goes straight to /checkout WITHOUT adding anything to the cart.
- Asserts that an empty-cart message appears (navigate first to confirm
  the real text, e.g. "Tu carrito está vacío" or its real equivalent).
- Asserts that the "Confirmar pedido" button is disabled or absent.

Same rules as before.
```

✅ **Cómo verificar:** corre el spec. Pasa o fallida-pero-con-fix-evidente en una iteración.

### 5. Refactor a fixture

Prompt (en inglés):
```
Both specs in sandbox/ repeat the storageState load. Refactor:
- Create sandbox/fixtures.ts exporting an extended test that comes
  already authenticated.
- Modify both specs to use that fixture.
- Do not change the assertions.

Run the tests afterwards; if they fail, give me the fix before showing me
the final code.
```

✅ **Cómo verificar:** ambos tests verdes; los specs son más cortos; el fixture no duplica lógica que ya esté en `fixtures/omnipizza.ts`.

### 6. Bonus — bug hunting

Prompt (en inglés):
```
I want you to explore OmniPizza looking for real bugs. Without my guidance:
1. Navigate as an anonymous user and try weird things (infinite cart,
   random coupons, refreshing between steps).
2. Capture screenshots of any unexpected state.
3. Give me a prioritized list of 3 bugs with: description, steps to
   reproduce, severity, screenshot.

Do not generate tests for this — just the report.
```

✅ **Cómo verificar:** recibes un reporte estructurado. Aunque ningún "bug" sea real, mide qué tan bien explora.

---

## Resultado esperado

Al terminar tienes:

- [ ] 2 specs verdes en `sandbox/` generados **sin escribir código a mano**.
- [ ] 1 archivo `fixtures.ts` que la IA refactorizó.
- [ ] Sensación clara de qué prompts funcionan y cuáles no para *tu* stack.
- [ ] Una decisión informada: ¿adoptas IA + MCP en tu workflow real o no?

## Bonus

- Repite el reto con **otro LLM** (si configuraste Claude y Copilot, prueba con el segundo). Compara: tiempo total, # de iteraciones, calidad del código.
- Mide el costo: tokens consumidos vs. tiempo ahorrado vs. lo que pagas por mes.

---

> 📚 **Si quieres llevarlo más lejos:**
> - Integra el MCP server en tu pipeline de CI para que la IA genere reportes de regresión automáticos.
> - Escribe **tu propio MCP server** que exponga tu sistema interno (Jira, TestRail, Allure) para que el LLM lea casos manuales y los convierta a Playwright sin copy-paste.
