import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../App.css';

function GeneratorPage() {
  const [task, setTask] = useState(null);
  const [directions, setDirections] = useState([]);
  const [selectedDirection, setSelectedDirection] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [useTimer, setUseTimer] = useState(true);
  const [restrictionsCount, setRestrictionsCount] = useState(2);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Загрузка доступных направлений дизайна при запуске
  useEffect(() => {
    setIsLoading(true);
    setError('');
    
    fetch('http://localhost:3001/api/directions')
      .then(response => response.json())
      .then(data => {
        setIsLoading(false);
        if (data.success) {
          setDirections(data.directions);
        } else {
          setError(data.message || 'Произошла ошибка при загрузке направлений');
        }
      })
      .catch(error => {
        setIsLoading(false);
        console.error('Ошибка загрузки направлений:', error);
        setError('Не удалось загрузить направления. Проверьте подключение к серверу.');
      });
  }, []);

  // Обработчик изменения направления дизайна
  const handleDirectionChange = (e) => {
    const directionId = e.target.value;
    setSelectedDirection(directionId);
    setSelectedSubcategory(''); // Сбрасываем подкатегорию при смене направления
  };

  // Получение выбранного направления
  const selectedDirectionObj = directions.find(d => d.id === selectedDirection);

  // Функция для генерации нового задания
  const generateTask = () => {
    if (!selectedDirection) {
      alert('Выберите направление дизайна');
      return;
    }

    setIsLoading(true);
    setError('');
    
    fetch('http://localhost:3001/api/generate-task', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        designDirection: selectedDirection,
        subcategory: selectedSubcategory || null,
        useTimer: useTimer,
        restrictionsCount: restrictionsCount
      })
    })
      .then(response => response.json())
      .then(data => {
        setIsLoading(false);
        if (data.success) {
          setTask(data.task);
        } else {
          setError(data.message || 'Произошла ошибка при генерации задания');
        }
      })
      .catch(error => {
        setIsLoading(false);
        console.error('Ошибка генерации задания:', error);
        setError('Не удалось сгенерировать задание. Проверьте подключение к серверу.');
      });
  };

  return (
    <>
      <Navbar />
      <div className="App">
        <header className="App-header">
          <h1>WTFdesign</h1>
          <p>Безумные задания для развития креативности дизайнеров</p>
        </header>
        
        <main className="App-main">
          <div className="task-generator">
            <h2>Генератор заданий</h2>
            
            {error && <div className="error-message">{error}</div>}
            
            <div className="generator-form">
              <div className="form-group">
                <label>Выберите направление дизайна:</label>
                <select 
                  value={selectedDirection} 
                  onChange={handleDirectionChange}
                  disabled={isLoading}
                >
                  <option value="">Выберите направление</option>
                  {directions.map(direction => (
                    <option key={direction.id} value={direction.id}>
                      {direction.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {selectedDirectionObj && selectedDirectionObj.subcategories && selectedDirectionObj.subcategories.length > 0 && (
                <div className="form-group">
                  <label>Подкатегория (необязательно):</label>
                  <select 
                    value={selectedSubcategory} 
                    onChange={(e) => setSelectedSubcategory(e.target.value)}
                    disabled={isLoading}
                  >
                    <option value="">Любая подкатегория</option>
                    {selectedDirectionObj.subcategories.map(subcat => (
                      <option key={subcat.id} value={subcat.id}>
                        {subcat.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className="settings">
                <h3>Дополнительные настройки</h3>
                
                <div className="settings-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={useTimer}
                      onChange={(e) => setUseTimer(e.target.checked)}
                      disabled={isLoading}
                    />
                    Использовать ограничение по времени
                  </label>
                </div>
                
                <div className="settings-group">
                  <label>Количество типов ограничений: {restrictionsCount}</label>
                  <input
                    type="range"
                    min="0"
                    max="4"
                    value={restrictionsCount}
                    onChange={(e) => setRestrictionsCount(Number(e.target.value))}
                    className="slider"
                    disabled={isLoading}
                  />
                  <div className="slider-labels">
                    <span>Нет</span>
                    <span>Максимум</span>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={generateTask} 
                disabled={isLoading || !selectedDirection}
                className="generate-btn"
              >
                {isLoading ? 'Генерация...' : 'Сгенерировать задание'}
              </button>
            </div>
            
            {task && (
              <div className="task-result">
                <h3>Ваше задание:</h3>
                <div className="task-card">
                  <p className="task-description">{task.taskDescription}</p>
                  
                  <div className="task-details">
                    <p><strong>Направление:</strong> {
                      directions.find(d => d.id === task.designDirection)?.name
                    }</p>
                    
                    {task.timeLimit && (
                      <p><strong>Время выполнения:</strong> {
                        task.timeLimit <= 60 
                          ? `${task.timeLimit} минут` 
                          : `${Math.floor(task.timeLimit/60)} часов ${task.timeLimit % 60 ? `${task.timeLimit % 60} минут` : ''}`
                      }</p>
                    )}
                    
                    {Object.keys(task.restrictions).length > 0 && (
                      <div className="restrictions-list">
                        <h4>Ограничения:</h4>
                        
                        {task.restrictions.color && (
                          <div className="restriction-group">
                            <p><strong>Цветовые ограничения:</strong></p>
                            <ul>
                              {task.restrictions.color.map(restriction => (
                                <li key={restriction.id}>{restriction.name}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {task.restrictions.technical && (
                          <div className="restriction-group">
                            <p><strong>Технические ограничения:</strong></p>
                            <ul>
                              {task.restrictions.technical.map(restriction => (
                                <li key={restriction.id}>{restriction.name}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {task.restrictions.stylistic && (
                          <div className="restriction-group">
                            <p><strong>Стилистические ограничения:</strong></p>
                            <ul>
                              {task.restrictions.stylistic.map(restriction => (
                                <li key={restriction.id}>{restriction.name}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {task.restrictions.emotional && (
                          <div className="restriction-group">
                            <p><strong>Эмоциональные ограничения:</strong></p>
                            <ul>
                              {task.restrictions.emotional.map(restriction => (
                                <li key={restriction.id}>{restriction.name}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
        
        <footer className="App-footer">
          <p>&copy; 2025 WTFdesign - Развивай свою креативность</p>
        </footer>
      </div>
    </>
  );
}

export default GeneratorPage;