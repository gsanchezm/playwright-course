# 🧠 Síntesis — Módulo 4: Anclas y banderas

> **Módulo 4 · Anclas y banderas**

> **Analogía QA:** las anclas son el control de aduana (abren toda la maleta) y las flags son los ajustes de tu lupa. Elegir mal una flag no rompe la prueba de forma ruidosa: la hace **mentir en silencio**. Y eso es peor que un test que falla.

---

## Lo que cubriste

- **4.1 Anclas `^` `$`** — "contiene" vs "es exactamente". Validar el dato completo, no una subcadena.
- **4.2 Límites `\b` `\B`** — palabra suelta vs subcadena interna. Evitar `ERRORLEVEL` cuando buscas `ERROR`.
- **4.3 Flags `i` `g`** — insensibilidad a mayúsculas y búsqueda global; el estado de `lastIndex`.
- **4.4 Flags `m` `s`** — `^`/`$` por línea (`m`) y `.` que cruza `\n` (`s`); herramientas opuestas.
- **4.5 Flags `u` `y`** — Unicode por punto de código (`u`) y match pegajoso sin huecos (`y`).

---

## 🧠 Síntesis e insights clave — Módulo 4

- Sin anclas validas subcadenas, no el dato completo.
- Las flags mal elegidas hacen que las pruebas "mientan".
- `g` + `lastIndex` tiene estado (cuidado al reusar la misma regex).

---

## 🌉 Puente a otros lenguajes

- **Java:** `Pattern.MULTILINE` / `CASE_INSENSITIVE` / `DOTALL`; `matches()` (ancla implícita, exige coincidencia total) vs `find()` (busca subcadena).
- **Python:** `re.M` / `re.I` / `re.S`; `fullmatch` (todo el texto, como anclar con `^...$`) vs `search` (en cualquier posición).

> 💡 En Java y Python tienes métodos que anclan **implícitamente** (`matches`, `fullmatch`). En JavaScript no existe ese atajo: el anclaje es tu responsabilidad con `^` y `$`. Por eso este módulo insiste tanto en ellos.

---

## Tabla de referencia rápida

| Símbolo / flag | Significado | Recuerda |
| --- | --- | --- |
| `^` `$` | Inicio / fin del texto (o de línea con `m`) | Posiciones, no consumen caracteres |
| `\b` `\B` | Borde / anti-borde de palabra | Útil para palabras sueltas en logs |
| `i` | Case-insensitive | Un patrón cubre `error`/`Error`/`ERROR` |
| `g` | Global (todas las coincidencias) | Tiene estado: `lastIndex` |
| `m` | Multilínea: `^`/`$` por línea | No cambia el `.` |
| `s` | dotAll: `.` cruza `\n` | Opuesto a parsear línea por línea |
| `u` | Unicode por punto de código | Habilita `\u{...}` y `\p{...}` |
| `y` | Sticky: match en `lastIndex` exacto | No salta huecos (tokenizers) |

---

⬅️ Anterior: [🚩 Reto M4](/docs/regex/m4-reto)
