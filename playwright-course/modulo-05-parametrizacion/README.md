# Módulo 5: Parametrización de Test Scripts

> **Objetivo:** Aprender a correr el mismo test con múltiples conjuntos de datos (data-driven testing), leer datos desde JSON, crear fixtures personalizadas y usar variables de entorno.

> **Referencia oficial:** [parameterize-tests](https://playwright.dev/docs/test-parameterize) · [test-fixtures](https://playwright.dev/docs/test-fixtures)

---

## 🎯 Analogía principal

> **Data-driven testing = un solo plan de pruebas que se ejecuta con 10 usuarios distintos.**
>
> En pruebas manuales tendrías una tabla:
>
> | Usuario | Password | Resultado esperado |
> |---------|----------|---------------------|
> | admin | 1234 | login OK |
> | viewer | abcd | login OK |
> | hacker | xxxx | login FAIL |
>
> Y pasarías horas ejecutando el mismo procedimiento 3 veces. En Playwright: escribes el procedimiento UNA vez y le pasas la tabla como parámetro. El robot hace los 3 casos automáticamente.

---

## Archivos del módulo

| Archivo | Técnica | Caso de uso |
|---------|---------|-------------|
| [01-foreach-simple.spec.ts](./01-foreach-simple.spec.ts) | `forEach` con array inline | Pocos casos, simple |
| [02-data-driven-json.spec.ts](./02-data-driven-json.spec.ts) | Datos desde un archivo JSON | Muchos casos, datos reales |
| [03-env-variables.spec.ts](./03-env-variables.spec.ts) | Variables de entorno | URLs, credenciales |
| [04-fixtures-personalizadas.spec.ts](./04-fixtures-personalizadas.spec.ts) | Fixtures custom | Estado compartido reutilizable |
| [test-data.json](./test-data.json) | Dataset de ejemplo | — |
| [reto.spec.ts](./reto.spec.ts) | Retos del alumno | — |

---

## 📋 Pasos explícitos para explicar en clase

1. **Pregunta al grupo:** "¿alguien ha ejecutado el mismo caso de prueba manual con 5 usuarios distintos? ¿cuánto tiempo les tomó?".
2. **Muestra `01-foreach-simple.spec.ts`:** un test que corre N veces con datos inline.
3. **Muestra el reporte:** cada caso aparece como un test separado, con el dato como parte del nombre.
4. **Muestra `02-data-driven-json.spec.ts`:** los mismos datos, pero en archivo JSON externo. Explica: "ahora QA puede agregar casos sin tocar el código".
5. **Muestra `03-env-variables.spec.ts`:** `BASE_URL=https://staging.app.com pnpm test` — muy útil para correr la misma suite en distintos ambientes.
6. **Muestra `04-fixtures-personalizadas.spec.ts`:** una fixture `authenticatedPage` que devuelve una página ya logueada. Explica cómo elimina el login repetitivo.
7. **Envía al reto.**

---

## Cheatsheet

```typescript
// forEach
[1, 2, 3].forEach(n => {
  test(`caso con n=${n}`, async ({ page }) => { /* ... */ });
});

// JSON
import testCases from './test-data.json';
for (const tc of testCases) {
  test(tc.name, async ({ page }) => { /* ... */ });
}

// env vars
const baseUrl = process.env.BASE_URL ?? 'https://default.com';

// fixture custom
const test = base.extend<{ authenticatedPage: Page }>({
  authenticatedPage: async ({ page }, use) => {
    await page.goto('/login');
    // ...login...
    await use(page);
  },
});
```

➡️ Empieza por [01-foreach-simple.spec.ts](./01-foreach-simple.spec.ts).
