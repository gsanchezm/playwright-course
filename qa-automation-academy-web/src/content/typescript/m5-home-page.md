# 5.3 — `HomePage extends BasePage`

> **Módulo 5 · Clases**

> **Analogía QA:** otra página del sitio que reutiliza `navigate()` y `waitForLoad()` sin reimplementarlos. Una segunda clase hija demuestra el verdadero valor de la herencia: la lógica común vive en **un solo sitio**.

---

## ¿Qué aprendes?

- Cómo una **misma clase base** soporta múltiples Page Objects sin acoplarlos entre sí.
- Que las propiedades privadas (`searchBar`) de una clase hija **no se cruzan** con las de otra.
- Por qué cada instancia tiene su propia copia de las propiedades (estado independiente).

---

## Código

```ts
// @file modulo-05-classes/03-home-page.ts
import { BasePage } from "./01-base-page";

export class HomePage extends BasePage {
  private searchBar: string = "#search-input";

  search(term: string): void {
    this.navigate("/home");         // heredado de BasePage
    console.log(`Typing "${term}" in ${this.searchBar}`);
    console.log(`Search executed for: ${term}`);
  }
}

const homePageDemo = new HomePage("https://qa.myapp.com");
homePageDemo.search("wireless keyboard");
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-05-classes/03-home-page.ts
```

---

## Qué observar

- `HomePage` no necesita constructor propio: hereda el de `BasePage` automáticamente.
- `this.navigate("/home")` funciona **sin importar nada**: es un método heredado de `BasePage`.
- Si más adelante `BasePage` agrega un método nuevo (por ejemplo `screenshot()`), tanto `LoginPage` como `HomePage` lo reciben **gratis**. Esa es la promesa del POM bien construido.

---

⬅️ Anterior: [5.2 LoginPage](/docs/typescript/m5-login-page) · ➡️ Siguiente: [5.4 getters / setters en un test case](/docs/typescript/m5-getters-setters)
