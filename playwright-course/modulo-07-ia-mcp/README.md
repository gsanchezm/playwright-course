# Modulo 07 - IA Test Harness con Claude Code + Playwright MCP

**Duracion estimada:** 90-120 min<br>
**Pieza que suma al framework:** un **AI Test Harness** generado desde cero por Claude Code en una carpeta externa vacia, con Playwright, pnpm, MCP, patrones de diseno, principios SOLID/DRY/KISS y vertical slicing.

Este modulo ya no trata de pedirle a la IA "un test suelto". El objetivo es mas profesional: aprender a usar Claude Code como un ingeniero asistido por IA para **crear, verificar, refactorizar y mantener** un framework E2E completo para cualquier SUT indicando solo la URL de UI y la URL de API. OmniPizza es el ejemplo del curso, no una regla hardcodeada de los prompts.

> Idea central: la IA no reemplaza el criterio tecnico. La IA ejecuta el trabajo mecanico; tu controlas arquitectura, alcance, verificacion y calidad.

---

## Resultado esperado

Al terminar tendras una carpeta externa, por ejemplo:

```text
C:\tmp\omnipizza-ai-harness
# o en macOS/Linux:
~/tmp/omnipizza-ai-harness
```

con un proyecto generado por Claude Code:

```text
omnipizza-ai-harness/
  .claude/
  .vscode/
  src/
    core/
    shared/
    features/
      <slices-descubiertas-por-la-ia>/
        <slice>.spec.ts / <slice>.api.spec.ts
  CLAUDE.md
  AGENTS.md
  PROJECT_BRIEF.md
  package.json
  playwright.config.ts
  tsconfig.json
  pnpm-lock.yaml
```

La referencia esperada vive en [`test-ia-harness`](./test-ia-harness/). No es para copiarla manualmente: sirve para revisar si la salida de la IA tiene la forma correcta.

---

## Stack recomendado

| Capa | Decision del modulo | Motivo |
|---|---|---|
| Agente principal | **Claude Code** | Excelente para modificar repos, leer contexto y ejecutar comandos. |
| IDE | **VS Code** | Editor comun para QA/automation y compatible con MCP. |
| Browser automation para IA | **Playwright MCP** | Claude puede navegar el SUT con snapshots de accesibilidad. |
| Package manager | **pnpm via Corepack** | Rapido, reproducible y consistente con el curso. |
| Entrega opcional | **GitHub CLI (`gh`)** | Permite crear commit, repo privado y push a main al final, sin hacerlo requisito del harness. |
| Arquitectura | Vertical slices + patrones concretos | Evita un framework gigante sin responsabilidad clara. |

Fuentes oficiales usadas para fijar el flujo:

- Playwright MCP: `https://playwright.dev/docs/getting-started-mcp`
- Claude Code MCP: `https://code.claude.com/docs/en/mcp`
- pnpm/Corepack: `https://pnpm.io/installation`
- Playwright install: `https://playwright.dev/docs/intro`
- GitHub CLI: `https://cli.github.com/manual/`

---

## Modelo mental

Un ingeniero novato suele hacer esto:

```text
"Claude, hazme un framework de Playwright completo."
```

Eso produce codigo grande, fragil y dificil de revisar.

En este modulo lo hacemos asi:

```text
1. Script prepara carpeta, MCP config y prompts.
2. Claude verifica ambiente.
3. Claude crea la fundacion, no features.
4. Claude explora UI/API y escribe `TEST_PLAN.md`.
5. Claude genera una slice pequena con casos UI/API del plan.
6. Tu corres tests.
7. Claude corrige con output real.
8. Claude repite slices copiando el patron aprobado.
```

La diferencia es el **contrato**. `AGENTS.md` define reglas estables para que cada prompt sea corto y no gaste tokens repitiendo arquitectura.

---

## Patrones de diseno exigidos

Cada patron tiene una casa fija. Si Claude lo duplica o lo mueve, se corrige.

| Patron | Ubicacion |
|---|---|
| POM | `src/features/*/*.page.ts` |
| Service / Adapter | `src/features/*/*.service.ts` |
| Template Method | `src/core/BasePage.ts` y `src/core/BaseService.ts` |
| Factory | `src/features/*/*.factory.ts` |
| Builder | solo entidades complejas, `*.builder.ts` |
| Facade | `src/features/*/*.flow.ts` |
| Singleton | `src/core/env.ts` |
| Observer | `src/core/reporter.ts` |
| Strategy | Se agrega despues si el SUT requiere estrategias, por ejemplo auth UI/API |
| Dependency Injection | `src/shared/fixtures.ts` |

