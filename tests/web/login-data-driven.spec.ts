import { test, expect } from "../../fixtures/pageFixtures";
import { DataProvider } from "../../utils/DataReader";

type LoginTestData = {
	testName?: string;
	TestName?: string;
	email: string;
	password: string;
	expected: "success" | "failure";
};

const loginData = DataProvider.readJson("testdata/opencart_logindata.json") as LoginTestData[];

test.describe("OpenCart data-driven login", () => {
	test.describe.configure({ mode: "serial" });

	for (const [index, row] of loginData.entries()) {
		const emailValue = row.email === "${APP_EMAIL}" ? process.env.APP_EMAIL ?? "" : row.email;
		const passwordValue = row.password === "${APP_PASSWORD}" ? process.env.APP_PASSWORD ?? "" : row.password;
		const email = emailValue.trim() === "" ? "" : emailValue;
		const password = passwordValue.trim() === "" ? "" : passwordValue;
		const testName = row.testName ?? row.TestName ?? `Login data row ${index + 1}`;

		test(`${testName} (${index + 1}) @master @datadriven @web`, async ({
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

			await test.step("2) Submit the credentials from this data row", async () => {
				await loginPage.login(email, password);

				if (row.expected === "success") {
					expect(await accountPage.isDashboardVisible()).toBeTruthy();
					await homePage.openAccountMenu();
					expect(await homePage.isLogoutOptionVisible()).toBeTruthy();
				} else {
					expect(await loginPage.isLoginWarningVisible()).toBeTruthy();
					expect(await loginPage.isLoginFormVisible()).toBeTruthy();
					await homePage.openAccountMenu();
					expect(await homePage.isLogoutOptionVisible()).toBeFalsy();
				}
			});
		});
	}
});
