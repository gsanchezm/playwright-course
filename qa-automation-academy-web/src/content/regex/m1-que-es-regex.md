# 1.1 — ¿Qué es una expresión regular?

> **Módulo 1 · Fundamentos**

> **Analogía QA:** una regex es una **regla de validación reutilizable**, igual que un criterio de aceptación de un campo de formulario. En vez de escribir "el código de cupón debe tener 3 letras y 3 dígitos" en prosa, lo escribes en un mini-lenguaje que la máquina puede ejecutar y reusar.

---

## ¿Qué aprendes?

- Qué es una regex: una regla declarativa que describe un **patrón de texto**.
- Cómo hacerle la pregunta más básica con `.test()`: ¿este texto cumple el patrón? → `true` / `false`.
- Que las regex son **case-sensitive** por defecto.
- Por qué su gran valor es ser **reutilizable**: una regla, muchos textos.

---

## La idea central: una regex describe un patrón

`RegExp.test(texto)` es la pregunta más básica que le puedes hacer a una regex: *"¿este texto cumple el patrón?"* → responde `true` / `false`. Es el "¿pasa o no pasa?" de un caso de prueba: un veredicto binario.

```ts
// @file regex-qa-course/modulo-01-fundamentos/01-que-es-regex.ts
// Patrón: la palabra literal "QA" en alguna parte del texto.
const reContieneQA = /QA/;

// .test() devuelve un boolean: ¿el texto cumple el patrón?
check("'equipo QA' contiene 'QA'", reContieneQA.test("equipo QA"), true);
check("'equipo dev' NO contiene 'QA'", reContieneQA.test("equipo dev"), false);
```

---

## Las regex distinguen mayúsculas de minúsculas

Por defecto una regex es **case-sensitive**, justo como un assertion estricto: `"QA"` y `"qa"` son textos distintos. Esto importa en QA: validar un ambiente `"PROD"` no es lo mismo que `"prod"`.

```ts
// @file regex-qa-course/modulo-01-fundamentos/01-que-es-regex.ts
// "QA" y "qa" son textos distintos para una regex.
check("'qa' en minúsculas NO matchea /QA/", reContieneQA.test("qa"), false);
```

---

## Una regla, muchos textos

El valor de una regex (como el de un criterio de aceptación) es que la defines **una vez** y la aplicas a **N entradas**. Aquí validamos un lote completo con la misma regla:

```ts
// @file regex-qa-course/modulo-01-fundamentos/01-que-es-regex.ts
const entradas = ["build QA #12", "build QA #13", "build DEV #14"];
const cuantasMencionanQA = entradas.filter((t) => reContieneQA.test(t)).length;
// 2 de las 3 contienen "QA" (las dos primeras).
check("2 de 3 entradas mencionan QA", cuantasMencionanQA, 2);
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-01-fundamentos/01-que-es-regex.ts
```

---

## Qué observar

- `.test()` devuelve **solo un boolean**: el "sí/no" más barato que existe.
- La regex `/QA/` busca el patrón **en cualquier parte** del texto, no exige que sea el texto completo.
- Cambiar mayúsculas por minúsculas cambia el resultado: la regex es estricta por defecto.
- Una misma regex se reutiliza contra muchas entradas (`.filter(...)`) — esa es su gran ventaja.

➡️ Siguiente: [1.2 Crear una regex](/docs/regex/m1-crear-regex)
