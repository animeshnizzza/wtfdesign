// backend/init-data.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Загрузка моделей
const Direction = require('./src/models/Direction');
const Restriction = require('./src/models/Restriction');

// Загрузка переменных окружения
dotenv.config();

// Подключение к MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/wtfdesign', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB подключена'))
.catch(err => {
  console.error('Ошибка подключения к MongoDB:', err);
  process.exit(1);
});

// Направления дизайна
const directions = [
  {
    id: 'ux-ui',
    name: 'UX/UI дизайн',
    description: 'Создание пользовательских интерфейсов и опыта взаимодействия',
    subcategories: []
  },
  {
    id: 'graphic',
    name: 'Графический дизайн',
    description: 'Создание визуальных материалов',
    subcategories: [
      { id: 'branding', name: 'Брендинг' },
      { id: 'typography', name: 'Типографика' },
      { id: 'infographic', name: 'Инфографика' },
      { id: 'poster', name: 'Постер' },
      { id: 'placard', name: 'Плакат' },
      { id: 'covers', name: 'Обложки' },
      { id: 'packaging', name: 'Упаковка' }
    ]
  },
  {
    id: 'motion',
    name: 'Моушн-дизайн',
    description: 'Анимация и движущаяся графика',
    subcategories: []
  },
  {
    id: 'illustration',
    name: 'Иллюстрация',
    description: 'Художественные изображения и рисунки',
    subcategories: []
  },
  {
    id: '3d',
    name: '3D концепт',
    description: 'Трёхмерное моделирование и визуализация',
    subcategories: []
  }
];

// Ограничения
const restrictions = [
  // Цветовые ограничения
  { id: 'max-3-colors', name: 'Максимум 3 цвета', type: 'color' },
  { id: 'monochrome', name: 'Монохромная палитра', type: 'color' },
  { id: 'single-spectrum', name: 'Цвета только одного спектра', type: 'color' },
  { id: 'inversion', name: 'Инверсия стандартной цветовой схемы', type: 'color' },
  { id: 'emotional-colors', name: 'Цвета на основе эмоционального состояния', type: 'color' },
  
  // Технические ограничения
  { id: 'no-straight-lines', name: 'Без использования прямых линий', type: 'technical' },
  { id: 'one-shape', name: 'Только одна геометрическая форма', type: 'technical' },
  { id: 'low-resolution', name: 'Работа в предельно низком разрешении', type: 'technical' },
  { id: 'one-tool', name: 'Использование только одного инструмента', type: 'technical' },
  { id: 'physical-limits', name: 'Создание с физическими ограничениями', type: 'technical' },
  
  // Стилистические ограничения
  { id: 'incompatible-styles', name: 'Смешение несовместимых стилей', type: 'stylistic' },
  { id: 'opposite-style', name: 'Работа в противоположном стиле', type: 'stylistic' },
  { id: 'other-art-technique', name: 'Имитация техники другого искусства', type: 'stylistic' },
  { id: 'inanimate-object', name: 'Стилизация под неживой объект', type: 'stylistic' },
  { id: 'sound-visualization', name: 'Визуализация звука', type: 'stylistic' },
  
  // Эмоциональные ограничения
  { id: 'contradictory-emotions', name: 'Передать противоречивые эмоции', type: 'emotional' },
  { id: 'inexpressible', name: 'Визуализировать невыразимое', type: 'emotional' },
  { id: 'mood-without-images', name: 'Создать настроение без прямых образов', type: 'emotional' },
  { id: 'other-being-emotion', name: 'Передать эмоцию другого существа', type: 'emotional' },
  { id: 'collective-unconscious', name: 'Визуализировать коллективное бессознательное', type: 'emotional' }
];

// Функция для инициализации данных
const initData = async () => {
  try {
    // Очистка существующих данных
    await Direction.deleteMany({});
    await Restriction.deleteMany({});
    
    console.log('Существующие данные удалены');
    
    // Добавление направлений
    await Direction.insertMany(directions);
    console.log(`Добавлено ${directions.length} направлений дизайна`);
    
    // Добавление ограничений
    await Restriction.insertMany(restrictions);
    console.log(`Добавлено ${restrictions.length} ограничений`);
    
    console.log('Инициализация данных завершена успешно');
    process.exit(0);
  } catch (error) {
    console.error('Ошибка при инициализации данных:', error);
    process.exit(1);
  }
};

// Запуск инициализации
initData();