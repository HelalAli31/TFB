const CartModel = require("../../models/cartSchema");
const ProductModel = require("../../models/productSchema");
const CartItemModel = require("../../models/cartItemsSchema");

async function insertCartItemsToDB() {
  try {
    const resultFind = await CartItemModel.find();
    const resultProduct = await ProductModel.find();
    const resultCart = await CartModel.find();
    if (resultFind.length) return;
    const result = await CartItemModel.insertMany(
      getCartItemsData(resultProduct[1]?._id, resultCart[0]?._id)
    );
    console.log(result);
  } catch (ex) {
    console.log(ex);
  } finally {
    process.exit(0);
  }
}

function getCartItemsData(productId, cartId) {
  return [
    {
      product_id: productId,
      cart_id: cartId,
      amount: 5,
      full_price: 300,
    },
  ];
}

module.exports = { insertCartItemsToDB };
