# 11.3 — Prompts efectivos para QA Automation

## La regla de oro de los prompts

> **Un buen prompt = contexto + objetivo + restricciones + formato.**

❌ Mal prompt:
> "Hazme un test de login"

✅ Buen prompt:
> "Eres un automatizador QA experto en Playwright + TypeScript. Mi app tiene una página de login en `/login` con campos email y password (etiquetas 'Email address' y 'Password') y un botón 'Sign in'. Genera UN test de Playwright que verifique el happy path. Usa Page Object Model. Los selectores deben ser `getByLabel` y `getByRole`. NO uses CSS selectors. Devuélveme el código en TypeScript."

---

## 5 plantillas de prompts probadas

### 1. Generar un test desde una historia de usuario

```
Eres un QA automation engineer experto en Playwright + TypeScript.

Historia de usuario:
"Como cliente registrado, quiero agregar productos al carrito desde
la página de catálogo, para poder comprarlos después."

Genera 4 tests de Playwright:
1. Happy path: agregar 1 producto al carrito.
2. Agregar el mismo producto 2 veces (cantidad debe ser 2).
3. Cliente sin login: debe redirigir a /login.
4. Producto fuera de stock: el botón debe estar deshabilitado.

Restricciones:
- Usa getByRole y getByLabel (NO CSS).
- Cada test debe ser independiente (puedes asumir un beforeEach con login).
- Incluye al menos 1 assertion significativa por test.
- Devuelve TypeScript listo para pegar.
```

### 2. Refactorizar un test viejo a POM

```
Aquí tienes un test de Playwright sin Page Object Model:

[pega el código del test]

Refactorízalo creando un Page Object llamado [NombrePage] que encapsule
los selectores y las acciones. Reglas:
- Selectores privados (getByRole/getByLabel preferidos).
- Métodos públicos con nombres de acciones humanas (login, addProduct, ...).
- El test no debe contener ningún selector — todo pasa por el POM.
- Las assertions se mantienen en el test.

Devuelve los DOS archivos: [NombrePage].ts y [test].spec.ts.
```

### 3. Diseñar casos de prueba para una feature

```
Soy QA y necesito casos de prueba E2E para esta feature:

[descripción breve de la feature]

Genera una lista priorizada de 10 casos de prueba en formato:
| # | Prioridad | Tipo (positivo/negativo) | Caso | Resultado esperado |

Incluye:
- 4 casos positivos
- 4 casos negativos (validaciones, errores)
- 2 casos de borde (límites, datos extremos)

NO escribas código todavía. Solo el plan de pruebas.
```

### 4. Debugging de un test fallido

```
Mi test de Playwright pasa local pero falla en CI con este error:

[pega el error completo]

Aquí está el código del test:
[pega el test]

Aquí está el playwright.config.ts:
[pega la config]

¿Cuáles son las 5 causas más probables, ordenadas por probabilidad?
Para cada una, sugiere cómo verificarla y cómo arreglarla.
```

### 5. Convertir un Postman collection a Playwright API tests

```
Aquí tienes un export de Postman (JSON):

[pega el JSON o describe los endpoints]

Conviértelo a tests de Playwright usando la fixture "request".
Cada request de Postman = un test independiente.
Incluye assertions de status y validaciones del body cuando sea relevante.
```

---

## Anti-patrones de prompting

### ❌ Pedir sin contexto
> "Mejora este código"

### ❌ Pedir todo de una vez
> "Genera un framework completo de Playwright con 100 tests, POM, CI, y reportes en Slack"

(El LLM va a generar algo súper genérico. Mejor: divídelo en 5-10 prompts pequeños.)

### ❌ No revisar la salida
Aceptar el código sin leerlo. **NUNCA**. Siempre revisas, ejecutas y validas.

### ❌ Pasar datos sensibles
Tokens, contraseñas, PII de clientes. Usa datos sintéticos: `test@example.com`, `Test1234!`, `John Doe`.

---

## Tip pro: el system prompt persistente

En Claude/ChatGPT puedes configurar un "system prompt" que se aplica a TODA tu conversación. Pon algo como:

> "Eres un QA Automation Engineer senior con 8 años de experiencia en Playwright + TypeScript. Cuando generes código:
> - Usa siempre `getByRole`, `getByLabel`, `getByTestId` (NUNCA CSS o XPath).
> - Sigue el patrón Page Object Model.
> - Incluye comentarios en español para los conceptos no obvios.
> - Asume `strict: true` en TypeScript (no uses `any`).
> - No expliques cosas básicas a menos que te lo pida — soy intermedio."

Ahora cada respuesta sigue esas reglas sin que las repitas.
