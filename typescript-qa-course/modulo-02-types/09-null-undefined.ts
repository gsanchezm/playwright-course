// ============================================================
// Mini-clase 2.9: null y undefined
// ============================================================
// Analogía:
//   - null: Un campo que intencionalmente dejaste vacío.
//   - undefined: Un campo al que olvidaste asignarle valor.
// ============================================================
console.log("\n===== 2.9 null y undefined =====");

// El tipo "string | null" significa: puede ser un string O null.
let screenshot: string | null = null; // todavía no se tomó la captura
console.log(`Screenshot: ${screenshot}`);

// Después de tomar la captura, asignamos la ruta.
screenshot = "/tmp/screenshot-001.png";
console.log(`Screenshot actual: ${screenshot}`);

// undefined: la variable existe pero no tiene valor asignado.
let uninitializedValue: string | undefined = undefined;
console.log(`Sin inicializar: ${uninitializedValue}`);

// --- Nota sobre "never" (concepto avanzado) ---
// El tipo "never" representa algo que NUNCA debe ocurrir,
// como una función que siempre lanza un error:
//   function fatalError(msg: string): never { throw new Error(msg); }
