import React from 'react';

// Heart Icon SVG Component (can be moved to a separate file)
const HeartIcon = ({ className = "w-6 h-6", fill = "white", stroke = "black", strokeWidth = 0 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill={fill}
    stroke={stroke}
    strokeWidth={strokeWidth}
    className={className}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
  </svg>
);

// Star Icon SVG Component (can be moved to a separate file)
const StarIcon = ({ className = "w-5 h-5" }) => (
  <svg
    className={className}
    fill="currentColor"
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
  </svg>
);

// Ambassador Icon SVG Component (can be moved to a separate file)
const AmbassadorIcon = ({ className = "w-4 h-4" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z"/></svg>
);

const Tutor = ({ tutor }) => {
  if (!tutor) {
    return null;
  }

  // Default values and formatting
  const rating = typeof tutor.rating === 'number' ? tutor.rating : 0;
  const reviews = typeof tutor.reviews === 'number' ? tutor.reviews : 0;
  const rate = typeof tutor.rate === 'number' ? tutor.rate : 0;
  const name = tutor.name || 'Unnamed Tutor';
  // Use address if available, otherwise default to "(webcam)" for the location display
  const location = tutor.address ? `${tutor.address} (webcam)` : '(webcam)';
  const description = tutor.description || 'Experienced tutor providing personalized lessons.'; // Default description
  const imageUrl = tutor.imageUrl || 'https://via.placeholder.com/300x200?text=Tutor'; // Placeholder

  return (
    // Main card container - remove padding, add overflow hidden
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col mx-2 overflow-hidden h-full">

      {/* Image container - relative positioning */}
      <div className="relative w-full" style={{ paddingTop: '66.66%' }}> {/* Aspect ratio 3:2 */}
        <img
          src={imageUrl}
          alt={name}
          className="absolute top-0 left-0 w-full h-full object-cover" // Position image absolutely
          onError={(e) => { e.target.onerror = null; e.target.src='https://via.placeholder.com/300x200?text=Image+Error'; }}
        />
        {/* Image Overlay Gradient (optional, makes text more readable) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

        {/* Heart Icon - positioned top-right */}
        <button className="absolute top-3 right-3 p-1 rounded-full bg-black/30 hover:bg-black/50 transition-colors duration-150">
            <HeartIcon className="w-5 h-5" fill="white" />
        </button>

        {/* Text on Image - positioned bottom-left */}
        <div className="absolute bottom-4 left-4 text-white">
          <h3 className="text-2xl font-bold drop-shadow-md">{name}</h3>
          <p className="text-sm drop-shadow-md">{location}</p> {/* Display location */}
        </div>
      </div>

      {/* Content below image - add padding back */}
      <div className="p-4 flex flex-col flex-grow"> {/* flex-grow ensures this part takes remaining space */}

        {/* Rating and Badge Row */}
        <div className="flex items-center justify-between mb-2 text-sm">
          {/* Rating */}
          <div className="flex items-center text-gray-800">
            <StarIcon className="w-5 h-5 text-yellow-400 mr-1" />
            <span className="font-bold">{rating.toFixed(1)}</span>
            <span className="text-gray-600 ml-1">({reviews} reviews)</span>
          </div>
          {/* Ambassador Badge (Static for now) */}
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
             <AmbassadorIcon className="w-3 h-3 mr-1" /> {/* Ambassador icon */}
             Ambassador
          </span>
        </div>

        {/* Description (mapped from description) */}
        <p className="text-gray-900 font-semibold mb-2 text-base leading-tight truncate" title={description}>
          {description}
        </p>

        {/* Price and Offer */}
        <div className="text-gray-700 text-sm mt-auto pt-2"> {/* mt-auto pushes this to the bottom */}
          <span className="font-bold text-base">${rate.toFixed(2)}/h</span>
          <span className="text-red-500 ml-2">• 1st lesson free</span>
        </div>
      </div>
    </div>
  );
};

export default Tutor;
