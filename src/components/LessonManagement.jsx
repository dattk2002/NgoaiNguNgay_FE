import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { showSuccess, showError } from "../utils/toastManager.js";
import "react-toastify/dist/ReactToastify.css";
import { fetchLearnerBookings, fetchLearnerDisputes, learnerCancelBookingByBookingId, fetchBookingDetail, viewRescheduleRequests, viewRescheduleRequestDetailByRequestId, learnerAcceptRescheduleRequest, learnerRejectRescheduleRequest } from "./api/auth";
import { formatCentralTimestamp, formatUTC0ToUTC7, convertBookingDetailToUTC7 } from "../utils/formatCentralTimestamp";
import { calculateUTC7SlotIndex } from "../utils/formatSlotTime";
import { formatSlotDateTime, sortSlotsByChronologicalOrder } from "../utils/formatSlotTime";
import { Skeleton, Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, TextField, Typography } from "@mui/material";
import CreateDisputeModal from "./modals/CreateDisputeModal";
import LegalDocumentModal from "./modals/LegalDocumentModal";

import { formatSlotDateTimeUTC0 } from "../utils/formatSlotTime";

const LessonManagement = () => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [originalTotalCount, setOriginalTotalCount] = useState(0); // Store original total count from API
  const [pageSize] = useState(10);
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [selectedLessonInfo, setSelectedLessonInfo] = useState(null);
  const [loadingLessonInfo, setLoadingLessonInfo] = useState(false);
  

  
  // Dispute modal states
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [selectedBookingForDispute, setSelectedBookingForDispute] = useState(null);
  
  // Disputes data
  const [disputes, setDisputes] = useState([]);
  const [disputesLoading, setDisputesLoading] = useState(false);

  // Reschedule requests data
  const [rescheduleRequests, setRescheduleRequests] = useState([]);
  const [rescheduleRequestsLoading, setRescheduleRequestsLoading] = useState(false);
  
  // Reschedule request details - store details for each request
  const [rescheduleRequestDetails, setRescheduleRequestDetails] = useState(new Map());
  const [loadingRescheduleDetails, setLoadingRescheduleDetails] = useState(new Set());



  // Cancel booking states
  const [cancelBookingModalOpen, setCancelBookingModalOpen] = useState(false);
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancellingBooking, setCancellingBooking] = useState(false);
  const [agreedToCancelTerms, setAgreedToCancelTerms] = useState(false);
  
  // Add legal document modal state
  const [showLegalDocumentModal, setShowLegalDocumentModal] = useState(false);



  // Helper function to check if a slot has a dispute
  const hasSlotDispute = (slotId) => {
    const hasDispute = disputes.some(dispute => dispute.bookedSlotId === slotId);
    return hasDispute;
  };

  // Helper function to check if any booking in a group has a dispute
  const hasGroupDispute = (group) => {
    const hasGroupDispute = group.bookings.some(booking => 
      booking.bookedSlots?.some(slot => hasSlotDispute(slot.id))
    );
    return hasGroupDispute;
  };

  // Helper function to check if a booking has a reschedule request
  const hasBookingRescheduleRequest = (bookingId, bookedSlots = []) => {
    // Check if any reschedule request matches this booking ID
    const hasReschedule = rescheduleRequests.some(request => 
      request.bookedSlotId === bookingId || 
      request.bookingId === bookingId ||
      // Also check if any slot in this booking has a reschedule request
      bookedSlots.some(slot => 
        request.bookedSlotId === slot.id || 
        request.slotId === slot.id
      )
    );
    
    return hasReschedule;
  };

  // Fetch disputes
  const fetchDisputes = async () => {
    setDisputesLoading(true);
    try {
      const response = await fetchLearnerDisputes(false); // Get all disputes, not just active ones
      if (response && response.data) {
        // Đảm bảo mỗi dispute có bookedSlotId
        const processedDisputes = response.data.map(dispute => ({
          ...dispute,
          bookedSlotId: dispute.bookedSlotId || dispute.bookingId // Fallback cho backward compatibility
        }));
        setDisputes(processedDisputes);
      } else {
        setDisputes([]);
      }
    } catch (error) {
      console.error("Failed to fetch disputes:", error);
      setDisputes([]);
    } finally {
      setDisputesLoading(false);
    }
  };

  // Fetch reschedule requests
  const fetchRescheduleRequests = async () => {
    setRescheduleRequestsLoading(true);
    try {
      const response = await viewRescheduleRequests({ pageIndex: 0, pageSize: 100 }); // Get all reschedule requests
      if (response && response.data && Array.isArray(response.data.items)) {
        setRescheduleRequests(response.data.items);
      } else {
        setRescheduleRequests([]);
      }
    } catch (error) {
      console.error("Failed to fetch reschedule requests:", error);
      setRescheduleRequests([]);
    } finally {
      setRescheduleRequestsLoading(false);
    }
  };

  // Fetch reschedule request details for a specific request
  const fetchRescheduleRequestDetails = async (requestId) => {
    if (rescheduleRequestDetails.has(requestId)) {
      return; // Already loaded
    }

    setLoadingRescheduleDetails(prev => new Set(prev).add(requestId));
    try {
      const response = await viewRescheduleRequestDetailByRequestId(requestId);
      
      if (response && response.data) {
        setRescheduleRequestDetails(prev => new Map(prev).set(requestId, response.data));
      }
    } catch (error) {
      console.error("Failed to fetch reschedule request details:", error);
      showError("Không thể tải chi tiết yêu cầu thay đổi lịch");
    } finally {
      setLoadingRescheduleDetails(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };



  // Handle accept reschedule request
  const handleAcceptRescheduleRequest = async (requestId) => {
    try {
      await learnerAcceptRescheduleRequest(requestId);
      
      // Refresh data
      await fetchLessons();
      await fetchRescheduleRequests();
      
      // Show success message
      showSuccess("Đã chấp nhận thay đổi lịch thành công!");
    } catch (error) {
      console.error("Failed to accept reschedule request:", error);
      showError("Không thể chấp nhận thay đổi lịch. Vui lòng thử lại!");
    }
  };

  // Handle reject reschedule request
  const handleRejectRescheduleRequest = async (requestId) => {
    try {
      await learnerRejectRescheduleRequest(requestId);
      
      // Refresh data
      await fetchLessons();
      await fetchRescheduleRequests();
      
      // Show success message
      showSuccess("Đã từ chối thay đổi lịch thành công!");
    } catch (error) {
      console.error("Failed to reject reschedule request:", error);
      showError("Không thể từ chối thay đổi lịch. Vui lòng thử lại!");
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 0:
        return "Đã xác nhận";
      case 1:
        return "Đã yêu cầu khiếu nại";
      case 2:
        return "Đang tranh chấp";
      case 3:
        return "Đã hủy";
      default:
        return "Không xác định";
    }
  };

  // Handle cancel booking
  const handleCancelBooking = (booking) => {
    setSelectedBookingForCancel(booking);
    setCancelReason("");
    setCancelBookingModalOpen(true);
  };

  // Handler to open legal document modal
  const handleLegalDocumentClick = (e) => {
    e.preventDefault();
    setShowLegalDocumentModal(true);
  };









  useEffect(() => {
    console.log("🔍 useEffect triggered - currentPage:", currentPage);
    fetchLessons();
    fetchDisputes(); // Call fetchDisputes here
    fetchRescheduleRequests(); // Call fetchRescheduleRequests here
  }, [currentPage]);

  // Calculate totalPages before useEffect to avoid initialization error
  const totalPages = Math.ceil(totalCount / pageSize);

  // Debug: Log lessons state changes
  useEffect(() => {
    console.log("🔍 Lessons state changed:", lessons.length, "bookings");
    console.log("🔍 Lessons state content:", lessons.map(b => ({ 
      id: b.id, 
      status: b.status, 
      lessonName: b.lessonName 
    })));
    
    // Check if any completed/cancelled bookings are in the state
    const problematicBookings = lessons.filter(b => {
      const status = parseInt(b.status);
      return status === 3 || status === 4;
    });
    
    if (problematicBookings.length > 0) {
      console.error("🚨 CRITICAL: Found problematic bookings in lessons state:", problematicBookings);
    }
  }, [lessons]);

  // Reset current page when total count changes significantly (e.g., after filtering)
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  // Fetch reschedule request details when reschedule requests change
  useEffect(() => {
    if (rescheduleRequests.length > 0) {
      rescheduleRequests.forEach(request => {
        if (!rescheduleRequestDetails.has(request.id)) {
          fetchRescheduleRequestDetails(request.id);
        }
      });
    }
  }, [rescheduleRequests, rescheduleRequestDetails]);

  const fetchLessons = async () => {
    setLoading(true);
    try {
      // Fetch all bookings by getting a large page size to account for filtering
      const response = await fetchLearnerBookings(1, 1000); // Fetch a large number to get all bookings
      
      console.log("🔍 API Response:", response);
      
      if (response && Array.isArray(response.items)) {
        const bookingList = response.items;
        
        console.log("🔍 All bookings from API:", bookingList.map(b => ({ 
          id: b.id, 
          status: b.status, 
          lessonName: b.lessonName,
          statusType: typeof b.status 
        })));
        
        // Store the original total count before filtering
        setOriginalTotalCount(response.totalCount || bookingList.length);
        
        // Filter out completed and cancelled bookings FIRST, before processing details
        // Only show: Đang diễn ra (0), Đã yêu cầu khiếu nại (1), Đang tranh chấp (2)
        const activeBookings = bookingList.filter(booking => {
          // Ensure status is a number and handle edge cases
          let status = booking.status;
          
          console.log(`🔍 Processing booking ${booking.id}: original status = ${status} (type: ${typeof status})`);
          
          // Convert to number if it's a string
          if (typeof status === 'string') {
            status = parseInt(status);
            console.log(`🔍 Converted string status ${booking.status} to number: ${status}`);
          }
          
          // Handle NaN cases
          if (isNaN(status)) {
            console.warn(`❌ Invalid status for booking ${booking.id}:`, booking.status);
            return false; // Exclude bookings with invalid status
          }
          
          // Only include active bookings: status 0, 1, or 2
          const isActive = status === 0 || status === 1 || status === 2;
          
          if (!isActive) {
            console.log(`🚫 Filtering out booking ${booking.id} with status ${status} (${booking.lessonName})`);
          } else {
            console.log(`✅ Keeping booking ${booking.id} with status ${status} (${booking.lessonName})`);
          }
          
          return isActive;
        });
        
        // Log filtering results for debugging
        console.log(`🔍 Filtering Results: Total=${bookingList.length}, Active=${activeBookings.length}`);
        console.log("🔍 Active bookings after filtering:", activeBookings.map(b => ({ 
          id: b.id, 
          status: b.status, 
          lessonName: b.lessonName 
        })));
        
        // Process bookings to get additional details including bookedSlots
        const processedBookings = await Promise.all(
          activeBookings.map(async (booking) => {
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
        
        console.log("🔍 Valid bookings:", validBookings.map(b => ({ 
          id: b.id, 
          status: b.status, 
          lessonName: b.lessonName,
          slotCount: b.bookedSlots?.length || 0
        })));
        
        // Apply pagination to filtered results
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedActiveBookings = validBookings.slice(startIndex, endIndex);
        
        console.log("🔍 Final paginated bookings to display:", paginatedActiveBookings.map(b => ({ 
          id: b.id, 
          status: b.status, 
          lessonName: b.lessonName,
          slotCount: b.bookedSlots?.length || 0
        })));
        
        console.log("🔍 Setting lessons state to:", paginatedActiveBookings.length, "bookings");
        console.log("🔍 Lessons state content:", paginatedActiveBookings.map(b => ({ 
          id: b.id, 
          status: b.status, 
          lessonName: b.lessonName,
          slotCount: b.bookedSlots?.length || 0
        })));
        
        console.log("🔍 About to set lessons state...");
        setLessons(paginatedActiveBookings);
        setTotalCount(validBookings.length); // Use filtered count for pagination
        
        console.log("🔍 About to set lessons state...");
      } else {
        console.log("❌ No valid response or items array");
        setLessons([]);
        setTotalCount(0);
        setOriginalTotalCount(0);
      }
    } catch (error) {
      console.error("❌ Lỗi khi tải danh sách buổi học:", error);
      setLessons([]);
      setTotalCount(0);
      setOriginalTotalCount(0);
      showError("Không thể tải danh sách buổi học. Vui lòng thử lại sau.");
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
      0: { label: "Đang chờ diễn ra", class: "bg-yellow-50 text-yellow-700 border border-yellow-200" },
      1: { label: "Đang chờ hệ thống thanh toán cho gia sư", class: "bg-blue-50 text-blue-700 border border-blue-200" },
      2: { label: "Hoàn thành", class: "bg-green-50 text-green-700 border border-green-200" },
      3: { label: "Đã hủy", class: "bg-red-50 text-red-700 border border-red-200" },
      4: { label: "Đã hủy do tranh chấp", class: "bg-orange-50 text-orange-700 border border-orange-200" }
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
      
      // Fetch detailed booking information using fetchBookingDetail
      const response = await fetchBookingDetail(booking.id);
      
      console.log("🔍 API Response in handleViewCourseInfo:", response);
      console.log("🔍 Response type:", typeof response);
      console.log("🔍 Response keys:", response ? Object.keys(response) : 'null');
      console.log("🔍 Response.lessonSnapshot:", response?.lessonSnapshot);
      
      // Check if response has lessonSnapshot
      if (response && response.lessonSnapshot) {
        console.log("✅ Found lessonSnapshot:", response.lessonSnapshot);
        setSelectedLessonInfo({
          group: { 
            bookings: [booking],
            slotCount: booking.slotCount,
            totalPrice: booking.totalPrice,
            lessonName: booking.lessonName,
            tutorName: booking.tutorName
          },
          lessonData: response.lessonSnapshot,
          error: null
        });
      } else {
        console.log("❌ No lessonSnapshot found in response:", response);
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
      showError(`Không thể tải thông tin khóa học: ${error.message}`);
    } finally {
      setLoadingLessonInfo(false);
    }
  };





      // Handle creating dispute
    const handleCreateDispute = (slot) => {
      // Kiểm tra slot đã hoàn thành chưa (status = 1: AwaitingPayout)
      if (slot.status !== 1) {
        showError("Chỉ có thể báo cáo slot đã hoàn thành!");
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
    // Toast success is already shown in CreateDisputeModal, no need to show again
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

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Reset current page when total count changes significantly (e.g., after filtering)
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

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
          Theo dõi khóa học
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
            {originalTotalCount > 0 ? 'Không có khóa học nào đang diễn ra' : 'Chưa có khóa học nào'}
          </h3>
          <p className="text-gray-500">
            {originalTotalCount > 0 
              ? 'Tất cả các khóa học đã hoàn thành hoặc đã hủy. Vui lòng kiểm tra tab "Lịch sử booking" để xem các khóa học này.'
              : 'Các slot học đã đặt sẽ xuất hiện ở đây'
            }
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
                                                       {lessons
                              .filter(booking => {
                                // Final safety check: ensure no completed or cancelled bookings are displayed
                                const status = parseInt(booking.status);
                                const shouldShow = status === 0 || status === 1 || status === 2;
                                
                                console.log(`🔍 Render filter: Booking ${booking.id} (${booking.lessonName}) - Status: ${status} - Should show: ${shouldShow}`);
                                
                                if (!shouldShow) {
                                  console.warn(`🚫 RENDER FILTER: Excluding booking ${booking.id} with status ${status} (${booking.lessonName})`);
                                }
                                
                                return shouldShow;
                              })
                              .map((booking) => {
              const hasReschedule = hasBookingRescheduleRequest(booking.id, booking.bookedSlots || []);
              return (
                <div 
                  key={booking.id} 
                  className={`border rounded-lg overflow-hidden ${
                    hasReschedule 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-gray-200'
                  }`}
                >
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
                                                     {/* Only show status badge for active bookings */}
                           {(booking.status === 0 || booking.status === 1 || booking.status === 2) && 
                             getBookingStatusBadge(booking.status || 0)
                           }
                           
                           
                          {/* Reschedule Request Badge */}
                          {hasReschedule && (
                            <div className="px-2 py-1 text-xs font-medium bg-red-500 text-white rounded-full flex items-center space-x-1">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                              </svg>
                              <span>Đề xuất thay đổi lịch</span>
                            </div>
                          )}
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

                        

                      

                      
                                                                         {/* Cancel booking button - only show for active bookings */}
                        {(booking.status === 0 || booking.status === 1 || booking.status === 2) && (
                         <button
                           onClick={() => handleCancelBooking(booking)}
                            className="px-3 py-2 text-sm rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors duration-200 flex items-center space-x-1"
                            title="Hủy booking"
                         >
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                           </svg>
                           <span>Hủy booking</span>
                         </button>
                        )}
                        

                        
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
                      
                      {/* Reschedule Requests Section */}
                      {(() => {
                        const bookingRescheduleRequests = rescheduleRequests.filter(request => 
                          request.bookingId === booking.id || 
                          request.bookedSlotId === booking.id ||
                          (booking.bookedSlots && booking.bookedSlots.some(slot => 
                            request.bookedSlotId === slot.id
                          ))
                        );

                        if (bookingRescheduleRequests.length > 0) {
                          return (
                            <div className="mb-4">
                              <h5 className="text-sm font-medium mb-2 text-red-600">
                                📅 Lịch thay đổi ({bookingRescheduleRequests.length})
                              </h5>
                              <div className="space-y-2">
                                {bookingRescheduleRequests.map((request, index) => {
                                  // Helper function to format slot time from slotIndex
                                  const formatSlotTimeFromIndex = (slotIndex) => {
                                    const hour = Math.floor(slotIndex / 2);
                                    const minute = slotIndex % 2 === 0 ? 0 : 30;
                                    const nextHour = slotIndex % 2 === 0 ? hour : hour + 1;
                                    const nextMinute = slotIndex % 2 === 0 ? 30 : 0;
                                    
                                    const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                                    const endTime = `${nextHour.toString().padStart(2, '0')}:${nextMinute.toString().padStart(2, '0')}`;
                                    
                                    return `${startTime} - ${endTime}`;
                                  };

                                  // Helper function to format date from slotDateTime
                                  const formatDateFromSlotDateTime = (slotDateTime) => {
                                    const date = new Date(slotDateTime);
                                    const day = date.getDate().toString().padStart(2, '0');
                                    const month = (date.getMonth() + 1).toString().padStart(2, '0');
                                    const year = date.getFullYear();
                                    return `${day}/${month}/${year}`;
                                  };
                                  
                                  return (
                                    <div key={request.id} className="bg-red-50 border border-red-200 rounded-lg p-3">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 flex-1">
                                          {/* Sequential Number */}
                                          <div className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0">
                                            {index + 1}
                                          </div>
                                          
                                          <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                              <div>
                                                {/* Offered Slot Time (if available) */}
                                                {request.offeredSlots && request.offeredSlots.length > 0 ? (
                                                  <div>
                                                    <span className="font-medium text-lg" style={{ color: '#666666' }}>
                                                      {formatDateFromSlotDateTime(request.offeredSlots[0].slotDateTime)} {formatSlotTimeFromIndex(request.offeredSlots[0].slotIndex)}
                                                    </span>
                                                    <div className="text-xs text-gray-500 mt-1">
                                                      Slot {request.offeredSlots[0].slotIndex}
                                                    </div>
                                                  </div>
                                                ) : (
                                                  <span className="font-medium text-lg" style={{ color: '#666666' }}>
                                                    Đang tải thông tin...
                                                  </span>
                                                )}
                                                {request.reason && (
                                                  <div className="text-xs text-gray-600 mt-1">
                                                    Lý do: {request.reason}
                                                  </div>
                                                )}
                                              </div>
                                              <div className="flex items-center gap-2">
                                                {/* Reschedule Tag */}
                                                <div className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-md flex items-center gap-1 border border-red-300">
                                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 0 11-18 0 9 9 0 0118 0z" />
                                                  </svg>
                                                  Được yêu cầu thay đổi lịch
                                                </div>
                                                
                                                {/* Status Badge */}
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                  request.status === 0 ? 'bg-yellow-100 text-yellow-800' :
                                                  request.status === 1 ? 'bg-green-100 text-green-800' :
                                                  request.status === 2 ? 'bg-red-100 text-red-800' :
                                                  'bg-gray-100 text-gray-800'
                                                }`}>
                                                  {request.status === 0 ? 'Chờ phản hồi' :
                                                   request.status === 1 ? 'Đã chấp nhận' :
                                                   request.status === 2 ? 'Đã từ chối' :
                                                   request.status === 3 ? 'Đã hết hạn' :
                                                   request.status === 4 ? 'Đã hủy' :
                                                   'Không xác định'}
                                                </span>
                                                
                                                {/* Action Buttons */}
                                                {request.status === 0 && (
                                                  <div className="flex items-center gap-2">
                                                    <button
                                                      onClick={() => handleAcceptRescheduleRequest(request.id)}
                                                      className="px-3 py-1 text-xs bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors duration-200"
                                                    >
                                                      Chấp nhận
                                                    </button>
                                                    <button
                                                      onClick={() => handleRejectRescheduleRequest(request.id)}
                                                      className="px-3 py-1 text-xs bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200"
                                                    >
                                                      Từ chối
                                                    </button>
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })()}
                      
                      <div className="space-y-2">
                                                 {(() => {
                           // Sort all slots by chronological order (earliest first)
                           const sortedSlots = sortSlotsByChronologicalOrder(booking.bookedSlots || []);
                          
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
                      
                      
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-6">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-black"
                  style={{ borderColor: '#666666', color: '#666666' }}
                >
                  Trước
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative ml-3 inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-black"
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
                      {totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0}
                    </span>{" "}
                    đến{" "}
                    <span className="font-medium">
                      {Math.min(currentPage * pageSize, totalCount)}
                    </span>{" "}
                    trong số{" "}
                    <span className="font-medium">{totalCount}</span> kết quả
                    {totalCount !== originalTotalCount && (
                      <span className="text-xs text-gray-500 ml-2">
                        (đã lọc bỏ các booking hoàn thành/đã hủy)
                      </span>
                    )}
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
                          ? `${Number(selectedLessonInfo.lessonData.price).toLocaleString('vi-VN')} VNĐ/slot`
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
                        <span className="ml-2 font-bold" style={{ color: '#666666' }}>{(selectedLessonInfo.group.totalPrice || selectedLessonInfo.group.bookings[0]?.totalPrice || 0).toLocaleString('vi-VN')} VNĐ</span>
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



      {/* Create Dispute Modal */}
      <CreateDisputeModal
        isOpen={showDisputeModal}
        onClose={() => setShowDisputeModal(false)}
        booking={selectedBookingForDispute}
        onSuccess={handleDisputeSuccess}
      />

      {/* Cancel Booking Modal */}
      <Dialog open={cancelBookingModalOpen} onClose={() => {
        setCancelBookingModalOpen(false);
        setAgreedToCancelTerms(false);
      }} maxWidth="sm" fullWidth>
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
          
          {/* Legal terms notice */}
          <Box sx={{ p: 2, backgroundColor: "#f0f9ff", borderRadius: 1, border: "1px solid #0ea5e9", mb: 2 }}>
            <Typography variant="body2" sx={{ color: "#0369a1", fontSize: "0.875rem" }}>
              <Button
                onClick={handleLegalDocumentClick}
                sx={{ 
                  p: 0, 
                  minWidth: "auto", 
                  textTransform: "none", 
                  textDecoration: "underline",
                  color: "#0369a1",
                  "&:hover": { 
                    backgroundColor: "transparent",
                    textDecoration: "underline"
                  }
                }}
              >
                Điều khoản dịch vụ và Chính sách
              </Button>
            </Typography>
          </Box>
          
          {/* Agreement Checkbox */}
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={agreedToCancelTerms}
              onChange={(e) => setAgreedToCancelTerms(e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            <Typography variant="body2" sx={{ color: "#374151" }}>
              Tôi đồng ý với Điều khoản dịch vụ và Chính sách
            </Typography>
          </Box>
          
          <Box sx={{ p: 2, backgroundColor: "#fef2f2", borderRadius: 1, border: "1px solid #fecaca" }}>
            <Typography variant="body2" sx={{ color: "#dc2626", fontWeight: 500 }}>
              ⚠️ Lưu ý: Việc hủy booking sẽ không thể hoàn tác. Vui lòng cân nhắc kỹ trước khi thực hiện.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => {
              setCancelBookingModalOpen(false);
              setAgreedToCancelTerms(false);
            }} 
            disabled={cancellingBooking}
            variant="outlined"
          >
            Hủy
          </Button>
          <Button 
            onClick={async () => {
              if (!selectedBookingForCancel || !cancelReason.trim()) {
                showError("Vui lòng nhập lý do hủy booking!");
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
                  showSuccess("Đã hủy booking thành công!");
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
                
                showError(errorMessage);
              } finally {
                setCancellingBooking(false);
              }
            }}
            variant="contained"
            disabled={cancellingBooking || !cancelReason.trim() || !agreedToCancelTerms}
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



      {/* Legal Document Modal */}
      <LegalDocumentModal
        isOpen={showLegalDocumentModal}
        onClose={() => setShowLegalDocumentModal(false)}
        category="hủy booking"
      />

    </div>
  );
};

export default LessonManagement; 