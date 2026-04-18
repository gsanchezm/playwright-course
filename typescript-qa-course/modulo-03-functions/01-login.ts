// ============================================================
// Mini-clase 3.1: Función básica con parámetros obligatorios
// ============================================================
// Analogía: Un "Step" de tu caso de prueba que siempre necesita
// los mismos datos (usuario y contraseña) para ejecutarse.
// ============================================================

// ⚠️ NOTA: Las credenciales están hardcoded solo con fines didácticos.
// En la vida real se usan variables de entorno o fixtures.
const VALID_USER = "admin";
const VALID_PASS = "Test1234!";

// "export" hace que esta función pueda ser usada desde OTROS archivos.
export function login(username: string, password: string): boolean {
  // Forma tradicional usando if/else
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
  
  // (condición ? caso_verdadero : caso_falso)
  console.log(isSuccess ? `Ternary Login successful: ${username}` : `Ternary Login failed: ${username}`);
  
  return isSuccess;
}

// Demo (se ejecuta al importar o al correr este archivo directamente)
console.log("\n===== 3.1 función básica login() =====");
const loginDemo1 = login("admin", "Test1234!");
const loginDemo2 = login("guest", "wrong");
console.log(`Result 1: ${loginDemo1}, Result 2: ${loginDemo2}`);
