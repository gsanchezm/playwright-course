// ============================================================
// Mini-clase 1.5: Dónde aparece la regex en el día a día de QA
// ============================================================
// Analogía: la regex es una navaja suiza que ya traes en el cinturón aunque
// no la hayas notado. Vive dentro de tus locators, tus aserciones de URL, el
// filtro de tags en CI, la validación de datos y el parseo de logs. Aquí NO
// ejecutamos Playwright: mostramos el PATRÓN que iría en cada lugar y lo
// probamos contra un string de muestra, para que veas la idea sin montar el
// navegador.
// ============================================================
import { check, checkMatch } from "../helpers/check";
console.log("\n===== 1.5 Dónde aparece la regex en QA =====");

// ------------------------------------------------------------
// 1) LOCATORS por texto:  page.getByText(/.../)
// ------------------------------------------------------------
// En Playwright puedes localizar un elemento por su texto usando una regex
// en vez de un string exacto. Sirve para texto PARCIAL o variable, p.ej. un
// total que cambia: "Total: $249.00". El patrón ignora el monto exacto.
// (No importamos Playwright; simulamos el textContent del elemento.)
const textoDelTotal = "Total: $249.00";
const reTotalUI = /Total: \$\d+\.\d{2}/; // \$ literal, \d{2} = centavos
checkMatch(reTotalUI, textoDelTotal, true);
checkMatch(reTotalUI, "Total: gratis", false); // no hay número → no matchea

// ------------------------------------------------------------
// 2) ASERCIÓN de URL:  await expect(page).toHaveURL(/.../)
// ------------------------------------------------------------
// Tras un clic esperas aterrizar en cierta ruta. La regex valida la URL sin
// atarte a query params volátiles. Aquí: "estamos en /catalog del mercado MX".
const urlActual = "https://omnipizza-frontend.onrender.com/catalog?market=MX";
const reURL = /\/catalog\?market=MX/; // \/ y \? son literales
checkMatch(reURL, urlActual, true);
checkMatch(reURL, "https://omnipizza-frontend.onrender.com/cart", false);

// ------------------------------------------------------------
// 3) FILTRO de tags en CI:  grep de @smoke / @regression
// ------------------------------------------------------------
// Los runners (Playwright `--grep`, etc.) seleccionan tests por su título
// usando una regex. Así corres solo el smoke suite en cada push.
const titulosDeTests = [
  "checkout flow @smoke",
  "edge cases del carrito @regression",
  "login feliz @smoke @critical",
  "reporte mensual @nightly",
];
const reSmoke = /@smoke\b/; // \b = límite de palabra, evita "@smoketest"
// Razonado: el 1.er y 3.er título llevan @smoke → 2 tests entrarían al run.
const cuantosSmoke = titulosDeTests.filter((t) => reSmoke.test(t)).length;
check("CI seleccionaría 2 tests @smoke", cuantosSmoke, 2);
// Selección combinada: smoke O regression (alternancia con |).
const reSmokeORegression = /@(smoke|regression)\b/;
const cuantos = titulosDeTests.filter((t) => reSmokeORegression.test(t)).length;
check("smoke o regression: 3 tests", cuantos, 3); // 1.º, 2.º y 3.º

// ------------------------------------------------------------
// 4) VALIDACIÓN de datos de prueba
// ------------------------------------------------------------
// Antes de mandar un fixture al sistema, validas su forma. ¿El SKU generado
// tiene el formato PZ-####? Esto atrapa bugs en tus PROPIOS datos de prueba.
const reSku = /^PZ-\d{4}$/; // ^ y $ anclan: el string COMPLETO debe ser el SKU
checkMatch(reSku, "PZ-1234", true);
checkMatch(reSku, "PZ-1234 ", false); // espacio sobrante → dato sucio, rechazado

// ------------------------------------------------------------
// 5) PARSEO de logs
// ------------------------------------------------------------
// Tras una corrida de CI, extraes datos de los logs: ¿cuántos pasaron y
// cuántos fallaron? Capturamos los dos números del resumen final.
const resumen = "suite finished: 3 passed, 1 failed";
const reResumen = /(\d+) passed, (\d+) failed/;
const m = resumen.match(reResumen);
// .match() puede ser null en strict → guardamos antes de leer grupos.
const passed = m ? Number(m[1]) : -1;
const failed = m ? Number(m[2]) : -1;
check("del log: 3 pasaron", passed, 3);
check("del log: 1 falló", failed, 1);
