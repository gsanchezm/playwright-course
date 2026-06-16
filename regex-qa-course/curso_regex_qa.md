# Curso de Expresiones Regulares para QA: de validar a mano a automatizar con regex

**Público objetivo:** QA / automatizadores de pruebas que quieren dominar regex en su contexto real (validar datos, parsear logs, enmascarar PII, escribir patrones seguros).
**Objetivo:** aprender regex **ejecutando y verificando**. Cada ejemplo es una micro-aserción (`✅`/`❌`), igual que un test run. Los ejemplos usan el motor de JavaScript/TypeScript y el vocabulario de OmniPizza (MX / US / CH / JP).

> 📋 Consulta `README.md` para instalación y cómo correr los módulos.
> 📋 Consulta `cheatsheet.md` como referencia rápida de sintaxis.
> Esta página es la **fuente de verdad**: recorre cada módulo mini-clase por mini-clase con ejemplos tomados **fielmente del código**, y cierra con los bloques 🌉 Puente y 🧠 Síntesis de cada módulo y una síntesis global.

---

## Módulo 1 · Fundamentos

> **Analogía QA:** escribir tu primer "test" de texto y verlo ejecutarse. Una regex es una **regla declarativa**: describes el patrón, no cómo recorrer el string.

### 1.1 ¿Qué es una regex?
**Idea central:** una regex es una regla reutilizable que describe un patrón de texto y responde la pregunta binaria "¿este texto coincide?" vía `.test()`.

```typescript
const reContieneQA = /QA/;
check("'equipo QA' contiene 'QA'", reContieneQA.test("equipo QA"), true);
```

### 1.2 Crear una regex
**Idea central:** literal `/.../` para patrones fijos, o `new RegExp("...")` para patrones dinámicos en runtime (con doble escapado de backslashes).

```typescript
const reLiteral = /PZ-\d{4}/;
checkMatch(reLiteral, "PZ-1234", true);
```

### 1.3 Métodos básicos
**Idea central:** la regex es la regla; `test`, `search`, `match`, `replace`, `split` son distintas preguntas a esa misma regla.

```typescript
const reFailed = /status=failed/;
check("test(): la línea reporta status=failed", reFailed.test(linea), true);
```

