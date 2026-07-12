# M05 · Widgets nuevos: interacciones de UI

> 🎁 **Vive en el `proyecto/` de M05.** OmniPizza sumó controles nuevos —date picker, dropdowns, radio group, tooltips, modales y un market RTL— y cada uno se automatiza con una técnica **distinta** de Playwright. Todo esto ya está armado en el proyecto de referencia: los Page Objects `pages/ProfilePage.ts` y `pages/PizzaCustomizerModal.ts`, las ampliaciones de `pages/CheckoutPage.ts` / `pages/CatalogPage.ts`, y el spec `tests/interacciones-nuevas.spec.ts` (8 tests). Ábrelo con `pnpm install` → `cp .env.example .env` → `pnpm exec playwright test tests/interacciones-nuevas.spec.ts`.

**Duración estimada:** 45-60 min
**Piezas que suma al framework:**
- `pages/ProfilePage.ts` — 🆕 date picker NATIVO (`<input type="date">`).
- `pages/PizzaCustomizerModal.ts` — 🆕 modal SIN `role="dialog"`.
- `pages/CheckoutPage.ts` — ampliado: radio group de pago, dropdowns de tarjeta, tooltips y confirmación de orden.
- `tests/interacciones-nuevas.spec.ts` — 🆕 8 tests, uno por técnica.

Corre en el mismo project `chromium` **sin sesión heredada**: cada test hace login por UI con el fixture `loginPage`, y todos los Page Objects (`profilePage`, `pizzaCustomizer`, `checkoutPage`…) **vienen inyectados** por el fixture de M05. Aquí no construyes ningún Page Object a mano.

---

## Analogía de apertura

Un tester manual no toca todos los controles igual. A un **campo de fecha** del sistema le teclea la fecha; no pelea con el calendarito del navegador. A un **desplegable** le elige la opción por su valor. A unos **botones de opción** (efectivo / tarjeta) les da clic y confirma cuál quedó marcado. A un **globito de ayuda** le pasa el mouse por encima… salvo que sea el tooltip nativo del navegador, que no se puede "ver" y hay que leerlo del atributo.

Cada control tiene su gesto correcto. Automatizar es traducir ese gesto a la API de Playwright que corresponde —y saber **cuál NO usar** es la mitad de la lección.

---

## ¿Qué aprenderás?

1. **Date picker NATIVO** — `<input type="date">` se llena con `.fill("YYYY-MM-DD")`, **nunca** clickeando el calendario.
2. **Dropdown NATIVO** — un `<select>` se acciona con `.selectOption(value)`, no escribiendo ni clickeando la lista.
3. **Radio group de botones** (`role="radio"`) — se elige con `.click()` y se afirma con `aria-checked`; cambiar de método **quita** los campos de tarjeta del DOM.
4. **Los dos sabores de tooltip** — CUSTOM (hover → `[role="tooltip"]` visible) vs NATIVO (atributo `title`, localizado por market, se lee con `getAttribute`).
5. **Modales/popups** — uno SIN `role="dialog"` (anclar por testid) y otro que SÍ lo expone; el flujo de confirmación de orden hasta `/order-success`.
6. **Market RTL (Arabia Saudita)** — `dir="rtl"`, moneda SAR, y por qué se localiza por **testid, no por texto**.

---

## Conceptos JIT

| Control en la app | Técnica de Playwright |
|---|---|
| `<input type="date">` (cumpleaños) | `.fill("YYYY-MM-DD")` — nunca el calendario emergente |
| `<select>` nativo (mes/año de tarjeta) | `.selectOption(value)` — por el `value` del `<option>` |
| Botón con `role="radio"` (método de pago) | `.click()` + afirmar `aria-checked="true"` |
| Tooltip CUSTOM (`tip-info` → `tip-tooltip`) | `.hover()` → `[role="tooltip"]` → `toBeVisible()` |
| Tooltip NATIVO (`title` del teléfono) | `getAttribute("title")` — NO es hover-asertable |
| Modal sin `role="dialog"` (Customize Pizza) | Anclar por testid (`getByRole("dialog")` NO sirve) |
| Modal con `role="dialog"` (confirmar orden) | Afirmable por **rol Y** testid |
| Market `SA` (RTL) | `html[dir="rtl"] lang="ar"`, precios `ر.س`; testid, no texto |

