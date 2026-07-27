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

// Los contratos de la capa de API (Pizza, LoginResponse, PizzasResponse,
// OrderPayload, Order, ApiError) todavía NO existen aquí: este módulo solo
// consume el catálogo por UI (locators), nunca por HTTP directo. Llegan en
// M07 — API Layer, cuando `services/` los consume por primera vez.
