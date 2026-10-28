// ============================================================
// core/env.ts — configuración de entorno (patrón SINGLETON)
// ============================================================
// Analogía QA: una sola "hoja de ambiente" compartida por toda
// la suite. Se lee UNA vez de process.env y queda congelada.
//
// SINGLETON idiomático en TS: un módulo se evalúa una sola vez y
// su export es la MISMA referencia en todo el proceso. Si además
// la congelamos con Object.freeze, nadie puede mutarla en runtime
// → garantía de "una única instancia inmutable". No hace falta una
// clase con getInstance(): el sistema de módulos ya es el singleton.
// ============================================================

import "dotenv/config";

export interface Env {
  /** URL del frontend (UI tests). */
  readonly baseURL: string;
  /** URL del backend (API tests / servicios). */
  readonly apiURL: string;
  /** Usuario de prueba happy-path. */
  readonly username: string;
  /** Contraseña del usuario de prueba. */
  readonly password: string;
  /** Mercado por defecto (MX | US | CH | JP). */
  readonly country: string;
}

// Se lee una sola vez, con defaults verificados de OmniPizza.
export const env: Env = Object.freeze({
  baseURL: process.env.BASE_URL ?? "https://omnipizza-frontend.onrender.com",
  apiURL: process.env.API_URL ?? "https://omnipizza-backend.onrender.com",
  username: process.env.TEST_USER_USERNAME ?? "standard_user",
  password: process.env.TEST_USER_PASSWORD ?? "pizza123",
  country: process.env.DEFAULT_COUNTRY ?? "MX",
});
