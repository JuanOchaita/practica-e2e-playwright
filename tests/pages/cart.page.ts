import { expect, Locator, Page } from "@playwright/test";

export class CartPage {
  readonly rows: Locator;
  readonly error: Locator;
  readonly continueButton: Locator;
  readonly subtotal: Locator;

  constructor(private readonly page: Page) {
    this.rows = page.getByTestId("linea");
    this.error = page.getByTestId("error");
    this.continueButton = page.getByTestId("continuar");
    this.subtotal = page.getByTestId("subtotal");
  }

  row(name: string) {
    return this.rows.filter({ hasText: name });
  }

  async setQuantity(name: string, quantity: string) {
    await this.row(name).getByRole("spinbutton").fill(quantity);
    await this.row(name).getByRole("spinbutton").press("Tab");
  }

  async continueToCheckout() {
    await this.continueButton.click();
  }

  async expectEmpty() {
    await expect(this.rows).toHaveCount(0);
    await expect(this.page.getByTestId("vacio")).toBeVisible();
  }

  async expectQuantityError() {
    await expect(this.error).toHaveText("La cantidad tiene que estar entre 1 y 5.");
  }
}
