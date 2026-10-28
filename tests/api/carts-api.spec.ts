import { test, expect } from "@playwright/test";
import Ajv from "ajv";
import dotenv from "dotenv";
import { Routes } from "../../api/endpoints/routes";
import { DataProvider } from "../../utils/DataReader";
import { RandomDataUtil } from "../../utils/dataGenerator";

dotenv.config({ override: true, quiet: true });

const BASE_URL = process.env.API_BASE_URL ?? Routes.BASE_URL;
const USER_ID = Number(process.env.USER_ID ?? 1);
const CART_ID = Number(process.env.CART_ID ?? 1);
const LIMIT = Number(process.env.LIMIT ?? 3);
const START_DATE = process.env.START_DATE ?? "2019-12-10";
const END_DATE = process.env.END_DATE ?? "2020-10-10";

type CartProduct = { productId: number; quantity: number };
type Cart = { id: number; userId: number; date: string; products: CartProduct[] };

test.describe("FakeStore Carts API Tests", () => {
  test("GET - All carts @master @sanity @api", async ({ request }) => {
    const response = await request.get(`${BASE_URL}${Routes.GET_ALL_CARTS}`);
    expect(response.status(), "Getting carts should return HTTP 200.").toBe(200);

    const carts = (await response.json()) as Cart[];
    expect(Array.isArray(carts), "The carts response should be an array.").toBeTruthy();
    expect(carts.length, "The carts response should not be empty.").toBeGreaterThan(0);
  });

  test("GET - Cart by ID @master @sanity @api", async ({ request }) => {
    const route = Routes.GET_CART_BY_ID.replace("{id}", String(CART_ID));
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), "Getting a cart by ID should return HTTP 200.").toBe(200);

    const cart = (await response.json()) as Cart;
    expect(cart.id, "The returned cart ID should match the requested ID.").toBe(CART_ID);
  });

  test("GET - Carts by date range @master @regression @api", async ({ request }) => {
    const route = Routes.GET_CARTS_BY_DATE_RANGE.replace("{startdate}", START_DATE).replace(
      "{enddate}",
      END_DATE,
    );
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), "Filtering carts by date range should return HTTP 200.").toBe(200);

    const carts = (await response.json()) as Cart[];
    expect(Array.isArray(carts), "The date-range response should be an array.").toBeTruthy();
    for (const cart of carts) {
      const cartDate = Date.parse(cart.date);
      expect(cartDate, "Each cart should contain a valid date.").not.toBeNaN();
      expect(cartDate, "Each cart date should be on or after the configured start date.").toBeGreaterThanOrEqual(
        Date.parse(START_DATE),
      );
      expect(cartDate, "Each cart date should be on or before the configured end date.").toBeLessThanOrEqual(
        Date.parse(END_DATE),
      );
    }
  });

  test("GET - Carts by user @master @regression @api", async ({ request }) => {
    const route = Routes.GET_USER_CART.replace("{userId}", String(USER_ID));
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), "Getting carts by user should return HTTP 200.").toBe(200);

    const carts = (await response.json()) as Cart[];
    expect(Array.isArray(carts), "The user carts response should be an array.").toBeTruthy();
    for (const cart of carts) {
      expect(cart.userId, "Each returned cart should belong to the requested user.").toBe(USER_ID);
    }
  });

  test("GET - Carts with limit @master @regression @api", async ({ request }) => {
    const route = Routes.GET_CARTS_WITH_LIMIT.replace("{limit}", String(LIMIT));
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), "The limited carts request should return HTTP 200.").toBe(200);

    const carts = (await response.json()) as Cart[];
    expect(Array.isArray(carts), "The limited carts response should be an array.").toBeTruthy();
    expect(carts.length, "The response count should match the configured limit.").toBe(LIMIT);
  });

  test("GET - Carts sorted ascending @master @regression @api", async ({ request }) => {
    const route = Routes.GET_CARTS_SORTED.replace("{order}", "asc");
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), "Ascending cart sort should return HTTP 200.").toBe(200);

    const carts = (await response.json()) as Cart[];
    const ids = carts.map((cart) => cart.id);
    expect(ids.length, "The sorted cart response should not be empty.").toBeGreaterThan(0);
    expect(ids, "Cart IDs should be in ascending order.").toEqual([...ids].sort((a, b) => a - b));
  });

  test("GET - Carts sorted descending @master @regression @api", async ({ request }) => {
    const route = Routes.GET_CARTS_SORTED.replace("{order}", "desc");
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), "Descending cart sort should return HTTP 200.").toBe(200);

    const carts = (await response.json()) as Cart[];
    const ids = carts.map((cart) => cart.id);
    expect(ids.length, "The sorted cart response should not be empty.").toBeGreaterThan(0);
    expect(ids, "Cart IDs should be in descending order.").toEqual([...ids].sort((a, b) => b - a));
  });

  test("POST - Create cart @master @regression @api", async ({ request }) => {
    const payload = RandomDataUtil.generateCartPayload(USER_ID);
    const response = await request.post(`${BASE_URL}${Routes.CREATE_CART}`, { data: payload });
    expect(response.status(), "Creating a cart should return HTTP 201.").toBe(201);

    const created = (await response.json()) as Cart;
    expect(typeof created.id, "The created cart should include an ID.").toBe("number");
    expect(created.userId, "The created cart should contain the submitted user ID.").toBe(payload.userId);
    expect(created.products, "The created cart should contain the submitted products.").toEqual(payload.products);
  });

  test("PUT - Update cart @master @regression @api", async ({ request }) => {
    const getRoute = Routes.GET_CART_BY_ID.replace("{id}", String(CART_ID));
    const existingResponse = await request.get(`${BASE_URL}${getRoute}`);
    expect(existingResponse.status(), "The existing cart should be retrievable before update.").toBe(200);
    const existing = (await existingResponse.json()) as Cart;

    const payload = RandomDataUtil.generateUpdatedCartPayload(USER_ID);
    payload.products[0].productId = existing.products[0].productId;
    payload.products[0].quantity = existing.products[0].quantity + 1;
    const updateRoute = Routes.UPDATE_CART.replace("{id}", String(CART_ID));
    const response = await request.put(`${BASE_URL}${updateRoute}`, { data: payload });
    expect(response.status(), "Updating a cart should return HTTP 200.").toBe(200);

    const updated = (await response.json()) as Cart;
    expect(updated.userId, "The updated cart should preserve the requested user ID.").toBe(USER_ID);
    expect(updated.products[0].quantity, "The cart response should reflect the changed product quantity.").toBe(
      existing.products[0].quantity + 1,
    );
  });

  test("DELETE - Cart @master @regression @api", async ({ request }) => {
    const route = Routes.DELETE_CART.replace("{id}", String(CART_ID));
    const response = await request.delete(`${BASE_URL}${route}`);
    expect(response.status(), "Deleting a cart should return HTTP 200.").toBe(200);
  });

  test("GET - Cart response schema @master @regression @api", async ({ request }) => {
    const route = Routes.GET_CART_BY_ID.replace("{id}", String(CART_ID));
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), "The cart schema request should return HTTP 200.").toBe(200);

    const cart = await response.json();
    const schema = DataProvider.readJson("api/schemas/cart_api_schema.json");
    const validate = new Ajv({ allErrors: true }).compile(schema);
    const isValid = validate(cart);
    expect(isValid, `Cart schema errors: ${JSON.stringify(validate.errors)}`).toBeTruthy();
  });

  test("CRUD workflow - Create, update, and delete cart @master @regression @api", async ({ request }) => {
    const payload = RandomDataUtil.generateCartPayload(USER_ID);
    const createResponse = await request.post(`${BASE_URL}${Routes.CREATE_CART}`, { data: payload });
    expect(createResponse.status(), "Workflow cart creation should return HTTP 201.").toBe(201);

    const created = (await createResponse.json()) as Cart;
    expect(typeof created.id, "The workflow should capture the created cart ID.").toBe("number");
    expect(created.userId, "The created cart should preserve the submitted user ID.").toBe(payload.userId);
    expect(created.products, "The created cart should contain the submitted products.").toEqual(payload.products);

    const updatePayload = RandomDataUtil.generateUpdatedCartPayload(USER_ID);
    updatePayload.products[0].productId = created.products[0].productId;
    updatePayload.products[0].quantity = created.products[0].quantity + 1;
    const updateRoute = Routes.UPDATE_CART.replace("{id}", String(created.id));
    const updateResponse = await request.put(`${BASE_URL}${updateRoute}`, { data: updatePayload });
    expect(updateResponse.status(), "Workflow cart update should return HTTP 200.").toBe(200);

    const updated = (await updateResponse.json()) as Cart;
    expect(updated.userId, "The update should preserve the cart's user ID.").toBe(USER_ID);
    expect(updated.products[0].quantity, "The workflow should return the updated quantity.").toBe(
      created.products[0].quantity + 1,
    );

    const deleteRoute = Routes.DELETE_CART.replace("{id}", String(created.id));
    const deleteResponse = await request.delete(`${BASE_URL}${deleteRoute}`);
    expect(deleteResponse.status(), "Workflow cart deletion should return HTTP 200.").toBe(200);
  });
});