// ============================================================
// Mini-clase 2.5: Selectores estables con testid
// ============================================================
// Analogía QA: un data-testid es un CONTRATO entre dev y QA. Las clases de
// estilo cambian con cada rediseño; el testid es un hook puesto a propósito
// para automatización y, por convención, no se toca sin avisar. Tu trabajo
// es engancharte al contrato estable, no al andamiaje frágil del CSS.
// ============================================================
import { countCss, $$, attr } from "../helpers/dom";
import { check, titulo } from "../helpers/check";
console.log("\n===== 2.5 Selectores estables con testid =====");

// ------------------------------------------------------------
// El problema: testids DINÁMICOS llevan un id en el valor.
// ------------------------------------------------------------
// Las cards son pizza-card-101, -102, -103, -104. Un "=" exacto solo atrapa
// UNA: para enganchar las 4 a la vez necesitas el prefijo estable.
titulo("El '=' exacto solo toma una; el prefijo las toma todas");
check('[data-testid="pizza-card-101"] (exacto) → 1', countCss('[data-testid="pizza-card-101"]'), 1);
check('[data-testid^="pizza-card-"] (prefijo) → 4', countCss('[data-testid^="pizza-card-"]'), 4);

// Lo mismo con los botones add-to-cart: el "=" exacto fallaría para "todos".
check('[data-testid="add-to-cart-101"] (exacto) → 1', countCss('[data-testid="add-to-cart-101"]'), 1);
check('[data-testid^="add-to-cart-"] (prefijo) → 4', countCss('[data-testid^="add-to-cart-"]'), 4);

// ------------------------------------------------------------
// El testid como contrato: estable frente a las clases hash frágiles.
// ------------------------------------------------------------
// Las cards también llevan una clase generada `css-7h3k1p` (estilo CSS-in-JS).
// Esa clase es BASURA para selectores: cambia en cada build. El testid no.
// Ambos cuentan 4 HOY, pero solo el testid es un contrato que sobrevive.
titulo("Contrato estable (testid) vs clase hash frágil (css-*)");
check(".css-7h3k1p (clase hash, frágil) → 4 hoy", countCss(".css-7h3k1p"), 4);
check('[data-testid^="pizza-card-"] (contrato, estable) → 4', countCss('[data-testid^="pizza-card-"]'), 4);

// ------------------------------------------------------------
// Extraer el id desde el contrato: del hook al dato.
// ------------------------------------------------------------
// Un buen testid es legible Y parseable: el sufijo numérico ES el id de
// negocio. Lo leemos sin tocar el texto visible ni el precio.
titulo("El testid contiene el id de negocio");
const ids = $$('[data-testid^="pizza-card-"]')
  .map((el) => attr(el, "data-testid")!.replace("pizza-card-", ""));
check("ids extraídos de los testids", ids, ["101", "102", "103", "104"]);

// ------------------------------------------------------------
// Estabilizar combinando testid + atributo de dato.
// ------------------------------------------------------------
// Para "la card agotada" no dependas de la clase is-soldout (visual): cruza
// el contrato del testid con el atributo de estado data-sold-out.
const agotadas = $$('[data-testid^="pizza-card-"][data-sold-out="true"]');
check("card agotada por testid + data-sold-out → 1", agotadas.length, 1);
check("...y su id es 103", attr(agotadas[0], "data-testid"), "pizza-card-103");

// qa_transfer: Playwright tiene azúcar para esto — page.getByTestId('...')
// usa data-testid por defecto, y page.locator('[data-testid^="..."]')
// engancha los dinámicos. El contrato del testid transfiere 1:1 a la app live.
