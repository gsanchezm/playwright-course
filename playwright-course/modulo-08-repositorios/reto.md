# Reto — Módulo 8: Repositorios

## Reto 8.1 — Publicar el curso en GitHub

1. Desde `playwright-course/`, inicializa un repo Git (si no lo has hecho):
   ```bash
   $ cd playwright-course
   $ git init
   $ git add .
   $ git commit -m "chore: initial playwright course"
   ```
2. Crea un repo en GitHub llamado `playwright-course-demo` (público).
3. Conéctalo y empuja:
   ```bash
   $ git remote add origin git@github.com:tu-usuario/playwright-course-demo.git
   $ git branch -M main
   $ git push -u origin main
   ```

**✅ Resultado esperado:** el repo aparece en GitHub con todos los módulos.

---

## Reto 8.2 — Configurar GitHub Actions

1. En tu repo, crea la carpeta `.github/workflows/`.
2. Copia el contenido de `playwright.yml.example` de este módulo a `.github/workflows/playwright.yml`.
3. Commit y push:
   ```bash
   $ git add .github/workflows/playwright.yml
   $ git commit -m "ci: add playwright workflow"
   $ git push
   ```
4. Ve a la pestaña **Actions** de tu repo en GitHub y observa cómo el workflow se ejecuta en vivo.

**✅ Resultado esperado:** un run aparece en ejecución. Después de 5-10 min debería terminar (pass o fail).

---

## Reto 8.3 — Descargar el reporte del CI

1. Ve al run del reto 8.2.
2. Al final de la página, en la sección **Artifacts**, descarga `playwright-report.zip`.
3. Descomprímelo y abre `index.html` en tu navegador.

**✅ Resultado esperado:** ves el reporte HTML de tu CI como si lo hubieras corrido local.

---

## Reto 8.4 — Agregar badge al README

1. Edita `README.md` del repo y agrega al inicio:
   ```markdown
   ![Playwright Tests](https://github.com/tu-usuario/playwright-course-demo/actions/workflows/playwright.yml/badge.svg)
   ```
2. Commit y push.
3. Ve a la pestaña del repo y observa el badge verde/rojo.

---

## Reto 8.5 — Romper el CI intencionalmente

1. Rompe un test en local (modifica un assertion para que falle).
2. Crea una rama, commit y abre un PR:
   ```bash
   $ git switch -c experiment/break-ci
   $ git commit -am "test: intentionally break a test"
   $ git push -u origin experiment/break-ci
   ```
3. En GitHub abre el PR.
4. Observa cómo **el CI aparece en rojo** automáticamente en el PR.
5. Arregla el test, commit y push.
6. Observa cómo **el CI cambia a verde** automáticamente.

**✅ Resultado esperado:** entiendes cómo el CI protege a tu equipo de mergear código que rompe los tests.

---

## Reto 8.6 — Shards (BONUS)

1. Modifica `playwright.yml` para correr con 2 shards:
   ```yaml
   strategy:
     fail-fast: false
     matrix:
       shard: [1/2, 2/2]
   ```
2. Agrega en el step de tests:
   ```yaml
   - run: pnpm test --shard=${{ matrix.shard }}
   ```
3. Push y observa cómo ahora hay **2 jobs corriendo en paralelo**.

---

## Reto 8.7 — Preguntas

1. ¿Por qué usamos `pnpm install --frozen-lockfile` en CI en vez de `pnpm install`?
2. ¿Por qué `--with-deps` al instalar los browsers?
3. ¿Qué hace `if: always()` en el step de upload?
4. ¿Cuál es la ventaja de usar shards?

**Respuestas:**

1. `--frozen-lockfile` falla si el `pnpm-lock.yaml` no coincide con `package.json`. Esto garantiza que CI instale **exactamente** las versiones del lockfile, evitando bugs del tipo "local pasa, CI falla".
2. Los runners de GitHub (Ubuntu) no tienen las librerías nativas de Linux que los navegadores de Playwright necesitan (fonts, codecs, etc.). `--with-deps` las instala automáticamente.
3. Sube el reporte **incluso si los tests fallaron**. Sin `if: always()`, el upload solo corre si todo anterior fue exitoso, y justo cuando más lo necesitas (tests fallando) no obtendrías el reporte.
4. Parte la suite en N pedazos que corren en paralelo en distintos runners. Si tu suite toma 20 min, con 4 shards toma ~5 min.

---

## ✅ Checklist

- [ ] Mi framework de Playwright está publicado en GitHub.
- [ ] Tengo un workflow de GitHub Actions corriendo mis tests.
- [ ] Descargué el reporte HTML desde los Artifacts.
- [ ] Rompí y arreglé un test para ver el CI en rojo/verde.
- [ ] Agregué un badge de status al README.
