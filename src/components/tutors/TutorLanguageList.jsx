import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom"; // useNavigate is already imported

// Assuming fetchTutorsBySubject returns data structured similarly to what's needed
// Import fetchAllTutor instead
import { fetchAllTutor, fetchTutorLesson } from "../api/auth";
import LanguageImage from "../../assets/language_banner.png";
import { formatLanguageCode } from "../../utils/formatLanguageCode";
import { languageList } from "../../utils/languageList";

import { FaAngleDown } from "react-icons/fa";
import {
  FaTag,
  FaDollarSign,
  FaClock,
  FaComments,
  FaCheckCircle,
} from "react-icons/fa";

import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import { IoSearch } from "react-icons/io5";
import Slider from "@mui/material/Slider";
import CircularProgress from "@mui/material/CircularProgress";
import TutorCard from "./TutorCard";
import notFoundImg from "../../assets/not_found.gif";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import Pagination from "@mui/material/Pagination";
import Skeleton from "@mui/material/Skeleton";


function FilterButton({ icon, label, menuItems, isActive = false }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  return (
    <>
      <Button
        variant="outlined"
        onClick={handleClick}
        endIcon={<FaAngleDown />}
        startIcon={icon}
        sx={{
          borderRadius: "2rem",
          backgroundColor: isActive ? "#333333" : (open ? "#53546f" : "#ffffff"),
          color: isActive ? "#fff" : (open ? "#fff" : "#444"),
          borderColor: isActive ? "#333333" : (open ? "#53546f" : "#f0f0f0"),
          fontWeight: 500,
          textTransform: "none",
          px: 2.5,
          py: 1,
          boxShadow: open ? "0 2px 8px 0 rgba(83,84,111,0.10)" : "0 1px 3px rgba(0,0,0,0.1)",
          transition: "background 0.2s, color 0.2s, box-shadow 0.2s",
          "&:hover": {
            backgroundColor: isActive ? "#333333" : (open ? "#53546f" : "#f8f9fa"),
            color: isActive ? "#fff" : (open ? "#fff" : "#222"),
            borderColor: isActive ? "#333333" : (open ? "#53546f" : "#d0d0d0"),
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          },
        }}
        className="no-focus-outline"
      >
        {label}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          onMouseLeave: handleClose,
        }}
      >
        {menuItems.map((item, idx) => (
          <MenuItem key={idx} onClick={handleClose}>
            {item}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

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

function PriceFilterButton({
  icon,
  label,
  priceRange,
  setPriceRange,
  priceLimits,
  loadingPrice,
  isActive = false,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // Local state for input fields - ensure they are numbers without leading zeros
  const [minInput, setMinInput] = useState(priceRange[0]);
  const [maxInput, setMaxInput] = useState(priceRange[1]);

  useEffect(() => {
    setMinInput(priceRange[0]);
    setMaxInput(priceRange[1]);
  }, [priceRange]);

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  // Handle slider change
  const handleSliderChange = (event, newValue) => {
    setMinInput(newValue[0]);
    setMaxInput(newValue[1]);
    setPriceRange(newValue);
  };

  // Handle input change - now filters immediately
  const handleMinInputChange = (e) => {
    const value = Number(e.target.value.replace(/[^0-9]/g, ""));
    setMinInput(value);
    
    // Apply filter immediately
    let min = Math.max(priceLimits[0], value);
    let max = Math.min(priceLimits[1], maxInput);
    if (min > max) [min, max] = [max, min];
    setPriceRange([min, max]);
  };
  
  const handleMaxInputChange = (e) => {
    const value = Number(e.target.value.replace(/[^0-9]/g, ""));
    setMaxInput(value);
    
    // Apply filter immediately
    let min = Math.max(priceLimits[0], minInput);
    let max = Math.min(priceLimits[1], value);
    if (min > max) [min, max] = [max, min];
    setPriceRange([min, max]);
  };

  // Remove the handleApply function since we're applying immediately

  return (
    <>
      <Button
        variant="outlined"
        onClick={handleClick}
        endIcon={<FaAngleDown />}
        startIcon={icon}
        sx={{
          borderRadius: "2rem",
          backgroundColor: isActive ? "#333333" : (open ? "#53546f" : "#ffffff"),
          color: isActive ? "#fff" : (open ? "#fff" : "#444"),
          borderColor: isActive ? "#333333" : (open ? "#53546f" : "#e0e0e0"),
          fontWeight: 500,
          textTransform: "none",
          px: 2.5,
          py: 1,
          boxShadow: open ? "0 2px 8px 0 rgba(83,84,111,0.10)" : "0 1px 3px rgba(0,0,0,0.1)",
          transition: "background 0.2s, color 0.2s, box-shadow 0.2s",
          "&:hover": {
            backgroundColor: isActive ? "#333333" : (open ? "#53546f" : "#f8f9fa"),
            color: isActive ? "#fff" : (open ? "#fff" : "#222"),
            borderColor: isActive ? "#333333" : (open ? "#53546f" : "#d0d0d0"),
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          },
        }}
        className="no-focus-outline"
      >
        {label}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          onMouseLeave: handleClose,
        }}
        PaperProps={{
          style: { width: 380, padding: 24 },
        }}
      >
        <div style={{ width: 340, padding: 8 }}>
          {loadingPrice ? (
            <div className="flex justify-center items-center py-4">
              <CircularProgress size={24} />
            </div>
          ) : (
            <>
              <div className="mb-2 font-medium text-gray-700">
                Chọn khoảng giá (VNĐ):
              </div>
              <Slider
                value={[minInput, maxInput]}
                onChange={handleSliderChange}
                valueLabelDisplay="auto"
                min={priceLimits[0]}
                max={priceLimits[1]}
                step={10000}
                sx={{ width: 300, mx: "auto", display: "block" }}
              />
              <div className="flex justify-between items-center mt-2 mb-2 gap-2">
                <TextField
                  label="Tối thiểu"
                  size="small"
                  type="number"
                  value={minInput || ""}
                  onChange={handleMinInputChange}
                  inputProps={{
                    min: priceLimits[0],
                    max: priceLimits[1],
                    step: 10000,
                  }}
                  sx={{ width: 120 }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">đ</InputAdornment>
                    ),
                  }}
                />
                <span className="mx-2">-</span>
                <TextField
                  label="Tối đa"
                  size="small"
                  type="number"
                  value={maxInput || ""}
                  onChange={handleMaxInputChange}
                  inputProps={{
                    min: priceLimits[0],
                    max: priceLimits[1],
                    step: 10000,
                  }}
                  sx={{ width: 120 }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">đ</InputAdornment>
                    ),
                  }}
                />
              </div>
              <div className="flex justify-between text-sm text-gray-600 mt-2">
                <span>{Number(minInput).toLocaleString()}đ</span>
                <span>{Number(maxInput).toLocaleString()}đ</span>
              </div>
            </>
          )}
        </div>
      </Menu>
    </>
  );
}

