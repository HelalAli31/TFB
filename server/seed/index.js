require("dotenv").config();
const createConnection = require("../connection/index");
const { insertCategoryToDB } = require("./SeedController/category");
const {
  insertProductsToDB,
  insertTopProductsToDB,
} = require("./SeedController/products");
const { insertUsersToDB } = require("./SeedController/users");
const { insertCartToDB } = require("./SeedController/cart");
const { insertCartItemsToDB } = require("./SeedController/cartItems");

createConnection();
setTimeout(async () => {
  try {
    // Uncomment these lines as needed
    //await insertProductsToDB();
    //await insertUsersToDB();
    // await insertCartToDB();
    await insertTopProductsToDB();
  } catch (error) {
    console.error("Error during seeding:", error);
  } finally {
    console.log("Closing process.");
    process.exit(0); // Ensures process exits after all operations
  }
}, 1000);
