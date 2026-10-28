import { test, expect } from "../../fixtures/pageFixtures";
import { RandomDataUtil } from "../../utils/dataGenerator";
import { executeQuery } from "../../utils/dbClient";

const adminUsername = process.env.ADMIN_USERNAME;
const adminPassword = process.env.ADMIN_PASSWORD;

if (!adminUsername || !adminPassword) {
  throw new Error("ADMIN_USERNAME and ADMIN_PASSWORD must be configured in .env.");
}

type CustomerRecord = {
  customer_id: number;
  firstname: string;
  lastname: string;
  email: string;
  status: number;
  date_added: Date | string;
};

test("Register customer and validate frontend, admin, and MySQL @master @end-to-end @db @web", async ({
  homePage,
  registerPage,
  adminLoginPage,
  adminCustomersPage,
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

  await test.step("1) Register a unique customer through the frontend", async () => {
    expect(await homePage.isStoreVisible(), "The OpenCart storefront should be visible.").toBeTruthy();
    await homePage.openAccountMenu();
    await homePage.clickRegister();
    expect(await registerPage.isRegistrationFormVisible(), "The registration form should be visible.").toBeTruthy();
    await registerPage.register(customer);
    expect(await registerPage.isAccountCreated(), "OpenCart should confirm account creation.").toBeTruthy();
  });

  await test.step("2) Verify the registered customer in the admin portal", async () => {
    await adminLoginPage.openAdminPortal();
    expect(await adminLoginPage.isLoginFormVisible(), "The admin login form should be visible.").toBeTruthy();
    await adminLoginPage.login(adminUsername, adminPassword);
    await adminCustomersPage.dismissSecurityNotification();
    expect(
      await adminCustomersPage.isCustomersMenuVisible(),
      "The admin Customers navigation should be available after login.",
    ).toBeTruthy();
    await adminCustomersPage.openCustomerList();
    await adminCustomersPage.filterByEmail(customer.email);

    expect(await adminCustomersPage.isCustomerVisible(customer.email), "The new customer should appear in admin.").toBeTruthy();
    const customerRow = await adminCustomersPage.getCustomerRowText(customer.email);
    expect(customerRow, "The admin row should show the generated first name.").toContain(customer.firstName);
    expect(customerRow, "The admin row should show the generated last name.").toContain(customer.lastName);
    expect(customerRow, "The admin row should show the generated email.").toContain(customer.email);
    expect(customerRow, "A newly registered customer should be enabled in admin.").toContain("Enabled");
  });

  await test.step("3) Verify the same customer in MySQL", async () => {
    const [rows] = await executeQuery(
      "SELECT customer_id, firstname, lastname, email, status, date_added FROM oc_customer WHERE email = ?",
      [customer.email],
    );
    const customers = rows as CustomerRecord[];

    expect(customers, "Exactly one database record should match the registered email.").toHaveLength(1);
    expect(customers[0].firstname, "The database first name should match the generated value.").toBe(
      customer.firstName,
    );
    expect(customers[0].lastname, "The database last name should match the generated value.").toBe(
      customer.lastName,
    );
    expect(customers[0].email, "The database email should match the generated value.").toBe(customer.email);
    expect(customers[0].status, "The registered customer should have enabled status.").toBe(1);
    expect(customers[0].date_added, "The customer date_added value should be present.").toBeTruthy();
  });

  console.log("✅ The registered customer matched across the storefront, admin portal, and MySQL.");
});