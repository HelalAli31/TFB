const express = require("express");
const {
  getAllProducts,
  getTopProducts,
  addProduct,
  productsNumber,

  deleteTopProduct,
  addTopProduct,
} = require("../controller/products/productsController");
const axios = require("axios");
const mongoose = require("mongoose");

const router = express.Router();
const productModel = require("../models/productSchema");

const logger = require("../logger");
const { verifyJWT } = require("../controller/JWT/jwt");
const getValidationFunction = require("../validations/productValidation");
const multer = require("multer");
const path = require("path");
const {
  deleteImage,
  deleteImagesByPrefix,
  renameImage,
  uploadBuffer,
} = require("../config/cloudinary");

// ? Step 1: Initialize Multer with Memory Storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage }); // ? Corrected Initialization
// Route to handle product image upload
router.post("/upload-product-image", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const result = await uploadBuffer(req.file, "products", req.file.originalname);

  return res.json({
    message: "Image uploaded successfully!",
    filePath: result.secure_url,
  });
});
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
    const clientJwt = req.headers.authorization;
    console.log("?? Received Authorization Header:", clientJwt);

    if (!clientJwt || !clientJwt.startsWith("Bearer ")) {
      console.error("?? Missing or invalid token!");
      return res.status(403).json({ message: "Missing or invalid token" });
    }

    const token = clientJwt.split(" ")[1]; // ? Extract token correctly
    console.log("?? Extracted Token:", token);

    const verify = await verifyJWT(token);
    console.log("?? Decoded JWT Data:", verify);

    // ? Fix role extraction
    const user = Array.isArray(verify.data) ? verify.data[0] : verify.data;
    console.log("?? Extracted User Data:", user);

    if (!user || user.role !== "admin") {
      console.error("?? Admin access required!");
      return res.status(403).json({ message: "Admin access required" });
    }

    req.user = user; // ? Attach user data to request
    next(); // Proceed to next middleware
  } catch (error) {
    console.error("? Admin access error:", error);
    return res
      .status(403)
      .json({ message: "Admin Access Required", error: error.message });
  }
};

router.post("/topProducts", async (req, res, next) => {
  try {
    console.log("?? Fetching Top Products...");
    const result = await getTopProducts();
    console.log("TOPPPP PRODUCTS:", result);

    // if (!result.length) {
    //   console.log("?? No top products found.");
    //   return res.json([]); // ? Always return an empty array instead of exiting
    // }

    console.log("? Top Products Found:", result);
    return res.json(result);
  } catch (error) {
    console.error("? Error fetching top products:", error);
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

    if (!result.products) {
      return;
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
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "colorImages", maxCount: 10 },
  ]),
  async (req, res) => {
    try {
      console.log("Received addProduct request:", req.body);

      const productData = req.body;
      const mainImage = req.files?.image ? req.files.image[0] : null;
      const colorImages = req.files?.colorImages || [];

      const product = await addProduct(productData, mainImage, colorImages);
      if (!product || product.success === false) {
        return res
          .status(400)
          .json({ success: false, error: "Failed to add product" });
      }

      return res.status(201).json({ success: true, product });
    } catch (error) {
      console.error("Error adding product:", error);
      return res
        .status(500)
        .json({ success: false, error: "Internal server error" });
    }
  }
);

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
    console.log("ADD RTO TOP");
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

// ? DELETE PRODUCT (AND REMOVE IMAGES)
router.delete("/deleteProduct/:id", async (req, res) => {
  try {
    console.log(`Attempting to delete product with ID: ${req.params.id}`);

    const product = await productModel.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const deletedImages = await deleteImagesByPrefix("products", product.name);
    await productModel.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      message: "Product and associated images deleted successfully.",
      deletedImages,
    });
  } catch (err) {
    console.error("Error deleting product or images:", err);
    return res.status(500).json({
      error: "An error occurred while deleting the product or its images.",
    });
  }
});

router.delete("/deleteOptionImage/:id/:option", async (req, res) => {
  try {
    const { id, option } = req.params;
    const product = await productModel.findById(id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    await deleteImage("products", `${product.name}_${option}.jpg`);
    return res.json({ success: true, message: `Option image ${option}.jpg deleted.` });
  } catch (error) {
    console.error("Error deleting option image:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to delete option image." });
  }
});

