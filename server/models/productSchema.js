const { required } = require("@hapi/joi");
const mongoose = require("mongoose");

// Define the schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String, required: true },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "category",
    required: true,
  }, // Reference to category (e.g., 'kits')
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  description: { type: String, required: true },
  sale: {
    isOnSale: { type: Boolean, default: false },
  },
  // Type-specific details
  details: {
    type: Map, // Flexible structure to accommodate type-specific fields
    of: mongoose.Schema.Types.Mixed, // Allows different data types
    required: false,
  },

  // Optional fields for metadata or tracking
  createdAt: { type: Date, default: Date.now, require: false },
  updatedAt: { type: Date, default: Date.now, require: false },
});

// Compile the model
const ProductModel = mongoose.model("Products", productSchema);

module.exports = ProductModel;
