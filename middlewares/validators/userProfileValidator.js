import Joi from "joi";
import { validator } from "./boilerplatofValidators.js";

const userProfileValidator = Joi.object({
  resumeFile: Joi.string().required(),
  experience: Joi.array().items(
    Joi.object({
      companyName: Joi.string().required(),
      jobTitle: Joi.string().required(),
      address: Joi.string().required(),
      yearsOfExperience: Joi.number().min(0).max(15).required(),
    })
  ),

  jobPrefrence: Joi.string().required(),
  education: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      place: Joi.string().required(),
      score: Joi.number().min(0).max(100).required(),
      joiningDate: Joi.date().required(),
      endingDate: Joi.date().required(),
    })
  ),
  skills: Joi.array().items(Joi.string().required().trim()),
});

export const userValidator = validator(userProfileValidator);
