// ============================================================
// Mini-clase 3.3: Parámetros con valor por defecto
// ============================================================
// Analogía: La mayoría de tus pruebas apuntan al mismo ambiente
// (QA), así que lo ponemos como valor por defecto.
// ============================================================

export function navigateTo(
  path: string,
  baseUrl: string = "https://qa.myapp.com"
): string {
  const fullUrl = `${baseUrl}${path}`;
  console.log(`Navigating to: ${fullUrl}`);
  return fullUrl;
}

console.log("\n===== 3.3 valores por defecto =====");
navigateTo("/login");                                  // URL por defecto (QA)
navigateTo("/login", "https://staging.myapp.com");     // URL personalizada
