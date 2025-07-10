import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Paper,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Avatar,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  Alert,
  Rating,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab,
  GlobalStyles,
  Skeleton, // Add Skeleton import
  Tooltip,
} from "@mui/material";
import { FiPlusCircle, FiEdit, FiTrash2, FiCheck } from "react-icons/fi";
import { MdOutlineEditCalendar } from "react-icons/md";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

import { styled } from "@mui/material/styles";
import {
  getAccessToken,
  fetchTutorLesson,
  createLesson,
  updateLesson,
  deleteLesson,
  fetchTutorWeeklyPattern,
  editTutorWeeklyPattern,
  deleteTutorWeeklyPattern,
  tutorBookingTimeSlotFromLearner,
  tutorBookingTimeSlotFromLearnerDetail,
  createTutorBookingOffer,
  tutorBookingOfferDetail,
  getAllTutorBookingOffer, // <-- add this import
  updateTutorBookingOfferByOfferId,
} from "../../components/api/auth";
import { formatLanguageCode } from "../../utils/formatLanguageCode";
import ConfirmDialog from "../modals/ConfirmDialog";
import { languageList } from "../../utils/languageList";
import formatPriceWithCommas from "../../utils/formatPriceWithCommas";
import formatPriceInputWithCommas from "../../utils/formatPriceInputWithCommas";
import getWeekDates from "../../utils/getWeekDates";
import ConfirmDeleteWeeklyPattern from "../modals/ConfirmDeleteWeeklyPattern";

// Global styles to remove focus borders and improve UI
const globalStyles = (
  <GlobalStyles
    styles={{
      // Remove focus outline from all elements
      "*:focus": {
        outline: "none !important",
        boxShadow: "none !important",
      },
      // Remove focus outline from buttons
      "button:focus": {
        outline: "none !important",
        boxShadow: "none !important",
      },
      // Remove focus outline from inputs
      "input:focus": {
        outline: "none !important",
        boxShadow: "none !important",
      },
      // Remove focus outline from textareas
      "textarea:focus": {
        outline: "none !important",
        boxShadow: "none !important",
      },
      // Remove focus outline from selects
      "select:focus": {
        outline: "none !important",
        boxShadow: "none !important",
      },
      // Remove focus outline from links
      "a:focus": {
        outline: "none !important",
        boxShadow: "none !important",
      },
      // Remove focus outline from tabs
      ".MuiTab-root:focus": {
        outline: "none !important",
        boxShadow: "none !important",
      },
      // Remove focus outline from accordion
      ".MuiAccordionSummary-root:focus": {
        outline: "none !important",
        boxShadow: "none !important",
      },
      // Remove focus outline from chips
      ".MuiChip-root:focus": {
        outline: "none !important",
        boxShadow: "none !important",
      },
      // Smooth scrolling
      html: {
        scrollBehavior: "smooth",
      },
      // Better button hover effects
      ".MuiButton-root": {
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important",
      },
      // Better card hover effects
      ".MuiPaper-root": {
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important",
      },
    }}
  />
);

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  backgroundColor: "#ffffff",
  borderRadius: "16px",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
  border: "1px solid #f1f5f9",
  transition: "all 0.3s ease",
  "&:hover": {
    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)",
  },
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  backgroundColor: "#f0f7ff",
  color: "#1e40af",
  fontWeight: 600,
  margin: theme.spacing(0.5),
  borderRadius: "8px",
  height: "36px",
  fontSize: "0.875rem",
  border: "1px solid #dbeafe",
  transition: "all 0.2s ease",
  "&:focus": {
    outline: "none",
    boxShadow: "none",
  },
  "&.MuiChip-colorSuccess": {
    backgroundColor: "#ecfdf5",
    color: "#059669",
    border: "1px solid #d1fae5",
  },
  "&.MuiChip-colorError": {
    backgroundColor: "#fef2f2",
    color: "#dc2626",
    border: "1px solid #fecaca",
  },
  "&.MuiChip-colorWarning": {
    backgroundColor: "#fffbeb",
    color: "#d97706",
    border: "1px solid #fed7aa",
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#3b82f6",
  color: "#ffffff",
  borderRadius: "12px",
  padding: "12px 24px",
  fontSize: "0.95rem",
  fontWeight: 600,
  textTransform: "none",
  boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
  transition: "all 0.3s ease",
  "&:hover": {
    backgroundColor: "#2563eb",
    boxShadow: "0 6px 20px rgba(59, 130, 246, 0.4)",
    transform: "translateY(-2px)",
  },
  "&:focus": {
    outline: "none",
    boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.2)",
  },
  "&.MuiButton-outlined": {
    backgroundColor: "transparent",
    color: "#3b82f6",
    borderColor: "#3b82f6",
    border: "2px solid #3b82f6",
    boxShadow: "none",
    "&:hover": {
      backgroundColor: "#f0f9ff",
      borderColor: "#2563eb",
      transform: "translateY(-1px)",
    },
  },
}));

const LargeAvatar = styled(Avatar)(({ theme }) => ({
  width: theme.spacing(20),
  height: theme.spacing(20),
  margin: "0 auto 16px",
  border: "4px solid #ffffff",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
  fontSize: "4rem",
  backgroundColor: "#e5e7eb",
  color: "#6b7280",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "scale(1.05)",
    boxShadow: "0 12px 40px rgba(0, 0, 0, 0.16)",
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  position: "relative",
  paddingBottom: theme.spacing(2),
  marginBottom: theme.spacing(3),
  fontWeight: 700,
  color: "#1e293b",
  fontSize: "1.25rem",
  "&:after": {
    content: '""',
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "60px",
    height: "4px",
    backgroundColor: "#3b82f6",
    borderRadius: "2px",
  },
}));

const VerificationBadge = styled(Box)(({ status, theme }) => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(1, 2),
  borderRadius: "20px",
  fontSize: "0.875rem",
  fontWeight: 600,
  ...(status === 0 && {
    backgroundColor: "#fffbeb",
    color: "#d97706",
    border: "1px solid #fed7aa",
  }),
  ...(status === 1 && {
    backgroundColor: "#f0f9ff",
    color: "#2563eb",
    border: "1px solid #dbeafe",
  }),
  ...(status === 2 && {
    backgroundColor: "#ecfdf5",
    color: "#059669",
    border: "1px solid #d1fae5",
  }),
}));

const getProficiencyLabel = (level) => {
  switch (level) {
    case 1:
      return "Sơ cấp (A1)";
    case 2:
      return "Tiểu học (A2)";
    case 3:
      return "Trung cấp (B1)";
    case 4:
      return "Trung cấp trên (B2)";
    case 5:
      return "Nâng cao (C1)";
    case 6:
      return "Thành thạo (C2)";
    case 7:
      return "Bản xứ";
    default:
      return "Không xác định";
  }
};

const getLanguageName = (code) => {
  return formatLanguageCode(code);
};

const getVerificationStatus = (status) => {
  switch (status) {
    case 0:
      return { label: "Đang chờ xác minh", color: "#b45309" };
    case 1:
      return { label: "Đang xem xét", color: "#1e429f" };
    case 2:
      return { label: "Đã xác minh", color: "#166534" };
    default:
      return { label: "Trạng thái không xác định", color: "#64748b" };
  }
};

const handleFileChange = (e) => {
  const { files } = e.target;
  if (files.length > 0) {
    const file = files[0];

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Kích thước ảnh phải nhỏ hơn 2MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Chỉ chấp nhận các tệp ảnh");
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    setFormData((prev) => ({
      ...prev,
      profilePhoto: file,
      profilePhotoPreview: previewUrl,
    }));

    // Upload the profile image to the server
    uploadProfileImage(file);
  }
};

function getNextMondayDateUTC() {
  const today = new Date();
  const day = today.getUTCDay();
  const daysUntilMonday = (8 - day) % 7 || 7;
  const nextMonday = new Date(Date.UTC(
    today.getUTCFullYear(),
    today.getUTCMonth(),
    today.getUTCDate() + daysUntilMonday,
    0, 0, 0, 0
  ));
  return nextMonday;
}

const RedStyledButton = styled(StyledButton)(({ theme }) => ({
  backgroundColor: "#f44336", // Red color
  "&:hover": {
    backgroundColor: "#d32f2f", // Darker red on hover
  },
}));

