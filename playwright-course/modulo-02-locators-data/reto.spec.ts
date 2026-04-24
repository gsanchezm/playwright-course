// ============================================================
// M02 — Reto: añadir un 5º mercado sin tocar el spec
// ============================================================
// Objetivo:
//   1. Añade un mercado "CA" (Canada, currency "CAD") en
//      data/markets.json con datos válidos.
//   2. Corre `pnpm m2` y verifica que el test extra se ejecuta
//      automáticamente sin modificar este archivo.
//   3. Si TypeScript grita, lee el error — el contrato Market
//      (en types/omnipizza.d.ts) está rechazando tu cambio.
//      ¿Por qué?
//
// (Pista: CountryCode y Currency son union types acotados.)
// ============================================================

import { test, expect } from "@playwright/test";
import type { Market } from "../types";
import marketsJson from "../data/markets.json";

const markets = marketsJson as Market[];

test.describe("Reto M02 — parametrización extendida", () => {
  for (const market of markets) {
    test(`Reto-${market.code} — catálogo carga en ${market.fullName}`, async ({ page }) => {
      // TODO 1 — hacer login con el standard_user y seleccionar este mercado

      // TODO 2 — contar cuántas pizzas tiene el catálogo en este mercado
      //          (usa locator.all() y .length)

      // TODO 3 — validar que la currency que aparece en la UI
      //          coincide con market.currency

      // Nota: si añadiste "CA" a markets.json y TypeScript se queja,
      // extiende el union type CountryCode/Currency en
      // types/omnipizza.d.ts para aceptar "CA"/"CAD".
      expect(market).toBeDefined();
    });
  }
});
