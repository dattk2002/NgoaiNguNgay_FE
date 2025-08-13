import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { fetchLearnerBookings, fetchBookingDetail, submitBookingRating, getBookingRating } from "./api/auth";
import { formatCentralTimestamp } from "../utils/formatCentralTimestamp";
import { formatSlotDateTime } from "../utils/formatSlotTime";
import { Skeleton } from "@mui/material";

const LessonManagement = () => {
  const [lessons, setLessons] = useState([]);
  const [groupedLessons, setGroupedLessons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize] = useState(10);
  const [expandedGroups, setExpandedGroups] = useState(new Set());
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [selectedLessonInfo, setSelectedLessonInfo] = useState(null);
  const [loadingLessonInfo, setLoadingLessonInfo] = useState(false);
  
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

  // Helper function to get booking overall status based on all slots in a group
  const getGroupOverallStatus = (group) => {
    // Collect all slots from all bookings in the group
    const allSlots = [];
    group.bookings.forEach(booking => {
      if (booking.bookedSlots && Array.isArray(booking.bookedSlots)) {
        allSlots.push(...booking.bookedSlots);
      }
    });

    if (allSlots.length === 0) {
      return null;
    }

    const totalSlots = allSlots.length;
    const completedSlots = allSlots.filter(slot => slot.status === 2).length;
    const cancelledSlots = allSlots.filter(slot => slot.status === 3).length;
    const pendingSlots = allSlots.filter(slot => slot.status === 0).length;
    const awaitingSlots = allSlots.filter(slot => slot.status === 1).length;

    // If all slots are completed
    if (completedSlots === totalSlots) {
      return { label: 'Hoàn thành', class: 'bg-green-50 text-green-700 border border-green-200' };
    }
    
    // If all slots are cancelled
    if (cancelledSlots === totalSlots) {
      return { label: 'Đã hủy', class: 'bg-red-50 text-red-700 border border-red-200' };
    }
    
    // If there are mixed statuses (some completed, some not) - show as in progress
    if (completedSlots > 0 && completedSlots < totalSlots) {
      return { label: 'Đang diễn ra', class: 'bg-blue-50 text-blue-700 border border-blue-200' };
    }
    
    // If all slots are pending
    if (pendingSlots === totalSlots) {
      return { label: 'Đang chờ', class: 'bg-yellow-50 text-yellow-700 border border-yellow-200' };
    }
    
    // If all slots are awaiting confirmation
    if (awaitingSlots === totalSlots) {
      return { label: 'Chờ xác nhận', class: 'bg-blue-50 text-blue-700 border border-blue-200' };
    }
    
    // Mixed status without completed slots - show as in progress
    return { label: 'Đang diễn ra', class: 'bg-blue-50 text-blue-700 border border-blue-200' };
  };

  // Helper function to check if group has at least one completed slot
  const hasCompletedSlots = (group) => {
    const allSlots = [];
    group.bookings.forEach(booking => {
      if (booking.bookedSlots && Array.isArray(booking.bookedSlots)) {
        allSlots.push(...booking.bookedSlots);
      }
    });
    return allSlots.some(slot => slot.status === 2);
  };

  // Fetch ratings for all bookings
  const fetchBookingRatings = async (bookings) => {
    try {
      console.log("🔍 Fetching ratings for bookings...");
      const ratingsMap = new Map();
      
      // Get unique booking IDs that have completed slots
      const bookingIdsToCheck = new Set();
      bookings.forEach(booking => {
        if (booking.bookedSlots && booking.bookedSlots.some(slot => slot.status === 2)) {
          bookingIdsToCheck.add(booking.id);
        }
      });

      // Fetch ratings for each booking
      await Promise.all(
        Array.from(bookingIdsToCheck).map(async (bookingId) => {
          try {
            const rating = await getBookingRating(bookingId);
            if (rating) {
              ratingsMap.set(bookingId, rating);
              console.log(`✅ Found rating for booking ${bookingId}:`, rating);
            }
          } catch (error) {
            console.log(`📝 No rating for booking ${bookingId}`);
            // Don't throw error, just continue
          }
        })
      );

      setBookingRatings(ratingsMap);
      console.log("🔍 Total ratings loaded:", ratingsMap.size);
    } catch (error) {
      console.error("Error fetching booking ratings:", error);
      // Don't show error toast for this, it's not critical
    }
  };

  // Get existing rating for a group (from any booking in the group that has rating)
  const getGroupRating = (group) => {
    for (const booking of group.bookings) {
      const rating = bookingRatings.get(booking.id);
      if (rating) {
        return rating;
      }
    }
    return null;
  };

  // Render star rating component
  const StarRating = ({ rating, showValue = true, size = "sm" }) => {
    const sizeClasses = {
      sm: "w-4 h-4",
      md: "w-5 h-5",
      lg: "w-6 h-6"
    };
    
    const starClass = sizeClasses[size] || sizeClasses.sm;
    
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`${starClass} ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        {showValue && (
          <span className="text-sm text-gray-600 ml-1">({rating.toFixed(1)})</span>
        )}
      </div>
    );
  };

  // Render rating display component
  const RatingDisplay = ({ group }) => {
    const rating = getGroupRating(group);
    
    if (!rating) {
      return null;
    }

    const avgRating = ((rating.teachingQuality + rating.attitude + rating.commitment) / 3).toFixed(1);
    
    return (
      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <h5 className="text-sm font-medium text-yellow-800">Đánh giá đã có</h5>
          <StarRating rating={parseFloat(avgRating)} size="sm" />
        </div>
        
        <div className="grid grid-cols-3 gap-2 text-xs mb-2">
          <div className="text-center">
            <div className="text-gray-600">Giảng dạy</div>
            <div className="font-semibold text-yellow-700">{rating.teachingQuality}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-600">Thái độ</div>
            <div className="font-semibold text-yellow-700">{rating.attitude}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-600">Cam kết</div>
            <div className="font-semibold text-yellow-700">{rating.commitment}</div>
          </div>
        </div>
        
        {rating.comment && (
          <div className="mt-2 pt-2 border-t border-yellow-300">
            <div className="text-xs text-gray-600 mb-1">Nhận xét:</div>
            <div className="text-sm text-gray-700 italic">"{rating.comment}"</div>
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    fetchLessons();
  }, [currentPage]);

  const fetchLessons = async () => {
    setLoading(true);
    try {
      const response = await fetchLearnerBookings(currentPage, pageSize);
      if (response && Array.isArray(response.items)) {
        const bookingList = response.items;
        
        // Fetch detailed booking info for each booking
        const detailedBookings = await Promise.all(
          bookingList.map(async (booking) => {
            try {
              const detail = await fetchBookingDetail(booking.id);
              return detail;
            } catch (error) {
              console.error(`Failed to fetch detail for booking ${booking.id}:`, error);
              return null;
            }
          })
        );
        
        // Filter out failed requests
        const validBookings = detailedBookings.filter(booking => booking !== null);
        
        setLessons(validBookings);
        setTotalCount(response.totalCount || validBookings.length);
        
        // Group lessons by lessonName + tutorName
        const grouped = groupLessons(validBookings);
        setGroupedLessons(grouped);
        
        // Fetch ratings for completed bookings
        await fetchBookingRatings(validBookings);
      } else {
        setLessons([]);
        setGroupedLessons([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách buổi học:", error);
      setLessons([]);
      setGroupedLessons([]);
      toast.error("Không thể tải danh sách buổi học. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const groupLessons = (bookings) => {
    const groups = {};
    
    bookings.forEach(booking => {
      const lessonName = booking.lessonSnapshot?.name || 'Chưa có tên khóa học';
      const tutorName = booking.tutorName || 'Chưa có tên';
      const key = `${lessonName}_${tutorName}`;
      
      if (!groups[key]) {
        groups[key] = {
          id: key,
          lessonName: lessonName,
          tutorName: tutorName,
          tutorAvatarUrl: booking.tutorAvatarUrl,
          tutorId: booking.tutorId,
          bookings: [],
          // Use data from booking detail API
          slotCount: booking.bookedSlots?.length || 0,
          totalPrice: booking.totalPrice || 0,
          lessonSnapshot: booking.lessonSnapshot,
          latestStatus: booking.bookedSlots?.[0]?.status || 0,
          latestCreatedTime: booking.createdTime
        };
      } else {
        // For groups with multiple bookings, combine the data
        groups[key].slotCount += (booking.bookedSlots?.length || 0);
        groups[key].totalPrice += (booking.totalPrice || 0);
      }
      
      groups[key].bookings.push(booking);
      
      // Use the latest status and time
      if (booking.createdTime && booking.createdTime > groups[key].latestCreatedTime) {
        if (booking.bookedSlots?.[0]) {
          groups[key].latestStatus = booking.bookedSlots[0].status;
        }
        groups[key].latestCreatedTime = booking.createdTime;
      }
    });
    
    return Object.values(groups);
  };

  const toggleExpanded = (groupId) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const getStatusBadge = (status) => {
    // Based on backend SlotStatus enum:
    // Pending = 0, AwaitingConfirmation = 1, Completed = 2, Cancelled = 3
    const statusMap = {
      0: { label: "Đang chờ", class: "bg-yellow-50 text-yellow-700 border border-yellow-200" },
      1: { label: "Chờ xác nhận", class: "bg-blue-50 text-blue-700 border border-blue-200" },
      2: { label: "Hoàn thành", class: "bg-green-50 text-green-700 border border-green-200" },
      3: { label: "Đã hủy", class: "bg-red-50 text-red-700 border border-red-200" }
    };
    const statusInfo = statusMap[status] || { label: "Không xác định", class: "bg-gray-50 text-gray-700 border border-gray-200" };
    
    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusInfo.class}`}>
        {statusInfo.label}
      </span>
    );
  };

  const handleViewCourseInfo = async (group) => {
    try {
      setLoadingLessonInfo(true);
      setShowLessonModal(true);
      
      // Use lesson data from lessonSnapshot (already available from booking detail)
      if (group.lessonSnapshot) {
        setSelectedLessonInfo({
          group,
          lessonData: group.lessonSnapshot,
          error: null
        });
      } else {
        setSelectedLessonInfo({
          group,
          lessonData: null,
          error: `Không tìm thấy thông tin khóa học "${group.lessonName}"`
        });
      }
    } catch (error) {
      console.error("Error handling course info:", error);
      setSelectedLessonInfo({
        group,
        lessonData: null,
        error: `Không thể hiển thị thông tin khóa học "${group.lessonName}". Lỗi: ${error.message}`
      });
      toast.error(`Không thể tải thông tin khóa học: ${error.message}`);
    } finally {
      setLoadingLessonInfo(false);
    }
  };

  const handleRateBooking = (group) => {
    // Find the first booking that has completed slots to get bookingId for rating
    let validBookingId = null;
    
    // Look through all bookings in the group to find one with completed slots
    for (const booking of group.bookings) {
      if (booking.bookedSlots && Array.isArray(booking.bookedSlots)) {
        const hasCompletedSlot = booking.bookedSlots.some(slot => slot.status === 2); // Status 2 = Completed
        if (hasCompletedSlot) {
          validBookingId = booking.id;
          break;
        }
      }
    }
    
    console.log("🔍 Debug - Found booking ID with completed slots:", validBookingId);
    
    if (!validBookingId) {
      toast.error("Không tìm thấy booking có slot đã hoàn thành để đánh giá!");
      return;
    }
    
    setSelectedBookingForRating({
      bookingId: validBookingId,
      lessonName: group.lessonName,
      tutorName: group.tutorName,
      group: group
    });
    setRatingData({
      teachingQuality: 3.0,
      attitude: 3.0,
      commitment: 3.0,
      comment: ""
    });
    setShowRatingModal(true);
  };

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

      console.log("🔍 Debug - Rating payload:", ratingPayload);
      await submitBookingRating(ratingPayload);
      
      // Show success message
      toast.success("Đánh giá khóa học đã được gửi thành công!");
      
      // Close modal after showing toast
      setShowRatingModal(false);
      setSelectedBookingForRating(null);
      
      // Refresh ratings to show the new rating
      await fetchBookingRatings(lessons);
    } catch (error) {
      console.error("Failed to submit rating:", error);
      
      // Show error message
      toast.error("Không thể gửi đánh giá");
      
      // Close modal after showing error toast  
      setShowRatingModal(false);
      setSelectedBookingForRating(null);
    } finally {
      setSubmittingRating(false);
    }
  };

  // Modal animation variants
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const renderLessonSkeleton = () => {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <Skeleton variant="text" width={300} height={40} />
          <Skeleton variant="rectangular" width={120} height={40} />
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    {/* Avatar Skeleton */}
                    <Skeleton variant="circular" width={48} height={48} />
                    
                    {/* Content Skeleton */}
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
                  
                  {/* Action buttons skeleton */}
                  <div className="flex items-center space-x-2">
                    <Skeleton variant="rectangular" width={120} height={36} />
                    <Skeleton variant="rectangular" width={40} height={36} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return renderLessonSkeleton();
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold" style={{ color: '#666666' }}>
          Quản lí slot học ({groupedLessons.length} khóa học)
        </h2>
        <button
          onClick={fetchLessons}
          className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-all duration-200"
          style={{ backgroundColor: '#666666' }}
        >
          <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Làm mới
        </button>
      </div>

      {groupedLessons.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-lg font-medium mb-2" style={{ color: '#666666' }}>
            Chưa có khóa học nào
          </h3>
          <p className="text-gray-500">
            Các slot học đã đặt sẽ xuất hiện ở đây
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {groupedLessons.map((group) => (
              <div key={group.id} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Group Header */}
                <div className="p-4 hover:bg-gray-50 transition-colors duration-150">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      {/* Tutor Avatar */}
                      <div className="flex-shrink-0">
                        <img
                          className="h-12 w-12 rounded-full object-cover border-2 border-gray-200"
                          src={group.tutorAvatarUrl || "https://via.placeholder.com/48"}
                          alt={group.tutorName}
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/48";
                          }}
                        />
                      </div>
                      
                      {/* Course Info */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold" style={{ color: '#666666' }}>
                            {group.lessonName}
                          </h3>
                          {(() => {
                            const overallStatus = getGroupOverallStatus(group);
                            return overallStatus ? (
                              <span className={`px-3 py-1 text-xs font-medium rounded-full ${overallStatus.class}`}>
                                {overallStatus.label}
                              </span>
                            ) : getStatusBadge(group.latestStatus);
                          })()}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Gia sư: <span className="font-medium">{group.tutorName}</span>
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span>
                            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {group.slotCount} slot học
                          </span>
                          <span>
                            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                            {group.totalPrice.toLocaleString('vi-VN')} VND
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewCourseInfo(group)}
                        className="px-3 py-2 text-sm rounded-lg border text-white hover:opacity-90 transition-all duration-200"
                        style={{ backgroundColor: '#666666', borderColor: '#666666' }}
                      >
                        <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Thông tin khóa học
                      </button>
                      {/* Rating button - only show when at least one slot is completed and no rating exists */}
                      {hasCompletedSlots(group) && !getGroupRating(group) && (
                        <button
                          onClick={() => handleRateBooking(group)}
                          className="px-3 py-2 text-sm rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 transition-colors duration-200 flex items-center space-x-1"
                          title="Đánh giá khóa học"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span>Đánh giá</span>
                        </button>
                      )}
                      
                      {/* Show existing rating badge */}
                      {getGroupRating(group) && (
                        <div className="px-3 py-2 text-sm rounded-lg bg-green-100 text-green-700 flex items-center space-x-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>Đã đánh giá</span>
                        </div>
                      )}
                      <button
                        onClick={() => toggleExpanded(group.id)}
                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors duration-200"
                        style={{ color: '#666666' }}
                      >
                        <svg 
                          className={`w-5 h-5 transition-transform duration-200 ${expandedGroups.has(group.id) ? 'rotate-180' : ''}`} 
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
                {expandedGroups.has(group.id) && (
                  <div className="border-t border-gray-200 bg-gray-50">
                    <div className="p-4">
                      <h4 className="text-sm font-medium mb-3" style={{ color: '#666666' }}>
                        Chi tiết slot học ({group.slotCount} slot)
                      </h4>
                      <div className="space-y-2">
                        {group.bookings.flatMap((booking, bookingIndex) => 
                          booking.bookedSlots?.map((slot, slotIndex) => {
                            // Calculate sequential number across all bookings
                            const sequentialNumber = group.bookings
                              .slice(0, bookingIndex)
                              .reduce((count, b) => count + (b.bookedSlots?.length || 0), 0) + slotIndex + 1;
                            
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
                                            Ngày học: {slot.slotIndex !== undefined ? formatSlotDateTime(slot.slotIndex, slot.bookedDate) : (slot.bookedDate ? formatCentralTimestamp(slot.bookedDate) : 'N/A')}
                                          </div>
                                          {slot.slotNote && (
                                            <div className="text-xs text-gray-600 mt-1">
                                              Ghi chú: {slot.slotNote}
                                            </div>
                                          )}
                                        </div>
                                        <div className="text-right">
                                          {getStatusBadge(slot.status)}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          }) || []
                        )}
                      </div>
                      
                      {/* Display existing rating if available */}
                      <RatingDisplay group={group} />
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
      
      {/* Lesson Info Modal */}
      <AnimatePresence>
        {showLessonModal && (
          <motion.div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={backdropVariants}
            onClick={() => setShowLessonModal(false)}
          >
            <motion.div 
              className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              variants={modalVariants}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold" style={{ color: '#666666' }}>
                📚 Thông tin khóa học
              </h3>
              <button
                onClick={() => setShowLessonModal(false)}
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
              {loadingLessonInfo ? (
                <div className="space-y-6">
                  {/* Course Header Skeleton */}
                  <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <Skeleton variant="circular" width={64} height={64} />
                    <div className="flex-1">
                      <Skeleton variant="text" width={250} height={32} sx={{ mb: 1 }} />
                      <Skeleton variant="text" width={180} height={20} />
                    </div>
                  </div>

                  {/* Course Details Grid Skeleton */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4, 5].map((item) => (
                      <div key={item} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center mb-2">
                          <Skeleton variant="text" width={24} height={24} sx={{ mr: 1 }} />
                          <Skeleton variant="text" width={120} height={24} />
                        </div>
                        <Skeleton variant="text" width="80%" height={28} />
                      </div>
                    ))}
                  </div>

                  {/* Description Skeleton */}
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center mb-3">
                      <Skeleton variant="text" width={24} height={24} sx={{ mr: 1 }} />
                      <Skeleton variant="text" width={150} height={24} />
                    </div>
                    <Skeleton variant="text" width="100%" height={20} sx={{ mb: 1 }} />
                    <Skeleton variant="text" width="90%" height={20} sx={{ mb: 1 }} />
                    <Skeleton variant="text" width="75%" height={20} />
                  </div>

                  {/* Prerequisites Skeleton */}
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center mb-3">
                      <Skeleton variant="text" width={24} height={24} sx={{ mr: 1 }} />
                      <Skeleton variant="text" width={180} height={24} />
                    </div>
                    <Skeleton variant="text" width="60%" height={20} />
                  </div>

                  {/* Booking Summary Skeleton */}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <Skeleton variant="text" width={200} height={24} sx={{ mb: 2 }} />
                    <div className="grid grid-cols-2 gap-4">
                      <Skeleton variant="text" width="100%" height={20} />
                      <Skeleton variant="text" width="100%" height={20} />
                      <div className="col-span-2">
                        <Skeleton variant="text" width="50%" height={20} />
                      </div>
                    </div>
                  </div>
                </div>
              ) : selectedLessonInfo?.error ? (
                <div className="text-center py-12">
                  <div className="text-red-500 text-6xl mb-4">⚠️</div>
                  <h4 className="text-lg font-medium text-red-600 mb-2">Không thể tải thông tin</h4>
                  <p className="text-gray-600">{selectedLessonInfo.error}</p>
                </div>
              ) : selectedLessonInfo?.lessonData ? (
                <div className="space-y-6">
                  {/* Course Header */}
                  <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <img
                        className="h-16 w-16 rounded-full object-cover border-2 border-gray-200"
                        src={selectedLessonInfo.group.tutorAvatarUrl || "https://via.placeholder.com/64"}
                        alt={selectedLessonInfo.group.tutorName}
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/64";
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-2xl font-bold mb-2" style={{ color: '#666666' }}>
                        {selectedLessonInfo.lessonData.name || selectedLessonInfo.group.lessonName}
                      </h4>
                      <p className="text-gray-600 flex items-center">
                        <span className="font-medium">Gia sư:</span>
                        <span className="ml-2">{selectedLessonInfo.group.tutorName}</span>
                      </p>
                    </div>
                  </div>

                  {/* Course Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Price per slot */}
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center mb-2">
                        <span className="text-2xl mr-2">💰</span>
                        <h5 className="font-semibold" style={{ color: '#666666' }}>Giá mỗi slot</h5>
                      </div>
                      <p className="text-lg font-bold text-green-600">
                        {selectedLessonInfo.lessonData.price 
                          ? `${Number(selectedLessonInfo.lessonData.price).toLocaleString('vi-VN')} VND/slot`
                          : 'Chưa cập nhật giá'
                        }
                      </p>
                    </div>

                    {/* Duration per slot */}
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center mb-2">
                        <span className="text-2xl mr-2">⏱️</span>
                        <h5 className="font-semibold" style={{ color: '#666666' }}>Thời lượng mỗi slot</h5>
                      </div>
                      <p className="text-lg text-black">
                        {selectedLessonInfo.lessonData.durationInMinutes 
                          ? `${selectedLessonInfo.lessonData.durationInMinutes} phút/slot`
                          : 'Chưa cập nhật thời lượng'
                        }
                      </p>
                    </div>

                    {/* Total Duration */}
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center mb-2">
                        <span className="text-2xl mr-2">⏰</span>
                        <h5 className="font-semibold" style={{ color: '#666666' }}>Tổng thời lượng</h5>
                      </div>
                      <p className="text-lg font-bold text-blue-600">
                        {selectedLessonInfo.lessonData.durationInMinutes && selectedLessonInfo.group.slotCount
                          ? `${selectedLessonInfo.group.slotCount * selectedLessonInfo.lessonData.durationInMinutes} phút`
                          : 'Chưa tính được'
                        }
                      </p>
                    </div>

                    {/* Category */}
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center mb-2">
                        <span className="text-2xl mr-2">📊</span>
                        <h5 className="font-semibold" style={{ color: '#666666' }}>Danh mục</h5>
                      </div>
                      <p className="text-lg text-black">
                        {selectedLessonInfo.lessonData.category || 'Chưa phân loại'}
                      </p>
                    </div>

                    {/* Target Audience */}
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center mb-2">
                        <span className="text-2xl mr-2">🎯</span>
                        <h5 className="font-semibold" style={{ color: '#666666' }}>Đối tượng</h5>
                      </div>
                      <p className="text-lg text-black">
                        {selectedLessonInfo.lessonData.targetAudience || 'Tất cả học viên'}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center mb-3">
                      <span className="text-2xl mr-2">📝</span>
                      <h5 className="font-semibold" style={{ color: '#666666' }}>Mô tả khóa học</h5>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      {selectedLessonInfo.lessonData.description || 'Chưa có mô tả chi tiết cho khóa học này.'}
                    </p>
                  </div>

                  {/* Prerequisites */}
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center mb-3">
                      <span className="text-2xl mr-2">📋</span>
                      <h5 className="font-semibold" style={{ color: '#666666' }}>Yêu cầu tiên quyết</h5>
                    </div>
                    <p className="text-gray-700">
                      {selectedLessonInfo.lessonData.prerequisites || 'Không có yêu cầu đặc biệt'}
                    </p>
                  </div>

                                    {/* Booking Summary */}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h5 className="font-semibold text-blue-800 mb-3">📈 Thông tin đặt lịch</h5>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-blue-600 font-medium">Tổng slot học:</span>
                        <span className="ml-2" style={{ color: '#666666' }}>{selectedLessonInfo.group.slotCount} slot</span>
                      </div>
                      <div>
                        <span className="text-blue-600 font-medium">Tổng tiền:</span>
                        <span className="ml-2 font-bold" style={{ color: '#666666' }}>{selectedLessonInfo.group.totalPrice.toLocaleString('vi-VN')} VND</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-blue-600 font-medium">Trạng thái:</span>
                        <span className="ml-2">{(() => {
                          const overallStatus = getGroupOverallStatus(selectedLessonInfo.group);
                          return overallStatus ? (
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${overallStatus.class}`}>
                              {overallStatus.label}
                            </span>
                          ) : getStatusBadge(selectedLessonInfo.group.latestStatus);
                        })()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end p-6 border-t border-gray-200">
              <button
                onClick={() => setShowLessonModal(false)}
                className="px-6 py-2 text-white rounded-lg hover:opacity-90 transition-all duration-200"
                style={{ backgroundColor: '#666666' }}
              >
                Đóng
              </button>
            </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rating Modal */}
      <AnimatePresence>
        {showRatingModal && selectedBookingForRating && (
          <motion.div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={backdropVariants}
            onClick={() => setShowRatingModal(false)}
          >
            <motion.div 
              className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
              variants={modalVariants}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
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
                    placeholder="Chia sẻ trải nghiệm của bạn về slot học này..."
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
                className="px-6 py-2 text-white rounded-lg hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ToastContainer for notifications */}
      <ToastContainer 
        position="top-right" 
        autoClose={4000}
        hideProgressBar={false}
        closeOnClick={true}
        pauseOnHover={true}
        draggable={true}
        theme="light"
      />
    </div>
  );
};

export default LessonManagement; 