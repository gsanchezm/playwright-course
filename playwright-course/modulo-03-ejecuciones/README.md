# Módulo 3 — Ejecuciones: correr la suite contra OmniPizza

> **Historia del curso:** ya tienes la mini-suite de M2 contra OmniPizza. Hoy aprendes **todas las formas de correrla**: headless/headed, UI mode, por tag, por proyecto, con reintentos para el `performance_glitch_user`.
>
> **Referencia oficial:** [Running Tests](https://playwright.dev/docs/running-tests) · [Debug](https://playwright.dev/docs/debug) · [UI Mode](https://playwright.dev/docs/test-ui-mode)

---

## Analogía principal

Cada modo de ejecución responde a una necesidad distinta del día a día:

| Modo | Cuándo usarlo |
|---|---|
| **Headless** | Ejecuciones regulares, CI — rápido, sin ventana |
| **Headed** | Verificar visualmente qué hace el robot |
| **Debug mode** | Pausar en un paso y explorar el DOM |
| **UI mode** | ⭐ Desarrollo interactivo de tests (el favorito) |
| **Por tag** | Pipeline: smoke en cada deploy, regression por la noche |
| **Por proyecto** | Mismo test en Chrome + Firefox + WebKit |

---

## 1. Headless vs Headed

### Headless (default)

```bash
pnpm test                                  # todo el suite (todos los proyectos)
pnpm test modulo-02-anotaciones            # un módulo completo
pnpm test modulo-02-anotaciones/04-hooks-all.spec.ts
```

### Headed

Abre el navegador visible — útil cuando aprendes.

```bash
pnpm test:headed
pnpm test --headed --workers=1 --project=chromium modulo-02-anotaciones
```

> 💡 **Combina siempre `--headed` con `--workers=1 --project=chromium`** — si no, verás 4 ventanas de Chromium al mismo tiempo y el caos es real.

---

## 2. Ejecutar un subconjunto

```bash
# Archivo completo
pnpm test modulo-02-anotaciones/02-describe-agrupacion.spec.ts

# Por nombre (match de texto en el título del test)
pnpm test -g "locked_out_user"

# Por línea
pnpm test modulo-02-anotaciones/02-describe-agrupacion.spec.ts:18
```

---

## 3. Por tag (`--grep`)

En M2 etiquetaste los tests con `@smoke`, `@regression`, `@critical`.

```bash
pnpm test --grep @smoke                 # solo @smoke
pnpm test --grep @regression            # solo @regression
pnpm test --grep "@smoke|@critical"     # @smoke O @critical
pnpm test --grep-invert @slow           # todos menos @slow

# Atajos del package.json
pnpm test:smoke
pnpm test:regression
```

**En la vida real:** `test:smoke` corre en cada PR (3-5 min), `test:regression` corre en la noche (30-60 min). Esta división te la regala OmniPizza con su surface pequeño.

---

## 4. Debug Mode (`--debug`)

Abre el **Playwright Inspector** — un panel lateral con control manual del test.

```bash
pnpm test:debug modulo-02-anotaciones/01-test-basico.spec.ts
```

**Lo que te da el Inspector:**
- ⏸ **Pausa** en `await page.pause()` dentro de cualquier test.
- ⏭ **Step over** línea por línea.
- ▶️ **Resume** hasta el próximo breakpoint.
- 🎯 **Pick locator** — clic visual sobre un elemento y te da el selector ideal.

### Poner una pausa manual en un test

```typescript
test('ejemplo con pausa', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('username-desktop').fill('standard_user');
  await page.pause(); // ⏸ el test se detiene aquí
  await page.getByTestId('login-button-desktop').click();
});
```

`page.pause()` = "alto, déjame inspeccionar el DOM antes de continuar".

---

## 5. UI Mode (⭐ el favorito)

```bash
pnpm test:ui
```

Interfaz gráfica con:
- Lista de todos los tests (filtrable por tag, por browser, por status).
- Timeline con **screenshot del DOM en cada paso**.
- **Watch mode** 👁 — guardas el archivo y re-corre automáticamente.
- **Pick locator** integrado.
- Logs de red + consola del navegador.

**Recomendación:** cuando escribas nuevos tests, usa UI mode **siempre**.

---

## 6. Proyectos: multi-browser

```bash
# Solo Chromium
pnpm test:chromium modulo-02-anotaciones

# Solo Firefox
pnpm test --project=firefox modulo-02-anotaciones

# Solo WebKit (equivalente a probar en Safari)
pnpm test --project=webkit modulo-02-anotaciones

# Emulación mobile
pnpm test --project=mobile-chrome modulo-02-anotaciones
```

**Nota sobre OmniPizza y mobile:** el front tiene un hook `tid()` que añade `-desktop` o `-responsive` al testid según el viewport. A viewport de `mobile-chrome` (Pixel 5, 393×727) los testids que ven tus specs son distintos. En M4 haremos un helper.

---

## 7. Reintentos (para el `performance_glitch_user`)

```bash
pnpm test --retries=2 modulo-02-anotaciones
```

`performance_glitch_user` agrega ~3s por request: ocasionalmente un test timea aunque el comportamiento sea correcto. Reintentar **una o dos veces** es válido — siempre que entiendas **por qué**.

> ⚠️ Los reintentos son una curita, no una cura. Si un test necesita 10 reintentos para pasar, el código o el test están mal. Arréglalo.

En `playwright.config.ts` ya lo tienes: 0 retries local, 2 en CI.

---

## 8. Workers y paralelismo

```bash
pnpm test --workers=1   # serializado (útil en headed o con datos compartidos)
pnpm test --workers=4   # 4 en paralelo
```

Con OmniPizza en Render gratis, `--workers=2` es un buen compromiso: evita saturar el servidor con requests simultáneos que podrían hacer cold start caer.

---

## Cheatsheet

| Comando | Uso |
|---|---|
| `pnpm test` | Todo el suite |
| `pnpm test:ui` | ⭐ UI mode (dev interactivo) |
| `pnpm test:headed` | Con navegador visible |
| `pnpm test:debug archivo` | Inspector con breakpoints |
| `pnpm test --grep @smoke` | Tag |
| `pnpm test --project=firefox` | Un browser |
| `pnpm test -g "texto"` | Por nombre |
| `pnpm test archivo:N` | Línea N |
| `pnpm test --workers=1` | Serializado |
| `pnpm test --retries=2` | Con reintentos |
| `pnpm report` | Abre el último HTML report |

➡️ Siguiente: [reto.md](./reto.md) · [Módulo 4 — Localizadores](../modulo-04-localizadores/)
