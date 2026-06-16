// ============================================================
// 🚩 Reto QA — Módulo 3: "Parsea la línea de log"
// ============================================================
// Instrucciones:
//   1. Tienes UNA línea de log de ejecución de prueba (LINEA_LOG_TEST).
//      Tu trabajo: extraer TODOS sus campos a un objeto TIPADO usando
//      GRUPOS NOMBRADOS (?<nombre>...).
//   2. Reemplaza el placeholder `const reLog = /CAMBIAME/;` por tu regex
//      con un grupo nombrado por cada campo del objeto:
//        timestamp, archivo, linea, nombre, duracionMs, status
//   3. Ejecuta:  pnpm tsx modulo-03-grupos-captura/reto.ts
//
//   Es ESPERADO que veas ❌ hasta que completes la regex (con /CAMBIAME/
//   no matchea nada y el objeto sale en null). El objetivo: que el check
//   final muestre ✅, es decir, que tu objeto parseado sea EXACTAMENTE el
//   objeto esperado de abajo.
//
//   Pistas (mira la forma de la línea más abajo):
//     - timestamp  → ISO con Z:        \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z
//     - archivo    → ruta .ts tras "test=":   checkout.spec.ts
//     - linea      → el número tras "archivo:":  42   (¡castéalo a Number!)
//     - nombre     → lo que va entre comillas simples tras "name="
//     - duracionMs → el número antes de "ms" tras "duration="  (Number)
//     - status     → la palabra tras "status="  (failed / passed)
//     - Recuerda: .groups puede ser undefined → GUÁRDALO antes de leerlo.
//     - Para "lo que está entre comillas", piensa en [^']+ (no en .*).
// ============================================================
import { check } from "../helpers/check";
import { LINEA_LOG_TEST } from "../data/samples";

console.log("\n===== 🚩 Reto 3: Parsea la línea de log =====");

// La línea a parsear (de data/samples.ts):
//   "2026-06-16T14:30:03Z [ERROR] test=checkout.spec.ts:42 name='checkout flow' duration=1530ms status=failed"
console.log("Línea:", LINEA_LOG_TEST);

// El objeto TIPADO que tu parser debe producir.
interface LogTest {
  timestamp: string;
  archivo: string;
  linea: number;
  nombre: string;
  duracionMs: number;
  status: string;
}

// ------------------------------------------------------------
// TODO: reemplaza /CAMBIAME/ por tu regex con grupos nombrados.
//   Debe tener: (?<timestamp>...) (?<archivo>...) (?<linea>...)
//               (?<nombre>...) (?<duracionMs>...) (?<status>...)
// ------------------------------------------------------------
const reLog = /CAMBIAME/; // TODO: completa esta regex con 6 grupos nombrados

// El parser: convierte la línea en LogTest, o null si no matcheó.
// (No necesitas tocar esto; solo arreglar la regex de arriba.)
function parseLineaLog(linea: string): LogTest | null {
  const m = linea.match(reLog);
  // Doble guarda: match puede ser null y .groups puede ser undefined.
  if (!m || !m.groups) return null;
  const g = m.groups;
  return {
    timestamp: g.timestamp,
    archivo: g.archivo,
    linea: Number(g.linea),
    nombre: g.nombre,
    duracionMs: Number(g.duracionMs),
    status: g.status,
  };
}

// El objeto ESPERADO (razonado leyendo la línea de log).
const esperado: LogTest = {
  timestamp: "2026-06-16T14:30:03Z",
  archivo: "checkout.spec.ts",
  linea: 42,
  nombre: "checkout flow",
  duracionMs: 1530,
  status: "failed",
};

// Mientras reLog sea /CAMBIAME/, parseLineaLog devuelve null → este check
// mostrará ❌. Cuando tu regex esté completa y correcta, mostrará ✅.
const obtenido = parseLineaLog(LINEA_LOG_TEST);
check("objeto LogTest parseado", obtenido, esperado);

if (obtenido === null) {
  console.log(
    "ℹ️  Aún en /CAMBIAME/: el match dio null. Completa el TODO de arriba " +
      "con tu regex de 6 grupos nombrados para que el check pase a ✅."
  );
}
