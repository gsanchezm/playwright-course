---
name: qa-flow
description: Orquesta el flujo completo de QA de una historia de usuario (revision, casos, automatizacion, triage, reporte o reparacion) invocando a los 6 agentes en orden.
---

# qa-flow — de historia a test

Usa este flujo con una historia `<id>` (ej. `US-01`) en el archivo de `stories/` cuyo nombre empieza por `<id>`.
Cada paso invoca un agente de `agents/` y verifica que su archivo exista en
`work/<id>/` antes de continuar. Contrato de nombres: ver `AGENTS.md`.

1. **qa-reviewer** -> `work/<id>/01-review.md`.
   Si hay preguntas `[BLOQUEANTE]`, **detente**: muestralas al alumno y espera
   sus respuestas antes de seguir.
2. **qa-test-designer** -> `work/<id>/02-cases.md` (5-8 casos UI/API).
3. **qa-automation-developer** -> `tests/generated/<id>.spec.ts`, ejecutado.
4. Si todo esta verde, termina y resume. Si algo falla, **qa-triage** ->
   `work/<id>/04-triage.md` con veredicto `test-defect` | `app-defect` | `flaky`.
5. Segun el veredicto:
   - `test-defect` -> **qa-healer** repara el spec y escribe `work/<id>/06-heal.md`.
   - `app-defect` -> **qa-bug-reporter** escribe `work/<id>/05-issue-draft.md`.
   - `flaky` -> reintenta el spec **una sola vez**; si vuelve a fallar,
     repite el triage una vez mas y trata el resultado como definitivo.
6. Resume al alumno: archivos generados, resultado final y proximos pasos.

## Recordatorios
- Antes de crear el issue, el Bug Reporter muestra el repo
  (`gh repo view --json nameWithOwner`) y el borrador, y **espera confirmacion
  explicita**. Nunca se crea un issue en un repo que no sea el del alumno.
- Un locator roto es defecto del test (Healer), no de la app.
- Tras sanar, vuelve a correr el spec; si sigue rojo, regresa al triage (max. 1 vez).
- No inventes datos: ante un hueco, pregunta o declara el supuesto.
- Con herramientas distintas de Claude Code, sigue estos pasos a mano usando
  el cuerpo de cada `agents/<rol>.md` como prompt.
