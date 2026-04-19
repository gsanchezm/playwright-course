# Reto — Módulo 8: Repositorios y CI

## Reto 8.1 — Publicar el framework en GitHub

1. Desde `playwright-course/`, si no tienes repo git:
   ```bash
   git init
   git add .
   git commit -m "chore: initial playwright course"
   ```
2. Crea un repo en GitHub llamado `playwright-omnipizza` (público o privado).
3. Conéctalo y empuja:
   ```bash
   git remote add origin git@github.com:<tu-user>/playwright-omnipizza.git
   git branch -M main
   git push -u origin main
   ```

**✅ Resultado esperado:** el repo aparece en GitHub con M1-M7.

---

## Reto 8.2 — Configurar GitHub Actions

1. Crea la carpeta `.github/workflows/`.
2. Copia `modulo-08-repositorios/playwright.yml.example` a `.github/workflows/playwright.yml` (sin `.example`).
3. Commit y push:
   ```bash
   git add .github/workflows/playwright.yml
   git commit -m "ci: add playwright workflow running smoke on pr"
   git push
   ```
4. Ve a la pestaña **Actions** del repo en GitHub.

**✅ Resultado esperado:** un run arranca automáticamente y corre en 5-10 min.

> ⚠️ Si el run falla por cold-start de Render (primer intento), vuélvelo a ejecutar desde GitHub. A partir del segundo run estará caliente.

---

## Reto 8.3 — Descargar el reporte del CI

1. Ve al run terminado del reto 8.2.
2. Al final de la página, en la sección **Artifacts**:
   - Descarga `playwright-report`.
   - Descomprime y abre `index.html`.
3. Si hubo fallos, descarga también `test-results` para ver traces/videos/screenshots.

**✅ Resultado esperado:** ves el HTML report como si lo hubieras corrido localmente.

---

## Reto 8.4 — Badge en el README

Edita el `README.md` del repo y añade arriba:

```markdown
![Playwright Tests](https://github.com/<tu-user>/playwright-omnipizza/actions/workflows/playwright.yml/badge.svg)
```

Commit y push. El badge aparecerá en la portada del repo.

---

## Reto 8.5 — Romper el CI y arreglarlo

1. En una nueva rama, edita un test para que falle (p.ej. cambia el URL esperado a `/dashboard`):
   ```bash
   git switch -c experiment/break-ci
   # edita un archivo
   git commit -am "test: intentionally break to see red CI"
   git push -u origin experiment/break-ci
   ```
2. Abre un PR en GitHub.
3. Observa que:
   - El CI arranca automático.
   - El PR queda marcado en **rojo**.
   - El badge del README también se pone rojo.
4. Arregla el test, push de nuevo.
5. El PR debería quedar en **verde** automáticamente.

**✅ Resultado esperado:** entiendes el ciclo: "si falla, el PR se bloquea".

---

## Reto 8.6 — Smoke en PRs, regression en main (BONUS)

Modifica `.github/workflows/playwright.yml` para tener **2 jobs** separados:

```yaml
jobs:
  smoke:
    if: github.event_name == 'pull_request'
    # ...setup...
    - run: pnpm test:smoke --project=chromium

  regression:
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    # ...setup...
    - run: pnpm test:regression --project=chromium
```

Haz un PR — solo smoke corre.
Mergea — regression completa corre en main.

---

## Reto 8.7 — Shards por mercado (BONUS avanzado)

Modifica el workflow para partir la suite en 4 shards paralelos:

```yaml
test:
  strategy:
    fail-fast: false
    matrix:
      shard: [1/4, 2/4, 3/4, 4/4]
  steps:
    # ...setup...
    - run: pnpm test --shard=${{ matrix.shard }} --project=chromium
```

Push y observa 4 jobs corriendo en paralelo en la pestaña Actions.

---

## Reto 8.8 — Preguntas

1. ¿Por qué `--frozen-lockfile` en CI y no `install` normal?
2. ¿Para qué sirve `--with-deps` al instalar browsers?
3. ¿Qué hace `if: always()` en el paso de `upload-artifact`?
4. ¿Por qué el curso usa `retries: 2` solo en CI y 0 local?
5. En el job, ¿por qué usamos `pnpm test:smoke` en PRs en vez de `pnpm test`?

**Respuestas:**

1. `--frozen-lockfile` falla si `pnpm-lock.yaml` no coincide con `package.json` — garantiza que CI instale **exactamente** las mismas versiones que local. Previene "local pasa, CI falla".
2. Los runners Ubuntu no tienen las libs nativas que Chromium/Firefox/WebKit necesitan (fonts, codecs, libvpx). `--with-deps` las instala.
3. Sube el reporte **incluso si los tests fallaron**. Sin este flag, justo cuando más lo necesitas (tests rojos) no tendrías el artifact.
4. Porque `performance_glitch_user` + cold-start de Render hacen que la primera corrida del día sea flaky. En local tú controlas las condiciones; en CI no. Retries absorbe la flakiness sin ocultar bugs reales (Playwright marca el test como "flaky", no "passed").
5. Para que los PRs corran rápido (~3 min smoke vs ~20 min regression). La regresión completa corre solo en merge a `main`, cuando el tiempo no es crítico.

---

## ✅ Checklist

- [ ] Mi framework está publicado en GitHub.
- [ ] GitHub Actions corre mis tests en cada push y PR.
- [ ] Descargué el reporte HTML desde los Artifacts.
- [ ] Badge de CI en el README del repo.
- [ ] Rompí y arreglé un test para ver el ciclo rojo → verde.
- [ ] (BONUS) Smoke en PRs, regression en main.

➡️ Siguiente: [Módulo 9 — API testing puro (aislado del UI)](../modulo-09-api-testing/)
