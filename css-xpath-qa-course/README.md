# Curso de CSS Selectors y XPath para QA

**De "clic a ciegas" a localizadores que aguantan producción** — un curso práctico y ejecutable, sin framework de testing, pensado para automatizadores de pruebas.

> Cada ejemplo es una micro-aserción: en vez de solo imprimir un resultado, lo **comparamos** contra lo esperado y mostramos ✅ o ❌. Esa es la mentalidad de testing aplicada al aprendizaje de selectores.

---

## ¿Qué es este curso y para quién es?

Este es un curso de **localizadores** (selectores **CSS** y expresiones **XPath**) orientado al día a día de las **pruebas de software**: encontrar el elemento correcto y que el selector **siga encontrándolo** después del próximo refactor.

Todos los ejemplos corren **offline** con jsdom contra un fixture estático de **OmniPizza** (`fixtures/omnipizza.html`): catálogo de 4 pizzas, carrito, login, checkout, toppings y métodos de pago — el mismo vocabulario de principio a fin.

Está dirigido a:

- **QA / automatizadores** que quieren localizadores robustos (la pieza que más rompe sus pruebas).
- Quien viene de los cursos hermanos de **TypeScript** y **Regex para QA** y quiere el siguiente ladrillo antes de Playwright.
- Cualquiera que maneje lo básico de la terminal y quiera aprender CSS/XPath **ejecutando y verificando**, no solo leyendo.

> Los ejemplos corren con jsdom, pero la **sintaxis** es la misma que escribes en Playwright y Selenium: transfiere 1:1. El `cheatsheet.md` incluye la tabla de equivalencias **CSS ↔ XPath ↔ Playwright**.

---

## Prerrequisitos

| Herramienta | Versión | Para qué |
|---|---|---|
| **Node.js** | v24 LTS recomendado (v20+ funciona) | Motor que ejecuta TypeScript/JavaScript. Descarga: https://nodejs.org/ |
| **pnpm** | 10.x o superior | Gestor de paquetes. Instálalo con `npm install -g pnpm` |
| **VS Code** (recomendado) | — | Editor con resaltado de TS/HTML. Descarga: https://code.visualstudio.com/ |

Verifica:

```bash
node --version    # v24 LTS recomendado (v20+ funciona)
pnpm --version    # 10.x.x o superior
```

No necesitas conocimientos previos de CSS/XPath. Sí ayuda manejar lo básico de TypeScript (variables, funciones, arrays), pero el código está comentado paso a paso.

---

## 📐 Configuración del companion

> El proyecto **no** corre contra un navegador ni contra la red: monta un **DOM real en memoria** (jsdom) a partir de un fixture HTML congelado y resuelve tus selectores ahí. Esto es lo que el companion trae ya configurado — no tienes que tocarlo:

| Pieza | Qué hace | Por qué este valor |
|---|---|---|
| `package.json` | scripts `m1`..`m8`, `verify`, `typecheck` | un atajo por módulo; `verify` los encadena con `&&` |
| `tsconfig.json` | TypeScript **estricto**, `noEmit` (no compila, solo type-check) | atrapas errores de tipos sin generar JS; `tsx` ejecuta el TS directo |
| `jsdom` | carga `fixtures/omnipizza.html` en un `document` real | practicas selectores **sin red, sin navegador, sin JS de la app** |
| `helpers/dom.ts` | `countCss`, `countXpath`, `$$`, `$x`, `text`, `attr`, `document` | CSS vía `querySelectorAll`; XPath 1.0 vía `document.evaluate` |
| `helpers/check.ts` | `check(etiqueta, real, esperado)` y `titulo(txt)` | convierte cada ejemplo en un ✅/❌ |
| `fixtures/omnipizza.html` | el DOM de OmniPizza **aplanado y congelado** | la **fuente única** de verdad del DOM; **no se edita** |

> ⚠️ Los archivos del "contrato" del curso — `helpers/dom.ts`, `helpers/check.ts`, `fixtures/omnipizza.html`, `package.json`, `tsconfig.json` — **no se editan**. El fixture es de **solo lectura**: es la fuente única del DOM. Si una mini-clase necesitara un elemento que no existe, se **reporta** el hueco; no se parchea el fixture.

---

## Instalación

Abre una terminal en la carpeta del curso y ejecuta:

