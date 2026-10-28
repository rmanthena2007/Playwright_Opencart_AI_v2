import { test, expect } from "../../fixtures/pageFixtures";
import { RandomDataUtil } from "../../utils/dataGenerator";

test("User registration flow @master @sanity @regression @web", async ({
  homePage,
  registerPage,
  accountPage,
}) => {
  const generatedEmail = RandomDataUtil.getEmail();
  const [emailName, emailDomain] = generatedEmail.split("@");
  const customer = {
    firstName: RandomDataUtil.getFirstName(),
    lastName: RandomDataUtil.getLastName(),
    email: `${emailName}+${Date.now()}@${emailDomain}`,
    telephone: RandomDataUtil.getPhoneNumber(),
    password: RandomDataUtil.getPassword(12),
  };

  await test.step("1) Open the application and navigate to registration", async () => {
    expect(await homePage.isStoreVisible()).toBeTruthy();
    await homePage.openAccountMenu();
    await homePage.clickRegister();
    expect(await registerPage.isRegistrationFormVisible()).toBeTruthy();
  });

  await test.step("2) Register a new customer and verify the confirmation", async () => {
    await registerPage.register(customer);
    expect(await registerPage.isAccountCreated()).toBeTruthy();
  });

  await test.step("3) Verify the new account is available through account navigation", async () => {
    await registerPage.continueToAccount();
    expect(await accountPage.isDashboardVisible()).toBeTruthy();
    await homePage.openAccountMenu();
    expect(await homePage.isLogoutOptionVisible()).toBeTruthy();
  });

  console.log("✅ Completed the OpenCart user registration flow successfully.");
});