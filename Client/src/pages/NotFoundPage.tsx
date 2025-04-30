import { motion } from "framer-motion";
import { Home } from "lucide-react";
import { Link } from "react-router-dom";

// Modern Custom Button Component
const CustomButton = ({ to, children }) => (
  <Link to={to}>
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="h-12 px-6 rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold shadow-lg flex items-center gap-2 transition-all"
    >
      {children}
    </motion.button>
  </Link>
);

const NotFoundPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.3, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-pink-100 p-6 text-center">
      <motion.div
        className="max-w-md w-full flex flex-col items-center"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Modern SVG Illustration */}
        <motion.svg
          variants={itemVariants}
          width="180"
          height="180"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="mb-8 drop-shadow-md"
        >
          <circle cx="100" cy="100" r="80" fill="#f97316" opacity="0.2" />
          <path
            d="M60 100c0-22 18-40 40-40s40 18 40 40h20v10H40v-10h20z"
            fill="#f97316"
            stroke="#ea580c"
            strokeWidth="4"
          />
          <motion.circle
            cx="85"
            cy="110"
            r="5"
            fill="#4B5563"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          />
          <motion.circle
            cx="115"
            cy="110"
            r="5"
            fill="#4B5563"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          />
          <motion.path
            d="M85 120q15 10 30 0"
            stroke="#4B5563"
            strokeWidth="4"
            strokeLinecap="round"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          />
        </motion.svg>

        {/* Heading */}
        <motion.h1
          variants={itemVariants}
          className="text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500 mb-4"
        >
          404
        </motion.h1>

        {/* Subheading */}
        <motion.h2
          variants={itemVariants}
          className="text-xl text-gray-700 font-medium mb-2"
        >
          Page Not Found
        </motion.h2>

        {/* Description */}
        <motion.p
          variants={itemVariants}
          className="text-gray-600 text-sm mb-8"
        >
          Sorry, the page you are looking for doesn't exist or has been moved.
        </motion.p>

        {/* Back to Home Button */}
        <motion.div variants={itemVariants}>
          <CustomButton to="/">
            <Home className="w-5 h-5" />
            Home
          </CustomButton>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
