import { Locator, Page } from "@playwright/test";

export class ProductPage {
  private readonly page: Page;
  private readonly quantityInput: Locator;
  private readonly addToCartButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with Playwright's accessible locators.
    this.quantityInput = page.getByRole("textbox", { name: "Qty" });
    this.addToCartButton = page.getByRole("button", { name: "Add to Cart", exact: true });
  }

  /**
   * Checks whether the product details and expected price are displayed.
   * @param productName - Expected product name
   * @param price - Expected product price
   */
  async isProductDetailsVisible(productName: string, price: string): Promise<boolean> {
    const productHeading = this.page.getByRole("heading", { name: productName, exact: true, level: 1 });
    const priceHeading = this.page.getByRole("heading", { name: price, exact: true, level: 2 });
    return (await productHeading.isVisible()) && (await priceHeading.isVisible());
  }

  /**
   * Adds the product to the cart with the requested quantity.
   * @param quantity - Number of products to add
   */
  async addToCart(quantity: string): Promise<void> {
    await this.quantityInput.fill(quantity);
    await this.addToCartButton.click();
  }

  /**
   * Checks whether the product-added confirmation is displayed.
   */
  async isAddedToCartMessageVisible(productName: string): Promise<boolean> {
    const successMessage = this.page.getByText(
      `Success: You have added ${productName} to your shopping cart!`,
    );
    await successMessage.waitFor({ state: "visible" });
    return successMessage.isVisible();
  }

  /**
   * Opens the shopping cart from the add-to-cart confirmation.
   */
  async openShoppingCart(): Promise<void> {
    await this.page.getByRole("link", { name: /shopping cart/i }).last().click();
  }
}