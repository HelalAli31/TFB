const Category = require("../../models/categorySchema");
const {
  deleteImage,
  renameImage,
  uploadBuffer,
} = require("../../config/cloudinary");

const getAllCategories = async () => {
  return await Category.find({});
};

const getCategoryById = async (categoryId) => {
  return await Category.findById(categoryId);
};

const checkIfCategoryAlreadyExists = async (categoryName) => {
  return await Category.findOne({ name: categoryName });
};

const addCategory = async (categoryName, imageFile) => {
  try {
    const newCategory = new Category({ name: categoryName });
    await newCategory.save();

    if (imageFile) {
      await uploadBuffer(imageFile, "categories", `${categoryName}.jpg`);
    }

    return newCategory;
  } catch (error) {
    console.error("Error adding category:", error);
    return null;
  }
};

const updateSlider = async (newName, imageFile) => {
  try {
    if (imageFile) {
      await uploadBuffer(imageFile, "sliders", newName);
    }
  } catch (error) {
    console.error("Error updating slider:", error);
    return null;
  }
};

const updateCategory = async (categoryId, newName, imageFile) => {
  try {
    const category = await Category.findById(categoryId);
    if (!category) return null;

    if (category.name !== newName && !imageFile) {
      try {
        await renameImage("categories", `${category.name}.jpg`, `${newName}.jpg`);
      } catch (error) {
        console.warn("Category image was not renamed:", error.message);
      }
    }

    if (imageFile) {
      await uploadBuffer(imageFile, "categories", `${newName}.jpg`);
    }

    category.name = newName;
    await category.save();
    return category;
  } catch (error) {
    console.error("Error updating category:", error);
    return null;
  }
};

const deleteCategory = async (categoryId) => {
  try {
    const category = await Category.findByIdAndDelete(categoryId);
    if (!category) return null;

    await deleteImage("categories", `${category.name}.jpg`);

    console.log(`Category ${category.name} deleted successfully.`);
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
  updateSlider,
};
