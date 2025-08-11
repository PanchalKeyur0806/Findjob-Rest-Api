import Joi from "joi";
import { validator } from "./boilerplatofValidators.js";

const jobsValidatorSchema = Joi.object({
  title: Joi.string().trim().required(),
  employeeType: Joi.string()
    .valid("fulltime", "parttime", "remote", "contract", "internship")
    .required(),
  location: Joi.string().trim().required(),
  salary: Joi.number().min(0).max(10000000).required(),
  applicationDeadline: Joi.date().required(),
  numberOfOpenings: Joi.number().min(0).max(100).required(),
  jobCategory: Joi.string().trim().required(),
  educationLevel: Joi.string().trim().required(),
  responsibility: Joi.string().trim().min(20).max(2000).required(),
  requirements: Joi.string().trim().min(20).max(1000).required(),
  niceToHave: Joi.string().trim().min(20).max(500).required(),
  whatToExcept: Joi.string().trim().min(20).max(500).required(),
  skills: Joi.array().items(Joi.string().required().trim()),
  yearsOfExp: Joi.number().min(0).max(10).required(),
});

export const jobsValidator = validator(jobsValidatorSchema);
