import { FiGithub, FiLinkedin, FiMail } from 'react-icons/fi';
import tanvirImg from '../../assets/tanvir.png';
import { useTheme } from '../../hooks/useTheme';

const ProfileCard = () => {
  const { isDark } = useTheme();

  // Same-theme colors, a distinct shade from the section background
  const cardColors = {
    cardBg: isDark ? '#262222' : '#f3f4f6',
    textColor: isDark ? '#ffffff' : '#111827',
    cardBorder: isDark ? '#353334' : '#e5e7eb',
    iconHoverBg: isDark ? '#353334' : '#e5e7eb',
  };

  return (
    <>
      <div
        className="flex flex-col items-center justify-center p-3 sm:p-6 mx-2 sm:mx-4 lg:mx-12 rounded-lg shadow-md transition-all duration-300"
        style={{
          backgroundColor: cardColors.cardBg,
          borderColor: cardColors.cardBorder,
          borderWidth: '1px',
          borderStyle: 'solid',
        }}
      >
        {/* image */}
        <div className="flex items-center justify-center mb-3 sm:mb-4 w-full">
          <div className="relative w-40 h-48 sm:w-40 sm:h-48 lg:w-48 lg:h-56">
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
                    <div
                      className={
                        index % 2 === 0
                          ? 'marquee-content'
                          : 'marquee-content-reverse'
                      }
                    ></div>
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
          className="text-lg sm:text-xl lg:text-2xl font-semibold mb-1 sm:mb-2 text-center transition-colors duration-300"
          style={{ color: cardColors.textColor }}
        >
          Tanvir Ibn Mizan
        </h2>

        {/* social link icon */}
        <div className="flex space-x-3 sm:space-x-4 mt-1 sm:mt-4">
          <a
            href="https://github.com/7anv1r"
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg p-2 rounded-lg transition-all duration-300"
            style={{
              color: cardColors.textColor,
              backgroundColor: 'transparent',
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = cardColors.iconHoverBg;
              e.target.style.color = cardColors.textColor;
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = cardColors.textColor;
            }}
          >
            <FiGithub />
          </a>
          <a
            href="https://linkedin.com/in/7anv1r"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xl p-2 rounded-lg transition-all duration-300"
            style={{
              color: cardColors.textColor,
              backgroundColor: 'transparent',
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = cardColors.iconHoverBg;
              e.target.style.color = cardColors.textColor;
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = cardColors.textColor;
            }}
          >
            <FiLinkedin />
          </a>
          <a
            href="mailto:tanvir.inquiries@gmail.com"
            className="text-xl p-2 rounded-lg transition-all duration-300"
            style={{
              color: cardColors.textColor,
              backgroundColor: 'transparent',
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = cardColors.iconHoverBg;
              e.target.style.color = cardColors.textColor;
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = cardColors.textColor;
            }}
          >
            <FiMail />
          </a>
        </div>
      </div>
    </>
  );
};

export default ProfileCard;
