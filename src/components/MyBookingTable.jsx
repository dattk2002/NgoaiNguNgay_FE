import React from "react";
import {
  Avatar,
  Typography,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Table as MuiTable,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Tooltip,
} from "@mui/material";
import { LuMessageCircleMore } from "react-icons/lu";
import { FiTrash2, FiXCircle, FiCheckCircle, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import {
  learnerBookingTimeSlotByTutorId,
  learnerBookingOfferDetail,
  acceptLearnerBookingOffer,
  rejectLearnerBookingOffer,
} from "./api/auth"; // add acceptLearnerBookingOffer
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Toast configuration
const toastConfig = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

function getWeekInfoForDialog(expectedStartDate = null, weekOffset = 0) {
  let baseDate;
  
  if (expectedStartDate) {
    // Use expectedStartDate as base and add week offset
    baseDate = new Date(expectedStartDate);
    baseDate.setDate(baseDate.getDate() + (weekOffset * 7));
  } else {
    // Fallback to current date with week offset
    baseDate = new Date();
    baseDate.setDate(baseDate.getDate() + (weekOffset * 7));
  }
  
  const day = baseDate.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(baseDate);
  monday.setDate(baseDate.getDate() + diff);

  const weekInfo = [];
  const dayLabels = [
    "Thứ 2",
    "Thứ 3",
    "Thứ 4",
    "Thứ 5",
    "Thứ 6",
    "Thứ 7",
    "CN",
  ];
  
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    weekInfo.push({
      label: dayLabels[i],
      date: d.getDate(),
      month: d.getMonth() + 1,
      year: d.getFullYear(),
      fullDate: new Date(d), // Store full date for comparison
    });
  }
  return weekInfo;
}

