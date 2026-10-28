import { test, expect } from "../../fixtures/pageFixtures";
import { Helper } from "../../utils/helper";

test("Product search flow @master @sanity @regression @web", async ({ homePage, searchResultsPage }) => {
  const { productName } = Helper.getProductDetails();

  await test.step("1) Open the application and search for the known product", async () => {
    expect(await homePage.isStoreVisible()).toBeTruthy();
    await homePage.searchProduct(productName);
  });

  await test.step("2) Verify the results page and exact matching product", async () => {
    expect(await searchResultsPage.isSearchResultsPageVisible(productName)).toBeTruthy();
    expect(await searchResultsPage.isProductVisible(productName)).toBeTruthy();
  });

  console.log("✅ Completed the OpenCart product search flow successfully.");
});