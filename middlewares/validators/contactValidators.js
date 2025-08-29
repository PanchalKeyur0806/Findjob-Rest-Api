import Joi from "joi";
import { validator } from "./boilerplatofValidators.js";

const contactUsSchema = Joi.object({
  firstName: Joi.string().min(3).max(15).trim().required(),
  lastName: Joi.string().min(3).max(15).trim().required(),
  email: Joi.string().email().trim().required(),
  message: Joi.string().min(5).max(1000).trim(),
});

export const contactValidator = validator(contactUsSchema);
