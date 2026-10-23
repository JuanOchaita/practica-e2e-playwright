import { expect, Locator, Page } from "@playwright/test";

export type SortOrder = "az" | "za" | "precio-asc" | "precio-desc";

export class CatalogPage {
  readonly products: Locator;
  readonly sort: Locator;
  readonly cartLink: Locator;
  readonly cartCount: Locator;
  readonly logout: Locator;

  constructor(public readonly page: Page) {
    this.products = page.getByTestId("producto");
    this.sort = page.getByTestId("orden");
    this.cartLink = page.getByTestId("enlace-carrito");
    this.cartCount = page.getByTestId("contador-carrito");
    this.logout = page.getByTestId("cerrar-sesion");
  }

  async selectOrder(order: SortOrder) {
    await this.sort.selectOption(order);
  }

  product(name: string) {
    return this.products.filter({ has: this.page.getByRole("heading", { name }) });
  }

  async addProduct(name: string) {
    await this.product(name).getByRole("button", { name: "Agregar al carrito" }).click();
  }

  async productNames() {
    return this.products.getByRole("heading").allTextContents();
  }

  async prices() {
    return this.products.getByTestId("precio").allTextContents();
  }

  async openCart() {
    await this.cartLink.click();
  }

  async logoutAndExpectLogin() {
    await this.logout.click();
    await expect(this.page).toHaveURL(/\/(?:index\.html)?$/);
  }
}
