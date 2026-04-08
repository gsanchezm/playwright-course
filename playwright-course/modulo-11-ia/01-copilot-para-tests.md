# 11.1 — GitHub Copilot escribiendo tests

## ¿Qué es Copilot?

GitHub Copilot es una extensión de VS Code que sugiere código en tiempo real mientras escribes. Está entrenado con millones de repos públicos, incluidos miles de tests de Playwright.

## Instalación

1. Tener una cuenta de GitHub con suscripción a Copilot (hay versión gratuita para estudiantes).
2. En VS Code: extensiones → buscar "GitHub Copilot" → Install.
3. Sign in con tu cuenta de GitHub.

## Workflow recomendado

### Técnica 1: Escribe el nombre del test, deja que Copilot complete el cuerpo

```typescript
import { test, expect } from '@playwright/test';

test('user can add a todo to the list', async ({ page }) => {
  // [tab] → Copilot sugiere las siguientes 5 líneas automáticamente
});
```

Copilot leerá el nombre del test, importará el contexto y generará el código probable. **Tu trabajo es revisarlo y aceptarlo (Tab) o rechazarlo (Esc)**.

### Técnica 2: Comentarios como guía

```typescript
test('checkout flow', async ({ page }) => {
  // 1. Navigate to the products page
  // [tab] → genera la línea
  // 2. Add the first product to cart
  // [tab]
  // 3. Go to checkout
  // [tab]
  // 4. Fill billing info
  // [tab]
  // 5. Submit and verify confirmation page
  // [tab]
});
```

Los comentarios actúan como **especificación**. Copilot genera el código que cumple cada paso.

### Técnica 3: Page Object generado a partir de un HTML

Si pegas un fragmento de HTML como comentario, Copilot puede sugerir un Page Object completo:

```typescript
/*
HTML de la página de login:
<form>
  <label for="email">Email</label>
  <input id="email" type="email" />
  <label for="password">Password</label>
  <input id="password" type="password" />
  <button type="submit">Sign in</button>
</form>
*/

export class LoginPage {
  // [tab] → Copilot genera los locators y métodos basándose en el HTML
}
```

## Lo que Copilot hace BIEN

- Tests sencillos, repetitivos.
- Boilerplate de imports y setup.
- Page Objects basados en HTML conocido.
- Refactorings simples (renombrar, extraer método).
- Documentación de funciones.

## Lo que Copilot hace MAL

- Tests con lógica de negocio compleja que tú entiendes pero el código no.
- Selectores en apps con clases CSS aleatorias (Tailwind, CSS modules).
- Aserciones significativas (suele poner `toBeVisible()` para todo).
- Decidir QUÉ probar.

## Regla de oro

> **Copilot es un junior. Tú eres el senior. Revisa cada línea antes de aceptarla.**

Si aceptas código que no entiendes, ese código será un misterio cuando falle en CI a las 11 PM.
