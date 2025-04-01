import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../../components/admin/AdminLayout';
import './RestrictionsList.css';

function RestrictionsList() {
  const [restrictions, setRestrictions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  
  useEffect(() => {
    // Проверяем авторизацию
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    
    // Загружаем ограничения
    const fetchRestrictions = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/admin/restrictions', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.data.success) {
          setRestrictions(response.data.restrictions);
        }
      } catch (error) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          navigate('/admin/login');
        } else {
          setError(error.response?.data?.message || 'Ошибка при загрузке ограничений');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRestrictions();
  }, [navigate]);
  
  const handleDeleteRestriction = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить это ограничение?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.delete(`http://localhost:3001/api/admin/restrictions/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setRestrictions(restrictions.filter(restriction => restriction._id !== id));
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Ошибка при удалении ограничения');
    }
  };
  
  const getRestrictionTypeLabel = (type) => {
    switch (type) {
      case 'color':
        return 'Цветовое';
      case 'technical':
        return 'Техническое';
      case 'stylistic':
        return 'Стилистическое';
      case 'emotional':
        return 'Эмоциональное';
      default:
        return type;
    }
  };
  
  if (isLoading) {
    return (
      <AdminLayout>
        <div className="loading-spinner">Загрузка...</div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout>
      <div className="restrictions-list-container">
        <div className="restrictions-header">
          <h1>Управление ограничениями</h1>
          <Link to="/admin/restrictions/new" className="add-restriction-btn">
            Добавить ограничение
          </Link>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        {restrictions.length === 0 ? (
          <div className="empty-state">
            <p>Ограничений пока нет. Создайте первое ограничение!</p>
            <Link to="/admin/restrictions/new" className="add-restriction-btn">
              Создать ограничение
            </Link>
          </div>
        ) : (
          <div className="restrictions-table-wrapper">
            <table className="restrictions-table">
              <thead>
                <tr>
                  <th>Название</th>
                  <th>ID</th>
                  <th>Тип</th>
                  <th>Статус</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {restrictions.map(restriction => (
                  <tr key={restriction._id}>
                    <td>{restriction.name}</td>
                    <td>{restriction.id}</td>
                    <td>{getRestrictionTypeLabel(restriction.type)}</td>
                    <td>
                      <span className={`status-badge ${restriction.active ? 'active' : 'inactive'}`}>
                        {restriction.active ? 'Активно' : 'Неактивно'}
                      </span>
                    </td>
                    <td className="actions">
                      <Link 
                        to={`/admin/restrictions/edit/${restriction._id}`} 
                        className="edit-btn"
                      >
                        Изменить
                      </Link>
                      <button 
                        className="delete-btn" 
                        onClick={() => handleDeleteRestriction(restriction._id)}
                      >
                        Удалить
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default RestrictionsList;