import Skeleton from '../ui/Skeleton';
import SocialIcon from '../ui/SocialIcon';
import { FiGithub, FiTwitter, FiMail } from 'react-icons/fi';

const ProfileCard = () => {
  return (
    <>
      <div
        className="flex flex-col items-center justify-center p-6 m-12 rounded-lg shadow-md"
        style={{ backgroundColor: 'var(--card-bg)' }}
      >
        {/* image */}
        <div className="flex items-center mb-4">
          <img
            src="/src/assets/tanvir.png"
            alt="Profile"
            className="w-48 h-56 rounded-md object-cover m-8"
          />
        </div>

        {/* name */}
        <h2
          className="text-2xl font-semibold mb-2"
          style={{ color: 'var(--text-secondary)' }}
        >
          Tanvir Ibn Mizan
        </h2>

        {/* social link icon */}
        <div className="flex space-x-4 mt-4">
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
