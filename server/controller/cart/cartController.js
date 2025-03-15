const cartModel = require("../../models/cartSchema");
const userModel = require("../../models/usersSchema");
const productModel = require("../../models/productSchema");
const cartItemsModel = require("../../models/cartItemsSchema");
const mongoose = require("mongoose");

async function getCart(userId) {
  try {
    console.log(`🔍 Checking for open cart for user: ${userId}`);

    // ✅ List all carts for debugging
    const allCarts = await cartModel.find({
      user_id: new mongoose.Types.ObjectId(userId),
    });
    console.log("🛒 All Carts for User:", allCarts);

    let cart = await cartModel
      .findOne({
        user_id: new mongoose.Types.ObjectId(userId),
        cartIsOpen: true, // ✅ Ensure correct field name
      })
      .populate("user_id", "first_name");

    console.log("CAAAAART:", cart, " ID:", userId);
    if (cart) {
      console.log(`✅ Found open cart for user: ${userId}`);
      return cart;
    }

    // 🚀 **If no open cart exists, create one**
    console.warn(`⚠️ No open cart found for user: ${userId}, creating one...`);

    cart = new cartModel({
      user_id: new mongoose.Types.ObjectId(userId), // ✅ Ensure userId is ObjectId
      cartIsOpen: true,
      created_at: new Date(),
      items: [],
    });

    await cart.save();
    console.log(`✅ New cart created for user: ${userId}`);
    return cart;
  } catch (error) {
    console.error("❌ Error fetching/creating cart:", error);
    throw error;
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
    console.log(`📤 Fetching cart items for cart ID: ${cartId}`);

    // ✅ Ensure correct model name: "Products" instead of "Product"
    const cartItems = await cartItemsModel.find({ cart_id: cartId }).populate({
      path: "product_id",
      model: "Products", // ✅ Correct model name
      select:
        "_id name brand category price quantity image description details sale",
    });

    if (!cartItems || cartItems.length === 0) {
      console.warn(`⚠️ Cart ${cartId} has no items.`);
      return [];
    }

    console.log(`✅ Items related to cart ID ${cartId}:`, cartItems);
    return cartItems;
  } catch (error) {
    console.error("❌ Error fetching cart items:", error);
    return [];
  }
}

async function addItemToCart(item) {
  try {
    console.log("📤 Adding item to cart:", item);

    const { cart_id, product_id, amount, full_price, option, nic, ice } = item;

    if (!cart_id || !product_id || !amount || !full_price) {
      console.error("🚨 Invalid item data:", item);
      return null;
    }

    const cart = await cartModel.findById(cart_id);
    if (!cart) {
      console.error(`❌ Cart not found: ${cart_id}`);
      return null;
    }

    const product = await productModel.findById(product_id);
    if (!product) {
      console.error(`❌ Product not found: ${product_id}`);
      return null;
    }

    let cartItem = await cartItemsModel.findOne({
      cart_id,
      product_id,
      option: option || null, // Match option if it exists
      nic: nic || null, // Match nicotine if it exists
      ice: ice || null, // Match ice if it exists
    });

    if (cartItem) {
      console.log("🔄 Item already in cart, updating quantity.");
      cartItem.amount += amount;
      cartItem.full_price += full_price;
      cartItem.nic = nic !== undefined ? nic : cartItem.nic;
      cartItem.ice = ice !== undefined ? ice : cartItem.ice;
      cartItem.option = option !== undefined ? option : cartItem.option;
      await cartItem.save();
    } else {
      console.log("🆕 Adding new item to cart.");
      cartItem = new cartItemsModel({
        cart_id,
        product_id,
        amount,
        full_price,
        option: option || null,
        nic: nic || null,
        ice: ice || null,
      });
      await cartItem.save();
    }

    return cartItem;
  } catch (error) {
    console.error("❌ Error adding item to cart:", error);
    return null;
  }
}

module.exports = addItemToCart;

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
async function editAmount(
  itemId,
  amount,
  fullPrice,
  nic = null,
  ice = null,
  option = null
) {
  try {
    const updateFields = { amount, full_price: fullPrice };

    if (nic !== null) updateFields.nic = nic;
    if (ice !== null) updateFields.ice = ice;
    if (option !== null) updateFields.option = option;

    const result = await cartItemsModel.findOneAndUpdate(
      { _id: itemId },
      { $set: updateFields }, // ✅ Only update provided fields
      { new: true, runValidators: true }
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

module.exports = editAmount;

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
