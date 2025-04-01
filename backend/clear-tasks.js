const mongoose = require('mongoose');
const dotenv = require('dotenv');

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

// Определяем модель задания
const taskSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    trim: true
  },
  designDirection: {
    type: String,
    required: true
  },
  subcategory: {
    type: String,
    default: null
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  active: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Task = mongoose.model('Task', taskSchema);

// Функция для очистки коллекции заданий
const clearTasks = async () => {
  try {
    const result = await Task.deleteMany({});
    console.log(`Удалено ${result.deletedCount} заданий из базы данных.`);
    console.log('Теперь вы можете добавить новые задания через админ-панель.');
    process.exit(0);
  } catch (error) {
    console.error('Ошибка при удалении заданий:', error);
    process.exit(1);
  }
};

// Запрашиваем подтверждение
console.log('ВНИМАНИЕ: Вы собираетесь удалить ВСЕ задания из базы данных!');
console.log('Введите "YES" (заглавными буквами) для подтверждения:');

process.stdin.on('data', (data) => {
  const input = data.toString().trim();
  
  if (input === 'YES') {
    console.log('Удаление заданий...');
    clearTasks();
  } else {
    console.log('Операция отменена.');
    process.exit(0);
  }
});