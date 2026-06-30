// ============================================================
// features/catalog/catalog.flow.ts — orquestación del catálogo (FACADE)
// ============================================================
// Analogía QA: el "conserje" del catálogo. El test dice "abre el
// catálogo y agrega la primera pizza" y el flow se encarga del cómo
// (goto + esperar + agregar), ocultando los pasos intermedios.
//
// FACADE: ofrece una API simple (openAndAddFirst, searchAndCount) y
// oculta los detalles del Page Object que orquesta por dentro.
// ============================================================

import type { Page } from "@playwright/test";
import { CatalogPage } from "./catalog.page";

export class CatalogFlow {
  private readonly catalog: CatalogPage;

  // El contrato de fixtures construye el flow con un solo `page`;
  // el flow arma por dentro los Pages que orquesta.
  constructor(page: Page) {
    this.catalog = new CatalogPage(page);
  }

  /**
   * Abre el catálogo, espera a que cargue y agrega la primera pizza
   * al carrito.
   */
  async openAndAddFirst(): Promise<void> {
    await this.catalog.goto();
    await this.catalog.waitForCatalog();
    await this.catalog.addFirstPizza();
  }

  /**
   * Abre el catálogo, busca un término y devuelve cuántas pizzas
   * quedan visibles tras el filtro de búsqueda.
   */
  async searchAndCount(term: string): Promise<number> {
    await this.catalog.goto();
    await this.catalog.waitForCatalog();
    await this.catalog.search(term);
    return this.catalog.getPizzaCount();
  }
}
