const orderModel = require("../../models/orderSchema");

async function getOrder(cartId) {
  try {
    const result = await orderModel.find({ cart_id: cartId }, { __v: false });
    return result;
  } catch (error) {
    console.log(error);
  }
}

async function getAllOrders(userId) {
  try {
    if (!userId) {
      var result = await orderModel
        .find({})
        .populate("user_id", "first_name last_name");
    } else {
      var data = await orderModel.find({ user_id: userId });
      if (!Array.isArray(data)) return;
      var result = data.reverse().slice(0, 3);
    }
    return result;
  } catch (error) {
    console.log(error);
  }
}

async function addOrder(order) {
  try {
    if (!order) return;
    const result = await orderModel.insertMany([order]);

    return result;
  } catch (error) {
    console.log(error);
  }
}

async function getOrdersNumber() {
  try {
    const result = await orderModel.countDocuments();
    return result;
  } catch (error) {
    console.log(error);
  }
}
async function deleteOrder(orderId) {
  try {
    const result = await orderModel.findByIdAndDelete(orderId); // Delete by ID
    return result;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

async function updateOrder(orderId, updateData) {
  try {
    const result = await orderModel.findByIdAndUpdate(
      orderId,
      { $set: updateData },
      { new: true, useFindAndModify: false } // Return the updated document
    );
    return result;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

module.exports = {
  getOrder,
  addOrder,
  getOrdersNumber,
  getAllOrders,
  deleteOrder,
  updateOrder,
};
