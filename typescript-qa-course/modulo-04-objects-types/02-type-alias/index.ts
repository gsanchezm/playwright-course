// ============================================================
// Mini-clase 4.2: type alias (crear un "molde" reutilizable)
// ============================================================
// Analogía: Definir tu propio esquema, como las columnas de una
// tabla en una base de datos de usuarios de prueba.
//
// Este archivo es la "demo": importa el type y los datos desde
// los archivos vecinos y los usa.
// ============================================================

import { adminUser, viewerUser } from "./test-users";

console.log("\n===== 4.2 type alias =====");
console.log(`Admin: ${adminUser.username}, Active: ${adminUser.isActive}`);
console.log(`Viewer: ${viewerUser.username}, Active: ${viewerUser.isActive}`);
