import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  IconButton,
  CircularProgress,
  Alert,
  Box,
} from "@mui/material";
import { FiX } from "react-icons/fi";
import { styled } from "@mui/material/styles";
import { getLanguageName } from "./utils";
import formatPriceWithCommas from "../../../utils/formatPriceWithCommas";

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: "8px",
  textTransform: "none",
  fontWeight: 500,
  padding: "8px 16px",
}));

const LessonSelectionDialog = ({
  open,
  onClose,
  availableLessons,
  lessonsLoading,
  selectedLesson,
  onLessonSelect,
  temporarilySelectedSlots,
  onSendOffer,
}) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "16px",
        }
      }}
    >
      <DialogTitle sx={{ pb: 1, position: "relative" }}>
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Chọn bài học cho đề xuất
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
        <Alert severity="info" sx={{ mb: 3 }}>
          Bạn đã chọn {temporarilySelectedSlots.length} slot thời gian. 
          Vui lòng chọn bài học để gửi đề xuất cho học viên.
        </Alert>

        {lessonsLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : availableLessons.length === 0 ? (
          <Alert severity="warning">
            Bạn chưa có bài học nào. Vui lòng tạo bài học trước khi gửi đề xuất.
          </Alert>
        ) : (
          <FormControl fullWidth>
            <InputLabel>Chọn bài học</InputLabel>
            <Select
              value={selectedLesson?.id || ""}
              onChange={(e) => {
                const lesson = availableLessons.find(l => l.id === e.target.value);
                onLessonSelect(lesson);
              }}
              label="Chọn bài học"
            >
              {availableLessons.map((lesson) => (
                <MenuItem key={lesson.id} value={lesson.id}>
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                      {lesson.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {getLanguageName(lesson.languageCode)} • {lesson.category} • {formatPriceWithCommas(lesson.price)} VND
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {selectedLesson && (
          <Box sx={{ mt: 3, p: 2, backgroundColor: "grey.50", borderRadius: "8px" }}>
            <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
              Thông tin bài học đã chọn:
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Tên:</strong> {selectedLesson.name}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Ngôn ngữ:</strong> {getLanguageName(selectedLesson.languageCode)}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Danh mục:</strong> {selectedLesson.category}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Giá:</strong> {formatPriceWithCommas(selectedLesson.price)} VND
            </Typography>
            <Typography variant="body2">
              <strong>Mô tả:</strong> {selectedLesson.description}
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button onClick={onClose} variant="outlined">
          Hủy
        </Button>
        <StyledButton
          onClick={onSendOffer}
          variant="contained"
          disabled={!selectedLesson || availableLessons.length === 0}
        >
          Gửi đề xuất
        </StyledButton>
      </DialogActions>
    </Dialog>
  );
};

export default LessonSelectionDialog;
