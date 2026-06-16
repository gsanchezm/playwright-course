# Regex Cheat Sheet para QA

Referencia rápida de sintaxis de expresiones regulares. Los ejemplos usan el motor de **JavaScript / TypeScript** (el del curso). Al final, una comparativa con **Java** y **Python**.

> Regla de bolsillo: si validás el dato **completo**, **anclá** con `^ ... $`. Si tocás input de usuario, **anclá, acotá y poné guarda de longitud**.

---

## Clases de caracteres

| Patrón | Significado |
|---|---|
| `[abc]` | UN caracter: `a`, `b` o `c` |
| `[a-z]` | UN caracter en el rango `a`..`z` |
| `[A-Z]` | UN caracter mayúscula |
| `[0-9]` | UN dígito |
| `[a-zA-Z0-9]` | letra (ambos casos) o dígito |
| `[^abc]` | UN caracter que **NO** sea `a`, `b` ni `c` (negación) |
| `[^@\s]` | UN caracter que no sea `@` ni espacio (útil para emails) |

> Una clase vale por **UN** caracter; para varios, agregá un cuantificador (`[a-z]+`).

---

## Clases predefinidas (shorthand)

| Patrón | Equivale a | Negación |
|---|---|---|
| `\d` | dígito `[0-9]` | `\D` (no dígito) |
| `\w` | palabra `[A-Za-z0-9_]` | `\W` (no palabra) |
| `\s` | espacio (espacio, tab, `\n`, …) | `\S` (no espacio) |
| `.` | cualquier caracter **menos** `\n` (salvo flag `s`) | — |

> ⚠️ En JavaScript, `\d` y `\w` son **ASCII**, incluso con la flag `u`. `café` **no** pasa `^\w+$` ni con `u`. Para letras internacionales usá `\p{L}` con `u` (ver abajo).

---

## Cuantificadores

| Patrón | Repeticiones |
|---|---|
| `*` | 0 o más |
| `+` | 1 o más |
| `?` | 0 o 1 (opcional) |
| `{n}` | exactamente `n` |
| `{n,}` | `n` o más |
| `{n,m}` | entre `n` y `m` |

### Greedy vs Lazy

| Patrón | Comportamiento | Sobre `<a><b>` con `<.+>` / `<.+?>` |
|---|---|---|
| `.+` | **greedy** (glotón): muerde lo máximo | `/<.+>/` captura `<a><b>` (de más) |
| `.+?` | **lazy** (perezoso): muerde lo mínimo | `/<.+?>/` captura `<a>` (justo) |
| `[^x]+` | clase negada: alternativa precisa al lazy | extrae hasta el siguiente delimitador |

---

## Anclas y límites

| Patrón | Significado | Recuerda |
|---|---|---|
| `^` | inicio del texto (o de línea con `m`) | posición, no consume caracteres |
| `$` | fin del texto (o de línea con `m`) | `^...$` = "el texto **es** exactamente esto" |
| `\b` | borde de palabra | `/\bERROR\b/` no matchea `ERRORLEVEL` |
| `\B` | anti-borde (dentro de palabra) | subcadena interna |

> Sin anclas validás "**contiene**" el patrón, no el dato completo: `/QA/` matchea `"QA-staging"`. `/^QA$/` no.

---

## Grupos

| Patrón | Tipo | Para qué |
|---|---|---|
| `(...)` | captura | agrupa **y** guarda el texto en `$1`, `$2`… (y `m[1]`, `m[2]`…) |
| `(?:...)` | no-captura | agrupa **sin** guardar (no desplaza índices) |
| `(?<nombre>...)` | nombrado | guarda en `m.groups.nombre`; aserciones auto-documentadas |
| `\1`, `\2` | retroref. posicional | exige el **mismo** texto del grupo 1 (`/\b(\w+)\s+\1\b/` = palabra duplicada) |
| `\k<nombre>` | retroref. nombrada | el mismo texto del grupo nombrado (ej. `password === confirm`) |

> Un grupo de captura de más **desplaza** los índices y rompe el código en silencio. Si solo agrupás, usá `(?:...)`.

---

## Alternancia

| Patrón | Significado |
|---|---|
| `a|b` | `a` **o** `b` |
| `(?:MX|US|CH|JP)` | una de varias opciones (acotada con grupo) |

> ⚠️ El `|` tiene la precedencia **más baja**: `/^QA|UAT|PROD$/` significa `(^QA)` o `(UAT)` o `(PROD$)`, así que cuela `"QA-staging"`. Acotá con paréntesis: `/^(QA|UAT|PROD)$/`.

---

## Lookaround (aserciones de ancho cero)

| Patrón | Tipo | Significado |
|---|---|---|
| `(?=...)` | lookahead positivo | "viene seguido de X" (sin consumir X) |
| `(?!...)` | lookahead negativo | "**NO** viene seguido de X" (lista negra) |
| `(?<=...)` | lookbehind positivo | "viene precedido de X" (sin consumir X) |
| `(?<!...)` | lookbehind negativo | "**NO** viene precedido de X" |

Combos típicos:

- **Política de contraseñas (AND):** `^(?=.*\d)(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$`
- **Extraer tras una etiqueta:** `(?<=total=)\d+\.\d{2}`

> Es de **ancho cero**: verifica el contexto pero no entra en el match. Por eso podés apilar condiciones independientes.

