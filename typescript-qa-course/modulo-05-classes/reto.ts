// ============================================================
// 🚩 Reto QA - Módulo 5: "My First Page Object"
// ============================================================
// Instrucciones:
// Crea clases usando herencia para simular un Page Object Model.
// Ejecuta con: pnpm tsx modulo-05-classes/reto.ts
// ============================================================

// TODO 1: Crea una clase "BaseTest" que:
//   - Tenga una propiedad protegida "baseUrl" (string) asignada en el constructor
//   - Tenga un método "navigate(url: string): void" que imprima
//     "Navigating to: [url]"


// TODO 2: Crea una clase "SearchTest" que herede de "BaseTest"
//   - Agrega una propiedad privada "searchButtonId" de tipo string
//     con valor "#search-btn"


// TODO 3: En "SearchTest", agrega un método público
//   "executeSearch(term: string): void" que:
//   - Use el método heredado "navigate" para ir a baseUrl
//   - Imprima "Searching for [term] using button [searchButtonId]"


// TODO 4: Crea una instancia de SearchTest y ejecuta una búsqueda
// Ejemplo:
//   const search = new SearchTest("https://qa.store.com");
//   search.executeSearch("laptop");

