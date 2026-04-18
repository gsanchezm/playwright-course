# 3.2 — Parámetros opcionales con `?`

> **Módulo 3 · Funciones**

> **Analogía QA:** un checkbox **"Remember me"** que puede estar o no marcado. El test sigue funcionando aunque no le pases ese dato.

---

## ¿Qué aprendes?

- Cómo marcar un parámetro como **opcional** con `?`.
- Cómo **importar** funciones exportadas desde otro archivo del módulo.
- Por qué reutilizar lógica existente es mejor que duplicarla.

---

## Código

```ts
// @file modulo-03-functions/02-login-options.ts
import { login } from "./01-login";

// El "?" hace que "rememberMe" sea opcional al llamar la función.
export function loginWithOptions(
  username: string,
  password: string,
  rememberMe?: boolean
): boolean {
  console.log(`Logging in as: ${username}`);

  if (rememberMe) {
    console.log("Remember me: enabled");
  }

  // Reutilizamos login() del archivo anterior en vez de duplicar la lógica.
  return login(username, password);
}

loginWithOptions("admin", "Test1234!");          // sin "remember me"
loginWithOptions("admin", "Test1234!", true);    // con "remember me"
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-03-functions/02-login-options.ts
```

---

## Qué observar

- Un parámetro opcional **siempre debe ir al final** de la lista; no puedes poner un obligatorio después de un `?`.
- Dentro de la función, `rememberMe` tiene tipo `boolean | undefined`. Por eso el `if (rememberMe)` funciona como guarda.
- El `import { login } from "./01-login"` es el mismo patrón que usarás en Playwright para importar **fixtures** o **helpers** compartidos.

---

⬅️ Anterior: [3.1 función login](/docs/typescript/m3-login) · ➡️ Siguiente: [3.3 valores por defecto](/docs/typescript/m3-navigate)
