// backend/src/taskGenerator.js
const Task = require('./models/Task');
const Direction = require('./models/Direction');
const Restriction = require('./models/Restriction');

// Время выполнения (в минутах)
const timeLimits = [15, 30, 60, 120, 240, 480, 1440]; // от 15 минут до 24 часов

/**
 * Функция для получения случайного элемента из массива
 */
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Функция для выбора случайного количества ограничений
 */
function getRandomRestrictions(restrictionsArray, maxCount = 2) {
  const count = Math.floor(Math.random() * maxCount) + 1; // от 1 до maxCount ограничений
  const shuffled = [...restrictionsArray].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

/**
 * Функция для получения всех направлений дизайна
 */
async function getDesignDirections() {
  try {
    const directions = await Direction.find({ active: true });
    return directions;
  } catch (error) {
    console.error('Ошибка при получении направлений дизайна:', error);
    return [];
  }
}

/**
 * Функция для получения всех ограничений по типу
 */
async function getRestrictionsByType(type) {
  try {
    const restrictions = await Restriction.find({ type, active: true });
    return restrictions;
  } catch (error) {
    console.error(`Ошибка при получении ограничений типа ${type}:`, error);
    return [];
  }
}

/**
 * Основная функция генерации задания из базы данных
 */
async function generateTask(designDirection, timeLimit = null, options = {}) {
    // Проверка валидности направления дизайна
    if (!designDirection) {
      throw new Error('Необходимо указать направление дизайна');
    }
  
    // Получаем параметры
    const { useTimer = true, restrictionsCount = 2, subcategory = null } = options;
  
    // Формируем фильтр для поиска задания
    const filter = {
      active: true,
      designDirection: designDirection
    };
  
    // Если указана подкатегория, добавляем её в фильтр
    if (subcategory) {
      filter.subcategory = subcategory;
    }
    
    // Находим все подходящие задания
    const tasks = await Task.find(filter);
    
    // Если заданий нет, выдаем ошибку
    if (tasks.length === 0) {
      throw new Error('Заданий для выбранного направления не найдено. Пожалуйста, добавьте задания через админ-панель.');
    }
    
    // Выбираем случайное задание
    const task = getRandomElement(tasks);
    
    // Определяем ограничение по времени
    const selectedTimeLimit = useTimer ? (timeLimit || getRandomElement(timeLimits)) : null;
    
    // Определяем ограничения для задания
    let selectedRestrictions = {};
    
    if (restrictionsCount > 0) {
      // Получаем все типы ограничений
      const restrictionTypes = ['color', 'technical', 'stylistic', 'emotional'];
      // Перемешиваем их
      const shuffledTypes = [...restrictionTypes].sort(() => 0.5 - Math.random());
      // Берем первые restrictionsCount типов или все, если их меньше
      const selectedTypes = shuffledTypes.slice(0, Math.min(restrictionsCount, restrictionTypes.length));
      
      // Для каждого типа получаем случайные ограничения
      for (const type of selectedTypes) {
        const restrictionsFromDB = await getRestrictionsByType(type);
        
        if (restrictionsFromDB.length > 0) {
          // Выбираем от 1 до 2 ограничений каждого типа
          selectedRestrictions[type] = getRandomRestrictions(restrictionsFromDB, 2);
        }
      }
    }
    
    // Формируем полное задание
    return {
      id: task._id,
      designDirection,
      taskDescription: task.description,
      timeLimit: selectedTimeLimit,
      restrictions: selectedRestrictions,
      createdAt: new Date().toISOString()
    };
  }

// Экспортируем функции
module.exports = {
  generateTask,
  getDesignDirections,
  getRestrictionsByType
};



/**
 * Основная функция генерации задания из базы данных
 */
async function generateTask(designDirection, timeLimit = null, options = {}) {
  // Проверка валидности направления дизайна
  if (!designDirection) {
    throw new Error('Необходимо указать направление дизайна');
  }

  // Получаем параметры
  const { useTimer = true, restrictionsCount = 2, subcategory = null } = options;

  // Формируем фильтр для поиска задания
  const filter = {
    active: true,
    designDirection: designDirection
  };

  // Если указана подкатегория, добавляем её в фильтр
  if (subcategory) {
    filter.subcategory = subcategory;
  }
  
  // Находим все подходящие задания
  const tasks = await Task.find(filter);
  
  // Если заданий нет, выдаем ошибку
  if (tasks.length === 0) {
    throw new Error('Заданий для выбранного направления не найдено. Пожалуйста, добавьте задания через админ-панель.');
  }
  
  // Выбираем случайное задание
  const task = getRandomElement(tasks);
  
  // Определяем ограничение по времени
  const selectedTimeLimit = useTimer ? (timeLimit || getRandomElement(timeLimits)) : null;
  
  // Определяем ограничения для задания
  let selectedRestrictions = {};
  
  if (restrictionsCount > 0) {
    // Получаем все типы ограничений
    const restrictionTypes = ['color', 'technical', 'stylistic', 'emotional'];
    // Перемешиваем их
    const shuffledTypes = [...restrictionTypes].sort(() => 0.5 - Math.random());
    // Берем первые restrictionsCount типов или все, если их меньше
    const selectedTypes = shuffledTypes.slice(0, Math.min(restrictionsCount, restrictionTypes.length));
    
    // Для каждого типа получаем случайные ограничения
    for (const type of selectedTypes) {
      const restrictionsFromDB = await getRestrictionsByType(type);
      
      if (restrictionsFromDB.length > 0) {
        // Выбираем от 1 до 2 ограничений каждого типа
        selectedRestrictions[type] = getRandomRestrictions(restrictionsFromDB, 2);
      }
    }
  }
  
  // Формируем полное задание
  return {
    id: task._id,
    designDirection,
    taskDescription: task.description,
    timeLimit: selectedTimeLimit,
    restrictions: selectedRestrictions,
    createdAt: new Date().toISOString()
  };
}