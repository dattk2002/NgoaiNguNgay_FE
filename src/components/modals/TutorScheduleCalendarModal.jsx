import React, { useState, useEffect } from "react";
import { showSuccess, showError } from "../../utils/toastManager.js";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCalendarAlt,
  FaClock,
  FaCheck,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaSpinner,
  FaInfoCircle,
} from "react-icons/fa";
import { fetchTutorScheduleToOfferAndBook } from "../api/auth";
import { createTutorBookingOffer } from "../api/auth";
import { fetchTutorLesson } from "../api/auth";
import { convertUTC7ToUTC0 } from "../../utils/formatCentralTimestamp";
import LegalDocumentModal from "./LegalDocumentModal";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Divider,
  IconButton,
  Autocomplete,
  TextField,
  Alert,
  Tooltip,
} from "@mui/material";

const TutorScheduleCalendarModal = ({
  isOpen,
  onClose,
  tutorId,
  learnerId,
  lessonId,
  tutorName,
  learnerName = "Học viên",
  onOfferSuccess, // Add this new prop
}) => {
  const [scheduleData, setScheduleData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSlots, setSelectedSlots] = useState([]);
  // Initialize with the start of the current week (Monday) to avoid time-related issues
  const [currentWeek, setCurrentWeek] = useState(() => {
    const now = new Date();
    const day = now.getDay();
    // Calculate days to subtract to get to Monday (day 1)
    // Sunday is 0, Monday is 1, Tuesday is 2, etc.
    const daysToSubtract = day === 0 ? 6 : day - 1;
    const monday = new Date(now);
    monday.setDate(now.getDate() - daysToSubtract);
    monday.setHours(0, 0, 0, 0);
    return monday;
  });
  const [submitting, setSubmitting] = useState(false);
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showLegalDocumentModal, setShowLegalDocumentModal] = useState(false);

  // Lesson selection states
  const [lessonSelectionDialogOpen, setLessonSelectionDialogOpen] =
    useState(false);
  const [availableLessons, setAvailableLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [lessonsLoading, setLessonsLoading] = useState(false);

  // Generate week dates (Monday to Sunday)
  const getWeekDates = (date) => {
    const start = new Date(date);
    const day = start.getDay();
    // Calculate days to subtract to get to Monday (day 1)
    // Sunday is 0, Monday is 1, Tuesday is 2, etc.
    const daysToSubtract = day === 0 ? 6 : day - 1;
    start.setDate(start.getDate() - daysToSubtract);

    const dates = [];
    for (let i = 0; i < 7; i++) {
      const newDate = new Date(start);
      newDate.setDate(start.getDate() + i);
      dates.push(newDate);
    }
    return dates;
  };

  const weekDates = getWeekDates(currentWeek);
  const dayNames = [
    "Chủ nhật",
    "Thứ 2",
    "Thứ 3",
    "Thứ 4",
    "Thứ 5",
    "Thứ 6",
    "Thứ 7",
  ];
  // Update the dayInWeekOrder to match TutorProfile
  const dayInWeekOrder = [2, 3, 4, 5, 6, 7, 1]; // Mon, Tue, Wed, Thu, Fri, Sat, Sun

  // Update the dialogWeekInfo generation to match TutorProfile's approach
  const dialogWeekInfo = dayInWeekOrder.map((dayInWeek, index) => {
    // Find the corresponding weekDate based on dayInWeek
    // dayInWeek 2 (Monday) should map to the 0th element (MON) in weekDates
    // dayInWeek 3 (Tuesday) should map to the 1st element (TUE) in weekDates
    // ...
    // dayInWeek 1 (Sunday) should map to the 6th element (SUN) in weekDates
    let weekDateIndex;
    if (dayInWeek === 1) {
      // Sunday
      weekDateIndex = 6; // SUN
    } else {
      weekDateIndex = dayInWeek - 2; // Monday=0, Tuesday=1, etc.
    }

    const date = weekDates[weekDateIndex];
    return {
      label: dayNames[date.getDay()],
      date: date.toLocaleDateString("vi-VN", {
        day: "numeric",
        month: "numeric",
      }),
      fullDate: date,
    };
  });

  useEffect(() => {
    if (isOpen && tutorId) {
      // First show lesson selection dialog
      setLessonSelectionDialogOpen(true);
      fetchTutorLessons();
    }
  }, [isOpen, tutorId]);

  useEffect(() => {
    if (lessonSelectionDialogOpen === false && selectedLesson && tutorId) {
      // After lesson is selected, fetch schedule
      fetchSchedule();
    }
  }, [lessonSelectionDialogOpen, selectedLesson, tutorId, currentWeek]);

  const fetchTutorLessons = async () => {
    setLessonsLoading(true);
    try {
      const lessons = await fetchTutorLesson(tutorId);
      console.log("Fetched lessons:", lessons);
      if (lessons && Array.isArray(lessons)) {
        setAvailableLessons(lessons);
      } else {
        setAvailableLessons([]);
      }
    } catch (error) {
      console.error("Failed to fetch tutor lessons:", error);
      setAvailableLessons([]);
      setError("Không thể tải danh sách bài học");
    } finally {
      setLessonsLoading(false);
    }
  };

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fix: Use local date formatting instead of toISOString() to avoid timezone issues
      const startDate = weekDates[0].toLocaleDateString("en-CA"); // YYYY-MM-DD format
      const endDate = weekDates[6].toLocaleDateString("en-CA"); // YYYY-MM-DD format

      console.log("Calling tutor schedule API with dates:", {
        startDate,
        endDate,
      });

      const data = await fetchTutorScheduleToOfferAndBook(
        tutorId,
        startDate,
        endDate
      );
      setScheduleData(data);
    } catch (err) {
      console.error("Failed to fetch schedule:", err);
      setError(err.message || "Không thể tải lịch trình");
    } finally {
      setLoading(false);
    }
  };

  const getSlotStatus = (date, slotIndex) => {
    if (!scheduleData) return "unavailable";

    const dayData = scheduleData.find((day) => {
      const dayDate = new Date(day.date);
      return dayDate.toDateString() === date.toDateString();
    });

    if (!dayData) return "unavailable";

    const slot = dayData.timeSlots.find((slot) => slot.slotIndex === slotIndex);
    if (!slot) return "unavailable";

    switch (slot.type) {
      case 0:
        return "available";
      case 1:
        return "onhold";
      case 2:
        return "booked";
      default:
        return "unavailable";
    }
  };

  const isSlotSelected = (date, slotIndex) => {
    return selectedSlots.some(
      (slot) =>
        slot.date === date.toLocaleDateString("en-CA") &&
        slot.slotIndex === slotIndex
    );
  };

  const handleSlotClick = (date, slotIndex) => {
    // Use the same dayInWeek calculation as in the rendering logic
    const dayInWeek =
      dayInWeekOrder[
        weekDates.findIndex((d) => d.toDateString() === date.toDateString())
      ];

    // Check if the slot is in the past using the same logic as rendering
    if (isSlotInPast(currentWeek, dayInWeek, slotIndex)) {
      return; // Don't allow clicking on past slots
    }

    // Check if the slot is available (only available slots can be selected)
    const status = getSlotStatus(date, slotIndex);
    if (status !== "available") {
      return; // Don't allow clicking on non-available slots
    }

    const dateStr = date.toLocaleDateString("en-CA"); // Use YYYY-MM-DD format without timezone issues

    setSelectedSlots((prev) => {
      const existing = prev.find(
        (slot) => slot.date === dateStr && slot.slotIndex === slotIndex
      );

      if (existing) {
        return prev.filter(
          (slot) => !(slot.date === dateStr && slot.slotIndex === slotIndex)
        );
      } else {
        return [...prev, { date: dateStr, slotIndex }];
      }
    });
  };

  const handlePreviousWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(currentWeek.getDate() - 7);
    newDate.setHours(0, 0, 0, 0); // Ensure we stay at the start of the day
    setCurrentWeek(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(currentWeek.getDate() + 7);
    newDate.setHours(0, 0, 0, 0); // Ensure we stay at the start of the day
    setCurrentWeek(newDate);
  };

  const handleLessonSelected = () => {
    if (selectedLesson) {
      setLessonSelectionDialogOpen(false);
    }
  };

  const handleSubmit = () => {
    if (selectedSlots.length < 3) {
      setError("Vui lòng chọn ít nhất 3 khung giờ để đề xuất");
      return;
    }

    if (!selectedLesson) {
      setError("Vui lòng chọn bài học");
      return;
    }

    // Check if all selected slots are at least 2 days in the future
    const now = new Date();
    const twoDaysFromNow = new Date(now);
    twoDaysFromNow.setDate(now.getDate() + 2);
    twoDaysFromNow.setHours(0, 0, 0, 0);

    const invalidSlots = selectedSlots.filter((slot) => {
      const dayInWeek = getDayInWeek(slot.date);
      const slotDateTime = getSlotDateTime(
        currentWeek,
        dayInWeek,
        slot.slotIndex
      );
      return slotDateTime < twoDaysFromNow;
    });

    if (invalidSlots.length > 0) {
      showError(
        "Tất cả khung giờ phải cách hiện tại ít nhất 2 ngày. Vui lòng chọn lại các khung giờ phù hợp.",
        {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          draggable: true,
        }
      );
      return;
    }

    // Check if the first slot is at least 48 hours from now
    const sortedSlots = selectedSlots.sort((a, b) => {
      const dayInWeekA = getDayInWeek(a.date);
      const dayInWeekB = getDayInWeek(b.date);
      const slotDateTimeA = getSlotDateTime(
        currentWeek,
        dayInWeekA,
        a.slotIndex
      );
      const slotDateTimeB = getSlotDateTime(
        currentWeek,
        dayInWeekB,
        b.slotIndex
      );
      return slotDateTimeA - slotDateTimeB;
    });

    if (sortedSlots.length > 0) {
      const firstSlot = sortedSlots[0];
      const dayInWeek = getDayInWeek(firstSlot.date);
      const firstSlotDateTime = getSlotDateTime(
        currentWeek,
        dayInWeek,
        firstSlot.slotIndex
      );

      const fortyEightHoursFromNow = new Date(now);
      fortyEightHoursFromNow.setHours(now.getHours() + 48);

      if (firstSlotDateTime < fortyEightHoursFromNow) {
        showError(
          "Slot đầu tiên phải cách thời điểm hiện tại ít nhất 48 giờ.",
          {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            draggable: true,
          }
        );
        return;
      }
    }

    // Open confirmation dialog instead of submitting directly
    setConfirmSubmitOpen(true);
  };

  const handleConfirmSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);

      // Convert selected slots to the format expected by the API
      const offeredSlots = selectedSlots.map((slot) => {
        // Create date parts
        const [year, month, day] = slot.date.split("-").map(Number);
        const hour = Math.floor(slot.slotIndex / 2);
        const minute = slot.slotIndex % 2 === 0 ? 0 : 30;

        // Create the date in local timezone (UTC+7) directly
        const localDate = new Date(year, month - 1, day, hour, minute, 0, 0);
        
        // Convert to UTC+7 ISO string by adding 7 hours
        const utcPlus7Date = new Date(localDate.getTime() + (7 * 60 * 60 * 1000));

        return {
          slotDateTime: utcPlus7Date.toISOString(),
          slotIndex: slot.slotIndex, // Keep the same slotIndex as selected on UI
        };
      });

      const offerData = {
        learnerId: learnerId,
        lessonId: selectedLesson.id,
        offeredSlots: offeredSlots,
      };

      await createTutorBookingOffer(offerData);

      // Reset all states after successful submission
      setSelectedSlots([]);
      setSelectedLesson(null);
      setLessonSelectionDialogOpen(false);
      setError(null);
      setConfirmSubmitOpen(false);
      setAgreedToTerms(false);

      // Close modal
      onClose();

      // Call the success callback with learner name
      if (onOfferSuccess) {
        onOfferSuccess(learnerName);
      }
    } catch (err) {
      console.error("Failed to create booking offer:", err);
      showError(err.message || "Không thể gửi lời mời đặt lịch", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        draggable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDateRange = (startDate, endDate) => {
    return `${startDate.toLocaleDateString("vi-VN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })} - ${endDate.toLocaleDateString("vi-VN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })}`;
  };

  const getSlotDateTime = (weekStart, dayInWeek, slotIndex) => {
    // Create the date in local timezone first
    const date = new Date(weekStart);

    // Fix: Calculate the correct day offset
    // weekStart is Monday, so:
    // dayInWeek 2 (Monday) -> offset 0
    // dayInWeek 3 (Tuesday) -> offset 1
    // dayInWeek 4 (Wednesday) -> offset 2
    // dayInWeek 5 (Thursday) -> offset 3
    // dayInWeek 6 (Friday) -> offset 4
    // dayInWeek 7 (Saturday) -> offset 5
    // dayInWeek 1 (Sunday) -> offset 6
    const dayOffset = dayInWeek === 1 ? 6 : dayInWeek - 2;

    date.setDate(date.getDate() + dayOffset);

    const hour = Math.floor(slotIndex / 2);
    const minute = slotIndex % 2 === 0 ? 0 : 30;
    date.setHours(hour, minute, 0, 0);

    return date;
  };

  const getDayInWeek = (dateString) => {
    // Create date properly to avoid timezone issues
    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day); // month is 0-indexed
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 ? 1 : dayOfWeek + 1; // Convert to API format (1=Sun, 2=Mon, etc.)
  };

  const isSlotInPast = (weekStart, dayInWeek, slotIndex) => {
    const slotDateTime = new Date(
      getSlotDateTime(weekStart, dayInWeek, slotIndex)
    );
    const now = new Date();
    return slotDateTime < now;
  };

  const formatLanguageCode = (code) => {
    const languageMap = {
      en: "Tiếng Anh",
      vi: "Tiếng Việt",
      zh: "Tiếng Trung",
      ja: "Tiếng Nhật",
      ko: "Tiếng Hàn",
      fr: "Tiếng Pháp",
      de: "Tiếng Đức",
      es: "Tiếng Tây Ban Nha",
      pt: "Tiếng Bồ Đào Nha",
      ru: "Tiếng Nga",
      ar: "Tiếng Ả Rập",
      th: "Tiếng Thái",
      id: "Tiếng Indonesia",
      hi: "Tiếng Hindi",
      it: "Tiếng Ý",
      nl: "Tiếng Hà Lan",
    };
    return languageMap[code] || code;
  };

  const formatPriceWithCommas = (price) => {
    if (typeof price === "number") {
      return price.toLocaleString("vi-VN");
    }
    if (typeof price === "string") {
      const numPrice = parseFloat(price);
      return isNaN(numPrice) ? price : numPrice.toLocaleString("vi-VN");
    }
    return price;
  };

  const handleClose = () => {
    setLessonSelectionDialogOpen(false);
    setSelectedLesson(null);
    setSelectedSlots([]);
    setError(null);
    setConfirmSubmitOpen(false);
    setAgreedToTerms(false);
    setShowLegalDocumentModal(false);
    onClose();
  };

  const handleLegalDocumentClick = () => {
    setShowLegalDocumentModal(true);
  };

  // Add cleanup effect for past slots
  useEffect(() => {
    if (currentWeek) {
      setSelectedSlots((prev) => {
        const filtered = prev.filter((slot) => {
          const dayInWeek = getDayInWeek(slot.date);
          return !isSlotInPast(currentWeek, dayInWeek, slot.slotIndex);
        });
        return filtered;
      });
    }
  }, [currentWeek]); // Run when current week changes

  // Add periodic cleanup effect for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentWeek) {
        setSelectedSlots((prev) => {
          const filtered = prev.filter((slot) => {
            const dayInWeek = getDayInWeek(slot.date);
            return !isSlotInPast(currentWeek, dayInWeek, slot.slotIndex);
          });
          return filtered;
        });
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [currentWeek]);

  // Remove the isSlotAtLeastTwoDaysAhead function since we're not blocking selection

  if (!isOpen) return null;

  return (
    <>
      {/* Lesson Selection Dialog */}
      <Dialog
        open={lessonSelectionDialogOpen}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxHeight: "85vh",
            width: "1200px",
            maxWidth: "95vw",
            minHeight: "600px",
          },
        }}
        style={{ zIndex: 1500 }}
      >
        <DialogTitle>Chọn bài học cho đề xuất</DialogTitle>
        <DialogContent sx={{ minHeight: "600px", p: 3 }}>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            Vui lòng chọn bài học bạn muốn đề xuất cho học viên trước khi chọn
            khung giờ:
          </Typography>

          {lessonsLoading ? (
            <Box sx={{ 
              height: "450px", 
              overflowY: "auto", 
              pr: 1,
              "&::-webkit-scrollbar": {
                width: "8px",
              },
              "&::-webkit-scrollbar-track": {
                background: "#f1f1f1",
                borderRadius: "4px",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "#c1c1c1",
                borderRadius: "4px",
                "&:hover": {
                  background: "#a8a8a8",
                },
              },
            }}>
              {[1, 2, 3, 4, 5].map((index) => (
                <Box
                  key={index}
                  sx={{
                    p: 2.5,
                    mb: 2,
                    border: "1px solid #e0e0e0",
                    borderRadius: 3,
                    backgroundColor: "#ffffff",
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2 }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ width: "70%", height: 24, backgroundColor: "#e2e8f0", borderRadius: 1, mb: 1 }} />
                      <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                        <Box sx={{ width: 80, height: 20, backgroundColor: "#e2e8f0", borderRadius: 2 }} />
                        <Box sx={{ width: 60, height: 20, backgroundColor: "#e2e8f0", borderRadius: 2 }} />
                      </Box>
                      <Box sx={{ width: "90%", height: 16, backgroundColor: "#e2e8f0", borderRadius: 1, mb: 0.5 }} />
                      <Box sx={{ width: "60%", height: 16, backgroundColor: "#e2e8f0", borderRadius: 1 }} />
                    </Box>
                    <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                      <Box sx={{ width: 80, height: 28, backgroundColor: "#e2e8f0", borderRadius: 1, mb: 0.5 }} />
                      <Box sx={{ width: 40, height: 12, backgroundColor: "#e2e8f0", borderRadius: 1 }} />
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          ) : availableLessons.length === 0 ? (
            <Alert severity="warning">
              Bạn chưa có bài học nào. Vui lòng tạo bài học trước khi gửi đề
              xuất.
            </Alert>
          ) : (
            <Box sx={{ 
              height: "450px", 
              overflowY: "auto", 
              pr: 1,
              "&::-webkit-scrollbar": {
                width: "8px",
              },
              "&::-webkit-scrollbar-track": {
                background: "#f1f1f1",
                borderRadius: "4px",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "#c1c1c1",
                borderRadius: "4px",
                "&:hover": {
                  background: "#a8a8a8",
                },
              },
            }}>
              {availableLessons.map((lesson) => (
                <Box
                  key={lesson.id}
                  sx={{
                    p: 2.5,
                    mb: 2,
                    border: selectedLesson?.id === lesson.id ? "2px solid #1976d2" : "1px solid #e0e0e0",
                    borderRadius: 3,
                    cursor: "pointer",
                    backgroundColor: selectedLesson?.id === lesson.id ? "#f8fbff" : "#ffffff",
                    transition: "all 0.3s ease",
                    boxShadow: selectedLesson?.id === lesson.id ? "0 4px 12px rgba(25, 118, 210, 0.15)" : "0 2px 8px rgba(0, 0, 0, 0.08)",
                    "&:hover": {
                      backgroundColor: selectedLesson?.id === lesson.id ? "#f8fbff" : "#fafafa",
                      borderColor: "#1976d2",
                      boxShadow: "0 6px 16px rgba(0, 0, 0, 0.12)",
                      transform: "translateY(-2px)",
                    },
                  }}
                  onClick={() => setSelectedLesson(lesson)}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2 }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 700, 
                          mb: 1,
                          color: selectedLesson?.id === lesson.id ? "#1976d2" : "#1a1a1a",
                          fontSize: "1.05rem"
                        }}
                      >
                        {lesson.name}
                      </Typography>
                      
                      <Box sx={{ display: "flex", alignItems: "center", mb: 1, gap: 1, flexWrap: "wrap" }}>
                        <Box
                          sx={{
                            px: 1.2,
                            py: 0.4,
                            bgcolor: "#e3f2fd",
                            borderRadius: 2,
                            border: "1px solid #bbdefb"
                          }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 600, color: "#1976d2", fontSize: "0.8rem" }}>
                            {formatLanguageCode(lesson.languageCode)}
                          </Typography>
                        </Box>
                        {lesson.category && (
                          <Box
                            sx={{
                              px: 1.2,
                              py: 0.4,
                              bgcolor: "#f3e5f5",
                              borderRadius: 2,
                              border: "1px solid #e1bee7"
                            }}
                          >
                            <Typography variant="body2" sx={{ fontWeight: 600, color: "#7b1fa2", fontSize: "0.8rem" }}>
                              {lesson.category}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                      
                      {lesson.description && (
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            mb: 1, 
                            fontStyle: "italic", 
                            color: "#666",
                            lineHeight: 1.4,
                            fontSize: "0.85rem",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                          }}
                        >
                          {lesson.description}
                        </Typography>
                      )}
                    </Box>
                    
                    <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                      <Typography 
                        variant="h5" 
                        color="primary" 
                        sx={{ 
                          fontWeight: 800,
                          fontSize: "1.3rem",
                          mb: 0.3
                        }}
                      >
                        {typeof lesson.price === "number" ||
                        typeof lesson.price === "string"
                          ? formatPriceWithCommas(lesson.price)
                          : "0"}{" "}
                        <Typography component="span" variant="body2" sx={{ fontWeight: 400, fontSize: "0.8rem" }}>
                          VNĐ
                        </Typography>
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ fontSize: "0.75rem" }}>
                         30 phút / 1 slot
                      </Typography>
                    </Box>
                  </Box>
                  
                  {selectedLesson?.id === lesson.id && (
                    <Box 
                      sx={{ 
                        display: "flex", 
                        alignItems: "center", 
                        mt: 1.5,
                        pt: 1.5,
                        borderTop: "1px solid #e3f2fd"
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          px: 1.5,
                          py: 0.5,
                          bgcolor: "#e8f5e8",
                          borderRadius: 2,
                          border: "1px solid #c8e6c9"
                        }}
                      >
                        <FaCheck size={14} color="#2e7d32" />
                        <Typography variant="body2" color="#2e7d32" sx={{ ml: 1, fontWeight: 600, fontSize: "0.8rem" }}>
                          Đã chọn
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          )}

          {selectedLesson && (
            <>
              {/* Divider */}
              <Box sx={{ 
                my: 4, 
                display: "flex", 
                alignItems: "center", 
                gap: 2 
              }}>
                <Box sx={{ 
                  flex: 1, 
                  height: "1px", 
                  background: "linear-gradient(90deg, transparent, #e0e0e0, transparent)" 
                }} />
                <Box sx={{ 
                  px: 2, 
                  py: 0.5, 
                  bgcolor: "#f5f5f5", 
                  borderRadius: 2,
                  border: "1px solid #e0e0e0"
                }}>
                  <Typography variant="body2" sx={{ 
                    color: "#666", 
                    fontWeight: 500, 
                    fontSize: "0.8rem" 
                  }}>
                    BÀI HỌC ĐÃ CHỌN
                  </Typography>
                </Box>
                <Box sx={{ 
                  flex: 1, 
                  height: "1px", 
                  background: "linear-gradient(90deg, transparent, #e0e0e0, transparent)" 
                }} />
              </Box>

              <Box sx={{ 
                p: 2.5, 
                bgcolor: "#f8fbff", 
                borderRadius: 3,
                border: "2px solid #e3f2fd"
              }}>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 700, mb: 1.5, color: "#1976d2" }}
                >
                  ✓ Bài học đã chọn
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: "#1a1a1a" }}>
                  {selectedLesson.name}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1.5, gap: 1 }}>
                  <Box
                    sx={{
                      px: 1.2,
                      py: 0.4,
                      bgcolor: "#e3f2fd",
                      borderRadius: 2,
                      border: "1px solid #bbdefb"
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "#1976d2", fontSize: "0.8rem" }}>
                      {formatLanguageCode(selectedLesson.languageCode)}
                    </Typography>
                  </Box>
                  {selectedLesson.category && (
                    <Box
                      sx={{
                        px: 1.2,
                        py: 0.4,
                        bgcolor: "#f3e5f5",
                        borderRadius: 2,
                        border: "1px solid #e1bee7"
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "#7b1fa2", fontSize: "0.8rem" }}>
                        {selectedLesson.category}
                      </Typography>
                    </Box>
                  )}
                </Box>
                <Typography variant="h5" color="primary" sx={{ fontWeight: 800, mb: 0.5 }}>
                  {typeof selectedLesson.price === "number" ||
                  typeof selectedLesson.price === "string"
                    ? formatPriceWithCommas(selectedLesson.price)
                    : "0"}{" "}
                  <Typography component="span" variant="body2" sx={{ fontWeight: 400, fontSize: "0.8rem" }}>
                    VNĐ/slot
                  </Typography>
                </Typography>
                {selectedLesson.description && (
                  <Typography variant="body2" sx={{ mt: 1.5, fontStyle: "italic", color: "#666", lineHeight: 1.4, fontSize: "0.85rem" }}>
                    {selectedLesson.description}
                  </Typography>
                )}
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Hủy</Button>
          <Button
            variant="contained"
            onClick={handleLessonSelected}
            disabled={!selectedLesson || availableLessons.length === 0}
          >
            Tiếp tục chọn khung giờ
          </Button>
        </DialogActions>
      </Dialog>

      {/* Schedule Calendar Dialog */}
      <Dialog
        open={isOpen && !lessonSelectionDialogOpen}
        onClose={handleClose}
        maxWidth={false}
        fullWidth={false}
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
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="h6">
                Chọn khung giờ để đề xuất cho học viên
              </Typography>
              <Tooltip
                title={
                  <Box>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      • Gia sư phải đề xuất ít nhất 3 slot trở lên
                    </Typography>
                    <Typography variant="body2">
                      • Gia sư chỉ có thể đề xuất slot sau 48h kể từ ngày hiện
                      tại
                    </Typography>
                  </Box>
                }
                arrow
                placement="top"
                sx={{
                  "& .MuiTooltip-tooltip": {
                    backgroundColor: "rgba(0, 0, 0, 0.87)",
                    color: "white",
                    fontSize: "0.875rem",
                    maxWidth: 300,
                    p: 2,
                  },
                }}
              >
                <IconButton
                  size="small"
                  sx={{
                    color: "primary.main",
                    "&:hover": {
                      backgroundColor: "rgba(25, 118, 210, 0.04)",
                    },
                  }}
                >
                  <FaInfoCircle size={16} />
                </IconButton>
              </Tooltip>
            </Box>
            {selectedLesson && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  p: 2,
                  backgroundColor: "#f8f9fa",
                  borderRadius: 1,
                }}
              >
                <Typography
                  variant="body2"
                  color="primary"
                  sx={{ fontWeight: "bold" }}
                >
                  Bài học đã chọn:
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: "bold", fontSize: "16px" }}
                >
                  {selectedLesson.name}
                </Typography>
                {selectedLesson.description && (
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{ fontSize: "0.875rem" }}
                  >
                    {selectedLesson.description}
                  </Typography>
                )}
                {selectedLesson.price && (
                  <Typography
                    variant="body2"
                    color="primary"
                    sx={{ fontWeight: 500 }}
                  >
                    Giá: {formatPriceWithCommas(selectedLesson.price)} VNĐ/slot
                  </Typography>
                )}
              </Box>
            )}
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton
              onClick={handlePreviousWeek}
              sx={{
                color: "primary.main",
                "&:hover": { backgroundColor: "rgba(25, 118, 210, 0.04)" },
              }}
            >
              <FaChevronLeft />
            </IconButton>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {formatDateRange(weekDates[0], weekDates[6])}
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
          {loading ? (
            <Box sx={{ p: 2 }}>
              <Box sx={{ display: "grid", gridTemplateColumns: "140px repeat(7, 1fr)", minWidth: "900px", gap: 1 }}>
                {/* Header skeleton */}
                <Box sx={{ p: 1.5, backgroundColor: "#e2e8f0", borderRadius: 1, height: 40 }} />
                {[1, 2, 3, 4, 5, 6, 7].map((index) => (
                  <Box key={index} sx={{ p: 1.5, backgroundColor: "#e2e8f0", borderRadius: 1, height: 40 }} />
                ))}
                
                {/* Time slots skeleton */}
                {Array.from({ length: 48 }).map((_, slotIdx) => (
                  <React.Fragment key={slotIdx}>
                    <Box sx={{ p: 1, backgroundColor: "#e2e8f0", borderRadius: 1, height: 32 }} />
                    {[1, 2, 3, 4, 5, 6, 7].map((dayIdx) => (
                      <Box key={dayIdx} sx={{ p: 1, backgroundColor: "#e2e8f0", borderRadius: 1, height: 32 }} />
                    ))}
                  </React.Fragment>
                ))}
              </Box>
            </Box>
          ) : error ? (
            <Box
              sx={{
                p: 2,
                bgcolor: "error.light",
                color: "error.contrastText",
                borderRadius: 1,
              }}
            >
              <Typography>{error}</Typography>
            </Box>
          ) : (
                          <Box sx={{ display: "flex", gap: 3, height: "100%" }}>
              {/* Left side - Calendar table */}
              <Box sx={{ flex: 1, overflowX: "auto" }}>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "140px repeat(7, 1fr)",
                    minWidth: "900px",
                  }}
                >
                  {/* Header row */}
                  <Box sx={{ p: 1.5, fontWeight: 600, textAlign: "center" }}>
                    Thời gian
                  </Box>
                  {dialogWeekInfo.map((d, i) => (
                    <Box
                      key={i}
                      sx={{ p: 1.5, fontWeight: 600, textAlign: "center" }}
                    >
                      <div style={{ fontSize: 14 }}>{d.label}</div>
                      <div style={{ fontSize: 13, color: "#64748b" }}>
                        {d.date}
                      </div>
                    </Box>
                  ))}

                  {/* Time slots */}
                  {Array.from({ length: 48 }).map((_, slotIdx) => {
                    const hour = Math.floor(slotIdx / 2);
                    const minute = slotIdx % 2 === 0 ? "00" : "30";
                    const nextHour = slotIdx % 2 === 0 ? hour : hour + 1;
                    const nextMinute = slotIdx % 2 === 0 ? "30" : "00";
                    const timeLabel = `${hour
                      .toString()
                      .padStart(2, "0")}:${minute} - ${nextHour
                      .toString()
                      .padStart(2, "0")}:${nextMinute}`;

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
                          const date = weekDates[dayIdx];
                          const status = getSlotStatus(date, slotIdx);
                          const isSelected = isSlotSelected(date, slotIdx);
                          const isPastSlot = isSlotInPast(
                            currentWeek,
                            dayInWeek,
                            slotIdx
                          );

                          let bgColor = "#f1f5f9"; // Default background
                          let textColor = "inherit";
                          let fontWeight = 400;
                          let opacity = 1;
                          let cursor = "default"; // Default cursor
                          let overlayPattern = {};

                          if (isPastSlot) {
                            // Past slots: show their status but muted and disabled
                            opacity = 0.7;
                            cursor = "not-allowed";

                            // Only apply diagonal stripe pattern for past slots that are NOT available
                            if (status !== "available") {
                              overlayPattern = {
                                position: "relative",
                                "&::after": {
                                  content: '""',
                                  position: "absolute",
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  bottom: 0,
                                  background:
                                    "repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(128,128,128,0.6) 3px, rgba(128,128,128,0.6) 6px)",
                                  pointerEvents: "none",
                                },
                              };
                            }

                            // Apply muted versions of the original colors for past slots
                            if (isSelected) {
                              bgColor = "#98D45F"; // green for selected (even if past)
                              textColor = "#fff";
                              fontWeight = 700;
                            } else if (status === "available") {
                              bgColor = "#3B82F6"; // blue for available slots (even if past)
                              textColor = "#fff";
                              fontWeight = 700;
                            } else if (status === "onhold") {
                              bgColor = "#fae632"; // muted yellow for onhold
                              textColor = "#333";
                              fontWeight = 600;
                            } else if (status === "booked") {
                              bgColor = "#ffb3b3"; // muted red for booked
                              textColor = "#fff";
                              fontWeight = 700;
                            }
                          } else {
                            // Future slots: only available slots are clickable
                            if (isSelected) {
                              bgColor = "#98D45F"; // green for selected
                              textColor = "#fff";
                              fontWeight = 700;
                              cursor = "pointer"; // Selected slots can be deselected
                            } else if (status === "available") {
                              bgColor = "#3B82F6"; // blue for available
                              textColor = "#fff";
                              fontWeight = 700;
                              cursor = "pointer"; // Only available slots are clickable
                            } else if (status === "onhold") {
                              bgColor = "#FFD700"; // yellow for onhold
                              textColor = "#333";
                              fontWeight = 600;
                              cursor = "not-allowed"; // Onhold slots are not clickable
                            } else if (status === "booked") {
                              bgColor = "#ef4444"; // red for booked
                              textColor = "#fff";
                              fontWeight = 700;
                              cursor = "not-allowed"; // Booked slots are not clickable
                            }
                          }

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
                                cursor: cursor,
                                opacity: opacity,
                                transition: "background 0.2s",
                                "&:hover": isPastSlot
                                  ? {}
                                  : {
                                      filter: "brightness(0.9)",
                                    },
                                ...overlayPattern,
                              }}
                              onClick={() => {
                                if (!isPastSlot && status === "available") {
                                  handleSlotClick(date, slotIdx);
                                }
                              }}
                            />
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                </Box>
              </Box>

              {/* Right side - Selected slots card */}
              <AnimatePresence>
                {selectedSlots.length > 0 && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      x: 50,
                      scale: 0.9,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                      x: 50,
                      scale: 0.9,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                      duration: 0.4,
                    }}
                    style={{ width: 300, flexShrink: 0 }}
                  >
                    <Card sx={{ height: "100%", position: "sticky", top: 0 }}>
                      <CardContent>
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1, duration: 0.3 }}
                        >
                          <Typography
                            variant="h6"
                            sx={{ mb: 2, fontWeight: "bold" }}
                          >
                            Khung giờ đã chọn
                          </Typography>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2, duration: 0.3 }}
                        >
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="textSecondary">
                              Học viên: {learnerName}
                            </Typography>
                          </Box>
                        </motion.div>

                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ maxHeight: 400, overflowY: "auto" }}>
                          <AnimatePresence>
                            {selectedSlots.map((slot, index) => {
                              // Create date properly to avoid timezone issues
                              const [year, month, day] = slot.date
                                .split("-")
                                .map(Number);
                              const date = new Date(year, month - 1, day); // month is 0-indexed
                              const dayName = dayNames[date.getDay()];
                              const hour = Math.floor(slot.slotIndex / 2);
                              const minute =
                                slot.slotIndex % 2 === 0 ? "00" : "30";
                              const nextHour =
                                slot.slotIndex % 2 === 0 ? hour : hour + 1;
                              const nextMinute =
                                slot.slotIndex % 2 === 0 ? "30" : "00";
                              const timeLabel = `${hour
                                .toString()
                                .padStart(2, "0")}:${minute} - ${nextHour
                                .toString()
                                .padStart(2, "0")}:${nextMinute}`;

                              return (
                                <motion.div
                                  key={`${slot.date}-${slot.slotIndex}`}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: 20 }}
                                  transition={{ duration: 0.3 }}
                                >
                                  <Box
                                    sx={{
                                      p: 2,
                                      mb: 1,
                                      borderRadius: 1,
                                      backgroundColor: "#f8f9fa",
                                      border: "1px solid #e9ecef",
                                    }}
                                  >
                                    <Typography
                                      variant="body2"
                                      sx={{ fontWeight: "bold", mb: 0.5 }}
                                    >
                                      {dayName},{" "}
                                      {date.toLocaleDateString("vi-VN")}
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      color="textSecondary"
                                    >
                                      {timeLabel}
                                    </Typography>
                                  </Box>
                                </motion.div>
                              );
                            })}
                          </AnimatePresence>
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
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
                  backgroundColor: "#98D45F", // green - keep this for selected
                  mr: 1,
                }}
              />
              <Typography variant="body2" sx={{ color: "#4a7c1c" }}>
                Đã chọn để đề xuất
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  backgroundColor: "#3B82F6", // blue - updated for available
                  mr: 1,
                }}
              />
              <Typography variant="body2" sx={{ color: "#1e40af" }}>
                Có thể chọn
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  backgroundColor: "#FFD700", // yellow - keep this for onhold
                  mr: 1,
                }}
              />
              <Typography variant="body2" sx={{ color: "#bfa100" }}>
                Tạm giữ
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  backgroundColor: "#ef4444", // red - keep this for booked
                  mr: 1,
                }}
              />
              <Typography variant="body2" sx={{ color: "#ef4444" }}>
                Đã đặt
              </Typography>
            </Box>
          </Box>

          {/* Buttons */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button onClick={handleClose} disabled={submitting}>
              Đóng
            </Button>
            <Button
              variant="contained"
              color="primary"
              disabled={selectedSlots.length < 3 || submitting}
              onClick={handleSubmit}
            >
              {submitting ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box sx={{ width: 16, height: 16, backgroundColor: "currentColor", borderRadius: "50%", opacity: 0.7 }} />
                  Đang gửi...
                </Box>
              ) : (
                `Gửi đề xuất (${selectedSlots.length}/3)`
              )}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Confirm Submit Dialog */}
      <Dialog open={confirmSubmitOpen} onClose={() => {
        setConfirmSubmitOpen(false);
        setAgreedToTerms(false);
      }}>
        <DialogTitle>Xác nhận gửi đề xuất</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn gửi đề xuất này không?
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
          
          {selectedLesson && (
            <Box sx={{ mt: 2, p: 2, backgroundColor: "#f8fafc", borderRadius: 1, border: "1px solid #e2e8f0" }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#374151", mb: 1 }}>
                Thông tin đề xuất:
              </Typography>
              <Typography variant="body2">
                • Bài học: {selectedLesson.name}
              </Typography>
              <Typography variant="body2">
                • Giá mỗi slot: {formatPriceWithCommas(selectedLesson.price)} VNĐ
              </Typography>
              <Typography variant="body2" sx={{ color: "#dc2626", fontWeight: 600 }}>
                • Tổng giá: {formatPriceWithCommas(selectedLesson.price * selectedSlots.length)} VNĐ
              </Typography>
              <Typography variant="body2">
                • Số slots: {selectedSlots.length}
              </Typography>
              <Typography variant="body2">
                • Học viên: {learnerName}
              </Typography>
            </Box>
          )}
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
            {submitting ? "Đang gửi..." : "Gửi đề xuất"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Legal Document Modal */}
      <LegalDocumentModal
        isOpen={showLegalDocumentModal}
        onClose={() => setShowLegalDocumentModal(false)}
        category="offer_booking"
      />
    </>
  );
};

export default TutorScheduleCalendarModal;
