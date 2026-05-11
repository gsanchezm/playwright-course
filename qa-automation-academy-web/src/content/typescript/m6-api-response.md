# 6.1 — `interface ApiResponse` (contrato de respuesta HTTP)

> **Módulo 6 · Interfaces**

> **Analogía QA:** una **interfaz** es el **contrato Swagger** del endpoint. Define qué campos debe tener la respuesta antes de que el test la consuma; si el backend cambia el contrato, el compilador te avisa **antes** de correr el test.

---

## ¿Qué aprendes?

- Cómo declarar una `interface` con propiedades **obligatorias** y **opcionales** (`?`).
- Cómo usar la interfaz para tipar tanto la **respuesta real** como el **helper de aserción**.
- `Record<string, string>` para representar headers HTTP.

---

## Código

```ts
// @file modulo-06-interfaces/01-api-response.ts
export interface ApiResponse {
  status: number;
  body: string;
  headers?: Record<string, string>;
}

// Simulamos la llamada HTTP que haría Playwright / supertest / axios.
function loginRequest(email: string, _password: string): ApiResponse {
  return {
    status: 200,
    body: JSON.stringify({ token: "abc.def.ghi", user: email }),
    headers: { "content-type": "application/json" },
  };
}

// Helper de aserción: recibe CUALQUIER objeto que cumpla ApiResponse.
// Si la respuesta real no cumple el contrato, TypeScript lo marca
// antes de correr el test.
function assertStatus(response: ApiResponse, expected: number): void {
  const passed = response.status === expected;
  const label = passed ? "PASSED" : "FAILED";
  console.log(`[${label}] status ${response.status} === ${expected}`);
}

// TEST: POST /login debe responder 200 con un token
const loginResponse: ApiResponse = loginRequest("qa@test.com", "Password123!");

assertStatus(loginResponse, 200);
console.log(`Body recibido: ${loginResponse.body}`);
console.log(`Content-Type: ${loginResponse.headers?.["content-type"] ?? "n/a"}`);
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-06-interfaces/01-api-response.ts
```

---

## Qué observar

- `headers?` con el `?` indica que el campo es **opcional**: el test debe usar `?.` (optional chaining) para leerlo de forma segura.
- `assertStatus` recibe `ApiResponse`. Si pasaras un objeto sin `status` o sin `body`, **el código no compila** — no esperas hasta el runtime para descubrir el bug.
- El contrato vive **junto al test**, así que cuando alguien cambia la firma de `loginRequest` los errores aparecen al instante.

---

⬅️ Anterior: [🚩 Reto M5](/docs/typescript/m5-reto) · ➡️ Siguiente: [6.2 Interfaces anidadas](/docs/typescript/m6-product-list)
