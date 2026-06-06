# Detalles no obvios

Cosas del config y del workflow de M06 que se leen "de pasada" pero esconden una decisión de diseño. Si las cambias por la alternativa "obvia", el pipeline se vuelve frágil o pierdes la capacidad de diagnosticar.

## `retries: process.env.CI ? 2 : 0`

- **Qué es:** dos reintentos automáticos cuando un test falla en CI; **cero** reintentos cuando corres en local.
- **Por qué así (y no la alternativa obvia):** en CI los runners comparten CPU, la red es más lenta y Render hace cold start — un fallo aislado suele ser ruido, así que 2 reintentos evitan PRs rojos por flakes. En **local** lo quieres al revés: si un test falla, quieres **verlo fallar**, no que un reintento lo esconda y te haga creer que todo está verde.
- **Qué pasa si lo cambias:** si pones `retries > 0` en local, estás ocultando flakes en el peor momento — el desarrollo. Un test inestable pasará "por casualidad" en el segundo intento y nunca lo arreglarás hasta que reviente en CI o en producción.

## `process.env.CI`

- **Qué es:** la variable de entorno que el config usa para decidir si está corriendo en pipeline o en tu máquina.
- **Por qué así (y no la alternativa obvia):** **no la defines tú.** GitHub Actions (y casi todos los CI) la inyecta automáticamente como `CI=true` en cada job. Eso te da un único `playwright.config.ts` que se comporta distinto en los dos mundos, sin scripts duplicados ni flags manuales.
- **Qué pasa si lo cambias:** si intentas setearla a mano en local, harás que tu máquina se comporte como CI (2 retries, `forbidOnly`, reporters extra) y perderás justo las ventajas de correr en local. Para *simular* CI a propósito, sí la seteas temporalmente (ver comandos abajo).

## `forbidOnly: !!process.env.CI`

- **Qué es:** en CI, hace **fallar el build** si quedó un `test.only(...)` o `describe.only(...)` olvidado en el código.
- **Por qué así (y no la alternativa obvia):** un `.only` olvidado es silencioso y catastrófico: hace que Playwright corra **sólo ese test** e ignore todos los demás. El suite sale verde con 1 test ejecutado y 200 saltados — y nadie lo nota. `forbidOnly` convierte ese descuido en un error ruidoso que bloquea el merge.
- **Qué pasa si lo cambias:** si lo pones en `false` (o no lo activas en CI), un `.only` puede pasar la revisión y dejar tu pipeline "verde" mientras en realidad no está testeando casi nada.

## `fullyParallel: true`

- **Qué es:** paraleliza a nivel de **test individual**, no sólo a nivel de archivo; `workers` limita cuántos corren a la vez.
- **Por qué así (y no la alternativa obvia):** por defecto Playwright paraleliza entre archivos pero corre los tests *dentro* de un archivo en serie. Con `fullyParallel: true` cada test es candidato a su propio worker, exprimiendo los runners. `workers: process.env.CI ? 2 : undefined` topa el paralelismo a 2 en CI (los runners de GitHub tienen 2 CPUs) y deja que en local Playwright elija según tus cores.
- **Qué pasa si lo cambias:** sin `fullyParallel`, un archivo con 30 tests se vuelve un cuello de botella secuencial. Si subes `workers` por encima de los CPUs reales del runner, los tests pelean por recursos, se vuelven lentos y aparecen flakes por timeouts.

## `trace: "retain-on-failure"`

- **Qué es:** graba la traza (la "caja negra") **sólo cuando un test falla**, no en cada corrida.
- **Por qué así (y no la alternativa obvia):** `trace: "on"` graba la traza de **todos** los tests, pasen o fallen. Eso es lento y genera artefactos pesados que casi nunca vas a abrir. `retain-on-failure` te da exactamente la traza que necesitas — la del test roto — sin cargar el pipeline con cientos de zips inútiles.
- **Qué pasa si lo cambias:** con `"on"` cada PR sube gigabytes de trazas y los jobs tardan más; con `"off"` te quedas ciego cuando algo falla en CI y no puedes reproducir el bug.

## `video: "retain-on-failure"` / `screenshot: "only-on-failure"`

- **Qué es:** mismo principio que el trace — video y screenshot se guardan **únicamente cuando el test falla**.
- **Por qué así (y no la alternativa obvia):** capturar video y screenshots de cada test verde es desperdicio puro: nadie revisa el video de un test que pasó. Limitarlos al fallo te da el material de diagnóstico justo cuando lo necesitas, sin inflar los artefactos.
- **Qué pasa si lo cambias:** `video: "on"` multiplica el tamaño de `test-results/` y el tiempo de cada job; desactivarlo del todo te deja sin el clip que muchas veces explica el fallo más rápido que la propia traza.
