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
              <div className="w-[200%] h-full bg-gradient-to-r from-orange-400 to-red-500 animate-pulse-slide"></div>
            </div>
            {/* Profile image */}
            <img
              src={tanvirImg}
              alt="Profile"
              className="relative z-10 w-full h-full rounded-md object-cover"
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
