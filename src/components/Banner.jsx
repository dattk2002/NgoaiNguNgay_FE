import React from "react";
import { FiUserPlus, FiSearch, FiChevronLeft, FiChevronRight, FiBookOpen, FiMusic, FiGlobe, FiActivity, FiAward, FiBriefcase, FiHeart, FiCpu } from "react-icons/fi"; // Assuming you have react-icons installed

const Banner = () => {
  // Sample categories - replace with your actual data and icons
  const categories = [
    { name: "Dance", icon: <FiActivity /> },
    { name: "Violin", icon: <FiMusic /> },
    { name: "Chemistry", icon: <FiMusic /> },
    { name: "French", icon: <FiGlobe /> },
    { name: "Swimming", icon: <FiAward /> /* Placeholder */ },
    { name: "Chess", icon: <FiCpu /> /* Placeholder */ },
    { name: "ESL", icon: <FiGlobe /> },
    { name: "Nursing", icon: <FiHeart /> },
    { name: "Soccer", icon: <FiAward /> /* Placeholder */ },
    // Add more categories as needed
  ];

  return (
    <div className="w-full min-h-screen py-16 px-4 flex flex-col justify-center items-center">
      {/* Top Section */}
      <div className="max-w-[1240px] mx-auto">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
          Learn Any Language with Expert Teachers
        </h1>
        <p className="text-gray-600 mb-8 text-lg md:text-xl">
          Connect with native speakers and certified teachers for personalized
          1-on-1 lessons in over 150 languages.
        </p>
        <div className="flex justify-center space-x-4 mb-12">
          <button className=" text-white py-3 px-6 rounded-md flex items-center space-x-2 font-semibold hover:bg-gray-800 transition duration-300">
            <FiUserPlus /> {/* Placeholder for icon */}
            <span>Become a Tutor</span>
          </button>
          <button className=" text-white border border-black py-3 px-6 rounded-md flex items-center space-x-2 font-semibold hover:bg-gray-100 transition duration-300">
            {/* Placeholder for icon */}
            <span>Start Learning</span>
          </button>
        </div>

        {/* Video Preview Placeholder */}
        <div className="bg-gray-200 h-40 md:h-56 rounded-lg flex items-center justify-center text-gray-500 mb-16">
          Video Chat Interface Preview
        </div>
      </div>

      {/* Search Bar Section */}
      <div className="w-full max-w-2xl bg-white p-3 rounded-full shadow-lg flex items-center mb-8 transition-all duration-300 focus-within:shadow-xl">
        <div className="flex items-center text-rose-500 pl-3 pr-3">
           <FiBookOpen size={24} /> {/* Slightly larger icon */}
        </div>
        <input
          type="text"
          placeholder='Try "English"'
          className="flex-grow py-3 px-2 focus:outline-none text-xl text-gray-700 placeholder-gray-400" // Larger text, better placeholder color
        />
        <button className="bg-rose-500 text-white py-3 px-10 rounded-full font-semibold hover:bg-rose-600 transition duration-300 text-lg shadow-sm hover:shadow-md">
          Search
        </button>
      </div>

      {/* Category Selector Section */}
      <div className="w-full max-w-3xl bg-white/80 backdrop-blur-sm p-3 rounded-full shadow-lg flex items-center space-x-3">
        <button className="bg-white p-3 rounded-full shadow-md hover:bg-gray-50 transition duration-300 text-gray-600 hover:text-gray-800">
          <FiChevronLeft size={22} />
        </button>
        <div className="flex-grow overflow-hidden">
          <div className="flex space-x-10 justify-start items-center overflow-x-auto whitespace-nowrap scrollbar-hide py-2 px-2">
            {categories.map((category, index) => (
              <div key={index} className="flex flex-col items-center cursor-pointer group text-center w-16"> {/* Fixed width for alignment */}
                 <div className="text-3xl mb-1.5 text-gray-600 group-hover:text-rose-500 transition duration-300 transform group-hover:scale-110">
                   {category.icon}
                 </div>
                 <span className="text-xs font-semibold text-gray-600 group-hover:text-rose-500 transition duration-300 truncate w-full">
                   {category.name}
                 </span>
              </div>
            ))}
          </div>
        </div>
        <button className="bg-white p-3 rounded-full shadow-md hover:bg-gray-50 transition duration-300 text-gray-600 hover:text-gray-800">
          <FiChevronRight size={22} />
        </button>
      </div>
    </div>
  );
};

export default Banner;

// Helper class for hiding scrollbar (add this to your global CSS or index.css if needed)
/*
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
*/
