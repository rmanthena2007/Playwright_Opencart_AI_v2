import { Locator, Page } from "@playwright/test";

export class AccountPage {
  private readonly accountHeading: Locator;

  constructor(page: Page) {
    // Initialize locators with Playwright's accessible locators.
    this.accountHeading = page.locator("#content").getByRole("heading", {
      name: "My Account",
      exact: true,
    });
  }

  /**
   * Checks whether the authenticated My Account dashboard is displayed.
   */
  async isDashboardVisible(): Promise<boolean> {
    return this.accountHeading.isVisible();
  }
}