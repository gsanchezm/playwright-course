// ============================================================
// Mini-clase 3.2: Parámetros opcionales con "?"
// ============================================================
// Analogía: Un checkbox "Remember me" que puede estar o no.
// Reutilizamos la validación básica del archivo 01.
// ============================================================

import { login } from "./01-login";

// El "?" hace que "rememberMe" sea opcional al llamar la función.
export function loginWithOptions(
  username: string,
  password: string,
  rememberMe?: boolean
): boolean {
  console.log(`Logging in as: ${username}`);

  if (rememberMe) {
    console.log("Remember me: enabled");
  }

  // Reutilizamos login() del archivo anterior en vez de duplicar la lógica.
  return login(username, password);
}

console.log("\n===== 3.2 parámetros opcionales =====");
loginWithOptions("admin", "Test1234!");          // sin "remember me"
loginWithOptions("admin", "Test1234!", true);    // con "remember me"
