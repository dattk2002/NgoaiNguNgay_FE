import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MyBookingTable from "../components/MyBookingTable";
import LessonManagement from "../components/LessonManagement";
import MyDisputes from "../components/MyDisputes";
import { getAllLearnerBookingOffer, deleteLearnerBookingTimeSlot, fetchLearnerBookings, fetchBookingDetail, submitBookingRating, getBookingRating } from "../components/api/auth";
import ConfirmDialog from "../components/modals/ConfirmDialog";
import CreateDisputeModal from "../components/modals/CreateDisputeModal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Avatar, Typography, Skeleton, Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, TextField } from "@mui/material";
import { convertBookingDetailToUTC7 } from "../utils/formatCentralTimestamp";
import { sortSlotsByChronologicalOrder } from "../utils/formatSlotTime";
import { formatSlotDateTimeUTC0 } from "../utils/formatSlotTime";

// Toast configuration
const toastConfig = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

// Booking History Component
const BookingHistory = () => {
  const [historyBookings, setHistoryBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize] = useState(10);
  const [expandedItems, setExpandedItems] = useState(new Set());
  
  // Rating modal states
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedBookingForRating, setSelectedBookingForRating] = useState(null);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [ratingData, setRatingData] = useState({
    teachingQuality: 3.0,
    attitude: 3.0,
    commitment: 3.0,
    comment: ""
  });
  
  // Existing ratings data
  const [bookingRatings, setBookingRatings] = useState(new Map());

  const fetchHistoryBookings = async () => {
    setLoading(true);
    try {
      const response = await fetchLearnerBookings(currentPage, pageSize);
      if (response && Array.isArray(response.items)) {
        const bookingList = response.items;
        
        // Filter only cancelled and completed bookings
        const historyBookings = bookingList.filter(booking => 
          booking.status === 3 || booking.status === 4 // 3: Đã hủy, 4: Hoàn thành
        );
        
        // Process bookings to get additional details
        const processedBookings = await Promise.all(
          historyBookings.map(async (booking) => {
            try {
              const baseBooking = {
                ...booking,
                lessonSnapshot: { name: booking.lessonName },
                bookedSlots: []
              };
              
              try {
                const detail = await fetchBookingDetail(booking.id);
                const convertedDetail = convertBookingDetailToUTC7(detail);
                        if (convertedDetail.bookedSlots && Array.isArray(convertedDetail.bookedSlots)) {
          baseBooking.bookedSlots = sortSlotsByChronologicalOrder(convertedDetail.bookedSlots);
        }
                baseBooking.status = booking.status;
              } catch (detailError) {
                console.error(`Failed to fetch detail for booking ${booking.id}:`, detailError);
              }
              
              return baseBooking;
            } catch (error) {
              console.error(`Failed to process booking ${booking.id}:`, error);
              return null;
            }
          })
        );
        
        const validBookings = processedBookings.filter(booking => booking !== null);
        setHistoryBookings(validBookings);
        setTotalCount(response.totalCount || validBookings.length);
        
        // Fetch ratings for completed bookings
        await fetchBookingRatings(validBookings);
      } else {
        setHistoryBookings([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error("Lỗi khi tải lịch sử booking:", error);
      setHistoryBookings([]);
      toast.error("Không thể tải lịch sử booking. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistoryBookings();
  }, [currentPage]);

  // Fetch ratings for completed bookings
  const fetchBookingRatings = async (bookings) => {
    try {
      const ratingsMap = new Map();
      
      // Get unique booking IDs that are completed
      const bookingIdsToCheck = new Set();
      bookings.forEach(booking => {
        if (booking.status === 4) { // Status 4 = Hoàn thành
          bookingIdsToCheck.add(booking.id);
        }
      });

      // Fetch ratings for each booking using the API endpoint
      await Promise.all(
        Array.from(bookingIdsToCheck).map(async (bookingId) => {
          try {
            // Import the API function directly here to avoid confusion
            const { getBookingRating: fetchRatingFromAPI } = await import("../components/api/auth");
            const rating = await fetchRatingFromAPI(bookingId);
            console.log(`🔍 Fetching rating for booking ${bookingId}:`, rating);
            
            // Check if rating exists and has valid data
            // Based on console log, the API returns rating directly without data wrapper
            if (rating && rating.id && 
                (rating.teachingQuality || rating.attitude || rating.commitment)) {
              ratingsMap.set(bookingId, rating);
              console.log(`✅ Rating found for booking ${bookingId}:`, rating);
            } else {
              console.log(`❌ No valid rating for booking ${bookingId}:`, rating);
              // Debug: log the structure to understand what we're getting
              console.log(`🔍 Rating structure:`, {
                hasRating: !!rating,
                hasId: !!(rating && rating.id),
                hasTeachingQuality: !!(rating && rating.teachingQuality),
                hasAttitude: !!(rating && rating.attitude),
                hasCommitment: !!(rating && rating.commitment)
              });
              
              // Additional debug: log the actual rating object structure
              console.log(`🔍 Full rating object:`, rating);
              if (rating) {
                console.log(`🔍 Rating.id:`, rating.id);
                console.log(`🔍 Rating.teachingQuality:`, rating.teachingQuality);
                console.log(`🔍 Rating.attitude:`, rating.attitude);
                console.log(`🔍 Rating.commitment:`, rating.commitment);
              }
            }
          } catch (error) {
            console.error(`❌ Error fetching rating for booking ${bookingId}:`, error);
            // Don't throw error, just continue
          }
        })
      );

      console.log(`🔍 Final ratings map:`, Array.from(ratingsMap.entries()));
      setBookingRatings(ratingsMap);
    } catch (error) {
      console.error("Error fetching booking ratings:", error);
    }
  };

  // Get existing rating for a booking
  const getBookingRating = (bookingId) => {
    return bookingRatings.get(bookingId);
  };

  // Check if a booking has been rated
  const hasBookingRating = (bookingId) => {
    return bookingRatings.has(bookingId);
  };

  // Handle rate booking
  const handleRateBooking = (booking) => {
    if (booking.status !== 4) {
      toast.error("Chỉ có thể đánh giá booking đã hoàn thành!");
      return;
    }
    
    // Check if booking already has a rating
    if (hasBookingRating(booking.id)) {
      toast.error("Booking này đã được đánh giá rồi!");
      return;
    }
    
    setSelectedBookingForRating({
      bookingId: booking.id,
      lessonName: booking.lessonName || booking.lessonSnapshot?.name || 'Khóa học',
      tutorName: booking.tutorName || 'Gia sư',
      booking: booking
    });
    setRatingData({
      teachingQuality: 3.0,
      attitude: 3.0,
      commitment: 3.0,
      comment: ""
    });
    setShowRatingModal(true);
  };

  // Handle rating submit
  const handleRatingSubmit = async () => {
    if (!selectedBookingForRating) {
      return;
    }

    if (!selectedBookingForRating.bookingId) {
      toast.error("Không có booking ID để đánh giá!");
      return;
    }

    try {
      setSubmittingRating(true);
      
      const ratingPayload = {
        bookingSlotId: selectedBookingForRating.bookingId,
        teachingQuality: ratingData.teachingQuality,
        attitude: ratingData.attitude,
        commitment: ratingData.commitment,
        comment: ratingData.comment.trim()
      };

      await submitBookingRating(ratingPayload);
      
      // Show success message
      toast.success("Đánh giá khóa học đã được gửi thành công!");
      
      // Close modal after showing toast
      setShowRatingModal(false);
      setSelectedBookingForRating(null);
      
      // Refresh ratings to show the new rating
      await fetchBookingRatings(historyBookings);
    } catch (error) {
      console.error("Failed to submit rating:", error);
      toast.error("Không thể gửi đánh giá");
      setShowRatingModal(false);
      setSelectedBookingForRating(null);
    } finally {
      setSubmittingRating(false);
    }
  };

  const toggleExpanded = (groupId) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedItems(newExpanded);
  };

  const getBookingStatusBadge = (status) => {
    const statusMap = {
      3: { label: "Đã hủy", class: "bg-gray-50 text-gray-700 border border-gray-200" },
      4: { label: "Hoàn thành", class: "bg-green-50 text-green-700 border border-green-200" }
    };
    const statusInfo = statusMap[status] || { label: "Không xác định", class: "bg-gray-50 text-gray-700 border border-gray-200" };
    
    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusInfo.class}`}>
        {statusInfo.label}
      </span>
    );
  };

  const getSlotStatusBadge = (status) => {
    const statusMap = {
      0: { label: "Đang chờ", class: "bg-yellow-50 text-yellow-700 border border-yellow-200" },
      1: { label: "Hoàn thành, nếu có vấn đề báo cáo trong 24h", class: "bg-blue-50 text-blue-700 border border-blue-200" },
      2: { label: "Hoàn thành", class: "bg-green-50 text-green-700 border border-green-200" },
      3: { label: "Đã hủy", class: "bg-red-50 text-red-700 border border-red-200" },
      4: { label: "Đang báo cáo", class: "bg-orange-50 text-orange-700 border border-orange-200" }
    };
    const statusInfo = statusMap[status] || { label: "Không xác định", class: "bg-gray-50 text-gray-700 border border-gray-200" };
    
    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusInfo.class}`}>
        {statusInfo.label}
      </span>
    );
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const renderSkeleton = () => {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((item) => (
          <div key={item} className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <Skeleton variant="circular" width={48} height={48} />
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Skeleton variant="text" width={200} height={28} />
                      <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: '12px' }} />
                    </div>
                    <Skeleton variant="text" width={150} height={20} />
                    <div className="flex items-center space-x-4 mt-2">
                      <Skeleton variant="text" width={100} height={16} />
                      <Skeleton variant="text" width={120} height={16} />
                    </div>
                  </div>
                </div>
                <Skeleton variant="rectangular" width={40} height={36} />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return renderSkeleton();
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold" style={{ color: '#666666' }}>
          Lịch sử booking ({historyBookings.length} khóa học)
        </h2>
        <button
          onClick={fetchHistoryBookings}
          className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-all duration-200"
          style={{ backgroundColor: '#666666' }}
        >
          <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Làm mới
        </button>
      </div>

      {historyBookings.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-lg font-medium mb-2" style={{ color: '#666666' }}>
            Chưa có lịch sử booking
          </h3>
          <p className="text-gray-500">
            Các booking đã hủy hoặc hoàn thành sẽ xuất hiện ở đây
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {historyBookings.map((booking) => (
              <div key={booking.id} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Booking Header */}
                <div className="p-4 hover:bg-gray-50 transition-colors duration-150">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      {/* Tutor Avatar */}
                      <div className="flex-shrink-0">
                        <img
                          className="h-12 w-12 rounded-full object-cover border-2 border-gray-200"
                          src={booking.tutorAvatarUrl || "https://via.placeholder.com/48"}
                          alt={booking.tutorName}
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/48";
                          }}
                        />
                      </div>
                      
                      {/* Course Info */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold" style={{ color: '#666666' }}>
                            {booking.lessonName || booking.lessonSnapshot?.name || 'Chưa có tên khóa học'}
                          </h3>
                          {getBookingStatusBadge(booking.status || 0)}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Gia sư: <span className="font-medium">{booking.tutorName}</span>
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span>
                            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {booking.slotCount || booking.bookedSlots?.length || 0} slot học
                          </span>
                          <span>
                            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                            {(booking.totalPrice || 0).toLocaleString('vi-VN')} VNĐ
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2">
                      {/* Rating button - only show for completed bookings */}
                      {booking.status === 4 && (
                        hasBookingRating(booking.id) ? (
                          // Show existing rating badge
                          <div className="px-3 py-2 text-sm rounded-lg bg-green-100 text-green-700 flex items-center space-x-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span>Đã đánh giá</span>
                          </div>
                        ) : (
                          // Show rate button
                          <button
                            onClick={() => handleRateBooking(booking)}
                            className="px-3 py-2 text-sm rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 transition-colors duration-200 flex items-center space-x-1"
                            title="Đánh giá khóa học"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span>Đánh giá</span>
                          </button>
                        )
                      )}
                      
                      {/* Expand Button */}
                      <button
                        onClick={() => toggleExpanded(booking.id)}
                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors duration-200"
                        style={{ color: '#666666' }}
                      >
                        <svg 
                          className={`w-5 h-5 transition-transform duration-200 ${expandedItems.has(booking.id) ? 'rotate-180' : ''}`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedItems.has(booking.id) && (
                  <div className="border-t border-gray-200 bg-gray-50">
                    <div className="p-4">
                      <h4 className="text-sm font-medium mb-3" style={{ color: '#666666' }}>
                        Chi tiết slot học ({booking.slotCount || booking.bookedSlots?.length || 0} slot)
                      </h4>
                      <div className="space-y-2">
                        {(() => {
                          const sortedSlots = sortSlotsByChronologicalOrder(booking.bookedSlots || []);
                          
                          return sortedSlots.map((slot, globalIndex) => {
                            const sequentialNumber = globalIndex + 1;
                            
                            return (
                              <div key={`${booking.id}-${slot.id}`} className="bg-white p-3 rounded-lg border border-gray-200">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3 flex-1">
                                    {/* Sequential Number */}
                                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0">
                                      {sequentialNumber}
                                    </div>
                                    
                                    <div className="flex-1">
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <span className="font-medium text-lg" style={{ color: '#666666' }}>
                                            Slot {slot.slotIndex}
                                          </span>
                                          <div className="text-xs text-gray-500 mt-1">
                                            Ngày học: {formatSlotDateTimeUTC0(slot.slotIndex, slot.bookedDate)}
                                          </div>
                                          {slot.slotNote && (
                                            <div className="text-xs text-gray-600 mt-1">
                                              Ghi chú: {slot.slotNote}
                                            </div>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                          {getSlotStatusBadge(slot.status)}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                      
                      {/* Display existing rating if available */}
                      {booking.status === 4 && hasBookingRating(booking.id) && (
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="text-sm font-medium text-yellow-800">Đánh giá đã có</h5>
                            <div className="flex items-center space-x-1">
                              {[1, 2, 3, 4, 5].map((star) => {
                                const rating = getBookingRating(booking.id);
                                const avgRating = ((rating.teachingQuality + rating.attitude + rating.commitment) / 3);
                                return (
                                  <svg
                                    key={star}
                                    className={`w-4 h-4 ${star <= avgRating ? 'text-yellow-400' : 'text-gray-300'}`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                );
                              })}
                              <span className="text-sm text-gray-600 ml-1">
                                ({((getBookingRating(booking.id).teachingQuality + getBookingRating(booking.id).attitude + getBookingRating(booking.id).commitment) / 3).toFixed(1)})
                              </span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                            <div className="text-center">
                              <div className="text-gray-600">Giảng dạy</div>
                              <div className="font-semibold text-yellow-700">{getBookingRating(booking.id).teachingQuality}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-gray-600">Thái độ</div>
                              <div className="font-semibold text-yellow-700">{getBookingRating(booking.id).attitude}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-gray-600">Cam kết</div>
                              <div className="font-semibold text-yellow-700">{getBookingRating(booking.id).commitment}</div>
                            </div>
                          </div>
                          
                          {getBookingRating(booking.id).comment && (
                            <div className="mt-2 pt-2 border-t border-yellow-300">
                              <div className="text-xs text-gray-600 mb-1">Nhận xét:</div>
                              <div className="text-sm text-gray-700 italic">"{getBookingRating(booking.id).comment}"</div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-6">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ borderColor: '#666666', color: '#666666' }}
                >
                  Trước
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative ml-3 inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ borderColor: '#666666', color: '#666666' }}
                >
                  Sau
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm" style={{ color: '#666666' }}>
                    Hiển thị{" "}
                    <span className="font-medium">
                      {(currentPage - 1) * pageSize + 1}
                    </span>{" "}
                    đến{" "}
                    <span className="font-medium">
                      {Math.min(currentPage * pageSize, totalCount)}
                    </span>{" "}
                    trong số{" "}
                    <span className="font-medium">{totalCount}</span> kết quả
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center rounded-l-md px-2 py-2 ring-1 ring-inset hover:bg-gray-50 focus:z-20 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ color: '#666666', borderColor: '#666666' }}
                    >
                      <span className="sr-only">Trang trước</span>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    {[...Array(totalPages)].map((_, index) => {
                      const page = index + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                            currentPage === page
                              ? "z-10 text-white focus:z-20"
                              : "ring-1 ring-inset hover:bg-gray-50 focus:z-20"
                          }`}
                          style={currentPage === page 
                            ? { backgroundColor: '#666666', borderColor: '#666666' }
                            : { color: '#666666', borderColor: '#666666' }
                          }
                        >
                          {page}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center rounded-r-md px-2 py-2 ring-1 ring-inset hover:bg-gray-50 focus:z-20 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ color: '#666666', borderColor: '#666666' }}
                    >
                      <span className="sr-only">Trang sau</span>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Rating Modal */}
      {showRatingModal && selectedBookingForRating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold" style={{ color: '#666666' }}>
                ⭐ Đánh giá khóa học
              </h3>
              <button
                onClick={() => setShowRatingModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                style={{ color: '#666666' }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-2">
                  {selectedBookingForRating.lessonName}
                </h4>
                <p className="text-sm text-gray-600">
                  Gia sư: <span className="font-medium">{selectedBookingForRating.tutorName}</span>
                </p>
              </div>

              <div className="space-y-6">
                {/* Teaching Quality */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chất lượng giảng dạy (1-5)
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="0.5"
                      value={ratingData.teachingQuality}
                      onChange={(e) => setRatingData(prev => ({ ...prev, teachingQuality: parseFloat(e.target.value) }))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      style={{ 
                        background: `linear-gradient(to right, #666666 0%, #666666 ${(ratingData.teachingQuality-1)*25}%, #e5e7eb ${(ratingData.teachingQuality-1)*25}%, #e5e7eb 100%)`
                      }}
                    />
                    <span className="w-8 text-center font-semibold text-gray-700">{ratingData.teachingQuality}</span>
                  </div>
                </div>

                {/* Attitude */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thái độ (1-5)
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="0.5"
                      value={ratingData.attitude}
                      onChange={(e) => setRatingData(prev => ({ ...prev, attitude: parseFloat(e.target.value) }))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      style={{ 
                        background: `linear-gradient(to right, #666666 0%, #666666 ${(ratingData.attitude-1)*25}%, #e5e7eb ${(ratingData.attitude-1)*25}%, #e5e7eb 100%)`
                      }}
                    />
                    <span className="w-8 text-center font-semibold text-gray-700">{ratingData.attitude}</span>
                  </div>
                </div>

                {/* Commitment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sự cam kết (1-5)
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="0.5"
                      value={ratingData.commitment}
                      onChange={(e) => setRatingData(prev => ({ ...prev, commitment: parseFloat(e.target.value) }))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      style={{ 
                        background: `linear-gradient(to right, #666666 0%, #666666 ${(ratingData.commitment-1)*25}%, #e5e7eb ${(ratingData.commitment-1)*25}%, #e5e7eb 100%)`
                      }}
                    />
                    <span className="w-8 text-center font-semibold text-gray-700">{ratingData.commitment}</span>
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nhận xét (tùy chọn)
                  </label>
                  <textarea
                    value={ratingData.comment}
                    onChange={(e) => setRatingData(prev => ({ ...prev, comment: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-black"
                    placeholder="Chia sẻ trải nghiệm của bạn về khóa học này..."
                    maxLength={500}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {ratingData.comment.length}/500 ký tự
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowRatingModal(false)}
                disabled={submittingRating}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Hủy
              </button>
              <button
                onClick={handleRatingSubmit}
                disabled={submittingRating}
                className="px-6 py-2 text-white rounded-lg hover:opacity-90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                style={{ backgroundColor: '#666666' }}
              >
                {submittingRating && (
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                <span>{submittingRating ? 'Đang gửi...' : 'Gửi đánh giá'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function MyBookingPage({ user }) {
  const { id } = useParams(); // get booking id from URL
  const [bookingOffers, setBookingOffers] = useState([]);
  const [loadingOffers, setLoadingOffers] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [pendingDeleteTutorId, setPendingDeleteTutorId] = useState(null);
  const [activeTab, setActiveTab] = useState("booking-requests");
  const [createDisputeModalOpen, setCreateDisputeModalOpen] = useState(false);
  const [selectedBookingForDispute, setSelectedBookingForDispute] = useState(null);
  

  

  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookingOffers = async () => {
      setLoadingOffers(true);
      try {
        const data = await getAllLearnerBookingOffer();
        setBookingOffers(data);
      } catch (err) {
        console.error("Error fetching booking offers:", err);
        setBookingOffers([]);
        toast.error("Không thể tải danh sách đề xuất. Vui lòng thử lại!", toastConfig);
      } finally {
        setLoadingOffers(false);
      }
    };
    fetchBookingOffers();
  }, []);



  const handleMessageTutor = tutorId => {
    navigate(`/message/${tutorId}`);
  };

  const handleDeleteRequest = async tutorId => {
    setPendingDeleteTutorId(tutorId);
    setConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteLearnerBookingTimeSlot(pendingDeleteTutorId);
      setBookingOffers(prev => prev.filter(offer => offer.tutor.id !== pendingDeleteTutorId));
      toast.success("Đã xóa yêu cầu thành công!", toastConfig);
    } catch (error) {
      toast.error("Xóa yêu cầu thất bại. Vui lòng thử lại!", toastConfig);
    } finally {
      setConfirmDeleteOpen(false);
      setPendingDeleteTutorId(null);
    }
  };

  const handleCreateDispute = (booking) => {
    setSelectedBookingForDispute(booking);
    setCreateDisputeModalOpen(true);
  };

  const handleDisputeSuccess = () => {
    // Refresh disputes list if needed
    toast.success("Báo cáo đã được gửi thành công!");
  };

  const handleRefreshRequests = async () => {
    setLoadingOffers(true);
    try {
      const data = await getAllLearnerBookingOffer();
      setBookingOffers(data);
    } catch (err) {
      console.error("Error refreshing booking offers:", err);
      toast.error("Không thể tải lại danh sách đề xuất. Vui lòng thử lại!", toastConfig);
    } finally {
      setLoadingOffers(false);
    }
  };







  // Transform offers data to match the expected format for MyBookingTable
  const transformedOffers = bookingOffers.map(offer => ({
    id: offer.id,
    tutorId: offer.tutor.id,
    tutorName: offer.tutor.fullName,
    tutorAvatarUrl: offer.tutor.profilePictureUrl,
    latestRequestTime: offer.createdAt,
    tutorBookingOfferId: offer.id, // Use offer ID as the booking offer ID
    lessonName: offer.lessonName,
    pricePerSlot: offer.pricePerSlot,
    totalPrice: offer.totalPrice,
    durationInMinutes: offer.durationInMinutes,
    expirationTime: offer.expirationTime,
    isExpired: offer.isExpired,
    isRejected: offer.isRejected,
    offeredSlots: offer.offeredSlots || []
  }));

  const tabs = [
    {
      id: "booking-requests",
      name: "Đề xuất từ gia sư",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: "lesson-management",
      name: "Theo dõi buổi học",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    {
      id: "disputes",
              name: "Báo cáo của tôi",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      )
    },
    {
      id: "booking-history",
      name: "Lịch sử booking",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <style dangerouslySetInnerHTML={{
        __html: `
          .booking-page * {
            outline: none !important;
          }
          
          .booking-page button:focus {
            outline: none !important;
            box-shadow: none !important;
          }
          
          .booking-page button:focus-visible {
            outline: none !important;
            box-shadow: none !important;
          }
        `
      }} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 booking-page">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Đặt lịch của tôi</h1>
          <p className="mt-2 text-gray-600">Quản lý đề xuất từ gia sư, buổi học và khiếu nại của bạn</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors duration-200`}
                >
                  {tab.icon}
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm">
          {activeTab === "booking-requests" && (
            <div className="p-6">
              <MyBookingTable
                sentRequests={transformedOffers}
                loadingRequests={loadingOffers}
                onMessageTutor={handleMessageTutor}
                onDeleteRequest={handleDeleteRequest}
                onCreateDispute={handleCreateDispute}
                selectedBookingId={id} // pass the id to the table
                onRefreshRequests={handleRefreshRequests} // <-- Add this prop
              />
            </div>
          )}

          {activeTab === "lesson-management" && (
            <LessonManagement />
          )}



          {activeTab === "disputes" && (
            <div className="p-6">
              <MyDisputes />
            </div>
          )}

          {activeTab === "booking-history" && (
            <BookingHistory />
          )}
        </div>
      </div>
      
      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa yêu cầu"
        message="Bạn có chắc chắn muốn xóa yêu cầu này không?"
      />

      {/* Create Dispute Modal */}
      <CreateDisputeModal
        isOpen={createDisputeModalOpen}
        onClose={() => setCreateDisputeModalOpen(false)}
        bookingData={selectedBookingForDispute}
        onSuccess={handleDisputeSuccess}
      />

      {/* Toast Container */}
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
}
