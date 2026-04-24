// ============================================================
// types/omnipizza.d.ts — Contratos tipo Swagger del proyecto
// ============================================================
// Analogía QA: una interface es como el SRS de requerimientos
// o el schema de Swagger — define la forma exacta que deben
// cumplir los datos. Si un JSON no cumple la interface,
// TypeScript falla ANTES de ejecutar (defecto detectado en
// diseño, no en producción).
// ============================================================

export type CountryCode = "MX" | "US" | "CH" | "JP";
export type Currency = "MXN" | "USD" | "CHF" | "JPY";
export type Role = "customer" | "admin";

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

export interface OrderPayload {
  items: Array<{ pizzaId: string | number; quantity: number }>;
  market: CountryCode;
  customer: {
    fullName: string;
    phone: string;
    address: string;
    zipCode: string;
  };
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
