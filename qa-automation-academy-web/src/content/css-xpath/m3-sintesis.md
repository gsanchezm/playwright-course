# 3.6 — Síntesis del Módulo 3

> **Módulo 3 · CSS Pseudo-clases**

> **Analogía QA:** cerramos el módulo igual que cierras un test run: con un resumen de lo verificado. Ya distingues **estado**, **posición** y **relación**, las tres preguntas que una pseudo-clase puede responder sobre un elemento.

---

## Lo que cubriste

| Mini-clase | Idea clave |
| --- | --- |
| 3.1 Pseudo-clases de estado | `:checked` (2), `:disabled` (4), `:enabled`, `:focus` (0 sin interacción); en Playwright prefieres `toBeChecked()` / `toBeDisabled()`. |
| 3.2 nth-child vs nth-of-type | `:first/:last-child`; con hermanos de **tipo mixto** las dos cuentas **divergen** (el `.price` es `nth-child(5)` con badge, `nth-child(4)` sin él). |
| 3.3 La fórmula An+B | `odd`/`even` ≡ `2n+1`/`2n`; `:nth-last-child` cuenta desde el final; `:nth-of-type(3)` **no** es "la 3ª pizza". |
| 3.4 :not(), :is(), :where() | `:not()` niega (encadenado o con lista, estricto); `:is()` agrupa (OR); `:where()` = mismo match, especificidad 0; `:is`/`:where` son **forgiving**. |
| 3.5 :has() | El selector **relacional** ("el padre que…"): compone con estado y con hermanos (`+`, `~`); `:has-text()`/`:text-is()` son de Playwright, no CSS. |
| 🚩 Reto | Aislar 1 card con `:has(.badge--sin-gluten)` + `:not([data-sold-out])`. |

---

> 🌉 **Puente a Playwright / Selenium**
> - **Playwright:** las pseudo-clases CSS estándar funcionan en `page.locator("css=...")`; además su motor añade pseudos **propias** (`:has-text()`, `:text-is()`, `:visible`) que **solo** existen ahí. Para estado, el idiomático no es el selector sino el matcher: `toBeChecked()`, `toBeDisabled()`, `toBeFocused()`.
> - **Selenium:** acepta selectores CSS vía `By.cssSelector(...)`, pero el soporte de `:has()` depende del navegador; para estado usa `element.is_selected()` / `is_enabled()`.

En ambos mundos la idea es la misma: una pseudo-clase responde "¿en qué **estado** está?", "¿en qué **posición**?" o "¿con quién se **relaciona**?" — y cuando se trata de *afirmar* estado, prefieres el matcher de la herramienta antes que el selector crudo.

---

## 🧠 Síntesis e insights clave — Módulo 3

- Una pseudo-clase de **estado** (`:checked`, `:disabled`, `:focus`) describe la **condición** del elemento, no su markup; en una prueba real se **afirma** con el matcher, no con el selector.
- `:nth-child` cuenta **todos** los hermanos; `:nth-of-type` cuenta solo los del **mismo tipo**: en cuanto el markup mezcla tipos (un badge opcional), las dos cuentas **divergen** y la posición se vuelve frágil.
- `:nth-of-type(n)` es "n-ésimo **hermano de su tipo**", nunca "el n-ésimo registro de negocio": CSS no tiene un nth filtrado por clase o dato.
- `:is()` / `:where()` agrupan (OR) y son **forgiving**; `:not()` niega y es **estricto**. `:where()` matchea igual que `:is()` pero con **especificidad 0**.
- `:has()` es el selector **relacional**: sube del descendiente al ancestro y compone con estado y combinadores de hermano — la pieza que faltaba para escribir locators que expresan "el contenedor que tiene *esto*".

---

⬅️ Anterior: [Reto M3](/docs/css-xpath/m3-reto)
