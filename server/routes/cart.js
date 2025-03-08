const express = require("express");
const {
  getCart,
  updateCartStatus,
  getCartItems,
  addItemToCart,
  addCart,
  deleteItemFromCart,
  editAmount,
  clearCart,
} = require("../controller/cart/cartController");
const router = express.Router();
const { verifyJWT } = require("../controller/JWT/jwt");
const logger = require("../logger/index");
const getValidationFunction = require("../validations/cartValidation");

const allowUserOrAdmin = async (req, res, next) => {
  try {
    const clientJwt = req.headers.authorization; // Extract token from headers
    if (!clientJwt) {
      throw new Error("Missing Authorization token");
    }

    const verify = await verifyJWT(clientJwt); // Verify the token
    const role = verify?.data?.[0]?.role;
    // if logged in

    if (role) {
      req.user = verify.data[0]; // Attach user data to the request
      return next(); // Proceed to the next middleware or route
    }

    throw new Error("Unauthorized role"); // If role is not user or admin
  } catch (error) {
    logger.error("Authorization error:", error);
    return res
      .status(403)
      .json({ message: "Access Denied", error: error.message });
  }
};

router.post(
  "/",
  getValidationFunction("getCart"),
  allowUserOrAdmin,
  async (req, res, next) => {
    try {
      const { userId } = req.query;
      if (!userId) throw new Error();
      const cart = await getCart(userId);
      if (!cart) throw new Error();
      return res.json({ cart });
    } catch (error) {
      console.log(error);
      return next({ message: "GENERAL ERROR", status: 400 });
    }
  }
);

router.post(
  "/updateOpenedCartStatus",
  allowUserOrAdmin,
  getValidationFunction("updateStatus"),
  async (req, res, next) => {
    try {
      const { cartId } = req.query;
      if (!cartId) throw new Error();
      const cart = await updateCartStatus(cartId);
      if (!cart) return res.json({});
      return res.json({ cart });
    } catch (error) {
      return next({ message: "GENERAL ERROR", status: 400 });
    }
  }
);

router.post(
  "/addCart",
  allowUserOrAdmin,
  getValidationFunction("addCart"),
  async (req, res, next) => {
    try {
      const { userId } = req.query;
      if (!userId) return res.json("something went wrong");
      const cart = await addCart(userId);
      if (!cart) throw new Error();
      return res.json({ message: "cart added!", data: cart });
    } catch (error) {
      console.log(error);
      return next({ message: "GENERAL ERROR", status: 400 });
    }
  }
);

router.post(
  "/getItems",
  allowUserOrAdmin,
  getValidationFunction("getItems"),
  async (req, res, next) => {
    try {
      const { cartId } = req.body;
      if (!cartId) return res.json("error");
      const cartItems = await getCartItems(cartId);

      if (!cartItems) throw new Error();
      return res.json(cartItems);
    } catch (error) {
      console.log(error);
      return next({ message: "GENERAL ERROR", status: 400 });
    }
  }
);

router.put("/AddItems", allowUserOrAdmin, async (req, res, next) => {
  try {
    const { item } = req.body;

    const cartItem = await addItemToCart(item);
    if (!cartItem) throw new Error();
    return res.json("item added");
  } catch (error) {
    console.log(error);
    return next({ message: "GENERAL ERROR", status: 400 });
  }
});
router.put(
  "/clearCart",
  allowUserOrAdmin,
  getValidationFunction("clearCart"),
  async (req, res, next) => {
    try {
      const { cartId } = req.query;
      const cartItems = await clearCart(cartId);
      if (!cartItems) throw new Error();
      return res.json("item deleted!");
    } catch (error) {
      console.log(error);
      return next({ message: "GENERAL ERROR", status: 400 });
    }
  }
);

router.put(
  "/deleteItem",
  allowUserOrAdmin,
  getValidationFunction("deleteItem"),
  async (req, res, next) => {
    try {
      const { itemId } = req.query;
      const cartItems = await deleteItemFromCart(itemId);
      if (!cartItems) throw new Error();
      return res.json("item deleted!");
    } catch (error) {
      console.log(error);
      return next({ message: "GENERAL ERROR", status: 400 });
    }
  }
);
router.post(
  "/editItemAmount",
  allowUserOrAdmin,
  getValidationFunction("editItemAmount"),
  async (req, res, next) => {
    try {
      const { fullPrice, amount, itemId } = req.body.data;
      const cartItem = await editAmount(itemId, amount, fullPrice);
      if (!cartItem) throw new Error();
      return res.json("item edited");
    } catch (error) {
      console.log(error);
      return next({ message: "GENERAL ERROR", status: 400 });
    }
  }
);

module.exports = router;
