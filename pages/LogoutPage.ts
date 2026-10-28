import { Locator, Page } from "@playwright/test";

export class LogoutPage {
  private readonly logoutHeading: Locator;
  private readonly continueLink: Locator;

  constructor(page: Page) {
    // Initialize locators with Playwright's accessible locators.
    this.logoutHeading = page.getByRole("heading", { name: "Account Logout", exact: true });
    this.continueLink = page.getByRole("link", { name: "Continue", exact: true });
  }

  /**
   * Checks whether the logout confirmation is displayed.
   */
  async isLogoutConfirmed(): Promise<boolean> {
    return this.logoutHeading.isVisible();
  }

  /**
   * Continues from the logout confirmation to the storefront.
   */
  async continueToStore(): Promise<void> {
    await this.continueLink.click();
  }
}