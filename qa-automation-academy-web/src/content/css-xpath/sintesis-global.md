# 🧠 Síntesis global

> **Cierre**

> **Analogía QA:** terminaste de armar tu **caja de localizadores**. No memorizaste símbolos sueltos: aprendiste qué pregunta del DOM responde cada pieza y cuál sobrevive al próximo refactor. Un QA senior no es el que conoce más combinadores, sino el que **elige el localizador correcto** — el más alto de la escalera que de verdad aplica. Esta página es tu mapa para volver a ella frente a un caso real.

---

## El recorrido completo: un insight por módulo

Cada módulo resolvió una pregunta concreta sobre cómo direccionar el árbol del DOM. Visto en conjunto, es una progresión que va del CSS más simple hasta el criterio de resiliencia y las técnicas del 1%.

| Módulo | Tema | El "aha" que te llevas |
| --- | --- | --- |
| **M01 · CSS Fundamentos** | DOM como árbol; tipo, clase, id; `querySelector` vs `All` | Un selector describe una **posición** en el árbol (tipo/clase/id/relación), no un texto plano. `querySelector` da uno; `querySelectorAll` da una colección **estática** (una foto, no un vínculo vivo). |
| **M02 · CSS Atributos y combinadores** | `[attr]`, operadores `^= $= *= ~= \|=`, descendiente/hijo, hermanos | Engánchate a **datos** (`data-testid`), no a clases visuales ni a posiciones. `\|=` es "idioma" (`v` o `v-`), **no** "empieza con" (eso es `^=`). El espacio (descendiente) resiste remaquetados; `>` (hijo directo) es frágil. |
| **M03 · CSS Pseudo-clases** | estado, estructurales, fórmula An+B, `:not/:is/:where`, `:has` | Una pseudo-clase responde **estado**, **posición** o **relación**. `:nth-of-type(3)` **no** es "la 3.ª pizza": CSS no tiene un `nth` filtrado por clase. `:has()` es el selector **relacional**: "el contenedor que tiene *esto*". |
| **M04 · XPath Fundamentos** | por qué XPath, absoluto vs relativo, predicados e índices, atributos | XPath lee **texto** y sube al **padre/ancestro** donde CSS no llega. Prefiere el **relativo** (`//` + predicado); el absoluto (`/html/body/...`) es el locator más frágil. Índices **1-based** y por-padre. |
| **M05 · XPath Texto y funciones** | `text()` vs `.`, `contains`/`starts-with`, `normalize-space`, `translate`, `position`/`last` | `text()='X'` es **existencial** sobre los nodos de texto directos; para el texto completo usa `.`. `normalize-space()` es el reflejo **anti-flaky #1**. XPath 1.0: **no** hay `lower-case()` ni `matches()` → `translate()`. |
| **M06 · XPath Ejes** | modelo de ejes, padre/ancestro, hermanos, following/preceding/descendant, ancla-y-navega | Un eje es una **dirección** en el árbol. El patrón pro **ancla-y-navega**: texto humano estable + salto por eje al elemento accionable. `following-sibling::` se queda en el padre; `following::` cruza contenedores. |
| **M07 · CSS vs XPath y resiliencia** | tabla comparativa, clase exacta en XPath, rendimiento, escalera de resiliencia, depurar contando | CSS y XPath **se reparten el trabajo**: CSS por defecto; XPath para texto, padre/ancestro y ejes. La resiliencia es una **escalera**. Antes de confiar en un selector, **cuenta** sus matches. |
| **M08 · Técnicas del 1%** | selector pivot/ancla, `:has()` alcanza XPath, XPath dinámico, Shadow DOM, iframes | Construye **bottom-up**: ancla en lo estable y compón por **condiciones** (`:has():not()` ↔ `[A and not(B)]`). Conoce los **límites de documento**: shadow e iframes no se cruzan con selectores estándar. |

---

## 🪜 La escalera de resiliencia (consolidada)

El criterio que atraviesa M07 y M08, y la decisión más importante del curso. Elige el localizador **más alto** que aplique; baja un peldaño solo cuando el de arriba **de verdad** no sirve.

```text
1. data-testid        ← contrato explícito dev↔QA; inmune a copy/idioma/maquetado   (más resiliente)
2. rol + nombre        ← getByRole('button', { name: 'Sign In' }); accesible y semántico
3. texto               ← getByText / //...[normalize-space(.)='...']; rompe al cambiar el copy
4. estructura          ← nth, ejes posicionales, clase de estilo                     (más frágil)
```

| Peldaño | Cuándo úsalo | Trampa a evitar |
| --- | --- | --- |
| **testid** | siempre que exista | el testid debe ser **estable**, no una clase hash `css-1a2b3c` que cambia en cada build |
| **rol + nombre** | botones, links, headings con texto accesible | **excepción real:** inputs **sin label** rompen `getByRole` → cae a placeholder/testid |
| **texto** | copy estable y único | normaliza el whitespace (`normalize-space` / `getByText`) |
| **estructura** | último recurso | `:nth-of-type(3)` **no** es "la 3.ª pizza"; el XPath **absoluto** es el peor locator |

