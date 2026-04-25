# 🚩 Reto — Módulo 5: "My First Page Object"

> **Módulo 5 · Clases**

> **Analogía QA:** vas a construir tu propio mini-POM con dos clases (una base y una hija), exactamente como lo harías al iniciar un framework de automatización desde cero.

---

## Instrucciones

1. Crea una clase `BaseTest` que:
   - Tenga una propiedad `protected baseUrl: string` asignada en el constructor.
   - Tenga un método `navigate(url: string): void` que imprima `"Navigating to: [url]"`.
2. Crea una clase `SearchTest extends BaseTest` que:
   - Agregue una propiedad `private searchButtonId: string` con valor `"#search-btn"`.
3. En `SearchTest`, agrega un método público `executeSearch(term: string): void` que:
   - Use el método heredado `navigate` para ir a `baseUrl`.
   - Imprima `"Searching for [term] using button [searchButtonId]"`.
4. Crea una instancia de `SearchTest` y ejecuta una búsqueda.

---

## Plantilla

```ts
// @file modulo-05-classes/reto.ts
// 🚩 Reto QA - Módulo 5: "My First Page Object"

// TODO 1: Crea una clase "BaseTest" que:
//   - Tenga una propiedad protegida "baseUrl" (string) asignada en el constructor
//   - Tenga un método "navigate(url: string): void" que imprima
//     "Navigating to: [url]"


// TODO 2: Crea una clase "SearchTest" que herede de "BaseTest"
//   - Agrega una propiedad privada "searchButtonId" de tipo string
//     con valor "#search-btn"


// TODO 3: En "SearchTest", agrega un método público
//   "executeSearch(term: string): void" que:
//   - Use el método heredado "navigate" para ir a baseUrl
//   - Imprima "Searching for [term] using button [searchButtonId]"


// TODO 4: Crea una instancia de SearchTest y ejecuta una búsqueda
// Ejemplo:
//   const search = new SearchTest("https://qa.store.com");
//   search.executeSearch("laptop");
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-05-classes/reto.ts
```

**Output esperado:**

```bash
Navigating to: https://qa.store.com
Searching for laptop using button #search-btn
```

---

## Checklist de auto-corrección

- [ ] `BaseTest` declara `baseUrl` con visibilidad **`protected`** (no `private`, no público).
- [ ] `SearchTest extends BaseTest` y llama `super(baseUrl)` en su constructor.
- [ ] `searchButtonId` es **`private`** y solo se usa dentro de `SearchTest`.
- [ ] `executeSearch` invoca `this.navigate(this.baseUrl)` antes de imprimir el mensaje de búsqueda.
- [ ] Crear `new SearchTest("...")` produce los dos `console.log` esperados en orden.

---

## Pistas (sólo si te atoras)

<details>
<summary>Ver pistas</summary>

- Estructura de `BaseTest`:
  ```ts
  class BaseTest {
    protected baseUrl: string;
    constructor(baseUrl: string) { this.baseUrl = baseUrl; }
    navigate(url: string): void { console.log(`Navigating to: ${url}`); }
  }
  ```
- Estructura de `SearchTest`:
  ```ts
  class SearchTest extends BaseTest {
    private searchButtonId: string = "#search-btn";
    executeSearch(term: string): void {
      this.navigate(this.baseUrl);
      console.log(`Searching for ${term} using button ${this.searchButtonId}`);
    }
  }
  ```
- `protected` deja que la hija lea `this.baseUrl`; `private` no lo permitiría.

</details>

---

⬅️ Anterior: [5.4 getters / setters en un test case](/docs/typescript/m5-getters-setters)
