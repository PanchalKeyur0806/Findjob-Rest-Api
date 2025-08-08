import { fileURLToPath } from "url";
import path from "path";
import request from "supertest";
import { afterAll, beforeAll, describe, expect } from "vitest";
import jwt from "jsonwebtoken";

import app from "../app.js";
import Company from "../models/companyModel.js";
import { connectDB, disconnectDB } from "./setup.js";
import { loginHelper } from "./helpers/loginHelpers.js";
import User from "../models/userModel.js";

let cookie;
let token;
let companyId;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const img = path.join(__dirname, "\\assets", "\\test-img.png");

beforeAll(async () => {
  await connectDB();

  const login = await loginHelper("recruiter");

  cookie = login.cookie;
  token = login.token;
});

// return res
async function returnRes() {
  const res = await request(app)
    .post("/api/company")
    .set("Content-Type", "multipart/form-data")
    .set("Cookie", cookie)
    .field("companyName", "Goolge")
    .field("email", "Google@gmail.com")
    .field("phoneNumber", "1234567890")
    .field("address", "Google is best company in the world")
    .field("description", "Google is best company in the world")
    .field("website", "http://www.google.com")
    .attach("companyLogo", img);

  return res;
}

// expected outputs
function expectedBody(res) {
  expect(res.body.data).toMatchObject({
    companyName: expect.any(String),
    email: expect.any(String),
    phoneNumber: expect.any(Number),
    address: expect.any(String),
    description: expect.any(String),
    website: expect.any(Array),
  });
}

describe("POST /api/company/", () => {
  it("should create a new company", async () => {
    const res = await returnRes();

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe("success");
    expect(res.body.message).toBe("comapny created");
    expectedBody(res);
    expect(typeof res.body.status).toBe("string");
    expect(typeof res.body.message).toBe("string");
  });

  it("should return an error", async () => {
    const res = await returnRes();
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe("Error");
    expect(res.body).toHaveProperty("message");
  });
});

describe("GET /api/company/:companyId", () => {
  it("should return true", async () => {
    await Company.deleteMany();
    const creteCompany = await returnRes();

    if (!companyId) {
      companyId = creteCompany.body.data._id;
    }

    expect(companyId).toBeDefined();

    const res = await request(app).get(`/api/company/${companyId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body).toHaveProperty("message");
    expectedBody(res);
    expect(typeof res.body.status).toBe("string");
    expect(typeof res.body.message).toBe("string");
  });
});

describe("PATCH /api/company/:companyId", () => {
  it("should return true", async () => {
    const companyCreate = await returnRes();
    if (!companyId) {
      companyId = companyCreate.body.data._id;
    }

    expect(companyId).toBeDefined();

    const res = await request(app)
      .patch(`/api/company/${companyId}`)
      .set("Cookie", cookie)
      .send({ companyName: "Googe Auth" });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body).toHaveProperty("message");
    expectedBody(res);
    expect(typeof res.body.status).toBe("string");
    expect(typeof res.body.message).toBe("string");
  });
});

describe("DELETE /api/company/:companyId", () => {
  it("should return true", async () => {
    const createCompany = await returnRes();
    if (!companyId) {
      companyId = createCompany.body.data._id;
    }

    expect(companyId).toBeDefined();

    const res = await request(app)
      .delete(`/api/company/${companyId}`)
      .set("Cookie", cookie)
      .send({ companyName: "Googe Auth" });

    expect(res.statusCode).toBe(204);
  });
});

afterAll(async () => {
  await Company.deleteMany();
  await disconnectDB();
});
