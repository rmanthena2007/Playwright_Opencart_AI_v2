import { Locator, Page } from "@playwright/test";

export class SearchResultsPage {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Checks whether the results page displays the expected search heading.
   * @param searchTerm - Term submitted to the product search
   */
  async isSearchResultsPageVisible(searchTerm: string): Promise<boolean> {
    return this.page
      .getByRole("heading", { name: `Search - ${searchTerm}`, exact: true, level: 1 })
      .isVisible();
  }

  /**
   * Checks whether a product appears in the search results.
   * @param productName - Product name to find
   */
  async isProductVisible(productName: string): Promise<boolean> {
    return this.page.getByRole("link", { name: productName, exact: true }).last().isVisible();
  }

  /**
   * Opens the exact matching product from the search results.
   * @param productName - Product name to open
   */
  async openProduct(productName: string): Promise<void> {
    await this.page.getByRole("link", { name: productName, exact: true }).last().click();
  }
}