# 08 — Herramientas de IA (opcional)

> **Este módulo es opcional.** Solo lo necesitas si vas a hacer el [Módulo 7 del curso de Playwright](../playwright-course/modulo-07-ia-mcp/): el **AI Test Harness**, donde generas un framework E2E completo con **Claude Code** + Playwright MCP a partir de prompts numerados.

> Las herramientas de IA NO son obligatorias, pero **multiplican tu productividad** como automatizador. Para el Módulo 7 el flujo principal es **Claude Code + Playwright MCP**; GitHub Copilot es un buen complemento dentro del editor.

---

## Tabla resumen

| Herramienta | Costo | Para qué | Necesaria para |
|-------------|-------|----------|----------------|
| **Claude Code (CLI)** | Plan Claude (Free / Pro $20) | Agente en terminal: genera, verifica y refactoriza el harness | **Módulo 7 (principal)** |
| **Playwright MCP** | Gratis | Da a la IA un navegador real para descubrir selectores | **Módulo 7 (principal)** |
| **GitHub Copilot** | $10/mes (gratis para estudiantes) | Autocompletado de código en VS Code | Módulo 7 (complemento) |
| **Claude Desktop** | Gratis (con uso limitado) | Chat con LLM + MCP (alternativa a Claude Code) | Alternativa M7 |
| **Cursor** | $20/mes (gratis básico) | Editor con IA integrada (alternativa a VS Code) | Cualquier módulo |
| **ChatGPT / Gemini / Claude.ai** | Gratis (con límites) | Clientes MCP alternativos / prompts en web | Alternativa M7 |

---

## 1. GitHub Copilot

**¿Qué es?** Extensión de VS Code que sugiere código en tiempo real mientras escribes. Entrenado con millones de repos públicos.

