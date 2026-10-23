import { test as base } from "@playwright/test";
import { CatalogPage } from "./pages/catalog.page";
import { CartPage } from "./pages/cart.page";
import { CheckoutPage } from "./pages/checkout.page";
import { ConfirmationPage } from "./pages/confirmation.page";
import { LoginPage } from "./pages/login.page";
import { SummaryPage } from "./pages/summary.page";

type Pages = {
  login: LoginPage;
  catalog: CatalogPage;
  cart: CartPage;
  checkout: CheckoutPage;
  summary: SummaryPage;
  confirmation: ConfirmationPage;
};

export const test = base.extend<Pages>({
  login: async ({ page }, use) => use(new LoginPage(page)),
  catalog: async ({ page }, use) => use(new CatalogPage(page)),
  cart: async ({ page }, use) => use(new CartPage(page)),
  checkout: async ({ page }, use) => use(new CheckoutPage(page)),
  summary: async ({ page }, use) => use(new SummaryPage(page)),
  confirmation: async ({ page }, use) => use(new ConfirmationPage(page))
});

export { expect } from "@playwright/test";