### 1.4 Literales y el punto
**Idea central:** la mayoría de caracteres son literales; el `.` es comodín y los metacaracteres se escapan con `\` para matchearlos literalmente.

```typescript
const reVersion = /v1\.2/;
checkMatch(reVersion, "v1.2", true);
checkMatch(reVersion, "v1X2", false);
```

### 1.5 Dónde aparece en QA
**Idea central:** la regex vive en silencio dentro de locators de Playwright, aserciones de URL, filtros de tags en CI, validación de datos y parseo de logs.

```typescript
const reTotalUI = /Total: \$\d+\.\d{2}/;
checkMatch(reTotalUI, "Total: $249.00", true);
```

### 🚩 Reto M1 — "El primer check"
Validar con `.test()` que el nombre de un ambiente sea **EXACTAMENTE** `QA`, `UAT` o `PROD` (ni `qa`, ni `PRODUCTION`, ni `PROD ` con espacio). Hay que anclar el patrón y ofrecer las tres opciones exactas. La regex arranca como `/CAMBIAME/` y queda **sin resolver a propósito**: el alumno la completa hasta que las 9 filas queden en ✅.

---

> 🌉 **Puente a otros lenguajes — Módulo 1**
> - **Java:** `Pattern.compile(...).matcher(s).find()` / `.matches()`
> - **Python:** `re.search(...)` / `re.fullmatch(...)`
>
> En todos los lenguajes la idea es la misma: defines un patrón y eliges entre "¿aparece en alguna parte?" (`find` / `search` / `.test`) o "¿el string completo cumple?" (`matches` / `fullmatch` / anclado con `^…$`).

### 🧠 Síntesis e insights clave — Módulo 1
- Una regex es una **regla declarativa** de texto: describes el *qué* (el patrón), no el *cómo* recorrer el string.
- `.test()` es el **check más barato** (sí/no): úsalo cuando solo necesitas un veredicto binario.
- Literal `/.../` vs `new RegExp("...")` según el **origen del patrón**: estático (lo escribes fijo) vs dinámico (lo construyes desde datos en runtime).

---

## Módulo 2 · Clases y cuantificadores

> **Analogía QA:** afinar el "guardia de la puerta". Sabes describir QUÉ caracteres aceptas (clases), CUÁNTOS (cuantificadores) y exigirlo sobre TODO el dato (anclas).

### 2.1 Clases de caracteres
**Idea central:** una clase `[...]` es la "lista de invitados" para UNA posición; vale por un solo caracter, y `[^...]` invierte la lista.

```typescript
const reVocalSimple = /[abc]/;
checkMatch(reVocalSimple, "a", true);    // contiene 'a'
checkMatch(reVocalSimple, "xby", true);  // contiene 'b' en medio
checkMatch(reVocalSimple, "xyz", false); // ninguna de a/b/c
```

### 2.2 Clases predefinidas
**Idea central:** `\d`, `\w`, `\s` son atajos para clases comunes, pero en JS son **ASCII**: fallan con acentos y otros alfabetos, y la flag `u` no los amplía.

```typescript
checkMatch(/^\w+$/, "café", false);  // sin flag: la 'é' rompe → NO coincide
checkMatch(/^\w+$/u, "café", false); // CON flag u: ¡SIGUE sin coincidir!
```

### 2.3 Cuantificadores
**Idea central:** un cuantificador dice cuántas veces se repite el elemento a su izquierda: `*` (0+), `+` (1+), `?` (0/1), `{n}`, `{n,m}`.

```typescript
const reAbMas = /^ab+$/;
checkMatch(reAbMas, "ab", true);
checkMatch(reAbMas, "abbb", true);
checkMatch(reAbMas, "a", false); // cero 'b' NO basta para '+'
```

### 2.4 Greedy vs lazy
**Idea central:** por defecto los cuantificadores son glotones (matchean lo máximo); agregar `?` los vuelve perezosos (lo mínimo), clave al extraer de HTML/JSON.

```typescript
const html = "<a><b>";
const mGreedy = html.match(/<.+>/);
const capturaGreedy = mGreedy ? mGreedy[0] : null;
check("GREEDY /<.+>/ sobre '<a><b>' captura DE MÁS", capturaGreedy, "<a><b>");
```

### 2.5 Validar datos
**Idea central:** un validador real combina clase (QUÉ caracteres) + cuantificador (CUÁNTOS) + anclas `^...$` (sobre TODO el dato) para rechazar falsos positivos.

```typescript
const reSku = /^[A-Z]{2}-\d{4}$/;
checkMatch(reSku, "PZ-1234", true);
checkMatch(reSku, "pz-1234", false); // minúsculas: [A-Z] exige mayúsculas
```

### 🚩 Reto M2 — SKU `PZ-####`
Construir un validador para el SKU de OmniPizza: exactamente 2 letras mayúsculas, un guion literal y exactamente 4 dígitos, anclado con `^` y `$`. La estructura sugerida es `^[ ]{ }-[ ]{ }$`. La regex `/CAMBIAME/` queda **sin resolver a propósito** para que el alumno aplique clases, `{n}` y anclas.

---

### 🧠 Síntesis e insights clave — Módulo 2
- Las clases definen "qué caracteres se aceptan".
- Cuantificar mal produce falsos positivos.
- `greedy` muerde de más; usa lazy `?` o clases negadas.

> 🌉 **Puente a otros lenguajes — Módulo 2**
> - **Java / Python:** clases POSIX `[[:digit:]]` (= `[0-9]`), `[[:alpha:]]`, `[[:alnum:]]`. JavaScript no las soporta; usa `\d`, clases explícitas o `\p{...}`.
> - **Comportamiento Unicode de `\d` / `\w`** que varía entre motores: en JavaScript son ASCII y la flag `u` no los amplía; en otros (p.ej. .NET) pueden incluir letras/dígitos Unicode por defecto. No asumas el mismo comportamiento al portar una regex.

> ⚠️ **El recordatorio que más te va a salvar:** en JavaScript la flag `u` **NO** convierte `\w`/`\d` en Unicode: siguen siendo ASCII (`café` no pasa `^\w+$` ni con `u`). El arreglo real para letras internacionales es `\p{L}` **con** la flag `u`. Se profundiza en M07.

---

## Módulo 3 · Grupos, captura y alternancia

> **Analogía QA:** tu kit de extracción de evidencia. Acotas el "o", capturas solo lo que vas a usar, nombras tus campos para que las aserciones se lean solas, y comparas texto consigo mismo. Eso es, literalmente, parsear.

### 3.1 Grupos y alternancia
**Idea central:** el `|` tiene la precedencia más baja y parte la regex entera; los paréntesis `()` acotan su alcance.

```typescript
const reSinGrupo = /^QA|UAT|PROD$/;
checkMatch(reSinGrupo, "QA-staging", true); // ⚠️ cuela: cumple "^QA"
```

