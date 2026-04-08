// ============================================================
// Mini-clase 6.4: Interfaz para funciones
// ============================================================
// Analogía: Obligar a que toda función de aserción reciba SIEMPRE
// la misma firma: (actual, expected) => boolean.
// ============================================================

export interface AssertionFn {
  (actual: string, expected: string): boolean;
}

// La arrow function cumple el contrato de AssertionFn.
export const expectToEqual: AssertionFn = (actual, expected) => {
  const passed = actual === expected;
  console.log(
    `Assert: "${actual}" === "${expected}" → ${passed ? "PASSED" : "FAILED"}`
  );
  return passed;
};

console.log("\n===== 6.4 interfaz para funciones =====");
expectToEqual("Hello", "Hello");
expectToEqual("200", "201");
