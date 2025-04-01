// backend/src/controllers/projectController.js
const Project = require('../models/Project');
const User = require('../models/User');

// Создание нового проекта
exports.createProject = async (req, res) => {
  try {
    const { title, description, tags, tools, taskId, taskDetails, isPublic } = req.body;
    
    // Обязательно должна быть обложка проекта
    if (!req.files || !req.files.coverImage) {
      return res.status(400).json({
        success: false,
        message: 'Обложка проекта обязательна'
      });
    }
    
    // Обработка загруженных файлов
    const coverImagePath = `/uploads/${req.files.coverImage[0].filename}`;
    
    // Обработка дополнительных изображений
    const images = [];
    if (req.files.images) {
      for (let i = 0; i < req.files.images.length; i++) {
        images.push({
          url: `/uploads/${req.files.images[i].filename}`,
          caption: req.body.captions && req.body.captions[i] ? req.body.captions[i] : ''
        });
      }
    }
    
    // Создание нового проекта
    const project = new Project({
      title,
      description,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      tools: tools ? tools.split(',').map(tool => tool.trim()) : [],
      task: taskId || null,
      taskDetails: taskDetails ? JSON.parse(taskDetails) : null,
      creator: req.user._id,
      coverImage: coverImagePath,
      images,
      isPublic: isPublic === 'true'
    });
    
    await project.save();
    
    res.status(201).json({
      success: true,
      project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Получение всех публичных проектов
exports.getAllProjects = async (req, res) => {
  try {
    const { page = 1, limit = 12, tags, search, sort = 'recent' } = req.query;
    
    const query = { isPublic: true };
    
    // Фильтр по тегам
    if (tags) {
      const tagArray = tags.split(',');
      query.tags = { $in: tagArray };
    }
    
    // Поиск по тексту
    if (search) {
      query.$text = { $search: search };
    }
    
    // Определение сортировки
    let sortOption = {};
    switch (sort) {
      case 'popular':
        sortOption = { 'likes.count': -1, createdAt: -1 };
        break;
      case 'most_viewed':
        sortOption = { views: -1, createdAt: -1 };
        break;
      case 'recent':
      default:
        sortOption = { createdAt: -1 };
    }
    
    const projects = await Project.find(query)
      .sort(sortOption)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('creator', 'username profileImage')
      .exec();
    
    const count = await Project.countDocuments(query);
    
    res.json({
      success: true,
      projects,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Получение проекта по ID
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('creator', 'username profileImage bio location')
      .populate('comments.user', 'username profileImage')
      .populate('appreciations.user', 'username profileImage');
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Проект не найден'
      });
    }
    
    // Если проект не публичный, проверяем, является ли пользователь создателем
    if (!project.isPublic && (!req.user || project.creator._id.toString() !== req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'У вас нет доступа к этому проекту'
      });
    }
    
    // Увеличиваем счетчик просмотров
    project.views += 1;
    await project.save();
    
    // Также увеличиваем счетчик просмотров у создателя
    await User.findByIdAndUpdate(project.creator._id, {
      $inc: { 'statistics.projectViews': 1 }
    });
    
    res.json({
      success: true,
      project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Обновление проекта
exports.updateProject = async (req, res) => {
  try {
    const { title, description, tags, tools, isPublic } = req.body;
    
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Проект не найден'
      });
    }
    
    // Проверяем, является ли пользователь создателем проекта
    if (project.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'У вас нет прав на редактирование этого проекта'
      });
    }
    
    // Обновляем данные проекта
    if (title) project.title = title;
    if (description) project.description = description;
    if (tags) project.tags = tags.split(',').map(tag => tag.trim());
    if (tools) project.tools = tools.split(',').map(tool => tool.trim());
    if (isPublic !== undefined) project.isPublic = isPublic === 'true';
    
    // Обработка новой обложки, если загружена
    if (req.files && req.files.coverImage) {
      project.coverImage = `/uploads/${req.files.coverImage[0].filename}`;
    }
    
    // Обработка новых изображений, если загружены
    if (req.files && req.files.images) {
      const newImages = [];
      for (let i = 0; i < req.files.images.length; i++) {
        newImages.push({
          url: `/uploads/${req.files.images[i].filename}`,
          caption: req.body.captions && req.body.captions[i] ? req.body.captions[i] : ''
        });
      }
      
      // Если указано, что нужно заменить все изображения
      if (req.body.replaceImages === 'true') {
        project.images = newImages;
      } else {
        // Иначе добавляем к существующим
        project.images = [...project.images, ...newImages];
      }
    }
    
    await project.save();
    
    res.json({
      success: true,
      project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Удаление проекта
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Проект не найден'
      });
    }
    
    // Проверяем, является ли пользователь создателем проекта
    if (project.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'У вас нет прав на удаление этого проекта'
      });
    }
    
    await project.remove();
    
    res.json({
      success: true,
      message: 'Проект успешно удален'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Лайк проекта
exports.likeProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Проект не найден'
      });
    }
    
    // Проверяем, лайкнул ли пользователь проект ранее
    const isLiked = project.likes.users.includes(req.user._id);
    
    if (isLiked) {
      // Если уже лайкнуто, убираем лайк
      project.likes.users = project.likes.users.filter(
        userId => userId.toString() !== req.user._id.toString()
      );
      project.likes.count = project.likes.count - 1;
    } else {
      // Иначе добавляем лайк
      project.likes.users.push(req.user._id);
      project.likes.count = project.likes.count + 1;
    }
    
    await project.save();
    
    res.json({
      success: true,
      likes: project.likes.count,
      isLiked: !isLiked
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Добавление комментария
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || text.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Текст комментария не может быть пустым'
      });
    }
    
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Проект не найден'
      });
    }
    
    const comment = {
      user: req.user._id,
      text,
      createdAt: new Date()
    };
    
    project.comments.push(comment);
    await project.save();
    
    // Получаем обновленный проект с заполненными данными пользователя
    const updatedProject = await Project.findById(req.params.id)
      .populate('comments.user', 'username profileImage');
    
    const newComment = updatedProject.comments[updatedProject.comments.length - 1];
    
    res.json({
      success: true,
      comment: newComment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Добавление appreciation (похвалы)
exports.addAppreciation = async (req, res) => {
  try {
    const { type } = req.body;
    
    if (!['innovative', 'visually_appealing', 'functional', 'creative'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Неверный тип оценки'
      });
    }
    
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Проект не найден'
      });
    }
    
    // Проверяем, оценивал ли пользователь проект ранее
    const existingAppreciation = project.appreciations.find(
      a => a.user.toString() === req.user._id.toString()
    );
    
    if (existingAppreciation) {
      // Если уже есть оценка, обновляем её тип
      existingAppreciation.type = type;
    } else {
      // Иначе добавляем новую оценку
      project.appreciations.push({
        user: req.user._id,
        type,
        createdAt: new Date()
      });
      
      // Увеличиваем счетчик оценок у создателя
      await User.findByIdAndUpdate(project.creator, {
        $inc: { 'statistics.appreciations': 1 }
      });
    }
    
    await project.save();
    
    // Подсчитываем количество оценок по типам
    const appreciationCounts = {
      innovative: project.appreciations.filter(a => a.type === 'innovative').length,
      visually_appealing: project.appreciations.filter(a => a.type === 'visually_appealing').length,
      functional: project.appreciations.filter(a => a.type === 'functional').length,
      creative: project.appreciations.filter(a => a.type === 'creative').length,
      total: project.appreciations.length
    };
    
    res.json({
      success: true,
      appreciations: appreciationCounts,
      userAppreciationType: type
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Получение проектов пользователя
exports.getUserProjects = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 12 } = req.query;
    
    const query = { creator: userId };
    
    // Если запрашивает не владелец проектов, показываем только публичные
    if (!req.user || req.user._id.toString() !== userId) {
      query.isPublic = true;
    }
    
    const projects = await Project.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    
    const count = await Project.countDocuments(query);
    
    res.json({
      success: true,
      projects,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Сохранение проекта в коллекцию пользователя
exports.saveProject = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    
    // Проверяем, существует ли проект
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Проект не найден'
      });
    }
    
    // Проверяем, сохранен ли проект уже
    const isSaved = user.savedProjects.includes(id);
    
    if (isSaved) {
      // Удаляем из сохраненных
      user.savedProjects = user.savedProjects.filter(
        projectId => projectId.toString() !== id
      );
    } else {
      // Добавляем в сохраненные
      user.savedProjects.push(id);
    }
    
    await user.save();
    
    res.json({
      success: true,
      isSaved: !isSaved
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};