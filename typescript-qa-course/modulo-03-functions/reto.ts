// ============================================================
// 🚩 Reto QA - Módulo 3: "The Validation Script"
// ============================================================
// Instrucciones:
// Crea una función llamada "validateApiResponse" según las reglas de abajo.
// Ejecuta con: pnpm tsx modulo-03-functions/reto.ts
// ============================================================

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