---

## Flags (banderas)

| Flag | Nombre | Efecto |
|---|---|---|
| `g` | global | todas las coincidencias (no solo la primera). Tiene **estado**: `lastIndex` |
| `i` | ignore case | insensible a mayúsculas/minúsculas |
| `m` | multilínea | `^` y `$` anclan **por línea**, no por texto |
| `s` | dotAll | `.` también matchea `\n` (opuesto a parsear línea por línea) |
| `u` | unicode | trata el input por **punto de código**; habilita `\u{...}` y `\p{...}` |
| `y` | sticky | matchea solo en `lastIndex` exacto (sin saltar huecos; tokenizers) |

> Se combinan: `/error/gi`, `/^\d{4}-\d{2}-\d{2}/gm`, `/^\p{L}+$/u`.

---

## Propiedades Unicode `\p{...}` (requieren flag `u`)

| Patrón | Matchea |
|---|---|
| `\p{L}` | cualquier **letra** (de cualquier alfabeto: `é`, `ü`, `ō`, kana…) |
| `\p{N}` | cualquier **número** |
| `\P{L}` | lo que **no** es letra (negación, P mayúscula) |
| `\u{1F355}` | un punto de código por hex (con `u`) |

> `^\p{L}+$` con `u` acepta `"México"`, `"Tōkyō"`, `"Zürich"`. `^\w+$` los rechaza. Ojo: `.length` "miente" con emojis (cuenta unidades UTF-16); contá con `/./gu`.

---

## Escapes (caracteres literales)

| Para matchear… | Escribí |
|---|---|
| `.` literal (punto) | `\.` (ej. `/v1\.2/` matchea `v1.2`, no `v1X2`) |
| metacaracteres `* + ? ( ) [ ] { } ^ $ | \` | precedidos de `\` |
| `\` literal | `\\` |
| en `new RegExp("...")` | **doble** escape: `new RegExp("\\d{4}")` |

> Al construir regex desde datos no confiables, sanitizá primero los metacaracteres del input.

---

## JS vs Java vs Python — puntos clave

| Tema | JavaScript | Java | Python (`re`) |
|---|---|---|---|
| Grupos nombrados (def.) | `(?<x>...)` | `(?<x>...)` | `(?P<x>...)` |
| Acceso a grupo nombrado | `m.groups.x` | `m.group("x")` | `m.group('x')` / `m.groupdict()` |
| Nombrado en reemplazo | `$<x>` | `${x}` | `\g<x>` |
| Lookbehind (ancho) | **variable** | **acotado** | **fijo** (el módulo externo `regex` permite variable) |
| Grupos atómicos | ❌ no existe | `(?>...)` | ❌ (sí en `regex`) |
| Cuantificadores posesivos | ❌ no existe | `a++`, `(a+)++` | ❌ (sí en `regex`) |
| Modo verbose / comentarios | ❌ **no hay flag `x`** | `(?x)` | `re.VERBOSE` / `re.X` |
| Propiedades Unicode `\p{...}` | con flag `u` | sí | ❌ no en `re` stdlib (sí en el módulo `regex`) |
| Anclar "todo el texto" | manual con `^...$` | `matches()` ancla implícito; `find()` busca | `fullmatch()` ancla; `search()` busca |
| Flags multilínea/etc. | `m` `i` `s` | `MULTILINE` `CASE_INSENSITIVE` `DOTALL` | `re.M` `re.I` `re.S` |
| Clases POSIX `[[:digit:]]` | ❌ no soporta | sí | sí |

> En Java los **grupos atómicos** `(?>...)` y **posesivos** `++` eliminan el backtracking de raíz: el ReDoS ni existe. En JavaScript la defensa anti-ReDoS es **diseño** (sin anidar + anclar + acotar) **más guarda de longitud**, y la mantenibilidad se logra con **piezas con nombre** (`new RegExp`) en vez del modo verbose.

---

## Métodos en JavaScript (la regex es la regla; estos son las preguntas)

| Método | Pregunta que responde | Devuelve |
|---|---|---|
| `re.test(str)` | "¿matchea? sí/no" | `boolean` |
| `str.search(re)` | "¿en qué posición?" | índice o `-1` |
| `str.match(re)` | "¿qué capturó?" (1ª coincidencia o todas con `g`) | array o `null` |
| `str.matchAll(re)` | "todas las coincidencias **con grupos**" (requiere `g`) | iterador de matches |
| `str.replace(re, x)` | "reemplazá" (`x` puede ser string con `$1`/`$<n>` o **función** replacer) | string |
| `str.replaceAll(re, x)` | "reemplazá todas" (si pasás regex, **debe** llevar `g`) | string |
| `str.split(re)` | "partí por el patrón" | array |

---

## Comandos del curso

```bash
pnpm install                 # instalar dependencias (TypeScript + tsx)

pnpm m1                      # correr un módulo (1..7); su ejemplo.ts ejecuta las 5 mini-clases
pnpm m7                      # ...

pnpm verify                  # correr los 7 módulos en secuencia
pnpm typecheck               # verificar tipos sin ejecutar (tsc --noEmit)

pnpm tsx modulo-01-fundamentos/01-que-es-regex.ts   # una mini-clase suelta
pnpm tsx modulo-01-fundamentos/reto.ts              # tu reto del módulo
```
