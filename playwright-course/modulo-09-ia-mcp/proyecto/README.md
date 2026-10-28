# m09-agentes — proyecto autocontenido

Snapshot **runnable** de `playwright-course` **al terminar el Módulo 09**: el estado final de M07 (POM + fixtures + servicios + login por API) más un **equipo de 6 agentes de QA** (`AGENTS.md` + `agents/` + `skills/`) sobre **OmniPizza**. El "por qué" vive en [`../README.md`](../README.md).

## Qué suma M09 sobre M07

- `AGENTS.md` — fuente de verdad portable: proyecto, convenciones, contrato de handoff y reglas.
- `agents/*.md` — 6 subagentes: reviewer, test-designer, automation-developer, triage, healer, bug-reporter.
- `skills/qa-flow/SKILL.md` — orquesta el flujo completo (`/qa-flow <id>`).
- `scripts/sync-claude.ps1` · `scripts/sync-claude.sh` — copian `agents/` y `skills/` a `.claude/` y crean `CLAUDE.md` (`@AGENTS.md`). No pisan un `CLAUDE.md` ni un `.claude/settings.local.json` existentes.
- `settings.local.json.example` — plantilla de tu `.claude/settings.local.json`.
- `docs-adaptadores.md` — cómo usar los mismos archivos con Claude Code, Codex, Cursor, Copilot y Gemini CLI.
- `stories/US-01..03` — historias de usuario de ejemplo.
- `tests/seeded/` — un spec que falla, fuera de la suite normal.
- `evidence/fallo-observado/` — evidencia capturada de un fallo.
- `tests/generated/` y `work/` — donde escriben los agentes (`work/*` está en `.gitignore`).

> **Un solo browser a propósito.** Aquí hay tres projects: `setup-api` (login por API), `chromium` (suite normal, ignora `tests/seeded/`) y `seeded` (solo el spec que falla).

## Cómo correr

```bash
pnpm install
pnpm install:browsers
```

Copia `.env.example` a `.env` (PowerShell: `Copy-Item .env.example .env`; bash: `cp .env.example .env`). Luego sincroniza el adaptador de Claude Code:

PowerShell:

```powershell
pnpm sync:claude:win
```

bash:

```bash
pnpm sync:claude:sh
```

Y verifica:

```bash
pnpm typecheck
pnpm test
```

Abre Claude Code en esta carpeta y usa los agentes por nombre, o corre el flujo con `/qa-flow <id>`.

## Scripts

| Script | Qué hace |
|---|---|
| `pnpm test` | Suite normal: project `chromium` (incluye `tests/generated/`, ignora `tests/seeded/`) |
| `pnpm test:seeded` | Solo el spec que falla de `tests/seeded/` |
| `pnpm test:pw-ui` | UI Mode de Playwright (lista todos los projects, incluido `seeded`) |
| `pnpm test:headed` | Corre con el navegador visible |
| `pnpm test:debug` | Modo debug de Playwright |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm report` | Abre el reporte HTML |
| `pnpm install:browsers` | Instala los navegadores de Playwright |
| `pnpm sync:claude:win` | Sincroniza `agents/` y `skills/` a `.claude/` (PowerShell) |
| `pnpm sync:claude:sh` | Sincroniza `agents/` y `skills/` a `.claude/` (bash) |

## Contrato de handoff (resumen)

Para una historia `<id>` los agentes escriben en `work/<id>/`: `01-review.md` → `02-cases.md` → `tests/generated/<id>.spec.ts` → `04-triage.md` → `05-issue-draft.md` o `06-heal.md`. El detalle y las reglas están en [`AGENTS.md`](AGENTS.md).

## Settings opcionales

Para fijar modelo, advisor y modelo de subagentes, copia `settings.local.json.example` a `.claude/settings.local.json`. El detalle (precedencia, límites del advisor) está en [`docs-adaptadores.md`](docs-adaptadores.md).
