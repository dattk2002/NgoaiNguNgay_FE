import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCalendarAlt, FaClock, FaUser, FaVideo, FaMapMarkerAlt, FaEye, FaTimes, FaGraduationCap, FaCheck } from 'react-icons/fa';
import { 
  Skeleton, 
  Box, 
  Card, 
  CardContent, 
  Container 
} from '@mui/material';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { fetchTutorBookings, fetchBookingDetail, completeBookedSlot } from '../api/auth';
import formatPriceWithCommas from '../../utils/formatPriceWithCommas';
import { formatCentralTimestamp } from '../../utils/formatCentralTimestamp';

// Skeleton Component for Booking Items
const BookingTrackingSkeleton = () => (
  <Box>
    {/* Header skeleton */}
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
      <Skeleton variant="text" width={200} height={40} />
      <Skeleton variant="rectangular" width={120} height={36} sx={{ borderRadius: 2 }} />
    </Box>

    {/* Booking items skeleton - row layout */}
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Card key={index} sx={{ borderRadius: 2, boxShadow: 1 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* Left side - Avatar & Info */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0, width: '320px' }}>
                {/* Avatar skeleton */}
                <Skeleton variant="circular" width={56} height={56} sx={{ flexShrink: 0 }} />
                
                {/* Student & Lesson Info skeleton */}
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Skeleton variant="text" width="80%" height={24} />
                  <Skeleton variant="text" width="60%" height={20} />
                </Box>
              </Box>
              
              {/* Center - Info Fields Grid */}
              <Box sx={{ 
                display: { xs: 'none', md: 'grid' }, 
                gridTemplateColumns: 'repeat(3, 1fr)', 
                gap: 3, 
                flexShrink: 0,
                width: '450px'
              }}>
                {/* Date skeleton */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Skeleton variant="text" width={80} height={20} />
                    <Skeleton variant="text" width={90} height={16} />
                  </Box>
                </Box>
                
                {/* Slots skeleton */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Skeleton variant="text" width={60} height={20} />
                    <Skeleton variant="text" width={70} height={16} />
                  </Box>
                </Box>
                
                {/* Price skeleton */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Skeleton variant="text" width={70} height={20} />
                    <Skeleton variant="text" width={80} height={24} />
                  </Box>
                </Box>
              </Box>
              
              {/* Right side - Action skeleton */}
              <Skeleton variant="rectangular" width={100} height={32} sx={{ borderRadius: 1, flexShrink: 0, ml: 'auto' }} />
            </Box>
            
            {/* Mobile skeleton */}
            <Box sx={{ display: { xs: 'block', md: 'none' }, mt: 2, pt: 2, borderTop: '1px solid #f3f4f6' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Skeleton variant="text" width={120} height={16} />
                  <Skeleton variant="text" width={80} height={16} />
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Skeleton variant="text" width={60} height={14} />
                  <Skeleton variant="text" width={80} height={20} />
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  </Box>
);

// Helper function to get slot status text and color
const getSlotStatusInfo = (status) => {
  switch (status) {
    case 0: // Pending
      return { text: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-700' };
    case 1: // AwaitingConfirmation  
      return { text: 'Chờ xác nhận', color: 'bg-blue-100 text-blue-700' };
    case 2: // Completed
      return { text: 'Đã hoàn thành', color: 'bg-green-100 text-green-700' };
    case 3: // Cancelled
      return { text: 'Đã hủy', color: 'bg-red-100 text-red-700' };
    default:
      return { text: 'Không xác định', color: 'bg-gray-100 text-gray-700' };
  }
};

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
  
  // If there are mixed statuses (some completed, some not) - show as in progress
  if (completedSlots > 0 && completedSlots < totalSlots) {
    return { text: 'Đang diễn ra', color: 'bg-blue-100 text-blue-700' };
  }
  
  // If all slots are pending
  if (pendingSlots === totalSlots) {
    return { text: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-700' };
  }
  
  // If all slots are awaiting confirmation
  if (awaitingSlots === totalSlots) {
    return { text: 'Chờ xác nhận', color: 'bg-blue-100 text-blue-700' };
  }
  
  // Mixed status without completed slots - show as in progress
  return { text: 'Đang diễn ra', color: 'bg-blue-100 text-blue-700' };
};



const ScheduleTracking = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
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
  const [completingSlots, setCompletingSlots] = useState(new Set());

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async (page = 1) => {
    try {
      setLoading(true);
      const response = await fetchTutorBookings(page, 10);
      setBookings(response.items || []);
      setPagination({
        pageIndex: response.pageIndex,
        pageSize: response.pageSize,
        totalItems: response.totalItems,
        totalPages: response.totalPages,
        hasNextPage: response.hasNextPage,
        hasPreviousPage: response.hasPreviousPage
      });
    } catch (error) {
      console.error("Error loading bookings:", error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (booking) => {
    try {
      setSelectedBooking(booking);
      setIsDetailModalOpen(true);
      setDetailLoading(true);
      
      const detail = await fetchBookingDetail(booking.id);
      setBookingDetail(detail);
    } catch (error) {
      console.error("Error loading booking detail:", error);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedBooking(null);
    setBookingDetail(null);
    setDetailLoading(false);
    setCompletingSlots(new Set()); // Clear completing slots state when closing modal
  };



  const handlePageChange = (newPage) => {
    loadBookings(newPage);
  };

  const handleCompleteSlot = async (bookedSlotId) => {
    try {
      // Add slot ID to completing set to show loading state
      setCompletingSlots(prev => new Set([...prev, bookedSlotId]));
      
      await completeBookedSlot(bookedSlotId);
      
      // Refresh booking detail to get updated status
      if (selectedBooking) {
        const updatedDetail = await fetchBookingDetail(selectedBooking.id);
        setBookingDetail(updatedDetail);
      }
      
      // Also refresh the main bookings list
      loadBookings(pagination.pageIndex);
      
      // Show success message
      toast.success("Slot đã được hoàn thành thành công!");
      
    } catch (error) {
      console.error("Error completing slot:", error);
      toast.error("Có lỗi xảy ra khi hoàn thành slot. Vui lòng thử lại.");
    } finally {
      // Remove slot ID from completing set
      setCompletingSlots(prev => {
        const newSet = new Set(prev);
        newSet.delete(bookedSlotId);
        return newSet;
      });
    }
  };

  if (loading) {
    return <BookingTrackingSkeleton />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Khóa học đã được đặt</h2>
          <p className="text-gray-600 mt-1">Quản lý các khóa học mà học viên đã đặt</p>
        </div>
        <div className="text-sm text-gray-500">
          Tổng cộng: {pagination.totalItems} khóa học
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-12">
          <FaGraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có khóa học nào được đặt</h3>
          <p className="text-gray-500">Các khóa học được học viên đặt sẽ hiển thị tại đây.</p>
        </div>
      ) : (
        <>
          {/* Booking List - Row Layout */}
          <div className="space-y-4 mb-6">
            {bookings.map((booking) => (
              <motion.div
                key={booking.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-4">
                  {/* Left side - Avatar & Lesson Info */}
                  <div className="flex items-center gap-4 min-w-0" style={{width: '320px'}}>
                    {/* Student Avatar */}
                    <div className="flex-shrink-0">
                      <img
                        src={booking.learnerAvatarUrl || 'https://via.placeholder.com/56?text=L'}
                        alt={booking.learnerName}
                        className="w-14 h-14 rounded-full object-cover border-2 border-gray-200"
                      />
                    </div>
                    
                    {/* Student & Lesson Info */}
                    <div className="flex-grow min-w-0">
                      <div className="space-y-1">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {booking.lessonName}
                        </h3>
                        <div className="flex items-center text-gray-600">
                          <FaUser className="w-4 h-4 mr-2 text-blue-500" />
                          <span className="font-medium">{booking.learnerName}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Center - Info Fields Grid */}
                  <div className="hidden md:grid grid-cols-3 gap-6 flex-shrink-0" style={{width: '450px'}}>
                    {/* Date Created */}
                    <div className="flex items-center text-gray-600 justify-center">
                      <FaCalendarAlt className="w-4 h-4 mr-2 text-purple-500" />
                      <div className="text-center">
                        <div className="text-sm font-medium">Ngày tạo</div>
                        <div className="text-sm">{formatCentralTimestamp(booking.createdTime)}</div>
                      </div>
                    </div>
                    
                    {/* Slots Count */}
                    <div className="flex items-center text-gray-600 justify-center">
                      <FaClock className="w-4 h-4 mr-2 text-orange-500" />
                      <div className="text-center">
                        <div className="text-sm font-medium">Số buổi</div>
                        <div className="text-sm">{booking.slotCount} buổi học</div>
                      </div>
                    </div>
                    
                    {/* Price */}
                    <div className="flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-sm text-gray-500 mb-1">Tổng tiền</div>
                        <div className="text-lg font-bold text-blue-600">
                          {formatPriceWithCommas(booking.totalPrice)}đ
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right side - Action button */}
                  <div className="flex-shrink-0 ml-auto">
                    <button
                      onClick={() => handleViewDetail(booking)}
                      className="no-focus-outline flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <FaEye className="w-3 h-3" />
                      Chi tiết
                    </button>
                  </div>
                </div>
                
                {/* Mobile info - show on small screens */}
                <div className="md:hidden mt-3 pt-3 border-t border-gray-100">
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center">
                        <FaCalendarAlt className="w-3 h-3 mr-1 text-purple-500" />
                        <span>{formatCentralTimestamp(booking.createdTime)}</span>
                      </div>
                      <div className="flex items-center">
                        <FaClock className="w-3 h-3 mr-1 text-orange-500" />
                        <span>{booking.slotCount} buổi học</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">Tổng tiền</div>
                      <div className="font-bold text-blue-600">
                        {formatPriceWithCommas(booking.totalPrice)}đ
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
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
      <AnimatePresence>
        {isDetailModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDetailModal}
          >
            <motion.div 
              className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-hidden"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Chi tiết Booking</h3>
                  <p className="text-gray-500 mt-1">{selectedBooking?.lessonName}</p>
                </div>
                <button
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
                        {bookingDetail && (() => {
                          const overallStatus = getBookingOverallStatus(bookingDetail);
                          return overallStatus ? (
                            <span className={`px-3 py-1 text-sm rounded-full font-medium ${overallStatus.color}`}>
                              {overallStatus.text}
                            </span>
                          ) : null;
                        })()}
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
                          <p className="font-medium text-gray-900">{formatCentralTimestamp(selectedBooking?.createdTime)}</p>
                        </div>
                        <div>
                          <p className="text-gray-700">Buổi đầu tiên:</p>
                          <p className="font-medium text-gray-900">{formatCentralTimestamp(selectedBooking?.earliestBookedDate)}</p>
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
                                        Slot {slot.slotIndex || index + 1}
                                      </p>
                                      <div className="flex items-center gap-4 text-sm text-gray-600">
                                        <span className="flex items-center gap-1">
                                          <FaCalendarAlt className="w-3 h-3" />
                                          {formatCentralTimestamp(slot.bookedDate)}
                                        </span>
                                        {slot.slotNote && (
                                          <span className="text-xs text-gray-500">
                                            Ghi chú: {slot.slotNote}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
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
                                    {slot.status === 1 && ( // Show complete button only for "Chờ xác nhận" status
                                      <button
                                        onClick={() => handleCompleteSlot(slot.id)}
                                        disabled={completingSlots.has(slot.id)}
                                        className="no-focus-outline flex items-center gap-1 px-3 py-1 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        {completingSlots.has(slot.id) ? (
                                          <>
                                            <div className="inline-block w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span className="ml-1">Đang xử lý...</span>
                                          </>
                                        ) : (
                                          <>
                                            <FaCheck className="w-3 h-3" />
                                            <span>Hoàn thành</span>
                                          </>
                                        )}
                                      </button>
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


    </div>
  );
};

export default ScheduleTracking; 