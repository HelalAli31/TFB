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
    if (!req || !req.headers) {
      console.error("🚨 Missing Request Object or Headers!");
      return res.status(403).json({ message: "Invalid Request" });
    }

    let authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("🚨 Invalid Token Format");
      return res.status(403).json({ message: "Invalid Token Format" });
    }

    let token = authHeader.split(" ")[1].trim(); // ✅ Extract token correctly

    if (!token) {
      console.error("🚨 Empty Token Received");
      return res.status(403).json({ message: "Empty Token" });
    }

    const verify = await verifyJWT(token); // ✅ Verify token

    if (!verify || !verify.data) {
      console.error("🚨 Invalid Token Data");
      return res.status(403).json({ message: "Invalid Token Data" });
    }

    const user = Array.isArray(verify.data) ? verify.data[0] : verify.data;
    if (!user || !user._id) {
      console.error("🚨 User ID missing in token!");
      return res.status(403).json({ message: "Invalid Token Data" });
    }

    req.user = user; // ✅ Attach user to request
    next();
  } catch (error) {
    console.error("❌ JWT Verification Error:", error.message);
    return res
      .status(403)
      .json({ message: "Invalid Token", error: error.message });
  }
};

router.post(
  "/",
  getValidationFunction("getCart"),
  allowUserOrAdmin,
  async (req, res, next) => {
    try {
      const userId = req.user._id; // ✅ Extract user ID
      console.log(`📤 Fetching open cart for user: ${userId}`);

      const cart = await getCart(userId); // ✅ Backend ensures an open cart exists

      return res.json({ cart });
    } catch (error) {
      console.error(error);
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
router.post("/addCart", allowUserOrAdmin, async (req, res) => {
  try {
    const { userId } = req.body;
    const newCart = await addCart(userId);
    res.json({ message: "Cart added!", cart: newCart });
  } catch (error) {
    res.status(400).json({ message: "Error adding cart" });
  }
});
console.log("CART");

router.get("/getItems", allowUserOrAdmin, async (req, res, next) => {
  try {
    const { cartId } = req.query;

    if (!cartId) {
      return res.status(400).json({ error: "Cart ID is required" });
    }

    console.log(`📤 Fetching items for cart ID: ${cartId}`);

    const cartItems = await getCartItems(cartId);

    if (!cartItems) {
      console.warn(`⚠️ No cart items found for cart ID: ${cartId}.`);
      return res.json([]); // ✅ Return empty array instead of `404`
    }

    console.log("✅ Cart Items:", cartItems);
    return res.json(cartItems);
  } catch (error) {
    console.error("❌ Error fetching cart items:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// ✅ Add item to cart
router.put("/AddItems", allowUserOrAdmin, async (req, res, next) => {
  try {
    const { item } = req.body;

    const cartItem = await addItemToCart(item);
    if (!cartItem) {
      console.error("🚨 Failed to add item:", item);
      return res.status(400).json({ message: "Failed to add item to cart." });
    }

    return res
      .status(200)
      .json({ message: "Item added successfully!", cartItem });
  } catch (error) {
    console.error("❌ Error in AddItems route:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

router.post("/editItemAmount", allowUserOrAdmin, async (req, res, next) => {
  try {
    const { fullPrice, amount, itemId } = req.body.data;

    // Validate input
    if (!itemId || amount < 1 || fullPrice < 0) {
      return res.status(400).json({ message: "Invalid input data" });
    }

    // Update item quantity
    const updatedCartItem = await editAmount(itemId, amount, fullPrice);
    if (!updatedCartItem) {
      return res.status(404).json({ message: "Item not found" });
    }

    console.log("🛒 Cart item successfully updated:", updatedCartItem);
    return res.json({
      message: "Item quantity updated successfully!",
      updatedCartItem,
    });
  } catch (error) {
    console.error("❌ Error updating item quantity:", error);
    return res.status(500).json({ message: "Internal Server Error" });
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
router.put("/deleteItem", allowUserOrAdmin, async (req, res, next) => {
  try {
    const { itemId } = req.query;

    // Validate input
    if (!itemId) {
      return res.status(400).json({ message: "Item ID is required" });
    }

    // Delete item from cart
    const deletedItem = await deleteItemFromCart(itemId);
    if (!deletedItem) {
      return res
        .status(404)
        .json({ message: "Item not found or already deleted" });
    }

    return res.json({ message: "Item deleted successfully!" });
  } catch (error) {
    console.error("❌ Error deleting item:", error);
    return next({ message: "GENERAL ERROR", status: 400 });
  }
});

module.exports = router;