---

## Paso a paso

> **Cómo leer esta sección:** cada paso enseña **un control = una técnica**. El código de la izquierda es el Page Object que encapsula el gesto; el de la derecha, cómo lo usa el test. Todos los Page Objects llegan inyectados por el fixture de M05.

### Paso 1 — Date picker NATIVO (`<input type="date">`)

El cumpleaños del perfil es un `<input type="date">`. La regla de oro: **no se clickea el calendario emergente** (es UI del navegador, fuera del DOM, y Playwright no lo manipula de forma confiable). Se llena con `.fill()` en formato ISO `"YYYY-MM-DD"`, y su `value` **siempre** se lee en ISO.

```ts
// @file modulo-05-fixtures/pages/ProfilePage.ts
private get birthdayInput(): Locator {
  // El date picker nativo: <input type="date">, sin sufijo.
  return this.page.getByTestId(this.dateBirthday);
}

/** Fija el cumpleaños en el date picker NATIVO (ISO "YYYY-MM-DD"). */
async setBirthday(isoDate: string): Promise<void> {
  await this.birthdayInput.fill(isoDate);
}

async expectBirthday(isoDate: string): Promise<void> {
  // Aserción directa sobre el value ISO del date picker nativo.
  await expect(this.birthdayInput).toHaveValue(isoDate);
}
```

```ts
// @file modulo-05-fixtures/tests/interacciones-nuevas.spec.ts
await profilePage.goto();
await profilePage.expectLoaded();

// La técnica: .fill() con ISO. No abrimos ni clickeamos el calendario.
await profilePage.setBirthday("1990-05-15");
await profilePage.expectBirthday("1990-05-15");
```

> 🔍 **Detalle que parece obvio — por qué `.fill()` y no clickear el calendario**
> **Qué es:** un `<input type="date">` acepta el valor en ISO `"YYYY-MM-DD"` sin importar cómo lo pinte el navegador según el locale (dd/mm/yyyy en MX, mm/dd/yyyy en US). Por eso `.fill("1990-05-15")` es **portable entre markets**.
> **Por qué así (y no la alternativa obvia):** el calendarito que abre Chrome/Firefox al hacer clic es UI **del navegador**, no del DOM de la página. Playwright no ve esos días como elementos, así que clickearlos es frágil o imposible.
> **Qué pasa si lo cambias:** si intentas "navegar el calendario" a mano, el test se vuelve dependiente del locale y del render nativo. `.fill()` con ISO lo hace determinista.

---

### Paso 2 — Dropdown NATIVO de la tarjeta (`<select>`)

La expiración de la tarjeta son **dos `<select>` nativos** (mes y año). No se escriben ni se clickea la lista: se accionan con `.selectOption(value)`, donde `value` es el `value` del `<option>` (`"01".."12"`, `"24".."39"`).

```ts
// @file modulo-05-fixtures/pages/CheckoutPage.ts
export interface CardData {
  holder: string;
  number: string;
  expMonth: string;
  expYear: string;
  cvv: string;
}

async fillCard(card: CardData): Promise<void> {
  await this.cardHolderInput.fill(card.holder);
  await this.cardNumberInput.fill(card.number);
  // <select> nativo → selectOption por value:
  await this.cardExpiryMonthSelect.selectOption(card.expMonth);
  await this.cardExpiryYearSelect.selectOption(card.expYear);
  await this.cardCvvInput.fill(card.cvv);
}

async expectExpiry(month: string, year: string): Promise<void> {
  await expect(this.cardExpiryMonthSelect).toHaveValue(month);
  await expect(this.cardExpiryYearSelect).toHaveValue(year);
}
```

