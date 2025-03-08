const Joi = require("@hapi/joi");

const registerSchema = Joi.object().keys({
  email: Joi.string().min(1).max(50).required(),
  first_name: Joi.string().required(),
  last_name: Joi.string().required(),
  password: Joi.string().required(),
  phone: Joi.string().allow(null, "").optional,
  address: Joi.string().allow(null, "").optional(),
  username: Joi.string().required(),
  role: Joi.string().optional(),
});

const LoginSchema = Joi.object().keys({
  username: Joi.string().required(),
  password: Joi.string().required(),
});
const updateUserSchema = Joi.object()
  .keys({
    userId: Joi.string().required(),
    updateData: Joi.object()
      .keys({
        email: Joi.string().min(1).max(50).optional(),
        first_name: Joi.string().optional(),
        last_name: Joi.string().optional(),
        password: Joi.string().optional(),
        phone: Joi.string().allow(null, "").optional(),
        address: Joi.string().allow(null, "").optional(),
        username: Joi.string().optional(),
        role: Joi.string().optional(),
      })
      .min(1)
      .required(),
  })
  .unknown(true); // Allow unknown fields

const validationsObj = {
  register: (req, res, next) => {
    const { error } = registerSchema.validate(req.body);
    if (error) {
      console.log(error.details);
      return next(error.details);
    }
    return next();
  },

  login: (req, res, next) => {
    const { error } = LoginSchema.validate(req.body);
    if (error) {
      console.log(error.details);
      return next(error.details);
    }
    return next();
  },
  updateUser: (req, res, next) => {
    const { error } = updateUserSchema.validate(req.body);
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
