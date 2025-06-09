import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion'; // Import motion
import notFoundImg from "../assets/not_found.gif"; // Assuming you want to use the GIF

// Create a motion-enabled Link component
const MotionLink = motion(Link);

const NotFoundPage = () => {
  return (
    <div className="container mx-auto my-auto flex flex-col md:flex-row bg-gray-100 text-gray-800 px-4 sm:px-8 py-8 md:py-16"> {/* Added some padding and flex direction */}
      {/* Left Section: Illustration */}
      <div className="hidden md:flex flex-1 items-center justify-center relative">
        <div className="w-full max-w-2xl bg-gray-100 flex items-center justify-center">
          <img src={notFoundImg} alt='Hình minh họa không tìm thấy' className="max-h-96 md:max-h-full" /> {/* Translated */}
        </div>
      </div>

      {/* Right Section: Content */}
      <div className="flex flex-1 flex-col items-center md:items-start justify-center text-center md:text-left">
        <motion.h1 // Animate the 404 text on initial load (optional)
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-8xl sm:text-9xl font-bold text-gray-800 mb-4"
        >
          404
        </motion.h1>
        <motion.p // Animate the paragraph on initial load (optional)
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xl sm:text-2xl text-gray-600 mb-8"
        >
          Rất tiếc! Trang bạn yêu cầu không tìm thấy. {/* Translated */}
        </motion.p>

        <motion.p // Animate the prompt text on initial load (optional)
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ duration: 0.5, delay: 0.4 }}
          className="text-lg font-semibold text-gray-700 mb-4"
        >
          Thay vào đó hãy xem các liên kết dưới đây: {/* Translated */}
        </motion.p>
        <nav className="mb-8"> {/* Added bottom margin to nav */}
          <ul className="space-y-2">
            <li>
              {/* Replace with actual routes */}
              <MotionLink
                to="/dashboard"
                className="text-[#333333] hover:underline text-lg"
                whileHover={{ scale: 1.05, color: '#000' }} // Scale up slightly and change color on hover
                transition={{ duration: 0.2 }}
              >
                Xem bảng điều khiển {/* Translated */}
              </MotionLink>
            </li>
            <li>
              {/* Replace with actual routes */}
              <MotionLink
                to="/languages"
                className="text-[#333333] hover:underline text-lg"
                whileHover={{ scale: 1.05, color: '#000' }} // Scale up slightly and change color on hover
                transition={{ duration: 0.2 }}
              >
                Tìm giáo viên {/* Translated */}
              </MotionLink>
            </li>
            <li>
              {/* Replace with actual routes */}
              <MotionLink
                to="/become-tutor"
                className="text-[#333333] hover:underline text-lg"
                whileHover={{ scale: 1.05, color: '#000' }} // Scale up slightly and change color on hover
                transition={{ duration: 0.2 }}
              >
                Trở thành giáo viên {/* Translated */}
              </MotionLink>
            </li>
            <li>
              {/* Replace with actual routes (e.g., a download page or external link) */}
              <MotionLink
                to="/download-app"
                className="text-[#333333] hover:underline text-lg"
                whileHover={{ scale: 1.05, color: '#000' }} // Scale up slightly and change color on hover
                transition={{ duration: 0.2 }}
              >
                Tải ứng dụng của chúng tôi {/* Translated */}
              </MotionLink>
            </li>
          </ul>
        </nav>

        {/* Button to Homepage */}
        <MotionLink // Use MotionLink for the button as well
          to="/" // Target the homepage route
          className="inline-block bg-[#333333] text-white font-bold py-3 px-6 rounded-lg shadow transition duration-300"
          whileHover={{ scale: 1.1, backgroundColor: '#000' }} // Scale up and change background color on hover
          transition={{ duration: 0.2 }}
        >
          Đi tới Trang chủ {/* Translated */}
        </MotionLink>

      </div>
    </div>
  );
};

export default NotFoundPage;