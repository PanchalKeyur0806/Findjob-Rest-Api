import Joi from "joi";

const validator = (schema) => (payload) => schema.validate(payload);

export { validator };
