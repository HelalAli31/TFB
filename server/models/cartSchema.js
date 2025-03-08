const mongoose = require("mongoose");
const moment = require("moment");

const cartSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
  date: {
    type: Date,
    require: true,
    default: moment().toDate().getTime(),
  },
  cartIsOpen: {
    type: Boolean,
    require: true,
    default: true,
  },
});

const CartModel = mongoose.model("cart", cartSchema);
module.exports = CartModel;
