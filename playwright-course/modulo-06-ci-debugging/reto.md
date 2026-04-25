# Reto M06 — Canary matutino programado

## Objetivo

Crear un segundo workflow de GitHub Actions que corra automáticamente **cada mañana** el subset de smoke tests contra el deploy live de OmniPizza.

## Requisitos

1. Crear `.github/workflows/smoke-daily.yml` con:
   - Trigger `schedule` con cron (`0 14 * * *` para 8am CDMX = 14 UTC).
   - Trigger `workflow_dispatch` para disparar manualmente.
   - Que corra sólo `--grep @smoke --project=ui-chromium`.
   - Timeout de 15 min (menos que el workflow principal).
   - Subir el HTML report si falla.
2. **Notificaciones:** añadir un paso final que crea un issue de GitHub si el workflow falla.
   - Pista: `actions/github-script@v7` + `github.rest.issues.create`.
3. Añadir badge al `README.md` principal:
   ```markdown
   ![Smoke Daily](https://github.com/<owner>/<repo>/actions/workflows/smoke-daily.yml/badge.svg)
   ```

## Entregables

- [ ] `.github/workflows/smoke-daily.yml` en el repo.
- [ ] Un issue de ejemplo generado (puedes forzar fallo con `DEMO_FAIL=1`).
- [ ] Badge visible en el README principal.

## Preguntas de reflexión

1. ¿Por qué el canary usa 1 browser en lugar de los 3?
2. ¿Qué pasaría si el smoke canary fallara porque Render está dormido? ¿Cómo lo distinguirías de un bug real?
3. ¿Cómo evitarías que el canary envíe una alerta falsa por un flake?
