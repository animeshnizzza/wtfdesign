import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';

// Импортируем публичные страницы
import HomePage from './pages/HomePage';
import GeneratorPage from './pages/GeneratorPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';

// Импортируем компоненты портфолио
import ExplorePage from './pages/ExplorePage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import CreateProjectPage from './pages/CreateProjectPage';
import ProfilePage from './pages/ProfilePage';

// Импортируем компоненты админки
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import TasksList from './pages/admin/TasksList';
import TaskForm from './pages/admin/TaskForm';
import RestrictionsList from './pages/admin/RestrictionsList';
import RestrictionForm from './pages/admin/RestrictionForm';

function App() {
  return (
    <Router>
      <Routes>
        {/* Публичные маршруты */}
        <Route path="/" element={<HomePage />} />
        <Route path="/generator" element={<GeneratorPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        
        {/* Маршруты портфолио */}
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/project/:id" element={<ProjectDetailPage />} />
        <Route path="/create-project" element={<CreateProjectPage />} />
        <Route path="/profile/:id" element={<ProfilePage />} />
        
        {/* Маршруты админки */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/tasks" element={<TasksList />} />
        <Route path="/admin/tasks/new" element={<TaskForm />} />
        <Route path="/admin/tasks/edit/:id" element={<TaskForm />} />
        <Route path="/admin/restrictions" element={<RestrictionsList />} />
        <Route path="/admin/restrictions/new" element={<RestrictionForm />} />
        <Route path="/admin/restrictions/edit/:id" element={<RestrictionForm />} />
      </Routes>
    </Router>
  );
}

export default App;