// Helper to get the start (Monday) and end (Sunday) of the current week
function getWeekRange(date = new Date()) {
  const monday = new Date(date);
  const day = monday.getDay();
  
  // Adjust to get Monday (1) as the first day
  // If today is Sunday (0), we need to go back 6 days
  // For any other day, we go back (day - 1) days
  const diff = day === 0 ? -6 : (1 - day);
  
  monday.setDate(monday.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  
  return { monday, sunday };
}

function formatDateRange(start, end) {
  const options = { day: "2-digit", month: "2-digit", year: "numeric" };
  return `${start.toLocaleDateString("vi-VN", options)} - ${end.toLocaleDateString("vi-VN", options)}`;
}

// Replace the existing getPatternForWeek function with this one
function getPatternForWeek(weeklyPatterns, weekStart) {
  if (!weeklyPatterns || weeklyPatterns.length === 0) return null;
  
  // Create a date object for the start of the week
  const weekMonday = new Date(weekStart);
  weekMonday.setHours(0, 0, 0, 0);

  // Sort patterns descending by appliedFrom
  const sorted = [...weeklyPatterns].sort(
    (a, b) => new Date(b.appliedFrom) - new Date(a.appliedFrom)
  );

  // Find the pattern that starts on or before this week's Monday
  // We need to compare the dates without the time component
  return sorted.find(pattern => {
    const patternDate = new Date(pattern.appliedFrom);
    patternDate.setHours(0, 0, 0, 0);
    
    // Compare dates without time
    return patternDate.getTime() <= weekMonday.getTime();
  }) || sorted[sorted.length - 1];
}

function buildAvailabilityData(pattern, timeRanges) {
  const blockAvailability = {};
  timeRanges.forEach((range) => {
    blockAvailability[range] = {
      mon: false, tue: false, wed: false, thu: false, fri: false, sat: false, sun: false,
    };
  });
  if (pattern && pattern.slots && Array.isArray(pattern.slots)) {
    pattern.slots.forEach((slot) => {
      const hour = Math.floor(slot.slotIndex / 2);
      const startHour = hour;
      const endHour = hour + 1;
      const timeRangeKey = `${startHour.toString().padStart(2, '0')}:00 - ${endHour.toString().padStart(2, '0')}:00`;
      const dayMap = { 1: 'sun', 2: 'mon', 3: 'tue', 4: 'wed', 5: 'thu', 6: 'fri', 7: 'sat' };
      const dayKey = dayMap[slot.dayInWeek];
      if (timeRangeKey && blockAvailability[timeRangeKey] && dayKey && slot.type === 0) {
        blockAvailability[timeRangeKey][dayKey] = true;
      }
    });
  }
  return blockAvailability;
}

// Add this skeleton component after the existing styled components
const WeeklyScheduleSkeleton = () => (
  <Box
    sx={{
      backgroundColor: "#ffffff",
      borderRadius: "12px",
      border: "1px solid #e2e8f0",
      overflow: "hidden",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
      width: "100%",
      maxWidth: "100%",
      boxSizing: "border-box",
    }}
  >
    {/* Header skeleton */}
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "140px repeat(7, 1fr)",
        minWidth: "600px",
      }}
    >
      {/* Time column header */}
      <Box
        sx={{
          p: 1.5,
          backgroundColor: "#f8fafc",
          borderBottom: "1px solid #e2e8f0",
          borderRight: "1px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Skeleton variant="text" width={60} height={20} />
      </Box>
      
      {/* Day headers */}
      {Array.from({ length: 7 }).map((_, index) => (
        <Box
          key={index}
          sx={{
            p: 1.5,
            backgroundColor: "#f8fafc",
            borderBottom: "1px solid #e2e8f0",
            borderRight: index === 6 ? "none" : "1px solid #e2e8f0",
            textAlign: "center",
          }}
        >
          <Skeleton variant="text" width={20} height={16} sx={{ mx: "auto", mb: 0.5 }} />
          <Skeleton variant="text" width={16} height={12} sx={{ mx: "auto" }} />
        </Box>
      ))}
    </Box>

    {/* Time slots skeleton */}
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "140px repeat(7, 1fr)",
        minWidth: "600px",
      }}
    >
      {Array.from({ length: 17 }).map((_, slotIdx) => {
        // Show 14 time labels, e.g. 00:00 - 01:00, 01:00 - 02:00, ...
        const hour = slotIdx;
        const nextHour = hour + 1;
        const timeLabel = `${hour.toString().padStart(2, "0")}:00 - ${nextHour.toString().padStart(2, "0")}:00`;
        return (
          <React.Fragment key={slotIdx}>
            {/* Time label skeleton */}
            <Box
              sx={{
                p: 1,
                textAlign: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderBottom: "1px solid #e2e8f0",
                borderRight: "1px solid #e2e8f0",
              }}
            >
              <Skeleton variant="text" width={80} height={16} />
            </Box>
            {/* Day cells skeleton */}
            {Array.from({ length: 7 }).map((_, dayIdx) => (
              <Box
                key={dayIdx}
                sx={{
                  height: 32,
                  display: "flex",
                  flexDirection: "column",
                  border: "1px solid #e2e8f0",
                  borderRight: dayIdx === 6 ? "none" : "1px solid #e2e8f0",
                  borderTop: "none",
                  borderLeft: dayIdx === 0 ? "none" : "1px solid #e2e8f0",
                }}
              >
                <Skeleton 
                  variant="rectangular" 
                  width="90%" 
                  height="80%" 
                  sx={{ borderRadius: 1, margin: "auto" }}
                />
              </Box>
            ))}
          </React.Fragment>
        );
      })}
    </Box>

    {/* Legend skeleton */}
    <Box
      sx={{
        p: 3,
        backgroundColor: "#f8fafc",
        borderTop: "1px solid #e2e8f0",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 3,
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Skeleton variant="circular" width={6} height={6} />
          <Skeleton variant="text" width={60} height={16} />
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Skeleton variant="circular" width={6} height={6} />
          <Skeleton variant="text" width={80} height={16} />
        </Box>
      </Box>
      <Skeleton variant="text" width="70%" height={16} />
      <Skeleton variant="text" width="40%" height={14} sx={{ mt: 1 }} />
    </Box>
  </Box>
);

// Add this helper function above TutorProfile
function buildEditPatternSlotsFromPattern(pattern) {
  // pattern: { slots: [...] }
  const slotMap = {};
  if (pattern && pattern.slots && Array.isArray(pattern.slots)) {
    pattern.slots.forEach(slot => {
      if (slot.type === 0) {
        if (!slotMap[slot.dayInWeek]) slotMap[slot.dayInWeek] = new Set();
        slotMap[slot.dayInWeek].add(slot.slotIndex);
      }
    });
  }
  return slotMap;
}

function getSlotDateTime(weekStart, dayInWeek, slotIndex) {
  // weekStart: Date object for Monday 00:00:00
  // dayInWeek: 2=Mon, ..., 7=Sat, 1=Sun
  // slotIndex: 0-47 (each 30min slot)
  const date = new Date(weekStart);
  // Calculate day offset: dayInWeek 2=Mon, ..., 7=Sat, 1=Sun
  let dayOffset = dayInWeek - 2;
  if (dayInWeek === 1) dayOffset = 6; // Sunday
  date.setDate(date.getDate() + dayOffset);
  // Set time
  const hour = Math.floor(slotIndex / 2);
  const minute = (slotIndex % 2) * 30;
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

// 1. Add this skeleton component above TutorProfile
const BookingDetailSkeleton = () => (
  <TableContainer component={Paper}>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Thời gian</TableCell>
          <TableCell>Thứ 2</TableCell>
          <TableCell>Thứ 3</TableCell>
          <TableCell>Thứ 4</TableCell>
          <TableCell>Thứ 5</TableCell>
          <TableCell>Thứ 6</TableCell>
          <TableCell>Thứ 7</TableCell>
          <TableCell>CN</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {Array.from({ length: 16 }).map((_, idx) => (
          <TableRow key={idx}>
            <TableCell>
              <Skeleton variant="text" width="80%" height={24} />
            </TableCell>
            {Array.from({ length: 7 }).map((__, dayIdx) => (
              <TableCell key={dayIdx}>
                <Skeleton variant="rectangular" width="80%" height={24} />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

const TutorProfile = ({ user, onRequireLogin, fetchTutorDetail }) => {
  const { id } = useParams();
  const [tutorData, setTutorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [lessons, setLessons] = useState([]);
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [editLesson, setEditLesson] = useState(null);
  const [lessonForm, setLessonForm] = useState({
    name: "",
    description: "",
    note: "",
    targetAudience: "",
    prerequisites: "",
    languageCode: "",
    category: "",
    price: 0,
    currency: "",
  });
  const [lessonLoading, setLessonLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState(null);
  const [showValidation, setShowValidation] = useState(false);
  
  // New state for weekly patterns
  const [weeklyPatterns, setWeeklyPatterns] = useState([]);
  const [availabilityData, setAvailabilityData] = useState({});
  const [availabilityDays, setAvailabilityDays] = useState([]);
  const [availabilityDates, setAvailabilityDates] = useState([]);
  const [weeklyPatternLoading, setWeeklyPatternLoading] = useState(false);

  // Add new state for dialog table data - move this up
  const [dialogAvailabilityData, setDialogAvailabilityData] = useState({});
  const [dialogPatternLoading, setDialogPatternLoading] = useState(false);

  // Move editWeekMonday state declaration up here
  const [editWeekMonday, setEditWeekMonday] = useState(getWeekRange().monday);

  // Update the time ranges to be hourly instead of 4-hour blocks
  const timeRanges = [
    "00:00 - 01:00",
    "01:00 - 02:00",
    "02:00 - 03:00",
    "03:00 - 04:00",
    "04:00 - 05:00",
    "05:00 - 06:00",
    "06:00 - 07:00",
    "07:00 - 08:00",
    "08:00 - 09:00",
    "09:00 - 10:00",
    "10:00 - 11:00",
    "11:00 - 12:00",
    "12:00 - 13:00",
    "13:00 - 14:00",
    "14:00 - 15:00",
    "15:00 - 16:00",
    "16:00 - 17:00",
    "17:00 - 18:00",
    "18:00 - 19:00",
    "19:00 - 20:00",
    "20:00 - 21:00",
    "21:00 - 22:00",
    "22:00 - 23:00",
    "23:00 - 24:00",
  ];

  const [editPatternDialogOpen, setEditPatternDialogOpen] = useState(false);
  const [editPatternData, setEditPatternData] = useState({
    appliedFrom: "",
    slots: [],
  });
  const [patternLoading, setPatternLoading] = useState(false);
  const [editPatternSlots, setEditPatternSlots] = useState({});

  const dayLabels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
  const dayInWeekOrder = [2, 3, 4, 5, 6, 7, 1]; // API: 2=Mon, ..., 7=Sat, 1=Sun

  const [deletePatternModalOpen, setDeletePatternModalOpen] = useState(false);
  const [patternToDelete, setPatternToDelete] = useState(null);

  // Inside TutorProfile component, after useState declarations
  const [currentWeekStart, setCurrentWeekStart] = useState(getWeekRange().monday);

  const [currentPattern, setCurrentPattern] = useState(null);

  // Add state for learner booking requests
  const [learnerRequests, setLearnerRequests] = useState([]);
  const [learnerRequestsLoading, setLearnerRequestsLoading] = useState(false);
  const [learnerRequestsError, setLearnerRequestsError] = useState(null);
  const [bookingDetailDialogOpen, setBookingDetailDialogOpen] = useState(false);
  const [bookingDetailLoading, setBookingDetailLoading] = useState(false);
  const [bookingDetailSlots, setBookingDetailSlots] = useState([]);
  const [selectedLearner, setSelectedLearner] = useState(null);
  const [selectedOfferSlots, setSelectedOfferSlots] = useState([]);
  const [selectLessonDialogOpen, setSelectLessonDialogOpen] = useState(false);
  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [offerDetail, setOfferDetail] = useState(null);
  console.log("Ọp phơ đì têu: ", offerDetail);
  
  const [dialogWeekStart, setDialogWeekStart] = useState(getWeekRange().monday);

  const [allOffers, setAllOffers] = useState([]);
  const [offersLoading, setOffersLoading] = useState(false);

  const handleDialogPrevWeek = () => {
    setDialogWeekStart(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() - 7);
      newDate.setHours(0, 0, 0, 0);
      return newDate;
    });
  };
  const handleDialogNextWeek = () => {
    setDialogWeekStart(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + 7);
      newDate.setHours(0, 0, 0, 0);
      return newDate;
    });
  };
  const isDialogAtCurrentWeek = dialogWeekStart.getTime() <= getWeekRange().monday.getTime();
  const dialogWeekInfo = getWeekDates(dialogWeekStart);

  const handlePrevWeek = () => {
    setCurrentWeekStart(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() - 7);
      newDate.setHours(0, 0, 0, 0);
      return newDate;
    });
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + 7);
      newDate.setHours(0, 0, 0, 0);
      return newDate;
    });
  };

  const handleEditPrevWeek = () => {
    setCurrentWeekStart(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() - 7);
      newDate.setHours(0, 0, 0, 0);
      return newDate;
    });
  };

  const handleEditNextWeek = () => {
    setCurrentWeekStart(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + 7);
      newDate.setHours(0, 0, 0, 0);
      return newDate;
    });
  };

  const { monday, sunday } = getWeekRange(currentWeekStart);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  // Fetch tutor data when component mounts
  useEffect(() => {
    const fetchTutorData = async () => {
      setLoading(true);
      try {
        if (!fetchTutorDetail) {
          throw new Error("Fetch tutor detail function not provided");
        }

        const response = await fetchTutorDetail(id);
        console.log("Tutor data:", response);

        if (response && response.data) {
          setTutorData(response.data);
          // If there are availability slots, set them
          if (
            response.data.availabilityPatterns &&
            response.data.availabilityPatterns.length > 0
          ) {
            setTimeSlots(response.data.availabilityPatterns);
          }

          // Fetch weekly patterns after fetching tutor data
          const patterns = await fetchTutorWeeklyPattern(id);
          setWeeklyPatterns(patterns); // Update the state with fetched patterns

          // Process the patterns to create availability data
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

          // Process slots from the API response
          if (patterns && patterns.length > 0) {
            // Sort patterns by AppliedFrom to get the most recent one
            const sortedPatterns = patterns.sort((a, b) => 
              new Date(b.appliedFrom) - new Date(a.appliedFrom)
            );
            
            // Get the most recent pattern (first after sorting)
            const latestPattern = sortedPatterns[0];
            
            if (latestPattern.slots && Array.isArray(latestPattern.slots)) {
              latestPattern.slots.forEach((slot) => {
                // Convert slotIndex to time range
                const hour = Math.floor(slot.slotIndex / 2);
                const minute = (slot.slotIndex % 2) * 30;
                
                let timeRangeKey = null;

                // Map to hourly time ranges
                const startHour = hour;
                const endHour = hour + 1;
                timeRangeKey = `${startHour.toString().padStart(2, '0')}:00 - ${endHour.toString().padStart(2, '0')}:00`;

                if (timeRangeKey && blockAvailability[timeRangeKey]) {
                  const dayMap = {
                    1: 'sun', // Sunday
                    2: 'mon', // Monday
                    3: 'tue', // Tuesday
                    4: 'wed', // Wednesday
                    5: 'thu', // Thursday
                    6: 'fri', // Friday
                    7: 'sat'  // Saturday
                  };
                  
                  const dayKey = dayMap[slot.dayInWeek];
                  if (dayKey) {
                    if (slot.type === 0) {
                      blockAvailability[timeRangeKey][dayKey] = true;
                    }
                  }
                }
              });
            }
          }

          setAvailabilityData(blockAvailability);

          // Set up availability days and dates (start from next Monday)
          const today = new Date();
          const dayOfWeek = today.getDay(); // 0 (Sun) - 6 (Sat)
          const daysUntilMonday = (dayOfWeek === 1) ? 0 : (dayOfWeek === 0 ? 1 : (8 - dayOfWeek));
          const monday = new Date(today);
          monday.setDate(today.getDate() + daysUntilMonday);

          const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
          const next7Days = [];
          const next7Dates = [];

          for (let i = 0; i < 7; i++) {
            const date = new Date(monday);
            date.setDate(monday.getDate() + i);
            next7Days.push(daysOfWeek[date.getDay()]);
            next7Dates.push(date.getDate());
          }

          setAvailabilityDays(next7Days);
          setAvailabilityDates(next7Dates);

        } else {
          throw new Error("Invalid data format received from server");
        }

      } catch (error) {
        console.error("Error fetching tutor data:", error);
        setError(error.message || "Failed to load tutor profile");
        if (error.message === "Authentication token is required") {
          onRequireLogin && onRequireLogin();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTutorData();
  }, [id, fetchTutorDetail, onRequireLogin]);

  useEffect(() => {
    if (!id) return;
    const fetchLessons = async () => {
      try {
        setLessonLoading(true);
        const data = await fetchTutorLesson(id);
        setLessons(data);
      } catch (err) {
        setLessons([]);
      } finally {
        setLessonLoading(false);
      }
    };
    fetchLessons();
  }, [id]);

  // Update the useEffect for fetching weekly patterns to also update dialog data
  useEffect(() => {
    if (!id || !currentWeekStart) return;
    const fetchAndSetWeeklyPatterns = async () => {
      setWeeklyPatternLoading(true);
      try {
        const patterns = await fetchTutorWeeklyPattern(id);
        setWeeklyPatterns(patterns);
      } catch (err) {
        console.error("Failed to fetch weekly patterns:", err);
      } finally {
        setWeeklyPatternLoading(false);
      }
    };
    fetchAndSetWeeklyPatterns();
  }, [id, currentWeekStart]);

  // Add new useEffect for dialog table data
  useEffect(() => {
    if (!currentWeekStart || !weeklyPatterns) return;
    const pattern = getPatternForWeek(weeklyPatterns, currentWeekStart);
    console.log('Main table pattern for week', currentWeekStart, pattern);
    setCurrentPattern(pattern);
    setAvailabilityData(buildAvailabilityData(pattern, timeRanges));
  }, [currentWeekStart, weeklyPatterns]);

  // Add this useEffect to sync editPatternSlots when week changes in dialog
  useEffect(() => {
    if (!editPatternDialogOpen || !currentWeekStart || !weeklyPatterns) return;
    const pattern = getPatternForWeek(weeklyPatterns, currentWeekStart);
    setEditPatternSlots(buildEditPatternSlotsFromPattern(pattern));
  }, [editPatternDialogOpen, currentWeekStart, weeklyPatterns]);

  // When opening the edit dialog, set the week to the current main table week
  const openEditPatternDialog = () => {
    // Use the pattern for the current week, not always the latest
    const patternForWeek = getPatternForWeek(weeklyPatterns, currentWeekStart) || { slots: [] };
    const slotMap = buildEditPatternSlotsFromPattern(patternForWeek);

    setEditPatternSlots(slotMap);
    setEditPatternData({
      appliedFrom: currentWeekStart.toISOString(),
      slots: patternForWeek.slots,
    });
    setEditPatternDialogOpen(true);
  };

  // Helper to get week info for the edit week
  const weekInfo = getWeekDates(currentWeekStart);

  // Function to open the delete confirmation dialog
  const openDeletePatternDialog = (patternId) => {
    setPatternToDelete(patternId);
    setDeletePatternModalOpen(true);
  };

  // After creating a new pattern, fetch the latest patterns

  // Fetch learner booking requests on mount and when id changes
  useEffect(() => {
    const fetchLearnerRequests = async () => {
      setLearnerRequestsLoading(true);
      setLearnerRequestsError(null);
      try {
        const res = await tutorBookingTimeSlotFromLearner();
        setLearnerRequests(res?.data || []);
      } catch (err) {
        setLearnerRequestsError(err.message || "Lỗi khi tải yêu cầu từ học viên");
      } finally {
        setLearnerRequestsLoading(false);
      }
    };
    fetchLearnerRequests();
  }, [id]);

  // Fetch all offers on mount (or when needed)
  useEffect(() => {
    async function fetchOffers() {
      setOffersLoading(true);
      try {
        const res = await getAllTutorBookingOffer();
        setAllOffers(res?.data || []);
      } catch (err) {
        setAllOffers([]);
      } finally {
        setOffersLoading(false);
      }
    }
    fetchOffers();
  }, []);

  // Helper to get nearest offerId for a learner
  function getNearestOfferIdForLearner(learnerId) {
    const learnerOffers = allOffers.filter(offer => offer.learner.id === learnerId);
    if (learnerOffers.length === 0) return null;
    // Sort by newest createdAt (descending)
    learnerOffers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return learnerOffers[0].id;
  }

  const handleOpenBookingDetail = async (learnerId, offerId) => {
    setDialogWeekStart(getWeekRange().monday);
    setSelectedOfferSlots([]);
    setOfferDetail(null);

    setLearnerRequests((prev) =>
      prev.map((req) =>
        req.learnerId === learnerId ? { ...req, hasUnviewed: false } : req
      )
    );

    setBookingDetailLoading(true);
    setBookingDetailDialogOpen(true);
    setSelectedLearner(learnerId);

    try {
      const res = await tutorBookingTimeSlotFromLearnerDetail(learnerId);
      setBookingDetailSlots(res?.data?.timeSlots || []);

      // --- Use nearest offerId if not provided ---
      let useOfferId = offerId;
      if (!useOfferId) {
        useOfferId = getNearestOfferIdForLearner(learnerId);
      }

      if (useOfferId) {
        const offerRes = await tutorBookingOfferDetail(useOfferId);
        setOfferDetail(offerRes?.data || null);

        if (offerRes?.data?.offeredSlots?.length > 0) {
          const firstSlotDate = new Date(offerRes.data.offeredSlots[0].slotDateTime);
          const day = firstSlotDate.getDay();
          const diff = day === 0 ? -6 : 1 - day;
          const monday = new Date(firstSlotDate);
          monday.setDate(monday.getDate() + diff);
          monday.setHours(0, 0, 0, 0);
          setDialogWeekStart(monday);
        }
      }
    } catch (err) {
      setBookingDetailSlots([]);
    } finally {
      setBookingDetailLoading(false);
    }
  };

  if (loading) {
    return (
      <Container sx={{ py: 8, textAlign: "center" }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Đang tải hồ sơ gia sư...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 8 }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          component={Link}
          to="/languages"
          sx={{ mt: 2 }}
        >
          Quay lại danh sách gia sư
        </Button>
      </Container>
    );
  }

  if (!tutorData) {
    return (
      <Container sx={{ py: 8 }}>
        <Alert severity="warning">
          Không có dữ liệu gia sư. Gia sư có thể đã bị xóa hoặc không còn hoạt
          động.
        </Alert>
        <Button
          variant="contained"
          component={Link}
          to="/languages"
          sx={{ mt: 2 }}
        >
          Quay lại danh sách gia sư
        </Button>
      </Container>
    );
  }

  const verificationInfo = getVerificationStatus(tutorData.verificationStatus);

  return (
    <>
      {globalStyles}
      <Container
        maxWidth="lg"
        sx={{
          py: 6,
          backgroundColor: "#f8fafc",
          minHeight: "100vh",
          width: "100%",
          maxWidth: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Grid
          container
          spacing={4}
          sx={{
            width: "100%",
            flex: "1 1 auto",
            margin: 0,
          }}
        >
          {/* Left Column */}
          <Grid
            item
            xs={12}
            md={4}
            sx={{ display: "flex", flexDirection: "column", width: "100%" }}
          >
            <StyledPaper
              sx={{
                textAlign: "center",
                position: "relative",
                p: 4,
                width: "100%",
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  pb: 2,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Box
                  sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  {tutorData.profilePictureUrl ? (
                    <LargeAvatar
                      src={tutorData.profilePictureUrl}
                      alt={tutorData.fullName}
                    />
                  ) : (
                    <LargeAvatar>
                      {tutorData.fullName
                        ? tutorData.fullName.charAt(0).toUpperCase()
                        : "N"}
                    </LargeAvatar>
                  )}
                </Box>

                <Typography
                  variant="h4"
                  sx={{
                    mt: 2,
                    fontWeight: 700,
                    color: "#1e293b",
                    width: "100%",
                    textAlign: "center",
                  }}
                >
                  {tutorData.nickName || tutorData.fullName}
                </Typography>

                {tutorData.nickName &&
                  tutorData.fullName !== tutorData.nickName && (
                    <Typography
                      variant="body1"
                      sx={{
                        mt: 1,
                        color: "#64748b",
                        width: "100%",
                        textAlign: "center",
                      }}
                    >
                      ({tutorData.fullName})
                    </Typography>
                  )}

                <Box
                  sx={{
                    mt: 3,
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <VerificationBadge status={tutorData.verificationStatus}>
                    {getVerificationStatus(tutorData.verificationStatus).label}
                  </VerificationBadge>
                </Box>
              </Box>
            </StyledPaper>
          </Grid>

          {/* Right Column - Tabs */}
          <Grid
            item
            xs={12}
            md={8}
            sx={{
              display: "flex",
              flexDirection: "column",
              minWidth: 0,
              width: "100%",
            }}
          >
            <StyledPaper
              sx={{
                p: 0,
                minHeight: "700px",
                width: "100%",
                maxWidth: "100%",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box
                sx={{
                  width: "100%",
                  maxWidth: "100%",
                  flex: "0 0 auto",
                }}
              >
                <Tabs
                  value={selectedTab}
                  onChange={handleTabChange}
                  aria-label="tutor profile tabs"
                  variant="fullWidth"
                  sx={{
                    borderBottom: "2px solid #f1f5f9",
                    "& .MuiTabs-indicator": {
                      backgroundColor: "#3b82f6",
                      height: "4px",
                      borderRadius: "2px 2px 0 0",
                    },
                    "& .MuiTab-root": {
                      color: "#64748b",
                      fontWeight: 600,
                      textTransform: "none",
                      fontSize: "1.1rem",
                      padding: "16px 24px",
                      minHeight: "64px",
                      transition: "all 0.3s ease",
                      "&:focus": {
                        outline: "none",
                      },
                      "&.Mui-selected": {
                        color: "#3b82f6",
                        fontWeight: 700,
                      },
                      "&:hover": {
                        color: "#3b82f6",
                        backgroundColor: "#f8fafc",
                      },
                    },
                  }}
                >
                  <Tab label="Thông tin chung" />
                  <Tab label="Kỹ năng & Ngôn ngữ" />
                </Tabs>
              </Box>
              <Box
                sx={{
                  p: 4,
                  width: "100%",
                  maxWidth: "100%",
                  boxSizing: "border-box",
                  flex: "1 1 auto",
                  minWidth: 0, // This prevents flex child from shrinking below content size
                }}
              >
                {selectedTab === 0 && (
                  <Box
                    sx={{
                      width: "100%",
                      maxWidth: "100%",
                      overflow: "hidden",
                      minWidth: 0,
                      flex: "1 1 auto",
                      display: "flex",
                      flexDirection: "column",
                    }}
                    role="tabpanel"
                    hidden={selectedTab !== 0}
                  >
                    {/* Content for Tab 1: Email, Giới thiệu về tôi, Phương pháp giảng dạy, Lịch trình khả dụng, Câu hỏi thường gặp */}
                    <Box
                      sx={{
                        textAlign: "left",
                        width: "100%",
                        maxWidth: "100%",
                        mb: 4,
                        minWidth: 0,
                        flex: "0 0 auto",
                      }}
                    >
                      <SectionTitle variant="h6">Email</SectionTitle>
                      <Box
                        sx={{
                          p: 3,
                          backgroundColor: "#f8fafc",
                          borderRadius: "12px",
                          border: "1px solid #e2e8f0",
                          width: "100%",
                          maxWidth: "100%",
                          boxSizing: "border-box",
                        }}
                      >
                        <Typography
                          variant="body1"
                          sx={{
                            color: "#475569",
                            wordBreak: "break-word",
                            fontWeight: 500,
                          }}
                        >
                          {tutorData.email}
                        </Typography>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        textAlign: "left",
                        width: "100%",
                        maxWidth: "100%",
                        mb: 4,
                        minWidth: 0,
                        flex: "0 0 auto",
                      }}
                    >
                      <SectionTitle variant="h6">
                        Giới thiệu về tôi
                      </SectionTitle>
                      <Box
                        sx={{
                          p: 3,
                          backgroundColor: "#ffffff",
                          borderRadius: "12px",
                          border: "1px solid #e2e8f0",
                          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
                          width: "100%",
                          maxWidth: "100%",
                          boxSizing: "border-box",
                        }}
                      >
                        {tutorData.brief && (
                          <Typography
                            variant="h6"
                            sx={{
                              mb: 3,
                              fontWeight: 600,
                              color: "#1e40af",
                              fontStyle: "italic",
                              fontSize: "1.1rem",
                            }}
                          >
                            "{tutorData.brief}"
                          </Typography>
                        )}

                        <Typography
                          variant="body1"
                          sx={{
                            whiteSpace: "pre-line",
                            color: "#334155",
                            lineHeight: 1.7,
                            fontSize: "1rem",
                          }}
                        >
                          {tutorData.description ||
                            "Không có mô tả nào được cung cấp."}
                        </Typography>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        textAlign: "left",
                        width: "100%",
                        maxWidth: "100%",
                        mb: 4,
                        minWidth: 0,
                        flex: "0 0 auto",
                      }}
                    >
                      <SectionTitle variant="h6">
                        Phương pháp giảng dạy
                      </SectionTitle>
                      <Box
                        sx={{
                          p: 3,
                          backgroundColor: "#ffffff",
                          borderRadius: "12px",
                          border: "1px solid #e2e8f0",
                          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
                          width: "100%",
                          maxWidth: "100%",
                          boxSizing: "border-box",
                        }}
                      >
                        <Typography
                          variant="body1"
                          sx={{
                            whiteSpace: "pre-line",
                            color: "#334155",
                            lineHeight: 1.7,
                            fontSize: "1rem",
                          }}
                        >
                          {tutorData.teachingMethod ||
                            "Không có thông tin phương pháp giảng dạy nào được cung cấp."}
                        </Typography>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        textAlign: "left",
                        width: "100%",
                        maxWidth: "100%",
                        mb: 4,
                        minWidth: 0,
                        flex: "0 0 auto",
                      }}
                    >
                      <SectionTitle variant="h6">
                        Lịch trình khả dụng
                      </SectionTitle>

                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2, gap: 4 }}>
                        {/* Week range and navigation */}
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <IconButton
                            onClick={handlePrevWeek}
                            sx={{
                              p: 1,
                              borderRadius: "50%",
                              backgroundColor: "#f3f4f6",
                              "&:hover": { backgroundColor: "#e5e7eb" },
                              boxShadow: "none",
                            }}
                            aria-label="Previous week"
                          >
                            <FaChevronLeft size={20} color="#333" />
                          </IconButton>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {formatDateRange(monday, sunday)}
                          </Typography>
                          <IconButton
                            onClick={handleNextWeek}
                            sx={{
                              p: 1,
                              borderRadius: "50%",
                              backgroundColor: "#f3f4f6",
                              "&:hover": { backgroundColor: "#e5e7eb" },
                              boxShadow: "none",
                            }}
                            aria-label="Next week"
                          >
                            <FaChevronRight size={20} color="#333" />
                          </IconButton>
                        </Box>
                        {/* Buttons */}
                        <Box sx={{ display: "flex", gap: 2 }}>
                          {weeklyPatterns && weeklyPatterns.length > 0 ? (
                            <>
                              <StyledButton onClick={openEditPatternDialog}>
                                Chỉnh sửa lịch trình
                              </StyledButton>
                              <RedStyledButton onClick={() => openDeletePatternDialog(weeklyPatterns[0]?.id)}>
                                Xóa lịch trình
                              </RedStyledButton>
                            </>
                          ) : (
                            <StyledButton onClick={openEditPatternDialog}>
                              Tạo lịch trình
                            </StyledButton>
                          )}
                        </Box>
                      </Box>

                      {weeklyPatternLoading ? (
                        <WeeklyScheduleSkeleton />
                      ) : (
                        <Box
                          sx={{
                            backgroundColor: "#ffffff",
                            borderRadius: "12px",
                            border: "1px solid #e2e8f0",
                            overflow: "hidden",
                            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
                            width: "100%",
                            maxWidth: "100%",
                            boxSizing: "border-box",
                          }}
                        >
                          {/* Enhanced Weekly Schedule Grid */}
                          <Box
                            sx={{
                              overflowX: "auto",
                              border: "1px solid #e2e8f0",
                              borderRadius: "8px",
                              maxHeight: "600px", // Add max height for scrolling
                            }}
                          >
                            <Box
                              sx={{
                                display: "grid",
                                gridTemplateColumns: "140px repeat(7, 1fr)", // Adjusted width for weekdays
                                minWidth: "600px",
                              }}
                            >
                              {/* Header row */}
                              <Box
                                sx={{
                                  p: 1.5, // Reduced padding
                                  backgroundColor: "#f8fafc",
                                  borderBottom: "1px solid #e2e8f0",
                                  borderRight: "1px solid #e2e8f0",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontWeight: 600,
                                  color: "#1e293b",
                                  fontSize: "0.875rem", // Smaller font
                                  position: "sticky",
                                  top: 0,
                                  zIndex: 1,
                                }}
                              >
                                Thời gian
                              </Box>
                              {weekInfo.map((d, i) => (
                                <Box
                                  key={i}
                                  sx={{
                                    p: 1.5,
                                    backgroundColor: "#f8fafc",
                                    borderBottom: "1px solid #e2e8f0",
                                    borderRight: i === weekInfo.length - 1 ? "none" : "1px solid #e2e8f0",
                                    textAlign: "center",
                                    fontWeight: 600,
                                    color: "#1e293b",
                                    fontSize: "0.875rem",
                                    position: "sticky",
                                    top: 0,
                                    zIndex: 1,
                                  }}
                                >
                                  <Box sx={{ fontSize: "0.75rem" }}>{d.label}</Box>
                                  <Box sx={{ fontSize: "0.625rem", color: "#64748b", mt: 0.25 }}>{d.date}</Box>
                                </Box>
                              ))}

                              {/* Time slots */}
                              {Array.from({ length: 48 }).map((_, slotIdx) => {
                                const hour = Math.floor(slotIdx / 2);
                                const minute = slotIdx % 2 === 0 ? "00" : "30";
                                const nextHour = slotIdx % 2 === 0 ? hour : hour + 1;
                                const nextMinute = slotIdx % 2 === 0 ? "30" : "00";
                                const timeLabel = `${hour.toString().padStart(2, "0")}:${minute} - ${nextHour.toString().padStart(2, "0")}:${nextMinute}`;

                                return (
                                  <React.Fragment key={slotIdx}>
                                    {/* Time label cell */}
                                    <Box
                                      sx={{
                                        p: 1,
                                        textAlign: "center",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        borderBottom: "1px solid #e2e8f0",
                                        borderRight: "1px solid #e2e8f0",
                                        minHeight: 32,
                                      }}
                                    >
                                      {timeLabel}
                                    </Box>
                                    {/* For each day, render a cell for this 30-min slot */}
                                    {dayInWeekOrder.map((dayInWeek, dayIdx) => {
                                      const isActive = !!(currentPattern?.slots || []).find(
                                        slot => slot.dayInWeek === dayInWeek && slot.slotIndex === slotIdx
                                      );
                                      return (
                                        <Box
                                          key={dayIdx}
                                          sx={{
                                            backgroundColor: isActive ? "#98D45F" : "#f1f5f9",
                                            border: "1px solid #e2e8f0",
                                            minHeight: 32,
                                          }}
                                        />
                                      );
                                    })}
                                  </React.Fragment>
                                );
                              })}
                            </Box>
                          </Box>

                          {/* Legend and additional info */}
                          <Box
                            sx={{
                              p: 3,
                              backgroundColor: "#f8fafc",
                              borderTop: "1px solid #e2e8f0",
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 3,
                                mb: 2,
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <Box
                                  sx={{
                                    width: "6px", // Smaller indicator
                                    height: "6px",
                                    borderRadius: "50%",
                                    backgroundColor: "#98D45F",
                                  }}
                                />
                                <Typography variant="body2" sx={{ color: "#475569" }}>
                                  Có sẵn
                                </Typography>
                              </Box>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <Box
                                  sx={{
                                    width: "6px", // Smaller indicator
                                    height: "6px",
                                    borderRadius: "50%",
                                    backgroundColor: "#e2e8f0",
                                  }}
                                />
                                <Typography variant="body2" sx={{ color: "#475569" }}>
                                  Không có sẵn
                                </Typography>
                              </Box>
                            </Box>
                            
                            <Typography variant="body2" sx={{ color: "#64748b", fontSize: "0.875rem" }}>
                              Dựa trên múi giờ của bạn (UTC+07:00) • Cập nhật lần cuối: {weeklyPatterns.length > 0 ? new Date(weeklyPatterns.sort((a, b) => new Date(b.appliedFrom) - new Date(a.appliedFrom))[0].appliedFrom).toLocaleDateString('vi-VN') : 'Không xác định'}
                            </Typography>
                            
                            {/* Show pattern count for debugging */}
                            {/* <Typography variant="body2" sx={{ color: "#64748b", fontSize: "0.75rem", mt: 1 }}>
                              Số lượng mẫu lịch trình: {weeklyPatterns.length}
                            </Typography> */}
                          </Box>
                        </Box>
                      )}
                    </Box>
                    <Box
                      sx={{
                        textAlign: "left",
                        width: "100%",
                        maxWidth: "100%",
                        mb: 4,
                        minWidth: 0,
                        flex: "0 0 auto",
                      }}
                    >
                      <SectionTitle variant="h6">Yêu Cầu Từ Học Viên</SectionTitle>
                      <Box sx={{ p: 2, backgroundColor: "#fff", borderRadius: 2, border: "1px solid #e2e8f0" }}>
                        {learnerRequestsLoading ? (
                          <TableContainer component={Paper}>
                            <Table>
                              <TableHead>
                                <TableRow>
                                  <TableCell>Thời gian</TableCell>
                                  <TableCell>Thứ 2</TableCell>
                                  <TableCell>Thứ 3</TableCell>
                                  <TableCell>Thứ 4</TableCell>
                                  <TableCell>Thứ 5</TableCell>
                                  <TableCell>Thứ 6</TableCell>
                                  <TableCell>Thứ 7</TableCell>
                                  <TableCell>CN</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {Array.from({ length: 16 }).map((_, idx) => (
                                  <TableRow key={idx}>
                                    <TableCell>
                                      <Skeleton variant="text" width="80%" height={24} />
                                    </TableCell>
                                    {Array.from({ length: 7 }).map((__, dayIdx) => (
                                      <TableCell key={dayIdx}>
                                        <Skeleton variant="rectangular" width="80%" height={24} />
                                      </TableCell>
                                    ))}
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        ) : learnerRequestsError ? (
                          <Alert severity="error">{learnerRequestsError}</Alert>
                        ) : (
                          <TableContainer component={Paper}>
                            <Table>
                              <TableHead>
                                <TableRow>
                                  <TableCell>Học viên</TableCell>
                                  <TableCell>Trạng thái</TableCell>
                                  <TableCell>Thời gian yêu cầu mới nhất</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {learnerRequests.length === 0 ? (
                                  <TableRow>
                                    <TableCell colSpan={4} align="center">
                                      Không có yêu cầu nào từ học viên.
                                    </TableCell>
                                  </TableRow>
                                ) : (
                                  learnerRequests.map((req) => (
                                    <TableRow
                                      key={req.learnerId}
                                      hover
                                      sx={{ cursor: "pointer" }}
                                      onClick={() => handleOpenBookingDetail(req.learnerId, req.offerId)}
                                    >
                                      <TableCell>{req.learnerName}</TableCell>
                                      <TableCell>
                                        {req.hasUnviewed ? (
                                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                            <Tooltip title="Yêu cầu mới, chưa xem">
                                              <Avatar sx={{ bgcolor: "#ff9800", width: 18, height: 18, fontSize: 18 }}>
                                                <FiPlusCircle />
                                              </Avatar>
                                            </Tooltip>
                                            <Typography sx={{ color: "#ff9800", fontWeight: 700 }}>Chưa xem</Typography>
                                          </Box>
                                        ) : (
                                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                            <Tooltip title="Đã xem yêu cầu này">
                                              <Avatar sx={{ bgcolor: "#4caf50", width: 18, height: 18, fontSize: 18 }}>
                                                <FiCheck />
                                              </Avatar>
                                            </Tooltip>
                                            <Typography sx={{ color: "#4caf50", fontWeight: 500 }}>Đã xem</Typography>
                                          </Box>
                                        )}
                                      </TableCell>
                                      <TableCell>
                                        {req.latestRequestTime ? new Date(req.latestRequestTime).toLocaleString("vi-VN") : "-"}
                                      </TableCell>
                                    </TableRow>
                                  ))
                                )}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        )}
                      </Box>
                    </Box>

                    {/* Tạo bài học Section */}
                    <Box
                      sx={{
                        textAlign: "left",
                        width: "100%",
                        maxWidth: "100%",
                        mb: 4,
                      }}
                    >
                      <SectionTitle variant="h6">Tạo bài học</SectionTitle>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "flex-end",
                          mb: 2,
                        }}
                      >
                        <StyledButton
                          onClick={() => {
                            setEditLesson(null);
                            setLessonDialogOpen(true);
                          }}
                        >
                          <FiPlusCircle style={{ marginRight: 8 }} />
                          Tạo bài học
                        </StyledButton>
                      </Box>
                      <TableContainer component={Paper}>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Tên bài học</TableCell>
                              <TableCell>Ngôn ngữ</TableCell>
                              <TableCell>Giá</TableCell>
                              <TableCell>Đối tượng</TableCell>
                              <TableCell>Mô tả</TableCell>
                              <TableCell align="right" />
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {lessons && lessons.length > 0 ? (
                              lessons.map((lesson) => (
                                <TableRow key={lesson.id}>
                                  <TableCell>{lesson.name}</TableCell>
                                  <TableCell>{formatLanguageCode(lesson.languageCode)}</TableCell>
                                  <TableCell>
                                    {formatPriceWithCommas(String(lesson.price))} VND
                                  </TableCell>
                                  <TableCell>{lesson.targetAudience}</TableCell>
                                  <TableCell
                                    sx={{
                                      maxWidth: 180,
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                    }}
                                  >
                                    {lesson.description}
                                  </TableCell>
                                  <TableCell align="right">
                                    <Button
                                      variant="outlined"
                                      size="small"
                                      sx={{ mr: 1 }}
                                      onClick={() => {
                                        setEditLesson(lesson);
                                        setLessonForm({ ...lesson });
                                        setLessonDialogOpen(true);
                                      }}
                                    >
                                      Sửa
                                    </Button>
                                    <Button
                                      variant="contained"
                                      color="error"
                                      size="small"
                                      onClick={() => {
                                        setLessonToDelete(lesson);
                                        setDeleteModalOpen(true);
                                      }}
                                    >
                                      Xóa
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={6} align="center">
                                  Không có bài học nào.
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>

                    <Box
                      sx={{
                        textAlign: "left",
                        width: "100%",
                        maxWidth: "100%",
                        minWidth: 0,
                        flex: "0 0 auto",
                      }}
                    >
                      <SectionTitle variant="h6">
                        Câu hỏi thường gặp
                      </SectionTitle>

                      <Accordion
                        sx={{
                          mb: 2,
                          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
                          border: "1px solid #e2e8f0",
                          borderRadius: "12px !important",
                          "&:before": {
                            display: "none",
                          },
                          "&.Mui-expanded": {
                            margin: "0 0 16px 0",
                          },
                        }}
                      >
                        <AccordionSummary
                          expandIcon={
                            <Box
                              sx={{
                                width: "24px",
                                height: "24px",
                                borderRadius: "50%",
                                backgroundColor: "#3b82f6",
                                color: "white",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "14px",
                              }}
                            >
                              ▼
                            </Box>
                          }
                          sx={{
                            borderRadius: "12px",
                            py: 2,
                            "&:focus": {
                              outline: "none",
                            },
                          }}
                        >
                          <Typography
                            sx={{
                              fontWeight: 600,
                              color: "#1e293b",
                              fontSize: "1rem",
                            }}
                          >
                            Làm cách nào để đặt lịch học với gia sư này?
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{ pt: 0, pb: 3 }}>
                          <Typography
                            variant="body1"
                            sx={{ color: "#64748b", lineHeight: 1.6 }}
                          >
                            Bạn có thể đặt lịch học bằng cách nhấp vào nút "Đặt
                            lịch buổi học" trên hồ sơ của gia sư. Chọn một khung
                            thời gian có sẵn từ lịch trình của gia sư và xác
                            nhận việc đặt lịch của bạn.
                          </Typography>
                        </AccordionDetails>
                      </Accordion>

                      <Accordion
                        sx={{
                          mb: 2,
                          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
                          border: "1px solid #e2e8f0",
                          borderRadius: "12px !important",
                          "&:before": {
                            display: "none",
                          },
                          "&.Mui-expanded": {
                            margin: "0 0 16px 0",
                          },
                        }}
                      >
                        <AccordionSummary
                          expandIcon={
                            <Box
                              sx={{
                                width: "24px",
                                height: "24px",
                                borderRadius: "50%",
                                backgroundColor: "#3b82f6",
                                color: "white",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "14px",
                              }}
                            >
                              ▼
                            </Box>
                          }
                          sx={{
                            borderRadius: "12px",
                            py: 2,
                            "&:focus": {
                              outline: "none",
                            },
                          }}
                        >
                          <Typography
                            sx={{
                              fontWeight: 600,
                              color: "#1e293b",
                              fontSize: "1rem",
                            }}
                          >
                            Những phương thức thanh toán nào được chấp nhận?
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{ pt: 0, pb: 3 }}>
                          <Typography
                            variant="body1"
                            sx={{ color: "#64748b", lineHeight: 1.6 }}
                          >
                            Chúng tôi chấp nhận thẻ tín dụng/ghi nợ, PayPal và
                            chuyển khoản ngân hàng. Tất cả các giao dịch đều
                            được bảo mật và mã hóa.
                          </Typography>
                        </AccordionDetails>
                      </Accordion>

                      <Accordion
                        sx={{
                          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
                          border: "1px solid #e2e8f0",
                          borderRadius: "12px !important",
                          "&:before": {
                            display: "none",
                          },
                        }}
                      >
                        <AccordionSummary
                          expandIcon={
                            <Box
                              sx={{
                                width: "24px",
                                height: "24px",
                                borderRadius: "50%",
                                backgroundColor: "#3b82f6",
                                color: "white",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "14px",
                              }}
                            >
                              ▼
                            </Box>
                          }
                          sx={{
                            borderRadius: "12px",
                            py: 2,
                            "&:focus": {
                              outline: "none",
                            },
                          }}
                        >
                          <Typography
                            sx={{
                              fontWeight: 600,
                              color: "#1e293b",
                              fontSize: "1rem",
                            }}
                          >
                            Chính sách hủy bỏ là gì?
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{ pt: 0, pb: 3 }}>
                          <Typography
                            variant="body1"
                            sx={{ color: "#64748b", lineHeight: 1.6 }}
                          >
                            Bạn có thể hủy hoặc đổi lịch học lên đến 24 giờ
                            trước thời gian đã đặt mà không bị phạt. Việc hủy
                            muộn có thể dẫn đến việc tính phí một phần.
                          </Typography>
                        </AccordionDetails>
                      </Accordion>
                    </Box>

                    {/* Insert new section here: Yêu cầu từ học viên */}
                    
                  </Box>
                )}

                {selectedTab === 1 && (
                  <Box
                    sx={{
                      width: "100%",
                      maxWidth: "100%",
                      overflow: "hidden",
                      minWidth: 0,
                      flex: "1 1 auto",
                      display: "flex",
                      flexDirection: "column",
                    }}
                    role="tabpanel"
                    hidden={selectedTab !== 1}
                  >
                    {/* Content for Tab 2: Ngôn ngữ giảng dạy, Chứng chỉ & Kỹ năng */}
                    <Box
                      sx={{
                        textAlign: "left",
                        width: "100%",
                        maxWidth: "100%",
                        mb: 4,
                        minWidth: 0,
                        flex: "0 0 auto",
                      }}
                    >
                      <SectionTitle variant="h6">
                        Tải lên chứng chỉ
                      </SectionTitle>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "100%",
                          maxWidth: "100%",
                          boxSizing: "border-box",
                        }}
                      >
                        <Box
                          component="label"
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            width: "100%",
                            maxWidth: "100%",
                            height: "160px",
                            border: "2px dashed #3b82f6",
                            borderRadius: "16px",
                            cursor: "pointer",
                            backgroundColor: "#f8fafc",
                            transition: "all 0.3s ease",
                            boxSizing: "border-box",
                            "&:hover": {
                              backgroundColor: "#f0f9ff",
                              borderColor: "#2563eb",
                              transform: "translateY(-2px)",
                              boxShadow: "0 8px 25px rgba(59, 130, 246, 0.15)",
                            },
                            "&:focus": {
                              outline: "none",
                              boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.2)",
                            },
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                              height: "100%",
                              p: 3,
                            }}
                          >
                            <Box
                              sx={{
                                width: "48px",
                                height: "48px",
                                color: "#3b82f6",
                                mb: 2,
                              }}
                            >
                              <svg
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                />
                              </svg>
                            </Box>
                            <Typography
                              variant="body1"
                              sx={{
                                mb: 1,
                                color: "#3b82f6",
                                fontWeight: 600,
                              }}
                            >
                              <span>Nhấp để tải lên</span> hoặc kéo và thả
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                color: "#64748b",
                              }}
                            >
                              PDF (Tối đa 25MB)
                            </Typography>
                          </Box>
                          <input
                            type="file"
                            name="profilePhoto"
                            style={{ display: "none" }}
                            accept="image/*"
                            onChange={handleFileChange}
                            required
                          />
                        </Box>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        textAlign: "left",
                        width: "100%",
                        maxWidth: "100%",
                        mb: 4,
                        minWidth: 0,
                        flex: "0 0 auto",
                      }}
                    >
                      <SectionTitle variant="h6">
                        Ngôn ngữ giảng dạy
                      </SectionTitle>
                      {tutorData.languages && tutorData.languages.length > 0 ? (
                        tutorData.languages.map((lang, index) => (
                          <Box
                            key={index}
                            sx={{
                              mb: 3,
                              p: 3,
                              backgroundColor: "#ffffff",
                              borderRadius: "16px",
                              border: "1px solid #e2e8f0",
                              width: "100%",
                              maxWidth: "100%",
                              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
                              transition: "all 0.3s ease",
                              boxSizing: "border-box",
                              "&:hover": {
                                boxShadow: "0 8px 25px rgba(0, 0, 0, 0.08)",
                                transform: "translateY(-2px)",
                              },
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                mb: 2,
                              }}
                            >
                              <Typography
                                variant="h6"
                                sx={{
                                  fontWeight: 700,
                                  color: "#1e293b",
                                  fontSize: "1.25rem",
                                }}
                              >
                                {getLanguageName(lang.languageCode)}
                              </Typography>
                              {lang.isPrimary && (
                                <Chip
                                  label="Chính"
                                  size="small"
                                  sx={{
                                    height: "28px",
                                    fontSize: "0.75rem",
                                    backgroundColor: "#3b82f6",
                                    color: "white",
                                    fontWeight: 700,
                                    borderRadius: "14px",
                                  }}
                                />
                              )}
                            </Box>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <Rating
                                value={lang.proficiency}
                                max={7}
                                readOnly
                                size="medium"
                                sx={{
                                  mr: 2,
                                  "& .MuiRating-iconFilled": {
                                    color: "#f59e0b",
                                  },
                                  "& .MuiRating-iconEmpty": {
                                    color: "#d1d5db",
                                  },
                                }}
                              />
                              <Typography
                                variant="body1"
                                sx={{
                                  color: "#64748b",
                                  fontWeight: 500,
                                }}
                              >
                                {getProficiencyLabel(lang.proficiency)}
                              </Typography>
                            </Box>
                          </Box>
                        ))
                      ) : (
                        <Box
                          sx={{
                            p: 4,
                            backgroundColor: "#f8fafc",
                            borderRadius: "16px",
                            border: "1px solid #e2e8f0",
                            textAlign: "center",
                          }}
                        >
                          <Typography
                            variant="body1"
                            sx={{ color: "#64748b", fontStyle: "italic" }}
                          >
                            Không có thông tin ngôn ngữ
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    <Box
                      sx={{
                        textAlign: "left",
                        width: "100%",
                        maxWidth: "100%",
                        minWidth: 0,
                        flex: "0 0 auto",
                      }}
                    >
                      <SectionTitle variant="h6">
                        Chứng chỉ & Kỹ năng
                      </SectionTitle>
                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "12px",
                          mt: 2,
                          width: "100%",
                          maxWidth: "100%",
                          boxSizing: "border-box",
                        }}
                      >
                        {tutorData.hashtags && tutorData.hashtags.length > 0 ? (
                          tutorData.hashtags.map((tag) => (
                            <Chip
                              key={tag.id}
                              label={tag.name}
                              title={tag.description}
                              sx={{
                                backgroundColor: "#f0f9ff",
                                color: "#1e40af",
                                borderRadius: "12px",
                                height: "40px",
                                fontWeight: 600,
                                border: "1px solid #dbeafe",
                                fontSize: "0.875rem",
                                px: 2,
                                transition: "all 0.2s ease",
                                "&:hover": {
                                  backgroundColor: "#dbeafe",
                                  transform: "translateY(-1px)",
                                  boxShadow:
                                    "0 4px 12px rgba(30, 64, 175, 0.15)",
                                },
                                "&:focus": {
                                  outline: "none",
                                  boxShadow: "0 0 0 2px rgba(30, 64, 175, 0.2)",
                                },
                              }}
                            />
                          ))
                        ) : (
                          <Box
                            sx={{
                              width: "100%",
                              maxWidth: "100%",
                              p: 4,
                              backgroundColor: "#f8fafc",
                              borderRadius: "16px",
                              border: "1px solid #e2e8f0",
                              textAlign: "center",
                              boxSizing: "border-box",
                            }}
                          >
                            <Typography
                              variant="body1"
                              sx={{ color: "#64748b", fontStyle: "italic" }}
                            >
                              Không có chứng chỉ nào được liệt kê
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Box>
                )}
              </Box>
            </StyledPaper>
          </Grid>
        </Grid>
      </Container>

      <Dialog
        open={lessonDialogOpen}
        onClose={() => setLessonDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{editLesson ? "Sửa bài học" : "Tạo bài học"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Tên bài học"
            fullWidth
            margin="normal"
            value={lessonForm.name}
            onChange={(e) =>
              setLessonForm({ ...lessonForm, name: e.target.value })
            }
            required
            error={!lessonForm.name && showValidation}
            helperText={!lessonForm.name && showValidation ? "Vui lòng nhập tên bài học" : ""}
          />
          <TextField
            label="Mô tả"
            fullWidth
            margin="normal"
            value={lessonForm.description}
            onChange={(e) =>
              setLessonForm({ ...lessonForm, description: e.target.value })
            }
            required
            error={!lessonForm.description && showValidation}
            helperText={!lessonForm.description && showValidation ? "Vui lòng nhập mô tả" : ""}
          />
          <TextField
            label="Ghi chú"
            fullWidth
            margin="normal"
            value={lessonForm.note}
            onChange={(e) =>
              setLessonForm({ ...lessonForm, note: e.target.value })
            }
          />
          <TextField
            label="Đối tượng"
            fullWidth
            margin="normal"
            value={lessonForm.targetAudience}
            onChange={(e) =>
              setLessonForm({ ...lessonForm, targetAudience: e.target.value })
            }
            required
            error={!lessonForm.targetAudience && showValidation}
            helperText={!lessonForm.targetAudience && showValidation ? "Vui lòng nhập đối tượng" : ""}
          />
          <TextField
            label="Yêu cầu trước"
            fullWidth
            margin="normal"
            value={lessonForm.prerequisites}
            onChange={(e) =>
              setLessonForm({ ...lessonForm, prerequisites: e.target.value })
            }
            required
            error={!lessonForm.prerequisites && showValidation}
            helperText={!lessonForm.prerequisites && showValidation ? "Vui lòng nhập yêu cầu trước" : ""}
          />
          <FormControl fullWidth margin="normal" required error={!lessonForm.languageCode && showValidation}>
            <InputLabel id="language-select-label">Ngôn ngữ</InputLabel>
            <Select
              labelId="language-select-label"
              value={lessonForm.languageCode}
              label="Ngôn ngữ"
              onChange={(e) =>
                setLessonForm({ ...lessonForm, languageCode: e.target.value })
              }
            >
              {languageList.map((lang) => (
                <MenuItem key={lang.code} value={lang.code}>
                  {lang.name}
                </MenuItem>
              ))}
            </Select>
            {!lessonForm.languageCode && showValidation && (
              <Typography color="error" variant="caption">Vui lòng chọn ngôn ngữ</Typography>
            )}
          </FormControl>
          <TextField
            label="Danh mục"
            fullWidth
            margin="normal"
            value={lessonForm.category}
            onChange={(e) =>
              setLessonForm({ ...lessonForm, category: e.target.value })
            }
            required
            error={!lessonForm.category && showValidation}
            helperText={!lessonForm.category && showValidation ? "Vui lòng nhập danh mục" : ""}
          />
          <TextField
            label="Giá"
            type="text"
            fullWidth
            margin="normal"
            value={lessonForm.price}
            onChange={(e) => {
              const formatted = formatPriceInputWithCommas(e.target.value);
              setLessonForm({ ...lessonForm, price: formatted });
            }}
            required
            error={!lessonForm.price && showValidation}
            helperText={!lessonForm.price && showValidation ? "Vui lòng nhập giá tiền" : ""}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLessonDialogOpen(false)}>Hủy</Button>
          <Button
            variant="contained"
            onClick={async () => {
              setShowValidation(true);
              if (
                !lessonForm.name ||
                !lessonForm.description ||
                !lessonForm.targetAudience ||
                !lessonForm.prerequisites ||
                !lessonForm.languageCode ||
                !lessonForm.category ||
                !lessonForm.price
              ) {
                return;
              }
              setLessonLoading(true);
              try {
                // Prepare lesson data with price as a number
                const lessonData = {
                  ...lessonForm,
                  price: Number(lessonForm.price.replace(/,/g, "")), // <-- convert to number
                };

                if (editLesson) {
                  await updateLesson(editLesson.id, lessonData);
                  setLessons(
                    lessons.map((l) =>
                      l.id === editLesson.id ? { ...l, ...lessonData } : l
                    )
                  );
                } else {
                  const res = await createLesson(lessonData);
                  setLessons([...lessons, res.data]);
                }
                setLessonDialogOpen(false);
                setShowValidation(false);
              } catch (err) {
                alert("Lưu bài học thất bại: " + err.message);
              } finally {
                setLessonLoading(false);
              }
            }}
            disabled={lessonLoading}
          >
            {editLesson ? "Lưu bài học" : "Tạo bài học"}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={async () => {
          setLessonLoading(true);
          try {
            await deleteLesson(lessonToDelete.id);
            setLessons(lessons.filter((l) => l.id !== lessonToDelete.id));
            setDeleteModalOpen(false);
          } catch (err) {
            alert("Xóa bài học thất bại: " + err.message);
          } finally {
            setLessonLoading(false);
          }
        }}
        title="Xác nhận xóa bài học"
        description={
          lessonToDelete?.name
            ? `Bạn có chắc chắn muốn xóa bài học "${lessonToDelete.name}" không? Hành động này không thể hoàn tác.`
            : "Bạn có chắc chắn muốn xóa bài học này không? Hành động này không thể hoàn tác."
        }
        confirmText="Xóa"
        cancelText="Hủy"
        confirmColor="error"
      />

      <Dialog
        open={editPatternDialogOpen}
        onClose={() => setEditPatternDialogOpen(false)}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: { minWidth: 1100 }
        }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton
              onClick={handleDialogPrevWeek}
              disabled={isDialogAtCurrentWeek}
              sx={{
                p: 1,
                borderRadius: "50%",
                backgroundColor: isDialogAtCurrentWeek ? "#f3f4f6" : "#e5e7eb",
                "&:hover": { backgroundColor: "#e5e7eb" },
                boxShadow: "none",
              }}
              aria-label="Previous week"
            >
              <FaChevronLeft size={20} color={isDialogAtCurrentWeek ? "#ccc" : "#333"} />
            </IconButton>
            <span>
              {dialogWeekInfo.length > 0
                ? `Chọn khung giờ để đề nghị cho học viên (${dialogWeekInfo[0].label} ${dialogWeekInfo[0].date} - ${dialogWeekInfo[6].label} ${dialogWeekInfo[6].date})`
                : "Chọn khung giờ để đề nghị cho học viên"}
            </span>
            <IconButton
              onClick={handleDialogNextWeek}
              sx={{
                p: 1,
                borderRadius: "50%",
                backgroundColor: "#f3f4f6",
                "&:hover": { backgroundColor: "#e5e7eb" },
                boxShadow: "none",
              }}
              aria-label="Next week"
            >
              <FaChevronRight size={20} color="#333" />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Nhấp vào các ô để bật/tắt trạng thái khả dụng
          </Typography>
          <Box sx={{ overflowX: "auto" }}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "140px repeat(7, 1fr)",
                minWidth: "900px",
              }}
            >
              {/* Header row */}
              <Box sx={{ p: 1.5, fontWeight: 600, textAlign: "center", whiteSpace: "nowrap" }}>Thời gian</Box>
              {dialogWeekInfo.map((d, i) => (
                <Box key={i} sx={{ p: 1.5, fontWeight: 600, textAlign: "center" }}>
                  <div style={{ fontSize: 14 }}>{d.label}</div>
                  <div style={{ fontSize: 13, color: "#64748b" }}>{d.date}</div>
                </Box>
              ))}
              {/* Time slots */}
              {Array.from({ length: 48 }).map((_, slotIdx) => {
                const hour = Math.floor(slotIdx / 2);
                const minute = slotIdx % 2 === 0 ? "00" : "30";
                const nextHour = slotIdx % 2 === 0 ? hour : hour + 1;
                const nextMinute = slotIdx % 2 === 0 ? "30" : "00";
                const timeLabel = `${hour.toString().padStart(2, "0")}:${minute} - ${nextHour.toString().padStart(2, "0")}:${nextMinute}`;

                return (
                  <React.Fragment key={slotIdx}>
                    {/* Time label cell */}
                    <Box
                      sx={{
                        p: 1,
                        textAlign: "center",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderBottom: "1px solid #e2e8f0",
                        borderRight: "1px solid #e2e8f0",
                        minHeight: 32,
                      }}
                    >
                      {timeLabel}
                    </Box>
                    {/* For each day, render a cell for this 30-min slot */}
                    {dayInWeekOrder.map((dayInWeek, dayIdx) => {
                      // Check if this slot is selected in editPatternSlots
                      const isSelected =
                        editPatternSlots[dayInWeek] &&
                        editPatternSlots[dayInWeek].has(slotIdx);

                      return (
                        <Box
                          key={dayIdx}
                          sx={{
                            backgroundColor: isSelected ? "#98D45F" : "#f1f5f9",
                            border: "1px solid #e2e8f0",
                            minHeight: 32,
                            cursor: "pointer",
                            transition: "background 0.2s",
                            "&:hover": {
                              backgroundColor: isSelected ? "#7bbf3f" : "#e0e7ef",
                            },
                          }}
                          onClick={() => {
                            setEditPatternSlots((prev) => {
                              const newSlots = { ...prev };
                              if (!newSlots[dayInWeek]) newSlots[dayInWeek] = new Set();
                              const slotSet = new Set(newSlots[dayInWeek]);
                              if (slotSet.has(slotIdx)) {
                                slotSet.delete(slotIdx);
                              } else {
                                slotSet.add(slotIdx);
                              }
                              newSlots[dayInWeek] = slotSet;
                              return { ...newSlots };
                            });
                          }}
                        />
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditPatternDialogOpen(false)}>Hủy</Button>
          <Button
            variant="contained"
            onClick={async () => {
              setPatternLoading(true);
              try {
                // Convert slot map to array
                const slots = [];
                Object.entries(editPatternSlots).forEach(([dayInWeek, slotSet]) => {
                  slotSet.forEach(slotIndex => {
                    slots.push({
                      type: 0,
                      dayInWeek: Number(dayInWeek),
                      slotIndex: Number(slotIndex),
                    });
                  });
                });

                // Always use Monday 00:00:00 UTC
                const localMonday = currentWeekStart; // e.g., 2025-07-07T00:00:00+07:00
                const appliedFromUTC = new Date(Date.UTC(
                  localMonday.getFullYear(),
                  localMonday.getMonth(),
                  localMonday.getDate(),
                  0, 0, 0, 0
                )); // This is 2025-07-07T00:00:00.000Z

                console.log('appliedFrom (UTC):', appliedFromUTC.toISOString());
                await editTutorWeeklyPattern({
                  appliedFrom: appliedFromUTC.toISOString(),
                  slots,
                });
                setEditPatternDialogOpen(false);
                // Refresh weekly patterns after update
                const updatedPatterns = await fetchTutorWeeklyPattern(id);
                setWeeklyPatterns(updatedPatterns);
              } catch (err) {
                alert("Cập nhật lịch trình thất bại: " + err.message);
              } finally {
                setPatternLoading(false);
              }
            }}
            disabled={patternLoading}
          >
            Lưu thay đổi
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDeleteWeeklyPattern
        open={deletePatternModalOpen}
        onClose={() => setDeletePatternModalOpen(false)}
        patternId={patternToDelete}
        onConfirm={async () => {
          try {
            await deleteTutorWeeklyPattern(patternToDelete);
            // Fetch the updated weekly patterns after deletion
            const updatedPatterns = await fetchTutorWeeklyPattern(id);
            setWeeklyPatterns(updatedPatterns); // Update the state with the new patterns
          } catch (error) {
            alert("Xóa lịch trình thất bại: " + error.message);
          } finally {
            setDeletePatternModalOpen(false);
          }
        }}
      />

      <Dialog
        open={bookingDetailDialogOpen}
        onClose={() => setBookingDetailDialogOpen(false)}
        maxWidth="xl"
        fullWidth
        PaperProps={{ sx: { minWidth: 1100 } }}
      >
        <DialogTitle>Chọn khung giờ để đề nghị cho học viên</DialogTitle>
        <DialogContent>
          {bookingDetailLoading ? (
            <BookingDetailSkeleton />
          ) : (
            <Box sx={{ overflowX: "auto" }}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "140px repeat(7, 1fr)",
                  minWidth: "900px",
                }}
              >
                {/* Header row */}
                <Box sx={{ p: 1.5, fontWeight: 600, textAlign: "center" }}>Thời gian</Box>
                {dialogWeekInfo.map((d, i) => (
                  <Box key={i} sx={{ p: 1.5, fontWeight: 600, textAlign: "center" }}>
                    <div style={{ fontSize: 14 }}>{d.label}</div>
                    <div style={{ fontSize: 13, color: "#64748b" }}>{d.date}</div>
                  </Box>
                ))}
                {/* Time slots */}
                {Array.from({ length: 48 }).map((_, slotIdx) => {
                  const hour = Math.floor(slotIdx / 2);
                  const minute = slotIdx % 2 === 0 ? "00" : "30";
                  const nextHour = slotIdx % 2 === 0 ? hour : hour + 1;
                  const nextMinute = slotIdx % 2 === 0 ? "30" : "00";
                  const timeLabel = `${hour.toString().padStart(2, "0")}:${minute} - ${nextHour.toString().padStart(2, "0")}:${nextMinute}`;
                  return (
                    <React.Fragment key={slotIdx}>
                      {/* Time label cell */}
                      <Box
                        sx={{
                          p: 1,
                          textAlign: "center",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderBottom: "1px solid #e2e8f0",
                          borderRight: "1px solid #e2e8f0",
                          minHeight: 32,
                        }}
                      >
                        {timeLabel}
                      </Box>
                      {/* For each day, render a cell for this 30-min slot */}
                      {dayInWeekOrder.map((dayInWeek, dayIdx) => {
                        const isRequested = Array.isArray(bookingDetailSlots) && bookingDetailSlots.some(
                          slot => slot.dayInWeek === dayInWeek && slot.slotIndex === slotIdx
                        );
                        const isSelected = selectedOfferSlots.some(
                          slot => slot.dayInWeek === dayInWeek && slot.slotIndex === slotIdx
                        );
                        const isOffered = offerDetail?.offeredSlots?.some(slot => {
                          const date = new Date(slot.slotDateTime);
                          let jsDay = date.getDay();
                          let apiDayInWeek = jsDay === 0 ? 1 : jsDay + 1;

                          // Week check
                          const weekStart = new Date(dialogWeekStart);
                          weekStart.setHours(0, 0, 0, 0);
                          const weekEnd = new Date(weekStart);
                          weekEnd.setDate(weekEnd.getDate() + 6);
                          weekEnd.setHours(23, 59, 59, 999);

                          return (
                            apiDayInWeek === dayInWeek &&
                            slot.slotIndex === slotIdx &&
                            date >= weekStart &&
                            date <= weekEnd
                          );
                        });

                        // NEW: Purple if both requested and offered
                        const isRequestedAndOffered = isRequested && isOffered;

                        let bgColor = "#f1f5f9";
                        if (isRequestedAndOffered) {
                          bgColor = "#a259e6"; // purple
                        } else if (isSelected) {
                          bgColor = "#98D45F"; // green for selected
                        } else if (isOffered) {
                          bgColor = "#3b82f6"; // blue for offered
                        } else if (isRequested) {
                          bgColor = "#FFD700"; // yellow for requested
                        }
                        let textColor = (isSelected || isOffered || isRequestedAndOffered) ? "#fff" : (isRequested ? "#333" : "inherit");
                        let fontWeight = (isSelected || isOffered || isRequestedAndOffered) ? 700 : (isRequested ? 600 : 400);

                        return (
                          <Box
                            key={dayIdx}
                            sx={{
                              backgroundColor: bgColor,
                              border: "1px solid #e2e8f0",
                              minHeight: 32,
                              textAlign: "center",
                              color: textColor,
                              fontWeight: fontWeight,
                              fontSize: 14,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              opacity: 1,
                            }}
                            onClick={() => {
                              setSelectedOfferSlots(prev => {
                                const exists = prev.some(
                                  slot => slot.dayInWeek === dayInWeek && slot.slotIndex === slotIdx
                                );
                                if (exists) {
                                  return prev.filter(
                                    slot => !(slot.dayInWeek === dayInWeek && slot.slotIndex === slotIdx)
                                  );
                                } else {
                                  return [...prev, { dayInWeek, slotIndex: slotIdx }];
                                }
                              });
                            }}
                          />
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
            px: 3,
            py: 2,
          }}
        >
          {/* Legend/Note */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  backgroundColor: "#FFD700", // yellow
                  mr: 1,
                }}
              />
              <Typography variant="body2" sx={{ color: "#bfa100" }}>
                Học viên đã đặt
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  backgroundColor: "#98D45F", // green
                  mr: 1,
                }}
              />
              <Typography variant="body2" sx={{ color: "#4a7c1c" }}>
                Đề xuất của gia sư (chọn mới)
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  backgroundColor: "#3b82f6", // blue
                  mr: 1,
                }}
              />
              <Typography variant="body2" sx={{ color: "#3b82f6" }}>
                Gia sư đã đề xuất trước đó
              </Typography>
            </Box>
            {/* NEW: Purple legend */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  backgroundColor: "#a259e6", // purple
                  mr: 1,
                }}
              />
              <Typography variant="body2" sx={{ color: "#a259e6" }}>
                Học viên đã đặt + Gia sư đã đề xuất trước đó
              </Typography>
            </Box>
          </Box>
          {/* Buttons */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button onClick={() => {
              setBookingDetailDialogOpen(false);
              setSelectedLesson(null);
              setSelectedLessonId("");
            }}>
              Đóng
            </Button>
            <Button
              variant="contained"
              color="primary"
              disabled={selectedOfferSlots.length === 0 || !selectedLearner}
              onClick={async () => {
                if (!selectedLesson) {
                  setSelectLessonDialogOpen(true);
                  return;
                }
                try {
                  const offeredSlots = selectedOfferSlots.map(slot => ({
                    slotDateTime: getSlotDateTime(dialogWeekStart, slot.dayInWeek, slot.slotIndex),
                    slotIndex: slot.slotIndex,
                  }));

                  if (offerDetail && offerDetail.id) {
                    // Update existing offer
                    await updateTutorBookingOfferByOfferId(offerDetail.id, {
                      lessonId: selectedLesson.id,
                      offeredSlots,
                    });
                    alert("Đã cập nhật đề nghị thành công!");
                  } else {
                    // Create new offer
                    await createTutorBookingOffer({
                      learnerId: selectedLearner,
                      lessonId: selectedLesson.id,
                      offeredSlots,
                    });
                    alert("Đã gửi đề nghị thành công!");
                  }

                  setBookingDetailDialogOpen(false);
                  setSelectedOfferSlots([]);
                  setSelectedLearner(null);
                  setSelectedLessonId("");
                  setSelectedLesson(null);
                } catch (err) {
                  alert("Gửi đề nghị thất bại: " + err.message);
                }
              }}
            >
              {selectedLesson ? (offerDetail && offerDetail.id ? "Cập nhật đề xuất" : "Gửi đề xuất") : "Chọn bài học"}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      <Dialog
        open={selectLessonDialogOpen}
        onClose={() => setSelectLessonDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Chọn bài học để đề xuất</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel id="select-lesson-label">Bài học</InputLabel>
            <Select
              labelId="select-lesson-label"
              value={selectedLessonId}
              label="Bài học"
              onChange={(e) => setSelectedLessonId(e.target.value)}
            >
              {lessons.map((lesson) => (
                <MenuItem key={lesson.id} value={lesson.id}>
                  {lesson.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectLessonDialogOpen(false)}>Hủy</Button>
          <Button
            variant="contained"
            color="primary"
            disabled={!selectedLessonId}
            onClick={() => {
              const lesson = lessons.find(l => l.id === selectedLessonId);
              setSelectedLesson(lesson);
              setSelectLessonDialogOpen(false);
            }}
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TutorProfile;
