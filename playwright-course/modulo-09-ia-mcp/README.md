# Módulo 09 — Equipo de agentes de QA (de la historia de usuario al test, con `AGENTS.md` + subagentes + skill)

**Duración estimada:** 145 min (2 h 25 min) · módulo opcional · +15 min si haces el Paso 8 (opcional)
**Piezas que suma al framework:**
- `AGENTS.md` — el "manual del equipo": proyecto, convenciones, contrato de handoff y reglas. Es la **fuente de verdad portable**.
- `agents/*.md` — **6 subagentes** (`qa-reviewer`, `qa-test-designer`, `qa-automation-developer`, `qa-triage`, `qa-healer`, `qa-bug-reporter`), cada uno con un rol, una entrada y una salida en archivo.
- `skills/qa-flow/SKILL.md` — la **skill** que orquesta los 6 agentes en orden: `/qa-flow US-01`.
- `scripts/sync-claude.ps1` · `scripts/sync-claude.sh` — el adaptador de Claude Code: **copia** `agents/` y `skills/` a `.claude/` y crea `CLAUDE.md`.
- `settings.local.json.example` — plantilla de `.claude/settings.local.json` (modelo, advisor, modelo de subagentes).
- `stories/US-01..03` + `evidence/fallo-observado/` + `tests/seeded/` — los escenarios del módulo (historias, evidencia de un fallo y un spec que falla).
- **Skills de mapas (de terceros, opcionales, instaladas en el proyecto):** `graphify` (grafo de conocimiento del repo) y `archify` (diagramas de arquitectura en HTML). Con ellas la IA dibuja **dos arquitecturas**: la del proyecto y la del equipo de agentes.

**Lo que NO suma — hereda del estado final de M07:** `pages/`, `services/`, `fixtures/omnipizza.ts`, `fixtures/api.ts` (fixtures de API de M06: `authService`, `accessToken`), `data/`, `types/` y `tests/setup/auth.api.setup.ts` (login por API). Los agentes **reutilizan** esas piezas — no las reinventan.

---

> 🎁 **Proyecto de referencia — [`proyecto/`](proyecto/).** Proyecto Playwright **autocontenido y ejecutable** con todo lo de este módulo ya armado (su propio `package.json`, `playwright.config.ts`, `.env.example`). Ábrelo aparte: `pnpm install` → `pnpm install:browsers` → copia `.env.example` a `.env` → `pnpm sync:claude:win` o `pnpm sync:claude:sh`. Detalles en [`proyecto/README.md`](proyecto/README.md).

## La idea, en una frase

**Un equipo de agentes se define con archivos Markdown, no con código:** un `AGENTS.md` que dice cómo trabajamos, un agente por rol con una entrada y una salida claras, y una skill que los encadena. Tú sigues siendo el QA: revisas, confirmas y decides.

> 🧭 **¿Prefieres el enfoque por prompts?** Hay un camino alterno, más manual y más largo, en el [módulo especial de IA Test Harness avanzado](../modulo-especial-ia-harness-avanzado/README.md): ahí construyes el mismo tipo de arnés con una cadena de prompts. M09 es el camino principal.

---

## 🏗️ Arquitectura al terminar este módulo

```
modulo-09-ia-mcp/proyecto/
├── AGENTS.md                       ← 🆕 fuente de verdad: proyecto + convenciones + handoff + reglas
├── agents/                         ← 🆕 un archivo por rol (frontmatter + Rol/Entrada/Salida/Límites)
│   ├── reviewer.md · test-designer.md · automation-developer.md
│   └── triage.md · healer.md · bug-reporter.md
├── skills/qa-flow/SKILL.md         ← 🆕 orquesta los 6 agentes: /qa-flow
├── scripts/sync-claude.{ps1,sh}    ← 🆕 copia agents/ y skills/ a .claude/ (+ CLAUDE.md)
├── settings.local.json.example     ← 🆕 plantilla de .claude/settings.local.json
├── docs-adaptadores.md             ← 🆕 Claude Code, Codex, Cursor, Copilot, Gemini CLI
├── stories/US-01..03               ← 🆕 historias de usuario de OmniPizza
├── evidence/fallo-observado/       ← 🆕 evidencia capturada de un fallo
├── tests/
│   ├── seeded/                     ← 🆕 un spec que falla (solo corre con pnpm test:seeded)
│   └── generated/                  ← 🆕 aquí escribe el Automation Developer
├── work/<id>/                      ← 🆕 (gitignored) archivos de handoff por historia
├── graphify-out/ · .archify/       ← 🆕 (generados, gitignored) grafo y diagramas del Paso 8
├── .claude/ · CLAUDE.md            ← 🆕 (generados, gitignored) copias para Claude Code
└── pages/ · services/ · fixtures/ · data/ · types/ · tests/setup/   ← (M04–M07, sin cambios)
```

