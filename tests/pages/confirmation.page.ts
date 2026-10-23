import { expect, Page } from "@playwright/test";

export class ConfirmationPage {
  constructor(private readonly page: Page) {}

  async expectOrderNumber() {
    await expect(this.page.getByTestId("pedido")).toHaveText(/^\d{6}$/);
  }
}
