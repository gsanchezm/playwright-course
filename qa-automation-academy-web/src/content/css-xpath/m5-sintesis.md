# 5.6 — Síntesis del Módulo 5

> **Módulo 5 · XPath Texto y funciones**

> **Analogía QA:** cerramos el módulo igual que cierras un test run: con un resumen de lo verificado. Ya sabes leer, limpiar y normalizar texto desde XPath — las funciones que separan un locator robusto de uno flaky.

---

## Lo que cubriste

| Mini-clase | Idea clave |
| --- | --- |
| 5.1 text() vs . | `text()=X` ve solo los **nodos de texto directos** (existencial); `.` es el **string-value** completo, hijos incluidos. |
| 5.2 contains() y starts-with() | Coincidencia **parcial**: subcadena **literal** (no regex) y prefijo anclado al inicio de atributo o texto. |
| 5.3 normalize-space() | Anti-flaky: recorta y colapsa whitespace; el precio que `text()` crudo da `0`, normalizado da `1`. |
| 5.4 translate() | Case-insensitive en XPath 1.0 (no hay `lower-case()`); también **borra** caracteres mapeando a vacío. |
| 5.5 position() y last() | Índice **1-based**, `last()` y `[last()-1]`; `[N]` cuenta **por padre**; `(//x)[n]` es global (diverge en jsdom). |
| 🚩 Reto | Seleccionar `$189.00` con `normalize-space()` donde `text()` crudo falla por whitespace. |

---

> 🌉 **Puente a Playwright**
> - **text() exacto / contains:** `page.getByText("...", { exact: true })` vs `page.getByText("...")` (subcadena).
> - **normalize-space:** Playwright **normaliza** el whitespace por ti en `getByText` / `toHaveText`.
> - **case-insensitive:** `page.getByText(/.../i)` con la flag `i` reemplaza el truco de `translate()`.
> - **posición:** `.first()` / `.last()` / `.nth(i)` (cuenta desde **0**) en vez de `[1]` / `[last()]` (desde **1**).

En XPath 1.0 escribes a mano lo que Playwright resuelve nativamente: normalizar texto, ignorar casing, indexar global. Conocer el XPath crudo te hace entender **qué** hace el motor por debajo y depurar cuando un locator de alto nivel no engancha.

---

## 🧠 Síntesis e insights clave — Módulo 5

- `text()=X` mira los **nodos de texto directos** con semántica **existencial** (matchea si **alguno** = X), no los descendientes; para el texto completo usa `.` o `normalize-space(.)`.
- `contains()` es **subcadena literal**, no una regex: nada de comodines ni clases de caracteres.
- `normalize-space()` es el reflejo **anti-flaky #1**: envuelve toda comparación de texto visible para neutralizar el whitespace invisible que el DOM guarda.
- En XPath 1.0 (navegadores) **no** hay `lower-case()` / `matches()` / `ends-with()`: `translate(., "ABC...", "abc...")` es el idiom para case-insensitive.
- La posición es lo **menos estable**: `[N]` cuenta por padre y `(//x)[n]` (global) **diverge en jsdom** — jsdom aproxima la sintaxis, el navegador/Playwright es la verdad del comportamiento.

---

⬅️ Anterior: [Reto M5](/docs/css-xpath/m5-reto)
