import Skeleton from '../ui/Skeleton';
import SocialIcon from '../ui/SocialIcon';
import { FiGithub, FiTwitter, FiMail } from 'react-icons/fi';
import tanvirImg from '../../assets/tanvir.png';

const ProfileCard = () => {
  return (
    <>
      <div
        className="flex flex-col items-center justify-center p-4 sm:p-6 mx-2 sm:mx-4 lg:mx-12 rounded-lg shadow-md"
        style={{ backgroundColor: 'var(--card-bg)' }}
      >
        {/* image */}
        <div className="flex items-center justify-center mb-4 w-full">
          <div className="relative w-32 h-40 sm:w-40 sm:h-48 lg:w-48 lg:h-56">
            {/* Animated gradient background */}
            <div className="absolute inset-0 rounded-md overflow-hidden">
              <div
                className="w-[500%] h-full animate-pulse-slide"
                style={{
                  background:
                    'linear-gradient(to right, #fb923c 0%, #ef4444 20%, #a3e635 40%, #4ade80 60%, #fb923c 80%, #ef4444 100%)',
                }}
              ></div>
            </div>

            {/* Marquee logo layers */}
            <div className="absolute inset-0 rounded-md overflow-hidden z-5">
              {/* Generate 10 marquee lines from 40% to bottom with smaller gaps */}
              {Array.from({ length: 10 }, (_, index) => (
                <div 
                  key={index}
                  className="absolute left-0 right-0 flex items-center justify-center"
                  style={{ top: `${40 + (index * 60) / 9}%` }}
                >
                  <div className="marquee-container">
                    <div className={index % 2 === 0 ? "marquee-content" : "marquee-content-reverse"}></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Profile image */}
            <img
              src={tanvirImg}
              alt="Profile"
              className="relative z-10 w-full h-full rounded-md object-cover profile-image-hover"
            />
          </div>
        </div>

        {/* name */}
        <h2
          className="text-lg sm:text-xl lg:text-2xl font-semibold mb-2 text-center"
          style={{ color: 'var(--text-secondary)' }}
        >
          Tanvir Ibn Mizan
        </h2>

        {/* social link icon */}
        <div className="flex space-x-3 sm:space-x-4 mt-2 sm:mt-4">
          <SocialIcon icon={FiGithub} href="https://github.com/7anv1r" />
          <SocialIcon
            icon={FiTwitter}
            href="https://twitter.com/tanvir_ibn_mizan"
          />
          <SocialIcon icon={FiMail} href="mailto:tanvir.inquiries@gmail.com" />
        </div>
      </div>
    </>
  );
};

export default ProfileCard;
