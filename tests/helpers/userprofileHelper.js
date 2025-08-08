import { fileURLToPath } from "url";
import path from "path";
import request from "supertest";
import UserProfile from "../../models/userProfile.js";

import app from "../../app.js";
import { loginHelper } from "./loginHelpers.js";

let userId;
let userProfileId;

let usercookie;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const img = path.join(__dirname + "\\.." + "\\assets" + "\\test-img.png");

export async function userProfileHelper() {
  const userlogin = await loginHelper("candidate");
  usercookie = userlogin.cookie;

  const res = await request(app)
    .post("/api/userprofile/")
    .set("Content-Type", "multipart/form-data")
    .set("Cookie", usercookie)
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

  userProfileId = res.body.data._id;

  return { userProfileId, usercookie };
}
