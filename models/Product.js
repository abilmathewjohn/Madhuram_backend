const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  category: { type: String, required: true },
  image: { type: String } // Stores image URL
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
