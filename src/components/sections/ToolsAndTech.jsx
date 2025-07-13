import React from 'react';
import SectionTitle from '../ui/SectionTitle';
import {
  HiOutlineCodeBracket,
  HiOutlineWrenchScrewdriver,
  HiOutlineEye,
  HiOutlineLightBulb,
} from 'react-icons/hi2';

const ToolsAndTech = () => {
  const categories = [
    {
      id: 'programming',
      title: 'Programming',
      icon: HiOutlineCodeBracket,
      items: [
        'Dart',
        'Flutter',
        'JavaScript',
        'Node.js',
        'Express.js',
        'SQL',
        'MongoDB',
      ],
    },
    {
      id: 'tools',
      title: 'Tools',
      icon: HiOutlineWrenchScrewdriver,
      items: ['Firebase', 'Supabase', 'Git', 'Docker', 'Postman'],
    },
    {
      id: 'design',
      title: 'Design',
      icon: HiOutlineEye,
      items: ['Figma', 'Rive', 'Photoshop', 'Premiere Pro'],
    },
    {
      id: 'interests',
      title: 'Interests',
      icon: HiOutlineLightBulb,
      items: ['Interactive Design', '3D Design', 'Cinematography'],
    },
  ];

  const CategoryCard = ({ category }) => {
    const IconComponent = category.icon;

    return (
      <div className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6 hover:bg-white/10 transition-all duration-300">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <IconComponent className="w-5 h-5 text-white" />
          </div>
          <h3
            className="text-xl font-semibold"
            style={{ color: 'var(--text-primary)' }}
          >
            {category.title}
          </h3>
        </div>

        {/* Skills grid */}
        <div className="grid grid-cols-2 gap-3">
          {category.items.map((item, index) => (
            <div
              key={index}
              className="px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--card-border)',
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <div style={{ height: 80 }} />

      <div className="space-y-8">
        <SectionTitle primaryText="TOOLS &" secondaryText="TECHNOLOGIES" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </>
  );
};

export default ToolsAndTech;
