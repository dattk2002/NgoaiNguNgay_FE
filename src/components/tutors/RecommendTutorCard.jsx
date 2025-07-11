import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatLanguageCode } from "../../utils/formatLanguageCode";
import StarIconRender from "../../utils/starIconRender";

import { FaCheckCircle } from "react-icons/fa";

// Ambassador Icon SVG Component
const AmbassadorIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z" />
  </svg>
);

const RecommendTutorCard = ({ tutor, user, onRequireLogin }) => {
  const [isPriceHovered, setIsPriceHovered] = useState(false);
  const navigate = useNavigate();

  if (!tutor) {
    return null;
  }

  const rating = typeof tutor.rating === "number" ? tutor.rating : 0;
  const reviews = typeof tutor.reviews === "number" ? tutor.reviews : 0;
  const price = typeof tutor.price === "number" ? tutor.price : 0;
  const name = tutor.name || "Unnamed Tutor";
  const isProfessional = tutor.isProfessional;
  const tag = tutor.isProfessional ? "Professional Teacher" : "";

  const location = tutor.address ? `${tutor.address}` : "";
  const description = tutor.description || "Empty";

  const imageUrl = tutor.imageUrl || "https://picsum.photos/300/200?random=1";
  const subjects = formatLanguageCode(tutor.subjects) || "N/A";

  // New function for 'Contact Now' button click
  const handleContactClick = (event) => {
    event.stopPropagation();
    if (!user) {
      onRequireLogin(
        "Bạn cần đăng nhập để liên hệ với gia sư này.",
        () => {
          navigate(`/message/${tutor.tutorId}`);
        },
        () => {
          navigate(`/teacher/${tutor.tutorId}`);
        }
      );
    } else if (tutor.tutorId) {
      navigate(`/message/${tutor.tutorId}`);
    } else {
      console.error("Tutor ID is missing:", tutor);
    }
  };

  // Modified function for card boundary click
  const handleCardClick = () => {
    if (tutor.tutorId) {
      window.open(`/teacher/${tutor.tutorId}`, "_blank", "noopener,noreferrer");
    } else {
      console.error("Tutor ID is missing:", tutor);
    }
  };

  return (
    <div
      className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col overflow-hidden h-full cursor-pointer group"
      onClick={handleCardClick} // Assign handleCardClick to the main div
    >
      <div className="relative w-full" style={{ paddingTop: "66.66%" }}>
        <img
          src={imageUrl}
          alt={name}
          className="absolute top-0 left-0 w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://picsum.photos/300/200?random=1";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        <div className="absolute bottom-4 left-4 text-white">
          <h3 className="text-2xl font-bold drop-shadow-md">{name}</h3>
          <p className="text-sm drop-shadow-md">{location}</p>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-grow relative">
        <div className="flex items-center justify-between mb-2 text-sm">
          <div className="flex items-center text-gray-800 mr-1">
            <StarIconRender
              rating={rating}
              className="w-4 h-4 text-yellow-500 mr-1"
            />
            <span className="font-bold">{rating.toFixed(1)}</span>
            <span className="text-gray-600 ml-1">({reviews} đánh giá)</span>
          </div>
          {isProfessional && (
            <span className="flex items-center gap-1 text-xs font-medium bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
              <FaCheckCircle />
              {tag}
            </span>
          )}
        </div>
        <p className="text-gray-700 text-sm mb-2 truncate" title={subjects}>
          {subjects}
        </p>
        <p
          className="text-gray-900 font-semibold mb-2 text-base leading-tight truncate"
          title={description}
        >
          {description}
        </p>
        {/* Price line and button logic */}
        {!isPriceHovered ? (
          <div
            className="text-gray-700 text-sm mt-auto py-3"
            onMouseEnter={() => setIsPriceHovered(true)}
            onMouseLeave={() => setIsPriceHovered(false)}
            style={{ minHeight: 40 }}
          >
            <span className="font-bold text-base">{price.toFixed(2)} VND/h</span>
            <span className="text-red-500 ml-2">
              • Buổi học đầu tiên miễn phí
            </span>
          </div>
        ) : (
          <button
            className="mt-auto pt-2 w-full font-bold py-2 rounded-lg transition duration-150 ease-in-out text-center bg-[#333333] hover:bg-black text-white"
            onClick={handleContactClick}
            onMouseLeave={() => setIsPriceHovered(false)}
            style={{ minHeight: 40 }}
          >
            Liên hệ ngay
          </button>
        )}
      </div>
    </div>
  );
};

export default RecommendTutorCard;
