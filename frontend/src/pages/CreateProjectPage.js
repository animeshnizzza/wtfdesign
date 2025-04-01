// frontend/src/pages/CreateProjectPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './CreateProjectPage.css';

function CreateProjectPage() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
    tools: '',
    isPublic: true
  });
  
  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [captions, setCaptions] = useState([]);
  
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState('');
  const [taskDetails, setTaskDetails] = useState(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Проверка авторизации
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      navigate('/login', { state: { from: '/create-project' } });
      return;
    }
    
    setIsAuthenticated(true);
  }, [navigate]);
  
  // Загрузка выполненных заданий
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem('token');
        
        const response = await fetch('http://localhost:3001/api/user/tasks', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        
        if (data.success) {
          setTasks(data.tasks);
        }
      } catch (error) {
        console.error('Ошибка при загрузке заданий:', error);
      }
    };
    
    fetchTasks();
  }, [isAuthenticated]);
  
  // Обработчик изменения полей формы
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Обработчик изменения обложки проекта
  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    
    if (!file) return;
    
    // Проверка типа файла
    if (!file.type.startsWith('image/')) {
      setError('Неподдерживаемый формат файла. Пожалуйста, загрузите изображение.');
      return;
    }
    
    setCoverImage(file);
    
    // Создаем превью
    const reader = new FileReader();
    reader.onload = () => {
      setCoverPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };
  
  // Обработчик изменения дополнительных изображений
  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Проверка типов файлов
    const invalidFiles = files.filter(file => !file.type.startsWith('image/'));
    if (invalidFiles.length > 0) {
      setError('Неподдерживаемый формат файла. Пожалуйста, загрузите только изображения.');
      return;
    }
    
    setImages(prevImages => [...prevImages, ...files]);
    
    // Создаем превью для новых изображений
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreviews(prevPreviews => [...prevPreviews, reader.result]);
        setCaptions(prevCaptions => [...prevCaptions, '']);
      };
      reader.readAsDataURL(file);
    });
  };
  
  // Обработчик изменения подписей
  const handleCaptionChange = (index, value) => {
    const newCaptions = [...captions];
    newCaptions[index] = value;
    setCaptions(newCaptions);
  };
  
  // Обработчик удаления изображения
  const handleRemoveImage = (index) => {
    setImages(prevImages => prevImages.filter((_, i) => i !== index));
    setImagePreviews(prevPreviews => prevPreviews.filter((_, i) => i !== index));
    setCaptions(prevCaptions => prevCaptions.filter((_, i) => i !== index));
  };
  
  // Обработчик выбора задания
  const handleTaskChange = (e) => {
    const taskId = e.target.value;
    setSelectedTask(taskId);
    
    if (!taskId) {
      setTaskDetails(null);
      return;
    }
    
    // Находим задание в списке
    const task = tasks.find(task => task._id === taskId);
    if (task) {
      setTaskDetails(task.details);
    }
  };
  
  // Обработчик отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!coverImage) {
      setError('Обложка проекта обязательна');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      
      // Создаем FormData для отправки файлов
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('tags', formData.tags);
      formDataToSend.append('tools', formData.tools);
      formDataToSend.append('isPublic', formData.isPublic);
      
      if (selectedTask) {
        formDataToSend.append('taskId', selectedTask);
        formDataToSend.append('taskDetails', JSON.stringify(taskDetails));
      }
      
      // Добавляем обложку
      formDataToSend.append('coverImage', coverImage);
      
      // Добавляем дополнительные изображения
      images.forEach((image, index) => {
        formDataToSend.append('images', image);
        formDataToSend.append('captions', captions[index] || '');
      });
      
      const response = await fetch('http://localhost:3001/api/projects', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formDataToSend
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Перенаправляем на страницу созданного проекта
        navigate(`/project/${data.project._id}`);
      } else {
        setError(data.message || 'Ошибка при создании проекта');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Ошибка при создании проекта:', error);
      setError('Не удалось создать проект. Попробуйте позже.');
      setIsSubmitting(false);
    }
  };
  
  // Если не авторизован, не рендерим содержимое
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <>
      <Navbar />
      <div className="create-project-container">
        <h1>Создание нового проекта</h1>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="create-project-form">
          <div className="form-section">
            <h2>Основная информация</h2>
            
            <div className="form-group">
              <label htmlFor="title">Название проекта *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Описание проекта *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="6"
                required
              ></textarea>
            </div>
            
            <div className="form-group">
              <label htmlFor="tags">Теги (через запятую)</label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="ux-ui, graphic, illustration..."
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="tools">Инструменты (через запятую)</label>
              <input
                type="text"
                id="tools"
                name="tools"
                value={formData.tools}
                onChange={handleChange}
                placeholder="Photoshop, Illustrator, Figma..."
              />
            </div>
            
            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isPublic"
                  checked={formData.isPublic}
                  onChange={handleChange}
                />
                Публичный проект
              </label>
              <p className="field-hint">
                Публичные проекты видны всем пользователям. Приватные проекты видны только вам.
              </p>
            </div>
          </div>
          
          <div className="form-section">
            <h2>Изображения</h2>
            
            <div className="form-group">
              <label>Обложка проекта *</label>
              <div className="file-input-container">
                <input
                  type="file"
                  id="coverImage"
                  onChange={handleCoverChange}
                  accept="image/*"
                  className="file-input"
                />
                <label htmlFor="coverImage" className="file-input-label">
                  Выбрать файл
                </label>
                <span className="file-name">
                  {coverImage ? coverImage.name : 'Файл не выбран'}
                </span>
              </div>
              
              {coverPreview && (
                <div className="image-preview-container">
                  <img src={coverPreview} alt="Cover Preview" className="image-preview" />
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label>Дополнительные изображения</label>
              <div className="file-input-container">
                <input
                  type="file"
                  id="projectImages"
                  onChange={handleImagesChange}
                  accept="image/*"
                  multiple
                  className="file-input"
                />
                <label htmlFor="projectImages" className="file-input-label">
                  Выбрать файлы
                </label>
                <span className="file-name">
                  {images.length > 0 ? `Выбрано файлов: ${images.length}` : 'Файлы не выбраны'}
                </span>
              </div>
              
              {imagePreviews.length > 0 && (
                <div className="image-gallery-previews">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="gallery-image-container">
                      <img src={preview} alt={`Gallery ${index + 1}`} className="gallery-image" />
                      <button
                        type="button"
                        className="remove-image-btn"
                        onClick={() => handleRemoveImage(index)}
                      >
                        &times;
                      </button>
                      <input
                        type="text"
                        placeholder="Подпись (необязательно)"
                        value={captions[index] || ''}
                        onChange={(e) => handleCaptionChange(index, e.target.value)}
                        className="image-caption-input"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {tasks.length > 0 && (
            <div className="form-section">
              <h2>Задание WTFdesign</h2>
              <p className="section-hint">
                Вы можете привязать проект к заданию, которое вы выполнили в генераторе заданий.
              </p>
              
              <div className="form-group">
                <label htmlFor="task">Выберите задание</label>
                <select
                  id="task"
                  name="task"
                  value={selectedTask}
                  onChange={handleTaskChange}
                >
                  <option value="">Нет задания</option>
                  {tasks.map(task => (
                    <option key={task._id} value={task._id}>
                      {task.title || task.description.substring(0, 50)}
                    </option>
                  ))}
                </select>
              </div>
              
              {taskDetails && (
                <div className="task-preview">
                  <div className="task-card">
                    <p className="task-description">{taskDetails.taskDescription}</p>
                    
                    {Object.keys(taskDetails.restrictions).length > 0 && (
                      <div className="restrictions-list">
                        <h4>Ограничения:</h4>
                        {Object.entries(taskDetails.restrictions).map(([type, restrictions]) => (
                          <div key={type} className="restriction-group">
                            <p>
                              <strong>
                                {type === 'color' ? 'Цветовые' : 
                                type === 'technical' ? 'Технические' : 
                                type === 'stylistic' ? 'Стилистические' : 
                                'Эмоциональные'} ограничения:
                              </strong>
                            </p>
                            <ul>
                              {restrictions.map(restriction => (
                                <li key={restriction.id}>{restriction.name}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-btn"
              onClick={() => navigate(-1)}
            >
              Отмена
            </button>
            <button 
              type="submit" 
              className="submit-btn" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Создание...' : 'Создать проект'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default CreateProjectPage;