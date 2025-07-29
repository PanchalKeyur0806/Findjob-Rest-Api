import Joi from "joi";
import { validator } from "./boilerplatofValidators.js";

const authenticationSchema = Joi.object({
  name: Joi.string().min(5).max(20).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(16).required(),
  phoneNumber: Joi.number().min(10).required(),
  dateOfBirth: Joi.date().required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(16).required(),
});

export const authValidator = validator(authenticationSchema);
export const loginValidator = validator(loginSchema);
