import { expect, Page } from "@playwright/test";

export class CheckoutPage {
  readonly error;
  constructor(private readonly page: Page) {
    this.error = page.getByTestId("error");
  }

  async fillShipping(name: string, surname: string, postalCode: string, coupon = "") {
    await this.page.getByTestId("nombre").fill(name);
    await this.page.getByTestId("apellido").fill(surname);
    await this.page.getByTestId("cp").fill(postalCode);
    await this.page.getByTestId("cupon").fill(coupon);
  }

  async submit() {
    await this.page.getByTestId("continuar").click();
  }

  async expectError(message: string) {
    await expect(this.error).toHaveText(message);
  }
}
