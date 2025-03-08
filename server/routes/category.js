const express = require("express");
const {
  getAllCategories,
  addCategory,
  updateCategory,
  getCategoryById,
  deleteCategory,
  checkIfCategoryAlreadyExists,
} = require("../controller/category/categoryController");
const logger = require("../logger/index");
const axios = require("axios");
const { verifyJWT } = require("../controller/JWT/jwt");
const getValidationFunction = require("../validations/categoryValidation");
const router = express.Router();

// Middleware to allow both users and admins
console.log("CATEGORY ");
router.post("/", async (req, res, next) => {
  try {
    console.log("HELLO ");
    const categories = await getAllCategories();
    if (!categories) throw new Error();
    console.log(categories);
    return res.json(categories);
  } catch (error) {
    return next({ message: "GENERAL ERROR", status: 400 });
  }
});

router.post("/byId", async (req, res, next) => {
  try {
    const category = await getCategoryById(req.body.categoryId);
    if (!category) throw new Error();
    console.log(category);
    return res.json(category);
  } catch (error) {
    return next({ message: "GENERAL ERROR", status: 400 });
  }
});

// Middleware to allow only admins
const allowOnlyAdmin = async (req, res, next) => {
  try {
    const clientJwt = req.headers?.authorization; // Extract token from headers
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
router.post(
  "/addCategory",
  allowOnlyAdmin,
  getValidationFunction("addCategory"),
  async (req, res, next) => {
    try {
      const categoryName = req.body.categoryName;

      // Validate input
      if (!categoryName) {
        return res.status(400).json({ message: "Category name is required" });
      }

      // Check if category already exists
      const exists = await checkIfCategoryAlreadyExists(categoryName);
      if (exists) {
        return res.status(409).json({ message: "Category already exists" }); // 409 Conflict
      }

      // Add the category if it doesn't exist
      const category = await addCategory(categoryName);
      console.log(category);

      if (!category) throw new Error("Failed to add category");

      return res
        .status(201)
        .json({ message: "Category has been added!", category });
    } catch (error) {
      console.error("Error adding category:", error);
      return res
        .status(500)
        .json({ message: "GENERAL ERROR", error: error.message });
    }
  }
);
router.post(
  "/updateCategoryById",
  allowOnlyAdmin,
  getValidationFunction("editCategory"),
  async (req, res, next) => {
    try {
      const category = await updateCategory(req.body);
      console.log(category);
      if (!category) throw new Error();
      return res.json("category has been edited!");
    } catch (error) {
      console.log("general error");
    }
    return next({ message: "GENERAL ERROR", status: 400 });
  }
);
router.post(
  "/deleteCategory",
  allowOnlyAdmin,
  getValidationFunction("deleteCategory"),
  async (req, res, next) => {
    try {
      const category = await deleteCategory(req.body.categoryId);
      console.log(category, "XX");
      if (!category) throw new Error();
      return res.json("category has been deleted!");
    } catch (error) {
      console.log("general error");
    }
    return next({ message: "GENERAL ERROR", status: 400 });
  }
);

module.exports = router;
