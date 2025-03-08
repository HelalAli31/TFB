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
    let result = [];
    if (Array.isArray(cartId)) {
      for (let index = 0; index < cartId.length; index++) {
        let data = await cartItemsModel
          .find({ cart_id: cartId[index].cartId }, { __v: false })
          .populate("product_id", productModel);
        result.push(data);
      }
    } else {
      result = await cartItemsModel
        .find({ cart_id: cartId }, { __v: false })
        .populate("product_id", productModel);
    }
    return result;
  } catch (error) {
    console.log(error);
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
    const result = await cartItemsModel.updateOne(
      { _id: itemId },
      { amount: amount, full_price: fullPrice }
    );
    return result;
  } catch (error) {
    console.log(error);
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
