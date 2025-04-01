import React from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import './AdminDashboard.css';

function AdminDashboard() {
  return (
    <AdminLayout>
      <div className="admin-dashboard">
        <h1>Панель управления</h1>
        <p>Добро пожаловать в административную панель WTFdesign!</p>
        
        <div className="dashboard-cards">
          <div className="dashboard-card">
            <h3>Управление заданиями</h3>
            <p>Добавление, редактирование и удаление заданий для дизайнеров.</p>
            <a href="/admin/tasks" className="card-link">Перейти к заданиям</a>
          </div>
          
          <div className="dashboard-card">
            <h3>Турниры</h3>
            <p>Управление турнирами и соревнованиями между дизайнерами.</p>
            <a href="/admin/tournaments" className="card-link">Перейти к турнирам</a>
          </div>
          
          <div className="dashboard-card">
            <h3>Пользователи</h3>
            <p>Просмотр и управление аккаунтами пользователей.</p>
            <a href="/admin/users" className="card-link">Перейти к пользователям</a>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;