router.put(
  "/updateProduct/:id",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "optionImages", maxCount: 10 },
  ]),
  async (req, res) => {
    try {
      const { id } = req.params;
      let updatedData = req.body;

      if (typeof updatedData.details === "string") {
        updatedData.details = JSON.parse(updatedData.details);
      }

      const product = await productModel.findById(id);
      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      }

      const newName = updatedData.name || product.name;
      const uploadedFiles = req.files || {};

      updatedData.sale = {
        isOnSale: updatedData.isOnSale === "true",
        salePercent: updatedData.salePercent ? Number(updatedData.salePercent) : 0,
        saleStartDate: updatedData.saleStartDate
          ? new Date(updatedData.saleStartDate)
          : null,
        saleEndDate: updatedData.saleEndDate ? new Date(updatedData.saleEndDate) : null,
      };

      if (updatedData.sale.isOnSale && updatedData.sale.salePercent > 0) {
        updatedData.sale.salePrice =
          product.price * ((100 - updatedData.sale.salePercent) / 100);
      } else {
        updatedData.sale.salePrice = null;
        updatedData.sale.saleStartDate = null;
        updatedData.sale.saleEndDate = null;
      }

      if (uploadedFiles.image?.[0]) {
        await uploadBuffer(uploadedFiles.image[0], "products", `${newName}.jpg`);
      } else if (product.name !== newName) {
        try {
          await renameImage("products", `${product.name}.jpg`, `${newName}.jpg`);
        } catch (error) {
          console.warn("Main product image was not renamed:", error.message);
        }
      }

      if (uploadedFiles.optionImages?.length) {
        for (const file of uploadedFiles.optionImages) {
          const optionName = path.parse(file.originalname).name.trim();
          await uploadBuffer(file, "products", `${newName}_${optionName}.jpg`);
        }
      }

      const options = product.details?.get?.("options");
      if (product.name !== newName && Array.isArray(options)) {
        for (const opt of options) {
          try {
            await renameImage(
              "products",
              `${product.name}_${opt.option}.jpg`,
              `${newName}_${opt.option}.jpg`
            );
          } catch (error) {
            console.warn(`Option image was not renamed (${opt.option}):`, error.message);
          }
        }
      }

      const updatedProduct = await productModel.findByIdAndUpdate(
        id,
        updatedData,
        { new: true }
      );

      return res.json({
        success: true,
        message: "Product updated successfully",
        product: updatedProduct,
      });
    } catch (error) {
      console.error("Error updating product:", error);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);

router.put("/products/applyBulkSale", async (req, res) => {
  try {
    const { categories, salePercent, saleStartDate, saleEndDate } = req.body;

    if (!categories || !salePercent || !saleStartDate || !saleEndDate) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    console.log("?? Bulk Sale Data Received:", req.body);

    const salePercentDecimal = Number(salePercent) / 100;

    // ? Fetch products from selected categories
    const products = await productModel.find({ category: { $in: categories } });

    if (!products.length) {
      return res.status(404).json({
        success: false,
        message: "No products found in selected categories",
      });
    }

    // ? Apply sale price calculation
    const bulkUpdates = products.map((product) => {
      const salePrice = Math.round(product.price * (1 - salePercentDecimal));

      return {
        updateOne: {
          filter: { _id: product._id },
          update: {
            $set: {
              "sale.isOnSale": true,
              "sale.salePercent": salePercent,
              "sale.salePrice": salePrice,
              "sale.saleStartDate": new Date(saleStartDate),
              "sale.saleEndDate": new Date(saleEndDate),
            },
          },
        },
      };
    });

    console.log("?? Bulk update operations:", bulkUpdates);

    if (bulkUpdates.length > 0) {
      const result = await productModel.bulkWrite(bulkUpdates);
      console.log("? Bulk update result:", result);
    }

    res.json({
      success: true,
      message: `Sale applied to ${bulkUpdates.length} products`,
    });
  } catch (error) {
    console.error("? Error applying bulk sale:", error);
    res
      .status(500)
      .json({ success: false, message: "Internal server error", error });
  }
});

module.exports = router;
