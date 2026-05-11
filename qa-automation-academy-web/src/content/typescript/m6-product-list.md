# 6.2 — Interfaces anidadas (`TestRunResponse`)

> **Módulo 6 · Interfaces**

> **Analogía QA:** un **reporte de ejecución de pruebas**. La interfaz tipa los casos de prueba ejecutados **y** los metadatos del reporte (paginación), para que el compilador detecte cualquier cambio en el contrato antes de que rompa tus asserts.

---

## ¿Qué aprendes?

- Cómo **componer interfaces**: una interfaz puede tener arreglos (`TestCase[]`) y objetos anidados (`pagination`).
- Cómo usar **string literal types** (`"passed" | "failed" | "skipped"`) para restringir los valores válidos de un campo.
- Cómo el contrato te ayuda a recorrer los datos y aserciones de forma segura.

---

## Código

```ts
// @file modulo-06-interfaces/02-product-list.ts
export interface TestCase {
  id: number;
  title: string;
  status: "passed" | "failed" | "skipped";
  durationMs: number;
}

export interface TestRunResponse {
  status: number;
  suite: string;
  data: TestCase[];
  pagination: {
    page: number;
    totalPages: number;
  };
}

// Simula GET /test-runs/login-smoke?page=1
function fetchTestRunReport(): TestRunResponse {
  return {
    status: 200,
    suite: "Login smoke tests",
    data: [
      { id: 101, title: "usuario valido puede iniciar sesion", status: "passed", durationMs: 820 },
      { id: 102, title: "password incorrecto muestra mensaje de error", status: "passed", durationMs: 640 },
    ],
    pagination: { page: 1, totalPages: 5 },
  };
}

const expectedTestCases: TestCase[] = [
  { id: 101, title: "usuario valido puede iniciar sesion", status: "passed", durationMs: 820 },
  { id: 102, title: "password incorrecto muestra mensaje de error", status: "passed", durationMs: 640 },
];

const actual = fetchTestRunReport();

// Assert #1: status code
console.log(actual.status === 200 ? "[PASSED] responde 200" : `[FAILED] responde ${actual.status}`);

// Assert #2: cada caso esperado aparece en el reporte real.
expectedTestCases.forEach((expected) => {
  const match = actual.data.find((p) => p.id === expected.id);
  const ok =
    match !== undefined &&
    match.title === expected.title &&
    match.status === expected.status &&
    match.durationMs === expected.durationMs;
  console.log(ok ? `[PASSED] test case #${expected.id}` : `[FAILED] test case #${expected.id}`);
});

// Assert #3: paginación del reporte
console.log(`[INFO] Suite: ${actual.suite} | pagina ${actual.pagination.page} de ${actual.pagination.totalPages}`);
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-06-interfaces/02-product-list.ts
```

---

## Qué observar

- `status: "passed" | "failed" | "skipped"` impide que alguien escriba `"PASSED"` (mayúsculas) o `"ok"` por accidente: el compilador rechaza cualquier valor fuera de esa lista.
- `pagination` está declarado **inline** dentro de `TestRunResponse`. Si lo vas a reutilizar en otros endpoints, conviene extraerlo a su propia interfaz `Pagination`.
- `find()` + comparación campo por campo es el patrón clásico de aserción de listas en QA, y aquí queda **tipado de extremo a extremo**.

---

⬅️ Anterior: [6.1 ApiResponse](/docs/typescript/m6-api-response) · ➡️ Siguiente: [6.3 implements WebActions](/docs/typescript/m6-web-actions)
