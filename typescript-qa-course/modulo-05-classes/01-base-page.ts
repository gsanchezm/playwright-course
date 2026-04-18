// ============================================================
// Mini-clase 5.1: BasePage (clase base del Page Object Model)
// ============================================================
// Analogía: La clase padre de todas las páginas de tu app.
// Contiene la configuración común (URL, timeout) y la lógica
// compartida: navegar, esperar a que cargue, etc.
//
// Además de métodos y propiedades, aquí introducimos dos patrones
// clave que usarás en Page Objects reales:
//
//   • Getter de SOLO LECTURA (baseUrl): expone el dato sin dejar
//     que lo sobrescriban desde fuera.
//   • Getter + Setter con VALIDACIÓN (timeout): intercepta la
//     asignación para rechazar valores inválidos.
//
// LoginPage y HomePage heredan estos getters/setters sin escribir
// una sola línea extra — así se integra el concepto con el POM.
// ============================================================

export class BasePage {
  // "_baseUrl" es privado (convención: guion bajo).
  // "protected" permite a las hijas leerlo internamente si lo
  // necesitan; al público solo lo exponemos vía el getter `baseUrl`.
  protected _baseUrl: string;

  // Timeout por defecto (ms). Privado — se lee/escribe por el
  // getter/setter para aplicar validación.
  private _timeout: number = 30000;

  constructor(baseUrl: string) {
    this._baseUrl = baseUrl;
  }

  // Getter SIN setter → la propiedad es de solo lectura desde fuera.
  // basePage.baseUrl     ✅ lee
  // basePage.baseUrl = X ❌ error de compilación
  get baseUrl(): string {
    return this._baseUrl;
  }

  // Getter: se accede como una propiedad (page.timeout), no como método.
  get timeout(): number {
    return this._timeout;
  }

  // Setter: intercepta la asignación (page.timeout = 5000) para validar.
  set timeout(value: number) {
    if (value < 0) {
      console.log("Error: timeout cannot be negative. Keeping previous value.");
      return;
    }
    this._timeout = value;
    console.log(`Timeout set to: ${value}ms`);
  }

  navigate(path: string): void {
    console.log(`Navigating to: ${this._baseUrl}${path}`);
  }

  // Usa el timeout configurado — así el setter afecta directamente
  // al comportamiento de TODAS las páginas que hereden de BasePage.
  waitForLoad(): void {
    console.log(`Waiting up to ${this._timeout}ms for page to load...`);
  }
}

console.log("\n===== 5.1 BasePage =====");
const basePageDemo = new BasePage("https://qa.myapp.com");
console.log(`Base URL (getter): ${basePageDemo.baseUrl}`);
basePageDemo.navigate("/");
basePageDemo.waitForLoad();
