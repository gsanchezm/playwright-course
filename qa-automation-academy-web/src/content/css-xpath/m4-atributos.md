# 4.4 — Atributos en XPath

> **Módulo 4 · XPath Fundamentos**

> **Analogía QA:** el `@` es tu "buscar por hook de prueba". En la app real, el ancla más estable casi nunca es la clase visual, sino el `data-testid` que el equipo puso a propósito. `//button[@data-testid='login-button-desktop']` es el equivalente XPath de `getByTestId`: explícito, estable y legible. Pero hay una trampa brutal con `@class`: en XPath 1.0, `@class` compara el atributo **entero** como un string, no clase-por-clase.

---

## ¿Qué aprendes?

- A seleccionar por atributo exacto con `[@attr='valor']` (el hook de prueba).
- La trampa de `[@class='...']` con **multi-clase** y por qué devuelve 0.
- El remedio robusto: `contains(@class, 'token')`.
- Presencia de atributo `[@attr]` (booleanos como `disabled`) y combinar predicados con `and`.

---

## 1) `@attr` exacto: el hook de prueba

`[@attr='valor']` exige igualdad **exacta** del atributo. Para `data-testid` (que es único y deliberado) es el locator ideal: uno y solo uno.

```ts
// @file css-xpath-qa-course/modulo-04-xpath-fundamentos/04-atributos.ts
check(
  "//button[@data-testid='login-button-desktop'] = 1",
  countXpath("//button[@data-testid='login-button-desktop']"),
  1,
);
check(
  "//*[@data-testid='pizza-card-103'] = 1 (la card agotada)",
  countXpath("//*[@data-testid='pizza-card-103']"),
  1,
);
```

---

## 2) La trampa de `@class` con multi-clase

`[@class='pizza-card']` **falla**. En el fixture las tarjetas son `class="pizza-card css-7h3k1p"` (¡dos clases!). XPath 1.0 compara el string **completo** del atributo, así que `'pizza-card'` nunca es igual a `'pizza-card css-7h3k1p'`. Resultado: **0** matches. Es el error silencioso más común al portar un selector de CSS (`.pizza-card`) a XPath.

```ts
// @file css-xpath-qa-course/modulo-04-xpath-fundamentos/04-atributos.ts
check("//*[@class='pizza-card'] = 0 (¡no es igualdad de clases!)", countXpath("//*[@class='pizza-card']"), 0);
// El string completo SÍ matchea (pero es frágil y depende del orden exacto):
check(
  "//article[@class='pizza-card css-7h3k1p'] = 3 (no incluye la agotada, que añade is-soldout)",
  countXpath("//article[@class='pizza-card css-7h3k1p']"),
  3,
);
```

> ⚠️ En CSS, `.pizza-card` matchea aunque haya más clases. En XPath 1.0, `[@class='pizza-card']` exige que el atributo `class` sea **exactamente** ese string. La card agotada añade `is-soldout`, por eso el match exacto da 3 y no 4. Nunca uses igualdad exacta de `@class` salvo que controles el string completo.

---

## 3) El remedio: `contains(@class, 'token')`

`contains(@class,'pizza-card')` pregunta "¿el string de `@class` **contiene** este fragmento?". Eso sí abarca las 4 tarjetas, incluida la agotada (que tiene la clase extra `is-soldout`). Es el puente a lo que verás a fondo en M7.

```ts
// @file css-xpath-qa-course/modulo-04-xpath-fundamentos/04-atributos.ts
check(
  "//article[contains(@class,'pizza-card')] = 4 (¡incluye la agotada!)",
  countXpath("//article[contains(@class,'pizza-card')]"),
  4,
);
```

---

## 4) Presencia `[@attr]` y combinar con `and`

`[@attr]` (sin `=`) significa "el atributo **existe**", sin importar su valor. Sirve para estados booleanos como `disabled`. Y puedes combinar predicados con `and`.

```ts
// @file css-xpath-qa-course/modulo-04-xpath-fundamentos/04-atributos.ts
check("//button[@disabled] = 2 (el de 'Agotado' + el de 'Place order')", countXpath("//button[@disabled]"), 2);
check("//input[@disabled] = 2 (jalapeño + transferencia)", countXpath("//input[@disabled]"), 2);
// 'and' encadena condiciones: un <article> que está agotado Y es de carnes.
check(
  "//article[@data-sold-out='true' and @data-category='meat'] = 1",
  countXpath("//article[@data-sold-out='true' and @data-category='meat']"),
  1,
);
const agotada = $x("//article[@data-sold-out='true']")[0] as Element;
check("y esa card es pizza-card-103", agotada.getAttribute("data-testid"), "pizza-card-103");
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-04-xpath-fundamentos/04-atributos.ts
```

---

## Qué observar

- `[@data-testid='...']` es el ancla más estable: explícito y único.
- `[@class='pizza-card'] = 0` con multi-clase: XPath 1.0 compara el string **entero**.
- `contains(@class,'pizza-card') = 4` es el remedio robusto (incluye la card con clase extra).
- `[@attr]` sin valor verifica **presencia**; `and` combina condiciones en un mismo predicado.

➡️ Siguiente: [4.5 XPath en Playwright, Selenium y DevTools](/docs/css-xpath/m4-xpath-en-herramientas)