```ts
// @file modulo-05-fixtures/tests/interacciones-nuevas.spec.ts
await checkoutPage.selectPaymentMethod("card");
await checkoutPage.expectCardFieldsVisible();

// Tarjeta de PRUEBA. expMonth/expYear van por selectOption (son <select>).
await checkoutPage.fillCard({
  holder: "STANDARD USER",
  number: "4111 1111 1111 1111",
  expMonth: "05",
  expYear: "28",
  cvv: "123",
});
await checkoutPage.expectExpiry("05", "28");
```

> 🔷 **TypeScript — `interface CardData` como contrato del método**
> `fillCard(card: CardData)` recibe un **objeto tipado**: TS exige `holder`, `number`, `expMonth`, `expYear` y `cvv`, todos `string`. El gotcha: si olvidas una propiedad al llamar `fillCard({...})`, el error salta **en el editor**, no en runtime — y `expMonth` como `string` te recuerda que el `<option>` guarda `"05"`, no el número `5`.
> 📚 Lo viste en [TS · M06 — Interfaces](/docs/typescript/m6-api-response). Aquí la interfaz documenta qué necesita una tarjeta de prueba y evita pasar datos incompletos al `<select>`.

---

### Paso 3 — Método de pago: radio group de botones (`role="radio"`)

El método de pago **no** son `<input type="radio">` nativos: son botones con `role="radio"`. Se eligen con `.click()` y el estado se afirma con `aria-checked` (no con `:checked`). Como `"card"` viene seleccionado por defecto, para probar la **interacción** demostramos la **transición**: cambiar a `"cash"` y volver. Detalle real de OmniPizza: al salir de `"card"`, los campos de tarjeta se **quitan del DOM**.

```ts
// @file modulo-05-fixtures/pages/CheckoutPage.ts
export type PaymentMethod = "card" | "cash" | "paypal";

async selectPaymentMethod(method: PaymentMethod): Promise<void> {
  await this.paymentMethodButton(method).click();
}

async expectPaymentSelected(method: PaymentMethod): Promise<void> {
  // El botón activo del radio group marca aria-checked="true".
  await expect(this.paymentMethodButton(method)).toHaveAttribute(
    "aria-checked",
    "true",
  );
}

async expectCardFieldsHidden(): Promise<void> {
  // Con método != card, los campos se QUITAN del DOM. toBeHidden()
  // cubre ambos casos: un elemento ausente cuenta como oculto.
  await expect(this.cardNumberInput).toBeHidden();
}
```

```ts
// @file modulo-05-fixtures/tests/interacciones-nuevas.spec.ts
// Estado inicial: "card" es el método por defecto.
await checkoutPage.expectPaymentSelected("card");
await checkoutPage.expectCardFieldsVisible();

// Cambiar a "cash": el radio pasa a cash y los campos de tarjeta se van.
await checkoutPage.selectPaymentMethod("cash");
await checkoutPage.expectPaymentSelected("cash");
await checkoutPage.expectCardFieldsHidden();

// Volver a "card": el radio regresa y los campos reaparecen.
await checkoutPage.selectPaymentMethod("card");
await checkoutPage.expectPaymentSelected("card");
await checkoutPage.expectCardFieldsVisible();
```

> 🔍 **Detalle que parece obvio — `aria-checked`, no `:checked`; `toBeHidden`, no conteo**
> **Qué es:** como el control es un botón con `role="radio"` (no un `<input>`), su estado vive en `aria-checked="true"`, no en la propiedad `:checked`. Y cuando el método no es `"card"`, los campos de tarjeta **desaparecen del DOM**.
> **Por qué así (y no la alternativa obvia):** `toBeHidden()` es verde tanto si el elemento existe pero está oculto **como si no existe** — justo lo que necesitas cuando el DOM se recorta. Contar elementos (`count() === 0`) sería más frágil y menos legible.
> **Qué pasa si lo cambias:** afirmar `:checked` sobre un botón nunca se cumple; y `toBeVisible().not` en un elemento ausente puede leerse peor que un `toBeHidden()` directo.

---

### Paso 4 — Los dos sabores de tooltip (CUSTOM vs NATIVO)

