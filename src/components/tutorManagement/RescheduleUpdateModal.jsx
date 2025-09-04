import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { showSuccess, showError } from "../../utils/toastManager.js";
import { Skeleton } from "@mui/material";
import { 
  createRescheduleRequests,
  fetchTutorWeeklyPattern, 
  fetchTutorLessonDetailById,
  fetchTutorScheduleToOfferAndBook,
  fetchBookingDetailbyBookingId,
  getStoredUser
} from "../api/auth";
import { formatTutorDate } from "../../utils/formatTutorDate";
import { formatSlotTime } from "../../utils/formatSlotTime";
import {
  formatSlotDateTimeFromTimestampDirect,
  formatSlotTimeRangeFromSlotIndex,
  formatSlotDateFromTimestampDirect,
} from "../../utils/formatSlotTime";
import NoFocusOutLineButton from "../../utils/noFocusOutlineButton";

const dayLabels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const dayInWeekOrder = [2, 3, 4, 5, 6, 7, 1]; // API: 2=Mon, ..., 7=Sat, 1=Sun

function formatDateRangeVN(start, end) {
  const options = { day: "2-digit", month: "2-digit", year: "numeric" };
  return `${start.toLocaleDateString("vi-VN", options)} - ${end.toLocaleDateString("vi-VN", options)}`;
}

