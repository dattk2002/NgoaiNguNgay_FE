// src/components/modals/ReadOnlyWeeklyPatternDialog.jsx
import React, { useEffect, useState } from "react";
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Box, 
  Typography, 
  IconButton,
  Card,
  CardContent,
  Divider,
  Portal
} from "@mui/material";
import { 
  fetchTutorWeeklyPattern, 
  updateLearnerBookingTimeSlot, 
  fetchTutorLessonDetailById,
  fetchTutorScheduleToOfferAndBook,
  learnerCreateInstantBooking 
} from "../api/auth";
import Skeleton from "@mui/material/Skeleton";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { FiTrash2 } from "react-icons/fi";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { motion, AnimatePresence } from "framer-motion";
import { formatLanguageCode } from "../../utils/formatLanguageCode";
import formatPriceWithCommas from "../../utils/formatPriceWithCommas";
import { showSuccess, showError } from "../../utils/toastManager.js";
import LegalDocumentModal from "./LegalDocumentModal";

const dayLabels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const dayInWeekOrder = [2, 3, 4, 5, 6, 7, 1]; // API: 2=Mon, ..., 7=Sat, 1=Sun

function formatDateRangeVN(start, end) {
  const options = { day: "2-digit", month: "2-digit", year: "numeric" };
  return `${start.toLocaleDateString("vi-VN", options)} - ${end.toLocaleDateString("vi-VN", options)}`;
}

function getPatternForWeek(patterns, weekStart) {
  if (!patterns || patterns.length === 0 || !weekStart) return null;
  // Sort patterns descending by appliedFrom
  const sorted = [...patterns].sort((a, b) => new Date(b.appliedFrom) - new Date(a.appliedFrom));
  // Find the pattern that starts before or at this week's Monday (so it applies to this week)
  return sorted.find(pattern => new Date(pattern.appliedFrom) <= weekStart) || sorted[sorted.length - 1];
}

const hasRole = (user, roleName) => {
  if (!user || !user.roles) return false;
  const roles = Array.isArray(user.roles) ? user.roles : [user.roles];
  return roles.some(role => {
    if (typeof role === 'string') {
      return role.toLowerCase() === roleName.toLowerCase();
    }
    if (role && role.name) {
      return role.name.toLowerCase() === roleName.toLowerCase();
    }
    return false;
  });
};
const isLearner = (user) => hasRole(user, "Learner");
const isTutor = (user) => hasRole(user, "Tutor");


