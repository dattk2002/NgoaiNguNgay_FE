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
  Divider
} from "@mui/material";
import { fetchTutorWeeklyPattern, updateLearnerBookingTimeSlot } from "../api/auth";
import Skeleton from "@mui/material/Skeleton";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { FiTrash2 } from "react-icons/fi";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { motion, AnimatePresence } from "framer-motion";

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

// Local storage utilities for selected slots
const getSelectedSlotsKey = (weekStart, tutorId, learnerId) => {
  const weekStartStr = weekStart.toISOString().split('T')[0];
  return `selectedSlots_${tutorId}_${learnerId}_${weekStartStr}`;
};

const saveSelectedSlots = (weekStart, tutorId, learnerId, slots) => {
  const key = getSelectedSlotsKey(weekStart, tutorId, learnerId);
  localStorage.setItem(key, JSON.stringify(slots));
};

const loadSelectedSlots = (weekStart, tutorId, learnerId) => {
  const key = getSelectedSlotsKey(weekStart, tutorId, learnerId);
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : [];
};

const clearSelectedSlots = (weekStart, tutorId, learnerId) => {
  const key = getSelectedSlotsKey(weekStart, tutorId, learnerId);
  localStorage.removeItem(key);
};

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
}) => {
  const [loading, setLoading] = useState(true);
  const [patterns, setPatterns] = useState([]);
  const [weekStart, setWeekStart] = useState(initialWeekStart);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  // Only allow slot selection for learners
  const learnerPermission = isLearner(currentUser);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetchTutorWeeklyPattern(tutorId)
      .then((data) => setPatterns(data || []))
      .finally(() => setLoading(false));
    setWeekStart(initialWeekStart); // Reset week when dialog opens
    
    // Load saved selected slots for this week and tutor
    if (learnerPermission && currentUser?.id) {
      const savedSlots = loadSelectedSlots(initialWeekStart, tutorId, currentUser.id);
      setSelectedSlots(savedSlots);
    }
  }, [open, tutorId, initialWeekStart, learnerPermission, currentUser?.id]);

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
    
    // Load saved slots for the new week
    if (learnerPermission && currentUser?.id) {
      const savedSlots = loadSelectedSlots(prevMonday, tutorId, currentUser.id);
      setSelectedSlots(savedSlots);
    }
  };

  const handleNextWeek = () => {
    if (!monday) return;
    const nextMonday = new Date(monday);
    nextMonday.setDate(monday.getDate() + 7);
    setWeekStart(nextMonday);
    
    // Load saved slots for the new week
    if (learnerPermission && currentUser?.id) {
      const savedSlots = loadSelectedSlots(nextMonday, tutorId, currentUser.id);
      setSelectedSlots(savedSlots);
    }
  };

  // Check if slot is available based on pattern
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
    // Only allow selection if learner, slot is available, and it's the current week
    if (!learnerPermission || !isAvailable || !isCurrentWeek) return;
    
    setSelectedSlots((prev) => {
      const newSlots = prev.some((s) => s.dayInWeek === dayInWeek && s.slotIndex === slotIndex)
        ? prev.filter((s) => !(s.dayInWeek === dayInWeek && s.slotIndex === slotIndex))
        : [...prev, { dayInWeek, slotIndex }];
      
      // Save to localStorage
      if (currentUser?.id) {
        saveSelectedSlots(weekStart, tutorId, currentUser.id, newSlots);
      }
      
      return newSlots;
    });
  };

  // Optional: clear selected slots when not in current week
  useEffect(() => {
    if (!isCurrentWeek) setSelectedSlots([]);
  }, [isCurrentWeek]);

  // Always get the current UTC date (YYYY-MM-DD)
  const now = new Date();
  const expectedStartDateToday = now.toISOString();

  const handleSubmit = async () => {
    if (!isCurrentWeek) {
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);
    
    console.log("🔗 TutorWeeklyPatternDetailModal - Starting booking submission");
    console.log("📦 Booking Details:", {
      tutorId,
      lessonId,
      expectedStartDate: expectedStartDate || expectedStartDateToday, // Use passed expectedStartDate or current
      selectedSlots,
      currentUser: {
        id: currentUser?.id,
        name: currentUser?.name,
        fullName: currentUser?.fullName
      }
    });

    try {
      console.log("📦 TutorWeeklyPatternDetailModal - Calling updateLearnerBookingTimeSlot...");
      
      // Use the expectedStartDate parameter if provided, otherwise use current date
      const finalExpectedStartDate = expectedStartDate || expectedStartDateToday;
      
      await updateLearnerBookingTimeSlot(
        tutorId,
        lessonId,
        finalExpectedStartDate,
        selectedSlots
      );
      console.log("✅ TutorWeeklyPatternDetailModal - Booking slot updated successfully");

      // Note: Notification will be sent via SignalR hub automatically by the backend
      console.log("✅ TutorWeeklyPatternDetailModal - Notification will be sent via SignalR hub");

      setSubmitSuccess(true);
      setSelectedSlots([]);
      
      // Clear saved slots after successful submission
      if (currentUser?.id) {
        clearSelectedSlots(weekStart, tutorId, currentUser.id);
      }
      
      if (onBookingSuccess) onBookingSuccess();
      onClose();
    } catch (err) {
      console.error("❌ TutorWeeklyPatternDetailModal - Error during submission:", err);
      setSubmitError(err.message || "Gửi yêu cầu thất bại.");
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

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
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
          <Typography variant="h6">
            Chi tiết lịch trình khả dụng
          </Typography>
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
        {loading ? (
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
                      const isActive = isSlotAvailable(dayInWeek, slotIdx);
                      const isSelected = selectedSlots.some(
                        (s) => s.dayInWeek === dayInWeek && s.slotIndex === slotIdx
                      );
                      
                      // Check if slot is in the past
                      const isPastSlot = isSlotInPast(dayInWeek, slotIdx);
                      
                      // Determine background color based on past status and selection
                      let backgroundColor;
                      if (isPastSlot) {
                        // Past slots - muted colors
                        if (isSelected) {
                          backgroundColor = "#6d9e46"; // muted green for selected past slots
                        } else if (isActive) {
                          backgroundColor = "#6d9e46"; // muted green for available past slots
                        } else {
                          backgroundColor = "#B8B8B8"; // muted gray for unavailable past slots
                        }
                      } else {
                        // Current/future slots - normal colors
                        if (isSelected) {
                          backgroundColor = "#2563eb";
                        } else if (isActive) {
                          backgroundColor = "#98D45F";
                        } else {
                          backgroundColor = "#f1f5f9";
                        }
                      }

                      return (
                        <Box
                          key={dayIdx}
                          sx={{
                            backgroundColor,
                            border: "1px solid #e2e8f0",
                            minHeight: 32,
                            cursor: learnerPermission && isActive && isCurrentWeek && !isPastSlot ? "pointer" : "default",
                            opacity: isPastSlot ? 0.7 : 1,
                            transition: "background 0.2s",
                            position: "relative",
                            "&:hover": !isPastSlot && learnerPermission && isActive && isCurrentWeek ? {
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
                            // Don't allow clicking on past slots
                            if (isPastSlot) return;
                            handleSlotClick(dayInWeek, slotIdx, isActive);
                          }}
                        />
                      );
                    })}
                  </React.Fragment>
                ))}
              </Box>
            </Box>

            {/* Right side - Selected slots card */}
            <AnimatePresence>
              {selectedSlots.length > 0 && learnerPermission && (
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
                    <CardContent>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.3 }}
                      >
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
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
                            Gia sư: {tutorName || 'N/A'}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Số slot đã chọn để đặt lịch: {selectedSlots.length}
                          </Typography>
                        </Box>
                      </motion.div>

                      <Divider sx={{ my: 2 }} />

                      <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                        <AnimatePresence>
                          {selectedSlots.map((slot, index) => {
                            // Map dayInWeek to the correct day label
                            const dayIndexMap = {
                              1: 6, // Sun -> index 6
                              2: 0, // Mon -> index 0
                              3: 1, // Tue -> index 1
                              4: 2, // Wed -> index 2
                              5: 3, // Thu -> index 3
                              6: 4, // Fri -> index 4
                              7: 5, // Sat -> index 5
                            };
                            const dayLabel = dayLabels[dayIndexMap[slot.dayInWeek]];
                            const dayDate = weekDates[dayIndexMap[slot.dayInWeek]];
                            
                            const hour = Math.floor(slot.slotIndex / 2);
                            const minute = slot.slotIndex % 2 === 0 ? "00" : "30";
                            const nextHour = slot.slotIndex % 2 === 0 ? hour : hour + 1;
                            const nextMinute = slot.slotIndex % 2 === 0 ? "30" : "00";
                            const timeLabel = `${hour.toString().padStart(2, "0")}:${minute} - ${nextHour.toString().padStart(2, "0")}:${nextMinute}`;

                            return (
                              <motion.div
                                key={`${slot.dayInWeek}-${slot.slotIndex}`}
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
                                      {dayDate}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#3b82f6', fontWeight: 'medium' }}>
                                      {timeLabel}
                                    </Typography>
                                  </Box>
                                  <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    <IconButton
                                      size="small"
                                      onClick={() => handleSlotClick(slot.dayInWeek, slot.slotIndex, true)}
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
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => {
                                setSelectedSlots([]);
                                if (currentUser?.id) {
                                  clearSelectedSlots(weekStart, tutorId, currentUser.id);
                                }
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
        <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
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
                backgroundColor: "#2563eb",
                mr: 1,
              }}
            />
            <Typography variant="body2" sx={{ color: "#2563eb" }}>
              Lịch bạn đang chọn
            </Typography>
          </Box>
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
          {learnerPermission && (
            <Button
              onClick={handleSubmit}
              disabled={
                selectedSlots.length === 0 ||
                submitting ||
                !isCurrentWeek ||
                isTutor(currentUser)
              }
              variant="contained"
              color="primary"
            >
              {submitting ? "Đang gửi..." : "Gửi yêu cầu"}
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
    </Dialog>
  );
};

export default TutorWeeklyPatternDetailModal;