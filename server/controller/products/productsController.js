const productModel = require("../../models/productSchema");
const categoryModel = require("../../models/categorySchema");
const TopProductsModel = require("../../models/topProductsSchema");
const fs = require("fs-extra");
const path = require("path");

async function getTopProducts() {
  try {
    const topProducts = await TopProductsModel.find()
      .populate({
        path: "product_id",
        model: "Products", // ✅ Ensure model reference is correct
        select: "name image price brand category quantity sale details", // ✅ Added "details"
        populate: {
          path: "category",
          model: "category", // ✅ Ensure correct category model name
          select: "name",
        },
      })
      .lean();

    // ✅ Filter out items without product data or out-of-stock products
    return topProducts
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
          details: product.details, // ✅ Ensure details are returned
          sale: product.sale,
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

const addProduct = async (productData, mainImage, colorImages) => {
  try {
    console.log(
      "\n🚀 Received productData:",
      JSON.stringify(productData, null, 2)
    );

    if (!productData.name) {
      console.error("❌ ERROR: Product name is missing");
      return { success: false, message: "Product name is required." };
    }

    // ✅ Process product name
    const productName = productData.name.replace(/\s+/g, "").toLowerCase();
    console.log("📝 Processed product name:", productName);

    const productImagePath = path.join(
      __dirname,
      `../../../TFB-Front/src/assets/products`
    );
    await fs.ensureDir(productImagePath);
    console.log("📂 Ensured product image directory exists:", productImagePath);

    // ✅ Save Main Image
    if (mainImage) {
      console.log("🖼️ Received main image:", mainImage.originalname);
      const mainImagePath = path.join(productImagePath, `${productName}.jpg`);
      await fs.writeFile(mainImagePath, mainImage.buffer);
      console.log("✅ Main image saved at:", mainImagePath);
    } else {
      console.log("⚠️ No main image provided");
    }

    // ✅ Save ALL Color Images
    console.log("\n🎨 Received colorImages:", colorImages);

    if (Array.isArray(colorImages) && colorImages.length > 0) {
      console.log("🔍 Looping through color images...");
      const colorDetailsArray = [];

      for (const file of colorImages) {
        console.log(`🔹 Processing file: ${file.originalname}`);

        // ✅ Extract color name from filename (assumes 'color.jpg' format)
        const cleanColorName = file.originalname.split(".")[0].toLowerCase();
        console.log(`🎯 Extracted color name: ${cleanColorName}`);

        // ✅ Create file path (productName_color.jpg)
        const colorImagePath = path.join(
          productImagePath,
          `${productName}_${cleanColorName}.jpg`
        );
        console.log(
          `🖼️ Saving image for color: ${cleanColorName} -> ${colorImagePath}`
        );

        // ✅ Save image
        await fs.writeFile(colorImagePath, file.buffer);
        console.log(`✅ Color image saved successfully: ${colorImagePath}`);

        // ✅ Store color name (WITHOUT image path) in details
        colorDetailsArray.push({ color: cleanColorName });
      }

      // ✅ Update MongoDB details with color names only
      productData.details.color = colorDetailsArray;
      console.log(
        "\n✅ Updated details for MongoDB:",
        JSON.stringify(productData.details, null, 2)
      );
    } else {
      console.log("⚠️ No color images provided");
    }

    // ✅ Ensure `details` is a valid object before saving to MongoDB
    if (!productData.details || typeof productData.details === "string") {
      productData.details = productData.details
        ? JSON.parse(productData.details)
        : {};
    }

    // ✅ Save Product to Database
    console.log("💾 Saving product to MongoDB...");
    const newProduct = new productModel(productData);
    await newProduct.save();
    console.log("✅ Product saved successfully:", newProduct);

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
