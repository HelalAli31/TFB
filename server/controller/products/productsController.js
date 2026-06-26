const productModel = require("../../models/productSchema");
const categoryModel = require("../../models/categorySchema");
const TopProductsModel = require("../../models/topProductsSchema");
const path = require("path");
const { uploadBuffer } = require("../../config/cloudinary");

async function getTopProducts() {
  try {
    const topProducts = await TopProductsModel.find()
      .populate({
        path: "product_id",
        model: "Products", // ✅ Ensure correct model name
        select: "name image price brand category quantity sale details",
        populate: {
          path: "category",
          model: "category", // ✅ Ensure correct category model name
          select: "name",
        },
      })
      .lean()
      .exec(); // ✅ Ensure execution

    console.log("📌 Raw Top Products (After Populate):", topProducts);

    if (!topProducts || topProducts.length === 0) {
      console.warn("⚠️ No top products found in database.");
      return [];
    }

    // ✅ Ensure that populated data is available
    const filteredProducts = topProducts
      .filter((item) => item.product_id && item.product_id.quantity > 0)
      .map((item) => {
        const product = item.product_id;
        let finalPrice = product.price;

        if (
          product.sale?.isOnSale &&
          new Date(product.sale.saleStartDate) <= new Date() &&
          new Date(product.sale.saleEndDate) >= new Date()
        ) {
          finalPrice = product.sale.salePrice;
        }

        return {
          _id: product._id,
          name: product.name,
          price: finalPrice,
          brand: product.brand,
          category: product.category?.name || "Unknown",
          quantity: product.quantity,
          originalPrice: product.price,
          details: product.details,
          sale: product.sale,
        };
      });

    console.log("✅ Filtered Top Products:", filteredProducts);
    return filteredProducts;
  } catch (error) {
    console.error("❌ Error fetching top products:", error);
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
    if (!isSearch && !value) {
      productsQuery = productsQuery.skip((page - 1) * limit).limit(limit);
    }

    const products = await productsQuery;

    return { products, totalProducts };
  } catch (error) {
    console.error("Error in getAllProducts:", error);
    return { products: [], totalProducts: 0 };
  }
}
const addProduct = async (productData, mainImage, optionImages) => {
  try {
    console.log(
      "\n🚀 Received productData:",
      JSON.stringify(productData, null, 2)
    );

    if (!productData.name) {
      console.error("❌ ERROR: Product name is missing");
      return { success: false, message: "Product name is required." };
    }

    // ✅ Keep original product name with spaces
    const productName = productData.name.trim();
    if (!productName) {
      console.error("❌ ERROR: Processed product name is empty");
      return { success: false, message: "Invalid product name." };
    }
    console.log("📝 Processed product name:", productName);

    // ✅ Convert details to JSON object if needed
    if (!productData.details) {
      productData.details = {};
    } else if (typeof productData.details === "string") {
      try {
        productData.details = JSON.parse(productData.details);
        delete productData.details.name;
      } catch (error) {
        console.error("❌ Error parsing `details` JSON:", error);
        return { success: false, error: "Invalid details format" };
      }
    }

    // ✅ Save the product in MongoDB **FIRST**
    console.log("💾 Saving product to MongoDB...");
    const newProduct = new productModel({ ...productData, name: productName });
    await newProduct.save();
    console.log("✅ Product saved successfully:", newProduct);

    // ✅ Process option images
    console.log("\n🎨 Processing option images...");
    const optionDetailsArray = [];

    if (optionImages && optionImages.length > 0) {
      for (const file of optionImages) {
        console.log(`🔹 Processing file: ${file.originalname}`);

        // ✅ Extract and validate option name correctly
        let optionName = path.parse(file.originalname).name.trim(); // ✅ Keep spaces

        // ✅ Skip invalid option names (empty, "undefined", or missing name)
        if (!optionName || optionName.toLowerCase() === "undefined") {
          console.warn(
            `⚠️ Skipping invalid option image: ${file.originalname}`
          );
          continue;
        }

        await uploadBuffer(file, "products", `${productName}_${optionName}.jpg`);
        console.log(`✅ Option image uploaded: ${productName}_${optionName}.jpg`);

        // ✅ Store option data in `details`
        optionDetailsArray.push({ option: optionName });
      }

      // ✅ Add option details to `details` in MongoDB
      if (optionDetailsArray.length > 0) {
        newProduct.details.options = optionDetailsArray;
        await newProduct.save();
      }
    } else if (mainImage) {
      // ✅ Only save `name.jpg` if no option variations exist
      await uploadBuffer(mainImage, "products", `${productName}.jpg`);
      console.log(`✅ Main image uploaded: ${productName}.jpg`);
    } else {
      console.log("⚠️ No images provided.");
    }

    console.log(
      "\n✅ Final `details` saved to MongoDB:",
      JSON.stringify(newProduct.details, null, 2)
    );

    return { success: true, product: newProduct };
  } catch (error) {
    console.error("❌ Error adding product:", error);
    return { success: false, error: error.message };
  }
};

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
    console.log("ADDING TO");
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
