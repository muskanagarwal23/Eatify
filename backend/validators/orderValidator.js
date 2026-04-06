const Joi = require("joi");

exports.placeOrderSchema = Joi.object({
  // normally no body is required because order comes from cart
});

exports.updateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid("ACCEPTED", "REJECTED", "PREPARING","DELIVERY_ASSIGNED" )
    .required()
});

exports.assignDeliverySchema = Joi.object({
  deliveryPartnerId: Joi.string()
    .hex()
    .length(24)
    .required()
});

exports.deliveryStatusSchema = Joi.object({
  status: Joi.string()
    .valid("PICKED_UP", "DELIVERED")
    .required()
});