OmniPizza tiene los dos tipos, y se prueban **al revés** uno del otro:

- **CUSTOM** (ícono ℹ️ de la propina): el texto vive en un `[role="tooltip"]` del DOM que aparece al hacer `.hover()`. **Sí** es hover-asertable → `toBeVisible()`.
- **NATIVO** (teléfono): usa el atributo `title` del navegador. NO se pinta en el DOM al hacer hover → Playwright **no** puede afirmarlo visible; se lee con `getAttribute("title")`. Además el mensaje está **localizado por market**, así que afirmamos el fragmento estable `"7-15"`, no el texto completo.

```ts
// @file modulo-05-fixtures/pages/CheckoutPage.ts
/** Hover sobre el ícono ℹ️ de la propina (dispara el tooltip custom). */
async hoverTipInfo(): Promise<void> {
  await this.tipInfoButton.hover();
}

/** Tooltip CUSTOM: tras el hover, el [role="tooltip"] se hace visible. */
async expectTipTooltipVisible(): Promise<void> {
  await expect(this.tipTooltip).toBeVisible();
}

/**
 * Tooltip NATIVO del teléfono (atributo `title`). Los title del
 * navegador NO aparecen en el DOM al hacer hover, así que se LEEN
 * del atributo — no son hover-asertables.
 */
async getPhoneTitle(): Promise<string | null> {
  return this.tid("phone").getAttribute("title");
}
```

```ts
// @file modulo-05-fixtures/tests/interacciones-nuevas.spec.ts
// CUSTOM: antes del hover no existe; el hover lo revela.
await checkoutPage.expectTipTooltipHidden();
await checkoutPage.hoverTipInfo();
await checkoutPage.expectTipTooltipVisible();

// NATIVO: se lee del atributo. El mensaje está localizado por market,
// por eso afirmamos el fragmento estable "7-15", no el texto completo.
const title = await checkoutPage.getPhoneTitle();
expect(title).toContain("7-15");
```

> 🔍 **Detalle que parece obvio — el `title` nativo NO es hover-asertable**
> **Qué es:** el mensaje de un `title` lo pinta el **navegador** como bocadillo del sistema; nunca entra al DOM. Por eso no existe un `[role="tooltip"]` que `toBeVisible()` pueda encontrar.
> **Por qué así (y no la alternativa obvia):** hacer `hover()` + esperar un elemento visible funciona para el tooltip **custom**, pero para el nativo esa espera se agota siempre. La lectura correcta es `getAttribute("title")`.
> **Qué pasa si lo cambias:** el mensaje está traducido (MX: "…(7-15 dígitos)", US: "…(7-15 digits)"), así que afirmar el texto completo rompe el test en otro market. Afirmar el fragmento `"7-15"` es el **mismo principio i18n** que localizar por testid y no por texto.

---

### Paso 5 — Modal SIN `role="dialog"` (Customize Pizza)

Al agregar una pizza al carrito se abre el modal "Customize Pizza". Merece su propio Page Object. Dos detalles reales: **no expone `role="dialog"`** (así que `getByRole("dialog")` NO sirve —nos anclamos por testid) y "Choose Size" se marca **REQUIRED** en la UI, pero el botón confirmar **no** queda deshabilitado.

```ts
// @file modulo-05-fixtures/pages/PizzaCustomizerModal.ts
async selectSize(size: PizzaSize): Promise<void> {
  await this.sizeButton(size).click();
}

/** Alterna un topping (chip). Ej: "pepperoni", "mushrooms", "bacon". */
async toggleTopping(name: string): Promise<void> {
  await this.toppingChip(name).click();
}

async confirm(): Promise<void> {
  await this.confirmButton.click();
}

async expectOpen(): Promise<void> {
  // Sin role="dialog": nos anclamos a un testid propio del modal.
  await expect(this.confirmButton).toBeVisible();
}

async expectClosed(): Promise<void> {
  await expect(this.confirmButton).toBeHidden();
}
```

