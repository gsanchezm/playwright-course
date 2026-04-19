# Módulo 6 — Codegen: grabar specs contra OmniPizza

> **Historia del curso:** hasta M5 escribiste tests a mano. Hoy conoces al **codegen** — Playwright graba tus interacciones con OmniPizza y te entrega código listo para pegar y **refactorizar**.
>
> **Referencia oficial:** [Codegen Intro](https://playwright.dev/docs/codegen-intro) · [Codegen](https://playwright.dev/docs/codegen)

---

## Analogía

Codegen = grabar un "video" de tu sesión manual, pero en vez de un video obtienes **código TypeScript** listo para correr.

| Antes | Con codegen |
|---|---|
| Abres navegador | Abres `pnpm codegen` |
| Haces click | Haces click |
| Escribes | Escribes |
| Documentas en Word | Playwright genera el código |

---

## Comando del curso

El script `codegen` del `package.json` ya apunta a OmniPizza:

```bash
pnpm codegen
# ≡ playwright codegen https://omnipizza-frontend.onrender.com
```

Abre 2 ventanas:
- **Izquierda** → Chromium en OmniPizza.
- **Derecha** → Inspector con código TypeScript generándose en vivo.

---

## Flujo recomendado para este módulo

1. Arranca `pnpm codegen`.
2. En la ventana izquierda:
   - Click en `standard_user` en la sección Quick Login.
   - Click en **Sign In**.
   - En `/catalog`, click en el primer botón **Add to Cart** de cualquier pizza.
   - (Opcional) personaliza tamaño/toppings y confirma.
3. Mira el Inspector — tu test ya está casi escrito.
4. Usa el botón **Assert visibility** del Inspector y click sobre el logo de OmniPizza en el navbar: te genera `expect(page.getByAltText('OmniPizza')).toBeVisible()`.
5. Copia el código al portapapeles.
6. Pégalo en un archivo `modulo-06-codegen/grabado.spec.ts`.

---

## Otros flags útiles

```bash
# Grabar en Firefox
pnpm exec playwright codegen --browser=firefox https://omnipizza-frontend.onrender.com

# Emular un iPhone 13
pnpm exec playwright codegen --device="iPhone 13" https://omnipizza-frontend.onrender.com
# ⚠️ En mobile, los testids usan sufijo "-responsive" en vez de "-desktop"

# Grabar y guardar directo a archivo
pnpm exec playwright codegen --output=grabado.spec.ts https://omnipizza-frontend.onrender.com

# Generar en otro lenguaje
pnpm exec playwright codegen --target=python https://omnipizza-frontend.onrender.com
```

---

## ⚠️ Codegen genera código bruto — refactorizar es obligatorio

Lo que codegen te da es un **primer borrador**. Siempre:

1. **Renombra el test** — "test" por un nombre descriptivo.
2. **Usa fixtures** (M5) — reemplaza el login hardcoded por `authenticatedPage`.
3. **Mejora locators** — si codegen generó `getByText('Sign In')`, cámbialo a `getByRole('button', { name: /sign in/i })` (más semántico).
4. **Agrega assertions significativas** — no solo `toBeVisible`, también `toHaveURL`, `toHaveText`, etc.
5. **Parametriza** si el test se repetirá con distintos datos.

### Ejemplo: antes de refactorizar

```ts
// Generado por codegen
import { test } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://omnipizza-frontend.onrender.com/');
  await page.getByTestId('user-standard_user').click();
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.getByTestId('add-to-cart-p01-desktop').click();
});
```

### Después de refactorizar

```ts
import { test, expect } from './fixtures/auth'; // importas authenticatedPage de M5

test.describe('Agregar pizza al carrito', () => {
  test('agregar la primera pizza del catálogo @smoke', async ({ authenticatedPage: page }) => {
    const firstAddButton = page.locator('[data-testid^="add-to-cart-"]').first();
    await firstAddButton.click();
    await expect(page.getByTestId('nav-cart-count')).toContainText('1');
  });
});
```

Misma intención — código 5× más limpio, reusa lo que ya construiste.

---

## Workflow recomendado

1. `pnpm codegen` — graba el flujo.
2. Pega el código en un `.spec.ts` en la carpeta apropiada (`smoke/`, `regression/`).
3. Refactoriza: locators, fixtures, parametrización, assertions.
4. Corre en UI mode — `pnpm test:ui` — para verificar.
5. Si pasa, commit.

➡️ [reto.md](./reto.md) · [Módulo 7 — Reports](../modulo-07-reports/)
