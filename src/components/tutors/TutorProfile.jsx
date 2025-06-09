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
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { getAccessToken } from "../../components/api/auth";
import { formatLanguageCode } from "../../utils/formatLanguageCode";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  backgroundColor: "#f0f7ff",
  color: "#333333",
  fontWeight: 500,
  margin: theme.spacing(0.5),
  borderRadius: "4px",
  height: "32px",
  "&.MuiChip-colorSuccess": {
    backgroundColor: "#dcfce7",
    color: "#166534",
  },
  "&.MuiChip-colorError": {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
  },
  "&.MuiChip-colorWarning": {
    backgroundColor: "#fff7ed",
    color: "#9a3412",
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#1a56db",
  color: "#ffffff",
  "&:hover": {
    backgroundColor: "#1e429f",
  },
  "&.MuiButton-outlined": {
    backgroundColor: "transparent",
    color: "#1a56db",
    borderColor: "#1a56db",
    "&:hover": {
      backgroundColor: "#f0f4ff",
    },
  },
}));

const LargeAvatar = styled(Avatar)(({ theme }) => ({
  width: theme.spacing(18),
  height: theme.spacing(18),
  margin: "0 auto 16px",
  border: "4px solid white",
  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
  fontSize: "3.5rem",
  backgroundColor: "#c4c4c4",
  color: "white",
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  position: "relative",
  paddingBottom: theme.spacing(1.5),
  marginBottom: theme.spacing(2),
  fontWeight: 600,
  color: "#333333",
  "&:after": {
    content: '""',
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "40px",
    height: "3px",
    backgroundColor: theme.palette.primary.main,
  },
}));

