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
const router = express.Router();
const productModel = require("../models/productSchema");

const logger = require("../logger");
const { verifyJWT } = require("../controller/JWT/jwt");
const getValidationFunction = require("../validations/productValidation");
const multer = require("multer");
const fs = require("fs-extra");
const path = require("path");

// ✅ Step 1: Initialize Multer with Memory Storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage }); // ✅ Corrected Initialization
const productImagesDir = path.join(__dirname, "../assets/products");

// ✅ Ensure the directory exists
fs.ensureDirSync(productImagesDir);

// Route to handle product image upload
router.post("/upload-product-image", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  res.json({
    message: "Image uploaded successfully!",
    filePath: `/assets/products/${req.file.filename}`,
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
    console.log("TOPPP PRODUCTS: ");
    const result = await getTopProducts();
    if (!result.length) {
      return;
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
// ✅ Add Product (with Image Upload)
router.post(
  "/addProduct",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "colorImages", maxCount: 10 },
  ]),
  async (req, res) => {
    try {
      console.log("📩 Received addProduct request:", req.body);

      const productData = req.body;
      const mainImage = req.files?.image ? req.files.image[0] : null;
      const colorImages = req.files?.colorImages || [];

      const product = await addProduct(productData, mainImage, colorImages);
      if (!product) {
        return res
          .status(400)
          .json({ success: false, error: "Failed to add product" });
      }

      // ✅ Save the image if provided
      if (mainImage) {
        const imagePath = path.join(productImagesDir, `${product.name}.jpg`);
        await fs.writeFile(imagePath, mainImage.buffer);
        console.log(`✅ Saved main image: ${imagePath}`);
      }

      // ✅ Save color images if available
      for (const colorImage of colorImages) {
        const imagePath = path.join(
          productImagesDir,
          `${product.name}_${colorImage.originalname}`
        );
        await fs.writeFile(imagePath, colorImage.buffer);
        console.log(`✅ Saved color image: ${imagePath}`);
      }

      return res.status(201).json({ success: true, product });
    } catch (error) {
      console.error("❌ Error adding product:", error);
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
// ✅ Update Product - Should be PUT
// ✅ Update Product with Image
router.put("/updateProduct/:id", upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    let updatedData = req.body;

    if (typeof updatedData.details === "string") {
      updatedData.details = JSON.parse(updatedData.details);
    }

    const product = await productModel.findById(id);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    // ✅ Save updated image if provided
    if (req.file) {
      const imagePath = path.join(productImagesDir, `${product.name}.jpg`);
      await fs.writeFile(imagePath, req.file.buffer);
      console.log(`✅ Updated product image: ${imagePath}`);
    }

    const updatedProduct = await productModel.findByIdAndUpdate(
      id,
      updatedData,
      { new: true }
    );
    res.json({ success: true, product: updatedProduct });
  } catch (error) {
    console.error("❌ Error updating product:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ✅ DELETE PRODUCT (AND REMOVE IMAGES)
router.delete("/deleteProduct/:id", async (req, res) => {
  try {
    console.log(`🔍 Attempting to delete product with ID: ${req.params.id}`);

    // ✅ Find product in the database
    const product = await productModel.findById(req.params.id);
    if (!product) {
      console.log("❌ Product not found in database.");
      return res.status(404).json({ error: "Product not found" });
    }

    console.log(`🛒 Found product: ${product.name}`);

    // ✅ Determine images directory
    const imagesDir = path.join(__dirname, "../assets/products");

    if (!fs.existsSync(imagesDir)) {
      console.error(
        `❌ Error: Product images directory (${imagesDir}) does not exist.`
      );
      return res
        .status(500)
        .json({ error: "Product images directory not found." });
    }

    console.log(`📁 Product images directory exists: ${imagesDir}`);

    // ✅ Delete all related images (default + color variations)
    let deletedImages = [];
    const productName = product.name;

    try {
      const files = await fs.promises.readdir(imagesDir);

      // Filter images matching the product pattern
      const productImages = files.filter(
        (file) => file.startsWith(productName) && file.endsWith(".jpg")
      );

      console.log(
        `🔎 Found ${productImages.length} matching images for deletion.`
      );

      // Delete all found images
      await Promise.all(
        productImages.map(async (file) => {
          const filePath = path.join(imagesDir, file);
          try {
            await fs.promises.unlink(filePath);
            deletedImages.push(file);
            console.log(`✅ Deleted image: ${file}`);
          } catch (unlinkErr) {
            console.error(`❌ Error deleting image: ${file}`, unlinkErr);
          }
        })
      );
    } catch (readDirErr) {
      console.error("❌ Error reading image directory:", readDirErr);
    }

    // ✅ Delete product from database AFTER deleting images
    await productModel.findByIdAndDelete(req.params.id);
    console.log(`🗑️ Product ${product.name} deleted from database.`);

    return res.status(200).json({
      message: "✅ Product and associated images deleted successfully.",
      deletedImages,
    });
  } catch (err) {
    console.error("❌ Error deleting product or images:", err);
    return res.status(500).json({
      error: "An error occurred while deleting the product or its images.",
    });
  }
});

module.exports = router;
