# Detalles no obvios

Cada uno de estos aparece tal cual en `pages/BasePage.ts`, `pages/LoginPage.ts` o `pages/CatalogPage.ts`. Léelos con el código abierto al lado.

## `constructor(protected readonly page: Page) {}`

- **Qué es:** una *parameter property* de TypeScript. Esa única línea **declara** la propiedad `page`, la marca `protected readonly` y la **asigna** (`this.page = page`) automáticamente. No hay cuerpo en el constructor. El `page` lo provee el fixture de Playwright cada vez que el test hace `new LoginPage(page)`.
- **Por qué así (y no la alternativa obvia):** la alternativa obvia es declarar el campo arriba y asignarlo a mano: `private page: Page; constructor(page: Page) { this.page = page }`. Eso son tres líneas y dos lugares donde olvidar el `readonly`. La parameter property lo hace en una y deja el contrato explícito.
- **Qué pasa si lo cambias:** si quitas `protected`, el campo se vuelve `public` por defecto y los tests podrían tocar `loginPage.page` directamente — rompes la encapsulación. Si quitas `readonly`, alguien puede reasignar `this.page` a otra pestaña a mitad del TC (la clase de bug "¿por qué el assert corrió en la pestaña equivocada?").

## `readonly path = "/"`

- **Qué es:** una propiedad de instancia de solo lectura en `LoginPage` (`"/"`) y `CatalogPage` (`"/catalog"`). El método `goto()` la usa: `await this.page.goto(this.path)`.
- **Por qué así (y no la alternativa obvia):** la alternativa es hardcodear la ruta dentro de cada método (`goto("/")`). Con `readonly path` la ruta vive en **un solo lugar** por Page y queda visible como "esta clase mapea esta pantalla". `readonly` comunica que la pantalla de una Page no cambia en tiempo de ejecución.
- **Qué pasa si lo cambias:** si quitas `readonly`, el compilador deja de protegerte ante una reasignación accidental (`this.path = ...`) que mandaría el `goto` a una pantalla equivocada. Si la inlineas en cada método, repites el string y pierdes el único punto de cambio.

## `private get usernameInput(): Locator`

- **Qué es:** los locators se exponen como **getters `private`** (propiedades calculadas), no como variables inline dentro de cada método. Cada acceso reevalúa `this.tid("username")`.
- **Por qué así (y no la alternativa obvia):** la alternativa obvia es escribir `this.page.getByTestId("username-desktop")` inline en cada método que lo use. El getter centraliza el locator: si cambia el testid, tocas **una línea**. Y al ser `get` (no campo asignado en el constructor) el `Locator` se resuelve perezosamente — importa porque `tid()` consulta el `viewportSize()` en el momento del uso, no en el de la construcción del Page.
- **Qué pasa si lo cambias:** si lo declaras como campo en el constructor (`this.usernameInput = this.tid(...)`) congelas el viewport al instante de `new LoginPage(page)`. Si lo haces `public`, el test puede hacer `loginPage.usernameInput.fill(...)` y saltarse la acción de negocio — exactamente lo que el POM busca impedir.

## `protected tid(base: string): Locator`

- **Qué es:** helper de `BasePage` que añade el sufijo de viewport (`-desktop` / `-responsive`) al testid. Es `protected`, junto con `waitForUrl`.
- **Por qué así (y no la alternativa obvia):** `protected` lo hace visible para las clases hijas (`LoginPage`, `CatalogPage`...) pero **no** para los tests. La alternativa `public` lo dejaría disponible en el spec (`loginPage.tid("x")`), reabriendo la puerta a locators inline desde el test. La alternativa `private` lo escondería incluso de las hijas y `LoginPage` no podría usarlo. `protected` es el punto medio exacto: herramienta del equipo QA interno, invisible para el cliente (test).
- **Qué pasa si lo cambias:** con `private`, las clases que `extends BasePage` dejan de compilar (no ven el helper heredado). Con `public`, los specs vuelven a poder construir locators a mano y se erosiona la encapsulación que da sentido al POM.

## `await this.page.goto(this.path)`

- **Qué es:** navegación dentro del método del Page. El `this.` apunta a la instancia del Page; `this.page` es la pestaña inyectada por el constructor; `this.path` es la ruta de esa pantalla.
- **Por qué así (y no la alternativa obvia):** el método es `async` y se hace `await` porque `goto` devuelve una `Promise` — sin `await`, el test seguiría a la siguiente acción antes de que la página cargara (flaky garantizado). Se usa `this.page` (no un `page` global ni un parámetro) porque cada Page se amarra a la pestaña que recibió: así un solo test puede instanciar `LoginPage`, `CatalogPage` y `CheckoutPage` compartiendo la **misma** pestaña.
- **Qué pasa si lo cambias:** si quitas el `await`, la navegación queda "en el aire" y los locators siguientes corren sobre la página vieja. Si quitas `async`, ni siquiera puedes usar `await` adentro. Si reemplazas `this.page` por una referencia externa, rompes el aislamiento por instancia y vuelves al estilo script de M01.
