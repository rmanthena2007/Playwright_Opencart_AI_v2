import { Locator, Page } from "@playwright/test";

export class CartPage {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private productRow(productName: string): Locator {
    return this.page.getByRole("row").filter({
      has: this.page.getByRole("link", { name: productName, exact: true }),
    });
  }

  /**
   * Checks whether the requested product is present in the cart.
   * @param productName - Product name to find
   */
  async isProductPresent(productName: string): Promise<boolean> {
    return this.productRow(productName).isVisible();
  }

  /**
   * Reads the product quantity from the cart row.
   * @param productName - Product name in the cart
   */
  async getProductQuantity(productName: string): Promise<string> {
    return this.productRow(productName).getByRole("textbox").inputValue();
  }

  /**
   * Reads the unit price from the cart row.
   * @param productName - Product name in the cart
   */
  async getUnitPrice(productName: string): Promise<string> {
    return (await this.productRow(productName).getByRole("cell").nth(4).textContent())?.trim() ?? "";
  }

  /**
   * Reads the line total from the cart row.
   * @param productName - Product name in the cart
   */
  async getLineTotal(productName: string): Promise<string> {
    return (await this.productRow(productName).getByRole("cell").nth(5).textContent())?.trim() ?? "";
  }

  /**
   * Reads the grand total shown in the cart summary.
   */
  async getCartTotal(): Promise<string> {
    const totalRow = this.page.getByRole("row").filter({
      has: this.page.getByText("Total:", { exact: true }),
    });
    return (await totalRow.getByRole("cell").nth(1).textContent())?.trim() ?? "";
  }
}