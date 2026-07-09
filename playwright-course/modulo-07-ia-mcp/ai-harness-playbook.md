# Playbook - AI Test Harness con Claude Code

Este playbook resume el flujo operativo de M07. La version paso a paso vive en
[`README.md`](./README.md); los prompts copiables viven en [`prompts/`](./prompts/).

## Principio

No le pidas a Claude "todo el framework" en una sola respuesta. Dale una carpeta
externa vacia, un contrato persistente y prompts pequenos.

```text
setup script -> PROJECT_BRIEF.md + CLAUDE.md -> AGENTS.md -> TEST_PLAN.md -> discovered slice 1 -> discovered slice 2 -> DI -> CI -> healer -> optional commit + push to main -> optional skill -> optional skill-based setup
```

## Comando de arranque

Antes de ejecutar comandos, desde el repo del curso pega:

```text
prompts/00-create-setup-scripts.md
```

Luego ejecuta el script generado.

Windows:

```powershell
.\playwright-course\modulo-07-ia-mcp\scripts\setup-ai-harness.ps1 -TargetDir C:\tmp\omnipizza-ai-harness
cd C:\tmp\omnipizza-ai-harness
claude
```

macOS/Linux:

```bash
./playwright-course/modulo-07-ia-mcp/scripts/setup-ai-harness.sh "$HOME/tmp/omnipizza-ai-harness"
cd "$HOME/tmp/omnipizza-ai-harness"
claude
```

El setup crea `PROJECT_BRIEF.md` y `CLAUDE.md` en la carpeta externa. Si quieres
apuntar a otro SUT, pasa las URLs con `-UiUrl`/`-ApiUrl` en PowerShell o
`--ui-url`/`--api-url` en bash.

## Orden de prompts

| Orden | Archivo | Proposito |
|---|---|---|
| 00 | `prompts/00-create-setup-scripts.md` | Genera o refresca los scripts de setup Windows/macOS desde el repo del curso. |
| 01 | `prompts/01-bootstrap-environment.md` | Verifica Node, pnpm, Claude Code, git y MCP en el harness externo. |
| 02 | `prompts/02-master-architect.md` | Crea fundacion y `AGENTS.md`. |
| 03 | `prompts/03-test-plan.md` | Explora UI/API y crea `TEST_PLAN.md`. |
| 04 | `prompts/04-slice-generator.md` | Genera una feature por vez con casos UI/API del plan. |
| 05 | `prompts/05-fixtures-di.md` | Cablea fixtures e inyeccion de dependencias. |
| 06 | `prompts/06-ci-scripts.md` | Agrega scripts y GitHub Actions. |
| 07 | `prompts/07-healer-review.md` | Corrige fallos con output real. |
| opcional | `prompts/08-git-github-pr.md` | Crea commit, repo privado en GitHub y push a `main`; verifica el CI. |
| opcional | `prompts/09-create-reusable-skill.md` | Crea una skill local reutilizable (agnostica de IA) despues del flujo manual. |
| opcional | `prompts/10-use-skill-to-bootstrap-harness.md` | Usa la skill local para settear otro ambiente desde UI/API/TARGET_DIR. |
| extra | `prompts/11-frontend-testid-instrumentation.md` | Ayuda al equipo frontend a agregar `data-testid` estables al SUT. |
| extra | `prompts/12-multirepo-project-design.md` | Analiza un SUT multi-repo (front+back) y escribe `PROJECT_DESIGN.md`. |
| extra | `prompts/13-monorepo-project-design.md` | Analiza un SUT monorepo (front+back) y escribe `PROJECT_DESIGN.md`. |

## Variables para slices

No hay slices fijas. Usa los nombres que Claude haya escrito en `TEST_PLAN.md`.

```text
SLICE=<slice folder name from TEST_PLAN.md>
SEED_SLICE=<empty for the first slice, otherwise a completed slice>
```

Si `TEST_PLAN.md` confirma un menu, sidebar o navegacion compartida, el Page Object
de esa pieza debe llamarse `MenuPage`.

## Prompt extra para frontend

Si tienes permiso para modificar el frontend del SUT y faltan `data-testid`, usa
`prompts/11-frontend-testid-instrumentation.md` en el repo frontend antes de crear
o actualizar `TEST_PLAN.md`.

Ese prompt no pertenece al harness externo: modifica el SUT para mejorar su
testabilidad y genera `TESTID_INVENTORY.md`.

## Prompt extra para diseno del proyecto

Si tienes el codigo fuente del SUT (multi-repo o monorepo), corre antes de `03`
`prompts/12-multirepo-project-design.md` o `prompts/13-monorepo-project-design.md`.
Solo leen el codigo y generan `PROJECT_DESIGN.md` + un resumen en `PROJECT_BRIEF.md`
que `03` ya consume.

## Verificacion por slice

```bash
pnpm typecheck
pnpm exec playwright test src/features/<slice> --project=ui-chromium
pnpm exec playwright test src/features/<slice> --project=api
```

Omite el comando API cuando la feature no genero `*.api.spec.ts`.

## Reglas de token

- Usa archivos persistentes para contexto: `PROJECT_BRIEF.md`, `AGENTS.md` y `TEST_PLAN.md`.
- Pega un prompt por paso.
- Genera una slice por vez.
- Pega outputs reales de comandos; no los resumas.
- Pide fixes minimos.
- Maximo 3 intentos por fallo antes de documentar el limite.

## Referencia

[`test-ia-harness`](./test-ia-harness/) muestra la forma esperada del proyecto:
capas, nombres, slices y responsabilidades. No es el flujo principal; tu generas
tu propio harness en una carpeta externa.
