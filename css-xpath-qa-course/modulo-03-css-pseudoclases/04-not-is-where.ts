// ============================================================
// Mini-clase 3.4: :not(), :is(), :where() — negar, agrupar, aplanar
// ============================================================
// Analogía QA: estas tres pseudo-clases son los OPERADORES LÓGICOS de tus
// selectores. :not() es el "EXCEPTO" (todo menos X). :is() es el "CUALQUIERA
// DE" (X o Y o Z) que ahorra repetir. :where() es :is() pero "callado": no
// suma especificidad, ideal para reglas base que otra cosa deba sobreescribir.
// ============================================================
import { countCss, $$, text } from "../helpers/dom";
import { check, titulo } from "../helpers/check";
console.log("\n===== 3.4 :not(), :is(), :where() =====");

// ------------------------------------------------------------
// 1) :not() — el complemento de una condición
// ------------------------------------------------------------
// :not([data-sold-out]) = cards que NO tienen ese atributo. La única agotada
// es Suprema (data-sold-out="true") → quedan 3 disponibles.
titulo(":not() — todo MENOS lo que matchea");
check("cards NO agotadas = 3", countCss(".pizza-card:not([data-sold-out])"), 3);
check("y son Pepperoni, Cuatro Quesos y Pan de Ajo", $$(".pizza-card:not([data-sold-out]) .pizza-name").map(text), ["Pepperoni", "Cuatro Quesos", "Pan de Ajo"]);

// :not() también niega por clase. La card con clase is-soldout es 1; las otras 3
// la pasan.
check("article:not(.is-soldout) = 3", countCss("article:not(.is-soldout)"), 3);

// ------------------------------------------------------------
// 2) :not() ENCADENADO y :not() con LISTA
// ------------------------------------------------------------
// Encadenar :not():not() = AND de negaciones ("ni esto NI aquello"). CSS moderno
// también acepta una LISTA dentro de un solo :not(a, b) con el MISMO efecto.
// De los 3 badges (popular, sin-gluten, new), excluir popular y new deja 1.
titulo(":not() encadenado ≡ :not() con lista");
check(":not(.badge--popular):not(.badge--new) = 1 badge", countCss(".badge:not(.badge--popular):not(.badge--new)"), 1);
check(":not(.badge--popular, .badge--new) = mismo 1 badge", countCss(".badge:not(.badge--popular, .badge--new)"), 1);
check("ese badge restante es 'Sin Gluten'", text($$(".badge:not(.badge--popular):not(.badge--new)")[0]), "Sin Gluten");

// En el nav, "todos los links MENOS el activo" → 2 (Checkout y Ayuda).
check("nav links que no son el activo = 2", countCss(".main-nav a:not(.is-active)"), 2);

// ------------------------------------------------------------
// 3) :is() — agrupa una lista de selectores (OR) y ahorra repetición
// ------------------------------------------------------------
// :is(h1, h2, h3) = "cualquier encabezado de esos tres". Equivale a escribir
// h1, h2, h3 por separado, pero compone bien dentro de un selector más grande.
// En OmniPizza hay 1 h1 + 4 h2 + 4 h3 = 9 encabezados.
titulo(":is() — 'cualquiera de'");
check(":is(h1,h2,h3) = 9 encabezados", countCss(":is(h1, h2, h3)"), 9);

// El poder real: usar :is() en MEDIO de un selector. "El nombre de una card que
// sea agotada O veggie" sin duplicar el prefijo ' .pizza-name'.
check("article:is(.is-soldout, [data-category=veggie]) = 2", countCss("article:is(.is-soldout, [data-category=veggie])"), 2);
check("y son Cuatro Quesos (veggie) y Suprema (agotada)", $$("article:is(.is-soldout, [data-category=veggie]) .pizza-name").map(text), ["Cuatro Quesos", "Suprema de Carnes"]);

// ------------------------------------------------------------
// 4) :where() — idéntico a :is() en MATCHING, pero con especificidad 0
// ------------------------------------------------------------
// :where(...) selecciona lo mismo que :is(...). La diferencia NO se ve al
// contar nodos (es la misma cuenta), se ve en la CASCADA: :where() aporta
// especificidad 0, así una regla posterior puede ganarle sin pelear. Por eso
// :where() es para estilos base/reset; aquí solo confirmamos que el MATCH es
// igual al de :is().
titulo(":where() — mismo match, especificidad 0 (se nota en CSS, no al contar)");
check(":where(h1,h2,h3) = 9 (igual que :is)", countCss(":where(h1, h2, h3)"), 9);

// ------------------------------------------------------------
// ⚠️ PARSEO FORGIVING: :is()/:where() perdonan selectores inválidos; :not() NO
// ------------------------------------------------------------
// :is() y :where() usan una lista "tolerante a fallos": si UNA parte es basura,
// la IGNORA y sigue con el resto. :not() usa una lista ESTRICTA: una parte
// inválida invalida TODO el :not(). Lo demostramos: ':is(h2, ::basura-xyz)'
// debe seguir matcheando los h2 reales (4) pese al selector falso.
titulo(":is/:where son forgiving; :not es estricto");
check(":is(h2, ::basura-xyz) ignora lo inválido y matchea 4 h2", countCss(":is(h2, ::basura-xyz)"), 4);

// ------------------------------------------------------------
// Aplicación QA: un solo selector legible en vez de tres repetidos
// ------------------------------------------------------------
// :is() reduce el "selector copy-paste". En vez de
//   .pizza-card.is-soldout .add-to-cart, .pizza-card[data-sold-out] .add-to-cart
// agrupas con :is() y queda una sola intención clara.
titulo("uso real: condensar selectores repetidos");
check("botón de card no disponible vía :is()", countCss(".pizza-card:is(.is-soldout, [data-sold-out]) button:disabled"), 1);
