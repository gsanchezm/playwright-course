# Módulo 06 — CI/CD + Debugging con Trace Viewer

**Duración estimada:** 40-50 min
**Pieza que suma al framework:** `.github/workflows/playwright.yml` con **matrix real por browser** + reports + traces como artefactos descargables.

---

## Analogía de apertura

Ya tenemos un framework completo, pero corre sólo en tu laptop. Lo que necesitamos ahora es que **un robot lo ejecute cada vez que alguien hace push** — eso es CI/CD. Y cuando un test falle, necesitamos la **caja negra del avión**: `Trace Viewer` reconstruye paso a paso qué hizo el test, con screenshots, red y consola, para encontrar el bug sin reproducirlo a mano.

---

## ¿Qué aprenderás?

1. **`fullyParallel`, `workers`, `shards`** — paralelismo real.
2. **`retries` en CI vs local** — 2 vs 0, y por qué.
3. **Trace Viewer protagónico** — leer una traza como un bug report multimedia.
4. **GitHub Actions con matrix real** — 3 browsers × 2 shards + api.
5. **`secrets.*`** — credenciales nunca en plaintext.
6. **Artefactos dobles** — HTML report + traces descargables del PR.

---

## Conceptos JIT

| Concepto | Analogía |
|---|---|
| `fullyParallel: true` | Varios testers corriendo la misma suite a la vez, cada uno en su worker |
| `workers` | Cuántos testers paralelos tienes disponibles |
| `--shard=1/4` | Repartir 200 TCs entre 4 máquinas: ésta corre 50 |
| `retries: 2` | Reintenta 2 veces antes de marcar como roto |
| `trace: 'retain-on-failure'` | Graba caja negra sólo cuando algo sale mal |
| Trace Viewer | Reconstruye el vuelo sin tener que repetirlo |
| `matrix.project` | Ambientes del test plan corriendo en paralelo en el pipeline |
| `secrets.BASE_URL` | La caja fuerte del equipo: credenciales sólo durante la corrida |

---

## Workflow

El archivo `.github/workflows/playwright.yml` define:

```
matrix:
  project: [ui-chromium, ui-firefox, ui-webkit, api]
  shard:   [1, 2]
  exclude: api con shard 2    ← api corre 1 sola vez
```

Eso da **7 jobs en paralelo** (3 browsers × 2 shards + 1 api).

---

## Artefactos descargables

Cada job sube **2 artefactos**:

1. **`playwright-report-<project>-shard<N>`** — HTML report navegable.
2. **`playwright-traces-<project>-shard<N>`** — `test-results/` con traces, videos, screenshots.

Desde un PR fallido, descargas la traza y la abres con:

```bash
pnpm exec playwright show-trace path/to/trace.zip
```

---

## Secrets en GitHub

Configúralos **una sola vez** en el repo (`Settings → Secrets → Actions`):

```bash
gh secret set BASE_URL          # ej. https://omnipizza-frontend.onrender.com
gh secret set API_URL           # ej. https://omnipizza-backend.onrender.com
gh secret set TEST_USER_USERNAME
gh secret set TEST_USER_PASSWORD
```

Verificar:
```bash
gh secret list
```

---

## Paso a paso — Trace Viewer local

Antes de confiar en CI, practica leer una traza en local:

1. Fuerza una traza:
   ```bash
   pnpm exec playwright test modulo-01-smoke-feo --trace=on --project=ui-chromium
   ```
2. Lista los resultados:
   ```bash
   ls test-results/
   ```
3. Abre el trace:
   ```bash
   pnpm exec playwright show-trace test-results/<test-folder>/trace.zip
   ```
4. Explora: **timeline**, **DOM snapshot** por paso, **network**, **console**, **screenshots**.

---

## Paso a paso — CI

1. Configura los secrets (ver arriba).
2. Push a la rama:
   ```bash
   git push -u origin feature/v3-arquitectura-incremental
   ```
3. Abre el PR:
   ```bash
   gh pr create
   ```
4. Observa los checks:
   ```bash
   gh pr checks
   ```
5. Si algo falla, descarga los artefactos:
   ```bash
   gh run list --limit 5
   gh run download <run-id>
   ```
6. Abre la traza descargada con `show-trace`.

---

## Reto

Crea un segundo workflow (`.github/workflows/smoke-daily.yml`) con:

```yaml
on:
  schedule:
    - cron: '0 14 * * *'   # 14:00 UTC = 8am CDMX
```

Que corra sólo `--grep @smoke --project=ui-chromium`. Útil como canary matutino contra el deploy live.

---

## Comandos útiles

```bash
# Local
pnpm exec playwright test --trace=on
pnpm exec playwright show-trace <trace.zip>
pnpm exec playwright show-report

# GitHub CLI
gh secret set BASE_URL
gh secret list
gh pr create
gh pr checks
gh run list --workflow=playwright.yml
gh run view <run-id> --log
gh run download <run-id>
```

---

## Outcome esperado

- [ ] El workflow de CI corre verde en el PR.
- [ ] Puedes descargar una traza desde un job fallido y abrirla con `show-trace`.
- [ ] Explicas por qué `retries: 2` en CI pero `0` en local.
- [ ] Sabes añadir un workflow programado con cron.
- [ ] Entiendes que los secrets **nunca** viven en el repo.
