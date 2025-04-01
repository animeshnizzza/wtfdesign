// frontend/src/pages/ProfilePage.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ProjectGrid from '../components/portfolio/ProjectGrid';
import './ProfilePage.css';

function ProfilePage() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  
  // Проверяем, является ли профиль собственным
  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (loggedInUser.id === id) {
      setIsOwnProfile(true);
    }
  }, [id]);
  
  // Загружаем данные профиля
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        // Загружаем данные пользователя
        const userResponse = await fetch(`http://localhost:3001/api/users/${id}`, { headers });
        const userData = await userResponse.json();
        
        if (userData.success) {
          setUser(userData.user);
        } else {
          setError(userData.message || 'Не удалось загрузить данные пользователя');
          setLoading(false);
          return;
        }
        
        // Загружаем проекты пользователя
        const projectsResponse = await fetch(`http://localhost:3001/api/projects/user/${id}`, { headers });
        const projectsData = await projectsResponse.json();
        
        if (projectsData.success) {
          setProjects(projectsData.projects);
        } else {
          setError(projectsData.message || 'Не удалось загрузить проекты');
        }
      } catch (error) {
        console.error('Ошибка при загрузке профиля:', error);
        setError('Произошла ошибка при загрузке профиля');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [id]);
  
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading-container">
          <div className="loading-spinner">Загрузка профиля...</div>
        </div>
      </>
    );
  }
  
  if (error) {
    return (
      <>
        <Navbar />
        <div className="error-container">
          <div className="error-message">{error}</div>
          <Link to="/" className="back-link">На главную</Link>
        </div>
      </>
    );
  }
  
  if (!user) {
    return (
      <>
        <Navbar />
        <div className="error-container">
          <div className="error-message">Пользователь не найден</div>
          <Link to="/" className="back-link">На главную</Link>
        </div>
      </>
    );
  }
  
  return (
    <>
      <Navbar />
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-cover-container">
            <img 
              src={user.coverImage ? `http://localhost:3001${user.coverImage}` : '/default-cover.jpg'} 
              alt="Cover" 
              className="profile-cover"
            />
            <div className="profile-avatar-container">
              <img 
                src={user.profileImage ? `http://localhost:3001${user.profileImage}` : '/default-profile.jpg'} 
                alt={user.username} 
                className="profile-avatar"
              />
            </div>
          </div>
          
          <div className="profile-info">
            <h1 className="profile-name">{user.username}</h1>
            {user.bio && <p className="profile-bio">{user.bio}</p>}
            
            <div className="profile-details">
              {user.location && (
                <div className="profile-detail">
                  <i className="fas fa-map-marker-alt"></i>
                  <span>{user.location}</span>
                </div>
              )}
              
              {user.website && (
                <div className="profile-detail">
                  <i className="fas fa-globe"></i>
                  <a href={user.website} target="_blank" rel="noopener noreferrer">
                    {user.website.replace(/^https?:\/\/(www\.)?/, '')}
                  </a>
                </div>
              )}
            </div>
            
            {isOwnProfile && (
              <div className="profile-actions">
                <Link to="/profile/edit" className="edit-profile-btn">
                  Редактировать профиль
                </Link>
              </div>
            )}
          </div>
        </div>
        
        <div className="profile-content">
          <div className="profile-tabs">
            <button className="tab-button active">Проекты</button>
            <button className="tab-button">Сохраненное</button>
            <button className="tab-button">О пользователе</button>
          </div>
          
          <div className="profile-projects">
            <h2>Проекты пользователя</h2>
            {isOwnProfile && (
              <Link to="/create-project" className="create-project-btn">
                Создать новый проект
              </Link>
            )}
            
            <ProjectGrid projects={projects} loading={false} error={""} />
          </div>
        </div>
      </div>
    </>
  );
}

export default ProfilePage;