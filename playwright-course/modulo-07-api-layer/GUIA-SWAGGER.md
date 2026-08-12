# Guía Swagger — OmniPizza backend (M07)

> **Qué es este archivo:** el recorrido **con respuestas reales**, capturadas en vivo el
> 2026-08-08 contra `https://omnipizza-backend.onrender.com`. El README del módulo ya
> trae un walkthrough resumido (sección [🔎 Cómo probar los endpoints en
> Swagger](./README.md#-cómo-probar-los-endpoints-en-swagger-sin-código)) — este
> documento **no lo reemplaza, lo complementa**: aquí ves el JSON exacto que devuelve
> cada endpoint, incluyendo los 3 errores que se confunden fácil (403 / 401 / 400) y
> el motivo exacto del 403 que dispara `GET /api/pizzas` cuando el header
> `Authorization` no llega.
>
> Si algún dato de aquí (un `order_id`, un token) no coincide con lo que ves en tu
> propia corrida: es esperado. Los tokens rotan por login y cada checkout genera un
> `order_id` nuevo — lo que **no** debería cambiar es la **forma** (los nombres de
> campo) de cada respuesta.

---

## 0 — Antes de empezar

- **Cold start de Render:** la primera llamada del día puede tardar 30-40s mientras el
  backend "despierta". Si la primera petición se cuelga o da timeout, reintenta — no es
  un endpoint roto.
- **Usuario de prueba:** `standard_user` / `pizza123` (de `data/users.json` — ver ahí
  el resto de usuarios: `locked_out_user`, `problem_user`, etc.)
- Abre **https://omnipizza-backend.onrender.com/api/docs**.

---

## 1 — Tabla de endpoints (la que usa M07)

| Endpoint | Método | ¿Requiere auth? | Headers | Lo envuelve en código |
|---|---|---|---|---|
| `/api/auth/login` | POST | No | — | `AuthService.login()` |
| `/api/pizzas` | GET | **Sí** (Bearer) | `X-Country-Code` (**requerido**: MX/US/CH/JP/SA), `X-Language` (opcional, default `en`) | `PizzaService.list()` |
| `/api/checkout` | POST | **Sí** (Bearer) | — (el mercado va en el **body**, campo `country_code`) | `OrderService.createOrder()` |
| `/api/orders` | GET | **Sí** (Bearer) | — | `OrderService.listMine()` |
| `/api/orders/{order_id}` | GET | **Sí** (Bearer) | — | (detalle — sin método propio todavía) |

> ⚠️ **Ojo con el header que trae cada uno.** `GET /api/pizzas` filtra el mercado por
> el **header** `X-Country-Code`. `POST /api/checkout` en cambio recibe el mercado en
> el **body** (`country_code`) — no hay `X-Country-Code` en esa llamada. Son mecanismos
> distintos para el mismo dato; confundirlos es la causa más común de un 400 en
> checkout que "no debería fallar".

---

## 2 — Login (`POST /api/auth/login`)

**En Swagger:** expande `POST /api/auth/login` → **Try it out** → pega el body → **Execute**.

Request body:
```json
{ "username": "standard_user", "password": "pizza123" }
```

Respuesta real (200):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzdGFuZGFyZF91c2VyIi...(truncado)",
  "token_type": "bearer",
  "username": "standard_user",
  "behavior": "standard"
}
```

Coincide con `LoginResponse` en `types/omnipizza.d.ts` (`behavior` es un campo extra que
el tipo no declara — no pasa nada, TypeScript no se queja de campos de más al hacer
`as LoginResponse`, solo de los que **faltan**).

> 🔒 **Nota sobre el token:** es un JWT real, pero de una app de práctica con
> credenciales públicas (`pizza123` está en el propio repo) — no hay nada sensible
> que proteger aquí. Aun así, arriba lo dejamos truncado a propósito: un token
> completo pegado en un doc se ve "usable" y no lo es — expira (`exp` en el payload)
> y además cada login genera uno nuevo.

**Copia el `access_token` completo** — lo necesitas para el siguiente paso.

---

## 3 — Autoriza (dónde va el Bearer token en Swagger)

Esta es la parte con la que te trabaste: Swagger **no** te deja pegar el token en cada
endpoint por separado. Hay **un solo lugar**, arriba a la derecha:

1. Botón **Authorize** (candado verde, esquina superior derecha de la página — **no**
   dentro de ningún endpoint).
2. Se abre un modal **"Available authorizations"** con un solo esquema:
   **`HTTPBearer (http, Bearer)`** y un campo **Value**.
3. Pega **solo el token**, sin la palabra `Bearer` delante.
4. Clic en **Authorize** → clic en **Close**.

Confirmado en vivo: tras esto, el botón "Execute" de **cualquier** endpoint protegido
agrega el header solo. Lo puedes ver tú mismo — cada respuesta en Swagger trae una
sección **Curl** con la llamada real que se mandó; después de autorizar se ve así:

```
curl -X 'GET' \
  'https://omnipizza-backend.onrender.com/api/pizzas' \
  -H 'accept: application/json' \
  -H 'X-Language: en' \
  -H 'x-country-code: MX' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIs...'
```

Esa línea `-H 'Authorization: Bearer ...'` es lo que faltaba en tu llamada a `GET
/api/pizzas` — ver la sección 5 de abajo para el porqué exacto de tu 403.

> ⚠️ **Pega SOLO el token, sin `Bearer `.** El esquema `HTTPBearer` de Swagger ya
> antepone `Bearer ` por ti. Pegar `Bearer eyJ...` duplica el prefijo
> (`Authorization: Bearer Bearer eyJ...`) y el backend responde **401** (ver 5.2).

---

## 4 — `GET /api/pizzas` — catálogo por mercado

**En Swagger:** expande `GET /api/pizzas` → **Try it out** → header `x-country-code` =
`MX` → **Execute**.

Respuesta real (200) — catálogo completo son 8 pizzas, acá los 2 primeros ítems:
```json
{
  "pizzas": [
    {
      "id": "p01",
      "name": "Margherita",
      "description": "Tomato, mozzarella, basil",
      "price": 227.97,
      "base_price": 12.99,
      "currency": "MXN",
      "currency_symbol": "$",
      "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Margherita_pizza.jpg/500px-Margherita_pizza.jpg",
      "category": "popular"
    },
    {
      "id": "p02",
      "name": "Pepperoni",
      "description": "Pepperoni, mozzarella, tomato sauce",
      "price": 263.07,
      "base_price": 14.99,
      "currency": "MXN",
      "currency_symbol": "$",
      "category": "meat"
    }
  ]
}
```

Cambia `x-country-code` a `SA` y vuelve a **Execute** — mismos `id` (`p01`, `p02`, ...),
pero `price`/`currency`/`currency_symbol` cambian (el `base_price` en USD es el mismo,
el backend lo convierte):
```json
{ "id": "p01", "name": "Margherita", "price": 48.71, "base_price": 12.99, "currency": "SAR", "currency_symbol": "ر.س" }
```

> 💡 **Los `id` de pizza son los MISMOS en los 5 mercados** (`p01`..`p08`) — lo que
> cambia es `price`/`currency`. Puedes pedir el catálogo de un mercado y usar esos
> mismos `id` para un checkout en otro mercado (aunque no tiene sentido de negocio,
> el backend no lo valida).

---

## 5 — Por qué `GET /api/pizzas` te daba 403 (troubleshooting con los 3 códigos reales)

Reproducido en vivo, mismo `x-country-code: MX` en los 3 casos, solo cambia el header
`Authorization`:

### 5.1 — Sin header `Authorization` en absoluto → **403**
```json
{ "error": "Not authenticated", "status_code": 403, "timestamp": "2026-08-08T11:07:04.568102" }
```
**Esta es la causa de tu 403.** Este backend usa `HTTPBearer` (FastAPI/Starlette): si el
header `Authorization` **no llega**, responde **403 "Not authenticated"** — no 401. Es
contraintuitivo (uno esperaría 401 para "no autenticado"), pero así está implementado.
En Swagger esto pasa cuando **no hiciste el paso 3** (Authorize) antes de darle
Execute al endpoint protegido — el `x-country-code` puede estar perfecto y aun así
truena, porque falta el Bearer.

### 5.2 — Header presente pero con el prefijo `Bearer` duplicado → **401**
```json
{ "error": "Could not validate credentials", "status_code": 401, "timestamp": "2026-08-08T11:07:04.710131" }
```
Este es el error del aviso de la sección 3: pegar `Bearer eyJ...` en el campo Value de
Swagger (que ya antepone `Bearer `) produce `Authorization: Bearer Bearer eyJ...`, un
token inválido → 401. **401 = el token llegó pero está mal; 403 = el token no
llegó.** Esa distinción es la respuesta corta a tu pregunta original.

### 5.3 — Bearer correcto, pero SIN `X-Country-Code` → **400** (no 403, no 401)
```json
{ "error": "X-Country-Code header is required. Valid values: MX, US, CH, JP, SA", "status_code": 400, "timestamp": "2026-08-08T11:07:04.845289" }
```
Un tercer código para un tercer problema distinto — confirma que la auth y el mercado
se validan por separado, en ese orden (primero Bearer, luego `X-Country-Code`).

---

## 6 — `POST /api/checkout` — crear una orden

**En Swagger:** expande `POST /api/checkout` → **Try it out** → body → **Execute**.
Recuerda: el mercado va en el **body** (`country_code`), no en un header.

### 6.1 — MX (campo de dirección: `colonia`) — éxito

Request:
```json
{
  "country_code": "MX",
  "items": [{ "pizza_id": "p01", "quantity": 2 }],
  "name": "QA Tester",
  "address": "Av. Siempre Viva 742",
  "phone": "5512345678",
  "colonia": "Centro",
  "propina": 10
}
```

Respuesta real (200):
```json
{
  "order_id": "ORDER-F02FB11F",
  "subtotal": 455.94,
  "delivery_fee": 35.1,
  "tax_rate": 0.16,
  "tip_percentage": 10.0,
  "tax": 72.95,
  "tip": 45.59,
  "total": 609.58,
  "currency": "MXN",
  "currency_symbol": "$",
  "items": [{ "pizza_id": "p01", "quantity": 2, "size": "small", "toppings": [] }],
  "timestamp": "2026-08-08T11:07:35.090151"
}
```

> ⚠️ **Esta respuesta NO es lo que `types/omnipizza.d.ts` declaraba antes de esta
> sesión.** El tipo `Order` original tenía `id`/`status`/`createdAt`/`total`/`currency`
> — el backend real usa `order_id`/`timestamp`, desglosa el total en
> `subtotal`/`delivery_fee`/`tax`/`tip`, y **no** manda `status` en esta respuesta ni
> en el detalle (sección 7.2). El tipo ya se corrigió para reflejar esto — ver la
> sección "Qué se corrigió" al final.

### 6.2 — SA (campo de dirección: `district`) — éxito

Request:
```json
{
  "country_code": "SA",
  "items": [{ "pizza_id": "p01", "quantity": 1 }],
  "name": "QA Tester",
  "address": "King Fahd Road 4521",
  "phone": "+966551234567",
  "district": "Al-Olaya"
}
```

Respuesta real (200):
```json
{
  "order_id": "ORDER-C3808BCA",
  "subtotal": 48.71,
  "delivery_fee": 7.5,
  "tax_rate": 0.15,
  "tip_percentage": 0.0,
  "tax": 7.31,
  "tip": 0.0,
  "total": 63.52,
  "currency": "SAR",
  "currency_symbol": "ر.س",
  "items": [{ "pizza_id": "p01", "quantity": 1, "size": "small", "toppings": [] }],
  "timestamp": "2026-08-08T11:12:05.644008"
}
```

`propina`/`tip`/`district` no se mandó — confirma que la propina es opcional también
en SA (`tip_percentage`/`tip` llegan en 0, no como error).

### 6.3 — Campo de dirección faltante → **400** (no 422)

Con `country_code: "US"` y **sin** `zip_code`:
```json
{ "error": "Field 'zip_code' is required for country US", "status_code": 400, "timestamp": "2026-08-08T11:12:05.796534" }
```

> ⚠️ **El README original decía 422.** FastAPI/Pydantic devuelven 422 por defecto en
> errores de validación — pero este backend **sobreescribe** ese comportamiento con su
> propio error handler, que responde **400** con un mensaje `error` legible (no el
> `detail: [{msg, loc}]` que es el shape default de Pydantic). Ya corregido en el
> README y en el tipo `ApiError`.

**Tabla completa del campo requerido por mercado** (confirmado en vivo para MX y US;
CH/JP se infieren del mismo patrón — backend lo valida igual en los 5):

| Mercado | Campo de dirección requerido | Propina (opcional) |
|---|---|---|
| MX | `colonia` | `propina` |
| US | `zip_code` | `tip` |
| CH | `plz` | `trinkgeld` |
| JP | `prefectura` | `chip` |
| SA | `district` | — (no se probó un campo de propina para SA) |

---

## 7 — Leer las órdenes

### 7.1 — `GET /api/orders` — historial (envuelto en `{ orders: [...] }`)

```json
{
  "orders": [
    {
      "username": "standard_user",
      "country_code": "MX",
      "items": [{ "pizza_id": "p01", "quantity": 2, "size": "small", "toppings": [] }],
      "customer_info": {
        "name": "QA Tester",
        "address": "Av. Siempre Viva 742",
        "phone": "5512345678",
        "colonia": "Centro",
        "propina": 10.0
      },
      "subtotal": 455.94,
      "delivery_fee": 35.1,
      "tax_rate": 0.16,
      "tip_percentage": 10.0,
      "tax": 72.95,
      "tip": 45.59,
      "total": 609.58,
      "currency": "MXN",
      "order_id": "ORDER-F02FB11F",
      "timestamp": "2026-08-08T11:07:35.090151",
      "status": "pending"
    }
  ]
}
```

> ⚠️ **NO es un array plano.** `OrderService.listMine()` original hacía
> `(await res.json()) as Order[]` directo — con esta respuesta real, `.length` habría
> sido `undefined` (mismo patrón de bug que `PizzasResponse` ya resolvía envolviendo en
> `{ pizzas }`). Ya corregido: `listMine()` ahora lee `body.orders`.

Nota lo que **solo** aparece aquí y no en la respuesta del checkout (6.1): `username`,
`country_code`, `customer_info` (el nombre/dirección/teléfono que mandaste, anidado) y
**`status`**.

### 7.2 — `GET /api/orders/{order_id}` — detalle

```json
{
  "order_id": "ORDER-F02FB11F",
  "subtotal": 455.94,
  "delivery_fee": 35.1,
  "tax_rate": 0.16,
  "tip_percentage": 10.0,
  "tax": 72.95,
  "tip": 45.59,
  "total": 609.58,
  "currency": "MXN",
  "currency_symbol": "$",
  "items": [{ "pizza_id": "p01", "quantity": 2, "size": "small", "toppings": [] }],
  "timestamp": "2026-08-08T11:07:35.090151"
}
```

> 💡 **Quirk real del backend, no un typo de esta guía:** el detalle es EXACTAMENTE la
> misma forma que la respuesta de `POST /api/checkout` (6.1) — sin `status`, sin
> `customer_info`. Solo la entrada dentro del **historial** (`GET /api/orders`, 7.1)
> trae `status`. Si necesitas el estado de una orden puntual, tráelo del historial y
> filtra por `order_id`, no de `GET /api/orders/{id}`.

---

## 8 — Qué se corrigió en el código a partir de este recorrido

Verificar contra el backend real encontró 3 bugs de contrato en `modulo-07-api-layer`
(no eran errores de sintaxis — TypeScript compilaba bien; eran campos que existían en
el tipo pero no en la respuesta real, o viceversa):

| Archivo | Qué decía | Qué es en realidad |
|---|---|---|
| `types/omnipizza.d.ts` → `Order` | `{ id, status, total, currency, createdAt }` | `{ order_id, items, subtotal, delivery_fee, tax_rate, tax, tip_percentage?, tip?, total, currency, currency_symbol?, timestamp, status? }` — `status` solo en el historial |
| `types/omnipizza.d.ts` → `ApiError` | `{ detail, statusCode? }` (shape default de FastAPI/Pydantic) | `{ error, status_code, timestamp? }` (este backend tiene su propio error handler) |
| `services/OrderService.ts` → `listMine()` | `(await res.json()) as Order[]` (array plano) | El body real es `{ orders: [...] }` — hay que leer `body.orders` |

`tests/api/orders.spec.ts` (+ su gemela en `with-fixtures/`) ya asertan contra las
formas reales de esta guía — corridos en vivo, verdes.

---

## 9 — Endpoints que viste en Swagger pero NO son de este módulo

La colección completa del backend (`Store`, `Cart`, `Profile`, `Session`,
`/api/auth/users`, `/api/auth/profile`, `/api/users/me/profile`, `/api/countries`)
trae más superficie de la que M07 cubre — son fixtures/atajos para otra suite (UI, no
API). Si los ves en el árbol de Swagger y no aparecen en la tabla de la sección 1, es
esperado: no forman parte del contrato que `services/` de este módulo envuelve.
