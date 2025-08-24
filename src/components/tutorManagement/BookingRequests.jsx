import React, { useState, useEffect, useMemo } from 'react';
import { tutorBookingList, tutorCancelBookingByBookingId, fetchBookingDetailbyBookingId } from '../api/auth';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from "framer-motion";
import NoFocusOutLineButton from "../../utils/noFocusOutlineButton";
// import { formatPriceWithCommas } from '../../utils/formatPriceWithCommas';
import { formatSlotTime } from '../../utils/formatSlotTime';
import { formatTutorDate } from '../../utils/formatTutorDate';

const BookingRequests = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [bookingType, setBookingType] = useState(0); // 0=All, 1=Instant, 2=Offer
  const [cancelBookingModalOpen, setCancelBookingModalOpen] = useState(false);
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancellingBooking, setCancellingBooking] = useState(false);
  
  // States for booking detail modal
  const [bookingDetailModalOpen, setBookingDetailModalOpen] = useState(false);
  const [selectedBookingForDetail, setSelectedBookingForDetail] = useState(null);
  const [bookingDetail, setBookingDetail] = useState(null);
  const [loadingBookingDetail, setLoadingBookingDetail] = useState(false);

  // Toast configuration
  const toastConfig = useMemo(() => ({
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  }), []);

  // Load bookings
  const loadBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Loading bookings with params:', { currentPage, pageSize, bookingType });
      const response = await tutorBookingList(currentPage, pageSize, bookingType);
      console.log('✅ Bookings response received:', response);

      if (response && response.data) {
        setBookings(response.data.items || []);
        
        // Update pagination info - DON'T update currentPage from API response
        if (response.data) {
          setTotalItems(response.data.totalItems || 0);
          setTotalPages(response.data.totalPages || 1);
          // Remove this line to prevent infinite loop:
          // setCurrentPage(response.data.currentPageNumber || 1);
        }
      }
    } catch (err) {
      setError(err.message);
      console.error('Error loading bookings:', err);
      toast.error("Không thể tải danh sách booking. Vui lòng thử lại!", toastConfig);
    } finally {
      setLoading(false);
    }
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    // Validate page number
    if (newPage >= 1 && newPage <= totalPages) {
      console.log('📄 Changing page from', currentPage, 'to', newPage);
      setCurrentPage(newPage);
    } else {
      console.warn('⚠️ Invalid page number:', newPage, 'Total pages:', totalPages);
    }
  };

  // Handle booking type change
  const handleBookingTypeChange = (newType) => {
    setBookingType(newType);
    setCurrentPage(1); // Reset to first page when changing type
  };

  // Handle cancel booking
  const handleCancelBooking = (booking) => {
    setSelectedBookingForCancel(booking);
    setCancelReason("");
    setCancelBookingModalOpen(true);
  };

  // Handle view booking detail
  const handleViewBookingDetail = async (booking) => {
    setSelectedBookingForDetail(booking);
    setBookingDetailModalOpen(true);
    setLoadingBookingDetail(true);
    setBookingDetail(null);

    try {
      const response = await fetchBookingDetailbyBookingId(booking.id);
      console.log('✅ Booking detail response:', response);
      setBookingDetail(response.data);
    } catch (error) {
      console.error('Error fetching booking detail:', error);
      toast.error("Không thể tải thông tin chi tiết booking. Vui lòng thử lại!", toastConfig);
    } finally {
      setLoadingBookingDetail(false);
    }
  };

  // Handle confirm cancel booking
  const handleConfirmCancelBooking = async () => {
    if (!selectedBookingForCancel || !cancelReason.trim()) {
      toast.error("Vui lòng nhập lý do hủy booking!", toastConfig);
      return;
    }

    setCancellingBooking(true);
    try {
      await tutorCancelBookingByBookingId(selectedBookingForCancel.id, cancelReason.trim());
      toast.success("Đã hủy booking thành công!", toastConfig);
      
      // Remove the cancelled booking from the list
      setBookings(prev => prev.filter(booking => booking.id !== selectedBookingForCancel.id));
      
      // Update total items count
      setTotalItems(prev => prev - 1);
      
      setCancelBookingModalOpen(false);
      setSelectedBookingForCancel(null);
      setCancelReason("");
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast.error("Hủy booking thất bại. Vui lòng thử lại!", toastConfig);
    } finally {
      setCancellingBooking(false);
    }
  };

  // Load bookings when component mounts or dependencies change
  useEffect(() => {
    console.log('🔄 useEffect triggered with dependencies:', { currentPage, bookingType });
    loadBookings();
  }, [currentPage, bookingType]);

  // Debug: Log state changes
  useEffect(() => {
    console.log('📊 State updated:', { 
      currentPage, 
      totalPages, 
      totalItems, 
      bookingType, 
      bookingsCount: bookings.length 
    });
  }, [currentPage, totalPages, totalItems, bookingType, bookings.length]);

  // Reset currentPage if it exceeds totalPages
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      console.log('🔄 Resetting currentPage from', currentPage, 'to 1 (totalPages:', totalPages, ')');
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  // Get booking type text
  const getBookingTypeText = (type) => {
    switch (type) {
      case 1:
        return "Book thẳng";
      case 2:
        return "Offer";
      default:
        return "Tất cả";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Yêu cầu booking</h2>
          <p className="text-gray-600">Quản lý các yêu cầu booking từ học viên</p>
        </div>
        
        {/* Booking Type Filter */}
        <div className="flex gap-2">
          {[0, 1, 2].map((type) => (
            <NoFocusOutLineButton
              key={type}
              onClick={() => handleBookingTypeChange(type)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                bookingType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {getBookingTypeText(type)}
            </NoFocusOutLineButton>
          ))}
        </div>
      </div>

      {/* Statistics */}
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-800">
              Tổng số booking: {totalItems}
            </p>
            <p className="text-xs text-blue-600">
              Trang {currentPage} / {totalPages}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-blue-800">
              Loại: {getBookingTypeText(bookingType)}
            </p>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {Array.from({ length: 3 }, (_, index) => (
              <li key={index} className="px-6 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    {/* Skeleton Avatar */}
                    <div className="flex-shrink-0 h-16 w-16">
                      <div className="h-16 w-16 rounded-full bg-gray-200 animate-pulse"></div>
                    </div>

                    {/* Skeleton Content */}
                    <div className="ml-6 flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="h-6 bg-gray-200 rounded animate-pulse mb-2" style={{ width: '150px' }}></div>
                          <div className="h-5 bg-gray-200 rounded animate-pulse" style={{ width: '200px' }}></div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Skeleton Cards */}
                        {Array.from({ length: 4 }, (_, cardIndex) => (
                          <div key={cardIndex} className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full animate-pulse mr-3"></div>
                            <div className="flex-1">
                              <div className="h-3 bg-gray-200 rounded animate-pulse mb-1" style={{ width: '60px' }}></div>
                              <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: '80px' }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Skeleton Button */}
                  <div className="flex items-center space-x-3 ml-6">
                    <div className="h-10 bg-gray-200 rounded-lg animate-pulse" style={{ width: '120px' }}></div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Lỗi! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Bookings List */}
      {!loading && !error && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {bookings.length === 0 ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Không có booking nào</h3>
              <p className="mt-1 text-sm text-gray-500">
                Chưa có yêu cầu booking nào từ học viên.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {bookings.map((booking) => (
                <li key={booking.id} className="px-6 py-6 hover:bg-gray-50 transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      {/* Learner Avatar */}
                      <div className="flex-shrink-0 h-16 w-16">
                        {booking.learnerAvatarUrl ? (
                          <img
                            src={booking.learnerAvatarUrl}
                            alt={booking.learnerName || 'Learner'}
                            className="h-16 w-16 rounded-full object-cover border-3 border-gradient-to-r from-blue-500 to-purple-600 shadow-lg"
                          />
                        ) : (
                          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                            {(booking.learnerName || 'L').charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>

                      {/* Booking Details */}
                      <div className="ml-6 flex-1">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                              {booking.learnerName || 'Không có tên'}
                            </h3>
                            <p className="text-base text-gray-600 font-medium">{booking.lessonName || 'Không có tên bài học'}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="flex items-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                              <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-xs text-blue-600 font-medium">Tổng giá</p>
                              <p className="text-sm font-bold text-gray-900">{booking.totalPrice || 0} VNĐ</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center p-3 bg-green-50 rounded-lg border border-green-100">
                            <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                              <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-xs text-green-600 font-medium">Số slot</p>
                              <p className="text-sm font-bold text-gray-900">{booking.slotCount || 0}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center p-3 bg-purple-50 rounded-lg border border-purple-100">
                            <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                              <svg className="h-4 w-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 6v6m-7-3h14a2 2 0 002-2v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-xs text-purple-600 font-medium">Ngày tạo</p>
                              <p className="text-sm font-bold text-gray-900">{booking.createdTime ? formatTutorDate(booking.createdTime) : 'N/A'}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center p-3 bg-orange-50 rounded-lg border border-orange-100">
                            <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                              <svg className="h-4 w-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 6v6m-7-3h14a2 2 0 002-2v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-xs text-orange-600 font-medium">Ngày sớm nhất</p>
                              <p className="text-sm font-bold text-gray-900">{booking.earliestBookedDate ? formatTutorDate(booking.earliestBookedDate) : 'N/A'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-3 ml-6">
                      <NoFocusOutLineButton
                        onClick={() => handleViewBookingDetail(booking)}
                        className="inline-flex items-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Chi tiết
                      </NoFocusOutLineButton>
                      <NoFocusOutLineButton
                        onClick={() => handleCancelBooking(booking)}
                        className="inline-flex items-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Hủy booking
                      </NoFocusOutLineButton>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <NoFocusOutLineButton 
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Trước
            </NoFocusOutLineButton>
            <NoFocusOutLineButton 
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Sau
            </NoFocusOutLineButton>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Hiển thị <span className="font-medium">{((currentPage - 1) * pageSize) + 1}</span> đến{' '}
                <span className="font-medium">{Math.min(currentPage * pageSize, totalItems)}</span> trong tổng số{' '}
                <span className="font-medium">{totalItems}</span> kết quả
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <NoFocusOutLineButton 
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <span className="sr-only">Trước</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </NoFocusOutLineButton>
                
                {/* Page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <NoFocusOutLineButton
                      key={pageNum}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        pageNum === currentPage
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </NoFocusOutLineButton>
                  );
                })}
                
                <NoFocusOutLineButton 
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <span className="sr-only">Sau</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </NoFocusOutLineButton>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Booking Modal */}
      <AnimatePresence>
        {cancelBookingModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000] p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCancelBookingModalOpen(false)}
          >
            <motion.div
              className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Xác nhận hủy booking</h3>
                <NoFocusOutLineButton
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setCancelBookingModalOpen(false)}
                  aria-label="Close modal"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </NoFocusOutLineButton>
              </div>
              
              <div className="mb-4">
                {selectedBookingForCancel && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Thông tin booking:</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><strong>Học viên:</strong> {selectedBookingForCancel.learnerName}</p>
                      <p><strong>Bài học:</strong> {selectedBookingForCancel.lessonName}</p>
                      <p><strong>Tổng giá:</strong> {selectedBookingForCancel.totalPrice || 0} VNĐ</p>
                      <p><strong>Số slot:</strong> {selectedBookingForCancel.slotCount}</p>
                      <p><strong>Ngày sớm nhất:</strong> {selectedBookingForCancel.earliestBookedDate ? formatTutorDate(selectedBookingForCancel.earliestBookedDate) : 'N/A'}</p>
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lý do hủy booking <span className="text-red-500">*</span>:
                  </label>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-md text-black resize-none"
                    placeholder="Vui lòng nhập lý do hủy booking..."
                    required
                  />
                </div>
                
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">
                    ⚠️ Lưu ý: Việc hủy booking sẽ không thể hoàn tác. Vui lòng cân nhắc kỹ trước khi thực hiện.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3 justify-end">
                <NoFocusOutLineButton
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                  onClick={() => setCancelBookingModalOpen(false)}
                  disabled={cancellingBooking}
                >
                  Hủy
                </NoFocusOutLineButton>
                <NoFocusOutLineButton
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors flex items-center gap-2"
                  onClick={handleConfirmCancelBooking}
                  disabled={cancellingBooking || !cancelReason.trim()}
                >
                  {cancellingBooking ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      ❌ Xác nhận hủy
                    </>
                  )}
                </NoFocusOutLineButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Booking Detail Modal */}
      <AnimatePresence>
        {bookingDetailModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000] p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setBookingDetailModalOpen(false)}
          >
            <motion.div
              className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 relative"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Chi tiết booking</h3>
                <NoFocusOutLineButton
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setBookingDetailModalOpen(false)}
                  aria-label="Close modal"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </NoFocusOutLineButton>
              </div>
              
              {loadingBookingDetail ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Đang tải thông tin chi tiết...</span>
                </div>
              ) : bookingDetail ? (
                                 <div className="space-y-6">
                   {/* Basic Information */}
                   <div className="bg-blue-50 rounded-lg p-4">
                     <h4 className="text-lg font-semibold text-blue-800 mb-3">Thông tin cơ bản</h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div>
                         <p className="text-sm text-blue-600 font-medium">ID Booking</p>
                         <p className="text-gray-900 font-semibold">{bookingDetail.id || 'N/A'}</p>
                       </div>
                       <div>
                         <p className="text-sm text-blue-600 font-medium">ID Tutor</p>
                         <p className="text-gray-900 font-semibold">{bookingDetail.tutorId || 'N/A'}</p>
                       </div>
                       <div>
                         <p className="text-sm text-blue-600 font-medium">ID Learner</p>
                         <p className="text-gray-900 font-semibold">{bookingDetail.learnerId || 'N/A'}</p>
                       </div>
                       <div>
                         <p className="text-sm text-blue-600 font-medium">Ngày tạo</p>
                         <p className="text-gray-900 font-semibold">
                           {bookingDetail.createdTime ? formatTutorDate(bookingDetail.createdTime) : 'N/A'}
                         </p>
                       </div>
                     </div>
                   </div>

                   {/* Tutor Information */}
                   <div className="bg-green-50 rounded-lg p-4">
                     <h4 className="text-lg font-semibold text-green-800 mb-3">Thông tin tutor</h4>
                     <div className="flex items-center mb-4">
                       {bookingDetail.tutorAvatarUrl ? (
                         <img
                           src={bookingDetail.tutorAvatarUrl}
                           alt={bookingDetail.tutorName || 'Tutor'}
                           className="h-16 w-16 rounded-full object-cover border-2 border-green-200 shadow-lg mr-4"
                         />
                       ) : (
                         <div className="h-16 w-16 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-bold text-xl shadow-lg mr-4">
                           {(bookingDetail.tutorName || 'T').charAt(0).toUpperCase()}
                         </div>
                       )}
                       <div>
                         <p className="text-lg font-semibold text-gray-900">{bookingDetail.tutorName || 'N/A'}</p>
                       </div>
                     </div>
                   </div>

                   {/* Learner Information */}
                   <div className="bg-purple-50 rounded-lg p-4">
                     <h4 className="text-lg font-semibold text-purple-800 mb-3">Thông tin học viên</h4>
                     <div className="flex items-center mb-4">
                       {bookingDetail.learnerAvatarUrl ? (
                         <img
                           src={bookingDetail.learnerAvatarUrl}
                           alt={bookingDetail.learnerName || 'Learner'}
                           className="h-16 w-16 rounded-full object-cover border-2 border-purple-200 shadow-lg mr-4"
                         />
                       ) : (
                         <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg mr-4">
                           {(bookingDetail.learnerName || 'L').charAt(0).toUpperCase()}
                         </div>
                       )}
                       <div>
                         <p className="text-lg font-semibold text-gray-900">{bookingDetail.learnerName || 'N/A'}</p>
                       </div>
                     </div>
                   </div>

                   {/* Lesson Information */}
                   {bookingDetail.lessonSnapshot && (
                     <div className="bg-orange-50 rounded-lg p-4">
                       <h4 className="text-lg font-semibold text-orange-800 mb-3">Thông tin bài học</h4>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                           <p className="text-sm text-orange-600 font-medium">Tên bài học</p>
                           <p className="text-gray-900 font-semibold">{bookingDetail.lessonSnapshot.name || 'N/A'}</p>
                         </div>
                         <div>
                           <p className="text-sm text-orange-600 font-medium">Mô tả</p>
                           <p className="text-gray-900 font-semibold">{bookingDetail.lessonSnapshot.description || 'N/A'}</p>
                         </div>
                         <div>
                           <p className="text-sm text-orange-600 font-medium">Ghi chú</p>
                           <p className="text-gray-900 font-semibold">{bookingDetail.lessonSnapshot.note || 'N/A'}</p>
                         </div>
                         <div>
                           <p className="text-sm text-orange-600 font-medium">Đối tượng mục tiêu</p>
                           <p className="text-gray-900 font-semibold">{bookingDetail.lessonSnapshot.targetAudience || 'N/A'}</p>
                         </div>
                         <div>
                           <p className="text-sm text-orange-600 font-medium">Yêu cầu đầu vào</p>
                           <p className="text-gray-900 font-semibold">{bookingDetail.lessonSnapshot.prerequisites || 'N/A'}</p>
                         </div>
                         <div>
                           <p className="text-sm text-orange-600 font-medium">Ngôn ngữ</p>
                           <p className="text-gray-900 font-semibold">{bookingDetail.lessonSnapshot.languageCode || 'N/A'}</p>
                         </div>
                         <div>
                           <p className="text-sm text-orange-600 font-medium">Danh mục</p>
                           <p className="text-gray-900 font-semibold">{bookingDetail.lessonSnapshot.category || 'N/A'}</p>
                         </div>
                         <div>
                           <p className="text-sm text-orange-600 font-medium">Giá mỗi slot</p>
                           <p className="text-gray-900 font-semibold">{bookingDetail.lessonSnapshot.price || 0} {bookingDetail.lessonSnapshot.currency || 'VND'}</p>
                         </div>
                         <div>
                           <p className="text-sm text-orange-600 font-medium">Thời lượng (phút)</p>
                           <p className="text-gray-900 font-semibold">{bookingDetail.lessonSnapshot.durationInMinutes || 0}</p>
                         </div>
                         <div>
                           <p className="text-sm text-orange-600 font-medium">ID Bài học gốc</p>
                           <p className="text-gray-900 font-semibold">{bookingDetail.lessonSnapshot.originalLessonId || 'N/A'}</p>
                         </div>
                       </div>
                     </div>
                   )}

                   {/* Financial Information */}
                   <div className="bg-indigo-50 rounded-lg p-4">
                     <h4 className="text-lg font-semibold text-indigo-800 mb-3">Thông tin tài chính</h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div>
                         <p className="text-sm text-indigo-600 font-medium">Tổng giá</p>
                         <p className="text-gray-900 font-semibold">{bookingDetail.totalPrice || 0} VND</p>
                       </div>
                       <div>
                         <p className="text-sm text-indigo-600 font-medium">Số slot đã book</p>
                         <p className="text-gray-900 font-semibold">{bookingDetail.bookedSlots ? bookingDetail.bookedSlots.length : 0}</p>
                       </div>
                       <div>
                         <p className="text-sm text-indigo-600 font-medium">ID Offer gốc</p>
                         <p className="text-gray-900 font-semibold">{bookingDetail.originalOfferId || 'Không có'}</p>
                       </div>
                     </div>
                   </div>

                   {/* Booked Slots */}
                   {bookingDetail.bookedSlots && bookingDetail.bookedSlots.length > 0 && (
                     <div className="bg-teal-50 rounded-lg p-4">
                       <h4 className="text-lg font-semibold text-teal-800 mb-3">Các slot đã book ({bookingDetail.bookedSlots.length})</h4>
                       <div className="space-y-4">
                         {bookingDetail.bookedSlots.map((slot, index) => (
                           <div key={slot.id} className="bg-white rounded-lg p-4 border border-teal-200">
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                               <div>
                                 <p className="text-sm text-teal-600 font-medium">ID Slot</p>
                                 <p className="text-gray-900 font-semibold text-xs">{slot.id}</p>
                               </div>
                               <div>
                                 <p className="text-sm text-teal-600 font-medium">Ngày</p>
                                 <p className="text-gray-900 font-semibold">
                                   {slot.bookedDate ? formatTutorDate(slot.bookedDate) : 'N/A'}
                                 </p>
                               </div>
                               <div>
                                 <p className="text-sm text-teal-600 font-medium">Slot</p>
                                 <p className="text-gray-900 font-semibold">
                                   {slot.slotIndex !== undefined ? formatSlotTime(slot.slotIndex) : 'N/A'}
                                 </p>
                               </div>
                               <div>
                                 <p className="text-sm text-teal-600 font-medium">Trạng thái</p>
                                 <p className="text-gray-900 font-semibold">{slot.status || 'N/A'}</p>
                               </div>
                             </div>
                             
                             {/* Held Fund Information */}
                             {slot.heldFund && (
                               <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                 <h5 className="text-sm font-semibold text-gray-700 mb-2">Thông tin quỹ giữ</h5>
                                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                   <div>
                                     <p className="text-xs text-gray-500 font-medium">ID Quỹ</p>
                                     <p className="text-gray-900 text-xs">{slot.heldFund.id}</p>
                                   </div>
                                   <div>
                                     <p className="text-xs text-gray-500 font-medium">Số tiền</p>
                                     <p className="text-gray-900 font-semibold">{slot.heldFund.amount || 0} VND</p>
                                   </div>
                                   <div>
                                     <p className="text-xs text-gray-500 font-medium">Trạng thái</p>
                                     <p className="text-gray-900 font-semibold">{slot.heldFund.status || 'N/A'}</p>
                                   </div>
                                   <div>
                                     <p className="text-xs text-gray-500 font-medium">Ngày giải phóng</p>
                                     <p className="text-gray-900 text-xs">
                                       {slot.heldFund.releaseAt ? formatTutorDate(slot.heldFund.releaseAt) : 'N/A'}
                                     </p>
                                   </div>
                                   <div>
                                     <p className="text-xs text-gray-500 font-medium">Ngày giải quyết</p>
                                     <p className="text-gray-900 text-xs">
                                       {slot.heldFund.resolvedAt ? formatTutorDate(slot.heldFund.resolvedAt) : 'N/A'}
                                     </p>
                                   </div>
                                   <div>
                                     <p className="text-xs text-gray-500 font-medium">Ngày tạo</p>
                                     <p className="text-gray-900 text-xs">
                                       {slot.heldFund.createdAt ? formatTutorDate(slot.heldFund.createdAt) : 'N/A'}
                                     </p>
                                   </div>
                                 </div>
                               </div>
                             )}
                             
                             {slot.slotNote && (
                               <div className="mt-2">
                                 <p className="text-sm text-gray-600 font-medium">Ghi chú slot:</p>
                                 <p className="text-gray-900 text-sm">{slot.slotNote}</p>
                               </div>
                             )}
                           </div>
                         ))}
                       </div>
                     </div>
                   )}

                   {/* Additional Information */}
                   <div className="bg-gray-50 rounded-lg p-4">
                     <h4 className="text-lg font-semibold text-gray-800 mb-3">Thông tin bổ sung</h4>
                     <div className="space-y-3">
                       {bookingDetail.note && (
                         <div>
                           <p className="text-sm text-gray-600 font-medium">Ghi chú booking</p>
                           <p className="text-gray-900">{bookingDetail.note}</p>
                         </div>
                       )}
                     </div>
                   </div>
                 </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Không có thông tin chi tiết</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Không thể tải thông tin chi tiết booking.
                  </p>
                </div>
              )}
              
              <div className="flex justify-end mt-6">
                <NoFocusOutLineButton
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                  onClick={() => setBookingDetailModalOpen(false)}
                >
                  Đóng
                </NoFocusOutLineButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BookingRequests;
