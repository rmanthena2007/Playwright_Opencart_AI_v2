import { test, expect } from "../../fixtures/pageFixtures";

const email = process.env.APP_EMAIL;
const password = process.env.APP_PASSWORD;

if (!email || !password) {
  throw new Error("APP_EMAIL and APP_PASSWORD must be configured for the logout test.");
}

test("Logout flow @master @sanity @regression @web", async ({
  homePage,
  loginPage,
  accountPage,
  logoutPage,
}) => {
  await test.step("1) Open the application and log in with valid credentials", async () => {
    expect(await homePage.isStoreVisible()).toBeTruthy();
    await homePage.openAccountMenu();
    await homePage.clickLogin();
    expect(await loginPage.isLoginFormVisible()).toBeTruthy();
    await loginPage.login(email, password);
    expect(await accountPage.isDashboardVisible()).toBeTruthy();
  });

  await test.step("2) Log out and verify the confirmation page", async () => {
    await homePage.openAccountMenu();
    expect(await homePage.isLogoutOptionVisible()).toBeTruthy();
    await homePage.clickLogout();
    expect(await logoutPage.isLogoutConfirmed()).toBeTruthy();
  });

  await test.step("3) Continue to the storefront and verify logout", async () => {
    await logoutPage.continueToStore();
    expect(await homePage.isStoreVisible()).toBeTruthy();
    await homePage.openAccountMenu();
    expect(await homePage.isLoginOptionVisible()).toBeTruthy();
    expect(await homePage.isLogoutOptionVisible()).toBeFalsy();
  });

  console.log("✅ Completed the OpenCart logout flow successfully.");
});