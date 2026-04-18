# 🚩 Reto — Módulo 3: "The Validation Script"

> **Módulo 3 · Funciones**

> **Analogía QA:** vas a escribir el **validador** que decide si una respuesta de API pasó o falló — el corazón de cualquier test de contract.

---

## Instrucciones

Crea una función llamada `validateApiResponse` que:

1. Reciba un parámetro **obligatorio** `statusCode` de tipo `number`.
2. Reciba un parámetro **opcional** `errorMessage` de tipo `string`.
3. Retorne un `boolean`.

**Lógica esperada:**
- Si `statusCode === 200`: imprime `"Test Passed"` y retorna `true`.
- En cualquier otro caso: imprime el `errorMessage` (o `"Unknown error"` si no se proporcionó) y retorna `false`.

**Casos de prueba obligatorios:**
- `validateApiResponse(200)`
- `validateApiResponse(404, "Resource not found")`
- `validateApiResponse(500)`

---

## Plantilla

```ts
// @file modulo-03-functions/reto.ts
// 🚩 Reto QA - Módulo 3: "The Validation Script"

// TODO 1: Crea la función "validateApiResponse" que:
//   - Reciba un parámetro obligatorio "statusCode" (number)
//   - Reciba un parámetro opcional "errorMessage" (string)
//   - Retorne un boolean
//
// Lógica:
//   - Si statusCode es 200, imprime "Test Passed" y retorna true
//   - Si no, imprime el errorMessage (o "Unknown error" si no se proporcionó)
//     y retorna false


// TODO 2: Prueba tu función con estos casos:
//   - validateApiResponse(200)
//   - validateApiResponse(404, "Resource not found")
//   - validateApiResponse(500)
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-03-functions/reto.ts
```

**Output esperado:**

```bash
Test Passed
Resource not found
Unknown error
```

---

## Checklist de auto-corrección

- [ ] La firma declara los tipos: `statusCode: number`, `errorMessage?: string`, retorno `boolean`.
- [ ] El parámetro opcional lleva `?` y va **al final**.
- [ ] Usas un `if / else` (o ternario) para decidir `true` vs. `false`.
- [ ] Cuando `errorMessage` es `undefined`, el mensaje default es `"Unknown error"`.
- [ ] Los tres casos de prueba se ejecutan y muestran el output esperado.

---

## Pistas (sólo si te atoras)

<details>
<summary>Ver pistas</summary>

- El fallback para un opcional se puede escribir con `??`: `const msg = errorMessage ?? "Unknown error";`.
- Firma completa: `function validateApiResponse(statusCode: number, errorMessage?: string): boolean { ... }`.
- Dentro de la función, `errorMessage` tiene tipo `string | undefined` — por eso necesitas el fallback.

</details>

---

⬅️ Anterior: [3.5 funciones void](/docs/typescript/m3-void-functions)
