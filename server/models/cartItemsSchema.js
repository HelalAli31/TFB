const mongoose = require("mongoose");

const cartItemsSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  cart_id: { type: mongoose.Schema.Types.ObjectId, ref: "Cart" },
  amount: { type: Number, required: true },
  full_price: { type: Number, required: true },
  option: { type: String, default: null }, // Ensure option is optional
  nic: { type: Number, default: null }, // Nicotine can be null
  ice: { type: Number, default: null }, // Ice level can be null
});

const CartItemModel =
  mongoose.models.cartItems || mongoose.model("cartItems", cartItemsSchema);

module.exports = CartItemModel;
