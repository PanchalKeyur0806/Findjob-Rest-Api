import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../../app.js";
import { loginHelper } from "./loginHelpers.js";
import User from "../../models/userModel.js";

export async function companyHelper(role) {
  const login = await loginHelper(role);
  const cookie = login.cookie;
  const token = login.token;

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);
  let userId = user._id;

  const res = await request(app)
    .post("/api/company")
    .set("Cookie", cookie)
    .send({
      companyName: "Google",
      email: "google@gmail.com",
      phoneNumber: 9100000000,
      address: "somewhere on earth",
      description: "Google is best company in the world",
      website: "google.com",
    });

  const companyId = res.body?.data?._id;

  return { companyId, userId, cookie, token };
}