```bash
pnpm install
```

Esto instala las dependencias de desarrollo: **TypeScript**, **tsx** (ejecutor rápido de TS, sin compilar) y **jsdom** (el "navegador de bolsillo" offline).

Verifica que todo funciona corriendo los 8 módulos de corrido:

```bash
pnpm verify
```

Deberías ver una larga serie de líneas con ✅ (las mini-clases de los 8 módulos ejecutándose y auto-verificándose) y **cero** ❌.

---

## ▶️ Cómo ejecutar

Cada módulo tiene un script corto. También puedes ejecutar todo de una vez o verificar tipos.

```bash
# Ejecutar un módulo completo (corre sus 5 mini-clases en orden)
pnpm m1    # Módulo 1 · CSS Fundamentos
pnpm m2    # Módulo 2 · CSS Atributos y combinadores
pnpm m3    # Módulo 3 · CSS Pseudo-clases
pnpm m4    # Módulo 4 · XPath Fundamentos
pnpm m5    # Módulo 5 · XPath Texto y funciones
pnpm m6    # Módulo 6 · XPath Ejes
pnpm m7    # Módulo 7 · CSS vs XPath y resiliencia
pnpm m8    # Módulo 8 · Técnicas del 1%

# Ejecutar los 8 módulos en secuencia (de corrido)
pnpm verify

# Verificar tipos de TODO el proyecto sin ejecutar nada (tsc --noEmit)
pnpm typecheck
```

Para correr **una sola mini-clase** (sin el módulo entero) o **tu reto**, usa `tsx` directamente:

```bash
# Una mini-clase suelta
pnpm tsx modulo-01-css-fundamentos/01-dom-es-un-arbol.ts

# Tu reto del módulo
pnpm tsx modulo-01-css-fundamentos/reto.ts
```

> Los scripts `m1`..`m8` apuntan al `ejemplo.ts` de cada módulo (el "runner"). El comando `verify` los encadena con `&&`, así que si un módulo falla, se detiene ahí.

---

## Estructura de carpetas

```
css-xpath-qa-course/
├── README.md                            ← este archivo
├── cheatsheet.md                        ← referencia rápida CSS + XPath + tabla Playwright
├── curso_css_xpath_qa.md                ← overview del curso, módulo a módulo
├── package.json                         ← scripts m1..m8, verify, typecheck
├── tsconfig.json                        ← TypeScript estricto, sin emitir (noEmit)
│
├── fixtures/
│   └── omnipizza.html                   ← DOM de OmniPizza aplanado y CONGELADO (read-only)
│
├── helpers/
│   ├── dom.ts                           ← navegador de bolsillo: countCss/countXpath/$$/$x/text/attr
│   └── check.ts                         ← aserciones didácticas: check() y titulo()
│
├── modulo-01-css-fundamentos/
├── modulo-02-css-atributos-combinadores/
├── modulo-03-css-pseudoclases/
├── modulo-04-xpath-fundamentos/
├── modulo-05-xpath-texto-funciones/
├── modulo-06-xpath-ejes/
├── modulo-07-css-vs-xpath-resilientes/
└── modulo-08-tecnicas-1-percent/
```

Cada `modulo-NN-*/` contiene siempre:

| Archivo | Qué es |
|---|---|
| `01-*.ts` … `05-*.ts` | **Mini-clases**: cada una enseña UN concepto con ejemplos auto-verificados. |
| `ejemplo.ts` | **Runner** del módulo: importa las 5 mini-clases y las ejecuta en orden. |
| `reto.ts` | **Reto** del alumno: una plantilla con un TODO **intencionalmente sin resolver**. |

---

## Cómo está organizado cada módulo

El curso es **ejecutable y auto-verificado**: no hay un framework de testing (Jest, Vitest…). En su lugar, dos helpers minúsculos convierten cada ejemplo en una micro-aserción contra un DOM real.

### El "navegador de bolsillo" — `helpers/dom.ts`

Carga **una** vez `fixtures/omnipizza.html` en jsdom y expone selectores sobre ese `document`:

```typescript
import { countCss, countXpath, $$, $x, text, attr, document } from "../helpers/dom";
```

