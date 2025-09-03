import React, { useState, useEffect } from 'react';
import { FaEnvelope } from 'react-icons/fa';
import { 
  Skeleton, 
  Box, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Typography,
  Avatar,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  CircularProgress,
  TextField,
  Autocomplete
} from '@mui/material';
import { FiPlusCircle, FiCheck, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  tutorBookingTimeSlotFromLearner, 
  tutorBookingTimeSlotFromLearnerDetail,
  fetchTutorLesson,
  fetchTutorLessonDetailById,
  createTutorBookingOffer,
  getStoredUser,
  getAllTutorBookingOffer,
  updateTutorBookingOfferByOfferId
} from '../../components/api/auth';
import { formatLanguageCode } from '../../utils/formatLanguageCode';
import formatPriceWithCommas from '../../utils/formatPriceWithCommas';
import { FaCheck } from 'react-icons/fa';

const StudentRequests = () => {
  const [learnerRequests, setLearnerRequests] = useState([]);
  const [learnerRequestsLoading, setLearnerRequestsLoading] = useState(false);
  const [learnerRequestsError, setLearnerRequestsError] = useState(null);

  // Dialog states
  const [bookingDetailDialogOpen, setBookingDetailDialogOpen] = useState(false);
  const [lessonSelectionDialogOpen, setLessonSelectionDialogOpen] = useState(false);
  const [bookingDetailLoading, setBookingDetailLoading] = useState(false);
  const [lessonsLoading, setLessonsLoading] = useState(false);

  // Selected data states
  const [selectedLearner, setSelectedLearner] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [learnerLessonDetails, setLearnerLessonDetails] = useState(null);
  const [availableLessons, setAvailableLessons] = useState([]);

  // Booking detail states
  const [bookingDetailSlots, setBookingDetailSlots] = useState([]);
  const [temporarilySelectedSlots, setTemporarilySelectedSlots] = useState([]);
  const [dialogWeekStart, setDialogWeekStart] = useState(new Date());
  const [offerDetail, setOfferDetail] = useState(null);
  const [allOffers, setAllOffers] = useState([]);

  // Week navigation
  const dayInWeekOrder = [2, 3, 4, 5, 6, 7, 1]; // API: 2=Mon, ..., 7=Sat, 1=Sun
  const dialogWeekInfo = dayInWeekOrder.map((dayInWeek) => {
    const date = new Date(dialogWeekStart);
    // Calculate day offset: dayInWeek 2=Mon, ..., 7=Sat, 1=Sun
    let dayOffset = dayInWeek - 2;
    if (dayInWeek === 1) dayOffset = 6; // Sunday
    date.setDate(date.getDate() + dayOffset);
    const labels = ['', 'CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    return {
      label: labels[dayInWeek],
      date: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
    };
  });

  // Utility functions
  const getWeekRange = (date = new Date()) => {
    const current = new Date(date);
    const day = current.getDay();
    const diff = current.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(current.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return { monday };
  };

  const formatDateRange = (start, end) => {
    return `${start.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })} - ${end.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}`;
  };

  const getSlotDateTime = (weekStart, dayInWeek, slotIndex) => {
    const date = new Date(weekStart);
    // Calculate day offset: dayInWeek 2=Mon, ..., 7=Sat, 1=Sun
    let dayOffset = dayInWeek - 2;
    if (dayInWeek === 1) dayOffset = 6; // Sunday
    date.setDate(date.getDate() + dayOffset);
    const hour = Math.floor(slotIndex / 2);
    const minute = slotIndex % 2 === 0 ? 0 : 30;
    date.setHours(hour, minute, 0, 0);
    return date.toISOString();
  };

  const getTemporarySlotsKey = (learnerId) => {
    return `temp_slots_${learnerId}`;
  };

  const saveTemporarySlots = (learnerId, slots) => {
    const key = getTemporarySlotsKey(learnerId);
    localStorage.setItem(key, JSON.stringify(slots));
  };

  const loadTemporarySlots = (learnerId) => {
    const key = getTemporarySlotsKey(learnerId);
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  };

  const clearTemporarySlots = (learnerId) => {
    const key = getTemporarySlotsKey(learnerId);
    localStorage.removeItem(key);
  };

  // Check if slot is in the past
  const isSlotInPast = (weekStart, dayInWeek, slotIndex) => {
    const slotDateTime = getSlotDateTime(weekStart, dayInWeek, slotIndex);
    const now = new Date();
    return new Date(slotDateTime) < now;
  };

  // Get nearest offer for learner
  const getNearestOfferIdForLearner = (learnerId) => {
    const learnerOffers = allOffers.filter(offer => offer.learnerId === learnerId);
    if (learnerOffers.length === 0) return null;
    
    // Sort by creation time, newest first
    learnerOffers.sort((a, b) => new Date(b.createdTime) - new Date(a.createdTime));
    return learnerOffers[0].id;
  };

  // Dialog navigation handlers
  const handleDialogPrevWeek = () => {
    const newWeekStart = new Date(dialogWeekStart);
    newWeekStart.setDate(newWeekStart.getDate() - 7);
    setDialogWeekStart(newWeekStart);
  };

  const handleDialogNextWeek = () => {
    const newWeekStart = new Date(dialogWeekStart);
    newWeekStart.setDate(newWeekStart.getDate() + 7);
    setDialogWeekStart(newWeekStart);
  };

  // Slot click handler
  const handleSlotClick = (dayInWeek, slotIdx) => {
    // Don't allow selection of past slots
    if (isSlotInPast(dialogWeekStart, dayInWeek, slotIdx)) {
      return;
    }

    // Create a unique identifier for this slot including week information
    const slotDateTime = getSlotDateTime(dialogWeekStart, dayInWeek, slotIdx);
    const slotId = `${slotDateTime}_${dayInWeek}_${slotIdx}`;

    const isSelected = temporarilySelectedSlots.some(
      (slot) => slot.slotId === slotId
    );

    let newSelectedSlots;
    if (isSelected) {
      newSelectedSlots = temporarilySelectedSlots.filter(
        (slot) => slot.slotId !== slotId
      );
    } else {
      newSelectedSlots = [...temporarilySelectedSlots, { 
        dayInWeek, 
        slotIndex: slotIdx, 
        slotId,
        weekStart: dialogWeekStart.toISOString(),
        slotDateTime: slotDateTime
      }];
    }

    setTemporarilySelectedSlots(newSelectedSlots);
    
    if (selectedLearner) {
      saveTemporarySlots(selectedLearner.learnerId, newSelectedSlots);
    }
  };

  // Fetch all offers
  const fetchAllOffers = async () => {
    try {
      const response = await getAllTutorBookingOffer();
      setAllOffers(response?.data || []);
    } catch (error) {
      console.error("Failed to fetch offers:", error);
      setAllOffers([]);
      toast.error("Lỗi khi tải danh sách đề xuất");
    }
  };

  // Fetch tutor lessons
  const fetchTutorLessons = async () => {
    setLessonsLoading(true);
    try {
      const user = getStoredUser();
      if (!user || !user.id) {
        throw new Error("Không tìm thấy thông tin người dùng");
      }
      const lessons = await fetchTutorLesson(user.id);
      if (lessons && Array.isArray(lessons)) {
        setAvailableLessons(lessons);
      } else {
        setAvailableLessons([]);
      }
    } catch (error) {
      console.error("Failed to fetch tutor lessons:", error);
      setAvailableLessons([]);
      toast.error("Lỗi khi tải danh sách bài học");
    } finally {
      setLessonsLoading(false);
    }
  };

  // Handle opening booking detail
  const handleOpenBookingDetail = async (learnerId) => {
    const learner = learnerRequests.find((req) => req.learnerId === learnerId);
    setSelectedLearner(learner);

    setBookingDetailLoading(true);
    setBookingDetailDialogOpen(true);

    try {
      const res = await tutorBookingTimeSlotFromLearnerDetail(learner.learnerId);
      const { expectedStartDate, timeSlots, lessonId } = res?.data || {};

      if (lessonId) {
        try {
          const lessonDetails = await fetchTutorLessonDetailById(lessonId);
          setLearnerLessonDetails(lessonDetails);
        } catch (lessonError) {
          console.error("Failed to fetch learner's lesson details:", lessonError);
          setLearnerLessonDetails(null);
          toast.warning("Không thể tải thông tin bài học của học viên");
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
      setOfferDetail(null);

      const tempSlots = loadTemporarySlots(learner.learnerId);
      setTemporarilySelectedSlots(tempSlots);

      setLearnerRequests((prev) =>
        prev.map((req) =>
          req.learnerId === learner.learnerId
            ? { ...req, hasUnviewed: false }
            : req
        )
      );

      // Fetch offers and lessons
      await Promise.all([fetchAllOffers(), fetchTutorLessons()]);
      
      // Set offer detail if exists
      const nearestOfferId = getNearestOfferIdForLearner(learner.learnerId);
      if (nearestOfferId) {
        try {
          const offerResponse = await getAllTutorBookingOffer();
          const offer = offerResponse?.data?.find(o => o.id === nearestOfferId);
          setOfferDetail(offer);
        } catch (error) {
          console.error("Failed to fetch offer detail:", error);
          toast.warning("Không thể tải thông tin đề xuất hiện tại");
        }
      }

      setLessonSelectionDialogOpen(true);
    } catch (err) {
      setBookingDetailSlots([]);
      setLearnerLessonDetails(null);
    } finally {
      setBookingDetailLoading(false);
    }
  };

  const handleLessonSelected = async () => {
    if (!selectedLesson || !selectedLearner) {
      return;
    }
    setLessonSelectionDialogOpen(false);
  };

  const handleSubmitOffer = async () => {
    if (!selectedLesson || !selectedLearner || temporarilySelectedSlots.length === 0) {
      return;
    }

    try {
      const offeredSlots = temporarilySelectedSlots.map((slot) => {
        const slotDateTime = new Date(slot.slotDateTime);
        return {
          slotDateTime,
          slotIndex: slot.slotIndex,
        };
      });

      const offerData = {
        learnerId: selectedLearner.learnerId,
        lessonId: selectedLesson.id,
        offeredSlots: offeredSlots
      };

      if (offerDetail && offerDetail.id) {
        // Update existing offer
        await updateTutorBookingOfferByOfferId(offerDetail.id, {
          lessonId: selectedLesson.id,
          offeredSlots: offeredSlots
        });
      } else {
        // Create new offer
        await createTutorBookingOffer(offerData);
      }
      
      // Clear temporary slots
      if (selectedLearner) {
        clearTemporarySlots(selectedLearner.learnerId);
      }
      
      // Close dialogs and reset state
      setBookingDetailDialogOpen(false);
      setLessonSelectionDialogOpen(false);
      setSelectedLesson(null);
      setSelectedLearner(null);
      setLearnerLessonDetails(null);
      setTemporarilySelectedSlots([]);
      
      // Refresh data
      await Promise.all([
        tutorBookingTimeSlotFromLearner().then(res => setLearnerRequests(res?.data || [])),
        fetchAllOffers()
      ]);
      
      toast.success("Đã gửi đề xuất thành công! Học viên sẽ nhận được thông báo về đề xuất của bạn.");
    } catch (error) {
      console.error("Failed to submit offer:", error);
      toast.error("Lỗi khi gửi đề xuất: " + (error.message || "Không thể gửi đề xuất. Vui lòng thử lại sau."));
    }
  };

  // Fetch learner requests from API
  useEffect(() => {
    const fetchLearnerRequests = async () => {
      setLearnerRequestsLoading(true);
      setLearnerRequestsError(null);
      try {
        const res = await tutorBookingTimeSlotFromLearner();
        setLearnerRequests(res?.data || []);
      } catch (err) {
        setLearnerRequestsError(
          err.message || "Lỗi khi tải yêu cầu từ học viên"
        );
      } finally {
        setLearnerRequestsLoading(false);
      }
    };
    fetchLearnerRequests();
  }, []);

  if (learnerRequestsLoading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Yêu cầu từ học viên</h2>
        </div>
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      </div>
    );
  }

  if (learnerRequestsError) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Yêu cầu từ học viên</h2>
        </div>
        <Alert severity="error">{learnerRequestsError}</Alert>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Yêu cầu từ học viên</h2>
        <Button
          variant="outlined"
          onClick={async () => {
            setLearnerRequestsLoading(true);
            try {
              const res = await tutorBookingTimeSlotFromLearner();
              setLearnerRequests(res?.data || []);
            } catch (error) {
              console.error("Failed to refresh learner requests:", error);
              toast.error("Lỗi khi làm mới danh sách yêu cầu");
            } finally {
              setLearnerRequestsLoading(false);
            }
          }}
          disabled={learnerRequestsLoading}
        >
          Làm mới
        </Button>
      </div>

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
                <TableCell colSpan={3} align="center">
                  <div className="text-center py-8">
                    <FaEnvelope className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Không có yêu cầu nào</h3>
                    <p className="text-gray-500">Bạn chưa có yêu cầu học nào từ học viên.</p>
                    <p className="text-sm text-gray-400 mt-2">Khi có học viên gửi yêu cầu, chúng sẽ xuất hiện ở đây.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              learnerRequests.map((req) => (
                <TableRow
                  key={req.learnerId}
                  hover
                  sx={{ 
                    cursor: "pointer",
                    "&:hover": {
                      backgroundColor: "rgba(25, 118, 210, 0.04)"
                    }
                  }}
                  onClick={() => handleOpenBookingDetail(req.learnerId)}
                >
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {req.learnerName}
                    </Typography>
                  </TableCell>
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
                      ? new Date(req.latestRequestTime).toLocaleString("vi-VN", {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : "-"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Booking Detail Dialog */}
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
                    {learnerLessonDetails.name}
                  </Typography>
                )}
                {learnerLessonDetails.price && (
                  <Typography
                    variant="body2"
                    color="primary"
                    sx={{ fontWeight: 500 }}
                  >
                    Giá: {formatPriceWithCommas(learnerLessonDetails.price)}{" "}
                    VNĐ/slot
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
            <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
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
                          const slotDateTime = getSlotDateTime(dialogWeekStart, dayInWeek, slotIdx);
                          const slotId = `${slotDateTime}_${dayInWeek}_${slotIdx}`;
                          const isSelected = temporarilySelectedSlots.some(
                            (slot) => slot.slotId === slotId
                          );
                          const isOffered = offerDetail?.offeredSlots?.some(
                            (slot) => {
                              const date = new Date(slot.slotDateTime);
                              let jsDay = date.getDay();
                              let apiDayInWeek = jsDay === 0 ? 1 : jsDay + 1;

                              const weekStart = new Date(dialogWeekStart);
                              weekStart.setHours(0, 0, 0, 0);
                              const slotDate = new Date(slot.slotDateTime);
                              slotDate.setHours(0, 0, 0, 0);

                              return (
                                apiDayInWeek === dayInWeek &&
                                slotDate.getTime() === weekStart.getTime() &&
                                slot.slotIndex === slotIdx
                              );
                            }
                          );
                          const isPast = isSlotInPast(dialogWeekStart, dayInWeek, slotIdx);

                          let backgroundColor = "#ffffff";
                          let color = "#333";
                          let fontWeight = 400;
                          let cursor = "pointer";
                          let opacity = 1;
                          let backgroundImage = "none";

                          if (isPast) {
                            backgroundColor = "#ffffff";
                            color = "#999";
                            cursor = "not-allowed";
                            opacity = 1;
                            backgroundImage = "repeating-linear-gradient(45deg, transparent, transparent 2px, #b0b0b0 2px, #b0b0b0 4px)";
                          } else if (isRequested && isOffered) {
                            backgroundColor = "#a259e6"; // purple
                            color = "#fff";
                            fontWeight = 700;
                          } else if (isRequested && isSelected) {
                            backgroundColor = "#98D45F"; // dark green - học viên đã đặt và đang chọn
                            color = "#fff";
                            fontWeight = 700;
                          } else if (isRequested) {
                            backgroundColor = "#FFD700"; // yellow - học viên đã đặt
                            color = "#333";
                            fontWeight = 700;
                          } else if (isOffered) {
                            backgroundColor = "#98D45F"; // light green - gia sư đã đề xuất
                            color = "#333";
                            fontWeight = 700;
                          } else if (isSelected) {
                            backgroundColor = "#98D45F"; // blue - đang chọn mới
                            color = "#fff";
                            fontWeight = 700;
                          }

                          return (
                            <Box
                              key={dayIdx}
                              sx={{
                                backgroundColor,
                                backgroundImage,
                                border: "1px solid #e2e8f0",
                                minHeight: 32,
                                textAlign: "center",
                                color,
                                fontWeight,
                                fontSize: 14,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor,
                                opacity,
                                "&:hover": {
                                  backgroundColor: isPast
                                    ? backgroundColor
                                    : isOffered
                                    ? backgroundColor
                                    : isSelected
                                    ? backgroundColor
                                    : isRequested
                                    ? backgroundColor
                                    : "#e2e8f0",
                                },
                              }}
                              onClick={() => {
                                if (!isPast && !isOffered) {
                                  handleSlotClick(dayInWeek, slotIdx);
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

              {/* Right side - Summary */}
              <Box sx={{ width: 300, p: 2, borderLeft: "1px solid #e2e8f0" }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Tóm tắt
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                    Khung giờ đã chọn:
                  </Typography>
                  {temporarilySelectedSlots.length === 0 ? (
                    <Typography variant="body2" color="textSecondary">
                      Chưa chọn khung giờ nào
                    </Typography>
                  ) : (
                    <Box>
                      {temporarilySelectedSlots.map((slot, index) => {
                        const slotDateTime = new Date(slot.slotDateTime);
                        const hour = Math.floor(slot.slotIndex / 2);
                        const minute = slot.slotIndex % 2 === 0 ? "00" : "30";
                        const nextHour = slot.slotIndex % 2 === 0 ? hour : hour + 1;
                        const nextMinute = slot.slotIndex % 2 === 0 ? "30" : "00";
                        
                        return (
                          <Box key={index} sx={{ mb: 1, p: 1, bgcolor: "#f5f5f5", borderRadius: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                              {slotDateTime.toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit" })}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {hour.toString().padStart(2, "0")}:{minute} - {nextHour.toString().padStart(2, "0")}:{nextMinute}
                            </Typography>
                          </Box>
                        );
                      })}
                    </Box>
                  )}
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                    Tổng số khung giờ: {temporarilySelectedSlots.length}
                  </Typography>
                  {selectedLesson && (
                    <Typography variant="body2" color="textSecondary">
                      Tổng giá: {formatPriceWithCommas(selectedLesson.price * temporarilySelectedSlots.length)} VND
                    </Typography>
                  )}
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  disabled={temporarilySelectedSlots.length === 0 || !selectedLesson}
                  onClick={handleSubmitOffer}
                >
                  Gửi đề xuất
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
        
        {/* Legend */}
        <Box sx={{ 
          p: 2, 
          borderTop: "1px solid #e2e8f0", 
          backgroundColor: "#f8f9fa",
          display: "flex",
          gap: 3,
          flexWrap: "wrap"
        }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: "#FFD700",
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
                backgroundColor: "#98D45F",
                mr: 1,
              }}
            />
            <Typography variant="body2" sx={{ color: "#98D45F" }}>
              Đề xuất của gia sư (chọn mới)
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: "#3b82f6",
                mr: 1,
              }}
            />
            <Typography variant="body2" sx={{ color: "#3b82f6" }}>
              Gia sư đã đề xuất trước đó 
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: "#a259e6",
                mr: 1,
              }}
            />
            <Typography variant="body2" sx={{ color: "#a259e6" }}>
              Học viên đã đặt + Gia sư đã đề xuất
            </Typography>
          </Box>
        </Box>
      </Dialog>

      {/* Lesson Selection Dialog */}
      <Dialog
        open={lessonSelectionDialogOpen}
        onClose={() => {
          setLessonSelectionDialogOpen(false);
          setSelectedLesson(null);
          setSelectedLearner(null);
          setLearnerLessonDetails(null);
          setBookingDetailDialogOpen(false);
        }}
        maxWidth={false}
        PaperProps={{
          sx: {
            width: '1200px',
            maxWidth: '120vw',
            minHeight: '400px',
            maxHeight: '80vh',
          }
        }}
        style={{ zIndex: 1500 }}
      >
        <DialogTitle>Chọn bài học cho đề xuất</DialogTitle>
        <DialogContent sx={{ minHeight: '400px' }}>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            Vui lòng chọn bài học bạn muốn đề xuất cho học viên trước khi chọn khung giờ:
          </Typography>

          {lessonsLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : availableLessons.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Alert severity="warning" sx={{ mb: 3 }}>
                Bạn chưa có bài học nào. Vui lòng tạo bài học trước khi gửi đề xuất.
              </Alert>
              <Button 
                variant="contained" 
                color="primary"
                size="large"
                onClick={() => {
                  window.location.href = '/tutor-management';
                }}
              >
                Tạo bài học mới
              </Button>
            </Box>
          ) : (
            <Box sx={{ maxHeight: 350, overflowY: "auto", pr: 1 }}>
              {availableLessons.map((lesson) => (
                <Box
                  key={lesson.id}
                  sx={{
                    p: 3,
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
                          mb: 1.5,
                          color: selectedLesson?.id === lesson.id ? "#1976d2" : "#1a1a1a",
                          fontSize: "1.1rem"
                        }}
                      >
                        {lesson.name}
                      </Typography>
                      
                      <Box sx={{ display: "flex", alignItems: "center", mb: 1.5, gap: 1 }}>
                        <Box
                          sx={{
                            px: 1.5,
                            py: 0.5,
                            bgcolor: "#e3f2fd",
                            borderRadius: 2,
                            border: "1px solid #bbdefb"
                          }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 600, color: "#1976d2", fontSize: "0.875rem" }}>
                            {formatLanguageCode(lesson.languageCode)}
                          </Typography>
                        </Box>
                        {lesson.category && (
                          <Box
                            sx={{
                              px: 1.5,
                              py: 0.5,
                              bgcolor: "#f3e5f5",
                              borderRadius: 2,
                              border: "1px solid #e1bee7"
                            }}
                          >
                            <Typography variant="body2" sx={{ fontWeight: 600, color: "#7b1fa2", fontSize: "0.875rem" }}>
                              {lesson.category}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                      
                      {lesson.description && (
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            mb: 2, 
                            fontStyle: "italic", 
                            color: "#666",
                            lineHeight: 1.5,
                            fontSize: "0.9rem"
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
                          fontSize: "1.5rem",
                          mb: 0.5
                        }}
                      >
                        {typeof lesson.price === "number" ||
                        typeof lesson.price === "string"
                          ? formatPriceWithCommas(lesson.price)
                          : "0"}{" "}
                        <Typography component="span" variant="body2" sx={{ fontWeight: 400, fontSize: "0.875rem" }}>
                          VND
                        </Typography>
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ fontSize: "0.8rem" }}>
                        / slot
                      </Typography>
                    </Box>
                  </Box>
                  
                  {selectedLesson?.id === lesson.id && (
                    <Box 
                      sx={{ 
                        display: "flex", 
                        alignItems: "center", 
                        mt: 2,
                        pt: 2,
                        borderTop: "1px solid #e3f2fd"
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          px: 2,
                          py: 1,
                          bgcolor: "#e8f5e8",
                          borderRadius: 2,
                          border: "1px solid #c8e6c9"
                        }}
                      >
                        <FiCheck size={16} color="#2e7d32" />
                        <Typography variant="body2" color="#2e7d32" sx={{ ml: 1, fontWeight: 600 }}>
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
            <Box sx={{ 
              mt: 4, 
              p: 3, 
              bgcolor: "#f8fbff", 
              borderRadius: 3,
              border: "2px solid #e3f2fd"
            }}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 700, mb: 2, color: "#1976d2" }}
              >
                ✓ Bài học đã chọn
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5, color: "#1a1a1a" }}>
                {selectedLesson.name}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 1 }}>
                <Box
                  sx={{
                    px: 1.5,
                    py: 0.5,
                    bgcolor: "#e3f2fd",
                    borderRadius: 2,
                    border: "1px solid #bbdefb"
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "#1976d2" }}>
                    {formatLanguageCode(selectedLesson.languageCode)}
                  </Typography>
                </Box>
                {selectedLesson.category && (
                  <Box
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      bgcolor: "#f3e5f5",
                      borderRadius: 2,
                      border: "1px solid #e1bee7"
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "#7b1fa2" }}>
                      {selectedLesson.category}
                    </Typography>
                  </Box>
                )}
              </Box>
              <Typography variant="h5" color="primary" sx={{ fontWeight: 800, mb: 1 }}>
                {typeof selectedLesson.price === "number" ||
                typeof selectedLesson.price === "string"
                  ? formatPriceWithCommas(selectedLesson.price)
                  : "0"}{" "}
                <Typography component="span" variant="body2" sx={{ fontWeight: 400 }}>
                  VNĐ/slot
                </Typography>
              </Typography>
              {selectedLesson.description && (
                <Typography variant="body2" sx={{ mt: 2, fontStyle: "italic", color: "#666", lineHeight: 1.5 }}>
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
              setSelectedLearner(null);
              setLearnerLessonDetails(null);
              setBookingDetailDialogOpen(false);
            }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleLessonSelected}
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
    </div>
  );
};

export default StudentRequests; 