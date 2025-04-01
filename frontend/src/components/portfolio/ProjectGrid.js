// frontend/src/components/portfolio/ProjectGrid.js
import React from 'react';
import ProjectCard from './ProjectCard';
import './ProjectGrid.css';

function ProjectGrid({ projects, loading, error }) {
  if (loading) {
    return <div className="loading-spinner">Загрузка проектов...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (projects.length === 0) {
    return <div className="no-projects">Проекты не найдены</div>;
  }

  return (
    <div className="project-grid">
      {projects.map(project => (
        <ProjectCard key={project._id} project={project} />
      ))}
    </div>
  );
}

export default ProjectGrid;