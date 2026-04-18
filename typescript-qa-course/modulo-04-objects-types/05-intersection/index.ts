// ============================================================
// Mini-clase 4.5: Intersection Types ( & )
// ============================================================
// Analogía: Combinar dos contratos: "es un BugReport" Y TAMBIÉN
// "tiene timestamps". Reutilizamos BugReport de la mini-clase 4.3.
// ============================================================

import { trackedBug } from "./tracked-bugs";

console.log("\n===== 4.5 intersection types =====");
console.log(`Tracked bug: #${trackedBug.id}`);
console.log(`Creado: ${trackedBug.createdAt}`);
console.log(`Actualizado: ${trackedBug.updatedAt}`);
