# 2.4 — Greedy vs Lazy: el cuantificador glotón

> **Módulo 2 · Clases y cuantificadores**

> **Analogía QA:** un cuantificador *greedy* (glotón) es ese tester que, al pedirle "trae UN log", se trae el archivo entero "por si acaso". Por defecto `*` `+` `?` `{n,m}` son GLOTONES: agarran lo MÁXIMO posible. Ponerles un `?` al lado los vuelve *lazy* (perezosos): agarran lo MÍNIMO. Confundirlos es la causa #1 de bugs al "extraer" de HTML/JSON con regex (te llevas de más).

---

## ¿Qué aprendes?

- La diferencia entre cuantificador glotón (`.+`) y perezoso (`.+?`).
- Por qué el glotón se "pasa" al extraer hasta un delimitador.
- La alternativa más robusta de todas: la **clase negada** `[^x]+`.

---

## 1) El clásico peligro: extraer "una etiqueta" de HTML

Texto con DOS etiquetas: `"<a><b>"`. Queremos extraer SOLO la primera.

```ts
// @file regex-qa-course/modulo-02-clases-cuantificadores/04-greedy-vs-lazy.ts
const html = "<a><b>";

// GREEDY: /<.+>/  →  .+ es glotón, se traga todo hasta el ÚLTIMO '>'.
const mGreedy = html.match(/<.+>/);
// .match() devuelve RegExpMatchArray | null → guardamos el null (strict).
const capturaGreedy = mGreedy ? mGreedy[0] : null;
check("GREEDY /<.+>/ sobre '<a><b>' captura DE MÁS", capturaGreedy, "<a><b>");

// LAZY: /<.+?>/  →  el '?' tras + lo hace perezoso: para en el PRIMER '>'.
const mLazy = html.match(/<.+?>/);
const capturaLazy = mLazy ? mLazy[0] : null;
check("LAZY /<.+?>/ sobre '<a><b>' captura SOLO la primera", capturaLazy, "<a>");
```

> 🧠 Moraleja: si tu objetivo es "hasta el siguiente delimitador", greedy te traiciona. (Aún mejor que lazy: `[^>]+` = "todo menos `>`", lo verás abajo. Y para HTML/JSON anidado de verdad, NO uses regex: gancho M07.)

---

## 2) Mismo fenómeno en JSON: extraer el valor de una clave string

Línea con DOS campos string. Queremos el valor de `"id"` (el primer string).

```ts
// @file regex-qa-course/modulo-02-clases-cuantificadores/04-greedy-vs-lazy.ts
const jsonLinea = '{"id":"ORD-1","name":"pizza"}';

// GREEDY: /"(.+)"/ es glotón: captura desde la primera comilla hasta la ÚLTIMA.
const mJsonGreedy = jsonLinea.match(/"(.+)"/);
const valorGreedy = mJsonGreedy ? mJsonGreedy[1] : null;
check("GREEDY /\"(.+)\"/ se lleva todo entre comillas", valorGreedy, 'id":"ORD-1","name":"pizza');

// LAZY: /"(.+?)"/ para en la siguiente comilla → captura solo "id".
const mJsonLazy = jsonLinea.match(/"(.+?)"/);
const valorLazy = mJsonLazy ? mJsonLazy[1] : null;
check('LAZY /"(.+?)"/ captura solo la primera clave', valorLazy, "id");
```

---

## 3) La alternativa más robusta: clase negada `[^x]+`

En vez de "agarra cualquier cosa y luego frena" (lazy), di directamente "agarra todo MENOS el delimitador". `/<([^>]+)>/` captura `"a"` sin riesgo de backtracking ni de pasarse: `[^>]+` físicamente no puede cruzar un `>`.

```ts
// @file regex-qa-course/modulo-02-clases-cuantificadores/04-greedy-vs-lazy.ts
const mNegada = html.match(/<([^>]+)>/);
const capturaNegada = mNegada ? mNegada[1] : null;
check("CLASE NEGADA /<([^>]+)>/ captura 'a' (la más robusta)", capturaNegada, "a");

// Para extraer TODAS las etiquetas, clase negada + flag g + matchAll:
const todas = [...html.matchAll(/<([^>]+)>/g)].map((m) => m[1]);
check("todas las etiquetas con [^>]+ y matchAll", todas, ["a", "b"]);
```

---

## 4) Comparativa directa greedy vs lazy en conteo

Con la flag `g`, el glotón hace UNA sola coincidencia gigante; el perezoso (o la clase negada) hace una por etiqueta. Es la diferencia entre "1 log enorme" y "N logs separados y útiles".

```ts
// @file regex-qa-course/modulo-02-clases-cuantificadores/04-greedy-vs-lazy.ts
const cuantasGreedy = [...html.matchAll(/<.+>/g)].length; // 1 (se tragó todo)
const cuantasLazy = [...html.matchAll(/<.+?>/g)].length;   // 2 (una por tag)
check("greedy con g → 1 coincidencia (engulló todo)", cuantasGreedy, 1);
check("lazy con g → 2 coincidencias (una por etiqueta)", cuantasLazy, 2);
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-02-clases-cuantificadores/04-greedy-vs-lazy.ts
```

---

## Qué observar

- `.+` es glotón: se extiende hasta el último delimitador posible.
- `.+?` es perezoso: para en el primer delimitador.
- La clase negada `[^delim]+` es la opción más segura: no puede pasarse del delimitador.
- Para HTML/JSON anidado de verdad, regex no es la herramienta (M07).

⬅️ Anterior: [2.3 Cuantificadores](/docs/regex/m2-cuantificadores) · ➡️ Siguiente: [2.5 Validar datos](/docs/regex/m2-validar-datos)
