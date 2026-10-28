import { Locator, Page } from "@playwright/test";

export class HomePage {
  private readonly page: Page;
  private readonly storeLogo: Locator;
  private readonly myAccountLink: Locator;
  private readonly registerLink: Locator;
  private readonly loginLink: Locator;
  private readonly logoutLink: Locator;
  private readonly searchInput: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with Playwright's accessible locators.
    this.storeLogo = page.getByRole("img", { name: "Your Store" });
    this.myAccountLink = page.getByRole("link", { name: /My Account/ }).first();
    this.registerLink = page.getByRole("link", { name: "Register", exact: true });
    this.loginLink = page.getByRole("link", { name: "Login", exact: true });
    this.logoutLink = page.getByRole("link", { name: "Logout", exact: true }).first();
    this.searchInput = page.getByRole("textbox", { name: "Search" });
  }

  /**
   * Verifies that the storefront logo is visible.
   */
  async isStoreVisible(): Promise<boolean> {
    return this.storeLogo.isVisible();
  }

  /**
   * Opens the My Account navigation menu.
   */
  async openAccountMenu(): Promise<void> {
    await this.myAccountLink.click();
  }

  /**
   * Opens the customer registration page.
   */
  async clickRegister(): Promise<void> {
    await this.registerLink.click();
  }

  /**
   * Opens the customer login page.
   */
  async clickLogin(): Promise<void> {
    await this.loginLink.click();
  }

  /**
   * Opens the customer logout page.
   */
  async clickLogout(): Promise<void> {
    await this.logoutLink.click();
  }

  /**
   * Checks whether the Login option is visible in the account menu.
   */
  async isLoginOptionVisible(): Promise<boolean> {
    return this.loginLink.isVisible();
  }

  /**
   * Checks whether the Logout option is visible in the account menu.
   */
  async isLogoutOptionVisible(): Promise<boolean> {
    return this.logoutLink.isVisible();
  }

  /**
   * Searches the catalog for a product.
   * @param productName - Product name to search for
   */
  async searchProduct(productName: string): Promise<void> {
    await this.searchInput.fill(productName);
    await this.searchInput.press("Enter");
  }
}