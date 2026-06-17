// ============================================================
// Mini-clase 3.1: Pseudo-clases de estado — :checked, :disabled, :enabled
// ============================================================
// Analogía QA: una pseudo-clase de ESTADO es como afirmar sobre la CONDICIÓN
// de un control, no sobre su HTML. No preguntas "¿este input tiene el atributo
// checked en el markup?", preguntas "¿está MARCADO ahora?". Es la diferencia
// entre leer el código fuente y leer la pantalla: el estado es lo que el
// usuario ve y lo que tú asiertas en una prueba.
// ============================================================
import { countCss, $$, text, attr } from "../helpers/dom";
import { check, titulo } from "../helpers/check";
console.log("\n===== 3.1 Pseudo-clases de estado =====");

// ------------------------------------------------------------
// 1) :checked — checkboxes y radios que están MARCADOS
// ------------------------------------------------------------
// :checked matchea cualquier control marcado: checkbox o radio. En OmniPizza
// hay UN checkbox marcado (Queso extra) y UN radio marcado (Tarjeta) → 2.
titulo(":checked — controles marcados");
check("input:checked (checkbox queso + radio card)", countCss("input:checked"), 2);
check("checkbox marcado en toppings", countCss(".toppings input:checked"), 1);
check("radio marcado en payment", countCss(".payment input:checked"), 1);

// El valor del único checkbox marcado nos dice CUÁL es (mentalidad de aserción:
// no basta contar 1, verificamos identidad).
check("el checkbox marcado es 'queso'", attr($$(".toppings input:checked")[0], "value"), "queso");

// ------------------------------------------------------------
// 2) :disabled — controles deshabilitados (no interactuables)
// ------------------------------------------------------------
// :disabled matchea inputs Y botones con el atributo disabled. Hay 2 inputs
// deshabilitados (Jalapeño y Transferencia) y 2 botones (Suprema agotada y
// Place order). En total :disabled = 4.
titulo(":disabled — controles bloqueados");
check("input:disabled (jalapeño + transferencia)", countCss("input:disabled"), 2);
check("button:disabled (add-to-cart-103 + place-order)", countCss("button:disabled"), 2);
check(":disabled total (inputs + botones)", countCss(":disabled"), 4);

// El botón de la pizza agotada (Suprema) está deshabilitado: el QA lo asierta
// como "no se puede agregar al carrito".
check("add-to-cart de la card agotada está disabled", countCss('button[data-testid^="add-to-cart-"]:disabled'), 1);

// ------------------------------------------------------------
// 3) :enabled — el complemento de :disabled
// ------------------------------------------------------------
// :enabled matchea TODO control interactuable que NO está deshabilitado.
// Hay 13 inputs en el documento; 2 están disabled → 11 quedan habilitados.
titulo(":enabled — controles disponibles");
check("inputs habilitados (13 totales − 2 disabled)", countCss("input:enabled"), 11);

// :enabled + :checked se combinan: el radio Tarjeta está marcado Y habilitado.
check("radio marcado y habilitado", countCss(".payment input:enabled:checked"), 1);

// ------------------------------------------------------------
// 4) :focus — el control con el foco del teclado
// ------------------------------------------------------------
// :focus matchea el elemento que TIENE el foco AHORA. En un fixture estático
// (sin interacción) NADIE tiene el foco → 0. El foco es un estado DINÁMICO:
// aparece tras .focus()/.click(), no algo que viva en el markup.
titulo(":focus — estado dinámico, vacío en un fixture estático");
check(":focus en fixture estático = 0", countCss(":focus"), 0);

// ------------------------------------------------------------
// ⚠️ GUARDRAIL: :hover NO es un selector que debas usar para localizar.
// ------------------------------------------------------------
// :hover describe "el mouse está encima" — un estado que solo existe durante
// una INTERACCIÓN. En Playwright NO localizas con :hover: ejecutas la ACCIÓN
// page.hover(...) y luego asiertas el EFECTO (un tooltip visible, una clase).
//
// Y para :checked/:disabled, aunque el SELECTOR funciona, en Playwright el
// idiomático es el matcher de ESTADO, que reintenta y da mejores mensajes:
//   await expect(page.getByRole("checkbox", { name: "Queso extra" })).toBeChecked();
//   await expect(page.getByTestId("place-order-desktop")).toBeDisabled();
// El selector cuenta; el matcher AFIRMA. En una prueba real, prefiere afirmar.
titulo("resumen mental");
check("2 marcados + 4 deshabilitados es la foto de estado de OmniPizza", 2 + 4, 6);
