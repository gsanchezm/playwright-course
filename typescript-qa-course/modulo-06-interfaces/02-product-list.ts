// ============================================================
// Mini-clase 6.2: Interfaces anidadas (reporte de pruebas + paginación)
// ============================================================
// Analogía: un reporte de ejecución de pruebas. La interfaz tipa
// tanto los casos de prueba ejecutados como la paginación del
// reporte, para que el compilador nos avise si el contrato cambia.
// ============================================================

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

// Simula GET /test-runs/login-smoke?page=1 (reemplaza por tu cliente real).
function fetchTestRunReport(): TestRunResponse {
  return {
    status: 200,
    suite: "Login smoke tests",
    data: [
      {
        id: 101,
        title: "usuario valido puede iniciar sesion",
        status: "passed",
        durationMs: 820,
      },
      {
        id: 102,
        title: "password incorrecto muestra mensaje de error",
        status: "passed",
        durationMs: 640,
      },
    ],
    pagination: { page: 1, totalPages: 5 },
  };
}

// Datos esperados del reporte - tambien tipados con TestCase.
const expectedTestCases: TestCase[] = [
  {
    id: 101,
    title: "usuario valido puede iniciar sesion",
    status: "passed",
    durationMs: 820,
  },
  {
    id: 102,
    title: "password incorrecto muestra mensaje de error",
    status: "passed",
    durationMs: 640,
  },
];

console.log("\n===== 6.2 interfaces anidadas =====");

const actual = fetchTestRunReport();

// Assert #1: status code
console.log(
  actual.status === 200
    ? "[PASSED] GET /test-runs/login-smoke responde 200"
    : `[FAILED] GET /test-runs/login-smoke responde ${actual.status}`
);

// Assert #2: cada caso esperado aparece en el reporte real.
expectedTestCases.forEach((expected) => {
  const match = actual.data.find((p) => p.id === expected.id);
  const ok =
    match !== undefined &&
    match.title === expected.title &&
    match.status === expected.status &&
    match.durationMs === expected.durationMs;

  console.log(
    ok
      ? `[PASSED] test case #${expected.id} (${expected.title})`
      : `[FAILED] test case #${expected.id} no coincide`
  );
});

// Assert #3: paginación del reporte
console.log(
  `[INFO] Suite: ${actual.suite} | pagina ${actual.pagination.page} de ${actual.pagination.totalPages}`
);
