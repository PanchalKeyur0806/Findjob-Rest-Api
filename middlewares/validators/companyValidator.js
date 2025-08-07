import Joi from "joi";
import { validator } from "./boilerplatofValidators.js";

const companyValidationSchema = Joi.object({
  companyName: Joi.string().required(),
  email: Joi.string().email().required(),
  phoneNumber: Joi.number().required(),
  address: Joi.string().trim().required().min(10).required(),
  description: Joi.string().trim().min(20).required(),
  website: Joi.string().trim().required(),
  companyLogo: Joi.string().trim(),
});

export const companyValidator = validator(companyValidationSchema);
