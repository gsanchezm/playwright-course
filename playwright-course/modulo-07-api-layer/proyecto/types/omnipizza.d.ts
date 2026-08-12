// ============================================================
// types/omnipizza.d.ts — Contratos tipo Swagger del proyecto
// ============================================================
// Analogía QA: una interface es como el SRS de requerimientos
// o el schema de Swagger — define la forma exacta que deben
// cumplir los datos. Si un JSON no cumple la interface,
// TypeScript falla ANTES de ejecutar (defecto detectado en
// diseño, no en producción).
// ============================================================

// "SA" (Arabia Saudita) — market nuevo: la app corre en RTL/árabe y su
// moneda es SAR. El backend exige el campo de dirección `district`
// (paralelo a MX→colonia, US→zip_code, CH→plz, JP→prefectura).
export type CountryCode = "MX" | "US" | "CH" | "JP" | "SA";
export type Currency = "MXN" | "USD" | "CHF" | "JPY" | "SAR";
// OmniPizza sólo expone usuarios "customer". Las personas
// (standard / locked_out / problem / performance_glitch / error)
// se distinguen por COMPORTAMIENTO de login, no por privilegios.
// NO existe un rol admin en la app.
export type Role = "customer";

export interface User {
  username: string;
  password: string;
  role: Role;
  description?: string;
}

export interface Market {
  code: CountryCode;
  currency: Currency;
  fullName: string;
  country: string;
  phone: string;
  address: string;
  colonia?: string;
  district?: string;
  zipCode: string;
  taxRate?: number;
}

export interface Pizza {
  id: string | number;
  name: string;
  price: number;
  currency: Currency;
  description?: string;
  category?: string;
  imageUrl?: string;
}

export interface LoginResponse {
  access_token: string;
  token_type?: string;
  username?: string;
}

export interface PizzasResponse {
  pizzas: Pizza[];
}

// Body de POST /api/checkout (snake_case, como lo espera el backend FastAPI
// de OmniPizza). El nombre/dirección/teléfono van planos (no anidados en
// `customer`) y los items usan `pizza_id` (no `pizzaId`). Además del bloque
// común, el backend exige el CAMPO DE DIRECCIÓN según `country_code` (MX:
// `colonia`, US: `zip_code`, CH: `plz`, JP: `prefectura`, SA: `district`); la propina
// (`propina`/`tip`/`trinkgeld`/`chip`) es OPCIONAL. Por eso los campos por
// mercado se modelan como opcionales aquí.
export interface OrderPayload {
  country_code: CountryCode;
  items: Array<{ pizza_id: string | number; quantity: number }>;
  name: string;
  address: string;
  phone: string;
  // Campos por mercado — el de dirección es requerido por el backend según
  // `country_code`; la propina es opcional.
  colonia?: string;
  propina?: number;
  zip_code?: string;
  tip?: number;
  plz?: string;
  trinkgeld?: number;
  prefectura?: string;
  district?: string;
  chip?: number;
}

// Ítem tal como lo devuelve el backend en la respuesta (no confundir con el
// ítem del REQUEST en OrderPayload): trae `size`/`toppings` con defaults
// que el servidor rellena, aunque el request no los haya mandado.
export interface OrderItem {
  pizza_id: string | number;
  quantity: number;
  size?: string;
  toppings?: string[];
}

// Verificado en vivo contra el backend real (POST /api/checkout, GET
// /api/orders, GET /api/orders/{id}) — el contrato NO usa `id`/`createdAt`
// como sugeriría un REST genérico, sino `order_id`/`timestamp`, y desglosa
// el total en `subtotal`/`delivery_fee`/`tax`/`tip`. `status` SOLO viene en
// el historial (`GET /api/orders`); ni la respuesta de `POST /api/checkout`
// ni el detalle (`GET /api/orders/{id}`) lo incluyen — por eso es opcional.
export interface Order {
  order_id: string;
  items: OrderItem[];
  subtotal: number;
  delivery_fee: number;
  tax_rate: number;
  tax: number;
  tip_percentage?: number;
  tip?: number;
  total: number;
  currency: Currency;
  currency_symbol?: string;
  timestamp: string;
  status?: "pending" | "confirmed" | "delivered" | "cancelled";
}

// `GET /api/orders` no devuelve un array plano — lo envuelve en `{ orders }`
// (mismo patrón que `PizzasResponse` envuelve el catálogo en `{ pizzas }`).
export interface OrdersListResponse {
  orders: Order[];
}

// Verificado en vivo: el backend responde `{ error, status_code, timestamp }`
// (no `{ detail }, que es el shape default de FastAPI/Pydantic — este backend
// lo sobreescribe con su propio error handler).
export interface ApiError {
  error: string;
  status_code: number;
  timestamp?: string;
}
