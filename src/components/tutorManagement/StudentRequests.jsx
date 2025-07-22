import React, { useState, useEffect } from 'react';
import { FaUser, FaBook, FaClock, FaCalendarAlt, FaMapMarkerAlt, FaVideo, FaEnvelope } from 'react-icons/fa';
import { 
  Skeleton, 
  Box, 
  Card, 
  CardContent, 
  Grid 
} from '@mui/material';

// Skeleton Component for Student Requests
const StudentRequestsSkeleton = () => (
  <Box>
    {/* Header skeleton */}
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
      <Skeleton variant="text" width={250} height={40} />
      <Box sx={{ display: 'flex', gap: 1 }}>
        {Array.from({ length: 4 }).map((_, idx) => (
          <Skeleton key={idx} variant="rectangular" width={90} height={36} sx={{ borderRadius: 2 }} />
        ))}
      </Box>
    </Box>

    {/* Request items skeleton */}
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index} sx={{ borderRadius: 2, boxShadow: 1 }}>
          <CardContent sx={{ p: 3 }}>
            {/* Header section */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Skeleton variant="circular" width={48} height={48} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Skeleton variant="text" width={140} height={24} />
                  <Skeleton variant="text" width={120} height={16} />
                </Box>
              </Box>
              <Skeleton variant="rectangular" width={100} height={24} sx={{ borderRadius: 12 }} />
            </Box>

            {/* Info grid skeleton */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Skeleton variant="text" width="85%" height={20} />
                  <Skeleton variant="text" width="70%" height={20} />
                  <Skeleton variant="text" width="80%" height={20} />
                  <Skeleton variant="text" width="90%" height={20} />
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                  <Box sx={{ textAlign: 'right' }}>
                    <Skeleton variant="text" width="60%" height={28} sx={{ ml: 'auto', mb: 1 }} />
                    <Skeleton variant="text" width="40%" height={20} sx={{ ml: 'auto' }} />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                    <Skeleton variant="rectangular" width={80} height={36} sx={{ borderRadius: 1 }} />
                    <Skeleton variant="rectangular" width={80} height={36} sx={{ borderRadius: 1 }} />
                  </Box>
                </Box>
              </Grid>
            </Grid>

            {/* Message section skeleton */}
            <Box sx={{ backgroundColor: '#f8fafc', p: 2, borderRadius: 1 }}>
              <Skeleton variant="text" width={80} height={20} sx={{ mb: 1 }} />
              <Skeleton variant="text" width="100%" height={20} sx={{ mb: 0.5 }} />
              <Skeleton variant="text" width="85%" height={20} sx={{ mb: 0.5 }} />
              <Skeleton variant="text" width="60%" height={20} />
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  </Box>
);

const StudentRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, accepted, declined

  // Mock data - replace with API call
  const mockRequests = [
    {
      id: 1,
      studentName: 'Nguyễn Thị D',
      studentAvatar: 'https://avatar.iran.liara.run/public/4',
      subject: 'Tiếng Anh',
      level: 'Beginner',
      requestDate: '2024-01-14',
      preferredDate: '2024-01-16',
      preferredTime: '18:00 - 19:30',
      type: 'online',
      price: 250000,
      message: 'Em muốn học tiếng Anh cơ bản để chuẩn bị cho kỳ thi IELTS. Em có thể học vào buổi tối.',
      status: 'pending'
    },
    {
      id: 2,
      studentName: 'Trần Văn E',
      studentAvatar: 'https://avatar.iran.liara.run/public/5',
      subject: 'Tiếng Nhật',
      level: 'Intermediate',
      requestDate: '2024-01-13',
      preferredDate: '2024-01-15',
      preferredTime: '14:00 - 15:30',
      type: 'offline',
      location: 'Quận 3, TP.HCM',
      price: 300000,
      message: 'Tôi đang học tiếng Nhật và cần người hướng dẫn về ngữ pháp N3.',
      status: 'accepted'
    },
    {
      id: 3,
      studentName: 'Lê Thị F',
      studentAvatar: 'https://avatar.iran.liara.run/public/6',
      subject: 'Tiếng Hàn',
      level: 'Beginner',
      requestDate: '2024-01-12',
      preferredDate: '2024-01-17',
      preferredTime: '20:00 - 21:00',
      type: 'online',
      price: 200000,
      message: 'Em yêu thích văn hóa Hàn Quốc và muốn học tiếng Hàn từ cơ bản.',
      status: 'declined'
    },
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setRequests(mockRequests);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Chờ phản hồi';
      case 'accepted':
        return 'Đã chấp nhận';
      case 'declined':
        return 'Đã từ chối';
      default:
        return 'Không xác định';
    }
  };

  const handleAccept = (requestId) => {
    setRequests(requests.map(req => 
      req.id === requestId ? { ...req, status: 'accepted' } : req
    ));
  };

  const handleDecline = (requestId) => {
    setRequests(requests.map(req => 
      req.id === requestId ? { ...req, status: 'declined' } : req
    ));
  };

  const filteredRequests = requests.filter(request => {
    if (filter === 'all') return true;
    return request.status === filter;
  });

  if (loading) {
    return <StudentRequestsSkeleton />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Yêu cầu từ học viên</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`no-focus-outline px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`no-focus-outline px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'pending'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Chờ phản hồi
          </button>
          <button
            onClick={() => setFilter('accepted')}
            className={`no-focus-outline px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'accepted'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Đã chấp nhận
          </button>
          <button
            onClick={() => setFilter('declined')}
            className={`no-focus-outline px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'declined'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Đã từ chối
          </button>
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="text-center py-12">
          <FaEnvelope className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Không có yêu cầu nào</h3>
          <p className="text-gray-500">Bạn chưa có yêu cầu học nào từ học viên.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredRequests.map((request) => (
            <div
              key={request.id}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <img
                    src={request.studentAvatar}
                    alt={request.studentName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {request.studentName}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Yêu cầu vào {request.requestDate}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    request.status
                  )}`}
                >
                  {getStatusText(request.status)}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <div className="flex items-center text-gray-700">
                    <FaBook className="w-4 h-4 mr-2" />
                    <span className="font-medium">{request.subject}</span>
                    <span className="ml-2 text-sm text-gray-500">({request.level})</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <FaCalendarAlt className="w-4 h-4 mr-2" />
                    <span>{request.preferredDate}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <FaClock className="w-4 h-4 mr-2" />
                    <span>{request.preferredTime}</span>
                  </div>
                  {request.type === 'online' ? (
                    <div className="flex items-center text-gray-700">
                      <FaVideo className="w-4 h-4 mr-2" />
                      <span>Học trực tuyến</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-gray-700">
                      <FaMapMarkerAlt className="w-4 h-4 mr-2" />
                      <span>{request.location}</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col justify-between">
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">
                      {request.price.toLocaleString('vi-VN')} VNĐ/buổi
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Tin nhắn từ học viên:</h4>
                <p className="text-gray-700 text-sm">{request.message}</p>
              </div>

              {request.status === 'pending' && (
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleAccept(request.id)}
                    className="no-focus-outline flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Chấp nhận yêu cầu
                  </button>
                  <button
                    onClick={() => handleDecline(request.id)}
                    className="no-focus-outline flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    Từ chối
                  </button>
                  <button className="no-focus-outline px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                    Nhắn tin
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentRequests; 