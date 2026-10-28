import { test, expect } from "../../fixtures/pageFixtures";

const email = process.env.APP_EMAIL;
const password = process.env.APP_PASSWORD;

if (!email || !password) {
  throw new Error("APP_EMAIL and APP_PASSWORD must be configured for the valid-login test.");
}

test("Valid login flow @master @sanity @regression @web", async ({
  homePage,
  loginPage,
  accountPage,
}) => {
  await test.step("1) Open the application and navigate to customer login", async () => {
    expect(await homePage.isStoreVisible()).toBeTruthy();
    await homePage.openAccountMenu();
    await homePage.clickLogin();
    expect(await loginPage.isLoginFormVisible()).toBeTruthy();
  });

  await test.step("2) Log in with the configured valid customer credentials", async () => {
    await loginPage.login(email, password);
    expect(await accountPage.isDashboardVisible()).toBeTruthy();
  });

  await test.step("3) Verify authenticated account navigation", async () => {
    await homePage.openAccountMenu();
    expect(await homePage.isLogoutOptionVisible()).toBeTruthy();
  });

  console.log("✅ Completed the OpenCart valid login flow successfully.");
});