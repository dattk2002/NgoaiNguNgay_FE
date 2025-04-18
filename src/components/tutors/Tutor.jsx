import React from 'react';

const Tutor = ({ tutor }) => {
  if (!tutor) {
    return null; // Or return some placeholder/loading state
  }

  return (
    <div
      className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 text-center flex flex-col items-center mx-2" // Added mx-2 for spacing in carousel
    >
      {/* Placeholder image - replace src with tutor.imageUrl */}
      <img
        src={tutor.imageUrl}
        alt={tutor.name}
        className="w-24 h-24 rounded-full mb-4 object-cover"
      />
      <h3 className="text-xl font-semibold mb-1">{tutor.name}</h3>
      <p className="text-gray-600 text-sm mb-3">{tutor.languages}</p>
      <div className="flex items-center justify-center text-sm text-gray-600 mb-3">
        <svg
          className="w-4 h-4 text-yellow-400 mr-1" // Star icon
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
        </svg>
        <span>
          {tutor.rating.toFixed(1)} ({tutor.reviews} reviews)
        </span>
      </div>
      <p className="text-lg font-medium text-gray-800 mb-6">
        ${tutor.rate}/hour
      </p>
      <button className="w-full mt-auto bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 border border-gray-300 rounded-md transition duration-150 ease-in-out">
        View Profile
      </button>
    </div>
  );
};

export default Tutor;
