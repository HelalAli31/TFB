const Joi = require("@hapi/joi");

const ProductActionSchema = Joi.object().keys({
  _id: Joi.string().allow(""),
  name: Joi.string().required(),
  brand: Joi.string().required(),
  category: Joi.any().required(),
  price: Joi.number().required(),
  quantity: Joi.any().required(),
  image: Joi.string().allow(null, "").optional(),
  description: Joi.string().allow(null, "").optional(),
  details: Joi.object().allow(null, "").optional(),
  createdAt: Joi.string().allow(null, "").optional(),
  updatedAt: Joi.string().allow(null, "").optional(),
});

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
