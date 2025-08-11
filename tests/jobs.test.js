import request from "supertest";
import { afterAll, beforeAll, describe, expect } from "vitest";

import app from "../app.js";
import { connectDB, disconnectDB } from "./setup.js";
import Company from "../models/companyModel.js";
import JobModel from "../models/jobModel.js";
import { companyHelper } from "./helpers/companyHelper.js";
import User from "../models/userModel.js";

let data;
let companyId;
let userId;
let cookie;
let token;
let jobId;

beforeAll(async () => {
  await connectDB();

  data = await companyHelper("recruiter");

  companyId = data.companyId;
  userId = data.userId;
  cookie = data.cookie;
  token = data.token;
});

function expectedBody(res) {
  expect(res.body.data).toMatchObject({
    user: expect.any(String),
    company: expect.any(String),
    responsibility: expect.any(String),
    requirements: expect.any(String),
    niceToHave: expect.any(String),
    whatToExcept: expect.any(String),
    skills: expect.any(Array),
    yearsOfExp: expect.any(Number),
  });
}

describe("POST /api/jobs/create/company/:companyId", () => {
  it("should create a job", async () => {
    const res = await request(app)
      .post(`/api/jobs/create/company/${companyId}`)
      .set("Cookie", cookie)
      .send({
        title: "nodejs Developer",
        employeeType: "parttime",
        location: "ahmedabad",
        salary: 3000,
        applicationDeadline: "2025-06-08",
        numberOfOpenings: 5,
        jobCategory: "IT",
        educationLevel: "BCA",
        responsibility:
          "Manage Backend fronted, develop ai backend, develop game backend and so on so forth",
        requirements: "5 years of experience min 10 years of request required",
        niceToHave: "all the skills that are available in the world",
        whatToExcept: "nothing because we are poor (hehe we are rich bitch)",
        skills: ["Html", "css", "javascript"],
        yearsOfExp: 5,
      });

    jobId = res.body?.data?._id;

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe("success");
    expect(res.body).toHaveProperty("message");
    expect(res.body.message).toBe("job created");
    expectedBody(res);
    expect(typeof res.body.status).toBe("string");
    expect(typeof res.body.message).toBe("string");
  });

  it("should return an error", async () => {
    const res = await request(app)
      .post(`/api/jobs/create/company/${companyId}`)
      .set("Cookie", cookie)
      .send({
        responsibility: "Manage Backend",
        requirements: "5 years of experience min 10 years of request required",
        niceToHave: "all the skills that are available in the world",
        whatToExcept: "nothing because we are poor (hehe we are rich bitch)",
        skills: ["Html", "css", "javascript"],
        yearsOfExp: 5,
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe("Error");
    expect(res.body).toHaveProperty("message");
    expect(typeof res.body.status).toBe("string");
    expect(typeof res.body.message).toBe("string");
  });
});

describe("GET /api/jobs/get/company/:companyid", () => {
  it("should return company's all jobs", async () => {
    const res = await request(app)
      .get(`/api/jobs/get/company/${companyId}`)
      .set("Cookie", cookie);

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body).toHaveProperty("message");
    expect(typeof res.body.status).toBe("string");
    expect(typeof res.body.message).toBe("string");
  });

  it("should return error (if there is no cookie set)", async () => {
    const res = await request(app).get(`/api/jobs/get/company/${companyId}`);

    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe("Error");
    expect(res.body).toHaveProperty("message");
    expect(typeof res.body.status).toBe("string");
    expect(typeof res.body.message).toBe("string");
  });
});

describe("GET /api/jobs/:jobId", () => {
  it("should return job", async () => {
    const res = await request(app)
      .get(`/api/jobs/${jobId}`)
      .set("Cookie", cookie);

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body).toHaveProperty("message");
    expectedBody(res);
    expect(typeof res.body.status).toBe("string");
    expect(typeof res.body.message).toBe("string");
  });
});

describe("DELETE /api/jobs/:jobId", () => {
  it("should delete the job", async () => {
    const res = await request(app)
      .delete(`/api/jobs/update/job/${jobId}`)
      .set("Cookie", cookie);

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body).toHaveProperty("message");
    expectedBody(res);
    expect(typeof res.body.status).toBe("string");
    expect(typeof res.body.message).toBe("string");
  });
});

afterAll(async () => {
  await User.deleteMany();
  await Company.deleteMany();
  await JobModel.deleteMany();
  await disconnectDB();
});
