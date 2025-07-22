import React, { useState, useEffect } from 'react';
import { FaUser, FaCalendarAlt, FaClock, FaStar, FaBook, FaVideo, FaMapMarkerAlt, FaEye } from 'react-icons/fa';
import { 
  Skeleton, 
  Box, 
  Card, 
  CardContent, 
  Grid 
} from '@mui/material';

// Skeleton Component for Teaching History
const TeachingHistorySkeleton = () => (
  <Box>
    {/* Header skeleton */}
    <Skeleton variant="text" width={200} height={40} sx={{ mb: 2 }} />
    
    {/* Statistics Cards skeleton */}
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {Array.from({ length: 3 }).map((_, idx) => (
        <Grid item xs={12} md={4} key={idx}>
          <Card sx={{ p: 2, backgroundColor: '#f8fafc', borderRadius: 2 }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Skeleton variant="text" width="70%" height={20} sx={{ mb: 1 }} />
              <Skeleton variant="text" width="60%" height={32} />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>

    {/* Filters skeleton */}
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
      <Box sx={{ display: 'flex', gap: 1 }}>
        {Array.from({ length: 3 }).map((_, idx) => (
          <Skeleton key={idx} variant="rectangular" width={80} height={36} sx={{ borderRadius: 2 }} />
        ))}
      </Box>
      <Skeleton variant="rectangular" width={180} height={36} sx={{ borderRadius: 1 }} />
    </Box>

    {/* History items skeleton */}
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index} sx={{ borderRadius: 2, boxShadow: 1 }}>
          <CardContent sx={{ p: 3 }}>
            {/* Header section */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Skeleton variant="circular" width={48} height={48} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Skeleton variant="text" width={120} height={24} />
                  <Skeleton variant="text" width={100} height={20} />
                </Box>
              </Box>
              <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 12 }} />
            </Box>

            {/* Info grid skeleton */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Skeleton variant="text" width="80%" height={20} />
                  <Skeleton variant="text" width="90%" height={20} />
                  <Skeleton variant="text" width="70%" height={20} />
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {Array.from({ length: 5 }).map((_, starIdx) => (
                      <Skeleton key={starIdx} variant="circular" width={16} height={16} />
                    ))}
                  </Box>
                  <Skeleton variant="text" width="60%" height={24} />
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'right' }}>
                  <Skeleton variant="text" width="80%" height={28} sx={{ ml: 'auto' }} />
                </Box>
              </Grid>
            </Grid>

            {/* Review section skeleton */}
            <Box sx={{ backgroundColor: '#f8fafc', p: 2, borderRadius: 1 }}>
              <Skeleton variant="text" width="100%" height={20} sx={{ mb: 0.5 }} />
              <Skeleton variant="text" width="75%" height={20} />
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  </Box>
);

const TeachingHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, completed, cancelled
  const [sortBy, setSortBy] = useState('date'); // date, rating, subject

  // Mock data - replace with API call
  const mockHistory = [
    {
      id: 1,
      studentName: 'Nguyễn Văn A',
      studentAvatar: 'https://avatar.iran.liara.run/public/1',
      subject: 'Tiếng Anh',
      date: '2024-01-10',
      time: '14:00 - 15:30',
      duration: '1.5 giờ',
      type: 'online',
      status: 'completed',
      rating: 5,
      review: 'Thầy dạy rất tốt, giải thích dễ hiểu. Em đã hiểu được nhiều kiến thức mới.',
      price: 250000,
    },
    {
      id: 2,
      studentName: 'Trần Thị B',
      studentAvatar: 'https://avatar.iran.liara.run/public/2',
      subject: 'Tiếng Nhật',
      date: '2024-01-08',
      time: '16:00 - 17:00',
      duration: '1 giờ',
      type: 'offline',
      location: 'Café ABC, Quận 1',
      status: 'completed',
      rating: 4,
      review: 'Buổi học khá tốt, tuy nhiên em mong thầy có thể chuẩn bị thêm tài liệu.',
      price: 300000,
    },
    {
      id: 3,
      studentName: 'Lê Văn C',
      studentAvatar: 'https://avatar.iran.liara.run/public/3',
      subject: 'Tiếng Hàn',
      date: '2024-01-05',
      time: '09:00 - 10:30',
      duration: '1.5 giờ',
      type: 'online',
      status: 'cancelled',
      reason: 'Học viên hủy do bận việc đột xuất',
      price: 200000,
    },
    {
      id: 4,
      studentName: 'Phạm Thị D',
      studentAvatar: 'https://avatar.iran.liara.run/public/4',
      subject: 'Tiếng Anh',
      date: '2024-01-03',
      time: '18:00 - 19:30',
      duration: '1.5 giờ',
      type: 'online',
      status: 'completed',
      rating: 5,
      review: 'Thầy rất nhiệt tình và kiên nhẫn. Em rất hài lòng với buổi học.',
      price: 250000,
    },
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setHistory(mockHistory);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Hoàn thành';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return 'Không xác định';
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <FaStar
        key={index}
        className={`w-4 h-4 ${
          index < rating ? 'text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const sortedAndFilteredHistory = history
    .filter(item => filter === 'all' || item.status === filter)
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.date) - new Date(a.date);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'subject':
          return a.subject.localeCompare(b.subject);
        default:
          return 0;
      }
    });

  const totalEarnings = history
    .filter(item => item.status === 'completed')
    .reduce((total, item) => total + item.price, 0);

  const completedLessons = history.filter(item => item.status === 'completed').length;
  const averageRating = history
    .filter(item => item.status === 'completed' && item.rating)
    .reduce((sum, item, _, arr) => sum + item.rating / arr.length, 0);

  if (loading) {
    return <TeachingHistorySkeleton />;
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Lịch sử dạy học</h2>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-600">Tổng số buổi dạy</h3>
            <p className="text-2xl font-bold text-blue-900">{completedLessons}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-green-600">Tổng thu nhập</h3>
            <p className="text-2xl font-bold text-green-900">
              {totalEarnings.toLocaleString('vi-VN')} VNĐ
            </p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-yellow-600">Đánh giá trung bình</h3>
            <div className="flex items-center">
              <p className="text-2xl font-bold text-yellow-900 mr-2">
                {averageRating.toFixed(1)}
              </p>
              <div className="flex">
                {renderStars(Math.round(averageRating))}
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
              onClick={() => setFilter('completed')}
              className={`no-focus-outline px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'completed'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Hoàn thành
            </button>
            <button
              onClick={() => setFilter('cancelled')}
              className={`no-focus-outline px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'cancelled'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Đã hủy
            </button>
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          >
            <option value="date">Sắp xếp theo ngày</option>
            <option value="rating">Sắp xếp theo đánh giá</option>
            <option value="subject">Sắp xếp theo môn học</option>
          </select>
        </div>
      </div>

      {sortedAndFilteredHistory.length === 0 ? (
        <div className="text-center py-12">
          <FaBook className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có lịch sử dạy học</h3>
          <p className="text-gray-500">Bạn chưa có buổi dạy nào được ghi lại.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedAndFilteredHistory.map((item) => (
            <div
              key={item.id}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <img
                    src={item.studentAvatar}
                    alt={item.studentName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {item.subject}
                    </h3>
                    <div className="flex items-center text-gray-600 mt-1">
                      <FaUser className="w-4 h-4 mr-2" />
                      <span>{item.studentName}</span>
                    </div>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    item.status
                  )}`}
                >
                  {getStatusText(item.status)}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="space-y-2">
                  <div className="flex items-center text-gray-700">
                    <FaCalendarAlt className="w-4 h-4 mr-2" />
                    <span>{item.date}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <FaClock className="w-4 h-4 mr-2" />
                    <span>{item.time} ({item.duration})</span>
                  </div>
                  {item.type === 'online' ? (
                    <div className="flex items-center text-gray-700">
                      <FaVideo className="w-4 h-4 mr-2" />
                      <span>Học trực tuyến</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-gray-700">
                      <FaMapMarkerAlt className="w-4 h-4 mr-2" />
                      <span>{item.location}</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="text-lg font-bold text-green-600">
                    {item.price.toLocaleString('vi-VN')} VNĐ
                  </div>
                  {item.status === 'completed' && item.rating && (
                    <div className="flex items-center space-x-2">
                      <div className="flex">
                        {renderStars(item.rating)}
                      </div>
                      <span className="text-sm text-gray-600">({item.rating}/5)</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
                  <button className="no-focus-outline flex items-center space-x-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors">
                    <FaEye className="w-4 h-4" />
                    <span>Chi tiết</span>
                  </button>
                </div>
              </div>

              {item.status === 'completed' && item.review && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Đánh giá từ học viên:</h4>
                  <p className="text-gray-700 text-sm">{item.review}</p>
                </div>
              )}

              {item.status === 'cancelled' && item.reason && (
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-medium text-red-900 mb-2">Lý do hủy:</h4>
                  <p className="text-red-700 text-sm">{item.reason}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeachingHistory; 