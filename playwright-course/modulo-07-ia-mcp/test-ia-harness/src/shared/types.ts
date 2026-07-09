// ============================================================
// shared/types.ts — contratos de dominio (estilo Swagger)
// ============================================================
// Analogía QA: una interface es como el SRS de requerimientos o
// el schema de Swagger — define la forma EXACTA que deben cumplir
// los datos. Si un JSON no cumple, TypeScript falla ANTES de
// ejecutar (defecto detectado en diseño, no en producción).
//
// Copiado verbatim de types/omnipizza.d.ts del curso, expuesto
// como módulo .ts normal (no .d.ts) para importar desde las slices.
// ============================================================

export type CountryCode = "MX" | "US" | "CH" | "JP";
export type Currency = "MXN" | "USD" | "CHF" | "JPY";
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
  phone: string;
  address: string;
  colonia?: string;
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
// `colonia`, US: `zip_code`, CH: `plz`, JP: `prefectura`); la propina
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
  chip?: number;
}

export interface Order {
  id: string;
  status: "pending" | "confirmed" | "delivered" | "cancelled";
  total: number;
  currency: Currency;
  createdAt: string;
}

export interface ApiError {
  detail: string | Array<{ msg: string; loc?: string[] }>;
  statusCode?: number;
}
