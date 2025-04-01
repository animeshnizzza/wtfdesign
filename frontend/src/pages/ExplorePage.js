// frontend/src/pages/ExplorePage.js
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ProjectGrid from '../components/portfolio/ProjectGrid';
import './ExplorePage.css';

function ExplorePage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    sort: 'recent',
    tags: '',
    search: ''
  });
  
 // frontend/src/pages/ExplorePage.js (продолжение)
 const location = useLocation();
  
 // Обработка параметров URL
 useEffect(() => {
   const searchParams = new URLSearchParams(location.search);
   const sort = searchParams.get('sort') || 'recent';
   const tags = searchParams.get('tags') || '';
   const search = searchParams.get('search') || '';
   const page = parseInt(searchParams.get('page')) || 1;
   
   setFilters({ sort, tags, search });
   setCurrentPage(page);
 }, [location]);
 
 // Загрузка проектов
 useEffect(() => {
   setLoading(true);
   setError('');
   
   const { sort, tags, search } = filters;
   const queryParams = new URLSearchParams({
     page: currentPage,
     limit: 12,
     sort,
     ...(tags && { tags }),
     ...(search && { search })
   }).toString();
   
   fetch(`http://localhost:3001/api/projects?${queryParams}`)
     .then(response => response.json())
     .then(data => {
       setLoading(false);
       if (data.success) {
         setProjects(data.projects);
         setTotalPages(data.totalPages);
       } else {
         setError(data.message || 'Произошла ошибка при загрузке проектов');
       }
     })
     .catch(error => {
       setLoading(false);
       console.error('Ошибка загрузки проектов:', error);
       setError('Не удалось загрузить проекты. Проверьте подключение к серверу.');
     });
 }, [filters, currentPage]);
 
 // Обработчик изменения фильтров
 const handleFilterChange = (e) => {
   const { name, value } = e.target;
   setFilters(prev => ({ ...prev, [name]: value }));
   setCurrentPage(1);
   
   // Обновляем URL
   const searchParams = new URLSearchParams({
     ...(value && { [name]: value }),
     ...(name !== 'sort' && filters.sort !== 'recent' && { sort: filters.sort }),
     ...(name !== 'tags' && filters.tags && { tags: filters.tags }),
     ...(name !== 'search' && filters.search && { search: filters.search })
   });
   
   window.history.pushState(
     {},
     '',
     `${location.pathname}?${searchParams.toString()}`
   );
 };
 
 // Обработчик поиска
 const handleSearch = (e) => {
   e.preventDefault();
   const searchInput = e.target.elements.search.value;
   setFilters(prev => ({ ...prev, search: searchInput }));
   setCurrentPage(1);
   
   // Обновляем URL
   const searchParams = new URLSearchParams({
     ...(searchInput && { search: searchInput }),
     ...(filters.sort !== 'recent' && { sort: filters.sort }),
     ...(filters.tags && { tags: filters.tags })
   });
   
   window.history.pushState(
     {},
     '',
     `${location.pathname}?${searchParams.toString()}`
   );
 };
 
 // Обработчик пагинации
 const handlePageChange = (page) => {
   setCurrentPage(page);
   
   // Обновляем URL
   const searchParams = new URLSearchParams({
     page,
     ...(filters.sort !== 'recent' && { sort: filters.sort }),
     ...(filters.tags && { tags: filters.tags }),
     ...(filters.search && { search: filters.search })
   });
   
   window.history.pushState(
     {},
     '',
     `${location.pathname}?${searchParams.toString()}`
   );
   
   // Прокручиваем страницу вверх
   window.scrollTo({ top: 0, behavior: 'smooth' });
 };
 
 // Рендеринг пагинации
 const renderPagination = () => {
   if (totalPages <= 1) return null;
   
   const pages = [];
   for (let i = 1; i <= totalPages; i++) {
     pages.push(
       <button
         key={i}
         className={`pagination-button ${currentPage === i ? 'active' : ''}`}
         onClick={() => handlePageChange(i)}
       >
         {i}
       </button>
     );
   }
   
   return (
     <div className="pagination">
       <button
         className="pagination-button prev"
         disabled={currentPage === 1}
         onClick={() => handlePageChange(currentPage - 1)}
       >
         &laquo; Назад
       </button>
       
       <div className="pagination-pages">
         {pages}
       </div>
       
       <button
         className="pagination-button next"
         disabled={currentPage === totalPages}
         onClick={() => handlePageChange(currentPage + 1)}
       >
         Вперед &raquo;
       </button>
     </div>
   );
 };
 
 return (
   <>
     <Navbar />
     <div className="explore-container">
       <div className="explore-header">
         <h1>Исследуйте проекты сообщества</h1>
         <p>Вдохновляйтесь работами других дизайнеров</p>
       </div>
       
       <div className="explore-filters">
         <div className="search-form-container">
           <form onSubmit={handleSearch} className="search-form">
             <input
               type="text"
               name="search"
               placeholder="Поиск проектов..."
               defaultValue={filters.search}
             />
             <button type="submit">Поиск</button>
           </form>
         </div>
         
         <div className="filter-controls">
           <div className="filter-group">
             <label>Сортировка:</label>
             <select
               name="sort"
               value={filters.sort}
               onChange={handleFilterChange}
             >
               <option value="recent">Недавние</option>
               <option value="popular">Популярные</option>
               <option value="most_viewed">Самые просматриваемые</option>
             </select>
           </div>
           
           <div className="filter-group">
             <label>Теги:</label>
             <select
               name="tags"
               value={filters.tags}
               onChange={handleFilterChange}
             >
               <option value="">Все теги</option>
               <option value="ux-ui">UX/UI дизайн</option>
               <option value="graphic">Графический дизайн</option>
               <option value="motion">Моушн-дизайн</option>
               <option value="illustration">Иллюстрация</option>
               <option value="3d">3D дизайн</option>
             </select>
           </div>
         </div>
       </div>
       
       <ProjectGrid 
         projects={projects} 
         loading={loading} 
         error={error} 
       />
       
       {renderPagination()}
     </div>
   </>
 );
}

export default ExplorePage;