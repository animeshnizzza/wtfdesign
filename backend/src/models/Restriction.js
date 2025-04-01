// backend/src/models/Restriction.js
const mongoose = require('mongoose');

const restrictionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['color', 'technical', 'stylistic', 'emotional'],
    required: true
  },
  active: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('Restriction', restrictionSchema);