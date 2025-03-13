const Joi = require("@hapi/joi");

const ProductActionSchema = Joi.object()
  .keys({
    _id: Joi.string().allow(""),
    name: Joi.string().required(),
    brand: Joi.string().required(),
    category: Joi.string().required(), // Ensuring category is a valid ObjectId reference
    price: Joi.number().required(),
    quantity: Joi.number().required(),
    description: Joi.string().allow(null, "").optional(),
    createdAt: Joi.date().optional(),
    updatedAt: Joi.date().optional(),
  })
  .unknown(true); // ✅ Allows additional, unexpected fields

const validationsObj = {
  ProductAction: (req, res, next) => {
    const { error } = ProductActionSchema.validate(req.body.product);
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
