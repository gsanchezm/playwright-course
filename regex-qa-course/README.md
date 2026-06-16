# Curso de Expresiones Regulares para QA

**De validar a mano a automatizar con regex** — un curso práctico y ejecutable, sin framework de testing, pensado para automatizadores de pruebas.

> Cada ejemplo es una micro-aserción: en vez de solo imprimir un resultado, lo **comparamos** contra lo esperado y mostramos ✅ o ❌. Esa es la mentalidad de testing aplicada al aprendizaje de regex.

---

## ¿Qué es este curso y para quién es?

Este es un curso de **expresiones regulares (regex)** orientado al día a día de las **pruebas de software**: validar datos de prueba, parsear logs y stack traces, estabilizar snapshots, enmascarar PII y escribir patrones seguros que aguanten producción.

Todos los ejemplos usan el vocabulario de una app de ejemplo — **OmniPizza** (mercados MX / US / CH / JP) — más artefactos QA universales (logs, payloads, IDs, PII), para que los datos sean coherentes de principio a fin.

Está dirigido a:

- **QA / automatizadores** que quieren dominar regex en el contexto de testing (no como teoría suelta).
- Quien viene del curso hermano de **TypeScript para QA** y quiere el siguiente ladrillo antes de Playwright.
- Cualquiera que sepa lo básico de la terminal y quiera aprender regex **ejecutando y verificando**, no solo leyendo.

> Los ejemplos están en JavaScript/TypeScript (motor de regex de JS), pero el `cheatsheet.md` incluye puentes a **Java** y **Python** para que el modelo mental sea portable.

---

## Prerrequisitos

| Herramienta | Versión | Para qué |
|---|---|---|
| **Node.js** | v18 o superior (LTS) | Motor que ejecuta TypeScript/JavaScript. Descarga: https://nodejs.org/ |
| **pnpm** | 9.x o superior | Gestor de paquetes. Instálalo con `npm install -g pnpm` |
| **VS Code** (recomendado) | — | Editor con resaltado de regex. Descarga: https://code.visualstudio.com/ |

Verifica:

```bash
node --version    # v18.x.x o superior
pnpm --version    # 9.x.x o superior
```

No necesitas conocimientos previos de regex. Sí ayuda manejar lo básico de TypeScript (variables, funciones, arrays), pero el código está comentado paso a paso.

---

## Instalación

Abre una terminal en la carpeta del curso y ejecuta:

```bash
pnpm install
```

Esto instala las dependencias de desarrollo: **TypeScript**, **tsx** (ejecutor rápido de TS, sin compilar) y los tipos de Node.

Verifica que todo funciona corriendo el primer módulo:

```bash
pnpm m1
```

Deberías ver una serie de líneas con ✅ (las mini-clases del Módulo 1 ejecutándose y auto-verificándose).

---

## Cómo correr el curso

Cada módulo tiene un script corto. También puedes ejecutar todo de una vez o verificar tipos.

```bash
# Ejecutar un módulo completo (corre sus 5 mini-clases en orden)
pnpm m1    # Módulo 1 · Fundamentos
pnpm m2    # Módulo 2 · Clases y cuantificadores
pnpm m3    # Módulo 3 · Grupos, captura y alternancia
pnpm m4    # Módulo 4 · Anclas y banderas
pnpm m5    # Módulo 5 · Lookaround
pnpm m6    # Módulo 6 · Regex en pruebas
pnpm m7    # Módulo 7 · Avanzado y seguro

# Ejecutar los 7 módulos en secuencia (de corrido)
pnpm verify

# Verificar tipos de TODO el proyecto sin ejecutar nada (tsc --noEmit)
pnpm typecheck
```

Para correr **una sola mini-clase** (sin el módulo entero) o **tu reto**, usa `tsx` directamente:

```bash
# Una mini-clase suelta
pnpm tsx modulo-01-fundamentos/01-que-es-regex.ts

# Tu reto del módulo
pnpm tsx modulo-01-fundamentos/reto.ts
```

> Los scripts `m1`..`m7` apuntan al `ejemplo.ts` de cada módulo (el "runner"). El comando `verify` los encadena con `&&`, así que si un módulo falla, se detiene ahí.

---

## Estructura de carpetas

```
regex-qa-course/
├── README.md                        ← este archivo
├── cheatsheet.md                    ← referencia rápida de sintaxis regex
├── curso_regex_qa.md                ← prosa "fuente de verdad", módulo a módulo
├── package.json                     ← scripts m1..m7, verify, typecheck
├── tsconfig.json                    ← TypeScript estricto, sin emitir (noEmit)
│
├── helpers/
│   └── check.ts                     ← aserciones didácticas: check() y checkMatch()
│
├── data/
│   └── samples.ts                   ← datos de muestra compartidos (OmniPizza + QA)
│
├── modulo-01-fundamentos/
├── modulo-02-clases-cuantificadores/
├── modulo-03-grupos-captura/
├── modulo-04-anclas-banderas/
├── modulo-05-lookaround/
├── modulo-06-regex-en-pruebas/
└── modulo-07-avanzado-seguro/
```