**Flujo del equipo** (cada agente lee lo que dejaron los anteriores en `work/<id>/` y escribe solo su archivo):

```
stories/US-01-*.md
   │
   ▼
qa-reviewer ──► work/US-01/01-review.md ──► qa-test-designer ──► 02-cases.md
                                                                    │
                                                                    ▼
                                          qa-automation-developer ──► tests/generated/US-01.spec.ts
                                                                    │  (si algo falla)
                                                                    ▼
                                                    qa-triage ──► 04-triage.md ─┬─► qa-healer ──► 06-heal.md
                                                                                └─► qa-bug-reporter ──► 05-issue-draft.md
```

**Qué NO existe:** un agente que decida solo y publique solo. El Reviewer puede **detener** el flujo con preguntas bloqueantes, y el Bug Reporter **pide tu confirmación** antes de crear nada en GitHub.

---

## Analogía de apertura

Un equipo de QA real no es una persona que hace todo: hay quien **revisa la historia**, quien **diseña los casos**, quien **automatiza**, y quien **investiga qué pasó cuando algo se pone rojo**. Cada uno deja su trabajo por escrito para que el siguiente lo recoja. Aquí montas ese mismo equipo con seis "compañeros" de IA: cada uno tiene un puesto, una bandeja de entrada y una bandeja de salida. El `AGENTS.md` es el reglamento de la oficina; la skill `qa-flow` es el jefe de turno que pasa el trabajo de mano en mano.

---

## ¿Qué aprenderás?

1. **Qué es un subagente** y qué lo hace útil: rol acotado, entrada y salida en archivo, modelo propio.
2. **Cómo crear un `AGENTS.md`** desde cero: qué incluir y qué dejar fuera.
3. **El contrato de handoff:** nombres de archivo en `work/<id>/` que conectan un agente con el siguiente.
4. **Modelos y advisor:** qué modelo usa cada agente y cómo lo ajustas con `.claude/settings.local.json`.
5. **Triage:** decidir si un fallo es del test, de la app o intermitente, **con evidencia**.
6. **Humano en el circuito:** dónde el flujo se detiene a preguntarte.
7. **Portabilidad:** los mismos archivos sirven en otras herramientas (Codex, Cursor, Copilot, Gemini CLI).
8. **Mapas con IA (opcional):** instalar las skills `graphify` y `archify`, y pedir un grafo del repo y dos arquitecturas (proyecto y agentes) que luego verificas contra el código.

---

## Conceptos JIT

| Concepto | Analogía |
|---|---|
| Subagente (`agents/<rol>.md`) | Un compañero con puesto fijo: su descripción de trabajo, su bandeja de entrada y su bandeja de salida |
| `AGENTS.md` | El reglamento de la oficina: lo que todos deben saber antes de tocar nada |
| Skill (`skills/qa-flow/SKILL.md`) | El procedimiento del jefe de turno: en qué orden pasa el trabajo y cuándo para |
| Handoff (`work/<id>/NN-*.md`) | La bandeja entre escritorios: el siguiente solo lee lo que dejó el anterior |
| `model:` del frontmatter | El nivel del compañero: tareas ligeras a uno rápido, tareas de código a uno más capaz |
| MCP de Playwright | Unos ojos para mirar la app real mientras se trabaja |
| Adaptador | El enchufe: mismos archivos, distinta herramienta |
| Grafo (`graphify`) | El índice del archivo: qué se conecta con qué, para no leer todo cada vez |
| Diagrama (`archify`) | El plano del edificio: se dibuja a partir de lo construido, y se compara con la obra |

---

## Presupuesto de tiempo

