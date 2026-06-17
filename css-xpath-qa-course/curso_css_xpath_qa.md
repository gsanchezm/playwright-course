# Curso de CSS Selectors y XPath para QA: de "clic a ciegas" a localizadores que aguantan producción

**Público objetivo:** QA / automatizadores de pruebas que quieren dominar los **localizadores** (CSS y XPath) en su contexto real: encontrar el elemento correcto, una sola vez, y que el selector **siga encontrándolo** después del próximo refactor.

**Objetivo:** aprender CSS y XPath **ejecutando y verificando**. Cada ejemplo es una micro-aserción (`✅`/`❌`), igual que un test run. Los selectores corren **offline** con jsdom contra un fixture estático de **OmniPizza** — el mismo vocabulario (pizzas, carrito, login, checkout, mercados MX/US/CH/JP) de extremo a extremo.

> 📋 Consulta `README.md` para instalación y cómo correr los módulos.
> 📋 Consulta `cheatsheet.md` como referencia rápida de sintaxis (CSS, XPath y la tabla de equivalencias con Playwright).
> Esta página es el **overview** del curso: qué es, para quién, los 8 módulos en una tabla, cómo ejecutarlo y el marco mental **jsdom vs navegador** que atraviesa todo.

---

## ¿Qué es este curso y para quién es?

Es un curso de **localizadores para pruebas de software**: los selectores **CSS** y las expresiones **XPath** que escribes dentro de `page.locator(...)`, `By.cssSelector(...)`, `By.xpath(...)` o la consola de DevTools. No es teoría de CSS de maquetado: es **localizar para automatizar**.

Todos los ejemplos usan una app de ejemplo — **OmniPizza** — aplanada en un único fixture HTML estático (`fixtures/omnipizza.html`): catálogo de 4 pizzas, carrito, formularios de login y checkout, toppings, métodos de pago y footer. Practicas los selectores **sin red, sin navegador y sin JavaScript de la app**, contra un DOM real cargado en jsdom.

Está dirigido a:

- **QA / automatizadores** que quieren localizadores robustos (no como teoría suelta, sino como la pieza que más rompe sus pruebas).
- Quien viene de los cursos hermanos de **TypeScript** y **Regex para QA** y quiere el siguiente ladrillo antes de **Playwright**.
- Cualquiera que sepa lo básico de la terminal y quiera aprender CSS/XPath **ejecutando y verificando**, no solo leyendo.

> Los ejemplos corren con jsdom, pero la **sintaxis** es la misma que escribes en Playwright y Selenium: la cadena transfiere 1:1. El `cheatsheet.md` incluye la tabla de equivalencias **CSS ↔ XPath ↔ Playwright**.

---

## Los 8 módulos

El curso es una progresión: del CSS más simple, a XPath donde CSS no llega, hasta el criterio de **resiliencia** y las técnicas del 1%.

| Módulo | Tema | El "aha" que te llevas |
| --- | --- | --- |
| **M01 · CSS Fundamentos** | DOM como árbol; tipo, clase, id; agrupación y universal; `querySelector` vs `All` | Un selector describe una **posición** en el árbol (tipo/clase/id/relación), no un texto plano. `querySelector` da uno; `querySelectorAll` da una colección **estática**. |
| **M02 · CSS Atributos y combinadores** | `[attr]`, operadores `^= $= *= ~= \|=`, descendiente/hijo, hermanos | Engánchate a **datos** (`data-testid`), no a clases visuales. `\|=` es "idioma", **no** "empieza con" (eso es `^=`). El espacio (descendiente) resiste; `>` (hijo) es frágil. |
| **M03 · CSS Pseudo-clases** | estado, estructurales, fórmula An+B, `:not/:is/:where`, `:has` | Una pseudo-clase responde **estado**, **posición** o **relación**. `:nth-of-type(3)` **no** es "la 3.ª pizza". `:has()` es el selector **relacional**: "el contenedor que tiene *esto*". |
| **M04 · XPath Fundamentos** | por qué XPath, absoluto vs relativo, predicados e índices, atributos | XPath lee **texto** y sube al **padre** donde CSS no llega. Prefiere el **relativo** (`//` + predicado); el absoluto (`/html/body/...`) es el locator más frágil. Índices **1-based**. |
| **M05 · XPath Texto y funciones** | `text()` vs `.`, `contains`/`starts-with`, `normalize-space`, `translate`, `position`/`last` | `text()='X'` es **existencial** sobre nodos de texto directos; para el texto completo usa `.`. `normalize-space()` es el reflejo **anti-flaky**. XPath 1.0: **no** hay `lower-case()`. |
| **M06 · XPath Ejes** | modelo de ejes, padre/ancestro, hermanos, following/preceding/descendant, ancla-y-navega | Un eje es una **dirección** en el árbol. El patrón pro **ancla-y-navega**: texto humano estable + salto por eje al elemento accionable. `following-sibling::` ≠ `following::`. |
| **M07 · CSS vs XPath y resiliencia** | tabla comparativa, clase exacta en XPath, rendimiento, **escalera de resiliencia**, depurar contando | CSS y XPath **se reparten el trabajo**. La resiliencia es una **escalera**: testid › rol+nombre › texto › estructura. Antes de confiar en un selector, **cuenta** sus matches. |
| **M08 · Técnicas del 1%** | selector pivot/ancla, `:has()` alcanza XPath, XPath dinámico, Shadow DOM, iframes y relative locators | Construye **bottom-up**: ancla en lo estable y compón por **condiciones** (`:has():not()` ↔ `[A and not(B)]`). Conoce los **límites de documento**: shadow e iframes no se cruzan con selectores estándar. |

