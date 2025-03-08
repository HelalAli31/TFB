require("dotenv").config();
const express = require("express");
const cors = require("cors");
const createConnection = require("./connection/index");
const bodyParser = require("body-parser");
const productsRoute = require("./routes/product");
const categoryRoute = require("./routes/category");
const userRoute = require("./routes/auth");
const cartRoute = require("./routes/cart");
const orderRoute = require("./routes//orders");
//Routes
const app = express();

app.use(cors());
app.use(express.static("public"));

app.use(bodyParser.json());

createConnection();

app.use("/auth", userRoute);
app.use("/products", productsRoute);
app.use("/cart", cartRoute);
console.log("HEL");
app.use("/category", categoryRoute);
app.use("/orders", orderRoute);

app.use((error, req, res, next) => {
  console.log("in error handler...");
  res.send("Something went wrong");
});

app.listen(5000);
