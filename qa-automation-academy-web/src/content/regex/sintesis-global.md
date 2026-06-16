# Síntesis global — Cierre del curso de Regex para QA

> **Curso completo · Regex para Automatización de Pruebas**

> **Analogía QA:** terminaste de armar tu **caja de herramientas**. No memorizaste símbolos sueltos: aprendiste qué problema de testing resuelve cada pieza. Un QA senior no es el que conoce más metacaracteres, sino el que **elige la herramienta correcta** — incluida la decisión de no usar regex. Esta página es tu mapa para volver a ella cuando estés frente a un caso real.

---

## El recorrido completo: un insight por módulo

Cada módulo resolvió un problema concreto de validación o extracción. Visto en conjunto, es una progresión que va del "¿pasa o no pasa?" más simple hasta el criterio de seguridad y arquitectura.

| Módulo | Tema | El "aha" que te llevas |
| --- | --- | --- |
| **M01 · Fundamentos** | `.test()`, crear regex, case-sensitive | Una regex es una **regla de validación reutilizable**: la defines una vez y la aplicas a N entradas. `.test()` da el veredicto binario, como un assertion. |
| **M02 · Clases y cuantificadores** | `[a-z]`, `\d`, `\w`, `+ * {n,m}`, greedy vs lazy | Las **clases** describen "qué caracteres son válidos en cada posición" y los **cuantificadores** "cuántas veces", sin escribir N tests. Ojo: `\w`/`\d` son ASCII. |
| **M03 · Grupos y alternancia** | `(...)`, `(?:...)`, grupos nombrados, alternancia `\|` | Los **paréntesis** controlan el alcance de `\|` y **qué se extrae**. Un grupo de captura de más **desplaza los índices** y rompe el código silenciosamente. |
| **M04 · Anclas, límites y banderas** | `^ $`, `\b`, flags `i g m s u` | **Anclar** distingue "contiene el patrón" de "el texto **es** exactamente el patrón": así evitas el falso positivo que acepta `"PRODUCTION"` cuando validabas `"PROD"`. |
| **M05 · Lookaround** | `(?=...)`, `(?!...)`, lookbehind | Las **aserciones de ancho cero** verifican contexto **sin consumir** caracteres: apilas condiciones independientes ("y además...") como en una política de contraseñas. |
| **M06 · Regex en pruebas** | validar datos, parsear logs, *scrubbing* | La regex es tu **guardia de calidad** en tres puertas: validar datos antes del test, extraer info de logs/traces y enmascarar PII en snapshots. `[^@\s]+` > `\S+` para emails. |
| **M07 · Avanzado y seguro** | ReDoS, Unicode, mantenible, cuándo NO | Una regex insegura es un **bug de seguridad**; con datos reales `\p{L}`+`u` es obligatorio; y lo más senior es **saber cuándo soltar la regex** (HTML/JSON → parser). |

---

## 🗺️ Mapa mental: qué herramienta de regex usar para qué problema de testing

Cuando estés frente a un caso real, parte del **problema**, no del símbolo:

```text
┌─ ¿La estructura ANIDA (HTML, JSON, código)? ───────────────────────┐
│   SÍ →  ❌ NO uses regex. Usa un PARSER:                            │
│         JSON.parse / DOMParser / cheerio / jsdom            (M07)   │
│   NO →  el dato es PLANO y regular: sigue abajo ↓                   │
└────────────────────────────────────────────────────────────────────┘
```

| Tu problema de testing | La herramienta | Módulo |
| --- | --- | --- |
| "¿Este texto cumple el formato? sí/no" | `regex.test(texto)` → boolean | M01 |
| "Acepta solo estos caracteres, esta cantidad de veces" | clases `[...]` + cuantificadores `+ * {n,m}` | M02 |
| "El texto **completo** debe ser exactamente esto" | anclar `^ ... $` (evita falsos positivos) | M04 |
| "Match de palabra entera, no subcadena" (`ERROR`, no `ERRORLEVEL`) | límites de palabra `\b ... \b` | M04 |
| "Extraer campos de una línea (fecha, sku, dominio)" | grupos `(...)` y `.match()`; mejor **nombrados** `(?<x>...)` | M03 |
| "Una de varias formas válidas" (`MX\|US\|CH\|JP`) | alternancia `\|` con grupo `(?:...)` | M03 |
| "Validar varias condiciones a la vez sin consumir texto" (password policy) | lookahead `(?=...)` / `(?!...)` | M05 |
| "Enmascarar PII / tokens volátiles en logs y snapshots" | `.replace(/.../g, "<PLACEHOLDER>")` | M06 |
| "Datos internacionales: acentos, otros alfabetos" | `\p{L}` / `\p{N}` con flag `u` | M07 |
| "Input externo: que no me tumbe el servidor" | sin anidar + anclar + acotar `{0,n}` + guarda de longitud | M07 |
| "Estructura anidada o recursiva" | 🚫 **parser, no regex** | M07 |

> **Regla de bolsillo final:** si para entenderlo necesitas contar paréntesis equilibrados, no es trabajo de regex. Y si toca input de usuario, **anclada, acotada y con guarda de longitud** o no la mereces en producción.

---

## Las tres lecciones que sobreviven al curso

1. **Anclar y acotar lo es casi todo.** El falso positivo (M04) y el ReDoS (M07) nacen de patrones laxos y abiertos. Un `^ ... $` con un `{n,m}` honesto previene los dos.
2. **El dato real no es ASCII en inglés.** Probar solo `"John"` es un test sesgado. `\p{L}`+`u` (M07) es cobertura, no lujo.
3. **La herramienta correcta a veces no es la regex.** Validar/extraer datos planos: sí. Parsear estructuras anidadas: parser. El criterio de **cuándo no usarla** es lo que distingue al QA senior.

---

🎓 **Has completado el curso de Regex para QA.** Ya no escribes regex que "parecen funcionar": escribes regex **seguras, internacionales, mantenibles** — y sabes reconocer cuándo el problema pide otra herramienta.
