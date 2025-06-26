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
} from "@mui/material";
import { FiPlusCircle, FiEdit, FiTrash2 } from "react-icons/fi";
import { MdOutlineEditCalendar } from "react-icons/md";

import { styled } from "@mui/material/styles";
import {
  getAccessToken,
  fetchTutorLesson,
  createLesson,
  updateLesson,
  deleteLesson,
} from "../../components/api/auth";
import { formatLanguageCode } from "../../utils/formatLanguageCode";
import ConfirmDeleteLessonModal from "../modals/ConfirmDeleteLessonModal";

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

                      {timeSlots && timeSlots.length > 0 ? (
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
                          <TableContainer>
                            <Table>
                              <TableHead>
                                <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                                  <TableCell
                                    sx={{
                                      fontWeight: 700,
                                      color: "#1e293b",
                                      fontSize: "1rem",
                                      py: 2,
                                    }}
                                  >
                                    Ngày
                                  </TableCell>
                                  <TableCell
                                    sx={{
                                      fontWeight: 700,
                                      color: "#1e293b",
                                      fontSize: "1rem",
                                      py: 2,
                                    }}
                                  >
                                    Thời gian
                                  </TableCell>
                                  <TableCell
                                    sx={{
                                      fontWeight: 700,
                                      color: "#1e293b",
                                      fontSize: "1rem",
                                      py: 2,
                                    }}
                                  >
                                    Trạng thái
                                  </TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {timeSlots.map((slot, index) => (
                                  <TableRow
                                    key={index}
                                    sx={{
                                      "&:hover": {
                                        backgroundColor: "#f8fafc",
                                      },
                                    }}
                                  >
                                    <TableCell sx={{ py: 2.5 }}>
                                      <Typography
                                        variant="body1"
                                        sx={{
                                          fontWeight: 600,
                                          color: "#334155",
                                        }}
                                      >
                                        {slot.dayOfWeek === "MONDAY"
                                          ? "Thứ Hai"
                                          : slot.dayOfWeek === "TUESDAY"
                                          ? "Thứ Ba"
                                          : slot.dayOfWeek === "WEDNESDAY"
                                          ? "Thứ Tư"
                                          : slot.dayOfWeek === "THURSDAY"
                                          ? "Thứ Năm"
                                          : slot.dayOfWeek === "FRIDAY"
                                          ? "Thứ Sáu"
                                          : slot.dayOfWeek === "SATURDAY"
                                          ? "Thứ Bảy"
                                          : slot.dayOfWeek === "SUNDAY"
                                          ? "Chủ Nhật"
                                          : slot.dayOfWeek}
                                      </Typography>
                                    </TableCell>
                                    <TableCell sx={{ py: 2.5 }}>
                                      <Typography
                                        variant="body1"
                                        sx={{ color: "#475569" }}
                                      >
                                        {`${slot.startTime} - ${slot.endTime}`}
                                      </Typography>
                                    </TableCell>
                                    <TableCell sx={{ py: 2.5 }}>
                                      <StyledChip
                                        label={
                                          slot.isAvailable
                                            ? "Có sẵn"
                                            : "Không có sẵn"
                                        }
                                        color={
                                          slot.isAvailable ? "success" : "error"
                                        }
                                      />
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Box>
                      ) : (
                        <Alert
                          severity="info"
                          sx={{
                            mt: 2,
                            borderRadius: "12px",
                            backgroundColor: "#f0f9ff",
                            border: "1px solid #bae6fd",
                          }}
                        >
                          Gia sư này chưa đặt lịch trình khả dụng của họ.
                        </Alert>
                      )}
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
                                  <TableCell>{lesson.languageCode}</TableCell>
                                  <TableCell>
                                    {lesson.price} {lesson.currency}
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
          />
          <TextField
            label="Mô tả"
            fullWidth
            margin="normal"
            value={lessonForm.description}
            onChange={(e) =>
              setLessonForm({ ...lessonForm, description: e.target.value })
            }
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
          />
          <TextField
            label="Yêu cầu trước"
            fullWidth
            margin="normal"
            value={lessonForm.prerequisites}
            onChange={(e) =>
              setLessonForm({ ...lessonForm, prerequisites: e.target.value })
            }
          />
          <TextField
            label="Ngôn ngữ"
            fullWidth
            margin="normal"
            value={lessonForm.languageCode}
            onChange={(e) =>
              setLessonForm({ ...lessonForm, languageCode: e.target.value })
            }
          />
          <TextField
            label="Danh mục"
            fullWidth
            margin="normal"
            value={lessonForm.category}
            onChange={(e) =>
              setLessonForm({ ...lessonForm, category: e.target.value })
            }
          />
          <TextField
            label="Giá"
            type="number"
            fullWidth
            margin="normal"
            value={lessonForm.price}
            onChange={(e) =>
              setLessonForm({ ...lessonForm, price: e.target.value })
            }
          />
          <TextField
            label="Tiền tệ"
            fullWidth
            margin="normal"
            value={lessonForm.currency}
            onChange={(e) =>
              setLessonForm({ ...lessonForm, currency: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLessonDialogOpen(false)}>Hủy</Button>
          <Button
            variant="contained"
            onClick={async () => {
              setLessonLoading(true);
              try {
                if (editLesson) {
                  await updateLesson(editLesson.id, lessonForm);
                  setLessons(
                    lessons.map((l) =>
                      l.id === editLesson.id ? { ...l, ...lessonForm } : l
                    )
                  );
                } else {
                  const res = await createLesson(lessonForm);
                  setLessons([...lessons, res.data]);
                }
                setLessonDialogOpen(false);
              } catch (err) {
                alert("Lưu bài học thất bại: " + err.message);
              } finally {
                setLessonLoading(false);
              }
            }}
            disabled={lessonLoading}
          >
            {editLesson ? "Lưu thay đổi" : "Tạo mới"}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDeleteLessonModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        lessonName={lessonToDelete?.name}
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
      />
    </>
  );
};

export default TutorProfile;
