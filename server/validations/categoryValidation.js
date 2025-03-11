const Joi = require("@hapi/joi");

const addCategorySchema = Joi.object().keys({
  categoryName: Joi.string().required(), // Validate categoryName inside the request body
});

const editCategorySchema = Joi.object().keys({
  categoryId: Joi.string().required(),
  name: Joi.string().required(),
});
const deleteCategorySchema = Joi.object().keys({
  categoryId: Joi.string().required(),
});

const validationsObj = {
  addCategory: (req, res, next) => {
    const { error } = addCategorySchema.validate(req.body); // Validate the entire req.body
    if (error) {
      console.log(error.details);
      return next(error.details); // Return detailed validation errors
    }
    return next();
  },
  editCategory: (req, res, next) => {
    const { error } = editCategorySchema.validate(req.body.category);
    if (error) {
      console.log(error.details);
      return next(error.details);
    }
    return next();
  },
  deleteCategory: (req, res, next) => {
    const { error } = deleteCategorySchema.validate(req.body);
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
