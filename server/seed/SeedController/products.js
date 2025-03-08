const ProductsModel = require("../../models/productSchema");
const categoryModel = require("../../models/categorySchema");
const TopProductsModel = require("../../models/topProductsSchema");

async function insertProductsToDB() {
  try {
    const resultProducts = await ProductsModel.find();

    const resultCategory = await categoryModel.find();
    if (resultProducts.length) return;
    const result = await ProductsModel.insertMany(
      ProductsData(resultCategory[0]?._id, resultCategory[1]?._id)
    );
    console.log(result);
  } catch (ex) {
    console.log(ex);
  } finally {
    process.exit(0);
  }
}
async function insertTopProductsToDB() {
  try {
    const result = await TopProductsModel.insertMany(TopProductsData());
    console.log(result);
  } catch (ex) {
    console.log(ex);
  } finally {
    process.exit(0);
  }
}

function TopProductsData() {
  return [
    { product_id: "6776e062613bb7a830671ddb" },
    { product_id: "6776e062613bb7a830671ddc" },
    { product_id: "6776e062613bb7a830671ddd" },
  ];
}

function ProductsData(categoryId, categoryId2) {
  return [
    {
      name: "fluffi",
      brand: "aspire",
      category: categoryId,
      price: 60,
      quantity: 15,
      image: "image.jpg",
      description: "fluffi is nice",
      details: {
        wattage: 75,
        color: "black",
      },
      createdAt: "2025-01-02T12:00:00Z",
      updatedAt: "2025-01-02T12:00:00Z",
    },
    {
      name: "s100",
      brand: "geekvape",
      category: categoryId2,
      price: 60,
      quantity: 15,
      image: "image.jpg",
      description: "geekvape is nice",
      details: {
        wattage: 75,
        color: "black",
      },
      createdAt: "2025-01-02T12:00:00Z",
      updatedAt: "2025-01-02T12:00:00Z",
    },
    {
      name: "minican pod 0.8",
      brand: "minican",
      category: categoryId2,
      price: 60,
      quantity: 15,
      image: "image.jpg",
      description: "minican is nice",
      details: {
        wattage: "12-15W",
      },
      createdAt: "2025-01-02T12:00:00Z",
      updatedAt: "2025-01-02T12:00:00Z",
    },
  ];
}

module.exports = { insertProductsToDB, insertTopProductsToDB };
