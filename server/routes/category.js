const express = require("express");
const multer = require("multer");
const {
  getAllCategories,
  addCategory,
  updateCategory,
  getCategoryById,
  deleteCategory,
  checkIfCategoryAlreadyExists,
  updateSlider,
} = require("../controller/category/categoryController"); // ✅ Correct path

const { verifyJWT } = require("../controller/JWT/jwt");
const getValidationFunction = require("../validations/categoryValidation");
const router = express.Router();

// 🔹 Middleware for Image Uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ Middleware to allow only admins
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

// ✅ Get all categories
router.get("/", async (req, res) => {
  try {
    const categories = await getAllCategories();
    return res.json(categories);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "GENERAL ERROR", error: error.message });
  }
});

// ✅ Get Category by ID
router.post("/byId", async (req, res) => {
  try {
    const category = await getCategoryById(req.body.categoryId);
    if (!category)
      return res.status(404).json({ message: "Category not found" });

    return res.json(category);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "GENERAL ERROR", error: error.message });
  }
});

// ✅ Add a new category with an image
router.post(
  "/addCategory",
  allowOnlyAdmin,
  upload.single("image"),
  async (req, res) => {
    try {
      const { categoryName } = req.body;
      if (!categoryName)
        return res.status(400).json({ message: "Category name is required" });

      const exists = await checkIfCategoryAlreadyExists(categoryName);
      if (exists)
        return res.status(409).json({ message: "Category already exists" });

      const category = await addCategory(categoryName, req.file);
      if (!category) throw new Error("Failed to add category");

      return res.status(201).json({ message: "Category added!", category });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "GENERAL ERROR", error: error.message });
    }
  }
);

// ✅ Update Category (Name & Image)
router.post(
  "/updateCategory",
  allowOnlyAdmin,
  upload.single("image"),
  async (req, res) => {
    try {
      const { categoryId, categoryName } = req.body;
      if (!categoryId || !categoryName)
        return res.status(400).json({ message: "Missing parameters" });

      const category = await updateCategory(categoryId, categoryName, req.file);
      if (!category)
        return res.status(404).json({ message: "Category not found" });

      return res.status(200).json({ message: "Category updated!", category });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "GENERAL ERROR", error: error.message });
    }
  }
);
router.post(
  "/updateSlider",
  allowOnlyAdmin,
  upload.single("image"),
  async (req, res) => {
    try {
      const { sliderName } = req.body;
      if (!sliderName)
        return res.status(400).json({ message: "Missing parameters" });

      const slider = await updateSlider(sliderName, req.file);

      return res.status(200).json({ message: "Slider updated!", slider });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "GENERAL ERROR", error: error.message });
    }
  }
);

// ✅ Delete Category (and its Image)
router.post("/deleteCategory", allowOnlyAdmin, async (req, res) => {
  try {
    const { categoryId } = req.body;
    if (!categoryId)
      return res.status(400).json({ message: "Category ID required" });

    const category = await deleteCategory(categoryId);
    if (!category)
      return res.status(404).json({ message: "Category not found" });

    return res.status(200).json({ message: "Category deleted successfully!" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "GENERAL ERROR", error: error.message });
  }
});

module.exports = router;
