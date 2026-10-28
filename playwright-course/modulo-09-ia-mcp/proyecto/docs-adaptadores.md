# Adaptadores: usa el equipo de agentes con tu herramienta

La fuente de verdad es `AGENTS.md` + `agents/` + `skills/`. Cada herramienta solo
necesita *leer* esos archivos. Cada fila/seccion marca su fecha de verificacion
contra la documentacion oficial; las herramientas cambian rapido, revisa su doc.

## Claude Code (adaptador recomendado) - verificado 2026-10-28

1. `pnpm sync:claude:sh` (bash) o `pnpm sync:claude:win` (PowerShell). **Copia**
   (no symlinks, por Windows) `agents/*.md` a `.claude/agents/` y la skill a
   `.claude/skills/qa-flow/SKILL.md`, y crea `CLAUDE.md` con `@AGENTS.md`.
2. Es idempotente: si `CLAUDE.md` o `.claude/settings.local.json` ya existen, no
   los toca. Para cambiar un agente, edita `agents/` o `skills/` y vuelve a correrlo.
3. Los subagentes de proyecto viven en `.claude/agents/`. Claude Code lee
   `CLAUDE.md`. Por eso el script crea `CLAUDE.md` con `@AGENTS.md` (el import
   carga las convenciones, sin depender de la version).
4. Para usar un agente pidelo por nombre ("usa el agente `qa-triage`"); para editarlo,
   cambia el archivo y re-ejecuta el sync.
5. La skill se invoca con `/qa-flow` (el nombre de la carpeta).
6. `.claude/` y `CLAUDE.md` generados no se commitean (estan en el `.gitignore`).

### Modelos y advisor (opcional)

Desde `proyecto/`, copia `settings.local.json.example` a
`.claude/settings.local.json` (archivo personal; ahi `"model": "sonnet"`,
`"advisorModel": "fable"` y `CLAUDE_CODE_SUBAGENT_MODEL=haiku`). Modelo de un
subagente, en orden: `model` al invocar > `model:` del frontmatter >
`CLAUDE_CODE_SUBAGENT_MODEL` > modelo de la sesion. Esa variable es solo un
default; para forzarla a todos agrega `CLAUDE_CODE_SUBAGENT_MODEL_FORCE=1`.

- `advisorModel`: alias `fable`, `opus` o `sonnet`, o un ID completo; el advisor
  debe ser al menos tan capaz como el modelo principal. Los subagentes lo heredan.
- No funciona en Bedrock ni Foundry, ni con `DISABLE_TELEMETRY` activo.
- Haiku 4.5 no puede ser advisor; `fable` requiere acceso a Fable.

## Mismos archivos, otra herramienta

| Herramienta | Que lee | Que hacer | Verificado |
|---|---|---|---|
| Codex | `AGENTS.md` (nativo, de la raiz al directorio actual) | Nada: abre `proyecto/` | 2026-10-28 |
| Cursor | `AGENTS.md` en la raiz y subcarpetas (nativo) | Nada | 2026-10-28 |
| GitHub Copilot | `AGENTS.md` (el mas cercano gana) y `.github/copilot-instructions.md` | Nada; que funciones lo lean depende de la superficie, revisa su doc | 2026-10-28 |
| Gemini CLI | `GEMINI.md` por defecto; admite imports `@archivo.md` y `context.fileName` | Crea `GEMINI.md` con `@AGENTS.md` (o agrega `"AGENTS.md"` a `context.fileName`) | 2026-10-28 |

Los subagentes (`agents/*.md`) y la skill tienen formato de Claude Code; en otras
herramientas usalos como prompts o instrucciones: el contrato entrada -> salida
(archivos en `work/<id>/`) es lo que importa.
