import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './RegisterPage.css';

function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    // Проверка совпадения паролей
    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await axios.post('http://localhost:3001/api/auth/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      
      if (response.data.success) {
        setRegistered(true);
        // Автоматическое перенаправление на страницу входа через 3 секунды
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Произошла ошибка при регистрации');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="register-container">
      <div className="register-form-wrapper">
        <h1>Регистрация в WTFdesign</h1>
        <p className="intro-text">Создайте аккаунт, чтобы сохранять выполненные задания и участвовать в турнирах</p>
        
        {registered ? (
          <div className="success-message">
            <h2>Регистрация успешна!</h2>
            <p>Ваш аккаунт создан. Перенаправление на страницу входа...</p>
            <Link to="/login" className="login-link">Войти сейчас</Link>
          </div>
        ) : (
          <>
            {error && <div className="error-message">{error}</div>}
            
            <form onSubmit={handleSubmit} className="register-form">
              <div className="form-group">
                <label htmlFor="username">Имя пользователя</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  minLength="3"
                  maxLength="30"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password">Пароль</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength="6"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmPassword">Подтверждение пароля</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength="6"
                />
              </div>
              
              <button 
                type="submit" 
                className="register-btn" 
                disabled={isLoading}
              >
                {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
              </button>
            </form>
            
            <div className="auth-links">
              <p>Уже есть аккаунт? <Link to="/login">Войти</Link></p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default RegisterPage;