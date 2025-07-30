import Joi from "joi";
import { validator } from "./boilerplatofValidators.js";

const jobsValidatorSchema = Joi.object({
  responsibility: Joi.string().trim().min(20).max(2000).required(),
  requirements: Joi.string().trim().min(20).max(1000).required(),
  niceToHave: Joi.string().trim().min(20).max(500).required(),
  whatToExcept: Joi.string().trim().min(20).max(500).required(),
  skills: Joi.array().items(Joi.string().required().trim()),
  yearsOfExp: Joi.number().min(0).max(10).required(),
});

export const jobsValidator = validator(jobsValidatorSchema);
