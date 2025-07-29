import Joi from "joi";
import { validator } from "./boilerplatofValidators.js";

const claimSchema = Joi.object({
  message: Joi.string().min(20).trim().required(),
});

export const claimValidator = validator(claimSchema);
