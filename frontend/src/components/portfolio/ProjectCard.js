// frontend/src/components/portfolio/ProjectCard.js
import React from 'react';
import { Link } from 'react-router-dom';
import './ProjectCard.css';

function ProjectCard({ project }) {
  return (
    <div className="project-card">
      <Link to={`/project/${project._id}`} className="project-card-link">
        <div className="project-card-image-container">
          <img 
            src={`http://localhost:3001${project.coverImage}`} 
            alt={project.title} 
            className="project-card-image"
          />
          <div className="project-card-overlay">
            <div className="project-card-stats">
              <span className="stat">
                <i className="fas fa-eye"></i> {project.views}
              </span>
              <span className="stat">
                <i className="fas fa-heart"></i> {project.likes.count}
              </span>
              <span className="stat">
                <i className="fas fa-comment"></i> {project.comments.length}
              </span>
            </div>
          </div>
        </div>
        <div className="project-card-content">
          <h3 className="project-card-title">{project.title}</h3>
          <div className="project-card-creator">
            <img 
              src={`http://localhost:3001${project.creator.profileImage}`} 
              alt={project.creator.username} 
              className="creator-avatar"
            />
            <span className="creator-name">{project.creator.username}</span>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default ProjectCard;