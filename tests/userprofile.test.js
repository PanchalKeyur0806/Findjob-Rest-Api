import path from "path";
import { fileURLToPath } from "url";
import request from "supertest";
import { describe, it, expect, beforeEach, afterAll, beforeAll } from "vitest";
import jwt from "jsonwebtoken";

import app from "../app.js";
import { connectDB, disconnectDB } from "./setup.js";
import { loginHelper } from "./helpers/loginHelpers.js";
import UserProfile from "../models/userProfile.js";
import User from "../models/userModel.js";

let cookie;
let token;
let userId;
let userProfileId;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const img = path.join(__dirname + "\\assets" + "\\test-img.png");

beforeAll(async () => {
  await connectDB();

  await User.deleteMany();
  await UserProfile.deleteMany();

  const login = await loginHelper("candidate");
  cookie = login.cookie;
  token = login.token;

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  userId = decoded.id;
});

// create userprofile
async function createUserProfile() {
  const res = await request(app)
    .post("/api/userprofile/")
    .set("Content-Type", "multipart/form-data")
    .set("Cookie", cookie)
    .field("jobPrefrence", "remote")
    .field("skills[]", "HTML")
    .field("skills[]", "CSS")
    .field("experience[0][companyName]", "Maxgen")
    .field("experience[0][jobTitle]", "Node.js Developer")
    .field("experience[0][address]", "Some where on the earth")
    .field("experience[0][yearsOfExperience]", "5")
    .field("education[0][name]", "5")
    .field("education[0][place]", "Vastral")
    .field("education[0][score]", "50.90")
    .field("education[0][joiningDate]", "2026-08-06")
    .field("education[0][endingDate]", "2026-08-06")
    .attach("resumeFile", img);

  return res;
}

// expected response
function expectedBody(res) {
  expect(res.body.data).toMatchObject({
    resumeFile: expect.any(String),
    experience: expect.arrayContaining([
      expect.objectContaining({
        companyName: expect.any(String),
        jobTitle: expect.any(String),
        address: expect.any(String),
        yearsOfExperience: expect.any(Number),
      }),
    ]),
    jobPrefrence: expect.any(String),
    education: expect.arrayContaining([
      expect.objectContaining({
        name: expect.any(String),
        place: expect.any(String),
        score: expect.any(Number),
        joiningDate: expect.any(String),
        endingDate: expect.any(String),
      }),
    ]),
    skills: expect.arrayContaining([expect.any(String)]),
  });
}

describe("User Profile API", () => {
  // post the user profile
  describe("POST /api/userprofile/", () => {
    it("should submit the user profile", async () => {
      const res = await createUserProfile();

      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe("success");
      expect(res.body).toHaveProperty("message", "userProfile created");
      expectedBody(res);
    }, 15000);

    it("should return error (missing required fields)", async () => {
      const res = await request(app)
        .post("/api/userprofile/")
        .set("Content-Type", "multipart/form-data")
        .set("Cookie", cookie)
        .field("skills[]", "HTML")
        .field("skills[]", "CSS")
        .field("experience[0][jobTitle]", "Node.js Developer")
        .field("experience[0][address]", "Some where on the earth")
        .field("experience[0][yearsOfExperience]", "5")
        .field("education[0][name]", "5")
        .field("education[0][place]", "Vastral")
        .field("education[0][score]", "50.90")
        .field("education[0][joiningDate]", "2026-08-06")
        .field("education[0][endingDate]", "2026-08-06");

      expect(res.statusCode).toBe(400);
      expect(res.body.status).toBe("Error");
      expect(res.body).toHaveProperty("message");
    });
  });

  // get the user profile
  describe("GET /api/userprofile", () => {
    // success message
    it("should return success", async () => {
      const res = await request(app)
        .get("/api/userprofile")
        .set("Cookie", cookie);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe("success");
      expect(res.body).toHaveProperty("message", "user profile found");
      expectedBody(res);
      expect(typeof res.body.status).toBe("string");
    });

    //   error success
    it("should return error message", async () => {
      const res = await request(app).get("/api/userprofile");

      expect(res.statusCode).toBe(400);
      expect(res.body.status).toBe("Error");
      expect(res.body).toHaveProperty("message");
      expect(typeof res.body.status).toBe("string");
    });
  });

  // update the userprofile
  describe("PATCH /api/userprofile/:profile", () => {
    // success message
    it("should return success message", async () => {
      await UserProfile.deleteMany();
      const createUserprofile = await createUserProfile();

      console.log(createUserprofile.body);

      expect(createUserprofile.statusCode).toBe(201);
      expect(createUserprofile.body.status).toBe("success");
      expect(createUserprofile.body).toHaveProperty(
        "message",
        "userProfile created"
      );
      expectedBody(createUserprofile);

      if (!userProfileId) {
        userProfileId = createUserprofile.body.data._id;
      }

      expect(userProfileId).toBeDefined();

      const res = await request(app)
        .patch(`/api/userprofile/${userProfileId}`)
        .set("Cookie", cookie)
        .send({ skills: ["html", "css"] });

      console.log(res.body);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe("success");
      expect(res.body).toHaveProperty("message");
      expect(res.body.message).toBe("user Profile updated");
      expect(typeof res.body.status).toBe("string");
    });

    // error message
    it("should return error message", async () => {
      const res = await request(app)
        .patch(`/api/userprofile/${userProfileId}`)
        .send({ skills: ["html", "css"] });

      expect(res.statusCode).toBe(400);
      expect(res.body.status).toBe("Error");

      expect(typeof res.body.status).toBe("string");
      expect(typeof res.body.message).toBe("string");
    });
  });
});

// disconnect db after the test
afterAll(async () => {
  await User.deleteMany();
  await UserProfile.deleteMany();
  await disconnectDB();
});
