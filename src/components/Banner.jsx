import React, { useState, useEffect, useRef } from "react";
import { FiUserPlus, FiSearch, FiChevronLeft, FiChevronRight } from "react-icons/fi"; // Assuming you have react-icons installed
import { FaBook } from "react-icons/fa6";
import { motion, AnimatePresence } from "framer-motion"; // Import framer-motion components

// Import flag SVGs
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

const Banner = () => {
  // Sample categories - replace with your actual data and icons
  const categories = [
    { name: "Vietnamese", icon: <img src={vietnamFlag} alt="Vietnamese flag" className="w-8 h-8" /> },
    { name: "Chinese", icon: <img src={chinaFlag} alt="Chinese flag" className="w-8 h-8" /> }, // Use the correct flag import
    { name: "French", icon: <img src={franceFlag} alt="French flag" className="w-8 h-8" /> },
    { name: "German", icon: <img src={germanyFlag} alt="German flag" className="w-8 h-8" /> },
    { name: "English", icon: <img src={englandFlag} alt="English flag" className="w-8 h-8" /> },
    { name: "Italian", icon: <img src={italyFlag} alt="Italian flag" className="w-8 h-8" /> },
    { name: "Japanese", icon: <img src={japanFlag} alt="Japanese flag" className="w-8 h-8" /> },
    { name: "Spanish", icon: <img src={spainFlag} alt="Spanish flag" className="w-8 h-8" /> },
    { name: "Korean", icon: <img src={koreaFlag} alt="Korean flag" className="w-8 h-8" /> },
    { name: "Russian", icon: <img src={russiaFlag} alt="Russian flag" className="w-8 h-8" /> },
    { name: "Portuguese", icon: <img src={portugalFlag} alt="Portuguese flag" className="w-8 h-8" /> },
    { name: "Brazilian", icon: <img src={brazilFlag} alt="Arabic flag" className="w-8 h-8" /> },
    // Add more categories as needed
  ];

  // State for the animated placeholder
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  // State to track input focus
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Ref for the scrollable category container
  const categoryContainerRef = useRef(null);

  // Effect to cycle through languages for the placeholder
  useEffect(() => {
    const intervalId = setInterval(() => {
      setPlaceholderIndex((prevIndex) => (prevIndex + 1) % categories.length);
    }, 3000); // Change language every 3 seconds

    // Cleanup function to clear the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, [categories.length]); // Re-run effect if the number of categories changes

  // Framer Motion Variants for the placeholder animation
  const placeholderVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.5 } },
  };

  // Scroll functions
  // Scroll Amount: 2 * (item width (w-16=64px) + spacing (space-x-10=40px)) = 2 * 104 = 208px
  const scrollAmount = 208; 

  const scrollLeft = () => {
    if (categoryContainerRef.current) {
      const element = categoryContainerRef.current;
      // If scrolled all the way to the left, loop to the end
      if (element.scrollLeft <= 0) {
        element.scrollTo({
          left: element.scrollWidth - element.clientWidth,
          behavior: 'smooth'
        });
      } else {
        // Otherwise, scroll left normally
        element.scrollBy({
          left: -scrollAmount,
          behavior: 'smooth'
        });
      }
    }
  };

  const scrollRight = () => {
    if (categoryContainerRef.current) {
      const element = categoryContainerRef.current;
      const maxScrollLeft = element.scrollWidth - element.clientWidth;
      // If scrolled close to the end, loop to the beginning
      // Use a small tolerance (e.g., 1) for floating point comparison
      if (element.scrollLeft >= maxScrollLeft - 1) {
         element.scrollTo({
           left: 0,
           behavior: 'smooth'
         });
      } else {
        // Otherwise, scroll right normally
        element.scrollBy({
          left: scrollAmount,
          behavior: 'smooth'
        });
      }
    }
  };

  return (
    <div className="w-full min-h-screen py-16 px-4 flex flex-col justify-center items-center">
      {/* Top Section */}
      <div className="max-w-[1240px] mx-auto">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-center">
          Learn Any Language with Expert Teachers
        </h1>
        <p className="text-gray-600 mb-8 text-lg md:text-xl text-center">
          Connect with native speakers and certified teachers for personalized
          1-on-1 lessons in over 150 languages.
        </p>
        <div className="flex justify-center space-x-4 mb-12">
          <button className="bg-[#333333] text-white py-3 px-6 rounded-md flex items-center space-x-2 font-semibold hover:bg-black transition duration-300">
            <FiUserPlus /> {/* Placeholder for icon */}
            <span>Become a Tutor</span>
          </button>
          <button className=" text-black border border-black py-3 px-6 rounded-md flex items-center space-x-2 font-semibold hover:bg-gray-100 transition duration-300">
            {/* Placeholder for icon */}
            <span>Start Learning</span>
          </button>
        </div>

        {/* Video Preview Placeholder */}
        <div className="bg-gray-200 h-40 md:h-56 rounded-lg flex items-center justify-center text-gray-500 mb-16">
          Video Chat Interface Preview
        </div>
      </div>

      {/* Search Bar Section - Modified for Animation */}
      <div className="w-full max-w-2xl bg-white p-3 rounded-full shadow-lg flex items-center mb-8 transition-all duration-300 focus-within:shadow-xl">
        <div className="flex items-center text-black pl-3 pr-3">
           <FaBook size={24} /> {/* Slightly larger icon */}
        </div>
        {/* Input Container */}
        <div className="relative flex-grow h-full flex items-center"> {/* Added relative positioning and height */}
          <input
            type="text"
            className="w-full h-full py-3 px-2 focus:outline-none text-xl text-gray-700 bg-transparent z-10 relative" // Added bg-transparent, z-index, full width/height
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
          />
          {/* Animated Placeholder Container - Conditionally render based on focus */}
          {!isInputFocused && (
            <div className="absolute inset-0 flex items-center px-2 pointer-events-none"> {/* Absolute position, centered, ignore pointer events */}
              <AnimatePresence mode="wait"> {/* Use wait mode for smoother transition */}
                <motion.span
                  key={placeholderIndex} // Key change triggers animation
                  variants={placeholderVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="text-xl text-gray-400" // Placeholder styling
                >
                  Try "{categories[placeholderIndex]?.name || 'a language'}"
                </motion.span>
              </AnimatePresence>
            </div>
          )}
        </div>
        <div className="bg-[#333333] hover:bg-black text-white p-4 rounded-full font-semibold transition duration-300 shadow-sm hover:shadow-md flex items-center justify-center ml-2"> {/* Added margin-left */}
          <FiSearch size={20}/> {/* Icon instead of text */}
        </div>
      </div>

      {/* Category Selector Section */}
      <div className="w-full max-w-xl bg-white/80 backdrop-blur-sm p-3 rounded-full shadow-lg flex items-center justify-center space-x-3"> {/* Added justify-center */}
        {/* Adjusted Chevron Button - Left */}
        <div
          onClick={scrollLeft} // Add onClick handler
          className="bg-white flex-shrink-0 p-2.5 rounded-full shadow-md hover:bg-gray-50 transition duration-300 text-gray-600 hover:text-gray-800 focus:outline-none" // Added flex-shrink-0
        >
          <FiChevronLeft size={22} />
        </div>
        {/* Apply fixed width here to show exactly 5 items */}
        <div className="flex-grow-0 w-[480px] overflow-hidden"> {/* Changed flex-grow to flex-grow-0 and added fixed width w-[480px] */}
          {/* Attach the ref to the scrollable container */}
          <div
            ref={categoryContainerRef}
            className="flex space-x-10 justify-start items-center overflow-x-auto whitespace-nowrap scrollbar-hide py-2 px-2"
          >
            {categories.map((category, index) => (
              <div key={index} className="flex flex-col items-center cursor-pointer group text-center w-16"> {/* Fixed width for alignment */}
                 <div className="mb-1.5 text-gray-600 group-hover:text-rose-500 transition duration-300 transform group-hover:scale-110 flex justify-center items-center h-8"> {/* Centering container */}
                   {category.icon}
                 </div>
                 <span className="text-xs font-semibold text-gray-600 group-hover:text-rose-500 transition duration-300 truncate w-full">
                   {category.name}
                 </span>
              </div>
            ))}
          </div>
        </div>
        {/* Adjusted Chevron Button - Right */}
        <div
          onClick={scrollRight} // Add onClick handler
          className="bg-white flex-shrink-0 p-2.5 rounded-full shadow-md hover:bg-gray-50 transition duration-300 text-gray-600 hover:text-gray-800 focus:outline-none" // Added flex-shrink-0
        >
          <FiChevronRight size={22} />
        </div>
      </div>
    </div>
  );
};

export default Banner;

