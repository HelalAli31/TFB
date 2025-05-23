const express = require("express");
const {
  getOrder,
  addOrder,
  getOrdersNumber,
  getAllOrders,
} = require("../controller/orders/orderController");
const { updateCartStatus } = require("../controller/cart/cartController");
const router = express.Router();
const { verifyJWT } = require("../controller/JWT/jwt");
const logger = require("../logger/index");
const getValidationFunction = require("../validations/orderValidation");

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

// Middleware to allow only admins
const allowOnlyAdmin = async (req, res, next) => {
  try {
    const clientJwt = req.headers.authorization;
    console.log("🔍 Received Authorization Header:", clientJwt);

    if (!clientJwt || !clientJwt.startsWith("Bearer ")) {
      console.error("🚨 Missing or invalid token!");
      return res.status(403).json({ message: "Missing or invalid token" });
    }

    const token = clientJwt.split(" ")[1]; // ✅ Extract token correctly
    console.log("🔍 Extracted Token:", token);

    const verify = await verifyJWT(token);
    console.log("🔍 Decoded JWT Data:", verify);

    // ✅ Fix role extraction
    const user = Array.isArray(verify.data) ? verify.data[0] : verify.data;
    console.log("🔍 Extracted User Data:", user);

    if (!user || user.role !== "admin") {
      console.error("🚨 Admin access required!");
      return res.status(403).json({ message: "Admin access required" });
    }

    req.user = user; // ✅ Attach user data to request
    next(); // Proceed to next middleware
  } catch (error) {
    console.error("❌ Admin access error:", error);
    return res
      .status(403)
      .json({ message: "Admin Access Required", error: error.message });
  }
};
router.get("/getOrdersNumber", async (req, res, next) => {
  try {
    const order = await getOrdersNumber(req.body.order);
    if (!order) throw new Error();
    return res.json(order);
  } catch (error) {
    console.log(error);
    return next({ message: "GENERAL ERROR", status: 400 });
  }
});

router.post(
  "/",
  // allowUserOrAdmin,
  getValidationFunction("getOrder"),
  async (req, res, next) => {
    try {
      const { cartId } = req.query;
      const order = await getOrder(cartId);
      if (!order) throw new Error();
      return res.json({ order });
    } catch (error) {
      console.log(error);
      return next({ message: "GENERAL ERROR", status: 400 });
    }
  }
);

router.post(
  "/addOrder",
  // allowUserOrAdmin,
  getValidationFunction("addOrder"),
  async (req, res, next) => {
    try {
      const order = await addOrder(req.body.order);
      if (!order) throw new Error();
      console.log("CART TO CHANGE:", req.body);
      const result = await updateCartStatus(req.body.order.cart_id);
      console.log("RESULT FOR CHANGE:", result);
      return res.json({ order: order, message: "order Successfully!" });
    } catch (error) {
      console.log(error);
      return next({ message: "GENERAL ERROR", status: 400 });
    }
  }
);

router.post(
  "/All", //allowOnlyAdmin,
  async (req, res, next) => {
    try {
      const { userId } = req.body;
      const order = await getAllOrders(userId);
      if (!order) throw new Error();
      return res.json({ orders: order });
    } catch (error) {
      console.log(error);
      return next({ message: "GENERAL ERROR", status: 400 });
    }
  }
);
router.delete(
  "/deleteOrder",
  // allowOnlyAdmin,
  getValidationFunction("deleteOrder"),
  async (req, res, next) => {
    try {
      const { orderId } = req.body;
      const order = await deleteOrder(orderId);
      if (!order) throw new Error("Order not found");
      return res.json({ message: "Order deleted successfully", order });
    } catch (error) {
      console.log(error);
      return next({
        message: "GENERAL ERROR",
        status: 400,
        error: error.message,
      });
    }
  }
);

router.put(
  "/updateOrder",
  // allowOnlyAdmin,
  getValidationFunction("updateOrder"),
  async (req, res, next) => {
    try {
      const { orderId, updateData } = req.body;
      const order = await updateOrder(orderId, updateData);
      if (!order) throw new Error("Order not found or update failed");
      return res.json({ message: "Order updated successfully", order });
    } catch (error) {
      console.log(error);
      return next({
        message: "GENERAL ERROR",
        status: 400,
        error: error.message,
      });
    }
  }
);
module.exports = router;
