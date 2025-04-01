import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminLogin.css';

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  
  // Проверяем, авторизован ли пользователь уже
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Проверяем валидность токена
      const checkAuth = async () => {
        try {
          const response = await axios.get('http://localhost:3001/api/auth/me', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          if (response.data.success && response.data.user.role === 'admin') {
            navigate('/admin');
          }
        } catch (error) {
          // Токен недействителен, оставляем на странице входа
          localStorage.removeItem('token');
        }
      };
      
      checkAuth();
    }
  }, [navigate]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await axios.post('http://localhost:3001/api/auth/login', {
        email,
        password
      });
      
      if (response.data.success) {
        const { token, user } = response.data;
        
        // Проверка на права администратора
        if (user.role !== 'admin') {
          setError('У вас нет прав администратора');
          setIsLoading(false);
          return;
        }
        
        // Сохраняем токен
        localStorage.setItem('token', token);
        
        // Переходим в админку
        navigate('/admin');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Ошибка входа в систему');
    }
    
    setIsLoading(false);
  };
  
  return (
    <div className="admin-login-container">
      <div className="admin-login-form">
        <h1>WTFdesign</h1>
        <p>Вход в панель администратора</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="login-btn" 
            disabled={isLoading}
          >
            {isLoading ? 'Вход...' : 'Войти'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;