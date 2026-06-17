# CSS Selectors y XPath — Cheat Sheet para QA

Referencia rápida de sintaxis de **localizadores** para pruebas de software. Los ejemplos corren **offline** con jsdom contra el fixture estático de OmniPizza (`fixtures/omnipizza.html`); la **verdad del comportamiento** la da el navegador / Playwright / Selenium. Al final, una tabla de equivalencias **CSS ↔ XPath ↔ Playwright** y la escalera de resiliencia.

> Regla de bolsillo: **CSS por defecto** (rápido, legible, multi-clase nativa). Baja a **XPath** solo cuando necesitas **texto**, **subir al padre/ancestro** o **ejes** que CSS no tiene.

---

## CSS — selectores base

| Selector | Matchea | Recuerda |
|---|---|---|
| `*` | cualquier elemento (universal) | para **auditar/contar**, no para localizar |
| `h3` | por **tipo** (etiqueta) | amplio: `h3` matchea las 4 `.pizza-name` y más |
| `.pizza-card` | por **clase** (rol/grupo) | `.X` es **multi-clase tolerante**: matchea aunque el elemento tenga más clases |
| `#login-form` | por **id** (único) | el id debería ser único en el documento |
| `article.pizza-card` | tipo **y** clase (sin espacio) | misma posición, dos condiciones |
| `a, button` | agrupación (coma = **OR**) | matchea `a` **o** `button` |

> Los tres selectores base se ordenan por **puntería**: tipo (amplio) → clase (por rol) → id (único).

---

## CSS — combinadores (relación entre elementos)

| Combinador | Relación | En el fixture |
|---|---|---|
| `A B` (espacio) | **descendiente** a cualquier profundidad | `.catalog .pizza-name` resiste wrappers nuevos |
| `A > B` | **hijo directo** (un nivel) | frágil: un `<div>` envoltorio nuevo lo rompe |
| `A + B` | **hermano adyacente** (el inmediato siguiente) | `.pizza-name + .price` |
| `A ~ B` | **hermano general** (todos los siguientes) | N hermanos del tipo → N−1 matches con `~` |

> Los hermanos (`+`, `~`) solo miran **hacia adelante** dentro del mismo padre. El descendiente (espacio) es más resistente a remaquetados que el hijo directo (`>`).

---

## CSS — selectores de atributo

| Selector | Matchea | Matiz |
|---|---|---|
| `[data-testid]` | el atributo **existe** (presencia) | sin importar su valor |
| `[data-testid="add-to-cart-101"]` | valor **exacto** | `=` solo sirve con valores fijos |
| `[data-testid^="pizza-card-"]` | el valor **empieza con** (prefijo) | ideal para testids dinámicos: 4 cards |
| `[href$=".pdf"]` | el valor **termina con** (sufijo) | el `terms` del footer |
| `[class*="css-"]` | el valor **contiene** (subcadena cruda) | ⚠️ `badge` ⊂ `cart-badge`; cuidado con falsos positivos |
| `[class~="badge"]` | el valor contiene esa **palabra** (token separado por espacios) | distinto de `*=` (subcadena) |
| `[lang\|="es"]` | **exactamente `es`** O prefijo **`es-`** | subcódigos de idioma; **NO** es "empieza con" |
| `[type="radio" i]` | comparación **case-insensitive** (flag `i`) | la `i` va dentro del corchete |

> ⚠️ El operador `\|=` **NO** significa "empieza con `v`" — significa "el valor es exactamente `v` **o** empieza por `v-`" (pensado para `lang="es-MX"`). Para "empieza con" usa `^=`.

---

## CSS — pseudo-clases de estado

| Pseudo-clase | Matchea | En el fixture |
|---|---|---|
| `:checked` | inputs marcados | 2 (queso + card) |
| `:disabled` | controles deshabilitados | 2 inputs |
| `:enabled` | controles habilitables no deshabilitados | el complemento |
| `:focus` | el elemento con foco | 0 sin interacción (jsdom no enfoca) |

> Para *afirmar* estado en una prueba real, el idiomático **no** es el selector sino el matcher: Playwright `toBeChecked()` / `toBeDisabled()` / `toBeFocused()`; Selenium `is_selected()` / `is_enabled()`.