> **Depurar contando:** antes de confiar en un selector, cuenta sus matches. **0** = anclaste mal · **1** = listo · **N>1** = ambiguo. En Playwright, el *strict mode* convierte ese "N>1" en un **error** explícito en vez de tomar el primero en silencio.

---

## 🗺️ ¿Cuándo CSS y cuándo XPath?

No compiten: se reparten el trabajo. Parte de **CSS por defecto** (rápido, legible, multi-clase nativa) y baja a **XPath** solo cuando el árbol pide algo que CSS no sabe hacer.

| Tu pregunta sobre el DOM | La herramienta | Módulo |
| --- | --- | --- |
| "Por id / clase / etiqueta" | **CSS** `#id`, `.clase`, `tag` | M01 |
| "Por atributo o testid (incluido dinámico)" | **CSS** `[attr]`, `^= $= *=` | M02 |
| "Por estado, posición o relación entre hermanos" | **CSS** `:checked`, `:nth-*`, `:has()`, `+`/`~` | M03 |
| "El contenedor que **tiene** tal descendiente" | **CSS** `:has()` (o XPath `[.//X]`) | M03 / M08 |
| "Por el **texto** visible del elemento" | **XPath** `normalize-space(.)`, `contains(.)` | M05 |
| "Subir al **padre / ancestro**" | **XPath** `..`, `ancestor::` | M04 / M06 |
| "Moverme por **ejes** (hermanos, following, preceding)" | **XPath** `following-sibling::`, `following::` | M06 |
| "Case-insensitive sobre texto" | **XPath** `translate(.,'ABC','abc')` | M05 |
| "Clase **exacta** con multi-clase" | **XPath** padded-class `contains(concat(' ',normalize-space(@class),' '),' X ')` | M07 |
| "Cruzar un **shadow root** o un **iframe**" | 🚫 ni CSS ni XPath estándar → API de la herramienta (`getByRole` / `frameLocator`) | M08 |

> **Regla de bolsillo final:** CSS gana en rendimiento, legibilidad y multi-clase; solo **XPath** lee texto y sube por ejes. Si tu selector cuenta posiciones desde la raíz para llegar al elemento, no es resiliente — **ancla en lo estable** (testid/rol/texto) y navega por relación.

---

## El marco que sobrevive al curso: jsdom vs navegador

Practicaste todo **offline** con jsdom, un **aproximador de sintaxis** que carga el fixture de OmniPizza en un DOM real y resuelve tus selectores con `querySelectorAll` (CSS) y `document.evaluate` (XPath 1.0). Cubre CSS moderno (`:has`, `:is`, `:where`, `:not`, atributos, flag `i`) y casi todo XPath 1.0 (ejes, `contains`, `starts-with`, `normalize-space`, `translate`, `text()` vs `.`).

> ⚠️ La **única** divergencia conocida es la indexación con paréntesis: `(//x)[n]` significa "el n-ésimo **global**" en el navegador, pero jsdom lo evalúa como `//x[n]` ("el n-ésimo de cada padre"). Por eso el curso **no** comprueba con `check()` las formas con paréntesis: las explica en prosa.

La **verdad** del comportamiento la dan el navegador (DevTools `$x`), Playwright (`xpath=` / `css=`) y Selenium (`By.xpath` / `By.cssSelector`), que delegan en el `document.evaluate` y el motor CSS **reales**.

> **Lema del curso:** jsdom = aproximador de **sintaxis**; navegador / Playwright = **verdad del comportamiento**. Validas la sintaxis offline (barato, rápido, sin red); confirmas el comportamiento donde corre tu prueba real.

---

## Las tres lecciones que sobreviven al curso

1. **Ancla en lo estable, navega por relación.** El locator que parte de un **ancla** (testid, rol, texto) y sube/baja por `:has()` o por ejes sobrevive al reordenamiento. La cadena posicional desde la raíz, no.
2. **Componer por condiciones ↔ predicados.** `:has():not()` en CSS y `[A and not(B)]` en XPath son la misma idea: aprendido uno, traduces al otro. Eso es el "selector de élite".
3. **Cuenta y duda.** Antes de confiar en un selector, cuenta sus matches (0/1/N>1) y desconfía del **whitespace** y de las clases hash `css-*`. Y recuerda los **límites de documento** (shadow, iframe) antes de culpar a tu selector.

---

🎓 **Has completado el curso de CSS Selectors y XPath para QA.** Ya no escribes selectores que "parecen funcionar": escribes localizadores **resilientes**, sabes cuándo usar CSS y cuándo XPath, y reconoces los límites donde un selector estándar no llega.

> **Siguiente paso:** estos localizadores reaparecen en **Playwright** (`getByTestId`, `getByRole`, `getByText`, `page.locator("css=...")` / `"xpath=..."`). Llevas la caja de herramientas lista y el criterio para elegir bien.

---

⬅️ Anterior: [Síntesis M8](/docs/css-xpath/m8-sintesis)
