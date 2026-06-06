# Detalles no obvios

### `dependencies: ["setup"]`
- **Qué es:** una **precondición declarativa** a nivel de project. Le dices a Playwright "este project no arranca hasta que el project `setup` termine en verde".
- **Por qué así (y no la alternativa obvia):** no es un `import`, ni un `globalSetup`, ni una llamada en un `beforeAll`. No ejecutas el login tú mismo — **declaras** el orden y Playwright construye el grafo de ejecución. Esto lo hace visible en el reporte (setup aparece como un test) y reutilizable por rol.
- **Qué pasa si lo cambias:** si borras `dependencies`, los projects `ui-*` ya **no esperan** al setup. Pueden arrancar antes de que `.auth/user.json` exista (o con uno viejo) → tests que fallan con "sesión no encontrada" de forma intermitente, según quién gane la carrera.

### `storageState: STORAGE_STATE` (en cada project `ui-*`, NO en el `use:` raíz)
- **Qué es:** el `storageState` se asigna **por project** (`ui-chromium`, `ui-firefox`, `ui-webkit`), no en el bloque `use:` global de `defineConfig`.
- **Por qué así (y no la alternativa obvia):** la alternativa "obvia" es ponerlo una sola vez arriba en `use:` para no repetirlo. Pero eso autenticaría **TODO**: también los projects `api` y `anonymous`, que deben correr **sin** sesión.
- **Qué pasa si lo cambias:** si lo subes al `use:` raíz, los flujos negativos (login inválido, acceso anónimo) arrancan **ya logueados** y dejan de probar lo que dicen probar; y los tests de API heredan cookies de UI que no les corresponden. Los falsos verdes más peligrosos del módulo nacen aquí.

### `testIgnore: [/tests\/setup\/.*/, /tests\/api\/.*/, /modulo-05-api-layer\/.*/]`
- **Qué es:** lista de rutas que cada project `ui-*` **ignora**. La pieza clave para este punto es `/tests\/setup\/.*/`.
- **Por qué así (y no la alternativa obvia):** sin ese ignore, el `testMatch` global (`/tests\/.*\.(spec|setup)\.ts/`) haría que `auth.setup.ts` también cayera dentro de los projects `ui-*`. Como esos projects dependen de `setup`, el login terminaría ejecutándose **dos veces**: una en el project `setup` y otra dentro de cada `ui-*`. (Los otros dos patrones del array — `tests/api` y `modulo-05` — son para que la suite de API de M05 no se cuele en los projects de UI.)
- **Qué pasa si lo cambias:** si quitas `/tests\/setup\/.*/`, verás `auth.setup.ts` duplicado en el reporte y un POST de login extra por browser; con multi-browser eso es login ×3 innecesario y más lento.

### `auth.setup.ts` (extensión `.setup.ts`, no `.spec.ts`)
- **Qué es:** un test normal de Playwright, pero con extensión `.setup.ts`. El project `setup` lo matchea con su propio `testMatch: /tests\/setup\/.*\.setup\.ts/`.
- **Por qué así (y no la alternativa obvia):** la extensión es la convención que permite que **una sola** regla de `testMatch` lo capture sin atrapar tus `*.spec.ts`. El project `setup` usa una regex distinta a la global precisamente para aislar el archivo de setup del resto de la suite.
- **Qué pasa si lo cambias:** si lo renombras a `auth.spec.ts`, el project `setup` deja de matchearlo (su regex pide `.setup.ts`) → el badge nunca se genera y todos los `ui-*` arrancan sin sesión. Y al revés: cualquier `*.setup.ts` que dejes suelto en `tests/` lo recogerá el setup project aunque no quieras.

### `await request.post(`${API_URL}/api/auth/login`, { data: { username, password } })`
- **Qué es:** el login se hace con un **POST a la API** usando el fixture `request` (`APIRequestContext`), no llenando el formulario en la UI.
- **Por qué así (y no la alternativa obvia):** llenar el formulario en UI es lento (navegación + render + clicks) y frágil (depende del DOM, de animaciones, de selectores). Un solo POST es **rápido y determinista**: prueba el contrato de la API y devuelve el `access_token` directo.
- **Qué pasa si lo cambias:** si haces login por UI en el setup, recuperas toda la fragilidad que querías evitar — y la pagas **una vez por corrida del setup**, multiplicado si tienes varios roles. El UI login se prueba aparte (en su propio spec), no como precondición de toda la suite.

### `await context.storageState({ path: USER_FILE })`
- **Qué es:** serializa el estado del `BrowserContext` (creado con `browser.newContext()`) a `.auth/user.json` — el "badge" que luego heredan los projects `ui-*`.
- **Por qué así (y no la alternativa obvia):** `storageState` siempre guarda **cookies + localStorage** juntos, así que el badge es portable a cualquier mecanismo de sesión. Nota: en este flujo se usa `context.storageState(...)` desde un contexto nuevo del `browser`, no `page.context().storageState(...)` — el setup abre su propio contexto, siembra el token y lo persiste.
- **Qué pasa si lo cambias:** en **este** proyecto OmniPizza guarda la sesión en `localStorage` (`access_token`, `username`) y **no** usa cookies de sesión, así que el array `cookies` del JSON queda vacío y todo el peso del badge está en `origins[].localStorage`. Si OmniPizza migrara a cookies httpOnly, el mismo `storageState` seguiría funcionando sin tocar el setup — por eso no escribimos el JSON a mano.
