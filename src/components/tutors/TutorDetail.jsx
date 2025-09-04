import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  fetchTutorById,
  fetchRecommendTutor,
  fetchTutorLesson,
  fetchTutorLessonDetailById,
  fetchTutorWeekSchedule,
  fetchTutorRating,
  fetchTutorBookingConfigByTutorId,
} from "../api/auth";
import VideoPlayer from "../VideoPlayer";
import { formatTutorDate } from "../../utils/formatTutorDate";
import {
  FaStar,
  FaBook,
  FaUsers,
  FaClock,
  FaHeart,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
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
import TutorWeeklyPatternDetailModal from "../modals/TutorWeeklyPatternDetailModal";
import { showSuccess, showError } from "../../utils/toastManager.js";
import "react-toastify/dist/ReactToastify.css";
import LessonSelectionModal from "../modals/LessonSelectionModal";

// Define the 4-hour time ranges
const timeRanges = [
  "00:00 - 04:00",
  "04:00 - 08:00",
  "08:00 - 12:00",
  "12:00 - 16:00",
  "16:00 - 20:00",
  "20:00 - 24:00",
];

function getNextWeekMondayString() {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 (Sun) - 6 (Sat)
  const diffToMonday = (dayOfWeek + 6) % 7; // 0 for Monday, 1 for Tuesday, ..., 6 for Sunday
  const monday = new Date(today);
  monday.setDate(today.getDate() - diffToMonday);
  
  // Add 7 days to get next week's Monday
  monday.setDate(monday.getDate() + 7);
  
  // Format as YYYY-MM-DD 00:00:00
  const yyyy = monday.getFullYear();
  const mm = String(monday.getMonth() + 1).padStart(2, "0");
  const dd = String(monday.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} 00:00:00`;
}

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

  const [weeklySchedule, setWeeklySchedule] = useState([]);
  const [weekStartDate, setWeekStartDate] = useState(null);

  const [currentWeekStart, setCurrentWeekStart] = useState(null);
  const [currentWeekEnd, setCurrentWeekEnd] = useState(null);

  const [isPatternDialogOpen, setIsPatternDialogOpen] = useState(false);
  const [bookingLessonId, setBookingLessonId] = useState(null);
  
  // Add new state for modal mode
  const [patternModalMode, setPatternModalMode] = useState('readonly'); // 'readonly' or 'booking'

  // Rating states
  const [tutorRating, setTutorRating] = useState(null);
  const [tutorReviews, setTutorReviews] = useState([]);
  const [loadingRating, setLoadingRating] = useState(false);

  // Handler to show toast and add notification
  const handleBookingSuccess = () => {
    showSuccess("Gửi yêu cầu thành công!", {
      onClose: () => {
        // Add notification after toast closes
        if (window.addNotification && teacher) {
          window.addNotification({
            title: "Đặt lịch thành công",
            message: `Bạn đã đặt lịch gia sư ${teacher.name} thành công`,
            type: "success",
            senderProfile: {
              profilePictureUrl:
                teacher.profileImageUrl ||
                "https://avatar.iran.liara.run/public",
            },
          });
        }
      },
    });

    // Close the LessonDetailModal as well
    handleCloseLessonModal();
  };

  // Add new state for lesson selection modal
  const [isLessonSelectionModalOpen, setIsLessonSelectionModalOpen] = useState(false);

  // Add new state for booking configuration
  const [bookingConfig, setBookingConfig] = useState(null);
  const [loadingBookingConfig, setLoadingBookingConfig] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

                 // Fetch tutor data using the updated API function
         const apiTeacherData = await fetchTutorById(id);
         console.log("🔍 API Teacher Data:", apiTeacherData);

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

        // Process availability data from weekly schedule
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
           profileImageUrl: apiTeacherData.profileImageUrl, // Mocked
           tag: "Gia sư uy tín", // Mocked
           nativeLanguage: primaryLanguage
             ? primaryLanguage.languageCode
             : "English", // Derived or Mocked
           subjects: languages, // Mapped from hashtags, level mocked
           address: "Unknown", // Mocked
           lessons: 100, // Mocked
           students: 50, // Mocked
           rating: apiTeacherData.averageTeachingQuality,
           ratingCount: 30, // Mocked
           certifications: apiTeacherData.hashtags.map(
             (hashtag) => hashtag.name
           ), // Get from API hashtags
           videoUrl: apiTeacherData.videoUrl || null, // Use actual videoUrl from API or null
           introductionVideoUrl: apiTeacherData.introductionVideoUrl, // Add introductionVideoUrl from API
           price: 10.0, // Mocked - Use a default or handle null if price is in API later
           responseRate: "95%", // Mocked
           availability: blockAvailability, // Processed from API or mocked
         };
        // --- End Mapping and Mocking ---

        setTeacher(formattedTeacherData);
        setAvailabilityData(blockAvailability); // Set processed availability data

        // Add this block:
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 (Sun) - 6 (Sat)
        const diffToMonday = (dayOfWeek + 6) % 7; // 0 for Monday, 1 for Tuesday, ..., 6 for Sunday
        const monday = new Date(today);
        monday.setDate(today.getDate() - diffToMonday);
        
        // Add 7 days to get next week's Monday
        monday.setDate(monday.getDate() + 7);

        setWeekStartDate(monday);

        // Keep fetching recommended tutors from the mock source for now
        const recommendedTutorsData = await fetchRecommendTutor();
        const filteredRecommendedTutors = recommendedTutorsData.filter(
          (tutor) => tutor.userId !== id
        );
        // Map the API response to the format expected by RecommendTutorCard
        const mappedRecommendedTutors = filteredRecommendedTutors.map(
          (tutor) => ({
            tutorId: tutor.tutorId,
            name: tutor.fullName || tutor.nickName,
            subjects: tutor.languages
              ? tutor.languages
                  .map((language) => language.languageCode)
                  .join(", ")
              : "N/A",
            rating: tutor.rating || 0,
            reviews: tutor.ratingCount || 0,
            price: tutor.price || 0,
            profileImageUrl: tutor.profileImageUrl, // <-- fix typo if needed
            description: tutor.description,
            address: tutor.address,
            isProfessional: tutor.isProfessional, // (if you want to show the tag)
          })
        );
        setTutors(mappedRecommendedTutors);

        // Fetch lessons for this tutor
        const lessonsData = await fetchTutorLesson(id);
        setLessons(lessonsData);

        // Calculate next week's Monday as startDate
        const startDate = getNextWeekMondayString();
        const scheduleData = await fetchTutorWeekSchedule(id, startDate);
        setWeeklySchedule(scheduleData);

        console.log("Weekly Schedule Data:", scheduleData);

        // Fetch tutor rating data
        await fetchTutorRatingData(id);

        // Fetch tutor booking configuration
        try {
          setLoadingBookingConfig(true);
          const configData = await fetchTutorBookingConfigByTutorId(id);
          setBookingConfig(configData);
        } catch (configError) {
          console.error("Failed to fetch tutor booking config:", configError);
          // Set default config if API fails
          setBookingConfig({ allowInstantBooking: true });
        } finally {
          setLoadingBookingConfig(false);
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError(err.message || "Could not load data.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, user, navigate, onRequireLogin]); 

  useEffect(() => {
    if (!weekStartDate) return;
    const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const next7Days = [];
    const next7Dates = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStartDate);
      date.setDate(weekStartDate.getDate() + i);
      next7Days.push(daysOfWeek[i]);
      next7Dates.push(date.getDate());
    }

    setAvailabilityDays(next7Days);
    setAvailabilityDates(next7Dates);
  }, [weekStartDate]);

  useEffect(() => {
    if (!weekStartDate) return;
    setCurrentWeekStart(weekStartDate);
    const end = new Date(weekStartDate);
    end.setDate(weekStartDate.getDate() + 6);
    setCurrentWeekEnd(end);
  }, [weekStartDate]);

  const handleBookLesson = () => {
    if (!user) {
      onRequireLogin("Please log in to book a lesson.");
      return;
    }
    
    // Check if tutor has lessons available
    if (!lessons || lessons.length === 0) {
      showError("Gia sư này chưa có khóa học nào khả dụng.");
      return;
    }
    
    // Check if instant booking is allowed
    if (bookingConfig && !bookingConfig.allowInstantBooking) {
      showError("Gia sư này không cho phép đặt lịch tức thì. Vui lòng liên hệ trực tiếp.");
      return;
    }
    
    // Open lesson selection modal
    setIsLessonSelectionModalOpen(true);
  };

  // Updated handler for the "Contact teacher" button
  const handleContactTeacher = () => {
    if (!user) {
      onRequireLogin("Đăng nhập để liên hệ với gia sư này !");
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

  // Fetch tutor rating data
  const fetchTutorRatingData = async (tutorId) => {
    try {
      setLoadingRating(true);
      const ratingData = await fetchTutorRating(tutorId);
      setTutorRating(ratingData);
      setTutorReviews(ratingData.reviews || []);
    } catch (error) {
      console.error("Failed to fetch tutor rating:", error);
      // Don't show error toast, just log it
    } finally {
      setLoadingRating(false);
    }
  };

  // Modify the existing handlers to set the appropriate mode
  const handleBookNowFromLesson = (lessonId) => {
    setBookingLessonId(lessonId);
    setPatternModalMode('booking');
    setIsPatternDialogOpen(true);
  };

  // New handler for lesson selection
  const handleLessonSelect = (selectedLesson) => {
    // Set the selected lesson ID and open the pattern dialog
    setBookingLessonId(selectedLesson.id);
    setPatternModalMode('booking');
    setIsPatternDialogOpen(true);
  };

  // Add new handler for read-only mode
  const handleViewScheduleDetails = () => {
    setPatternModalMode('readonly');
    setBookingLessonId(null); // Clear any selected lesson
    setIsPatternDialogOpen(true);
  };

  // Helper function to check if a time slot is available based on weekly schedule
  const isTimeSlotAvailable = (timeRange, dayIndex) => {
    if (!weeklySchedule || weeklySchedule.length === 0 || !weekStartDate)
      return false;

    // Calculate the correct date for this column
    const targetDate = new Date(weekStartDate);
    targetDate.setDate(weekStartDate.getDate() + dayIndex);

    // Find the day data for the given date (compare year, month, day)
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

    // Convert time range to slot indices - check all hours in 4-hour block
    const timeRangeToSlots = (range) => {
      const [startTime] = range.split(" - ");
      const [hours] = startTime.split(":");
      const startHour = parseInt(hours, 10);

      // For 4-hour blocks, check all 4 hours (8 slots total)
      const slots = [];
      for (let hour = startHour; hour < startHour + 4; hour++) {
        slots.push(hour * 2, hour * 2 + 1); // Each hour has 2 slots
      }
      return slots;
    };

    const expectedSlots = timeRangeToSlots(timeRange);

    // Check if any of the expected slots are in the available slots
    return expectedSlots.some((slot) => dayData.timeSlotIndex.includes(slot));
  };

  // Add a function to get the lowest priced lesson
  const getLowestPricedLesson = () => {
    if (!lessons || lessons.length === 0) {
      return null;
    }
    
    // Filter out lessons with invalid prices and find the lowest
    const validLessons = lessons.filter(lesson => 
      lesson.price !== null && 
      lesson.price !== undefined && 
      !isNaN(parseFloat(lesson.price))
    );
    
    if (validLessons.length === 0) {
      return null;
    }
    
    return validLessons.reduce((lowest, current) => {
      const currentPrice = parseFloat(current.price);
      const lowestPrice = parseFloat(lowest.price);
      return currentPrice < lowestPrice ? current : lowest;
    });
  };

  if (loading)
    return (
      // Skeleton loader for TutorDetail page
      <div className="container mx-auto px-4 py-12 bg-white min-h-screen rounded-3xl max-w-7xl animate-pulse">
        <div className="flex flex-col md:flex-row md:items-start gap-8">
          {/* LEFT COLUMN SKELETON */}
          <div className="flex-1">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-200" />
              <div className="flex flex-col w-[90%] gap-2">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
                <div className="h-8 bg-gray-200 rounded w-full mt-4" />
                <div className="h-20 bg-gray-200 rounded w-full mt-4" />
              </div>
            </div>
          </div>
          {/* RIGHT COLUMN SKELETON */}
          <div className="w-full md:w-[350px] flex-shrink-0 md:ml-0 mt-8 md:mt-0">
            <div className="bg-white rounded-2xl shadow-lg p-4">
              <div className="w-full aspect-video bg-gray-200 rounded-lg" />
              <div className="mt-4 h-4 bg-gray-200 rounded w-1/2" />
              <div className="mt-2 h-8 bg-gray-200 rounded w-full" />
              <div className="mt-2 h-8 bg-gray-200 rounded w-full" />
            </div>
          </div>
        </div>
        {/* Stats Skeleton */}
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-md">
              <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto" />
            </div>
          ))}
        </div>
        {/* Courses Skeleton */}
        <div className="mt-10">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-white p-4 rounded-xl shadow-md">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                <div className="h-6 bg-gray-200 rounded w-1/4" />
              </div>
            ))}
          </div>
        </div>
        {/* Schedule Skeleton */}
        <div className="mt-10">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4" />
          <div className="h-40 bg-gray-200 rounded w-full" />
        </div>
        {/* Reviews Skeleton */}
        <div className="mt-10">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4" />
          <div className="h-20 bg-gray-200 rounded w-full" />
        </div>
        {/* Recommended Tutors Skeleton */}
        <div className="mt-10">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4" />
          <div className="flex gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-40 h-48 bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>
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

  // Component to display detailed rating breakdown
  const DetailedRatingDisplay = ({ rating, label, icon, loading = false }) => {
    const starCount = Math.round(rating || 0);
    const averageRating = rating ? rating.toFixed(1) : "Chưa có";
    
    if (loading) {
      return (
        <div className="bg-white p-4 rounded-xl shadow-md">
          <div className="animate-pulse">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-5 h-5 bg-gray-200 rounded"></div>
              <div className="h-6 bg-gray-200 rounded w-12"></div>
            </div>
            <div className="flex justify-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-4 h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-4 bg-gray-200 rounded w-20 mx-auto"></div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="bg-white p-4 rounded-xl shadow-md">
        <div className="flex items-center justify-center gap-2 mb-2">
          {icon}
          <span className="text-lg font-semibold text-gray-800">{averageRating}</span>
        </div>
        <div className="flex justify-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <FaStar
              key={i}
              className={`w-4 h-4 ${
                i < starCount ? "text-yellow-400" : "text-gray-300"
              }`}
            />
          ))}
        </div>
        <p className="text-center text-sm text-gray-600">{label}</p>
        {tutorRating && tutorReviews.length > 0 && (
          <p className="text-xs text-gray-500 mt-1">({tutorReviews.length} đánh giá)</p>
        )}
      </div>
    );
  };

  // Define the labels for the tabs
  const tabLabels = [
    "Giới thiệu",
    "Phong cách giảng dạy",
    "Sơ yếu lý lịch & chứng chỉ",
    "Video giới thiệu",
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
              src={
                teacher.profileImageUrl ||
                "https://picsum.photos/300/200?random=1"
              }
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
                      {bookingConfig && !bookingConfig.allowInstantBooking && (
                        <span className="text-yellow-700 text-xl font-normal bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200 inline-flex items-center gap-1 w-fit">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Gia sư này hiện ko thể đặt lịch tức thì
                        </span>
                      )}
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
                      className={`py-2 px-4 text-sm font-medium no-focus-outline ${
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
                        <div className="mt-4">
                          <p className={`text-gray-700 text-sm leading-relaxed break-words ${
                            !showFullAboutMe ? 'line-clamp-3' : ''
                          }`}>
                            {tutorDescription}
                          </p>
                          {tutorDescription && tutorDescription.length > 100 && (
                            <div
                              onClick={() => setShowFullAboutMe(!showFullAboutMe)}
                              className="text-blue-600 text-sm mt-2 hover:underline cursor-pointer"
                            >
                              {showFullAboutMe ? "Ẩn bớt" : "Đọc thêm"}
                            </div>
                          )}
                        </div>
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

                    {activeTab === 3 && (
                      <div>
                        <h3 className="text-gray-800 font-semibold mb-4">
                          Video giới thiệu
                        </h3>
                        {(teacher.introductionVideoUrl || teacher.videoUrl) ? (
                          <div className="max-w-2xl">
                            <VideoPlayer 
                              videoUrl={teacher.introductionVideoUrl || teacher.videoUrl}
                              width="100%"
                              height="400"
                              title={`Video giới thiệu của ${teacher.name}`}
                            />
                            <p className="text-gray-600 text-sm mt-3">
                              Video này đã được phê duyệt và đang hoạt động
                            </p>
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <div className="mx-auto h-16 w-16 text-gray-400 mb-4">
                              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <h4 className="text-lg font-medium text-gray-900 mb-2">
                              Gia sư này không có video giới thiệu
                            </h4>
                            <p className="text-gray-500 text-sm">
                              Gia sư này chưa tải lên video giới thiệu.
                            </p>
                          </div>
                        )}
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
              {(teacher.introductionVideoUrl || teacher.videoUrl) ? (
                <div className="relative rounded-lg overflow-hidden">
                  <VideoPlayer 
                    videoUrl={teacher.introductionVideoUrl || teacher.videoUrl}
                    width="100%"
                    height="200"
                    title={`Video giới thiệu của ${teacher.name}`}
                  />
                </div>
              ) : (
                <div className="relative rounded-lg overflow-hidden bg-gray-100 h-[200px] flex items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto h-12 w-12 text-gray-400 mb-3">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-600 text-sm font-medium">
                      Gia sư này không có video giới thiệu
                    </p>
                  </div>
                </div>
              )}
              <div className="mt-4">
                <p className="text-gray-800 font-semibold text-sm">
                  {(() => {
                    const lowestLesson = getLowestPricedLesson();
                    return lowestLesson ? lowestLesson.name : "Buổi học thử";
                  })()}
                </p>
                <p className="text-red-500 font-bold text-lg">
                  {(() => {
                    const lowestLesson = getLowestPricedLesson();
                    if (lowestLesson) {
                      // Show the actual lesson price, not 50%
                      const lessonPrice = formatPriceWithCommas(parseFloat(lowestLesson.price));
                      return `${lessonPrice} VNĐ / 30 phút / 1 slot`;
                    } else {
                      // Fallback to teacher's default price if no lessons available
                      const fallbackPrice = formatPriceWithCommas(parseFloat(teacher.price || 0));
                      return `${fallbackPrice} VNĐ / 30 phút / 1 slot`;
                    }
                  })()}
                </p>
                <button
                  onClick={handleBookLesson}
                  disabled={loadingBookingConfig || (bookingConfig && !bookingConfig.allowInstantBooking)}
                  className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 transition mt-3 ${
                    loadingBookingConfig || (bookingConfig && !bookingConfig.allowInstantBooking)
                      ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                      : "bg-red-500 text-white hover:bg-red-600"
                  }`}
                >
                  {loadingBookingConfig 
                    ? "Đang tải..." 
                    : bookingConfig && !bookingConfig.allowInstantBooking 
                      ? "Đặt buổi học" 
                      : "Đặt buổi học"
                  }
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
        {/* Overall Rating */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          {loadingRating ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-16 mx-auto mb-2"></div>
              <div className="flex justify-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-4 h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
              <div className="h-4 bg-gray-200 rounded w-24 mx-auto"></div>
            </div>
          ) : (
            <>
              <p className="text-2xl font-bold text-gray-800">
                {tutorRating && tutorRating.averageTeachingQuality !== undefined
                  ? ((tutorRating.averageTeachingQuality + tutorRating.averageAttitude + tutorRating.averageCommitment) / 3).toFixed(1)
                  : teacher.rating !== undefined && teacher.rating !== null
                  ? teacher.rating.toFixed(1)
                  : "chưa có"}
              </p>
              <div className="flex justify-center gap-1 mt-1">
                {[...Array(5)].map((_, i) => {
                  const overallRating = tutorRating 
                    ? (tutorRating.averageTeachingQuality + tutorRating.averageAttitude + tutorRating.averageCommitment) / 3
                    : teacher.rating;
                  return (
                    <FaStar
                      key={i}
                      className={
                        overallRating && i < Math.round(overallRating)
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }
                    />
                  );
                })}
              </div>
              <p className="text-gray-600 mt-2">Đánh giá tổng quan</p>
              {tutorRating && tutorReviews.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">({tutorReviews.length} đánh giá)</p>
              )}
            </>
          )}
        </div>
        
        {/* Teaching Quality Rating */}
        <DetailedRatingDisplay
          rating={tutorRating?.averageTeachingQuality}
          label="Chất lượng giảng dạy"
          icon={<FaBook className="text-blue-500 w-5 h-5" />}
          loading={loadingRating}
        />
        
        {/* Attitude Rating */}
        <DetailedRatingDisplay
          rating={tutorRating?.averageAttitude}
          label="Thái độ"
          icon={<FaUsers className="text-green-500 w-5 h-5" />}
          loading={loadingRating}
        />
        
        {/* Commitment Rating */}
        <DetailedRatingDisplay
          rating={tutorRating?.averageCommitment}
          label="Cam kết"
          icon={<FaClock className="text-purple-500 w-5 h-5" />}
          loading={loadingRating}
        />
      </div>

      {/* Additional Statistics */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <p className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
            <FaUsers className="text-blue-500" /> {teacher.students || 0}
          </p>
          <p className="text-gray-600 mt-2">Học viên</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <p className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
            <FaBook className="text-blue-500" /> {lessons.length || 0}
          </p>
          <p className="text-gray-600 mt-2">Khóa học</p>
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
        <h2 className="text-2xl font-semibold text-gray-800">Khóa học</h2>
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
                    {typeof lesson.price === "number" ||
                    typeof lesson.price === "string"
                      ? formatPriceWithCommas(lesson.price)
                      : "Không có"}{" "}
                    VNĐ
                  </span>
                  <span className="text-gray-500 text-sm mt-1">
                    30 phút / 1 slot
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
        <div className="flex flex-row items-center gap-2">
          <h2 className="text-2xl font-semibold text-gray-800">
            Lịch trình khả dụng
          </h2>
          <p className="text-black">Bắt đầu từ tuần tiếp theo</p>
        </div>
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
                {availabilityDays.map((day, dayIndex) => {
                  const isAvailable = isTimeSlotAvailable(timeRange, dayIndex);

                  return (
                    <div
                      key={`${timeRange}-${day}`}
                      className={`h-12 border border-gray-200 last:border-b-0 ${
                        isAvailable
                          ? "bg-[#98D45F] hover:bg-[#7FC241]"
                          : "bg-gray-100"
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
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mt-4 gap-2">
          {/* Legend */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1">
              <span
                style={{
                  display: "inline-block",
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: "#98D45F",
                  marginRight: 6,
                }}
              />
              <span className="text-sm text-gray-700 font-medium">Có sẵn</span>
            </div>
            <div className="flex items-center gap-1">
              <span
                style={{
                  display: "inline-block",
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: "#e2e8f0",
                  marginRight: 6,
                }}
              />
              <span className="text-sm text-gray-700 font-medium">
                Không có sẵn
              </span>
            </div>
          </div>
          {/* Timezone and button */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              Dựa trên múi giờ của bạn (UTC+07:00)
            </span>
            <button
              onClick={handleViewScheduleDetails}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
            >
              Chi tiết lịch trình
            </button>
          </div>
        </div>
      </div>

      <ReviewsSection teacher={teacher} tutorReviews={tutorReviews} />

      <div className="mt-10">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Gia sư được đề xuất
        </h2>
        {tutors.length > 0 ? (
          <Slider {...sliderSettings}>
            {tutors.map((tutor) => (
              <div key={tutor.tutorId} className="px-3">
                <RecommendTutorCard
                  tutor={{
                    tutorId: tutor.tutorId,
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
                    profileImageUrl: tutor.profileImageUrl,
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
        onBookNow={handleBookNowFromLesson}
        bookingConfig={bookingConfig}
        loadingBookingConfig={loadingBookingConfig}
      />

      <TutorWeeklyPatternDetailModal
        open={isPatternDialogOpen}
        onClose={() => {
          setIsPatternDialogOpen(false);
          setBookingLessonId(null); // reset after close
          setPatternModalMode('readonly'); // Reset to default mode
        }}
        tutorId={teacher.id}
        tutorName={teacher.name} // Pass tutor name
        initialWeekStart={currentWeekStart}
        currentUser={user}
        onBookingSuccess={handleBookingSuccess}
        lessonId={bookingLessonId}
        expectedStartDate={new Date().toISOString()} // Truyền expectedStartDate cho current week và future weeks
        isReadOnly={patternModalMode === 'readonly'} // Add this prop
      />

      {/* Add the new LessonSelectionModal */}
      <LessonSelectionModal
        isOpen={isLessonSelectionModalOpen}
        onClose={() => setIsLessonSelectionModalOpen(false)}
        lessons={lessons}
        onLessonSelect={handleLessonSelect}
        tutorName={teacher?.name}
      />
    </div>
  );
};

export default TutorDetail;