---

## CSS — pseudo-clases estructurales y la fórmula An+B

| Selector | Matchea |
|---|---|
| `:first-child` / `:last-child` | el primer / último hermano |
| `:nth-child(n)` | el n-ésimo hermano (cuenta **todos** los hermanos) |
| `:nth-of-type(n)` | el n-ésimo hermano **de su mismo tipo** |
| `:nth-last-child(n)` | cuenta **desde el final** |
| `:nth-child(odd)` / `(even)` | ≡ `2n+1` / `2n` |
| `:nth-child(An+B)` | fórmula: por cada entero `n≥0`, posición `A·n + B` (1-based) |

> ⚠️ `:nth-of-type(3)` **NO** es "la tercera pizza": es "el elemento que es de su tipo **y además** el 3.er hermano de su tipo". CSS **no** tiene un `nth` filtrado por clase o por dato. Con hermanos de **tipo mixto** (un badge opcional), `:nth-child` y `:nth-of-type` **divergen**.

---

## CSS — `:not()`, `:is()`, `:where()`, `:has()`

| Selector | Hace | Nota |
|---|---|---|
| `:not(X)` | niega (lo que **no** matchea X) | **estricto**: un selector inválido invalida toda la regla |
| `input:not([disabled])` | encadenar para componer | el control habilitado |
| `:is(h1, h2, h3)` | agrupa (**OR**), toma la **mayor** especificidad de la lista | **forgiving**: ignora selectores inválidos |
| `:where(h1, h2, h3)` | igual match que `:is()` pero **especificidad 0** | útil para no ganar guerras de especificidad |
| `:has(X)` | el elemento **que contiene** X (selector **relacional**) | sube del descendiente al ancestro |
| `article:has(.badge--sin-gluten)` | "la card que tiene el badge sin gluten" | compone con estado y hermanos |

> `:has()` es la pieza que faltaba para escribir "el contenedor que tiene *esto*". `:is()`/`:where()` son **forgiving** (toleran inválidos); `:not()` es **estricto**.

> ⚠️ `:has-text("...")` y `:text-is("...")` **NO** son CSS estándar: son pseudos **propias de Playwright**. En un `querySelectorAll` offline (los `.ts` del curso) **lanzan error**. Para "el contenedor con tal texto" en CSS estándar usa `:has()` con un selector de elemento, o salta a XPath (`contains(., '...')`).

---

## XPath — navegación básica

| Expresión | Significa |
|---|---|
| `//div` | `div` a **cualquier** profundidad (descendiente del nodo de contexto) |
| `/html/body/...` | ruta **absoluta** desde la raíz (la más **frágil**) |
| `.//x` | descendiente **relativo al nodo actual** (clave al encadenar) |
| `.` | el nodo **actual** (self) |
| `..` | el **padre** (`parent::`) |
| `*` | cualquier elemento (comodín de nombre) |
| `a \| b` | unión de dos conjuntos de nodos |

> Al encadenar desde un nodo ya localizado, usa `.//` (relativo). Un `//` "suelto" arranca desde la raíz del documento, ignorando tu contexto.

---

## XPath — predicados, índices y atributos

| Expresión | Significa |
|---|---|
| `//li[@data-testid]` | filtro: el atributo **existe** |
| `//*[@data-testid='cart-total']` | atributo con valor **exacto** |
| `//button[1]` | el **1.er** `button` de **cada** padre (índices **1-based**, por-padre) |
| `//li[last()]` | el último; `[last()-1]` el penúltimo |
| `//a[position()=2]` | por posición explícita |
| `//input[@type='radio' and not(@disabled)]` | componer con `and` / `or` / `not()` |

> Los índices son **1-based** y se cuentan **por padre**: `//x[1]` es "el primer `x` de cada padre", no "el primero del documento". Para el n-ésimo **global** se usa `(//x)[n]` — ver la nota de fidelidad jsdom abajo.

> ⚠️ `[@class='X']` compara el atributo **entero**: falla con multi-clase (`class="pizza-card is-soldout"`). El idiom correcto es la **clase acolchada** (padded-class):
>
> ```text
> //article[contains(concat(' ', normalize-space(@class), ' '), ' is-soldout ')]
> ```
>
> En CSS, `.is-soldout` ya es multi-clase tolerante; este truco es solo de XPath.

