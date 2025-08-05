import request from "supertest";
import { afterAll, beforeAll, describe, expect } from "vitest";
import jwt from "jsonwebtoken";

import app from "../app.js";
import { connectDB, disconnectDB } from "./setup.js";
import { ClaimModel } from "../models/claimModel.js";
import { companyHelper } from "./helpers/companyHelper.js";
import User from "../models/userModel.js";
import UserProfile from "../models/userProfile.js";
import Company from "../models/companyModel.js";
import { loginHelper } from "./helpers/loginHelpers.js";

let usercookie;
let recruitercookie;
let admincookie;

let companyId;
let claimdId;

beforeAll(async () => {
  await connectDB();

  const data = await companyHelper("recruiter");
  const userdata = await loginHelper("candidate");
  const admindata = await loginHelper("admin");

  let admintoken = admindata.token;
  let decodedadmin = jwt.verify(admintoken, process.env.JWT_SECRET);
  let admin = await User.findById(decodedadmin.id);

  usercookie = userdata.cookie;
  recruitercookie = data.cookie;
  admincookie = admindata.cookie;

  companyId = data.companyId;
});

describe("POST /api/claims/company/:companyId", async () => {
  it("should post an claim", async () => {
    const res = await request(app)
      .post(`/api/claims/company/${companyId}`)
      .set("Cookie", usercookie)
      .send({
        message:
          "You are fraud, you robed me, i paid you 1lakh caror but still i didn't get a job",
      });

    claimdId = res.body.data._id;
    expect(claimdId).toBeDefined();

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe("success");
    expect(res.body).toHaveProperty("message");
    expect(typeof res.body.status).toBe("string");
    expect(typeof res.body.message).toBe("string");
  });

  it("should fail to post a claim", async () => {
    const res = await request(app)
      .post(`/api/claims/company/${companyId}`)
      .set("Cookie", usercookie)
      .send({ message: "error" });

    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe("Error");
    expect(res.body).toHaveProperty("message");
    expect(typeof res.body.status).toBe("string");
    expect(typeof res.body.message).toBe("string");
  });
});

describe("GET /api/claims/getclaim/:claimId", () => {
  it("should recieve a claim", async () => {
    const res = await request(app)
      .get(`/api/claims/getclaim/${claimdId}`)
      .set("Cookie", admincookie);

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body).toHaveProperty("message");
    expect(typeof res.body.status).toBe("string");
    expect(typeof res.body.message).toBe("string");
  });

  it("failed to get a claim id", async () => {
    const res = await request(app)
      .get(`/api/claims/getclaim/${claimdId}s`)
      .set("Cookie", admincookie);

    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe("Error");
    expect(res.body).toHaveProperty("message");
    expect(typeof res.body.status).toBe("string");
    expect(typeof res.body.message).toBe("string");
  });
});

afterAll(async () => {
  await User.deleteMany();
  await UserProfile.deleteMany();
  await Company.deleteMany();
  await ClaimModel.deleteMany();

  await disconnectDB();
});
