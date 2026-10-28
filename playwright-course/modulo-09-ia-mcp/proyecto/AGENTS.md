# AGENTS.md — Equipo de agentes de QA para OmniPizza

Fuente de verdad portable: este archivo + `agents/` + `skills/`. Claude Code es
el adaptador recomendado, pero cualquier herramienta que lea Markdown sirve.

## El proyecto
- App bajo prueba: **OmniPizza** (pedidos de pizza, mercados MX | US | CH | JP | SA).
- Frontend `https://omnipizza-frontend.onrender.com` (`BASE_URL`), API
  `https://omnipizza-backend.onrender.com` (`API_URL`). Ver `.env.example`.
  Render free tier: la primera carga puede tardar (cold start), no es un bug.
- Usuarios (`data/users.json`, password `pizza123`):
  `standard_user` (happy path), `locked_out_user` (login negativo, 403),
  `problem_user` y `error_user` (**fallas intencionales** de la app: bugs
  visuales y errores en acciones), `performance_glitch_user` (3-6x mas lento).

## Convenciones del `proyecto/`
- Page Objects en `pages/` (LoginPage, CatalogPage, CheckoutPage, ProfilePage,
  MenuPage, PizzaCustomizerModal). Los tests NUNCA tocan locators directo.
- Servicios de API en `services/` (AuthService, PizzaService, OrderService).
- Fixtures en `fixtures/omnipizza.ts`; datos en `data/`.
- Locators por rol/label o `data-testid` (via `tid()` del POM). Nada de
  CSS/XPath fragil y **nunca `waitForTimeout`**: usa web-first assertions.
- Specs nuevos en `tests/generated/`; el spec que falla vive en `tests/seeded/`
  y solo corre con `--project=seeded` (`pnpm test` lo ignora).
- Historias en `stories/` y evidencia de defectos en `evidence/` (vienen con
  los archivos de escenario del modulo). `work/<id>/` se crea por historia y
  esta en `.gitignore`.

## Contrato de handoff
Para una historia `<id>` (ej. `US-01`) el flujo escribe en `work/<id>/`:

| Paso | Agente | Archivo que produce |
|------|--------|---------------------|
| 1 | qa-reviewer | `work/<id>/01-review.md` (preguntas, ambiguedades, supuestos) |
| 2 | qa-test-designer | `work/<id>/02-cases.md` (5-8 casos: id, titulo, pasos, esperado, UI/API) |
| 3 | qa-automation-developer | `tests/generated/<id>.spec.ts` |
| 4 | qa-triage | `work/<id>/04-triage.md` (`test-defect` \| `app-defect` \| `flaky` + evidencia) |
| 5a | qa-bug-reporter (si `app-defect`) | `work/<id>/05-issue-draft.md` (Titulo, Entorno, Pasos, Esperado, Actual, Evidencia, Severidad) |
| 5b | qa-healer (si `test-defect`) | modifica el spec de `04-triage.md` y reporta en `work/<id>/06-heal.md` |

Sin historia (spec suelto o carpeta de `evidence/`), `<id>` = nombre del spec
sin `.spec.ts`, o nombre de la carpeta de evidencia.

Cada agente lee lo que dejaron los anteriores en `work/<id>/` y escribe solo su archivo.

## Reglas
- **No inventes**: si falta un dato, pregunta o lista el supuesto por escrito.
- Un locator roto es defecto del TEST (Healer); solo un defecto de la app llega
  al Bug Reporter. `problem_user`/`error_user` son defectos esperados de app.
- Los issues se crean solo en el repo propio del alumno, tras confirmacion.
- Orquestacion completa: `skills/qa-flow/SKILL.md`.
