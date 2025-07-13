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
        'JavaScript',
        'C',
        'Flutter',
        'Node.js',
        'Express.js',
        'SQL',
        'MongoDB',
        'IsarDB',
      ],
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'tools',
      title: 'Tools',
      icon: HiOutlineWrenchScrewdriver,
      items: ['Firebase', 'Supabase', 'Postman', 'Docker', 'Git'],
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      id: 'visuals',
      title: 'Visuals',
      icon: HiOutlineEye,
      items: ['Figma', 'Rive', 'Premiere Pro', 'Photoshop'],
      gradient: 'from-orange-500 to-red-500',
    },
    {
      id: 'interests',
      title: 'Interests',
      icon: HiOutlineLightBulb,
      items: ['Interactive Design', '3D Design', 'Cinematography', 'Searching'],
      gradient: 'from-green-500 to-emerald-500',
    },
  ];

  const CategoryCard = ({ category }) => {
    const IconComponent = category.icon;

    return (
      <div
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br p-6 text-white group hover:scale-105 transition-transform duration-300 cursor-pointer w-full no-scroll-hover"
        style={{
          background: `linear-gradient(to bottom right, ${
            category.gradient.split(' ')[1]
          }, ${category.gradient.split(' ')[3]})`,
        }}
      >
        {/* Abstract background pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full bg-white/10 rounded-2xl"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between h-full min-h-[200px]">
          <div>
            <div className="w-8 h-8 border-2 border-white rounded-lg flex items-center justify-center mb-4">
              <IconComponent className="w-5 h-5" />
            </div>

            <h3 className="text-xl font-bold mb-4 leading-tight">
              {category.title}
            </h3>

            {/* Technology/Tool tags */}
            <div className="flex flex-wrap gap-2">
              {category.items.map((item, index) => (
                <span
                  key={index}
                  className="px-3 py-1 text-sm font-medium rounded-full bg-white/20 backdrop-blur-sm border border-white/30"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div style={{ height: 80 }} />

      <div className="space-y-8">
        <SectionTitle primaryText="SKILLS &" secondaryText="CRAFT" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>

        {/* Additional description */}
        <div className="flex flex-col items-center justify-center mt-12">
          <p className="text-lg text-gray-500 max-w-3xl text-center leading-relaxed">
            From mobile development with Flutter to backend systems with
            Node.js, I bring a diverse toolkit to every project. My passion for
            interactive design and cinematography drives me to create
            experiences that are both functional and visually compelling.
          </p>
        </div>
      </div>
    </>
  );
};

export default ToolsAndTech;
