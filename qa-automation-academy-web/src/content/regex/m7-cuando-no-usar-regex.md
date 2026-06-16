# 7.5 — Cuándo NO usar regex (HTML/JSON anidado = parser)

> **Módulo 7 · Avanzado y seguro**

> **Analogía QA:** una llave inglesa es genial para tuercas, pero si la usas para clavar acabas con un desastre. La regex es genial para patrones **planos y regulares** (un email, un SKU, una línea de log). Para estructuras **anidadas y recursivas** (HTML, JSON) es la herramienta equivocada: se rompe en el primer caso real. Un QA senior sabe cuándo **soltar la regex**.

---

## ¿Qué aprendes?

- Por qué una regex **no puede** con anidamiento (no es "regular" en el sentido teórico).
- A **ver el fallo en vivo**: una regex ingenua se rompe con HTML y JSON anidados.
- Cuál es la forma correcta: un **parser** (`DOMParser`, `JSON.parse`, una librería).
- El **criterio senior** para decidir cuándo el costo de la regex supera el beneficio.

---

## Por qué la regex no puede con anidamiento

HTML y JSON pueden anidarse a profundidad **arbitraria**: un `<div>` dentro de otro `<div>`, un objeto dentro de un array dentro de un objeto. Las expresiones regulares (en el sentido teórico) **no pueden contar** niveles de anidamiento equilibrados; eso requiere una **gramática** (un parser). Por eso cualquier regex "para extraer X de HTML" funciona en el demo y explota con datos reales. El clásico de StackOverflow: *"no parsees HTML con regex"*.

---

## Demostración: una regex ingenua se ROMPE con HTML anidado

Intento ingenuo: "el texto dentro de un `<span>...</span>`" con `.*?` (lazy). Parece razonable... pero captura **solo el primer** span y pierde datos.

```ts
// @file regex-qa-course/modulo-07-avanzado-seguro/05-cuando-no-usar-regex.ts
// HTML_SNIPPET = '<div class="order"><span class="item">Pizza</span><span>x2</span></div>'
const reSpanIngenuo = /<span[^>]*>(.*?)<\/span>/; // SIN flag g: primer match
const m = reSpanIngenuo.exec(HTML_SNIPPET);
const primerSpan = m ? m[1] : null;
// La regex captura SOLO "Pizza". El segundo <span>x2</span> se ignora.
check("la regex ingenua solo ve el PRIMER span (pierde 'x2')", primerSpan, "Pizza");
```

Y con un `<span>` dentro de otro, el `.*?` lazy corta en el `</span>` **equivocado** (el interno) y captura basura:

```ts
// @file regex-qa-course/modulo-07-avanzado-seguro/05-cuando-no-usar-regex.ts
const htmlAnidado = "<span>外<span>内</span></span>"; // un span dentro de otro
const todos = [...htmlAnidado.matchAll(/<span[^>]*>(.*?)<\/span>/g)].map((x) => x[1]);
// La regex devuelve ["外<span>内"]: cortó en el </span> interno → basura.
check("la regex parte mal el span anidado (captura basura)", todos, ["外<span>内"]);
```

> 🔷 **La forma correcta para HTML es un parser de DOM.** En un navegador:
> ```ts
> const doc = new DOMParser().parseFromString(html, "text/html");
> const spans = doc.querySelectorAll("span");        // ← estructura real
> const textos = [...spans].map(s => s.textContent); // ["Pizza","x2"]
> ```
> En Node no existe `DOMParser` global; en un proyecto real instalarías `jsdom`, `cheerio` o `node-html-parser`. La lección no es la librería, es el **criterio**: HTML → parser, no regex.

---

## JSON: la regex también se rompe; `JSON.parse` es la respuesta

Sacar un `"sku"` con regex parece funcionar en **este** dato, pero es frágil: depende del orden de las claves, los espacios, las comillas escapadas, y de que no haya un `"sku"` en otro nivel. Reordena las claves o mete un señuelo y la regex agarra el valor **equivocado**:

```ts
// @file regex-qa-course/modulo-07-avanzado-seguro/05-cuando-no-usar-regex.ts
const reSkuIngenuo = /"sku"\s*:\s*"([^"]+)"/;
// Un JSON con un "sku" señuelo ANTES del real:
const otro = '{"meta":{"sku":"NO-ES-ESTE"},"order":{"items":[{"sku":"PZ-1234"}]}}';
const mWrong = reSkuIngenuo.exec(otro);
// La regex agarra el PRIMER "sku" que ve, el equivocado:
check("regex agarra el sku EQUIVOCADO si hay otro 'sku' antes", mWrong ? mWrong[1] : null, "NO-ES-ESTE");
```

La forma correcta: `JSON.parse` devuelve un **objeto** y navegas por la ruta **real**. Esto sí entiende la estructura (y maneja JSON malformado sin crashear):

```ts
// @file regex-qa-course/modulo-07-avanzado-seguro/05-cuando-no-usar-regex.ts
function skuPorParser(jsonTexto: string): string | null {
  try {
    const data = JSON.parse(jsonTexto) as Pedido;
    return data.order?.items?.[0]?.sku ?? null; // ruta explícita y robusta
  } catch {
    return null; // JSON malformado: lo manejamos, no crasheamos
  }
}
check("parser ignora el 'sku' señuelo y va a order.items", skuPorParser(otro), "PZ-1234");
check("parser devuelve null con JSON malformado (no crashea)", skuPorParser('{"order": BAD}'), null);
```

---

## Criterio SENIOR: ¿cuándo soltar la regex?

**Suelta la regex** y usa un parser/librería cuando:

- La estructura **anida** o es recursiva (HTML, XML, JSON, código).
- Necesitas la **jerarquía**, no solo un dato plano de una línea.
- El patrón crece con lookaheads/grupos hasta volverse **ilegible**.
- Hay un parser estándar y probado (`JSON.parse`, `DOMParser`, una lib).

**Sigue usando regex** cuando el dato es **plano y regular**:

- Validar formato de un email/SKU/UUID/fecha (M01–M06).
- Extraer campos de **una** línea de log.
- *Scrubbing* de tokens volátiles en un texto.

> **Regla de bolsillo:** "si para entenderlo necesito contar paréntesis equilibrados, no es trabajo de regex".

---

## Qué observar

- El anidamiento arbitrario está **fuera del alcance** teórico de las regex.
- La regex "casi acierta" en el demo y **falla** al reordenar claves o anidar.
- Lo verdaderamente avanzado no es escribir la regex más astuta: es **saber cuándo no usarla**.

➡️ Siguiente: [🚩 Reto Módulo 7](/docs/regex/m7-reto)
