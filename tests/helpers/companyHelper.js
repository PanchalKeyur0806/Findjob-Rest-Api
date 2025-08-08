import { fileURLToPath } from "url";
import path from "path";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../../app.js";
import { loginHelper } from "./loginHelpers.js";
import User from "../../models/userModel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const img = path.join(__dirname + "\\.." + "\\assets" + "\\test-img.png");

export async function companyHelper(role) {
  let random = Math.floor(Math.random() * 10000);
  let randomNumber = Math.floor(1000000000 + Math.random() * 9000000000);
  let email = `google${random}@gmail.com`;

  const login = await loginHelper(role);
  const cookie = login.cookie;
  const token = login.token;

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);
  let userId = user._id;

  const res = await request(app)
    .post("/api/company")
    .set("Content-Type", "multipart/form-data")
    .set("Cookie", cookie)
    .field("companyName", "Goolge")
    .field("email", `${email}`)
    .field("phoneNumber", `${randomNumber}`)
    .field("address", "Google is best company in the world")
    .field("description", "Google is best company in the world")
    .field("website", "http://www.google.com")
    .attach("companyLogo", img);

  const companyId = res.body?.data?._id;

  return { companyId, userId, cookie, token };
}
