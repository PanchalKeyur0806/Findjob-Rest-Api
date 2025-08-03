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
beforeAll(async () => {
  await connectDB();

  await User.deleteMany();
  await UserProfile.deleteMany();

  const login = await loginHelper();
  cookie = login.cookie;
  token = login.token;

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  userId = decoded.id;
});

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

// post the user profile
describe("POST /api/userprofile/", () => {
  it("should submit the user profile", async () => {
    const res = await request(app)
      .post("/api/userprofile/")
      .set("Cookie", cookie)
      .send({
        resumeFile: "some",
        experience: [
          {
            companyName: "Google",
            jobTitle: "Node.js Developer",
            address: "mars",
            yearsOfExperience: 3,
          },
        ],
        jobPrefrence: "remote",
        education: [
          {
            name: "abc",
            place: "abc",
            score: 99,
            joiningDate: "2025-07-18",
            endingDate: "2025-07-18",
          },
        ],
        skills: ["html", "css", "javascript"],
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe("success");
    expect(res.body).toHaveProperty("message", "userProfile created");
    expectedBody(res);
  });

  it("should return error (missing required fields)", async () => {
    const res = await request(app)
      .post("/api/userprofile")
      .send({
        resumeFile: "some",
        experience: [
          {
            companyName: "Google",
            jobTitle: "Node.js Developer",
            address: "mars",
            yearsOfExperience: 3,
          },
        ],
        education: [
          {
            name: "abc",
            place: "abc",
            score: 99,
            joiningDate: "2025-07-18",
            endingDate: "2025-07-18",
          },
        ],
        skills: ["html", "css", "javascript"],
      });

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
    if (!userProfileId) {
      const existingProfile = await UserProfile.findOne({ resumeFile: "some" });
      userProfileId = existingProfile._id;
    }

    expect(userProfileId).toBeDefined();

    const res = await request(app)
      .patch(`/api/userprofile/${userProfileId}`)
      .set("Cookie", cookie)
      .send({ skills: ["html", "css"] });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body).toHaveProperty("message");
    expect(res.body.message).toBe("user Profile updated");
    expect(typeof res.body.status).toBe("string");
  });

  // error message
  it("should return error message", async () => {
    const profile = await UserProfile.findOne({ resumeFile: "some" });
    const res = await request(app)
      .patch(`/api/userprofile/${userProfileId}`)
      .send({ skills: ["html", "css"] });

    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe("Error");

    expect(typeof res.body.status).toBe("string");
    expect(typeof res.body.message).toBe("string");
  });
});

// disconnect db after the test
afterAll(async () => {
  await User.deleteMany();
  await UserProfile.deleteMany();
  await disconnectDB();
});
