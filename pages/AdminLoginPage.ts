import { Locator, Page } from "@playwright/test";

export class AdminLoginPage {
  private readonly page: Page;
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with Playwright's accessible locators.
    this.usernameInput = page.getByRole("textbox", { name: "Username" });
    this.passwordInput = page.getByRole("textbox", { name: "Password" });
    this.loginButton = page.getByRole("button", { name: /Login/ });
  }

  /**
   * Opens the admin portal relative to the configured storefront URL.
   */
  async openAdminPortal(): Promise<void> {
    const appUrl = process.env.WEB_APP_URL ?? "http://localhost/opencart/upload/";
    await this.page.goto(new URL("admin/index.php", appUrl).toString());
  }

  /**
   * Checks whether the admin login form is visible.
   */
  async isLoginFormVisible(): Promise<boolean> {
    return this.usernameInput.isVisible();
  }

  /**
   * Submits configured administrator credentials.
   * @param username - Admin username
   * @param password - Admin password
   */
  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}