import { expect, Locator, Page } from "@playwright/test";

export class LoginPage {
  readonly user: Locator;
  readonly password: Locator;
  readonly submit: Locator;
  readonly error: Locator;

  constructor(public readonly page: Page) {
    this.user = page.getByTestId("usuario");
    this.password = page.getByTestId("clave");
    this.submit = page.getByTestId("ingresar");
    this.error = page.getByTestId("error");
  }

  async goto() {
    await this.page.goto("/");
  }

  async login(user: string, password = "calidad2026") {
    await this.user.fill(user);
    await this.password.fill(password);
    await this.submit.click();
  }

  async expectError(message: string) {
    await expect(this.error).toHaveText(message);
  }
}
