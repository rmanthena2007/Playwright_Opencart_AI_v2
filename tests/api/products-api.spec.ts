import { test, expect } from "@playwright/test";
import Ajv from "ajv";
import dotenv from "dotenv";
import { Routes } from "../../api/endpoints/routes";
import { DataProvider } from "../../utils/DataReader";
import { RandomDataUtil } from "../../utils/dataGenerator";

dotenv.config({ override: true, quiet: true });

const BASE_URL = process.env.API_BASE_URL ?? Routes.BASE_URL;
const PRODUCT_ID = Number(process.env.PRODUCT_ID ?? 1);
const LIMIT = Number(process.env.LIMIT ?? 3);
const CATEGORY = "electronics";

type Product = {
  id: number;
  title: string;
  price: number;
  description: string;
  image: string;
  category: string;
};

test.describe("FakeStore Products API Tests", () => {
  test("GET - All products @master @sanity @api", async ({ request }) => {
    const response = await request.get(`${BASE_URL}${Routes.GET_ALL_PRODUCTS}`);
    expect(response.status(), "Getting products should return HTTP 200.").toBe(200);

    const products = (await response.json()) as Product[];
    expect(Array.isArray(products), "The products response should be an array.").toBeTruthy();
    expect(products.length, "The products response should not be empty.").toBeGreaterThan(0);
    for (const product of products) {
      expect(typeof product.id, "Each product ID should be numeric.").toBe("number");
      expect(typeof product.title, "Each product should have a title.").toBe("string");
      expect(typeof product.price, "Each product price should be numeric.").toBe("number");
      expect(typeof product.category, "Each product should have a category.").toBe("string");
      expect(typeof product.image, "Each product should have an image URL.").toBe("string");
    }
  });

  test("GET - Product by ID @master @sanity @api", async ({ request }) => {
    const route = Routes.GET_PRODUCT_BY_ID.replace("{id}", String(PRODUCT_ID));
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), "Getting a product by ID should return HTTP 200.").toBe(200);

    const product = (await response.json()) as Product;
    expect(product.id, "The returned product ID should match the requested ID.").toBe(PRODUCT_ID);
    expect(product.title.length, "The product title should not be empty.").toBeGreaterThan(0);
    expect(typeof product.price, "The product price should be numeric.").toBe("number");
    expect(product.category.length, "The product category should not be empty.").toBeGreaterThan(0);
    expect(product.image.length, "The product image URL should not be empty.").toBeGreaterThan(0);
  });

  test("GET - Products with limit @master @regression @api", async ({ request }) => {
    const route = Routes.GET_PRODUCTS_WITH_LIMIT.replace("{limit}", String(LIMIT));
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), "The limited product request should return HTTP 200.").toBe(200);

    const products = (await response.json()) as Product[];
    expect(Array.isArray(products), "The limited product response should be an array.").toBeTruthy();
    expect(products.length, "The response count should match the configured limit.").toBe(LIMIT);
  });

  test("GET - Products sorted ascending @master @regression @api", async ({ request }) => {
    const route = Routes.GET_PRODUCTS_SORTED.replace("{order}", "asc");
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), "Ascending product sort should return HTTP 200.").toBe(200);

    const products = (await response.json()) as Product[];
    const ids = products.map((product) => product.id);
    expect(ids.length, "The sorted product response should not be empty.").toBeGreaterThan(0);
    expect(ids, "Product IDs should be in ascending order.").toEqual([...ids].sort((a, b) => a - b));
  });

  test("GET - Products sorted descending @master @regression @api", async ({ request }) => {
    const route = Routes.GET_PRODUCTS_SORTED.replace("{order}", "desc");
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), "Descending product sort should return HTTP 200.").toBe(200);

    const products = (await response.json()) as Product[];
    const ids = products.map((product) => product.id);
    expect(ids.length, "The sorted product response should not be empty.").toBeGreaterThan(0);
    expect(ids, "Product IDs should be in descending order.").toEqual([...ids].sort((a, b) => b - a));
  });

  test("GET - All product categories @master @sanity @api", async ({ request }) => {
    const response = await request.get(`${BASE_URL}${Routes.GET_ALL_CATEGORIES}`);
    expect(response.status(), "Getting product categories should return HTTP 200.").toBe(200);

    const categories = (await response.json()) as string[];
    expect(Array.isArray(categories), "The category response should be an array.").toBeTruthy();
    expect(categories.length, "The category response should not be empty.").toBeGreaterThan(0);
  });

  test("GET - Products by category @master @regression @api", async ({ request }) => {
    const route = Routes.GET_PRODUCTS_BY_CATEGORY.replace("{category}", CATEGORY);
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), "Getting products by category should return HTTP 200.").toBe(200);

    const products = (await response.json()) as Product[];
    expect(Array.isArray(products), "The category products response should be an array.").toBeTruthy();
    for (const product of products) {
      expect(product.category, "Every returned product should match the requested category.").toBe(CATEGORY);
    }
  });

  test("POST - Create product @master @regression @api", async ({ request }) => {
    const payload = RandomDataUtil.generateProductPayload();
    const response = await request.post(`${BASE_URL}${Routes.CREATE_PRODUCT}`, { data: payload });
    expect(response.status(), "Creating a product should return HTTP 201.").toBe(201);

    const created = (await response.json()) as Product;
    expect(typeof created.id, "The created product should include an ID.").toBe("number");
    expect(created.title, "The created title should match the submitted title.").toBe(payload.title);
    expect(created.price, "The created price should match the submitted price.").toBe(payload.price);
    expect(created.description, "The created description should match the submitted description.").toBe(
      payload.description,
    );
    expect(created.image, "The created image should match the submitted image.").toBe(payload.image);
    expect(created.category, "The created category should match the submitted category.").toBe(payload.category);
  });

  test("PUT - Update product @master @regression @api", async ({ request }) => {
    const payload = RandomDataUtil.generateUpdatedProductPayload();
    const route = Routes.UPDATE_PRODUCT.replace("{id}", String(PRODUCT_ID));
    const response = await request.put(`${BASE_URL}${route}`, { data: payload });
    expect(response.status(), "Updating a product should return HTTP 200.").toBe(200);

    const updated = (await response.json()) as Product;
    expect(updated.id, "The updated product ID should match the requested ID.").toBe(PRODUCT_ID);
    expect(updated.title, "The response should contain the updated product title.").toBe(payload.title);
    expect(updated.price, "The response should contain the updated product price.").toBe(payload.price);
    expect(updated.description, "The response should contain the updated description.").toBe(payload.description);
  });

  test("DELETE - Product @master @regression @api", async ({ request }) => {
    const route = Routes.DELETE_PRODUCT.replace("{id}", String(PRODUCT_ID));
    const response = await request.delete(`${BASE_URL}${route}`);
    expect(response.status(), "Deleting a product should return HTTP 200.").toBe(200);
  });

  test("GET - Product response schema @master @regression @api", async ({ request }) => {
    const route = Routes.GET_PRODUCT_BY_ID.replace("{id}", String(PRODUCT_ID));
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), "The product schema request should return HTTP 200.").toBe(200);

    const product = await response.json();
    const schema = DataProvider.readJson("api/schemas/product_api_schema.json");
    const validate = new Ajv({ allErrors: true }).compile(schema);
    const isValid = validate(product);
    expect(isValid, `Product schema errors: ${JSON.stringify(validate.errors)}`).toBeTruthy();
  });

  test("CRUD workflow - Create, update, and delete product @master @regression @api", async ({ request }) => {
    const payload = RandomDataUtil.generateProductPayload();
    const createResponse = await request.post(`${BASE_URL}${Routes.CREATE_PRODUCT}`, { data: payload });
    expect(createResponse.status(), "Workflow product creation should return HTTP 201.").toBe(201);

    const created = (await createResponse.json()) as Product;
    expect(typeof created.id, "The workflow should capture the created product ID.").toBe("number");

    const updatePayload = RandomDataUtil.generateUpdatedProductPayload();
    const updateRoute = Routes.UPDATE_PRODUCT.replace("{id}", String(created.id));
    const updateResponse = await request.put(`${BASE_URL}${updateRoute}`, { data: updatePayload });
    expect(updateResponse.status(), "Workflow product update should return HTTP 200.").toBe(200);

    const updated = (await updateResponse.json()) as Product;
    expect(updated.id, "The update should use the ID returned by create.").toBe(created.id);
    expect(updated.title, "The workflow response should contain the updated title.").toBe(updatePayload.title);

    const deleteRoute = Routes.DELETE_PRODUCT.replace("{id}", String(created.id));
    const deleteResponse = await request.delete(`${BASE_URL}${deleteRoute}`);
    expect(deleteResponse.status(), "Workflow product deletion should return HTTP 200.").toBe(200);
  });
});