const VerificationBadge = styled(Box)(({ status, theme }) => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(0.5, 1.5),
  borderRadius: "16px",
  fontSize: "0.875rem",
  fontWeight: 600,
  ...(status === 0 && {
    backgroundColor: "#fff7ed",
    color: "#9a3412",
  }),
  ...(status === 1 && {
    backgroundColor: "#f0f7ff",
    color: "#1e429f",
  }),
  ...(status === 2 && {
    backgroundColor: "#dcfce7",
    color: "#166534",
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
            toast.error('Kích thước ảnh phải nhỏ hơn 2MB');
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Chỉ chấp nhận các tệp ảnh');
            return;
        }

        const previewUrl = URL.createObjectURL(file);

        setFormData(prev => ({
            ...prev,
            profilePhoto: file,
            profilePhotoPreview: previewUrl
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
    <Container
      maxWidth="lg"
      sx={{ py: 4, backgroundColor: "#f8fafc", minHeight: "100vh" }}
    >
      <Grid container spacing={4}>
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
                variant="h5"
                sx={{
                  mt: 2,
                  fontWeight: 600,
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
                    variant="body2"
                    sx={{
                      mt: 0.5,
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
                  mt: 2,
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: verificationInfo.color,
                    fontWeight: 500,
                  }}
                >
                  {verificationInfo.label}
                </Typography>
              </Box>
            </Box>
          </StyledPaper>
        </Grid>

        {/* Right Column - Tabs */}
        <Grid item xs={12} md={8}>
          <StyledPaper sx={{ p: 0 }}>
            <Box
              sx={{
                borderBottom: 1,
                borderColor: "divider",
                width: "100%",
              }}
            >
              <Tabs
                value={selectedTab}
                onChange={handleTabChange}
                aria-label="tutor profile tabs"
                variant="fullWidth"
              >
                <Tab label="Thông tin chung" />
                <Tab label="Kỹ năng & Ngôn ngữ" />
              </Tabs>
            </Box>
            <Box sx={{ p: 3, width: "100%" }}>
              {selectedTab === 0 && (
                <Box
                  sx={{ width: "100%" }}
                  role="tabpanel"
                  hidden={selectedTab !== 0}
                >
                  {/* Content for Tab 1: Email, Giới thiệu về tôi, Phương pháp giảng dạy, Lịch trình khả dụng, Câu hỏi thường gặp */}
                  <Box sx={{ textAlign: "left", width: "100%", mb: 3 }}>
                    <SectionTitle variant="h6">Email</SectionTitle>
                    <Typography
                      variant="body2"
                      sx={{ color: "#64748b", wordBreak: "break-word" }}
                    >
                      {tutorData.email}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <SectionTitle variant="h6">Giới thiệu về tôi</SectionTitle>
                    {tutorData.brief && (
                      <Typography
                        variant="body1"
                        sx={{
                          mb: 3,
                          fontWeight: 500,
                          color: "#334155",
                          fontStyle: "italic",
                        }}
                      >
                        "{tutorData.brief}"
                      </Typography>
                    )}

                    <Typography
                      variant="body1"
                      sx={{ whiteSpace: "pre-line", color: "#334155" }}
                    >
                      {tutorData.description ||
                        "Không có mô tả nào được cung cấp."}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <SectionTitle variant="h6">
                      Phương pháp giảng dạy
                    </SectionTitle>
                    <Typography
                      variant="body1"
                      sx={{ whiteSpace: "pre-line", color: "#334155" }}
                    >
                      {tutorData.teachingMethod ||
                        "Không có thông tin phương pháp giảng dạy nào được cung cấp."}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <SectionTitle variant="h6">
                      Lịch trình khả dụng
                    </SectionTitle>

                    {timeSlots && timeSlots.length > 0 ? (
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell
                                sx={{ fontWeight: 600, color: "#334155" }}
                              >
                                Ngày
                              </TableCell>
                              <TableCell
                                sx={{ fontWeight: 600, color: "#334155" }}
                              >
                                Thời gian
                              </TableCell>
                              <TableCell
                                sx={{ fontWeight: 600, color: "#334155" }}
                              >
                                Trạng thái
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {timeSlots.map((slot, index) => (
                              <TableRow key={index}>
                                <TableCell>
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
                                </TableCell>
                                <TableCell>{`${slot.startTime} - ${slot.endTime}`}</TableCell>
                                <TableCell>
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
                    ) : (
                      <Alert severity="info" sx={{ mt: 2 }}>
                        Gia sư này chưa đặt lịch trình khả dụng của họ.
                      </Alert>
                    )}
                  </Box>

                  <Box>
                    <SectionTitle variant="h6">Câu hỏi thường gặp</SectionTitle>

                    <Accordion
                      sx={{
                        mb: 2,
                        boxShadow: "none",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px !important",
                      }}
                    >
                      <AccordionSummary
                        expandIcon={"▼"}
                        sx={{ borderRadius: "8px" }}
                      >
                        <Typography sx={{ fontWeight: 500 }}>
                          Làm cách nào để đặt lịch học với gia sư này?
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body2" color="text.secondary">
                          Bạn có thể đặt lịch học bằng cách nhấp vào nút "Đặt
                          lịch buổi học" trên hồ sơ của gia sư. Chọn một khung
                          thời gian có sẵn từ lịch trình của gia sư và xác nhận
                          việc đặt lịch của bạn.
                        </Typography>
                      </AccordionDetails>
                    </Accordion>

                    <Accordion
                      sx={{
                        mb: 2,
                        boxShadow: "none",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px !important",
                      }}
                    >
                      <AccordionSummary
                        expandIcon={"▼"}
                        sx={{ borderRadius: "8px" }}
                      >
                        <Typography sx={{ fontWeight: 500 }}>
                          Những phương thức thanh toán nào được chấp nhận?
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body2" color="text.secondary">
                          Chúng tôi chấp nhận thẻ tín dụng/ghi nợ, PayPal và
                          chuyển khoản ngân hàng. Tất cả các giao dịch đều được
                          bảo mật và mã hóa.
                        </Typography>
                      </AccordionDetails>
                    </Accordion>

                    <Accordion
                      sx={{
                        boxShadow: "none",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px !important",
                      }}
                    >
                      <AccordionSummary
                        expandIcon={"▼"}
                        sx={{ borderRadius: "8px" }}
                      >
                        <Typography sx={{ fontWeight: 500 }}>
                          Chính sách hủy bỏ là gì?
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body2" color="text.secondary">
                          Bạn có thể hủy hoặc đổi lịch học lên đến 24 giờ trước
                          thời gian đã đặt mà không bị phạt. Việc hủy muộn có
                          thể dẫn đến việc tính phí một phần.
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  </Box>
                </Box>
              )}

              {selectedTab === 1 && (
                <Box
                  sx={{ width: "1150px" }}
                  role="tabpanel"
                  hidden={selectedTab !== 1}
                >
                  {/* Content for Tab 2: Ngôn ngữ giảng dạy, Chứng chỉ & Kỹ năng */}
                  <Box sx={{ textAlign: "left", width: "100%", mb: 3 }}>
                    <SectionTitle variant="h6">Tải lên chứng chỉ</SectionTitle>
                  <div className="flex items-center justify-center w-[1100px]">
                    <label className="flex flex-col w-full h-32 border-2 border-blue-200 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg
                          className="w-10 h-10 text-blue-500 mb-3"
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
                          ></path>
                        </svg>
                        <p className="mb-2 text-sm text-blue-500">
                          <span className="font-semibold">Nhấp để tải lên</span>{" "}
                          hoặc kéo và thả
                        </p>
                        <p className="text-xs text-gray-500">
                          PDF (Tối đa 25MB)
                        </p>
                      </div>
                      <input
                        type="file"
                        name="profilePhoto"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                        required
                      />
                    </label>
                  </div>
                
                </Box>
                  <Box sx={{ textAlign: "left", width: "100%", mb: 3 }}>
                    <SectionTitle variant="h6">Ngôn ngữ giảng dạy</SectionTitle>
                    {tutorData.languages && tutorData.languages.length > 0 ? (
                      tutorData.languages.map((lang, index) => (
                        <Box
                          key={index}
                          sx={{
                            mb: 2,
                            p: 2,
                            backgroundColor: "#f8fafc",
                            borderRadius: "8px",
                            border: "1px solid #e2e8f0",
                            width: "1100px",
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Typography
                              variant="body1"
                              sx={{
                                fontWeight: 600,
                                color: "#334155",
                              }}
                            >
                              {getLanguageName(lang.languageCode)}
                            </Typography>
                            {lang.isPrimary && (
                              <Chip
                                label="Chính"
                                size="small"
                                sx={{
                                  height: "20px",
                                  fontSize: "0.625rem",
                                  backgroundColor: "#dbeafe",
                                  color: "#1e40af",
                                  fontWeight: 600,
                                }}
                              />
                            )}
                          </Box>
                          <Box
                            sx={{
                              mt: 2,
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <Rating
                              value={lang.proficiency}
                              max={7}
                              readOnly
                              size="small"
                              sx={{
                                mr: 1,
                                "& .MuiRating-iconFilled": {
                                  color: "#f59e0b",
                                },
                              }}
                            />
                            <Typography
                              variant="body2"
                              sx={{ color: "#64748b" }}
                            >
                              {getProficiencyLabel(lang.proficiency)}
                            </Typography>
                          </Box>
                        </Box>
                      ))
                    ) : (
                      <Typography
                        variant="body2"
                        sx={{ color: "#64748b", fontStyle: "italic" }}
                      >
                        Không có thông tin ngôn ngữ
                      </Typography>
                    )}
                  </Box>

                  <Box>
                    <SectionTitle variant="h6">
                      Chứng chỉ & Kỹ năng
                    </SectionTitle>
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "8px",
                        mt: 2,
                      }}
                    >
                      {tutorData.hashtags && tutorData.hashtags.length > 0 ? (
                        tutorData.hashtags.map((tag) => (
                          <Chip
                            key={tag.id}
                            label={tag.name}
                            title={tag.description}
                            sx={{
                              backgroundColor: "#f1f5f9",
                              color: "#0f172a",
                              borderRadius: "4px",
                              height: "32px",
                              fontWeight: 500,
                              border: "1px solid #e2e8f0",
                            }}
                          />
                        ))
                      ) : (
                        <Typography
                          variant="body2"
                          sx={{ color: "#64748b", fontStyle: "italic" }}
                        >
                          Không có chứng chỉ nào được liệt kê
                        </Typography>
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
  );
};

export default TutorProfile;
