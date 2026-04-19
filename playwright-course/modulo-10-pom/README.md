# Módulo 10 — POM: refactor final del framework

> **Historia del curso:** a lo largo de los 9 módulos anteriores escribiste tests contra OmniPizza con boilerplate repetido (`page.goto('/')`, `fill(username)`, `fill(password)`, etc.). Hoy refactorizas TODO detrás del **Page Object Model**. Al terminar este módulo el framework está completo.
>
> **Referencia oficial:** [POM](https://playwright.dev/docs/pom) · [Fixtures](https://playwright.dev/docs/test-fixtures)

---

## Analogía

Un Page Object es un **"manual de instrucciones"** de una página.

En manual, antes de probar el login tenías una hoja:
- El campo de usuario está arriba a la izquierda.
- La contraseña está debajo.
- El botón azul dice "Sign In".

Un Page Object encapsula ese conocimiento en **código**. Si mañana cambia un testid, actualizas **una sola clase** — los 50 tests que la usan siguen funcionando.

---

## Antes (sin POM) vs después (con POM)

### Antes — cada test repite el boilerplate

```ts
test('login standard_user', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('username-desktop').fill('standard_user');
  await page.getByTestId('password-desktop').fill('pizza123');
  await page.getByTestId('login-button-desktop').click();
  await expect(page).toHaveURL(/\/catalog/);
});

test('login locked_out', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('username-desktop').fill('locked_out_user');   // 🔁
  await page.getByTestId('password-desktop').fill('pizza123');           // 🔁
  await page.getByTestId('login-button-desktop').click();                // 🔁
  await expect(page.getByTestId('login-error')).toBeVisible();
});
```

### Después — los tests se leen como una especificación

```ts
test('login standard_user', async ({ loginPage, page }) => {
  await loginPage.login('standard_user', 'pizza123');
  await expect(page).toHaveURL(/\/catalog/);
});

test('login locked_out', async ({ loginPage }) => {
  await loginPage.login('locked_out_user', 'pizza123');
  await loginPage.expectLoginError();
});
```

---

## Estructura del módulo

```
modulo-10-pom/
├── README.md
├── reto.md
├── pages/
│   ├── BasePage.ts         ← clase abstracta base
│   ├── LoginPage.ts        ← Page Object de /
│   └── CatalogPage.ts      ← Page Object de /catalog
├── fixtures/
│   └── auth.ts             ← fixtures: loginPage, catalogPage, authenticatedPage
└── tests/
    ├── login.pom.spec.ts       ← usa loginPage
    └── catalog.pom.spec.ts     ← usa authenticatedPage + catalogPage
```

Esta es la **estructura final del framework**. En un proyecto real, movería `pages/` y `fixtures/` al root del repo, fuera de `modulo-10-pom/`.

---

## Reglas del POM

1. **Un Page Object por página lógica** (no por archivo HTML).
2. **Los locators son `private`** — nadie fuera del POM sabe que `getByTestId('login-button-desktop')` existe.
3. **Los métodos públicos representan ACCIONES humanas:** `login(user, pass)`, `addFirstPizza()`, `selectCategory('popular')`. **NO** devuelven locators.
4. **Las assertions pueden vivir en el POM** (`expectLoginError()`) o **en el test**. Ambas escuelas son válidas; el curso mezcla las dos según convenga.
5. **Los tests NO usan `page.locator(...)` directamente** — todo pasa por el POM o las fixtures.
6. **Los Page Objects heredan de `BasePage`** para compartir `page`, helpers (`tid()`) y navegación.

---

## El helper `tid()` viajando al framework

En M4 lo creaste como helper suelto; en M10 lo trasladas a `BasePage.tid()`:

```ts
// BasePage.ts
protected tid(base: string): Locator {
  const size = this.page.viewportSize();
  const suffix = size && size.width < 768 ? '-responsive' : '-desktop';
  return this.page.getByTestId(`${base}${suffix}`);
}
```

Ahora todos los Page Objects son **viewport-aware gratis**. Correr con `--project=mobile-chrome` simplemente funciona.

---

## La fixture `authenticatedPage`

En M5 la creaste dentro del mismo archivo. En M10 vive en `fixtures/auth.ts`:

```ts
export const test = base.extend<OmniPizzaFixtures>({
  loginPage: async ({ page }, use) => { /* ... */ },
  catalogPage: async ({ page }, use) => { /* ... */ },
  authenticatedPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginAsStandardUser();

    const catalogPage = new CatalogPage(page);
    await catalogPage.expectLoaded();
    await catalogPage.waitForCatalog();

    await use(page);
  },
});
```

**Resultado:** los tests del catálogo (`catalog.pom.spec.ts`) arrancan directo en `/catalog` con las pizzas cargadas, sin escribir una línea de setup.

---

## Cómo correr

```bash
# Todos los tests del módulo 10
pnpm test modulo-10-pom/tests

# Solo login
pnpm test modulo-10-pom/tests/login.pom.spec.ts

# Solo smoke del catálogo
pnpm test modulo-10-pom/tests --grep @smoke
```

---

## Qué logras con este módulo

1. **Menos duplicación** — el boilerplate de login no se repite.
2. **Mantenimiento barato** — si cambia un testid, cambias **una línea**.
3. **Tests legibles** — cualquier nuevo miembro del equipo entiende `loginPage.login(user, pass)` sin mirar el DOM.
4. **Viewport-agnóstico gratis** — el helper `tid()` encapsulado.
5. **Composición** — una fixture puede usar 2 o más POMs (`authenticatedPage` usa `LoginPage` + `CatalogPage`).

---

## Próximos pasos

Cuando termines este módulo, tu framework está **listo** para proyectos reales. Posibles extensiones (fuera del curso):

- Un `CheckoutPage` con parametrización por mercado (lo viste en M5).
- Un `PizzaBuilderPage` para el modal de customización.
- POMs para API: `AuthApi`, `PizzasApi`, `OrdersApi` (modelando los endpoints de M9).
- **Atomic testing** (login via API + sembrar JWT) — curso avanzado.

➡️ [reto.md](./reto.md)
