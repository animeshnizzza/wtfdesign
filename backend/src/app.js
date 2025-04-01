// src/app.js - основной файл приложения
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const projectRoutes = require('./routes/projectRoutes');

// Загружаем переменные окружения
dotenv.config();

// Импортируем модули
const {
  generateTask,
  designDirections,
  colorRestrictions,
  technicalRestrictions,
  stylisticRestrictions,
  emotionalRestrictions
} = require('./taskGenerator');

// Импортируем контроллеры
const taskController = require('./controllers/taskController');
const authController = require('./controllers/authController');
// Импортируем контроллер ограничений
const restrictionController = require('./controllers/restrictionController');
const { authMiddleware, adminMiddleware } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3001;

// Подключение к MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/wtfdesign', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB подключена'))
.catch(err => console.error('Ошибка подключения к MongoDB:', err));

// Настройка загрузки файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_PATH || 'uploads');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Middleware
app.use(cors({
  origin: '*', // Разрешаем доступ со всех источников
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Базовые маршруты API
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'WTFdesign API работает!' });
});

app.use('/api/projects', projectRoutes);


// Маршрут для генерации задания
app.post('/api/generate-task', async (req, res) => {
    const { designDirection, timeLimit, useTimer, restrictionsCount, subcategory } = req.body;
    
    try {
      const options = {
        useTimer: useTimer,
        restrictionsCount: restrictionsCount,
        subcategory: subcategory
      };
      
      const task = await generateTask(designDirection, timeLimit, options);
      res.json({ success: true, task });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  });

// Маршрут для получения направлений и ограничений
app.get('/api/directions', async (req, res) => {
    try {
      const Direction = require('./models/Direction');
      const Restriction = require('./models/Restriction');
      
      // Получаем направления из базы данных
      const directions = await Direction.find({ active: true });
      
      // Получаем ограничения по типам
      const colorRestrictions = await Restriction.find({ type: 'color', active: true });
      const technicalRestrictions = await Restriction.find({ type: 'technical', active: true });
      const stylisticRestrictions = await Restriction.find({ type: 'stylistic', active: true });
      const emotionalRestrictions = await Restriction.find({ type: 'emotional', active: true });
      
      res.json({
        success: true,
        directions,
        restrictions: {
          colorRestrictions,
          technicalRestrictions,
          stylisticRestrictions,
          emotionalRestrictions
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });


app.get('/api/directions', async (req, res) => {
  try {
    const Direction = require('./models/Direction');
    const Restriction = require('./models/Restriction');
    
    // Получаем направления из базы данных
    const directions = await Direction.find({ active: true });
    
    // Получаем ограничения по типам
    const colorRestrictions = await Restriction.find({ type: 'color', active: true });
    const technicalRestrictions = await Restriction.find({ type: 'technical', active: true });
    const stylisticRestrictions = await Restriction.find({ type: 'stylistic', active: true });
    const emotionalRestrictions = await Restriction.find({ type: 'emotional', active: true });
    
    res.json({
      success: true,
      directions,
      restrictions: {
        colorRestrictions,
        technicalRestrictions,
        stylisticRestrictions,
        emotionalRestrictions
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
// Маршруты авторизации
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);
app.get('/api/auth/me', authMiddleware, authController.getCurrentUser);

// Маршруты для заданий (админ)
app.get('/api/admin/tasks', authMiddleware, adminMiddleware, taskController.getAllTasks);
app.post('/api/admin/tasks', authMiddleware, adminMiddleware, taskController.createTask);
app.get('/api/admin/tasks/:id', authMiddleware, adminMiddleware, taskController.getTaskById);
app.put('/api/admin/tasks/:id', authMiddleware, adminMiddleware, taskController.updateTask);
app.delete('/api/admin/tasks/:id', authMiddleware, adminMiddleware, taskController.deleteTask);


// Маршруты для ограничений (админ)
app.get('/api/admin/restrictions', authMiddleware, adminMiddleware, restrictionController.getAllRestrictions);
app.post('/api/admin/restrictions', authMiddleware, adminMiddleware, restrictionController.createRestriction);
app.get('/api/admin/restrictions/:id', authMiddleware, adminMiddleware, restrictionController.getRestrictionById);
app.put('/api/admin/restrictions/:id', authMiddleware, adminMiddleware, restrictionController.updateRestriction);
app.delete('/api/admin/restrictions/:id', authMiddleware, adminMiddleware, restrictionController.deleteRestriction);



// Запуск сервера
app.listen(PORT, () => {
  console.log(`WTFdesign API сервер запущен на порту ${PORT}`);
});

// Маршрут для генерации задания
app.post('/api/generate-task', async (req, res) => {
  const { designDirection, timeLimit, useTimer, restrictionsCount, subcategory } = req.body;
  
  try {
    const options = {
      useTimer: useTimer,
      restrictionsCount: restrictionsCount,
      subcategory: subcategory
    };
    
    const task = await generateTask(designDirection, timeLimit, options);
    res.json({ success: true, task });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});