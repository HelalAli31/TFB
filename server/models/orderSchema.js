const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
  cart_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "carts",
  },
  order_date: {
    type: Date,
    require: true,
    default: Date.now(),
  },
  order_delivery_date: {
    type: Date,
    require: true,
  },
  total_price: {
    type: Number,
    require: true,
  },
  city: {
    type: String,
    require: true,
  },
  street: {
    type: String,
    require: true,
  },
  last_visa_number: {
    type: Number,
    require: true,
  },
});

const OrderModel = mongoose.model("orders", orderSchema);
module.exports = OrderModel;
