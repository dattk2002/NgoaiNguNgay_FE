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
  CircularProgress,
} from "@mui/material";
import { FiPlusCircle, FiEdit, FiTrash2 } from "react-icons/fi";
import { styled } from "@mui/material/styles";
import { getLanguageName } from "./utils";
import formatPriceWithCommas from "../../../utils/formatPriceWithCommas";

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

const LessonsTab = ({
  lessons,
  lessonsLoading,
  isOwner,
  handleCreateLesson,
  handleEditLesson,
  handleDeleteLesson,
}) => {
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
      {/* Header with Create Button */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <SectionTitle variant="h6" sx={{ mb: 0 }}>
          Danh sách bài học
        </SectionTitle>
        {isOwner && (
          <StyledButton
            startIcon={<FiPlusCircle />}
            onClick={handleCreateLesson}
          >
            Tạo bài học
          </StyledButton>
        )}
      </Box>

      {/* Lessons Table */}
      {lessonsLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : lessons && lessons.length > 0 ? (
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: "12px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "grey.50" }}>
                <TableCell sx={{ fontWeight: "bold", minWidth: 200 }}>
                  Tên bài học
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", minWidth: 120 }}>
                  Ngôn ngữ
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", minWidth: 120 }}>
                  Danh mục
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", minWidth: 150 }}>
                  Đối tượng
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", minWidth: 120 }} align="right">
                  Giá
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", minWidth: 250 }}>
                  Mô tả
                </TableCell>
                {isOwner && (
                  <TableCell sx={{ fontWeight: "bold", minWidth: 120 }} align="center">
                    Thao tác
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {lessons.map((lesson) => (
                <TableRow
                  key={lesson.id}
                  sx={{
                    "&:hover": {
                      backgroundColor: "grey.50",
                    },
                  }}
                >
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                      {lesson.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getLanguageName(lesson.languageCode)}
                      size="small"
                      color="default"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={lesson.category}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {lesson.targetAudience}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: "medium", color: "success.main" }}
                    >
                      {formatPriceWithCommas(lesson.price)} VND
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        display: "-webkit-box",
                        WebkitBoxOrient: "vertical",
                        WebkitLineClamp: 2,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "250px",
                      }}
                      title={lesson.description}
                    >
                      {lesson.description}
                    </Typography>
                  </TableCell>
                  {isOwner && (
                    <TableCell align="center">
                      <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEditLesson(lesson)}
                          sx={{
                            "&:hover": {
                              backgroundColor: "primary.main",
                              color: "white",
                            },
                          }}
                        >
                          <FiEdit />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteLesson(lesson)}
                          sx={{
                            "&:hover": {
                              backgroundColor: "error.main",
                              color: "white",
                            },
                          }}
                        >
                          <FiTrash2 />
                        </IconButton>
                      </Box>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Paper
          sx={{
            p: 4,
            textAlign: "center",
            backgroundColor: "grey.50",
            borderRadius: "12px",
          }}
        >
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            {isOwner ? "Chưa có bài học nào" : "Gia sư chưa có bài học nào"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isOwner
              ? "Hãy tạo bài học đầu tiên để bắt đầu dạy học!"
              : "Gia sư này chưa tạo bài học nào."}
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default LessonsTab;
