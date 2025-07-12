import { useState, useEffect } from 'react';
import SectionTitle from '../ui/SectionTitle';
import workExperienceData from '../../data/work_experience.json';

const WorkExperience = () => {
  const [experiences, setExperiences] = useState([]);

  useEffect(() => {
    setExperiences(workExperienceData);
  }, []);

  const ExperienceItem = ({ experience, index, totalItems }) => {
    return (
      <div className="flex gap-6 md:gap-8">
        {/* Timeline Column */}
        <div className="flex flex-col items-center flex-shrink-0 relative">
          {/* Timeline Line - extends full height */}
          <div
            className="absolute top-0 bottom-0 left-1/2 transform -translate-x-1/2 w-0.5"
            style={{ backgroundColor: 'var(--card-border)' }}
          />

          {/* Timeline Dot */}
          <div
            className="w-4 h-4 rounded-full border-2 relative z-10 mt-6"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--accent)',
            }}
          />

          {/* Current Position Indicator */}
          {experience.timeFrame.includes('Present') && (
            <div
              className="absolute left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full animate-pulse mt-8"
              style={{ backgroundColor: 'var(--accent)' }}
            />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 pb-8">
          {/* Time Frame Badge */}
          <div className="mb-4">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--card-border)',
              }}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: 'var(--accent)' }}
              />
              <span
                className="text-sm font-medium"
                style={{ color: 'var(--text-secondary)' }}
              >
                {experience.timeFrame}
              </span>
            </div>
          </div>

          {/* Company and Designation */}
          <div className="mb-3">
            <h3 className="text-xl font-semibold mb-1">{experience.company}</h3>
            <p
              className="text-base font-medium"
              style={{ color: 'var(--accent)' }}
            >
              {experience.designation}
            </p>
          </div>

          {/* Objective */}
          <p
            className="text-base leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            {experience.objective}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <SectionTitle primaryText="WORK" secondaryText="EXPERIENCE" />

      <div className="space-y-0">
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
