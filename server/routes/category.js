const express = require("express");
const multer = require("multer");
const {
  getAllCategories,
  addCategory,
  updateCategory,
  getCategoryById,
  deleteCategory,
  checkIfCategoryAlreadyExists,
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
    const clientJwt = req.headers?.authorization;
    if (!clientJwt) throw new Error("Missing Authorization token");

    const verify = await verifyJWT(clientJwt);
    const role = verify?.data?.[0]?.role;
    if (role === "admin") {
      req.user = verify.data[0];
      return next();
    }

    throw new Error("Admin access required");
  } catch (error) {
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