### 3.2 Captura vs no-captura
**Idea central:** `(?:...)` agrupa sin guardar, preservando la numeración de los grupos de captura (evita el bug silencioso de índices desplazados).

```typescript
const reConNoCaptura = /^(?:ORD|ord)-(\d+)$/;
const mNoCap = "ORD-456".match(reConNoCaptura);
check("número en grupo 1 (m[1])", mNoCap ? mNoCap[1] : null, "456");
```

### 3.3 Grupos nombrados
**Idea central:** los grupos nombrados `(?<nombre>...)` desacoplan la extracción de los índices posicionales; las aserciones quedan auto-documentadas.

```typescript
const reOrden = /^(?<prefijo>ORD)-(?<anio>\d{4})-(?<folio>\d{4})$/;
const m = "ORD-2026-0456".match(reOrden);
if (m && m.groups) {
  check("prefijo", m.groups.prefijo, "ORD");
}
```

### 3.4 Retro-referencias
**Idea central:** una retro-referencia (`\1`, `\k<nombre>`) fuerza a matchear el mismo texto ya capturado: comparar una parte consigo misma.

```typescript
const reDup = /\b(\w+)\s+\1\b/;
checkMatch(reDup, "el el", true); // misma palabra repetida
checkMatch(reDup, "el la", false); // distintas → no es duplicado
```

### 3.5 Extraer de logs
**Idea central:** los grupos nombrados convierten líneas de log no estructuradas en objetos tipados; `matchAll` + flag `g` lo aplica a todas las ocurrencias.

```typescript
const reOrden = /(?<timestamp>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z).*(?<orderId>ORD-\d{4}-\d{4}).*total=(?<monto>\d+\.\d{2})/;
const m = LINEA_LOG_ORDEN.match(reOrden);
if (m && m.groups) {
  check("timestamp", m.groups.timestamp, "2026-06-16T14:30:01Z");
}
```

### 🚩 Reto M3 — parsear una línea de log a objeto
Parsear una línea de ejecución de prueba a un objeto `LogTest` tipado con seis grupos nombrados (`timestamp`, `archivo`, `linea`, `nombre`, `duracionMs`, `status`). La regex `/CAMBIAME/` queda **sin resolver a propósito**; se verifica cuando el objeto parseado coincide exactamente con el esperado.

---

### 🧠 Síntesis e insights clave — Módulo 3
- **Capturar = parsear.**
- Los grupos nombrados hacen las aserciones **auto-documentadas**.
- Usa no-captura `(?:...)` cuando **solo agrupas**.

> 🌉 **Puente a otros lenguajes — Módulo 3**
> - Java: `m.group("nombre")`
> - Python: `m.group('nombre')` / `m.groupdict()`
> - Ojo con la disponibilidad de grupos nombrados según la versión.

---

## Módulo 4 · Anclas y banderas

> **Analogía QA:** las anclas son el control de aduana (abren toda la maleta) y las flags son los ajustes de tu lupa. Elegir mal una flag no rompe la prueba de forma ruidosa: la hace **mentir en silencio**.

### 4.1 Anclas `^` `$`
**Idea central:** las anclas son marcadores de posición de ancho cero que distinguen "contiene" (sin anclas) de "es exactamente" (con `^` y `$`).

```typescript
const reEsExacto = /^\d+$/;
check("/^\\d+$/ .test('abc123') (exacto)", reEsExacto.test("abc123"), false);
```

### 4.2 Límites de palabra `\b` `\B`
**Idea central:** `\b` matchea el borde entre caracter de palabra y no-palabra, permitiendo matchear palabras completas y no subcadenas.

```typescript
const rePalabraSuelta = /\bERROR\b/;
checkMatch(rePalabraSuelta, "ERRORLEVEL", false);
```

### 4.3 Flags `i` `g`
**Idea central:** `i` ignora mayúsculas en todo el patrón; `g` encuentra todas las ocurrencias, pero tiene **estado** (`lastIndex`) que puede sorprender si reusas la misma instancia.

```typescript
const reErrorCI = /error/i;
checkMatch(reErrorCI, "ERROR", true);
```

### 4.4 Flags `m` `s`
**Idea central:** `m` hace que `^`/`$` anclen por línea (no por texto); `s` hace que `.` cruce `\n`. Son mecanismos independientes y opuestos.

```typescript
const reTimestampMul = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z/gm;
const timestamps = LOG_BLOB.match(reTimestampMul);
check("con /m hay un timestamp por línea (6)", timestamps?.length ?? 0, 6);
```