Reglas de diseno:

- **SRP:** un archivo, una razon principal para cambiar.
- **OCP:** agregar una feature no debe tocar `core/`.
- **DIP:** specs dependen de flows/fixtures, no de implementaciones internas.
- **DRY:** duplicacion comun vive en `core/` o `shared/`.
- **KISS/YAGNI:** una slice no recibe `service`, `factory`, `builder` o `strategy` si no lo necesita.
- **Vertical slicing:** cada feature se entiende en su carpeta.
- **Clean Code:** nombres con intencion, unidades pequenas, guard clauses / early return. Es Clean Code (practicas), no Clean Architecture por capas.
- **Assertions:** 1 por test, maximo 2. Mas que eso suele ser error de diseno; agrupa verificaciones en metodos nombrados del Page/Flow. Un test unitario de forma usa una sola asercion de objeto (`toEqual`).
- **Data-driven:** casos que solo cambian por input se parametrizan sobre `src/shared/data/*.json`, no se copian.
- **Specs co-localizados:** cada spec vive en su slice (`*.spec.ts` / `*.api.spec.ts`); sin carpeta `tests/` separada.
- **MenuPage:** si el SUT tiene menu, sidebar, tabs o navegacion compartida, ese Page Object debe llamarse `MenuPage`.

---

## Setup automatico multiplataforma

El primer paso didactico es usar IA para generar o refrescar los scripts de setup.
Despues ejecutas el script para crear una carpeta externa con los archivos minimos
que Claude necesita antes de generar el framework. En esa carpeta se crea
`PROJECT_BRIEF.md`; por eso el prompt `02-master-architect.md` lo puede leer
despues.

### Prompt 00: crear scripts de setup

Desde el repo del curso, pega [`prompts/00-create-setup-scripts.md`](./prompts/00-create-setup-scripts.md).

Este prompt le pide a Claude Code crear o refrescar:

- `scripts/setup-ai-harness.ps1` para Windows;
- `scripts/setup-ai-harness.sh` para macOS/Linux.

Es parte del flujo porque usas IA para preparar tu propio
ambiente, no sólo para generar tests.

### Windows

```powershell
.\playwright-course\modulo-07-ia-mcp\scripts\setup-ai-harness.ps1 -TargetDir C:\tmp\omnipizza-ai-harness
```

### macOS/Linux

```bash
chmod +x playwright-course/modulo-07-ia-mcp/scripts/setup-ai-harness.sh
./playwright-course/modulo-07-ia-mcp/scripts/setup-ai-harness.sh "$HOME/tmp/omnipizza-ai-harness"
```

OmniPizza es el SUT por defecto. Para otro sistema, cambia solo las URLs:

```powershell
.\playwright-course\modulo-07-ia-mcp\scripts\setup-ai-harness.ps1 `
  -TargetDir C:\tmp\mi-harness `
  -UiUrl https://mi-ui.example.com `
  -ApiUrl https://mi-api.example.com
```

```bash
./playwright-course/modulo-07-ia-mcp/scripts/setup-ai-harness.sh "$HOME/tmp/mi-harness" \
  --ui-url https://mi-ui.example.com \
  --api-url https://mi-api.example.com
