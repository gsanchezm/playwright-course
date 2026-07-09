# Reto - M07 IA Test Harness

## Objetivo

Generar un framework E2E desde cero usando Claude Code + Playwright MCP, sin escribir codigo de produccion a mano. Tu trabajo es dirigir, verificar y corregir con prompts.

## Restricciones

- El proyecto debe vivir en una **carpeta externa vacia**, no dentro del repo del curso.
- El package manager debe ser `pnpm`.
- La app objetivo es OmniPizza:
  - UI: `https://omnipizza-frontend.onrender.com`
  - API: `https://omnipizza-backend.onrender.com`
- Para otro SUT, cambia solo la URL de UI y la URL de API; los prompts no deben asumir features de OmniPizza.
- El flujo principal es **Claude Code** en terminal + **VS Code** como IDE.
- Claude debe usar **Playwright MCP** para confirmar selectores reales antes de crear specs UI.
- No se permite editar manualmente el codigo generado, salvo que documentes exactamente por que Claude Code no pudo corregirlo tras 3 intentos.

## Setup

Desde la raiz del curso:

Primero pide a Claude Code crear o refrescar los scripts multiplataforma:

```text
prompts/00-create-setup-scripts.md
```

Despues ejecuta el script generado segun tu sistema operativo.

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

El setup crea `PROJECT_BRIEF.md` y `CLAUDE.md` dentro de la carpeta externa.
`PROJECT_BRIEF.md` guarda el contexto del SUT; `CLAUDE.md` da instrucciones
cortas que Claude Code lee desde el arranque.

Dentro de Claude Code, acepta la configuracion MCP del proyecto cuando aparezca.

## Pasos obligatorios

### 1. Verificacion de ambiente

Pega el prompt:

```text
prompts/01-bootstrap-environment.md
```

Debe confirmar:

- version de Node;
- version de pnpm;
- version de Claude Code;
- conexion MCP real;
- carpeta externa lista.

Evidencia: pega en tu entrega el resumen de Claude o captura de `claude mcp list`.

### 2. Fundacion del framework

Pega:

```text
prompts/02-master-architect.md
```

Debe crear:

- `AGENTS.md`;
- `PROJECT_BRIEF.md` actualizado si hace falta;
- `package.json`;
- `playwright.config.ts`;
- `tsconfig.json`;
- `.env.example`;
- `src/core/`;
- `src/shared/`.

No debe crear `auth`, `catalog`, `cart`, `checkout` ni ninguna feature todavia.

Verifica:

```bash
pnpm install
pnpm typecheck
```

Si falla, usa `prompts/07-healer-review.md`.

### 3. Plan de pruebas UI/API

Pega:

```text
prompts/03-test-plan.md
```

Debe crear `TEST_PLAN.md` con:

- evidencia UI encontrada con Playwright MCP;
- endpoints API confirmados o bloqueados;
- matriz de casos `ui` y `api`;
- slices detectadas y orden de implementacion.

Si existe menu, sidebar, tabs o navegacion compartida, el plan debe exigir un
Page Object llamado `MenuPage`.

### 4. Slices verticales

Genera las slices una por una con:

```text
prompts/04-slice-generator.md
```

Usa las slices que `TEST_PLAN.md` haya propuesto:

```text
SLICE=<slice folder name from TEST_PLAN.md>
SEED_SLICE=<empty for first slice, otherwise a completed slice>
```

Despues de cada slice:

```bash
pnpm typecheck
pnpm exec playwright test src/features/<slice> --project=ui-chromium
pnpm exec playwright test src/features/<slice> --project=api
```

Si la slice no tiene `*.api.spec.ts`, omite el comando API.

Regla: si Claude genera locators sin navegar con MCP, rechaza la salida y pide que navegue primero.

### 5. Fixtures e inyeccion de dependencias

Pega:

```text
prompts/05-fixtures-di.md
```

Debe cablear flows/servicios desde `src/shared/fixtures.ts` sin meter logica de feature en `shared/`.

Verifica:

```bash
pnpm typecheck
```

### 6. Scripts y CI

Pega:

```text
prompts/06-ci-scripts.md
```

Debe agregar scripts utiles y workflow de GitHub Actions.
Este paso va despues de tener specs reales, no antes. El workflow se valida
localmente aqui; solo corre en GitHub cuando el paso 8 crea el repo y hace push.

Verifica:

```bash
pnpm test:api
pnpm test:ui
```

### 7. Healer final

Pega:

```text
prompts/07-healer-review.md
```

con los outputs reales de:

```bash
pnpm typecheck
pnpm test:api
pnpm test:ui
```

