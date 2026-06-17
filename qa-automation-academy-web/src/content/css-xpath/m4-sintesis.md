# 4.6 — Síntesis del Módulo 4

> **Módulo 4 · XPath Fundamentos**

> **Analogía QA:** cerramos el módulo igual que cierras un test run: con un resumen de lo verificado. Ya tienes la base de XPath para direccionar el árbol donde CSS no llega — por texto, por padre y por atributo.

---

## Lo que cubriste

| Mini-clase | Idea clave |
| --- | --- |
| 4.1 Por qué XPath | CSS no lee texto ni sube al padre; XPath sí (`normalize-space()`, `..`). |
| 4.2 Absoluto vs relativo | `/` = hijo directo; `//` = cualquier profundidad; `.` self, `..` padre. El relativo es el robusto. |
| 4.3 Predicados e índices | `[ ]` filtra; índices **1-based**; `//x[n]` es "el n-ésimo de **cada** padre". |
| 4.4 Atributos | `[@data-testid='...']` exacto; `[@class='...']` falla con multi-clase → usa `contains(@class,...)`. |
| 4.5 XPath en herramientas | Misma cadena en Playwright (`xpath=`/`//`), Selenium (`By.xpath`) y DevTools (`$x`); `.//` vs `//` al encadenar; todo XPath 1.0. |
| 🚩 Reto | Anclar **un** elemento por su `@data-testid` (botón Sign In o card agotada). |

---

> 🔷 **La divergencia que debes recordar**
> `(//x)[n]` significa "el n-ésimo **global**", distinto de `//x[n]` ("el n-ésimo de cada padre"). Nuestro motor offline (**jsdom**) evalúa mal los paréntesis: trata `(//x)[n]` como `//x[n]`. Por eso el curso **no** hace `check()` de formas con paréntesis. La **verdad** del comportamiento la dan el navegador (DevTools `$x`), Playwright (`xpath=`) y Selenium (`By.xpath`), que delegan en el `document.evaluate` real. Lema: **jsdom = aproximador de sintaxis; navegador/Playwright = verdad del comportamiento.**

---

> 🌉 **Puente a otras herramientas**
> - **Playwright:** `page.locator("xpath=//...")` o el atajo `page.locator("//...")`; encadenado con `.locator(".//...")`.
> - **Selenium:** `driver.findElement(By.xpath("//..."))`.
> - **DevTools:** `$x("//...")` en la consola del navegador.

En las tres, la **expresión** XPath es idéntica y el motor es **XPath 1.0** (tienes `contains`, `starts-with`, `normalize-space`, `translate`; **no** `lower-case()`, `matches()` ni `ends-with()`).

---

## 🧠 Síntesis e insights clave — Módulo 4

- XPath **no reemplaza** a CSS: lo complementa cuando necesitas **texto**, **ascenso al padre/ancestro** o **ejes**. CSS por defecto, XPath cuando el árbol lo pide.
- Prefiere el **relativo** (`//` + predicado de atributo o texto). Un XPath **absoluto** (`/html/body/...`) es el locator más frágil: cualquier envoltorio nuevo lo rompe.
- Cuidado con dos trampas de igualdad: índices **por-padre** (`//x[n]`) frente a **global** (`(//x)[n]`), y `@class` que compara el string **entero** (usa `contains(@class,...)` con multi-clase).

---

⬅️ Anterior: [Reto M4](/docs/css-xpath/m4-reto)
