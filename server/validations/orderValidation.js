const Joi = require("@hapi/joi");

const OrderSchema = Joi.object().keys({
  cartId: Joi.string().required(),
});
const AddOrderSchema = Joi.object().keys({
  user_id: Joi.string().required(),
  cart_id: Joi.string().required(),
  order_date: Joi.date().optional(),
  city: Joi.string().required(),
  street: Joi.string().required(),
  payment: Joi.string().required(),
  delivery_way: Joi.string().required(),
  total_price: Joi.number().required(),
  last_visa_number: Joi.number().required(),
});
const DeleteOrderSchema = Joi.object().keys({
  orderId: Joi.string().required(), // Require the orderId
});

const UpdateOrderSchema = Joi.object().keys({
  orderId: Joi.string().required(), // Require the orderId
  updateData: Joi.object()
    .keys({
      user_id: Joi.string().optional(),
      cart_id: Joi.string().optional(),
      order_date: Joi.date().optional(),
      total_price: Joi.number().optional(),
      city: Joi.string().optional(),
      payment: Joi.string().required(),
      street: Joi.string().optional(),
      delivery_way: Joi.string().required(),
      last_visa_number: Joi.number().optional(),
    })
    .min(1), // Ensure at least one field is being updated
});
const validationsObj = {
  addOrder: (req, res, next) => {
    const { error } = AddOrderSchema.validate(req.body.order);
    if (error) {
      console.log(error.details);
      return next(error.details);
    }
    return next();
  },
  getOrder: (req, res, next) => {
    const { error } = OrderSchema.validate(req.query);
    if (error) {
      console.log(error.details);
      return next(error.details);
    }
    return next();
  },
  deleteOrder: (req, res, next) => {
    const { error } = DeleteOrderSchema.validate(req.body);
    if (error) {
      console.log(error.details);
      return next(error.details);
    }
    return next();
  },
  updateOrder: (req, res, next) => {
    const { error } = UpdateOrderSchema.validate(req.body);
    if (error) {
      console.log(error.details);
      return next(error.details);
    }
    return next();
  },
};

function getValidationFunction(path) {
  return validationsObj[path];
}

module.exports = getValidationFunction;
