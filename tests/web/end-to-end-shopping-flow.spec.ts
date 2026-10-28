import { test, expect } from "../../fixtures/pageFixtures";
import { RandomDataUtil } from "../../utils/dataGenerator";
import { Helper } from "../../utils/helper";

test("Customer registration and shopping flow @master @regression @end-to-end @web", async ({
  homePage,
  registerPage,
  loginPage,
  accountPage,
  logoutPage,
  searchResultsPage,
  productPage,
  cartPage,
}) => {
  const product = Helper.getProductDetails();
  const generatedEmail = RandomDataUtil.getEmail();
  const [emailName, emailDomain] = generatedEmail.split("@");
  const customer = {
    firstName: RandomDataUtil.getFirstName(),
    lastName: RandomDataUtil.getLastName(),
    email: `${emailName}+${Date.now()}@${emailDomain}`,
    telephone: RandomDataUtil.getPhoneNumber(),
    password: RandomDataUtil.getPassword(12),
  };

  await test.step("1) Open the storefront and register a new customer", async () => {
    expect(await homePage.isStoreVisible()).toBeTruthy();
    await homePage.openAccountMenu();
    await homePage.clickRegister();
    expect(await registerPage.isRegistrationFormVisible()).toBeTruthy();
    await registerPage.register(customer);
    expect(await registerPage.isAccountCreated()).toBeTruthy();
  });

  await test.step("2) Log out of the newly created account", async () => {
    await registerPage.continueToAccount();
    expect(await accountPage.isDashboardVisible()).toBeTruthy();
    await homePage.openAccountMenu();
    await homePage.clickLogout();
    expect(await logoutPage.isLogoutConfirmed()).toBeTruthy();
    await logoutPage.continueToStore();
    expect(await homePage.isStoreVisible()).toBeTruthy();
    await homePage.openAccountMenu();
    expect(await homePage.isLoginOptionVisible()).toBeTruthy();
    expect(await homePage.isLogoutOptionVisible()).toBeFalsy();
  });

  await test.step("3) Log in with the newly created customer credentials", async () => {
    await homePage.clickLogin();
    await loginPage.login(customer.email, customer.password);
    expect(await accountPage.isDashboardVisible()).toBeTruthy();
  });

  await test.step("4) Search for MacBook and open its product details", async () => {
    await homePage.searchProduct(product.productName);
    expect(await searchResultsPage.isProductVisible(product.productName)).toBeTruthy();
    await searchResultsPage.openProduct(product.productName);
    expect(
      await productPage.isProductDetailsVisible(product.productName, product.totalPrice),
    ).toBeTruthy();
  });

  await test.step("5) Add MacBook to the cart and verify its price and total", async () => {
    await productPage.addToCart(product.productQuantity);
    expect(await productPage.isAddedToCartMessageVisible(product.productName)).toBeTruthy();
    await productPage.openShoppingCart();
    expect(await cartPage.isProductPresent(product.productName)).toBeTruthy();
    expect(await cartPage.getProductQuantity(product.productName)).toBe(product.productQuantity);
    expect(await cartPage.getUnitPrice(product.productName)).toBe(product.totalPrice);
    expect(await cartPage.getLineTotal(product.productName)).toBe(product.totalPrice);
    expect(await cartPage.getCartTotal()).toBe(product.totalPrice);
  });

  console.log("Completed the OpenCart customer shopping flow successfully.");
});