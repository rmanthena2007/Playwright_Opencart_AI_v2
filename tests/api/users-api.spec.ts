import { test, expect } from "@playwright/test";
import Ajv from "ajv";
import dotenv from "dotenv";
import { Routes } from "../../api/endpoints/routes";
import { DataProvider } from "../../utils/DataReader";
import { RandomDataUtil } from "../../utils/dataGenerator";

dotenv.config({ override: true, quiet: true });

const BASE_URL = process.env.API_BASE_URL ?? Routes.BASE_URL;
const USER_ID = Number(process.env.USER_ID ?? 1);
const LIMIT = Number(process.env.LIMIT ?? 3);

type User = {
  id: number;
  email: string;
  username: string;
  name: { firstname: string; lastname: string };
  phone: string;
};

test.describe("FakeStore Users API Tests", () => {
  test("GET - All users @master @sanity @api", async ({ request }) => {
    const response = await request.get(`${BASE_URL}${Routes.GET_ALL_USERS}`);
    expect(response.status(), "Getting users should return HTTP 200.").toBe(200);

    const users = (await response.json()) as User[];
    expect(Array.isArray(users), "The users response should be an array.").toBeTruthy();
    expect(users.length, "The users response should not be empty.").toBeGreaterThan(0);
    for (const user of users) {
      expect(typeof user.id, "Each user ID should be numeric.").toBe("number");
      expect(typeof user.email, "Each user should have an email.").toBe("string");
      expect(typeof user.username, "Each user should have a username.").toBe("string");
    }
  });

  test("GET - User by ID @master @sanity @api", async ({ request }) => {
    const route = Routes.GET_USER_BY_ID.replace("{id}", String(USER_ID));
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), "Getting a user by ID should return HTTP 200.").toBe(200);

    const user = (await response.json()) as User;
    expect(user.id, "The returned user ID should match the requested ID.").toBe(USER_ID);
  });

  test("GET - Users with limit @master @regression @api", async ({ request }) => {
    const route = Routes.GET_USERS_WITH_LIMIT.replace("{limit}", String(LIMIT));
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), "The limited users request should return HTTP 200.").toBe(200);

    const users = (await response.json()) as User[];
    expect(Array.isArray(users), "The limited users response should be an array.").toBeTruthy();
    expect(users.length, "The response count should match the configured limit.").toBe(LIMIT);
  });

  test("GET - Users sorted ascending @master @regression @api", async ({ request }) => {
    const route = Routes.GET_USERS_SORTED.replace("{order}", "asc");
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), "Ascending user sort should return HTTP 200.").toBe(200);

    const users = (await response.json()) as User[];
    const ids = users.map((user) => user.id);
    expect(ids.length, "The sorted user response should not be empty.").toBeGreaterThan(0);
    expect(ids, "User IDs should be in ascending order.").toEqual([...ids].sort((a, b) => a - b));
  });

  test("GET - Users sorted descending @master @regression @api", async ({ request }) => {
    const route = Routes.GET_USERS_SORTED.replace("{order}", "desc");
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), "Descending user sort should return HTTP 200.").toBe(200);

    const users = (await response.json()) as User[];
    const ids = users.map((user) => user.id);
    expect(ids.length, "The sorted user response should not be empty.").toBeGreaterThan(0);
    expect(ids, "User IDs should be in descending order.").toEqual([...ids].sort((a, b) => b - a));
  });

  test("POST - Create user @master @regression @api", async ({ request }) => {
    const payload = RandomDataUtil.generateUserPayload();
    const response = await request.post(`${BASE_URL}${Routes.CREATE_USER}`, { data: payload });
    expect(response.status(), "Creating a user should return HTTP 201.").toBe(201);

    const created = (await response.json()) as { id: number };
    expect(typeof created.id, "The created user should include an ID.").toBe("number");
  });

  test("PUT - Update user @master @regression @api", async ({ request }) => {
    const payload = RandomDataUtil.generateUserUpdatePayload();
    const route = Routes.UPDATE_USER.replace("{id}", String(USER_ID));
    const response = await request.put(`${BASE_URL}${route}`, { data: payload });
    expect(response.status(), "Updating a user should return HTTP 200.").toBe(200);

    const updated = await response.json();
    expect(updated.username, "The response should contain the updated username.").toBe(payload.username);
    expect(updated.email, "The response should contain the submitted email.").toBe(payload.email);
    expect(updated.name.firstname, "The response should contain the submitted first name.").toBe(
      payload.name.firstname,
    );
  });

  test("DELETE - User @master @regression @api", async ({ request }) => {
    const route = Routes.DELETE_USER.replace("{id}", String(USER_ID));
    const response = await request.delete(`${BASE_URL}${route}`);
    expect(response.status(), "Deleting a user should return HTTP 200.").toBe(200);
  });

  test("GET - User response schema @master @regression @api", async ({ request }) => {
    const route = Routes.GET_USER_BY_ID.replace("{id}", String(USER_ID));
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), "The user schema request should return HTTP 200.").toBe(200);

    const user = await response.json();
    const schema = DataProvider.readJson("api/schemas/user_api_schema.json");
    const validate = new Ajv({ allErrors: true }).compile(schema);
    const isValid = validate(user);
    expect(isValid, `User schema errors: ${JSON.stringify(validate.errors)}`).toBeTruthy();
  });

  test("CRUD workflow - Create, update, and delete user @master @regression @api", async ({ request }) => {
    const payload = RandomDataUtil.generateUserPayload();
    const createResponse = await request.post(`${BASE_URL}${Routes.CREATE_USER}`, { data: payload });
    expect(createResponse.status(), "Workflow user creation should return HTTP 201.").toBe(201);

    const created = (await createResponse.json()) as User;
    expect(typeof created.id, "The workflow should capture the created user ID.").toBe("number");

    const updatePayload = RandomDataUtil.generateUserUpdatePayload();
    const updateRoute = Routes.UPDATE_USER.replace("{id}", String(created.id));
    const updateResponse = await request.put(`${BASE_URL}${updateRoute}`, { data: updatePayload });
    expect(updateResponse.status(), "Workflow user update should return HTTP 200.").toBe(200);

    const updated = await updateResponse.json();
    expect(updated.username, "The workflow update should return the updated username.").toBe(updatePayload.username);
    expect(updated.email, "The workflow update should return the updated email.").toBe(updatePayload.email);

    const deleteRoute = Routes.DELETE_USER.replace("{id}", String(created.id));
    const deleteResponse = await request.delete(`${BASE_URL}${deleteRoute}`);
    expect(deleteResponse.status(), "Workflow user deletion should return HTTP 200.").toBe(200);
  });
});