// ============================================================
// Mini-clase 5.1: BasePage (clase base del Page Object Model)
// ============================================================
// Analogía: La clase padre de todas las páginas de tu app.
// Contiene la lógica común: navegar, esperar a que cargue, etc.
// ============================================================

// "protected" hace que las clases hijas (LoginPage, HomePage)
// puedan acceder a baseUrl, pero el código externo no.
export class BasePage {
  // Forma corta: declarar la propiedad en el constructor.
  constructor(protected baseUrl: string) {}

  navigate(path: string): void {
    console.log(`Navigating to: ${this.baseUrl}${path}`);
  }

  waitForLoad(): void {
    console.log("Waiting for page to load...");
  }
}

console.log("\n===== 5.1 BasePage =====");
const basePageDemo = new BasePage("https://qa.myapp.com");
basePageDemo.navigate("/");
basePageDemo.waitForLoad();
