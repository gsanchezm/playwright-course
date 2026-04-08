# 08 — Herramientas de IA (opcional)

> **Este módulo es opcional.** Solo lo necesitas si vas a hacer el [Módulo 11 del curso de Playwright](../playwright-course/modulo-11-ia/) sobre IA en testing.

> Las herramientas de IA NO son obligatorias, pero **multiplican tu productividad** como automatizador. Recomiendo configurar al menos GitHub Copilot.

---

## Tabla resumen

| Herramienta | Costo | Para qué | Necesaria para |
|-------------|-------|----------|----------------|
| **GitHub Copilot** | $10/mes (gratis para estudiantes) | Autocompletado de código en VS Code | Módulo 11.1 |
| **Claude Desktop** | Gratis (con uso limitado) | Chat con LLM + soporte MCP | Módulo 11.2 |
| **Playwright MCP** | Gratis | Permite a un LLM controlar Playwright | Módulo 11.2 |
| **Cursor** | $20/mes (gratis básico) | Editor con IA integrada (alternativa a VS Code) | Cualquier módulo |
| **ChatGPT / Claude.ai** | Gratis (con límites) | Chat web para prompts | Módulo 11.3 |

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

## 2. Claude Desktop

**¿Qué es?** App oficial de Anthropic para chatear con Claude. Es importante porque **soporta MCP nativamente**, lo que te permite conectar Claude con Playwright (módulo 11.2).

- **Sitio oficial:** https://claude.ai/download
- **Precio:** plan Free con uso limitado, plan Pro $20/mes.

### Setup

1. **Descarga e instala** desde https://claude.ai/download
   - macOS: `.dmg`
   - Windows: `.exe`
   - Linux: aún no hay app oficial; usa la versión web https://claude.ai
2. **Crea cuenta** o inicia sesión.
3. Listo, ya puedes chatear.

---

## 3. Playwright MCP (avanzado)

**¿Qué es?** Un servidor MCP oficial de Microsoft que permite a Claude (u otros clientes MCP) **controlar un navegador real** vía Playwright. Le da a la IA "manos" para abrir páginas web, hacer click, llenar formularios, etc.

- **Repositorio oficial:** https://github.com/microsoft/playwright-mcp
- **Docs de MCP:** https://modelcontextprotocol.io/

### Setup en Claude Desktop

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

## 4. Cursor (alternativa a VS Code)

**¿Qué es?** Un fork de VS Code con IA integrada nativamente. Puede reemplazar a VS Code completamente para los cursos.

- **Sitio oficial:** https://cursor.com/
- **Precio:** Free con uso limitado, Pro $20/mes.

### ¿Vale la pena cambiar de VS Code a Cursor?

- ✅ **Sí**, si pagas el plan Pro y vas a usar IA todo el día.
- ⚠️ **No** si ya tienes Copilot configurado en VS Code y estás contento.
- Cursor también soporta MCP de forma nativa.

> 💡 Para los cursos, **VS Code + Copilot es suficiente**. No tienes que cambiar.

---

## 5. ChatGPT / Claude.ai (web)

Para hacer prompts del módulo 11.3, basta con la versión web gratuita de cualquiera:

- **ChatGPT:** https://chat.openai.com/
- **Claude:** https://claude.ai/
- **Gemini:** https://gemini.google.com/

> No necesitas plan pago para los retos del curso. Los prompts son cortos.

---

## ⚠️ Advertencias importantes

1. **Datos sensibles:** NO copies tokens, contraseñas, datos de clientes reales (PII) o código propietario a un LLM público. Usa datos sintéticos: `test@example.com`, `Test1234!`.
2. **Hallucinations:** los LLMs inventan código que no funciona. **Siempre revisa y ejecuta** antes de aceptar.
3. **Costo:** los planes pagos suman rápido. Empieza con la versión gratuita.
4. **Dependencia:** no dejes que la IA haga el 100% de tu trabajo. Practica también escribir tests sin ella, o vas a perder la habilidad.

---

## ✅ Checklist (opcional)

- [ ] GitHub Copilot funciona en VS Code (veo sugerencias al escribir).
- [ ] Claude Desktop está instalado.
- [ ] Playwright MCP está configurado en Claude Desktop.
- [ ] Sé pedirle a Claude que abra una página web y me describa lo que ve.

➡️ Siguiente: [verificacion.md](./verificacion.md) — checklist final
