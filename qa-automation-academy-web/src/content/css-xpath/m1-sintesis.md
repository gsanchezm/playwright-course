# 1.6 — Síntesis del Módulo 1

> **Módulo 1 · CSS Fundamentos**

> **Analogía QA:** cerramos el módulo igual que cierras un test run: con un resumen de lo verificado. Ya tienes la base para describir **posiciones** en el árbol del DOM y localizar elementos con los tres selectores fundamentales.

---

## Lo que cubriste

| Mini-clase | Idea clave |
| --- | --- |
| 1.1 El DOM es un árbol | El HTML es un árbol de nodos: padre, hijos, hermanos, descendientes. |
| 1.2 Tipo, clase e id | `h3` (etiqueta), `.pizza-card` (rol/grupo), `#login-form` (único). |
| 1.3 Agrupación y universal | La coma es un OR de selectores; `*` matchea todo (auditar, no localizar). |
| 1.4 querySelector vs All | Uno (el primero) vs todos (colección); el NodeList es una foto **estática**. |
| 1.5 Dónde aparece en QA | El mismo selector en Playwright, Selenium y DevTools; `:has-text()` es de Playwright. |
| 🚩 Reto | Apuntar a las 4 tarjetas exactas con su clase compartida. |

---

> 🌉 **Puente a otras herramientas**
> - **Playwright:** `page.locator(".pizza-card")` (CSS por defecto) o el explícito `page.locator("css=.pizza-card")`.
> - **Selenium:** `driver.findElements(By.cssSelector(".pizza-card"))` / `findElement` (singular).
> - **DevTools:** `$$(".pizza-card")` en la consola = azúcar de `document.querySelectorAll`.

En todas la idea es la misma: defines un **selector CSS** y eliges entre "dame el primero" (singular) o "dame todos" (plural/colección).

---

## 🧠 Síntesis e insights clave — Módulo 1

- El DOM es un **árbol**: un selector describe una **posición** (tipo, clase, id, relación), no un texto plano.
- Los tres selectores base se ordenan por **puntería**: tipo (amplio) → clase (por rol) → id (único).
- `querySelector` da **uno**; `querySelectorAll` da **todos** en una colección **estática** (una foto, no un vínculo vivo).
- El selector que validas offline con `countCss()` es **el mismo** que escribirás en tu framework: la sintaxis transfiere intacta.

---

⬅️ Anterior: [Reto M1](/docs/css-xpath/m1-reto)
