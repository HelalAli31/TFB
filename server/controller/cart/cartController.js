const cartModel = require("../../models/cartSchema");
const userModel = require("../../models/usersSchema");
const productModel = require("../../models/productSchema");
const cartItemsModel = require("../../models/cartItemsSchema");
const mongoose = require("mongoose");

async function getCart(userId) {
  try {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Try to find open cart
    let cart = await cartModel
      .findOneAndUpdate(
        { user_id: userObjectId, cartIsOpen: true },
        {
          $setOnInsert: {
            user_id: userObjectId,
            cartIsOpen: true,
            created_at: new Date(),
          },
        },
        {
          new: true,
          upsert: true,
        }
      )
      .populate("user_id", "first_name");

    console.log(`✅ Cart returned for user: ${userId}`);
    return cart;
  } catch (error) {
    console.error("❌ Error adding cart:", error);
    throw error;
  }
}

async function updateCartStatus(cartId) {
  try {
    const result = await cartModel.updateOne(
      { _id: new mongoose.Types.ObjectId(cartId), cartIsOpen: true },
      { $set: { cartIsOpen: false } }
    );

    if (result.modifiedCount === 0) {
      console.warn("⚠️ Cart already closed or not found.");
    } else {
      console.log("✅ Cart status updated to closed.");
    }

    return result;
  } catch (error) {
    console.error("❌ Error updating cart:", error);
    throw error;
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
    const { cart_id, product_id, amount, full_price, option, nic, ice } = item;

    if (!cart_id || !product_id || !amount || !full_price) {
      console.error("🚨 Missing required item fields.");
      return null;
    }

    // ✅ Get cart and user_id using cart_id
    const cart = await cartModel.findById(cart_id);
    if (!cart || !cart.user_id) {
      console.error(`❌ Cart not found or missing user: ${cart_id}`);
      return null;
    }

    const user_id = cart.user_id;

    const product = await productModel.findById(product_id);
    if (!product) {
      console.error(`❌ Product not found: ${product_id}`);
      return null;
    }

    // Check if item already exists
    let cartItem = await cartItemsModel.findOne({
      cart_id: cart._id,
      product_id,
      option: option || null,
      nic: nic || null,
      ice: ice || null,
    });

    if (cartItem) {
      console.log("🔄 Updating existing cart item.");
      cartItem.amount += amount;
      cartItem.full_price += full_price;
      cartItem.option = option !== undefined ? option : cartItem.option;
      cartItem.nic = nic !== undefined ? nic : cartItem.nic;
      cartItem.ice = ice !== undefined ? ice : cartItem.ice;
      await cartItem.save();
    } else {
      console.log("🆕 Adding new cart item.");
      cartItem = new cartItemsModel({
        cart_id: cart._id,
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
  return getCart(userId); // Safe way to enforce singleton behavior
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
