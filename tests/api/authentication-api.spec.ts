import { test, expect } from "@playwright/test";
import dotenv from "dotenv";
import { Routes } from "../../api/endpoints/routes";
import { RandomDataUtil } from "../../utils/dataGenerator";

dotenv.config({ override: true, quiet: true });

const BASE_URL = process.env.API_BASE_URL ?? Routes.BASE_URL;
const USERNAME = process.env.USERNAME;
const PASSWORD = process.env.PASSWORD;

if (!USERNAME || !PASSWORD) {
  throw new Error("USERNAME and PASSWORD must be configured in .env for FakeStore API authentication.");
}

test.describe("FakeStore Authentication API Tests", () => {
  test("POST - Successful login @master @sanity @api", async ({ request }) => {
    const response = await request.post(`${BASE_URL}${Routes.AUTH_LOGIN}`, {
      data: { username: USERNAME, password: PASSWORD },
    });

    expect(response.status(), "Successful authentication should return HTTP 201.").toBe(201);

    const responseBody = await response.json();
    expect(typeof responseBody.token, "The authentication token should be a string.").toBe("string");
    expect(responseBody.token.length, "The authentication token should not be empty.").toBeGreaterThan(0);
  });

  test("POST - Invalid login @master @regression @api", async ({ request }) => {
    const payload = RandomDataUtil.generateInvalidLoginPayload();
    const response = await request.post(`${BASE_URL}${Routes.AUTH_LOGIN}`, { data: payload });

    expect(response.status(), "Invalid authentication should return HTTP 401.").toBe(401);
    expect(await response.text(), "The API should return its documented invalid-credentials error.").toBe(
      "username or password is incorrect",
    );
  });
});