```

El script:

- valida `node`, `pnpm`, `claude`, `git`, `gh` opcional y `code` opcional;
- habilita `pnpm` via Corepack si falta;
- crea la carpeta destino;
- escribe `PROJECT_BRIEF.md`;
- escribe `CLAUDE.md` con instrucciones cortas para Claude Code;
- escribe `.mcp.json` para Claude Code;
- escribe `.vscode/mcp.json` para VS Code;
- copia prompts compactos a `prompts/`;
- crea `.gitignore`;
- abre la carpeta en VS Code si `code` existe.

> Si un comando requiere instalacion global, el script te muestra el comando y se detiene. No instala herramientas silenciosamente.

---

## Configuracion MCP

El setup crea esta configuracion en la carpeta externa:

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

Claude Code tambien permite agregarlo manualmente:

```bash
claude mcp add playwright npx @playwright/mcp@latest
claude mcp list
```

Verificacion dentro de Claude Code:

```text
Use Playwright MCP to navigate to https://example.com, call browser_snapshot, and tell me how many links are visible. Do not answer without using the browser tool.
```

Debe usar la tool. Si responde de memoria, MCP no esta conectado.

---

## Prompt extra para test ids

Si el frontend del SUT no tiene `data-testid` estables y el equipo te permite
modificar ese repositorio, usa [`prompts/11-frontend-testid-instrumentation.md`](./prompts/11-frontend-testid-instrumentation.md).

Este prompt se ejecuta en el **repo frontend**, no en el harness externo. Sirve
para que la IA analice componentes, botones, inputs, links, dropdowns, imagenes,
labels, estados y otros elementos visibles, agregue `data-testid` sin cambiar
comportamiento, y genere `TESTID_INVENTORY.md`.

Recomendacion: usarlo antes de `prompts/03-test-plan.md` cuando tienes control
del frontend. Si no tienes permiso de modificar el SUT, no lo uses; el harness
debe trabajar con roles, labels y selectores existentes.

---

## Prompt extra: diseno del proyecto (multi-repo / monorepo)

Si tienes acceso al codigo fuente del SUT (no solo a las URLs), puedes generar un
`PROJECT_DESIGN.md` con rutas, endpoints, entidades y auth confirmados desde el
codigo, para que `prompts/03-test-plan.md` arme un plan mas preciso:

- Multi-repo (frontend y backend separados): [`prompts/12-multirepo-project-design.md`](./prompts/12-multirepo-project-design.md).
- Monorepo (frontend y backend en un repo): [`prompts/13-monorepo-project-design.md`](./prompts/13-monorepo-project-design.md).

Son de solo lectura: analizan el codigo, no lo modifican ni generan tests. Escriben
`PROJECT_DESIGN.md` y anexan un resumen a `PROJECT_BRIEF.md`, que `03` ya lee (por
eso `03` no cambia). Recomendacion: correrlos antes de `prompts/03-test-plan.md`.

---

## Flujo de trabajo

### 1. Preparar carpeta externa

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

Acepta el workspace trust y la configuracion MCP cuando Claude lo pida.

### 2. Ejecutar el prompt 01

Pega [`prompts/01-bootstrap-environment.md`](./prompts/01-bootstrap-environment.md).

Este prompt le pide a Claude que:

- verifique versiones reales;
- inicialice pnpm si hace falta;
- prepare comandos base;
- confirme MCP con una navegacion real;
- no genere el framework todavia.

### 3. Ejecutar el prompt 02

Pega [`prompts/02-master-architect.md`](./prompts/02-master-architect.md).

Este prompt crea la fundacion:

- `AGENTS.md`;
- `package.json`;
- `playwright.config.ts`;
- `tsconfig.json`;
- `.env.example`;
- `src/core/`;
- `src/shared/`.

No debe crear features, auth, datos de dominio ni page objects de la aplicacion todavia.

### 4. Crear el plan de pruebas

Pega [`prompts/03-test-plan.md`](./prompts/03-test-plan.md).

Este prompt obliga a Claude a explorar antes de codificar:

- navega la UI con Playwright MCP;
- descubre endpoints desde la URL de API (`/openapi.json`, `/docs`, `/health` o probes livianos);
- detecta features y propone nombres de slices;
- si existe menu, sidebar, tabs o navegacion compartida, exige `MenuPage`;
- crea `TEST_PLAN.md` con matriz de casos UI/API;
- marca como bloqueado cualquier endpoint que no pueda confirmar.

El objetivo es que no tengas que disenar todos los casos manualmente. Tu
trabajo es revisar que el plan sea razonable antes de permitir que la IA implemente.

### 5. Generar slices

Pega [`prompts/04-slice-generator.md`](./prompts/04-slice-generator.md) una vez por slice propuesta en `TEST_PLAN.md`.

Usa las variables que el propio plan defina:

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

Si no existe `*.api.spec.ts` para esa slice, omite el comando API. Si falla, no
edites a mano. Pega el error con [`prompts/07-healer-review.md`](./prompts/07-healer-review.md).

### 6. Cablear DI y CI

Cuando las slices existan:

1. Pega [`prompts/05-fixtures-di.md`](./prompts/05-fixtures-di.md).
2. Pega [`prompts/06-ci-scripts.md`](./prompts/06-ci-scripts.md).
3. Corre:

```bash
pnpm typecheck
pnpm test:api
pnpm test:ui
```

CI se agrega aqui porque antes de tener specs reales no hay suficiente evidencia
para decidir que debe correr el pipeline. El workflow se valida localmente; solo
corre en GitHub cuando el paso 8 crea el repo y hace push.

### 7. Revision final

Pega [`prompts/07-healer-review.md`](./prompts/07-healer-review.md) con el output real de typecheck, UI y API.

Claude debe entregar:

- suite verde o diagnostico claro;
- lista corta de cambios;
- anti-patterns corregidos;
- archivos modificados.

### 8. Commit, repo en GitHub y CI

Si quieres publicar el harness y ver el CI en verde, pega [`prompts/08-git-github-pr.md`](./prompts/08-git-github-pr.md).

Este prompt hace el commit, crea un repo privado con `gh repo create` y hace push
directo a `main`; ahi es donde el workflow del paso 6 por fin corre en GitHub
Actions. Despues observa el run (`gh run watch`) y, si sale rojo, lo arreglas con
`prompts/07-healer-review.md`. `gh` es opcional: si no esta instalado o autenticado,
el flujo deja el commit local listo y te muestra el comando exacto para crear el
repo despues.

### 9. Crear skill reutilizable opcional

Cuando ya hiciste el flujo manual al menos una vez, pega [`prompts/09-create-reusable-skill.md`](./prompts/09-create-reusable-skill.md).

Este paso crea un artefacto local en `skills/ai-test-harness-builder/` para
reutilizar el protocolo con otro SUT. No instala nada globalmente: primero se
revisa como material didactico y despues, si conviene, se puede copiar o instalar
en el entorno personal de tu agente (Claude Code, Codex, Antigravity, GitHub Copilot, ...).

### 10. Usar la skill para settear otro ambiente

Para practicar el uso de skills, pega [`prompts/10-use-skill-to-bootstrap-harness.md`](./prompts/10-use-skill-to-bootstrap-harness.md).

Este prompt usa la skill local para preparar una nueva carpeta externa desde:

```text
UI_URL=<url de UI>
API_URL=<url de API>
TARGET_DIR=<nueva carpeta externa vacia>
```

La idea es ver el contraste: primero hiciste el flujo manual con prompts, luego
encapsulaste el protocolo en una skill, y finalmente usas esa skill para settear
otro ambiente con menos instrucciones.

---

## Protocolo de eficiencia de tokens

Usa estas reglas durante todo el modulo:

1. **No pegues codigo completo si Claude puede leer archivos.**
2. **No repitas arquitectura en cada prompt:** esta en `AGENTS.md`.
3. **No repitas casos ni endpoints en cada prompt:** estan en `TEST_PLAN.md`.
4. **Pide una slice por vez.**
5. **Obliga a navegar con MCP antes de generar locators.**
6. **Pega outputs de error completos, no explicaciones tuyas.**
7. **Pide diffs pequenos:** "fix only the failing file".
8. **Corta loops:** maximo 3 intentos por fallo antes de documentar el limite.

Prompt corto para mantener disciplina:

```text
Read AGENTS.md first. Make the smallest change that fixes the failing check. Do not refactor unrelated files. Run the check again and report only the result.
```

---

## Senales de mala salida de IA

Rechaza o corrige si ves:

- locators CSS profundos o XPath;
- `waitForTimeout`;
- tests que hacen login UI en todos los specs sin razon;
- `core/` importando features;
- una slice que toca archivos de otra feature sin necesidad;
- builders para objetos simples;
- services UI mezclados con Page Objects;
- comentarios largos explicando lo obvio;
- codigo que no compila;
- "TODO" en archivos del harness.

---

## Entregable

Sube o comparte:

1. ruta del proyecto externo;
2. captura o output de `claude mcp list`;
3. `pnpm typecheck` verde;
4. `pnpm test:api` y `pnpm test:ui`, o reporte de maximo 3 iteraciones si no quedan verdes;
5. respuesta breve: que hizo bien Claude Code y que tuviste que corregir.

---

## Referencia

[`test-ia-harness`](./test-ia-harness/) contiene una version de referencia de la arquitectura esperada. Usala para comparar estructura, nombres y responsabilidades, no como solucion para copiar.
