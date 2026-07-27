// ============================================================
// M04 — Interactuando con los widgets nuevos de OmniPizza (heredado de M05)
// ============================================================
// M05 sumó `ProfilePage` y `PizzaCustomizerModal` con 8 escenarios de
// interacción. Aquí sólo portamos los 2 que NO dependen de la versión
// "rica" de `CheckoutPage`/`CatalogPage` que M05 construye (dropdowns de
// tarjeta, método de pago, tooltips, mercado SA/RTL y la confirmación de
// orden en dos pasos siguen siendo contenido exclusivo de M05 — ese
// CheckoutPage/CatalogPage de M04 es deliberadamente el esqueleto básico
// del reto, no el enriquecido).
//
// Sin fixtures: este módulo instancia los Page Objects directamente
// (`new ProfilePage(page)`), como el resto de M04. El login es por UI en
// CADA test (storageState llega hasta M06).
// ============================================================

import { test } from "@playwright/test";
import {
  LoginPage,
  CatalogPage,
  MenuPage,
  ProfilePage,
  PizzaCustomizerModal,
} from "../pages";
import type { User } from "../types";
import usersJson from "../data/users.json";

const users = usersJson as User[];
const standardUser = users.find((u) => u.username === "standard_user")!;

// ============================================================
// 1) Date picker NATIVO — <input type="date">
// ============================================================
// Regla de oro: NO se clickea el calendario emergente (es UI del
// navegador, fuera del DOM). Un input date se llena con .fill() en
// formato ISO "YYYY-MM-DD" y su value SIEMPRE se lee en ISO.
// ============================================================
test.describe("Date picker nativo del perfil (M04)", () => {
  test("fill('YYYY-MM-DD') fija el cumpleaños sin tocar el calendario @regression", async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);
    const catalogPage = new CatalogPage(page);
    const profilePage = new ProfilePage(page);

    await loginPage.loginInMarket(standardUser, "MX");
    await catalogPage.expectLoaded();

    await profilePage.goto();
    await profilePage.expectLoaded();

    // La técnica: .fill() con ISO. No abrimos ni clickeamos el calendario.
    await profilePage.setBirthday("1990-05-15");

    // El value de un input date se lee/afirma también en ISO.
    await profilePage.expectBirthday("1990-05-15");
    // Sin .save(): el demo es de la INTERACCIÓN con el control, cero
    // efecto colateral sobre el estado del perfil.
  });
});

// ============================================================
// 2) Modal / popup — Customize Pizza
// ============================================================
// Un modal es una sub-pantalla. El de OmniPizza NO usa role="dialog"
// (nos anclamos por testid). Detalle real: "Choose Size" se marca
// REQUIRED en la UI, pero el botón confirmar NO nace deshabilitado —
// buena lección de QA: un "requerido" visual no siempre bloquea el
// submit; verifícalo, no lo asumas.
// ============================================================
test.describe("Modal 'Customize Pizza' (M04)", () => {
  test("abrir → elegir size + topping → confirmar suma al carrito @regression", async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);
    const catalogPage = new CatalogPage(page);
    const pizzaCustomizer = new PizzaCustomizerModal(page);
    const menuPage = new MenuPage(page);

    await loginPage.loginInMarket(standardUser, "MX");
    await catalogPage.expectLoaded();

    // Abrir el modal (sin confirmar).
    await catalogPage.openCustomizerForFirst();
    await pizzaCustomizer.expectOpen();

    // Interacción típica de modal: elegir tamaño + un topping.
    await pizzaCustomizer.selectSize("large");
    await pizzaCustomizer.toggleTopping("mushrooms");

    // Confirmar cierra el modal y suma la pizza al carrito.
    await pizzaCustomizer.confirm();
    await pizzaCustomizer.expectClosed();
    await menuPage.expectCartCount(1);
  });
});

// ============================================================
// 👉 Los otros 6 escenarios de M05 (dropdowns de tarjeta, método de
// pago, ambos tooltips, mercado SA/RTL y la confirmación de orden en
// dos pasos) dependen de métodos que sólo existen en el CheckoutPage/
// CatalogPage "enriquecidos" de M05 — ese salto de riqueza es
// precisamente lo que M05 enseña. Los verás completos ahí.
// ============================================================
