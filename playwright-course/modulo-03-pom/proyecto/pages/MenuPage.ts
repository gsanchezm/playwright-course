// ============================================================
// MenuPage — Page Object del menú / navegación de OmniPizza
// ============================================================
// Analogía QA: el "mapa" de la barra superior que vive en todas
// las pantallas (catálogo, checkout, perfil). Encapsula la
// navegación entre secciones y el contador del carrito.
//
// IMPORTANTE: los locators usan TESTIDS (no nombres de texto),
// porque OmniPizza es multi-market (MX/US/CH/JP) y el texto del
// nav está localizado — `getByRole("link", { name: "Catálogo" })`
// SOLO funcionaría para México. Los testids son iguales en todos
// los markets.
//
// Estos testids del nav NO llevan sufijo `-desktop`/`-responsive`,
// así que usamos `getByTestId` directo (NO `tid()`, que aquí busca
// siempre el sufijo y fallaría).
// ============================================================

import { expect, type Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

export class MenuPage extends BasePage {
  private lnkCatalog: string = "nav-catalog";
  private lnkCheckout: string = "nav-checkout";
  private lnkProfile: string = "nav-profile";
  private btnLogout: string = "logout-btn";
  private lblCartCount: string = "nav-cart-count";

  // --- Locators privados ---
  private get cartCount(): Locator {
    return this.page.getByTestId(this.lblCartCount);
  }

  // --- Acciones ---

  async goToCatalog(): Promise<void> {
    await this.page.getByTestId(this.lnkCatalog).click();
  }

  async goToCheckout(): Promise<void> {
    await this.page.getByTestId(this.lnkCheckout).click();
  }

  async goToProfile(): Promise<void> {
    await this.page.getByTestId(this.lnkProfile).click();
  }

  async logout(): Promise<void> {
    await this.page.getByTestId(this.btnLogout).click();
  }

  async getCartCount(): Promise<string> {
    // El badge `nav-cart-count` sólo se renderiza cuando el carrito
    // tiene items; si no existe, el conteo es 0.
    if (!(await this.cartCount.count())) return "0";
    return (await this.cartCount.innerText()).trim();
  }

  // --- Assertions ---

  async expectCartCount(n: number): Promise<void> {
    await expect(this.cartCount).toHaveText(String(n));
  }
}