### 4.5 Flags `u` `y`
**Idea central:** `u` trata el input por punto de código (clave para emojis y caracteres astrales); `y` (sticky) matchea solo en `lastIndex` exacto, sin saltar huecos (tokenizers).

```typescript
checkMatch(/^.$/u, "🍕", true);
```

### 🚩 Reto M4 — cupón `ABC123`
Validar cupones de OmniPizza con formato exacto: 3 letras mayúsculas seguidas de 3 dígitos, anclado con `^` y `$` para rechazar casos como `"ABC123extra"`. La regex `/CAMBIAME/` queda **sin resolver a propósito**: todos los válidos deben pasar y todos los inválidos rechazarse.

---

### 🧠 Síntesis e insights clave — Módulo 4
- Sin anclas validas subcadenas, no el dato completo.
- Las flags mal elegidas hacen que las pruebas "mientan".
- `g` + `lastIndex` tiene estado (cuidado al reusar la misma regex).

> 🌉 **Puente a otros lenguajes — Módulo 4**
> - **Java:** `Pattern.MULTILINE` / `CASE_INSENSITIVE` / `DOTALL`; `matches()` (ancla implícita, exige coincidencia total) vs `find()` (busca subcadena).
> - **Python:** `re.M` / `re.I` / `re.S`; `fullmatch` (todo el texto, como anclar con `^...$`) vs `search` (en cualquier posición).
>
> 💡 En Java y Python tienes métodos que anclan **implícitamente** (`matches`, `fullmatch`). En JavaScript no existe ese atajo: el anclaje es tu responsabilidad con `^` y `$`.

---

## Módulo 5 · Lookaround

> **Analogía QA:** el lookaround es el `expect(...).toBeVisible()` de las regex: **aseveras** algo sobre el contexto sin interactuar con él. Confirmas la condición y sigues, sin "consumir" lo que verificaste.

### 5.1 Lookahead positivo `(?=...)`
**Idea central:** afirma que algo "viene seguido de X" sin consumir X; verifica el contexto y deja el cursor en su lugar.

```typescript
const reAntesDePx = /\d+(?=px)/;
const m1 = "font-size: 16px".match(reAntesDePx);
check("extrae el número antes de 'px'", m1 ? m1[0] : null, "16");
```

### 5.2 Lookahead negativo `(?!...)`
**Idea central:** afirma que algo "**NO** viene seguido de X" — una lista negra que confirma una ausencia en el contexto sin consumir texto.

```typescript
const reOrderOk = /^(?!.*failed).*order.*$/;
checkMatch(reOrderOk, "INFO order ORD-1 created", true);
checkMatch(reOrderOk, "ERROR order ORD-2 failed", false);
```

### 5.3 Lookbehind `(?<=...)` / `(?<!...)`
**Idea central:** mira hacia atrás: afirma lo que debe (o no) venir antes de una posición, sin consumirlo; ideal para extraer tras una etiqueta.

```typescript
const reMonto = /(?<=total=)\d+\.\d{2}/;
const mMonto = LINEA_LOG_ORDEN.match(reMonto);
check("monto tras 'total=' (lookbehind)", mMonto ? mMonto[0] : null, "249.00");
```

### 5.4 Política de contraseñas (múltiples lookahead)
**Idea central:** apilar lookaheads independientes de ancho cero anclados al inicio crea un AND lógico: cada `(?=.*X)` exige que X exista en algún lugar.

```typescript
const rePassword = /^(?=.*\d)(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/;
checkMatch(rePassword, "Pizza123!", true);
checkMatch(rePassword, "pizza", false);
```

### 5.5 Enmascarar PII (lookaround + replace)
**Idea central:** combinar lookaround con `.replace()` enmascara datos sensibles conservando la estructura (deja solo la pista mínima útil, como los últimos 4 dígitos).

```typescript
const reEnmascararTarjeta = /\d(?=(?:\D*\d){4})/g;
const tarjeta0 = TARJETAS[0].replace(reEnmascararTarjeta, "*");
check("tarjeta 0 deja últimos 4", tarjeta0, "**** **** **** 1111");
```

### 🚩 Reto M5 — controles de seguridad
Completar dos controles para OmniPizza: (a) validar contraseñas contra la política corporativa apilando lookaheads (≥8, mayúscula, dígito, símbolo) y (b) enmascarar el email incrustado en una línea de log sin exponer usuario ni dominio. Las regex y reemplazos marcados `// TODO:` quedan **sin resolver a propósito**.

