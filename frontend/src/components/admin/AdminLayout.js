// frontend/src/components/admin/AdminLayout.js
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './AdminLayout.css';

function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Функция для проверки активного пути
  const isActivePath = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  
  // Функция для выхода из админки
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/admin/login');
  };
  
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <h2>WTFdesign</h2>
          <p>Админ панель</p>
        </div>
        
        <nav className="admin-nav">
          <ul>
            <li>
              <Link
                to="/admin"
                className={isActivePath('/admin') && !isActivePath('/admin/tasks') && !isActivePath('/admin/restrictions') ? 'active' : ''}
              >
                Дашборд
              </Link>
            </li>
            <li>
              <Link
                to="/admin/tasks"
                className={isActivePath('/admin/tasks') ? 'active' : ''}
              >
                Управление заданиями
              </Link>
            </li>
            <li>
              <Link
                to="/admin/restrictions"
                className={isActivePath('/admin/restrictions') ? 'active' : ''}
              >
                Управление ограничениями
              </Link>
            </li>
          </ul>
        </nav>
        
        <div className="admin-footer">
          <button className="logout-btn" onClick={handleLogout}>
            Выйти
          </button>
          <Link to="/" className="view-site-btn">
            На сайт
          </Link>
        </div>
      </aside>
      
      <main className="admin-content">
        {children}
      </main>
    </div>
  );
}

export default AdminLayout;