---

## XPath — texto y funciones de cadena (XPath 1.0)

| Función | Hace | Recuerda |
|---|---|---|
| `text()` | los **nodos de texto directos** del elemento | semántica **existencial**, ver ⚠️ |
| `.` (string-value) | el texto completo, **descendientes incluidos** | `//h3[.='Pepperoni']` |
| `contains(., 'Pep')` | subcadena **literal** (no regex) | sin comodines |
| `starts-with(@href, '/legal')` | prefijo anclado al inicio | de atributo o de texto |
| `normalize-space(.)` | recorta extremos y **colapsa** espacios internos | anti-flaky #1 |
| `translate(., 'ABC…', 'abc…')` | mapea char a char | case-insensitive y **borrado** (mapear a vacío) |
| `string-length(.)` | longitud de la cadena | |
| `concat('a', "'", 'b')` | concatena literales | **única** forma de meter comillas/apóstrofes |

> ⚠️ `text()='X'` compara contra **todos** los nodos de texto hijo con semántica **existencial**: matchea si **alguno** de ellos es `X` (no "solo el primero"). Para el texto **completo** del elemento usa `.` o `normalize-space(.)`.

> ⚠️ XPath en navegadores es **1.0**: **no** existen `lower-case()`, `matches()` ni `ends-with()`. Case-insensitive se hace con `translate()`:
>
> ```text
> //button[contains(translate(., 'SIGN', 'sign'), 'sign in')]
> ```

> ⚠️ XPath **no tiene escape con backslash**. Para una cadena que mezcla `'` y `"` usa `concat()` con literales separados: `concat('Total: ', '"', '641.48', '"')`.

---

## XPath — ejes (la navegación que CSS no tiene)

| Eje | Dirección | Recuerda |
|---|---|---|
| `child::` | hijos directos | es el eje **por defecto** (`//a/b` = `//a/child::b`) |
| `parent::` / `..` | sube un nivel | `..` es el atajo |
| `ancestor::` | cualquier contenedor arriba | **no** incluye al nodo de partida |
| `ancestor-or-self::` | igual + el propio nodo | útil si el nodo ya podría ser el contenedor |
| `following-sibling::` | hermanos **posteriores** | mismo padre |
| `preceding-sibling::` | hermanos **anteriores** | mismo padre |
| `following::` | todo lo posterior en el documento | **cruza** contenedores |
| `preceding::` | todo lo anterior en el documento | **cruza** contenedores |
| `descendant::` | todo lo que cuelga del nodo | no se incluye a sí mismo |

> El patrón **ancla-y-navega** (el más resiliente): ancla en un texto humano estable y salta por eje al elemento accionable.
>
> ```text
> //h3[normalize-space(.)='Cuatro Quesos']/ancestor::article//button
> ```

---

## ⚠️ Nota de fidelidad jsdom — el bug de `(//x)[n]`

El motor offline del curso (**jsdom**) es un **aproximador de sintaxis**: cubre CSS moderno (`:has`, `:is`, `:where`, `:not`, atributos, flag `i`) y casi todo XPath 1.0 (ejes, `contains`, `starts-with`, `normalize-space`, `translate`, `text()` vs `.`). La **única** divergencia conocida es la indexación con paréntesis:

| Expresión | Significado correcto (navegador) | Qué hace jsdom |
|---|---|---|
| `//x[n]` | el n-ésimo `x` **de cada padre** (por-padre) | igual ✅ |
| `(//x)[n]` | el n-ésimo `x` **global** del documento | lo evalúa como `//x[n]` ❌ |

Por eso el curso **no** hace `check()` de formas con paréntesis: las explica en prosa. La **verdad** del comportamiento la dan el navegador (DevTools `$x`), Playwright (`xpath=`) y Selenium (`By.xpath`), que delegan en el `document.evaluate` **real**.

> **Lema del curso:** jsdom = aproximador de **sintaxis**; navegador / Playwright = **verdad del comportamiento**. Playwright `xpath=` delega en el `document.evaluate` del navegador real.

---

## Tabla de equivalencias — CSS ↔ XPath ↔ Playwright

