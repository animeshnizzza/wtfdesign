// backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware для проверки JWT токена
const authMiddleware = async (req, res, next) => {
  // Получаем токен из заголовка
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  // Если токен отсутствует
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Доступ запрещен. Требуется авторизация.' 
    });
  }

  try {
    // Проверяем токен
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'wtfdesign_secret_key');
    
    // Находим пользователя
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }
    
    // Добавляем данные пользователя в запрос
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Некорректный токен. Пожалуйста, авторизуйтесь повторно.' 
    });
  }
};

// Middleware для проверки прав администратора
const adminMiddleware = (req, res, next) => {
  if (req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ 
      success: false, 
      message: 'Доступ запрещен. Требуются права администратора.' 
    });
  }
};

module.exports = { authMiddleware, adminMiddleware };