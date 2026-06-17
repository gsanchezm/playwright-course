// ============================================================
// Mini-clase 1.5: Dónde aparece el selector CSS en el día a día de QA
// ============================================================
// Analogía: el mismo selector CSS que practicas aquí es EXACTAMENTE el que
// escribirás en Playwright, Selenium o la consola de DevTools. La herramienta
// cambia; el selector es el mismo. Aquí NO montamos el navegador: probamos el
// selector OFFLINE con countCss() contra el fixture, y mostramos en PROSA la
// línea que iría en cada herramienta.
// ============================================================
import { countCss, $$, text } from "../helpers/dom";
import { check, titulo } from "../helpers/check";
console.log("\n===== 1.5 Dónde aparece el selector CSS en QA =====");

// ------------------------------------------------------------
// 1) Playwright: page.locator(".pizza-card")  (o el explícito css=)
// ------------------------------------------------------------
// En Playwright, page.locator(".pizza-card") usa CSS por defecto; el explícito
// page.locator("css=.pizza-card") es lo mismo. El selector que validamos aquí
// es el que pondrías allá. Probamos que apunta a las 4 tarjetas.
titulo("Playwright: page.locator('.pizza-card')");
check("el selector .pizza-card encuentra 4 tarjetas", countCss(".pizza-card"), 4);

// ------------------------------------------------------------
// 2) Selenium: driver.findElements(By.cssSelector("#login-form"))
// ------------------------------------------------------------
// Selenium expone CSS vía By.cssSelector(...). findElement (singular) lanza si
// no encuentra; findElements (plural) devuelve la lista. El mismo #login-form.
titulo("Selenium: By.cssSelector('#login-form')");
check("el selector #login-form encuentra el formulario único", countCss("#login-form"), 1);

// ------------------------------------------------------------
// 3) DevTools: $$(".pizza-card") en la consola del navegador
// ------------------------------------------------------------
// En la consola, $$(sel) es AZÚCAR de document.querySelectorAll(sel) (devuelve
// un array). Por eso nuestro helper $$ se llama igual: replica ese gesto. Lo
// usas para verificar un selector a mano ANTES de pegarlo en tu test.
titulo("DevTools: $$('.pizza-card')");
const cards = $$(".pizza-card");
check("$$('.pizza-card') devuelve 4 (como en la consola)", cards.length, 4);
check("la primera del array es 'Pepperoni'", text(cards[0].querySelector("h3")), "Pepperoni");

// ------------------------------------------------------------
// 4) El mismo selector vale para CONTAR (auditar la UI).
// ------------------------------------------------------------
// Un caso típico: aseverar cuántos elementos hay. "El catálogo muestra 4
// pizzas" es una aserción de conteo sobre el mismo selector .pizza-card.
titulo("Aserción de conteo");
check("el catálogo muestra 4 pizzas", countCss(".pizza-card"), 4);
check("el carrito tiene 2 líneas", countCss(".cart-line"), 2);

// ------------------------------------------------------------
// 5) CUIDADO: :has-text() / :text-is() NO son CSS estándar.
// ------------------------------------------------------------
// Son pseudo-clases CUSTOM de Playwright (su motor las entiende). En CSS real
// —y en querySelectorAll— NO existen y lanzan error. Aquí usamos el :has()
// ESTÁNDAR (sí soportado) para localizar "la tarjeta que contiene un .badge".
// (page.locator('.pizza-card:has-text("Pepperoni")') es válido SOLO en Playwright.)
titulo(":has() estándar (vs :has-text() de Playwright)");
check(".pizza-card:has(.badge) → 3 (las que llevan etiqueta)",
  countCss(".pizza-card:has(.badge)"), 3);
