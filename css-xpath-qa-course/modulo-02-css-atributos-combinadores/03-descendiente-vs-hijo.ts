// ============================================================
// Mini-clase 2.3: Descendiente vs hijo directo
// ============================================================
// Analogía QA: el ESPACIO y el ">" son dos preguntas de parentesco
// distintas. El espacio pregunta "¿está en algún lugar DENTRO de...?"
// (descendiente: hijo, nieto, bisnieto). El ">" pregunta "¿es hijo
// INMEDIATO de...?" (un solo nivel). Elegir mal cambia el conteo y la
// resistencia de tu selector ante cambios de maquetado.
// ============================================================
import { countCss } from "../helpers/dom";
import { check, titulo } from "../helpers/check";
console.log("\n===== 2.3 Descendiente vs hijo directo =====");

// ------------------------------------------------------------
// ESPACIO — descendiente: "A B" = B en CUALQUIER nivel dentro de A.
// ------------------------------------------------------------
// `.catalog .price` baja por todo el subárbol de .catalog: encuentra los 4
// .price aunque estén anidados dentro de cada <article>. No le importa la
// profundidad.
titulo("Espacio = descendiente (cualquier nivel)");
check(".catalog .price (descendiente) → 4", countCss(".catalog .price"), 4);
check(".pizza-grid article (descendiente) → 4", countCss(".pizza-grid article"), 4);

// ------------------------------------------------------------
// > — hijo directo: "A > B" = B hijo INMEDIATO de A (un nivel).
// ------------------------------------------------------------
// `.pizza-grid > article` exige que el <article> sea hijo directo del grid.
// Lo es: las 4 cards cuelgan directo del grid → 4.
titulo("> = hijo directo (un solo nivel)");
check(".pizza-grid > article (hijo directo) → 4", countCss(".pizza-grid > article"), 4);

// El contraste clave: .price NO es hijo directo del grid (está dentro del
// article). Con ">" el conteo cae a 0; con espacio era 4.
check(".pizza-grid > .price (hijo directo) → 0", countCss(".pizza-grid > .price"), 0);
check(".pizza-grid .price (descendiente) → 4", countCss(".pizza-grid .price"), 4);

// ------------------------------------------------------------
// El mismo blanco, distinto parentesco: header y sus enlaces.
// ------------------------------------------------------------
// `header a` (descendiente) cuenta TODOS los <a> bajo el header: el brand +
// los 3 del nav = 4. `header > a` (hijo directo) cuenta solo el brand, que
// cuelga directo del header; los 3 del nav son hijos del <nav>, no del header.
titulo("header a vs header > a");
check("header a (descendiente) → 4", countCss("header a"), 4);
check("header > a (hijo directo, solo el brand) → 1", countCss("header > a"), 1);

// ------------------------------------------------------------
// Por qué importa en QA: el ">" es FRÁGIL ante remaquetado.
// ------------------------------------------------------------
// Si un dev envuelve los articles en un <div> intermedio, `.catalog > article`
// (que hoy daría 0 porque hay un <h2> y el grid de por medio) seguiría en 0,
// mientras que `.catalog article` (descendiente) sobrevive al cambio → 4.
titulo("Fragilidad del hijo directo");
check(".catalog > article (hijo directo) → 0", countCss(".catalog > article"), 0);
check(".catalog article (descendiente, resiste anidado) → 4", countCss(".catalog article"), 4);

// qa_transfer: page.locator('.pizza-grid > article') en Playwright se evalúa
// con el MISMO motor CSS del navegador. La regla de parentesco es idéntica;
// prefiere el descendiente (espacio) salvo que necesites excluir nietos.
