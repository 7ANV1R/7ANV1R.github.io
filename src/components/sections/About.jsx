import React from 'react';
import SectionTitle from '../ui/SectionTitle';
import { track } from '../../analytics';
import Icon from '../ui/Icon';
import orangePattern from '../../assets/orange-pattern.svg';
import greenPattern from '../../assets/green-pattern.svg';

// Content configuration - moved outside component to prevent re-renders
const cardData = [
  {
    id: 'code',
    title: ['CODE, CODE', '& VIBE CODE'],
    icon: 'code',
    bgClass: 'from-orange-400 to-red-500',
    pattern: orangePattern,
    textColor: 'text-white',
    borderColor: 'border-white',
    hoverColors: 'group-hover:bg-white group-hover:text-orange-500',
    url: 'https://github.com/7ANV1R',
  },
  {
    id: 'design',
    title: ['FIGMA,SPLINE', '& DESIGN'],
    icon: 'template',
    bgClass: 'from-lime-400 to-green-400',
    pattern: greenPattern,
    textColor: 'text-black',
    borderColor: 'border-black',
    hoverColors: 'group-hover:bg-black group-hover:text-lime-400',
    url: 'https://www.behance.net/Tanvir_ibn_mizan',
  },
];

/**
 * About Section Component
 *
 * Features a simple text display with action cards.
 */
const About = () => {
  return (
    <>
      <div style={{ height: 80 }} />

      {/* Section title */}
      <SectionTitle primaryText="SOFTWARE" secondaryText="ENGINEER" />

      {/* Simple paragraph */}
      <div className="flex flex-col items-start justify-center mt-8 w-full max-w-3xl">
        <div className="text-lg text-gray-500 w-full text-left">
          <p>
            I am a software engineer building cross-platform mobile apps,
            mostly with Flutter. And yes, I started coding back when people
            wrote code by hand and copied answers from Stack Overflow. I
            really enjoy mobile app development, especially designs with
            motion and small interactions that make an app feel alive.
          </p>
        </div>
      </div>

      {/* Action cards grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-12 max-w-4xl lg:max-w-3xl">
        {cardData.map((card) => (
          <div
            key={card.id}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${
              card.bgClass
            } p-6 ${
              card.textColor
            } group cursor-pointer w-full lg:max-w-sm about-card-${
              card.id === 'code' ? 'orange' : 'green'
            }`}
            onClick={() => {
              track('link_clicked', { url: card.url });
              window.open(card.url, '_blank');
            }}
          >
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-100">
              <img
                src={card.pattern}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>

            {/* Card content */}
            <div className="relative z-10 flex flex-col justify-between h-full min-h-[160px]">
              <div>
                <div
                  className={`w-6 h-6 border-2 ${card.borderColor} rounded-md flex items-center justify-center mb-3`}
                >
                  <Icon name={card.icon} className="w-4 h-4" />
                </div>

                <h3 className="text-lg font-bold mb-3 leading-tight">
                  {card.title[0]}
                  <br />
                  {card.title[1]}
                </h3>
              </div>

              <div className="flex justify-start">
                <button
                  className={`w-10 h-10 border-2 ${card.borderColor} rounded-lg flex items-center justify-center ${card.hoverColors} transition-all duration-500 ease-out`}
                >
                  <Icon name="arrowRight" trigger=".group" className="w-4 h-4 about-arrow-icon" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default About;
