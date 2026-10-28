import { Locator, Page } from "@playwright/test";

export class LoginPage {
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly invalidLoginWarning: Locator;
  private readonly loginWarning: Locator;

  constructor(page: Page) {
    // Initialize locators with Playwright's accessible locators.
    this.emailInput = page.getByRole("textbox", { name: "E-Mail Address" });
    this.passwordInput = page.getByRole("textbox", { name: "Password" });
    this.loginButton = page.getByRole("button", { name: "Login", exact: true });
    this.invalidLoginWarning = page.getByText(
      "Warning: No match for E-Mail Address and/or Password.",
      { exact: true },
    );
    this.loginWarning = page.getByText(/Warning:/);
  }

  /**
   * Checks whether the customer login form is visible.
   */
  async isLoginFormVisible(): Promise<boolean> {
    return this.emailInput.isVisible();
  }

  /**
   * Checks whether OpenCart displays the invalid-credentials warning.
   */
  async isInvalidLoginWarningVisible(): Promise<boolean> {
    return this.invalidLoginWarning.isVisible();
  }

  /**
   * Checks whether OpenCart displays a login warning.
   */
  async isLoginWarningVisible(): Promise<boolean> {
    return this.loginWarning.isVisible();
  }

  /**
   * Submits customer login credentials.
   * @param email - Customer email address
   * @param password - Customer password
   */
  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}