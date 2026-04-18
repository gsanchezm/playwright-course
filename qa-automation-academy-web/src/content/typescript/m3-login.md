# 3.1 — Función básica con parámetros obligatorios

> **Módulo 3 · Funciones**

> **Analogía QA:** una función es un **step** de tu caso de prueba que siempre necesita los mismos datos (usuario y contraseña) para ejecutarse. Declarar los tipos de los parámetros es como definir qué espera recibir el step en un framework BDD.

---

## ¿Qué aprendes?

- Cómo declarar una función con **parámetros tipados** y un **tipo de retorno** explícito.
- Qué significa `export` y por qué permite reutilizar la función desde otros archivos.
- El patrón `if/else` vs. el **operador ternario** para retornar un booleano.

---

## Código

```ts
// @file modulo-03-functions/01-login.ts
// ⚠️ NOTA: Las credenciales están hardcoded solo con fines didácticos.
// En la vida real se usan variables de entorno o fixtures.
const VALID_USER = "admin";
const VALID_PASS = "Test1234!";

// "export" hace que esta función pueda ser usada desde OTROS archivos.
export function login(username: string, password: string): boolean {
  if (username === VALID_USER && password === VALID_PASS) {
    console.log(`Login successful for user: ${username}`);
    return true;
  } else {
    console.log(`Login failed for user: ${username}`);
    return false;
  }
}

// Forma simplificada usando Operador Ternario
export function loginTernary(username: string, password: string): boolean {
  const isSuccess = username === VALID_USER && password === VALID_PASS;
  console.log(
    isSuccess
      ? `Ternary Login successful: ${username}`
      : `Ternary Login failed: ${username}`
  );
  return isSuccess;
}

const loginDemo1 = login("admin", "Test1234!");
const loginDemo2 = login("guest", "wrong");
console.log(`Result 1: ${loginDemo1}, Result 2: ${loginDemo2}`);
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-03-functions/01-login.ts
```

---

## Qué observar

- La firma `(username: string, password: string): boolean` es el **contrato** de la función: entradas y salida tipadas.
- Si omites un parámetro o pasas un número donde espera un string, TypeScript te avisa **antes** de ejecutar el test.
- `export function` permite que `02-login-options.ts` y `05-void-functions.ts` **reutilicen** esta lógica en lugar de duplicarla.

---

⬅️ Anterior: [🚩 Reto M2](/docs/typescript/m2-reto) · ➡️ Siguiente: [3.2 parámetros opcionales](/docs/typescript/m3-login-options)
