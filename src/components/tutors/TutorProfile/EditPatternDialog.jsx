import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  IconButton,
  Chip,
  Box,
  CircularProgress,
} from "@mui/material";
import { FiX, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { styled } from "@mui/material/styles";
import { timeRanges, daysOfWeek } from "./constants";
import { formatDate } from "./utils";

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: "8px",
  textTransform: "none",
  fontWeight: 500,
  padding: "8px 16px",
}));

const EditPatternDialog = ({
  open,
  onClose,
  currentWeekStart,
  onPrevWeek,
  onNextWeek,
  editPatternSlots,
  onSlotToggle,
  onSavePattern,
  onDeletePattern,
  weeklyPatternLoading,
  canDelete,
}) => {
  const weekDates = React.useMemo(() => {
    if (!currentWeekStart) return [];
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, [currentWeekStart]);

  const weekRange = React.useMemo(() => {
    if (!currentWeekStart) return "";
    const end = new Date(currentWeekStart);
    end.setDate(currentWeekStart.getDate() + 6);
    return `${currentWeekStart.toLocaleDateString("vi-VN")} - ${end.toLocaleDateString("vi-VN")}`;
  }, [currentWeekStart]);

  const selectedSlotsCount = React.useMemo(() => {
    return Object.values(editPatternSlots).filter(Boolean).length;
  }, [editPatternSlots]);

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
          Chỉnh sửa lịch trình khả dụng
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

      <DialogContent sx={{ pt: 2 }}>
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

        {/* Instructions */}
        <Box sx={{ mb: 3, p: 2, backgroundColor: "info.light", borderRadius: "8px" }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Hướng dẫn:</strong> Nhấn vào các ô thời gian để chọn/bỏ chọn khung giờ khả dụng.
          </Typography>
          <Typography variant="body2">
            Hiện tại đã chọn: <strong>{selectedSlotsCount}</strong> khung giờ
          </Typography>
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
                  {Array.from({ length: 7 }, (_, dayInWeek) => {
                    const slotKey = `${dayInWeek}-${timeIndex}`;
                    const isSelected = editPatternSlots[slotKey];
                    
                    return (
                      <TableCell key={dayInWeek} align="center">
                        <Chip
                          size="small"
                          label={isSelected ? "✓" : ""}
                          onClick={() => onSlotToggle(dayInWeek, timeIndex)}
                          sx={{
                            minWidth: "32px",
                            height: "32px",
                            cursor: "pointer",
                            backgroundColor: isSelected ? "success.main" : "grey.200",
                            color: isSelected ? "white" : "grey.600",
                            "&:hover": {
                              backgroundColor: isSelected ? "success.dark" : "grey.300",
                            },
                          }}
                        />
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Summary */}
        <Box sx={{ p: 2, backgroundColor: "grey.50", borderRadius: "8px" }}>
          <Typography variant="body2" color="text.secondary">
            Lịch trình này sẽ áp dụng từ tuần <strong>{weekRange}</strong> trở đi.
            Bạn có thể thay đổi lịch trình cho các tuần tiếp theo bằng cách tạo lịch trình mới.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button onClick={onClose} variant="outlined" disabled={weeklyPatternLoading}>
          Hủy
        </Button>
        
        {canDelete && (
          <StyledButton
            onClick={onDeletePattern}
            variant="outlined"
            color="error"
            disabled={weeklyPatternLoading}
          >
            Xóa lịch trình
          </StyledButton>
        )}
        
        <StyledButton
          onClick={onSavePattern}
          variant="contained"
          disabled={weeklyPatternLoading || selectedSlotsCount === 0}
          startIcon={weeklyPatternLoading ? <CircularProgress size={16} /> : null}
        >
          {weeklyPatternLoading ? "Đang lưu..." : "Lưu lịch trình"}
        </StyledButton>
      </DialogActions>
    </Dialog>
  );
};

export default EditPatternDialog;
