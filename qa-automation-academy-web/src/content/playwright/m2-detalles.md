# Detalles que parecen obvios pero no lo son

Cosas del `ejemplo.spec.ts` que se leen "de pasada" pero esconden una decisión de diseño. Si las cambias por la alternativa "obvia", el test se rompe o pierdes seguridad de tipos.

## `await expect(page).toHaveURL(/\/catalog/)`

- **Qué es:** el argumento entre `/.../ ` es una **expresión regular** (regex), **no** un string. Un regex hace *match parcial*: la aserción pasa si la URL **contiene/matchea** `/catalog` en cualquier parte. Un string, en cambio, exige que la URL sea **exactamente** ese valor.
- **Por qué así (y no la alternativa obvia):** OmniPizza puede añadir cosas a la URL del catálogo —querystring (`?locale=`), ids, o el locale dentro del path (`/mx/catalog`)—. Con regex toleras todo eso. El `\/` escapa la barra `/` porque en un literal regex de JS la `/` es el **delimitador** que abre y cierra la expresión; sin escaparla, el motor creería que el regex terminó ahí.
- **Qué pasa si lo cambias:** si pones el string `"/catalog"`, la aserción exige **igualdad exacta de toda la URL**. Como la URL real es algo como `https://.../catalog?...`, nunca será literalmente `/catalog` y el test **truena** con un timeout de aserción.

## `marketsJson as Market[]`

- **Qué es:** una *type assertion* — le dices a TypeScript "trata este JSON como `Market[]`". Es una promesa que haces tú; **no** es validación en runtime. Al ejecutar, nadie revisa que el JSON realmente cumpla el contrato.
- **Por qué así (y no la alternativa obvia):** importar un `.json` te da un tipo inferido amplio (y a veces `any`, según la config). El `as Market[]` te devuelve autocompletado y chequeo de `market.code`, `market.currency`, etc. en compile-time, que es donde queremos atrapar los errores.
- **Qué pasa si lo cambias:** si quitas el `as Market[]`, el tipo pasa a ser el inferido del JSON (o `any`) y **pierdes el autocompletado y la seguridad** de `market.code` / `market.currency`. (Ojo: como es assertion, no validación, un JSON con datos basura sí compilaría — el contrato real lo defiende el `.d.ts` vía `tsc`, no este cast.)

## `const allCards = await pizzaCards.all()`

- **Qué es:** `.all()` devuelve `Promise<Locator[]>` — **materializa** la lista: consulta el DOM *ahora* y te entrega un array fijo de locators. Por eso lleva `await`.
- **Por qué así (y no la alternativa obvia):** comparado con `pizzaCards.first()`, que **no** necesita `await` porque devuelve un `Locator` perezoso (lazy) — un puntero que recién resuelve el DOM cuando lo usas en una acción o aserción. `.all()` rompe esa pereza a propósito: necesitas el array concreto para iterarlo y contar (`allCards.length`).
- **Qué pasa si lo cambias:** si omites el `await`, `allCards` queda como una `Promise`, no como array; `allCards.length` da `undefined` y el `for...of` no itera nada (o falla). Si en cambio creías que `.first()` necesita `await` y lo agregas, no rompe pero es ruido — el locator es perezoso por diseño.

## `page.locator('[data-testid^="pizza-card-"]')`

- **Qué es:** un CSS selector con el operador de atributo `^=`, que significa **"el atributo empieza con"**. Aquí matchea cualquier elemento cuyo `data-testid` arranque con `pizza-card-`.
- **Por qué así (y no la alternativa obvia):** los testids de las pizzas son **dinámicos** (`pizza-card-123`, `pizza-card-456`...), así que no puedes usar `getByTestId("pizza-card-123")` con un id fijo. Bajar al nivel 4 de la jerarquía (CSS) es **legítimo** justamente por eso (ver la tabla de jerarquía arriba). No es deuda técnica: es la herramienta correcta para testids variables.
- **Qué pasa si lo cambias:** si usas `=` en vez de `^=` (`[data-testid="pizza-card-"]`), exiges igualdad exacta y no matcheas **ninguna** tarjeta. Si intentas un `getByTestId` con id fijo, solo encuentras una pizza concreta (frágil) o ninguna.

## `for (const card of allCards) { await expect(card)... }`

- **Qué es:** un bucle `for...of` que recorre el array de locators y hace una aserción `await` por cada tarjeta.
- **Por qué así (y no la alternativa obvia):** `for...of` **serializa** los `await`: espera a que termine la aserción de una tarjeta antes de pasar a la siguiente. La alternativa "obvia" `allCards.forEach(async (card) => { await ... })` **no espera** las promesas — `forEach` ignora el valor de retorno del callback, así que los `await` de adentro se pierden y el test sigue de largo.
- **Qué pasa si lo cambias:** con `forEach`, las aserciones se disparan en paralelo sin que el test las espere; un fallo puede ocurrir **después** de que el test ya terminó (unhandled rejection) y obtienes falsos verdes. `for...of` (o `Promise.all` si quieres paralelismo controlado) es lo correcto cuando hay `await` dentro.

## `` test(`TC-${market.code} — login + catálogo en mercado ${market.code} @smoke`, ...) ``

- **Qué es:** el título del test se construye con un *template string* que interpola `market.code` en cada vuelta del `for...of` sobre `markets`.
- **Por qué así (y no la alternativa obvia):** cada iteración del bucle registra un `test()` distinto, y Playwright **exige títulos únicos** dentro del mismo describe. El `${market.code}` garantiza `TC-MX`, `TC-US`, `TC-CH`, `TC-JP` — nombres distintos y legibles en el reporte. Además, el tag `@smoke` embebido en el título es lo que permite filtrar con `--grep @smoke`.
- **Qué pasa si lo cambias:** si pones un título fijo (`"TC catálogo"`) para los 4, tendrás títulos duplicados — confusos en el reporte y difíciles de aislar con `--grep` o `-g "TC-MX"`. Si quitas `@smoke`, el caso deja de aparecer en `pnpm test:smoke`.
