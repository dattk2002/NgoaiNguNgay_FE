import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Alert,
  CircularProgress,
} from "@mui/material";
import { FiChevronLeft, FiChevronRight, FiX } from "react-icons/fi";
import { styled } from "@mui/material/styles";
import { BookingDetailSkeleton } from "./Skeletons";
import { timeRanges, daysOfWeek, statusOptions } from "./constants";
import { formatDate } from "./utils";

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: "8px",
  textTransform: "none",
  fontWeight: 500,
  padding: "8px 16px",
}));

const BookingDetailDialog = ({
  open,
  onClose,
  selectedLearner,
  dialogWeekStart,
  onPrevWeek,
  onNextWeek,
  selectedOfferSlots,
  temporarilySelectedSlots,
  availabilityData,
  bookingDetailLoading,
  onSlotClick,
  onProceedWithOffer,
  onClearSlots,
}) => {
  const weekDates = React.useMemo(() => {
    if (!dialogWeekStart) return [];
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(dialogWeekStart);
      date.setDate(dialogWeekStart.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, [dialogWeekStart]);

  const weekRange = React.useMemo(() => {
    if (!dialogWeekStart) return "";
    const end = new Date(dialogWeekStart);
    end.setDate(dialogWeekStart.getDate() + 6);
    return `${dialogWeekStart.toLocaleDateString("vi-VN")} - ${end.toLocaleDateString("vi-VN")}`;
  }, [dialogWeekStart]);

  const getSlotDisplay = (dayInWeek, slotIndex) => {
    // Check if slot is in selected offer slots
    const isInOffer = selectedOfferSlots.some(
      slot => slot.dayInWeek === dayInWeek && slot.slotIndex === slotIndex
    );
    
    // Check if slot is temporarily selected
    const isTemporarilySelected = temporarilySelectedSlots.some(
      slot => slot.dayInWeek === dayInWeek && slot.slotIndex === slotIndex
    );
    
    // Check if slot is available
    const dayData = availabilityData.find(d => d.dayInWeek === dayInWeek);
    const isAvailable = dayData?.slots[slotIndex]?.isAvailable;

    if (isInOffer) {
      return (
        <Chip
          size="small"
          label="Đã chọn"
          sx={{
            backgroundColor: "#2196f3",
            color: "white",
            minWidth: "70px",
            height: "28px",
            fontSize: "0.75rem"
          }}
        />
      );
    }
    
    if (isTemporarilySelected) {
      return (
        <Chip
          size="small"
          label="Chọn mới"
          sx={{
            backgroundColor: "#ff9800",
            color: "white",
            minWidth: "70px",
            height: "28px",
            fontSize: "0.75rem",
            cursor: "pointer"
          }}
          onClick={() => onSlotClick(dayInWeek, slotIndex)}
        />
      );
    }
    
    if (isAvailable) {
      return (
        <Chip
          size="small"
          label="Có thể chọn"
          variant="outlined"
          sx={{
            borderColor: "#4caf50",
            color: "#4caf50",
            minWidth: "70px",
            height: "28px",
            fontSize: "0.75rem",
            cursor: "pointer",
            "&:hover": {
              backgroundColor: "#4caf50",
              color: "white"
            }
          }}
          onClick={() => onSlotClick(dayInWeek, slotIndex)}
        />
      );
    }
    
    return <Box sx={{ width: "70px", height: "28px" }} />;
  };

  const getStatusColor = (status) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    return statusOption?.color || 'default';
  };

  const getStatusLabel = (status) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    return statusOption?.label || status;
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "16px",
          maxHeight: "90vh"
        }
      }}
    >
      <DialogTitle sx={{ pb: 1, position: "relative" }}>
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Chi tiết yêu cầu từ {selectedLearner?.learnerName}
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
          }}
        >
          <FiX />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        {bookingDetailLoading ? (
          <BookingDetailSkeleton />
        ) : (
          <Box>
            {/* Learner Info */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Email:</strong> {selectedLearner?.learnerEmail}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Số điện thoại:</strong> {selectedLearner?.learnerPhoneNumber || "Chưa có"}
              </Typography>
            </Box>

            {/* Current Selected Slots */}
            {selectedOfferSlots.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
                  Các slot đã được đề xuất:
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {selectedOfferSlots.map((slot, index) => (
                    <Chip
                      key={index}
                      label={`${daysOfWeek[slot.dayInWeek]} - ${timeRanges[slot.slotIndex]} (${getStatusLabel(slot.status)})`}
                      color={getStatusColor(slot.status)}
                      size="small"
                      sx={{ mb: 1 }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* Week Navigation */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
              <IconButton onClick={onPrevWeek} size="small">
                <FiChevronLeft />
              </IconButton>
              <Typography variant="h6" sx={{ minWidth: "200px", textAlign: "center" }}>
                {weekRange}
              </Typography>
              <IconButton onClick={onNextWeek} size="small">
                <FiChevronRight />
              </IconButton>
            </Box>

            {/* Schedule Table */}
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
                            {weekDates[index] && formatDate(weekDates[index])}
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
                      {Array.from({ length: 7 }, (_, dayInWeek) => (
                        <TableCell key={dayInWeek} align="center">
                          {getSlotDisplay(dayInWeek, timeIndex)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Instructions */}
            <Alert severity="info" sx={{ mb: 2 }}>
              <strong>Hướng dẫn:</strong>
              <ul style={{ margin: "8px 0", paddingLeft: "20px" }}>
                <li><strong>Đã chọn:</strong> Các slot đã được đề xuất trước đó</li>
                <li><strong>Chọn mới:</strong> Các slot bạn vừa chọn (chưa gửi)</li>
                <li><strong>Có thể chọn:</strong> Các slot khả dụng để chọn thêm</li>
              </ul>
            </Alert>

            {temporarilySelectedSlots.length > 0 && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                Bạn đã chọn {temporarilySelectedSlots.length} slot mới. 
                Nhấn "Tiếp tục" để chọn bài học và gửi đề xuất.
              </Alert>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button onClick={onClose} variant="outlined">
          Đóng
        </Button>
        
        {temporarilySelectedSlots.length > 0 && (
          <>
            <StyledButton
              onClick={onClearSlots}
              variant="outlined"
              color="warning"
            >
              Xóa lựa chọn mới
            </StyledButton>
            <StyledButton
              onClick={onProceedWithOffer}
              variant="contained"
              color="primary"
            >
              Tiếp tục ({temporarilySelectedSlots.length} slot)
            </StyledButton>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default BookingDetailDialog;
