const fs = require("fs-extra");
const path = require("path");
const Category = require("../../models/categorySchema"); // Ensure this model exists

// ✅ Define the correct path for category images in the backend server
const categoriesDir = path.join("/mnt/data/assets/categories");
const slidersDir = path.join("/mnt/data/assets/sliders");

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
      const uploadPath = path.join(categoriesDir, `${categoryName}.jpg`);
      await fs.ensureDir(path.dirname(uploadPath)); // Ensure folder exists
      await fs.writeFile(uploadPath, imageFile.buffer); // Save the file
      console.log(`✅ Image saved at: ${uploadPath}`);
    }

    return newCategory;
  } catch (error) {
    console.error("❌ Error adding category:", error);
    return null;
  }
};

const updateSlider = async (newName, imageFile) => {
  try {
    const newImagePath = path.join(slidersDir, `${newName}`);

    // If a new image is uploaded, replace the old one
    if (imageFile) {
      await fs.writeFile(newImagePath, imageFile.buffer);
      console.log(`✅ Updated image for : ${newName}`);
    }
  } catch (error) {
    console.error("❌ Error updating slider:", error);
    return null;
  }
};
// ✅ Update a Category (Name & Image)
const updateCategory = async (categoryId, newName, imageFile) => {
  try {
    const category = await Category.findById(categoryId);
    if (!category) return null;

    const oldImagePath = path.join(categoriesDir, `${category.name}.jpg`);
    const newImagePath = path.join(categoriesDir, `${newName}.jpg`);

    // If name is changed, rename the image file
    if (category.name !== newName) {
      console.log(`🔄 Renaming category from ${category.name} to ${newName}`);

      category.name = newName;

      if (fs.existsSync(oldImagePath)) {
        await fs.rename(oldImagePath, newImagePath);
        console.log(`✅ Renamed image: ${oldImagePath} → ${newImagePath}`);
      }
    }

    // If a new image is uploaded, replace the old one
    if (imageFile) {
      await fs.writeFile(newImagePath, imageFile.buffer);
      console.log(`✅ Updated image for category: ${newName}`);
    }

    await category.save();
    return category;
  } catch (error) {
    console.error("❌ Error updating category:", error);
    return null;
  }
};

// ✅ Delete a Category (and its Image)
const deleteCategory = async (categoryId) => {
  try {
    const category = await Category.findByIdAndDelete(categoryId);
    if (!category) return null;

    const imagePath = path.join(categoriesDir, `${category.name}.jpg`);

    if (fs.existsSync(imagePath)) {
      await fs.unlink(imagePath); // Delete image
      console.log(`🗑️ Deleted category image: ${imagePath}`);
    }

    console.log(`✅ Category ${category.name} deleted successfully.`);
    return category;
  } catch (error) {
    console.error("❌ Error deleting category:", error);
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
  updateSlider,
};