| Paso | Tema | Minutos |
|---|---|---|
| 1 | Concepto: agentes, `AGENTS.md`, settings, modelos | 15 |
| 2 | Entorno y MCP | 10 |
| 3 | Reviewer + Test Designer | 25 |
| 4 | Automation Developer | 25 |
| 5 | Triage + Healer sobre el spec que falla | 25 |
| 6 | Bug Reporter y el issue | 15 |
| 7 | `qa-flow` completo con una historia nueva | 20 |
| 8 | *(Opcional)* Mapas: un grafo y dos arquitecturas | *+15* |
| 9 | Reto y cierre | 10 |
| | **Total** | **145** (160 con el Paso 8) |

---

## Paso a paso

> **Cómo leer esta sección:** trabajas en [`proyecto/`](proyecto/) con Claude Code abierto en esa carpeta. Los comandos `pnpm` son iguales en cualquier shell; solo el script de sincronización cambia entre PowerShell y bash.

### Paso 1 — Concepto: agentes, `AGENTS.md`, settings y modelos (15 min)

**Un subagente es un archivo Markdown** con un frontmatter y un cuerpo. Abre [`proyecto/agents/triage.md`](proyecto/agents/triage.md):

- **Frontmatter:** `name`, `description` (cuándo usarlo) y `model` (qué modelo lo ejecuta).
- **Cuerpo:** `Rol`, `Entrada`, `Salida`, `Límites`. Es un contrato corto: qué lee, qué escribe, qué no debe hacer.

**Quién usa qué modelo** (campo `model:` de cada agente):

| Agente | Modelo | Por qué |
|---|---|---|
| `qa-reviewer`, `qa-triage`, `qa-bug-reporter` | `haiku` | Leer y redactar: rápido y barato |
| `qa-test-designer`, `qa-automation-developer`, `qa-healer` | `sonnet` | Diseñar y escribir/reparar código: más razonamiento |

**`.claude/settings.local.json`** es tu configuración personal de Claude Code para este proyecto (está en `.gitignore`). La plantilla es [`proyecto/settings.local.json.example`](proyecto/settings.local.json.example):

```json
{
  "model": "sonnet",
  "advisorModel": "fable",
  "env": { "CLAUDE_CODE_SUBAGENT_MODEL": "haiku" }
}
```

- `model` — el modelo de **tu sesión**.
- `advisorModel` — un modelo más capaz que la sesión puede consultar; los subagentes lo heredan.
- `CLAUDE_CODE_SUBAGENT_MODEL` — modelo **por defecto** de los subagentes.

**Precedencia del modelo de un subagente** (de mayor a menor): el `model` indicado **al invocarlo** > el `model:` de su frontmatter > `CLAUDE_CODE_SUBAGENT_MODEL` > el modelo de la sesión. Esa variable es solo un valor por defecto; para **forzarla** a todos agrega `CLAUDE_CODE_SUBAGENT_MODEL_FORCE=1`.

> ⚠️ **Advisor, lo que debes saber:** acepta `fable`, `opus` o `sonnet` (o un ID de modelo completo), **no** el alias `haiku`; no funciona con Bedrock/Foundry ni con `DISABLE_TELEMETRY`. El detalle y la verificación contra la documentación oficial están en [`proyecto/docs-adaptadores.md`](proyecto/docs-adaptadores.md).

El archivo de settings es **opcional**: sin él, cada agente usa el `model:` de su frontmatter.

