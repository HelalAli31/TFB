const Joi = require("@hapi/joi");

const GetCartSchema = Joi.object().keys({
  userId: Joi.string().required(),
});
const addCartSchema = Joi.object().keys({
  userId: Joi.string().required(),
});
const updateStatusSchema = Joi.object().keys({
  cartId: Joi.string().required(),
});

const getItemsSchema = Joi.object().keys({
  cartId: Joi.required(),
  Authorization: Joi.string(),
});
const AddItemsSchema = Joi.object().keys({
  product_id: Joi.string().required(),
  cart_id: Joi.string().required(),
  amount: Joi.number().required(),
  full_price: Joi.number().required(),
});
const deleteItemSchema = Joi.object().keys({
  itemId: Joi.string().required(),
});
const editItemAmountSchema = Joi.object().keys({
  itemId: Joi.string().required(),
  amount: Joi.number().required(),
  fullPrice: Joi.number().required(),
});
const clearCartSchema = Joi.object().keys({
  cartId: Joi.string().required(),
});

const validationsObj = {
  getCart: (req, res, next) => {
    const { error } = GetCartSchema.validate(req.query);
    if (error) {
      console.log(error.details);
      return next(error.details);
    }
    return next();
  },
  updateStatus: (req, res, next) => {
    const { error } = updateStatusSchema.validate(req.query);
    if (error) {
      console.log(error.details);
      return next(error.details);
    }
    return next();
  },
  addCart: (req, res, next) => {
    const { error } = addCartSchema.validate(req.query);
    if (error) {
      console.log(error.details);
      return next(error.details);
    }
    return next();
  },

  getItems: (req, res, next) => {
    const { error } = getItemsSchema.validate(req.body);
    if (error) {
      console.log(error.details);
      return next(error.details);
    }
    return next();
  },
  AddItems: (req, res, next) => {
    const { error } = AddItemsSchema.validate(req.body.item);
    if (error) {
      console.log(error.details);
      return next(error.details);
    }
    return next();
  },
  deleteItem: (req, res, next) => {
    const { error } = deleteItemSchema.validate(req.query);
    if (error) {
      console.log(error.details);
      return next(error.details);
    }
    return next();
  },
  editItemAmount: (req, res, next) => {
    const { error } = editItemAmountSchema.validate(req.body.data);
    if (error) {
      console.log(error.details);
      return next(error.details);
    }
    return next();
  },
  clearCart: (req, res, next) => {
    const { error } = clearCartSchema.validate(req.query);
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
