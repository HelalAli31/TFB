const mongoose = require("mongoose");

const cartItemsSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  cart_id: { type: mongoose.Schema.Types.ObjectId, ref: "Cart" },
  amount: { type: Number, required: true },
  full_price: { type: Number, required: true },
});

// ✅ Check if model already exists, then use it; otherwise, create it
const CartItemModel =
  mongoose.models.cartItems || mongoose.model("cartItems", cartItemsSchema);

module.exports = CartItemModel;
