# 🧠 Síntesis — Módulo 3: Grupos, captura y alternancia

> **Módulo 3 · Grupos, captura y alternancia**

> **Analogía QA:** terminaste de armar tu kit de extracción de evidencia. Ya sabes acotar el "o", capturar solo lo que vas a usar, nombrar tus campos para que las aserciones se lean solas, y comparar texto consigo mismo. Eso es, literalmente, parsear.

---

## Lo que cubriste

- **3.1** Grupos `(...)` y alternancia `|`: la precedencia del `|` y por qué casi siempre lo acotas.
- **3.2** Captura `(...)` vs no-captura `(?:...)`: índices estables y `$1`/`$2` en `replace()`.
- **3.3** Grupos nombrados `(?<nombre>...)`: aserciones auto-documentadas y objetos tipados.
- **3.4** Retro-referencias `\1` y `\k<nombre>`: comparar una parte del texto consigo misma.
- **3.5** Extraer datos de logs con `matchAll` + grupos nombrados.

---

## 🧠 Síntesis e insights clave — Módulo 3

- **Capturar = parsear.**
- Los grupos nombrados hacen las aserciones **auto-documentadas**.
- Usa no-captura `(?:...)` cuando **solo agrupas**.

---

## 🌉 Puente a otros lenguajes

- Java: `m.group("nombre")`
- Python: `m.group('nombre')` / `m.groupdict()`
- Ojo con la disponibilidad de grupos nombrados según la versión.

---

## Checklist de dominio

- [ ] Sé predecir qué cuela `/^QA|UAT|PROD$/` y cómo lo arregla `/^(QA|UAT|PROD)$/`.
- [ ] Distingo cuándo usar `(...)` (voy a leer el grupo) de `(?:...)` (solo agrupo).
- [ ] Accedo a campos por nombre con la doble guarda `if (m && m.groups)` o con `?.groups?.`.
- [ ] Uso `\k<nombre>` para exigir igualdad de texto (p. ej. `password === confirmPassword`).
- [ ] Recorro TODAS las ocurrencias con `matchAll` + flag `g` y construyo objetos tipados.

---

⬅️ Anterior: [🚩 Reto M3](/docs/regex/m3-reto)
