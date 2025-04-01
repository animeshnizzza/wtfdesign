import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../../components/admin/AdminLayout';
import './RestrictionForm.css';

function RestrictionForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    type: 'color',
    active: true
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    // Проверяем авторизацию
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    
    // Если это режим редактирования, загружаем данные ограничения
    if (isEditMode) {
      const fetchRestriction = async () => {
        setIsLoading(true);
        
        try {
          const response = await axios.get(`http://localhost:3001/api/admin/restrictions/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          if (response.data.success) {
            setFormData(response.data.restriction);
          }
        } catch (error) {
          if (error.response?.status === 401 || error.response?.status === 403) {
            navigate('/admin/login');
          } else {
            setError(error.response?.data?.message || 'Ошибка при загрузке ограничения');
          }
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchRestriction();
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
        // Обновляем существующее ограничение
        response = await axios.put(
          `http://localhost:3001/api/admin/restrictions/${id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
      } else {
        // Создаем новое ограничение
        response = await axios.post(
          'http://localhost:3001/api/admin/restrictions',
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
      }
      
      if (response.data.success) {
        navigate('/admin/restrictions');
      }
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        navigate('/admin/login');
      } else {
        setError(error.response?.data?.message || 'Ошибка при сохранении ограничения');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Функция для генерации ID из названия
  const generateId = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-zа-я0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();
  };
  
  const handleNameChange = (e) => {
    const newName = e.target.value;
    setFormData(prev => ({
      ...prev,
      name: newName,
      id: isEditMode ? prev.id : generateId(newName)
    }));
  };
  
  if (isLoading && isEditMode) {
    return (
      <AdminLayout>
        <div className="loading-spinner">Загрузка...</div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout>
      <div className="restriction-form-container">
        <h1>{isEditMode ? 'Редактирование ограничения' : 'Новое ограничение'}</h1>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="restriction-form">
          <div className="form-group">
            <label htmlFor="name">Название ограничения</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleNameChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="id">ID ограничения</label>
            <input
              type="text"
              id="id"
              name="id"
              value={formData.id}
              onChange={handleChange}
              required
              disabled={isEditMode}
            />
            <small className="form-hint">Уникальный идентификатор, используется в системе</small>
          </div>
          
          <div className="form-group">
            <label htmlFor="type">Тип ограничения</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="color">Цветовое</option>
              <option value="technical">Техническое</option>
              <option value="stylistic">Стилистическое</option>
              <option value="emotional">Эмоциональное</option>
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
              Активное ограничение
            </label>
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-btn"
              onClick={() => navigate('/admin/restrictions')}
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

export default RestrictionForm;