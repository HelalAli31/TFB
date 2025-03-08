const productModel = require("../../models/productSchema");
const categoryModel = require("../../models/categorySchema");
const TopProductsModel = require("../../models/topProductsSchema");

async function getTopProducts() {
  try {
    const topProducts = await TopProductsModel.find()
      .populate({
        path: "product_id",
        model: productModel, // Ensure this is correctly imported
        select: "name image price brand category",
        populate: {
          path: "category",
          model: categoryModel, // Ensure this is correctly imported
          select: "name", // Get only the category name
        },
      })
      .lean(); // Converts Mongoose documents to plain JS objects

    console.log("Fetched Top Products:", topProducts); // Debugging

    return topProducts.map((item) => {
      console.log("Product Category:", item.product_id.category); // Debugging
      return {
        _id: item.product_id._id,
        name: item.product_id.name,
        image: item.product_id.image,
        price: item.product_id.price,
        brand: item.product_id.brand,
        category: item.product_id.category
          ? item.product_id.category.name
          : "Unknown", // Ensure it's properly populated
      };
    });
  } catch (error) {
    console.error("Error fetching top products:", error);
    return [];
  }
}

async function getAllProducts(
  value,
  key,
  page = 1,
  limit = 50,
  sortBy = "name",
  order = "asc"
) {
  try {
    console.log(
      "Fetching products... Key:",
      key,
      "Value:",
      value,
      "Page:",
      page,
      "Limit:",
      limit,
      "SortBy:",
      sortBy,
      "Order:",
      order
    );

    const query = {};
    if (key && value) {
      if (key === "_id" || key === "category._id") {
        query[key] = value;
      } else {
        query[key] = { $regex: value, $options: "i" }; // Case-insensitive search
      }
    }

    const sortOption = {};
    sortOption[sortBy] = order === "desc" ? -1 : 1;

    const totalProducts = await productModel.countDocuments(query);
    const products = await productModel
      .find(query, { __v: false })
      .populate("category", "name", categoryModel)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit);

    return { products, totalProducts };
  } catch (error) {
    console.error("Error in getAllProducts:", error);
    return { products: [], totalProducts: 0 };
  }
}

async function addProduct(product) {
  try {
    const result = await productModel.insertMany([product]);
    if (result) return result;
  } catch (error) {
    console.log(error);
  }
}

async function deleteProduct(productId) {
  try {
    const result = await productModel.findByIdAndDelete(productId);
    if (result) {
      return result;
    } else {
      return;
    }
  } catch (error) {
    console.error("Error deleting product:", error);
  }
}

async function updateProduct(product) {
  try {
    const result = await productModel.updateOne({ _id: product._id }, product);
    return result;
  } catch (error) {
    console.log(error);
  }
}
async function productsNumber() {
  try {
    const result = await productModel.countDocuments();
    return result;
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  getAllProducts,
  addProduct,
  updateProduct,
  productsNumber,
  deleteProduct,
  getTopProducts,
};
