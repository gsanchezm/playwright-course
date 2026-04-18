# 3.3 — Parámetros con valor por defecto

> **Módulo 3 · Funciones**

> **Analogía QA:** la mayoría de tus pruebas apuntan al mismo ambiente (**QA**), así que lo ponemos como valor por defecto. Solo pasas el `baseUrl` cuando quieres probar contra **staging** o **prod**.

---

## ¿Qué aprendes?

- Cómo definir un **valor por defecto** para un parámetro.
- La diferencia con `?` (opcional): el default **siempre tiene valor**; el opcional puede ser `undefined`.

---

## Código

```ts
// @file modulo-03-functions/03-navigate.ts
export function navigateTo(
  path: string,
  baseUrl: string = "https://qa.myapp.com"
): string {
  const fullUrl = `${baseUrl}${path}`;
  console.log(`Navigating to: ${fullUrl}`);
  return fullUrl;
}

navigateTo("/login");                                  // URL por defecto (QA)
navigateTo("/login", "https://staging.myapp.com");     // URL personalizada
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-03-functions/03-navigate.ts
```

---

## Qué observar

- `baseUrl: string = "..."` es **siempre un string**, nunca `undefined`. No necesitas chequearlo dentro de la función.
- Compara con `?`: `baseUrl?: string` te daría `string | undefined` y tendrías que manejar el caso vacío.
- Patrón típico en automatización: default al ambiente más usado, override por parámetro (o variable de entorno) cuando el test lo requiera.

---

⬅️ Anterior: [3.2 parámetros opcionales](/docs/typescript/m3-login-options) · ➡️ Siguiente: [3.4 arrow functions](/docs/typescript/m3-arrow-functions)
