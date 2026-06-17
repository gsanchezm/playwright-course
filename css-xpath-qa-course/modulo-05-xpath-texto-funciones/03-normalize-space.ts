// ============================================================
// Mini-clase 5.3: normalize-space() anti-flaky
// ============================================================
// Analogía QA: el HTML real viene lleno de espacios, saltos de línea y
// tabulaciones invisibles que el navegador NO muestra pero el DOM SÍ guarda.
// Un locator que compara texto crudo contra esa basura invisible es FLAKY:
// pasa en un entorno y falla en otro. normalize-space() es el "trim + colapso"
// que vuelve la comparación robusta y reproducible.
// ============================================================
import { countXpath, $x, text } from "../helpers/dom";
import { check, titulo } from "../helpers/check";
console.log("\n===== 5.3 normalize-space() anti-flaky =====");

// ------------------------------------------------------------
// El problema: whitespace invisible rompe la igualdad de texto crudo.
// ------------------------------------------------------------
// El precio de Pepperoni se renderiza "$189.00", pero en el fixture el <span>
// trae saltos de línea y espacios alrededor ("\n   $189.00\n  "). Por eso
// `text()="$189.00"` da 0: el nodo de texto NO es exactamente "$189.00".
titulo("text() crudo falla con whitespace alrededor");
check(
  '//span[@data-testid="price-101"][text()="$189.00"] → 0 (whitespace invisible)',
  countXpath('//span[@data-testid="price-101"][text()="$189.00"]'),
  0,
);

// ------------------------------------------------------------
// La solución: normalize-space() recorta extremos y colapsa internos.
// ------------------------------------------------------------
// normalize-space(.) toma el string-value, quita el whitespace de los extremos
// y colapsa cualquier secuencia interna a un solo espacio. El "$189.00" sucio
// se vuelve "$189.00" limpio → ahora la igualdad SÍ matchea. 0 → 1.
titulo("normalize-space() limpia el texto: el mismo precio ahora matchea");
check(
  '//span[@data-testid="price-101"][normalize-space(.)="$189.00"] → 1',
  countXpath('//span[@data-testid="price-101"][normalize-space(.)="$189.00"]'),
  1,
);

// ------------------------------------------------------------
// No es un caso aislado: el total del checkout trae el mismo problema.
// ------------------------------------------------------------
// El <div class="order-total"> también tiene whitespace deliberado alrededor
// de "Total: $641.48". Mismo síntoma, misma cura: crudo da 0, normalizado da 1.
titulo("Mismo patrón en el total del checkout");
check(
  '//div[@data-testid="order-total"][text()="Total: $641.48"] → 0',
  countXpath('//div[@data-testid="order-total"][text()="Total: $641.48"]'),
  0,
);
check(
  '//div[@data-testid="order-total"][normalize-space(.)="Total: $641.48"] → 1',
  countXpath('//div[@data-testid="order-total"][normalize-space(.)="Total: $641.48"]'),
  1,
);

// ------------------------------------------------------------
// Regla anti-flaky: normaliza SIEMPRE que compares texto visible.
// ------------------------------------------------------------
// También funciona con contains: normalize-space evita que un salto de línea
// se cuele en medio de tu subcadena buscada.
check(
  '//div[@data-testid="order-total"][contains(normalize-space(.), "$641.48")] → 1',
  countXpath('//div[@data-testid="order-total"][contains(normalize-space(.), "$641.48")]'),
  1,
);

// qa_transfer: Playwright NORMALIZA el whitespace por ti en getByText/toHaveText
// (colapsa y recorta como normalize-space). En XPath crudo eres tú quien debe
// pedirlo explícitamente — por eso es el reflejo anti-flaky #1 al escribir XPath.
