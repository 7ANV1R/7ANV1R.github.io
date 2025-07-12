import { useState, useEffect } from 'react';
import SectionTitle from '../ui/SectionTitle';
import workExperienceData from '../../data/work_experience.json';

const WorkExperience = () => {
  const [experiences, setExperiences] = useState([]);

  useEffect(() => {
    setExperiences(workExperienceData);
  }, []);

  const ExperienceItem = ({ experience, index, totalItems }) => {
    const isCurrent = experience.timeFrame.includes('Present');
    const isLast = index === totalItems - 1;

    return (
      <div
        className="flex items-stretch"
        style={{ marginBottom: isLast ? '0' : '32px' }}
      >
        {/* Timeline Column - matches content height */}
        <div className="flex flex-col items-center w-24 flex-shrink-0">
          {/* Timeline Dot */}
          <div
            className={`w-4 h-4 rounded-full border-2 relative z-10 flex-shrink-0 ${
              isCurrent ? 'shadow-lg' : ''
            }`}
            style={{
              backgroundColor: isCurrent
                ? 'var(--accent)'
                : 'var(--bg-secondary)',
              borderColor: 'var(--accent)',
              ...(isCurrent && { boxShadow: '0 0 0 3px var(--accent)20' }),
            }}
          />

          {/* Timeline Line - expands to match content height */}
          {!isLast && (
            <div
              className="w-0.5 flex-1 mt-2"
              style={{
                backgroundColor: 'var(--card-border)',
                minHeight: '20px',
              }}
            />
          )}
        </div>

        {/* Content Column */}
        <div className="flex-1 pl-8">
          {/* Time Frame */}
          <div className="mb-4">
            <span
              className="text-sm font-medium px-4 py-2 rounded-lg"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--card-border)',
              }}
            >
              {experience.timeFrame}
            </span>
          </div>

          {/* Company Name */}
          <h3
            className="text-h4 font-semibold mb-2"
            style={{ color: 'var(--text-primary)' }}
          >
            {experience.company}
          </h3>

          {/* Designation */}
          <p
            className="text-lg font-medium mb-4"
            style={{ color: 'var(--accent)' }}
          >
            {experience.designation}
          </p>

          {/* Objectives */}
          <p
            className="text-base leading-relaxed max-w-3xl"
            style={{ color: 'var(--text-secondary)' }}
          >
            {experience.objective}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      <div className="mb-16">
        <SectionTitle primaryText="WORK" secondaryText="EXPERIENCE" />
      </div>

      <div className="relative max-w-5xl">
        {experiences.map((experience, index) => (
          <ExperienceItem
            key={experience.id}
            experience={experience}
            index={index}
            totalItems={experiences.length}
          />
        ))}
      </div>
    </div>
  );
};

export default WorkExperience;