Claude debe corregir solo lo necesario.

### 8. Commit, repo en GitHub y CI

Si quieres publicar por GitHub, pega:

```text
prompts/08-git-github-pr.md
```

Hace el commit, crea un repo privado con `gh repo create` y hace push a `main`; ahi
corre el workflow del paso 6 en GitHub Actions. Observa el run y, si sale rojo, usa
`prompts/07-healer-review.md`. `gh` es opcional: si no esta instalado o autenticado,
deja el commit local listo y muestra el comando para crear el repo despues.

### 9. Crear skill reutilizable opcional

Si ya completaste el flujo manual, pega:

```text
prompts/09-create-reusable-skill.md
```

Debe crear:

- `skills/ai-test-harness-builder/SKILL.md`
- `skills/ai-test-harness-builder/references/workflow.md`

La skill debe quedar generica para cualquier SUT y no debe instalarse globalmente
sin que tu lo pidas.

### 10. Usar la skill para settear otro ambiente

Pega:

```text
prompts/10-use-skill-to-bootstrap-harness.md
```

Usa valores nuevos:

```text
UI_URL=<url de UI>
API_URL=<url de API>
TARGET_DIR=<nueva carpeta externa vacia>
```

Debe crear un segundo workspace con `PROJECT_BRIEF.md`, `CLAUDE.md`, MCP config,
prompts y `.gitignore`, sin generar todavia la fundacion ni features.

## Criterios de aceptacion

- [ ] Proyecto externo creado y versionado.
- [ ] `AGENTS.md` define patrones, principios y reglas de exports.
- [ ] `TEST_PLAN.md` contiene matriz UI/API basada en evidencia.
- [ ] `src/core/` no depende de `src/features/`.
- [ ] Cada feature vive en su slice.
- [ ] Si hay navegacion compartida, existe `MenuPage`.
- [ ] Al menos un test `@smoke` pasa.
- [ ] Hay al menos un spec UI y un spec API, o un bloqueo API documentado con evidencia.
- [ ] No hay `waitForTimeout`.
- [ ] No hay XPath ni CSS profundo.
- [ ] Tests con 1-2 assertions reales (las esperas web-first de sincronizacion y los metodos nombrados del Page/Flow no cuentan; un unit de forma usa una sola asercion de objeto `toEqual`).
- [ ] Codigo con guard clauses / early return (Clean Code, no Clean Architecture por capas).
- [ ] Casos que solo varian por input son data-driven sobre `shared/data/*.json`, no copiados.
- [ ] Specs co-localizados en cada slice; sin carpeta `tests/` separada.
- [ ] `pnpm typecheck` pasa o hay diagnostico claro tras 3 intentos.
- [ ] Hay evidencia de uso real de Playwright MCP.
- [ ] Entrega incluye reflexion breve sobre limites reales de Claude Code.

## Entrega

Incluye:

```text
Ruta del proyecto:
Comando usado para setup:
Resultado de claude mcp list:
Resultado de pnpm typecheck:
Resultado de pnpm test:api:
Resultado de pnpm test:ui:
Commit + repo URL + estado del CI si aplica:
Skill creada si aplica:
Segundo ambiente creado con skill si aplica:
Numero de iteraciones de fix:
Leccion aprendida:
```

## Bonus opcional

### Test ids en el frontend

Si tienes acceso al repo frontend del SUT y permiso para modificarlo, ejecuta este
prompt desde el frontend:

```text
prompts/11-frontend-testid-instrumentation.md
```

Entrega adicional:

```text
Ruta del frontend:
TESTID_INVENTORY.md:
Checks frontend ejecutados:
Resumen de data-testid agregados:
```

### Diseno del proyecto desde el codigo (multi-repo / monorepo)

Si tienes el codigo fuente del SUT (no solo las URLs), genera un `PROJECT_DESIGN.md`
antes del plan:

```text
prompts/12-multirepo-project-design.md   (frontend y backend separados)
prompts/13-monorepo-project-design.md    (frontend y backend en un repo)
```

Solo leen el codigo (no lo modifican ni generan tests). Escriben `PROJECT_DESIGN.md`
y anexan un resumen a `PROJECT_BRIEF.md`, que `prompts/03-test-plan.md` ya lee.

### Bug hunting

Pide a Claude dentro del harness generado:

```text
Explore the target system as a QA engineer. Use Playwright MCP, do not create tests yet. Find three real risks or bugs, capture evidence, and propose which one should become the next automated test.
```

No automatices el bug hasta que tengas pasos de reproduccion estables.
