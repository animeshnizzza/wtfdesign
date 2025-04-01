import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../../components/admin/AdminLayout';
import './TaskForm.css';

function TaskForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    description: '',
    designDirection: '',
    subcategory: '',
    difficulty: 'medium',
    active: true
  });
  
  const [directions, setDirections] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    // Проверяем авторизацию
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    
    // Загружаем направления дизайна
    const fetchDirections = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/directions');
        if (response.data.success) {
          setDirections(response.data.directions);
        }
      } catch (error) {
        console.error('Ошибка при загрузке направлений:', error);
      }
    };
    
    fetchDirections();
    
    // Если это режим редактирования, загружаем данные задания
    if (isEditMode) {
      const fetchTask = async () => {
        setIsLoading(true);
        
        try {
          const token = localStorage.getItem('token');
          
          const response = await axios.get(`http://localhost:3001/api/admin/tasks/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          if (response.data.success) {
            setFormData(response.data.task);
          }
        } catch (error) {
          if (error.response?.status === 401 || error.response?.status === 403) {
            navigate('/admin/login');
          } else {
            setError(error.response?.data?.message || 'Ошибка при загрузке задания');
          }
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchTask();
    }
  }, [id, isEditMode, navigate]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      
      let response;
      
      if (isEditMode) {
        // Обновляем существующее задание
        response = await axios.put(
          `http://localhost:3001/api/admin/tasks/${id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
      } else {
        // Создаем новое задание
        response = await axios.post(
          'http://localhost:3001/api/admin/tasks',
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
      }
      
      if (response.data.success) {
        navigate('/admin/tasks');
      }
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        navigate('/admin/login');
      } else {
        setError(error.response?.data?.message || 'Ошибка при сохранении задания');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Ищем выбранное направление для получения подкатегорий
  const selectedDirection = directions.find(dir => dir.id === formData.designDirection);
  
  if (isLoading && isEditMode) {
    return (
      <AdminLayout>
        <div className="loading-spinner">Загрузка...</div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout>
      <div className="task-form-container">
        <h1>{isEditMode ? 'Редактирование задания' : 'Новое задание'}</h1>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="task-form">
          <div className="form-group">
            <label htmlFor="description">Описание задания</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="5"
            ></textarea>
          </div>
          
          <div className="form-group">
            <label htmlFor="designDirection">Направление дизайна</label>
            <select
              id="designDirection"
              name="designDirection"
              value={formData.designDirection}
              onChange={handleChange}
              required
            >
              <option value="">Выберите направление</option>
              {directions.map(direction => (
                <option key={direction.id} value={direction.id}>
                  {direction.name}
                </option>
              ))}
            </select>
          </div>
          
          {selectedDirection && selectedDirection.subcategories && (
            <div className="form-group">
              <label htmlFor="subcategory">Подкатегория</label>
              <select
                id="subcategory"
                name="subcategory"
                value={formData.subcategory || ''}
                onChange={handleChange}
              >
                <option value="">Нет подкатегории</option>
                {selectedDirection.subcategories.map(subcat => (
                  <option key={subcat.id} value={subcat.id}>
                    {subcat.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="difficulty">Сложность</label>
            <select
              id="difficulty"
              name="difficulty"
              value={formData.difficulty}
              onChange={handleChange}
              required
            >
              <option value="easy">Легкое</option>
              <option value="medium">Среднее</option>
              <option value="hard">Сложное</option>
            </select>
          </div>
          
          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="active"
                checked={formData.active}
                onChange={handleChange}
              />
              Активное задание
            </label>
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-btn"
              onClick={() => navigate('/admin/tasks')}
            >
              Отмена
            </button>
            <button 
              type="submit" 
              className="save-btn" 
              disabled={isLoading}
            >
              {isLoading ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

export default TaskForm;