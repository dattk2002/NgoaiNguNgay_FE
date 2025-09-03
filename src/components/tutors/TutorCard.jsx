import React, { memo, useState, useEffect } from "react";
import { FaCheckCircle } from "react-icons/fa";
import Button from "@mui/material/Button";
import StarIconRender from "../../utils/starIconRender";
import { fetchTutorWeekSchedule, fetchTutorLesson, fetchTutorRating } from "../api/auth";
import formatPriceWithCommas from "../../utils/formatPriceWithCommas";
import VideoPlayer from "../VideoPlayer";

const TutorCard = memo(
  ({
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
    const [availabilityText, setAvailabilityText] = useState("");
    const [lowestLessonPrice, setLowestLessonPrice] = useState(null);
    const [lowestLessonName, setLowestLessonName] = useState("");
    const [lessons, setLessons] = useState([]);
    const [loadingLessons, setLoadingLessons] = useState(true);
    const [tutorReviews, setTutorReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(false);

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

    // Define the new time blocks
    const timeBlocks = [
      { label: "Sáng", slots: Array.from({ length: 24 }, (_, i) => i) }, // 00:00 - 12:00
      { label: "Chiều", slots: Array.from({ length: 12 }, (_, i) => i + 24) }, // 12:00 - 18:00
      { label: "Tối", slots: Array.from({ length: 12 }, (_, i) => i + 36) }, // 18:00 - 24:00
    ];

    // Helper to check if a block is available
    function isTimeBlockAvailable(blockSlots, dayIndex) {
      if (
        !weeklySchedule ||
        weeklySchedule.length === 0 ||
        !weekDates[dayIndex]
      )
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

      if (
        !dayData ||
        !dayData.timeSlotIndex ||
        dayData.timeSlotIndex.length === 0
      ) {
        return false;
      }

      // Check if any slot in the block is available
      return blockSlots.some((slot) => dayData.timeSlotIndex.includes(slot));
    }

    // Helper to get all available blocks for the week
    function getAvailableBlocksForWeek() {
      if (!weeklySchedule || weeklySchedule.length === 0) return [];
      const availableBlocks = new Set();
      for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
        timeBlocks.forEach((block) => {
          if (isTimeBlockAvailable(block.slots, dayIdx)) {
            availableBlocks.add(block.label);
          }
        });
      }
      return Array.from(availableBlocks);
    }

    // Fetch lessons for this tutor
    useEffect(() => {
      const fetchLessons = async () => {
        try {
          setLoadingLessons(true);
          const lessonsData = await fetchTutorLesson(teacher.id);
          setLessons(lessonsData || []);
        } catch (error) {
          console.error(`Failed to fetch lessons for tutor ${teacher.id}:`, error);
          setLessons([]);
        } finally {
          setLoadingLessons(false);
        }
      };

      fetchLessons();
    }, [teacher.id]);

    // Fetch tutor rating data
    useEffect(() => {
      const fetchTutorRatingData = async () => {
        try {
          setLoadingReviews(true);
          const ratingData = await fetchTutorRating(teacher.id);
          setTutorReviews(ratingData.reviews || []);
        } catch (error) {
          console.error(`Failed to fetch tutor rating for ${teacher.id}:`, error);
          setTutorReviews([]);
        } finally {
          setLoadingReviews(false);
        }
      };

      fetchTutorRatingData();
    }, [teacher.id]);

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

    // Find lesson with minimum price from lessons array
    useEffect(() => {
      if (Array.isArray(lessons) && lessons.length > 0) {
        let minLesson = lessons[0];
        for (const lesson of lessons) {
          if (Number(lesson.price) < Number(minLesson.price)) {
            minLesson = lesson;
          }
        }
        setLowestLessonPrice(Number(minLesson.price));
        setLowestLessonName(minLesson.name || "");
      } else {
        setLowestLessonPrice(null);
        setLowestLessonName("");
      }
    }, [lessons]);

    // Update availabilityText when weeklySchedule changes
    useEffect(() => {
      if (weeklySchedule && weeklySchedule.length > 0) {
        const availableBlocks = getAvailableBlocksForWeek();
        if (availableBlocks.length === 0) {
          setAvailabilityText("Không có lịch");
        } else {
          setAvailabilityText(availableBlocks.join(", "));
        }
      } else {
        setAvailabilityText("Không có lịch");
      }
    }, [weeklySchedule]);

    // Days: Monday to Sunday
    const daysVN = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
    const weekDates = getDatesOfWeek(weekStartDate);

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
          <div className="flex flex-row md:flex-col items-center w-full md:w-25 flex-shrink-0">
            <img
              src={teacher.imageUrl}
              alt={teacher.name}
              className="w-16 h-16 rounded-full object-cover mb-2 border border-gray-200"
            />
            <StarIconRender
              rating={teacher.rating}
              className="w-4 h-4 text-yellow-500"
            />
            <span className="text-xs text-gray-500 pt-5">
              {!teacher.rating
                ? "Chưa có đánh giá"
                : `${Number(teacher.rating).toFixed(1)} (${tutorReviews.length} đánh giá)`}
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
              <span className="font-medium mr-2">Ngôn ngữ:</span>
              <span className="text-gray-800 font-semibold">
                {teacher.nativeLanguage}
              </span>
              <span className="ml-1 inline-block bg-blue-100 text-blue-800 text-xs font-medium px-1.5 py-0.5 rounded">
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
              <div className="flex flex-col">
                <span className="text-[#333333] font-semibold">
                  {loadingLessons ? (
                    <span className="text-gray-500">Đang tải...</span>
                  ) : lowestLessonPrice !== null ? (
                    `${formatPriceWithCommas(lowestLessonPrice)} VNĐ / 30 phút / 1 slot`
                  ) : (
                    "Không có khóa học"
                  )}
                </span>
                {!loadingLessons && lowestLessonName && (
                  <span className="text-sm text-gray-600 mt-1">
                    {lowestLessonName}
                  </span>
                )}
              </div>
              <span className="text-md text-green-600">
                Lịch rảnh của gia sư: {availabilityText}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="contained"
                  size="small"
                  sx={{
                    background: "#3B82F6 ",
                    color: "#fff",
                    textTransform: "none",
                    fontWeight: "bold",
                    padding: "8px 20px",
                    borderRadius: "999px", // Pill shape
                    boxShadow: "0 2px 8px rgba(59, 130, 246, 0.15)",
                    transition: "transform 0.15s, box-shadow 0.15s",
                    "&:hover": {
                      background:
                        "linear-gradient(90deg, #3B82F6 0%, #6EE7B7 100%)",
                      boxShadow: "0 4px 16px rgba(59, 130, 246, 0.25)",
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
            <div className="mb-4">
              <VideoPlayer 
                videoUrl={hoveredTutor.introductionVideoUrl || hoveredTutor.videoUrl}
                width="100%"
                height="225"
                title={`Video giới thiệu của ${hoveredTutor.name}`}
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
                    const isAvailable = isTimeBlockAvailable(
                      block.slots,
                      dayIdx
                    );
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
  }
);

export default TutorCard;
