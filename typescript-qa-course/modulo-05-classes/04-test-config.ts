// ============================================================
// Mini-clase 5.4: Getters y Setters (TestConfig)
// ============================================================
// Analogía: Validar un valor ANTES de aceptarlo, como cuando tu
// configuración de framework no permite un timeout negativo.
// ============================================================

export class TestConfig {
  // Convención: las propiedades privadas empiezan con "_".
  private _timeout: number = 30000;

  // Getter: se usa como una propiedad (config.timeout), no como método.
  get timeout(): number {
    return this._timeout;
  }

  // Setter: intercepta la asignación (config.timeout = 5000) para validar.
  set timeout(value: number) {
    if (value < 0) {
      console.log("Error: timeout cannot be negative. Using default.");
      return;
    }
    this._timeout = value;
    console.log(`Timeout set to: ${value}ms`);
  }
}

console.log("\n===== 5.4 TestConfig (getters/setters) =====");
const testConfigDemo = new TestConfig();
console.log(`Current timeout: ${testConfigDemo.timeout}ms`);
testConfigDemo.timeout = 60000;
testConfigDemo.timeout = -1000; // rechazado por el setter
console.log(`Timeout final: ${testConfigDemo.timeout}ms`);
