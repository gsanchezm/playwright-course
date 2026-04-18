// ============================================================
// Módulo 5: Clases - Runner del Page Object Model
// ============================================================
// Page Object Model modular:
//   01-base-page.ts        ─ exporta BasePage (incluye getters/setters)
//   02-login-page.ts       ─ importa BasePage y extiende LoginPage
//   03-home-page.ts        ─ importa BasePage y extiende HomePage
//   04-getters-setters.ts  ─ demo de getters/setters heredados en POM
//
// Para correr una sola mini-clase:
//   pnpm tsx modulo-05-classes/02-login-page.ts
// ============================================================

import "./01-base-page";
import "./02-login-page";
import "./03-home-page";
import "./04-getters-setters";

// --- Material complementario (conceptos avanzados) ---
// Clases abstractas y constructores privados (Singleton) se ven
// en cursos más avanzados:
//
//   abstract class BrowserBase {
//     abstract click(selector: string): void;
//   }
//
//   class DatabaseConnection {
//     private static instance: DatabaseConnection;
//     private constructor() {}
//     static getInstance(): DatabaseConnection { ... }
//   }
