# 4.3 — Banderas `i` (case-insensitive) y `g` (global)

> **Módulo 4 · Anclas y banderas**

> **Analogía QA:** `i` es ponerte gafas que ignoran mayúsculas — `ERROR`, `Error` y `error` se ven igual. `g` es pasar de "encuentra el primero" a "encuéntralos TODOS", como un Ctrl+F que cuenta cada ocurrencia. Pero `g` tiene memoria (`lastIndex`): se acuerda de dónde se quedó.

---

## ¿Qué aprendes?

- Cómo `i` hace la búsqueda insensible a mayúsculas/minúsculas.
- Cómo `g` te permite contar y encontrar TODAS las coincidencias.
- La trampa del estado: `g` guarda `lastIndex` y reusar la misma regex da "fantasmas".

---

## Flag `i`: ignorar mayúsculas/minúsculas

```ts
// @file regex-qa-course/modulo-04-anclas-banderas/03-flags-i-g.ts
// Los logs no siempre normalizan el case del nivel. Con `i`, un solo
// patrón cubre "error", "Error", "ERROR".
const reErrorCI = /error/i;
checkMatch(reErrorCI, "ERROR", true);
checkMatch(reErrorCI, "Error", true);
checkMatch(reErrorCI, "error", true);
// Sin la flag, solo cae la forma EXACTA.
const reErrorCS = /error/;
checkMatch(reErrorCS, "ERROR", false);
checkMatch(reErrorCS, "error", true);
```

---

## Flag `g`: encontrar y contar TODAS las ocurrencias

```ts
// @file regex-qa-course/modulo-04-anclas-banderas/03-flags-i-g.ts
// String.match con flag g devuelve el ARRAY de todas las coincidencias
// (no los grupos). Es la forma rápida de CONTAR.
// En LOG_BLOB hay 3 [INFO], 2 [WARN], 1 [ERROR] (6 líneas en total).
const infos = LOG_BLOB.match(/INFO/g); // string[] | null
const warns = LOG_BLOB.match(/WARN/g);
const errores = LOG_BLOB.match(/ERROR/g);
check("conteo de INFO", infos?.length ?? 0, 3);
check("conteo de WARN", warns?.length ?? 0, 2);
check("conteo de ERROR", errores?.length ?? 0, 1);

// matchAll: itera coincidencias CON sus grupos. REQUIERE flag g
// (sin g lanza TypeError). Aquí capturamos el nivel de cada línea.
const reNivel = /\[(INFO|WARN|ERROR)\]/g;
const niveles = [...LOG_BLOB.matchAll(reNivel)].map((m) => m[1]);
check("niveles en orden de aparición", niveles, [
  "INFO",
  "INFO",
  "WARN",
  "ERROR",
  "WARN",
  "INFO",
]);
```

---

## `g` + `i` juntas: contar sin importar el case

```ts
// @file regex-qa-course/modulo-04-anclas-banderas/03-flags-i-g.ts
const textoMixto = "Error aquí, ERROR allá, error acá, terrorífico";
// ⚠️ Sin \b, "terrorífico" CONTIENE "error" → 4 matches, no 3.
const todosError = textoMixto.match(/error/gi);
check("con g+i (sin \\b) caen 4 (incluye 'tERRORífico')", todosError?.length ?? 0, 4);
// Con \b solo cuentan las 3 palabras sueltas.
const soloPalabra = textoMixto.match(/\berror\b/gi);
check("con g+i+\\b caen solo 3 palabras sueltas", soloPalabra?.length ?? 0, 3);
```

Combinar las flags con `\b` (4.2) es lo que separa un conteo correcto de un falso positivo.

---

## ⚠️ La trampa de `g`: `lastIndex` guarda estado

```ts
// @file regex-qa-course/modulo-04-anclas-banderas/03-flags-i-g.ts
// Con flag g, una MISMA instancia de regex recuerda dónde terminó el
// último match en su propiedad `lastIndex`. Cada .exec() avanza desde ahí
// hasta que devuelve null y entonces lastIndex se REINICIA a 0.
const reEstado = /\d+/g;
const entrada = "a1b22c333";

check("lastIndex inicia en 0", reEstado.lastIndex, 0);

const m1 = reEstado.exec(entrada); // encuentra "1"
check("1er exec captura '1'", m1 ? m1[0] : null, "1");
check("lastIndex tras 1er exec", reEstado.lastIndex, 2);

const m2 = reEstado.exec(entrada); // continúa desde lastIndex → "22"
check("2do exec captura '22'", m2 ? m2[0] : null, "22");
check("lastIndex tras 2do exec", reEstado.lastIndex, 5);

const m4 = reEstado.exec(entrada); // tras consumir todo → null y RESET
```

---

## El bug clásico: reusar una regex `/g` con `.test()`

```ts
// @file regex-qa-course/modulo-04-anclas-banderas/03-flags-i-g.ts
// .test() con flag g TAMBIÉN avanza lastIndex. Si reusas la MISMA
// instancia, el 2º .test() empieza donde quedó el 1º → resultado distinto
// sobre el MISMO input. Por eso checkMatch usa una copia SIN g.
const reBug = /1/g;
const primero = reBug.test("1"); // true, lastIndex → 1
const segundo = reBug.test("1"); // false: ya no hay '1' desde índice 1
check("1er .test('1') con /g", primero, true);
check("2do .test('1') con /g (¡mismo input, otro resultado!)", segundo, false);
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-04-anclas-banderas/03-flags-i-g.ts
```

---

## Qué observar

- `i` hace que un solo patrón cubra `error`, `Error` y `ERROR`.
- `String.match` con `g` devuelve el **array** de coincidencias: la forma rápida de contar.
- `matchAll` **requiere** `g` (sin él lanza `TypeError`) y te da los grupos de cada coincidencia.
- Una misma regex con `g` tiene **estado** (`lastIndex`): el segundo `.test()` sobre el MISMO input puede dar otro resultado. Reinicia `lastIndex` o usa una instancia nueva.

⬅️ Anterior: [4.2 Límites de palabra](/docs/regex/m4-limites-de-palabra) · ➡️ Siguiente: [4.4 Flags `m` y `s`](/docs/regex/m4-flags-m-s)
