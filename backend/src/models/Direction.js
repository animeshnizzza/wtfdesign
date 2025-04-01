// backend/src/models/Direction.js
const mongoose = require('mongoose');

// Схема для подкатегорий
const subcategorySchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  }
});

// Схема для направлений дизайна
const directionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  subcategories: [subcategorySchema],
  active: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('Direction', directionSchema);