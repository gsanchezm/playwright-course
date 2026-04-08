# 11.2 — Playwright MCP

## ¿Qué es MCP?

**MCP (Model Context Protocol)** es un protocolo abierto, lanzado por Anthropic en 2024, que permite a los modelos de IA comunicarse con herramientas externas (bases de datos, APIs, navegadores, sistemas de archivos) de forma estandarizada.

Antes de MCP: cada agente de IA tenía que reinventar la rueda para conectarse a cada herramienta.
Con MCP: una herramienta expone un "MCP server" y CUALQUIER cliente compatible (Claude Desktop, Cursor, Continue, custom apps) puede usarla.

## ¿Qué es Playwright MCP?

[Playwright MCP](https://github.com/microsoft/playwright-mcp) es un servidor MCP **oficial de Microsoft** que expone Playwright como una herramienta para LLMs. En cristiano: **le da a Claude/ChatGPT/etc. la capacidad de controlar un navegador real**.

## ¿Qué puede hacer un agente con Playwright MCP?

- Abrir páginas web.
- Hacer click en elementos.
- Llenar formularios.
- Leer el contenido del DOM.
- Tomar screenshots.
- Navegar a través de varias páginas.
- Ejecutar JavaScript en la página.
- **Reportar lo que ve en lenguaje natural.**

## Casos de uso reales para QA automation

### Caso 1: Exploratory testing automatizado

Prompt al agente:
> "Abre https://demo.playwright.dev/todomvc y haz 5 acciones distintas para probar el límite de la app. Reporta cualquier comportamiento inesperado."

El agente:
1. Abre el navegador.
2. Intenta cosas como: agregar un todo vacío, agregar 100 todos, escribir un texto muy largo, usar emojis.
3. Te reporta: "Agregar un todo vacío no lo permite (✅). Pude agregar 100 todos sin lag (✅). Un texto de 10000 caracteres se acepta pero rompe el layout (⚠️)".

### Caso 2: Generación de tests a partir de un flujo manual

> "Quiero un test de Playwright que reproduzca lo que voy a describirte: 1) ir a la página, 2) agregar 3 todos, 3) marcar el segundo como completado, 4) verificar que solo aparece como completado en el filtro 'Completed'."

El agente abre el navegador, **valida que el flujo realmente funciona**, y luego te entrega el código del test ya verificado.

### Caso 3: Validación visual de un cambio

> "Compara el header de https://staging.miapp.com con el de https://prod.miapp.com y dime si hay diferencias visuales."

El agente abre ambas, toma screenshots y describe diferencias.

## Setup básico de Playwright MCP

### Requisitos
- Node.js 18+
- Un cliente MCP (Claude Desktop, Cursor, etc.)

### Instalación rápida

```bash
$ npx @playwright/mcp@latest
```

### Configuración en Claude Desktop

Edita `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) o equivalente:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

Reinicia Claude Desktop. Ahora puedes pedirle al chat que use Playwright.

### Configuración en Cursor

Cursor tiene soporte nativo de MCP. Settings → MCP → Add server → pega la misma config.

## Demo en clase

1. Abre Claude Desktop con MCP configurado.
2. Pídele: **"Abre https://playwright.dev y dime qué hay en la página principal"**.
3. Verás cómo Claude abre un navegador, navega, lee el DOM, y te responde.
4. Pídele algo más complejo: **"Ahora haz click en 'Get started' y dime qué pasa"**.
5. El agente literalmente hace el click y reporta.

## ⚠️ Limitaciones

- **Lentitud:** cada acción del agente toma varios segundos (LLM + browser).
- **Costo:** cada acción consume tokens del LLM.
- **No reemplaza tests automatizados:** sigue siendo más eficiente escribir un `test.spec.ts` para casos repetitivos.
- **Ideal para exploración, no para regresión.**

## Cuándo usar Playwright MCP

✅ **SÍ:**
- Investigar un bug que solo se reproduce manualmente.
- Generar el "esqueleto" de un test nuevo.
- Pruebas exploratorias asistidas.
- Validar visualmente que un cambio no rompió la UI.

❌ **NO:**
- Pruebas de regresión diarias (usa tests automatizados normales).
- Pipelines de CI (es muy lento).
- Cualquier cosa donde necesites consistencia y velocidad.
