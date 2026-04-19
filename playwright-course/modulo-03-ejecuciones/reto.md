# Reto — Módulo 3: Ejecuciones

Todos los retos se hacen contra los tests del **Módulo 2** (la mini-suite de OmniPizza que ya escribiste).

---

## Reto 3.1 — Ejecuciones básicas

Ejecuta cada comando y observa la salida:

```bash
pnpm test modulo-02-anotaciones
pnpm test modulo-02-anotaciones --headed --workers=1 --project=chromium
pnpm test modulo-02-anotaciones/01-test-basico.spec.ts
pnpm test modulo-02-anotaciones -g "standard_user"
```

**✅ Resultado esperado:** el primero corre los 20+ tests, el segundo uno por uno con ventana visible, el tercero solo el archivo 01, el cuarto solo los tests cuyo título contenga `standard_user`.

---

## Reto 3.2 — Filtrado por tag

```bash
pnpm test modulo-02-anotaciones --grep @smoke
pnpm test modulo-02-anotaciones --grep @regression
pnpm test modulo-02-anotaciones --grep-invert @slow
```

**✅ Resultado esperado:**
- `@smoke`: 2 tests (del archivo 06).
- `@regression`: 3 tests.
- `--grep-invert @slow`: todos menos `las 4 banderas de mercado son clickables @regression @slow`.

---

## Reto 3.3 — Debug mode con `page.pause()`

1. Crea un archivo temporal `modulo-03-ejecuciones/debug-example.spec.ts`:

   ```typescript
   import { test, expect } from '@playwright/test';

   test('ejemplo con pausa', async ({ page }) => {
     await page.goto('/');
     await page.getByTestId('username-desktop').fill('standard_user');
     await page.pause(); // ⏸ el test se detiene aquí
     await page.getByTestId('password-desktop').fill('pizza123');
     await page.getByTestId('login-button-desktop').click();
     await expect(page).toHaveURL(/\/catalog/);
   });
   ```

2. Córrelo en debug:
   ```bash
   pnpm test:debug modulo-03-ejecuciones/debug-example.spec.ts
   ```

3. En el Inspector:
   - Haz click en **Step over** y avanza paso a paso.
   - Haz click en **Pick locator** y apunta al botón "Sign In" — copia el selector sugerido.
   - Continúa con **Resume**.

4. Borra el archivo cuando termines.

---

## Reto 3.4 — UI Mode (⭐ el más importante)

1. Corre: `pnpm test:ui`
2. En la UI:
   - Activa el **watch mode** 👁.
   - Haz click en `"caso simple: login de standard_user llega al catálogo"`.
   - Observa el timeline — ¿cómo se veía la pantalla cuando el test hizo `goto('/')`?
   - Abre `01-test-basico.spec.ts`, añade un comentario, guarda. ¿Qué pasa?
   - Usa **Pick locator** sobre cualquier elemento y copia el selector.

**✅ Resultado esperado:** si no sentiste el "wow", repite el reto.

---

## Reto 3.5 — Multi-browser

```bash
pnpm test modulo-02-anotaciones/01-test-basico.spec.ts --project=chromium
pnpm test modulo-02-anotaciones/01-test-basico.spec.ts --project=firefox
pnpm test modulo-02-anotaciones/01-test-basico.spec.ts --project=webkit
pnpm test modulo-02-anotaciones/01-test-basico.spec.ts --project=mobile-chrome
```

**✅ Resultado esperado:** los 3 desktop pasan. `mobile-chrome` **falla** porque a viewport mobile los testids terminan en `-responsive`, no `-desktop`. Anótalo — lo arreglamos en M4.

---

## Reto 3.6 — Reintentos con `performance_glitch_user`

```bash
pnpm test modulo-02-anotaciones/05-skip-only-fixme.spec.ts --grep "glitch" --retries=2
```

**✅ Resultado esperado:** el test pasa. Si hubo un cold start del backend, el primer intento puede haber timeado y el reintento lo salvó. Mira el reporte HTML — verás la fila con `retry #1` o `retry #2`.

---

## Reto 3.7 — Preguntas

1. ¿Por qué `--workers=1` es útil con `--headed`?
2. ¿Qué diferencia hay entre `--debug` y `test:ui`?
3. ¿Por qué `mobile-chrome` falló en el Reto 3.5?
4. ¿En qué escenarios de CI usarías `pnpm test:smoke` vs `pnpm test:regression`?

**Respuestas:**

1. Porque con varios workers se abren varias ventanas y no puedes seguir visualmente lo que pasa.
2. `--debug` abre el Inspector (pausa + step-over manual, ideal para **inspeccionar**). `test:ui` es un IDE visual con watch mode (ideal para **escribir**).
3. Porque el hook `tid()` del frontend devuelve `-responsive` a viewport mobile. Nuestros tests llaman `getByTestId('username-desktop')` — ese testid no existe en mobile. En M4 armaremos un helper para resolverlo.
4. `test:smoke` en cada PR (3-5 min, bloqueante). `test:regression` de noche o en el merge a `main` (30-60 min, reportado a Slack si falla).

---

## ✅ Checklist

- [ ] Corro la suite en headless, headed y UI mode.
- [ ] Sé filtrar por nombre, tag, archivo y línea.
- [ ] Usé `page.pause()` + el Inspector al menos una vez.
- [ ] Usé UI mode con watch mode.
- [ ] Corrí el mismo test en 3 navegadores distintos.
- [ ] Vi cómo `mobile-chrome` falla y entiendo por qué (lo arreglaremos en M4).

➡️ Siguiente: [Módulo 4 — Localizadores](../modulo-04-localizadores/)
