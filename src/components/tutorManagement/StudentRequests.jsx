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
  Tooltip
} from '@mui/material';
import { FiPlusCircle, FiCheck } from 'react-icons/fi';
import { tutorBookingTimeSlotFromLearner, tutorBookingTimeSlotFromLearnerDetail } from '../../components/api/auth';

const StudentRequests = () => {
  const [learnerRequests, setLearnerRequests] = useState([]);
  const [learnerRequestsLoading, setLearnerRequestsLoading] = useState(false);
  const [learnerRequestsError, setLearnerRequestsError] = useState(null);

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
      <Box>
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
              {Array.from({ length: 3 }).map((_, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    <Skeleton variant="text" width="80%" height={24} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="rectangular" width="80%" height={24} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" width="60%" height={24} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  }

  if (learnerRequestsError) {
    return <Alert severity="error">{learnerRequestsError}</Alert>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Yêu cầu từ học viên</h2>
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
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              learnerRequests.map((req) => (
                <TableRow
                  key={req.learnerId}
                  hover
                  sx={{ cursor: "pointer" }}
                >
                  <TableCell>{req.learnerName}</TableCell>
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
                      ? new Date(req.latestRequestTime).toLocaleString("vi-VN")
                      : "-"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default StudentRequests; 