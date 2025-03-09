const mongoose = require("mongoose");

const cartItemsSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product" }, // ✅ Ensure it references "Product"
  cart_id: { type: mongoose.Schema.Types.ObjectId, ref: "Cart" }, // ✅ Ensure it references "Cart"
  amount: { type: Number, required: true },
  full_price: { type: Number, required: true },
});

// ✅ Ensure the model is created only once
const CartItemModel =
  mongoose.models.CartItem || mongoose.model("CartItem", cartItemsSchema);

module.exports = CartItemModel;
