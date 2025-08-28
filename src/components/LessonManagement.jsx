import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { fetchLearnerBookings, fetchBookingDetail, submitBookingRating, getBookingRating, fetchLearnerDisputes, learnerCancelBookingByBookingId, fetchBookingDetailbyBookingId } from "./api/auth";
import { formatCentralTimestamp, formatUTC0ToUTC7, convertBookingDetailToUTC7 } from "../utils/formatCentralTimestamp";
import { calculateUTC7SlotIndex } from "../utils/formatSlotTime";
import { formatSlotDateTime, sortSlotsByProximityToCurrentDate } from "../utils/formatSlotTime";
import { Skeleton, Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, TextField, Typography } from "@mui/material";
import CreateDisputeModal from "./modals/CreateDisputeModal";
import { formatSlotDateTimeUTC0 } from "../utils/formatSlotTime";

const LessonManagement = () => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize] = useState(10);
  const [expandedItems, setExpandedItems] = useState(new Set());
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
  
  // Dispute modal states
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [selectedBookingForDispute, setSelectedBookingForDispute] = useState(null);
  
  // Disputes data
  const [disputes, setDisputes] = useState([]);
  const [disputesLoading, setDisputesLoading] = useState(false);

  // Cancel booking states
  const [cancelBookingModalOpen, setCancelBookingModalOpen] = useState(false);
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancellingBooking, setCancellingBooking] = useState(false);



  // Helper function to check if a slot has a dispute
  const hasSlotDispute = (slotId) => {
    console.log("🔍 Checking dispute for slotId:", slotId);
    console.log("🔍 Current disputes:", disputes);
    const hasDispute = disputes.some(dispute => dispute.bookedSlotId === slotId);
    console.log("🔍 Has dispute:", hasDispute);
    return hasDispute;
  };

  // Helper function to check if any booking in a group has a dispute
  const hasGroupDispute = (group) => {
    console.log("🔍 Checking group dispute for group:", group.id);
    console.log("🔍 Group bookings:", group.bookings.map(b => ({ id: b.id, name: b.lessonSnapshot?.name })));
    const hasGroupDispute = group.bookings.some(booking => 
      booking.bookedSlots?.some(slot => hasSlotDispute(slot.id))
    );
    console.log("🔍 Group has dispute:", hasGroupDispute);
    return hasGroupDispute;
  };

  // Fetch disputes
  const fetchDisputes = async () => {
    setDisputesLoading(true);
    try {
      console.log("🔍 Fetching disputes...");
      const response = await fetchLearnerDisputes(false); // Get all disputes, not just active ones
      console.log("🔍 Disputes response:", response);
      if (response && response.data) {
        console.log("🔍 Setting disputes:", response.data);
        // Đảm bảo mỗi dispute có bookedSlotId
        const processedDisputes = response.data.map(dispute => ({
          ...dispute,
          bookedSlotId: dispute.bookedSlotId || dispute.bookingId // Fallback cho backward compatibility
        }));
        setDisputes(processedDisputes);
      } else {
        console.log("🔍 No disputes data, setting empty array");
        setDisputes([]);
      }
    } catch (error) {
      console.error("Failed to fetch disputes:", error);
      setDisputes([]);
    } finally {
      setDisputesLoading(false);
    }
  };



  // Handle cancel booking
  const handleCancelBooking = (booking) => {
    setSelectedBookingForCancel(booking);
    setCancelReason("");
    setCancelBookingModalOpen(true);
  };

  // Fetch ratings for all bookings
  const fetchBookingRatings = async (bookings) => {
    try {
      console.log("🔍 Fetching ratings for bookings...");
      const ratingsMap = new Map();
      
      // Get unique booking IDs that are completed
      const bookingIdsToCheck = new Set();
      bookings.forEach(booking => {
        if (booking.status === 4) { // Status 4 = Hoàn thành
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
    fetchDisputes(); // Call fetchDisputes here
  }, [currentPage]);

  const fetchLessons = async () => {
    setLoading(true);
    try {
      const response = await fetchLearnerBookings(currentPage, pageSize);
      if (response && Array.isArray(response.items)) {
        const bookingList = response.items;
        
        // Use booking data directly from fetchLearnerBookings and only fetch additional details if needed
        const processedBookings = await Promise.all(
          bookingList.map(async (booking) => {
            try {
              // Use the booking data from fetchLearnerBookings as base
              const baseBooking = {
                ...booking,
                lessonSnapshot: { name: booking.lessonName }, // Create lessonSnapshot from lessonName
                bookedSlots: [] // Initialize empty slots array
              };
              
              // Fetch additional details only for slots information
              try {
                const detail = await fetchBookingDetail(booking.id);
                const convertedDetail = convertBookingDetailToUTC7(detail);
                if (convertedDetail.bookedSlots && Array.isArray(convertedDetail.bookedSlots)) {
                  baseBooking.bookedSlots = sortSlotsByProximityToCurrentDate(convertedDetail.bookedSlots);
                }
                // Keep the status from the original booking data
                baseBooking.status = booking.status;
              } catch (detailError) {
                console.error(`Failed to fetch detail for booking ${booking.id}:`, detailError);
                // Keep the booking with basic info even if detail fetch fails
              }
              
              return baseBooking;
            } catch (error) {
              console.error(`Failed to process booking ${booking.id}:`, error);
              return null;
            }
          })
        );
        
        // Filter out failed requests
        const validBookings = processedBookings.filter(booking => booking !== null);
        

        
        setLessons(validBookings);
        setTotalCount(response.totalCount || validBookings.length);
        
        // Fetch ratings for completed bookings
        await fetchBookingRatings(validBookings);
      } else {
        setLessons([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách buổi học:", error);
      setLessons([]);
      toast.error("Không thể tải danh sách buổi học. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  // const groupLessons = (bookings) => { // This function is removed as per the new_code
  //   const groups = {};
    
  //   bookings.forEach(booking => {
  //     const lessonName = booking.lessonSnapshot?.name || 'Chưa có tên khóa học';
  //     const tutorName = booking.tutorName || 'Chưa có tên';
  //     const key = `${lessonName}_${tutorName}`;
      
  //     if (!groups[key]) {
  //       groups[key] = {
  //         id: key,
  //         lessonName: lessonName,
  //         tutorName: tutorName,
  //         tutorAvatarUrl: booking.tutorAvatarUrl,
  //         tutorId: booking.tutorId,
  //         bookings: [],
  //         // Use data from booking detail API
  //         slotCount: booking.bookedSlots?.length || 0,
  //         totalPrice: booking.totalPrice || 0,
  //         lessonSnapshot: booking.lessonSnapshot,
  //         latestStatus: booking.bookedSlots?.[0]?.status || 0,
  //         latestCreatedTime: booking.createdTime
  //       };
  //     } else {
  //       // For groups with multiple bookings, combine the data
  //       groups[key].slotCount += (booking.bookedSlots?.length || 0);
  //       groups[key].totalPrice += (booking.totalPrice || 0);
  //     }
      
  //     groups[key].bookings.push(booking);
      
  //     // Use the latest status and time
  //     if (booking.createdTime && booking.createdTime > groups[key].latestCreatedTime) {
  //       if (booking.bookedSlots?.[0]) {
  //         groups[key].latestStatus = booking.bookedSlots[0].status;
  //       }
  //       groups[key].latestCreatedTime = booking.createdTime;
  //     }
  //   });
    
  //   return Object.values(groups);
  // };

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
    // Based on backend BookingStatus enum:
    // 0: Đang diễn ra, 1: Đã yêu cầu khiếu nại, 2: Đang tranh chấp, 3: Đã hủy, 4: Hoàn thành
    const statusMap = {
      0: { label: "Đang diễn ra", class: "bg-blue-50 text-blue-700 border border-blue-200" },
      1: { label: "Đã yêu cầu khiếu nại", class: "bg-orange-50 text-orange-700 border border-orange-200" },
      2: { label: "Đang tranh chấp", class: "bg-red-50 text-red-700 border border-red-200" },
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
    // Based on backend SlotStatus enum:
    // Pending = 0, AwaitingPayout = 1, Completed = 2, Cancelled = 3, CancelledDisputed = 4
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

  const handleViewCourseInfo = async (booking) => {
    try {
      setLoadingLessonInfo(true);
      setShowLessonModal(true);
      
      // Fetch detailed booking information using fetchBookingDetailbyBookingId
      const response = await fetchBookingDetailbyBookingId(booking.id);
      
      // Check if response has data and lessonSnapshot
      if (response && response.data && response.data.lessonSnapshot) {
        setSelectedLessonInfo({
          group: { 
            bookings: [booking],
            slotCount: booking.slotCount,
            totalPrice: booking.totalPrice,
            lessonName: booking.lessonName,
            tutorName: booking.tutorName
          },
          lessonData: response.data.lessonSnapshot,
          error: null
        });
      } else {
        console.log("🔍 Response structure:", response);
        console.log("🔍 Response.data:", response?.data);
        console.log("🔍 Response.data.lessonSnapshot:", response?.data?.lessonSnapshot);
        
        setSelectedLessonInfo({
          group: { 
            bookings: [booking],
            slotCount: booking.slotCount,
            totalPrice: booking.totalPrice,
            lessonName: booking.lessonName,
            tutorName: booking.tutorName
          },
          lessonData: null,
          error: `Không tìm thấy thông tin khóa học "${booking.lessonName || 'Khóa học'}"`
        });
      }
    } catch (error) {
      console.error("Error fetching booking detail:", error);
      setSelectedLessonInfo({
        group: { 
          bookings: [booking],
          slotCount: booking.slotCount,
          totalPrice: booking.totalPrice,
          lessonName: booking.lessonName,
          tutorName: booking.tutorName
        },
        lessonData: null,
        error: `Không thể tải thông tin khóa học "${booking.lessonName || 'Khóa học'}". Lỗi: ${error.message}`
      });
      toast.error(`Không thể tải thông tin khóa học: ${error.message}`);
    } finally {
      setLoadingLessonInfo(false);
    }
  };

  const handleRateBooking = (group) => {
    // Find the first booking that is completed to get bookingId for rating
    let validBookingId = null;
    
    // Look through all bookings in the group to find one with completed status
    for (const booking of group.bookings) {
      if (booking.status === 4) { // Status 4 = Hoàn thành
        validBookingId = booking.id;
        break;
      }
    }
    
    console.log("🔍 Debug - Found booking ID with completed status:", validBookingId);
    
    if (!validBookingId) {
      toast.error("Không tìm thấy booking đã hoàn thành để đánh giá!");
      return;
    }
    
    setSelectedBookingForRating({
      bookingId: validBookingId,
      lessonName: group.bookings[0]?.lessonName || group.bookings[0]?.lessonSnapshot?.name || 'Khóa học',
      tutorName: group.bookings[0]?.tutorName || 'Gia sư',
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

      // Handle creating dispute
    const handleCreateDispute = (slot) => {
      // Kiểm tra slot đã hoàn thành chưa (status = 1: AwaitingPayout)
      if (slot.status !== 1) {
        toast.error("Chỉ có thể báo cáo slot đã hoàn thành!");
        return;
      }
    
    setSelectedBookingForDispute({
      bookedSlotId: slot.id, // Sử dụng slot.id làm bookedSlotId
      slotNumber: slot.slotIndex,
      lessonName: slot.lessonName || "Khóa học",
      tutorName: slot.tutorName || "Gia sư",
      slot: slot
    });
    setShowDisputeModal(true);
  };

  const handleDisputeSuccess = () => {
    // Refresh disputes list after successful creation
    fetchDisputes();
    toast.success("Báo cáo đã được gửi thành công!");
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
          Quản lí slot học ({lessons.length} khóa học)
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

      {lessons.length === 0 ? (
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
            {lessons.map((booking) => (
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
                            {(booking.totalPrice || 0).toLocaleString('vi-VN')} VND
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewCourseInfo(booking)}
                        className="px-3 py-2 text-sm rounded-lg border text-white hover:opacity-90 transition-all duration-200"
                        style={{ backgroundColor: '#666666', borderColor: '#666666' }}
                      >
                        <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Thông tin khóa học
                      </button>
                      {/* Rating button - only show when booking is completed and no rating exists */}
                      {booking.status === 4 && !getGroupRating({ bookings: [booking] }) && (
                        <button
                          onClick={() => handleRateBooking({ bookings: [booking] })}
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
                        {getGroupRating({ bookings: [booking] }) && (
                          <div className="px-3 py-2 text-sm rounded-lg bg-green-100 text-green-700 flex items-center space-x-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span>Đã đánh giá</span>
                          </div>
                        )}
                        
                                                 {/* Cancel booking button */}
                         <button
                           onClick={() => handleCancelBooking(booking)}
                           disabled={booking.status === 4 || booking.status === 3}
                           className={`px-3 py-2 text-sm rounded-lg transition-colors duration-200 flex items-center space-x-1 ${
                             booking.status === 4 || booking.status === 3
                               ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                               : 'bg-red-500 text-white hover:bg-red-600'
                           }`}
                           title={(() => {
                             if (booking.status === 4) return "Booking đã hoàn thành";
                             if (booking.status === 3) return "Booking đã được hủy";
                             return "Hủy booking";
                           })()}
                         >
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                           </svg>
                           <span>Hủy booking</span>
                         </button>
                        
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
                          // Sort all slots by proximity to current date
                          const sortedSlots = sortSlotsByProximityToCurrentDate(booking.bookedSlots || []);
                          
                                                      return sortedSlots.map((slot, globalIndex) => {
                              // Calculate sequential number based on sorted order
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
                                              {formatSlotDateTimeUTC0(slot.slotIndex, slot.bookedDate)}
                                            </span>
                                            <div className="text-xs text-gray-500 mt-1">
                                              Slot {slot.slotIndex}
                                            </div>
                                            {slot.slotNote && (
                                              <div className="text-xs text-gray-600 mt-1">
                                                Ghi chú: {slot.slotNote}
                                              </div>
                                            )}
                                          </div>
                                          <div className="flex items-center gap-2">
                                            {getSlotStatusBadge(slot.status)}
                                            {/* Nút khiếu nại chỉ hiển thị cho slot đã hoàn thành (status = 1: AwaitingPayout) */}
                                            {slot.status === 1 && (
                                              hasSlotDispute(slot.id) ? (
                                                <div className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-md flex items-center gap-1">
                                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                  </svg>
                                                  Đã khiếu nại
                                                </div>
                                              ) : (
                                                <button
                                                  onClick={() => handleCreateDispute({
                                                    ...slot,
                                                    lessonName: booking.lessonName || booking.lessonSnapshot?.name || 'Khóa học',
                                                    tutorName: booking.tutorName || 'Gia sư'
                                                  })}
                                                  className="px-2 py-1 text-xs bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200 flex items-center gap-1"
                                                  title="Khiếu nại slot này"
                                                >
                                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                                  </svg>
                                                  Khiếu nại
                                                </button>
                                              )
                                            )}
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
                      <RatingDisplay group={{ bookings: [booking] }} />
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
                                                 src={selectedLessonInfo.group.tutorAvatarUrl || selectedLessonInfo.group.bookings[0]?.tutorAvatarUrl || "https://via.placeholder.com/64"}
                                                  alt={selectedLessonInfo.group.tutorName || selectedLessonInfo.group.bookings[0]?.tutorName}
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/64";
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-2xl font-bold mb-2" style={{ color: '#666666' }}>
                        {selectedLessonInfo.lessonData.name || selectedLessonInfo.group.lessonName || selectedLessonInfo.group.bookings[0]?.lessonName}
                      </h4>
                      <p className="text-gray-600 flex items-center">
                        <span className="font-medium">Gia sư:</span>
                        <span className="ml-2">{selectedLessonInfo.group.tutorName || selectedLessonInfo.group.bookings[0]?.tutorName}</span>
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
                        {selectedLessonInfo.lessonData.durationInMinutes && (selectedLessonInfo.group.slotCount || selectedLessonInfo.group.bookings[0]?.slotCount)
                          ? `${(selectedLessonInfo.group.slotCount || selectedLessonInfo.group.bookings[0]?.slotCount) * selectedLessonInfo.lessonData.durationInMinutes} phút`
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
                        <span className="ml-2" style={{ color: '#666666' }}>{selectedLessonInfo.group.slotCount || selectedLessonInfo.group.bookings[0]?.slotCount} slot</span>
                      </div>
                      <div>
                        <span className="text-blue-600 font-medium">Tổng tiền:</span>
                        <span className="ml-2 font-bold" style={{ color: '#666666' }}>{(selectedLessonInfo.group.totalPrice || selectedLessonInfo.group.bookings[0]?.totalPrice || 0).toLocaleString('vi-VN')} VND</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-blue-600 font-medium">Trạng thái:</span>
                        <span className="ml-2">{(() => {
                          const booking = selectedLessonInfo.group.bookings[0];
                          const status = booking?.status || 0;
                          return status === 4 ? 'Hoàn thành' : 
                                 status === 1 ? 'Đã yêu cầu khiếu nại' :
                                 status === 2 ? 'Đang tranh chấp' : 
                                 status === 3 ? 'Đã hủy' :
                                 'Đang diễn ra';
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

      {/* Create Dispute Modal */}
      <CreateDisputeModal
        isOpen={showDisputeModal}
        onClose={() => setShowDisputeModal(false)}
        booking={selectedBookingForDispute}
        onSuccess={handleDisputeSuccess}
      />

      {/* Cancel Booking Modal */}
      <Dialog open={cancelBookingModalOpen} onClose={() => setCancelBookingModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6" component="div" sx={{ color: "#dc2626", fontWeight: 600 }}>
            Xác nhận hủy booking
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedBookingForCancel && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Thông tin booking:
              </Typography>
              <Box sx={{ p: 2, backgroundColor: "#f8fafc", borderRadius: 1, border: "1px solid #e2e8f0" }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Gia sư:</strong> {selectedBookingForCancel.tutorName}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                                     <strong>Bài học:</strong> {selectedBookingForCancel.lessonName || selectedBookingForCancel.lessonSnapshot?.name || 'Khóa học'}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Tổng giá:</strong> {selectedBookingForCancel.totalPrice?.toLocaleString()} VNĐ
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Số slot:</strong> {selectedBookingForCancel.bookedSlots?.length || 0} slots
                </Typography>
                <Typography variant="body2" sx={{ color: "#dc2626", fontWeight: 600 }}>
                  <strong>Ngày đặt lịch sớm nhất:</strong> {selectedBookingForCancel.bookedSlots?.[0] ? new Date(selectedBookingForCancel.bookedSlots[0].bookedDate).toLocaleDateString() : 'N/A'}
                </Typography>
              </Box>
            </Box>
          )}
          
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Lý do hủy booking: *
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Vui lòng nhập lý do hủy booking..."
            variant="outlined"
            sx={{ mb: 2 }}
          />
          
          <Box sx={{ p: 2, backgroundColor: "#fef2f2", borderRadius: 1, border: "1px solid #fecaca" }}>
            <Typography variant="body2" sx={{ color: "#dc2626", fontWeight: 500 }}>
              ⚠️ Lưu ý: Việc hủy booking sẽ không thể hoàn tác. Vui lòng cân nhắc kỹ trước khi thực hiện.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setCancelBookingModalOpen(false)} 
            disabled={cancellingBooking}
            variant="outlined"
          >
            Hủy
          </Button>
          <Button 
            onClick={async () => {
              if (!selectedBookingForCancel || !cancelReason.trim()) {
                toast.error("Vui lòng nhập lý do hủy booking!");
                return;
              }
              try {
                setCancellingBooking(true);
                await learnerCancelBookingByBookingId(selectedBookingForCancel.id, cancelReason.trim());
                
                // Close modal first
                setCancelBookingModalOpen(false);
                setSelectedBookingForCancel(null);
                setCancelReason("");
                
                // Reload the list to get updated data
                await fetchLessons();
                
                // Show success toast after a small delay
                setTimeout(() => {
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
                
                toast.error(errorMessage);
              } finally {
                setCancellingBooking(false);
              }
            }}
            variant="contained"
            disabled={cancellingBooking || !cancelReason.trim()}
            sx={{ 
              bgcolor: "#dc2626", 
              "&:hover": { bgcolor: "#b91c1c" },
              fontWeight: 600
            }}
          >
            {cancellingBooking ? "Đang xử lý..." : "Xác nhận hủy"}
          </Button>
        </DialogActions>
      </Dialog>

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