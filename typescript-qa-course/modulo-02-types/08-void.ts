// ============================================================
// Mini-clase 2.8: void
// ============================================================
// Analogía: Una acción que NO devuelve nada, como hacer click
// en un botón. La acción ocurre, pero no esperas un valor de vuelta.
// ============================================================
console.log("\n===== 2.8 void =====");

function clickButton(selector: string): void {
  console.log(`Clicking on: ${selector}`);
  // No hay "return". La función solo ejecuta la acción.
}

clickButton("#submit-btn");
clickButton("#cancel-btn");

// void es el tipo de retorno por defecto de una función que no usa return.
