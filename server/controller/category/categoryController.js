const fs = require("fs-extra");
const path = require("path");
const Category = require("../../models/categorySchema"); // Ensure this model exists

// ✅ Get All Categories
const getAllCategories = async () => {
  return await Category.find({});
};

// ✅ Get Category by ID
const getCategoryById = async (categoryId) => {
  return await Category.findById(categoryId);
};

// ✅ Check if Category Exists
const checkIfCategoryAlreadyExists = async (categoryName) => {
  return await Category.findOne({ name: categoryName });
};

// ✅ Add a Category (with Image)
const addCategory = async (categoryName, imageFile) => {
  try {
    // Save category in DB
    const newCategory = new Category({ name: categoryName });
    await newCategory.save();

    // Save image if uploaded
    if (imageFile) {
      const uploadPath = path.join(
        __dirname,
        `../../../TFB-Front/src/assets/categories/${categoryName}.jpg`
      );
      await fs.ensureDir(path.dirname(uploadPath)); // Ensure folder exists
      await fs.writeFile(uploadPath, imageFile.buffer); // Save the file
    }

    return newCategory;
  } catch (error) {
    console.error("Error adding category:", error);
    return null;
  }
};

// ✅ Update a Category (Name & Image)
const updateCategory = async (categoryId, newName, imageFile) => {
  try {
    const category = await Category.findById(categoryId);
    if (!category) return null;

    const oldImagePath = path.join(
      __dirname,
      `../../../TFB-Front/src/assets/categories/${category.name}.jpg`
    );
    const newImagePath = path.join(
      __dirname,
      `../../../TFB-Front/src/assets/categories/${newName}.jpg`
    );

    // If name is changed, rename the image file
    if (category.name !== newName) {
      category.name = newName;
      if (fs.existsSync(oldImagePath)) {
        await fs.rename(oldImagePath, newImagePath);
      }
    }

    // If a new image is uploaded, replace the old one
    if (imageFile) {
      await fs.writeFile(newImagePath, imageFile.buffer);
    }

    await category.save();
    return category;
  } catch (error) {
    console.error("Error updating category:", error);
    return null;
  }
};

// ✅ Delete a Category (and its Image)
const deleteCategory = async (categoryId) => {
  try {
    const category = await Category.findByIdAndDelete(categoryId);
    if (!category) return null;

    const imagePath = path.join(
      __dirname,
      `../../../TFB-Front/src/assets/categories/${category.name}.jpg`
    );
    if (fs.existsSync(imagePath)) {
      await fs.unlink(imagePath); // Delete image
    }

    return category;
  } catch (error) {
    console.error("Error deleting category:", error);
    return null;
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  addCategory,
  updateCategory,
  deleteCategory,
  checkIfCategoryAlreadyExists,
};
