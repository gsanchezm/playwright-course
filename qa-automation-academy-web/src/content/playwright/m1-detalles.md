# Detalles que parecen obvios pero no lo son

Antes de pasar a los comandos, estos son los detalles del spec que un ojo entrenado nota y un principiante pasa por alto. Cada uno sale del código real de `ejemplo.spec.ts`.

## `await page.goto("/")`

- **Qué es:** abre el navegador en la **ruta raíz** del sitio. La `/` se concatena con el `baseURL` del `playwright.config.ts` → `https://omnipizza-frontend.onrender.com/`.
- **Por qué así (y no la alternativa obvia):** poner solo `/` deja el host en **un único lugar** (el config). El día que el frontend cambie de URL (staging, otro dominio, otro puerto), tocas una línea en el config y **todos los specs siguen funcionando**.
- **Qué pasa si lo cambias:** si hardcodeas `page.goto("https://omnipizza-frontend.onrender.com/")` el test funciona igual hoy… pero esa URL queda regada por cada spec. Multiplica por 50 tests y un cambio de dominio se vuelve un *find & replace* frágil. Además ignora el `baseURL`, así que `--config` o un override por entorno dejan de tener efecto.

## `await page.getByTestId("market-MX").click()`

- **Qué es:** el `await` delante de **cada acción y cada aserción** del spec. Playwright es **asíncrono**: `.click()`, `.fill()` y `expect(...)` devuelven una *promesa*.
- **Por qué así (y no la alternativa obvia):** sin `await`, la promesa se dispara pero **nadie la espera**. El runner sigue a la siguiente línea antes de que el click ocurra, y el orden real de ejecución deja de coincidir con el orden que lees.
- **Qué pasa si lo cambias:** quitar el `await` produce el peor de los bugs de QA: un test que **pasa o falla de forma engañosa**. Una aserción sin `await` (`expect(page).toHaveURL(...)`) puede reportar verde sin haber comprobado nada, porque la promesa quedó pendiente y el test terminó antes. Es un falso positivo silencioso.

## `await page.getByTestId("login-button-desktop").click()`

- **Qué es:** el spec localiza el botón de login por su **test id** (`data-testid="login-button-desktop"`), no por su rol accesible (`getByRole("button", { name: "Sign In" })`).
- **Por qué así (y no la alternativa obvia):** `getByTestId` apunta a un **sticker que el dev puso a propósito** para testing — es estable aunque cambie el texto o el idioma del botón. `getByRole(..., { name })` localiza como un lector de pantalla y depende del **texto visible**; el `name` es lo que cambia todo: si el botón pasa de "Sign In" a "Iniciar sesión", el `getByRole` rompe y el `getByTestId` no.
- **Qué pasa si lo cambias:** migrar a `getByRole` te acerca a probar accesibilidad real (bueno), pero acoplas el test al copy de la UI. En M02 verás la jerarquía de locators completa; en M01 usamos `getByTestId` porque OmniPizza ya trae esos ids y queremos que el smoke sea inmune al texto.

## `await expect(pizzaCards.first()).toBeVisible({ timeout: 30_000 })`

- **Qué es:** la espera de que la primera card de pizza aparezca. Fíjate que **no hay ningún `sleep()` ni `waitForTimeout()`** en todo el spec — solo un `timeout` como opción de la aserción.
- **Por qué así (y no la alternativa obvia):** Playwright tiene **auto-waiting**: `toBeVisible()` reintenta en bucle hasta que la condición se cumple o se agota el timeout. Aquí subimos el timeout a 30s **por el cold start de Render**, no para "dar tiempo a que cargue" a ciegas.
- **Qué pasa si lo cambias:** si reemplazas esto por `await page.waitForTimeout(30000)` esperas **siempre** 30 segundos completos aunque la card aparezca en 2 — tests lentos. Y si pones un sleep corto (`waitForTimeout(2000)`) en un día de cold start, la card aún no existe y el test **falla intermitente** (flaky). El auto-waiting espera *lo justo*: sigue en cuanto la condición se cumple.

## `import "dotenv/config"`

- **Qué es:** un import por **side-effect** — sin llaves, no trae ningún símbolo a tu archivo. Solo **ejecuta** el módulo `dotenv/config`, que lee `.env` y vuelca sus valores en `process.env`. Vive al inicio de `playwright.config.ts`.
- **Por qué así (y no la alternativa obvia):** no necesitas una función ni una variable de `dotenv`; lo único que quieres es el *efecto* de poblar `process.env` **antes** de que el config lea `process.env.BASE_URL`. Por eso va arriba del todo y por eso no lleva `{ }`.
- **Qué pasa si lo quitas:** `process.env.BASE_URL` y `process.env.TEST_USER_USERNAME` quedan sin cargar… pero **el test no truena**: tanto el config (`process.env.BASE_URL ?? "https://..."`) como el spec (`process.env.TEST_USER_USERNAME ?? "standard_user"`) tienen un **fallback `??`** que apunta a los valores reales de OmniPizza. El resultado es la trampa más peligrosa: el test sigue verde **usando los defaults hardcodeados**, ocultándote que tu `.env` nunca se cargó. El día que un valor real difiera de su fallback, fallarás sin entender por qué.
