# 🧠 Síntesis — Módulo 6: XPath Ejes

> **Módulo 6 · XPath Ejes**

> **Analogía QA:** cerramos el módulo igual que cierras un test run: con un resumen de lo verificado. Ya no navegas el DOM solo "hacia abajo": ahora te mueves en **todas** las direcciones del árbol y dominas el patrón que hace tus localizadores resistentes — anclar en lo estable y navegar por eje.

---

## Lo que cubriste

| Mini-clase | Idea clave |
| --- | --- |
| 6.1 El modelo de ejes | Un paso es `eje::nodo[pred]`; el eje por defecto es `child::`; los nombres de eje son case-sensitive; `..` = `parent::`. |
| 6.2 parent / ancestor / ancestor-or-self | Subir un nivel vs subir a cualquier contenedor; `ancestor::X` desde el propio `X` da 0, `ancestor-or-self::` lo incluye. |
| 6.3 following-sibling / preceding-sibling | Moverse a los lados **dentro del mismo padre**; del mensaje de error al botón "Sign In". |
| 6.4 following / preceding / descendant | Recorrer el documento en orden y bajar a cualquier profundidad; `following::` ≠ `following-sibling::`. |
| 6.5 Ancla-y-navega | El patrón pro: ancla por texto humano estable + salto por eje al elemento accionable. |
| 🚩 Reto | Del nombre "Cuatro Quesos" a su `<article>` por `ancestor::`. |

---

## Tabla de referencia rápida

| Eje | Dirección | Recuerda |
| --- | --- | --- |
| `child::` | Hijos directos | Es el eje por defecto (`//a/b` = `//a/child::b`) |
| `parent::` / `..` | Sube un nivel | `..` es el atajo |
| `ancestor::` | Cualquier contenedor arriba | No incluye al nodo de partida |
| `ancestor-or-self::` | Igual + el propio nodo | Útil cuando el nodo ya podría ser el contenedor |
| `following-sibling::` | Hermanos posteriores | Mismo padre |
| `preceding-sibling::` | Hermanos anteriores | Mismo padre |
| `following::` | Todo lo posterior en el documento | Cruza contenedores |
| `preceding::` | Todo lo anterior en el documento | Cruza contenedores |
| `descendant::` | Todo lo que cuelga del nodo | No se incluye a sí mismo |

---

## 🧠 Síntesis e insights clave — Módulo 6

- Un eje es una **dirección** en el árbol: el mismo nodo de contexto da resultados distintos según el eje que elijas.
- **Ancla-y-navega** (texto estable + salto por eje) produce localizadores legibles y resistentes; las rutas posicionales ("la 4a tarjeta") son frágiles.
- `following-sibling::` se queda dentro del padre; `following::` cruza contenedores y recorre el documento entero hacia adelante.
- Para "el primero hacia adelante" usa `axis::nodo[1]` (idéntico en jsdom y navegador); reserva `(//nodo)[n]` para el navegador real, donde sí selecciona el n-ésimo **global**.

---

> 🌉 **Puente a Playwright / otros lenguajes**
> - **Playwright:** `getByRole(...).locator("xpath=ancestor::li")` — ancla accesible + salto por eje; el XPath corre en el navegador real. XPath **no** atraviesa el shadow DOM.
> - **Selenium:** `findElement(By.xpath("//h3[normalize-space()='Cuatro Quesos']/ancestor::article"))` — mismos ejes, misma semántica de XPath 1.0.

En todos los casos la idea es la misma: encuentras el nodo estable y **navegas las relaciones** del árbol (arriba, a los lados, en orden de documento) hasta el elemento que realmente necesitas accionar.

---

⬅️ Anterior: [🚩 Reto M6](/docs/css-xpath/m6-reto)