```ts
// @file modulo-05-fixtures/tests/interacciones-nuevas.spec.ts
await catalogPage.openCustomizerForFirst();
await pizzaCustomizer.expectOpen();

// Interacción típica de modal: elegir tamaño + un topping.
await pizzaCustomizer.selectSize("large");
await pizzaCustomizer.toggleTopping("mushrooms");

// Confirmar cierra el modal y suma la pizza al carrito.
await pizzaCustomizer.confirm();
await pizzaCustomizer.expectClosed();
await menuPage.expectCartCount(1);
```

> 🔍 **Detalle que parece obvio — "REQUIRED" visual no siempre bloquea el submit**
> **Qué es:** "Choose Size" aparece marcado como requerido, pero `confirm-add-to-cart` **no** nace deshabilitado. Verificado en vivo (2026-07-12).
> **Por qué importa (buena lección de QA):** un asterisco o un "required" en la UI es una **intención de diseño**, no una garantía de que el submit esté bloqueado. Son cosas separadas: la marca visual y el `disabled` real.
> **Qué haces con eso:** **verifícalo, no lo asumas.** Si el requisito de negocio es "no se puede confirmar sin tamaño", eso es un test explícito del estado del botón —no algo que das por hecho porque la UI muestra "required".

---

### Paso 6 — Modal que SÍ expone `role="dialog"` + pantalla de éxito

El checkout cierra el flujo E2E con **dos popups encadenados**. Y aquí está el contraste con el Paso 5: este modal **sí** expone `role="dialog"`, así que lo afirmamos por rol **y** por testid.

1. `place-order-btn` **no** envía la orden: abre el modal `confirm-order-modal` (`role="dialog"`).
2. `confirm-order-yes` confirma → la app **navega** a `/order-success` (pantalla completa, no modal) con un `order-id` generado.

```ts
// @file modulo-05-fixtures/pages/CheckoutPage.ts
async placeOrder(): Promise<void> {
  await this.placeOrderButton.click();
}

/**
 * El popup de confirmación SÍ es un role="dialog" — se afirma tanto
 * por testid como por rol (contraste con el customizer, que no lo expone).
 */
async expectConfirmOrderModal(): Promise<void> {
  await expect(this.confirmOrderModal).toBeVisible();
  await expect(this.page.getByRole("dialog")).toBeVisible();
}

/** 2º paso: confirma la orden dentro del modal (confirm-order-yes). */
async confirmOrder(): Promise<void> {
  await this.confirmOrderYesButton.click();
}

/** Tras confirmar: pantalla /order-success con un id de orden generado. */
async expectOrderSuccess(): Promise<void> {
  await this.waitForUrl(/\/order-success/);
  await expect(this.orderSuccessScreen).toBeVisible();
  await expect(this.orderId).toContainText("ORDER-");
}
```

```ts
// @file modulo-05-fixtures/tests/interacciones-nuevas.spec.ts
// Paso 1 — place-order abre el popup de confirmación (role="dialog").
await checkoutPage.placeOrder();
await checkoutPage.expectConfirmOrderModal();

// Paso 2 — confirmar lleva a la pantalla de éxito con id de orden.
await checkoutPage.confirmOrder();
await checkoutPage.expectOrderSuccess();
```

> 🔍 **Detalle que parece obvio — dos popups NO son el mismo tipo de "modal"**
> **Qué es:** el customizer (Paso 5) se ancla por testid porque **no** tiene `role="dialog"`; el de confirmar orden **sí** lo tiene. La pantalla `/order-success` no es popup en absoluto: es una **navegación** a otra ruta.
> **Por qué así:** no todos los overlays son iguales en el DOM. Antes de escribir `getByRole("dialog")`, confirma que el elemento realmente expone ese rol —si no, tu locator queda vacío.
> **Qué pasa si lo cambias:** usar `getByRole("dialog")` en el customizer no encuentra nada; esperar un popup tras `confirm-order-yes` (en vez de la navegación a `/order-success`) hace que el test se cuelgue. Cada popup, su técnica.

---

### Paso 7 — Market RTL: Arabia Saudita (`SA`)

