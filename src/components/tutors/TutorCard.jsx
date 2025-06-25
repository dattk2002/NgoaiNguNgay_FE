import React, { memo } from "react";
import {
  FaCheckCircle,
  FaHeart,
  FaStar,
  FaRegStar,
} from "react-icons/fa";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import StarIconRender from "../../utils/starIconRender";

const TutorCard = memo(({
  teacher,
  hoveredTutor,
  handleMouseEnter,
  handleMouseLeave,
  handleCardClick,
  hoverBoxTop,
  tutorCardRef,
  hoverBoxRef,
  handleHoverBoxEnter,
  handleHoverBoxLeave,
}) => {
  const isHovered = hoveredTutor && hoveredTutor.id === teacher.id;

  return (
    <div
      key={teacher.id}
      className="relative flex flex-col md:flex-row cursor-pointer"
      onMouseEnter={() => handleMouseEnter(teacher)}
      onMouseLeave={handleMouseLeave}
      onClick={() => handleCardClick(teacher.id)}
      ref={tutorCardRef}
    >
      {/* Tutor Card */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 w-full md:w-[70%] hover:shadow-md transition-shadow duration-200 z-10">
        {/* Left Part: Avatar & Rating */}
        <div className="flex flex-row md:flex-col items-center w-full md:w-20 flex-shrink-0">
          <img
            src={teacher.imageUrl}
            alt={teacher.name}
            className="w-16 h-16 rounded-full object-cover mb-2 border border-gray-200"
          />
          <StarIconRender rating={teacher.rating} className="w-4 h-4 text-yellow-500" />
          <span className="text-xs text-gray-500 mt-1">
            {teacher.rating} ({teacher.lessons} Buổi học)
          </span>
        </div>
        {/* Right Part: Details */}
        <div className="flex-1">
          {/* Name & Badges */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <h2 className="text-lg font-semibold text-gray-800">
              {teacher.name}
            </h2>
            {teacher.isProfessional === true && (
            <span className="flex items-center gap-1 text-xs font-medium bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
              <FaCheckCircle />
              {teacher.tag}
            </span>
            )}
            {/* Render profession teacher tag if isProfessional is true */}
            {/* {teacher.isProfessional === true && (
              <span className="flex items-center gap-1 text-xs font-medium bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                <FaCheckCircle />
                {teacher.tag}
              </span>
            )} */}
            {/* Render other badges/tags */}
            {teacher.badges?.map((badge) => (
              <span
                key={badge}
                className="flex items-center gap-1 text-xs font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full"
              >
                <FaCheckCircle />
                {badge}
              </span>
            ))}
          </div>
          {/* Speaks */}
          <div className="text-sm text-gray-600 mb-2">
            <span className="font-medium mr-2">NÓI:</span>
            <span className="text-gray-800 font-semibold">
              {teacher.nativeLanguage}
            </span>
            <span className="ml-1 inline-block bg-gray-200 text-gray-700 text-xs font-medium px-1.5 py-0.5 rounded">
              Bản xứ
            </span>
            {teacher.otherLanguagesCount > 0 && (
              <span className="text-gray-500 ml-2">
                +{teacher.otherLanguagesCount}
              </span>
            )}
          </div>
          {/* Description */}
          <p className="text-gray-700 text-sm mb-3 text-overflow">
            {teacher.description}
          </p>
          {/* Price, Availability & Actions */}
          <div className="flex items-center justify-between mt-2">
            <span className="text-gray-800 font-semibold">
              USD {parseFloat(teacher.price).toFixed(2)}
              <span className="text-gray-500 font-normal text-sm">/ buổi thử</span>
            </span>
            <span className="text-sm text-green-600">
              {teacher.availabilityText}
            </span>
            <div className="flex items-center gap-1">
              <IconButton
                size="small"
                aria-label="favorite"
                sx={{
                  color: "grey.500",
                  "&:hover": { color: "error.main" },
                }}
              >
                <FaHeart />
              </IconButton>
              <Button
                variant="contained"
                size="small"
                sx={{
                  backgroundColor: "#333333", // Dark grey/black
                  color: "#ffffff",
                  textTransform: "none",
                  fontSize: "0.8rem",
                  padding: "4px 12px",
                  borderRadius: "4px", // Less rounded than before
                  boxShadow: "none",
                  "&:hover": {
                    backgroundColor: "#000000", // Darker on hover
                    boxShadow: "none",
                  },
                }}
              >
                Đặt buổi thử
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* End Tutor Card */}

      {/* Hover Box (Render conditionally) */}
      {isHovered && (
        <div
          ref={hoverBoxRef}
          className="absolute left-0 md:left-[70%] ml-0 md:ml-4 w-full md:w-[400px] bg-white shadow-xl rounded-2xl border border-gray-200 z-20"
          style={{ top: hoverBoxTop }}
          onMouseEnter={handleHoverBoxEnter}
          onMouseLeave={handleHoverBoxLeave}
        >
          {/* Video Player */}
          <div className="relative aspect-video mb-4 rounded-t-lg overflow-hidden">
            <iframe
              src={hoveredTutor.videoUrl}
              title={`Video của ${hoveredTutor.name}`}
              width="100%"
              height="100%"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full"
            />
          </div>
          {/* Availability Grid */}
          <div className="grid grid-cols-7 gap-1 text-center p-4">
            {/* Day Headers */}
            {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((day) => (
              <div key={day} className="text-xs font-medium text-gray-500">
                {day}
              </div>
            ))}
            {/* Placeholder Cells for the 6 time slots per day */}
            {Array.from({ length: 42 }).map((_, index) => {
              const availabilityItem = hoveredTutor.availabilityGrid?.[index];
              const isAvailable = availabilityItem?.available ?? false;

              return (
                <div
                  key={index}
                  className={`h-6 w-full border rounded ${
                    isAvailable ? "bg-green-500" : "bg-gray-100"
                  }`}
                />
              );
            })}
          </div>
        </div>
      )}
      {/* End Hover Box */}
    </div>
  );
});

export default TutorCard;
