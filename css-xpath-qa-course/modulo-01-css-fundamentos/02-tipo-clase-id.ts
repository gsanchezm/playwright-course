// ============================================================
// Mini-clase 1.2: Selectores por tipo, clase e id
// ============================================================
// Analogía: son los tres niveles de "puntería" de un selector.
//   - TIPO   (h3, button): apuntas a TODOS los elementos de una etiqueta.
//   - CLASE  (.pizza-card): apuntas a un GRUPO que comparte un rol/estilo.
//   - ID     (#login-form): apuntas a UN elemento único en la página.
// Es el ABC de CSS: con estos tres ya localizas casi cualquier cosa.
// ============================================================
import { countCss, $$, attr } from "../helpers/dom";
import { check, titulo } from "../helpers/check";
console.log("\n===== 1.2 Selectores por tipo, clase e id =====");

// ------------------------------------------------------------
// SELECTOR DE TIPO: el nombre de la etiqueta, tal cual.
// ------------------------------------------------------------
// `h3` matchea TODOS los <h3> del documento. En OmniPizza cada pizza tiene su
// nombre en un <h3>, así que hay uno por tarjeta: 4 en total.
titulo("Selector de tipo (la etiqueta)");
check("hay 4 <h3> (un nombre de pizza por tarjeta)", countCss("h3"), 4);

// `button` matchea TODOS los <button>: banderas de mercado, chips de categoría,
// botones de agregar, eliminar, login, etc. No filtres por tipo si quieres un
// subconjunto: el tipo es el selector menos específico.
check("hay 18 <button> en toda la página", countCss("button"), 18);

// ------------------------------------------------------------
// SELECTOR DE CLASE: un punto + el nombre de la clase.
// ------------------------------------------------------------
// `.pizza-card` matchea todo elemento cuyo atributo class CONTENGA esa clase.
// Es el caballo de batalla en QA: agrupa elementos por su rol en la UI.
titulo("Selector de clase (.clase)");
check("hay 4 .pizza-card", countCss(".pizza-card"), 4);
check("hay 3 .badge (Popular, Sin Gluten, Nuevo)", countCss(".badge"), 3);

// Un elemento puede tener VARIAS clases: la 3.ª tarjeta tiene "pizza-card" y
// "is-soldout". Cada clase es un selector independiente que la alcanza.
check("1 tarjeta está agotada (.is-soldout)", countCss(".pizza-card.is-soldout"), 1);

// ------------------------------------------------------------
// SELECTOR DE ID: una almohadilla + el id.
// ------------------------------------------------------------
// Un id debe ser ÚNICO en la página, así que `#login-form` apunta a UN solo
// elemento. Es la puntería más fina... cuando el id existe y es estable.
titulo("Selector de id (#id)");
check("hay exactamente 1 #login-form", countCss("#login-form"), 1);

// Y ese único elemento es el <form> de login.
const form = $$("#login-form")[0];
check("#login-form es un <form>", form.tagName, "FORM");
check("#login-form tiene el data-testid 'login-form'", attr(form, "data-testid"), "login-form");
