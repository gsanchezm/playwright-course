# Reto — M07 IA + Playwright MCP

## Objetivo

Generar un test E2E **completo y verde** usando **solo prompts** + Playwright MCP, sin escribir código a mano. Mide qué tan productivo es realmente tu stack de IA hoy.

## Setup

1. Tener el framework de M01..M06 funcionando (`pnpm test:smoke` debe pasar en local).
2. Un cliente MCP configurado (ver [`README.md`](./README.md) — Claude Code, Copilot Agent, Gemini CLI o Claude Desktop).
3. OmniPizza despierto: corre `pnpm m1` una vez para warmup antes de empezar.

```bash
$ mkdir -p modulo-07-ia-mcp/sandbox
```

Todos los archivos generados por la IA caen en `modulo-07-ia-mcp/sandbox/` (ya está gitignored si extiendes el `.gitignore` del curso).

---

## Pasos

### 1. Verifica conexión MCP

Prompt:
```
Llama a la tool "browser_navigate" con url "https://example.com",
después "browser_snapshot" y dime cuántos enlaces tiene la página.
```

✅ **Cómo verificar:** la IA debe responder con un número concreto (ej. "1 enlace: More information..."). Si responde sin invocar tool, **MCP no está conectado** — revisa el setup.

### 2. Genera el test de "happy path checkout"

Prompt (cópialo tal cual y adáptalo a tu cliente):
```
CONTEXTO: estoy en el repo playwright-course. Lee estos archivos antes de generar:
- playwright.config.ts
- pages/BasePage.ts
- pages/LoginPage.ts
- pages/CatalogPage.ts
- pages/CheckoutPage.ts (si existe; si no, ignora)
- tests/setup/auth.setup.ts

TAREA: genera modulo-07-ia-mcp/sandbox/checkout-happy.spec.ts que:
1. Use el storageState de .auth/user.json (no haga login desde UI).
2. Navegue al catálogo.
3. Agregue al carrito 1 Margherita talla "Large".
4. Vaya al checkout.
5. Aserte con web-first assertions que:
   - El total mostrado es > 0
   - El item "Margherita" aparece en el resumen del pedido

REGLAS:
- Locators role-based (getByRole, getByLabel, getByTestId). Nada de CSS profundo.
- Nada de waitForTimeout. Si necesitas esperar, usa expect(...).toBeVisible() o waitFor.
- Sigue las convenciones de naming del repo (en inglés para identificadores, comentarios en español).
- Antes de escribir, navega OmniPizza con MCP y confírmame los selectors reales.

ENTREGA: solo el archivo .spec.ts; no me expliques, lo voy a leer.
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

Prompt:
```
Genera modulo-07-ia-mcp/sandbox/checkout-empty-cart.spec.ts:
- Storage state autenticado (igual que el anterior).
- Va directo a /checkout SIN agregar nada al carrito.
- Aserta que aparece un mensaje "Tu carrito está vacío" (o el equivalente real, navega para confirmarlo).
- Aserta que el botón "Confirmar pedido" está disabled o no existe.

Mismas reglas que antes.
```

✅ **Cómo verificar:** corre el spec. Pasa o fallida-pero-con-fix-evidente en una iteración.

### 5. Refactor a fixture

Prompt:
```
Los dos specs en sandbox/ repiten el storageState load. Refactor:
- Crea sandbox/fixtures.ts exportando un test extendido que ya viene autenticado.
- Modifica los dos specs para usar ese fixture.
- No cambies las aserciones.

Corre los tests después; si fallan, dame el fix antes de mostrarme el código final.
```

✅ **Cómo verificar:** ambos tests verdes; los specs son más cortos; el fixture no duplica lógica que ya esté en `fixtures/omnipizza.ts`.

### 6. Bonus — bug hunting

Prompt:
```
Quiero que explores OmniPizza buscando bugs reales. Sin mi guía:
1. Navega como usuario anónimo y prueba cosas raras (carrito infinito, cupones aleatorios, refresh entre pasos).
2. Captura screenshots de cualquier estado inesperado.
3. Dame una lista priorizada de 3 bugs con: descripción, pasos para reproducir, severidad, screenshot.

No generes tests para esto — solo el reporte.
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
