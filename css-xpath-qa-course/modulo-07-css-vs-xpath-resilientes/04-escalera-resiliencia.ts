// ============================================================
// Mini-clase 7.4: La escalera de resiliencia
// ============================================================
// Analogía QA: elegir un selector es como elegir una referencia para una
// cita: el folio único (testid) nunca falla; "el botón que dice Sign In"
// (rol + nombre) es claro; "el párrafo con ese texto" (texto) ya depende de
// la copy; y "el 3er div" (estructura/clase-hash) es la peor — se rompe con
// cualquier refactor.
//
// LA ESCALERA (de más a menos resiliente):
//   1) testid              → [data-testid="..."]      (contrato explícito)
//   2) rol + nombre        → getByRole("button", {name})
//   3) texto               → getByText(...)
//   4) estructura / clase  → nth-child, .css-1a2b3c   (EVITAR)
//
// Bajas un peldaño SOLO si el de arriba no aplica. Aquí mostramos los cuatro
// apuntando al MISMO elemento y dónde la app real te FUERZA a bajar.
// ============================================================
import { countCss, countXpath, $$, $x } from "../helpers/dom";
import { check, titulo } from "../helpers/check";

console.log("\n===== 7.4 La escalera de resiliencia =====");

// ------------------------------------------------------------
// Peldaño 1 — testid: el contrato más estable.
// ------------------------------------------------------------
// El botón de login expone data-testid="login-button-desktop". Es un hook
// PUESTO A PROPÓSITO para pruebas: sobrevive a cambios de texto, clase y
// posición. Es el primer peldaño y el preferido cuando existe.
titulo("Peldaño 1: testid");
const porTestid = countCss('[data-testid="login-button-desktop"]');
check("testid del botón de login cuenta 1", porTestid, 1);

// ------------------------------------------------------------
// Peldaño 2 — rol + nombre accesible (getByRole).
// ------------------------------------------------------------
// El MISMO botón es un <button> con nombre accesible "Sign In". En Playwright
// sería getByRole("button", { name: "Sign In" }). Offline lo aproximamos con
// XPath: un <button> cuyo texto normalizado es "Sign In". Apunta al mismo nodo.
titulo("Peldaño 2: rol + nombre (Sign In SÍ vive aquí)");
const porRol = countXpath("//button[normalize-space(.)='Sign In']");
check("botón con nombre accesible 'Sign In' cuenta 1", porRol, 1);
const nodoTestid = $$('[data-testid="login-button-desktop"]')[0];
const nodoRol = $x("//button[normalize-space(.)='Sign In']")[0] as Element;
check("testid y rol+nombre son el MISMO botón", nodoTestid === nodoRol, true);

// ------------------------------------------------------------
// Peldaño 3 — texto (getByText).
// ------------------------------------------------------------
// Si no hay testid ni rol claro, localizas por texto visible. El subtítulo
// "Please enter your details." no tiene testid: getByText es su mejor hook.
// Más frágil (la copy cambia entre idiomas/versiones) pero válido.
titulo("Peldaño 3: texto");
const porTexto = countXpath("//p[normalize-space(.)='Please enter your details.']");
check("párrafo localizado por su texto cuenta 1", porTexto, 1);

// ------------------------------------------------------------
// LA EXCEPCIÓN REAL: inputs SIN <label> rompen el peldaño 2.
// ------------------------------------------------------------
// El campo Username NO tiene <label for> (su rótulo es un <div>). Por eso
// getByRole/getByLabel NO lo encuentran por nombre accesible → el peldaño 2
// falla. La regla "baja un peldaño" te lleva a getByPlaceholder o testid.
// (Verificamos que NO hay ningún label[for] que lo conecte.)
titulo("Excepción: input sin label → bajar a placeholder/testid");
const labelsConFor = countCss("label[for]");
check("no existe ningún label[for] (rótulos son <div>)", labelsConFor, 0);
const porPlaceholder = countCss('[placeholder="standard_user"]');
const porTestidInput = countCss('[data-testid="username-desktop"]');
check("getByPlaceholder('standard_user') rescata el input", porPlaceholder, 1);
check("...o su testid 'username-desktop'", porTestidInput, 1);
check("placeholder y testid son el mismo input", $$('[placeholder="standard_user"]')[0] === $$('[data-testid="username-desktop"]')[0], true);

// ------------------------------------------------------------
// Peldaño 4 — lo que NO debes usar: clases hash css-*.
// ------------------------------------------------------------
// .css-9z8y7x apunta hoy al login-form, pero es una clase generada por el
// bundler: cambia en cada build. Hay 6 de estas en el fixture — son ruido
// frágil. El testid del MISMO form (data-testid="login-form") es lo correcto.
titulo("Peldaño 4 (EVITAR): clases hash css-*");
const hashFragil = countCss(".css-9z8y7x");
const formResiliente = countCss('[data-testid="login-form"]');
check("la clase hash apunta a 1 nodo HOY", hashFragil, 1);
check("el testid del MISMO form también cuenta 1", formResiliente, 1);
check("hash y testid son el mismo nodo (pero solo el testid es estable)", $$(".css-9z8y7x")[0] === $$('[data-testid="login-form"]')[0], true);
check("hay 6 clases hash css-* frágiles en la página", countCss('[class*="css-"]'), 6);
