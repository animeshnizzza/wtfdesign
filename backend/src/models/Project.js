// backend/src/models/Project.js
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    default: null
  },
  taskDetails: {
    type: Object,
    default: null
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  coverImage: {
    type: String,
    required: true
  },
  images: [{
    url: String,
    caption: String
  }],
  tags: [String],
  tools: [String],
  likes: {
    count: {
      type: Number,
      default: 0
    },
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  views: {
    type: Number,
    default: 0
  },
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    text: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  appreciations: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    type: {
      type: String,
      enum: ['innovative', 'visually_appealing', 'functional', 'creative'],
      default: 'creative'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Обновляем дату изменения при обновлении
projectSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Индексы для более быстрого поиска
projectSchema.index({ title: 'text', description: 'text', tags: 'text' });
projectSchema.index({ creator: 1, createdAt: -1 });
projectSchema.index({ isPublic: 1, createdAt: -1 });

module.exports = mongoose.model('Project', projectSchema);