Cada `modulo-NN-*/` contiene siempre:

| Archivo | Qué es |
|---|---|
| `01-*.ts` … `05-*.ts` | **Mini-clases**: cada una enseña UN concepto con ejemplos auto-verificados. |
| `ejemplo.ts` | **Runner** del módulo: importa las 5 mini-clases y las ejecuta en orden. |
| `reto.ts` | **Reto** del alumno: una plantilla con TODOs **intencionalmente sin resolver**. |

> ⚠️ Los archivos del "contrato" del curso — `helpers/check.ts`, `data/samples.ts`, `package.json`, `tsconfig.json` — **no se editan**. `data/samples.ts` es la fuente única de datos de muestra; si una mini-clase necesita un caso puntual, lo declara localmente.

---

## Cómo está organizado cada módulo

El curso es **ejecutable y auto-verificado**: no hay un framework de testing (Jest, Vitest…). En su lugar, un helper minúsculo convierte cada ejemplo en una micro-aserción.

### El helper `check()` / `checkMatch()`

Vive en `helpers/check.ts` y lo importan **todas** las mini-clases:

```typescript
import { check, checkMatch } from "../helpers/check";
```

- **`check(etiqueta, real, esperado)`** — compara un valor obtenido contra el esperado e imprime `✅ etiqueta` o `❌ etiqueta — esperado: X, obtenido: Y`. Sirve para resultados de `.match()`, `.replace()`, conteos, objetos extraídos, etc. Usa igualdad estructural simple (primitivos por valor; arrays/objetos por su JSON).
- **`checkMatch(re, input, debeCoincidir)`** — comprueba si una regex coincide (o NO) con un input, según se espera. Internamente usa una copia de la regex **sin** las flags `g`/`y` para que `.test()` no dependa de `lastIndex` (un check debe ser determinista).

Gracias a esto, al correr un módulo ves una columna de ✅/❌ que te dice de inmediato si tu mente coincide con lo que hace el motor de regex.

### Las mini-clases (`01-*.ts` … `05-*.ts`)

Cada mini-clase:

1. Abre con un comentario-cabecera que da la **analogía QA** y la idea central.
2. Introduce un concepto con ejemplos cortos, cada uno cerrado con `check()` / `checkMatch()`.
3. Usa datos reales de `data/samples.ts` cuando aplica (SKUs, emails, logs, etc.).

Puedes leerlas como apuntes y ejecutarlas para ver la teoría confirmada en consola.

### El runner (`ejemplo.ts`)

Cada `ejemplo.ts` simplemente importa las 5 mini-clases del módulo para correrlas de una sola vez (es lo que ejecuta `pnpm mN`). En el Módulo 7 además incluye un **capstone**: un pipeline de validación → parseo → scrubbing sobre un lote de pedidos multi-mercado.

### El reto (`reto.ts`) — sin resolver a propósito

Cada módulo cierra con un `reto.ts` que es **tu** ejercicio. Contiene:

- Una regex marcada con `// TODO:` que arranca como `/CAMBIAME/` (un placeholder que no matchea nada útil).
- Casos de prueba **que no debes tocar**: válidos que deben pasar (`true`) e inválidos que deben rechazarse (`false`).
- Pistas conceptuales que apuntan a las mini-clases del módulo, **nunca la respuesta**.

Estos TODOs quedan **intencionalmente sin resolver**: el aprendizaje está en completarlos tú. Es **esperado** ver ❌ hasta que sustituyas `/CAMBIAME/` por tu regex; cuando todas las filas queden en ✅, dominaste el módulo.

```bash
pnpm tsx modulo-01-fundamentos/reto.ts   # corre tu intento
```

---

## Recursos del curso

- 📋 `cheatsheet.md` — referencia rápida de sintaxis regex (clases, cuantificadores, anclas, grupos, lookaround, flags, Unicode) más comparativa JS vs Java vs Python.
- 📖 `curso_regex_qa.md` — la prosa "fuente de verdad": recorre los 7 módulos mini-clase por mini-clase, con los bloques 🌉 Puente y 🧠 Síntesis, y cierra con una síntesis global.

> **De dónde venís / a dónde vais:** este curso encaja entre el de **TypeScript para QA** y el de **Automatización con Playwright**. La regex que aquí dominás aparece luego en locators, aserciones de URL, filtros de CI y validación de datos.
