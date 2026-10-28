import { test, expect } from "../../fixtures/pageFixtures";
import { DataProvider } from "../../utils/DataReader";

const loginData = DataProvider.readJson("testdata/opencart_logindata.json");
const invalidCredentials = loginData.find(
  (record: { expected: string; email: string; password: string }) =>
    record.expected === "failure" && record.email.trim() !== "" && record.password.trim() !== "",
);

if (!invalidCredentials) {
  throw new Error("No nonblank invalid customer credentials were found in the login test data.");
}

test("Invalid login flow @master @sanity @regression @web", async ({ homePage, loginPage }) => {
  await test.step("1) Open the application and navigate to customer login", async () => {
    expect(await homePage.isStoreVisible()).toBeTruthy();
    await homePage.openAccountMenu();
    await homePage.clickLogin();
    expect(await loginPage.isLoginFormVisible()).toBeTruthy();
  });

  await test.step("2) Submit invalid customer credentials", async () => {
    await loginPage.login(invalidCredentials.email, invalidCredentials.password);
    expect(await loginPage.isLoginWarningVisible()).toBeTruthy();
    expect(await loginPage.isLoginFormVisible()).toBeTruthy();
  });

  await test.step("3) Verify the customer remains unauthenticated", async () => {
    await homePage.openAccountMenu();
    expect(await homePage.isLogoutOptionVisible()).toBeFalsy();
  });

  console.log("✅ Completed the OpenCart invalid login flow successfully.");
});