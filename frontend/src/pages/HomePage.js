// frontend/src/pages/HomePage.js
import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../App.css';

function HomePage() {
  return (
    <>
      <Navbar />
      <div className="homepage">
        <header className="hero-section">
          <div className="hero-content">
            <h1>WTFdesign</h1>
            <p className="hero-subtitle">Безумные задания для развития креативности дизайнеров</p>
            <Link to="/generator" className="cta-button">Начать творить</Link>
          </div>
        </header>

        <main className="homepage-main">
          <section className="features-section">
            <h2>Что такое WTFdesign?</h2>
            <div className="features-grid">
              <div className="feature-card">
                <h3>Генератор заданий</h3>
                <p>Получите случайное задание для любого направления дизайна с уникальными ограничениями</p>
              </div>
              
              <div className="feature-card">
                <h3>Развитие креативности</h3>
                <p>Неожиданные ограничения помогут вам мыслить нестандартно и находить новые решения</p>
              </div>
              
              <div className="feature-card">
                <h3>Портфолио</h3>
                <p>Сохраняйте свои работы и делитесь ими с сообществом дизайнеров</p>
              </div>
              
              <div className="feature-card">
                <h3>Турниры</h3>
                <p>Участвуйте в соревнованиях с другими дизайнерами и получайте обратную связь</p>
              </div>
            </div>
          </section>

          <section className="directions-section">
            <h2>Доступные направления</h2>
            <div className="directions-grid">
              <div className="direction-card">
                <h3>UX/UI дизайн</h3>
                <p>Создание интерфейсов и повышение удобства использования продуктов</p>
                <Link to="/generator?direction=ux-ui" className="direction-link">Начать</Link>
              </div>
              
              <div className="direction-card">
                <h3>Графический дизайн</h3>
                <p>От брендинга и типографики до плакатов и упаковки</p>
                <Link to="/generator?direction=graphic" className="direction-link">Начать</Link>
              </div>
              
              <div className="direction-card">
                <h3>Моушн-дизайн</h3>
                <p>Анимация и движущаяся графика для видео и интерфейсов</p>
                <Link to="/generator?direction=motion" className="direction-link">Начать</Link>
              </div>
              
              <div className="direction-card">
                <h3>Иллюстрация</h3>
                <p>Создание авторских изображений и художественных работ</p>
                <Link to="/generator?direction=illustration" className="direction-link">Начать</Link>
              </div>
              
              <div className="direction-card">
                <h3>3D концепт</h3>
                <p>Трехмерное моделирование и визуализация объектов и сцен</p>
                <Link to="/generator?direction=3d" className="direction-link">Начать</Link>
              </div>
            </div>
          </section>
          
          <section className="cta-section">
            <h2>Готовы начать развивать свои творческие навыки?</h2>
            <p>Создайте аккаунт, чтобы сохранять задания и делиться своими работами</p>
            <div className="cta-buttons">
              <Link to="/register" className="cta-button">Зарегистрироваться</Link>
              <Link to="/login" className="cta-button secondary">Войти</Link>
            </div>
          </section>
        </main>
        
        <footer className="App-footer">
          <p>&copy; 2025 WTFdesign - Развивай свою креативность</p>
        </footer>
      </div>
    </>
  );
}

export default HomePage;