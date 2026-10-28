import { Locator, Page } from "@playwright/test";

export class AdminCustomersPage {
  private readonly page: Page;
  private readonly customersMenu: Locator;
  private readonly customerNameFilter: Locator;
  private readonly customerEmailFilter: Locator;
  private readonly filterButton: Locator;
  private readonly securityNotificationCloseButton: Locator;
  private readonly customerListLink: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with Playwright's accessible locators.
    this.customersMenu = page.getByRole("link", { name: /Customers/ }).first();
    this.customerListLink = page.getByRole("link", { name: /Customers/ }).last();
    this.customerNameFilter = page.getByPlaceholder("Customer Name");
    this.customerEmailFilter = page.getByPlaceholder("E-Mail");
    this.filterButton = page.locator("#button-filter");
    this.securityNotificationCloseButton = page.locator(".modal-header .close");
  }

  /**
   * Dismisses OpenCart's security notice when it appears after admin login.
   */
  async dismissSecurityNotification(): Promise<void> {
    await this.securityNotificationCloseButton
      .waitFor({ state: "visible", timeout: 3000 })
      .catch(() => undefined);
    if (await this.securityNotificationCloseButton.isVisible()) {
      await this.securityNotificationCloseButton.click();
    }
  }

  /**
   * Checks whether the admin Customers menu is available.
   */
  async isCustomersMenuVisible(): Promise<boolean> {
    return this.customersMenu.first().isVisible();
  }

  /**
   * Opens the Customers list from the admin navigation.
   */
  async openCustomerList(): Promise<void> {
    await this.customersMenu.click();
    await this.customerListLink.click();
  }

  /**
   * Filters the customer list by email address.
   * @param email - Unique registered customer email
   */
  async filterByEmail(email: string): Promise<void> {
    await this.customerEmailFilter.fill(email);
    await this.filterButton.click();
  }

  private customerRow(email: string): Locator {
    return this.page.getByRole("row").filter({ hasText: email });
  }

  /**
   * Checks whether the filtered customer row is visible.
   * @param email - Customer email address
   */
  async isCustomerVisible(email: string): Promise<boolean> {
    return this.customerRow(email).isVisible();
  }

  /**
   * Reads the filtered customer row text for validating its displayed fields.
   * @param email - Customer email address
   */
  async getCustomerRowText(email: string): Promise<string> {
    return (await this.customerRow(email).innerText()).trim();
  }
}