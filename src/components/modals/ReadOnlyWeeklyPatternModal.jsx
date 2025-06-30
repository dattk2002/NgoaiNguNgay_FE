// src/components/modals/ReadOnlyWeeklyPatternDialog.jsx
import React, { useEffect, useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, IconButton } from "@mui/material";
import { fetchTutorWeeklyPattern } from "../api/auth";
import Skeleton from "@mui/material/Skeleton";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

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
  // Find the pattern that starts on or before this week's Monday
  return sorted.find(pattern => new Date(pattern.appliedFrom) <= weekStart) || sorted[sorted.length - 1];
}

const ReadOnlyWeeklyPatternModal = ({ open, onClose, tutorId, initialWeekStart }) => {
  const [loading, setLoading] = useState(true);
  const [patterns, setPatterns] = useState([]);
  const [weekStart, setWeekStart] = useState(initialWeekStart);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetchTutorWeeklyPattern(tutorId)
      .then((data) => setPatterns(data || []))
      .finally(() => setLoading(false));
    setWeekStart(initialWeekStart); // Reset week when dialog opens
  }, [open, tutorId, initialWeekStart]);

  // Calculate week range
  const monday = weekStart ? new Date(weekStart) : null;
  const sunday = monday ? new Date(monday) : null;
  if (sunday) sunday.setDate(monday.getDate() + 6);

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
  };
  const handleNextWeek = () => {
    if (!monday) return;
    const nextMonday = new Date(monday);
    nextMonday.setDate(monday.getDate() + 7);
    setWeekStart(nextMonday);
  };

  // Find the pattern for this week
  const pattern = getPatternForWeek(patterns, monday);

  // Helper: check if a slot is available
  const isSlotAvailable = (dayInWeek, slotIndex) => {
    if (!pattern || !pattern.slots) return false;
    return pattern.slots.some(
      (slot) => slot.dayInWeek === dayInWeek && slot.slotIndex === slotIndex && slot.type === 0
    );
  };

  // Helper: format time label for each slot
  const getTimeLabel = (slotIdx) => {
    const hour = Math.floor(slotIdx / 2);
    const minute = slotIdx % 2 === 0 ? "00" : "30";
    const nextHour = slotIdx % 2 === 0 ? hour : hour + 1;
    const nextMinute = slotIdx % 2 === 0 ? "30" : "00";
    return `${hour.toString().padStart(2, "0")}:${minute} - ${nextHour.toString().padStart(2, "0")}:${nextMinute}`;
  };

  // Get week dates for header
  const weekDates = [];
  if (monday) {
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      weekDates.push(d.getDate());
    }
  }

  // Disable previous week button if at current week or earlier
  const isAtCurrentWeek =
    monday &&
    monday.getFullYear() === currentMonday.getFullYear() &&
    monday.getMonth() === currentMonday.getMonth() &&
    monday.getDate() === currentMonday.getDate();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle>
        Chi tiết lịch trình khả dụng
        {monday && sunday && (
          <Typography variant="subtitle2" sx={{ mt: 1, fontWeight: 400 }}>
            Tuần: {formatDateRangeVN(monday, sunday)}
          </Typography>
        )}
      </DialogTitle>
      <DialogContent>
        {/* Week navigation UI */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", mb: 2, gap: 1 }}>
          {/* Only render the left arrow if not at the current week */}
          {!isAtCurrentWeek && (
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
          )}
          <Typography variant="body2" sx={{ fontWeight: 600, mx: 1 }}>
            {monday && sunday ? formatDateRangeVN(monday, sunday) : ""}
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
          <Box sx={{ overflowX: "auto" }}>
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
              ))}
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReadOnlyWeeklyPatternModal;