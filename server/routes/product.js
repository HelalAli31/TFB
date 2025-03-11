const express = require("express");
const {
  getAllProducts,
  getTopProducts,
  addProduct,
  productsNumber,
  updateProduct,
  deleteProduct,
  deleteTopProduct,
  addTopProduct,
} = require("../controller/products/productsController");
const axios = require("axios");
const router = express.Router();
const productModel = require("../models/productSchema");

const logger = require("../logger");
const { verifyJWT } = require("../controller/JWT/jwt");
const getValidationFunction = require("../validations/productValidation");
// Middleware to allow both users and admins
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
    const clientJwt = req.headers.authorization; // Extract token from headers
    if (!clientJwt) {
      throw new Error("Missing Authorization token");
    }

    const verify = await verifyJWT(clientJwt); // Verify the token
    const role = verify?.data?.[0]?.role;
    if (role === "admin") {
      req.user = verify.data[0]; // Attach user data to the request
      return next(); // Proceed to the next middleware or route
    }

    throw new Error("Admin access required"); // If role is not admin
  } catch (error) {
    logger.error("Admin access error:", error);
    return res
      .status(403)
      .json({ message: "Admin Access Required", error: error.message });
  }
};

router.post("/topProducts", async (req, res, next) => {
  try {
    const result = await getTopProducts();
    if (!result.length) {
      return res.status(404).json({ message: "No top products found" });
    }
    console.log(result);
    return res.json(result);
  } catch (error) {
    console.log("Error fetching top products:", error);
    return next({ message: "GENERAL ERROR", status: 500 });
  }
});

router.post("/", async (req, res, next) => {
  try {
    console.log("Fetching all products...");

    const { keyName, valueName, page, limit, sortBy, order } = req.body;
    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 50;

    const result = await getAllProducts(
      valueName,
      keyName,
      pageNumber,
      limitNumber,
      sortBy,
      order
    );

    if (!result.products || result.products.length === 0) {
      return res.status(404).json({ message: "No products found" });
    }

    return res.json(result);
  } catch (error) {
    console.log(error);
    return next({ message: "GENERAL ERROR", status: 500 });
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const productId = req.params.id; // Extract product ID from URL parameter

    // Find the product by ID
    const product = await productModel
      .findById(productId)
      .populate("category", "name")
      .lean();

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let finalPrice = product.price;
    if (product.sale?.isOnSale) {
      const currentDate = new Date();
      if (
        new Date(product.sale.saleStartDate) <= currentDate &&
        new Date(product.sale.saleEndDate) >= currentDate
      ) {
        finalPrice = product.sale.salePrice;
      }
    }

    // Include the final price considering any ongoing sale
    product.finalPrice = finalPrice;

    return res.json(product);
  } catch (error) {
    console.log(error);
    return next({ message: "Error fetching product details", status: 500 });
  }
});

router.get("/productsNumber", async (req, res, next) => {
  const result = await productsNumber();
  if (!result) return res.json(0);
  return res.json(result);
});

// add product (product)
router.post(
  "/addProduct",
  allowOnlyAdmin,
  getValidationFunction("ProductAction"),
  async (req, res, next) => {
    console.log(req.body.product);
    try {
      const result = await addProduct(req.body.product);
      if (!result) throw new Error();
      return res.json("product has been added!");
    } catch (error) {
      console.log(error);
      return next({ message: "GENERAL ERROR", status: 400 });
    }
  }
);
router.post("/deleteProduct", allowOnlyAdmin, async (req, res, next) => {
  try {
    if (!req.body.productId) throw new Error();
    const result = await deleteProduct(req.body.productId);
    if (!result) throw new Error();
    return res.json("product has been deleted!");
  } catch (error) {
    console.log(error);
    return next({ message: "GENERAL ERROR", status: 400 });
  }
});
router.post("/deleteTopProduct", allowOnlyAdmin, async (req, res, next) => {
  try {
    if (!req.body.productId) throw new Error("Missing product ID");
    console.log(req.body.productId);
    const result = await deleteTopProduct(req.body.productId);
    if (!result) throw new Error("Failed to delete top product");

    return res.json("Top product has been deleted!");
  } catch (error) {
    console.log(error);
    return next({ message: "GENERAL ERROR", status: 400 });
  }
});
router.post("/addTopProduct", allowOnlyAdmin, async (req, res, next) => {
  try {
    if (!req.body.productId) throw new Error("Missing product ID");

    const result = await addTopProduct(req.body.productId);
    if (!result) throw new Error("Failed to add top product");

    return res.json({
      message: "Top product has been added!",
      product: result,
    });
  } catch (error) {
    console.error(error);
    return next({ message: "GENERAL ERROR", status: 400 });
  }
});

router.post(
  "/updateProduct",
  allowOnlyAdmin,
  getValidationFunction("ProductAction"),
  async (req, res, next) => {
    try {
      const result = await updateProduct(req.body.product);
      if (!result) throw new Error();
      return res.json("product has been updated!");
    } catch (error) {
      console.log(error);
      return next({ message: "GENERAL ERROR", status: 400 });
    }
  }
);
module.exports = router;
