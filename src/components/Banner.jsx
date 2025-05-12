import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for redirection
import { FiSearch, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { FaBook } from "react-icons/fa6";
import { motion, AnimatePresence } from "framer-motion";

// Import flag SVGs (using placeholder URLs since actual assets are not available)
import vietnamFlag from '../assets/vietnam.svg';
import franceFlag from '../assets/france.svg';
import germanyFlag from '../assets/germany.svg';
import englandFlag from '../assets/england.svg';
import italyFlag from '../assets/italy.svg';
import japanFlag from '../assets/japan.svg';
import spainFlag from '../assets/spain.svg';
import chinaFlag from '../assets/china.svg';
import brazilFlag from '../assets/brazil.svg';
import russiaFlag from '../assets/russia.svg';
import portugalFlag from '../assets/portugal.svg';
import koreaFlag from '../assets/korea.svg';

// Import the banner image (using placeholder since actual asset is not available)
import bannerImage from '../assets/banner.webp';

const Banner = () => {
  const navigate = useNavigate(); // Hook for navigation

  const categories = [
    { name: "Vietnamese", icon: <img src={vietnamFlag} alt="Vietnamese flag" className="w-8 h-8" /> },
    { name: "Chinese", icon: <img src={chinaFlag} alt="Chinese flag" className="w-8 h-8" /> },
    { name: "French", icon: <img src={franceFlag} alt="French flag" className="w-8 h-8" /> },
    { name: "German", icon: <img src={germanyFlag} alt="German flag" className="w-8 h-8" /> },
    { name: "English", icon: <img src={englandFlag} alt="English flag" className="w-8 h-8" /> },
    { name: "Italian", icon: <img src={italyFlag} alt="Italian flag" className="w-8 h-8" /> },
    { name: "Japanese", icon: <img src={japanFlag} alt="Japanese flag" className="w-8 h-8" /> },
    { name: "Spanish", icon: <img src={spainFlag} alt="Spanish flag" className="w-8 h-8" /> },
    { name: "Korean", icon: <img src={koreaFlag} alt="Korean flag" className="w-8 h-8" /> },
    { name: "Russian", icon: <img src={russiaFlag} alt="Russian flag" className="w-8 h-8" /> },
    { name: "Portuguese", icon: <img src={portugalFlag} alt="Portuguese flag" className="w-8 h-8" /> },
    { name: "Brazilian", icon: <img src={brazilFlag} alt="Brazilian flag" className="w-8 h-8" /> },
  ];

  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const categoryContainerRef = useRef(null);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setPlaceholderIndex((prevIndex) => (prevIndex + 1) % categories.length);
    }, 3000);
    return () => clearInterval(intervalId);
  }, [categories.length]);

  const placeholderVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.5 } },
  };

  const scrollAmount = 2 * 104; // 208px for 2 items (assuming each item is 104px wide, including spacing)

  const scrollLeft = () => {
    if (categoryContainerRef.current) {
      const element = categoryContainerRef.current;
      const currentScroll = element.scrollLeft;
      let newScroll = currentScroll - scrollAmount;

      if (newScroll < 0) {
        newScroll = element.scrollWidth - element.clientWidth;
      }

      element.scrollTo({
        left: newScroll,
        behavior: 'smooth',
      });
    }
  };

  const scrollRight = () => {
    if (categoryContainerRef.current) {
      const element = categoryContainerRef.current;
      const currentScroll = element.scrollLeft;
      const maxScrollLeft = element.scrollWidth - element.clientWidth;
      let newScroll = currentScroll + scrollAmount;

      if (newScroll > maxScrollLeft) {
        newScroll = 0;
      }

      element.scrollTo({
        left: newScroll,
        behavior: 'smooth',
      });
    }
  };

  // Handle category click to navigate to the teacher list page
  const handleCategoryClick = (categoryName) => {
    // Normalize the category name for the URL (e.g., "Brazilian" might map to "Portuguese")
    const subject = categoryName.toLowerCase() === "brazilian" ? "portuguese" : categoryName.toLowerCase();
    window.open(`/tutor/${subject}`, '_blank');
  };

  return (
    <div className="w-full py-16 px-4 flex flex-col justify-center items-center">
      <div className="max-w-[1240px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-16 w-full">
        <div className="text-left">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-800 mb-6 leading-tight">
            Become fluent in any language
          </h1>
          <ul className="space-y-3 mb-8">
            <li className="flex items-center text-lg text-gray-700">
              <span className="w-3 h-3 bg-black rounded-full mr-3 flex-shrink-0"></span>
              Take customizable 1-on-1 lessons trusted by millions of users
            </li>
            <li className="flex items-center text-lg text-gray-700">
              <span className="w-3 h-3 bg-black rounded-full mr-3 flex-shrink-0"></span>
              Learn from certified teachers that fit your budget and schedule
            </li>
            <li className="flex items-center text-lg text-gray-700">
              <span className="w-3 h-3 bg-black rounded-full mr-3 flex-shrink-0"></span>
              Connect with a global community of language learners
            </li>
          </ul>
          <button className="bg-[#333333] hover:bg-black text-white font-semibold py-3 px-8 rounded-lg transition duration-300 text-lg">
            Start now
          </button>
        </div>
        <div className="w-full">
          <img
            src={bannerImage}
            alt="Language learning banner"
            className="w-full h-auto object-contain"
          />
        </div>
      </div>
      <div className="w-full max-w-2xl bg-white p-3 rounded-full shadow-lg flex items-center mb-8 transition-all duration-300 focus-within:shadow-xl">
        <div className="flex items-center text-black pl-3 pr-3">
          <FaBook size={24} />
        </div>
        <div className="relative flex-grow h-full flex items-center">
          <input
            type="text"
            className="w-full h-full py-3 px-2 focus:outline-none text-xl text-gray-700 bg-transparent z-10 relative"
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
          />
          {!isInputFocused && (
            <div className="absolute inset-0 flex items-center px-2 pointer-events-none">
              <AnimatePresence mode="wait">
                <motion.span
                  key={placeholderIndex}
                  variants={placeholderVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="text-xl text-gray-400"
                >
                  Try "{categories[placeholderIndex]?.name || 'a language'}"
                </motion.span>
              </AnimatePresence>
            </div>
          )}
        </div>
        <div className="bg-[#333333] hover:bg-black text-white p-4 rounded-full font-semibold transition duration-300 shadow-sm hover:shadow-md flex items-center justify-center ml-2">
          <FiSearch size={20} />
        </div>
      </div>
      <div className="w-full max-w-xl bg-white/80 backdrop-blur-sm p-3 rounded-full shadow-lg flex items-center justify-center space-x-3">
        <div
          onClick={scrollLeft}
          className="bg-white flex-shrink-0 p-2.5 rounded-full shadow-md hover:bg-gray-50 transition duration-300 text-gray-600 hover:text-gray-800 focus:outline-none"
        >
          <FiChevronLeft size={22} />
        </div>
        <div className="flex-grow-0 w-[480px] overflow-hidden">
          <div
            ref={categoryContainerRef}
            className="flex space-x-10 justify-start items-center overflow-x-auto whitespace-nowrap scrollbar-hide py-2 px-2 gap-2 snap-x snap-mandatory"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {categories.map((category, index) => (
              <div
                key={index}
                onClick={() => handleCategoryClick(category.name)} // Add click handler
                className="flex flex-col items-center cursor-pointer group text-center w-16 snap-start"
              >
                <div className="mb-1.5 text-gray-600 group-hover:text-black transition duration-300 transform group-hover:scale-110 flex justify-center items-center h-8">
                  {category.icon}
                </div>
                <span className="text-xs font-semibold text-gray-400 group-hover:text-black transition duration-300 truncate w-full">
                  {category.name}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div
          onClick={scrollRight}
          className="bg-white flex-shrink-0 p-2.5 rounded-full shadow-md hover:bg-gray-50 transition duration-300 text-gray-600 hover:text-gray-800 focus:outline-none"
        >
          <FiChevronRight size={22} />
        </div>
      </div>
    </div>
  );
};

export default Banner;