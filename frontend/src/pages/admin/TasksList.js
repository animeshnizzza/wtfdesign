import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../../components/admin/AdminLayout';
import './TasksList.css';

function TasksList() {
  const [tasks, setTasks] = useState([]);
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
    
    // Загружаем задания
    const fetchTasks = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/admin/tasks', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.data.success) {
          setTasks(response.data.tasks);
        }
      } catch (error) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          navigate('/admin/login');
        } else {
          setError(error.response?.data?.message || 'Ошибка при загрузке заданий');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTasks();
  }, [navigate]);
  
  const handleDeleteTask = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить это задание?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.delete(`http://localhost:3001/api/admin/tasks/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setTasks(tasks.filter(task => task._id !== id));
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Ошибка при удалении задания');
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
      <div className="tasks-list-container">
        <div className="tasks-header">
          <h1>Управление заданиями</h1>
          <Link to="/admin/tasks/new" className="add-task-btn">
            Добавить задание
          </Link>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        {tasks.length === 0 ? (
          <div className="empty-state">
            <p>Заданий пока нет. Создайте первое задание!</p>
            <Link to="/admin/tasks/new" className="add-task-btn">
              Создать задание
            </Link>
          </div>
        ) : (
          <div className="tasks-table-wrapper">
            <table className="tasks-table">
              <thead>
                <tr>
                  <th>Описание</th>
                  <th>Направление</th>
                  <th>Подкатегория</th>
                  <th>Сложность</th>
                  <th>Статус</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => (
                  <tr key={task._id}>
                    <td className="task-description">
                      {task.description.length > 50 
                        ? `${task.description.substring(0, 50)}...` 
                        : task.description}
                    </td>
                    <td>{task.designDirection}</td>
                    <td>{task.subcategory || '-'}</td>
                    <td>
                      {task.difficulty === 'easy' ? 'Легкое' : 
                       task.difficulty === 'medium' ? 'Среднее' : 'Сложное'}
                    </td>
                    <td>
                      <span className={`status-badge ${task.active ? 'active' : 'inactive'}`}>
                        {task.active ? 'Активно' : 'Неактивно'}
                      </span>
                    </td>
                    <td className="actions">
                      <Link 
                        to={`/admin/tasks/edit/${task._id}`} 
                        className="edit-btn"
                      >
                        Изменить
                      </Link>
                      <button 
                        className="delete-btn" 
                        onClick={() => handleDeleteTask(task._id)}
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

export default TasksList;