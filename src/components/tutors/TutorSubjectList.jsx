import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom"; // useNavigate is already imported

// Assuming fetchTutorsBySubject returns data structured similarly to what's needed
// Import fetchAllTutor instead
import { fetchAllTutor } from "../api/auth";
import LanguageImage from "../../assets/language_banner.png";
import { formatLanguageCode } from "../../utils/formatLanguageCode";

import { FaAngleDown } from "react-icons/fa";

import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import { IoSearch } from "react-icons/io5";

import TutorCard from "./TutorCard";
import notFoundImg from "../../assets/not_found.gif";

const TutorSubjectList = () => {
  const { subject: initialSubject } = useParams();
  const navigate = useNavigate(); // Get the navigate function

  // Initialize subject state from URL param or default
  const [subject, setSubject] = useState(initialSubject || "French");
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    instantLesson: false,
    within72Hours: false,
    searchTerm: "",
    // Add other filter states here as needed
  });

  const [hoveredTutor, setHoveredTutor] = useState(null);
  // State to control the hover box top position
  const [hoverBoxTop, setHoverBoxTop] = useState(0);

  // Ref to store timeout ID for delayed hover box closing
  const hoverTimeout = useRef(null);
  // Ref to store references to each tutor card for position calculation
  const tutorCardRefs = useRef({});
  // Ref for the hover box element to get its height
  const hoverBoxRef = useRef(null);

  // --- Fetch Tutors ---
  useEffect(() => {
    const getTutors = async () => {
      try {
        setLoading(true);
        setError(null);

        // Call the new fetchAllTutor function
        // fetchAllTutor should now return the array from the 'data' property
        const fetchedTeachersData = await fetchAllTutor();

        // Map the fetched array data to the structure expected by TutorCard
        const processedTeachers = fetchedTeachersData.map((t) => {
          const primaryLanguage = t.languages?.find((lang) => lang.isPrimary);
          const otherLanguagesCount =
            (t.languages?.length || 0) - (primaryLanguage ? 1 : 0);

          const processedTeacher = {
            id: t.tutorId,
            name: t.fullName,
            imageUrl:
              t.profileImageUrl || "https://avatar.iran.liara.run/public",
            rating: t.rating || 0,
            nativeLanguage:
              formatLanguageCode(primaryLanguage?.languageCode) || "N/A",
            otherLanguagesCount: otherLanguagesCount,
            tag: t.isProfessional ? "Professional Teacher" : "",
            isProfessional: t.isProfessional || false,

            // Fields populated from the API response
            lessons: 0, // No direct 'lessons' field in the provided JSON, keeping placeholder
            description: t.description || "No description available.",
            price: "N/A", // No direct 'price' field in the provided JSON, keeping placeholder
            availabilityText: "Availability not specified", // No direct 'availabilityText' field in the provided JSON, keeping placeholder
            videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // No direct 'videoUrl' field in the provided JSON, keeping placeholder
            availabilityGrid: [], // No direct 'availabilityGrid' field in the provided JSON, keeping placeholder
            badges: [], // No direct 'badges' field in the provided JSON, keeping placeholder
          };
          return processedTeacher;
        });

        // Filter by subject AFTER fetching all tutors
        const filteredBySubject = initialSubject
          ? processedTeachers.filter(
              (tutor) =>
                tutor.nativeLanguage.toLowerCase() ===
                initialSubject.toLowerCase()
            )
          : processedTeachers;

        if (filteredBySubject.length === 0) {
          setTeachers([]);
        } else {
          setTeachers(filteredBySubject);
        }
      } catch (error) {
        console.error("Error fetching all tutors in component:", error);
        // The error thrown by fetchAllTutor will be caught here
        setError(
          error.message || "Failed to load tutors. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    getTutors();
  }, [initialSubject, navigate]);

  // --- Hover Handlers ---
  const handleMouseEnter = useCallback((teacher) => {
    clearTimeout(hoverTimeout.current);
    setHoveredTutor(teacher);

    // Defer position calculation to allow the hover box to render and get its height
    requestAnimationFrame(() => {
      const tutorCard = tutorCardRefs.current[teacher.id];
      const hoverBox = hoverBoxRef.current;

      if (tutorCard && hoverBox) {
        const cardRect = tutorCard.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const hoverBoxHeight = hoverBox.offsetHeight;

        // Calculate the potential bottom position of the hover box if positioned at the top of the card
        // relative to its container. The cardRect.top is the position relative to the viewport.
        // We need the position relative to the *relative* parent of the hover box,
        // which is the tutor card's containing div. Since the tutor card div has
        // position: relative and top: 0 relative to itself, the hover box's top position
        // relative to this container is just its distance from the top of the card.
        const potentialBottomInViewport = cardRect.top + hoverBoxHeight;

        // If the potential bottom is below the viewport height, adjust the top position
        if (potentialBottomInViewport > viewportHeight) {
          // Calculate the new top position to align the bottom of the hover box with the bottom of the card
          const newTopRelativeToCardContainer =
            cardRect.height - hoverBoxHeight;
          // Ensure the new top position is not negative (doesn't go above the top of the card's container)
          setHoverBoxTop(Math.max(0, newTopRelativeToCardContainer));
        } else {
          // Otherwise, position it at the top of the card (relative to the card container's top)
          setHoverBoxTop(0);
        }
      }
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    hoverTimeout.current = setTimeout(() => {
      setHoveredTutor(null);
      setHoverBoxTop(0); // Reset top position when hidden
    }, 300); // Slightly longer delay to allow moving cursor to hover box
  }, []);

  const handleHoverBoxEnter = useCallback(() => {
    clearTimeout(hoverTimeout.current);
  }, []);

  const handleHoverBoxLeave = useCallback(() => {
    hoverTimeout.current = setTimeout(() => {
      setHoveredTutor(null);
      setHoverBoxTop(0); // Reset top position when hidden
    }, 200);
  }, []);

  // Recalculate position if window resizes or scrolled
  useEffect(() => {
    const handleResizeOrScroll = () => {
      if (
        hoveredTutor &&
        tutorCardRefs.current[hoveredTutor.id] &&
        hoverBoxRef.current
      ) {
        const tutorCard = tutorCardRefs.current[hoveredTutor.id];
        const hoverBox = hoverBoxRef.current;
        const cardRect = tutorCard.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const hoverBoxHeight = hoverBox.offsetHeight;

        const potentialBottomInViewport = cardRect.top + hoverBoxHeight;

        if (potentialBottomInViewport > viewportHeight) {
          const newTopRelativeToCardContainer =
            cardRect.height - hoverBoxHeight;
          setHoverBoxTop(Math.max(0, newTopRelativeToCardContainer));
        } else {
          setHoverBoxTop(0);
        }
      }
    };

    window.addEventListener("resize", handleResizeOrScroll);
    window.addEventListener("scroll", handleResizeOrScroll);

    return () => {
      window.removeEventListener("resize", handleResizeOrScroll);
      window.removeEventListener("scroll", handleResizeOrScroll);
    };
  }, [hoveredTutor]); // Depend on hoveredTutor to ensure recalculation when a tutor is hovered

  // --- Filter Change Handler ---
  const handleFilterChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // --- Handle Subject Change and Navigation ---
  const handleSubjectChange = (event) => {
    const newSubject = event.target.value.toLowerCase();
    setSubject(newSubject);
    navigate(`/tutor/${newSubject}`); // Navigate to the new subject route
  };

  // --- Filtered Teachers (Apply actual filtering logic here) ---
  const filteredTeachers = teachers.filter((teacher) => {
    // Example: Filter by search term (case-insensitive)
    const searchTermLower = filters.searchTerm.toLowerCase();
    const nameMatch = teacher.name.toLowerCase().includes(searchTermLower);

    // Add more complex matching for course/interests if needed
    const descriptionMatch = teacher.description
      .toLowerCase()
      .includes(searchTermLower);
    // Ensure teacher.subjects is an array before using some
    const subjectMatch = Array.isArray(teacher.subjects)
      ? teacher.subjects.some((sub) =>
          sub.name.toLowerCase().includes(searchTermLower)
        )
      : false;

    const searchMatch =
      !searchTermLower || nameMatch || descriptionMatch || subjectMatch;

    // Add other filter conditions here (e.g., price, availability checkboxes)
    // const instantLessonMatch = !filters.instantLesson || teacher.offersInstantLesson; // Assuming teacher obj has this
    // const within72HoursMatch = !filters.within72Hours || teacher.availableWithin72Hours; // Assuming teacher obj has this

    // Combine all filter conditions
    return searchMatch;
    /* && instantLessonMatch && within72HoursMatch */
  });

  // --- Loading and Error States ---
  const handleCardClick = useCallback((id) => {
    window.open(`/teacher/${id}`, "_blank");
  }, []);

  if (loading) {
    return (
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
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-600">
        {error}
      </div>
    );
  }

  // --- Main Render ---
  return (
    <div className="w-full pt-12 pb-40 px-2 md:px-4 lg:px-16 bg-gray-100 min-h-screen">
      {/* === Header Section === */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          {/* Left Text */}
          <div className="md:w-2/3 text-center md:text-left mb-6 md:mb-0">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
              Tìm gia sư{" "}
              <strong className="text-[#333333]">
                {formatLanguageCode(subject).toUpperCase()}
              </strong>{" "}
              tốt nhất trực tuyến
            </h1>
            <p className="text-gray-600 text-base md:text-lg">
              Học {subject} trực tuyến với các gia sư chuyên nghiệp của
              NgoaiNguNgay. Nền tảng của chúng tôi kết nối bạn với những người
              bản xứ nói tiếng {subject} từ khắp nơi trên thế giới, cung cấp các
              bài học và khóa học cá nhân hóa phục vụ nhu cầu và mục tiêu của
              bạn.
            </p>
          </div>
          {/* Right Illustration (Placeholder) */}
          <div className="md:w-1/3 flex justify-center md:justify-end">
            {/* Replace with your actual illustration SVG or Image */}
            <img src={LanguageImage} alt="language_banner" />
          </div>
        </div>

        {/* Subject Selector & Search */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          {/* Basic Subject Dropdown Example */}
          <Select
            value={subject}
            onChange={handleSubjectChange} // Use the new handler
            variant="outlined"
            size="small"
            renderValue={() => {
              return (
                <em className="not-italic">
                  {subject.charAt(0).toUpperCase() + subject.slice(1)}
                </em>
              );
            }}
            sx={{ minWidth: 150, backgroundColor: "white" }}
          >
            <MenuItem value="Vietnamese">Tiếng Việt</MenuItem>
            <MenuItem value="Chinese">Tiếng Trung</MenuItem>
            <MenuItem value="French">Tiếng Pháp</MenuItem>
            <MenuItem value="English">Tiếng Anh</MenuItem>
            <MenuItem value="Italian">Tiếng Ý</MenuItem>
            <MenuItem value="Japanese">Tiếng Nhật</MenuItem>
            <MenuItem value="Spanish">Tiếng Tây Ban Nha</MenuItem>
            <MenuItem value="Korean">Tiếng Hàn</MenuItem>
            <MenuItem value="Russian">Tiếng Nga</MenuItem>
            <MenuItem value="Portuguese">Tiếng Bồ Đào Nha</MenuItem>
            {/* Add other subjects */}
          </Select>
          <TextField
            name="searchTerm"
            placeholder="Tên/Khóa học/Sở thích"
            variant="outlined"
            size="small"
            value={filters.searchTerm}
            onChange={handleFilterChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IoSearch />
                </InputAdornment>
              ),
            }}
            sx={{ backgroundColor: "white", width: "100%", maxWidth: "300px" }}
          />
        </div>
      </div>

      {/* === Filters & Main Content Area === */}
      <div className="max-w-7xl mx-auto relative">
        {/* Keep relative for positioning tutor list */}
        {/* Filter Buttons Row */}
        <div className="flex flex-wrap gap-3 mb-6 pb-4 border-b border-gray-200">
          {/* Example Filter Buttons - Replace with actual filter components (e.g., Menus, Popovers) */}
          <Button
            variant="outlined"
            size="small"
            endIcon={<FaAngleDown />}
            sx={{
              textTransform: "none",
              color: "text.secondary",
              borderColor: "grey.400",
            }}
          >
            Danh mục bài học
          </Button>
          <Button
            variant="outlined"
            size="small"
            endIcon={<FaAngleDown />}
            sx={{
              textTransform: "none",
              color: "text.secondary",
              borderColor: "grey.400",
            }}
          >
            Giá cả
          </Button>
          <Button
            variant="outlined"
            size="small"
            endIcon={<FaAngleDown />}
            sx={{
              textTransform: "none",
              color: "text.secondary",
              borderColor: "grey.400",
            }}
          >
            Thời gian học
          </Button>
          <Button
            variant="outlined"
            size="small"
            endIcon={<FaAngleDown />}
            sx={{
              textTransform: "none",
              color: "text.secondary",
              borderColor: "grey.400",
            }}
          >
            Nói ngôn ngữ
          </Button>
          <Button
            variant="outlined"
            size="small"
            endIcon={<FaAngleDown />}
            sx={{
              textTransform: "none",
              color: "text.secondary",
              borderColor: "grey.400",
            }}
          >
            Giáo viên đến từ
          </Button>
          <Button
            variant="outlined"
            size="small"
            endIcon={<FaAngleDown />}
            sx={{
              textTransform: "none",
              color: "text.secondary",
              borderColor: "grey.400",
            }}
          >
            Thêm
          </Button>
        </div>

        {/* Content Layout: Tutor List primarily */}
        <div className="flex flex-col gap-8">
          {/* Intro Text & Availability Filters */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Cải thiện kỹ năng tiếng {subject} của bạn với các lớp học trực
                tuyến cá nhân hóa
              </h3>
              <p className="text-gray-600 text-sm">
                Đội ngũ giáo viên tiếng {subject} giàu kinh nghiệm của chúng tôi
                cung cấp các lớp học và khóa học trực tuyến một kèm một được
                thiết kế để giúp bạn học ngôn ngữ một cách thú vị và tương tác.
              </p>
            </div>
            <div className="flex flex-col gap-2 pl-4 flex-shrink-0">
              <label className="flex items-center gap-2 text-sm text-black whitespace-nowrap">
                <input
                  type="checkbox"
                  name="instantLesson"
                  checked={filters.instantLesson}
                  onChange={handleFilterChange}
                  className="form-checkbox h-4 w-4 text-blue-600"
                />
                Bài học tức thì
              </label>
              <label className="flex items-center gap-2 text-sm text-black whitespace-nowrap">
                <input
                  type="checkbox"
                  name="within72Hours"
                  checked={filters.within72Hours}
                  onChange={handleFilterChange}
                  className="form-checkbox h-4 w-4 text-blue-600"
                />
                Trong vòng 72 giờ
              </label>
            </div>
          </div>

          {/* Tutor List */}
          <div className="flex flex-col gap-6">
            {filteredTeachers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10">
                <img src={notFoundImg} alt="No tutors found" className="max-h-64 mb-4" />
                <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                  Rất tiếc! Không tìm thấy gia sư nào cho ngôn ngữ này.
                </h3>
                <p className="text-gray-600 text-base">
                  Hãy thử tìm kiếm với các tiêu chí khác hoặc kiểm tra lại sau.
                </p>
              </div>
            ) : (
              filteredTeachers.map((teacher) => (
                <TutorCard
                  key={teacher.id}
                  teacher={teacher}
                  hoveredTutor={hoveredTutor}
                  handleMouseEnter={handleMouseEnter}
                  handleMouseLeave={handleMouseLeave}
                  handleCardClick={handleCardClick}
                  hoverBoxTop={hoverBoxTop}
                  tutorCardRef={(el) => (tutorCardRefs.current[teacher.id] = el)}
                  hoverBoxRef={hoverBoxRef}
                  handleHoverBoxEnter={handleHoverBoxEnter}
                  handleHoverBoxLeave={handleHoverBoxLeave}
                />
              ))
            )}
            {/* End Tutor List */}
          </div>
          {/* End Content Layout */}
        </div>
        {/* End Filters & Main Content Area */}
      </div>
    </div>
  );
};

export default TutorSubjectList;