---

> 🌉 **Puente a otros lenguajes — Módulo 5**
> - **Lookbehind:** Python `re` exige **ancho fijo**; Java permite **ancho acotado**; JavaScript permite **ancho variable**. El mismo `(?<=Precio:\s*)\d+` que funciona en Node fallaría en Python `re`.
> - El módulo **`regex`** de Python (paquete externo, no el estándar `re`) sí admite lookbehind de ancho variable: la alternativa más flexible al portar estos patrones.

### 🧠 Síntesis e insights clave — Módulo 5
- El lookaround **asevera sobre el contexto sin consumirlo**.
- Ideal para **validaciones compuestas** (p.ej. política de contraseñas).
- Ojo con la **portabilidad del lookbehind** entre motores.

> **Errores comunes que ya sabes evitar:** pensar que el lookahead "se lleva" lo que verifica (es de ancho cero); olvidar el backtracking (`\d+(?!px)` no basta; necesitas `\d+(?!\d*px)`); asumir que tu lookbehind variable es portable; y dar por hecho que la PII desapareció sin añadir aserciones de seguridad (`includes(...) === false`).

---

## Módulo 6 · Regex en pruebas

> **Analogía QA:** tu cinturón de herramientas. Ya sabes **validar** la entrada, **leer** los logs cuando algo revienta, **estabilizar** los snapshots y **transformar** texto a tu antojo. Esto es el día a día de quien automatiza en serio.

### 6.1 Validar datos de prueba
**Idea central:** un "guardia de la puerta" con regex ancladas y específicas para cada campo real (email, teléfono por mercado, fecha ISO, UUID v4, JWT, URL).

```typescript
const reEmail = /^[^@\s]+@[^@\s]+(\.[^@\s]+)+$/;
checkMatch(reEmail, email, true);  // para EMAILS_VALIDOS
checkMatch(reEmail, email, false); // para EMAILS_INVALIDOS
```

```typescript
const reUuidV4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
checkMatch(reUuidV4, u, true); // para UUIDS_V4_VALIDOS
```

### 6.2 Parsear logs y traces
**Idea central:** extraer y estructurar info de salida no estructurada (test fallido, conteo de warnings, frames de stack trace) con grupos de captura y `matchAll`.

```typescript
const reFrame = /([\w./-]+):(\d+):(\d+)/g;
for (const m of STACK_TRACE.matchAll(reFrame)) {
  frames.push({ archivo: m[1], linea: Number(m[2]), columna: Number(m[3]) });
}
check("frame[0]", frames[0], { archivo: "pages/CheckoutPage.ts", linea: 54, columna: 12 });
```

### 6.3 Scrubbing de snapshots
**Idea central:** reemplazar datos volátiles (timestamps, UUIDs, order IDs) por placeholders estables para matar los tests intermitentes (mides estructura, no ruido).

```typescript
const reTimestamp = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z/g;
function scrub(texto: string): string {
  return texto
    .replace(reTimestamp, "<TIMESTAMP>")
    .replace(reUuid, "<UUID>")
    .replace(reOrderId, "<ORDER_ID>");
}
check("snapshot A scrubbeado == canónico", scrub(snapshotCorridaA), ESPERADO);
```

### 6.4 Validación data-driven
**Idea central:** una tabla de casos (input, esperado, descripción) + un bucle con una sola regex = una matriz de regresión que crece con cada bug.

```typescript
const reSku = /^[A-Z]{2}-\d{4}$/;
for (const caso of TABLA_SKU) {
  console.log(`· ${caso.descripcion}`);
  checkMatch(reSku, caso.input, caso.debeCoincidir);
}
```

### 6.5 Replace avanzado
**Idea central:** ir más allá del string fijo con grupos nombrados en el reemplazo (`$<nombre>`), función replacer (cálculos), `matchAll` y `replaceAll`.

```typescript
const reTotal = /total=(\d+\.\d{2})/g;
const conImpuesto = "a total=100.00 b total=250.00".replace(
  reTotal,
  (_match, monto: string) => {
    const conIva = (Number(monto) * 1.16).toFixed(2);
    return `total=${conIva}`;
  }
);
check("replacer aplica IVA 16%", conImpuesto, "a total=116.00 b total=290.00");
```

### 🚩 Reto M6 — validar el lote multi-mercado
Completar 5 regex (marcadas `// TODO:`) para un validador data-driven del lote de pedidos de OmniPizza (MX, US, CH, JP): `mercado`, `email`, teléfono por mercado, `sku` y `total`. Solo deben pasar los pedidos genuinamente válidos. Las regex quedan **sin resolver a propósito**.

