import SectionTitle from '../ui/SectionTitle';
import workExperienceData from '../../data/work_experience.json';

const WorkExperience = () => {
  // Remove unnecessary state - data is static and doesn't need to be in state
  const experiences = workExperienceData;

  const TimelineDot = ({ isCurrent }) => (
    <div
      className={`w-3 h-3 md:w-4 md:h-4 rounded-full border-2 relative z-10 flex-shrink-0 ${
        isCurrent ? 'shadow-lg' : ''
      }`}
      style={{
        backgroundColor: isCurrent ? 'var(--accent)' : 'var(--bg-secondary)',
        borderColor: 'var(--accent)',
        ...(isCurrent && { boxShadow: '0 0 0 3px var(--accent)20' }),
      }}
    />
  );

  const TimelineLine = () => (
    <div
      className="w-0.5 flex-1 mt-2"
      style={{
        backgroundColor: 'var(--card-border)',
        minHeight: '20px',
      }}
    />
  );

  const TimeFrameBadge = ({ timeFrame }) => (
    <div className="mb-3 md:mb-4">
      <span
        className="text-xs md:text-sm font-medium px-3 md:px-4 py-1.5 md:py-2 rounded-lg"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          color: 'var(--text-secondary)',
          border: '1px solid var(--card-border)',
        }}
      >
        {timeFrame}
      </span>
    </div>
  );

  const CompanyInfo = ({ company, designation }) => (
    <div className="mb-3 md:mb-4">
      <h3
        className="text-lg md:text-h4 font-semibold mb-1 md:mb-2"
        style={{ color: 'var(--text-primary)' }}
      >
        {company}
      </h3>
      <p
        className="text-base md:text-lg font-medium"
        style={{ color: 'var(--accent)' }}
      >
        {designation}
      </p>
    </div>
  );

  const Objective = ({ objective }) => (
    <p
      className="text-sm md:text-base leading-relaxed max-w-3xl"
      style={{ color: 'var(--text-secondary)' }}
    >
      {objective}
    </p>
  );

  const ExperienceItem = ({ experience, index, totalItems }) => {
    const isCurrent = experience.timeFrame.includes('Present');
    const isLast = index === totalItems - 1;

    return (
      <div
        className="flex items-stretch work-experience-item"
        data-work-item={experience.id}
        data-company-logo={experience.companyLogo}
      >
        {/* Timeline Column - Responsive width */}
        <div className="flex flex-col items-center w-16 md:w-24 flex-shrink-0">
          <TimelineDot isCurrent={isCurrent} />
          {!isLast && <TimelineLine />}
        </div>

        {/* Content Column - Responsive padding */}
        <div className="flex-1 pl-4 md:pl-8">
          <TimeFrameBadge timeFrame={experience.timeFrame} />
          <CompanyInfo
            company={experience.company}
            designation={experience.designation}
          />
          <Objective objective={experience.objective} />
          {!isLast && <div className="h-8 md:h-12" />}
        </div>
      </div>
    );
  };

  return (
    <>
      <div style={{ height: 80 }} />
      <div className="w-full" data-section="work-experience">
        <div className="mb-8 md:mb-16">
          <SectionTitle primaryText="WORK" secondaryText="EXPERIENCE" />
        </div>

        <div className="relative max-w-5xl work-experience-section">
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
    </>
  );
};

export default WorkExperience;