- **Sitio oficial:** https://github.com/features/copilot
- **Precio:** $10/mes individual, **GRATIS para estudiantes verificados** (con [GitHub Student Pack](https://education.github.com/pack)).

### Setup

1. **Suscribirte:**
   - Ve a https://github.com/features/copilot
   - Click en "Start a free trial" o usa tu beneficio de estudiante.
2. **Instalar las extensiones en VS Code:**
   ```bash
   $ code --install-extension GitHub.copilot
   $ code --install-extension GitHub.copilot-chat
   ```
3. **Sign in:** abre VS Code, pulsa `Cmd/Ctrl + Shift + P` → escribe **"Sign in to GitHub"**. Sigue el flujo del navegador.
4. **Verifica:** abre cualquier archivo `.ts` y empieza a escribir. Después de 2-3 segundos deberían aparecer sugerencias en gris. Acepta con `Tab`.

### Uso básico
| Atajo | Acción |
|-------|--------|
| `Tab` | Aceptar sugerencia |
| `Esc` | Rechazar sugerencia |
| `Alt + ]` / `Option + ]` | Siguiente sugerencia |
| `Alt + [` / `Option + [` | Sugerencia anterior |
| `Ctrl/Cmd + I` | Abrir Copilot Chat inline |

---

## 2. Claude Code (CLI) — la herramienta principal del Módulo 7

**¿Qué es?** El agente de Anthropic en la **terminal**. A diferencia del autocompletado de Copilot, Claude Code lee tu repo, ejecuta comandos y **genera, verifica y refactoriza** archivos completos siguiendo tus instrucciones. Es el motor del Módulo 7: le pegas los prompts numerados (`00 → 10`) y construye el AI Test Harness paso a paso.

- **Docs oficiales:** https://code.claude.com/docs
- **Precio:** incluido en tu plan de Claude (Free con límites; Pro $20/mes rinde más).

### Setup

1. **Instala Claude Code** (requiere Node ≥ 20):
   ```bash
   $ npm install -g @anthropic-ai/claude-code
   $ claude --version
   ```
2. **Inicia sesión** la primera vez que corras `claude` dentro de una carpeta; sigue el flujo del navegador con tu cuenta de Claude:
   ```bash
   $ claude
   ```
3. **Conecta Playwright MCP** (las "manos" para navegar el SUT — ver sección 4):
   ```bash
   $ claude mcp add playwright npx @playwright/mcp@latest
   $ claude mcp list
   playwright    npx @playwright/mcp@latest    ✓ connected
   ```

> 💡 En el Módulo 7 no configuras MCP a mano: el **script de setup del harness** escribe un `.mcp.json` en la carpeta del proyecto, así que Claude Code arranca con Playwright MCP ya conectado. El comando de arriba es para conectarlo en cualquier otra carpeta.

---

## 3. Claude Desktop (alternativa a Claude Code)

**¿Qué es?** App oficial de Anthropic para chatear con Claude. **Soporta MCP nativamente**, así que también puede conectarse a Playwright — pero para el Módulo 7 es un plan B: Claude Desktop no lee ni edita tu repo desde la terminal como Claude Code.

- **Sitio oficial:** https://claude.ai/download
- **Precio:** plan Free con uso limitado, plan Pro $20/mes.

### Setup

**Crear cuenta en Claude (claude.ai)**

1. Entra a https://claude.ai desde tu navegador.
2. Haz clic en **Sign up** y regístrate con tu correo (recibirás un "enlace mágico" de inicio de sesión), con Google o con Apple.
3. Verifica tu número de teléfono cuando lo solicite y confirma que eres mayor de edad.
4. Escribe tu nombre y envía tu primer mensaje.

> El plan **gratuito** basta para el módulo de IA. Claude **no usa contraseña**: el acceso es por enlace mágico, Google o Apple.

**Instalar la app de escritorio**

1. **Descarga e instala** desde https://claude.ai/download
   - macOS: `.dmg`
   - Windows: `.exe`
   - Linux: aún no hay app oficial; usa la versión web https://claude.ai
2. **Crea cuenta** o inicia sesión.
3. Listo, ya puedes chatear.

---

## 4. Playwright MCP

**¿Qué es?** Un servidor MCP oficial de Microsoft que permite a Claude (u otros clientes MCP) **controlar un navegador real** vía Playwright. Le da a la IA "manos" para abrir páginas web, leer el árbol de accesibilidad, hacer click, llenar formularios, etc. En el Módulo 7 es lo que usa Claude Code para **descubrir selectores reales** antes de generar un test.

- **Repositorio oficial:** https://github.com/microsoft/playwright-mcp
- **Docs de MCP:** https://modelcontextprotocol.io/

### Setup en Claude Code (recomendado para M7)

```bash
$ claude mcp add playwright npx @playwright/mcp@latest
$ claude mcp list        # debe mostrar: playwright ... ✓ connected
```

O crea un `.mcp.json` en la raíz del proyecto (es justo lo que hace por ti el script de setup del harness). Es la misma configuración `mcpServers` de abajo.

### Setup en Claude Desktop (alternativa)

1. Localiza el archivo de config (créalo si no existe):
   - **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
   - **Linux:** `~/.config/Claude/claude_desktop_config.json`
2. Pega esta configuración:
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
3. Reinicia Claude Desktop.
4. En el chat, deberías ver un icono de "tools" indicando que Playwright MCP está conectado.

### Verificación

Pídele a Claude:
> "Abre https://playwright.dev y dime el título de la página."

Si MCP está bien configurado, **abrirá un navegador real** y te responderá con el título. Si no, te dirá que no tiene acceso a herramientas externas.

---

## 5. Cursor (alternativa a VS Code)

**¿Qué es?** Un fork de VS Code con IA integrada nativamente. Puede reemplazar a VS Code completamente para los cursos.

- **Sitio oficial:** https://cursor.com/
- **Precio:** Free con uso limitado, Pro $20/mes.

### ¿Vale la pena cambiar de VS Code a Cursor?

- ✅ **Sí**, si pagas el plan Pro y vas a usar IA todo el día.
- ⚠️ **No** si ya tienes Copilot configurado en VS Code y estás contento.
- Cursor también soporta MCP de forma nativa.

> 💡 Para los cursos, **VS Code + Copilot es suficiente**. No tienes que cambiar.

---

## 6. Otros clientes MCP (Copilot Agent, Gemini, ChatGPT)

El flujo del Módulo 7 está pensado para **Claude Code**, pero sus prompts son **agnósticos del agente**: cualquier cliente que soporte MCP y pueda leer/editar tu repo también sirve. Alternativas maduras:

- **GitHub Copilot (Agent mode)** en VS Code — configura MCP en `.vscode/mcp.json` (clave `servers` en vez de `mcpServers`).
- **Gemini CLI** — `~/.gemini/settings.json`.
- **ChatGPT / Claude.ai (web):** https://chat.openai.com/ · https://claude.ai/ · https://gemini.google.com/ — útiles para **consultar** prompts, pero la web pura no controla tu repo ni el navegador; para eso necesitas un cliente con MCP y acceso a archivos.

> 💡 Si apenas exploras, **Claude Code** es el camino más simple y el mejor documentado para el harness. No necesitas plan pago para empezar.

---

## ⚠️ Advertencias importantes

1. **Datos sensibles:** NO copies tokens, contraseñas, datos de clientes reales (PII) o código propietario a un LLM público. Usa datos sintéticos: `test@example.com`, `Test1234!`.
2. **Hallucinations:** los LLMs inventan código que no funciona. **Siempre revisa y ejecuta** antes de aceptar.
3. **Costo:** los planes pagos suman rápido. Empieza con la versión gratuita.
4. **Dependencia:** no dejes que la IA haga el 100% de tu trabajo. Practica también escribir tests sin ella, o vas a perder la habilidad.

---

## ✅ Checklist (opcional)

- [ ] **Claude Code** está instalado (`claude --version` responde).
- [ ] **Playwright MCP** está conectado en Claude Code (`claude mcp list` muestra `✓ connected`).
- [ ] Sé pedirle a Claude que abra una página web y me describa lo que ve.
- [ ] (Opcional) GitHub Copilot funciona en VS Code, o Claude Desktop instalado como alternativa MCP.

➡️ Siguiente: [verificacion.md](./verificacion.md) — checklist final