const TutorWeeklyPatternDetailModal = ({
  open,
  onClose,
  tutorId,
  tutorName, // Add tutor name prop
  initialWeekStart,
  currentUser,
  onBookingSuccess,
  lessonId, 
  expectedStartDate, 
  isReadOnly = false, // Add new prop for read-only mode
}) => {
  const [loading, setLoading] = useState(true);
  const [patterns, setPatterns] = useState([]);
  const [weekStart, setWeekStart] = useState(initialWeekStart);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
  
  // Add lesson details state
  const [lessonDetails, setLessonDetails] = useState(null);
  const [lessonLoading, setLessonLoading] = useState(false);

  // Add schedule data state
  const [scheduleData, setScheduleData] = useState(null);
  const [scheduleLoading, setScheduleLoading] = useState(false);

  // Add legal document modal state
  const [showLegalDocumentModal, setShowLegalDocumentModal] = useState(false);
  
  // Add agreement checkbox state
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Only allow slot selection for learners and when not in read-only mode
  const learnerPermission = isLearner(currentUser) && !isReadOnly;

  // Handler to open legal document modal
  const handleLegalDocumentClick = (e) => {
    e.preventDefault();
    setShowLegalDocumentModal(true);
  };

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    
    const fetchData = async () => {
      try {
        // Fetch weekly pattern
        const patternData = await fetchTutorWeeklyPattern(tutorId);
        setPatterns(patternData || []);
        
        // Fetch lesson details if lessonId is provided
        if (lessonId) {
          setLessonLoading(true);
          try {
            const lessonData = await fetchTutorLessonDetailById(lessonId);
            setLessonDetails(lessonData);
          } catch (lessonError) {
            console.error("Failed to fetch lesson details:", lessonError);
            setLessonDetails(null);
          } finally {
            setLessonLoading(false);
          }
        } else {
          setLessonDetails(null);
        }

        // Fetch schedule data for the current week
        setScheduleLoading(true);
        try {
          const monday = new Date(initialWeekStart);
          const sunday = new Date(monday);
          sunday.setDate(monday.getDate() + 6);
          
          // Fix: Use local date formatting instead of toISOString() to avoid timezone issues
          const startDate = monday.toLocaleDateString("en-CA"); // YYYY-MM-DD format
          const endDate = sunday.toLocaleDateString("en-CA"); // YYYY-MM-DD format
          
          console.log("🔍 Initial schedule fetch with dates:", { startDate, endDate });
          
          const scheduleData = await fetchTutorScheduleToOfferAndBook(tutorId, startDate, endDate);
          setScheduleData(scheduleData);
        } catch (scheduleError) {
          console.error("Failed to fetch schedule data:", scheduleError);
          setScheduleData(null);
        } finally {
          setScheduleLoading(false);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    setWeekStart(initialWeekStart); // Reset week when dialog opens
    
    // Initialize selected slots as empty array (slots will persist across weeks)
    if (learnerPermission && !isReadOnly) {
      setSelectedSlots([]);
    } else {
      // Clear selected slots in read-only mode
      setSelectedSlots([]);
    }
  }, [open, tutorId, initialWeekStart, learnerPermission, currentUser?.id, isReadOnly, lessonId]);

  // Calculate week range
  const monday = weekStart ? new Date(weekStart) : null;
  const sunday = monday ? new Date(monday) : null;
  if (sunday) sunday.setDate(monday.getDate() + 6);

  // Generate week dates for display
  const weekDates = [];
  if (monday) {
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      weekDates.push(d.getDate());
    }
  }

  // Utility: Get the current week's Monday
  const getCurrentMonday = () => {
    const today = new Date();
    const day = today.getDay();
    // 0 (Sun) -> 1 (Mon), 1 (Mon) -> 0, ..., 6 (Sat) -> 5
    const diff = day === 0 ? -6 : 1 - day;
    const monday = new Date(today);
    monday.setHours(0, 0, 0, 0);
    monday.setDate(today.getDate() + diff);
    return monday;
  };

  const currentMonday = getCurrentMonday();

  // Week navigation handlers
  const handlePrevWeek = () => {
    if (!monday) return;
    // Prevent navigating to weeks before current week
    const prevMonday = new Date(monday);
    prevMonday.setDate(monday.getDate() - 7);
    if (prevMonday < currentMonday) return; // Block navigation
    setWeekStart(prevMonday);

    // Fetch schedule data for the new week
    fetchScheduleForWeek(prevMonday);
  };

  const handleNextWeek = () => {
    if (!monday) return;
    const nextMonday = new Date(monday);
    nextMonday.setDate(monday.getDate() + 7);
    setWeekStart(nextMonday);

    // Fetch schedule data for the new week
    fetchScheduleForWeek(nextMonday);
  };

  // Function to fetch schedule data for a specific week
  const fetchScheduleForWeek = async (weekStartDate) => {
    try {
      setScheduleLoading(true);
      const monday = new Date(weekStartDate);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      
      // Fix: Use local date formatting instead of toISOString() to avoid timezone issues
      const startDate = monday.toLocaleDateString("en-CA"); // YYYY-MM-DD format
      const endDate = sunday.toLocaleDateString("en-CA"); // YYYY-MM-DD format
      
      console.log("🔍 Fetching schedule with dates:", { startDate, endDate });
      
      const scheduleData = await fetchTutorScheduleToOfferAndBook(tutorId, startDate, endDate);
      setScheduleData(scheduleData);
    } catch (scheduleError) {
      console.error("Failed to fetch schedule data:", scheduleError);
      setScheduleData(null);
    } finally {
      setScheduleLoading(false);
    }
  };

  // Get slot status from schedule data
  const getSlotStatus = (dayInWeek, slotIndex) => {
    if (!scheduleData || !monday) return 'unavailable';
    
    // Calculate the date for this day in week
    const dayDate = new Date(monday);
    const dayIndex = dayInWeekOrder.indexOf(dayInWeek);
    dayDate.setDate(monday.getDate() + dayIndex);
    
    // Fix: Use toLocaleDateString for consistent date comparison
    const targetDateStr = dayDate.toLocaleDateString("en-CA");
    
    const dayData = scheduleData.find(day => {
      const scheduleDate = new Date(day.date);
      const scheduleDateStr = scheduleDate.toLocaleDateString("en-CA");
      return scheduleDateStr === targetDateStr;
    });

    if (!dayData) {
      console.log(`🔍 No schedule data found for day ${dayInWeek} (${targetDateStr})`);
      return 'unavailable';
    }

    const slot = dayData.timeSlots.find(slot => slot.slotIndex === slotIndex);
    if (!slot) return 'unavailable';

    switch (slot.type) {
      case 0: return 'available';
      case 1: return 'onhold';
      case 2: return 'booked';
      default: return 'unavailable';
    }
  };

  // Check if slot is available based on pattern (legacy check)
  const isSlotAvailable = (dayInWeek, slotIndex) => {
    if (!pattern || !pattern.slots) return false;
    return pattern.slots.some(
      (slot) => slot.dayInWeek === dayInWeek && slot.slotIndex === slotIndex
    );
  };

  // Get time label for slot index
  const getTimeLabel = (slotIdx) => {
    const hour = Math.floor(slotIdx / 2);
    const minute = slotIdx % 2 === 0 ? "00" : "30";
    const nextHour = slotIdx % 2 === 0 ? hour : hour + 1;
    const nextMinute = slotIdx % 2 === 0 ? "30" : "00";
    return `${hour.toString().padStart(2, "0")}:${minute} - ${nextHour.toString().padStart(2, "0")}:${nextMinute}`;
  };

  // Get pattern for current week
  const pattern = getPatternForWeek(patterns, weekStart);

  // Check if we're at the current week
  const isAtCurrentWeek = monday && currentMonday && 
    monday.getFullYear() === currentMonday.getFullYear() &&
    monday.getMonth() === currentMonday.getMonth() &&
    monday.getDate() === currentMonday.getDate();

  const isCurrentWeek = monday && currentMonday && 
    monday.getFullYear() === currentMonday.getFullYear() &&
    monday.getMonth() === currentMonday.getMonth() &&
    monday.getDate() === currentMonday.getDate();

  const handleSlotClick = (dayInWeek, slotIndex, isAvailable) => {
    // Don't allow selection in read-only mode
    if (isReadOnly || !learnerPermission || !isAvailable) return;
    
    // Check if slot is in the past for the current week being viewed
    const isPastSlot = isSlotInPast(dayInWeek, slotIndex);
    if (isPastSlot) return;
    
    // Check if slot is available according to schedule data
    const slotStatus = getSlotStatus(dayInWeek, slotIndex);
    if (slotStatus !== 'available') return;
    
    // Calculate the actual date for this slot to store it with date format
    const slotDate = new Date(monday);
    // dayInWeek: 2=Mon, ..., 7=Sat, 1=Sun
    let jsDay = dayInWeek === 1 ? 6 : dayInWeek - 2; // 0=Mon, ..., 6=Sun
    slotDate.setDate(monday.getDate() + jsDay);
    const dateStr = slotDate.toLocaleDateString("en-CA"); // YYYY-MM-DD format
    
    setSelectedSlots((prev) => {
      const newSlots = prev.some((s) => s.date === dateStr && s.slotIndex === slotIndex)
        ? prev.filter((s) => !(s.date === dateStr && s.slotIndex === slotIndex))
        : [...prev, { date: dateStr, slotIndex }];
      
      return newSlots;
    });
  };

  // Always get the current UTC date (YYYY-MM-DD)
  const now = new Date();
  const expectedStartDateToday = now.toISOString();

  const handleSubmit = () => {
    if (selectedSlots.length === 0) {
      return;
    }
    
    // Open confirmation dialog instead of submitting directly
    setConfirmSubmitOpen(true);
  };

  const handleConfirmSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);
    
    console.log("🔗 TutorWeeklyPatternDetailModal - Starting instant booking submission");
    console.log("📦 Booking Details:", {
      tutorId,
      lessonId,
      selectedSlots,
      currentUser: {
        id: currentUser?.id,
        name: currentUser?.name,
        fullName: currentUser?.fullName
      }
    });

    try {
      console.log("📦 TutorWeeklyPatternDetailModal - Calling learnerCreateInstantBooking...");
      
      // Convert selected slots to the format expected by the API
      const slots = selectedSlots.map(slot => {
        // Parse the date string to get the actual date
        const [year, month, day] = slot.date.split("-").map(Number);
        const slotDate = new Date(year, month - 1, day); // month is 0-indexed
        
        // Set the time based on slotIndex
        const hour = Math.floor(slot.slotIndex / 2);
        const minute = slot.slotIndex % 2 === 0 ? 0 : 30;
        slotDate.setHours(hour, minute, 0, 0);
        
        // Convert to UTC+7 instead of UTC+0
        // Add 7 hours to convert from UTC+0 to UTC+7
        const utcPlus7Date = new Date(slotDate.getTime() + (7 * 60 * 60 * 1000));
        
        return {
          slotDate: utcPlus7Date.toISOString(),
          slotIndex: slot.slotIndex
        };
      });

      const bookingData = {
        tutorId: tutorId,
        lessonId: lessonId,
        slots: slots
      };

      console.log("📦 Instant booking data:", bookingData);
      
      await learnerCreateInstantBooking(bookingData);
      console.log("✅ TutorWeeklyPatternDetailModal - Instant booking created successfully");

      // Show success toast
      showSuccess("Đặt lịch thành công! Gia sư sẽ liên hệ với bạn sớm nhất.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        draggable: true,
      });

      setSubmitSuccess(true);
      setSelectedSlots([]);
      setConfirmSubmitOpen(false);
      
      if (onBookingSuccess) onBookingSuccess();
      onClose();
    } catch (err) {
      console.error("❌ TutorWeeklyPatternDetailModal - Error during instant booking:", err);
      
      // Handle specific 400 error for slots less than 24 hours
      if (err.message && err.message.includes("Cannot book slots that start less than 24 hour(s) from now")) {
        showError("Không thể đặt lịch cho các khung giờ bắt đầu trong vòng 24 giờ tới. Vui lòng chọn khung giờ khác.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          draggable: true,
        });
      } else {
        // Handle other errors
        showError(err.message || "Đặt lịch thất bại. Vui lòng thử lại.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          draggable: true,
        });
      }
      
      setSubmitError(err.message || "Đặt lịch thất bại.");
    } finally {
      setSubmitting(false);
    }
  };

  // Returns true if the slot is before today (for current week)
  const isSlotInPast = (dayInWeek, slotIndex) => {
    if (!monday) return false;
    const slotDate = new Date(monday);
    // dayInWeek: 2=Mon, ..., 7=Sat, 1=Sun
    let jsDay = dayInWeek === 1 ? 6 : dayInWeek - 2; // 0=Mon, ..., 6=Sun
    slotDate.setDate(monday.getDate() + jsDay);

    const now = new Date();
    // If slotDate is before today, it's in the past
    if (
      slotDate.getFullYear() < now.getFullYear() ||
      (slotDate.getFullYear() === now.getFullYear() && slotDate.getMonth() < now.getMonth()) ||
      (slotDate.getFullYear() === now.getFullYear() && slotDate.getMonth() === now.getMonth() && slotDate.getDate() < now.getDate())
    ) {
      return true;
    }
    // If slotDate is today, check time
    if (
      slotDate.getFullYear() === now.getFullYear() &&
      slotDate.getMonth() === now.getMonth() &&
      slotDate.getDate() === now.getDate()
    ) {
      // Each slot is 30min, slotIndex 0 = 00:00, 1 = 00:30, ..., 47 = 23:30
      const slotHour = Math.floor(slotIndex / 2);
      const slotMinute = slotIndex % 2 === 0 ? 0 : 30;
      if (
        slotHour < now.getHours() ||
        (slotHour === now.getHours() && slotMinute <= now.getMinutes())
      ) {
        return true;
      }
    }
    return false;
  };

  // Calculate total price for selected slots
  const calculateTotalPrice = () => {
    if (!lessonDetails || !lessonDetails.price || selectedSlots.length === 0) {
      return 0;
    }
    return lessonDetails.price * selectedSlots.length;
  };

  // Get slot background color based on status
  const getSlotBackgroundColor = (dayInWeek, slotIndex, isSelected) => {
    const slotStatus = getSlotStatus(dayInWeek, slotIndex);
    const isPastSlot = isSlotInPast(dayInWeek, slotIndex);
    
    if (isSelected) {
      return isPastSlot ? "#6d9e46" : "#2563eb"; // Selected slots
    }
    
    if (isPastSlot) {
      // Past slots - muted colors
      switch (slotStatus) {
        case 'available': return "#6d9e46";
        case 'onhold': return "#f59e0b";
        case 'booked': return "#ef4444";
        default: return "#B8B8B8";
      }
    } else {
      // Current/future slots - normal colors
      switch (slotStatus) {
        case 'available': return "#98D45F";
        case 'onhold': return "#fbbf24";
        case 'booked': return "#f87171";
        default: return "#f1f5f9";
      }
    }
  };

  return (
    <>
          <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth={false}
      fullWidth={false}
      sx={{
        '& .MuiDialog-paper': {
          zIndex: 999
        }
      }}
      container={() => document.body}
      style={{ zIndex: 999 }}
      PaperProps={{
          sx: {
            width: "100%",
            height: "90%",
            maxWidth: "none",
            maxHeight: "none",
            top: "5%",
            left: "0%",
            right: "0%",
            margin: "0 auto",
          },
        }}
      >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="h6">
            {isReadOnly ? "Lịch trình khả dụng" : "Chi tiết lịch trình khả dụng"}
          </Typography>
          
          {/* Show selected lesson info in header if available */}
          {lessonDetails && !isReadOnly && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              backgroundColor: '#e3f2fd',
              px: 2,
              py: 1,
              borderRadius: 2,
              border: '1px solid #2196f3'
            }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                📚 {lessonDetails.name}
              </Typography>
              <Typography variant="body2" sx={{ color: '#1976d2', fontSize: '14px' }}>
                {formatPriceWithCommas(lessonDetails.price)} VNĐ/slot
              </Typography>
            </Box>
          )}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* Only render the left arrow if not at the current week */}
          {!isAtCurrentWeek && (
            <IconButton
              onClick={handlePrevWeek}
              sx={{
                color: "primary.main",
                "&:hover": { backgroundColor: "rgba(25, 118, 210, 0.04)" },
              }}
            >
              <FaChevronLeft />
            </IconButton>
          )}
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {monday && sunday ? formatDateRangeVN(monday, sunday) : ""}
          </Typography>
          <IconButton
            onClick={handleNextWeek}
            sx={{
              color: "primary.main",
              "&:hover": { backgroundColor: "rgba(25, 118, 210, 0.04)" },
            }}
          >
            <FaChevronRight />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {loading || scheduleLoading ? (
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
                minWidth: "900px",
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
                minWidth: "900px",
              }}
            >
              {Array.from({ length: 48 }).map((_, slotIdx) => (
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
                      minHeight: 32,
                    }}
                  >
                    <Skeleton variant="text" width={80} height={16} />
                  </Box>
                  {/* Day cells skeleton */}
                  {Array.from({ length: 7 }).map((_, dayIdx) => (
                    <Box
                      key={dayIdx}
                      sx={{
                        border: "1px solid #e2e8f0",
                        minHeight: 32,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Skeleton variant="rectangular" width="90%" height="80%" sx={{ borderRadius: 1 }} />
                    </Box>
                  ))}
                </React.Fragment>
              ))}
            </Box>
          </Box>
        ) : !pattern ? (
          <Typography>Không có lịch trình khả dụng cho tuần này.</Typography>
        ) : (
          <Box sx={{ display: 'flex', gap: 3, height: '100%' }}>
            {/* Left side - Calendar table */}
            <Box sx={{ flex: 1, overflowX: "auto" }}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "140px repeat(7, 1fr)",
                  minWidth: "900px",
                }}
              >
                {/* Header row with day label and date */}
                <Box sx={{ p: 1.5, fontWeight: 600, textAlign: "center" }}>Thời gian</Box>
                {dayLabels.map((label, i) => (
                  <Box key={i} sx={{ p: 1.5, fontWeight: 600, textAlign: "center" }}>
                    <div>{label}</div>
                    <div style={{ fontSize: 13, color: "#64748b" }}>{weekDates[i]}</div>
                  </Box>
                ))}
                {/* 48 slots (30-min each) */}
                {Array.from({ length: 48 }).map((_, slotIdx) => (
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
                      {getTimeLabel(slotIdx)}
                    </Box>
                    {/* For each day, render a cell for this 30-min slot */}
                    {dayInWeekOrder.map((dayInWeek, dayIdx) => {
                      // Calculate the actual date for this slot to check if it's selected
                      const slotDate = new Date(monday);
                      let jsDay = dayInWeek === 1 ? 6 : dayInWeek - 2; // 0=Mon, ..., 6=Sun
                      slotDate.setDate(monday.getDate() + jsDay);
                      const dateStr = slotDate.toLocaleDateString("en-CA"); // YYYY-MM-DD format
                      
                      const isSelected = selectedSlots.some(
                        (s) => s.date === dateStr && s.slotIndex === slotIdx
                      );
                      
                      // Check if slot is in the past
                      const isPastSlot = isSlotInPast(dayInWeek, slotIdx);
                      
                      // Get slot status from schedule data
                      const slotStatus = getSlotStatus(dayInWeek, slotIdx);
                      const isAvailable = slotStatus === 'available';
                      
                      // Get background color based on status
                      const backgroundColor = getSlotBackgroundColor(dayInWeek, slotIdx, isSelected);

                      return (
                        <Box
                          key={dayIdx}
                          sx={{
                            backgroundColor,
                            border: "1px solid #e2e8f0",
                            minHeight: 32,
                            cursor: learnerPermission && isAvailable && !isPastSlot ? "pointer" : "default",
                            opacity: isPastSlot ? 0.7 : 1,
                            transition: "background 0.2s",
                            position: "relative",
                            "&:hover": !isPastSlot && learnerPermission && isAvailable ? {
                              backgroundColor: isSelected ? "#1d4ed8" : "#7bbf3f",
                            } : {},
                            // Add a subtle pattern or overlay for past slots
                            "&::after": isPastSlot ? {
                              content: '""',
                              position: "absolute",
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              background: "repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.3) 2px, rgba(255,255,255,0.3) 4px)",
                              pointerEvents: "none"
                            } : {},
                          }}
                          onClick={() => {
                            // Don't allow clicking on past slots or in read-only mode
                            if (isPastSlot || isReadOnly) return;
                            handleSlotClick(dayInWeek, slotIdx, isAvailable);
                          }}
                        />
                      );
                    })}
                  </React.Fragment>
                ))}
              </Box>
            </Box>

            {/* Right side - Selected slots card (only show if not read-only) */}
            <AnimatePresence>
              {selectedSlots.length > 0 && learnerPermission && !isReadOnly && (
                <motion.div
                  initial={{ 
                    opacity: 0, 
                    x: 50,
                    scale: 0.9
                  }}
                  animate={{ 
                    opacity: 1, 
                    x: 0,
                    scale: 1
                  }}
                  exit={{ 
                    opacity: 0, 
                    x: 50,
                    scale: 0.9
                  }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 300, 
                    damping: 30,
                    duration: 0.4
                  }}
                  style={{ width: 300, flexShrink: 0 }}
                >
                  <Card sx={{ height: '100%', position: 'sticky', top: 0 }}>
                    <CardContent sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      overflow: 'hidden'
                    }}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.3 }}
                      >
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                          Khung giờ đã chọn
                        </Typography>
                      </motion.div>
                      
                      {/* Lesson Details Section */}
                      {lessonDetails && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.15, duration: 0.3 }}
                        >
                          <Box sx={{ 
                            mb: 2, 
                            p: 2, 
                            backgroundColor: '#f8f9fa', 
                            borderRadius: 1,
                            border: '1px solid #e9ecef'
                          }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                              Bài học đã chọn:
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 'medium', mb: 1 }}>
                              {lessonDetails.name}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                              {formatLanguageCode(lessonDetails.languageCode)}
                              {lessonDetails.category && ` | ${lessonDetails.category}`}
                            </Typography>
                            <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                              {formatPriceWithCommas(lessonDetails.price)} VNĐ/slot
                            </Typography>
                          </Box>
                        </motion.div>
                      )}
                      
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.3 }}
                      >
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="textSecondary">
                            Gia sư: {tutorName || 'N/A'}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Số slot đã chọn để đặt lịch: {selectedSlots.length}
                          </Typography>
                        </Box>
                      </motion.div>

                      <Divider sx={{ my: 2 }} />

                      {/* Scrollable slots section - takes remaining space */}
                      <Box sx={{ 
                        flex: 1, 
                        overflowY: 'auto',
                        minHeight: 0 // Important for flex child to shrink
                      }}>
                        <AnimatePresence>
                          {selectedSlots.map((slot, index) => {
                            // Parse the date string to get the actual date
                            const [year, month, day] = slot.date.split("-").map(Number);
                            const slotDate = new Date(year, month - 1, day); // month is 0-indexed
                            const dayOfWeek = slotDate.getDay();
                            
                            // Map JavaScript day to our day labels
                            const dayIndexMap = {
                              0: 0, // Sun -> index 0 (but we use dayLabels[6])
                              1: 0, // Mon -> index 0
                              2: 1, // Tue -> index 1
                              3: 2, // Wed -> index 2
                              4: 3, // Thu -> index 3
                              5: 4, // Fri -> index 4
                              6: 5, // Sat -> index 5
                            };
                            
                            // For Sunday, we need to use index 6 in dayLabels
                            const dayLabelIndex = dayOfWeek === 0 ? 6 : dayIndexMap[dayOfWeek];
                            const dayLabel = dayLabels[dayLabelIndex];
                            
                            const hour = Math.floor(slot.slotIndex / 2);
                            const minute = slot.slotIndex % 2 === 0 ? "00" : "30";
                            const nextHour = slot.slotIndex % 2 === 0 ? hour : hour + 1;
                            const nextMinute = slot.slotIndex % 2 === 0 ? "30" : "00";
                            const timeLabel = `${hour.toString().padStart(2, "0")}:${minute} - ${nextHour.toString().padStart(2, "0")}:${nextMinute}`;

                            return (
                              <motion.div
                                key={`${slot.date}-${slot.slotIndex}`}
                                initial={{ 
                                  opacity: 0, 
                                  x: 30,
                                  scale: 0.95
                                }}
                                animate={{ 
                                  opacity: 1, 
                                  x: 0,
                                  scale: 1
                                }}
                                exit={{ 
                                  opacity: 0, 
                                  x: -30,
                                  scale: 0.95
                                }}
                                transition={{ 
                                  type: "spring", 
                                  stiffness: 400, 
                                  damping: 25,
                                  delay: index * 0.1
                                }}
                              >
                                <Box
                                  sx={{
                                    p: 1.5,
                                    mb: 1,
                                    borderRadius: 1,
                                    backgroundColor: '#f8f9fa',
                                    border: '1px solid #e9ecef',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                  }}
                                >
                                  <Box>
                                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                      {dayLabel}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                      {slotDate.toLocaleDateString("vi-VN")}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#3b82f6', fontWeight: 'medium' }}>
                                      {timeLabel}
                                    </Typography>
                                    {/* Show price per slot if lesson details are available */}
                                    {lessonDetails && lessonDetails.price && (
                                      <Typography variant="body2" color="primary" sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>
                                        {formatPriceWithCommas(lessonDetails.price)} VND
                                      </Typography>
                                    )}
                                  </Box>
                                  <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    <IconButton
                                      size="small"
                                      onClick={() => {
                                        setSelectedSlots((prev) => 
                                          prev.filter((s) => !(s.date === slot.date && s.slotIndex === slot.slotIndex))
                                        );
                                      }}
                                      sx={{
                                        color: '#dc3545',
                                        '&:hover': {
                                          backgroundColor: 'rgba(220, 53, 69, 0.1)'
                                        }
                                      }}
                                    >
                                      <FiTrash2 size={16} />
                                    </IconButton>
                                  </motion.div>
                                </Box>
                              </motion.div>
                            );
                          })}
                        </AnimatePresence>
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.3 }}
                      >
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                            Tổng cộng: {selectedSlots.length} slot
                          </Typography>
                          {/* Show total price if lesson details are available */}
                          {lessonDetails && lessonDetails.price && (
                            <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold', mb: 2 }}>
                              Tổng giá: {formatPriceWithCommas(calculateTotalPrice())} VND
                            </Typography>
                          )}
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => {
                                setSelectedSlots([]);
                              }}
                              sx={{ color: '#dc3545', borderColor: '#dc3545' }}
                            >
                              Xóa tất cả
                            </Button>
                          </motion.div>
                        </Box>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </Box>
        )}
        {submitError && (
          <Typography color="error" sx={{ mt: 2 }}>
            {submitError}
          </Typography>
        )}
        {submitSuccess && (
          <Typography color="primary" sx={{ mt: 2 }}>
            Gửi yêu cầu thành công!
          </Typography>
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
        {/* Legend */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 3, flexWrap: "wrap" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: "#98D45F",
                mr: 1,
              }}
            />
            <Typography variant="body2" sx={{ color: "#98D45F" }}>
              Lịch có sẵn
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: "#fbbf24",
                mr: 1,
              }}
            />
            <Typography variant="body2" sx={{ color: "#fbbf24" }}>
              Lịch đang giữ
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: "#f87171",
                mr: 1,
              }}
            />
            <Typography variant="body2" sx={{ color: "#f87171" }}>
              Lịch đã đặt
            </Typography>
          </Box>
          {/* Only show "Lịch bạn đang chọn" legend when not in read-only mode */}
          {!isReadOnly && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  backgroundColor: "#2563eb",
                  mr: 1,
                }}
              />
              <Typography variant="body2" sx={{ color: "#2563eb" }}>
                Lịch bạn đang chọn
              </Typography>
            </Box>
          )}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: "#f1f5f9",
                border: "1px solid #e2e8f0",
                mr: 1,
              }}
            />
            <Typography variant="body2" sx={{ color: "#64748b" }}>
              Lịch không có sẵn
            </Typography>
          </Box>
        </Box>
        {/* Buttons aligned to the right */}
        <Box sx={{ display: "flex", gap: 1 }}>
          {/* Only show submit button if not in read-only mode */}
          {learnerPermission && !isReadOnly && (
            <Button
              onClick={handleSubmit}
              disabled={
                selectedSlots.length === 0 ||
                submitting ||
                isTutor(currentUser)
              }
              variant="contained"
              color="primary"
            >
              {submitting ? "Đang đặt lịch..." : "Đặt lịch ngay"}
            </Button>
          )}
          <Button onClick={onClose}>Đóng</Button>
        </Box>
      </DialogActions>
      {/* Snackbar for success */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity="success" sx={{ width: "100%" }}>
          Gửi yêu cầu thành công!
        </Alert>
      </Snackbar>

      {/* Confirm Submit Dialog */}
      <Dialog 
        open={confirmSubmitOpen} 
        onClose={() => {
          setConfirmSubmitOpen(false);
          setAgreedToTerms(false);
        }}
        sx={{
          '& .MuiDialog-paper': {
            zIndex: 1000
          }
        }}
        container={() => document.body}
        style={{ zIndex: 1000 }}
      >
        <DialogTitle>Xác nhận đặt lịch</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn đặt lịch này không?
          </Typography>
          
          {/* Legal terms notice */}
          <Box sx={{ mt: 2, p: 2, backgroundColor: "#f0f9ff", borderRadius: 1, border: "1px solid #0ea5e9" }}>
            <Typography variant="body2" sx={{ color: "#0369a1", fontSize: "0.875rem" }}>
              <Button
                onClick={handleLegalDocumentClick}
                sx={{ 
                  p: 0, 
                  minWidth: "auto", 
                  textTransform: "none", 
                  textDecoration: "underline",
                  color: "#0369a1",
                  "&:hover": { 
                    backgroundColor: "transparent",
                    textDecoration: "underline"
                  }
                }}
              >
                Điều khoản dịch vụ và Chính sách
              </Button>
            </Typography>
          </Box>
          
          {/* Agreement Checkbox */}
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            <Typography variant="body2" sx={{ color: "#374151" }}>
              Tôi đồng ý với Điều khoản dịch vụ và Chính sách
            </Typography>
          </Box>
          
          {lessonDetails && (
            <Box sx={{ mt: 2, p: 2, backgroundColor: "#f8fafc", borderRadius: 1, border: "1px solid #e2e8f0" }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#374151", mb: 1 }}>
                Thông tin đặt lịch:
              </Typography>
              <Typography variant="body2">
                • Bài học: {lessonDetails.name}
              </Typography>
              <Typography variant="body2">
                • Gia sư: {tutorName || 'N/A'}
              </Typography>
              <Typography variant="body2">
                • Giá mỗi slot: {formatPriceWithCommas(lessonDetails.price)} VNĐ
              </Typography>
              <Typography variant="body2" sx={{ color: "#dc2626", fontWeight: 600 }}>
                • Tổng giá: {formatPriceWithCommas(lessonDetails.price * selectedSlots.length)} VNĐ
              </Typography>
              <Typography variant="body2">
                • Số slots: {selectedSlots.length}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setConfirmSubmitOpen(false);
            setAgreedToTerms(false);
          }} disabled={submitting}>
            Hủy
          </Button>
          <Button 
            onClick={handleConfirmSubmit} 
            variant="contained"
            disabled={submitting || !agreedToTerms}
            sx={{ 
              bgcolor: agreedToTerms ? "#10b981" : "#9ca3af", 
              "&:hover": { bgcolor: agreedToTerms ? "#059669" : "#9ca3af" }
            }}
          >
            {submitting ? "Đang đặt lịch..." : "Đặt lịch"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Legal Document Modal */}
      <Portal container={document.body}>
        <LegalDocumentModal
          isOpen={showLegalDocumentModal}
          onClose={() => setShowLegalDocumentModal(false)}
          category="Book nhanh"
        />
      </Portal>
      </Dialog>
    </>
  );
};

export default TutorWeeklyPatternDetailModal;