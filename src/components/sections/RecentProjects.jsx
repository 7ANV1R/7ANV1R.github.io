import { useState, useEffect } from 'react';
import SectionTitle from '../ui/SectionTitle';
import VideoPreview from '../ui/VideoPreview';
// import useVideoPreloader from '../../hooks/useVideoPreloader'; // Temporarily disabled
import projectsData from '../../data/recent_projects.json';
import { HiOutlinePhotograph } from 'react-icons/hi';
import { FiArrowUpRight } from 'react-icons/fi';

const RecentProjects = () => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    setProjects(projectsData);
  }, []);

  const ProjectItem = ({ project, isFirst, isLast }) => {
    const handleProjectClick = () => {
      const url = project.demoUrl || project.githubUrl;
      if (url) {
        window.open(url, '_blank');
      }
    };

    return (
      <>
        <div
          onClick={handleProjectClick}
          className={`group cursor-pointer py-8 transition-all duration-300 hover:bg-opacity-50 ${
            isFirst ? 'border-t' : ''
          } ${isLast ? '' : 'border-b'}`}
          style={{ borderColor: 'var(--card-border)' }}
        >
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
            {/* Video Preview */}
            <div className="w-full lg:w-80 flex-shrink-0">
              {project.videoPreview ? (
                <VideoPreview
                  videoSrc={project.videoPreview}
                  className="w-full"
                  onHover={true}
                />
              ) : project.thumbnail ? (
                <div
                  className="w-full rounded-xl overflow-hidden"
                  style={{ aspectRatio: '4/3' }}
                >
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
                </div>
              ) : (
                <div
                  className="w-full flex items-center justify-center rounded-xl"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    aspectRatio: '4/3',
                  }}
                >
                  <HiOutlinePhotograph
                    className="w-12 h-12 opacity-30"
                    style={{ color: 'var(--text-secondary)' }}
                  />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Title and Arrow */}
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-h4 font-semibold group-hover:text-accent transition-colors duration-300">
                  {project.title}
                </h3>
                <div className="ml-4 flex-shrink-0">
                  <FiArrowUpRight
                    className="arrow-icon w-6 h-6 opacity-40 group-hover:opacity-100 transition-all duration-300"
                    style={{ color: 'var(--accent)', strokeWidth: '2.5' }}
                  />
                </div>
              </div>

              {/* Tools/Frameworks */}
              <div className="flex flex-wrap gap-2 mb-4 group-hover:mb-6 transition-all duration-300">
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

              {/* Description - 3D rotation reveal effect on desktop, always visible on mobile */}
              <div className="description-container perspective-1000">
                <div className="description-content overflow-hidden transition-all duration-700 ease-out lg:max-h-0 lg:opacity-0 lg:group-hover:max-h-32 lg:group-hover:opacity-100 transform lg:rotate-x-90 origin-top lg:group-hover:rotate-x-0">
                  <p
                    className="text-paragraph leading-relaxed pb-2"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {project.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      <div style={{ height: 80 }} />

      <div className="space-y-8">
        <SectionTitle primaryText="RECENT" secondaryText="PROJECTS" />

        <div className="space-y-0">
          {projects.map((project, index) => (
            <ProjectItem
              key={project.id}
              project={project}
              isFirst={index === 0}
              isLast={index === projects.length - 1}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default RecentProjects;
