import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom"; // useNavigate is already imported

// Assuming fetchTutorsBySubject returns data structured similarly to what's needed
import { fetchTutorList } from "../api/auth";
import LanguageImage from "../../assets/language_banner.png"

import {
  FaCheckCircle,
  FaHeart,
  FaAngleDown,
  FaStar,
  FaRegStar,
} from "react-icons/fa";

import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import { IoSearch } from "react-icons/io5";
import CircularProgress from "@mui/material/CircularProgress";

// --- Helper Function for Rendering Stars ---
const renderStars = (rating) => {
  const fullStars = Math.floor(rating);
  // Adjust if you have half-star ratings, currently assumes whole stars for half logic
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <div className="flex text-yellow-500">
      {[...Array(fullStars)].map((_, i) => (
        <FaStar key={`full-${i}`} />
      ))}
      {/* Add half star logic if needed: {halfStar && <FaStarHalfAlt key="half" />} */}
      {[...Array(emptyStars)].map((_, i) => (
        <FaRegStar key={`empty-${i}`} />
      ))}
    </div>
  );
};

// --- Mock Availability Data Structure (Adjust based on your actual data) ---
const generateMockAvailability = () => {
  const days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  // Using military time ranges for clarity
  const times = ["00-04", "04-08", "08-12", "12-16", "16-20", "20-24"];
  const availability = [];
  days.forEach((day) => {
    times.forEach((time) => {
      availability.push({
        day: day,
        time: time,
        // Randomly make some slots available for demo
        available: Math.random() > 0.7,
      });
    });
  });
  return availability;
};

