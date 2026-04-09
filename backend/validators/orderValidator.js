const Joi = require("joi");

exports.placeOrderSchema = Joi.object({
  // normally no body is required because order comes from cart
  deliveryAddress: Joi.string().required()
}).unknown(true);

exports.updateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid("ACCEPTED", "REJECTED", "PREPARING","READY","DELIVERY_ASSIGNED" )
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
    .valid("OUT_FOR_DELIVERY","PICKED_UP", "DELIVERED")
    .required()
});