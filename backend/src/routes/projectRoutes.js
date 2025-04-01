// backend/src/routes/projectRoutes.js
const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { authMiddleware } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Настройка хранилища для загрузки файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Разрешены только изображения'));
    }
  }
});

// Настройка полей для загрузки файлов
const projectUpload = upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'images', maxCount: 10 }
]);

// Маршруты для проектов
router.post('/', authMiddleware, projectUpload, projectController.createProject);
router.get('/', projectController.getAllProjects);
router.get('/:id', projectController.getProjectById);
router.put('/:id', authMiddleware, projectUpload, projectController.updateProject);
router.delete('/:id', authMiddleware, projectController.deleteProject);

// Взаимодействие с проектами
router.post('/:id/like', authMiddleware, projectController.likeProject);
router.post('/:id/comment', authMiddleware, projectController.addComment);
router.post('/:id/appreciation', authMiddleware, projectController.addAppreciation);
router.post('/:id/save', authMiddleware, projectController.saveProject);

// Получение проектов пользователя
router.get('/user/:userId', projectController.getUserProjects);

module.exports = router;