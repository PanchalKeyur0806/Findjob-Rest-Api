import request from "supertest";
import jwt from "jsonwebtoken";

import app from "../../app.js";

export async function loginHelper() {
  await request(app).post("/api/auth/register").send({
    name: "Keyur Panchal",
    email: "panchalkeyur694@gmail.com",
    password: "test1234",
    dateOfBirth: "2025-7-18",
    phoneNumber: 9106450963,
  });

  await request(app).post("/api/auth/verifyotp").send({ otp: "123456" });

  const res = await request(app).post("/api/auth/login").send({
    email: "panchalkeyur694@gmail.com",
    password: "test1234",
  });

  const cookie = res.headers["set-cookie"][0].split(";")[0];
  const token = res.body.token;

  return { cookie, token };
}