const RescheduleUpdateModal = ({ 
  booking, 
  onClose, 
  onSuccess,
  isViewMode = false,
  rescheduleRequest = null,
  onAccept = null,
  onReject = null,
  processingAction = false,
  selectedOriginalSlot = null // Thêm prop này
}) => {
  const [formData, setFormData] = useState({
    reason: "",
  });
  const [formErrors, setFormErrors] = useState({
    reason: "",
  });
  const [loading, setLoading] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [scheduleData, setScheduleData] = useState(null);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [patterns, setPatterns] = useState([]);
  const [lessonDetails, setLessonDetails] = useState(null);
  const [lessonLoading, setLessonLoading] = useState(false);
  
  // Thay đổi selectedSlotsByWeek thành selectedSlot để chỉ chọn 1 slot
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Extract data from booking and current user
  const currentUser = getStoredUser();
  const tutorId = currentUser?.id;
  const lessonId = booking?.lessonId;
  
  // State to store booked slots from the current booking
  const [bookedSlotsFromBooking, setBookedSlotsFromBooking] = useState([]);

  // Get week start (Monday) and end (Sunday) - use useMemo to prevent recalculation
  const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
  };

  // Memoize date calculations to prevent unnecessary re-renders
  const { monday, weekEnd, weekDates } = useMemo(() => {
    const monday = getWeekStart(currentWeek);
    const weekEnd = new Date(monday);
    weekEnd.setDate(monday.getDate() + 6);

  // Get week dates for display
  const weekDates = dayInWeekOrder.map((_, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);
    return date.getDate();
  });

    return { monday, weekEnd, weekDates };
  }, [currentWeek]);

  // Helper function to get time label for slot index
  const getTimeLabel = (slotIdx) => {
    const hour = Math.floor(slotIdx / 2);
    const minute = slotIdx % 2 === 0 ? "00" : "30";
    const nextHour = slotIdx % 2 === 0 ? hour : hour + 1;
    const nextMinute = slotIdx % 2 === 0 ? "30" : "00";
    return `${hour.toString().padStart(2, "0")}:${minute} - ${nextHour.toString().padStart(2, "0")}:${nextMinute}`;
  };

  // Check if slot is in the past
  const isSlotInPast = (dayInWeek, slotIndex, weekStartDate = monday) => {
    if (!weekStartDate) return false;
    const slotDate = new Date(weekStartDate);
    // dayInWeek: 2=Mon, ..., 7=Sat, 1=Sun
    let jsDay = dayInWeek === 1 ? 6 : dayInWeek - 2; // 0=Mon, ..., 6=Sun
    slotDate.setDate(weekStartDate.getDate() + jsDay);

    const now = new Date();
    // If slotDate is before today, it's in the past
    if (
      slotDate.getFullYear() < now.getFullYear() ||
      (slotDate.getFullYear() === now.getFullYear() && slotDate.getMonth() < now.getMonth()) ||
      (slotDate.getFullYear() === now.getFullYear() && slotDate.getMonth() === now.getMonth() && slotDate.getDate() < now.getDate())
    ) {
      return true;
    }

    // If it's today, check the time
    if (
      slotDate.getFullYear() === now.getFullYear() &&
      slotDate.getMonth() === now.getMonth() &&
      slotDate.getDate() === now.getDate()
    ) {
      const slotHour = Math.floor(slotIndex / 2);
      const slotMinute = slotIndex % 2 === 0 ? 0 : 30;
      const slotTime = slotHour * 60 + slotMinute;
      const nowTime = now.getHours() * 60 + now.getMinutes();
      return slotTime < nowTime;
    }

    return false;
  };

  // Function to fetch schedule data for a specific week
  const fetchScheduleForWeek = async (weekStartDate) => {
    try {
      setScheduleLoading(true);
      const monday = new Date(weekStartDate);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      
      const startDate = monday.toLocaleDateString("en-CA");
      const endDate = sunday.toLocaleDateString("en-CA");
      
      console.log("🔍 Fetching schedule with dates:", { startDate, endDate });
      
      const scheduleData = await fetchTutorScheduleToOfferAndBook(tutorId, startDate, endDate);
      setScheduleData(scheduleData);
    } catch (scheduleError) {
      console.error("Failed to fetch schedule data:", scheduleError);
      setScheduleData(null);
    } finally {
      setScheduleLoading(false);
    }
  };

  // Get slot status from schedule data
  const getSlotStatus = (dayInWeek, slotIndex) => {
    if (!scheduleData || !monday) return 'unavailable';
    
    // Calculate the date for this day in week
    const dayDate = new Date(monday);
    const dayIndex = dayInWeekOrder.indexOf(dayInWeek);
    dayDate.setDate(monday.getDate() + dayIndex);
    
    const targetDateStr = dayDate.toLocaleDateString("en-CA");
    
    const dayData = scheduleData.find(day => {
      const scheduleDate = new Date(day.date);
      const scheduleDateStr = scheduleDate.toLocaleDateString("en-CA");
      return scheduleDateStr === targetDateStr;
    });

    if (!dayData) {
      return 'unavailable';
    }

    const slot = dayData.timeSlots.find(slot => slot.slotIndex === slotIndex);
    if (!slot) return 'unavailable';

    switch (slot.type) {
      case 0: return 'available';
      case 1: return 'onhold';
      case 2: return 'booked';
      default: return 'unavailable';
    }
  };

  // Cập nhật hàm canSelectSlot để chỉ cho phép chọn slot có sẵn
  const canSelectSlot = (dayInWeek, slotIndex) => {
    const isPast = isSlotInPast(dayInWeek, slotIndex);
    if (isPast) return false;
    
    const slotStatus = getSlotStatus(dayInWeek, slotIndex);
    
    // Chỉ cho phép chọn slot có sẵn (xanh lá) - KHÔNG cho phép chọn slot đã book
    return slotStatus === 'available';
  };

  // Cập nhật hàm handleSlotClick để chỉ chọn 1 slot
  const handleSlotClick = (dayInWeek, slotIndex) => {
    if (!canSelectSlot(dayInWeek, slotIndex)) {
      showError("Chỉ có thể chọn lịch có sẵn để thay đổi");
      return;
    }

    // Nếu slot này đã được chọn, bỏ chọn
    if (selectedSlot && selectedSlot.dayInWeek === dayInWeek && selectedSlot.slotIndex === slotIndex) {
      setSelectedSlot(null);
    } else {
      // Chọn slot mới (thay thế slot cũ nếu có)
      const newSlot = {
        dayInWeek,
        slotIndex,
        // Tính toán slotDateTime
        slotDateTime: (() => {
          if (!monday) return null;
          
          // Tính day offset từ week start (Monday)
          let dayDiff;
          if (dayInWeek === 1) { // Sunday
            dayDiff = 6;
          } else {
            dayDiff = dayInWeek - 2; // 2=Mon->0, 3=Tue->1, etc.
          }
          
          // Tạo date trong local timezone
          const targetDate = new Date(monday);
          targetDate.setDate(monday.getDate() + dayDiff);

          // Set time dựa trên slotIndex
          const hour = Math.floor(slotIndex / 2);
          const minute = slotIndex % 2 === 0 ? 0 : 30;
          targetDate.setHours(hour, minute, 0, 0);
          
          // Convert to ISO string
          const year = targetDate.getFullYear();
          const month = String(targetDate.getMonth() + 1).padStart(2, '0');
          const day = String(targetDate.getDate()).padStart(2, '0');
          const hours = String(hour).padStart(2, '0');
          const minutes = String(minute).padStart(2, '0');
          
          return `${year}-${month}-${day}T${hours}:${minutes}:00.000Z`;
        })()
      };
      
      setSelectedSlot(newSlot);
    }
  };

  // Handle week navigation - updated to preserve selected slots
  const handlePrevWeek = () => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() - 7);
    setCurrentWeek(newWeek);
    fetchScheduleForWeek(newWeek);
  };

  const handleNextWeek = () => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + 7);
    setCurrentWeek(newWeek);
    fetchScheduleForWeek(newWeek);
  };

  // Load tutor data and schedule
  useEffect(() => {
    const loadTutorData = async () => {
      try {
        setLessonLoading(true);

        // Load weekly patterns
        const patternResponse = await fetchTutorWeeklyPattern(tutorId);
        if (patternResponse && Array.isArray(patternResponse)) {
          setPatterns(patternResponse);
        }

        // Load lesson details if booking has lessonId
        if (lessonId) {
          const lessonResponse = await fetchTutorLessonDetailById(lessonId);
          if (lessonResponse) {
            setLessonDetails(lessonResponse);
          }
        }

        // Load booking detail to get booked slots
        if (booking?.id) {
          try {
            const bookingDetailResponse = await fetchBookingDetailbyBookingId(booking.id);
            if (bookingDetailResponse && bookingDetailResponse.data && bookingDetailResponse.data.bookedSlots) {
              setBookedSlotsFromBooking(bookingDetailResponse.data.bookedSlots);
            }
          } catch (error) {
            console.error("Error loading booking detail:", error);
          }
        }

      } catch (error) {
        console.error("Error loading tutor data:", error);
        showError("Không thể tải dữ liệu lịch trình");
      } finally {
        setLessonLoading(false);
      }
    };

    if (tutorId) {
      loadTutorData();
    }
  }, [tutorId, lessonId, booking?.id]);

  // Load schedule for current week - use currentWeek as dependency instead of monday
  useEffect(() => {
    if (tutorId && monday) {
      fetchScheduleForWeek(monday);
    }
  }, [tutorId, currentWeek]); // Changed from monday to currentWeek

  // Debug: Log selectedOriginalSlot khi component mount
  useEffect(() => {
    console.log("🔍 RescheduleUpdateModal mounted with selectedOriginalSlot:", selectedOriginalSlot);
  }, [selectedOriginalSlot]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = {};
    if (!formData.reason.trim()) {
      errors.reason = "Vui lòng nhập lý do thay đổi lịch";
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (!selectedSlot) {
      showError("Vui lòng chọn ít nhất một khung giờ để thay đổi");
      return;
    }

    if (!selectedOriginalSlot) {
      showError("Vui lòng chọn slot gốc để thay đổi");
      return;
    }

    try {
      setLoading(true);
      
      // Kiểm tra status của slot gốc
      if (selectedOriginalSlot.status !== 0) {
        throw new Error("Chỉ có thể thay đổi lịch cho slot có trạng thái 'Đang diễn ra'");
      }
      
      console.log("🔍 Original slot selected:", selectedOriginalSlot);
      console.log("🔍 New slot selected:", selectedSlot);
      
      // Tạo reschedule request với thông tin chính xác
      const request = {
        bookedSlotId: selectedOriginalSlot.id, // ID của slot gốc được chọn
        reason: formData.reason.trim(),
        newSlotDateTime: selectedSlot.slotDateTime,
        newSlotIndex: selectedSlot.slotIndex // Slot mới được chọn (xanh dương)
      };

      console.log("🔍 Submitting reschedule request:", request);
      
      // Gửi request
      const response = await createRescheduleRequests(request);
      
      if (response) {
        showSuccess("Đã gửi yêu cầu thay đổi lịch thành công!");
        onSuccess && onSuccess();
        onClose();
      } else {
        showError("Không thể tạo yêu cầu thay đổi lịch. Vui lòng thử lại!");
      }
    } catch (error) {
      console.error("❌ Error creating reschedule request:", error);
      
      // Hiển thị thông báo lỗi chi tiết hơn
      let errorMessage = "Có lỗi xảy ra khi gửi yêu cầu thay đổi lịch";
      
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 0:
        return "bg-green-100 text-green-800";
      case 1:
        return "bg-yellow-100 text-yellow-800";
      case 2:
        return "bg-red-100 text-red-800";
      case 3:
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
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

  // Cập nhật hàm getSlotBackgroundColor để chỉ hiển thị slot có sẵn và slot đã book
  const getSlotBackgroundColor = (dayInWeek, slotIndex, isSelected) => {
    const slotStatus = getSlotStatus(dayInWeek, slotIndex);
    const isPastSlot = isSlotInPast(dayInWeek, slotIndex);
    
    if (isSelected) {
      return isPastSlot ? "#6d9e46" : "#2563eb"; // Xanh dương khi được chọn
    }
    
    // Kiểm tra nếu slot này là từ current booking (đỏ)
    if (slotStatus === 'booked') {
      const slotDate = new Date(monday);
      const dayIndex = dayInWeekOrder.indexOf(dayInWeek);
      slotDate.setDate(monday.getDate() + dayIndex);
      
      const isFromCurrentBooking = bookedSlotsFromBooking.some(bookedSlot => {
        if (!bookedSlot.bookedDate || bookedSlot.slotIndex === undefined) return false;
        
        const bookedSlotDate = new Date(bookedSlot.bookedDate);
        return (
          bookedSlotDate.getDate() === slotDate.getDate() &&
          bookedSlotDate.getMonth() === slotDate.getMonth() &&
          bookedSlotDate.getFullYear() === slotDate.getFullYear() &&
          bookedSlot.slotIndex === slotIndex
        );
      });
      
      if (isFromCurrentBooking) {
        return isPastSlot ? "#ef4444" : "#ef4444"; // Đỏ cho slot đã book
      }
    }
    
    if (isPastSlot) {
      // Slot trong quá khứ - màu mờ
      switch (slotStatus) {
        case 'available': return "#6d9e46";
        case 'onhold': return "#f59e0b";
        case 'booked': return "#ef4444";
        default: return "#B8B8B8";
      }
    } else {
      // Slot hiện tại/tương lai - chỉ hiển thị slot có sẵn và slot đã book
      switch (slotStatus) {
        case 'available': return "#98D45F"; // Xanh lá cho slot có sẵn
        case 'booked': {
          // Kiểm tra nếu là slot từ current booking
          const slotDate = new Date(monday);
          const dayIndex = dayInWeekOrder.indexOf(dayInWeek);
          slotDate.setDate(monday.getDate() + dayIndex);
          
          const isFromCurrentBooking = bookedSlotsFromBooking.some(bookedSlot => {
            if (!bookedSlot.bookedDate || bookedSlot.slotIndex === undefined) return false;
            
            const bookedSlotDate = new Date(bookedSlot.bookedDate);
            return (
              bookedSlotDate.getDate() === slotDate.getDate() &&
              bookedSlotDate.getMonth() === slotDate.getMonth() &&
              bookedSlotDate.getFullYear() === slotDate.getFullYear() &&
              bookedSlot.slotIndex === slotIndex
            );
          });
          
          return isFromCurrentBooking ? "#ef4444" : "#f1f5f9"; // Đỏ nếu là slot đã book, xám nếu không
        }
        default: return "#f1f5f9"; // Xám cho các slot khác
      }
    }
  };

  // Get current week's selected slots for display
  // const currentWeekSelectedSlots = getSelectedSlotsForCurrentWeek(); // Xóa

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-end z-[1000] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-h-[88vh] mx-auto relative overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-3 border-b border-gray-200 flex-shrink-0">
          {/* Top row - Title and Close button */}
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {isViewMode ? 'Xem thay đổi lịch học' : 'Thay đổi lịch học'}
            </h3>
            
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Bottom row - Booking info and Week navigation */}
          <div className="flex justify-between items-start gap-3">
            {/* Left side - Booking information */}
            <div className="flex-1">
              <div className="bg-gray-50 p-2 rounded-lg border border-gray-200">
                <div className="grid grid-cols-2 gap-2">
                  {/* Row 1: Student name and Status */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600 font-medium">Học viên:</span>
                    <span className="text-xs text-gray-700 font-semibold">
                      {booking.learner?.fullName || "Học viên"}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600 font-medium">Trạng thái:</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                      {getStatusText(booking.status)}
                    </span>
                  </div>

                  {/* Row 2: Total price and Slot count */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 font-medium">Tổng giá:</span>
                    <span className="text-xs text-gray-700 font-semibold">
                      {booking.totalPrice ? `${booking.totalPrice.toLocaleString()} VNĐ` : 'N/A'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 font-medium">Số slot:</span>
                    <span className="text-xs text-gray-700 font-semibold">
                      {booking.slotCount || 0}
                    </span>
                  </div>

                  {/* Row 3: Lesson name (spans full width) */}
                  <div className="col-span-2 flex items-center gap-2">
                    <span className="text-xs text-gray-500 font-medium">Bài học:</span>
                    <span className="text-xs text-gray-700 font-semibold">
                      {booking.lessonName || 'Không có tên bài học'}
                    </span>
                  </div>

                  {/* Row 4: Selected original slot info (debug) */}
                  {selectedOriginalSlot && (
                    <div className="col-span-2 flex items-center gap-2">
                      <span className="text-xs text-gray-500 font-medium">Slot gốc:</span>
                      <span className="text-xs text-gray-700 font-semibold">
                        Slot {selectedOriginalSlot.slotIndex !== undefined ? formatSlotTime(selectedOriginalSlot.slotIndex) : 'N/A'} • {selectedOriginalSlot.bookedDate ? formatTutorDate(selectedOriginalSlot.bookedDate) : 'N/A'} (ID: {selectedOriginalSlot.id})
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right side - Week navigation */}
            <div className="flex items-center">
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-2 py-1">
                <button
                  onClick={handlePrevWeek}
                  className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="text-sm text-gray-700 font-medium min-w-[140px] text-center">
                  {formatDateRangeVN(monday, weekEnd)}
                </span>
                <button
                  onClick={handleNextWeek}
                  className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden min-h-0">
          {scheduleLoading ? (
            <div className="flex-1 p-4">
              {/* Calendar Skeleton */}
              <div className="grid grid-cols-8 gap-1 min-w-[800px] bg-white rounded-lg border border-gray-200 overflow-hidden">
                {/* Header row skeleton */}
                <div className="p-2 bg-gray-50 border-b border-r border-gray-200">
                  <Skeleton variant="text" width={60} height={20} />
                </div>
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="p-2 bg-gray-50 border-b border-gray-200">
                    <Skeleton variant="text" width={30} height={16} className="mx-auto" />
                    <Skeleton variant="text" width={20} height={12} className="mx-auto mt-1" />
                  </div>
                ))}
                
                {/* Time slots skeleton */}
                {Array.from({ length: 48 }).map((_, slotIdx) => (
                  <React.Fragment key={slotIdx}>
                    {/* Time label skeleton */}
                    <div className="p-1 border-b border-r border-gray-200 min-h-[28px] flex items-center justify-center bg-gray-25">
                      <Skeleton variant="text" width={80} height={14} />
                    </div>
                    
                    {/* Day cells skeleton */}
                    {Array.from({ length: 7 }).map((_, dayIdx) => (
                      <div key={dayIdx} className="border border-gray-200 min-h-[28px] p-1">
                        <Skeleton variant="rectangular" width="100%" height="100%" />
                      </div>
                    ))}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ) : (
            <>
          {/* Left side - Calendar table */}
          <div className="flex-1 overflow-auto p-4">
            <div className="grid grid-cols-8 gap-1 min-w-[800px] bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Header row */}
              <div className="p-2 font-semibold text-center text-xs bg-gray-50 border-b border-r border-gray-200">
                <div className="text-gray-700">Thời gian</div>
              </div>
              {dayLabels.map((label, i) => (
                <div key={i} className="p-2 font-semibold text-center text-xs bg-gray-50 border-b border-gray-200">
                  <div className="text-gray-700">{label}</div>
                  <div className="text-xs text-gray-500 font-medium">{weekDates[i]}</div>
                </div>
              ))}
              
              {/* Time slots */}
              {Array.from({ length: 48 }).map((_, slotIdx) => (
                <React.Fragment key={slotIdx}>
                  {/* Time label */}
                  <div className="p-1 text-xs text-center text-gray-600 border-b border-r border-gray-200 min-h-[28px] flex items-center justify-center bg-gray-25">
                    <span className="font-medium">{getTimeLabel(slotIdx)}</span>
                  </div>
                  
                  {/* Day cells */}
                  {dayInWeekOrder.map((dayInWeek, dayIdx) => {
                        const isSelected = selectedSlot && 
                          selectedSlot.dayInWeek === dayInWeek && 
                          selectedSlot.slotIndex === slotIdx;
                    
                    const isPastSlot = isSlotInPast(dayInWeek, slotIdx);
                        const canSelect = canSelectSlot(dayInWeek, slotIdx);
                    const backgroundColor = getSlotBackgroundColor(dayInWeek, slotIdx, isSelected);

                    return (
                      <div
                        key={dayIdx}
                        className={`border border-gray-200 min-h-[28px] transition-all duration-200 relative ${
                              canSelect ? 'hover:bg-blue-100 hover:border-blue-300 cursor-pointer' : 'cursor-default'
                        } ${isSelected ? 'ring-2 ring-blue-500 ring-offset-1' : ''} ${
                          isPastSlot ? 'opacity-70' : ''
                        }`}
                        style={{ backgroundColor }}
                        onClick={() => handleSlotClick(dayInWeek, slotIdx)}
                        title={`${dayLabels[dayInWeekOrder.indexOf(dayInWeek)]} ${weekDates[dayInWeekOrder.indexOf(dayInWeek)]} - ${getTimeLabel(slotIdx)}`}
                      >
                        {isPastSlot && (
                          <div 
                            className="absolute inset-0 pointer-events-none"
                            style={{
                              background: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.3) 2px, rgba(255,255,255,0.3) 4px)'
                            }}
                          />
                        )}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>

              {/* Right side - Selected slot and form */}
              <AnimatePresence>
                {!isViewMode && selectedSlot && (
                  <motion.div
                    initial={{ opacity: 0, x: 50, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 50, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="w-80 border-l border-gray-200 bg-gray-50 p-4 overflow-y-auto flex-shrink-0"
                  >
            <div className="space-y-4">
                      

                      {/* Selected slot display */}
                      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                        <h4 className="font-semibold text-gray-900 mb-4">
                          Slot đã chọn
                        </h4>
                        
                        {/* Selected slot info */}
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Thời gian:</span>
                              <span className="text-sm font-semibold text-blue-800">
                                {(() => {
                                  const hour = Math.floor(selectedSlot.slotIndex / 2);
                                  const minute = selectedSlot.slotIndex % 2 === 0 ? "00" : "30";
                                  const nextHour = selectedSlot.slotIndex % 2 === 0 ? hour : hour + 1;
                                  const nextMinute = selectedSlot.slotIndex % 2 === 0 ? "30" : "00";
                                  return `${hour.toString().padStart(2, "0")}:${minute} - ${nextHour.toString().padStart(2, "0")}:${nextMinute}`;
                                })()}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Ngày:</span>
                              <span className="text-sm font-semibold text-blue-800">
                                {(() => {
                                  if (selectedSlot.slotDateTime) {
                                    const slotDate = new Date(selectedSlot.slotDateTime);
                                    if (!isNaN(slotDate.getTime())) {
                                      return formatTutorDate(slotDate);
                                    }
                                  }
                                  
                                  // Fallback: tính từ monday và dayInWeek
                                  if (monday) {
                                    const slotDate = new Date(monday);
                                    let dayDiff;
                                    if (selectedSlot.dayInWeek === 1) { // Sunday
                                      dayDiff = 6;
                                    } else {
                                      dayDiff = selectedSlot.dayInWeek - 2; // 2=Mon->0, 3=Tue->1, etc.
                                    }
                                    slotDate.setDate(monday.getDate() + dayDiff);
                                    return formatTutorDate(slotDate);
                                  }
                                  return 'N/A';
                                })()}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Remove button */}
                        <div className="mt-3">
                          <NoFocusOutLineButton
                            onClick={() => setSelectedSlot(null)}
                            className="w-full px-3 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100 transition-all duration-200"
                          >
                            Bỏ chọn slot này
                          </NoFocusOutLineButton>
                        </div>
                      </div>

                      {/* Form */}
                      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                        <h4 className="font-semibold text-gray-900 mb-4">
                          Thông tin thay đổi lịch
                        </h4>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                          {/* Lý do thay đổi */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Lý do thay đổi lịch <span className="text-red-500">*</span>
                            </label>
                            <textarea
                              name="reason"
                              value={formData.reason}
                              onChange={handleInputChange}
                              rows={3}
                              className={`w-full px-3 py-2 border text-black rounded-md focus:outline-none focus:ring-2 focus:border-transparent ${
                                formErrors.reason 
                                  ? 'border-red-500 focus:ring-red-500' 
                                  : 'border-gray-300 focus:ring-blue-500'
                              }`}
                              placeholder="Nhập lý do thay đổi lịch..."
                            />
                            {formErrors.reason && (
                              <p className="mt-1 text-sm text-red-600">
                                {formErrors.reason}
                              </p>
                            )}
                          </div>

                          {/* Buttons */}
                          <div className="flex space-x-3 pt-4">
                            <NoFocusOutLineButton
                              type="button"
                              onClick={onClose}
                              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all duration-200"
                            >
                              Hủy
                            </NoFocusOutLineButton>
                            <NoFocusOutLineButton
                              type="submit"
                              disabled={loading || !selectedSlot}
                              className="flex-1 px-4 py-2 bg-blue-600 text-white border border-blue-600 rounded-lg text-sm font-medium hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {loading ? "Đang gửi..." : "Gửi yêu cầu"}
                            </NoFocusOutLineButton>
                          </div>
                        </form>
                      </div>
                    </div>
                  </motion.div>
                 )}
               </AnimatePresence>
               
               {/* Right side - Form for view mode */}
              <AnimatePresence>
                {isViewMode && (
                  <motion.div
                    initial={{ opacity: 0, x: 50, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 50, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="w-80 border-l border-gray-200 bg-gray-50 p-4 overflow-y-auto flex-shrink-0"
                  >
                    <div className="space-y-4">
                      {/* Form */}
                      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                        <h4 className="font-semibold text-gray-900 mb-4">
                          Thông tin yêu cầu thay đổi lịch
                        </h4>
                        
                        {/* Display reschedule request information */}
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-4">
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-gray-600 font-medium">Lý do thay đổi:</span>
                              <span className="ml-2">{rescheduleRequest?.reason || 'Không có lý do'}</span>
                            </div>
                            <div>
                              <span className="text-gray-600 font-medium">Thời gian yêu cầu:</span>
                              <span className="ml-2">{rescheduleRequest?.createdTime ? new Date(rescheduleRequest.createdTime).toLocaleString('vi-VN') : 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-gray-600 font-medium">Trạng thái:</span>
                              <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                                rescheduleRequest?.status === 0 ? 'bg-yellow-100 text-yellow-800' :
                                rescheduleRequest?.status === 1 ? 'bg-green-100 text-green-800' :
                                rescheduleRequest?.status === 2 ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {rescheduleRequest?.status === 0 ? 'Chờ phản hồi' :
                                 rescheduleRequest?.status === 1 ? 'Đã chấp nhận' :
                                 rescheduleRequest?.status === 2 ? 'Đã từ chối' :
                                 'Không xác định'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons for view mode */}
                        {rescheduleRequest?.status === 0 && (
                          <div className="space-y-3">
                            <NoFocusOutLineButton
                              type="button"
                              onClick={onAccept}
                              disabled={processingAction}
                              className="w-full px-4 py-2 bg-green-600 text-white border border-green-600 rounded-lg text-sm font-medium hover:bg-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {processingAction ? "Đang xử lý..." : "Chấp nhận thay đổi"}
                            </NoFocusOutLineButton>
                            <NoFocusOutLineButton
                              type="button"
                              onClick={onReject}
                              disabled={processingAction}
                              className="w-full px-4 py-2 bg-red-600 text-white border border-red-600 rounded-lg text-sm font-medium hover:bg-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {processingAction ? "Đang xử lý..." : "Từ chối thay đổi"}
                            </NoFocusOutLineButton>
                          </div>
                        )}
                        
                        {/* If already processed, just show close button */}
                        {rescheduleRequest?.status !== 0 && (
                          <div className="flex justify-end">
                            <NoFocusOutLineButton
                              type="button"
                              onClick={onClose}
                              className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all duration-200"
                            >
                              Đóng
                            </NoFocusOutLineButton>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>

        {/* Footer - Legend */}
        <div className="border-t border-gray-200 p-4 flex-shrink-0">
          <div className="flex items-center gap-4 text-xs">
            {isViewMode ? (
              // View mode legend
              <>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400 border border-red-500"></div>
                  <span className="text-red-700 font-medium">Lịch ban đầu</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-blue-600 border border-blue-700"></div>
                  <span className="text-blue-700 font-medium">Lịch được đề xuất thay đổi</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-gray-400 border border-gray-500 relative">
                    <div className="absolute inset-0" style={{
                      background: 'repeating-linear-gradient(45deg, transparent, transparent 1px, rgba(255,255,255,0.5) 1px, rgba(255,255,255,0.5) 2px)'
                    }}></div>
                  </div>
                  <span className="text-gray-700 font-medium">Lịch trong quá khứ</span>
                </div>
              </>
            ) : (
              // Create mode legend
              <>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-green-400 border border-green-500"></div>
                  <span className="text-green-700 font-medium">Lịch có sẵn (có thể chọn)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400 border border-red-500"></div>
                  <span className="text-red-700 font-medium">Lịch học viên đã book nhanh (không thể chọn)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-blue-600 border border-blue-700"></div>
                  <span className="text-blue-700 font-medium">Lịch bạn đang chọn</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-gray-400 border border-gray-500 relative">
                    <div className="absolute inset-0" style={{
                      background: 'repeating-linear-gradient(45deg, transparent, transparent 1px, rgba(255,255,255,0.5) 1px, rgba(255,255,255,0.5) 2px)'
                    }}></div>
                  </div>
                  <span className="text-gray-700 font-medium">Lịch trong quá khứ</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RescheduleUpdateModal;
