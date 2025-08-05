import request from "supertest";
import JobModel from "../../models/jobModel.js";

import { companyHelper } from "./companyHelper.js";
import app from "../../app.js";

let companyId;
let jobId;
let recruitercookie;

export async function jobHelper() {
  const companyLogin = await companyHelper("recruiter");
  companyId = companyLogin.companyId;
  recruitercookie = companyLogin.cookie;

  const res = await request(app)
    .post(`/api/jobs/create/company/${companyId}`)
    .set("Cookie", recruitercookie)
    .send({
      responsibility:
        "Manage Backend fronted, develop ai backend, develop game backend and so on so forth",
      requirements: "5 years of experience min 10 years of request required",
      niceToHave: "all the skills that are available in the world",
      whatToExcept: "nothing because we are poor (hehe we are rich bitch)",
      skills: ["Html", "css", "javascript"],
      yearsOfExp: 5,
    });

  jobId = res.body.data._id;


  return { jobId };
}
