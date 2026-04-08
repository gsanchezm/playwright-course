# Reto — Módulo 3: Ejecuciones

Todos los retos se hacen contra los tests del **Módulo 2** (que ya escribiste).

---

## Reto 3.1 — Ejecuciones básicas

Ejecuta cada uno de estos comandos y observa la salida:

```bash
$ pnpm test modulo-02-anotaciones
$ pnpm test modulo-02-anotaciones --headed --workers=1 --project=chromium
$ pnpm test modulo-02-anotaciones/01-test-basico.spec.ts
$ pnpm test modulo-02-anotaciones -g "caso simple"
```

**✅ Resultado esperado:** el primero corre muchos tests, el segundo corre todos con ventana visible uno por uno, el tercero solo el archivo, el cuarto solo los tests cuyo nombre contenga "caso simple".

---

## Reto 3.2 — Filtrado por tag

```bash
$ pnpm test modulo-02-anotaciones --grep @smoke
$ pnpm test modulo-02-anotaciones --grep @regression
$ pnpm test modulo-02-anotaciones --grep-invert @slow
```

**✅ Resultado esperado:**
- `@smoke` corre 2 tests.
- `@regression` corre 3 tests.
- `--grep-invert @slow` corre todos **menos** el test `@slow` del archivo `06`.

---

## Reto 3.3 — Debug mode con `page.pause()`

1. Crea un archivo temporal `modulo-03-ejecuciones/debug-example.spec.ts`:

   ```typescript
   import { test, expect } from '@playwright/test';

   test('ejemplo con pausa', async ({ page }) => {
     await page.goto('https://playwright.dev/');
     await page.pause(); // ⏸
     await page.getByRole('link', { name: 'Get started' }).click();
     await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
   });
   ```

2. Córrelo en debug:
   ```bash
   $ pnpm test:debug modulo-03-ejecuciones/debug-example.spec.ts
   ```

3. En el Inspector:
   - Haz click en **Step over** y observa cómo avanza línea por línea.
   - Haz click en **Pick locator** y apunta al link "Docs". Copia el selector sugerido.
   - Continúa hasta el final con **Resume**.

4. Borra el archivo cuando termines.

---

## Reto 3.4 — UI Mode (⭐ el más importante)

1. Corre: `pnpm test:ui`
2. En la interfaz gráfica:
   - Activa el **watch mode** 👁 en el tope.
   - Haz click en el test `"caso simple: abrir la página de Playwright"`.
   - Observa el timeline de pasos.
   - Hover sobre el paso del `goto` → ¿cómo se ve el DOM en ese momento?
   - Abre tu archivo `01-test-basico.spec.ts` en el editor, cambia algo (añade un comentario) y guarda. ¿Qué pasa en la UI de Playwright?
   - Usa el **Pick locator** para obtener el selector del botón "Get started".

**✅ Resultado esperado:** entiendes por qué UI mode es el favorito para desarrollar tests. Si no lo sentiste, repite el reto.

---

## Reto 3.5 — Correr en múltiples navegadores

```bash
$ pnpm test modulo-02-anotaciones/01-test-basico.spec.ts --project=chromium
$ pnpm test modulo-02-anotaciones/01-test-basico.spec.ts --project=firefox
$ pnpm test modulo-02-anotaciones/01-test-basico.spec.ts --project=webkit
$ pnpm test modulo-02-anotaciones/01-test-basico.spec.ts --project=mobile-chrome
```

**✅ Resultado esperado:** los 4 ejecutan el mismo test y pasan.

---

## Reto 3.6 — Preguntas

1. ¿Por qué es mala idea usar `--retries=10` para arreglar un test flaky?
2. ¿Cuándo usarías `--workers=1` en vez del paralelismo default?
3. ¿Qué hace `--grep-invert @slow`?
4. ¿Cuál es la diferencia principal entre `--debug` y UI mode?

**Respuestas:**

1. Porque los reintentos **esconden** el problema. Un test flaky es un síntoma de que el código o el test tienen una condición de carrera, una espera mal hecha, o un estado compartido mal gestionado. Debes arreglarlo, no esconderlo con reintentos.
2. Cuando quieres ejecutar con `--headed` y solo quieres ver UNA ventana a la vez, para no perderte entre varias. También cuando los tests comparten estado global (ej. una DB) y no pueden correr en paralelo.
3. Corre TODOS los tests **excepto** los que tengan el tag `@slow`.
4. `--debug` abre el Inspector con breakpoints y control manual línea a línea. UI mode es una interfaz visual completa con timeline, watch mode, y vista del DOM por paso — ideal para desarrollar y explorar. Debug es ideal para **inspeccionar** un test puntual; UI mode es ideal para **escribir** nuevos tests.

---

## ✅ Checklist

- [ ] Sé correr tests en headless, headed y UI mode.
- [ ] Sé filtrar tests por nombre (`-g`), por tag (`--grep`), por archivo y por línea.
- [ ] Usé `page.pause()` y el Inspector al menos una vez.
- [ ] Usé UI mode con watch mode.
- [ ] Corrí el mismo test en 3 navegadores distintos con `--project`.

➡️ Siguiente: [Módulo 4: Localizadores](../modulo-04-localizadores/)
