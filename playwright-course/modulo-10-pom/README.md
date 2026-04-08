# Módulo 10: Page Object Model (POM)

> **Objetivo:** Estructurar tu framework usando el **Page Object Model** para separar el "cómo interactúo con la página" del "qué valido en el test".

> **Referencia oficial:** [pom](https://playwright.dev/docs/pom)

---

## 🎯 Analogía principal

> **Un Page Object es como un "manual de instrucciones" de una página.**
>
> En pruebas manuales, antes de probar el login tenías una hoja que decía:
> - El campo de usuario está en el recuadro arriba a la izquierda.
> - El campo de contraseña está debajo.
> - El botón azul dice "Iniciar sesión".
>
> Un Page Object encapsula ese conocimiento en **código**: todos los selectores y acciones de la página de login viven en una clase `LoginPage`. Si mañana el dev cambia el selector del botón, tú cambias **una sola línea** en `LoginPage.ts` y todos tus 30 tests de login siguen funcionando.

**Sin POM:**
```typescript
test('login 1', async ({ page }) => {
  await page.goto('/login');
  await page.fill('#username', 'admin');
  await page.fill('#password', 'Test1234!');
  await page.click('#login-btn');
});

test('login 2', async ({ page }) => {
  await page.goto('/login');
  await page.fill('#username', 'viewer'); // 🔁 repetido
  await page.fill('#password', 'Test1234!'); // 🔁 repetido
  await page.click('#login-btn'); // 🔁 repetido
});
```

Si cambia `#login-btn` → tienes que actualizar 30 tests.

**Con POM:**
```typescript
test('login 1', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('admin', 'Test1234!');
});
```

Si cambia `#login-btn` → cambias una línea en `LoginPage.ts`.

---

## Estructura del módulo

```
modulo-10-pom/
├── README.md                  # este archivo
├── pages/
│   ├── BasePage.ts            # clase base con métodos comunes
│   └── TodoMvcPage.ts         # page object de TodoMVC
├── tests/
│   └── todomvc.pom.spec.ts    # tests usando el POM
└── reto.md
```

**Analogía de herencia:**
- `BasePage` es la "metodología de pruebas de la empresa": todos los page objects heredan sus métodos comunes (navegar, esperar carga, screenshot).
- `TodoMvcPage extends BasePage` es el "manual específico de la página de TODO": hereda lo general y agrega lo específico.

---

## Reglas del POM

1. **Un Page Object por página lógica** (no por archivo HTML). Ejemplos: `LoginPage`, `DashboardPage`, `CheckoutPage`.
2. **Los selectores son `private`** — nadie fuera del Page Object debe saber que `#login-btn` existe.
3. **Los métodos públicos representan ACCIONES del usuario:** `login(user, pass)`, `search(term)`, `addToCart(product)`. **NO** devuelven locators — devuelven `void` o datos.
4. **Las assertions van en los tests, no en el POM.** El POM hace acciones; el test valida. (Hay debate sobre esto, pero es la regla más común y la que recomienda Playwright.)
5. **Los tests NO usan `page.locator(...)` directamente** — todo pasa por el POM.

---

## 📋 Pasos explícitos para explicar en clase

1. **Empieza con el ejemplo malo** (sin POM) y muestra cómo se repite código. Pregunta: "¿qué pasa si cambian el selector?".
2. **Muestra `BasePage.ts`** — explica la herencia: todos los page objects reciben `page` en el constructor y tienen métodos comunes como `waitForLoad`.
3. **Muestra `TodoMvcPage.ts`** — los selectores son `private`, los métodos son públicos y representan acciones humanas.
4. **Muestra `todomvc.pom.spec.ts`** — los tests son **súper legibles**: `todoPage.addTodo('Comprar leche')`.
5. **Simula un cambio:** edita `TodoMvcPage.ts` para cambiar un selector. Muestra que los 5 tests siguen funcionando sin tocarlos.
6. **Envía al reto.**

➡️ Lee el código de [pages/BasePage.ts](./pages/BasePage.ts) y [pages/TodoMvcPage.ts](./pages/TodoMvcPage.ts).
