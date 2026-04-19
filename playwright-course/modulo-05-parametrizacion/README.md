# Módulo 5 — Parametrización: data-driven con los 4 mercados

> **Historia del curso:** hasta M4 tienes specs individuales. Hoy aprendes a ejecutar **el mismo test con muchos datos distintos** — el corazón del data-driven testing. OmniPizza tiene 4 mercados (MX/US/CH/JP) con monedas, impuestos y campos de checkout distintos: el escenario perfecto para esta técnica.
>
> **Referencia oficial:** [Parameterize Tests](https://playwright.dev/docs/test-parameterize) · [Test Fixtures](https://playwright.dev/docs/test-fixtures)

---

## Analogía

Data-driven = un solo plan de pruebas que se ejecuta N veces con N datasets.

En manual tendrías una tabla:

| Usuario | Password | Resultado esperado |
|---|---|---|
| `standard_user` | `pizza123` | login OK → /catalog |
| `locked_out_user` | `pizza123` | error visible |
| `problem_user` | `pizza123` | login OK (con precios rotos) |

Pasarías horas ejecutando el mismo procedimiento 3 veces. En Playwright: escribes el procedimiento UNA vez y le pasas la tabla como parámetro. El robot hace los 3 casos automáticamente.

---

## Archivos del módulo

| Archivo | Técnica | Escenario OmniPizza |
|---|---|---|
| [01-foreach-simple.spec.ts](./01-foreach-simple.spec.ts) | `forEach` con array inline | Login de los 5 usuarios deterministas |
| [02-data-driven-json.spec.ts](./02-data-driven-json.spec.ts) | Datos desde JSON externo | Catálogo por mercado (MX/US/CH/JP) |
| [03-env-variables.spec.ts](./03-env-variables.spec.ts) | `process.env` | Credenciales y BASE_URL configurables |
| [04-fixtures-personalizadas.spec.ts](./04-fixtures-personalizadas.spec.ts) | `test.extend()` | Fixture `authenticatedPage` — el germen del framework |
| [test-data.json](./test-data.json) | — | Los 4 mercados con datos de envío |
| [reto.spec.ts](./reto.spec.ts) | Todos combinados | Tu ejercicio integrador |

---

## El hito del módulo: la fixture `authenticatedPage`

Hasta ahora todos los specs que van más allá del login repiten:

```ts
test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('username-desktop').fill('standard_user');
  await page.getByTestId('password-desktop').fill('pizza123');
  await page.getByTestId('login-button-desktop').click();
  await expect(page).toHaveURL(/\/catalog/);
});
```

En M5 **extraes ese boilerplate a una fixture**:

```ts
test('catálogo tiene pizzas', async ({ authenticatedPage }) => {
  const count = await authenticatedPage.locator('[data-testid^="pizza-card-"]').count();
  expect(count).toBeGreaterThan(0);
});
```

Ese `authenticatedPage` es la **primera pieza reutilizable** del framework que vas construyendo. En M10 se muda a `fixtures/auth.ts` como parte de la estructura final.

---

## Cómo correr

```bash
# Todo el módulo
pnpm test modulo-05-parametrizacion

# Solo mercado MX del data-driven
pnpm test modulo-05-parametrizacion/02-data-driven-json.spec.ts -g "MX"

# Ejecutar con env var custom
TEST_USER=error_user pnpm test modulo-05-parametrizacion/03-env-variables.spec.ts

# Ver el reporte — cada caso parametrizado es un test separado
pnpm report
```

---

## Cheatsheet

```typescript
// forEach inline
[case1, case2].forEach(c => {
  test(`caso ${c.name}`, async ({ page }) => { /* ... */ });
});

// for-of (equivalente, más legible con muchas props)
for (const market of markets) {
  test(`mercado ${market.code}`, async ({ page }) => { /* ... */ });
}

// JSON externo
import markets from './test-data.json';

// env vars con fallback
const user = process.env.TEST_USER ?? 'standard_user';

// Fixture custom
type MyFixtures = { authenticatedPage: Page };
export const test = base.extend<MyFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // setup
    await use(page);
    // teardown
  },
});
```

➡️ [reto.spec.ts](./reto.spec.ts) · [Módulo 6 — Codegen](../modulo-06-codegen/)
