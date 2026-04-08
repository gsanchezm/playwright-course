// ============================================================
// Mini-clase 6.1: Interfaz básica (ApiResponse)
// ============================================================
// Analogía: El contrato Swagger de un endpoint. Define qué campos
// debe tener una respuesta de API.
// ============================================================

export interface ApiResponse {
  status: number;
  body: string;
  headers?: Record<string, string>; // opcional
}

export const response: ApiResponse = {
  status: 200,
  body: '{"message": "OK"}',
};

console.log("\n===== 6.1 interfaz básica =====");
console.log(`API Response: ${response.status} - ${response.body}`);