---

> 🌉 **Puente a otros lenguajes — Módulo 6**
> - **`String.replaceAll` vs flag `g`:** en JS, `replaceAll` reemplaza todas las ocurrencias; si le pasas una regex, esta **debe** llevar la flag `g` (si no, lanza `TypeError`). Con `replace` y `g`, el efecto es el mismo.
> - **Java — `Matcher.replaceAll` con `${nombre}`:** Java soporta grupos nombrados en el reemplazo con `${nombre}` (en JS es `$<nombre>`). Reordenar una fecha ISO: `matcher.replaceAll("${dia}/${mes}/${anio}")`.
> - **Python — `re.sub` con función de reemplazo:** igual que la función replacer de JS, `re.sub(patron, funcion, texto)` deja que una función calcule cada reemplazo.
>
> 💡 La sintaxis cambia entre lenguajes, pero los **conceptos** (anclar, grupos nombrados, replacer, global) son universales.

### 🧠 Síntesis e insights clave — Módulo 6
- **Regex + data-driven = matriz de regresión de validación.** La regla vive una vez; los casos viven en una tabla que crece cada vez que cazas un bug.
- **El scrubbing estabiliza snapshots** (mata los intermitentes). Mides estructura, no ruido.
- **Un replacer-función desbloquea transformaciones complejas.** Cuando un string fijo no alcanza (calcular, numerar, transformar), la función es la salida.

---

## Módulo 7 · Avanzado y seguro

> **Analogía QA:** el salto de "saber escribir regex" a "saber escribir regex que aguanten producción". Una regex no solo debe **funcionar**: debe ser **segura, internacional y revisable** — y a veces, lo correcto es **no usarla**.

### 7.1 Backtracking y ReDoS
**Idea central:** un cuantificador anidado solapado (`(a+)+`) provoca backtracking exponencial cuando el input falla, convirtiendo una validación breve en una denegación de servicio.

```typescript
const REGEX_VULNERABLE = /^(a+)+$/;
const INPUT_QUE_FALLA = REDOS_INPUT_CORTO + "!"; // "aaaaaaaaaa!"
checkMatch(REGEX_VULNERABLE, INPUT_QUE_FALLA, false);
```

### 7.2 Mitigar ReDoS
**Idea central:** eliminar el anidado, anclar, acotar con máximos explícitos y poner una **guarda de longitud** antes de ejecutar la regex.

```typescript
const REGEX_INSEGURA = /^(a+)+$/;
const REGEX_SEGURA = /^a+$/;
checkMatch(REGEX_SEGURA, REDOS_INPUT_CORTO, true);
checkMatch(REGEX_SEGURA, REDOS_INPUT_CORTO + "!", false);
```

```typescript
const reUsernameAcotado = /^[a-z0-9_]{1,20}$/;
checkMatch(reUsernameAcotado, "ana_qa_2026", true);
```

### 7.3 Unicode y propiedades
**Idea central:** `\w`/`\d` son ASCII por defecto; con datos internacionales usa `\p{L}`/`\p{N}` + flag `u`. Además, `.length` "miente" con emojis.

```typescript
const reLetraUnicode = /^\p{L}+$/u;
checkMatch(reLetraUnicode, "México", true);

const soloEmojis = "🍕🎉";
const conU = soloEmojis.match(/./gu); // u: code points → 2 matches
check("'.' con flag u cuenta 2 emojis", conU?.length ?? 0, 2);
```

### 7.4 Regex mantenible
**Idea central:** JS no tiene flag `x`/verbose; arma el patrón por **piezas con nombre** (`new RegExp`) y hazlo **test-driven** (casos antes que patrón).

```typescript
const ANIO = "\\d{4}";
const MES = "(0[1-9]|1[0-2])";
const DIA = "(0[1-9]|[12]\\d|3[01])";
const SEP = "-";
const patronFecha = `^${ANIO}${SEP}${MES}${SEP}${DIA}$`;
const reFechaISO = new RegExp(patronFecha);
for (const f of ["2026-06-16", "2026-01-01", "2026-12-31"]) checkMatch(reFechaISO, f, true);
```

### 7.5 Cuándo NO usar regex
**Idea central:** la regex no puede parsear estructuras anidadas/recursivas (HTML, JSON, XML); para eso usa un parser. Lo avanzado es saber soltarla.

