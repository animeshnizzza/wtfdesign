// frontend/src/pages/ProjectDetailPage.js
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './ProjectDetailPage.css';

function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  // Проверка авторизации
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
  }, []);
  
  // Загрузка проекта
  useEffect(() => {
    setLoading(true);
    setError('');
    
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    
    fetch(`http://localhost:3001/api/projects/${id}`, { headers })
      .then(response => response.json())
      .then(data => {
        setLoading(false);
        if (data.success) {
          setProject(data.project);
          
          // Если пользователь авторизован, проверяем, лайкнул ли он проект
          if (user) {
            setIsLiked(data.project.likes.users.includes(user.id));
            setIsSaved(user.savedProjects?.includes(data.project._id));
          }
        } else {
          setError(data.message || 'Произошла ошибка при загрузке проекта');
        }
      })
      .catch(error => {
        setLoading(false);
        console.error('Ошибка загрузки проекта:', error);
        setError('Не удалось загрузить проект. Проверьте подключение к серверу.');
      });
  }, [id, user]);
  
  // Обработчик лайка
  const handleLike = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/project/${id}` } });
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:3001/api/projects/${id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Обновляем состояние проекта
        setProject(prev => ({
          ...prev,
          likes: {
            ...prev.likes,
            count: data.likes
          }
        }));
        
        setIsLiked(data.isLiked);
      }
    } catch (error) {
      console.error('Ошибка при лайке проекта:', error);
    }
  };
  
  // Обработчик сохранения
  const handleSave = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/project/${id}` } });
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:3001/api/projects/${id}/save`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setIsSaved(data.isSaved);
        
        // Обновляем данные пользователя в localStorage
        const userData = JSON.parse(localStorage.getItem('user'));
        
        if (data.isSaved) {
          userData.savedProjects = [...(userData.savedProjects || []), id];
        } else {
          userData.savedProjects = userData.savedProjects.filter(projectId => projectId !== id);
        }
        
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      }
    } catch (error) {
      console.error('Ошибка при сохранении проекта:', error);
    }
  };
  
  // Обработчик добавления комментария
  const handleAddComment = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/project/${id}` } });
      return;
    }
    
    if (!comment.trim()) return;
    
    setIsSubmittingComment(true);
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:3001/api/projects/${id}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ text: comment })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Добавляем новый комментарий к проекту
        setProject(prev => ({
          ...prev,
          comments: [...prev.comments, data.comment]
        }));
        
        // Очищаем поле ввода
        setComment('');
      }
    } catch (error) {
      console.error('Ошибка при добавлении комментария:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };
  
  // Обработчик добавления appreciation
  const handleAppreciation = async (type) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/project/${id}` } });
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:3001/api/projects/${id}/appreciation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ type })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Обновляем состояние проекта
        const updatedAppreciations = project.appreciations.filter(
          a => a.user._id !== user.id
        );
        
        updatedAppreciations.push({
          user: { _id: user.id, username: user.username },
          type: data.userAppreciationType
        });
        
        setProject(prev => ({
          ...prev,
          appreciations: updatedAppreciations
        }));
      }
    } catch (error) {
      console.error('Ошибка при добавлении appreciation:', error);
    }
  };
  
  // Если идет загрузка
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading-container">
          <div className="loading-spinner">Загрузка проекта...</div>
        </div>
      </>
    );
  }
  
  // Если произошла ошибка
  if (error) {
    return (
      <>
        <Navbar />
        <div className="error-container">
          <div className="error-message">{error}</div>
          <Link to="/explore" className="back-link">Вернуться к проектам</Link>
        </div>
      </>
    );
  }
  
  // Если проект не найден
  if (!project) {
    return (
      <>
        <Navbar />
        <div className="error-container">
          <div className="error-message">Проект не найден</div>
          <Link to="/explore" className="back-link">Вернуться к проектам</Link>
        </div>
      </>
    );
  }
  
  // Определяем главное изображение (обложка или выбранное из галереи)
  const mainImage = selectedImageIndex === 0 
    ? `http://localhost:3001${project.coverImage}`
    : `http://localhost:3001${project.images[selectedImageIndex - 1].url}`;
  
  // Подсчитываем количество оценок по типам
  const appreciationCounts = {
    innovative: project.appreciations.filter(a => a.type === 'innovative').length,
    visually_appealing: project.appreciations.filter(a => a.type === 'visually_appealing').length,
    functional: project.appreciations.filter(a => a.type === 'functional').length,
    creative: project.appreciations.filter(a => a.type === 'creative').length
  };
  
  // Определяем тип оценки текущего пользователя (если есть)
  const userAppreciationType = user 
    ? project.appreciations.find(a => a.user._id === user.id)?.type 
    : null;
  
  return (
    <>
      <Navbar />
      <div className="project-detail-container">
        <div className="project-header">
          <h1 className="project-title">{project.title}</h1>
          
          <div className="project-creator">
            <Link to={`/profile/${project.creator._id}`} className="creator-link">
              <img 
                src={`http://localhost:3001${project.creator.profileImage}`} 
                alt={project.creator.username} 
                className="creator-avatar"
              />
              <span className="creator-name">{project.creator.username}</span>
            </Link>
            
            <div className="project-meta">
              <span className="meta-item">
                <i className="fas fa-eye"></i> {project.views} просмотров
              </span>
              <span className="meta-item">
                <i className="fas fa-calendar"></i> {new Date(project.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          
          <div className="project-actions">
            <button 
              className={`action-button like-button ${isLiked ? 'active' : ''}`}
              onClick={handleLike}
            >
              <i className={`${isLiked ? 'fas' : 'far'} fa-heart`}></i>
              <span>Нравится ({project.likes.count})</span>
            </button>
            
            <button 
              className={`action-button save-button ${isSaved ? 'active' : ''}`}
              onClick={handleSave}
            >
              <i className={`${isSaved ? 'fas' : 'far'} fa-bookmark`}></i>
              <span>{isSaved ? 'Сохранено' : 'Сохранить'}</span>
            </button>
          </div>
        </div>
        
        <div className="project-content">
          <div className="project-gallery">
            <div className="main-image-container">
              <img src={mainImage} alt={project.title} className="main-image" />
            </div>
            
            <div className="thumbnails">
              <div 
                className={`thumbnail ${selectedImageIndex === 0 ? 'active' : ''}`}
                onClick={() => setSelectedImageIndex(0)}
              >
                <img 
                  src={`http://localhost:3001${project.coverImage}`} 
                  alt="Cover" 
                />
              </div>
              
              {project.images.map((image, index) => (
                <div 
                  key={index}
                  className={`thumbnail ${selectedImageIndex === index + 1 ? 'active' : ''}`}
                  onClick={() => setSelectedImageIndex(index + 1)}
                >
                  <img 
                    src={`http://localhost:3001${image.url}`} 
                    alt={image.caption || `Image ${index + 1}`} 
                  />
                </div>
              ))}
            </div>
          </div>
          
          <div className="project-details">
            <div className="project-description">
              <h2>Описание проекта</h2>
              <p>{project.description}</p>
            </div>
            
            {project.taskDetails && (
              <div className="project-task">
                <h2>Задание WTFdesign</h2>
                <div className="task-card">
                  <p className="task-description">{project.taskDetails.taskDescription}</p>
                  
                  {Object.keys(project.taskDetails.restrictions).length > 0 && (
                    <div className="restrictions-list">
                      <h4>Ограничения:</h4>
                      {Object.entries(project.taskDetails.restrictions).map(([type, restrictions]) => (
                        <div key={type} className="restriction-group">
                          <p>
                            <strong>
                              {type === 'color' ? 'Цветовые' : 
                               type === 'technical' ? 'Технические' : 
                               type === 'stylistic' ? 'Стилистические' : 
                               'Эмоциональные'} ограничения:
                            </strong>
                          </p>
                          <ul>
                            {restrictions.map(restriction => (
                              <li key={restriction.id}>{restriction.name}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {project.tags && project.tags.length > 0 && (
              <div className="project-tags">
                <h2>Теги</h2>
                <div className="tags-list">
                  {project.tags.map(tag => (
                    <Link key={tag} to={`/explore?tags=${tag}`} className="tag">
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            
            {project.tools && project.tools.length > 0 && (
              <div className="project-tools">
                <h2>Инструменты</h2>
                <div className="tools-list">
                  {project.tools.map(tool => (
                    <span key={tool} className="tool">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div className="project-appreciations">
              <h2>Оценка работы</h2>
              <div className="appreciation-buttons">
                <button 
                  className={`appreciation-button ${userAppreciationType === 'innovative' ? 'active' : ''}`}
                  onClick={() => handleAppreciation('innovative')}
                >
                  <i className="fas fa-lightbulb"></i>
                  <span>Инновационно</span>
                  <span className="count">{appreciationCounts.innovative}</span>
                </button>
                
                <button 
                  className={`appreciation-button ${userAppreciationType === 'visually_appealing' ? 'active' : ''}`}
                  onClick={() => handleAppreciation('visually_appealing')}
                >
                  <i className="fas fa-eye"></i>
                  <span>Визуально привлекательно</span>
                  <span className="count">{appreciationCounts.visually_appealing}</span>
                </button>
                
                <button 
                  className={`appreciation-button ${userAppreciationType === 'functional' ? 'active' : ''}`}
                  onClick={() => handleAppreciation('functional')}
                >
                  <i className="fas fa-cogs"></i>
                  <span>Функционально</span>
                  <span className="count">{appreciationCounts.functional}</span>
                </button>
                
                <button 
                  className={`appreciation-button ${userAppreciationType === 'creative' ? 'active' : ''}`}
                  onClick={() => handleAppreciation('creative')}
                >
                  <i className="fas fa-magic"></i>
                  <span>Креативно</span>
                  <span className="count">{appreciationCounts.creative}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="project-comments">
          <h2>Комментарии ({project.comments.length})</h2>
          
          {isAuthenticated ? (
            <form onSubmit={handleAddComment} className="comment-form">
              <textarea
                placeholder="Оставьте комментарий..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
              ></textarea>
              <button 
                type="submit" 
                disabled={isSubmittingComment || !comment.trim()}
              >
                {isSubmittingComment ? 'Отправка...' : 'Отправить'}
              </button>
            </form>
          ) : (
            <div className="login-prompt">
              <p>Войдите, чтобы оставить комментарий</p>
              <Link to="/login" className="login-link">Войти</Link>
            </div>
          )}
          
          <div className="comments-list">
            {project.comments.length === 0 ? (
              <div className="no-comments">
                <p>Пока нет комментариев. Будьте первым!</p>
              </div>
            ) : (
              project.comments.map((comment, index) => (
                <div key={index} className="comment">
                  <div className="comment-header">
                    <Link to={`/profile/${comment.user._id}`} className="comment-author">
                      <img 
                        src={`http://localhost:3001${comment.user.profileImage}`} 
                        alt={comment.user.username} 
                        className="author-avatar"
                      />
                      <span className="author-name">{comment.user.username}</span>
                    </Link>
                    <span className="comment-date">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="comment-text">{comment.text}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default ProjectDetailPage;