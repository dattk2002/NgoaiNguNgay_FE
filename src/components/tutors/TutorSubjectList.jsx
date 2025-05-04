import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
// Assuming fetchTutorsBySubject returns data structured similarly to what's needed
import { fetchTutorsBySubject } from "../api/auth";
import {
  FaCheckCircle,
  FaHeart,
  FaAngleDown,
  FaStar,
  FaRegStar,
} from "react-icons/fa"; // Added icons
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton"; // For the heart icon
import Select from "@mui/material/Select"; // Example for Subject dropdown
import MenuItem from "@mui/material/MenuItem"; // Example for Subject dropdown
import TextField from "@mui/material/TextField"; // For search input
import InputAdornment from "@mui/material/InputAdornment";
// import SearchIcon from '@mui/icons-material/Search';

// --- Helper Function for Rendering Stars ---
const renderStars = (rating) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5; // Adjust if you have half-star ratings
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
  const times = ["00-04", "04-08", "08-12", "12-16", "16-20", "20-24"];
  const availability = [];
  days.forEach((day) => {
    times.forEach((time) => {
      availability.push({
        day: day,
        time: time, // Randomly make some slots available for demo
        available: Math.random() > 0.7,
      });
    });
  });
  return availability;
};

const TutorSubjectList = () => {
  const { subject: initialSubject } = useParams();
  const navigate = useNavigate();
  const [subject, setSubject] = useState(initialSubject || "French");
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    instantLesson: false,
    within72Hours: false,
    searchTerm: "", // Add other filter states here as needed
  });
  const [hoveredTutor, setHoveredTutor] = useState(null);
  const [hoverBoxTop, setHoverBoxTop] = useState(0); // State to control the hover box top position
  const hoverTimeout = useRef(null);
  const tutorCardRefs = useRef({}); // Ref to store references to each tutor card
  const hoverBoxRef = useRef(null); // Ref for the hover box // --- Fetch Tutors ---

  useEffect(() => {
    const getTutors = async () => {
      try {
        setLoading(true);
        setError(null); // Assuming fetchTutorsBySubject can handle the subject parameter
        const fetchedTeachers = await fetchTutorsBySubject(subject); // *** Add Mock Data if needed for development/UI building *** // Replace or supplement fetchedTeachers with mock data matching the screenshot structure if your API differs

        const processedTeachers = fetchedTeachers.map((t) => ({
          ...t, // Ensure these fields exist, add mocks if not from API
          id: t.id || Math.random().toString(36).substr(2, 9), // Ensure each tutor has a unique ID
          name: t.name || `Teacher ${processedTeachers.length + 1}`, // Mock name if missing
          avatar: t.avatar || "https://via.placeholder.com/100", // Placeholder avatar
          tag: t.tag || "Professional Teacher",
          nativeLanguage: t.nativeLanguage || "English",
          otherLanguagesCount:
            t.otherLanguagesCount || (t.subjects?.length || 1) - 1,
          rating: t.rating || (Math.random() * 1.5 + 3.5).toFixed(1), // Random rating 3.5-5.0
          lessons: t.lessons || Math.floor(Math.random() * 2000) + 50, // Random lesson count
          description:
            t.description ||
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
          price: t.price || (Math.random() * 50 + 20).toFixed(2), // Random price
          availabilityText:
            t.availabilityText ||
            `Available ${Math.floor(Math.random() * 12) + 1}:00 ${
              Math.random() > 0.5 ? "Today" : "Tomorrow"
            }`,
          videoUrl: t.videoUrl || "https://www.youtube.com/embed/dQw4w9WgXcQ", // Example YouTube video ID
          availabilityGrid: t.availabilityGrid || generateMockAvailability(), // Example availability grid data
          badges:
            t.badges ||
            ["Test Preparation", "Business", "Kids"].slice(
              0,
              Math.floor(Math.random() * 4)
            ), // Example badges
        }));

        if (processedTeachers.length === 0) {
          setError(`No tutors found for ${subject}`);
        } else {
          setTeachers(processedTeachers);
        }
      } catch (error) {
        console.error("Error fetching tutors by subject:", error);
        setError("Failed to load tutors. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    getTutors();
  }, [subject]); // Refetch when subject changes // --- Hover Handlers ---

  const handleMouseEnter = (teacher) => {
    clearTimeout(hoverTimeout.current);
    setHoveredTutor(teacher); // Defer position calculation to allow the hover box to render and get its height

    requestAnimationFrame(() => {
      const tutorCard = tutorCardRefs.current[teacher.id];
      const hoverBox = hoverBoxRef.current;

      if (tutorCard && hoverBox) {
        const cardRect = tutorCard.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const hoverBoxHeight = hoverBox.offsetHeight; // Calculate the potential bottom position of the hover box if positioned at the top of the card relative to its container // The cardRect.top is the position relative to the viewport.

        // We need the position relative to the *relative* parent of the hover box, which is the tutor card's containing div.
        // Since the tutor card div has position: relative and top: 0 relative to itself,
        // the hover box's top position relative to this container is just its distance from the top of the card.
        const potentialBottomInViewport = cardRect.top + hoverBoxHeight; // If the potential bottom is below the viewport height, adjust the top position

        if (potentialBottomInViewport > viewportHeight) {
          // Calculate the new top position to align the bottom of the hover box with the bottom of the card
          const newTopRelativeToCardContainer =
            cardRect.height - hoverBoxHeight; // Ensure the new top position is not negative (doesn't go above the top of the card's container)

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
  }, [hoveredTutor]); // Depend on hoveredTutor to ensure recalculation when a tutor is hovered // --- Filter Change Handler ---

  const handleFilterChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: type === "checkbox" ? checked : value,
    }));
  }; // --- Filtered Teachers (Apply actual filtering logic here) ---

  const filteredTeachers = teachers.filter((teacher) => {
    // Example: Filter by search term (case-insensitive)
    const searchTermLower = filters.searchTerm.toLowerCase();
    const nameMatch = teacher.name.toLowerCase().includes(searchTermLower); // Add more complex matching for course/interests if needed
    const descriptionMatch = teacher.description
      .toLowerCase()
      .includes(searchTermLower);
    const subjectMatch = teacher.subjects?.some((sub) =>
      sub.name.toLowerCase().includes(searchTermLower)
    );

    const searchMatch =
      !searchTermLower || nameMatch || descriptionMatch || subjectMatch; // Add other filter conditions here (e.g., price, availability checkboxes) // const instantLessonMatch = !filters.instantLesson || teacher.offersInstantLesson; // Assuming teacher obj has this // const within72HoursMatch = !filters.within72Hours || teacher.availableWithin72Hours; // Assuming teacher obj has this

    return searchMatch; // && instantLessonMatch && within72HoursMatch;
  }); // --- Loading and Error States ---

  const handleCardClick = (teacherId) => {
    window.open(`/teacher/${teacherId}`, '_blank'); // Open in a new tab
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center items-center min-h-screen text-red-600">
        {error}
      </div>
    ); // --- Main Render ---

  return (
    <div className="w-full pt-12 pb-40 px-4 md:px-8 lg:px-16 bg-gray-100 min-h-screen">
                {/* === Header Section === */}         
      <div className="max-w-8xl mx-auto mb-10">
                   
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                        {/* Left Text */}             
          <div className="md:w-2/3 text-center md:text-left mb-6 md:mb-0">
                           
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
               Find your best <strong className="text-[#333333]">{subject.toUpperCase()}</strong> tutor online                
            </h1>
                           
            <p className="text-gray-600 text-base md:text-lg">
                                Learn {subject} online with italki's
              professional tutors. Our platform connects you with native
              {subject} speakers from around the world, offering personalized
              lessons and courses that cater to your needs and goals.          
                   
            </p>
                         
          </div>
                        {/* Right Illustration (Placeholder) */}             
          <div className="md:w-1/3 flex justify-center md:justify-end">
                           
            {/* Replace with your actual illustration SVG or Image */}         
                 
            <svg
              width="200"
              height="150"
              viewBox="0 0 200 150"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-gray-300"
            >
                                 
              <rect
                x="10"
                y="10"
                width="180"
                height="130"
                rx="8"
                fill="currentColor"
                fillOpacity="0.3"
              />
                                 
              <circle
                cx="60"
                cy="60"
                r="20"
                fill="currentColor"
                fillOpacity="0.5"
              />
                                 
              <rect
                x="90"
                y="40"
                width="80"
                height="15"
                rx="4"
                fill="currentColor"
                fillOpacity="0.5"
              />
                                 
              <rect
                x="90"
                y="65"
                width="60"
                height="10"
                rx="4"
                fill="currentColor"
                fillOpacity="0.4"
              />
                                 
              <rect
                x="50"
                y="95"
                width="100"
                height="25"
                rx="6"
                fill="currentColor"
                fillOpacity="0.6"
              />
                             
            </svg>
                         
          </div>
                     
        </div>
                    {/* Subject Selector & Search */}           
        <div className="flex flex-col md:flex-row justify-end items-center gap-4 mb-8">
                         {/* Basic Subject Dropdown Example */}               
          <Select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            variant="outlined"
            size="small"
            sx={{ minWidth: 150, backgroundColor: "white" }}
          >
                             <MenuItem value="French">French</MenuItem>         
                   <MenuItem value="Spanish">Spanish</MenuItem>                 
            <MenuItem value="German">German</MenuItem>                 
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
                                         {/* <SearchIcon color="action" /> */} 
                                     
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
        <div className="flex flex-col gap-8">
                         {/* Intro Text & Availability Filters */}             
           
          <div className="flex justify-between items-start mb-6">
                                 
            <div>
                                       
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Improve your {subject} language skills with personalized online
                classes
              </h3>
                                       
              <p className="text-gray-600 text-sm">
                                             Our team of experienced {subject}
                teachers provides one-on-one online classes and courses designed
                to help you learn the language in a fun and interactive way.    
                                     
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
                                 
            {filteredTeachers.map((teacher) => (
              <div
                key={teacher.id}
                className="relative flex cursor-pointer" // Keep relative to position the hover box absolutely within it
                onMouseEnter={() => handleMouseEnter(teacher)}
                onMouseLeave={handleMouseLeave}
                onClick={() => handleCardClick(teacher.id)}
                ref={(el) => (tutorCardRefs.current[teacher.id] = el)} // Assign ref to the tutor card
              >
                                         {/* Tutor Card */}                     
                   
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex gap-4 w-[70%] hover:shadow-md transition-shadow duration-200 z-10">
                  
                  {/* Added z-10 to ensure card is above hover box */}         
                                   {/* Left Part: Avatar & Rating */}           
                                 
                  <div className="flex flex-col items-center w-20 flex-shrink-0">
                                                 
                    <img
                      src={teacher.avatar}
                      alt={teacher.name}
                      className="w-16 h-16 rounded-full object-cover mb-2 border border-gray-200"
                    />
                                                 {renderStars(teacher.rating)} 
                                               
                    <span className="text-xs text-gray-500 mt-1">
                                                     {teacher.rating} (
                      {teacher.lessons} Lessons)                              
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
                                                             <FaCheckCircle />
                          {badge} {/* Use appropriate icons */}                 
                                         
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
                         
                    <div className="flex items-center justify-between mt-2">
                                                     
                      <span className="text-gray-800 font-semibold">
                                                         USD
                        {parseFloat(teacher.price).toFixed(2)}
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
                {/* Hover Box (Render conditionally) */}                       
                 
                {hoveredTutor && hoveredTutor.id === teacher.id && (
                  <div
                    ref={hoverBoxRef} // Assign ref to the hover box
                    className="absolute left-[70%] ml-4 w-[400px] bg-white shadow-xl rounded-lg border border-gray-200 z-20" // Position absolutely to the right
                    style={{ top: hoverBoxTop }} // Dynamically set the top position
                    onMouseEnter={handleHoverBoxEnter} // Keep open when mouse enters
                    onMouseLeave={handleHoverBoxLeave} // Close when mouse leaves
                  >
                                                  {/* Video Player */}         
                                       
                    <div className="relative aspect-video mb-4 rounded-t-lg overflow-hidden">
                      
                      {/* Apply rounded-t only */}
                                                     
                      <iframe
                        src={hoveredTutor.videoUrl}
                        title={`${hoveredTutor.name}'s video`}
                        width="100%"
                        height="100%"
                        frameBorder="0"
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
                                                      {/* Placeholder Cells */} 
                                                   
                      {Array.from({ length: 42 }).map((_, index) => {
                        const isAvailable =
                          hoveredTutor.availabilityGrid?.[index]?.available ??
                          false;
                        return (
                          <div
                            key={index}
                            className={`h-6 w-full border rounded ${
                              isAvailable ? "bg-green-500" : "bg-gray-100"
                            }`}
                          ></div>
                        );
                      })}
                                                   
                    </div>
                                                 
                    <div className="text-xs text-gray-500 text-center">
                                                      Based on your timezone:
                      Asia/Bangkok (UTC +07:00) {/* Make this dynamic */}       
                                           
                    </div>
                                                 
                    <a
                      href="#"
                      className="text-blue-600 hover:underline text-sm font-medium flex justify-center items-center pb-3"
                    >
                                                      View full schedule &gt;  
                                                 
                    </a>
                                               
                  </div>
                )}
                {/* End Hover Box */}                       
              </div> // End Relative Wrapper
            ))}
                             
          </div>
          {/* End Tutor List */}           
        </div>
        {/* End Content Layout */}           
        {/* This empty div helps push the tutor list up if the filters take up space */}
                    <div className="w-[400px] ml-4 hidden lg:block"></div>
        {/* Placeholder for hover box width */}         
      </div>
      {/* End Filters & Main Content Area */}       
    </div> // End Main Container
  );
};

export default TutorSubjectList;