export default function MyBookingTable({
  sentRequests,
  loadingRequests,
  onMessageTutor,
  onDeleteRequest,
  onCreateDispute,
  selectedBookingId, // <-- new prop
}) {
  const navigate = useNavigate();

  // Dialog state
  const [bookingDetailDialogOpen, setBookingDetailDialogOpen] =
    React.useState(false);
  const [bookingDetailLoading, setBookingDetailLoading] = React.useState(false);
  const [bookingDetailSlots, setBookingDetailSlots] = React.useState([]);
  const [bookingDetailExpectedStartDate, setBookingDetailExpectedStartDate] =
    React.useState(""); // NEW
  const [selectedTutor, setSelectedTutor] = React.useState(null);
  const [offerDetail, setOfferDetail] = React.useState(null);
  const [tutorOfferedSlots, setTutorOfferedSlots] = React.useState([]);
  const [acceptingOffer, setAcceptingOffer] = React.useState(false);
  const [confirmAcceptOpen, setConfirmAcceptOpen] = React.useState(false);
  const [rejectingOffer, setRejectingOffer] = React.useState(false);
  const [confirmRejectOpen, setConfirmRejectOpen] = React.useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [isInsufficientFunds, setIsInsufficientFunds] = React.useState(false);
  const [currentWeekOffset, setCurrentWeekOffset] = React.useState(0); // 0 = current week, -1 = previous week, +1 = next week

  // Handler to open dialog and fetch booking detail
  const handleOpenBookingDetail = async (tutorId, tutorBookingOfferId) => {
    setBookingDetailLoading(true);
    setBookingDetailDialogOpen(true);
    setSelectedTutor(tutorId);
    setTutorOfferedSlots([]); // reset
    setCurrentWeekOffset(0); // reset to show the week containing expectedStartDate
    try {
      const res = await learnerBookingTimeSlotByTutorId(tutorId);
      // Support both { data: { ... } } and { ... }
      const detail = res?.data ? res.data : res;
      setBookingDetailSlots(
        Array.isArray(detail?.timeSlots) ? detail.timeSlots : []
      );
      setBookingDetailExpectedStartDate(detail?.expectedStartDate || "");

      // Navigate to /my-bookings/:id
      if (detail?.id) {
        navigate(`/my-bookings/${detail.id}`);
      }

      // If there is an offer, fetch its detail
      if (tutorBookingOfferId) {
        const offer = await learnerBookingOfferDetail(tutorBookingOfferId);
        setOfferDetail(offer);
        const offeredSlots = Array.isArray(offer?.offeredSlots) ? offer.offeredSlots : [];
        setTutorOfferedSlots(offeredSlots);
      }
    } catch (err) {
      setBookingDetailSlots([]);
      setBookingDetailExpectedStartDate("");
      setOfferDetail(null);
      setTutorOfferedSlots([]);
    } finally {
      setBookingDetailLoading(false);
    }
  };

  // Open dialog if selectedBookingId changes
  React.useEffect(() => {
    if (selectedBookingId) {
      // Find the tutorId for this bookingId
      const req = sentRequests.find(r => r.id === selectedBookingId);
      if (req) {
        handleOpenBookingDetail(req.tutorId, req.tutorBookingOfferId);
      }
    }
    // eslint-disable-next-line
  }, [selectedBookingId]);

  // Close dialog and navigate back
  const handleCloseDialog = () => {
    setBookingDetailDialogOpen(false);
    navigate("/my-bookings");
  };

  // Handle accepting offer
  const handleAcceptOffer = () => {
    setConfirmAcceptOpen(true);
  };

  const handleConfirmAccept = async () => {
    if (!offerDetail?.id) return;
    
    setAcceptingOffer(true);
    try {
      await acceptLearnerBookingOffer(offerDetail.id);
      toast.success("Đã chấp nhận đề xuất thành công!", toastConfig);
      handleCloseDialog();
      // Optionally refresh the data
      window.location.reload();
    } catch (error) {
      console.error("Error accepting offer:", error);
      
      // Check for specific error messages
      let message = "Không thể chấp nhận đề xuất. Vui lòng thử lại!";
      let isInsufficientFundsError = false;
      
      // Convert error to string for easier checking
      const errorString = JSON.stringify(error).toLowerCase();
      const errorMessage = error.message ? error.message.toLowerCase() : "";
      const detailMessage = error.details?.errorMessage ? error.details.errorMessage.toLowerCase() : "";
      
      // Check for insufficient funds in various formats
      if (errorString.includes("insufficient funds") || 
          errorString.includes("không đủ tiền") ||
          errorString.includes("not enough") ||
          errorMessage.includes("insufficient funds") || 
          detailMessage.includes("insufficient funds")) {
        message = "Không đủ tiền trong ví, vui lòng nạp thêm tiền để tiếp tục!";
        isInsufficientFundsError = true;
      } else if (errorString.includes("wallet") || errorMessage.includes("wallet")) {
        message = "Có lỗi với ví của bạn, vui lòng kiểm tra lại!";
      } else if (errorString.includes("balance") || errorMessage.includes("balance")) {
        message = "Số dư trong ví không đủ, vui lòng nạp thêm tiền!";
        isInsufficientFundsError = true;
      }
      
      setErrorMessage(message);
      setIsInsufficientFunds(isInsufficientFundsError);
      setErrorDialogOpen(true);
    } finally {
      setAcceptingOffer(false);
      setConfirmAcceptOpen(false);
    }
  };

  // Handle rejecting offer
  const handleRejectOffer = () => {
    setConfirmRejectOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!offerDetail?.id) return;
    
    setRejectingOffer(true);
    try {
      await rejectLearnerBookingOffer(offerDetail.id);
      toast.success("Đã từ chối đề xuất thành công!", toastConfig);
      handleCloseDialog();
      // Optionally refresh the data
      window.location.reload();
    } catch (error) {
      console.error("Error rejecting offer:", error);
      
      // Check for specific error messages
      let message = "Không thể từ chối đề xuất. Vui lòng thử lại!";
      
      // Check if offer is expired
      const errorString = JSON.stringify(error).toLowerCase();
      const errorMessage = error.message ? error.message.toLowerCase() : "";
      const detailMessage = error.details?.errorMessage ? error.details.errorMessage.toLowerCase() : "";
      
      if (errorString.includes("expired") || 
          errorMessage.includes("expired") || 
          detailMessage.includes("expired")) {
        message = "Đề xuất đã hết hạn, không thể từ chối!";
      } else if (errorString.includes("already rejected") || 
                 errorMessage.includes("already rejected") || 
                 detailMessage.includes("already rejected")) {
        message = "Đề xuất đã được từ chối trước đó!";
      }
      
      setErrorMessage(message);
      setErrorDialogOpen(true);
    } finally {
      setRejectingOffer(false);
      setConfirmRejectOpen(false);
    }
  };

  const handleGoToWallet = () => {
    setErrorDialogOpen(false);
    navigate("/wallet");
  };

  // Week navigation handlers
  const handlePreviousWeek = () => {
    setCurrentWeekOffset(prev => prev - 1);
  };

  const handleNextWeek = () => {
    setCurrentWeekOffset(prev => prev + 1);
  };

  const getCurrentWeekInfo = () => {
    return getWeekInfoForDialog(bookingDetailExpectedStartDate, currentWeekOffset);
  };

  const getWeekDisplayText = () => {
    const weekInfo = getCurrentWeekInfo();
    if (weekInfo.length > 0) {
      const firstDay = weekInfo[0];
      const lastDay = weekInfo[6];
      return `${firstDay.date}/${firstDay.month} - ${lastDay.date}/${lastDay.month}/${lastDay.year}`;
    }
    return "";
  };

  return (
    <>
      <div className="flex flex-col items-center w-full">
        {/* Heading OUTSIDE the card */}

        <div className="overflow-x-auto rounded-lg shadow-md max-w-[1500px] w-[100%]">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Ảnh gia sư
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Tên gia sư
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Thời gian gửi yêu cầu
                </th>
                {/* NEW COLUMN */}
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Thông tin đề xuất
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loadingRequests ? (
                [...Array(5)].map((_, idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Skeleton variant="circular" width={44} height={44} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Skeleton variant="text" width={120} height={28} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Skeleton variant="text" width={160} height={28} />
                    </td>
                    {/* NEW SKELETON CELL */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Skeleton variant="text" width={100} height={28} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Skeleton variant="text" width={120} height={28} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Skeleton variant="rectangular" width={60} height={28} />
                    </td>
                  </tr>
                ))
              ) : sentRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} align="center" className="py-8">
                    <div className="flex flex-col items-center justify-center">
                      <svg
                        width="64"
                        height="64"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        className="text-gray-300 mb-2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      <span className="text-gray-400 text-sm">
                        Không có yêu cầu nào.
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                sentRequests.map((req, idx) => (
                  <tr
                    key={req.tutorId}
                    className={
                      (idx % 2 === 0
                        ? "bg-white hover:bg-blue-50 transition-colors duration-150"
                        : "bg-gray-50 hover:bg-blue-50 transition-colors duration-150") +
                      " cursor-pointer"
                    }
                    onClick={() =>
                      handleOpenBookingDetail(
                        req.tutorId,
                        req.tutorBookingOfferId
                      )
                    }
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Avatar
                        src={req.tutorAvatarUrl}
                        alt={req.tutorName}
                        sx={{
                          width: 44,
                          height: 44,
                          border: "2px solid #e0e7ef",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                        }}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Typography className="text-[#333333] font-medium">
                        {req.tutorName}
                      </Typography>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Typography className="text-gray-700">
                        {new Date(req.latestRequestTime).toLocaleString()}
                      </Typography>
                    </td>
                    {/* STATUS CELL - NO FLEX */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1">
                        {req.tutorBookingOfferId ? (
                          <>
                            <FiCheckCircle className="text-green-500" />
                            <span className="text-green-600 font-medium">
                              Đã được đề xuất
                            </span>
                          </>
                        ) : (
                          <>
                            <FiXCircle className="text-red-500" />
                            <span className="text-red-600 font-medium">
                              Chưa được đề xuất
                            </span>
                          </>
                        )}
                      </span>
                    </td>
                    {/* OFFER INFO CELL */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {req.tutorBookingOfferId ? (
                        <div className="text-sm">
                          <div className="text-gray-600">Có đề xuất mới</div>
                          <div className="text-xs text-blue-600 font-medium">
                            Nhấp để xem chi tiết
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-400">
                          Chưa có đề xuất
                        </div>
                      )}
                    </td>
                    {/* ACTIONS CELL - NO FLEX */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onMessageTutor(req.tutorId);
                          }}
                          title="Nhắn tin với gia sư"
                          className="text-blue-500 hover:text-blue-700 focus:outline-none"
                          style={{
                            fontSize: 22,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <LuMessageCircleMore />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteRequest(req.tutorId);
                          }}
                          title="Xóa yêu cầu"
                          className="text-red-500 hover:text-red-700 focus:outline-none"
                          style={{
                            fontSize: 22,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <FiTrash2 />
                        </button>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Detail Dialog */}
      {bookingDetailDialogOpen && (
        <Dialog
          open={bookingDetailDialogOpen}
          onClose={handleCloseDialog}
          maxWidth="xl"
          fullWidth
          PaperProps={{ sx: { minWidth: 1100 } }}
        >
          <DialogTitle>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pr: 2 }}>
              <Box>
                <Typography variant="h6" component="div">
                  Chi tiết khung giờ đã đặt{" "}
                  {selectedTutor &&
                    `- Gia sư: ${
                      sentRequests.find((t) => t.tutorId === selectedTutor)
                        ?.tutorName || ""
                    }`}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Tooltip title="Tuần trước">
                  <Button
                    onClick={handlePreviousWeek}
                    variant="outlined"
                    size="small"
                    sx={{ minWidth: "40px", px: 1 }}
                  >
                    <FiChevronLeft />
                  </Button>
                </Tooltip>
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="body2" sx={{ minWidth: "120px", fontWeight: 600 }}>
                    {getWeekDisplayText()}
                  </Typography>
                </Box>
                <Tooltip title="Tuần sau">
                  <Button
                    onClick={handleNextWeek}
                    variant="outlined"
                    size="small"
                    sx={{ minWidth: "40px", px: 1 }}
                  >
                    <FiChevronRight />
                  </Button>
                </Tooltip>
              </Box>
            </Box>
          </DialogTitle>
          <DialogContent>
            {/* Show expectedStartDate if available */}
            {bookingDetailExpectedStartDate && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="primary">
                  Ngày bắt đầu dự kiến:{" "}
                  {new Date(bookingDetailExpectedStartDate).toLocaleString()}
                </Typography>
              </Box>
            )}
            
            {/* Show offer details if available */}
            {offerDetail && (
              <Paper sx={{ p: 2, mb: 3, backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                <Typography variant="h6" sx={{ mb: 2, color: "#1976d2", fontWeight: 600 }}>
                  Thông tin đề xuất từ gia sư
                </Typography>
                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 2 }}>
                  {offerDetail.lessonName && (
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#374151" }}>
                        Tên bài học:
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#6b7280" }}>
                        {offerDetail.lessonName}
                      </Typography>
                    </Box>
                  )}
                  {offerDetail.pricePerSlot && (
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#374151" }}>
                        Giá mỗi slot:
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#10b981", fontWeight: 600 }}>
                        {offerDetail.pricePerSlot?.toLocaleString()} VND
                      </Typography>
                    </Box>
                  )}
                  {offerDetail.totalPrice && (
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#374151" }}>
                        Tổng giá:
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#dc2626", fontWeight: 600 }}>
                        {offerDetail.totalPrice?.toLocaleString()} VND
                      </Typography>
                    </Box>
                  )}
                  {offerDetail.slotCount && (
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#374151" }}>
                        Số lượng slot:
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#6b7280" }}>
                        {offerDetail.slotCount} slots
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Paper>
            )}
            {bookingDetailLoading ? (
              <MuiTable>
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
                          <Skeleton
                            variant="rectangular"
                            width="80%"
                            height={24}
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </MuiTable>
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
                  <Box sx={{ p: 1.5, fontWeight: 600, textAlign: "center" }}>
                    Thời gian
                  </Box>
                  {(() => {
                    // Use current week info based on expectedStartDate and offset
                    const weekInfo = getCurrentWeekInfo();
                    return weekInfo.map((d, i) => (
                      <Box
                        key={i}
                        sx={{ p: 1.5, fontWeight: 600, textAlign: "center" }}
                      >
                        <div style={{ fontSize: 14 }}>{d.label}</div>
                        <div style={{ fontSize: 13, color: "#64748b" }}>
                          {d.date}/{d.month}
                        </div>
                      </Box>
                    ));
                  })()}
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
                    const dayInWeekOrder = [2, 3, 4, 5, 6, 7, 1];
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
                          const weekInfo = getCurrentWeekInfo();
                          const currentDayInfo = weekInfo[dayIdx];
                          
                          // Check if this slot is booked - only show when viewing the expected week (offset = 0)
                          const isBooked =
                            currentWeekOffset === 0 &&
                            Array.isArray(bookingDetailSlots) &&
                            bookingDetailSlots.some(
                              (slot) =>
                                slot.dayInWeek === dayInWeek &&
                                slot.slotIndex === slotIdx
                                                        );

                          const isOffered =
                            Array.isArray(tutorOfferedSlots) &&
                            tutorOfferedSlots.some((slot) => {
                              if (!slot.slotDateTime || slot.slotIndex === undefined) return false;
                              
                              // Parse the slot date from API (UTC)
                              const slotDate = new Date(slot.slotDateTime);
                              
                              // Get UTC date parts to avoid timezone issues
                              const slotYear = slotDate.getUTCFullYear();
                              const slotMonth = slotDate.getUTCMonth() + 1; // getUTCMonth() returns 0-11, we need 1-12
                              const slotDay = slotDate.getUTCDate();
                              
                              // Check if this slot matches the current cell
                              const dateMatches = (
                                slotYear === currentDayInfo.year &&
                                slotMonth === currentDayInfo.month &&
                                slotDay === currentDayInfo.date
                              );
                              
                              const slotIndexMatches = slot.slotIndex === slotIdx;
                              
                              const isMatching = dateMatches && slotIndexMatches;
                              
                              return isMatching;
                            });

                          let bgColor = "#f1f5f9";
                          let color = "#333";
                          let fontWeight = 400;
                          if (isBooked && isOffered) {
                            bgColor = "#a259e6"; // purple
                            color = "#333";
                            fontWeight = 700;
                          } else if (isBooked) {
                            bgColor = "#FFD700"; // yellow
                            color = "#333";
                            fontWeight = 700;
                          } else if (isOffered) {
                            bgColor = "#3b82f6"; // blue
                            color = "#fff";
                            fontWeight = 700;
                          }

                          return (
                            <Box
                              key={dayIdx}
                              sx={{
                                backgroundColor: bgColor,
                                border: "1px solid #e2e8f0",
                                minHeight: 32,
                                textAlign: "center",
                                color,
                                fontWeight,
                                fontSize: 14,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              {/* No text */}
                            </Box>
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
              px: 3,
              pb: 2,
              width: "100%", // Ensure full width for spacing
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
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
                    backgroundColor: "#3b82f6",
                    mr: 1,
                  }}
                />
                <Typography variant="body2" sx={{ color: "#3b82f6" }}>
                  Đề xuất của gia sư
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
            <Box sx={{ display: "flex", gap: 2 }}>
              {offerDetail && (
                <>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={handleAcceptOffer}
                    disabled={acceptingOffer || rejectingOffer}
                    sx={{ 
                      bgcolor: "#10b981", 
                      "&:hover": { bgcolor: "#059669" },
                      fontWeight: 600
                    }}
                  >
                    {acceptingOffer ? "Đang xử lý..." : "Chấp nhận đề xuất"}
                  </Button>
                  <Tooltip 
                    title={offerDetail?.isExpired ? "Đề xuất đã hết hạn, không thể từ chối" : ""}
                    placement="top"
                  >
                    <span>
                      <Button 
                        variant="contained" 
                        color="error" 
                        onClick={handleRejectOffer}
                        disabled={acceptingOffer || rejectingOffer || offerDetail?.isExpired}
                        sx={{ 
                          bgcolor: "#dc2626", 
                          "&:hover": { bgcolor: "#b91c1c" },
                          fontWeight: 600
                        }}
                      >
                        {rejectingOffer ? "Đang xử lý..." : offerDetail?.isExpired ? "Đã hết hạn" : "Từ chối đề xuất"}
                      </Button>
                    </span>
                  </Tooltip>
                </>
              )}
              <Button onClick={handleCloseDialog} variant="outlined">
                Đóng
              </Button>
            </Box>
          </DialogActions>
        </Dialog>
      )}

      {/* Confirm Accept Offer Dialog */}
      <Dialog open={confirmAcceptOpen} onClose={() => setConfirmAcceptOpen(false)}>
        <DialogTitle>Xác nhận chấp nhận đề xuất</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn chấp nhận đề xuất này không?
          </Typography>
          {offerDetail && (
            <Box sx={{ mt: 2, p: 2, backgroundColor: "#f8fafc", borderRadius: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Thông tin đề xuất:
              </Typography>
              {offerDetail.lessonName && (
                <Typography variant="body2">
                  • Bài học: {offerDetail.lessonName}
                </Typography>
              )}
              {offerDetail.totalPrice && (
                <Typography variant="body2" sx={{ color: "#dc2626", fontWeight: 600 }}>
                  • Tổng giá: {offerDetail.totalPrice?.toLocaleString()} VND
                </Typography>
              )}
              {offerDetail.slotCount && (
                <Typography variant="body2">
                  • Số slots: {offerDetail.slotCount}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmAcceptOpen(false)} disabled={acceptingOffer}>
            Hủy
          </Button>
          <Button 
            onClick={handleConfirmAccept} 
            variant="contained"
            disabled={acceptingOffer}
            sx={{ 
              bgcolor: "#10b981", 
              "&:hover": { bgcolor: "#059669" }
            }}
          >
            {acceptingOffer ? "Đang xử lý..." : "Chấp nhận"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Reject Offer Dialog */}
      <Dialog open={confirmRejectOpen} onClose={() => setConfirmRejectOpen(false)}>
        <DialogTitle>Xác nhận từ chối đề xuất</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn từ chối đề xuất này không?
          </Typography>
          {offerDetail?.isExpired && (
            <Box sx={{ mt: 2, p: 2, backgroundColor: "#fef2f2", borderRadius: 1, border: "1px solid #fecaca" }}>
              <Typography variant="body2" sx={{ color: "#dc2626", fontWeight: 600 }}>
                ⚠️ Lưu ý: Đề xuất này đã hết hạn
              </Typography>
            </Box>
          )}
          {offerDetail && (
            <Box sx={{ mt: 2, p: 2, backgroundColor: "#fef2f2", borderRadius: 1, border: "1px solid #fecaca" }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#dc2626" }}>
                Thông tin đề xuất:
              </Typography>
              {offerDetail.lessonName && (
                <Typography variant="body2">
                  • Bài học: {offerDetail.lessonName}
                </Typography>
              )}
              {offerDetail.totalPrice && (
                <Typography variant="body2" sx={{ color: "#dc2626", fontWeight: 600 }}>
                  • Tổng giá: {offerDetail.totalPrice?.toLocaleString()} VND
                </Typography>
              )}
              {offerDetail.slotCount && (
                <Typography variant="body2">
                  • Số slots: {offerDetail.slotCount}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmRejectOpen(false)} disabled={rejectingOffer}>
            Hủy
          </Button>
          <Button 
            onClick={handleConfirmReject} 
            variant="contained"
            disabled={rejectingOffer}
            sx={{ 
              bgcolor: "#dc2626", 
              "&:hover": { bgcolor: "#b91c1c" }
            }}
          >
            {rejectingOffer ? "Đang xử lý..." : "Từ chối"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error Dialog */}
      <Dialog open={errorDialogOpen} onClose={() => setErrorDialogOpen(false)}>
        <DialogTitle sx={{ color: "#dc2626", fontWeight: 600 }}>
          {isInsufficientFunds ? "Không đủ tiền trong ví" : "Lỗi"}
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            {errorMessage}
          </Typography>
          {isInsufficientFunds && offerDetail && (
            <Box sx={{ p: 2, backgroundColor: "#fef2f2", borderRadius: 1, border: "1px solid #fecaca" }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#dc2626", mb: 1 }}>
                Chi tiết giao dịch:
              </Typography>
              <Typography variant="body2" sx={{ color: "#7f1d1d" }}>
                • Tổng số tiền cần thanh toán: {offerDetail.totalPrice?.toLocaleString()} VND
              </Typography>
              <Typography variant="body2" sx={{ color: "#7f1d1d" }}>
                • Bài học: {offerDetail.lessonName}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setErrorDialogOpen(false)} color="inherit">
            Đóng
          </Button>
          {isInsufficientFunds && (
            <Button 
              onClick={handleGoToWallet} 
              variant="contained"
              sx={{ 
                bgcolor: "#10b981", 
                "&:hover": { bgcolor: "#059669" },
                fontWeight: 600
              }}
            >
              Nạp tiền vào ví
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Toast Container */}
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
    </>
  );
}