```typescript
const reSpanIngenuo = /<span[^>]*>(.*?)<\/span>/;
const m = reSpanIngenuo.exec(HTML_SNIPPET);
check("la regex ingenua solo ve el PRIMER span (pierde 'x2')", m ? m[1] : null, "Pizza");
```

```typescript
function skuPorParser(jsonTexto: string): string | null {
  try {
    const data = JSON.parse(jsonTexto) as Pedido;
    return data.order?.items?.[0]?.sku ?? null;
  } catch {
    return null;
  }
}
check("parser saca el sku correcto del JSON original", skuPorParser(JSON_SNIPPET), "PZ-1234");
```

> **Capstone del módulo (`ejemplo.ts`):** tras correr las 5 mini-clases, ejecuta un pipeline sobre el lote multi-mercado — **PASO A** validar (regex segura, anclada, con guarda de longitud), **PASO B** parsear (grupos nombrados para email y monto), **PASO C** scrubbear PII conservando texto internacional. Resultado: 2 de 5 pedidos válidos (MX y US); los demás fallan en campos concretos.

### 🚩 Reto M7 — reparar la regex insegura
Arreglar el validador de handles de OmniPizza, hoy vulnerable a ReDoS (`/(\w+)+$/`) y que rechaza nombres internacionales. El alumno debe: (1) **seguridad** — reemplazarla por una equivalente segura (sin anidar, anclada, acotada); (2) **Unicode** — aceptar letras acentuadas y otros alfabetos con `\p{L}` + flag `u`; (3) **data-driven** — pasar los `HANDLES_VALIDOS` (incl. `"México"`, `"Tōkyō"`, `"Zürich2"`) y rechazar los `HANDLES_INVALIDOS`. La pista apunta a la forma `/^[...]{ ... , ... }$/u`. Queda **sin resolver a propósito**.

---

> 🌉 **Puente a otros lenguajes — Módulo 7**
> - **Java:** grupos atómicos `(?>...)`, cuantificadores posesivos `++` (`a++`, `(a+)++`) y el modo de comentarios `(?x)`. Los atómicos y posesivos **eliminan el backtracking de raíz**, así que el ReDoS de 7.1 ni siquiera existe ahí.
> - **Python:** la flag `re.VERBOSE` / `re.X` (comentarios y espacios dentro del patrón, lo que JS no tiene) y el módulo de terceros `regex`, que sí soporta cuantificadores **posesivos**.
> - **Lo que JavaScript NO tiene:** no hay `(?>...)`, no hay `a++`, no hay flag `x`/verbose. Por eso en JS la defensa anti-ReDoS es **diseño** (sin anidar + anclar + acotar) **más guarda de longitud**, y la mantenibilidad se logra con **piezas con nombre** en lugar del modo verbose.

### 🧠 Síntesis e insights clave — Módulo 7
- **Una regex insegura es un bug de seguridad (ReDoS).** Si toca input de usuario y tiene un cuantificador anidado solapado, es una puerta abierta a denegación de servicio.
- **`u` + `\p{...}` es obligatorio con datos internacionales.** `\w`/`\d` son ASCII; sin Unicode property escapes, rechazas clientes reales de México, Zürich o Tōkyō.
- **Lo verdaderamente avanzado es saber cuándo NO usar regex.** Para estructuras anidadas (HTML, JSON, código) la herramienta correcta es un parser; insistir con regex es la marca del junior.

---

# 🎓 Síntesis global — Cierre del curso

> **Analogía QA:** terminaste de armar tu **caja de herramientas**. No memorizaste símbolos sueltos: aprendiste qué problema de testing resuelve cada pieza. Un QA senior no es el que conoce más metacaracteres, sino el que **elige la herramienta correcta** — incluida la decisión de no usar regex.

## El recorrido completo: un insight por módulo

