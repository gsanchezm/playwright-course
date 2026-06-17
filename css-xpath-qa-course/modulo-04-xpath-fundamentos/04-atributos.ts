// ============================================================
// Mini-clase 4.4: Atributos en XPath — @attr
// ============================================================
// Analogía QA: el @ es tu "buscar por hook de prueba". En la app real el
// ancla más estable casi nunca es la clase visual, sino el data-testid que
// el equipo puso a propósito. //button[@data-testid='login-button-desktop']
// es el equivalente XPath de getByTestId: explícito, estable y legible.
// Pero hay una trampa brutal con @class: en XPath 1.0, @class compara el
// atributo ENTERO como un string, no clase-por-clase. Eso convierte a
// contains(@class,...) en obligatorio cuando hay multi-clase.
// ============================================================
import { countXpath, $x } from "../helpers/dom";
import { check, titulo } from "../helpers/check";
console.log("\n===== 4.4 Atributos en XPath =====");

// ------------------------------------------------------------
// 1) @attr exacto: el hook de prueba como ancla.
// ------------------------------------------------------------
// [@attr='valor'] exige igualdad EXACTA del atributo. Para data-testid (que
// es único y deliberado) es el locator ideal: uno y solo uno.
titulo("@data-testid: el ancla más estable");
check(
  "//button[@data-testid='login-button-desktop'] = 1",
  countXpath("//button[@data-testid='login-button-desktop']"),
  1,
);
check(
  "//*[@data-testid='pizza-card-103'] = 1 (la card agotada)",
  countXpath("//*[@data-testid='pizza-card-103']"),
  1,
);

// ------------------------------------------------------------
// 2) La TRAMPA de @class con multi-clase.
// ------------------------------------------------------------
// [@class='pizza-card'] FALLA. En el fixture las tarjetas son
// class="pizza-card css-7h3k1p" (¡dos clases!). XPath 1.0 compara el string
// COMPLETO del atributo, así que 'pizza-card' nunca es igual a
// 'pizza-card css-7h3k1p'. Resultado: 0 matches. Es el error silencioso más
// común al portar un selector de CSS (.pizza-card) a XPath.
titulo("@class compara el string ENTERO → multi-clase rompe la igualdad");
check("//*[@class='pizza-card'] = 0 (¡no es igualdad de clases!)", countXpath("//*[@class='pizza-card']"), 0);
// El string completo SÍ matchea (pero es frágil y depende del orden exacto):
check(
  "//article[@class='pizza-card css-7h3k1p'] = 3 (no incluye la agotada, que añade is-soldout)",
  countXpath("//article[@class='pizza-card css-7h3k1p']"),
  3,
);

// ------------------------------------------------------------
// 3) La solución: contains(@class, 'token').
// ------------------------------------------------------------
// contains(@class,'pizza-card') pregunta "¿el string de @class CONTIENE este
// fragmento?". Eso sí abarca las 4 tarjetas, incluida la agotada (que tiene
// la clase extra is-soldout). Es el puente a lo que verás a fondo en M7.
titulo("contains(@class, ...): el remedio robusto");
check(
  "//article[contains(@class,'pizza-card')] = 4 (¡incluye la agotada!)",
  countXpath("//article[contains(@class,'pizza-card')]"),
  4,
);

// ------------------------------------------------------------
// 4) Presencia de atributo y combinación con 'and'.
// ------------------------------------------------------------
// [@attr] (sin '=') = "el atributo EXISTE", sin importar su valor. Sirve para
// estados booleanos como disabled. Y puedes combinar predicados con 'and'.
titulo("Presencia [@attr] y combinación con 'and'");
check("//button[@disabled] = 2 (el de 'Agotado' + el de 'Place order')", countXpath("//button[@disabled]"), 2);
check("//input[@disabled] = 2 (jalapeño + transferencia)", countXpath("//input[@disabled]"), 2);
// 'and' encadena condiciones: un <article> que está agotado Y es de carnes.
check(
  "//article[@data-sold-out='true' and @data-category='meat'] = 1",
  countXpath("//article[@data-sold-out='true' and @data-category='meat']"),
  1,
);
const agotada = $x("//article[@data-sold-out='true']")[0] as Element;
check("y esa card es pizza-card-103", agotada.getAttribute("data-testid"), "pizza-card-103");
