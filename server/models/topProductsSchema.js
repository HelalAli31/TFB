const mongoose = require("mongoose");

const topProductsSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "products",
  },
});

const TopProductsModel = mongoose.model("topProducts", topProductsSchema);
module.exports = TopProductsModel;
