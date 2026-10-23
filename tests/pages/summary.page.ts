import { expect, Page } from "@playwright/test";

export class SummaryPage {
  readonly subtotal;
  readonly discount;
  readonly shipping;
  readonly total;

  constructor(private readonly page: Page) {
    this.subtotal = page.getByTestId("subtotal");
    this.discount = page.getByTestId("descuento");
    this.shipping = page.getByTestId("envio");
    this.total = page.getByTestId("total");
  }

  async confirm() {
    await this.page.getByTestId("confirmar").click();
  }

  async expectAmounts(subtotal: string, discount: string, shipping: string, total: string) {
    await expect(this.subtotal).toHaveText(subtotal);
    await expect(this.discount).toHaveText(discount);
    await expect(this.shipping).toHaveText(shipping);
    await expect(this.total).toHaveText(total);
  }
}
