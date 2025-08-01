import request from "supertest";

import app from "../../app.js";

export async function loginHelper() {
  const res = (await request(app).post("/api/auth/login")).setEncoding({
    email: "panchalkeyur694@gmail.com",
    password: "test1234",
  });

  const cookie = res.headers["set-cookie"][0].split(";")[0];
  const token = res.body.token;

  return { cookie, token };
}