También en este paso: aprende a escribir el `AGENTS.md` en la sección [Cómo crear un `AGENTS.md` desde cero](#cómo-crear-un-agentsmd-desde-cero) (más abajo).

### Paso 2 — Entorno y MCP (10 min)

Si aún no tienes Claude Code, Node, pnpm o `gh` listos, revisa [Herramientas de IA](../../00-setup/08-herramientas-ia.md). Para el Paso 6 necesitas `gh auth login`.

1. Instala y prepara el proyecto:

   ```bash
   cd modulo-09-ia-mcp/proyecto
   pnpm install
   pnpm install:browsers
   ```

   Copia `.env.example` a `.env` (en PowerShell `Copy-Item .env.example .env`, en bash `cp .env.example .env`).

2. Sincroniza el adaptador de Claude Code. Copia (no enlaza, por Windows) los agentes y la skill a `.claude/` y crea `CLAUDE.md` con `@AGENTS.md`. **No pisa** un `CLAUDE.md` ni un `.claude/settings.local.json` que ya tengas.

   PowerShell:

   ```powershell
   pnpm sync:claude:win
   ```

   bash:

   ```bash
   pnpm sync:claude:sh
   ```

3. (Opcional) crea tu `.claude/settings.local.json` copiando la plantilla del Paso 1.

4. **MCP de Playwright.** Los agentes `automation-developer`, `triage` y `healer` pueden mirar la app real a través del MCP de Playwright. Regístralo una vez en Claude Code:

   ```bash
   claude mcp add playwright -- npx @playwright/mcp@latest
   ```

5. Verifica la base: `pnpm test` debe pasar en verde (corre solo el project `chromium`; el spec que falla vive aparte y **no** se ejecuta aquí).

> 💡 OmniPizza está en el plan gratuito de Render: la primera carga puede tardar (cold start). No es un bug.

### Paso 3 — Reviewer + Test Designer (25 min)

Los dos primeros agentes trabajan **sin tocar código**: leen la historia y producen documentos.

1. Lee la historia [`proyecto/stories/US-01-catalogo-por-mercado.md`](proyecto/stories/US-01-catalogo-por-mercado.md).
2. En Claude Code, dentro de `proyecto/`: *"Usa el agente `qa-reviewer` con la historia US-01"*. Produce `work/US-01/01-review.md` (preguntas, ambigüedades, supuestos).
3. Lee el resultado. Responde a las preguntas que marque como **bloqueantes**: el flujo completo se detiene en ese punto hasta que contestes.
4. *"Usa el agente `qa-test-designer`"*. Lee `01-review.md` y produce `work/US-01/02-cases.md` con 5-8 casos (id, título, pasos, esperado, UI/API).
5. Revisa los casos como lo haría un QA: ¿cubren todos los criterios de aceptación? ¿hay casos inventados?

🔍 **Detalle clave:** cada agente lee lo que dejaron los anteriores en `work/<id>/`. Si algo quedó fuera de `01-review.md`, no llega a los casos. Ese es el costo (y la disciplina) del handoff por archivos.

### Paso 4 — Automation Developer (25 min)

1. *"Usa el agente `qa-automation-developer`"*. Lee `02-cases.md` y escribe `tests/generated/US-01.spec.ts`, **reutilizando** los Page Objects y servicios del proyecto.
2. Revisa el spec con los ojos del curso:
   - ¿Usa los fixtures y Page Objects (nada de locators directos en el test)?
   - ¿Locators por rol/label o `data-testid`? ¿Sin `waitForTimeout`?
   - ¿Cada caso de `02-cases.md` tiene su test?
3. Corre lo generado:

   ```bash
   pnpm test
   ```

4. Si algo falla, **no lo arregles tú todavía**: guarda ese fallo para el Triage. Un spec generado no es un spec correcto hasta que lo revisas.

### Paso 5 — Triage + Healer sobre el spec que falla (25 min)

El proyecto trae un spec que falla: [`proyecto/tests/seeded/checkout-pedido.spec.ts`](proyecto/tests/seeded/checkout-pedido.spec.ts). Solo corre bajo demanda.

1. Corre el spec y mira el fallo con tus propios ojos:

   ```bash
   pnpm test:seeded
   ```

2. *"Usa el agente `qa-triage` con este spec"*. En este paso el `<id>` es el nombre del spec sin `.spec.ts` (`checkout-pedido`). Deja su veredicto en `work/<id>/04-triage.md`: `test-defect`, `app-defect` o `flaky`, **con evidencia**. Lee la evidencia, no solo el veredicto.
3. Sigue el camino que indique el veredicto, según el contrato de [`proyecto/AGENTS.md`](proyecto/AGENTS.md). Si le toca al Healer: *"usa el agente `qa-healer`"*; modifica el spec y reporta en `work/<id>/06-heal.md`.
4. Vuelve a correr `pnpm test:seeded`. Si sigue rojo, regresa al Triage (máximo una vez más).
5. Compara el diff del spec con lo que esperabas. ¿El agente cambió lo mínimo?

🔍 **Detalle clave:** el Triage no arregla nada. Solo **clasifica**. Separar quién decide de quién ejecuta evita que un agente "arregle" un test escondiendo un problema real.

### Paso 6 — Bug Reporter y el issue (15 min)

La carpeta [`proyecto/evidence/fallo-observado/`](proyecto/evidence/fallo-observado/) contiene evidencia capturada de un fallo (mensaje de error, snapshot de accesibilidad, log de acciones y captura). Su [README](proyecto/evidence/fallo-observado/README.md) describe cada archivo.

1. Pide al Triage que analice **esa evidencia**: *"Usa el agente `qa-triage` con la evidencia de `evidence/fallo-observado/`"*. Aquí el `<id>` es el nombre de la carpeta de evidencia (`fallo-observado`).
2. Si el veredicto lo manda al Bug Reporter: *"Usa el agente `qa-bug-reporter`"*. Escribe `work/<id>/05-issue-draft.md` con Título, Entorno, Pasos, Esperado, Actual, Evidencia y Severidad.
3. **El agente se detiene y te pregunta.** Antes de crear nada, te muestra el repositorio destino (`gh repo view --json nameWithOwner`) y el borrador, y espera tu confirmación explícita.
4. Reglas que no se negocian:
   - Crea el issue **solo en tu repositorio propio**, nunca en un repositorio compartido.
   - Necesitas `gh` autenticado (`gh auth login`); si no lo estás, el agente deja el borrador listo y no ejecuta nada.
   - Si trabajas en un fork, los Issues vienen desactivados por defecto: actívalos en Settings > Features. Además fija el repo destino con `gh repo set-default <tu-usuario>/<repo>` para que `gh` apunte a tu repositorio y no al original.
5. Confirma el repositorio y revisa el issue creado.

### Paso 7 — `qa-flow` completo con una historia nueva (20 min)

Ahora el jefe de turno hace todo el recorrido. Lanza el flujo y revisa los primeros archivos en clase; el resto de la corrida (varios minutos) puede terminar fuera de clase. Elige una historia que **aún no hayas usado**: [`proyecto/stories/US-02-checkout-sa.md`](proyecto/stories/US-02-checkout-sa.md) o [`proyecto/stories/US-03-login-usuario-problematico.md`](proyecto/stories/US-03-login-usuario-problematico.md).

1. En Claude Code: `/qa-flow US-02` (o `US-03`).
2. La skill invoca a los agentes en orden, verifica que cada archivo exista en `work/<id>/` antes de seguir y **se detiene** si el Reviewer marca algo como bloqueante.
3. Cuando termine, lee su resumen: archivos generados, resultado final y próximos pasos.
4. Revisa la carpeta `work/US-02/` en orden. ¿Dónde habrías intervenido tú?

Con otra herramienta (Codex, Cursor, Copilot, Gemini CLI) sigue los pasos de la skill a mano, usando el cuerpo de cada `agents/<rol>.md` como prompt. Mira [`proyecto/docs-adaptadores.md`](proyecto/docs-adaptadores.md).

### Paso 8 — (Opcional) Mapas: un grafo y dos arquitecturas (15 min + lo que tarde la corrida)

Paso **opcional**: no hace falta para el Outcome principal. Ya tienes un equipo funcionando; ahora le pides a la IA que **lo dibuje**: primero un grafo de conocimiento del repositorio (graphify) y luego dos diagramas de arquitectura (archify). Un diagrama que sale del código real sirve para onboarding y para **detectar lo que el equipo no hace como crees**.

**A. Instala las dos skills a nivel proyecto** (quedan dentro de `proyecto/.claude/`, que está en `.gitignore`: cada alumno instala las suyas y nada de terceros entra a tu repositorio). Hazlo **después** de `pnpm sync:claude:*` (Paso 2), para que `CLAUDE.md` ya tenga `@AGENTS.md`.

1. **graphify.** Es un paquete de Python 3.10+; el paquete se llama `graphifyy` (con doble `y`) pero el comando es `graphify`. Primero el programa, una sola vez por máquina, y luego la skill en el proyecto:

   ```bash
   uv tool install graphifyy
   graphify install --project
   ```

   Sin `uv` sirve `pipx install graphifyy` o `pip install graphifyy`. Si `graphify` no se encuentra, ejecuta `uv tool update-shell` y abre una terminal nueva.

   `graphify install --project` hace **tres** cosas en `proyecto/`: copia la skill a `.claude/skills/graphify/`, **agrega una sección a `CLAUDE.md`** (le dice a Claude que consulte el grafo antes de leer código) y **registra hooks** en `.claude/settings.json`. Si luego quieres quitarlo: `graphify claude uninstall`.

2. **archify.** Necesita Node.js 18+. Sin la bandera `-g` el comando instala en el proyecto:

   ```bash
   npx skills add tt-a1i/archify -a claude-code
   ```

   Descarga el repositorio completo (unos 50 MB), así que en una red lenta puede tardar o fallar: reintenta. Comprueba que quedó en `.claude/skills/archify/` (también crea `skills-lock.json` en `proyecto/`). Archify consulta un manifiesto de versiones para avisar de actualizaciones; si no quieres red en clase, define `ARCHIFY_UPDATE_CHECK_DISABLED=1`.

3. **Abre una sesión nueva de Claude Code** en `proyecto/` (carga las skills al arrancar) y comprueba: escribe `/graphify` y pregunta *"¿tienes la skill archify?"*.

> ⚠️ Son skills de terceros y ejecutan código en tu máquina. Revisa sus repositorios antes de instalarlas en un equipo de trabajo.

**B. Genera el grafo.** En Claude Code, dentro de `proyecto/`:

```text
/graphify . --no-viz
```

Crea `graphify-out/` con `GRAPH_REPORT.md` (conceptos clave, conexiones y preguntas sugeridas) y `graph.json`. Quita `--no-viz` si quieres también `graph.html`, un grafo interactivo para el navegador. Puede tardar varios minutos y consume tokens (usa el LLM para extraer relaciones): córrelo desde `proyecto/`, no desde la raíz del repositorio, y mientras corre lee el Paso 9. Cuando termine, pregúntale algo:

```text
/graphify query "¿qué archivos intervienen desde que un agente recibe una historia hasta que se genera un spec?"
/graphify explain "qa-triage"
```

**C. Arquitectura 1 — el proyecto.**

```text
Lee graphify-out/GRAPH_REPORT.md y el código de este proyecto. Usa archify para crear un
diagrama de arquitectura del PROYECTO Playwright: capas (pages, services, fixtures de UI y
de API, data, tests), los projects de playwright.config.ts (setup-api → chromium, y seeded
aparte), cómo se reutiliza la sesión de login por API y hacia dónde apunta (OmniPizza).
Que cada caja salga de un archivo real. Guarda el HTML en .archify/ y dime la ruta.
```

**D. Arquitectura 2 — el equipo de agentes.**

```text
Lee AGENTS.md, agents/*.md y skills/qa-flow/SKILL.md. Usa archify para crear un diagrama
de arquitectura del EQUIPO DE AGENTES: AGENTS.md como fuente de verdad, los 6 agentes con
su modelo, la skill qa-flow que los orquesta, los archivos de handoff en work/<id>/, los
dos puntos donde un humano interviene (preguntas bloqueantes del Reviewer y confirmación
del Bug Reporter), el MCP de Playwright y el adaptador a .claude/. Guarda el HTML en
.archify/ y dime la ruta.
```

**E. Ábrelos y compara contra la realidad.** Abre los HTML en el navegador (están en `.archify/<tipo>-<tema>-<fecha>/`). Revisa:

- ¿Cada caja corresponde a un archivo que existe? Busca una que no.
- ¿El orden de los agentes y los nombres de archivo de `work/<id>/` coinciden con `AGENTS.md`?
- ¿Algún agente aparece con un modelo equivocado? Corrígelo en el chat y pide que regenere (*"corrige el modelo del Triage"*).

> 💡 **Los diagramas son una hipótesis, no un hecho.** La IA los dibuja leyendo archivos; si leyó mal, el dibujo sale convincente y equivocado. Tu trabajo es el punto E.
> 💡 `graphify-out/` y `.archify/` son artefactos generados y ya están en el `.gitignore` del proyecto.

### Paso 9 — Reto y cierre (10 min)

Haz el [reto del módulo](reto.md): escribe tu propia historia, córrela con `qa-flow` y mejora el equipo con un séptimo agente o una regla nueva en `AGENTS.md`.

---

## Cómo crear un `AGENTS.md` desde cero

Este es el archivo que más rendimiento da por línea escrita, y el que más se estropea por exceso. Hazlo así, en este orden:

1. **El proyecto (3-6 líneas):** qué se prueba, URLs, cómo se configura (`.env.example`), usuarios de prueba y particularidades conocidas (por ejemplo, el cold start).
2. **Convenciones del código:** dónde viven los Page Objects, servicios y fixtures; cómo se eligen los locators; qué está prohibido (`waitForTimeout`, CSS/XPath frágil); dónde se escriben los specs nuevos.
3. **Contrato de handoff:** una tabla paso → agente → archivo que produce. Es lo que une a los agentes entre sí.
4. **Reglas cortas y verificables:** "no inventes datos", "el issue va a mi repo y con confirmación". Cada regla debe poder comprobarse mirando un archivo.
5. **Puntero a la skill:** una línea hacia `skills/qa-flow/SKILL.md`, no su contenido.

**Qué NO poner:**

- **Credenciales o secretos.** Eso va en `.env`, que nunca se versiona.
- **Lo que ya está en el código.** No copies el contenido de los Page Objects; cita la carpeta.
- **El detalle de cada agente.** Eso vive en `agents/<rol>.md`; si lo duplicas, se desincroniza.
- **Un manual largo.** Se carga en cada conversación y compite por atención. Si pasa de unas 60 líneas, algo debe salir a un agente o a la skill.
- **Instrucciones específicas de una herramienta.** `AGENTS.md` es la fuente portable; lo propio de Claude Code va en el adaptador (`CLAUDE.md` con `@AGENTS.md`).

Compara el tuyo con [`proyecto/AGENTS.md`](proyecto/AGENTS.md) cuando termines.

---

## ▶️ Cómo ejecutar este módulo

Desde `proyecto/`:

- **Instalar:** `pnpm install` y `pnpm install:browsers`
- **Sincronizar agentes (Claude Code):** `pnpm sync:claude:win` (PowerShell) o `pnpm sync:claude:sh` (bash)
- **Suite normal (incluye lo generado):** `pnpm test`
- **Solo el spec que falla:** `pnpm test:seeded`
- **UI Mode de Playwright:** `pnpm test:pw-ui`
- **Headed / debug:** `pnpm test:headed` · `pnpm test:debug`
- **Typecheck:** `pnpm typecheck`
- **Ver el reporte:** `pnpm report`
- **Un agente:** en Claude Code, *"usa el agente `qa-triage` ..."*
- **Todo el flujo:** en Claude Code, `/qa-flow <id>`
- **Grafo del repo:** en Claude Code, `/graphify . --no-viz` (salida en `graphify-out/`)
- **Arquitecturas:** en Claude Code, pide *"usa archify para ..."* (salida en `.archify/`)

---

## Outcome esperado

- [ ] Sabes explicar qué es un subagente y qué contiene su archivo (frontmatter + Rol/Entrada/Salida/Límites).
- [ ] Puedes escribir un `AGENTS.md` desde cero y justificar qué dejaste fuera.
- [ ] Puedes nombrar los archivos de `work/<id>/` en orden y qué agente produce cada uno.
- [ ] Sabes qué modelo usa cada agente, y la precedencia cuando hay `model` al invocar, `model:` en el frontmatter y `CLAUDE_CODE_SUBAGENT_MODEL`.
- [ ] Tienes `.claude/` sincronizado y (opcional) tu `.claude/settings.local.json` con el advisor configurado.
- [ ] Obtuviste `01-review.md` y `02-cases.md` de una historia, y un `tests/generated/US-01.spec.ts` revisado por ti.
- [ ] Corriste el Triage sobre un spec que falla y sobre evidencia de un fallo, y leíste la evidencia detrás de cada veredicto.
- [ ] Si el veredicto lo requirió y `gh` está autenticado, un issue de GitHub quedó creado **en tu repositorio**, tras confirmación explícita.
- [ ] Corriste `/qa-flow` con una historia nueva y revisaste su carpeta `work/<id>/`.
- [ ] *(Opcional, Paso 8)* Instalaste `graphify` y `archify` en el proyecto y generaste `graphify-out/GRAPH_REPORT.md`.
- [ ] *(Opcional, Paso 8)* Generaste dos arquitecturas con archify (proyecto y equipo de agentes) y verificaste al menos una caja contra el código real.
- [ ] Entregaste el reto: historia propia + un séptimo agente o una regla nueva en `AGENTS.md`.

---

## ¿Qué viene?

Si tomaste este módulo opcional, cierras el recorrido del curso: pasaste de un smoke feo a un framework con POM, fixtures, API, sesión reutilizable, CI y ahora un equipo de agentes que lo usa. Siguientes caminos:

- **Profundizar en IA con prompts:** el [módulo especial de IA Test Harness avanzado](../modulo-especial-ia-harness-avanzado/README.md).
- **Llevar tu equipo a tu propio proyecto:** copia `AGENTS.md`, `agents/` y `skills/` a tu repositorio y adapta las convenciones.
- **Ampliar el equipo:** más agentes (accesibilidad, rendimiento, datos de prueba) y más reglas, medidos siempre contra un resultado concreto.
