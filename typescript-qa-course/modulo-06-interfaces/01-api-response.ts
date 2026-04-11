// ============================================================
// Mini-clase 6.1: Interfaz básica (ApiResponse)
// ============================================================
// Analogía: el contrato Swagger del endpoint. La interfaz nos
// permite tipar tanto la respuesta esperada como el helper de
// aserciones que usamos en el test.
// ============================================================

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

console.log("\n===== 6.1 interface ApiResponse =====");

// TEST: POST /login debe responder 200 con un token
const loginResponse: ApiResponse = loginRequest(
  "qa@test.com",
  "Password123!"
);

assertStatus(loginResponse, 200);
console.log(`Body recibido: ${loginResponse.body}`);
console.log(
  `Content-Type: ${loginResponse.headers?.["content-type"] ?? "n/a"}`
);
