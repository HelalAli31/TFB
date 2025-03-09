const cartModel = require("../../models/cartSchema");
const userModel = require("../../models/usersSchema");
const productModel = require("../../models/productSchema");
const cartItemsModel = require("../../models/cartItemsSchema");

async function getCart(userId) {
  try {
    const result = await cartModel
      .find({ user_id: userId }, { __v: false })
      .populate("user_id", "first_name", userModel);
    return result;
  } catch (error) {
    console.log(error);
  }
}
async function updateCartStatus(cartId) {
  try {
    const result = await cartModel
      .updateOne({ _id: cartId }, { cartIsOpen: false }, { __v: false })
      .populate("user_id", "first_name", userModel);
    return result;
  } catch (error) {
    console.log(error);
  }
}

async function getCartItems(cartId) {
  try {
    let result = await cartItemsModel
      .find({ cart_id: cartId }, { __v: false })
      .populate({
        path: "product_id",
        model: productModel, // ✅ Explicitly define model to populate
      });

    if (!result || result.length === 0) {
      console.warn("⚠️ No cart items found in DB for cartId:", cartId);
      return [];
    }

    console.log("✅ Cart items fetched:", result);
    return result;
  } catch (error) {
    console.error("❌ Error fetching cart items:", error);
    return [];
  }
}

async function addItemToCart(item) {
  try {
    const result = await cartItemsModel.insertMany([item]);
    return result;
  } catch (error) {
    console.log(error);
  }
}
async function addCart(userId) {
  try {
    const cart = {};
    cart.user_id = userId;
    const result = await cartModel.insertMany(cart);

    return result;
  } catch (error) {
    console.log(error);
  }
}

async function deleteItemFromCart(itemId) {
  try {
    const result = await cartItemsModel.findOneAndDelete({ _id: itemId });
    return result;
  } catch (error) {
    console.log(error);
  }
}
async function editAmount(itemId, amount, fullPrice) {
  try {
    const result = await cartItemsModel.findOneAndUpdate(
      { _id: itemId },
      { $set: { amount: amount, full_price: fullPrice } }, // ✅ Ensure correct field names
      { new: true, runValidators: true } // ✅ Returns the updated document
    );

    if (!result) {
      console.error(`🚨 Item with ID ${itemId} not found in DB!`);
      return null;
    }

    console.log("✅ Item successfully updated in DB:", result);
    return result;
  } catch (error) {
    console.error("❌ Error updating item amount in DB:", error);
    throw error;
  }
}

async function clearCart(cartId) {
  try {
    const result = await cartItemsModel.deleteMany({ cart_id: cartId });
    return result;
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  getCart,
  getCartItems,
  addItemToCart,
  addCart,
  deleteItemFromCart,
  updateCartStatus,
  editAmount,
  clearCart,
};
