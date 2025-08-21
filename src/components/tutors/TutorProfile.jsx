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
  Skeleton,
  Tooltip,
  Autocomplete,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  FiPlusCircle,
  FiEdit,
  FiTrash2,
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiX,
} from "react-icons/fi";
import { MdOutlineEditCalendar } from "react-icons/md";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { styled } from "@mui/material/styles";
import {
  getAccessToken,
  fetchTutorLesson,
  fetchTutorLessonDetailById,
  createLesson,
  updateLesson,
  deleteLesson,
  editTutorWeeklyPattern,
  deleteTutorWeeklyPattern,
  fetchTutorListWeeklyPatternsByTutorId,
  createTutorWeeklyPattern,
  tutorBookingTimeSlotFromLearner,
  tutorBookingTimeSlotFromLearnerDetail,
  createTutorBookingOffer,
  tutorBookingOfferDetail,
  getAllTutorBookingOffer,
  updateTutorWeeklyPattern,
  updateTutorBookingOfferByOfferId,
  fetchDocumentsByTutorId,
  deleteDocument,
  fetchTutorWeeklyPatternDetailByPatternId,
  fetchWeeklyPatternBlockedSlotsByPatternId,
  fetchTutorBookingConfigByTutorId,
  updateTutorBookingConfig,
} from "../../components/api/auth";
import { formatLanguageCode } from "../../utils/formatLanguageCode";
import ConfirmDialog from "../modals/ConfirmDialog";
import { languageList } from "../../utils/languageList";
import formatPriceWithCommas from "../../utils/formatPriceWithCommas";
import formatPriceInputWithCommas from "../../utils/formatPriceInputWithCommas";
import getWeekDates from "../../utils/getWeekDates";
import ConfirmDeleteWeeklyPattern from "../modals/ConfirmDeleteWeeklyPattern";
import { motion, AnimatePresence } from "framer-motion";
import { convertUTC7ToUTC0 } from "../../utils/formatCentralTimestamp";

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
      // Remove focus outline from chips
      ".MuiChip-root:focus": {
        outline: "none !important",
        boxShadow: "none !important",
      },
      // Smooth scrolling
      "html": {
        scrollBehavior: "smooth",
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
  backgroundColor: "#B8B8B8",
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

const handleFileChange = (e) => {
  const { files } = e.target;
  if (files.length > 0) {
    const file = files[0];

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("Kích thước ảnh phải nhỏ hơn 2MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Chỉ chấp nhận các tệp ảnh");
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
  const nextMonday = new Date(
    Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate() + daysUntilMonday,
      0,
      0,
      0,
      0
    )
  );
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
  const diff = day === 0 ? -6 : 1 - day;

  monday.setDate(monday.getDate() + diff);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return { monday, sunday };
}

function formatDateRange(start, end) {
  const options = { day: "2-digit", month: "2-digit", year: "numeric" };
  return `${start.toLocaleDateString(
    "vi-VN",
    options
  )} - ${end.toLocaleDateString("vi-VN", options)}`;
}

function buildAvailabilityData(pattern, timeRanges) {
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
  if (pattern && pattern.slots && Array.isArray(pattern.slots)) {
    pattern.slots.forEach((slot) => {
      const hour = Math.floor(slot.slotIndex / 2);
      const startHour = hour;
      const endHour = hour + 1;
      const timeRangeKey = `${startHour
        .toString()
        .padStart(2, "0")}:00 - ${endHour.toString().padStart(2, "0")}:00`;
      const dayMap = {
        1: "CN",
        2: "T2",
        3: "T3",
        4: "T4",
        5: "T5",
        6: "T6",
        7: "T7",
      };
      const dayKey = dayMap[slot.dayInWeek];
      if (
        timeRangeKey &&
        blockAvailability[timeRangeKey] &&
        dayKey &&
        slot.type === 0
      ) {
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
          <Skeleton
            variant="text"
            width={20}
            height={16}
            sx={{ mx: "auto", mb: 0.5 }}
          />
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
        const timeLabel = `${hour.toString().padStart(2, "0")}:00 - ${nextHour
          .toString()
          .padStart(2, "0")}:00`;
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
    pattern.slots.forEach((slot) => {
      if (slot.type === 0) {
        if (!slotMap[slot.dayInWeek]) slotMap[slot.dayInWeek] = new Set();
        slotMap[slot.dayInWeek].add(slot.slotIndex);
      }
    });
  }
  return slotMap;
}

function getSlotDateTime(weekStart, dayInWeek, slotIndex) {
  const slotDate = new Date(weekStart);

  // Fix the day offset calculation
  // dayInWeek: 1=Sun, 2=Mon, 3=Tue, 4=Wed, 5=Thu, 6=Fri, 7=Sat
  // weekStart is Monday, so we need to map:
  // 1 (Sun) -> +6 days, 2 (Mon) -> +0 days, 3 (Tue) -> +1 day, etc.
  const dayOffset = dayInWeek === 1 ? 6 : dayInWeek - 2;

  slotDate.setDate(slotDate.getDate() + dayOffset);
  
  // Calculate hours and minutes from slotIndex (0-47 for 48 slots per day)
  const hour = Math.floor(slotIndex / 2);
  const minute = slotIndex % 2 === 0 ? 0 : 30;
  slotDate.setHours(hour, minute, 0, 0);
  
  return slotDate;
}

const validateLessonForm = (form) => {
  const errors = {};

  // Tên bài học: 5-50 characters
  if (!form.name || form.name.length < 5 || form.name.length > 100) {
    errors.name = "Tên bài học phải từ 5-100 ký tự";
  }

  // Mô tả: 10-100 characters
  if (
    !form.description ||
    form.description.length < 10 ||
    form.description.length > 1000
  ) {
    errors.description = "Mô tả phải từ 10-1000 ký tự";
  }

  // Ghi chú: 10-100 characters (optional field)
  if (form.note && (form.note.length < 10 || form.note.length > 1000)) {
    errors.note = "Ghi chú phải từ 10-1000 ký tự";
  }

  // Đối tượng: 1-20 characters
  if (
    !form.targetAudience ||
    form.targetAudience.length < 1 ||
    form.targetAudience.length > 200
  ) {
    errors.targetAudience = "Đối tượng phải từ 1-200 ký tự";
  }

  // Yêu cầu trước: 10-100 characters
  if (
    !form.prerequisites ||
    form.prerequisites.length < 10 ||
    form.prerequisites.length > 300
  ) {
    errors.prerequisites = "Yêu cầu trước phải từ 10-300 ký tự";
  }

  // Danh mục: 5-50 characters
  if (
    !form.category ||
    form.category.length < 5 ||
    form.category.length > 100
  ) {
    errors.category = "Danh mục phải từ 5-100 ký tự";
  }

  // Language code is required
  if (!form.languageCode) {
    errors.languageCode = "Vui lòng chọn ngôn ngữ";
  }

  // Price is required
  if (!form.price) {
    errors.price = "Vui lòng nhập giá tiền";
  }

  return errors;
};

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

// Place this above TutorProfile
const TutorProfileSkeleton = () => (
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
      sx={{ width: "100%", flex: "1 1 auto", margin: 0 }}
    >
      {/* Left Column Skeleton */}
      <Grid
        item
        xs={12}
        md={4}
        sx={{ display: "flex", flexDirection: "column", width: "100%" }}
      >
        <Paper
          sx={{
            textAlign: "center",
            position: "relative",
            p: 4,
            width: "100%",
            borderRadius: "16px",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Skeleton variant="circular" width={160} height={160} />
            <Skeleton variant="text" width={120} height={40} sx={{ mt: 2 }} />
            <Skeleton variant="text" width={80} height={24} sx={{ mt: 1 }} />
            <Skeleton
              variant="rectangular"
              width={100}
              height={32}
              sx={{ mt: 3, borderRadius: 2 }}
            />
          </Box>
        </Paper>
      </Grid>
      {/* Right Column Skeleton */}
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
        <Paper
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
          {/* Tabs Skeleton */}
          <Box
            sx={{
              width: "100%",
              maxWidth: "100%",
              flex: "0 0 auto",
              borderBottom: "2px solid #f1f5f9",
              display: "flex",
            }}
          >
            <Skeleton
              variant="rectangular"
              width={180}
              height={48}
              sx={{ mr: 2, borderRadius: 2 }}
            />
            <Skeleton
              variant="rectangular"
              width={180}
              height={48}
              sx={{ borderRadius: 2 }}
            />
          </Box>
          {/* Main Content Skeleton */}
          <Box
            sx={{
              p: 4,
              width: "100%",
              maxWidth: "100%",
              boxSizing: "border-box",
              flex: "1 1 auto",
              minWidth: 0,
            }}
          >
            {/* Email Section */}
            <Skeleton variant="text" width="25%" height={32} sx={{ mb: 2 }} />
            <Skeleton
              variant="rectangular"
              width="60%"
              height={36}
              sx={{ mb: 4, borderRadius: 2 }}
            />

            {/* About Section */}
            <Skeleton variant="text" width="30%" height={32} sx={{ mb: 2 }} />
            <Skeleton
              variant="rectangular"
              width="100%"
              height={60}
              sx={{ mb: 2, borderRadius: 2 }}
            />
            <Skeleton
              variant="rectangular"
              width="100%"
              height={40}
              sx={{ mb: 4, borderRadius: 2 }}
            />

            {/* Teaching Method Section */}
            <Skeleton variant="text" width="30%" height={32} sx={{ mb: 2 }} />
            <Skeleton
              variant="rectangular"
              width="100%"
              height={40}
              sx={{ mb: 4, borderRadius: 2 }}
            />

            {/* Schedule Section */}
            <Skeleton variant="text" width="30%" height={32} sx={{ mb: 2 }} />
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <Skeleton variant="circular" width={32} height={32} />
              <Skeleton variant="text" width={120} height={32} />
              <Skeleton variant="circular" width={32} height={32} />
              <Skeleton
                variant="rectangular"
                width={140}
                height={40}
                sx={{ borderRadius: 2 }}
              />
              <Skeleton
                variant="rectangular"
                width={140}
                height={40}
                sx={{ borderRadius: 2 }}
              />
            </Box>
            {/* Weekly Schedule Table Skeleton */}
            <Skeleton
              variant="rectangular"
              width="100%"
              height={320}
              sx={{ mb: 4, borderRadius: 2 }}
            />

            {/* Learner Requests Section */}
            <Skeleton variant="text" width="30%" height={32} sx={{ mb: 2 }} />
            <Skeleton
              variant="rectangular"
              width="100%"
              height={80}
              sx={{ mb: 4, borderRadius: 2 }}
            />

            {/* FAQ Section */}
            <Skeleton variant="text" width="30%" height={32} sx={{ mb: 2 }} />
            <Skeleton
              variant="rectangular"
              width="100%"
              height={40}
              sx={{ mb: 2, borderRadius: 2 }}
            />
            <Skeleton
              variant="rectangular"
              width="100%"
              height={40}
              sx={{ mb: 2, borderRadius: 2 }}
            />
            <Skeleton
              variant="rectangular"
              width="100%"
              height={40}
              sx={{ mb: 2, borderRadius: 2 }}
            />
          </Box>
        </Paper>
      </Grid>
    </Grid>
  </Container>
);

// Add this skeleton component for weekly patterns table
const WeeklyPatternsTableSkeleton = () => (
  <TableContainer component={Paper}>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>ID</TableCell>
          <TableCell>Ngày bắt đầu áp dụng</TableCell>
          <TableCell>Ngày kết thúc</TableCell>
          <TableCell>Trạng thái</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {Array.from({ length: 3 }).map((_, idx) => (
          <TableRow key={idx}>
            <TableCell>
              <Skeleton variant="text" width="80%" height={24} />
            </TableCell>
            <TableCell>
              <Skeleton variant="text" width="60%" height={24} />
            </TableCell>
            <TableCell>
              <Skeleton variant="text" width="60%" height={24} />
            </TableCell>
            <TableCell>
              <Skeleton variant="text" width="40%" height={24} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

const TutorProfile = ({
  user,
  onRequireLogin,
  fetchTutorDetail,
  requestTutorVerification,
  uploadCertificate,
}) => {
  const { id } = useParams();
  const [tutorData, setTutorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
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
  const [lessonFormErrors, setLessonFormErrors] = useState({});
  const [lessonLoading, setLessonLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState(null);
  const [showValidation, setShowValidation] = useState(false);

  // New state for weekly patterns
  const [weeklyPatternsList, setWeeklyPatternsList] = useState([]);
  const [weeklyPatternsListLoading, setWeeklyPatternsListLoading] =
    useState(false);
  const [weeklyPatternsListError, setWeeklyPatternsListError] = useState(null);

  // Add new state for all pattern details
  const [allPatternDetails, setAllPatternDetails] = useState([]);
  const [allPatternDetailsLoading, setAllPatternDetailsLoading] =
    useState(false);

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

  // Add new state for editing weekly pattern (after the existing state declarations)
  const [editPatternDialogOpen, setEditPatternDialogOpen] = useState(false);
  const [editingPattern, setEditingPattern] = useState(null);
  const [editPatternSlots, setEditPatternSlots] = useState({});
  const [editPatternLoading, setEditPatternLoading] = useState(false);
  const [editPatternWeekStart, setEditPatternWeekStart] = useState(getWeekRange().monday);

  // Add after line 970 (after editPatternWeekStart state)
  const [editPatternBlockedSlots, setEditPatternBlockedSlots] = useState([]);
  const [editPatternBlockedSlotsLoading, setEditPatternBlockedSlotsLoading] = useState(false);

  const dayLabels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
  const dayInWeekOrder = [2, 3, 4, 5, 6, 7, 1]; // API: 2=Mon, ..., 7=Sat, 1=Sun

  const [deletePatternModalOpen, setDeletePatternModalOpen] = useState(false);
  const [patternToDelete, setPatternToDelete] = useState(null);

  // Inside TutorProfile component, after useState declarations
  const [currentWeekStart, setCurrentWeekStart] = useState(
    getWeekRange().monday
  );

  // Add state for learner booking requests
  const [learnerRequests, setLearnerRequests] = useState([]);
  const [learnerRequestsLoading, setLearnerRequestsLoading] = useState(false);
  const [learnerRequestsError, setLearnerRequestsError] = useState(null);
  const [bookingDetailDialogOpen, setBookingDetailDialogOpen] = useState(false);
  const [bookingDetailLoading, setBookingDetailLoading] = useState(false);
  const [bookingDetailSlots, setBookingDetailSlots] = useState([]);
  const [selectedLearner, setSelectedLearner] = useState(null);
  const [selectedOfferSlots, setSelectedOfferSlots] = useState([]);
  const [offerDetail, setOfferDetail] = useState(null);

  const [dialogWeekStart, setDialogWeekStart] = useState(getWeekRange().monday);

  const [allOffers, setAllOffers] = useState([]);
  const [offersLoading, setOffersLoading] = useState(false);

  // Add new state variables after line 962 (after offerDetail state)
  const [lessonSelectionDialogOpen, setLessonSelectionDialogOpen] =
    useState(false);
  const [availableLessons, setAvailableLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [lessonsLoading, setLessonsLoading] = useState(false);

  // Add state for learner's selected lesson details
  const [learnerLessonDetails, setLearnerLessonDetails] = useState(null);

  // Add new state for temporarily selected slots
  const [temporarilySelectedSlots, setTemporarilySelectedSlots] = useState([]);

  // Add states for lessons management
  const [lessons, setLessons] = useState([]);

  // Helper function to get localStorage key for a specific week
  const getTemporarySlotsKey = (weekStart, learnerId) => {
    const weekKey = weekStart.toISOString().split("T")[0]; // YYYY-MM-DD format
    return `temporary_slots_${learnerId}_${weekKey}`;
  };

  // Helper function to save temporarily selected slots to localStorage
  const saveTemporarySlots = (weekStart, learnerId, slots) => {
    const key = getTemporarySlotsKey(weekStart, learnerId);
    localStorage.setItem(key, JSON.stringify(slots));
  };

  // Helper function to load temporarily selected slots from localStorage
  const loadTemporarySlots = (weekStart, learnerId) => {
    const key = getTemporarySlotsKey(weekStart, learnerId);
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  };

  // Helper function to clear temporarily selected slots for a week
  const clearTemporarySlots = (weekStart, learnerId) => {
    const key = getTemporarySlotsKey(weekStart, learnerId);
    localStorage.removeItem(key);
  };

  const handleDialogPrevWeek = () => {
    setDialogWeekStart((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() - 7);
      newDate.setHours(0, 0, 0, 0);

      // Load temporary slots for the new week
      if (selectedLearner) {
        const tempSlots = loadTemporarySlots(newDate, selectedLearner);
        setTemporarilySelectedSlots(tempSlots);
      }

      return newDate;
    });
  };
  const handleDialogNextWeek = () => {
    setDialogWeekStart((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + 7);
      newDate.setHours(0, 0, 0, 0);

      // Load temporary slots for the new week
      if (selectedLearner) {
        const tempSlots = loadTemporarySlots(newDate, selectedLearner);
        setTemporarilySelectedSlots(tempSlots);
      }

      return newDate;
    });
  };
  const isDialogAtCurrentWeek =
    dialogWeekStart.getTime() <= getWeekRange().monday.getTime();
  const dialogWeekInfo = getWeekDates(dialogWeekStart);

  // New state for certificate upload and verification
  const [uploadedCertificates, setUploadedCertificates] = useState([]);
  const [certificateUploading, setCertificateUploading] = useState(false);
  const [verificationRequesting, setVerificationRequesting] = useState(false);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [deleteCertificateDialogOpen, setDeleteCertificateDialogOpen] =
    useState(false);
  const [certificateToDelete, setCertificateToDelete] = useState(null);

  // Add new state for pattern detail dialog
  const [patternDetailDialogOpen, setPatternDetailDialogOpen] = useState(false);
  const [selectedPatternDetail, setSelectedPatternDetail] = useState(null);
  const [patternDetailLoading, setPatternDetailLoading] = useState(false);
  const [patternDetailError, setPatternDetailError] = useState(null);

  const handlePrevWeek = () => {
    setCurrentWeekStart((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() - 7);
      newDate.setHours(0, 0, 0, 0);
      return newDate;
    });
  };

  const handleNextWeek = () => {
    setCurrentWeekStart((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + 7);
      newDate.setHours(0, 0, 0, 0);
      return newDate;
    });
  };

  const handleEditPrevWeek = () => {
    setCurrentWeekStart((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() - 7);
      newDate.setHours(0, 0, 0, 0);
      return newDate;
    });
  };

  const handleEditNextWeek = () => {
    setCurrentWeekStart((prev) => {
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

  const handleDeleteLesson = (lessonId) => {
    const lesson = lessons.find((l) => l.id === lessonId);
    setLessonToDelete(lesson);
    setDeleteModalOpen(true);
  };

  // Fetch documents when component mounts
  useEffect(() => {
    const fetchDocuments = async () => {
      if (!id) return;

      setDocumentsLoading(true);
      try {
        const documents = await fetchDocumentsByTutorId(id);

        // Transform API response to match our certificate format
        const transformedDocuments = [];

        documents.forEach((doc) => {
          // Handle nested files structure
          if (doc.files && Array.isArray(doc.files) && doc.files.length > 0) {
            doc.files.forEach((file) => {
              transformedDocuments.push({
                id: doc.id,
                name:
                  file.originalFileName ||
                  doc.fileName ||
                  doc.name ||
                  "Unknown file",
                size: file.fileSize || doc.fileSize || 0,
                type:
                  file.contentType ||
                  doc.mimeType ||
                  "application/octet-stream",
                uploadedAt: doc.uploadedAt || new Date().toISOString(),
                url: file.cloudinaryUrl || doc.fileUrl || null,
                description: doc.description || "",
                isVisibleToLearner: doc.isVisibleToLearner || false,
              });
            });
          } else {
            // Fallback for documents without nested files array
            transformedDocuments.push({
              id: doc.id,
              name: doc.fileName || doc.name || "Unknown file",
              size: doc.fileSize || 0,
              type: doc.mimeType || "application/octet-stream",
              uploadedAt: doc.uploadedAt || new Date().toISOString(),
              url: doc.fileUrl || null,
              description: doc.description || "",
              isVisibleToLearner: doc.isVisibleToLearner || false,
            });
          }
        });

        setUploadedCertificates(transformedDocuments);
      } catch (error) {
        console.error("Error fetching documents:", error);
        // Don't show error for missing documents, just keep empty array
        setUploadedCertificates([]);
      } finally {
        setDocumentsLoading(false);
      }
    };

    fetchDocuments();
  }, [id]);

  // Certificate upload and verification functions
  const handleCertificateUpload = async (files) => {
    setCertificateUploading(true);
    try {
      const filesToUpload = Array.from(files);

      // Validate files
      for (const file of filesToUpload) {
        if (file.size > 25 * 1024 * 1024) {
          // 25MB limit
          toast.error(`File ${file.name} quá lớn. Kích thước tối đa là 25MB.`);
          setCertificateUploading(false);
          return;
        }

        if (!file.type.includes("pdf") && !file.type.startsWith("image/")) {
          toast.error(
            `File ${file.name} không đúng định dạng. Chỉ chấp nhận PDF và hình ảnh.`
          );
          setCertificateUploading(false);
          return;
        }
      }

      // Upload certificates
      console.log(
        "Uploading certificates with applicationId:",
        tutorData?.applicationId
      );

      if (!tutorData?.applicationId) {
        toast.error("Không tìm thấy Application ID. Vui lòng thử lại sau.");
        setCertificateUploading(false);
        return;
      }

      const response = await uploadCertificate(
        filesToUpload,
        tutorData?.applicationId
      );
      console.log("Certificates uploaded successfully:", response);

      // Refresh documents list after upload
      const updatedDocuments = await fetchDocumentsByTutorId(id);
      const transformedDocuments = [];

      updatedDocuments.forEach((doc) => {
        // Handle nested files structure
        if (doc.files && Array.isArray(doc.files) && doc.files.length > 0) {
          doc.files.forEach((file) => {
            transformedDocuments.push({
              id: doc.id,
              name:
                file.originalFileName ||
                doc.fileName ||
                doc.name ||
                "Unknown file",
              size: file.fileSize || doc.fileSize || 0,
              type:
                file.contentType || doc.mimeType || "application/octet-stream",
              uploadedAt: doc.uploadedAt || new Date().toISOString(),
              url: file.cloudinaryUrl || doc.fileUrl || null,
              description: doc.description || "",
              isVisibleToLearner: doc.isVisibleToLearner || false,
            });
          });
        } else {
          // Fallback for documents without nested files array
          transformedDocuments.push({
            id: doc.id,
            name: doc.fileName || doc.name || "Unknown file",
            size: doc.fileSize || 0,
            type: doc.mimeType || "application/octet-stream",
            uploadedAt: doc.uploadedAt || new Date().toISOString(),
            url: doc.fileUrl || null,
            description: doc.description || "",
            isVisibleToLearner: doc.isVisibleToLearner || false,
          });
        }
      });

      setUploadedCertificates(transformedDocuments);
      toast.success("Tải lên chứng chỉ thành công!");
    } catch (error) {
      console.error("Certificate upload failed:", error);
      toast.error(`Tải lên chứng chỉ thất bại: ${error.message}`);
    } finally {
      setCertificateUploading(false);
    }
  };

  const handleRequestVerification = async () => {
    if (uploadedCertificates.length === 0) {
      toast.error(
        "Vui lòng tải lên ít nhất một chứng chỉ trước khi yêu cầu xác minh."
      );
      return;
    }

    if (!tutorData?.applicationId) {
      toast.error("Không tìm thấy Application ID. Vui lòng thử lại sau.");
      return;
    }

    setVerificationRequesting(true);
    try {
      // Using tutorData.applicationId as the tutorApplicationId
      await requestTutorVerification(tutorData?.applicationId);
      toast.success("Yêu cầu xác minh đã được gửi thành công!");
    } catch (error) {
      console.error("Verification request failed:", error);
      toast.error(`Yêu cầu xác minh thất bại: ${error.message}`);
    } finally {
      setVerificationRequesting(false);
    }
  };

  const handleRemoveCertificate = (certificate) => {
    setCertificateToDelete(certificate);
    setDeleteCertificateDialogOpen(true);
  };

  const confirmDeleteCertificate = async () => {
    if (!certificateToDelete) return;

    try {
      await deleteDocument(certificateToDelete.id);

      // Remove from local state
      setUploadedCertificates((prev) =>
        prev.filter((cert) => cert.id !== certificateToDelete.id)
      );
      toast.success("Xóa chứng chỉ thành công!");
    } catch (error) {
      console.error("Failed to delete certificate:", error);
      toast.error(`Xóa chứng chỉ thất bại: ${error.message}`);
    } finally {
      setDeleteCertificateDialogOpen(false);
      setCertificateToDelete(null);
    }
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

        if (response && response.data) {
          setTutorData(response.data);
          // If there are availability slots, set them
          if (
            response.data.availabilityPatterns &&
            response.data.availabilityPatterns.length > 0
          ) {
            setTimeSlots(response.data.availabilityPatterns);
          }
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
  }, [id, fetchTutorDetail]);

  // Fetch lessons when component mounts and when id changes
  useEffect(() => {
    const fetchLessons = async () => {
      if (!id) return;

      setLessonsLoading(true);
      try {
        const response = await fetchTutorLesson(id);
        setLessons(response || []);
      } catch (error) {
        console.error("Failed to fetch lessons:", error);
        setLessons([]);
      } finally {
        setLessonsLoading(false);
      }
    };

    fetchLessons();
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
    const learnerOffers = allOffers.filter(
      (offer) => offer.learner.id === learnerId
    );
    if (learnerOffers.length === 0) return null;
    // Sort by newest createdAt (descending)
    learnerOffers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return learnerOffers[0].id;
  }

  // Modified handleOpenBookingDetail to open slot selection dialog first, then lesson selection
  const handleOpenBookingDetail = async (learnerId) => {
    // Find the learner object from learnerRequests
    const learner = learnerRequests.find((req) => req.learnerId === learnerId);
    setSelectedLearner(learner); // Set the full learner object instead of just the ID

    // First, open the booking detail dialog (slot selection)
    setBookingDetailLoading(true);
    setBookingDetailDialogOpen(true);

    try {
      const res = await tutorBookingTimeSlotFromLearnerDetail(
        learner.learnerId
      );
      const { expectedStartDate, timeSlots, lessonId } = res?.data || {};

      // Fetch lesson details for the learner's selected lesson
      if (lessonId) {
        try {
          const lessonDetails = await fetchTutorLessonDetailById(lessonId);
          setLearnerLessonDetails(lessonDetails);
        } catch (lessonError) {
          console.error(
            "Failed to fetch learner's lesson details:",
            lessonError
          );
          setLearnerLessonDetails(null);
        }
      } else {
        setLearnerLessonDetails(null);
      }

      let initialWeekStart = getWeekRange().monday;
      if (expectedStartDate) {
        const expectedDate = new Date(expectedStartDate);
        const day = expectedDate.getDay();
        const diff = day === 0 ? -6 : 1 - day;
        const monday = new Date(expectedDate);
        monday.setDate(monday.getDate() + diff);
        monday.setHours(0, 0, 0, 0);
        initialWeekStart = monday;
      }
      setDialogWeekStart(initialWeekStart);

      setBookingDetailSlots(timeSlots || []);
      setSelectedOfferSlots([]);
      setOfferDetail(null);

      // Load temporarily selected slots for this week and learner
      const tempSlots = loadTemporarySlots(initialWeekStart, learner.learnerId);
      setTemporarilySelectedSlots(tempSlots);

      setLearnerRequests((prev) =>
        prev.map((req) =>
          req.learnerId === learner.learnerId
            ? { ...req, hasUnviewed: false }
            : req
        )
      );

      // After setting up the booking detail dialog, immediately show lesson selection
      await fetchTutorLessons();
      setLessonSelectionDialogOpen(true);
    } catch (err) {
      setBookingDetailSlots([]);
      setLearnerLessonDetails(null);
    } finally {
      setBookingDetailLoading(false);
    }
  };

  // Modified handleLessonSelected to just close lesson selection dialog
  const handleLessonSelected = async () => {
    if (!selectedLesson || !selectedLearner) {
      return;
    }

    // Just close lesson selection dialog - booking detail is already open
    setLessonSelectionDialogOpen(false);
  };

  // Add function to fetch lessons
  const fetchTutorLessons = async () => {
    setLessonsLoading(true);
    try {
      const lessons = await fetchTutorLesson(id);
      console.log("Fetched lessons:", lessons); // Debug log
      if (lessons && Array.isArray(lessons)) {
        setAvailableLessons(lessons);
      } else {
        setAvailableLessons([]);
      }
    } catch (error) {
      console.error("Failed to fetch tutor lessons:", error);
      setAvailableLessons([]);
      toast.error("Không thể tải danh sách bài học");
    } finally {
      setLessonsLoading(false);
    }
  };

  // Function to handle lesson selection and proceed with offer
  const handleProceedWithOffer = async () => {
    if (!selectedLesson || !selectedLearner) {
      return;
    }

    try {
      const offeredSlots = temporarilySelectedSlots.map((slot) => {
        const slotDateTime = getSlotDateTime(
          dialogWeekStart,
          slot.dayInWeek,
          slot.slotIndex
        );
        
        // Convert UTC+7 to UTC+0 for backend
        const utc0DateTime = convertUTC7ToUTC0(slotDateTime);
        
        console.log("Generated slot:", {
          slotDateTime,
          utc0DateTime,
          slotIndex: slot.slotIndex,
        });
        return {
          slotDateTime: utc0DateTime,
          slotIndex: slot.slotIndex,
        };
      });

      if (offerDetail && offerDetail.id) {
        // Update existing offer - Clean payload to match API spec exactly
        const cleanUpdateData = {
          lessonId: selectedLesson.id,
          offeredSlots: offeredSlots.map((slot) => ({
            slotDateTime: slot.slotDateTime,
            slotIndex: slot.slotIndex,
          })),
        };

        console.log("Clean update offer data being sent:", cleanUpdateData);
        console.log("offerDetail.id:", offerDetail.id);
        console.log(
          "cleaned update offeredSlots:",
          cleanUpdateData.offeredSlots
        );

        // Validate required fields for update
        if (!selectedLesson?.id) {
          throw new Error("Lesson ID is required for update");
        }
        if (
          !cleanUpdateData.offeredSlots ||
          cleanUpdateData.offeredSlots.length === 0
        ) {
          throw new Error("At least one offered slot is required for update");
        }

        await updateTutorBookingOfferByOfferId(offerDetail.id, cleanUpdateData);
        toast.success("Đã cập nhật đề nghị thành công!");
      } else {
        // Create new offer with lessonId - Clean payload to match API spec exactly
        const cleanOfferData = {
          learnerId: selectedLearner.learnerId,
          lessonId: selectedLesson.id,
          offeredSlots: offeredSlots.map((slot) => ({
            slotDateTime: slot.slotDateTime,
            slotIndex: slot.slotIndex,
          })),
        };

        console.log("Clean offer data being sent:", cleanOfferData);
        console.log("selectedLearner:", selectedLearner);
        console.log("selectedLesson:", selectedLesson);
        console.log("cleaned offeredSlots:", cleanOfferData.offeredSlots);

        // Validate required fields
        if (!selectedLearner) {
          throw new Error("Learner ID is required");
        }
        if (!selectedLesson?.id) {
          throw new Error("Lesson ID is required");
        }
        if (
          !cleanOfferData.offeredSlots ||
          cleanOfferData.offeredSlots.length === 0
        ) {
          throw new Error("At least one offered slot is required");
        }
        await createTutorBookingOffer(cleanOfferData);
        toast.success("Đã gửi đề xuất thành công!");
      }

      // Clear temporary slots for this week after successful offer
      clearTemporarySlots(dialogWeekStart, selectedLearner);

      // Close all dialogs and reset state
      setLessonSelectionDialogOpen(false);
      setBookingDetailDialogOpen(false);
      setSelectedOfferSlots([]);
      setTemporarilySelectedSlots([]);
      setSelectedLearner(null);
      setSelectedLesson(null);
    } catch (err) {
      console.error("Error in handleProceedWithOffer:", err);
      console.error("Error message:", err.message);
      console.error("Error stack:", err.stack);

      // Check if error has more details
      if (err.details) {
        console.error("Error details:", err.details);
      }

      toast.error(
        "Gửi đề nghị thất bại: " + (err.message || "Unexpected error")
      );
    }
  };

  // Helper function to check if a slot is in the past
  const isSlotInPast = (weekStart, dayInWeek, slotIndex) => {
    const slotDateTime = new Date(
      getSlotDateTime(weekStart, dayInWeek, slotIndex)
    );
    const now = new Date();
    return slotDateTime < now;
  };

  // Modified handleSlotClick function with past slot checking
  const handleSlotClick = (dayInWeek, slotIdx) => {
    if (!selectedLearner) return;

    // Check if the slot is in the past
    if (isSlotInPast(dialogWeekStart, dayInWeek, slotIdx)) {
      return; // Don't allow clicking on past slots
    }

    setTemporarilySelectedSlots((prev) => {
      const exists = prev.some(
        (slot) => slot.dayInWeek === dayInWeek && slot.slotIndex === slotIdx
      );

      let newSlots;
      if (exists) {
        newSlots = prev.filter(
          (slot) =>
            !(slot.dayInWeek === dayInWeek && slot.slotIndex === slotIdx)
        );
      } else {
        newSlots = [...prev, { dayInWeek, slotIndex: slotIdx }];
      }

      // Save to localStorage
      saveTemporarySlots(dialogWeekStart, selectedLearner, newSlots);

      return newSlots;
    });
  };

  // Add this useEffect to clean up past slots from temporarilySelectedSlots
  useEffect(() => {
    if (dialogWeekStart && selectedLearner) {
      setTemporarilySelectedSlots((prev) => {
        const filtered = prev.filter(
          (slot) =>
            !isSlotInPast(dialogWeekStart, slot.dayInWeek, slot.slotIndex)
        );
        if (filtered.length !== prev.length) {
          // Save the filtered slots back to localStorage
          saveTemporarySlots(dialogWeekStart, selectedLearner, filtered);
        }
        return filtered;
      });
    }
  }, [dialogWeekStart, selectedLearner]); // Run when dialog week or learner changes

  // Also add a periodic cleanup effect (optional, for real-time updates)
  useEffect(() => {
    const interval = setInterval(() => {
      if (dialogWeekStart && selectedLearner) {
        setTemporarilySelectedSlots((prev) => {
          const filtered = prev.filter(
            (slot) =>
              !isSlotInPast(dialogWeekStart, slot.dayInWeek, slot.slotIndex)
          );
          if (filtered.length !== prev.length) {
            saveTemporarySlots(dialogWeekStart, selectedLearner, filtered);
            return filtered;
          }
          return prev;
        });
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [dialogWeekStart, selectedLearner]);

  // Add useEffect to fetch weekly patterns list
  useEffect(() => {
    const fetchWeeklyPatternsList = async () => {
      if (!id) return;

      setWeeklyPatternsListLoading(true);
      setWeeklyPatternsListError(null);
      try {
        const patterns = await fetchTutorListWeeklyPatternsByTutorId(id);
        setWeeklyPatternsList(patterns || []);
      } catch (error) {
        console.error("Failed to fetch weekly patterns list:", error);
        setWeeklyPatternsListError(
          error.message || "Lỗi khi tải danh sách lịch trình"
        );
        setWeeklyPatternsList([]);
      } finally {
        setWeeklyPatternsListLoading(false);
      }
    };

    fetchWeeklyPatternsList();
  }, [id]);

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "Không xác định";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Lỗi định dạng";
    }
  };

  // Helper function to get status label
  const getStatusLabel = (pattern) => {
    const now = new Date();
    const appliedFrom = new Date(pattern.appliedFrom);
    const endDate = pattern.endDate ? new Date(pattern.endDate) : null;

    if (endDate && now > endDate) {
      return "Đã kết thúc";
    } else if (now >= appliedFrom) {
      return "Đang áp dụng";
    } else {
      return "Sắp áp dụng";
    }
  };

  // Helper function to get status color
  const getStatusColor = (pattern) => {
    const now = new Date();
    const appliedFrom = new Date(pattern.appliedFrom);
    const endDate = pattern.endDate ? new Date(pattern.endDate) : null;

    if (endDate && now > endDate) {
      return "error";
    } else if (now >= appliedFrom) {
      return "success";
    } else {
      return "warning";
    }
  };

  // Add new state for creating weekly pattern
  const [createPatternDialogOpen, setCreatePatternDialogOpen] = useState(false);
  const [createPatternLoading, setCreatePatternLoading] = useState(false);
  const [createPatternSlots, setCreatePatternSlots] = useState({});
  const [createPatternWeekStart, setCreatePatternWeekStart] = useState(
    getWeekRange().monday
  );

  // Add function to handle creating new weekly pattern
  const handleCreateWeeklyPattern = async () => {
    setCreatePatternLoading(true);
    try {
      // Convert slot map to array format required by API
      const slots = [];
      Object.entries(createPatternSlots).forEach(([dayInWeek, slotSet]) => {
        slotSet.forEach((slotIndex) => {
          slots.push({
            dayInWeek: Number(dayInWeek),
            slotIndex: Number(slotIndex),
          });
        });
      });

      // Ensure we have at least one slot selected
      if (slots.length === 0) {
        toast.error(
          "Vui lòng chọn ít nhất một khung giờ trước khi tạo lịch trình"
        );
        setCreatePatternLoading(false);
        return;
      }

      // Ensure appliedFrom is always tomorrow or later
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      // Use the later date between createPatternWeekStart and tomorrow
      const selectedDate = new Date(createPatternWeekStart);
      selectedDate.setHours(0, 0, 0, 0);

      const effectiveDate = selectedDate > tomorrow ? selectedDate : tomorrow;

      const appliedFromUTC = new Date(
        Date.UTC(
          effectiveDate.getFullYear(),
          effectiveDate.getMonth(),
          effectiveDate.getDate(),
          0,
          0,
          0,
          0
        )
      );

      const patternData = {
        appliedFrom: appliedFromUTC.toISOString(),
        slots: slots,
      };

      console.log("Creating weekly pattern with data:", patternData);

      await createTutorWeeklyPattern(patternData);

      // Show success message
      toast.success("Tạo lịch trình tuần thành công!");

      // Close dialog and reset state
      setCreatePatternDialogOpen(false);
      setCreatePatternSlots({});

      // Refresh weekly patterns list only (no need for old weeklyPatterns)
      const updatedPatternsList = await fetchTutorListWeeklyPatternsByTutorId(
        id
      );
      setWeeklyPatternsList(updatedPatternsList || []);
    } catch (error) {
      console.error("Failed to create weekly pattern:", error);
      toast.error(`Tạo lịch trình thất bại: ${error.message}`);
    } finally {
      setCreatePatternLoading(false);
    }
  };

  // Add function to handle slot clicks in create pattern dialog
  const handleCreatePatternSlotClick = (dayInWeek, slotIdx) => {
    // Check if the slot is in the past
    if (isSlotInPast(createPatternWeekStart, dayInWeek, slotIdx)) {
      return; // Don't allow clicking on past slots
    }

    setCreatePatternSlots((prev) => {
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
  };

  // Add function to handle week navigation in create pattern dialog
  const handleCreatePatternPrevWeek = () => {
    setCreatePatternWeekStart((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() - 7);
      newDate.setHours(0, 0, 0, 0);

      // Check if we're trying to go before current week
      const currentWeek = getWeekRange().monday;
      if (newDate < currentWeek) {
        return prev; // Don't allow going before current week
      }

      return newDate;
    });
  };

  const handleCreatePatternNextWeek = () => {
    setCreatePatternWeekStart((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + 7);
      newDate.setHours(0, 0, 0, 0);
      return newDate;
    });
  };

  // Add function to get selected slots count
  const getSelectedSlotsCount = () => {
    let count = 0;
    Object.values(createPatternSlots).forEach((slotSet) => {
      count += slotSet.size;
    });
    return count;
  };

  // Add function to format selected slot for display
  const formatSelectedSlot = (dayInWeek, slotIndex) => {
    const dayIndexMap = {
      1: 6, // Sun -> index 6
      2: 0, // Mon -> index 0
      3: 1, // Tue -> index 1
      4: 2, // Wed -> index 2
      5: 3, // Thu -> index 3
      6: 4, // Fri -> index 4
      7: 5, // Sat -> index 5
    };

    const weekInfo = getWeekDates(createPatternWeekStart);
    const dayInfo = weekInfo[dayIndexMap[dayInWeek]];

    const hour = Math.floor(slotIndex / 2);
    const minute = slotIndex % 2 === 0 ? "00" : "30";
    const nextHour = slotIndex % 2 === 0 ? hour : hour + 1;
    const nextMinute = slotIndex % 2 === 0 ? "30" : "00";
    const timeLabel = `${hour
      .toString()
      .padStart(2, "0")}:${minute} - ${nextHour
      .toString()
      .padStart(2, "0")}:${nextMinute}`;

    return {
      dayLabel: dayInfo?.label || `Thứ ${dayInWeek}`,
      date: dayInfo?.date || "",
      timeLabel: timeLabel,
      dayInWeek: dayInWeek,
      slotIndex: slotIndex,
    };
  };

  // Add new function to fetch all pattern details
  const fetchAllPatternDetails = async () => {
    if (!id || !weeklyPatternsList || weeklyPatternsList.length === 0) return;

    setAllPatternDetailsLoading(true);
    try {
      const patternDetails = [];

      for (const pattern of weeklyPatternsList) {
        try {
          const detail = await fetchTutorWeeklyPatternDetailByPatternId(
            pattern.id
          );
          patternDetails.push({
            ...pattern,
            detail: detail,
          });
        } catch (error) {
          console.error(
            `Failed to fetch pattern detail for ${pattern.id}:`,
            error
          );
          // Continue with other patterns even if one fails
        }
      }

      setAllPatternDetails(patternDetails);
    } catch (error) {
      console.error("Failed to fetch all pattern details:", error);
    } finally {
      setAllPatternDetailsLoading(false);
    }
  };

  // Add useEffect to fetch all pattern details when weeklyPatternsList changes
  useEffect(() => {
    fetchAllPatternDetails();
  }, [id, weeklyPatternsList]);

  // Add new function to get patterns that apply to a specific week
  const getPatternsForWeek = (weekStart) => {
    if (!allPatternDetails || allPatternDetails.length === 0) return [];

    const weekMonday = new Date(weekStart);
    weekMonday.setHours(0, 0, 0, 0);

    const weekSunday = new Date(weekMonday);
    weekSunday.setDate(weekMonday.getDate() + 6);
    weekSunday.setHours(23, 59, 59, 999);

    return allPatternDetails.filter((pattern) => {
      const appliedFrom = new Date(pattern.appliedFrom);
      const endDate = pattern.endDate ? new Date(pattern.endDate) : null;

      // Pattern applies if:
      // 1. appliedFrom is before or equal to the end of the week (Sunday)
      // 2. endDate is null OR endDate is after or equal to the start of the week (Monday)
      return appliedFrom <= weekSunday && (!endDate || endDate >= weekMonday);
    });
  };

  // Update the isSlotActiveInAnyPattern function to convert 30-min slots to 1-hour slots
  const isSlotActiveInAnyPattern = (dayInWeek, slotIndex) => {
    if (!allPatternDetails || allPatternDetails.length === 0) return false;

    // Get patterns that apply to the current week
    const patternsForWeek = getPatternsForWeek(currentWeekStart);

    // Convert 30-minute slot index to 1-hour slot index
    const hourSlotIndex = Math.floor(slotIndex / 2);

    // Check if this slot is active in any pattern for this week
    return patternsForWeek.some((pattern) => {
      if (!pattern.detail || !pattern.detail.slots) return false;

      return pattern.detail.slots.some(
        (slot) => slot.dayInWeek === dayInWeek && slot.slotIndex === hourSlotIndex
      );
    });
  };

  // Update the getPatternInfoForSlot function similarly
  const getPatternInfoForSlot = (dayInWeek, slotIndex) => {
    if (!allPatternDetails || allPatternDetails.length === 0) return null;

    // Get patterns that apply to the current week
    const patternsForWeek = getPatternsForWeek(currentWeekStart);

    // Convert 30-minute slot index to 1-hour slot index
    const hourSlotIndex = Math.floor(slotIndex / 2);

    const activePatterns = patternsForWeek.filter((pattern) => {
      if (!pattern.detail || !pattern.detail.slots) return false;

      return pattern.detail.slots.some(
        (slot) => slot.dayInWeek === dayInWeek && slot.slotIndex === hourSlotIndex
      );
    });

    return activePatterns;
  };

  // Add function to get week info for the current week
  const getCurrentWeekInfo = () => {
    return getWeekDates(currentWeekStart);
  };

  // Calendar input for appliedFrom
  const [calendarInputDialogOpen, setCalendarInputDialogOpen] = useState(false);
  const [selectedAppliedFromDate, setSelectedAppliedFromDate] = useState(""); // YYYY-MM-DD

  const handleCalendarInputConfirm = () => {
    if (!selectedAppliedFromDate) {
      toast.error("Vui lòng chọn ngày bắt đầu áp dụng");
      return;
    }
    
    const picked = new Date(selectedAppliedFromDate);
    if (picked.getDay() !== 1) {
      toast.error("Ngày bắt đầu áp dụng phải là Thứ Hai");
      return;
    }

    // Initialize create dialog to the week of appliedFrom
    const weekStart = getWeekRange(picked).monday;
    setCreatePatternWeekStart(weekStart);
    setCreatePatternSlots({});
    setCalendarInputDialogOpen(false);
    setCreatePatternDialogOpen(true);
  };

  // Fix the handlePatternRowClick function to handle the correct API response structure
  const handlePatternRowClick = async (pattern) => {
    setPatternDetailDialogOpen(true);
    setPatternDetailLoading(true);
    setPatternDetailError(null);
    setSelectedPatternDetail(null);

    try {
      const patternDetail = await fetchTutorWeeklyPatternDetailByPatternId(pattern.id);
      
      // The API function already returns response.data, so we don't need to access .data again
      if (patternDetail) {
        setSelectedPatternDetail({
          ...pattern,
          detail: patternDetail // patternDetail is already the data object
        });
      } else {
        throw new Error("No pattern detail data received");
      }
    } catch (error) {
      console.error("Failed to fetch pattern detail:", error);
      setPatternDetailError(error.message || "Lỗi khi tải chi tiết lịch trình");
    } finally {
      setPatternDetailLoading(false);
    }
  };

  // Add function to close pattern detail dialog
  const handleClosePatternDetailDialog = () => {
    setPatternDetailDialogOpen(false);
    setSelectedPatternDetail(null);
    setPatternDetailError(null);
  };

  // Update the renderPatternDetailCalendar function to match the main calendar layout
  const renderPatternDetailCalendar = () => {
    if (!selectedPatternDetail || !selectedPatternDetail.detail) {
      return null;
    }

    const pattern = selectedPatternDetail;
    const slots = pattern.detail.slots || [];
    
    // Create slot map for easy lookup
    const slotMap = {};
    slots.forEach(slot => {
      if (!slotMap[slot.dayInWeek]) slotMap[slot.dayInWeek] = new Set();
      slotMap[slot.dayInWeek].add(slot.slotIndex);
    });

    // Get week dates for display - starting from the pattern's appliedFrom date
    const weekStart = new Date(pattern.appliedFrom);
    const weekDates = getWeekDates(weekStart);
    
    // Day order for the calendar (Monday = 2, Tuesday = 3, ..., Sunday = 1)
    const dayInWeekOrder = [2, 3, 4, 5, 6, 7, 1]; // 2=Monday, 3=Tuesday, ..., 1=Sunday
    
    // Vietnamese day labels in the correct order (T2, T3, T4, T5, T6, T7, CN)
    const vietnameseDayLabels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
    
    // Map the weekDates to the correct Vietnamese labels and order
    const processedWeekDates = dayInWeekOrder.map((dayInWeek, index) => {
      // Find the corresponding weekDate based on dayInWeek
      // dayInWeek 2 (Monday) should map to the 0th element (MON) in weekDates
      // dayInWeek 3 (Tuesday) should map to the 1st element (TUE) in weekDates
      // dayInWeek 4 (Wednesday) should map to the 2nd element (WED) in weekDates
      // ...
      // dayInWeek 1 (Sunday) should map to the 6th element (SUN) in weekDates
      let weekDateIndex;
      if (dayInWeek === 1) { // Sunday
        weekDateIndex = 6; // SUN
      } else {
        weekDateIndex = dayInWeek - 2; // Monday=0, Tuesday=1, etc.
      }
      
      return {
        dayLabel: vietnameseDayLabels[index],
        dateLabel: weekDates[weekDateIndex]?.date || "",
        dayInWeek: dayInWeek
      };
    });

    // Helper function to check if a slot is available
    const isSlotAvailable = (dayInWeek, slotIndex) => {
      return slotMap[dayInWeek] && slotMap[dayInWeek].has(slotIndex);
    };

    return (
      <Box sx={{ width: "100%" }}>
        {/* Pattern Information */}
        <Box sx={{ mb: 3, p: 2, backgroundColor: "#f8fafc", borderRadius: 1 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Ngày bắt đầu áp dụng:</strong> {formatDate(pattern.appliedFrom)}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Ngày kết thúc:</strong> {pattern.endDate ? formatDate(pattern.endDate) : "Không có"}
          </Typography>
          <Typography variant="body2">
            <strong>Trạng thái:</strong>{" "}
            <Chip
              label={getStatusLabel(pattern)}
              color={getStatusColor(pattern)}
              size="small"
              sx={{ fontWeight: 600, fontSize: "0.75rem" }}
            />
          </Typography>
        </Box>

        {/* Calendar Grid - Matching the main calendar layout */}
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
              {processedWeekDates.map((d, i) => (
                <Box
                  key={i}
                  sx={{
                    p: 1.5,
                    backgroundColor: "#f8fafc",
                    borderBottom: "1px solid #e2e8f0",
                    borderRight:
                      i === processedWeekDates.length - 1
                        ? "none"
                        : "1px solid #e2e8f0",
                    textAlign: "center",
                    fontWeight: 600,
                    color: "#1e293b",
                    fontSize: "0.875rem",
                    position: "sticky",
                    top: 0,
                    zIndex: 1,
                  }}
                >
                  <Box sx={{ fontSize: "0.75rem" }}>
                    {d.dayLabel}
                  </Box>
                  <Box
                    sx={{
                      fontSize: "0.625rem",
                      color: "#64748b",
                      mt: 0.25,
                    }}
                  >
                    {d.dateLabel}
                  </Box>
                </Box>
              ))}

              {/* Time slots */}
              {Array.from({ length: 48 }).map((_, slotIdx) => {
                const hour = Math.floor(slotIdx / 2);
                const minute = slotIdx % 2 === 0 ? "00" : "30";
                const nextHour =
                  slotIdx % 2 === 0 ? hour : hour + 1;
                const nextMinute =
                  slotIdx % 2 === 0 ? "30" : "00";
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
                        fontSize: "0.75rem",
                        fontFamily: "monospace",
                      }}
                    >
                      {timeLabel}
                    </Box>
                    {/* For each day, render a cell for this 30-min slot */}
                    {dayInWeekOrder.map((dayInWeek, dayIdx) => {
                      // Check if this 30-minute slot is available in the pattern
                      // Remove the conversion - use slotIdx directly since each slotIndex represents a 30-min slot
                      const isActive = isSlotAvailable(dayInWeek, slotIdx);

                      return (
                        <Tooltip
                          key={dayIdx}
                          title={isActive ? "Có sẵn trong lịch trình này" : "Không có sẵn"}
                          arrow
                        >
                          <Box
                            sx={{
                              backgroundColor: isActive
                                ? "#98D45F"
                                : "#f1f5f9",
                              border: "1px solid #e2e8f0",
                              minHeight: 32,
                              cursor: "default",
                              position: "relative",
                              "&:hover": {
                                backgroundColor: isActive
                                  ? "#7bbf3f"
                                  : "#e0e7ef",
                              },
                            }}
                          >
                            {/* Removed the white dot indicator */}
                          </Box>
                        </Tooltip>
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
                flexWrap: "wrap",
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
                    width: 16,
                    height: 16,
                    backgroundColor: "#98D45F",
                    borderRadius: "2px",
                    border: "1px solid #7bbf3f",
                  }}
                />
                <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
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
                    width: 16,
                    height: 16,
                    backgroundColor: "#f1f5f9",
                    borderRadius: "2px",
                    border: "1px solid #e2e8f0",
                  }}
                />
                <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
                  Không có sẵn
                </Typography>
              </Box>
            </Box>
            <Typography
              variant="body2"
              sx={{
                mt: 2,
                fontSize: "0.875rem",
                color: "#64748b",
              }}
            >
              Dựa trên múi giờ của bạn (UTC+07:00) • Tuần:{" "}
              {formatDateRange(
                new Date(currentWeekStart),
                new Date(
                  new Date(currentWeekStart).getTime() +
                    6 * 24 * 60 * 60 * 1000
                )
              )}{" "}
              • Cập nhật lần cuối:{" "}
              {allPatternDetails.length > 0
                ? new Date(
                    allPatternDetails.sort(
                      (a, b) =>
                        new Date(b.appliedFrom) -
                        new Date(a.appliedFrom)
                    )[0].appliedFrom
                  ).toLocaleDateString("vi-VN")
                : "Không xác định"}
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  };

  // Add this skeleton component before the renderPatternDetailCalendar function
  const PatternDetailCalendarSkeleton = () => {
    return (
      <Box sx={{ width: "100%" }}>
        {/* Pattern Information Skeleton */}
        <Box sx={{ mb: 3, p: 2, backgroundColor: "#f8fafc", borderRadius: 1 }}>
          <Skeleton variant="text" width="60%" height={24} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="50%" height={24} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="40%" height={24} />
                    </Box>

        {/* Calendar Grid Skeleton */}
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
                          <Box
                            sx={{
                              overflowX: "auto",
                              border: "1px solid #e2e8f0",
                              borderRadius: "8px",
              maxHeight: "600px",
                            }}
                          >
                            <Box
                              sx={{
                                display: "grid",
                gridTemplateColumns: "140px repeat(7, 1fr)",
                                minWidth: "600px",
                              }}
                            >
              {/* Header row skeleton */}
                              <Box
                                sx={{
                  p: 1.5,
                                  backgroundColor: "#f8fafc",
                                  borderBottom: "1px solid #e2e8f0",
                                  borderRight: "1px solid #e2e8f0",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  position: "sticky",
                                  top: 0,
                                  zIndex: 1,
                                }}
                              >
                <Skeleton variant="text" width="60%" height={20} />
                              </Box>
              {Array.from({ length: 7 }).map((_, i) => (
                                <Box
                                  key={i}
                                  sx={{
                                    p: 1.5,
                                    backgroundColor: "#f8fafc",
                                    borderBottom: "1px solid #e2e8f0",
                    borderRight: i === 6 ? "none" : "1px solid #e2e8f0",
                                    textAlign: "center",
                                    position: "sticky",
                                    top: 0,
                                    zIndex: 1,
                                  }}
                                >
                  <Skeleton variant="text" width="40%" height={16} sx={{ mb: 0.5 }} />
                  <Skeleton variant="text" width="60%" height={12} />
                                </Box>
                              ))}

              {/* Time slots skeleton */}
              {Array.from({ length: 48 }).map((_, slotIdx) => (
                <React.Fragment key={slotIdx}>
                  {/* Time label cell skeleton */}
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
                    <Skeleton variant="text" width="80%" height={14} />
                  </Box>
                  {/* Day cells skeleton */}
                  {Array.from({ length: 7 }).map((_, dayIdx) => (
                    <Box
                      key={dayIdx}
                      sx={{
                        borderBottom: "1px solid #e2e8f0",
                        borderRight: dayIdx === 6 ? "none" : "1px solid #e2e8f0",
                        minHeight: 32,
                        backgroundColor: "#f8fafc",
                      }}
                    >
                      <Skeleton 
                        variant="rectangular" 
                        width="100%" 
                        height="100%" 
                        sx={{ 
                          backgroundColor: "#e2e8f0",
                          borderRadius: 0
                        }} 
                      />
                    </Box>
                  ))}
                </React.Fragment>
              ))}
            </Box>
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
                flexWrap: "wrap",
                mb: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Skeleton variant="rectangular" width={16} height={16} />
                <Skeleton variant="text" width={60} height={20} />
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Skeleton variant="rectangular" width={16} height={16} />
                <Skeleton variant="text" width={80} height={20} />
              </Box>
            </Box>
            <Skeleton variant="text" width="70%" height={20} />
          </Box>
        </Box>
      </Box>
    );
  };

  // Add function to handle opening edit pattern dialog
  const handleEditPattern = async (pattern) => {
    setEditingPattern(pattern);
    setEditPatternLoading(true);
    setEditPatternBlockedSlotsLoading(true);
    setEditPatternDialogOpen(true);
    
    try {
      // Fetch pattern detail to get current slots
      const patternDetail = await fetchTutorWeeklyPatternDetailByPatternId(pattern.id);
      
      // Fetch blocked slots in parallel
      const blockedSlotsResponse = await fetchWeeklyPatternBlockedSlotsByPatternId(pattern.id);
      
      // Convert slots to the format needed for editing
      const slotMap = {};
      if (patternDetail && patternDetail.slots && Array.isArray(patternDetail.slots)) {
        patternDetail.slots.forEach(slot => {
          if (!slotMap[slot.dayInWeek]) {
            slotMap[slot.dayInWeek] = new Set();
          }
          slotMap[slot.dayInWeek].add(slot.slotIndex);
        });
      }
      
      setEditPatternSlots(slotMap);
      
      // Set blocked slots - fix the data structure
      if (blockedSlotsResponse && blockedSlotsResponse.data) {
        // The response.data is directly an array, not data.items
        setEditPatternBlockedSlots(blockedSlotsResponse.data || []);
      } else {
        setEditPatternBlockedSlots([]);
      }
      
      // Set the week start to the pattern's appliedFrom date
      const appliedFromDate = new Date(pattern.appliedFrom);
      const weekStart = getWeekRange(appliedFromDate).monday;
      setEditPatternWeekStart(weekStart);
      
    } catch (error) {
      console.error("Failed to fetch pattern detail for editing:", error);
      toast.error("Không thể tải chi tiết lịch trình để chỉnh sửa");
      setEditPatternDialogOpen(false);
    } finally {
      setEditPatternLoading(false);
      setEditPatternBlockedSlotsLoading(false);
    }
  };

  // Add function to handle slot clicks in edit pattern dialog
  const handleEditPatternSlotClick = (dayInWeek, slotIdx) => {
    // Check if the slot is in the past
    if (isSlotInPast(editPatternWeekStart, dayInWeek, slotIdx)) {
      return; // Don't allow clicking on past slots
    }

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
  };

  // Add function to handle week navigation in edit pattern dialog
  const handleEditPatternPrevWeek = () => {
    setEditPatternWeekStart((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() - 7);
      newDate.setHours(0, 0, 0, 0);

      // Check if we're trying to go before current week
      const currentWeek = getWeekRange().monday;
      if (newDate < currentWeek) {
        return prev; // Don't allow going before current week
      }

      return newDate;
    });
  };

  const handleEditPatternNextWeek = () => {
    setEditPatternWeekStart((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + 7);
      newDate.setHours(0, 0, 0, 0);
      return newDate;
    });
  };

  // Add function to get selected slots count for edit dialog
  const getEditSelectedSlotsCount = () => {
    let count = 0;
    Object.values(editPatternSlots).forEach((slotSet) => {
      count += slotSet.size;
    });
    return count;
  };

  // Add function to format selected slot for display in edit dialog
  const formatEditSelectedSlot = (dayInWeek, slotIndex) => {
    const dayIndexMap = {
      1: 6, // Sun -> index 6
      2: 0, // Mon -> index 0
      3: 1, // Tue -> index 1
      4: 2, // Wed -> index 2
      5: 3, // Thu -> index 3
      6: 4, // Fri -> index 4
      7: 5, // Sat -> index 5
    };

    const weekInfo = getWeekDates(editPatternWeekStart);
    const dayInfo = weekInfo[dayIndexMap[dayInWeek]];

    const hour = Math.floor(slotIndex / 2);
    const minute = slotIndex % 2 === 0 ? "00" : "30";
    const nextHour = slotIndex % 2 === 0 ? hour : hour + 1;
    const nextMinute = slotIndex % 2 === 0 ? "30" : "00";
    const timeLabel = `${hour
      .toString()
      .padStart(2, "0")}:${minute} - ${nextHour
      .toString()
      .padStart(2, "0")}:${nextMinute}`;

    return {
      dayLabel: dayInfo?.label || `Thứ ${dayInWeek}`,
      date: dayInfo?.date || "",
      timeLabel: timeLabel,
      dayInWeek: dayInWeek,
      slotIndex: slotIndex,
    };
  };

  // Add function to handle updating the pattern
  const handleUpdateWeeklyPattern = async () => {
    if (!editingPattern) return;

    setEditPatternLoading(true);
    try {
      // Convert slot map to array format required by API
      const slots = [];
      Object.entries(editPatternSlots).forEach(([dayInWeek, slotSet]) => {
        slotSet.forEach((slotIndex) => {
          slots.push({
            dayInWeek: Number(dayInWeek),
            slotIndex: Number(slotIndex),
          });
        });
      });

      // Ensure we have at least one slot selected
      if (slots.length === 0) {
        toast.error("Vui lòng chọn ít nhất một khung giờ trước khi cập nhật lịch trình");
        setEditPatternLoading(false);
        return;
      }

      console.log("Updating weekly pattern with data:", slots);

      await updateTutorWeeklyPattern(editingPattern.id, slots);

      // Show success message
      toast.success("Cập nhật lịch trình tuần thành công!");

      // Refresh blocked slots after update
      try {
        const blockedSlotsResponse = await fetchWeeklyPatternBlockedSlotsByPatternId(editingPattern.id);
        if (blockedSlotsResponse && blockedSlotsResponse.data) {
          setEditPatternBlockedSlots(blockedSlotsResponse.data || []);
        } else {
          setEditPatternBlockedSlots([]);
        }
      } catch (error) {
        console.error("Failed to refresh blocked slots after update:", error);
      }

      // Close dialog and reset state
      setEditPatternDialogOpen(false);
      setEditingPattern(null);
      setEditPatternSlots({});

      // Refresh weekly patterns list
      const updatedPatternsList = await fetchTutorListWeeklyPatternsByTutorId(id);
      setWeeklyPatternsList(updatedPatternsList || []);
    } catch (error) {
      console.error("Failed to update weekly pattern:", error);
      toast.error(`Cập nhật lịch trình thất bại: ${error.message}`);
    } finally {
      setEditPatternLoading(false);
    }
  };

  // Add this function after the existing handler functions (around line 2750)
  const handleDeletePattern = (pattern) => {
    setPatternToDelete(pattern);
    setDeletePatternModalOpen(true);
  };

  const confirmDeletePattern = async () => {
    if (!patternToDelete) return;

    try {
      await deleteTutorWeeklyPattern(patternToDelete.id);
      
      // Remove from local state
      setWeeklyPatternsList((prev) =>
        prev.filter((pattern) => pattern.id !== patternToDelete.id)
      );
      
      toast.success("Xóa lịch trình thành công!");
    } catch (error) {
      console.error("Failed to delete pattern:", error);
      toast.error(`Xóa lịch trình thất bại: ${error.message}`);
    } finally {
      setDeletePatternModalOpen(false);
      setPatternToDelete(null);
    }
  };

  // Add after the handleEditPattern function (around line 2640)
  const isSlotBlocked = (dayInWeek, slotIndex) => {
    return editPatternBlockedSlots.some(blockedSlot => 
      blockedSlot.dayInWeek === dayInWeek && blockedSlot.slotIndex === slotIndex
    );
  };

  // Add new state variables for booking configuration
  const [bookingConfig, setBookingConfig] = useState({
    allowInstantBooking: true,
    maxInstantBookingSlots: 3
  });
  const [bookingConfigLoading, setBookingConfigLoading] = useState(false);
  const [bookingConfigError, setBookingConfigError] = useState(null);

  // Add function to fetch booking configuration
  const fetchBookingConfiguration = async () => {
    try {
      setBookingConfigLoading(true);
      setBookingConfigError(null);
      const config = await fetchTutorBookingConfigByTutorId(id);
      setBookingConfig(config);
    } catch (error) {
      console.error("Failed to fetch booking configuration:", error);
      setBookingConfigError(error.message);
    } finally {
      setBookingConfigLoading(false);
    }
  };

  // Add function to update booking configuration
  const handleUpdateBookingConfig = async () => {
    try {
      setBookingConfigLoading(true);
      await updateTutorBookingConfig(bookingConfig);
      toast.success("Cập nhật cấu hình đặt lịch thành công!");
    } catch (error) {
      console.error("Failed to update booking configuration:", error);
      toast.error(`Cập nhật cấu hình thất bại: ${error.message}`);
    } finally {
      setBookingConfigLoading(false);
    }
  };

  // Add function to handle booking configuration changes
  const handleBookingConfigChange = (field, value) => {
    setBookingConfig((prevConfig) => ({
      ...prevConfig,
      [field]: value,
    }));
  };

  // Add useEffect to fetch booking configuration on component mount
  useEffect(() => {
    if (id) {
      fetchBookingConfiguration();
    }
  }, [id]);

  if (loading) {
    return <TutorProfileSkeleton />;
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
                  {tutorData.profileImageUrl ? (
                    <LargeAvatar
                      src={tutorData.profileImageUrl}
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
                  {tutorData.fullName}
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
                      ({tutorData.nickName})
                            </Typography>
                        )}
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
                  <Tab label="Cấu hình đặt lịch" />
                  <Tab label="Bài học" />
                  <Tab label="Lịch trình tuần" />
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

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          mb: 2,
                          gap: 4,
                        }}
                      >
                        {/* Week range and navigation */}
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <IconButton
                            onClick={handlePrevWeek}
                            sx={{
                              p: 1,
                              borderRadius: "50%",
                              backgroundColor: "#f3f4f6",
                              "&:hover": { backgroundColor: "#B8B8B8" },
                              boxShadow: "none",
                            }}
                            aria-label="Previous week"
                          >
                            <FaChevronLeft size={20} color="#333" />
                          </IconButton>
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 600 }}
                          >
                            {formatDateRange(monday, sunday)}
                          </Typography>
                          <IconButton
                            onClick={handleNextWeek}
                            sx={{
                              p: 1,
                              borderRadius: "50%",
                              backgroundColor: "#f3f4f6",
                              "&:hover": { backgroundColor: "#B8B8B8" },
                              boxShadow: "none",
                            }}
                            aria-label="Next week"
                          >
                            <FaChevronRight size={20} color="#333" />
                          </IconButton>
                        </Box>
                        {/* Buttons */}
                        {/* <Box sx={{ display: "flex", gap: 2 }}>
                          {weeklyPatterns && weeklyPatterns.length > 0 ? (
                            <>
                              <StyledButton onClick={openEditPatternDialog}>
                                Chỉnh sửa lịch trình
                              </StyledButton>
                              <RedStyledButton
                                onClick={() =>
                                  openDeletePatternDialog(weeklyPatterns[0]?.id)
                                }
                              >
                                Xóa lịch trình
                              </RedStyledButton>
                            </>
                          ) : (
                            <StyledButton onClick={openEditPatternDialog}>
                              Tạo lịch trình
                            </StyledButton>
                          )}
                        </Box> */}
                      </Box>

                      {allPatternDetailsLoading ? (
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
                              {getCurrentWeekInfo().map((d, i) => (
                                <Box
                                  key={i}
                                  sx={{
                                    p: 1.5,
                                    backgroundColor: "#f8fafc",
                                    borderBottom: "1px solid #e2e8f0",
                                    borderRight:
                                      i === getCurrentWeekInfo().length - 1
                                        ? "none"
                                        : "1px solid #e2e8f0",
                                    textAlign: "center",
                                    fontWeight: 600,
                                    color: "#1e293b",
                                    fontSize: "0.875rem",
                                    position: "sticky",
                                    top: 0,
                                    zIndex: 1,
                                  }}
                                >
                                  <Box sx={{ fontSize: "0.75rem" }}>
                                    {d.label}
                                  </Box>
                                  <Box
                                    sx={{
                                      fontSize: "0.625rem",
                                      color: "#64748b",
                                      mt: 0.25,
                                    }}
                                  >
                                    {d.date}
                                  </Box>
                                </Box>
                              ))}

                              {/* Time slots */}
                              {Array.from({ length: 48 }).map((_, slotIdx) => {
                                const hour = Math.floor(slotIdx / 2);
                                const minute = slotIdx % 2 === 0 ? "00" : "30";
                                const nextHour =
                                  slotIdx % 2 === 0 ? hour : hour + 1;
                                const nextMinute =
                                  slotIdx % 2 === 0 ? "30" : "00";
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
                                      const isActive = isSlotActiveInAnyPattern(
                                        dayInWeek,
                                        slotIdx
                                      );
                                      const patternInfo = getPatternInfoForSlot(
                                        dayInWeek,
                                        slotIdx
                                      );

                                      return (
                                        <Tooltip
                                          key={dayIdx}
                                          title={
                                            patternInfo &&
                                            patternInfo.length > 0
                                              ? `Có sẵn trong ${
                                                  patternInfo.length
                                                } lịch trình: ${patternInfo
                                                  .map(
                                                    (p) =>
                                                      `${new Date(
                                                        p.appliedFrom
                                                      ).toLocaleDateString(
                                                        "vi-VN"
                                                      )}${
                                                        p.endDate
                                                          ? ` - ${new Date(
                                                              p.endDate
                                                            ).toLocaleDateString(
                                                              "vi-VN"
                                                            )}`
                                                          : ""
                                                      }`
                                                  )
                                                  .join(", ")}`
                                              : "Không có sẵn"
                                          }
                                          arrow
                                        >
                                          <Box
                                            sx={{
                                              backgroundColor: isActive
                                                ? "#98D45F"
                                                : "#f1f5f9",
                                              border: "1px solid #e2e8f0",
                                              minHeight: 32,
                                              cursor:
                                                patternInfo &&
                                                patternInfo.length > 0
                                                  ? "help"
                                                  : "default",
                                              position: "relative",
                                              "&:hover": {
                                                backgroundColor: isActive
                                                  ? "#7bbf3f"
                                                  : "#e0e7ef",
                                              },
                                            }}
                                          >
                                            {/* Show pattern count indicator if multiple patterns */}
                                            {patternInfo &&
                                              patternInfo.length > 1 && (
                                                <Box
                                                  sx={{
                                                    position: "absolute",
                                                    top: 2,
                                                    right: 2,
                                                    width: 16,
                                                    height: 16,
                                                    borderRadius: "50%",
                                                    backgroundColor: "#3b82f6",
                                                    color: "white",
                                                    fontSize: "10px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    fontWeight: "bold",
                                                  }}
                                                >
                                                  {patternInfo.length}
                                                </Box>
                                              )}
                                          </Box>
                                        </Tooltip>
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
                                    width: "6px",
                                    height: "6px",
                                    borderRadius: "50%",
                                    backgroundColor: "#98D45F",
                                  }}
                                />
                                <Typography
                                  variant="body2"
                                  sx={{ color: "#475569" }}
                                >
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
                                    width: "6px",
                                    height: "6px",
                                    borderRadius: "50%",
                                    backgroundColor: "#e2e8f0",
                                  }}
                                />
                                <Typography
                                  variant="body2"
                                  sx={{ color: "#475569" }}
                                >
                                  Không có sẵn
                                </Typography>
                              </Box>
                            </Box>

                            <Typography
                              variant="body2"
                              sx={{ color: "#64748b", fontSize: "0.875rem" }}
                            >
                              Dựa trên múi giờ của bạn (UTC+07:00) • Tuần:{" "}
                              {formatDateRange(
                                new Date(currentWeekStart),
                                new Date(
                                  new Date(currentWeekStart).getTime() +
                                    6 * 24 * 60 * 60 * 1000
                                )
                              )}{" "}
                              • Cập nhật lần cuối:{" "}
                              {allPatternDetails.length > 0
                                ? new Date(
                                    allPatternDetails.sort(
                                      (a, b) =>
                                        new Date(b.appliedFrom) -
                                        new Date(a.appliedFrom)
                                    )[0].appliedFrom
                                  ).toLocaleDateString("vi-VN")
                                : "Không xác định"}
                            </Typography>
                          </Box>
                        </Box>
                      )}
                    </Box>
                    {/* <Box
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
                        Yêu Cầu Từ Học Viên
                      </SectionTitle>
                      <Box
                        sx={{
                          p: 2,
                          backgroundColor: "#fff",
                          borderRadius: 2,
                          border: "1px solid #e2e8f0",
                        }}
                      >
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
                                      <Skeleton
                                        variant="text"
                                        width="80%"
                                        height={24}
                                      />
                                    </TableCell>
                                    {Array.from({ length: 7 }).map(
                                      (__, dayIdx) => (
                                        <TableCell key={dayIdx}>
                                          <Skeleton
                                            variant="rectangular"
                                            width="80%"
                                            height={24}
                                          />
                                        </TableCell>
                                      )
                                    )}
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
                                  <TableCell>
                                    Thời gian yêu cầu mới nhất
                                  </TableCell>
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
                                      onClick={() =>
                                        handleOpenBookingDetail(req.learnerId)
                                      }
                                    >
                                      <TableCell>{req.learnerName}</TableCell>
                                      <TableCell>
                                        {req.hasUnviewed ? (
                                          <Box
                                            sx={{
                                              display: "flex",
                                              alignItems: "center",
                                              gap: 1,
                                            }}
                                          >
                                            <Tooltip title="Yêu cầu mới, chưa xem">
                                              <Avatar
                                                sx={{
                                                  bgcolor: "#ff9800",
                                                  width: 18,
                                                  height: 18,
                                                  fontSize: 18,
                                                }}
                                              >
                                                <FiPlusCircle />
                                              </Avatar>
                                            </Tooltip>
                                            <Typography
                                              sx={{
                                                color: "#ff9800",
                                                fontWeight: 700,
                                              }}
                                            >
                                              Chưa xem
                                            </Typography>
                                          </Box>
                                        ) : (
                                          <Box
                                            sx={{
                                              display: "flex",
                                              alignItems: "center",
                                              gap: 1,
                                            }}
                                          >
                                            <Tooltip title="Đã xem yêu cầu này">
                                              <Avatar
                                                sx={{
                                                  bgcolor: "#4caf50",
                                                  width: 18,
                                                  height: 18,
                                                  fontSize: 18,
                                                }}
                                              >
                                                <FiCheck />
                                              </Avatar>
                                            </Tooltip>
                                            <Typography
                                              sx={{
                                                color: "#4caf50",
                                                fontWeight: 500,
                                              }}
                                            >
                                              Đã xem
                                            </Typography>
                                          </Box>
                                        )}
                                      </TableCell>
                                      <TableCell>
                                        {req.latestRequestTime
                                          ? new Date(
                                              req.latestRequestTime
                                            ).toLocaleString("vi-VN")
                                          : "-"}
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
                    {/* Content for Tab 2: Cấu hình đặt lịch */}
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
                      <Box
                        sx={{
                          mb: 3,
                          p: 3,
                          backgroundColor: "#ffffff",
                          borderRadius: "12px",
                          border: "1px solid #e2e8f0",
                          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                        }}
                      >
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 600, 
                            color: "#1e293b", 
                            mb: 2,
                            display: "flex",
                            alignItems: "center",
                            gap: 1
                          }}
                        >
                          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Cấu hình đặt lịch
                        </Typography>
                        
                        {bookingConfigError && (
                          <Alert severity="error" sx={{ mb: 2, fontSize: "0.875rem" }}>
                            {bookingConfigError}
                          </Alert>
                        )}
                        
                        <Grid container spacing={3}>
                          {/* Allow Instant Booking Switch */}
                          <Grid item xs={12} md={6}>
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 2, backgroundColor: "#f8fafc", borderRadius: 2 }}>
                              <Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#1e293b", mb: 0.5 }}>
                                  Cho phép đặt lịch tức thì
                                </Typography>
                                <Typography variant="body2" color="textSecondary" sx={{ fontSize: "0.875rem" }}>
                                  Học viên có thể đặt lịch ngay lập tức mà không cần chờ xác nhận
                                </Typography>
                              </Box>
                              <Switch
                                checked={bookingConfig.allowInstantBooking}
                                onChange={(e) => handleBookingConfigChange("allowInstantBooking", e.target.checked)}
                                sx={{
                                  '& .MuiSwitch-switchBase.Mui-checked': {
                                    color: '#3b82f6',
                                    '&:hover': {
                                      backgroundColor: 'rgba(59, 130, 246, 0.08)',
                                    },
                                  },
                                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                    backgroundColor: '#3b82f6',
                                  },
                                }}
                              />
                            </Box>
                          </Grid>
                          
                          {/* Max Instant Booking Slots Input */}
                          <Grid item xs={12} md={6}>
                            <Box sx={{ p: 2, backgroundColor: "#f8fafc", borderRadius: 2, height: "100%" }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#1e293b", mb: 1 }}>
                                Số lượng slot tối đa
                              </Typography>
                              <Typography variant="body2" color="textSecondary" sx={{ fontSize: "0.875rem", mb: 2 }}>
                                Giới hạn số lượng slot có thể đặt tức thì mỗi ngày
                              </Typography>
                              <TextField
                                label="Số slot tối đa"
                                type="number"
                                value={bookingConfig.maxInstantBookingSlots || ""}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value) || 0;
                                  handleBookingConfigChange("maxInstantBookingSlots", Math.max(0, value));
                                }}
                                size="small"
                                fullWidth
                                disabled={!bookingConfig.allowInstantBooking}
                                inputProps={{
                                  min: 0,
                                  step: 1,
                                  style: { fontSize: "0.875rem" }
                                }}
                                sx={{
                                  "& .MuiInputLabel-root": {
                                    fontSize: "0.875rem",
                                    color: "#374151"
                                  },
                                  "& .MuiOutlinedInput-root": {
                                    fontSize: "0.875rem",
                                    backgroundColor: "#ffffff"
                                  },
                                  "& .MuiOutlinedInput-root.Mui-disabled": {
                                    backgroundColor: "#f1f5f9"
                                  }
                                }}
                              />
                            </Box>
                          </Grid>
                        </Grid>
                        
                        {/* Update Button */}
                        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                          <Button
                            variant="contained"
                            onClick={handleUpdateBookingConfig}
                            disabled={bookingConfigLoading}
                            sx={{
                              backgroundColor: "#3b82f6",
                              color: "white",
                              fontSize: "0.875rem",
                              fontWeight: 600,
                              px: 3,
                              py: 1.5,
                              borderRadius: 2,
                              textTransform: "none",
                              "&:hover": {
                                backgroundColor: "#2563eb",
                                boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
                              },
                              "&:disabled": {
                                backgroundColor: "#9ca3af",
                                boxShadow: "none",
                              }
                            }}
                          >
                            {bookingConfigLoading ? (
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <CircularProgress size={16} color="inherit" />
                                Đang cập nhật...
                              </Box>
                            ) : (
                              "Cập nhật cấu hình"
                            )}
                          </Button>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                )}

                {selectedTab === 2 && (
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
                    hidden={selectedTab !== 2}
                  >
                    {/* Content for Tab 3: Bài học */}
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
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 3,
                        }}
                      >
                        <SectionTitle variant="h6">Tạo bài học</SectionTitle>
                        <StyledButton
                          variant="contained"
                          onClick={() => {
                            setEditLesson(null);
                            setLessonForm({
                              name: "",
                              description: "",
                              note: "",
                              targetAudience: "",
                              prerequisites: "",
                              languageCode: "",
                              category: "",
                              price: "",
                              currency: "",
                            });
                            setShowValidation(false);
                            setLessonDialogOpen(true);
                          }}
                          startIcon={
                            <Box
                              sx={{
                                width: "20px",
                                height: "20px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
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
                                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                />
                              </svg>
                            </Box>
                          }
                        >
                          Tạo bài học
                        </StyledButton>
                      </Box>

                      {/* Lessons Table */}
                      <TableContainer
                        component={Paper}
                        sx={{ borderRadius: "16px" }}
                      >
                        <Table>
                          <TableHead>
                            <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                              <TableCell sx={{ fontWeight: 600 }}>
                                Tên bài học
                              </TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>
                                Ngôn ngữ
                              </TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>
                                Giá
                              </TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>
                                Mô tả
                              </TableCell>
                              <TableCell
                                align="center"
                                sx={{ fontWeight: 600 }}
                              >
                                Hành động
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {lessonsLoading ? (
                              Array.from({ length: 3 }).map((_, index) => (
                                <TableRow key={index}>
                                  <TableCell>
                                    <Skeleton
                                      variant="text"
                                      width="80%"
                                      height={24}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Skeleton
                                      variant="text"
                                      width="60%"
                                      height={24}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Skeleton
                                      variant="text"
                                      width="50%"
                                      height={24}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Skeleton
                                      variant="text"
                                      width="90%"
                                      height={24}
                                    />
                                  </TableCell>
                                  <TableCell align="center">
                                    <Skeleton
                                      variant="circular"
                                      width={32}
                                      height={32}
                                    />
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : lessons.length === 0 ? (
                              <TableRow>
                                <TableCell
                                  colSpan={5}
                                  align="center"
                                  sx={{ py: 4 }}
                                >
                                  <Box
                                    sx={{
                                      display: "flex",
                                      flexDirection: "column",
                                      alignItems: "center",
                                      color: "#64748b",
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        width: "64px",
                                        height: "64px",
                                        mb: 2,
                                        opacity: 0.5,
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
                                          strokeWidth="1.5"
                                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                        />
                                      </svg>
                                    </Box>
                                    <Typography
                                      variant="body1"
                                      sx={{ fontWeight: 500 }}
                                    >
                                      Chưa có bài học nào
                                    </Typography>
                                    <Typography variant="body2">
                                      Hãy tạo bài học đầu tiên của bạn
                                    </Typography>
                                  </Box>
                                </TableCell>
                              </TableRow>
                            ) : (
                              lessons.map((lesson) => (
                                <TableRow key={lesson.id} hover>
                                  <TableCell sx={{ fontWeight: 500 }}>
                                    {lesson.name}
                                  </TableCell>
                                  <TableCell>
                                    {getLanguageName(lesson.languageCode)}
                                  </TableCell>
                                  <TableCell>
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        color: "#059669",
                                        fontWeight: 600,
                                      }}
                                    >
                                      {formatPriceWithCommas(lesson.price)} VND
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        maxWidth: "200px",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                      }}
                                      title={lesson.description}
                                    >
                                      {lesson.description}
                                    </Typography>
                                  </TableCell>
                                  <TableCell align="center">
                                    <Box
                                      sx={{
                                        display: "flex",
                                        gap: 1,
                                        justifyContent: "center",
                                      }}
                                    >
                                      <IconButton
                                        size="small"
                                        onClick={() => {
                                          setEditLesson(lesson);
                                          setLessonForm({
                                            name: lesson.name || "",
                                            description:
                                              lesson.description || "",
                                            note: lesson.note || "",
                                            targetAudience:
                                              lesson.targetAudience || "",
                                            prerequisites:
                                              lesson.prerequisites || "",
                                            languageCode:
                                              lesson.languageCode || "",
                                            category: lesson.category || "",
                                            price: formatPriceInputWithCommas(
                                              lesson.price?.toString() || "0"
                                            ),
                                            currency: lesson.currency || "",
                                          });
                                          setShowValidation(false);
                                          setLessonDialogOpen(true);
                                        }}
                                        sx={{
                                          color: "#3b82f6",
                                          "&:hover": {
                                            backgroundColor:
                                              "rgba(59, 130, 246, 0.1)",
                                          },
                                        }}
                                      >
                                        <Box
                                          sx={{ width: "16px", height: "16px" }}
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
                                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                            />
                                          </svg>
                                        </Box>
                                      </IconButton>
                                      <IconButton
                                        size="small"
                                        onClick={() =>
                                          handleDeleteLesson(lesson.id)
                                        }
                                        sx={{
                                          color: "#ef4444",
                                          "&:hover": {
                                            backgroundColor:
                                              "rgba(239, 68, 68, 0.1)",
                                          },
                                        }}
                                      >
                                        <Box
                                          sx={{ width: "16px", height: "16px" }}
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
                                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                            />
                                          </svg>
                                        </Box>
                                      </IconButton>
                                    </Box>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  </Box>
                )}

                {selectedTab === 3 && (
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
                    hidden={selectedTab !== 3}
                  >
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
                      {/* Header Section with Title and Create Button */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 3,
                        }}
                      >
                        <SectionTitle variant="h6">Danh sách lịch trình tuần</SectionTitle>
                        <StyledButton
                          variant="contained"
                          onClick={() => {
                            setSelectedAppliedFromDate("");
                            setCalendarInputDialogOpen(true);
                          }}
                          startIcon={
                            <Box sx={{ width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            </Box>
                          }
                        >
                          Tạo lịch trình
                        </StyledButton>
                      </Box>

                      {/* Weekly Patterns Table */}
                      <Box sx={{ p: 2, backgroundColor: "#fff", borderRadius: 2, border: "1px solid #e2e8f0" }}>
                        {weeklyPatternsListLoading ? (
                          <WeeklyPatternsTableSkeleton />
                        ) : weeklyPatternsListError ? (
                          <Alert severity="error" sx={{ mb: 2 }}>{weeklyPatternsListError}</Alert>
                        ) : (
                          <TableContainer component={Paper}>
                            <Table>
                              <TableHead>
                                <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                                  <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                                  <TableCell sx={{ fontWeight: 600 }}>Ngày bắt đầu áp dụng</TableCell>
                                  <TableCell sx={{ fontWeight: 600 }}>Ngày kết thúc</TableCell>
                                  <TableCell sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
                                  <TableCell sx={{ fontWeight: 600 }}>Hành động</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {weeklyPatternsList.length === 0 ? (
                                  <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                                      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", color: "#64748b" }}>
                                        <Box sx={{ width: "64px", height: "64px", mb: 2, opacity: 0.5 }}>
                                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                          </svg>
                                        </Box>
                                        <Typography variant="body1" sx={{ fontWeight: 500 }}>Chưa có lịch trình nào</Typography>
                                        <Typography variant="body2">Tạo lịch trình đầu tiên của bạn</Typography>
                                      </Box>
                                    </TableCell>
                                  </TableRow>
                                ) : (
                                  weeklyPatternsList.map((pattern) => (
                                    <TableRow
                                      key={pattern.id}
                                      hover
                                      sx={{
                                        cursor: "pointer",
                                        "&:hover": {
                                          backgroundColor: "#f8fafc",
                                        },
                                        transition: "background-color 0.2s ease",
                                      }}
                                    >
                                      <TableCell sx={{ fontWeight: 500, fontFamily: "monospace" }}>
                                        {pattern.id.substring(0, 8)}...
                                      </TableCell>
                                      <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                          {formatDate(pattern.appliedFrom)}
                                        </Typography>
                                      </TableCell>
                                      <TableCell>
                                        <Typography variant="body2" color="textSecondary">
                                          {pattern.endDate ? formatDate(pattern.endDate) : "Không có"}
                                        </Typography>
                                      </TableCell>
                                      <TableCell>
                                        <Chip
                                          label={getStatusLabel(pattern)}
                                          color={getStatusColor(pattern)}
                                          size="small"
                                          sx={{ fontWeight: 600, fontSize: "0.75rem" }}
                                        />
                                      </TableCell>
                                      <TableCell>
                                        <Box sx={{ display: "flex", gap: 1 }}>
                                          <IconButton
                                            size="small"
                                            onClick={(e) => {
                                              e.stopPropagation(); // Prevent row click
                                              handlePatternRowClick(pattern);
                                            }}
                                            sx={{
                                              color: "#3b82f6",
                                              "&:hover": {
                                                backgroundColor: "rgba(59, 130, 246, 0.1)",
                                              },
                                            }}
                                            title="Xem chi tiết"
                                          >
                                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                          </IconButton>
                                          <IconButton
                                            size="small"
                                            onClick={(e) => {
                                              e.stopPropagation(); // Prevent row click
                                              handleEditPattern(pattern);
                                            }}
                                            sx={{
                                              color: "#f59e0b",
                                              "&:hover": {
                                                backgroundColor: "rgba(245, 158, 11, 0.1)",
                                              },
                                            }}
                                            title="Chỉnh sửa"
                                          >
                                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                          </IconButton>
                                          <IconButton
                                            size="small"
                                            onClick={(e) => {
                                              e.stopPropagation(); // Prevent row click
                                              handleDeletePattern(pattern);
                                            }}
                                            sx={{
                                              color: "#ef4444",
                                              "&:hover": {
                                                backgroundColor: "rgba(239, 68, 68, 0.1)",
                                              },
                                            }}
                                            title="Xóa"
                                          >
                                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                          </IconButton>
                                        </Box>
                                      </TableCell>
                                    </TableRow>
                                  ))
                                )}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        )}

                        {weeklyPatternsList.length > 0 && (
                          <Box sx={{ mt: 2, p: 2, backgroundColor: "#f8fafc", borderRadius: 1 }}>
                            <Typography variant="body2" color="textSecondary" sx={{ fontSize: "0.875rem" }}>
                              <strong>Tổng cộng:</strong> {weeklyPatternsList.length} lịch trình tuần
                            </Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ fontSize: "0.75rem", mt: 0.5 }}>
                              Lịch trình được sắp xếp theo thứ tự thời gian áp dụng (mới nhất trước)
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
        onClose={() => {
          setLessonDialogOpen(false);
          setLessonFormErrors({});
        }}
        maxWidth={false}
        fullWidth={false}
      >
        <DialogTitle>{editLesson ? "Sửa bài học" : "Tạo bài học"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Tên bài học"
            fullWidth
            margin="normal"
            value={lessonForm.name}
            onChange={(e) => {
              setLessonForm({ ...lessonForm, name: e.target.value });
              if (lessonFormErrors.name) {
                setLessonFormErrors({ ...lessonFormErrors, name: "" });
              }
            }}
            required
            error={!!lessonFormErrors.name}
            helperText={lessonFormErrors.name || ""}
          />
          <TextField
            label="Mô tả"
            fullWidth
            margin="normal"
            multiline
            rows={3}
            value={lessonForm.description}
            onChange={(e) => {
              setLessonForm({ ...lessonForm, description: e.target.value });
              if (lessonFormErrors.description) {
                setLessonFormErrors({ ...lessonFormErrors, description: "" });
              }
            }}
            required
            error={!!lessonFormErrors.description}
            helperText={lessonFormErrors.description || ""}
          />
          <TextField
            label="Ghi chú"
            fullWidth
            margin="normal"
            multiline
            rows={2}
            value={lessonForm.note}
            onChange={(e) => {
              setLessonForm({ ...lessonForm, note: e.target.value });
              if (lessonFormErrors.note) {
                setLessonFormErrors({ ...lessonFormErrors, note: "" });
              }
            }}
            error={!!lessonFormErrors.note}
            helperText={lessonFormErrors.note || ""}
          />
          <TextField
            label="Đối tượng"
            fullWidth
            margin="normal"
            value={lessonForm.targetAudience}
            onChange={(e) => {
              setLessonForm({ ...lessonForm, targetAudience: e.target.value });
              if (lessonFormErrors.targetAudience) {
                setLessonFormErrors({
                  ...lessonFormErrors,
                  targetAudience: "",
                });
              }
            }}
            required
            error={!!lessonFormErrors.targetAudience}
            helperText={lessonFormErrors.targetAudience || ""}
          />
          <TextField
            label="Yêu cầu trước"
            fullWidth
            margin="normal"
            multiline
            rows={2}
            value={lessonForm.prerequisites}
            onChange={(e) => {
              setLessonForm({ ...lessonForm, prerequisites: e.target.value });
              if (lessonFormErrors.prerequisites) {
                setLessonFormErrors({ ...lessonFormErrors, prerequisites: "" });
              }
            }}
            required
            error={!!lessonFormErrors.prerequisites}
            helperText={lessonFormErrors.prerequisites || ""}
          />
          <FormControl
            fullWidth
            margin="normal"
            required
            error={!!lessonFormErrors.languageCode}
          >
            <InputLabel id="language-select-label">Ngôn ngữ</InputLabel>
            <Select
              labelId="language-select-label"
              value={lessonForm.languageCode}
              label="Ngôn ngữ"
              onChange={(e) => {
                setLessonForm({ ...lessonForm, languageCode: e.target.value });
                if (lessonFormErrors.languageCode) {
                  setLessonFormErrors({
                    ...lessonFormErrors,
                    languageCode: "",
                  });
                }
              }}
            >
              {languageList.map((lang) => (
                <MenuItem key={lang.code} value={lang.code}>
                  {lang.name}
                </MenuItem>
              ))}
            </Select>
            {lessonFormErrors.languageCode && (
              <Typography color="error" variant="caption">
                {lessonFormErrors.languageCode}
              </Typography>
            )}
          </FormControl>
          <TextField
            label="Danh mục"
            fullWidth
            margin="normal"
            value={lessonForm.category}
            onChange={(e) => {
              setLessonForm({ ...lessonForm, category: e.target.value });
              if (lessonFormErrors.category) {
                setLessonFormErrors({ ...lessonFormErrors, category: "" });
              }
            }}
            required
            error={!!lessonFormErrors.category}
            helperText={lessonFormErrors.category || ""}
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
              if (lessonFormErrors.price) {
                setLessonFormErrors({ ...lessonFormErrors, price: "" });
              }
            }}
            required
            error={!!lessonFormErrors.price}
            helperText={lessonFormErrors.price || ""}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setLessonDialogOpen(false);
              setLessonFormErrors({});
            }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={async () => {
              const errors = validateLessonForm(lessonForm);
              setLessonFormErrors(errors);

              if (Object.keys(errors).length > 0) {
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
                  toast.success("Cập nhật bài học thành công!");
                } else {
                  const res = await createLesson(lessonData);
                  setLessons([...lessons, res.data]);
                  toast.success("Tạo bài học thành công!");
                }
                setLessonDialogOpen(false);
                setLessonFormErrors({});
              } catch (err) {
                toast.error("Lưu bài học thất bại: " + err.message);
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
            toast.success("Xóa bài học thành công!");
          } catch (err) {
            toast.error("Xóa bài học thất bại: " + err.message);
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
        onClose={() => {
          setEditPatternDialogOpen(false);
          setEditingPattern(null);
          setEditPatternSlots({});
          setEditPatternBlockedSlots([]);
        }}
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
            <Typography variant="h6">Chỉnh sửa lịch trình tuần</Typography>
            {editingPattern && (
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
                <Typography variant="body2" color="primary" sx={{ fontWeight: "bold" }}>
                  Ngày bắt đầu áp dụng:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                  {formatDate(editingPattern.appliedFrom)}
                </Typography>
              </Box>
            )}
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton
              disabled={true}
              onClick={handleEditPatternPrevWeek}
              sx={{
                color: "primary.main",
                "&:hover": { backgroundColor: "rgba(25, 118, 210, 0.04)" },
                "&.Mui-disabled": {
                  color: "rgba(0, 0, 0, 0.26)",
                }
              }}
            >
              <FiChevronLeft />
            </IconButton>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {(() => {
                const startDate = new Date(editPatternWeekStart);
                const endDate = new Date(editPatternWeekStart);
                endDate.setDate(endDate.getDate() + 6);
                return formatDateRange(startDate, endDate);
              })()}
            </Typography>
            <IconButton
              disabled={true}
              onClick={handleEditPatternNextWeek}
              sx={{
                color: "primary.main",
                "&:hover": { backgroundColor: "rgba(25, 118, 210, 0.04)" },
                "&.Mui-disabled": {
                  color: "rgba(0, 0, 0, 0.26)",
                }
              }}
            >
              <FiChevronRight />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {editPatternLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
              <CircularProgress />
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
                  {getWeekDates(editPatternWeekStart).map((d, i) => (
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
                          const isSelected =
                            editPatternSlots[dayInWeek] &&
                            editPatternSlots[dayInWeek].has(slotIdx);

                          // Check if this slot is in the past
                          const isPastSlot = isSlotInPast(
                                editPatternWeekStart,
                            dayInWeek,
                            slotIdx
                          );

                          // Check if this slot is blocked
                          const isBlockedSlot = isSlotBlocked(dayInWeek, slotIdx);

                          let bgColor = "#f1f5f9"; // Default background
                          let textColor = "inherit";
                          let fontWeight = 400;
                          let opacity = 1;
                          let cursor = "pointer";
                          let overlayPattern = {};

                          if (isPastSlot) {
                            // Past slots: show their status but muted and disabled
                            opacity = 0.7;
                            cursor = "not-allowed";

                            // Add diagonal stripe pattern for past slots
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
                                  "repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.3) 2px, rgba(255,255,255,0.3) 4px)",
                                pointerEvents: "none",
                              },
                            };

                            // Apply muted versions of the original colors for past slots
                            if (isSelected) {
                              bgColor = "#b8e0a3"; // muted green for selected
                              textColor = "#fff";
                              fontWeight = 700;
                            } else {
                              bgColor = "#B8B8B8"; // muted gray for default
                              textColor = "#999";
                            }
                          } else if (isBlockedSlot) {
                            // Blocked slots: show gray with parallel slashes
                            bgColor = "#d1d5db"; // gray background
                            textColor = "#6b7280";
                            cursor = "not-allowed";
                            opacity = 0.8;
                            
                            // Add parallel slash pattern for blocked slots
                            overlayPattern = {
                              position: "relative",
                              "&::after": {
                                content: '""',
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: `
                                  repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(107, 114, 128, 0.3) 2px, rgba(107, 114, 128, 0.3) 4px),
                                  repeating-linear-gradient(-45deg, transparent, transparent 2px, rgba(107, 114, 128, 0.3) 2px, rgba(107, 114, 128, 0.3) 4px)
                                `,
                                pointerEvents: "none",
                              },
                            };
                          } else {
                            // Only apply these styles if slot is NOT in the past and NOT blocked
                            if (isSelected) {
                              bgColor = "#98D45F"; // green for selected
                              textColor = "#fff";
                              fontWeight = 700;
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
                                "&:hover": (isPastSlot || isBlockedSlot)
                                  ? {}
                                  : {
                                      filter: "brightness(0.9)",
                                    },
                                ...overlayPattern,
                              }}
                              onClick={() => {
                                // Don't allow clicking on past slots or blocked slots
                                if (isPastSlot || isBlockedSlot) return;

                                handleEditPatternSlotClick(dayInWeek, slotIdx);
                              }}
                            />
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                </Box>
                
                {/* Add blocked slots info after the calendar */}
                {editPatternBlockedSlots.length > 0 && (
                  <Box sx={{ mt: 2, p: 2, backgroundColor: "#fef3c7", borderRadius: 1, border: "1px solid #f59e0b" }}>
                    <Typography variant="body2" sx={{ fontWeight: "medium", color: "#92400e", mb: 1 }}>
                      ⚠️ Khung giờ không thể chỉnh sửa
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#92400e", fontSize: "0.875rem" }}>
                      Các khung giờ có gạch chéo màu xám đã được đặt lịch hoặc tạm giữ và không thể chỉnh sửa.
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Right side - Selected slots card */}
              <AnimatePresence>
                {getEditSelectedSlotsCount() > 0 && (
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

                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ maxHeight: 400, overflowY: "auto" }}>
                          <AnimatePresence>
                            {Object.entries(editPatternSlots).map(
                              ([dayInWeek, slotSet]) => {
                                return Array.from(slotSet).map(
                                  (slotIndex, index) => {
                                    const slotInfo = formatEditSelectedSlot(
                                      Number(dayInWeek),
                                      slotIndex
                                    );

                                    return (
                                      <motion.div
                                        key={`${dayInWeek}-${slotIndex}`}
                                        initial={{
                                          opacity: 0,
                                          x: 30,
                                          scale: 0.95,
                                        }}
                                        animate={{
                                          opacity: 1,
                                          x: 0,
                                          scale: 1,
                                        }}
                                        exit={{
                                          opacity: 0,
                                          x: -30,
                                          scale: 0.95,
                                        }}
                                        transition={{
                                          type: "spring",
                                          stiffness: 400,
                                          damping: 25,
                                          delay: index * 0.1,
                                        }}
                                      >
                                        <Box
                                          sx={{
                                            p: 1.5,
                                            mb: 1,
                                            borderRadius: 1,
                                            backgroundColor: "#f8f9fa",
                                            border: "1px solid #e9ecef",
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                          }}
                                        >
                                          <Box>
                                            <Typography
                                              variant="body2"
                                              sx={{ fontWeight: "medium" }}
                                            >
                                              {slotInfo.dayLabel}
                                            </Typography>
                                            <Typography
                                              variant="body2"
                                              color="textSecondary"
                                            >
                                              {slotInfo.date}
                                            </Typography>
                                            <Typography
                                              variant="body2"
                                              sx={{
                                                color: "#3b82f6",
                                                fontWeight: "medium",
                                              }}
                                            >
                                              {slotInfo.timeLabel}
                                            </Typography>
                                          </Box>
                                          <motion.div
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                          >
                                            <IconButton
                                              size="small"
                                              onClick={() =>
                                                handleEditPatternSlotClick(
                                                  Number(dayInWeek),
                                                  slotIndex
                                                )
                                              }
                                              sx={{
                                                color: "#dc3545",
                                                "&:hover": {
                                                  backgroundColor:
                                                    "rgba(220, 53, 69, 0.1)",
                                                },
                                              }}
                                            >
                                              <FiTrash2 size={16} />
                                            </IconButton>
                                          </motion.div>
                                        </Box>
                                      </motion.div>
                                    );
                                  }
                                );
                              }
                            )}
                          </AnimatePresence>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3, duration: 0.3 }}
                        >
                          <Box sx={{ textAlign: "center" }}>
                            <Typography
                              variant="body2"
                              color="textSecondary"
                              sx={{ mb: 1 }}
                            >
                              Tổng cộng: {getEditSelectedSlotsCount()} slot
                            </Typography>
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() => {
                                  setEditPatternSlots({});
                                }}
                                sx={{
                                  color: "#dc3545",
                                  borderColor: "#dc3545",
                                }}
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
                  backgroundColor: "#98D45F", // green
                  mr: 1,
                }}
              />
              <Typography variant="body2" sx={{ color: "#4a7c1c" }}>
                Đã chọn
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  backgroundColor: "#f1f5f9", // light gray
                  mr: 1,
                }}
              />
              <Typography variant="body2" sx={{ color: "#64748b" }}>
                Chưa chọn
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  backgroundColor: "#d1d5db", // gray
                  mr: 1,
                  position: "relative",
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `
                      repeating-linear-gradient(45deg, transparent, transparent 1px, rgba(107, 114, 128, 0.3) 1px, rgba(107, 114, 128, 0.3) 2px),
                      repeating-linear-gradient(-45deg, transparent, transparent 1px, rgba(107, 114, 128, 0.3) 1px, rgba(107, 114, 128, 0.3) 2px)
                    `,
                  },
                }}
              />
              <Typography variant="body2" sx={{ color: "#6b7280" }}>
                Đã chặn
              </Typography>
            </Box>
          </Box>
          {/* Buttons */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              onClick={() => {
                setEditPatternDialogOpen(false);
                setEditingPattern(null);
                setEditPatternSlots({});
              }}
            >
              Hủy
            </Button>
            <Button
              variant="contained"
              color="primary"
              disabled={getEditSelectedSlotsCount() === 0 || editPatternLoading}
              onClick={handleUpdateWeeklyPattern}
            >
              {editPatternLoading ? "Đang cập nhật..." : "Cập nhật lịch trình"}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      <ConfirmDeleteWeeklyPattern
        open={deletePatternModalOpen}
        onClose={() => {
          setDeletePatternModalOpen(false);
          setPatternToDelete(null);
        }}
        onConfirm={confirmDeletePattern}
        title="Xác nhận xóa lịch trình"
        description={
          patternToDelete
            ? `Bạn có chắc chắn muốn xóa lịch trình bắt đầu từ ngày ${formatDate(patternToDelete.appliedFrom)} không? Hành động này không thể hoàn tác.`
            : "Bạn có chắc chắn muốn xóa lịch trình này không? Hành động này không thể hoàn tác."
        }
        confirmText="Xóa"
        cancelText="Hủy"
        confirmColor="error"
      />

      <Dialog
        open={bookingDetailDialogOpen}
        onClose={() => setBookingDetailDialogOpen(false)}
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
              Chọn khung giờ để đề xuất cho học viên
            </Typography>
            {learnerLessonDetails && (
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
                  Bài học học viên đã chọn:
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: "bold", fontSize: "32px" }}
                >
                  {learnerLessonDetails.title}
                </Typography>
                {learnerLessonDetails.description && (
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{ fontSize: "0.875rem" }}
                  >
                    {learnerLessonDetails.description}
                  </Typography>
                )}
                {learnerLessonDetails.price && (
                  <Typography
                    variant="body2"
                    color="primary"
                    sx={{ fontWeight: 500 }}
                  >
                    Giá: {formatPriceWithCommas(learnerLessonDetails.price)}{" "}
                    VND/slot
                  </Typography>
                )}
              </Box>
            )}
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton
              onClick={handleDialogPrevWeek}
              sx={{
                color: "primary.main",
                "&:hover": { backgroundColor: "rgba(25, 118, 210, 0.04)" },
              }}
            >
              <FiChevronLeft />
            </IconButton>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {(() => {
                const startDate = new Date(dialogWeekStart);
                const endDate = new Date(dialogWeekStart);
                endDate.setDate(endDate.getDate() + 6);
                return formatDateRange(startDate, endDate);
              })()}
            </Typography>
            <IconButton
              onClick={handleDialogNextWeek}
              sx={{
                color: "primary.main",
                "&:hover": { backgroundColor: "rgba(25, 118, 210, 0.04)" },
              }}
            >
              <FiChevronRight />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {bookingDetailLoading ? (
            <BookingDetailSkeleton />
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
                          const isRequested =
                            Array.isArray(bookingDetailSlots) &&
                            bookingDetailSlots.some(
                              (slot) =>
                                slot.dayInWeek === dayInWeek &&
                                slot.slotIndex === slotIdx
                            );
                          const isSelected = temporarilySelectedSlots.some(
                            (slot) =>
                              slot.dayInWeek === dayInWeek &&
                              slot.slotIndex === slotIdx
                          );
                          const isOffered = offerDetail?.offeredSlots?.some(
                            (slot) => {
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
                            }
                          );

                          // Check if slot is in the past
                          const isPastSlot = isSlotInPast(
                            dialogWeekStart,
                            dayInWeek,
                            slotIdx
                          );

                          // Purple if both requested and offered
                          const isRequestedAndOffered =
                            isRequested && isOffered;

                          let bgColor = "#f1f5f9"; // Default background
                          let textColor = "inherit";
                          let fontWeight = 400;
                          let opacity = 1;
                          let cursor = "pointer";
                          let overlayPattern = {};

                          if (isPastSlot) {
                            // Past slots: show their status but muted and disabled
                            opacity = 0.7;
                            cursor = "not-allowed";

                            // Add diagonal stripe pattern for past slots
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
                                  "repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.3) 2px, rgba(255,255,255,0.3) 4px)",
                                pointerEvents: "none",
                              },
                            };

                            // Apply muted versions of the original colors for past slots
                            if (isRequestedAndOffered) {
                              bgColor = "#c9b3e6"; // muted purple
                              textColor = "#fff";
                              fontWeight = 700;
                            } else if (isSelected) {
                              bgColor = "#b8e0a3"; // muted green for selected
                              textColor = "#fff";
                              fontWeight = 700;
                            } else if (isOffered) {
                              bgColor = "#8bb3f0"; // muted blue for offered
                              textColor = "#fff";
                              fontWeight = 700;
                            } else if (isRequested) {
                              bgColor = "#fae632"; // muted yellow for requested
                              textColor = "#333";
                              fontWeight = 600;
                            } else {
                              bgColor = "#B8B8B8"; // muted gray for default
                              textColor = "#999";
                            }
                          } else {
                            // Only apply these styles if slot is NOT in the past
                            if (isRequestedAndOffered) {
                              bgColor = "#a259e6"; // purple
                              textColor = "#fff";
                              fontWeight = 700;
                            } else if (isSelected) {
                              bgColor = "#98D45F"; // green for selected
                              textColor = "#fff";
                              fontWeight = 700;
                            } else if (isOffered) {
                              bgColor = "#3b82f6"; // blue for offered
                              textColor = "#fff";
                              fontWeight = 700;
                            } else if (isRequested) {
                              bgColor = "#FFD700"; // yellow for requested
                              textColor = "#333";
                              fontWeight = 600;
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
                              onClick={() =>
                                !isPastSlot &&
                                handleSlotClick(dayInWeek, slotIdx)
                              }
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
                {temporarilySelectedSlots.length > 0 && (
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
                              Học viên: {selectedLearner?.learnerName || "N/A"}
                            </Typography>
                          </Box>
                        </motion.div>

                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ maxHeight: 400, overflowY: "auto" }}>
                          <AnimatePresence>
                            {temporarilySelectedSlots.map((slot, index) => {
                              // Map dayInWeek to the correct index in dialogWeekInfo
                              // dayInWeek: 1=Sun, 2=Mon, ..., 7=Sat
                              // dialogWeekInfo: [MON, TUE, WED, THU, FRI, SAT, SUN] (index 0-6)
                              const dayIndexMap = {
                                1: 6, // Sun -> index 6
                                2: 0, // Mon -> index 0
                                3: 1, // Tue -> index 1
                                4: 2, // Wed -> index 2
                                5: 3, // Thu -> index 3
                                6: 4, // Fri -> index 4
                                7: 5, // Sat -> index 5
                              };
                              const dayInfo =
                                dialogWeekInfo[dayIndexMap[slot.dayInWeek]];

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
                                  key={`${slot.dayInWeek}-${slot.slotIndex}`}
                                  initial={{
                                    opacity: 0,
                                    x: 30,
                                    scale: 0.95,
                                  }}
                                  animate={{
                                    opacity: 1,
                                    x: 0,
                                    scale: 1,
                                  }}
                                  exit={{
                                    opacity: 0,
                                    x: -30,
                                    scale: 0.95,
                                  }}
                                  transition={{
                                    type: "spring",
                                    stiffness: 400,
                                    damping: 25,
                                    delay: index * 0.1,
                                  }}
                                >
                                  <Box
                                    sx={{
                                      p: 1.5,
                                      mb: 1,
                                      borderRadius: 1,
                                      backgroundColor: "#f8f9fa",
                                      border: "1px solid #e9ecef",
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                    }}
                                  >
                                    <Box>
                                      <Typography
                                        variant="body2"
                                        sx={{ fontWeight: "medium" }}
                                      >
                                        {dayInfo?.label ||
                                          `Thứ ${slot.dayInWeek}`}
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        color="textSecondary"
                                      >
                                        {dayInfo?.date || ""}
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        sx={{
                                          color: "#3b82f6",
                                          fontWeight: "medium",
                                        }}
                                      >
                                        {timeLabel}
                                      </Typography>
                                      {/* Add lesson name display */}
                                      {selectedLesson && (
                                        <Typography
                                          variant="body2"
                                          sx={{
                                            color: "#16a34a",
                                            fontWeight: "medium",
                                            mt: 0.5,
                                          }}
                                        >
                                          📚 {selectedLesson.name}
                                        </Typography>
                                      )}
                                    </Box>
                                    <motion.div
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.95 }}
                                    >
                                      <IconButton
                                        size="small"
                                        onClick={() =>
                                          handleSlotClick(
                                            slot.dayInWeek,
                                            slot.slotIndex
                                          )
                                        }
                                        sx={{
                                          color: "#dc3545",
                                          "&:hover": {
                                            backgroundColor:
                                              "rgba(220, 53, 69, 0.1)",
                                          },
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
                          <Box sx={{ textAlign: "center" }}>
                            <Typography
                              variant="body2"
                              color="textSecondary"
                              sx={{ mb: 1 }}
                            >
                              Tổng cộng: {temporarilySelectedSlots.length} slot
                            </Typography>
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() => {
                                  setTemporarilySelectedSlots([]);
                                  clearTemporarySlots(
                                    dialogWeekStart,
                                    selectedLearner
                                  );
                                }}
                                sx={{
                                  color: "#dc3545",
                                  borderColor: "#dc3545",
                                }}
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
            <Button
              onClick={() => {
                setBookingDetailDialogOpen(false);
                setSelectedLearner(null);
                setSelectedLesson(null);
                setLearnerLessonDetails(null); // Clear learner lesson details
                setTemporarilySelectedSlots([]);
              }}
            >
              Đóng
            </Button>
            <Button
              variant="contained"
              color="primary"
              disabled={
                temporarilySelectedSlots.length === 0 ||
                !selectedLearner ||
                !selectedLesson
              }
              onClick={handleProceedWithOffer} // Direct proceed since lesson is already selected
            >
              {offerDetail && offerDetail.id
                ? "Cập nhật đề xuất"
                : "Gửi đề xuất"}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleteCertificateDialogOpen}
        onClose={() => {
          setDeleteCertificateDialogOpen(false);
          setCertificateToDelete(null);
        }}
        onConfirm={confirmDeleteCertificate}
        title="Xác nhận xóa chứng chỉ"
        description={
          certificateToDelete
            ? `Bạn có chắc chắn muốn xóa chứng chỉ "${certificateToDelete.name}" không? Hành động này không thể hoàn tác.`
            : "Bạn có chắc chắn muốn xóa chứng chỉ này không? Hành động này không thể hoàn tác."
        }
        confirmText="Xóa"
        cancelText="Hủy"
        confirmColor="error"
      />

      <Dialog
        open={lessonSelectionDialogOpen}
        onClose={() => {
          setLessonSelectionDialogOpen(false);
          setSelectedLesson(null);
          setSelectedLearner(null);
          setLearnerLessonDetails(null);
          setBookingDetailDialogOpen(false);
        }}
        maxWidth={false} // Remove width constraint
        PaperProps={{
          sx: {
            width: "800px", // Set custom width
            maxWidth: "90vw", // Don't exceed 90% of viewport width
            minHeight: "400px", // Set minimum height
            maxHeight: "80vh", // Don't exceed 80% of viewport height
          },
        }}
        style={{ zIndex: 1500 }}
      >
        <DialogTitle>Chọn bài học cho đề xuất</DialogTitle>
        <DialogContent sx={{ minHeight: "400px" }}>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Vui lòng chọn bài học bạn muốn đề xuất cho học viên trước khi chọn
            khung giờ:
          </Typography>

          {lessonsLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
              <CircularProgress />
            </Box>
          ) : availableLessons.length === 0 ? (
            <Alert severity="warning">
              Bạn chưa có bài học nào. Vui lòng tạo bài học trước khi gửi đề
              xuất.
            </Alert>
          ) : (
            <Autocomplete
              options={availableLessons}
              getOptionLabel={(option) => option.name || ""}
              value={selectedLesson}
              onChange={(event, newValue) => {
                setSelectedLesson(newValue);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Chọn bài học"
                  variant="outlined"
                  fullWidth
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <Box>
                    <Typography variant="subtitle1">{option.name}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {formatLanguageCode(option.languageCode)}
                      {option.category && ` | ${option.category}`}
                      {" | "}
                      {typeof option.price === "number" ||
                      typeof option.price === "string"
                        ? formatPriceWithCommas(option.price)
                        : "Không có"}{" "}
                      VND
                    </Typography>
                  </Box>
                </Box>
              )}
              PopperComponent={(props) => (
                <div {...props} style={{ ...props.style, zIndex: 9999 }} />
              )}
            />
          )}

          {selectedLesson && (
            <Box sx={{ mt: 3, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: "bold", mb: 1 }}
              >
                Bài học đã chọn:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                {selectedLesson.name}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {formatLanguageCode(selectedLesson.languageCode)}
                {selectedLesson.category && ` | ${selectedLesson.category}`}
              </Typography>
              <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                {typeof selectedLesson.price === "number" ||
                typeof selectedLesson.price === "string"
                  ? formatPriceWithCommas(selectedLesson.price)
                  : "Không có"}{" "}
                VND
              </Typography>
              {selectedLesson.description && (
                <Typography variant="body2" sx={{ mt: 1, fontStyle: "italic" }}>
                  {selectedLesson.description}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setLessonSelectionDialogOpen(false);
              setSelectedLesson(null);
              setSelectedLearner(null); // Also clear selected learner
              setLearnerLessonDetails(null); // Clear learner lesson details
              // Also close the booking detail dialog if lesson selection is cancelled
              setBookingDetailDialogOpen(false);
            }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleLessonSelected} // Use new handler
            disabled={!selectedLesson || availableLessons.length === 0}
          >
            Tiếp tục chọn khung giờ
          </Button>
        </DialogActions>
      </Dialog>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      {/* Add the create pattern dialog before the closing tags */}
      <Dialog
        open={createPatternDialogOpen}
        onClose={() => setCreatePatternDialogOpen(false)}
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
            <Typography variant="h6">Tạo lịch trình tuần mới</Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {(() => {
                const startDate = new Date(createPatternWeekStart);
                const endDate = new Date(createPatternWeekStart);
                endDate.setDate(endDate.getDate() + 6);
                return formatDateRange(startDate, endDate);
              })()}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
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
                {getWeekDates(createPatternWeekStart).map((d, i) => (
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
                        const isSelected =
                          createPatternSlots[dayInWeek] &&
                          createPatternSlots[dayInWeek].has(slotIdx);

                        // Check if this slot is in the past
                        const isPastSlot = isSlotInPast(
                          createPatternWeekStart,
                          dayInWeek,
                          slotIdx
                        );

                        let bgColor = "#f1f5f9"; // Default background
                        let textColor = "inherit";
                        let fontWeight = 400;
                        let opacity = 1;
                        let cursor = "pointer";
                        let overlayPattern = {};

                        if (isPastSlot) {
                          // Past slots: show their status but muted and disabled
                          opacity = 0.7;
                          cursor = "not-allowed";

                          // Add diagonal stripe pattern for past slots
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
                                "repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.3) 2px, rgba(255,255,255,0.3) 4px)",
                              pointerEvents: "none",
                            },
                          };

                          // Apply muted versions of the original colors for past slots
                          if (isSelected) {
                            bgColor = "#b8e0a3"; // muted green for selected
                            textColor = "#fff";
                            fontWeight = 700;
                          } else {
                            bgColor = "#B8B8B8"; // muted gray for default
                            textColor = "#999";
                          }
                        } else {
                          // Only apply these styles if slot is NOT in the past
                          if (isSelected) {
                            bgColor = "#98D45F"; // green for selected
                            textColor = "#fff";
                            fontWeight = 700;
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
                              // Don't allow clicking on past slots
                              if (isPastSlot) return;

                              handleCreatePatternSlotClick(dayInWeek, slotIdx);
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
              {getSelectedSlotsCount() > 0 && (
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

                      <Divider sx={{ my: 2 }} />

                      <Box sx={{ maxHeight: 400, overflowY: "auto" }}>
                        <AnimatePresence>
                          {Object.entries(createPatternSlots).map(
                            ([dayInWeek, slotSet]) => {
                              return Array.from(slotSet).map(
                                (slotIndex, index) => {
                                  const slotInfo = formatSelectedSlot(
                                    Number(dayInWeek),
                                    slotIndex
                                  );

                                  return (
                                    <motion.div
                                      key={`${dayInWeek}-${slotIndex}`}
                                      initial={{
                                        opacity: 0,
                                        x: 30,
                                        scale: 0.95,
                                      }}
                                      animate={{
                                        opacity: 1,
                                        x: 0,
                                        scale: 1,
                                      }}
                                      exit={{
                                        opacity: 0,
                                        x: -30,
                                        scale: 0.95,
                                      }}
                                      transition={{
                                        type: "spring",
                                        stiffness: 400,
                                        damping: 25,
                                        delay: index * 0.1,
                                      }}
                                    >
                                      <Box
                                        sx={{
                                          p: 1.5,
                                          mb: 1,
                                          borderRadius: 1,
                                          backgroundColor: "#f8f9fa",
                                          border: "1px solid #e9ecef",
                                          display: "flex",
                                          justifyContent: "space-between",
                                          alignItems: "center",
                                        }}
                                      >
                                        <Box>
                                          <Typography
                                            variant="body2"
                                            sx={{ fontWeight: "medium" }}
                                          >
                                            {slotInfo.dayLabel}
                                          </Typography>
                                          <Typography
                                            variant="body2"
                                            color="textSecondary"
                                          >
                                            {slotInfo.date}
                                          </Typography>
                                          <Typography
                                            variant="body2"
                                            sx={{
                                              color: "#3b82f6",
                                              fontWeight: "medium",
                                            }}
                                          >
                                            {slotInfo.timeLabel}
                                          </Typography>
                                        </Box>
                                        <motion.div
                                          whileHover={{ scale: 1.1 }}
                                          whileTap={{ scale: 0.95 }}
                                        >
                                          <IconButton
                                            size="small"
                                            onClick={() =>
                                              handleCreatePatternSlotClick(
                                                Number(dayInWeek),
                                                slotIndex
                                              )
                                            }
                                            sx={{
                                              color: "#dc3545",
                                              "&:hover": {
                                                backgroundColor:
                                                  "rgba(220, 53, 69, 0.1)",
                                              },
                                            }}
                                          >
                                            <FiTrash2 size={16} />
                                          </IconButton>
                                        </motion.div>
                                      </Box>
                                    </motion.div>
                                  );
                                }
                              );
                            }
                          )}
                        </AnimatePresence>
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.3 }}
                      >
                        <Box sx={{ textAlign: "center" }}>
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            sx={{ mb: 1 }}
                          >
                            Tổng cộng: {getSelectedSlotsCount()} slot
                          </Typography>
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => {
                                setCreatePatternSlots({});
                              }}
                              sx={{
                                color: "#dc3545",
                                borderColor: "#dc3545",
                              }}
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
                  backgroundColor: "#98D45F", // green
                  mr: 1,
                }}
              />
              <Typography variant="body2" sx={{ color: "#4a7c1c" }}>
                Đã chọn
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  backgroundColor: "#f1f5f9", // light gray
                  mr: 1,
                }}
              />
              <Typography variant="body2" sx={{ color: "#64748b" }}>
                Chưa chọn
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  backgroundColor: "#d1d5db", // gray
                  mr: 1,
                  position: "relative",
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `
                      repeating-linear-gradient(45deg, transparent, transparent 1px, rgba(107, 114, 128, 0.3) 1px, rgba(107, 114, 128, 0.3) 2px),
                      repeating-linear-gradient(-45deg, transparent, transparent 1px, rgba(107, 114, 128, 0.3) 1px, rgba(107, 114, 128, 0.3) 2px)
                    `,
                  },
                }}
              />
              <Typography variant="body2" sx={{ color: "#6b7280" }}>
                Đã chặn
              </Typography>
            </Box>
          </Box>
          {/* Buttons */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              onClick={() => {
                setCreatePatternDialogOpen(false);
                setCreatePatternSlots({});
              }}
            >
              Hủy
            </Button>
            <Button
              variant="contained"
              color="primary"
              disabled={getSelectedSlotsCount() === 0 || createPatternLoading}
              onClick={handleCreateWeeklyPattern}
            >
              {createPatternLoading ? "Đang tạo..." : "Tạo lịch trình"}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Calendar Input Dialog */}
      <Dialog
        open={calendarInputDialogOpen}
        onClose={() => setCalendarInputDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Chọn ngày bắt đầu áp dụng</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Ngày bắt đầu áp dụng (phải là Thứ Hai)
          </Typography>
          <TextField
            label="Ngày bắt đầu áp dụng"
            type="date"
            fullWidth
            value={selectedAppliedFromDate}
            onChange={(e) => setSelectedAppliedFromDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCalendarInputDialogOpen(false)}>Hủy</Button>
          <Button 
            variant="contained" 
            onClick={handleCalendarInputConfirm} 
            disabled={!selectedAppliedFromDate}
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add the pattern detail dialog */}
      <Dialog
        open={patternDetailDialogOpen}
        onClose={handleClosePatternDetailDialog}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxHeight: "90vh",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
          },
        }}
      >
        <DialogTitle sx={{ pb: 1, borderBottom: "1px solid #e2e8f0" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: "bold", color: "#1e293b" }}>
                Chi tiết lịch trình tuần
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                Xem chi tiết các khung giờ có sẵn trong lịch trình này
              </Typography>
            </Box>
            <IconButton
              onClick={handleClosePatternDetailDialog}
              sx={{ 
                color: "#64748b",
                "&:hover": {
                  backgroundColor: "#f1f5f9",
                }
              }}
            >
              <FiX />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 2, pb: 0 }}>
          {patternDetailLoading ? (
            <PatternDetailCalendarSkeleton />
          ) : patternDetailError ? (
            <Alert severity="error" sx={{ mt: 2 }}>
              {patternDetailError}
            </Alert>
          ) : (
            renderPatternDetailCalendar()
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 2, pt: 1, borderTop: "1px solid #e2e8f0" }}>
          <Button
            onClick={handleClosePatternDetailDialog}
            variant="outlined"
            sx={{ 
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 500,
              px: 3,
              mr: 1
            }}
          >
            HỦY
          </Button>
          <Button
            onClick={handleClosePatternDetailDialog}
            variant="contained"
            sx={{ 
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 500,
              px: 3,
              backgroundColor: "#3b82f6",
              "&:hover": {
                backgroundColor: "#2563eb"
              }
            }}
          >
            ĐÓNG
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TutorProfile;