function TimeFilterButton({
  icon,
  label,
  selectedDays,
  setSelectedDays,
  selectedTimes,
  setSelectedTimes,
  isActive = false,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // For Vietnamese days:
  const days = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"];
  // Or for English, use: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

  // For time blocks:
  const timeBlocks = ["Sáng", "Chiều", "Tối"];
  const timeRows = [timeBlocks]; // All in one row, or split if you want

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const toggleDay = (day) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };
  const toggleTime = (block) => {
    setSelectedTimes((prev) =>
      prev.includes(block) ? prev.filter((b) => b !== block) : [...prev, block]
    );
  };

  // Button style for unselected/selected
  const getBtnStyle = (selected) => ({
    borderRadius: 999,
    minWidth: 80,
    minHeight: 40,
    margin: "6px",
    fontWeight: 500,
    fontSize: 16,
    backgroundColor: selected ? "#53546f" : "#f8f9fb",
    color: selected ? "#fff" : "#53546f",
    boxShadow: "none",
    border: "none",
    "&:hover": {
      backgroundColor: selected ? "#53546f" : "#ececec",
      color: selected ? "#fff" : "#222",
    },
  });

  return (
    <>
      <Button
        variant="outlined"
        onClick={handleClick}
        endIcon={<FaAngleDown />}
        startIcon={icon}
        sx={{
          borderRadius: "2rem",
          backgroundColor: isActive ? "#333333" : (open ? "#53546f" : "#ffffff"),
          color: isActive ? "#fff" : (open ? "#fff" : "#444"),
          borderColor: isActive ? "#333333" : (open ? "#53546f" : "#e0e0e0"),
          fontWeight: 500,
          textTransform: "none",
          px: 2.5,
          py: 1,
          boxShadow: open ? "0 2px 8px 0 rgba(83,84,111,0.10)" : "0 1px 3px rgba(0,0,0,0.1)",
          transition: "background 0.2s, color 0.2s, box-shadow 0.2s",
          "&:hover": {
            backgroundColor: isActive ? "#333333" : (open ? "#53546f" : "#f8f9fa"),
            color: isActive ? "#fff" : (open ? "#fff" : "#222"),
            borderColor: isActive ? "#333333" : (open ? "#53546f" : "#d0d0d0"),
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          },
        }}
        className="no-focus-outline"
      >
        {label}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          onMouseLeave: handleClose,
        }}
        PaperProps={{
          style: { padding: 24, minWidth: 370 },
        }}
      >
        <Box>
          <div
            className="font-semibold text-gray-700 mb-3"
            style={{ fontSize: 20 }}
          >
            Choose a general time
          </div>
          <div className="text-gray-600 mb-2" style={{ fontWeight: 500 }}>
            Các ngày trong tuần
          </div>
          {days.map((day) => (
            <Button
              className="no-focus-outline"
              key={day}
              sx={getBtnStyle(selectedDays.includes(day))}
              onClick={() => toggleDay(day)}
            >
              {day}
            </Button>
          ))}
          <div className="text-gray-600 mb-2 mt-4" style={{ fontWeight: 500 }}>
            Thời gian trong ngày
          </div>
          {timeRows.map((row, idx) => (
            <Box key={idx} display="flex" justifyContent="flex-start" mb={1}>
              {row.map((block) => (
                <Button
                  className="no-focus-outline"
                  key={block}
                  sx={getBtnStyle(selectedTimes.includes(block))}
                  onClick={() => toggleTime(block)}
                >
                  {block}
                </Button>
              ))}
            </Box>
          ))}
        </Box>
      </Menu>
    </>
  );
}

