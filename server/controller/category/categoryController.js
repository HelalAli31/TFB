const categoryModel = require("../../models/categorySchema");
async function getAllCategories() {
  try {
    let result = await categoryModel.find({}, { __v: false });
    if (result) return result;
  } catch (error) {
    console.log(error);
  }
}

async function getCategoryById(categoryId) {
  try {
    const result = await categoryModel.find(
      { _id: categoryId },
      { __v: false }
    );
    return result;
  } catch (error) {
    console.log(error);
  }
}
async function checkIfCategoryAlreadyExists(categoryName) {
  try {
    // Check if a category with the same name exists
    const existingCategory = await categoryModel.findOne({
      name: categoryName,
    });
    return existingCategory !== null; // Returns true if category exists, false otherwise
  } catch (error) {
    console.error("Error checking category existence:", error);
    throw new Error("Database query failed");
  }
}
async function addCategory(categoryName) {
  try {
    const result = await categoryModel.insertMany([{ name: categoryName }]);
    return result;
  } catch (error) {
    console.log(error);
  }
}

async function updateCategory(bodyParams) {
  const { name, categoryId } = bodyParams;
  try {
    const result = await categoryModel.updateOne(
      { _id: categoryId },
      { name: name }
    );
    return result;
  } catch (error) {
    console.log(error);
  }
}
async function deleteCategory(categoryId) {
  try {
    const result = await categoryModel.findByIdAndDelete(categoryId);
    return result;
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  getAllCategories,
  addCategory,
  updateCategory,
  getCategoryById,
  deleteCategory,
  deleteCategory,
  checkIfCategoryAlreadyExists,
};
