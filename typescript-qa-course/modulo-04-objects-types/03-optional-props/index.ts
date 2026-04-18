// ============================================================
// Mini-clase 4.3: Propiedades opcionales
// ============================================================
// Demo: importa el bug tipado y lo imprime.
// El operador "??" da un valor default cuando assignee es undefined.
// ============================================================

import { bug } from "./bugs";

console.log("\n===== 4.3 propiedades opcionales =====");
console.log(`Bug #${bug.id}: ${bug.title} [${bug.severity}]`);
console.log(`Asignado a: ${bug.assignee ?? "sin asignar"}`);
