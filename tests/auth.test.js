import request from "supertest";
import { describe, expect, it, afterAll, beforeAll } from "vitest";

import app from "../app.js";
import { connectDB, disconnectDB } from "./setup.js";
import User from "../models/userModel.js";
import UserProfile from "../models/userProfile.js";

let random = Math.floor(Math.random() * 10000);
let email = `panchalkeyur${random}@gmail.com`;

beforeAll(async () => {
  await connectDB();
});

function expectedBody(res) {
  expect(res.body.data).toMatchObject({
    _id: expect.any(String),
    name: expect.any(String),
    email: expect.any(String),
    password: expect.any(String),
    phoneNumber: expect.any(Number),
    dateOfBirth: expect.any(String),
    authProvider: expect.any(String),
    roles: expect.any(String),
    isVerified: expect.any(Boolean),
    __v: expect.any(Number),
  });
}

describe("POST /api/auth/register route", () => {
  // success test
  it("should register a user and verify otp", async () => {
    await request(app).post("/api/auth/register").send({
      name: "Keyur Panchal",
      email: email,
      password: "test1234",
      dateOfBirth: "2025-7-18",
      phoneNumber: 9106450963,
      roles: "candidate",
    });

    const res = await request(app)
      .post("/api/auth/verifyotp")
      .send({ otp: "123456" });

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe("success");
    expectedBody(res);
    expect(res.body).toHaveProperty("message", "User verified successfully");
  });

  //  error test
  it("should failed when request fields are missing", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "keyur Panchal",
      password: "test1234",
      dateOfBirth: "2025-07-18",
      phoneNumber: 9106450963,
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe("Error");
  });

  // should be failed when entering wrong otp
  it("should failed with incorrect otp", async () => {
    const res = await request(app)
      .post("/api/auth/verifyotp")
      .send({ otp: "000000" });

    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe("Error");
  });
});

describe("POST /api/auth/login", () => {
  // success test
  it("login user", async () => {
    const user = await User.findOne({ email: email });
    expect(user.email).toBe(email);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: email, password: "test1234" });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("success");

    // check that if res.body have expected object
    expectedBody(res);

    expect(res.body).toHaveProperty("message", "user is logged in");
    expect(res.body).toHaveProperty("token");
    expect(typeof res.body.data._id).toBe("string");
    expect(typeof res.body.token).toBe("string");
  });

  // errror test
  it("should failed when requested fields are missing", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ password: "test1234" });

    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe("Error");
  });
});

describe("POST /api/auth/forgotpassword", () => {
  // success test
  it("forgotpassword password ", async () => {
    const res = await request(app)
      .post("/api/auth/forgotpassword")
      .send({ email: email });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body).toHaveProperty("message", "email send successfully");
  });

  // error test
  it("should return error if requested fields are missing", async () => {
    const res = await request(app).post("/api/auth/forgotpassword").send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe("Error");
  });
});

// disconnect database
afterAll(async () => {
  await User.deleteMany();
  await disconnectDB();
});