Cada módulo tiene **5 mini-clases** (`01-*.ts` … `05-*.ts`), un **runner** `ejemplo.ts` (lo que ejecuta `pnpm mN`) y un **reto** `reto.ts` con TODOs intencionalmente sin resolver.

---

## Cómo ejecutar el curso

```bash
# 1) Instalar dependencias (TypeScript + tsx + jsdom)
pnpm install

# 2) Ejecutar un módulo completo (corre sus 5 mini-clases en orden)
pnpm m1    # Módulo 1 · CSS Fundamentos
pnpm m2    # Módulo 2 · CSS Atributos y combinadores
pnpm m3    # Módulo 3 · CSS Pseudo-clases
pnpm m4    # Módulo 4 · XPath Fundamentos
pnpm m5    # Módulo 5 · XPath Texto y funciones
pnpm m6    # Módulo 6 · XPath Ejes
pnpm m7    # Módulo 7 · CSS vs XPath y resiliencia
pnpm m8    # Módulo 8 · Técnicas del 1%

# 3) Ejecutar los 8 módulos en secuencia (de corrido)
pnpm verify

# 4) Verificar tipos de TODO el proyecto sin ejecutar nada (tsc --noEmit)
pnpm typecheck
```

Para correr **una sola mini-clase** o **tu reto**, usa `tsx` directamente:

```bash
pnpm tsx modulo-01-css-fundamentos/01-dom-es-un-arbol.ts   # una mini-clase suelta
pnpm tsx modulo-01-css-fundamentos/reto.ts                 # tu reto del módulo
```

> Los scripts `m1`..`m8` apuntan al `ejemplo.ts` de cada módulo (el "runner"). El comando `verify` los encadena con `&&`, así que si un módulo falla, se detiene ahí. El reto es la **excepción**: arranca con un placeholder `CAMBIAME` y es **esperado** ver ❌ hasta que lo resuelvas.

---

## El marco mental: jsdom vs navegador

Este curso corre **offline**, y eso exige una honestidad que vale para toda tu carrera de QA:

- **jsdom es un APROXIMADOR de sintaxis.** Carga `fixtures/omnipizza.html` en un DOM real y resuelve tus selectores con `querySelectorAll` (CSS) y `document.evaluate` (XPath 1.0). Cubre CSS moderno (`:has`, `:is`, `:where`, `:not`, atributos, flag `i`) y casi todo XPath 1.0 (ejes, `contains`, `starts-with`, `normalize-space`, `translate`, `text()` vs `.`).
- **El navegador / Playwright / Selenium son la VERDAD del comportamiento.** Ahí corre el motor real. Playwright `xpath=` delega en el `document.evaluate` del navegador; `By.cssSelector` / `By.xpath` también.

La **única** divergencia conocida es la indexación con paréntesis: `(//x)[n]` significa "el n-ésimo **global**" en el navegador, pero jsdom lo evalúa como `//x[n]` ("el n-ésimo de cada padre"). Por eso el curso **no** hace `check()` de formas con paréntesis: las explica en prosa y con una caja de aviso.

> **Lema del curso:** jsdom = aproximador de **sintaxis**; navegador / Playwright = **verdad del comportamiento**. Validas la sintaxis offline (barato, rápido, sin red); confirmas el comportamiento donde corre tu prueba real.

---

## Recursos del curso

- 📋 `cheatsheet.md` — referencia rápida (combinadores CSS, operadores de atributo con el matiz de `\|=`, pseudo-clases, fórmula An+B, `:has`, XPath: predicados, `text()` vs `.`, funciones de cadena, ejes, padded-class) más la tabla **CSS ↔ XPath ↔ Playwright** y la escalera de resiliencia.
- 📖 `README.md` — arranque del companion: requisitos, instalación, cómo está organizado cada módulo y la nota del fixture.

> **De dónde vienes / a dónde vas:** este curso encaja entre **Regex para QA** y **Automatización con Playwright**. Los selectores que aquí dominas reaparecen en `page.locator(...)`, `getByRole`, `getByTestId` y `getByText` — pero ya entenderás **qué** hace el motor por debajo y cómo elegir el localizador que sobrevive al siguiente refactor.
