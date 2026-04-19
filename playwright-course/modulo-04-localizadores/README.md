# Módulo 4 — Localizadores: todos los que Playwright ofrece

> **Historia del curso:** hasta ahora usamos testids porque son robustos. Hoy vemos **las 12 estrategias de localización** de Playwright y cuándo usar cada una, todas aplicadas a los flujos reales de OmniPizza (login, catálogo, checkout).
>
> **Referencia oficial:** [Locators](https://playwright.dev/docs/locators)

---

## Pirámide de prioridad (recomendada por Playwright)

```
1. getByRole        ← accesibilidad + estabilidad
2. getByLabel       ← formularios bien hechos
3. getByPlaceholder ← cuando el label no está bien conectado
4. getByText        ← texto visible único
5. getByAltText     ← imágenes
6. getByTitle       ← tooltips
7. getByTestId      ← cuando los anteriores no bastan (requiere contrato con front)
8. page.locator()   ← CSS/XPath crudo (último recurso)
```

La regla: **sube en la pirámide siempre que puedas**. Un test que usa `getByRole` es más accesible, más estable y se lee mejor.

---

## Archivos del módulo (uno por estrategia)

| # | Archivo | Estrategia | Escenario en OmniPizza |
|---|---------|------------|------------------------|
| 4.1 | [01-get-by-role.spec.ts](./01-get-by-role.spec.ts) | `getByRole` | Botón Sign In, headings, quick-login buttons |
| 4.2 | [02-get-by-text.spec.ts](./02-get-by-text.spec.ts) | `getByText` | "Welcome back!", "Art of Pizza", "Quick Login" |
| 4.3 | [03-get-by-label.spec.ts](./03-get-by-label.spec.ts) | `getByLabel` | ⚠️ FALLA en OmniPizza — lección de accesibilidad |
| 4.4 | [04-get-by-placeholder.spec.ts](./04-get-by-placeholder.spec.ts) | `getByPlaceholder` | Username + password placeholders |
| 4.5 | [05-get-by-alt-text.spec.ts](./05-get-by-alt-text.spec.ts) | `getByAltText` | "OmniPizza Logo", "Art of Pizza", pizzas del catálogo |
| 4.6 | [06-get-by-title.spec.ts](./06-get-by-title.spec.ts) | `getByTitle` | Banderas de mercado, quick-login users |
| 4.7 | [07-get-by-test-id.spec.ts](./07-get-by-test-id.spec.ts) | `getByTestId` | El gotcha de `-desktop`/`-responsive` + helper `tid()` |
| 4.8 | [08-css-selectors.spec.ts](./08-css-selectors.spec.ts) | CSS via `page.locator()` | Selectores por atributo, descendiente, pseudo-clase |
| 4.9 | [09-xpath.spec.ts](./09-xpath.spec.ts) | XPath | Texto exacto, navegación padre, último recurso |
| 4.10 | [10-filters.spec.ts](./10-filters.spec.ts) | `.filter()` | `hasText`, `has`, `hasNot`, `visible` |
| 4.11 | [11-chaining-nesting.spec.ts](./11-chaining-nesting.spec.ts) | Chaining + `.and()` / `.or()` | Locator dentro de locator; combinar condiciones |
| 4.12 | [12-position-nth.spec.ts](./12-position-nth.spec.ts) | `.first()`, `.last()`, `.nth()` | Posición en listas (pizza cards, mercados, users) |
| 🚩 | [reto.spec.ts](./reto.spec.ts) | Integrador | 6 elementos, 6 strategies distintas |

---

## El gotcha de OmniPizza: `-desktop` / `-responsive`

El frontend usa un hook `tid()` que añade un sufijo al `data-testid` según el viewport:

```jsx
// En el componente:
<input data-testid={tid('username')} />

// En runtime, según el viewport:
// Desktop (≥768px) → data-testid="username-desktop"
// Mobile  (<768px) → data-testid="username-responsive"
```

**Implicación para tus tests:**
- Si usas `--project=chromium` (default 1280×720), todos los testids dinámicos terminan en `-desktop`.
- Si usas `--project=mobile-chrome` (Pixel 5, 393×727), terminan en `-responsive`.
- **La mayoría de los specs del módulo usan `-desktop` directo** (porque corren en Chromium).
- El archivo **07-get-by-test-id.spec.ts** define un helper `tid(page, base)` que calcula el sufijo en runtime — úsalo como referencia cuando escribas tests que corran en varios viewports.

---

## Cómo correr

```bash
# Todo el módulo
pnpm test modulo-04-localizadores

# Un solo archivo
pnpm test modulo-04-localizadores/07-get-by-test-id.spec.ts

# En UI mode (ideal para ver los locators en acción)
pnpm test:ui

# Usar Pick Locator para descubrir el selector exacto de un elemento
pnpm test:debug modulo-04-localizadores/01-get-by-role.spec.ts
# → en el Inspector: click en "Pick locator" → click sobre el elemento
```

---

## Comparación rápida — 4 formas de localizar el botón Sign In

```ts
// 1. getByRole       — ideal (accesible + semántico)
page.getByRole('button', { name: /sign in/i });

// 2. getByTestId     — robusto (requiere testid en el DOM)
page.getByTestId('login-button-desktop');

// 3. CSS selector    — funciona pero más frágil
page.locator('button[data-testid="login-button-desktop"]');

// 4. XPath           — último recurso
page.locator('//button[text()="Sign In"]');
```

**Regla de oro:** cuando todos funcionan, elige el **más alto** en la pirámide.

---

## Siguiente

➡️ [reto.spec.ts](./reto.spec.ts) — reto integrador

➡️ [Módulo 5 — Parametrización con los 4 mercados de OmniPizza](../modulo-05-parametrizacion/)