const TutorSubjectList = () => {
  const { subject: initialSubject } = useParams();
  const navigate = useNavigate(); // Get the navigate function

  // Initialize subject state from URL param or default
  const [subject, setSubject] = useState(initialSubject || "French");
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOption, setSortOption] = useState("default"); // New state for sorting
  const [filters, setFilters] = useState({
    instantLesson: false,
    within72Hours: false,
    searchTerm: "",
    // Add other filter states here as needed
  });

  console.log();

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

        // Use the new fetchTutorList function
        const fetchedTeachersData = await fetchTutorList();
        // The API returns an object with a 'data' property which is the array of tutors
        const fetchedTeachers = fetchedTeachersData; // Directly use the data if it's already an array


        // *** Adapt to the new API structure ***
        const processedTeachers = fetchedTeachers.map((t) => ({
          // Map fields from the new API response
          id: t.tutorId, // Changed from t.id
          name: t.fullName, // Changed from t.name
          imageUrl: t.profileImageUrl || "https://avatar.iran.liara.run/public", // Use profileImageUrl
          tag: t.isProfessional ? "Professional Teacher" : "Community Tutor", // Example based on isProfessional
          // nativeLanguage: findPrimaryLanguage(t.languages), // Helper function needed or simplify
          nativeLanguage: t.languages?.find(lang => lang.isPrimary)?.languageCode?.toUpperCase() || "N/A",
          
          
          otherLanguagesCount: t.languages?.filter(lang => !lang.isPrimary).length || 0,
          rating: t.rating || (Math.random() * 1.5 + 3.5).toFixed(1), // Keep if not in API

          // Fields that might still need mock data or be adjusted
          lessons: t.lessons || Math.floor(Math.random() * 2000) + 50,
          description:
            t.description || // Assuming description is not in the new API
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
          price: t.price || (Math.random() * 50 + 20).toFixed(2), // Assuming price is not in the new API
          availabilityText:
            t.availabilityText ||
            `Available ${Math.floor(Math.random() * 12) + 1}:00 ${
              Math.random() > 0.5 ? "Today" : "Tomorrow"
            }`,
          videoUrl: t.videoUrl || "https://www.youtube.com/embed/dQw4w9WgXcQ", // Assuming videoUrl is not in new API
          availabilityGrid: t.availabilityGrid || generateMockAvailability(),
          badges:
            t.badges ||
            ["Test Preparation", "Business", "Kids"].slice(
              0,
              Math.floor(Math.random() * 4)
            ),
          languages: t.languages, // Add the original languages array
        }));

        

        if (processedTeachers.length === 0) {
          // setError(`No tutors found for ${subject}`); // Subject might not be relevant anymore for the initial fetch
          setError(`No tutors found.`);
        } else {
          setTeachers(processedTeachers);
        }
      } catch (error) {
        console.error("Error fetching tutors:", error); // Generic error message
        setError("Failed to load tutors. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    getTutors();
  }, []); // Removed subject from dependency array as fetchTutorList doesn't take subject

  // --- Hover Handlers ---
  const handleMouseEnter = (teacher) => {
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
  };

  const handleMouseLeave = () => {
    hoverTimeout.current = setTimeout(() => {
      setHoveredTutor(null);
      setHoverBoxTop(0); // Reset top position when hidden
    }, 300); // Slightly longer delay to allow moving cursor to hover box
  };

  const handleHoverBoxEnter = () => {
    clearTimeout(hoverTimeout.current);
  };

  const handleHoverBoxLeave = () => {
    hoverTimeout.current = setTimeout(() => {
      setHoveredTutor(null);
      setHoverBoxTop(0); // Reset top position when hidden
    }, 200);
  };

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

  // --- Handle Sort Change ---
  const handleSortChange = (event) => {
    setSortOption(event.target.value);
  };

  // --- Sorted and Filtered Teachers ---
  const sortedAndFilteredTeachers = teachers
    .slice() // Create a shallow copy to avoid mutating the original array
    .sort((a, b) => {
      if (sortOption === "nativeLanguageAsc") {
        return (a.nativeLanguage || "").localeCompare(b.nativeLanguage || "");
      }
      if (sortOption === "nativeLanguageDesc") {
        return (b.nativeLanguage || "").localeCompare(a.nativeLanguage || "");
      }
      if (sortOption === "subjectPrimary") { // Handle the new sort option
        const subjectLower = subject.toLowerCase();
        // Check if the subject is primary for tutor 'a'
        const aIsSubjectPrimary = a.languages?.some(lang =>
          lang.languageCode?.toLowerCase() === subjectLower && lang.isPrimary
        );
        // Check if the subject is primary for tutor 'b'
        const bIsSubjectPrimary = b.languages?.some(lang =>
          lang.languageCode?.toLowerCase() === subjectLower && lang.isPrimary
        );

        // Sort: primary tutors first (true before false)
        if (aIsSubjectPrimary !== bIsSubjectPrimary) {
          return bIsSubjectPrimary - aIsSubjectPrimary; // True (1) comes before False (0)
        }

        // If primary status is the same, sort alphabetically by name (optional, but good fallback)
        return a.name.localeCompare(b.name);
      }
      return 0; // Default: no sorting or original order
    })
    .filter((teacher) => {
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
  const handleCardClick = (id) => {
    // Open in a new tab - consider using React Router Link or navigate for internal app navigation
    window.open(`/teacher/${id}`, "_blank");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <CircularProgress sx={{ color: '#000' }} />
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
    <div className="w-full pt-12 pb-40 px-4 md:px-8 lg:px-16 bg-gray-100 min-h-screen">
      {/* === Header Section === */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          {/* Left Text */}
          <div className="md:w-2/3 text-center md:text-left mb-6 md:mb-0">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
              Find your best{" "}
              <strong className="text-[#333333]">
                {subject.toUpperCase()}
              </strong>{" "}
              tutor online
            </h1>
            <p className="text-gray-600 text-base md:text-lg">
              Learn {subject} online with italki's professional tutors. Our
              platform connects you with native {subject} speakers from around
              the world, offering personalized lessons and courses that cater to
              your needs and goals.
            </p>
          </div>
          {/* Right Illustration (Placeholder) */}
          <div className="md:w-1/3 flex justify-center md:justify-end">
            {/* Replace with your actual illustration SVG or Image */}
            <img src={LanguageImage} alt="language_banner"/>
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
                <em className="not-italic">{subject.charAt(0).toUpperCase() + subject.slice(1)}</em>
              );
            }}
            sx={{ minWidth: 150, backgroundColor: "white" }}
          >
            <MenuItem value="Vietnamese">Vietnamese</MenuItem>
            <MenuItem value="Chinese">Chinese</MenuItem>
            <MenuItem value="French">French</MenuItem>
            <MenuItem value="English">English</MenuItem>
            <MenuItem value="Italian">Italian</MenuItem>
            <MenuItem value="Japanese">Japanese</MenuItem>
            <MenuItem value="Spanish">Spanish</MenuItem>
            <MenuItem value="Korean">Korean</MenuItem>
            <MenuItem value="Russian">Russian</MenuItem>
            <MenuItem value="Portuguese">Portuguese</MenuItem>
            {/* Add other subjects */}
          </Select>
          <TextField
            name="searchTerm"
            placeholder="Name/Course/Interests"
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
            // Make search input take full width on small screens, constrained on larger
            sx={{ backgroundColor: "white", width: "100%", maxWidth: { xs: "100%", md: "300px" } }}
          />
          {/* Sort Dropdown */}
          <Select
            value={sortOption}
            onChange={handleSortChange}
            variant="outlined"
            size="small"
            displayEmpty
            renderValue={(value) => {
              if (value === "default") {
                return <em className="not-italic">Sort by...</em>;
              }
              if (value === "nativeLanguageAsc") {
                return "Native Language (A-Z)";
              }
              if (value === "nativeLanguageDesc") {
                return "Native Language (Z-A)";
              }
              if (value === "subjectPrimary") { // New sort option display text
                return `${subject.charAt(0).toUpperCase() + subject.slice(1)} (Primary First)`;
              }
              return value;
            }}
            sx={{ minWidth: 180, backgroundColor: "white" }}
          >
            <MenuItem value="default">
              <em>Default</em>
            </MenuItem>
            <MenuItem value="nativeLanguageAsc">Native Language (A-Z)</MenuItem>
            <MenuItem value="nativeLanguageDesc">Native Language (Z-A)</MenuItem>
            <MenuItem value="subjectPrimary">{subject.charAt(0).toUpperCase() + subject.slice(1)} (Primary First)</MenuItem> {/* New sort option */}
            {/* Add other sort options here */}
          </Select>
        </div>
      </div>

      {/* === Filters & Main Content Area === */}
      {/* Adjusted main layout to potentially have tutor list and hover area side-by-side on medium+ screens */}
      <div className="max-w-7xl mx-auto relative flex flex-col md:flex-row gap-8">
        {/* Keep relative for positioning tutor list */}
        {/* Filter Buttons Row - kept within the original flow, maybe move to a sidebar on large screens later if needed */}
        <div className="flex flex-wrap gap-3 mb-6 pb-4 border-b border-gray-200 md:hidden"> {/* Hide filter buttons row on md+ */}
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
            Lesson Category
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
            Price
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
            Lesson time
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
            Speaks
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
            Teachers from
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
            More
          </Button>
        </div>

        {/* Content Layout: Tutor List primarily */}
        {/* Made the tutor list container take full width on small screens */}
        <div className="flex flex-col gap-6 flex-1"> {/* flex-1 allows it to grow in the row layout */}
          {/* Intro Text & Availability Filters */}
          {/* Stack intro text and filters vertically on small screens */}
          <div className="flex flex-col md:flex-row justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Improve your {subject} language skills with personalized online
                classes
              </h3>
              <p className="text-gray-600 text-sm">
                Our team of experienced {subject} teachers provides one-on-one
                online classes and courses designed to help you learn the
                language in a fun and interactive way.
              </p>
            </div>
            <div className="flex flex-col gap-2 md:pl-4 flex-shrink-0 mt-4 md:mt-0"> {/* Added margin top on small screens */}
              <label className="flex items-center gap-2 text-sm text-black whitespace-nowrap">
                <input
                  type="checkbox"
                  name="instantLesson"
                  checked={filters.instantLesson}
                  onChange={handleFilterChange}
                  className="form-checkbox h-4 w-4 text-blue-600"
                />
                Instant Lesson
              </label>
              <label className="flex items-center gap-2 text-sm text-black whitespace-nowrap">
                <input
                  type="checkbox"
                  name="within72Hours"
                  checked={filters.within72Hours}
                  onChange={handleFilterChange}
                  className="form-checkbox h-4 w-4 text-blue-600"
                />
                Within 72 hours
              </label>
            </div>
          </div>

          {/* Tutor List */}
          <div className="flex flex-col gap-6">
            {sortedAndFilteredTeachers.map((teacher) => (
              <div
                key={teacher.id}
                // Adjusted width to be full on small, md:w-[80%] on medium and up
                className="relative flex cursor-pointer w-full md:w-[100%]"
                // Disable hover effects on small screens
                onMouseEnter={window.innerWidth >= 768 ? () => handleMouseEnter(teacher) : null}
                onMouseLeave={window.innerWidth >= 768 ? handleMouseLeave : null}
                onClick={() => handleCardClick(teacher.id)}
                // Assign ref to the tutor card element
                ref={(el) => (tutorCardRefs.current[teacher.id] = el)}
              >
                {/* Tutor Card */}
                {/* Added z-10 to ensure card is above hover box */}
                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex gap-4 w-full hover:shadow-md transition-shadow duration-200 z-10 lg:max-w-screen-lg"> {/* Made the inner card full width */}
                  {/* Left Part: Avatar & Rating */}
                  <div className="flex flex-col items-center w-20 flex-shrink-0">
                    <img
                      src={teacher.imageUrl}
                      alt={teacher.name}
                      className="w-16 h-16 rounded-full object-cover mb-2 border border-gray-200"
                    />
                    {renderStars(teacher.rating)}
                    <span className="text-xs text-gray-500 mt-1 text-center"> {/* Added text-center for small screens */}
                      {teacher.rating} ({teacher.lessons} Lessons)
                    </span>
                  </div>
                  {/* Right Part: Details */}
                  <div className="flex-1">
                    {/* Name & Badges */}
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h2 className="text-lg font-semibold text-gray-800">
                        {teacher.name}
                      </h2>
                      <span className="flex items-center gap-1 text-xs font-medium bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                        <FaCheckCircle />
                        {teacher.tag}
                      </span>
                      {/* Render other badges/tags */}
                      {teacher.badges?.map((badge) => (
                        <span
                          key={badge}
                          className="flex items-center gap-1 text-xs font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full"
                        >
                          <FaCheckCircle /> {/* Use appropriate icons */}
                          {badge}
                        </span>
                      ))}
                    </div>
                    {/* Speaks */}
                    <div className="text-sm text-gray-600 mb-2">
                      <span className="font-medium mr-2">SPEAKS:</span>
                      <span className="text-gray-800 font-semibold">
                        {teacher.nativeLanguage}
                      </span>
                      <span className="ml-1 inline-block bg-gray-200 text-gray-700 text-xs font-medium px-1.5 py-0.5 rounded">
                        Native
                      </span>
                      {teacher.otherLanguagesCount > 0 && (
                        <span className="text-gray-500 ml-2">
                          +{teacher.otherLanguagesCount}
                        </span>
                      )}
                    </div>
                    {/* Description */}
                    <p className="text-gray-700 text-sm mb-3 line-clamp-2">
                      {/* Limit description lines */}
                      {teacher.description}
                    </p>
                    {/* Price, Availability & Actions */}
                    {/* Adjusted layout for smaller screens */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-2 gap-3 sm:gap-1"> {/* Added flex-col on small, gap */}
                      <span className="text-gray-800 font-semibold">
                        USD {parseFloat(teacher.price).toFixed(2)}
                        <span className="text-gray-500 font-normal text-sm">
                          / trial
                        </span>
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
                          Book trial
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                {/* End Tutor Card */}

                {/* Hover Box (Render conditionally and positioned differently) */}
                {/* Show only on medium screens and up */}
                {hoveredTutor && hoveredTutor.id === teacher.id && window.innerWidth >= 768 && (
                  <div
                    ref={hoverBoxRef} // Assign ref to the hover box
                    // Position absolutely to the right, adjusted width
                    className="absolute left-[100%] ml-4 w-[300px] lg:w-[400px] bg-white shadow-xl rounded-2xl border border-gray-200 z-20"
                    // Dynamically set the top position
                    style={{ top: hoverBoxTop }}
                    onMouseEnter={handleHoverBoxEnter} // Keep open when mouse enters
                    onMouseLeave={handleHoverBoxLeave} // Close when mouse leaves
                  >
                    {/* Video Player */}
                    {/* Apply rounded-t only */}
                    <div className="relative aspect-video mb-4 rounded-t-lg overflow-hidden">
                      <iframe
                        src={hoveredTutor.videoUrl}
                        title={`${hoveredTutor.name}'s video`}
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
                      {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                        <div
                          key={day}
                          className="text-xs font-medium text-gray-500"
                        >
                          {day}
                        </div>
                      ))}
                      {/* Placeholder Cells for the 6 time slots per day */}
                      {Array.from({ length: 42 }).map((_, index) => {
                        // Map the index to the correct availability item
                        const availabilityItem =
                          hoveredTutor.availabilityGrid?.[index];
                        const isAvailable =
                          availabilityItem?.available ?? false;

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
                    {/* Action Buttons in Hover Box */}
                  </div>
                )}
                {/* End Hover Box */}
              </div>
            ))}
            {/* End Tutor List */}
          </div>
          {/* End Content Layout */}
        </div>
         {/* Added a placeholder/area for the hover box on larger screens */}
         {/* This div will occupy the remaining space in the flex row */}
         {/* and the absolutely positioned hover box will visually appear here. */}
         {/* Its size and positioning are controlled by the hover box div itself. */}
         {/* Adjusted width to match the remaining space */}
         <div className="hidden md:block md:w-[20%] lg:w-[400px] flex-shrink-0 relative">
             {/* This div doesn't need content, it's just for layout */}
             {/* The absolutely positioned hover box appears relative to its parent, */}
             {/* which is the main 'max-w-7xl mx-auto relative flex flex-col md:flex-row gap-8' div. */}
             {/* However, positioning it relative to the card and then visually aligning it */}
             {/* in this right-hand space is complex. A simpler approach is to let the */}
             {/* absolute positioning work relative to the main container and ensure */}
             {/* there's space for it. */}
         </div>
      </div>
    </div>
  );
};

export default TutorSubjectList;