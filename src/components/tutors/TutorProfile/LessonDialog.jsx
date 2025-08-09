import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Typography,
  IconButton,
  CircularProgress,
  Alert,
} from "@mui/material";
import { FiX } from "react-icons/fi";
import { styled } from "@mui/material/styles";
import { languageList } from "../../../utils/languageList";
import formatPriceInputWithCommas from "../../../utils/formatPriceInputWithCommas";

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: "8px",
  textTransform: "none",
  fontWeight: 500,
  padding: "8px 16px",
}));

const LessonDialog = ({
  open,
  onClose,
  editLesson,
  lessonForm,
  onFormChange,
  showValidation,
  lessonLoading,
  onSave,
  onCancel,
}) => {
  const categories = [
    "Cơ bản",
    "Nâng cao", 
    "Chuyên nghiệp",
    "Học thuật",
    "Giao tiếp",
    "Kinh doanh",
    "Du lịch",
    "Khác"
  ];

  const handlePriceChange = (e) => {
    const value = e.target.value;
    const formattedValue = formatPriceInputWithCommas(value);
    onFormChange("price", formattedValue);
  };

  const isFormValid = () => {
    return (
      lessonForm.name &&
      lessonForm.description &&
      lessonForm.targetAudience &&
      lessonForm.prerequisites &&
      lessonForm.languageCode &&
      lessonForm.category &&
      lessonForm.price
    );
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
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
          {editLesson ? "Chỉnh sửa bài học" : "Tạo bài học mới"}
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
        <Grid container spacing={3}>
          {/* Lesson Name */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Tên bài học"
              value={lessonForm.name}
              onChange={(e) => onFormChange("name", e.target.value)}
              error={showValidation && !lessonForm.name}
              helperText={showValidation && !lessonForm.name ? "Vui lòng nhập tên bài học" : ""}
              sx={{ borderRadius: "8px" }}
            />
          </Grid>

          {/* Language and Category */}
          <Grid item xs={12} sm={6}>
            <FormControl 
              fullWidth 
              error={showValidation && !lessonForm.languageCode}
            >
              <InputLabel>Ngôn ngữ</InputLabel>
              <Select
                value={lessonForm.languageCode}
                onChange={(e) => onFormChange("languageCode", e.target.value)}
                label="Ngôn ngữ"
              >
                {languageList.map((lang) => (
                  <MenuItem key={lang.code} value={lang.code}>
                    <img
                      src={lang.flag}
                      alt={lang.name}
                      style={{ width: 20, height: 15, marginRight: 8 }}
                    />
                    {lang.name}
                  </MenuItem>
                ))}
              </Select>
              {showValidation && !lessonForm.languageCode && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                  Vui lòng chọn ngôn ngữ
                </Typography>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl 
              fullWidth 
              error={showValidation && !lessonForm.category}
            >
              <InputLabel>Danh mục</InputLabel>
              <Select
                value={lessonForm.category}
                onChange={(e) => onFormChange("category", e.target.value)}
                label="Danh mục"
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
              {showValidation && !lessonForm.category && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                  Vui lòng chọn danh mục
                </Typography>
              )}
            </FormControl>
          </Grid>

          {/* Price */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Giá (VND)"
              value={lessonForm.price}
              onChange={handlePriceChange}
              error={showValidation && !lessonForm.price}
              helperText={showValidation && !lessonForm.price ? "Vui lòng nhập giá" : ""}
              placeholder="0"
            />
          </Grid>

          {/* Target Audience */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Đối tượng học"
              value={lessonForm.targetAudience}
              onChange={(e) => onFormChange("targetAudience", e.target.value)}
              error={showValidation && !lessonForm.targetAudience}
              helperText={showValidation && !lessonForm.targetAudience ? "Vui lòng nhập đối tượng học" : ""}
              placeholder="Ví dụ: Người mới bắt đầu, Trẻ em, Người đi làm..."
            />
          </Grid>

          {/* Prerequisites */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Yêu cầu tiên quyết"
              value={lessonForm.prerequisites}
              onChange={(e) => onFormChange("prerequisites", e.target.value)}
              error={showValidation && !lessonForm.prerequisites}
              helperText={showValidation && !lessonForm.prerequisites ? "Vui lòng nhập yêu cầu tiên quyết" : ""}
              placeholder="Ví dụ: Không yêu cầu kiến thức trước, Biết chữ cái cơ bản..."
              multiline
              rows={2}
            />
          </Grid>

          {/* Description */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Mô tả bài học"
              value={lessonForm.description}
              onChange={(e) => onFormChange("description", e.target.value)}
              error={showValidation && !lessonForm.description}
              helperText={showValidation && !lessonForm.description ? "Vui lòng nhập mô tả bài học" : ""}
              placeholder="Mô tả chi tiết về nội dung, phương pháp giảng dạy..."
              multiline
              rows={4}
            />
          </Grid>
        </Grid>

        {/* Validation Alert */}
        {showValidation && !isFormValid() && (
          <Alert severity="error" sx={{ mt: 2 }}>
            Vui lòng điền đầy đủ tất cả các trường bắt buộc.
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button onClick={onCancel} variant="outlined" disabled={lessonLoading}>
          Hủy
        </Button>
        <StyledButton
          onClick={onSave}
          variant="contained"
          disabled={lessonLoading}
          startIcon={lessonLoading ? <CircularProgress size={16} /> : null}
        >
          {lessonLoading ? "Đang lưu..." : editLesson ? "Cập nhật" : "Tạo bài học"}
        </StyledButton>
      </DialogActions>
    </Dialog>
  );
};

export default LessonDialog;
