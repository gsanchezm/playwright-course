# 1.5 — Dónde aparece la regex en el día a día de QA

> **Módulo 1 · Fundamentos**

> **Analogía QA:** la regex es una navaja suiza que ya traes en el cinturón aunque no la hayas notado. Vive dentro de tus locators, tus aserciones de URL, el filtro de tags en CI, la validación de datos y el parseo de logs.

---

## ¿Qué aprendes?

- Cinco lugares reales donde la regex aparece en automatización de pruebas:
  1. **Locators** por texto.
  2. **Aserciones de URL**.
  3. **Filtros de tags** en CI (`@smoke`, `@regression`).
  4. **Validación** de datos de prueba.
  5. **Parseo de logs**.
- Las **anclas** `^` (inicio) y `$` (fin) y la **alternancia** `|` (esto o aquello), que usarás en el reto.

> Aquí **no** ejecutamos Playwright: mostramos el **patrón** que iría en cada lugar y lo probamos contra un string de muestra, para que veas la idea sin montar el navegador.

---

## 1) Locators por texto: `page.getByText(/.../)`

En Playwright puedes localizar un elemento por su texto usando una regex en vez de un string exacto. Sirve para texto **parcial o variable**, p.ej. un total que cambia: `"Total: $249.00"`. El patrón ignora el monto exacto.

```ts
// @file regex-qa-course/modulo-01-fundamentos/05-donde-aparece-en-qa.ts
const textoDelTotal = "Total: $249.00";
const reTotalUI = /Total: \$\d+\.\d{2}/; // \$ literal, \d{2} = centavos
checkMatch(reTotalUI, textoDelTotal, true);
checkMatch(reTotalUI, "Total: gratis", false); // no hay número → no matchea
```

---

## 2) Aserción de URL: `await expect(page).toHaveURL(/.../)`

Tras un clic esperas aterrizar en cierta ruta. La regex valida la URL sin atarte a query params volátiles.

```ts
// @file regex-qa-course/modulo-01-fundamentos/05-donde-aparece-en-qa.ts
const urlActual = "https://omnipizza-frontend.onrender.com/catalog?market=MX";
const reURL = /\/catalog\?market=MX/; // \/ y \? son literales
checkMatch(reURL, urlActual, true);
checkMatch(reURL, "https://omnipizza-frontend.onrender.com/cart", false);
```

---

## 3) Filtro de tags en CI: `grep` de `@smoke` / `@regression`

Los runners (Playwright `--grep`, etc.) seleccionan tests por su título usando una regex. Así corres solo el smoke suite en cada push. Aquí aparece la **alternancia** `|` ("esto o aquello") y el límite de palabra `\b`:

```ts
// @file regex-qa-course/modulo-01-fundamentos/05-donde-aparece-en-qa.ts
const titulosDeTests = [
  "checkout flow @smoke",
  "edge cases del carrito @regression",
  "login feliz @smoke @critical",
  "reporte mensual @nightly",
];
const reSmoke = /@smoke\b/; // \b = límite de palabra, evita "@smoketest"
const cuantosSmoke = titulosDeTests.filter((t) => reSmoke.test(t)).length;
check("CI seleccionaría 2 tests @smoke", cuantosSmoke, 2);

// Selección combinada: smoke O regression (alternancia con |).
const reSmokeORegression = /@(smoke|regression)\b/;
const cuantos = titulosDeTests.filter((t) => reSmokeORegression.test(t)).length;
check("smoke o regression: 3 tests", cuantos, 3);
```

---

## 4) Validación de datos de prueba

Antes de mandar un fixture al sistema, validas su forma. ¿El SKU generado tiene el formato `PZ-####`? Esto atrapa bugs en tus **propios** datos de prueba. Aquí aparecen las **anclas** `^` (inicio) y `$` (fin), que exigen que el string **completo** sea el SKU:

```ts
// @file regex-qa-course/modulo-01-fundamentos/05-donde-aparece-en-qa.ts
const reSku = /^PZ-\d{4}$/; // ^ y $ anclan: el string COMPLETO debe ser el SKU
checkMatch(reSku, "PZ-1234", true);
checkMatch(reSku, "PZ-1234 ", false); // espacio sobrante → dato sucio, rechazado
```

---

## 5) Parseo de logs

Tras una corrida de CI, extraes datos de los logs: ¿cuántos pasaron y cuántos fallaron? Capturamos los dos números del resumen final con dos grupos `( )`:

```ts
// @file regex-qa-course/modulo-01-fundamentos/05-donde-aparece-en-qa.ts
const resumen = "suite finished: 3 passed, 1 failed";
const reResumen = /(\d+) passed, (\d+) failed/;
const m = resumen.match(reResumen);
const passed = m ? Number(m[1]) : -1;
const failed = m ? Number(m[2]) : -1;
check("del log: 3 pasaron", passed, 3);
check("del log: 1 falló", failed, 1);
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-01-fundamentos/05-donde-aparece-en-qa.ts
```

---

## Qué observar

- La misma regex sirve en **locators, URLs, filtros de CI, validación y parseo**.
- `^` y `$` **anclan** el patrón al inicio y al fin: exigen que el string completo sea lo esperado.
- `|` da **alternancia** ("esto o aquello"); `\b` marca un **límite de palabra** para no atrapar de más.
- Guardas estos dos conceptos —**anclas** y **alternancia**— porque son justo lo que necesitas en el reto.

⬅️ Anterior: [1.4 Literales y el punto](/docs/regex/m1-literales-y-punto) · ➡️ Siguiente: [Reto M1](/docs/regex/m1-reto)
