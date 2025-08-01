import request from "supertest";
import { afterAll, beforeAll, describe, expect } from "vitest";
import mongoose from "mongoose";

import app from "../app.js";
import { connectDB, disconnectDB } from "./setup.js";

beforeAll(async () => {
  await connectDB();
}, 5000);

describe("POST /api/auth/register route", () => {
  it("should register a user and verify otp", async () => {
    await request(app).post("/api/auth/register").send({
      name: "Keyur Panchal",
      email: "panchalkeyur694@gmail.com",
      password: "test1234",
      dateOfBirth: "2025-7-18",
      phoneNumber: 9106450963,
    });

    const res = await request(app)
      .post("/api/auth/verifyotp")
      .send({ otp: "123456" });

    console.log(res);

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe("success");
  });
});

afterAll(async () => {
  await disconnectDB();
}, 5000);
