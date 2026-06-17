# 5.3 — normalize-space() anti-flaky

> **Módulo 5 · XPath Texto y funciones**

> **Analogía QA:** el HTML real viene lleno de espacios, saltos de línea y tabulaciones invisibles que el navegador **no** muestra pero el DOM **sí** guarda. Un locator que compara texto crudo contra esa basura invisible es **flaky**: pasa en un entorno y falla en otro. `normalize-space()` es el "trim + colapso" que vuelve la comparación robusta y reproducible.

---

## ¿Qué aprendes?

- Por qué `text()="$189.00"` puede dar `0` aunque el precio "se vea" como `$189.00`.
- Qué hace `normalize-space()`: **recorta** el whitespace de los extremos y **colapsa** las secuencias internas a un solo espacio.
- Que el mismo problema reaparece en el total del checkout — y la cura es idéntica.
- La regla anti-flaky: **normaliza siempre** que compares texto visible.

---

## text() crudo falla con whitespace alrededor

El precio de Pepperoni se renderiza `"$189.00"`, pero en el fixture el `<span>` trae saltos de línea y espacios alrededor (`"\n   $189.00\n  "`). Por eso `text()="$189.00"` da `0`: el nodo de texto **no** es exactamente `"$189.00"`.

```ts
// @file css-xpath-qa-course/modulo-05-xpath-texto-funciones/03-normalize-space.ts
check(
  '//span[@data-testid="price-101"][text()="$189.00"] → 0 (whitespace invisible)',
  countXpath('//span[@data-testid="price-101"][text()="$189.00"]'),
  0,
);
```

---

## normalize-space() limpia el texto: el mismo precio ahora matchea

`normalize-space(.)` toma el string-value, quita el whitespace de los extremos y colapsa cualquier secuencia interna a un solo espacio. El `"$189.00"` sucio se vuelve `"$189.00"` limpio → ahora la igualdad **sí** matchea. `0 → 1`.

```ts
// @file css-xpath-qa-course/modulo-05-xpath-texto-funciones/03-normalize-space.ts
check(
  '//span[@data-testid="price-101"][normalize-space(.)="$189.00"] → 1',
  countXpath('//span[@data-testid="price-101"][normalize-space(.)="$189.00"]'),
  1,
);
```

---

## Mismo patrón en el total del checkout

El `<div class="order-total">` también tiene whitespace deliberado alrededor de `"Total: $641.48"`. Mismo síntoma, misma cura: crudo da `0`, normalizado da `1`. Y `normalize-space` también blinda a `contains` de que un salto de línea se cuele en medio de tu subcadena.

```ts
// @file css-xpath-qa-course/modulo-05-xpath-texto-funciones/03-normalize-space.ts
check(
  '//div[@data-testid="order-total"][text()="Total: $641.48"] → 0',
  countXpath('//div[@data-testid="order-total"][text()="Total: $641.48"]'),
  0,
);
check(
  '//div[@data-testid="order-total"][normalize-space(.)="Total: $641.48"] → 1',
  countXpath('//div[@data-testid="order-total"][normalize-space(.)="Total: $641.48"]'),
  1,
);

check(
  '//div[@data-testid="order-total"][contains(normalize-space(.), "$641.48")] → 1',
  countXpath('//div[@data-testid="order-total"][contains(normalize-space(.), "$641.48")]'),
  1,
);
```

> 🔷 **qa_transfer:** Playwright **normaliza** el whitespace por ti en `getByText` / `toHaveText` (colapsa y recorta como `normalize-space`). En XPath crudo eres **tú** quien debe pedirlo explícitamente — por eso es el reflejo anti-flaky #1 al escribir XPath.

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-05-xpath-texto-funciones/03-normalize-space.ts
```

---

## Qué observar

- El mismo precio `$189.00` da `0` con `text()` crudo y `1` con `normalize-space(.)`: la diferencia es **whitespace invisible** que el DOM guardó.
- `normalize-space()` hace **dos** cosas: recorta los extremos y colapsa los espacios internos.
- El total del checkout reproduce el bug — no es un caso aislado, es el patrón a vigilar.
- Regla práctica: envuelve en `normalize-space(.)` **toda** comparación de texto visible para no escribir tests flaky.

➡️ Siguiente: [5.4 translate() para case-insensitive](/docs/css-xpath/m5-translate)
