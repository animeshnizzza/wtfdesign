import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Проверяем авторизацию при загрузке и изменении маршрута
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      setIsAuthenticated(true);
      const userData = JSON.parse(user);
      setUsername(userData.username);
      setUserId(userData.id);
    } else {
      setIsAuthenticated(false);
      setUsername('');
      setUserId('');
    }
  }, [location]);
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUsername('');
    setUserId('');
    navigate('/');
  };
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          WTFdesign
        </Link>
        
        <div className="menu-icon" onClick={toggleMenu}>
          <i className={isMenuOpen ? 'fas fa-times' : 'fas fa-bars'}></i>
        </div>
        
        <ul className={isMenuOpen ? 'nav-menu active' : 'nav-menu'}>
          <li className="nav-item">
            <Link
              to="/"
              className="nav-link"
              onClick={() => setIsMenuOpen(false)}
            >
              Главная
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/generator"
              className="nav-link"
              onClick={() => setIsMenuOpen(false)}
            >
              Генератор
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/explore"
              className="nav-link"
              onClick={() => setIsMenuOpen(false)}
            >
              Проекты
            </Link>
          </li>
          
          {isAuthenticated ? (
            <>
              <li className="nav-item">
                <Link
                  to="/create-project"
                  className="nav-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Добавить проект
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to={`/profile/${userId}`}
                  className="nav-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Профиль
                </Link>
              </li>
              <li className="nav-item">
                <button
                  className="nav-link logout-button"
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                >
                  Выйти
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <Link
                  to="/login"
                  className="nav-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Войти
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to="/register"
                  className="nav-link register-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Регистрация
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;