Al elegir el market `SA`, la app entera pasa a **RTL**: `html[dir="rtl"] lang="ar"` y los precios salen en riyal saudí (`ر.س`, SAR). Su checkout usa un campo `district` (no `zip-code`, ver `data/markets.json`). Es el recordatorio del curso: por eso **no** se localiza por texto —los testids son estables en todos los markets, el texto no.

```ts
// @file modulo-05-fixtures/tests/interacciones-nuevas.spec.ts
// "SA" ya es un CountryCode válido (ver types/omnipizza.d.ts).
await loginPage.loginInMarket(standardUser, "SA");
await catalogPage.expectLoaded();

// La dirección del documento cambia a right-to-left.
await expect(page.locator("html")).toHaveAttribute("dir", "rtl");

// Los precios llevan el símbolo del riyal saudí (ر.س).
const price = await catalogPage.getFirstPizzaPrice();
expect(price).toContain("ر.س");
```

> 🔍 **Detalle que parece obvio — RTL y moneda cambian el texto, no los testids**
> **Qué es:** en `SA` el layout se invierte (`dir="rtl"`), el idioma es `ar`, la moneda es SAR y hasta el campo de dirección cambia (`district` en lugar de `zip-code`).
> **Por qué así:** todo lo **visible** —idioma, símbolo de moneda, orden de la fila— es específico del market. Lo único estable entre MX/US/CH/JP/SA son los **testids** y atributos semánticos como `dir`.
> **Qué pasa si lo cambias:** un locator por texto ("Precio", "$") que funcionaba en MX se rompe en SA. Afirmar `dir="rtl"` y el fragmento `ر.س` (no la cadena completa del precio) mantiene el test verde en el market RTL.

---

## ▶️ Cómo ejecutar

- **Solo este spec:** desde `proyecto/`, `pnpm exec playwright test tests/interacciones-nuevas.spec.ts --headed --project=chromium`
- **Filtrar por tag:** `pnpm exec playwright test --grep @regression`
- **UI mode (recomendado la 1ª vez):** `pnpm test:ui`
- **Headed / debug:** `pnpm test:headed` · `pnpm test:debug`
- **Verificar tipos:** `pnpm typecheck`
- **Ver el reporte:** `pnpm report`
- **🪟 Windows / PowerShell:** variables de entorno con `$env:VAR="x"; pnpm m5` (no `VAR=x pnpm m5`, sintaxis bash que falla en PowerShell)

---

## Outcome esperado

- [ ] Distingues un control **NATIVO** (date / select / `title`) de uno **CUSTOM** (radio-botón / tooltip / modal) y sabes qué API usa cada uno.
- [ ] Llenas un `<input type="date">` con `.fill("YYYY-MM-DD")` sin abrir el calendario, y lees su `value` en ISO.
- [ ] Eliges mes/año con `.selectOption(value)` y lo afirmas con `toHaveValue`.
- [ ] Cambias el método de pago con `.click()`, verificas `aria-checked="true"` y que los campos de tarjeta se **quitan del DOM** (`toBeHidden`).
- [ ] Diferencias el tooltip CUSTOM (hover → `toBeVisible`) del NATIVO (`getAttribute("title")`, afirmando el fragmento estable `"7-15"`).
- [ ] Automatizas el modal "Customize Pizza" (sin `role="dialog"`, anclado por testid) y el flujo de confirmación de orden hasta `/order-success`.
- [ ] Corres el market `SA`, verificas `dir="rtl"` y precios en SAR, localizando por **testid, no por texto**.

---

## ¿Qué viene en M06?

Aquí, cada test de interacciones todavía hace su **login por UI** antes de tocar el widget (dentro del fixture `loginPage`). En **M06 (Setup)** ese login desaparece: un `auth.setup.ts` corre **una sola vez**, guarda la sesión en `.auth/`, y los tests arrancan **ya autenticados** con `storageState` + `dependencies: ['setup']`. Las mismas técnicas de widgets que practicaste aquí correrán más rápido, sin repetir el login en cada TC.
