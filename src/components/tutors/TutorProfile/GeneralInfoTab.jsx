import React from "react";
import {
  Box,
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
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { MdOutlineEditCalendar } from "react-icons/md";
import { styled } from "@mui/material/styles";
import { WeeklyScheduleSkeleton } from "./Skeletons";
import { timeRanges, daysOfWeek } from "./constants";
import { formatDateRange, formatDate } from "./utils";

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: "1.25rem",
  fontWeight: 600,
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(2),
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: "8px",
  textTransform: "none",
  fontWeight: 500,
  padding: "8px 16px",
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  "&:hover": {
    backgroundColor: theme.palette.primary.dark,
  },
}));

const GeneralInfoTab = ({
  tutorData,
  currentWeekStart,
  availabilityData,
  weeklyPatternLoading,
  learnerRequests,
  learnerRequestsLoading,
  learnerRequestsError,
  isOwner,
  handlePrevWeek,
  handleNextWeek,
  openEditPatternDialog,
  handleOpenBookingDetail,
}) => {
  const weekRange = React.useMemo(() => {
    const end = new Date(currentWeekStart);
    end.setDate(currentWeekStart.getDate() + 6);
    return formatDateRange(currentWeekStart, end);
  }, [currentWeekStart]);

  const weekDates = React.useMemo(() => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, [currentWeekStart]);

  return (
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
    >
      {/* Email Section */}
      <Box sx={{ textAlign: "left", width: "100%", maxWidth: "100%", mb: 4 }}>
        <SectionTitle variant="h6">Email</SectionTitle>
        <Typography
          variant="body1"
          sx={{
            color: "text.secondary",
            backgroundColor: "grey.100",
            padding: "12px 16px",
            borderRadius: "8px",
            fontFamily: "monospace",
          }}
        >
          {tutorData?.email || "Không có thông tin"}
        </Typography>
      </Box>

      {/* About Me Section */}
      <Box sx={{ textAlign: "left", width: "100%", maxWidth: "100%", mb: 4 }}>
        <SectionTitle variant="h6">Giới thiệu về tôi</SectionTitle>
        <Typography
          variant="body1"
          sx={{
            color: "text.secondary",
            lineHeight: 1.8,
            backgroundColor: "grey.50",
            padding: "16px",
            borderRadius: "8px",
            minHeight: "60px",
          }}
        >
          {tutorData?.aboutMe || "Chưa có thông tin giới thiệu"}
        </Typography>
      </Box>

      {/* Teaching Method Section */}
      <Box sx={{ textAlign: "left", width: "100%", maxWidth: "100%", mb: 4 }}>
        <SectionTitle variant="h6">Phương pháp giảng dạy</SectionTitle>
        <Typography
          variant="body1"
          sx={{
            color: "text.secondary",
            lineHeight: 1.8,
            backgroundColor: "grey.50",
            padding: "16px",
            borderRadius: "8px",
            minHeight: "40px",
          }}
        >
          {tutorData?.teachingMethodology || "Chưa có thông tin về phương pháp giảng dạy"}
        </Typography>
      </Box>

      {/* Schedule Section */}
      <Box sx={{ textAlign: "left", width: "100%", maxWidth: "100%", mb: 4 }}>
        <SectionTitle variant="h6">Lịch trình khả dụng</SectionTitle>
        
        {/* Week Navigation */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <IconButton onClick={handlePrevWeek} size="small">
            <FiChevronLeft />
          </IconButton>
          <Typography variant="h6" sx={{ minWidth: "200px", textAlign: "center" }}>
            {weekRange}
          </Typography>
          <IconButton onClick={handleNextWeek} size="small">
            <FiChevronRight />
          </IconButton>
          {isOwner && (
            <StyledButton
              startIcon={<MdOutlineEditCalendar />}
              onClick={openEditPatternDialog}
              size="small"
            >
              Chỉnh sửa
            </StyledButton>
          )}
        </Box>

        {/* Weekly Schedule Table */}
        {weeklyPatternLoading ? (
          <WeeklyScheduleSkeleton />
        ) : (
          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell width="12%" sx={{ fontWeight: "bold" }}>
                    Giờ
                  </TableCell>
                  {daysOfWeek.map((day, index) => (
                    <TableCell key={index} align="center" sx={{ fontWeight: "bold" }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                          {day}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(weekDates[index])}
                        </Typography>
                      </Box>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {timeRanges.map((time, timeIndex) => (
                  <TableRow key={timeIndex}>
                    <TableCell sx={{ fontWeight: "medium" }}>{time}</TableCell>
                    {availabilityData.map((dayData) => (
                      <TableCell key={dayData.dayInWeek} align="center">
                        {dayData.slots[timeIndex]?.isAvailable ? (
                          <Chip
                            size="small"
                            label="✓"
                            color="success"
                            variant="filled"
                            sx={{ minWidth: "24px", height: "24px" }}
                          />
                        ) : (
                          <Box sx={{ width: "24px", height: "24px" }} />
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Learner Requests Section */}
      {isOwner && (
        <Box sx={{ textAlign: "left", width: "100%", maxWidth: "100%", mb: 4 }}>
          <SectionTitle variant="h6">Yêu cầu từ học viên</SectionTitle>
          {learnerRequestsLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
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
                        onClick={() => handleOpenBookingDetail(req.learnerId)}
                      >
                        <TableCell>{req.learnerName}</TableCell>
                        <TableCell>
                          {req.hasUnviewed ? (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Chip
                                label="Có yêu cầu mới"
                                color="primary"
                                size="small"
                                sx={{ fontWeight: "bold" }}
                              />
                            </Box>
                          ) : (
                            <Chip
                              label="Đã xem"
                              color="default"
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          {req.latestRequestTime
                            ? new Date(req.latestRequestTime).toLocaleString("vi-VN")
                            : "Không có"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {/* FAQ Section */}
      <Box sx={{ textAlign: "left", width: "100%", maxWidth: "100%", mb: 4 }}>
        <SectionTitle variant="h6">Câu hỏi thường gặp</SectionTitle>
        <Accordion>
          <AccordionSummary>
            <Typography>Làm thế nào để đặt lịch học?</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              Bạn có thể đặt lịch học bằng cách chọn thời gian phù hợp trong lịch trình
              khả dụng của gia sư và gửi yêu cầu đặt lịch.
            </Typography>
          </AccordionDetails>
        </Accordion>
        
        <Accordion>
          <AccordionSummary>
            <Typography>Chính sách hủy lịch như thế nào?</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              Bạn có thể hủy lịch học trước 24 giờ mà không mất phí. Việc hủy trong
              vòng 24 giờ có thể bị tính phí theo quy định.
            </Typography>
          </AccordionDetails>
        </Accordion>
      </Box>
    </Box>
  );
};

export default GeneralInfoTab;
