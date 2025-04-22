import React from 'react';
import { FaSearch, FaRegCalendarAlt, FaVideo } from 'react-icons/fa'; // Import icons

const HowItWork = () => {
  return (
    <div className="py-16 bg-white"> {/* Main container */}
      <div className="container mx-auto px-4">

        {/* "How It Works" Section */}
        <div className="text-center mb-12">
          <h2 className="text-black text-3xl font-semibold mb-10">How It Works</h2>
          <div className="flex flex-col md:flex-row justify-around items-start space-y-8 md:space-y-0 md:space-x-4">

            {/* Feature 1: Find Your Teacher */}
            <div className="flex flex-col items-center md:w-1/3 px-4">
              <div className="bg-gray-100 rounded-full p-4 inline-block mb-4">
                <FaSearch className="text-2xl text-gray-700" />
              </div>
              <h3 className="text-gray-900 text-xl font-medium mb-2">Find Your Teacher</h3>
              <p className="text-gray-600 text-center">
                Browse profiles, read reviews, and find the perfect teacher for your goals.
              </p>
            </div>

            {/* Feature 2: Schedule Lessons */}
            <div className="flex flex-col items-center md:w-1/3 px-4">
              <div className="bg-gray-100 rounded-full p-4 inline-block mb-4">
                <FaRegCalendarAlt className="text-2xl text-gray-700" />
              </div>
              <h3 className="text-gray-900 text-xl font-medium mb-2">Schedule Lessons</h3>
              <p className="text-gray-600 text-center">
                Book lessons at times that work for you using our flexible scheduling system.
              </p>
            </div>

            {/* Feature 3: Start Learning */}
            <div className="flex flex-col items-center md:w-1/3 px-4">
              <div className="bg-gray-100 rounded-full p-4 inline-block mb-4">
                <FaVideo className="text-2xl text-gray-700" />
              </div>
              <h3 className="text-gray-900 text-xl font-medium mb-2">Start Learning</h3>
              <p className="text-gray-600 text-center">
                Connect via video chat and start improving your language skills.
              </p>
            </div>
          </div>
        </div>

        {/* Separator (using margin/padding) */}
        <div className="mt-16"></div> {/* Adds space */}

        {/* "Ready to Start" Section */}
        <div className="text-center pt-12 border-t border-gray-200"> {/* Added top border */}
          <h2 className="text-black text-3xl font-semibold mb-4">Ready to Start Your Language Journey?</h2>
          <p className="text-gray-600 mb-8">
            Join thousands of students learning new languages every day
          </p>
          <button className="bg-black text-white font-semibold py-3 px-8 rounded-lg hover:bg-gray-800 transition duration-300">
            Get Started Now
          </button>
        </div>

      </div>
    </div>
  );
};

export default HowItWork;
