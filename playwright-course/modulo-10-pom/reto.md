# Reto — Módulo 10: Page Object Model

## Reto 10.1 — Crea un `CheckoutPage`

Crea `modulo-10-pom/pages/CheckoutPage.ts` con:

- `path = '/checkout'`
- Locators **privados** (usando `tid()` cuando aplique):
  - `address`, `fullName`, `phone` (con sufijo -desktop)
  - `zipCode` (estático, sin sufijo)
  - `payment-card`, `payment-cash` (uno con sufijo, otro estático)
  - `place-order-btn` (con sufijo)
- Métodos públicos:
  - `fillShippingInfo(data: { address, fullName, phone, zipCode }): Promise<void>`
  - `selectPaymentMethod(method: 'card' | 'cash'): Promise<void>`
  - `placeOrder(): Promise<void>`
- Assertion:
  - `expectLoaded()` → verificar que los campos están visibles.

Al terminar, escribe `modulo-10-pom/tests/checkout.pom.spec.ts` que:
1. Use `authenticatedPage` para llegar a `/catalog`.
2. Agregue una pizza via `catalogPage.addFirstPizza()`.
3. Navegue a `/checkout`.
4. Use tu `CheckoutPage` para llenar datos de MX (desde `test-data.json` de M5).
5. Verifique que puede hacer click en "Place Order" (sin necesariamente completar la orden — los campos de tarjeta son complejos).

---

## Reto 10.2 — Agrega un POM para el Navbar

El navbar está en todas las páginas autenticadas. Crea `modulo-10-pom/pages/NavbarPage.ts`:

- Hereda de `BasePage`.
- Locators privados: `nav-logo`, `nav-catalog`, `nav-checkout`, `nav-profile`, `nav-cart-count`, `logout-btn`.
- Métodos públicos:
  - `goToCatalog()`
  - `goToProfile()`
  - `logout()`
  - `getCartCount(): Promise<number>` — devuelve el número mostrado.
- Assertion: `expectLoggedIn()` → navbar es visible con el logo.

---

## Reto 10.3 — Fixture `cartWithOnePizza`

Extiende `fixtures/auth.ts` con una nueva fixture:

```ts
cartWithOnePizza: async ({ authenticatedPage, catalogPage }, use) => {
  await catalogPage.addFirstPizza();
  await use(authenticatedPage);
},
```

Usa esa fixture en un test que verifique que `nav-cart-count` muestre "1".

---

## Reto 10.4 — Parametriza el login con forEach

Aplica el patrón de M5 a `LoginPage`:

```ts
const loginCases = [
  { username: 'standard_user', shouldSucceed: true },
  { username: 'locked_out_user', shouldSucceed: false },
  // ...
];

loginCases.forEach(({ username, shouldSucceed }) => {
  test(`login ${username}`, async ({ loginPage, page }) => {
    await loginPage.login(username, 'pizza123');
    if (shouldSucceed) {
      await expect(page).toHaveURL(/\/catalog/);
    } else {
      await loginPage.expectLoginError();
    }
  });
});
```

Pon el archivo en `modulo-10-pom/tests/login-parametrized.pom.spec.ts`.

---

## Reto 10.5 — Preguntas

1. ¿Por qué los locators de un Page Object son `private`?
2. ¿Cuál es la diferencia filosófica entre POM (UI) y los módulos de M9 (API)? ¿Deberían convivir?
3. ¿Por qué la fixture `authenticatedPage` usa `LoginPage` por dentro en vez de llamar a testids directamente?
4. Si mañana OmniPizza renombra `data-testid="login-button-desktop"` a `"submit-desktop"`, ¿qué archivos tocas?

**Respuestas:**

1. Porque son **detalles de implementación**. Un test no debería saber que el botón de login tiene `data-testid="login-button-desktop"` — solo debería decir "hago login". Si mañana cambia el testid, cambias una línea del POM y los tests no se dan ni cuenta.
2. Los POMs abstraen **UI**; los API specs no usan POMs (o usan patrones equivalentes tipo clases `AuthApi`, `PizzasApi`). Ambos conviven en el mismo repo pero son disciplinas distintas. El curso los mantiene aislados (UI en M1-M8,M10; API en M9) por decisión pedagógica.
3. Para **reutilizar** la lógica de login. Si mañana el login cambia (nuevo campo, MFA, etc.), modificas `LoginPage.login()` **una vez** y la fixture sigue funcionando.
4. **Solo `LoginPage.ts`** — la línea `return this.tid('login-button')` se cambia a `return this.tid('submit')`. Ningún test ni fixture necesita tocarse.

---

## ✅ Checklist

- [ ] Creé `CheckoutPage.ts` con locators, acciones y assertions.
- [ ] Creé `NavbarPage.ts` reutilizable en tests de páginas autenticadas.
- [ ] Extendí `fixtures/auth.ts` con `cartWithOnePizza`.
- [ ] Parametrizé el login usando forEach + POM.
- [ ] Puedo explicar por qué separamos selectores en POMs privados.

🎓 **¡Terminaste el curso!** Tu framework OmniPizza está listo para:
- Extenderse con más pages/ (Profile, Admin, etc.).
- Subirse a GitHub (M8) con CI.
- Refactorizarse a la estructura de repo independiente.

➡️ Revisa el [README principal del curso](../README.md) para ver el framework completo en contexto.
