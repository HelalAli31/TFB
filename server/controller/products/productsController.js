const productModel = require("../../models/productSchema");
const categoryModel = require("../../models/categorySchema");
const TopProductsModel = require("../../models/topProductsSchema");

async function getTopProducts() {
  try {
    const topProducts = await TopProductsModel.find()
      .populate({
        path: "product_id",
        model: productModel,
        select: "name image price brand category quantity sale", // ✅ Ensure "sale" is included
        populate: {
          path: "category",
          model: categoryModel,
          select: "name",
        },
      })
      .lean();

    // ✅ Filter out out-of-stock products and apply sale pricing
    return topProducts
      .filter((item) => item.product_id.quantity > 0) // ✅ Exclude out-of-stock
      .map((item) => {
        let finalPrice = item.product_id.price; // Default price
        if (item.product_id.sale?.isOnSale) {
          const currentDate = new Date();
          if (
            new Date(item.product_id.sale.saleStartDate) <= currentDate &&
            new Date(item.product_id.sale.saleEndDate) >= currentDate
          ) {
            finalPrice = item.product_id.sale.salePrice; // ✅ Apply sale price
          }
        }

        return {
          _id: item.product_id._id,
          name: item.product_id.name,
          image: item.product_id.image,
          price: finalPrice, // ✅ Ensure correct price is sent
          brand: item.product_id.brand,
          category: item.product_id.category
            ? item.product_id.category.name
            : "Unknown",
          quantity: item.product_id.quantity,
          originalPrice: item.product_id.price, // ✅ Keep original price for UI
          sale: item.product_id.sale, // ✅ Pass sale details
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
  order = "asc",
  isSearch = false // ✅ New parameter to control pagination behavior
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
      order,
      "isSearch:",
      isSearch
    );

    const query = {};

    // 🔹 If searching, apply regex-based search on `name`, `brand`, or `category`
    if (value) {
      query["$or"] = [
        { name: { $regex: value, $options: "i" } },
        { brand: { $regex: value, $options: "i" } },
        { "category.name": { $regex: value, $options: "i" } },
      ];
    }

    const sortOption = {};
    sortOption[sortBy] = order === "desc" ? -1 : 1;

    const totalProducts = await productModel.countDocuments(query);
    let productsQuery = productModel
      .find(query, { __v: false })
      .populate("category", "name", categoryModel)
      .sort(sortOption);

    // ✅ If searching, do NOT apply pagination
    if (!isSearch) {
      productsQuery = productsQuery.skip((page - 1) * limit).limit(limit);
    }

    const products = await productsQuery;

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

async function addTopProduct(productId) {
  try {
    // Check if product already exists in TopProducts
    const existingProduct = await TopProductsModel.findOne({
      product_id: productId,
    });

    if (existingProduct) {
      throw new Error("Product is already in top products.");
    }

    // Create a new entry in the top products collection
    const newTopProduct = new TopProductsModel({ product_id: productId });
    const result = await newTopProduct.save();

    return result;
  } catch (error) {
    console.error("Error adding top product:", error.message);
    throw new Error("Error adding top product.");
  }
}

async function deleteTopProduct(productId) {
  try {
    // Ensure that we're deleting based on product_id
    const result = await TopProductsModel.findOneAndDelete({
      product_id: productId,
    });

    if (!result) {
      throw new Error(
        `Product with ID ${productId} not found in top products.`
      );
    }

    return result;
  } catch (error) {
    console.error("Error deleting top product:", error.message);
    throw new Error("Error deleting top product.");
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
  deleteTopProduct,
  addTopProduct,
};
