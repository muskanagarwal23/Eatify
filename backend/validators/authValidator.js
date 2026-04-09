const Joi = require("joi");

exports.registerSchema = Joi.object({
  name: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid("CUSTOMER", "VENDOR", "DELIVERY").required(),
  licenseNumber: Joi.string().when("role", {
  is: "VENDOR",
  then: Joi.required(),
  otherwise: Joi.optional()
}),
vehicleNumber: Joi.string().when("role", {
  is: "DELIVERY",
  then: Joi.required(),
  otherwise: Joi.optional()
}),
});

exports.loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});