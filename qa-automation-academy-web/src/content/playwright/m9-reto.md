# 🚩 Reto M09 · Tu historia, tu equipo

**Duración:** 10 min en clase (el resto, a tu ritmo)

Ya viste el equipo trabajar con historias que te di. Ahora el material es tuyo.

## Qué entregas

1. **Una historia propia** en `proyecto/stories/US-04-<tema>.md`, con el mismo formato que las anteriores (Como / quiero / para, criterios de aceptación numerados, notas). Elige un flujo real de OmniPizza que no cubran US-01..03.
2. **Una corrida de `qa-flow`** con tu historia: `/qa-flow US-04`. Conserva la carpeta `work/US-04/` y el spec generado. `work/*` está en `.gitignore`: para entregarla usa `git add -f work/US-04` o adjúntala aparte.
3. **Una mejora al equipo**, a elegir una:
   - **A. Un séptimo agente** en `proyecto/agents/<rol>.md` (por ejemplo, uno de accesibilidad o de datos de prueba), con frontmatter, Rol, Entrada, Salida y Límites, y su archivo en `work/<id>/`. Agrégalo al contrato de `AGENTS.md` y a `skills/qa-flow/SKILL.md`, y vuelve a sincronizar (`pnpm sync:claude:win` o `pnpm sync:claude:sh`).
   - **B. Una regla nueva en `AGENTS.md`** que cambie un resultado concreto de la corrida.
   - **C. (Si hiciste el Paso 8 opcional) Regenera el diagrama del equipo de agentes** después de tu mejora (el séptimo agente o la regla nueva) con el mismo prompt del Paso 8-D, y compara el antes y el después: ¿el diagrama refleja tu cambio? ¿Qué caja o flecha nueva apareció?

## Cómo sabes que mejoró

Una mejora sin medición es una opinión. Para tu opción A o B anota:

- **Antes:** qué salió mal o flojo en la corrida (un caso inventado, un locator frágil, una pregunta que faltó).
- **Cambio:** la línea o el agente que agregaste.
- **Después:** vuelve a correr y compara el archivo afectado de `work/US-04/` o el spec. ¿Mejoró de verdad?

## Pistas

- Una regla buena es corta y **verificable mirando un archivo**.
- Si tu agente nuevo escribe un archivo, dale un nombre que respete el orden de `work/<id>/` y dile al agente siguiente que lo lea.
- Si no mejora, eso también es un resultado: documéntalo y prueba otra regla.

## Criterios de revisión

- [ ] La historia tiene criterios de aceptación comprobables.
- [ ] `work/US-04/` contiene los archivos que produce cada agente del flujo.
- [ ] El spec de `tests/generated/` usa Page Objects/fixtures y no usa `waitForTimeout`.
- [ ] La mejora (agente o regla) está registrada en `AGENTS.md` y, si es un agente, en la skill.
- [ ] Hay un antes y un después comparables.
- [ ] Si creaste un issue, fue en tu repositorio propio y tras confirmar.

Regresa a la guía del módulo (9.1) para el cierre.
