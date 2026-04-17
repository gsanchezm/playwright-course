# 4. Mantener un proyecto (lead de automatización)

Cuando tu equipo crece, tú eres quien **mantiene** el repo. Aquí las cosas más importantes.

## 4.1 Proteger la rama `main` (Branch protection rules)

**Settings → Branches → Add rule:**

Configura para `main`:
- ✅ **Require a pull request before merging.**
- ✅ **Require approvals:** mínimo 1 (o 2 si el equipo es más grande).
- ✅ **Require status checks to pass before merging** — ata esto a tu CI de GitHub Actions que corre los tests.
- ✅ **Require branches to be up to date before merging.**
- ✅ **Do not allow bypassing the above settings** — sí, incluso tú como admin.
- ⬜ Force pushes (bloquear): marcado.

**Resultado:** nadie puede pushear directo a `main` nunca más. Todo pasa por PR con tests verdes y revisión.

## 4.2 Etiquetas (labels)

Crea labels útiles para gestionar los PRs y issues:

| Label | Color | Para qué |
|-------|-------|----------|
| `flaky` | rojo | Tests inestables que hay que arreglar |
| `framework` | azul | Cambios al core del framework (no tests) |
| `good first issue` | verde | Tareas sencillas para nuevos en el equipo |
| `needs review` | amarillo | PR listo para que alguien lo mire |
| `blocked` | gris | Bloqueado por algo externo |
| `ci` | morado | Cambios al pipeline de CI/CD |

## 4.3 Milestones

Agrupa issues y PRs por entregas. Por ejemplo:
- `Sprint 42 - Regression suite`
- `Release v2.0 of framework`

## 4.4 Revisar código de tu equipo

Buenas prácticas al revisar un PR de un compañero:

1. **Corre los tests en tu máquina** (no solo confíes en el CI). Haz `git fetch && git switch pr-branch`.
2. **Revisa los selectores:** ¿son `data-testid` o CSS frágiles?
3. **Busca anti-patterns:** `page.waitForTimeout(5000)` → sugiere `waitFor` específico.
4. **Verifica que los tests son determinísticos:** ¿pueden fallar por orden aleatorio o datos compartidos?
5. **Pregunta por qué, no por qué no:** "¿Cuál es el motivo de no usar el Page Object existente aquí?" es mejor que "Deberías usar el Page Object".

## 4.5 Releases

En GitHub puedes crear un **release** atado a un tag:

1. **Releases → Draft a new release.**
2. Elige el tag (por ejemplo `v1.0.0`).
3. Título: `v1.0.0 - First stable framework release`.
4. Notas: describe qué cambió, qué tests se agregaron, qué bugs se arreglaron.
5. Publica.

El release queda visible en la pestaña **Releases** del repo y otros pueden descargarlo como `.zip` o `.tar.gz`.

## 4.6 Un vistazo breve a GitHub Actions (CI para tests)

GitHub Actions permite correr tus tests automáticamente en cada push/PR. Un workflow mínimo para Playwright:

```yaml
# .github/workflows/tests.yml
name: Run Playwright tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

> 💡 Profundizar en GitHub Actions está fuera del alcance de este curso, pero sabiendo lo anterior ya puedes configurar un CI básico para tu framework.
