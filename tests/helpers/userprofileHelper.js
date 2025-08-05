import request from "supertest";
import UserProfile from "../../models/userProfile.js";

import app from "../../app.js";
import { loginHelper } from "./loginHelpers.js";

let userId;
let userProfileId;

let usercookie;

export async function userProfileHelper() {
  const userlogin = await loginHelper("candidate");
  usercookie = userlogin.cookie;

  const res = await request(app)
    .post("/api/userprofile/")
    .set("Cookie", usercookie)
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

  userProfileId = res.body.data._id;

  return { userProfileId, usercookie };
}
