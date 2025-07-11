import React, { memo, useState, useEffect } from "react";
import {
  FaCheckCircle,
  FaHeart,
  FaStar,
  FaRegStar,
} from "react-icons/fa";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import StarIconRender from "../../utils/starIconRender";
import { fetchTutorWeekSchedule } from "../api/auth"; // adjust path as needed

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

  // Add state for weekly schedule and week start
  const [weeklySchedule, setWeeklySchedule] = useState([]);
  const [weekStartDate, setWeekStartDate] = useState(null);

  // Helper to get current week's Monday
  function getCurrentWeekMondayString() {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 (Sun) - 6 (Sat)
    const diffToMonday = (dayOfWeek + 6) % 7;
    const monday = new Date(today);
    monday.setDate(today.getDate() - diffToMonday);
    const yyyy = monday.getFullYear();
    const mm = String(monday.getMonth() + 1).padStart(2, "0");
    const dd = String(monday.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} 00:00:00`;
  }

  // Helper to get date for each day
  function getDatesOfWeek(startDate) {
    if (!startDate) return [];
    const base = new Date(startDate);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      return d;
    });
  }
  const weekDates = getDatesOfWeek(weekStartDate);

  // Helper to check if a slot is available
  function isTimeSlotAvailable(timeRange, dayIndex) {
    if (!weeklySchedule || weeklySchedule.length === 0 || !weekDates[dayIndex])
      return false;

    const targetDate = weekDates[dayIndex];
    const dayData = weeklySchedule.find((day) => {
      const dayDate = new Date(day.date);
      return (
        dayDate.getFullYear() === targetDate.getFullYear() &&
        dayDate.getMonth() === targetDate.getMonth() &&
        dayDate.getDate() === targetDate.getDate()
      );
    });

    if (!dayData || !dayData.timeSlotIndex || dayData.timeSlotIndex.length === 0) {
      return false;
    }

    // Convert time range to slot indices (same as TutorDetail)
    const [startTime] = timeRange.split(" - ");
    const [hours] = startTime.split(":");
    const startHour = parseInt(hours, 10);
    const slots = [];
    for (let hour = startHour; hour < startHour + 4; hour++) {
      slots.push(hour * 2, hour * 2 + 1);
    }
    return slots.some((slot) => dayData.timeSlotIndex.includes(slot));
  }

  // Define the new time blocks
  const timeBlocks = [
    { label: "Sáng", slots: Array.from({ length: 24 }, (_, i) => i) },      // 00:00 - 12:00
    { label: "Chiều", slots: Array.from({ length: 12 }, (_, i) => i + 24) }, // 12:00 - 18:00
    { label: "Tối", slots: Array.from({ length: 12 }, (_, i) => i + 36) },   // 18:00 - 24:00
  ];

  // Helper to check if a block is available
  function isTimeBlockAvailable(blockSlots, dayIndex) {
    if (!weeklySchedule || weeklySchedule.length === 0 || !weekDates[dayIndex])
      return false;

    const targetDate = weekDates[dayIndex];
    const dayData = weeklySchedule.find((day) => {
      const dayDate = new Date(day.date);
      return (
        dayDate.getFullYear() === targetDate.getFullYear() &&
        dayDate.getMonth() === targetDate.getMonth() &&
        dayDate.getDate() === targetDate.getDate()
      );
    });

    if (!dayData || !dayData.timeSlotIndex || dayData.timeSlotIndex.length === 0) {
      return false;
    }

    // Check if any slot in the block is available
    return blockSlots.some((slot) => dayData.timeSlotIndex.includes(slot));
  }

  // Fetch schedule when hover
  useEffect(() => {
    if (isHovered && teacher.id) {
      const mondayString = getCurrentWeekMondayString();
      setWeekStartDate(mondayString);
      fetchTutorWeekSchedule(teacher.id, mondayString)
        .then(setWeeklySchedule)
        .catch((err) => setWeeklySchedule([]));
    }
  }, [isHovered, teacher.id]);

  // Days: Monday to Sunday
  const daysVN = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

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
        <div className="flex-1 overflow-hidden">
          {/* Name & Badges */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <h2
              className="text-lg font-semibold text-gray-800 truncate max-w-xs"
              title={teacher.name}
            >
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
          <p
            className="text-gray-700 text-sm mb-3 truncate"
            title={teacher.description}
          >
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
          <div className="grid grid-cols-8 text-center p-4">
            {/* First row: empty cell + day headers */}
            <div></div>
            {daysVN.map((day, idx) => (
              <div key={day} className="text-xs font-medium text-gray-500">
                {day}
                <br />
                <span className="text-xs text-gray-400">
                  {weekDates[idx] ? weekDates[idx].getDate() : ""}
                </span>
              </div>
            ))}
            {/* Time blocks as first column, then cells for each day */}
            {timeBlocks.map((block) => (
              <React.Fragment key={block.label}>
                <div className="text-sm text-gray-600 py-2 px-2 border-r border-b border-gray-200 flex items-center justify-center">
                  {block.label}
                </div>
                {daysVN.map((_, dayIdx) => {
                  const isAvailable = isTimeBlockAvailable(block.slots, dayIdx);
                  return (
                    <div
                      key={block.label + dayIdx}
                      className={`h-10 border border-gray-200 flex items-center justify-center ${
                        isAvailable ? "bg-[#98D45F]" : "bg-gray-100"
                      }`}
                    />
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
      {/* End Hover Box */}
    </div>
  );
});

export default TutorCard;