- **`countCss(sel)`** / **`$$(sel)`** — CSS vía `document.querySelectorAll`. `countCss` devuelve cuántos matchea (la aserción más barata); `$$` devuelve los elementos como array.
- **`countXpath(expr)`** / **`$x(expr)`** — XPath 1.0 vía `document.evaluate`. `countXpath` cuenta; `$x` devuelve los nodos como array (snapshot ordenado).
- **`text(node)`** — el `textContent` recortado (como `normalize-space`).
- **`attr(el, name)`** — el valor de un atributo, o `null`.
- **`document`** — el `document` del fixture, por si necesitas algo a bajo nivel.

### El helper de aserciones — `helpers/check.ts`

Lo importan **todas** las mini-clases:

```typescript
import { check, titulo } from "../helpers/check";
```

- **`check(etiqueta, real, esperado)`** — compara un valor obtenido contra el esperado e imprime `✅ etiqueta` o `❌ etiqueta — esperado: X, obtenido: Y`. Sirve para conteos, textos extraídos, atributos, etc. Usa igualdad estructural simple (primitivos por valor; arrays/objetos por su JSON).
- **`titulo(texto)`** — imprime un encabezado de sección para separar bloques de checks en la salida (puramente cosmético).

Gracias a esto, al correr un módulo ves una columna de ✅/❌ que te dice de inmediato si tu mente coincide con lo que hace el motor de selectores.

### Las mini-clases (`01-*.ts` … `05-*.ts`)

Cada mini-clase introduce **un** concepto con ejemplos cortos, cada uno cerrado con `check()`, usando los conteos reales del fixture de OmniPizza. Puedes leerlas como apuntes y ejecutarlas para ver la teoría confirmada en consola.

### El runner (`ejemplo.ts`)

Cada `ejemplo.ts` importa las 5 mini-clases del módulo para correrlas de una sola vez (es lo que ejecuta `pnpm mN`). Como cada mini-clase corre sus `check()` al cargarse, basta importarlas.

### El reto (`reto.ts`) — sin resolver a propósito

Cada módulo cierra con un `reto.ts` que es **tu** ejercicio. Contiene un selector marcado con `// TODO:` que arranca como un placeholder `CAMBIAME`, casos de prueba **que no debes tocar** y pistas conceptuales que apuntan a las mini-clases (nunca la respuesta).

Es **esperado** ver ❌ hasta que sustituyas el placeholder por tu selector. Cuando todas las filas queden en ✅, dominaste el módulo. (El reto **sí** debe compilar: es TypeScript válido desde el inicio.)

```bash
pnpm tsx modulo-01-css-fundamentos/reto.ts   # corre tu intento
```

---

## El fixture de OmniPizza (offline)

El curso no necesita la app live. `fixtures/omnipizza.html` es **OmniPizza aplanado**: una sola página estática que reúne login, catálogo de 4 pizzas, carrito, toppings, métodos de pago y footer — con todos los `data-testid`, clases, estados (`is-soldout`, `is-active`, `:checked`, `:disabled`), y hasta clases hash frágiles (`css-1a2b3c`) que el Módulo 7 usa como ejemplo de "lo que **no** debes usar".

Trabajar offline tiene una ventaja didáctica: los **conteos son deterministas**. Si un selector debe matchear 4 cards, el `check()` lo afirma con un número exacto, y aprendes a **contar antes de codificar** (0 = anclaste mal, 1 = listo, N>1 = ambiguo).

> ⚠️ El fixture es de **solo lectura**. Es la fuente única del DOM del curso; no se edita ni se parchea para acomodar un ejemplo.

---

## Recursos del curso

- 📋 `cheatsheet.md` — referencia rápida de sintaxis (combinadores CSS, operadores de atributo, pseudo-clases, fórmula An+B, `:has`, XPath: predicados, `text()` vs `.`, funciones de cadena, ejes, padded-class) más la tabla **CSS ↔ XPath ↔ Playwright** y la escalera de resiliencia.
- 📖 `curso_css_xpath_qa.md` — el overview: qué es el curso, para quién, los 8 módulos en tabla y el marco mental jsdom vs navegador.

> **De dónde vienes / a dónde vas:** este curso encaja entre **Regex para QA** y **Automatización con Playwright**. Los selectores que aquí dominas reaparecen en `page.locator(...)`, `getByRole`, `getByTestId` y `getByText`.