| Quiero… | CSS | XPath (1.0) | Playwright (idiomático) |
|---|---|---|---|
| Por id | `#login-form` | `//*[@id='login-form']` | `page.locator('#login-form')` |
| Por clase | `.pizza-card` | `//*[contains(concat(' ',normalize-space(@class),' '),' pizza-card ')]` | `page.locator('.pizza-card')` |
| Por testid | `[data-testid='x']` | `//*[@data-testid='x']` | `page.getByTestId('x')` |
| Testid dinámico | `[data-testid^='pizza-card-']` | `//*[starts-with(@data-testid,'pizza-card-')]` | `page.locator('[data-testid^="pizza-card-"]')` |
| Por rol + nombre | — (CSS no lee rol) | — (XPath no lee rol) | `page.getByRole('button',{name:'Sign In'})` |
| Por **texto** exacto | — (CSS no lee texto) | `//h3[normalize-space(.)='Pepperoni']` | `page.getByText('Pepperoni',{exact:true})` |
| Por texto parcial | — | `//h3[contains(.,'Pep')]` | `page.getByText('Pep')` |
| Subir al **padre/ancestro** | `:has()` (relacional, baja) | `ancestor::article` | `.locator('xpath=ancestor::article')` |
| "El contenedor que tiene X" | `article:has(.badge--new)` | `//article[.//*[contains(@class,'badge--new')]]` | `page.locator('article:has(.badge--new)')` |
| El primero / el último | `:first-child` / `:last-child` | `[1]` / `[last()]` | `.first()` / `.last()` |
| El n-ésimo (desde) | `:nth-child(n)` (1-based) | `[n]` (1-based, por-padre) | `.nth(i)` (**0-based**) |
| Case-insensitive (texto) | — | `translate(.,'ABC','abc')` | `page.getByText(/.../i)` |
| Encadenar engines | (un solo motor) | (un solo motor) | `loc.locator('css=...')` · `>>` separa engines |

> CSS y XPath comparten el **mismo motor** del navegador en Playwright/Selenium: la cadena transfiere 1:1. Solo **XPath** lee texto y sube por ejes; **CSS** gana en rendimiento, legibilidad y multi-clase nativa.

---

## La escalera de resiliencia

Elige el localizador **más alto** que aplique; baja un peldaño solo cuando el de arriba **de verdad** no sirve.

```text
1. data-testid        ← contrato explícito dev↔QA; inmune a copy/idioma/maquetado   (más resiliente)
2. rol + nombre        ← getByRole('button', { name: 'Sign In' }); accesible y semántico
3. texto               ← getByText / //...[normalize-space(.)='...']; rompe al cambiar el copy
4. estructura          ← nth, ejes posicionales, clase de estilo                     (más frágil)
```

| Peldaño | Cuándo úsalo | Trampa a evitar |
|---|---|---|
| **testid** | siempre que exista | el testid debe ser **estable**, no `css-1a2b3c` (clase hash que cambia cada build) |
| **rol + nombre** | botones, links, headings con texto accesible | **excepción real:** inputs **sin label** rompen `getByRole` → cae a placeholder/testid |
| **texto** | copy estable y único | normaliza el whitespace (`normalize-space` / `getByText`) |
| **estructura** | último recurso | `:nth-of-type(3)` **no** es "la 3.ª pizza"; el XPath **absoluto** es el peor locator |

> **Depurar contando:** antes de confiar en un selector, cuenta sus matches. **0** = anclaste mal · **1** = listo · **N>1** = ambiguo (en Playwright el *strict mode* lo convierte en error en vez de tomar el primero en silencio).

---

## Comandos del curso

```bash
pnpm install                 # instalar dependencias (TypeScript + tsx + jsdom)

pnpm m1                      # correr un módulo (1..8); su ejemplo.ts ejecuta las 5 mini-clases
pnpm m8                      # ...

pnpm verify                  # correr los 8 módulos en secuencia
pnpm typecheck               # verificar tipos sin ejecutar (tsc --noEmit)

pnpm tsx modulo-01-css-fundamentos/01-dom-es-un-arbol.ts   # una mini-clase suelta
pnpm tsx modulo-01-css-fundamentos/reto.ts                 # tu reto del módulo
```
