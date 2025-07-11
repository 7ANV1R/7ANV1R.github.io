import { useState, useEffect } from 'react';
import SectionTitle from '../ui/SectionTitle';
import projectsData from '../../data/recent_projects.json';

const RecentProjects = () => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    setProjects(projectsData);
  }, []);

  const ProjectItem = ({ project }) => {
    const handleProjectClick = () => {
      const url = project.demoUrl || project.githubUrl;
      if (url) {
        window.open(url, '_blank');
      }
    };

    return (
      <div
        onClick={handleProjectClick}
        className="group cursor-pointer py-8 border-b transition-all duration-300 hover:bg-opacity-50"
        style={{ borderColor: 'var(--card-border)' }}
      >
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          {/* Thumbnail */}
          <div className="w-full lg:w-80 h-48 lg:h-32 rounded-xl overflow-hidden flex-shrink-0 group-hover:scale-[1.02] transition-transform duration-300">
            {project.thumbnail ? (
              <img
                src={project.thumbnail}
                alt={project.title}
                className="w-full h-full object-cover"
                style={{ backgroundColor: 'var(--bg-secondary)' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div
              className={`${
                project.thumbnail ? 'hidden' : 'flex'
              } w-full h-full items-center justify-center rounded-xl`}
              style={{
                backgroundColor: 'var(--bg-secondary)',
                display: project.thumbnail ? 'none' : 'flex',
              }}
            >
              <svg
                className="w-12 h-12 opacity-30"
                style={{ color: 'var(--text-secondary)' }}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title and Arrow */}
            <div className="flex items-start justify-between mb-4">
              <h3
                className="text-h4 font-semibold group-hover:text-accent transition-colors duration-300"
                style={{ color: 'var(--text-primary)' }}
              >
                {project.title}
              </h3>
              <div className="ml-4 flex-shrink-0">
                <svg
                  className="w-6 h-6 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300"
                  style={{ color: 'var(--accent)' }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 17l9.2-9.2M17 17V7H7"
                  />
                </svg>
              </div>
            </div>

            {/* Tools/Frameworks */}
            <div className="flex flex-wrap gap-2 mb-4">
              {project.tools.map((tool, index) => (
                <span
                  key={index}
                  className="px-3 py-1 text-small font-medium rounded-full"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--card-border)',
                  }}
                >
                  {tool}
                </span>
              ))}
            </div>

            {/* Description */}
            <p
              className="text-paragraph leading-relaxed"
              style={{ color: 'var(--text-secondary)' }}
            >
              {project.description}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <SectionTitle primaryText="RECENT" secondaryText="PROJECTS" />

      <div className="space-y-0">
        {projects.map((project, index) => (
          <ProjectItem
            key={project.id}
            project={project}
            isLast={index === projects.length - 1}
          />
        ))}
      </div>
    </div>
  );
};

export default RecentProjects;
