# Detalles no obvios

### `{ name: "api", use: { baseURL: ... }, testMatch: [...] }` (sin `storageState`, sin `dependencies`)
- **Qué es:** el project `api` se define sin `storageState: STORAGE_STATE` y sin `dependencies: ["setup"]`, a diferencia de los 3 projects `ui-*`.
- **Por qué así (y no la alternativa obvia):** los tests de API se autentican por su cuenta — `AuthService.create()` hace login y obtiene un `access_token` fresco que `PizzaService`/`OrderService` inyectan como `Authorization: Bearer`. No necesitan la sesión de navegador que el setup deja en `.auth/user.json`.
- **Qué pasa si lo cambias:** si le agregas `storageState`, Playwright intentaría cargar cookies de UI en un `APIRequestContext` que no las usa (ruido, y dependencia falsa de un artefacto de otra capa). Si le agregas `dependencies: ["setup"]`, cada corrida de API esperaría al login de UI por navegador — más lento y acoplado a algo que la API no consume. El aislamiento es intencional.

### `request` / `APIRequestContext` (no `page.request`)
- **Qué es:** los servicios importan `request` de `@playwright/test` y crean su contexto con `await request.newContext({ baseURL })`. El tipo del contexto es `APIRequestContext`.
- **Por qué así (y no la alternativa obvia):** `request.newContext()` levanta un cliente HTTP **sin navegador**. La alternativa `page.request` existe, pero exige una `page` (y por tanto un browser arrancado), que aquí no se necesita para nada.
- **Qué pasa si lo cambias:** si usaras `page.request`, tendrías que pedir el fixture `page` y pagar el costo de abrir un navegador por test. Por eso los tests del project `api` corren en menos de 1s y "no abren navegador" — son llamadas HTTP puras.

### `export abstract class BaseService`
- **Qué es:** la clase base es `abstract` y declara `protected abstract basePath(): string` más un `protected constructor(...)`.
- **Por qué así (y no la alternativa obvia):** `abstract` impide instanciar la base directamente y **obliga** a cada hijo (`AuthService`, `OrderService`, `PizzaService`) a implementar `basePath()`. Con un solo servicio no valdría la pena; con 3 que comparten `api`, `baseURL`, `url()` y `dispose()`, evita duplicación y garantiza el contrato.
- **Qué pasa si lo cambias:** escribir `new BaseService(...)` no compila — TypeScript responde **"Cannot create an instance of an abstract class"**. Y si quitas `abstract` de `basePath()`, el compilador deja de exigir que cada hijo lo defina, y `url()` podría construir rutas contra un `basePath` inexistente.

### `if (!res.ok()) throw new Error(... ${res.status()} ...)`
- **Qué es:** cada método (`login`, `list`, `createOrder`, `listMine`) chequea `res.ok()` y, si falla, lanza incluyendo `res.status()` y el body.
- **Por qué así (y no la alternativa obvia):** `res.ok()` es `true` para cualquier 2xx; chequearlo explícito convierte un 4xx/5xx en un error claro **antes** de intentar `res.json()`. La alternativa "asumir 200 y parsear directo" produciría un crash opaco al desserializar un body de error.
- **Qué pasa si lo cambias:** sin el guard, un login con password inválido devolvería un body de error y `res.json()` lo parsearía como si fuera el token — el test fallaría más tarde y con un mensaje confuso. Justamente `auth.spec.ts` valida `rejects.toThrow(/Login failed/)` apoyado en este patrón.

### `this.api.post(this.url("/login"), { data: { ... } })`
- **Qué es:** los POST mandan el body con la opción `data` (objeto JS), no `form`.
- **Por qué así (y no la alternativa obvia):** `data` con un objeto serializa a **JSON** y fija `Content-Type: application/json`, que es lo que espera el backend de OmniPizza. `form` enviaría `application/x-www-form-urlencoded`, otro formato de body.
- **Qué pasa si lo cambias:** si cambias `data` por `form`, el backend recibe campos urlencoded en vez de JSON; lo más probable es un 4xx (body no parseable como JSON) y, gracias al guard de `res.ok()`, un `Error` con el status real.
