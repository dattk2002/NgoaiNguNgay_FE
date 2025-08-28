import React, { useState, useEffect, useMemo } from 'react';
import { tutorBookingList, tutorCancelBookingByBookingId, fetchBookingDetailbyBookingId } from '../api/auth';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion, AnimatePresence } from "framer-motion";
import NoFocusOutLineButton from "../../utils/noFocusOutlineButton";
import formatPriceWithCommas from '../../utils/formatPriceWithCommas';
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
  const [bookingType, setBookingType] = useState(1); // Chỉ hiển thị Book thẳng (1=Instant)
  const [cancelBookingModalOpen, setCancelBookingModalOpen] = useState(false);
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancellingBooking, setCancellingBooking] = useState(false);
  
  // States for booking detail modal
  const [bookingDetailModalOpen, setBookingDetailModalOpen] = useState(false);
  const [selectedBookingForDetail, setSelectedBookingForDetail] = useState(null);
  const [bookingDetail, setBookingDetail] = useState(null);
  const [loadingBookingDetail, setLoadingBookingDetail] = useState(false);

  // Booking status mapping
  const bookingStatusMap = {
    0: "Đã xác nhận",
    1: "Đã yêu cầu khiếu nại", 
    2: "Đang tranh chấp",
    3: "Đã hủy"
  };

  // Held fund status mapping (assuming similar structure)
  const heldFundStatusMap = {
    0: "Đã xác nhận",
    1: "Đã yêu cầu khiếu nại", 
    2: "Đang tranh chấp",
    3: "Đã hủy"
  };

  // Function to sort booked slots by time (slotIndex)
  const sortBookedSlotsByTime = (slots) => {
    if (!slots || !Array.isArray(slots)) return [];
    return [...slots].sort((a, b) => {
      // Sort by slotIndex (time) in ascending order
      return (a.slotIndex || 0) - (b.slotIndex || 0);
    });
  };

  // Function to get status text
  const getStatusText = (status) => {
    return bookingStatusMap[status] || "Không xác định";
  };

  // Function to get held fund status text
  const getHeldFundStatusText = (status) => {
    return heldFundStatusMap[status] || "Không xác định";
  };

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
      toast.error("Không thể tải danh sách booking. Vui lòng thử lại!");
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
      toast.error("Không thể tải thông tin chi tiết booking. Vui lòng thử lại!");
    } finally {
      setLoadingBookingDetail(false);
    }
  };

  // Handle confirm cancel booking
  const handleConfirmCancelBooking = async () => {
    if (!selectedBookingForCancel || !cancelReason.trim()) {
      console.log("🚫 Toast: Vui lòng nhập lý do hủy booking!");
      toast.error("Vui lòng nhập lý do hủy booking!");
      return;
    }

    setCancellingBooking(true);
    try {
      await tutorCancelBookingByBookingId(selectedBookingForCancel.id, cancelReason.trim());
      
      // Close modal first
      setCancelBookingModalOpen(false);
      setSelectedBookingForCancel(null);
      setCancelReason("");
      
      // Reload the booking list to get updated data
      await loadBookings();
      
      // Show success toast after a small delay
      setTimeout(() => {
        console.log("✅ Toast: Đã hủy booking thành công!");
        toast.success("Đã hủy booking thành công!");
      }, 100);
      
    } catch (error) {
      console.error("Error cancelling booking:", error);
      
      // Show error toast with more specific message
      let errorMessage = "Hủy booking thất bại. Vui lòng thử lại!";
      
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      console.log("❌ Toast:", errorMessage);
      toast.error(errorMessage);
    } finally {
      setCancellingBooking(false);
    }
  };

  // Load bookings when component mounts or dependencies change
  useEffect(() => {
    console.log('🔄 useEffect triggered with dependencies:', { currentPage });
    loadBookings();
  }, [currentPage]);

  // Debug: Log state changes
  useEffect(() => {
    console.log('📊 State updated:', { 
      currentPage, 
      totalPages, 
      totalItems, 
      bookingType: 1, // Fixed to Book thẳng
      bookingsCount: bookings.length 
    });
  }, [currentPage, totalPages, totalItems, bookings.length]);

  // Reset currentPage if it exceeds totalPages
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      console.log('🔄 Resetting currentPage from', currentPage, 'to 1 (totalPages:', totalPages, ')');
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Học viên đã book thẳng</h2>
          <p className="text-gray-600">Quản lý booking từ học viên</p>
        </div>
      </div>

      {/* Statistics */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-bold text-blue-900">
                Tổng số booking: {totalItems}
              </p>
              <p className="text-sm text-blue-600">
                Trang {currentPage} / {totalPages}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-lg font-medium">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Book thẳng từ học viên
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Header Section Skeleton */}
              <div className="p-6 border-b border-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Skeleton Avatar */}
                    <div className="relative">
                      <div className="h-16 w-16 rounded-full bg-gray-200 animate-pulse ring-2 ring-gray-100"></div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gray-200 rounded-full animate-pulse"></div>
                    </div>

                    {/* Skeleton Learner Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-6 bg-gray-200 rounded animate-pulse" style={{ width: '150px' }}></div>
                        <div className="h-6 bg-gray-200 rounded-full animate-pulse" style={{ width: '100px' }}></div>
                      </div>
                      <div className="h-5 bg-gray-200 rounded animate-pulse" style={{ width: '200px' }}></div>
                    </div>
                  </div>

                  {/* Skeleton Action Buttons */}
                  <div className="flex items-center space-x-2">
                    <div className="h-9 bg-gray-200 rounded-lg animate-pulse" style={{ width: '80px' }}></div>
                    <div className="h-9 bg-gray-200 rounded-lg animate-pulse" style={{ width: '60px' }}></div>
                  </div>
                </div>
              </div>

              {/* Stats Section Skeleton */}
              <div className="p-6 bg-gray-50">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }, (_, cardIndex) => (
                    <div key={cardIndex} className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                        <div className="ml-3 flex-1">
                          <div className="h-3 bg-gray-200 rounded animate-pulse mb-2" style={{ width: '60px' }}></div>
                          <div className="h-5 bg-gray-200 rounded animate-pulse" style={{ width: '80px' }}></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6" role="alert">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-red-800">Đã xảy ra lỗi!</h3>
              <p className="mt-1 text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Bookings List */}
      {!loading && !error && (
        <div className="space-y-4">
          {bookings.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Không có booking nào</h3>
              <p className="text-gray-500">
                Chưa có yêu cầu booking nào từ học viên.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {bookings.map((booking) => (
                <div key={booking.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 overflow-hidden">
                  {/* Header Section */}
                  <div className="p-6 border-b border-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        {/* Learner Avatar */}
                        <div className="relative">
                          {booking.learnerAvatarUrl ? (
                            <img
                              src={booking.learnerAvatarUrl}
                              alt={booking.learnerName || 'Learner'}
                              className="h-16 w-16 rounded-full object-cover border-4 border-white shadow-lg ring-2 ring-blue-100"
                            />
                          ) : (
                            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 flex items-center justify-center text-white font-bold text-xl shadow-lg ring-2 ring-blue-100">
                              {(booking.learnerName || 'L').charAt(0).toUpperCase()}
                            </div>
                          )}
                          {/* Online indicator */}
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 border-2 border-white rounded-full"></div>
                        </div>

                        {/* Learner Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900">
                              {booking.learnerName || 'Không có tên'}
                            </h3>
                            <StatusTag status={booking.status} />
                          </div>
                          <p className="text-gray-600 font-medium flex items-center">
                            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            {booking.lessonName || 'Không có tên bài học'}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2">
                        <NoFocusOutLineButton
                          onClick={() => handleViewBookingDetail(booking)}
                          className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-sm font-medium hover:bg-blue-100 transition-all duration-200 shadow-sm"
                        >
                          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Chi tiết
                        </NoFocusOutLineButton>
                        <NoFocusOutLineButton
                          onClick={() => handleCancelBooking(booking)}
                          disabled={booking.status === 3}
                          className={`inline-flex items-center px-4 py-2 border rounded-lg text-sm font-medium transition-all duration-200 shadow-sm ${
                            booking.status === 3
                              ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                              : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                          }`}
                          title={booking.status === 3 ? "Booking đã được hủy" : "Hủy booking"}
                        >
                          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Hủy
                        </NoFocusOutLineButton>
                      </div>
                    </div>
                  </div>

                  {/* Stats Section */}
                  <div className="p-6 bg-gray-50">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Total Price */}
                      <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tổng giá</p>
                            <p className="text-lg font-bold text-gray-900">{booking.totalPrice || 0} VNĐ</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Slot Count */}
                      <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Số slot</p>
                            <p className="text-lg font-bold text-gray-900">{booking.slotCount || 0}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Created Date */}
                      <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 6v6m-7-3h14a2 2 0 002-2v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Ngày tạo</p>
                            <p className="text-sm font-semibold text-gray-900">{booking.createdTime ? formatTutorDate(booking.createdTime) : 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Earliest Date */}
                      <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                            <svg className="h-5 w-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 6v6m-7-3h14a2 2 0 002-2v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Ngày sớm nhất</p>
                            <p className="text-sm font-semibold text-gray-900">{booking.earliestBookedDate ? formatTutorDate(booking.earliestBookedDate) : 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[1000] p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setBookingDetailModalOpen(false)}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden relative"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-[#333333] text-white p-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">Chi tiết booking</h3>
                      <p className="text-blue-100 text-sm">Thông tin chi tiết về booking này</p>
                    </div>
                  </div>
                  <NoFocusOutLineButton
                    className="text-white/80 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
                    onClick={() => setBookingDetailModalOpen(false)}
                    aria-label="Close modal"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </NoFocusOutLineButton>
                </div>
              </div>

              {/* Content */}
              <div className="overflow-y-auto max-h-[calc(95vh-120px)]">
                {loadingBookingDetail ? (
                  <div className="p-6 space-y-6">
                    {/* Booking Overview Skeleton */}
                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        <div className="h-6 bg-gray-200 rounded animate-pulse" style={{ width: '200px' }}></div>
                        <div className="h-6 bg-gray-200 rounded-full animate-pulse" style={{ width: '100px' }}></div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[1, 2, 3].map((index) => (
                          <div key={index} className="bg-white rounded-lg p-4 border border-gray-100">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse mr-3"></div>
                              <div className="flex-1">
                                <div className="h-3 bg-gray-200 rounded animate-pulse mb-2" style={{ width: '60px' }}></div>
                                <div className="h-5 bg-gray-200 rounded animate-pulse" style={{ width: '80px' }}></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Participants Section Skeleton */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {[1, 2].map((index) => (
                        <div key={index} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                          <div className="h-12 bg-gray-200 animate-pulse"></div>
                          <div className="p-6">
                            <div className="flex items-center space-x-4">
                              <div className="h-20 w-20 rounded-full bg-gray-200 animate-pulse"></div>
                              <div className="flex-1">
                                <div className="h-6 bg-gray-200 rounded animate-pulse mb-2" style={{ width: '150px' }}></div>
                                <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: '80px' }}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Lesson Information Skeleton */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                      <div className="h-12 bg-gray-200 animate-pulse"></div>
                      <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((index) => (
                            <div key={index} className="space-y-2">
                              <div className="h-3 bg-gray-200 rounded animate-pulse" style={{ width: '80px' }}></div>
                              <div className="h-5 bg-gray-200 rounded animate-pulse" style={{ width: '120px' }}></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Booked Slots Skeleton */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                      <div className="h-12 bg-gray-200 animate-pulse"></div>
                      <div className="p-6">
                        <div className="space-y-4">
                          {[1, 2, 3].map((index) => (
                            <div key={index} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                                  <div>
                                    <div className="h-5 bg-gray-200 rounded animate-pulse mb-2" style={{ width: '100px' }}></div>
                                    <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: '120px' }}></div>
                                  </div>
                                </div>
                                <div className="h-6 bg-gray-200 rounded-full animate-pulse" style={{ width: '80px' }}></div>
                              </div>
                              <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <div className="h-4 bg-gray-200 rounded animate-pulse mb-3" style={{ width: '140px' }}></div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                  {[1, 2, 3, 4].map((subIndex) => (
                                    <div key={subIndex} className="space-y-1">
                                      <div className="h-2 bg-gray-200 rounded animate-pulse" style={{ width: '50px' }}></div>
                                      <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: '70px' }}></div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : bookingDetail ? (
                  <div className="p-6 space-y-6">
                    {/* Booking Overview */}
                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-xl font-bold text-gray-900 flex items-center">
                          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Tổng quan booking
                        </h4>
                        <StatusTag status={bookingDetail.status} />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white rounded-lg p-4 border border-gray-100">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 6v6m-7-3h14a2 2 0 002-2v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 font-medium">Ngày tạo</p>
                              <p className="text-lg font-bold text-gray-900">
                                {bookingDetail.createdTime ? formatTutorDate(bookingDetail.createdTime) : 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-gray-100">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 font-medium">Tổng giá</p>
                              <p className="text-lg font-bold text-gray-900">{bookingDetail.totalPrice || 0} VND</p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-gray-100">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 font-medium">Số slot</p>
                              <p className="text-lg font-bold text-gray-900">{bookingDetail.bookedSlots ? bookingDetail.bookedSlots.length : 0}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Participants Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Tutor Information */}
                      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4">
                          <h4 className="text-lg font-bold text-white flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Thông tin Tutor
                          </h4>
                        </div>
                        <div className="p-6">
                          <div className="flex items-center space-x-4">
                            {bookingDetail.tutorAvatarUrl ? (
                              <img
                                src={bookingDetail.tutorAvatarUrl}
                                alt={bookingDetail.tutorName || 'Tutor'}
                                className="h-20 w-20 rounded-full object-cover border-4 border-white shadow-lg ring-2 ring-green-100"
                              />
                            ) : (
                              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg ring-2 ring-green-100">
                                {(bookingDetail.tutorName || 'T').charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <h5 className="text-xl font-bold text-gray-900 mb-1">{bookingDetail.tutorName || 'N/A'}</h5>
                              <p className="text-gray-600">Tutor</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Learner Information */}
                      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="bg-gradient-to-r from-purple-500 to-violet-600 p-4">
                          <h4 className="text-lg font-bold text-white flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Thông tin Học viên
                          </h4>
                        </div>
                        <div className="p-6">
                          <div className="flex items-center space-x-4">
                            {bookingDetail.learnerAvatarUrl ? (
                              <img
                                src={bookingDetail.learnerAvatarUrl}
                                alt={bookingDetail.learnerName || 'Learner'}
                                className="h-20 w-20 rounded-full object-cover border-4 border-white shadow-lg ring-2 ring-purple-100"
                              />
                            ) : (
                              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg ring-2 ring-purple-100">
                                {(bookingDetail.learnerName || 'L').charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <h5 className="text-xl font-bold text-gray-900 mb-1">{bookingDetail.learnerName || 'N/A'}</h5>
                              <p className="text-gray-600">Học viên</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Lesson Information */}
                    {bookingDetail.lessonSnapshot && (
                      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="bg-gradient-to-r from-orange-500 to-red-600 p-4">
                          <h4 className="text-lg font-bold text-white flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            Thông tin Bài học
                          </h4>
                        </div>
                        <div className="p-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="space-y-2">
                              <p className="text-sm text-gray-500 font-medium">Tên bài học</p>
                              <p className="text-lg font-bold text-gray-900">{bookingDetail.lessonSnapshot.name || 'N/A'}</p>
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm text-gray-500 font-medium">Mô tả</p>
                              <p className="text-gray-900">{bookingDetail.lessonSnapshot.description || 'N/A'}</p>
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm text-gray-500 font-medium">Ghi chú</p>
                              <p className="text-gray-900">{bookingDetail.lessonSnapshot.note || 'N/A'}</p>
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm text-gray-500 font-medium">Đối tượng mục tiêu</p>
                              <p className="text-gray-900">{bookingDetail.lessonSnapshot.targetAudience || 'N/A'}</p>
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm text-gray-500 font-medium">Yêu cầu đầu vào</p>
                              <p className="text-gray-900">{bookingDetail.lessonSnapshot.prerequisites || 'N/A'}</p>
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm text-gray-500 font-medium">Ngôn ngữ</p>
                              <p className="text-gray-900">{bookingDetail.lessonSnapshot.languageCode || 'N/A'}</p>
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm text-gray-500 font-medium">Danh mục</p>
                              <p className="text-gray-900">{bookingDetail.lessonSnapshot.category || 'N/A'}</p>
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm text-gray-500 font-medium">Giá mỗi slot</p>
                              <p className="text-lg font-bold text-green-600">{bookingDetail.lessonSnapshot.price || 0} {bookingDetail.lessonSnapshot.currency || 'VND'}</p>
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm text-gray-500 font-medium">Thời lượng</p>
                              <p className="text-gray-900">{bookingDetail.lessonSnapshot.durationInMinutes || 0} phút</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Booked Slots */}
                    {bookingDetail.bookedSlots && bookingDetail.bookedSlots.length > 0 && (
                      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="bg-gradient-to-r from-teal-500 to-cyan-600 p-4">
                          <h4 className="text-lg font-bold text-white flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Các slot đã book ({bookingDetail.bookedSlots.length})
                          </h4>
                        </div>
                        <div className="p-6">
                          <div className="space-y-4">
                            {sortBookedSlotsByTime(bookingDetail.bookedSlots).map((slot, index) => (
                              <div key={slot.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                                      <span className="text-teal-600 font-bold">{index + 1}</span>
                                    </div>
                                    <div>
                                      <h5 className="text-lg font-bold text-gray-900">
                                        {slot.slotIndex !== undefined ? formatSlotTime(slot.slotIndex) : 'N/A'}
                                      </h5>
                                      <p className="text-gray-600">
                                        Slot {slot.slotIndex !== undefined ? slot.slotIndex : 'N/A'} • {slot.bookedDate ? formatTutorDate(slot.bookedDate) : 'N/A'}
                                      </p>
                                    </div>
                                  </div>
                                  <StatusTag status={slot.status} />
                                </div>
                                
                                {/* Held Fund Information */}
                                {slot.heldFund && (
                                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                                    <h6 className="text-sm font-bold text-gray-700 mb-3 flex items-center">
                                      <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                      </svg>
                                      Thông tin quỹ giữ
                                    </h6>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                      <div className="space-y-1">
                                        <p className="text-xs text-gray-500 font-medium">Số tiền</p>
                                        <p className="text-lg font-bold text-gray-900">{formatPriceWithCommas(slot.heldFund.amount || 0)} VND</p>
                                      </div>
                                      <div className="space-y-1">
                                        <p className="text-xs text-gray-500 font-medium">Trạng thái</p>
                                        <p className="text-sm font-semibold text-gray-900">{getHeldFundStatusText(slot.heldFund.status)}</p>
                                      </div>
                                      <div className="space-y-1">
                                        <p className="text-xs text-gray-500 font-medium">Ngày trả tiền</p>
                                        <p className="text-sm text-gray-900">
                                          {slot.heldFund.releaseAt ? formatTutorDate(slot.heldFund.releaseAt) : 'N/A'}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                                
                                {slot.slotNote && (
                                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                    <p className="text-sm text-blue-800">
                                      <span className="font-medium">Ghi chú:</span> {slot.slotNote}
                                    </p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Additional Information */}
                    {bookingDetail.note && (
                      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="bg-gradient-to-r from-gray-500 to-gray-600 p-4">
                          <h4 className="text-lg font-bold text-white flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Thông tin bổ sung
                          </h4>
                        </div>
                        <div className="p-6">
                          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                            <p className="text-gray-900">{bookingDetail.note}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Không có thông tin chi tiết</h3>
                    <p className="text-gray-500">
                      Không thể tải thông tin chi tiết booking.
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex justify-end">
                  <NoFocusOutLineButton
                    className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                    onClick={() => setBookingDetailModalOpen(false)}
                  >
                    Đóng
                  </NoFocusOutLineButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
       
       {/* Toast Container for this component */}
       <ToastContainer
         position="top-right"
         autoClose={4000}
         hideProgressBar={false}
         newestOnTop={false}
         closeOnClick
         rtl={false}
         pauseOnFocusLoss
         draggable
         pauseOnHover
         theme="light"
         style={{ zIndex: 99999 }}
       />
     </div>
   );
 };

// Status Tag Component
const StatusTag = ({ status }) => {
  const getStatusInfo = (status) => {
    switch (status) {
      case 0:
        return {
          text: "Đã xác nhận",
          className: "bg-green-50 text-green-700 border border-green-200",
          icon: (
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )
        };
      case 1:
        return {
          text: "Đã yêu cầu khiếu nại",
          className: "bg-yellow-50 text-yellow-700 border border-yellow-200",
          icon: (
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )
        };
      case 2:
        return {
          text: "Đang tranh chấp",
          className: "bg-orange-50 text-orange-700 border border-orange-200",
          icon: (
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" />
            </svg>
          )
        };
      case 3:
        return {
          text: "Đã hủy",
          className: "bg-red-50 text-red-700 border border-red-200",
          icon: (
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          )
        };
      default:
        return {
          text: "Không xác định",
          className: "bg-gray-50 text-gray-700 border border-gray-200",
          icon: (
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          )
        };
    }
  };

  const statusInfo = getStatusInfo(status);
  
  return (
    <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${statusInfo.className} shadow-sm`}>
      {statusInfo.icon}
      {statusInfo.text}
    </div>
  );
};

export default BookingRequests;
