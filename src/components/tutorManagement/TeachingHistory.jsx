import React, { useState, useEffect } from 'react';
import { FaUser, FaCalendarAlt, FaClock, FaStar, FaBook, FaVideo, FaMapMarkerAlt, FaEye, FaTimes } from 'react-icons/fa';
import { 
  Skeleton, 
  Box, 
  Card, 
  CardContent, 
  Grid 
} from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { fetchTutorBookings, fetchBookingDetail } from '../api/auth';
import formatPriceWithCommas from '../../utils/formatPriceWithCommas';
import { formatCentralTimestamp, formatUTC0ToUTC7, convertBookingDetailToUTC7 } from '../../utils/formatCentralTimestamp';
import { calculateUTC7SlotIndex } from '../../utils/formatSlotTime';
import { formatSlotDateTime } from '../../utils/formatSlotTime';

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

// Helper function to get booking overall status based on slots
const getBookingOverallStatus = (booking) => {
  // If no booking detail is available, we can't determine the status
  if (!booking.bookedSlots || booking.bookedSlots.length === 0) {
    return null;
  }

  const slots = booking.bookedSlots;
  const totalSlots = slots.length;
  const completedSlots = slots.filter(slot => slot.status === 2).length;
  const cancelledSlots = slots.filter(slot => slot.status === 3).length;
  const cancelledDisputedSlots = slots.filter(slot => slot.status === 4).length;
  const pendingSlots = slots.filter(slot => slot.status === 0).length;
  const awaitingSlots = slots.filter(slot => slot.status === 1).length;

  // If all slots are completed
  if (completedSlots === totalSlots) {
    return { text: 'Hoàn thành', color: 'bg-green-100 text-green-700' };
  }
  
  // If all slots are cancelled
  if (cancelledSlots === totalSlots) {
    return { text: 'Đã hủy', color: 'bg-red-100 text-red-700' };
  }
  
  // If all slots are cancelled due to dispute
  if (cancelledDisputedSlots === totalSlots) {
    return { text: 'Đã hủy do tranh chấp', color: 'bg-orange-100 text-orange-700' };
  }
  
  // If all slots are pending
  if (pendingSlots === totalSlots) {
    return { text: 'Đang chờ', color: 'bg-yellow-100 text-yellow-700' };
  }
  
  // If all slots are awaiting confirmation
  if (awaitingSlots === totalSlots) {
    return { text: 'Đang chờ xác nhận', color: 'bg-blue-100 text-blue-700' };
  }
  
  // If there are any awaiting confirmation slots (status = 1), the booking is still in progress
  if (awaitingSlots > 0) {
    return { text: 'Đang diễn ra', color: 'bg-blue-100 text-blue-700' };
  }

  if (completedSlots > 0 && cancelledDisputedSlots > 0) {
    return { text: 'Đã hủy do tranh chấp', color: 'bg-orange-100 text-orange-700' };
  }
  
  // If there are completed slots but no awaiting slots, consider as completed
  if (completedSlots > 0 && awaitingSlots === 0) {
    return { text: 'Hoàn thành', color: 'bg-green-100 text-green-700' };
  }
  
  // Mixed status without completed slots or awaiting slots - show as in progress
  return { text: 'Đang diễn ra', color: 'bg-blue-100 text-blue-700' };
};

const TeachingHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, completed, cancelled
  const [sortBy, setSortBy] = useState('date'); // date, rating, subject
  const [pagination, setPagination] = useState({
    pageIndex: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false
  });
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookingDetail, setBookingDetail] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    loadHistory();
  }, [pagination.pageIndex]);

  const loadHistory = async (page = 1) => {
    try {
      setLoading(true);
      const response = await fetchTutorBookings(page, 10);
      const allBookings = response.items || [];
      
      // Fetch detailed booking info for each booking to determine status
      const detailedBookings = await Promise.all(
        allBookings.map(async (booking) => {
          try {
            const detail = await fetchBookingDetail(booking.id);
            // Convert UTC+0 to UTC+7 and sort booked slots by chronological order
            const convertedDetail = convertBookingDetailToUTC7(detail);
            return { ...booking, detail: convertedDetail };
          } catch (error) {
            console.error(`Error fetching detail for booking ${booking.id}:`, error);
            return { ...booking, detail: null };
          }
        })
      );

      // Filter bookings to only show completed and cancelled due to dispute
      const filteredBookings = detailedBookings.filter(booking => {
        if (!booking.detail) return false;
        
        const status = getBookingOverallStatus(booking.detail);
        return status && (status.text === 'Hoàn thành' || status.text === 'Đã hủy do tranh chấp');
      });

      setHistory(filteredBookings);
      setPagination({
        pageIndex: response.pageIndex,
        pageSize: response.pageSize,
        totalItems: response.totalItems,
        totalPages: response.totalPages,
        hasNextPage: response.hasNextPage,
        hasPreviousPage: response.hasPreviousPage
      });
    } catch (error) {
      console.error("Error loading teaching history:", error);
      toast.error('Không thể tải lịch sử dạy học. Vui lòng thử lại.');
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (booking) => {
    try {
      setSelectedBooking(booking);
      setIsDetailModalOpen(true);
      setDetailLoading(true);
      
      if (booking.detail) {
        setBookingDetail(booking.detail);
      } else {
        const detail = await fetchBookingDetail(booking.id);
        // Convert UTC+0 to UTC+7 and sort booked slots by chronological order
        const convertedDetail = convertBookingDetailToUTC7(detail);
        setBookingDetail(convertedDetail);
      }
    } catch (error) {
      console.error("Error loading booking detail:", error);
      toast.error('Không thể tải thông tin chi tiết. Vui lòng thử lại.');
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedBooking(null);
    setBookingDetail(null);
    setDetailLoading(false);
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, pageIndex: newPage }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Hoàn thành':
        return 'bg-green-100 text-green-800';
      case 'Đã hủy do tranh chấp':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    return status || 'Không xác định';
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
    .filter(item => {
      if (filter === 'all') return true;
      if (!item.detail) return false;
      
      const status = getBookingOverallStatus(item.detail);
      if (filter === 'completed') return status?.text === 'Hoàn thành';
      if (filter === 'cancelled') return status?.text === 'Đã hủy do tranh chấp';
      return false;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.createdTime) - new Date(a.createdTime);
        case 'subject':
          return a.lessonName.localeCompare(b.lessonName);
        default:
          return 0;
      }
    });

  const totalEarnings = history
    .filter(item => {
      if (!item.detail) return false;
      const status = getBookingOverallStatus(item.detail);
      return status?.text === 'Hoàn thành';
    })
    .reduce((total, item) => total + (item.totalPrice || 0), 0);

  const completedLessons = history.filter(item => {
    if (!item.detail) return false;
    const status = getBookingOverallStatus(item.detail);
    return status?.text === 'Hoàn thành';
  }).length;

  const averageRating = history
    .filter(item => {
      if (!item.detail) return false;
      const status = getBookingOverallStatus(item.detail);
      return status?.text === 'Hoàn thành';
    })
    .reduce((sum, item, _, arr) => {
      // Mock rating for now since API doesn't provide rating
      return sum + (4.5 / arr.length);
    }, 0);

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
              Đã hủy do tranh chấp
            </button>
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          >
            <option value="date">Sắp xếp theo ngày</option>
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
        <>
          <div className="space-y-4">
            {sortedAndFilteredHistory.map((item) => {
              const status = item.detail ? getBookingOverallStatus(item.detail) : null;
              return (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <img
                        src={item.learnerAvatarUrl || 'https://via.placeholder.com/48?text=L'}
                        alt={item.learnerName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {item.lessonName}
                        </h3>
                        <div className="flex items-center text-gray-600 mt-1">
                          <FaUser className="w-4 h-4 mr-2" />
                          <span>{item.learnerName}</span>
                        </div>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${status?.color || 'bg-gray-100 text-gray-800'}`}
                    >
                      {status?.text || 'Không xác định'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center text-gray-700">
                        <FaCalendarAlt className="w-4 h-4 mr-2" />
                                                 <span>{formatUTC0ToUTC7(item.createdTime)}</span>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <FaClock className="w-4 h-4 mr-2" />
                        <span>{item.slotCount} buổi học</span>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <FaVideo className="w-4 h-4 mr-2" />
                        <span>Học trực tuyến</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-lg font-bold text-green-600">
                        {formatPriceWithCommas(item.totalPrice)} VNĐ
                      </div>
                      {status?.text === 'Hoàn thành' && (
                        <div className="flex items-center space-x-2">
                          <div className="flex">
                            {renderStars(4.5)}
                          </div>
                          <span className="text-sm text-gray-600">(4.5/5)</span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end">
                      <button 
                        onClick={() => handleViewDetail(item)}
                        className="no-focus-outline flex items-center space-x-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                      >
                        <FaEye className="w-4 h-4" />
                        <span>Chi tiết</span>
                      </button>
                    </div>
                  </div>

                  {status?.text === 'Hoàn thành' && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Đánh giá từ học viên:</h4>
                      <p className="text-gray-700 text-sm">Thầy dạy rất tốt, giải thích dễ hiểu. Em đã hiểu được nhiều kiến thức mới.</p>
                    </div>
                  )}

                  {status?.text === 'Đã hủy do tranh chấp' && (
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h4 className="font-medium text-orange-900 mb-2">Lý do hủy:</h4>
                      <p className="text-orange-700 text-sm">Booking bị hủy do có tranh chấp giữa học viên và giáo viên.</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                type="button"
                onClick={() => handlePageChange(pagination.pageIndex - 1)}
                disabled={!pagination.hasPreviousPage}
                className="no-focus-outline px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>
              
              <span className="px-4 py-2 text-sm text-gray-600">
                Trang {pagination.pageIndex} / {pagination.totalPages}
              </span>
              
              <button
                type="button"
                onClick={() => handlePageChange(pagination.pageIndex + 1)}
                disabled={!pagination.hasNextPage}
                className="no-focus-outline px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
              </button>
            </div>
          )}
        </>
      )}

      {/* Detail Modal */}
      {isDetailModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Chi tiết Lịch sử Dạy học</h3>
                <p className="text-gray-500 mt-1">{selectedBooking?.lessonName}</p>
              </div>
              <button
                type="button"
                onClick={closeDetailModal}
                className="no-focus-outline p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FaTimes className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {detailLoading ? (
                <div className="space-y-4">
                  <Skeleton variant="rectangular" width="100%" height={100} />
                  <Skeleton variant="rectangular" width="100%" height={200} />
                  <Skeleton variant="rectangular" width="100%" height={150} />
                </div>
              ) : bookingDetail ? (
                <div className="space-y-6">
                  {/* Student and Tutor Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Thông tin Giáo viên</h4>
                      <div className="flex items-center gap-3">
                        <img
                          src={selectedBooking?.tutorAvatarUrl || 'https://via.placeholder.com/56?text=T'}
                          alt={selectedBooking?.tutorName}
                          className="w-14 h-14 rounded-full object-cover border-2 border-gray-200"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{selectedBooking?.tutorName}</p>
                          <p className="text-sm text-gray-600">Giáo viên</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Thông tin Học viên</h4>
                      <div className="flex items-center gap-3">
                        <img
                          src={selectedBooking?.learnerAvatarUrl || 'https://via.placeholder.com/56?text=L'}
                          alt={selectedBooking?.learnerName}
                          className="w-14 h-14 rounded-full object-cover border-2 border-gray-200"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{selectedBooking?.learnerName}</p>
                          <p className="text-sm text-gray-600">Học viên</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Booking Summary */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">Thông tin đặt lịch</h4>
                      <div className="flex items-center gap-3">
                        {(() => {
                          const overallStatus = getBookingOverallStatus(bookingDetail);
                          return overallStatus ? (
                            <span className={`px-3 py-1 text-sm rounded-full font-medium ${overallStatus.color}`}>
                              {overallStatus.text}
                            </span>
                          ) : null;
                        })()}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-700">Tổng tiền:</p>
                        <p className="font-semibold text-blue-700">{formatPriceWithCommas(selectedBooking?.totalPrice)}đ</p>
                      </div>
                      <div>
                        <p className="text-gray-700">Số buổi:</p>
                        <p className="font-medium text-gray-900">{selectedBooking?.slotCount} buổi</p>
                      </div>
                      <div>
                        <p className="text-gray-700">Ngày tạo:</p>
                                                  <p className="font-medium text-gray-900">{formatUTC0ToUTC7(selectedBooking?.createdTime)}</p>
                      </div>
                      <div>
                        <p className="text-gray-700">Buổi đầu tiên:</p>
                                                  <p className="font-medium text-gray-900">{formatUTC0ToUTC7(selectedBooking?.earliestBookedDate)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Booked Slots Details */}
                  {bookingDetail.bookedSlots && bookingDetail.bookedSlots.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">
                        Lịch học chi tiết ({bookingDetail.bookedSlots.length} slot)
                      </h4>
                      <div className="space-y-3">
                        {bookingDetail.bookedSlots.map((slot, index) => {
                          const getSlotStatusInfo = (status) => {
                            switch (status) {
                              case 0: return { text: 'Đang chờ', color: 'bg-yellow-100 text-yellow-700' };
                              case 1: return { text: 'Đang chờ xác nhận', color: 'bg-blue-100 text-blue-700' };
                              case 2: return { text: 'Đã hoàn thành', color: 'bg-green-100 text-green-700' };
                              case 3: return { text: 'Đã hủy', color: 'bg-red-100 text-red-700' };
                              case 4: return { text: 'Đã hủy do tranh chấp', color: 'bg-orange-100 text-orange-700' };
                              default: return { text: 'Không xác định', color: 'bg-gray-100 text-gray-700' };
                            }
                          };
                          
                          const statusInfo = getSlotStatusInfo(slot.status);
                          return (
                            <div key={slot.id || index} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">
                                    {index + 1}
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">
                                      {formatSlotDateTime(slot.slotIndex - 1, slot.bookedDate)}
                                    </p>
                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                      <span className="flex items-center gap-1">
                                        <FaCalendarAlt className="w-3 h-3" />
                                        Slot {calculateUTC7SlotIndex(slot.slotIndex - 1, slot.bookedDate)}
                                      </span>
                                      {slot.slotNote && (
                                        <span className="text-xs text-gray-500">
                                          Ghi chú: {slot.slotNote}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className={`px-3 py-1 text-xs rounded-full font-medium ${statusInfo.color}`}>
                                    {statusInfo.text}
                                  </span>
                                  {slot.heldFundId && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      Fund ID: {slot.heldFundId}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Notes or Additional Info */}
                  {bookingDetail.notes && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Ghi chú</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-700">{bookingDetail.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Không thể tải thông tin chi tiết</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast Container for notifications */}
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

export default TeachingHistory; 