| Módulo | Tema | El "aha" que te llevas |
| --- | --- | --- |
| **M01 · Fundamentos** | `.test()`, crear regex, case-sensitive | Una regex es una **regla de validación reutilizable**: la defines una vez y la aplicas a N entradas. `.test()` da el veredicto binario, como un assertion. |
| **M02 · Clases y cuantificadores** | `[a-z]`, `\d`, `\w`, `+ * {n,m}`, greedy vs lazy | Las **clases** describen "qué caracteres son válidos en cada posición" y los **cuantificadores** "cuántas veces", sin escribir N tests. Ojo: `\w`/`\d` son ASCII. |
| **M03 · Grupos y alternancia** | `(...)`, `(?:...)`, grupos nombrados, alternancia `\|` | Los **paréntesis** controlan el alcance de `\|` y **qué se extrae**. Un grupo de captura de más **desplaza los índices** y rompe el código silenciosamente. |
| **M04 · Anclas, límites y banderas** | `^ $`, `\b`, flags `i g m s u` | **Anclar** distingue "contiene el patrón" de "el texto **es** exactamente el patrón": así evitas el falso positivo que acepta `"PRODUCTION"` cuando validabas `"PROD"`. |
| **M05 · Lookaround** | `(?=...)`, `(?!...)`, lookbehind | Las **aserciones de ancho cero** verifican contexto **sin consumir** caracteres: apilas condiciones independientes ("y además...") como en una política de contraseñas. |
| **M06 · Regex en pruebas** | validar datos, parsear logs, *scrubbing* | La regex es tu **guardia de calidad** en tres puertas: validar datos antes del test, extraer info de logs/traces y enmascarar PII en snapshots. `[^@\s]+` > `\S+` para emails. |
| **M07 · Avanzado y seguro** | ReDoS, Unicode, mantenible, cuándo NO | Una regex insegura es un **bug de seguridad**; con datos reales `\p{L}`+`u` es obligatorio; y lo más senior es **saber cuándo soltar la regex** (HTML/JSON → parser). |

## 🗺️ Mapa mental: qué herramienta de regex usar para qué problema de testing

Cuando estés frente a un caso real, parte del **problema**, no del símbolo:

```text
┌─ ¿La estructura ANIDA (HTML, JSON, código)? ───────────────────────┐
│   SÍ →  ❌ NO uses regex. Usa un PARSER:                            │
│         JSON.parse / DOMParser / cheerio / jsdom            (M07)   │
│   NO →  el dato es PLANO y regular: sigue abajo ↓                   │
└────────────────────────────────────────────────────────────────────┘
```

| Tu problema de testing | La herramienta | Módulo |
| --- | --- | --- |
| "¿Este texto cumple el formato? sí/no" | `regex.test(texto)` → boolean | M01 |
| "Acepta solo estos caracteres, esta cantidad de veces" | clases `[...]` + cuantificadores `+ * {n,m}` | M02 |
| "El texto **completo** debe ser exactamente esto" | anclar `^ ... $` (evita falsos positivos) | M04 |
| "Match de palabra entera, no subcadena" (`ERROR`, no `ERRORLEVEL`) | límites de palabra `\b ... \b` | M04 |
| "Extraer campos de una línea (fecha, sku, dominio)" | grupos `(...)` y `.match()`; mejor **nombrados** `(?<x>...)` | M03 |
| "Una de varias formas válidas" (`MX\|US\|CH\|JP`) | alternancia `\|` con grupo `(?:...)` | M03 |
| "Validar varias condiciones a la vez sin consumir texto" (password policy) | lookahead `(?=...)` / `(?!...)` | M05 |
| "Enmascarar PII / tokens volátiles en logs y snapshots" | `.replace(/.../g, "<PLACEHOLDER>")` | M06 |
| "Datos internacionales: acentos, otros alfabetos" | `\p{L}` / `\p{N}` con flag `u` | M07 |
| "Input externo: que no me tumbe el servidor" | sin anidar + anclar + acotar `{0,n}` + guarda de longitud | M07 |
| "Estructura anidada o recursiva" | 🚫 **parser, no regex** | M07 |

> **Regla de bolsillo final:** si para entenderlo necesitas contar paréntesis equilibrados, no es trabajo de regex. Y si toca input de usuario, **anclada, acotada y con guarda de longitud** o no la mereces en producción.

## Las tres lecciones que sobreviven al curso

1. **Anclar y acotar lo es casi todo.** El falso positivo (M04) y el ReDoS (M07) nacen de patrones laxos y abiertos. Un `^ ... $` con un `{n,m}` honesto previene los dos.
2. **El dato real no es ASCII en inglés.** Probar solo `"John"` es un test sesgado. `\p{L}`+`u` (M07) es cobertura, no lujo.
3. **La herramienta correcta a veces no es la regex.** Validar/extraer datos planos: sí. Parsear estructuras anidadas: parser. El criterio de **cuándo no usarla** es lo que distingue al QA senior.

---

🎓 **Has completado el curso de Regex para QA.** Ya no escribes regex que "parecen funcionar": escribes regex **seguras, internacionales, mantenibles** — y sabes reconocer cuándo el problema pide otra herramienta.

> **Siguiente paso:** estos patrones reaparecen en **Playwright** (locators, aserciones de URL, filtros de CI). Llevás la caja de herramientas lista.
