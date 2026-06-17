// ============================================================
// Mini-clase 2.4: Hermanos — adyacente (+) y general (~)
// ============================================================
// Analogía QA: a veces el elemento que quieres no tiene un buen hook propio,
// pero VIVE AL LADO de uno que sí. Los combinadores de hermano te dejan
// decir "el que viene JUSTO después de X" (+) o "cualquiera que venga
// después de X bajo el mismo padre" (~). Es navegar por vecindad, como
// localizar el botón que sigue a una etiqueta de campo.
// ============================================================
import { countCss } from "../helpers/dom";
import { check, titulo } from "../helpers/check";
console.log("\n===== 2.4 Hermanos: adyacente y general =====");

// ------------------------------------------------------------
// + — hermano ADYACENTE: "B que viene JUSTO después de A" (mismo padre).
// ------------------------------------------------------------
// `.nav-search + .cart-toggle`: el botón del carrito es el hermano que sigue
// INMEDIATAMENTE a la caja de búsqueda en el header. Exactamente 1.
titulo("+ = hermano adyacente (el siguiente inmediato)");
check(".nav-search + .cart-toggle → 1", countCss(".nav-search + .cart-toggle"), 1);

// `img + .badge`: dentro de cada card, el <span.badge> viene justo después
// de la <img>. 3 cards tienen badge (101, 102, 103); la 104 no → 3.
check("img + .badge → 3 (cards con badge tras la imagen)", countCss("img + .badge"), 3);

// `.badge + h3`: el nombre de la pizza (<h3>) sigue inmediatamente al badge.
// Las mismas 3 cards → 3.
check(".badge + h3 → 3", countCss(".badge + h3"), 3);

// ------------------------------------------------------------
// ~ — hermano GENERAL: "cualquier B que venga DESPUÉS de A" (mismo padre).
// ------------------------------------------------------------
// `.footer-link--social ~ .footer-link--social`: hay 2 enlaces sociales
// hermanos (Twitter, Instagram). El segundo viene después del primero → 1
// match. (El primero no tiene un social ANTES, por eso no es 2.)
titulo("~ = hermano general (todos los siguientes)");
check(".footer-link--social ~ .footer-link--social → 1", countCss(".footer-link--social ~ .footer-link--social"), 1);

// `.nav-link ~ .nav-link`: 3 nav-links hermanos. El 2º y el 3º vienen después
// de un nav-link previo → 2 matches.
check(".nav-link ~ .nav-link → 2", countCss(".nav-link ~ .nav-link"), 2);

// `.summary-row + .summary-row`: 3 filas de resumen del carrito; la 2ª y 3ª
// siguen a una fila previa → 2 (con + por ser consecutivas, igual que ~ aquí).
check(".summary-row + .summary-row → 2", countCss(".summary-row + .summary-row"), 2);

// ------------------------------------------------------------
// CLAVE: los combinadores de hermano SOLO miran HACIA ADELANTE.
// ------------------------------------------------------------
// No existe "hermano anterior" en CSS. `.is-active + .nav-link` toma el
// nav-link que sigue al activo (Checkout) → 1. No puedes pedir el que está
// ANTES de un elemento con + ni con ~.
titulo("Solo hacia adelante: no hay 'hermano anterior'");
check(".is-active + .nav-link (el siguiente al activo) → 1", countCss(".is-active + .nav-link"), 1);

// Diferencia + vs ~ cuando NO son consecutivos: tras la <img> de cada card
// vienen badge, h3, desc, price... `.pizza-img ~ .price` alcanza el price
// aunque no sea adyacente (4 cards) — el ~ salta vecinos intermedios.
check(".pizza-img ~ .price (general, salta vecinos) → 4", countCss(".pizza-img ~ .price"), 4);
check(".pizza-img + .price (adyacente, nunca consecutivos) → 0", countCss(".pizza-img + .price"), 0);

// qa_transfer: page.locator('.nav-search + .cart-toggle'). Mismo motor CSS,
// misma regla de vecindad. Úsalo cuando tu blanco solo es identificable por
// "el que está junto a" un ancla estable.
