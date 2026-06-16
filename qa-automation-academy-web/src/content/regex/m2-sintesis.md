# 🧠 Síntesis — Módulo 2: Clases y cuantificadores

> **Módulo 2 · Clases y cuantificadores**

> **Analogía QA:** terminaste de afinar el "guardia de la puerta". Ya sabes describir QUÉ caracteres aceptas (clases), CUÁNTOS (cuantificadores) y exigirlo sobre TODO el dato (anclas). Es el kit mínimo para escribir validadores que no dejen pasar basura.

---

## Lo que cubriste

- **2.1** Clases `[abc]`, rangos `[a-z]` y negación `[^abc]`: una clase vale por UN caracter.
- **2.2** Predefinidas `\d` `\w` `\s` y negaciones `\D` `\W` `\S`, con su letra chica ASCII.
- **2.3** Cuantificadores `*` `+` `?` `{n}` `{n,}` `{n,m}` y por qué el anclaje `^...$` es obligatorio.
- **2.4** Greedy vs lazy: el glotón se pasa; el perezoso `?` (o la clase negada `[^x]+`) extrae justo lo necesario.
- **2.5** Validadores reales: clase + cuantificador + anclas, probados contra datasets de válidos e inválidos.
- **🚩 Reto** Validar el SKU `PZ-####` con `^[A-Z]{2}-\d{4}$`.

---

## 🧠 Síntesis e insights clave — Módulo 2

- Las clases definen "qué caracteres se aceptan".
- Cuantificar mal produce falsos positivos.
- `greedy` muerde de más; usa lazy `?` o clases negadas.

---

## 🌉 Puente a otros lenguajes

- **Java / Python:** clases POSIX `[[:digit:]]` (equivale a `[0-9]`), `[[:alpha:]]`, `[[:alnum:]]`. JavaScript no las soporta; usa `\d`, clases explícitas o `\p{...}`.
- **Comportamiento Unicode de `\d` / `\w`** que varía entre motores: en JavaScript son ASCII y la flag `u` no los amplía; en otros (p.ej. .NET) pueden incluir letras/dígitos Unicode por defecto. No asumas el mismo comportamiento al portar una regex.

---

## ⚠️ El recordatorio que más te va a salvar

En JavaScript la flag `u` **NO** convierte `\w`/`\d` en Unicode: siguen siendo ASCII (`café` no pasa `^\w+$` ni con `u`). El arreglo real para letras internacionales es `\p{L}` **con** la flag `u`. Si tu app es multi-mercado (OmniPizza: MX/US/CH/JP), tenlo presente. Lo profundizamos en M07.

---

## Checklist de dominio

- [ ] Sé que una clase `[...]` vale por UN caracter; para varios necesito un cuantificador.
- [ ] Anclo SIEMPRE con `^ ... $` cuando valido el dato completo (si no, valido "contiene").
- [ ] Distingo `\d`/`\w` (ASCII) de `\p{L}` (Unicode, requiere flag `u`).
- [ ] Elijo entre greedy `.+`, lazy `.+?` y la clase negada `[^x]+` según lo que quiero extraer.
- [ ] Pruebo cada validador contra un dataset de válidos **y** de inválidos.

---

⬅️ Anterior: [🚩 Reto M2](/docs/regex/m2-reto)
