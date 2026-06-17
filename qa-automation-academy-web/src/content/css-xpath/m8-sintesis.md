# 8.6 — Síntesis del Módulo 8

> **Módulo 8 · Técnicas del 1%**

> **Analogía QA:** cerramos el módulo —y el curso— igual que cierras un test run de élite: con el resumen de las técnicas que separan al automatizador del 1%. Ya no escribes selectores que "parecen funcionar": anclas en texto, compones condiciones y sabes exactamente qué herramienta cruza (o no) un shadow root o un iframe.

---

## Lo que cubriste

| Mini-clase | Idea clave |
| --- | --- |
| 8.1 Selector pivot/ancla | Construye **bottom-up**: ancla en un texto único y sube con `ancestor::` (XPath) o `:has()` (CSS); luego baja al objetivo. Sobrevive al reordenamiento. |
| 8.2 :has() alcanza a XPath | `:has()` + `:not()` (CSS) ↔ `[ .//X and not(@a) ]` (XPath): componer por **condiciones**, no por posición. `input:checked:not([disabled])`. |
| 8.3 XPath dinámico | `concat()` para comillas/apóstrofes (sin backslash); predicados `and`/`or`; `translate()` para case-insensitive; `(//x)[n]` ≠ `//x[n]` (jsdom no distingue). |
| 8.4 Shadow DOM | CSS/XPath estándar no cruzan el shadow; `>>>`/`/deep/`/`::shadow` muertos (Chrome 89); el `>>` de Playwright es separador de engines; `getByRole` perfora porque **todos** sus locators lo hacen por diseño. |
| 8.5 iframes y relative locators | Los selectores no cruzan documentos → `frameLocator`/`switchTo`; relative locators (above/below/near) son frágiles; prefiere relación **estructural** por ejes. |
| 🚩 Reto | Aislar el `add-to-cart` de la única pizza sin gluten disponible: ancla de texto + composición `:has():not()` / multi-predicado. |

---

> 🌉 **Puente a las herramientas reales**
> - **Playwright:** `page.locator("css=...")` perfora open shadow; `page.locator("xpath=...")` y `css:light` no; `frameLocator("iframe")` para entrar a frames; `>>` encadena engines.
> - **Selenium 4:** `element.getShadowRoot()` (solo CSS dentro); `driver.switchTo().frame(...)`; `RelativeLocator.with(...).below(...)` (frágil, último recurso).

En ambas, la idea senior es la misma: ancla en lo estable (texto/rol/testid), compón condiciones en vez de contar posiciones, y reconoce los **límites de documento** (shadow, iframe) antes de culpar a tu selector.

---

## 🧠 Síntesis e insights clave — Módulo 8

- **Bottom-up gana.** Un selector que parte de un **ancla de texto** y navega por relación (eje / `:has()`) es más resiliente que cualquier cadena posicional desde la raíz.
- **Componer por condiciones ↔ predicados.** `:has():not()` en CSS y `[ A and not(B) ]` en XPath son la misma idea; aprendido uno, traduces al otro. Eso es el "selector de élite".
- **Conoce los límites del documento.** CSS/XPath estándar no cruzan shadow ni iframes; `>>>`/`/deep/` están muertos; `getByRole` perfora open shadow porque **todos** los locators de Playwright lo hacen por diseño, no por el accessibility tree.
- **jsdom aproxima la sintaxis; el navegador es la verdad.** La divergencia de `(//x)[n]` lo recuerda: valida el comportamiento final donde corre tu test real (Playwright/navegador), no en el aproximador.

---

⬅️ Anterior: [Reto M8](/docs/css-xpath/m8-reto) · ➡️ Siguiente: [Síntesis global](/docs/css-xpath/sintesis-global)
