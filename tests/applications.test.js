import request from "supertest";
import { beforeAll, afterAll, describe, it, expect } from "vitest";

import app from "../app.js";
import { connectDB, disconnectDB } from "./setup.js";
import User from "../models/userModel.js";
import UserProfile from "../models/userProfile.js";
import JobModel from "../models/jobModel.js";
import Applications from "../models/applicationModel.js";
import { userProfileHelper } from "./helpers/userprofileHelper.js";
import { jobHelper } from "./helpers/jobHelper.js";

let applicationId;
let userProfileId;
let jobId;

let usercookie;

beforeAll(async () => {
  await connectDB();
  const userprofilelogin = await userProfileHelper();

  const jobidlogin = await jobHelper();

  usercookie = userprofilelogin.usercookie;

  jobId = jobidlogin.jobId;
});

describe("POST /api/applications/user/submit/:jobId", () => {
  it("should submit the application", async () => {
    const res = await request(app)
      .post(`/api/applications/user/submit/${jobId}`)
      .set("Cookie", usercookie);

    applicationId = res.body.data._id;
    expect(applicationId).toBeDefined();

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe("success");
    expect(res.body).toHaveProperty("message");
    expect(res.body).toHaveProperty("data");
    expect(typeof res.body.status).toBe("string");
    expect(typeof res.body.message).toBe("string");
  });

  it("should failed to submit the application", async () => {
    const res = await request(app).post(
      `/api/applications/user/submit/${jobId}`
    );

    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe("Error");
    expect(res.body).toHaveProperty("message");
    expect(typeof res.body.status).toBe("string");
    expect(typeof res.body.message).toBe("string");
  });
});

describe("Get /api/applications/user/view/:applciationId", () => {
  it("should return application", async () => {
    const res = await request(app)
      .get(`/api/applications/user/view/${applicationId}`)
      .set("Cookie", usercookie);

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body).toHaveProperty("message");
    expect(res.body).toHaveProperty("data");
    expect(typeof res.body.status).toBe("string");
    expect(typeof res.body.message).toBe("string");
  });

  it("should return error", async () => {
    const res = await request(app).get(
      `/api/applications/user/view/${applicationId}s`
    );

    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe("Error");
    expect(res.body).toHaveProperty("message");
    expect(typeof res.body.status).toBe("string");
    expect(typeof res.body.message).toBe("string");
  });
});

describe("DELTE /api/applications/user/retrive/:applciationId", () => {
  it("should retrive the applications", async () => {
    const res = await request(app)
      .delete(`/api/applications/user/retrive/${applicationId}`)
      .set("Cookie", usercookie);

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body).toHaveProperty("message");
    expect(res.body).toHaveProperty("data");
    expect(typeof res.body.status).toBe("string");
    expect(typeof res.body.message).toBe("string");
  });

  it("should failed the applications", async () => {
    const res = await request(app).delete(
      `/api/applications/user/retrive/${applicationId}`
    );

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
  await JobModel.deleteMany();
  await Applications.deleteMany();
  await disconnectDB();
});
