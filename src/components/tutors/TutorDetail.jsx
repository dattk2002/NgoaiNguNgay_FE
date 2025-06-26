import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  fetchTutorById,
  fetchRecommendTutor,
  fetchTutorLesson,
  fetchTutorLessonDetailById,
} from "../api/auth";
import { formatTutorDate } from "../../utils/formatTutorDate";
import { FaStar, FaBook, FaUsers, FaClock, FaHeart } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import ReviewsSection from "../ReviewSection";
import { FaArrowRight } from "react-icons/fa6";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import RecommendTutorCard from "./RecommendTutorCard";
import { formatLanguageCode } from "../../utils/formatLanguageCode";
import Collapse from "@mui/material/Collapse";
import LessonDetailModal from "../modals/LessonDetailModal";
import formatPriceWithCommas from "../../utils/formatPriceWithCommas";

// Define the 4-hour time ranges
const timeRanges = [
  "00:00 - 04:00",
  "04:00 - 08:00",
  "08:00 - 12:00",
  "12:00 - 16:00",
  "16:00 - 20:00",
  "20:00 - 24:00",
];

const TutorDetail = ({ user, onRequireLogin }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [showFullAboutMe, setShowFullAboutMe] = useState(false);

  // State for availability data, now structured by 4-hour blocks
  const [availabilityData, setAvailabilityData] = useState({});
  const [availabilityDays, setAvailabilityDays] = useState([]);
  const [availabilityDates, setAvailabilityDates] = useState([]);

  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [lessonDetail, setLessonDetail] = useState(null);
  const [loadingLessonDetail, setLoadingLessonDetail] = useState(false);
  const [lessonDetailError, setLessonDetailError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch tutor data using the updated API function
        const apiTeacherData = await fetchTutorById(id);

        // --- Map API data and add mock data for missing fields ---
        // Find the primary language from the languages array
        const primaryLanguage = apiTeacherData.languages.find(
          (lang) => lang.isPrimary
        );

        // Map hashtags to subjects format (mocking level as 5 for simplicity)
        const languages = apiTeacherData.languages.map((language) => ({
          name: language.languageCode,
          // Mocking level as 5 since it's not in the API response structure
          level: language.proficiency,
        }));

        // Process availabilityPatterns from API response
        // The provided API response example has an empty availabilityPatterns array.
        // You'll need to adjust this logic if the API starts returning availability data in a different format.
        // For now, let's use the previous mock processing logic but expect potentially different input format.
        const blockAvailability = {};
        timeRanges.forEach((range) => {
          blockAvailability[range] = {
            mon: false,
            tue: false,
            wed: false,
            thu: false,
            fri: false,
            sat: false,
            sun: false,
          };
        });

        // *** IMPORTANT: If the API's availabilityPatterns structure is different,
        //    the following loop needs to be updated to parse it correctly.
        //    Based on the provided empty array, I'm keeping the old processing logic
        //    as a placeholder, but it might need significant changes. ***
        if (
          apiTeacherData &&
          Array.isArray(apiTeacherData.availabilityPatterns)
        ) {
          // Assuming availabilityPatterns might contain objects similar to the old 'availability' structure
          apiTeacherData.availabilityPatterns.forEach((timeSlot) => {
            if (timeSlot && timeSlot.time) {
              const hour = parseInt(timeSlot.time.split(":")[0], 10);
              let timeRangeKey = null;

              if (hour >= 0 && hour < 4) timeRangeKey = "00:00 - 04:00";
              else if (hour >= 4 && hour < 8) timeRangeKey = "04:00 - 08:00";
              else if (hour >= 8 && hour < 12) timeRangeKey = "08:00 - 12:00";
              else if (hour >= 12 && hour < 16) timeRangeKey = "12:00 - 16:00";
              else if (hour >= 16 && hour < 20) timeRangeKey = "16:00 - 20:00";
              else if (hour >= 20 && hour < 24) timeRangeKey = "20:00 - 24:00";

              if (timeRangeKey && blockAvailability[timeRangeKey]) {
                if (timeSlot.mon === true)
                  blockAvailability[timeRangeKey].mon = true;
                if (timeSlot.tue === true)
                  blockAvailability[timeRangeKey].tue = true;
                if (timeSlot.wed === true)
                  blockAvailability[timeRangeKey].wed = true;
                if (timeSlot.thu === true)
                  blockAvailability[timeRangeKey].thu = true;
                if (timeSlot.fri === true)
                  blockAvailability[timeRangeKey].fri = true;
                if (timeSlot.sat === true)
                  blockAvailability[timeRangeKey].sat = true;
                if (timeSlot.sun === true)
                  blockAvailability[timeRangeKey].sun = true;
              }
            } else {
              // Log a warning if the structure isn't as expected
              console.warn(
                "Skipping potentially invalid availabilityPattern data:",
                timeSlot
              );
            }
          });
        }

        const formattedTeacherData = {
          id: apiTeacherData.userId, // Use userId from API
          name: apiTeacherData.fullName || apiTeacherData.nickName, // Use fullName or nickName
          email: apiTeacherData.email, // Add email from API
          brief: apiTeacherData.brief, // Add brief from API
          description: apiTeacherData.description, // Add description from API
          teachingMethod: apiTeacherData.teachingMethod, // Add teachingMethod from API
          verificationStatus: apiTeacherData.verificationStatus, // Add verificationStatus from API
          becameTutorAt: apiTeacherData.becameTutorAt, // Add becameTutorAt from API
          // Mocked data for fields not in the provided API response structure
          imageUrl: apiTeacherData.profilePictureUrl, // Mocked
          tag: "Professional Teacher", // Mocked
          nativeLanguage: primaryLanguage
            ? primaryLanguage.languageCode
            : "English", // Derived or Mocked
          subjects: languages, // Mapped from hashtags, level mocked
          address: "Unknown", // Mocked
          lessons: 100, // Mocked
          students: 50, // Mocked
          rating: 4.5, // Mocked
          ratingCount: 30, // Mocked
          certifications: apiTeacherData.hashtags.map(
            (hashtag) => hashtag.name
          ), // Get from API hashtags
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Mocked
          price: 10.0, // Mocked - Use a default or handle null if price is in API later
          responseRate: "95%", // Mocked
          availability: blockAvailability, // Processed from API or mocked
        };
        // --- End Mapping and Mocking ---

        setTeacher(formattedTeacherData);
        setAvailabilityData(blockAvailability); // Set processed availability data

        const today = new Date();
        const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const next7Days = [];
        const next7Dates = [];

        for (let i = 0; i < 7; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() + i);
          next7Days.push(daysOfWeek[date.getDay()]);
          next7Dates.push(date.getDate());
        }

        setAvailabilityDays(next7Days);
        setAvailabilityDates(next7Dates);

        // Keep fetching recommended tutors from the mock source for now
        const recommendedTutorsData = await fetchRecommendTutor();
        const filteredRecommendedTutors = recommendedTutorsData.filter(
          (tutor) => tutor.userId !== id
        );
        // Map the API response to the format expected by RecommendTutorCard
        const mappedRecommendedTutors = filteredRecommendedTutors.map(
          (tutor) => ({
            id: tutor.userId,
            name: tutor.fullName || tutor.nickName,
            subjects: tutor.languages
              ? tutor.languages
                  .map((language) => language.languageCode)
                  .join(", ")
              : "N/A", // Assuming hashtags are subjects
            rating: tutor.rating || 0, // Use actual rating if available, otherwise 0
            reviews: tutor.ratingCount || 0, // Use actual review count, otherwise 0
            price: tutor.price || 0, // Use actual price if available, otherwise 0
            imageUrl: tutor.profilePictureUrl,
            description: tutor.description,
            address: tutor.address,
          })
        );
        setTutors(mappedRecommendedTutors);

        // Fetch lessons for this tutor
        const lessonsData = await fetchTutorLesson(id);
        setLessons(lessonsData);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError(err.message || "Could not load data.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, user, navigate, onRequireLogin]); // Added dependencies

  const handleBookLesson = () => {
    if (!user) {
      onRequireLogin("Please log in to book a lesson.");
      return;
    }
    // Proceed with booking logic (e.g., open booking modal or navigate)
    console.log("Booking lesson for user:", user);
    // Example: navigate to a booking page, passing the teacher ID
    // navigate(`/book/${teacher.id}`);
  };

  // Updated handler for the "Contact teacher" button
  const handleContactTeacher = () => {
    if (!user) {
      onRequireLogin("Please log in to contact this tutor.");
      return;
    }
    // Navigate to the message page with the teacher's ID
    navigate(`/message/${teacher.id}`);
  };

  const handleClick = () => {
    navigate("/languages"); // Assuming this navigates to a list of subjects/languages
  };

  const handleLessonClick = async (lesson) => {
    setIsLessonModalOpen(true);
    setLoadingLessonDetail(true);
    setLessonDetailError(null);
    try {
      const detail = await fetchTutorLessonDetailById(lesson.id);
      setLessonDetail(detail);
    } catch (err) {
      setLessonDetailError("Failed to load lesson details.");
      setLessonDetail(null);
    } finally {
      setLoadingLessonDetail(false);
    }
  };

  const handleCloseLessonModal = () => {
    setIsLessonModalOpen(false);
    setLessonDetail(null);
    setLessonDetailError(null);
  };

  if (loading)
    return (
      // Add black loading spinner similar to EditUserProfile
      <div className="flex justify-center items-center min-h-screen">
        <svg
          className="animate-spin h-8 w-8 text-black"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l2-2.647z"
          ></path>
        </svg>
      </div>
    );
  if (error) return <p className="text-center text-red-500">Lỗi: {error}</p>;
  if (!teacher)
    return <p className="text-center text-gray-500">Không tìm thấy gia sư.</p>;

  // Use the 'brief' field from the API response if available, otherwise use a default
  const tutorBrief =
    teacher.brief ||
    `Chào bạn! Tôi là ${teacher.name}, một gia sư đầy nhiệt huyết. Hãy cùng học nhé!`;

  // Use the 'teachingMethod' field from the API response if available, otherwise use a default
  const tutorTeachingMethod =
    teacher.teachingMethod ||
    "Các bài học của tôi mang tính tương tác và lấy học viên làm trung tâm...";

  // Use the 'description' field from the API response if available, otherwise use a default
  const tutorDescription =
    teacher.description ||
    "Là một giáo viên, tôi tập trung vào việc tạo ra một môi trường hỗ trợ và hấp dẫn...";

  const interests = [
    "Du lịch",
    "Viết lách",
    "Đọc sách",
    "Phim & Chương trình TV",
    "Thú cưng & Động vật",
  ]; // Keep mock interests for now

  const tabVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  const sliderSettings = {
    dots: false,
    infinite: tutors.length > 3,
    speed: 500,
    slidesToShow: Math.min(tutors.length, 3),
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: Math.min(tutors.length, 2),
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  // Helper function to format date

  // Define the labels for the tabs
  const tabLabels = [
    "Giới thiệu",
    "Phong cách giảng dạy",
    "Sơ yếu lý lịch & chứng chỉ",
  ];

  // Handler for tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <div className="container mx-auto px-4 py-12 bg-white min-h-screen rounded-3xl max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-start gap-8">
        {/* LEFT COLUMN */}
        <div className="flex-1">
          <div className="flex items-start gap-4">
            <img
              src={teacher.imageUrl || "https://picsum.photos/300/200?random=1"}
              alt={teacher.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
            />
            <div className="flex flex-col w-[90%]">
              <div className="flex justify-between items-start w-full">
                <div className="w-full">
                  <div className="flex justify-between items-start">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2 pb-3">
                        {teacher.name}
                      </h1>
                      <p className="text-green-600 font-medium text-sm">
                        {teacher.tag || "Giáo viên chuyên nghiệp"}
                      </p>
                      <div className="flex items-center gap-7 text-gray-600 text-sm mt-1">
                        <span>Truy cập 11 giờ trước</span>
                        <div>
                          <span>Ngôn ngữ: </span>
                          <span className="text-gray-800 font-medium">
                            {formatLanguageCode(teacher.nativeLanguage) ||
                              "Tiếng Anh"}
                            <span className="ml-1 inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
                              Bản xứ
                            </span>
                          </span>
                        </div>
                      </div>
                      <div className="mt-5 text-gray-600 text-sm">
                        <div className="flex flex-wrap gap-2 mt-1">
                          {teacher.subjects && teacher.subjects.length > 0 ? (
                            teacher.subjects.map((subject, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-1"
                              >
                                <span className="text-blue-600 font-medium">
                                  {formatLanguageCode(subject.name)}
                                </span>
                                <div className="flex gap-0.5">
                                  {[...Array(5)].map((_, i) => (
                                    <div
                                      key={i}
                                      className={`w-1 h-4 rounded-full ${
                                        i < subject.level
                                          ? "bg-blue-600"
                                          : "bg-gray-200"
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                            ))
                          ) : (
                            <span className="text-gray-600">
                              Không có ngôn ngữ bổ sung nào
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button className="text-gray-600 hover:text-red-500">
                      <FaHeart className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6 border-b border-gray-200">
                <div className="flex space-x-4">
                  {tabLabels.map((label, index) => (
                    <button
                      key={index}
                      className={`py-2 px-4 text-sm font-medium focus:outline-none ${
                        activeTab === index
                          ? "border-b-2 border-red-500 text-red-600"
                          : "text-gray-600 hover:text-gray-800"
                      }`}
                      onClick={() => handleTabChange(null, index)} // Pass null for event, index for newValue
                      role="tab"
                      aria-selected={activeTab === index}
                      id={`tab-${index}`}
                      aria-controls={`tabpanel-${index}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    variants={tabVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                  >
                    {activeTab === 0 && (
                      <>
                        <p className="text-gray-700 text-sm">
                          Từ{" "}
                          <span className="font-medium">{teacher.address}</span>
                        </p>
                        <p className="text-gray-700 text-sm mt-2">
                          Gia sư NgoaiNguNgay từ{" "}
                          <span className="font-medium">
                            {formatTutorDate(teacher.becameTutorAt)}
                          </span>{" "}
                        </p>
                        <h3 className="text-gray-800 font-semibold mt-4">
                          Giới thiệu về tôi
                        </h3>
                        <p className="text-gray-700 text-sm mt-2">
                          Sở thích:{" "}
                          {interests.map((interest, index) => (
                            <span
                              key={index}
                              className="inline-block bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded mr-1"
                            >
                              {interest}
                            </span>
                          ))}
                        </p>
                        <Collapse in={showFullAboutMe} collapsedSize={80}>
                          <p className="text-gray-700 text-sm mt-4 leading-relaxed line-clamp-3 break-words">
                            {tutorDescription}
                          </p>
                        </Collapse>
                        {tutorDescription && tutorDescription.length > 10 && (
                          <div
                            onClick={() => setShowFullAboutMe(!showFullAboutMe)}
                            className="text-blue-600 text-sm mt-2 hover:underline"
                          >
                            {showFullAboutMe ? "Ẩn bớt" : "Đọc thêm"}
                          </div>
                        )}
                      </>
                    )}
                    {activeTab === 1 && (
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {tutorTeachingMethod}
                      </p>
                    )}

                    {activeTab === 2 && (
                      <div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {teacher.certifications &&
                          teacher.certifications.length > 0 ? (
                            teacher.certifications.map((cert, index) => (
                              <span
                                key={index}
                                className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full"
                              >
                                {cert}
                              </span>
                            ))
                          ) : (
                            <p className="text-gray-700 text-sm">
                              Không có chứng chỉ nào được chỉ định
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
        {/* RIGHT COLUMN */}
        <div className="w-full md:w-[350px] flex-shrink-0 md:ml-0 mt-8 md:mt-0">
          <div className="md:sticky md:top-8">
            <div className="bg-white rounded-2xl shadow-lg p-4">
              <div className="relative rounded-lg overflow-hidden">
                <iframe
                  src={
                    teacher.videoUrl ||
                    "https://www.youtube.com/embed/dQw4w9WgXcQ"
                  }
                  title={`Video giới thiệu của ${teacher.name}`}
                  className="w-full aspect-video rounded-lg"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="mt-4">
                <p className="text-gray-800 font-semibold text-sm">
                  Buổi học thử
                </p>
                <p className="text-red-500 font-bold text-lg">
                  {(parseFloat(teacher.price) * 0.5).toFixed(2)} VND
                </p>
                <button
                  onClick={handleBookLesson}
                  className="w-full bg-red-500 text-white py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-red-600 transition mt-3"
                >
                  Đặt buổi học
                </button>
                <button
                  onClick={handleContactTeacher}
                  className="w-full bg-gray-100 text-gray-800 py-3 rounded-lg border border-gray-300 hover:bg-gray-200 transition mt-2"
                >
                  Liên hệ giáo viên
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <p className="text-2xl font-bold text-gray-800">
            {teacher.rating ? teacher.rating.toFixed(1) : "N/A"}
          </p>
          <div className="flex justify-center gap-1 mt-1">
            {[...Array(5)].map((_, i) => (
              <FaStar
                key={i}
                className={
                  teacher.rating && i < Math.round(teacher.rating)
                    ? "text-yellow-400"
                    : "text-gray-300"
                }
              />
            ))}
          </div>
          <p className="text-gray-600 mt-2">Đánh giá</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <p className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
            <FaUsers className="text-blue-500" /> {teacher.students || 0}
          </p>
          <p className="text-gray-600 mt-2">Học viên</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <p className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
            <FaBook className="text-blue-500" /> {teacher.lessons || 0}
          </p>
          <p className="text-gray-600 mt-2">Buổi học</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <p className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
            <FaClock className="text-blue-500" />{" "}
            {teacher.responseRate || "N/A"}
          </p>
          <p className="text-gray-600 mt-2">Tỷ lệ phản hồi</p>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-2xl font-semibold text-gray-800">
          Khóa học
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {lessons.length > 0 ? (
            lessons.map((lesson, idx) => (
              <div
                key={lesson.id || idx}
                className="flex justify-between items-center bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition cursor-pointer"
                onClick={() => handleLessonClick(lesson)}
              >
                <div>
                  <p className="font-semibold text-gray-800 text-base">
                    {lesson.name}
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    {formatLanguageCode(lesson.languageCode)}
                    {lesson.category && <> | {lesson.category}</>}
                    {lesson.completedCount && (
                      <> | {lesson.completedCount} buổi đã hoàn thành</>
                    )}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-red-500 font-bold text-lg">
                    {typeof lesson.price === "number" || typeof lesson.price === "string"
                      ? formatPriceWithCommas(lesson.price)
                      : "Không có"}
                    {" "}VND
                  </span>
                  {lesson.discount && (
                    <span className="text-xs text-gray-500 mt-1">
                      Gói học giảm {lesson.discount}%
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">
              Không có buổi học nào cho gia sư này.
            </p>
          )}
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-2xl font-semibold text-gray-800">
          Lịch trình khả dụng
        </h2>
        <div className="mt-4 overflow-x-auto border border-gray-200 rounded-lg">
          <div className="grid grid-cols-8 min-w-[600px]">
            <div className="text-sm font-medium text-gray-600 border-b border-r border-gray-200"></div>
            {availabilityDays.map((day, index) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-gray-800 py-2 border-b border-gray-200 last:border-r-0"
              >
                {day === "Mon"
                  ? "T2"
                  : day === "Tue"
                  ? "T3"
                  : day === "Wed"
                  ? "T4"
                  : day === "Thu"
                  ? "T5"
                  : day === "Fri"
                  ? "T6"
                  : day === "Sat"
                  ? "T7"
                  : "CN"}
                <br />
                <span className="text-xs text-gray-600">
                  {availabilityDates[index]}
                </span>
              </div>
            ))}
            {timeRanges.map((timeRange) => (
              <React.Fragment key={timeRange}>
                <div className="text-sm text-gray-600 py-2 px-2 border-r border-b border-gray-200 last:border-b-0 flex items-center">
                  {timeRange}
                </div>
                {availabilityDays.map((day) => {
                  const dayAbbrev = day.toLowerCase();
                  const isAvailable =
                    availabilityData[timeRange]?.[dayAbbrev] === true;

                  return (
                    <div
                      key={`${timeRange}-${day}`}
                      className={`h-12 border border-gray-200 last:border-b-0 ${
                        isAvailable
                          ? "bg-gray-100"
                          : "bg-green-400 cursor-pointer hover:bg-green-500"
                      } ${
                        day === availabilityDays[availabilityDays.length - 1]
                          ? "border-r border-gray-200"
                          : ""
                      }`}
                    ></div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-500">
            Dựa trên múi giờ của bạn (UTC+07:00)
          </div>
          <button
            onClick={handleBookLesson}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
          >
            Lên lịch buổi học
          </button>
        </div>
      </div>

      <ReviewsSection teacher={teacher} />

      <div className="mt-10">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 px-16">
          Gia sư được đề xuất
        </h2>
        {tutors.length > 0 ? (
          <Slider {...sliderSettings}>
            {tutors.map((tutor) => (
              <div key={tutor.id} className="px-3">
                <RecommendTutorCard
                  tutor={{
                    id: tutor.id,
                    name: tutor.name,
                    subjects:
                      Array.isArray(tutor.subjects) && tutor.subjects.length > 0
                        ? tutor.subjects
                            .map((subject) => subject.name)
                            .join(", ")
                        : "N/A",
                    rating: tutor.rating,
                    reviews: tutor.reviews,
                    price: tutor.price,
                    imageUrl: tutor.imageUrl,
                    isProfessional: tutor.isProfessional,
                    description: tutor.description,
                    address: tutor.address,
                  }}
                  user={user}
                  onRequireLogin={onRequireLogin}
                />
              </div>
            ))}
          </Slider>
        ) : (
          <p className="text-center text-gray-500">
            Không có gia sư được đề xuất vào lúc này.
          </p>
        )}
        <div className="mt-6 text-center">
          <button
            onClick={handleClick}
            className="bg-[#333333] hover:bg-black text-white font-bold py-2 px-6 rounded-lg transition duration-150 ease-in-out"
          >
            <div className="flex items-center justify-center">
              Xem thêm <FaArrowRight className="ml-2" />
            </div>
          </button>
        </div>
      </div>

      <LessonDetailModal
        isOpen={isLessonModalOpen}
        onClose={handleCloseLessonModal}
        lesson={lessonDetail}
        loading={loadingLessonDetail}
        error={lessonDetailError}
      />
    </div>
  );
};

export default TutorDetail;