const TutorLanguageList = () => {
  const { subject: initialSubject } = useParams();
  const location = useLocation();
  const navigate = useNavigate(); // Get the navigate function

  // Uncomment and implement search query parameter parsing
  const searchParams = new URLSearchParams(location.search);
  const searchFromQuery = searchParams.get("search") || "";

  // Initialize subject state from URL param or default
  const [subject, setSubject] = useState(initialSubject || "French");
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize filters with searchFromQuery
  const [filters, setFilters] = useState({
    instantLesson: false,
    within72Hours: false,
    searchTerm: searchFromQuery, // Initialize with search from URL
    speakingLanguage: "",
    professionalType: "all",
  });

  // API filter parameters
  const [apiFilters, setApiFilters] = useState({
    minPrice: null,
    maxPrice: null,
    daysInWeek: [],
    slotIndexes: [],
    primaryLanguageCode: null,
  });

  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [priceLimits, setPriceLimits] = useState([0, 1000000]);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [allWeeklySchedules, setAllWeeklySchedules] = useState({});

  const [hoveredTutor, setHoveredTutor] = useState(null);
  // State to control the hover box top position
  const [hoverBoxTop, setHoverBoxTop] = useState(0);

  // Ref to store timeout ID for delayed hover box closing
  const hoverTimeout = useRef(null);
  // Ref to store references to each tutor card for position calculation
  const tutorCardRefs = useRef({});
  // Ref for the hover box element to get its height
  const hoverBoxRef = useRef(null);

  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedTimes, setSelectedTimes] = useState([]);

  // Map Vietnamese days to indices (0=Mon, 6=Sun)
  const dayToIndex = {
    "Thứ 2": 0,
    "Thứ 3": 1,
    "Thứ 4": 2,
    "Thứ 5": 3,
    "Thứ 6": 4,
    "Thứ 7": 5,
    CN: 6,
  };

  // Map time blocks to slot indices
  const timeBlocks = [
    { label: "Sáng", slots: Array.from({ length: 12 }, (_, i) => i) }, // 00:00 - 12:00
    { label: "Chiều", slots: Array.from({ length: 6 }, (_, i) => i + 12) }, // 12:00 - 18:00
    { label: "Tối", slots: Array.from({ length: 6 }, (_, i) => i + 18) }, // 18:00 - 24:00
  ];
  const blockLabelToSlots = Object.fromEntries(
    timeBlocks.map((b) => [b.label, b.slots])
  );

  // Add a separate loading state for filters
  const [filterLoading, setFilterLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTutors, setTotalTutors] = useState(0);
  const pageSize = 12; // 6 records per page

  // Add state for active filter tags
  const [activeFilters, setActiveFilters] = useState([]);

  // Helper function to add active filter
  const addActiveFilter = (type, label, value) => {
    setActiveFilters((prev) => {
      // Remove existing filter of same type
      const filtered = prev.filter((f) => f.type !== type);
      // Add new filter
      return [...filtered, { type, label, value }];
    });
  };

  // Helper function to remove active filter and reset the corresponding filter
  const removeActiveFilter = (type) => {
    setActiveFilters((prev) => prev.filter((f) => f.type !== type));

    // Reset the corresponding filter based on type
    switch (type) {
      case "searchTerm":
        setFilters((prev) => ({ ...prev, searchTerm: "" }));
        // Update URL to remove search parameter
        const newSearchParams = new URLSearchParams(location.search);
        newSearchParams.delete("search");
        navigate(`${location.pathname}${newSearchParams.toString() ? `?${newSearchParams.toString()}` : ""}`);
        break;
      case "price":
        setPriceRange([0, 1000000]);
        break;
      case "days":
        setSelectedDays([]);
        break;
      case "times":
        setSelectedTimes([]);
        break;
      case "speakingLanguage":
        setFilters((prev) => ({ ...prev, speakingLanguage: "" }));
        break;
      case "professionalType":
        setFilters((prev) => ({ ...prev, professionalType: "all" }));
        break;
      default:
        break;
    }
  };

  // Helper function to clear all filters
  const clearAllFilters = () => {
    setActiveFilters([]);
    setSelectedDays([]);
    setSelectedTimes([]);
    setPriceRange([0, 1000000]);
    setFilters((prev) => ({
      ...prev,
      searchTerm: "",
      speakingLanguage: "",
      professionalType: "all",
    }));
    // Update URL to remove search parameter
    const newSearchParams = new URLSearchParams(location.search);
    newSearchParams.delete("search");
    navigate(`${location.pathname}${newSearchParams.toString() ? `?${newSearchParams.toString()}` : ""}`);
  };

  // Update active filters when filters change
  useEffect(() => {
    const newActiveFilters = [];

    // Search term filter
    if (filters.searchTerm) {
      newActiveFilters.push({
        type: "searchTerm",
        label: `Tìm kiếm: "${filters.searchTerm}"`,
        value: filters.searchTerm,
      });
    }

    // Price filter
    if (priceRange[0] > 0 || priceRange[1] < 1000000) {
      newActiveFilters.push({
        type: "price",
        label: `₫ ${priceRange[0].toLocaleString()} - ₫ ${priceRange[1].toLocaleString()}`,
        value: priceRange,
      });
    }

    // Days filter
    if (selectedDays.length > 0) {
      newActiveFilters.push({
        type: "days",
        label: selectedDays.join(", "),
        value: selectedDays,
      });
    }

    // Times filter
    if (selectedTimes.length > 0) {
      newActiveFilters.push({
        type: "times",
        label: selectedTimes.join(", "),
        value: selectedTimes,
      });
    }

    // Speaking language filter
    if (filters.speakingLanguage) {
      const languageName =
        languageList.find((l) => l.code === filters.speakingLanguage)?.name ||
        filters.speakingLanguage;
      newActiveFilters.push({
        type: "speakingLanguage",
        label: `Ngôn ngữ: ${languageName}`,
        value: filters.speakingLanguage,
      });
    }

    // Professional type filter
    if (filters.professionalType !== "all") {
      newActiveFilters.push({
        type: "professionalType",
        label:
          filters.professionalType === "pro"
            ? "Professional Teacher"
            : "Regular Teacher",
        value: filters.professionalType,
      });
    }

    setActiveFilters(newActiveFilters);
  }, [
    filters.searchTerm, // Add searchTerm to dependencies
    priceRange,
    selectedDays,
    selectedTimes,
    filters.speakingLanguage,
    filters.professionalType,
  ]);

  // --- Fetch Tutors with API filters and pagination ---
  useEffect(() => {
    const getTutors = async () => {
      try {
        // Only show full loading on initial load, use filterLoading for filter changes
        if (teachers.length === 0) {
          setInitialLoading(true);
        } else {
          setFilterLoading(true);
        }
        setError(null);

        // Convert selected days to API format
        const daysInWeek = selectedDays.map((day) => dayToIndex[day]);

        // Convert selected times to slot indexes
        const slotIndexes = [];
        selectedTimes.forEach((time) => {
          const slots = blockLabelToSlots[time] || [];
          slotIndexes.push(...slots);
        });

        // Call fetchAllTutor with API parameters including pagination and fullName
        const fetchedTeachersData = await fetchAllTutor(
          currentPage, // page
          pageSize, // size
          null, // languageCodes
          filters.speakingLanguage || null, // primaryLanguageCode
          daysInWeek.length > 0 ? daysInWeek : null, // daysInWeek
          slotIndexes.length > 0 ? slotIndexes : null, // slotIndexes
          priceRange[0], // minPrice - send actual value, even if 0
          priceRange[1], // maxPrice - send actual value, even if 1000000
          filters.searchTerm || null // fullName - pass search term to API
        );

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
            primaryLanguageCode: primaryLanguage?.languageCode || null,
            otherLanguagesCount: otherLanguagesCount,
            tag: t.isProfessional ? "Gia sư uy tín" : "",
            isProfessional: t.isProfessional || false,

            // Fields populated from the API response
            lessons: 0,
            description: t.description || "No description available.",
            price: t.price || "N/A", // Assuming price is directly available in the API response
            availabilityText: "Availability not specified",
            videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            availabilityGrid: [],
            badges: [],
          };
          return processedTeacher;
        });

        // Remove client-side subject filtering since it should be handled by API
        // const filteredBySubject = initialSubject
        //   ? processedTeachers.filter(
        //       (tutor) =>
        //         tutor.nativeLanguage.toLowerCase() ===
        //         initialSubject.toLowerCase()
        //     )
        //   : processedTeachers;

        // Use processedTeachers directly since API should handle filtering
        if (processedTeachers.length === 0) {
          setTeachers([]);
        } else {
          setTeachers(processedTeachers);
        }

        // Calculate total pages based on total count (you might need to get this from API response)
        // For now, we'll estimate based on the current data
        // You should update this based on your API response structure
        const estimatedTotal = Math.max(processedTeachers.length * 3, 20); // Estimate
        setTotalTutors(estimatedTotal);
        setTotalPages(Math.ceil(estimatedTotal / pageSize));
      } catch (error) {
        console.error("Error fetching all tutors in component:", error);
        setError(
          error.message || "Failed to load tutors. Please try again later."
        );
      } finally {
        setInitialLoading(false);
        setFilterLoading(false);
      }
    };

    getTutors();
  }, [
    currentPage,
    initialSubject,
    navigate,
    selectedDays,
    selectedTimes,
    priceRange,
    filters.speakingLanguage,
    filters.searchTerm, // Add searchTerm to dependencies
  ]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDays, selectedTimes, priceRange, filters.speakingLanguage, filters.searchTerm]); // Add searchTerm

  // --- Fetch lessons for each tutor ---
  useEffect(() => {
    const fetchLessonsForTutors = async () => {
      if (teachers.length === 0) return;

      const lessonsMap = {};

      try {
        // Fetch lessons for each tutor
        for (const teacher of teachers) {
          try {
            const lessons = await fetchTutorLesson(teacher.id);
            lessonsMap[teacher.id] = lessons || [];
          } catch (error) {
            console.error(
              `Failed to fetch lessons for tutor ${teacher.id}:`,
              error
            );
            lessonsMap[teacher.id] = [];
          }
        }

        // setAllLessonsByTutorId(lessonsMap); // This state is no longer needed
      } catch (error) {
        console.error("Error fetching lessons for tutors:", error);
      }
    };

    fetchLessonsForTutors();
  }, [teachers]);

  useEffect(() => {
    async function fetchAllSchedules() {
      const mondayString = getCurrentWeekMondayString();
      const schedules = {};
      for (const tutor of teachers) {
        try {
          const schedule = await fetchTutorWeekSchedule(tutor.id, mondayString);
          schedules[tutor.id] = schedule;
        } catch {
          schedules[tutor.id] = [];
        }
      }
      setAllWeeklySchedules(schedules);
    }
    if (teachers.length > 0) fetchAllSchedules();
  }, [teachers]);

  // Remove the fetchAllPrices useEffect entirely since we don't need it anymore
  // The price data will come directly from fetchAllTutor() API response

  useEffect(() => {
    if (initialSubject) {
      const found = languageList.find(
        (l) => l.name.toLowerCase() === initialSubject.toLowerCase()
      );
      if (found && filters.speakingLanguage !== found.code) {
        setFilters((f) => ({ ...f, speakingLanguage: found.code }));
      }
    }
  }, [initialSubject, languageList]);

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
    navigate(`/tutor/${newSubject}`);
  };

  // --- API Filter Handlers with debouncing ---
  const handlePriceChange = (newPriceRange) => {
    setPriceRange(newPriceRange);
    // The useEffect will automatically trigger a new API call
  };

  const handleDaysChange = (newSelectedDays) => {
    setSelectedDays(newSelectedDays);
    // The useEffect will automatically trigger a new API call
  };

  const handleTimesChange = (newSelectedTimes) => {
    setSelectedTimes(newSelectedTimes);
    // The useEffect will automatically trigger a new API call
  };

  // --- Filtered Teachers (Remove client-side search filtering) ---
  const filteredTeachers = teachers.filter((teacher) => {
    // Remove search term filtering since it's now handled by API
    // Only keep professional type filtering on client side
    const professionalMatch =
      filters.professionalType === "all" ||
      (filters.professionalType === "pro" && teacher.isProfessional) ||
      (filters.professionalType === "normal" && !teacher.isProfessional);

    return professionalMatch; // Remove searchMatch from return
  });

  function isTutorAvailable(teacher) {
    if (selectedDays.length === 0 && selectedTimes.length === 0) return true;
    const schedule = allWeeklySchedules[teacher.id] || [];
    // Helper to get the date for each day index (0=Mon, 6=Sun)
    function getDateOfWeek(dayIdx) {
      const monday = new Date(getCurrentWeekMondayString());
      const d = new Date(monday);
      d.setDate(monday.getDate() + dayIdx);
      return d;
    }
    for (const day of selectedDays) {
      const dayIdx = dayToIndex[day];
      const targetDate = getDateOfWeek(dayIdx);
      const dayData = schedule.find((dayObj) => {
        const dayDate = new Date(dayObj.date);
        return (
          dayDate.getFullYear() === targetDate.getFullYear() &&
          dayDate.getMonth() === targetDate.getMonth() &&
          dayDate.getDate() === targetDate.getDate()
        );
      });
      if (!dayData || !dayData.timeSlotIndex) continue;
      for (const time of selectedTimes) {
        const slots = blockLabelToSlots[time] || [];
        if (slots.some((slot) => dayData.timeSlotIndex.includes(slot))) {
          return true;
        }
      }
    }
    return false;
  }

  // --- Loading and Error States ---
  const handleCardClick = useCallback((id) => {
    window.open(`/teacher/${id}`, "_blank");
  }, []);

  useEffect(() => {
    if (initialSubject) setSubject(initialSubject);
  }, [initialSubject]);

  const getVietnameseLabel = (name) => {
    switch (name?.toLowerCase()) {
      case "vietnamese":
        return "Tiếng Việt";
      case "chinese":
        return "Tiếng Trung";
      case "french":
        return "Tiếng Pháp";
      case "english":
        return "Tiếng Anh";
      case "italian":
        return "Tiếng Ý";
      case "japanese":
        return "Tiếng Nhật";
      case "spanish":
        return "Tiếng Tây Ban Nha";
      case "korean":
        return "Tiếng Hàn";
      case "russian":
        return "Tiếng Nga";
      case "portuguese":
        return "Tiếng Bồ Đào Nha";
      case "arabic":
        return "Tiếng Ả Rập";
      case "hindi":
        return "Tiếng Hindi";
      case "thai":
        return "Tiếng Thái";
      case "indonesian":
        return "Tiếng Indonesia";
      case "dutch":
        return "Tiếng Hà Lan";
      case "german":
        return "Tiếng Đức";
      default:
        return name;
    }
  };

  const displaySubject = getVietnameseLabel(subject);

  // Handle return to first page - only reset page, keep filters
  const handleReturnToFirstPage = () => {
    setCurrentPage(1);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Update the render logic to use different loading states
  if (initialLoading) {
    return (
      <div className="w-full pt-12 pb-40 px-2 md:px-4 lg:px-16 bg-gray-100 min-h-screen animate-pulse">
        <div className="max-w-7xl mx-auto mb-10">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <div className="md:w-2/3 text-center md:text-left mb-6 md:mb-0">
              <div className="h-10 bg-gray-200 rounded w-2/3 mb-3" />
              <div className="h-6 bg-gray-200 rounded w-1/2" />
            </div>
            <div className="md:w-1/3 flex justify-center md:justify-end">
              <div className="w-40 h-24 bg-gray-200 rounded" />
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
            <div className="h-10 bg-gray-200 rounded w-40" />
            <div className="h-10 bg-gray-200 rounded w-72" />
          </div>
        </div>
        <div className="max-w-7xl mx-auto relative">
          <div className="flex flex-wrap gap-3 mb-6 pb-4 border-b border-gray-200">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-8 w-32 bg-gray-200 rounded" />
            ))}
          </div>
          <div className="flex flex-col gap-8">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="flex gap-6 bg-white p-6 rounded-xl shadow-md"
              >
                <div className="w-24 h-24 bg-gray-200 rounded-full" />
                <div className="flex-1 flex flex-col gap-3">
                  <div className="h-6 bg-gray-200 rounded w-1/3" />
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-8 bg-gray-200 rounded w-full mt-2" />
                </div>
              </div>
            ))}
          </div>
        </div>
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
  const professionalTypeLabels = {
    all: "Cả 2",
    pro: "Gia sư uy tín",
    normal: "Gia sư thông thường",
  };

  // Handle page change
  const handlePageChange = (event, newPage) => {
    setCurrentPage(newPage);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="w-full pt-12 pb-40 px-2 md:px-4 lg:px-16 bg-gray-100 min-h-screen">
      {/* === Header Section === */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          {/* Left Text */}
          <div className="md:w-2/3 text-center md:text-left mb-6 md:mb-0">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
              <>
                Tìm gia sư{" "}
                <strong className="text-[#333333]">
                  {displaySubject.toUpperCase()}
                </strong>{" "}
                tốt nhất trực tuyến
              </>
            </h1>
            <p className="text-gray-600 text-base md:text-lg">
              <>
                Học {displaySubject} trực tuyến với các gia sư chuyên nghiệp
                của NgoaiNguNgay. Nền tảng của chúng tôi kết nối bạn với những
                người bản xứ nói tiếng {displaySubject} từ khắp nơi trên thế
                giới, cung cấp các bài học và khóa học cá nhân hóa phục vụ nhu
                cầu và mục tiêu của bạn.
              </>
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
          <TextField
            name="searchTerm"
            placeholder="Vui lòng nhập tên gia sư..."
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
        <div className="flex flex-wrap gap-4 mb-6 pb-4 border-b border-gray-200 items-center">
          {/* <FilterButton
            icon={<FaTag />}
            label="Danh mục bài học"
            menuItems={["Giao tiếp", "Ngữ pháp", "Phát âm"]}
            isActive={false}
          /> */}
          <PriceFilterButton
            icon={<FaDollarSign />}
            label="Giá cả"
            priceRange={priceRange}
            setPriceRange={handlePriceChange}
            priceLimits={priceLimits}
            loadingPrice={loadingPrice}
            isActive={priceRange[0] > 0 || priceRange[1] < 1000000}
          />
          <TimeFilterButton
            icon={<FaClock />}
            label="Thời gian học"
            selectedDays={selectedDays}
            setSelectedDays={handleDaysChange}
            selectedTimes={selectedTimes}
            setSelectedTimes={handleTimesChange}
            isActive={selectedDays.length > 0 || selectedTimes.length > 0}
          />
          <FilterButton
            icon={<FaComments />}
            label={
              filters.speakingLanguage
                ? `Ngôn ngữ: ${
                    languageList.find(
                      (l) => l.code === filters.speakingLanguage
                    )?.name || filters.speakingLanguage
                  }`
                : "Nói ngôn ngữ"
            }
            menuItems={[
              <span
                key="all"
                style={{
                  fontWeight: !filters.speakingLanguage ? "bold" : "normal",
                  color: !filters.speakingLanguage ? "#53546f" : undefined,
                }}
                onClick={() => {
                  setFilters((f) => ({ ...f, speakingLanguage: "" }));
                  navigate(`/tutor`);
                }}
              >
                Tất cả ngôn ngữ
              </span>,
              ...languageList.map((lang) => (
                <span
                  key={lang.code}
                  style={{
                    fontWeight:
                      filters.speakingLanguage === lang.code
                        ? "bold"
                        : "normal",
                    color:
                      filters.speakingLanguage === lang.code
                        ? "#53546f"
                        : undefined,
                  }}
                  onClick={() => {
                    setFilters((f) => ({ ...f, speakingLanguage: lang.code }));
                    const language =
                      lang.name.toLowerCase() === "brazilian"
                        ? "portuguese"
                        : lang.name.toLowerCase();
                    navigate(`/tutor/${language}`);
                  }}
                >
                  {(() => {
                    switch (lang.code) {
                      case "vi":
                        return "Tiếng Việt";
                      case "zh":
                        return "Tiếng Trung";
                      case "fr":
                        return "Tiếng Pháp";
                      case "en":
                        return "Tiếng Anh";
                      case "it":
                        return "Tiếng Ý";
                      case "ja":
                        return "Tiếng Nhật";
                      case "es":
                        return "Tiếng Tây Ban Nha";
                      case "ko":
                        return "Tiếng Hàn";
                      case "ru":
                        return "Tiếng Nga";
                      case "pt":
                        return "Tiếng Bồ Đào Nha";
                      case "ar":
                        return "Tiếng Ả Rập";
                      case "hi":
                        return "Tiếng Hindi";
                      case "th":
                        return "Tiếng Thái";
                      case "id":
                        return "Tiếng Indonesia";
                      case "nl":
                        return "Tiếng Hà Lan";
                      case "de":
                        return "Tiếng Đức";
                      default:
                        return lang.name;
                    }
                  })()}
                </span>
              )),
            ]}
            isActive={!!filters.speakingLanguage}
          />
          <FilterButton
            icon={<FaCheckCircle />}
            label={`Uy tín gia sư: ${
              professionalTypeLabels[filters.professionalType]
            }`}
            menuItems={[
              <RadioGroup
                key="radio-group"
                name="professionalType"
                value={filters.professionalType}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    professionalType: e.target.value,
                  }))
                }
                sx={{ px: 2, py: 1 }}
              >
                <FormControlLabel
                  value="all"
                  control={<Radio size="small" />}
                  label="Cả 2"
                />
                <FormControlLabel
                  value="pro"
                  control={<Radio size="small" />}
                  label="Gia sư uy tín"
                />
                <FormControlLabel
                  value="normal"
                  control={<Radio size="small" />}
                  label="Gia sư thông thường"
                />
              </RadioGroup>,
            ]}
            isActive={filters.professionalType !== "all"}
          />

          {/* Teacher count */}
        </div>

        {/* Active Filter Tags */}
        <div className="flex flex-col gap-4">
          
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 pb-4 border-b border-gray-200 items-center">
              {activeFilters.map((filter) => (
                <Chip
                  key={filter.type}
                  label={filter.label}
                  onDelete={() => removeActiveFilter(filter.type)}
                  sx={{
                    backgroundColor: "#ffffff",
                    color: "#374151",
                    "& .MuiChip-deleteIcon": {
                      color: "#6b7280",
                      "&:hover": {
                        color: "#374151",
                      },
                    },
                    "&:hover": {
                      backgroundColor: "#e5e7eb",
                    },
                  }}
                />
              ))}
              {activeFilters.length > 0 && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={clearAllFilters}
                  sx={{
                    backgroundColor: "#ffffff",
                    borderColor: "#d1d5db",
                    color: "#6b7280",
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    padding: "6px 16px",
                    borderRadius: "20px",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      borderColor: "#9ca3af",
                      backgroundColor: "#f9fafb",
                      color: "#374151",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      transform: "translateY(-1px)",
                    },
                    "&:active": {
                      transform: "translateY(0)",
                    },
                  }}
                >
                  Xóa tất cả
                </Button>
              )}
            </div>
          )}
          <div className="flex-1 flex flex-wrap items-center justify-between mt-4 md:mt-0">
            <span className="font-bold text-2xl text-gray-800 mb-3">
              Chọn từ {filteredTeachers.length} gia sư!
            </span>
          </div>
        </div>

        {/* Content Layout: Tutor List */}
        <div className="flex flex-col gap-8">
          {/* Intro Text & Availability Filters */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                <>
                  Cải thiện kỹ năng tiếng {displaySubject} của bạn với các lớp
                  học trực tuyến cá nhân hóa
                </>
              </h3>
              <p className="text-gray-600 text-sm">
                Đội ngũ giáo viên tiếng {displaySubject} giàu kinh nghiệm của
                chúng tôi cung cấp các lớp học và khóa học trực tuyến một kèm
                một được thiết kế để giúp bạn học ngôn ngữ một cách thú vị và
                tương tác.
              </p>
            </div>
          </div>

          {/* Tutor List with smooth filtering */}
          <div className="flex flex-col gap-6">
            {filterLoading ? (
              // Show skeleton loading instead of spinner
              <div className="flex flex-col gap-6">
                {[...Array(6)].map((_, index) => (
                  <div
                    key={index}
                    className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 w-full md:w-[70%]"
                  >
                    {/* Left Part: Avatar & Rating Skeleton */}
                    <div className="flex flex-row md:flex-col items-center w-full md:w-25 flex-shrink-0">
                      <Skeleton
                        variant="circular"
                        width={64}
                        height={64}
                        className="mb-2"
                      />
                      <Skeleton
                        variant="text"
                        width={60}
                        height={20}
                        className="mb-2"
                      />
                      <Skeleton variant="text" width={80} height={16} />
                    </div>

                    {/* Right Part: Details Skeleton */}
                    <div className="flex-1 overflow-hidden">
                      {/* Name & Badges Skeleton */}
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Skeleton variant="text" width={200} height={28} />
                        <Skeleton
                          variant="rectangular"
                          width={80}
                          height={24}
                          sx={{ borderRadius: "12px" }}
                        />
                      </div>

                      {/* Speaks Skeleton */}
                      <div className="mb-2">
                        <Skeleton variant="text" width={150} height={20} />
                      </div>

                      {/* Description Skeleton */}
                      <div className="mb-3">
                        <Skeleton variant="text" width="100%" height={20} />
                        <Skeleton variant="text" width="80%" height={20} />
                      </div>

                      {/* Price, Availability & Actions Skeleton */}
                      <div className="flex items-center justify-between mt-2">
                        <Skeleton variant="text" width={120} height={24} />
                        <Skeleton variant="text" width={200} height={20} />
                        <Skeleton
                          variant="rectangular"
                          width={100}
                          height={36}
                          sx={{ borderRadius: "20px" }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredTeachers.length === 0 ? (
              // Only show NotFound if not loading and no tutors match
              <div className="flex flex-col items-center justify-center py-10">
                <img
                  src={notFoundImg}
                  alt="No tutors found"
                  className="max-h-64 mb-4"
                />
                <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                  Rất tiếc! Không tìm thấy gia sư nào cho ngôn ngữ này.
                </h3>
                <p className="text-gray-600 text-base mb-6">
                  Hãy thử tìm kiếm với các tiêu chí khác hoặc kiểm tra lại sau.
                </p>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleReturnToFirstPage}
                  sx={{
                    background: "#3B82F6",
                    color: "#fff",
                    textTransform: "none",
                    fontWeight: "bold",
                    padding: "12px 24px",
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(59, 130, 246, 0.15)",
                    transition: "transform 0.15s, box-shadow 0.15s",
                    "&:hover": {
                      background: "#2563EB",
                      boxShadow: "0 4px 16px rgba(59, 130, 246, 0.25)",
                      transform: "translateY(-1px)",
                    },
                  }}
                >
                  Trở về trang đầu tiên
                </Button>
              </div>
            ) : (
              <>
                <div
                  className={`transition-opacity duration-300 flex flex-col gap-6 ${
                    filterLoading ? "opacity-50" : "opacity-100"
                  }`}
                >
                  {filteredTeachers.map((teacher) => (
                    <TutorCard
                      key={teacher.id}
                      teacher={teacher}
                      hoveredTutor={hoveredTutor}
                      handleMouseEnter={handleMouseEnter}
                      handleMouseLeave={handleMouseLeave}
                      handleCardClick={handleCardClick}
                      hoverBoxTop={hoverBoxTop}
                      tutorCardRef={(el) =>
                        (tutorCardRefs.current[teacher.id] = el)
                      }
                      hoverBoxRef={hoverBoxRef}
                      handleHoverBoxEnter={handleHoverBoxEnter}
                      handleHoverBoxLeave={handleHoverBoxLeave}
                      weeklySchedule={allWeeklySchedules[teacher.id] || []}
                    />
                  ))}
                </div>

                {/* Pagination - reverted to original UI */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center py-8 pr-100">
                    <div className="flex flex-col items-center gap-4">
                      <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={handlePageChange}
                        color="primary"
                        size="large"
                        showFirstButton
                        showLastButton
                        sx={{
                          "& .MuiPaginationItem-root": {
                            fontSize: "1rem",
                            fontWeight: 500,
                          },
                          "& .Mui-selected": {
                            backgroundColor: "#3B82F6 !important",
                            color: "white !important",
                          },
                        }}
                      />
                      <div className="text-sm text-gray-600">
                        Trang {currentPage} của {totalPages} • {totalTutors} gia
                        sư
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorLanguageList;
