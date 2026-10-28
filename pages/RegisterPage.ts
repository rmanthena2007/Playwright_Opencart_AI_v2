import { Locator, Page } from "@playwright/test";

export class RegisterPage {
  private readonly page: Page;
  private readonly firstNameInput: Locator;
  private readonly lastNameInput: Locator;
  private readonly emailInput: Locator;
  private readonly telephoneInput: Locator;
  private readonly passwordInput: Locator;
  private readonly passwordConfirmationInput: Locator;
  private readonly privacyPolicyCheckbox: Locator;
  private readonly continueButton: Locator;
  private readonly accountCreatedHeading: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with Playwright's accessible locators.
    this.firstNameInput = page.getByPlaceholder("First Name");
    this.lastNameInput = page.getByPlaceholder("Last Name");
    this.emailInput = page.getByPlaceholder("E-Mail");
    this.telephoneInput = page.getByPlaceholder("Telephone");
    this.passwordInput = page.getByPlaceholder("Password", { exact: true });
    this.passwordConfirmationInput = page.getByPlaceholder("Password Confirm");
    this.privacyPolicyCheckbox = page.getByRole("checkbox");
    this.continueButton = page.getByRole("button", { name: "Continue", exact: true });
    this.accountCreatedHeading = page.getByRole("heading", {
      name: "Your Account Has Been Created!",
      exact: true,
    });
  }

  /**
   * Checks whether the registration form is visible.
   */
  async isRegistrationFormVisible(): Promise<boolean> {
    await this.firstNameInput.waitFor({ state: "visible" });
    return this.firstNameInput.isVisible();
  }

  /**
   * Submits the customer registration form.
   * @param customer - Generated customer details
   */
  async register(customer: {
    firstName: string;
    lastName: string;
    email: string;
    telephone: string;
    password: string;
  }): Promise<void> {
    await this.firstNameInput.fill(customer.firstName);
    await this.lastNameInput.fill(customer.lastName);
    await this.emailInput.fill(customer.email);
    await this.telephoneInput.fill(customer.telephone);
    await this.passwordInput.fill(customer.password);
    await this.passwordConfirmationInput.fill(customer.password);
    await this.privacyPolicyCheckbox.check();
    await this.continueButton.click();
  }

  /**
   * Checks whether the account-created confirmation is displayed.
   */
  async isAccountCreated(): Promise<boolean> {
    return this.accountCreatedHeading.isVisible();
  }

  /**
   * Continues from the account-created confirmation.
   */
  async continueToAccount(): Promise<void> {
    await this.page.getByRole("link", { name: "Continue", exact: true }).click();
  }
}