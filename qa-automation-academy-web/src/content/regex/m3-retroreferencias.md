# 3.4 — Retro-referencias `\1` y `\k<nombre>`

> **Módulo 3 · Grupos, captura y alternancia**

> **Analogía QA:** una retro-referencia es "lo MISMO que ya capturé, otra vez". Como cuando en QA exiges que el campo "contraseña" y "confirmar contraseña" sean idénticos: no basta con que ambos sean válidos, deben COINCIDIR ENTRE SÍ. La regex puede comparar una parte del texto consigo misma, algo que un patrón "normal" (sin memoria) no puede hacer.

---

## ¿Qué aprendes?

- Cómo `\1` repite **exactamente** lo que capturó el grupo 1.
- Cómo `\k<nombre>` hace lo mismo, pero legible, con grupos nombrados.
- El caso QA clásico: validar `password === confirmPassword` con una sola regex.
- Por qué regex **no** es la herramienta para parsear HTML real.

---

## 1) `\1` = "repite EXACTAMENTE lo que capturó el grupo 1"

Detectar palabra duplicada pegada: capturamos una palabra `(\w+)` y luego exigimos un espacio y la MISMA palabra otra vez con `\1`. El `\b` al inicio y al fin evita matches parciales dentro de otra palabra.

```ts
// @file regex-qa-course/modulo-03-grupos-captura/04-retroreferencias.ts
const reDup = /\b(\w+)\s+\1\b/;
checkMatch(reDup, "el el", true); // misma palabra repetida
checkMatch(reDup, "el la", false); // distintas → no es duplicado
checkMatch(reDup, "se se", true);
```

---

## 2) Aplicado a un log real

`"el el pedido se se confirmó"` tiene DOS duplicados: `"el el"` y `"se se"`. Con la flag `g` + `matchAll` los encontramos todos. Cada match tiene en `m[1]` la palabra repetida.

```ts
// @file regex-qa-course/modulo-03-grupos-captura/04-retroreferencias.ts
const reDupG = /\b(\w+)\s+\1\b/g;
const duplicados: string[] = [];
for (const m of LINEA_PALABRA_DUPLICADA.matchAll(reDupG)) {
  // m[1] existe porque el patrón tiene exactamente un grupo de captura.
  duplicados.push(m[1]);
}
check("palabras duplicadas encontradas", duplicados, ["el", "se"]);
check("cantidad de duplicados", duplicados.length, 2);

// La primera coincidencia completa (m[0]) incluye AMBAS palabras + espacio.
const primer = LINEA_PALABRA_DUPLICADA.match(reDup);
check("primer match completo", primer ? primer[0] : null, "el el");
```

---

## 3) `\k<nombre>` = retro-referencia a un grupo NOMBRADO

Misma idea que `\1` pero legible: capturamos `(?<palabra>\w+)` y la repetimos con `\k<palabra>`. Útil cuando el patrón crece y los números confunden.

```ts
// @file regex-qa-course/modulo-03-grupos-captura/04-retroreferencias.ts
const reDupNombrado = /\b(?<palabra>\w+)\s+\k<palabra>\b/;
const mNom = "se se confirmó".match(reDupNombrado);
// Doble guarda: match puede ser null y .groups puede ser undefined.
const repetida = mNom && mNom.groups ? mNom.groups.palabra : null;
check("palabra repetida (grupo nombrado)", repetida, "se");
```

---

## 4) Caso QA clásico: ¿`password === confirmPassword`?

Un solo patrón valida que ambos campos sean iguales SIN comparar en JS. Formato de entrada: `"Pizza123!:Pizza123!"` (valor:confirmación). `(?<pw>...)` captura el primero y `\k<pw>` exige que el segundo sea idéntico.

```ts
// @file regex-qa-course/modulo-03-grupos-captura/04-retroreferencias.ts
const rePwIgual = /^(?<pw>.+):\k<pw>$/;
checkMatch(rePwIgual, "Pizza123!:Pizza123!", true); // coinciden → ok
checkMatch(rePwIgual, "Pizza123!:Pizza124!", false); // difieren → rechaza
```

---

## 5) Detectar etiqueta HTML mal cerrada (apertura ≠ cierre)

Recordatorio honesto: regex NO es la herramienta para parsear HTML real (lo veremos en M07). Pero como EJERCICIO de retro-referencias, validar que `<tag>...</tag>` use el MISMO nombre de etiqueta ilustra bien el `\k`.

```ts
// @file regex-qa-course/modulo-03-grupos-captura/04-retroreferencias.ts
const reTag = /^<(?<tag>[a-z]+)>.*<\/\k<tag>>$/;
checkMatch(reTag, "<span>texto</span>", true); // misma etiqueta
checkMatch(reTag, "<span>texto</div>", false); // abre span, cierra div
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-03-grupos-captura/04-retroreferencias.ts
```

---

## Qué observar

- Una retro-referencia exige **igualdad de texto**, no solo que ambas partes sean válidas por separado.
- `\1` apunta al grupo de captura número 1; `\k<nombre>` apunta al grupo nombrado: prefiere el nombrado cuando el patrón crezca.
- El ejemplo de HTML es solo didáctico: para HTML/JSON reales usa un parser, no regex.

⬅️ Anterior: [3.3 Grupos nombrados](/docs/regex/m3-grupos-nombrados) · ➡️ Siguiente: [3.5 Extraer de logs](/docs/regex/m3-extraer-de-logs)
