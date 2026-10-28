import { test, expect } from "../../fixtures/pageFixtures";
import { Helper } from "../../utils/helper";

test("Add product to cart flow @master @sanity @regression @web", async ({
  homePage,
  searchResultsPage,
  productPage,
  cartPage,
}) => {
  const { productName, productQuantity, totalPrice } = Helper.getProductDetails();

  await test.step("1) Search for the known product and open its details", async () => {
    expect(await homePage.isStoreVisible()).toBeTruthy();
    await homePage.searchProduct(productName);
    expect(await searchResultsPage.isSearchResultsPageVisible(productName)).toBeTruthy();
    expect(await searchResultsPage.isProductVisible(productName)).toBeTruthy();
    await searchResultsPage.openProduct(productName);
    expect(await productPage.isProductDetailsVisible(productName, totalPrice)).toBeTruthy();
  });

  await test.step("2) Add the product to the cart with the requested quantity", async () => {
    await productPage.addToCart(productQuantity);
    expect(await productPage.isAddedToCartMessageVisible(productName)).toBeTruthy();
  });

  await test.step("3) Verify the product and quantity in the shopping cart", async () => {
    await productPage.openShoppingCart();
    expect(await cartPage.isProductPresent(productName)).toBeTruthy();
    expect(await cartPage.getProductQuantity(productName)).toBe(productQuantity);
  });

  console.log("✅ Completed the OpenCart add-product-to-cart flow successfully.");
});