// ============================================================
// Mini-clase 4.2: type alias (crear un "molde" reutilizable)
// ============================================================
// Analogía: Definir tu propio esquema, como las columnas de una
// tabla en una base de datos de usuarios de prueba.
// ============================================================

// "export type" permite que OTROS archivos usen este molde.
export type TestUser = {
  username: string;
  password: string;
  isActive: boolean;
};

export const adminUser: TestUser = {
  username: "admin@test.com",
  password: "SecurePass123!",
  isActive: true,
};

export const viewerUser: TestUser = {
  username: "viewer@test.com",
  password: "Viewer123!",
  isActive: false,
};

console.log("\n===== 4.2 type alias =====");
console.log(`Admin: ${adminUser.username}, Active: ${adminUser.isActive}`);
console.log(`Viewer: ${viewerUser.username}, Active: ${viewerUser.isActive}`);
