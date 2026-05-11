# 🚩 Reto M6 — "The Automation Contract"

> **Módulo 6 · Interfaces**

> **Objetivo:** consolidar todo lo aprendido del módulo creando interfaces y clases que las implementen. Tu test debe depender **del contrato**, no de la herramienta.

---

## Instrucciones

Trabaja sobre `modulo-06-interfaces/reto.ts` y ejecútalo con:

```bash
$ pnpm tsx modulo-06-interfaces/reto.ts
```

---

## TODOs

### TODO 1 — Define el contrato `WebActions`

Crea una interfaz `WebActions` con los métodos:

- `click(element: string): void`
- `getText(element: string): string`

---

### TODO 2 — Implementa el contrato con `PlaywrightHelper`

Crea una clase `PlaywrightHelper` que **implemente** la interfaz `WebActions`:

- `click` debe imprimir: `Simulating click in Playwright on: [element]`
- `getText` debe imprimir: `Getting text in Playwright from: [element]` y retornar un string.

---

### TODO 3 — Úsalo

Crea una instancia de `PlaywrightHelper` y prueba ambos métodos:

```ts
const pw = new PlaywrightHelper();
pw.click("#login-btn");
const title = pw.getText("#page-title");
```

---

### Extras

**TODO 4** — Crea una interfaz `UserResponse` con:

- `id: number`
- `token: string`

**TODO 5** — Crea una función `startSession` que reciba un objeto de tipo `UserResponse` e imprima:

```
Session started with token: [token]
```

**TODO 6** — Prueba la función con un objeto que cumpla la interfaz:

```ts
startSession({ id: 1, token: "abc123xyz" });
```

---

## Pistas

- `class X implements Y` → la clase debe definir **todos** los métodos de la interfaz.
- Para tipar el parámetro de `startSession`, usa `(user: UserResponse): void`.
- Si el compilador no se queja, es buena señal — significa que tu código cumple el contrato.

---

## ¿Y ahora qué?

¡Felicidades, terminaste el curso de TypeScript para QA! 🎉 Ya tienes la base para entrar al **curso de Playwright**, donde aplicarás todo esto (clases, interfaces, types, async/await) sobre una aplicación real.

---

⬅️ Anterior: [6.4 Interfaz para funciones](/docs/typescript/m6-assertion-fn)
