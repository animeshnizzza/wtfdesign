// backend/src/controllers/restrictionController.js
const Restriction = require('../models/Restriction');

// Получение всех ограничений
exports.getAllRestrictions = async (req, res) => {
  try {
    const restrictions = await Restriction.find({});
    res.json({ success: true, restrictions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Получение ограничения по ID
exports.getRestrictionById = async (req, res) => {
  try {
    const restriction = await Restriction.findById(req.params.id);
    if (!restriction) {
      return res.status(404).json({ success: false, message: 'Ограничение не найдено' });
    }
    res.json({ success: true, restriction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Создание нового ограничения
exports.createRestriction = async (req, res) => {
  try {
    const restriction = new Restriction(req.body);
    await restriction.save();
    res.status(201).json({ success: true, restriction });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Обновление ограничения
exports.updateRestriction = async (req, res) => {
  try {
    const restriction = await Restriction.findByIdAndUpdate(req.params.id, req.body, { 
      new: true, 
      runValidators: true 
    });
    
    if (!restriction) {
      return res.status(404).json({ success: false, message: 'Ограничение не найдено' });
    }
    
    res.json({ success: true, restriction });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Удаление ограничения
exports.deleteRestriction = async (req, res) => {
  try {
    const restriction = await Restriction.findByIdAndDelete(req.params.id);
    
    if (!restriction) {
      return res.status(404).json({ success: false, message: 'Ограничение не найдено' });
    }
    
    res.json({ success: true, message: 'Ограничение успешно удалено' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};