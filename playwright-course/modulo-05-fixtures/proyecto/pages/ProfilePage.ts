// ============================================================
// ProfilePage — Page Object del perfil de OmniPizza (/profile)
// ============================================================
// Analogía QA: el "mapa" de la pantalla de perfil. El plato fuerte
// aquí es el campo de cumpleaños: un <input type="date"> NATIVO.
//
// 🎯 Técnica que enseña este Page: cómo se automatiza un date
//    picker NATIVO del navegador. La regla de oro es:
//
//      NO se clickea el calendario emergente.
//
//    El calendario que abre Chrome/Firefox al hacer clic es UI del
//    navegador (no del DOM de la página), así que Playwright no lo
//    puede manipular de forma confiable. En su lugar, un input date
//    se llena con .fill("YYYY-MM-DD") — el navegador interpreta esa
//    cadena ISO y pinta la fecha. Simple y determinista.
//
// Convención de testids (verificados 2026-07-12): fullname/address/
// save-btn llevan sufijo -desktop/-responsive → tid(); phone,
// birthday y notes NO llevan sufijo → getByTestId directo.
// ============================================================

import { expect, type Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

export class ProfilePage extends BasePage {
  readonly path = "/profile";

  private txtFullName: string = "profile-fullname";
  private txtPhone: string = "profile-phone";
  private txtAddress: string = "profile-address";
  private dateBirthday: string = "profile-birthday";
  private txtNotes: string = "profile-notes";
  private btnSave: string = "profile-save-btn";

  // --- Locators privados ---
  private get fullNameInput(): Locator {
    return this.tid(this.txtFullName);
  }

  private get phoneInput(): Locator {
    // profile-phone NO lleva sufijo → getByTestId directo (no tid)
    return this.page.getByTestId(this.txtPhone);
  }

  private get birthdayInput(): Locator {
    // El date picker nativo: <input type="date">, sin sufijo.
    return this.page.getByTestId(this.dateBirthday);
  }

  private get notesInput(): Locator {
    return this.page.getByTestId(this.txtNotes);
  }

  private get saveButton(): Locator {
    return this.tid(this.btnSave);
  }

  // --- Acciones ---

  async goto(): Promise<void> {
    // Requiere sesión activa (si no, la app redirige a login).
    await this.page.goto(this.path);
  }

  /**
   * Fijar el cumpleaños en el date picker NATIVO.
   *
   * @param isoDate — fecha en formato ISO "YYYY-MM-DD" (ej. "1990-05-15").
   *
   * Un <input type="date"> SIEMPRE acepta el valor en formato ISO,
   * sin importar cómo lo muestre visualmente el navegador según el
   * locale (dd/mm/yyyy en MX, mm/dd/yyyy en US…). Por eso .fill()
   * con ISO es portable entre markets.
   */
  async setBirthday(isoDate: string): Promise<void> {
    await this.birthdayInput.fill(isoDate);
  }

  async getBirthday(): Promise<string> {
    // El value de un input date SIEMPRE se lee en ISO "YYYY-MM-DD".
    return this.birthdayInput.inputValue();
  }

  async fillNotes(text: string): Promise<void> {
    await this.notesInput.fill(text);
  }

  async save(): Promise<void> {
    await this.saveButton.click();
  }

  // --- Assertions ---

  async expectLoaded(): Promise<void> {
    await expect(this.birthdayInput).toBeVisible();
  }

  async expectBirthday(isoDate: string): Promise<void> {
    // Aserción directa sobre el value ISO del date picker nativo.
    await expect(this.birthdayInput).toHaveValue(isoDate);
  }
}
