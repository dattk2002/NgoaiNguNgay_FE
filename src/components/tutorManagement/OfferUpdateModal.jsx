import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { 
  fetchTutorWeeklyPattern, 
  fetchTutorLessonDetailById,
  fetchTutorScheduleToOfferAndBook,
  updateTutorBookingOfferByOfferId,
  getStoredUser
} from "../api/auth";
import { formatLanguageCode } from "../../utils/formatLanguageCode";
import formatPriceWithCommas from "../../utils/formatPriceWithCommas";


const dayLabels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const dayInWeekOrder = [2, 3, 4, 5, 6, 7, 1]; // API: 2=Mon, ..., 7=Sat, 1=Sun

function formatDateRangeVN(start, end) {
  const options = { day: "2-digit", month: "2-digit", year: "numeric" };
  return `${start.toLocaleDateString("vi-VN", options)} - ${end.toLocaleDateString("vi-VN", options)}`;
}

function getPatternForWeek(patterns, weekStart) {
  if (!patterns || patterns.length === 0 || !weekStart) return null;
  // Sort patterns descending by appliedFrom
  const sorted = [...patterns].sort((a, b) => new Date(b.appliedFrom) - new Date(a.appliedFrom));
  // Find the pattern that starts before or at this week's Monday (so it applies to this week)
  return sorted.find(pattern => new Date(pattern.appliedFrom) <= weekStart) || sorted[sorted.length - 1];
}

const OfferUpdateModal = ({
  open,
  onClose,
  offer,
  onUpdateSuccess,
}) => {
  const [loading, setLoading] = useState(true);
  const [patterns, setPatterns] = useState([]);
  const [weekStart, setWeekStart] = useState(null);
  // Thay đổi selectedSlots thành selectedSlotsByWeek để lưu trữ theo tuần
  const [selectedSlotsByWeek, setSelectedSlotsByWeek] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [confirmUpdateOpen, setConfirmUpdateOpen] = useState(false);
  
  // Add lesson details state
  const [lessonDetails, setLessonDetails] = useState(null);
  const [lessonLoading, setLessonLoading] = useState(false);

  // Add schedule data state
  const [scheduleData, setScheduleData] = useState(null);
  const [scheduleLoading, setScheduleLoading] = useState(false);

  // Extract data from offer and current user
  const currentUser = getStoredUser();
  const tutorId = currentUser?.id; // Use current user's ID as tutor ID
  const tutorName = currentUser?.fullName; // Use current user's name as tutor name
  const lessonId = offer?.lessonId;
  const offerId = offer?.id;

  // Helper function to get week key
  const getWeekKey = (weekStartDate) => {
    if (!weekStartDate) return null;
    return weekStartDate.toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  // Helper function to get selected slots for current week
  const getSelectedSlotsForCurrentWeek = () => {
    if (!weekStart) return [];
    const weekKey = getWeekKey(weekStart);
    return selectedSlotsByWeek[weekKey] || [];
  };

  // Helper function to set selected slots for current week
  const setSelectedSlotsForCurrentWeek = (slots) => {
    if (!weekStart) return;
    const weekKey = getWeekKey(weekStart);
    setSelectedSlotsByWeek(prev => ({
      ...prev,
      [weekKey]: slots
    }));
  };

  // Returns true if the slot is before today (for current week)
  const isSlotInPast = (dayInWeek, slotIndex, weekStartDate = weekStart) => {
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
    // If slotDate is today, check time
    if (
      slotDate.getFullYear() === now.getFullYear() &&
      slotDate.getMonth() === now.getMonth() &&
      slotDate.getDate() === now.getDate()
    ) {
      // Each slot is 30min, slotIndex 0 = 00:00, 1 = 00:30, ..., 47 = 23:30
      const slotHour = Math.floor(slotIndex / 2);
      const slotMinute = slotIndex % 2 === 0 ? 0 : 30;
      if (
        slotHour < now.getHours() ||
        (slotHour === now.getHours() && slotMinute <= now.getMinutes())
      ) {
        return true;
      }
    }
    return false;
  };

  // Helper function to check if a slot is in the past based on its actual date
  const isSlotInPastByDateTime = (slotDateTime, slotIndex) => {
    if (!slotDateTime) return false;
    const slotDate = new Date(slotDateTime);
    const now = new Date();
    
    // If slotDate is before today, it's in the past
    if (
      slotDate.getFullYear() < now.getFullYear() ||
      (slotDate.getFullYear() === now.getFullYear() && slotDate.getMonth() < now.getMonth()) ||
      (slotDate.getFullYear() === now.getFullYear() && slotDate.getMonth() === now.getMonth() && slotDate.getDate() < now.getDate())
    ) {
      return true;
    }
    // If slotDate is today, check time
    if (
      slotDate.getFullYear() === now.getFullYear() &&
      slotDate.getMonth() === now.getMonth() &&
      slotDate.getDate() === now.getDate()
    ) {
      // Each slot is 30min, slotIndex 0 = 00:00, 1 = 00:30, ..., 47 = 23:30
      const slotHour = Math.floor(slotIndex / 2);
      const slotMinute = slotIndex % 2 === 0 ? 0 : 30;
      if (
        slotHour < now.getHours() ||
        (slotHour === now.getHours() && slotMinute <= now.getMinutes())
      ) {
        return true;
      }
    }
    return false;
  };

  useEffect(() => {
    if (!open || !offer) return;
    setLoading(true);
    
    const fetchData = async () => {
      try {
        // Fetch weekly pattern
        const patternData = await fetchTutorWeeklyPattern(tutorId);
        setPatterns(patternData || []);
        
        // Fetch lesson details if lessonId is provided
        if (lessonId) {
          setLessonLoading(true);
          try {
            const lessonData = await fetchTutorLessonDetailById(lessonId);
            setLessonDetails(lessonData);
          } catch (lessonError) {
            console.error("Failed to fetch lesson details:", lessonError);
            setLessonDetails(null);
          } finally {
            setLessonLoading(false);
          }
        } else {
          setLessonDetails(null);
        }

        // Calculate initial week start from the first offered slot
        if (offer.offeredSlots && offer.offeredSlots.length > 0) {
          const firstSlotDate = new Date(offer.offeredSlots[0].slotDateTime);
          const monday = new Date(firstSlotDate);
          const day = monday.getDay();
          const diff = day === 0 ? -6 : 1 - day; // Get Monday of the week
          monday.setDate(monday.getDate() + diff);
          monday.setHours(0, 0, 0, 0);
          setWeekStart(monday);
          
          // Fetch schedule data for the initial week
          setScheduleLoading(true);
          try {
            const sunday = new Date(monday);
            sunday.setDate(monday.getDate() + 6);
            
            const startDate = monday.toLocaleDateString("en-CA");
            const endDate = sunday.toLocaleDateString("en-CA");
            
            console.log("🔍 Initial schedule fetch with dates:", { startDate, endDate });
            
            const scheduleData = await fetchTutorScheduleToOfferAndBook(tutorId, startDate, endDate);
            setScheduleData(scheduleData);
            
            // Debug: Log offer details
            console.log("🔍 Offer details:", {
              offerId: offer.id,
              lessonId: offer.lessonId,
              offeredSlots: offer.offeredSlots,
              isExpired: offer.isExpired
            });
          } catch (scheduleError) {
            console.error("Failed to fetch schedule data:", scheduleError);
            setScheduleData(null);
          } finally {
            setScheduleLoading(false);
          }
        }

        // Convert all offered slots to selected slots format and organize by week
        if (offer.offeredSlots && offer.offeredSlots.length > 0) {
          const slotsByWeek = {};
          
          offer.offeredSlots.forEach(slot => {
            const slotDate = new Date(slot.slotDateTime);
            
            // Calculate the Monday of the week for this slot
            const slotMonday = new Date(slotDate);
            const day = slotMonday.getDay();
            const diff = day === 0 ? -6 : 1 - day; // Get Monday of the week
            slotMonday.setDate(slotMonday.getDate() + diff);
            slotMonday.setHours(0, 0, 0, 0);
            
            const weekKey = getWeekKey(slotMonday);
            
            if (!slotsByWeek[weekKey]) {
              slotsByWeek[weekKey] = [];
            }
            
            // Calculate the day offset from the week start (Monday)
            const timeDiff = slotDate.getTime() - slotMonday.getTime();
            const dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
            
            // Convert to API day format: 2=Mon, 3=Tue, 4=Wed, 5=Thu, 6=Fri, 7=Sat, 1=Sun
            const dayInWeek = dayDiff === 6 ? 1 : dayDiff + 2; // 6 days from Monday = Sunday (1)
            
            slotsByWeek[weekKey].push({
              dayInWeek: dayInWeek,
              slotIndex: slot.slotIndex,
              slotDateTime: slot.slotDateTime // Keep original slotDateTime for reference
            });
          });
          
          setSelectedSlotsByWeek(slotsByWeek);
          console.log("🔍 Offered slots organized by week:", slotsByWeek);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [open, offer, tutorId, lessonId]);

  // Remove the useEffect that filters selected slots when weekStart changes
  // We want to keep all selected slots visible regardless of current week

  // Calculate week range
  const monday = weekStart ? new Date(weekStart) : null;
  const sunday = monday ? new Date(monday) : null;
  if (sunday) sunday.setDate(monday.getDate() + 6);

  // Generate week dates for display
  const weekDates = [];
  if (monday) {
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      weekDates.push(d.getDate());
    }
  }

  // Week navigation handlers
  const handlePrevWeek = () => {
    if (!monday) return;
    const prevMonday = new Date(monday);
    prevMonday.setDate(monday.getDate() - 7);
    setWeekStart(prevMonday);
    fetchScheduleForWeek(prevMonday);
  };

  const handleNextWeek = () => {
    if (!monday) return;
    const nextMonday = new Date(monday);
    nextMonday.setDate(monday.getDate() + 7);
    setWeekStart(nextMonday);
    fetchScheduleForWeek(nextMonday);
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

  // Check if a slot is part of the current offer
  const isSlotPartOfCurrentOffer = (dayInWeek, slotIndex) => {
    if (!offer?.offeredSlots || !monday) return false;
    
    // Use the slotDateTime from the selected slot if available
    const currentWeekSlots = getSelectedSlotsForCurrentWeek();
    const selectedSlot = currentWeekSlots.find(s => s.dayInWeek === dayInWeek && s.slotIndex === slotIndex);
    if (selectedSlot && selectedSlot.slotDateTime) {
      const slotDateTimeStr = selectedSlot.slotDateTime;
      
      // Check if this slot is in the current offer's offeredSlots
      const isPartOfOffer = offer.offeredSlots.some(offeredSlot => {
        const offeredSlotDate = new Date(offeredSlot.slotDateTime);
        const selectedSlotDate = new Date(slotDateTimeStr);
        return offeredSlotDate.getTime() === selectedSlotDate.getTime() && offeredSlot.slotIndex === slotIndex;
      });
      
      return isPartOfOffer;
    }
    
    // Fallback: Calculate the date for this slot using the same logic as before
    const slotDate = new Date(monday);
    
    // Calculate the day offset from the week start (Monday)
    // dayInWeek: 2=Mon, 3=Tue, 4=Wed, 5=Thu, 6=Fri, 7=Sat, 1=Sun
    let dayDiff;
    if (dayInWeek === 1) { // Sunday
      dayDiff = 6;
    } else {
      dayDiff = dayInWeek - 2; // 2=Mon->0, 3=Tue->1, etc.
    }
    
    slotDate.setDate(monday.getDate() + dayDiff);
    
    // Set the time based on slotIndex
    const hour = Math.floor(slotIndex / 2);
    const minute = slotIndex % 2 === 0 ? 0 : 30;
    slotDate.setHours(hour, minute, 0, 0);
    
    // Convert to UTC+7 for comparison
    const utcPlus7Date = new Date(slotDate.getTime() + (7 * 60 * 60 * 1000));
    const slotDateTimeStr = utcPlus7Date.toISOString();
    
    // Check if this slot is in the current offer's offeredSlots
    const isPartOfOffer = offer.offeredSlots.some(offeredSlot => {
      const offeredSlotDate = new Date(offeredSlot.slotDateTime);
      const offeredSlotDateTimeStr = offeredSlotDate.toISOString();
      return offeredSlotDateTimeStr === slotDateTimeStr && offeredSlot.slotIndex === slotIndex;
    });
    
    // Debug logging for onhold slots
    if (getSlotStatus(dayInWeek, slotIndex) === 'onhold') {
      console.log(`🔍 Slot ${dayInWeek}-${slotIndex} onhold check:`, {
        slotDateTimeStr,
        isPartOfOffer,
        offeredSlots: offer.offeredSlots.map(s => ({
          slotDateTime: s.slotDateTime,
          slotIndex: s.slotIndex
        }))
      });
    }
    
    return isPartOfOffer;
  };

  // Check if a slot can be selected (available or onhold but part of current offer)
  const canSelectSlot = (dayInWeek, slotIndex) => {
    const slotStatus = getSlotStatus(dayInWeek, slotIndex);
    
    if (slotStatus === 'available') return true;
    if (slotStatus === 'onhold') {
      const isPartOfOffer = isSlotPartOfCurrentOffer(dayInWeek, slotIndex);
      console.log(`🔍 Slot ${dayInWeek}-${slotIndex} canSelect check:`, {
        slotStatus,
        isPartOfOffer,
        canSelect: isPartOfOffer
      });
      return isPartOfOffer;
    }
    
    return false;
  };

  // Get time label for slot index
  const getTimeLabel = (slotIdx) => {
    const hour = Math.floor(slotIdx / 2);
    const minute = slotIdx % 2 === 0 ? "00" : "30";
    const nextHour = slotIdx % 2 === 0 ? hour : hour + 1;
    const nextMinute = slotIdx % 2 === 0 ? "30" : "00";
    return `${hour.toString().padStart(2, "0")}:${minute} - ${nextHour.toString().padStart(2, "0")}:${nextMinute}`;
  };

  // Get pattern for current week
  const pattern = getPatternForWeek(patterns, weekStart);

  const handleSlotClick = (dayInWeek, slotIndex) => {
    // Don't allow selection if offer is expired
    if (offer?.isExpired) return;
    
    // Check if slot is in the past
    const isPastSlot = isSlotInPast(dayInWeek, slotIndex);
    if (isPastSlot) return;
    
    // Check if slot can be selected
    if (!canSelectSlot(dayInWeek, slotIndex)) return;
    
    const currentWeekSlots = getSelectedSlotsForCurrentWeek();
    const newSlots = currentWeekSlots.some((s) => s.dayInWeek === dayInWeek && s.slotIndex === slotIndex)
      ? currentWeekSlots.filter((s) => !(s.dayInWeek === dayInWeek && s.slotIndex === slotIndex))
      : [...currentWeekSlots, { 
          dayInWeek, 
          slotIndex,
          // Calculate slotDateTime for newly selected slots
          slotDateTime: (() => {
            if (!weekStart) return null;
            const slotDate = new Date(weekStart);
            
            // Calculate the day offset from the week start (Monday)
            // dayInWeek: 2=Mon, 3=Tue, 4=Wed, 5=Thu, 6=Fri, 7=Sat, 1=Sun
            let dayDiff;
            if (dayInWeek === 1) { // Sunday
              dayDiff = 6;
            } else {
              dayDiff = dayInWeek - 2; // 2=Mon->0, 3=Tue->1, etc.
            }
            
            slotDate.setDate(weekStart.getDate() + dayDiff);
            
            // Set the time based on slotIndex
            const hour = Math.floor(slotIndex / 2);
            const minute = slotIndex % 2 === 0 ? 0 : 30;
            slotDate.setHours(hour, minute, 0, 0);
            
            return slotDate.toISOString();
          })()
        }];
    
    setSelectedSlotsForCurrentWeek(newSlots);
  };

  const handleUpdateOffer = () => {
    // Don't allow update if offer is expired
    if (offer?.isExpired) {
      toast.error("Không thể cập nhật đề xuất đã hết hạn.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }
    
    // Get all selected slots from all weeks
    const allSelectedSlots = Object.values(selectedSlotsByWeek).flat();
    
    if (allSelectedSlots.length === 0) {
      toast.error("Vui lòng chọn ít nhất một khung giờ để cập nhật.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }
    
    setConfirmUpdateOpen(true);
  };

  const handleConfirmUpdate = async () => {
    setSubmitting(true);
    setSubmitError(null);
    
    console.log("🔗 OfferUpdateModal - Starting offer update submission");
    
    // Get all selected slots from all weeks
    const allSelectedSlots = Object.values(selectedSlotsByWeek).flat();
    
    console.log("📦 Update Details:", {
      offerId,
      lessonId,
      allSelectedSlots,
    });

    try {
      console.log("📦 OfferUpdateModal - Calling updateTutorBookingOfferByOfferId...");
      
      // Convert selected slots to the format expected by the API
      const slots = allSelectedSlots.map(slot => {
        // Use the slotDateTime if available, otherwise calculate it
        let slotDateTime;
        
        if (slot.slotDateTime) {
          // If slotDateTime exists, use it directly
          slotDateTime = slot.slotDateTime;
        } else {
          // Calculate slotDateTime for slots that don't have it
          if (!weekStart) {
            throw new Error("Week start date is not available");
          }
          
          const slotDate = new Date(weekStart);
          
          // Calculate the day offset from the week start (Monday)
          // dayInWeek: 2=Mon, 3=Tue, 4=Wed, 5=Thu, 6=Fri, 7=Sat, 1=Sun
          let dayDiff;
          if (slot.dayInWeek === 1) { // Sunday
            dayDiff = 6;
          } else {
            dayDiff = slot.dayInWeek - 2; // 2=Mon->0, 3=Tue->1, etc.
          }
          
          slotDate.setDate(weekStart.getDate() + dayDiff);
          
          // Set the time based on slotIndex
          const hour = Math.floor(slot.slotIndex / 2);
          const minute = slot.slotIndex % 2 === 0 ? 0 : 30;
          slotDate.setHours(hour, minute, 0, 0);
          
          slotDateTime = slotDate.toISOString();
        }
        
        // Validate the date before proceeding
        const slotDate = new Date(slotDateTime);
        if (isNaN(slotDate.getTime())) {
          throw new Error(`Invalid date for slot: dayInWeek=${slot.dayInWeek}, slotIndex=${slot.slotIndex}`);
        }
        
        // Set the time based on slotIndex (in case the original slotDateTime had wrong time)
        const hour = Math.floor(slot.slotIndex / 2);
        const minute = slot.slotIndex % 2 === 0 ? 0 : 30;
        slotDate.setHours(hour, minute, 0, 0);
        
        // Convert to UTC+7 instead of UTC+0
        const utcPlus7Date = new Date(slotDate.getTime() + (7 * 60 * 60 * 1000));
        
        return {
          slotDateTime: utcPlus7Date.toISOString(),
          slotIndex: slot.slotIndex
        };
      });

      const updateData = {
        lessonId: lessonId,
        offeredSlots: slots
      };

      console.log("📦 Update offer data:", updateData);
      
      await updateTutorBookingOfferByOfferId(offerId, updateData);
      console.log("✅ OfferUpdateModal - Offer updated successfully");

      setConfirmUpdateOpen(false);
      
      // Close modal first
      onClose();
      
      // Then call onUpdateSuccess to reload the list
      if (onUpdateSuccess) onUpdateSuccess();
      
      // Finally show success toast after a short delay to ensure modal is closed
      setTimeout(() => {
        toast.success("Cập nhật đề xuất thành công!", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }, 100);
    } catch (err) {
      console.error("❌ OfferUpdateModal - Error during offer update:", err);
      
      toast.error(err.message || "Cập nhật đề xuất thất bại. Vui lòng thử lại.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      setSubmitError(err.message || "Cập nhật đề xuất thất bại.");
    } finally {
      setSubmitting(false);
    }
  };

  // Get slot background color based on status
  const getSlotBackgroundColor = (dayInWeek, slotIndex, isSelected) => {
    const slotStatus = getSlotStatus(dayInWeek, slotIndex);
    const isPastSlot = isSlotInPast(dayInWeek, slotIndex);
    
    if (isSelected) {
      return isPastSlot ? "#6d9e46" : "#2563eb"; // Selected slots
    }
    
    if (isPastSlot) {
      // Past slots - muted colors
      switch (slotStatus) {
        case 'available': return "#6d9e46";
        case 'onhold': return "#f59e0b";
        case 'booked': return "#ef4444";
        default: return "#B8B8B8";
      }
    } else {
      // Current/future slots - normal colors
      switch (slotStatus) {
        case 'available': return "#98D45F";
        case 'onhold': return "#fbbf24";
        case 'booked': return "#f87171";
        default: return "#f1f5f9";
      }
    }
  };

  // Get current week's selected slots for display
  const currentWeekSelectedSlots = getSelectedSlotsForCurrentWeek();

  return (
      <div className="fixed inset-0 bg-black/50 flex justify-center items-end z-[1000] p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-h-[88vh] mx-auto relative overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-3 border-b border-gray-200 flex-shrink-0">
          {/* Top row - Title and Close button */}
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              Cập nhật đề xuất đến học viên
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

          {/* Bottom row - Student info, Lesson button, and Week navigation */}
          <div className="flex justify-between items-start gap-3">
            {/* Left side - Student information */}
            <div className="flex-1">
              <div className="bg-gray-50 p-2 rounded-lg border border-gray-200">
                <div className="grid grid-cols-2 gap-2">
                  {/* Row 1: Student name and Status */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600 font-medium">Học viên:</span>
                    <span className="text-xs text-gray-700 font-semibold">
                      {offer?.learner?.fullName || 'N/A'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600 font-medium">Trạng thái:</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      offer?.isExpired ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {offer?.isExpired ? 'Hết hạn' : 'Còn hiệu lực'}
                    </span>
                  </div>

                  {/* Row 2: Current price and Price per slot */}
                  {offer?.totalPrice && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 font-medium">Giá hiện tại:</span>
                      <span className="text-xs text-gray-700 font-semibold">
                        {formatPriceWithCommas(offer.totalPrice)} VNĐ
                      </span>
                    </div>
                  )}
                  
                  {offer?.pricePerSlot && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 font-medium">Giá mỗi slot:</span>
                      <span className="text-xs text-gray-700 font-semibold">
                        {formatPriceWithCommas(offer.pricePerSlot)} VNĐ
                      </span>
                    </div>
                  )}

                  {/* Row 3: Duration (spans full width) */}
                  {offer?.durationInMinutes && (
                    <div className="col-span-2 flex items-center gap-2">
                      <span className="text-xs text-gray-500 font-medium">Thời lượng:</span>
                      <span className="text-xs text-gray-700 font-semibold">
                        {offer.durationInMinutes} phút/slot
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
                  {monday && sunday ? formatDateRangeVN(monday, sunday) : ""}
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
          {/* Show expired warning if offer is expired */}
          {offer?.isExpired && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center z-10">
              <div className="bg-white border border-red-200 rounded-xl p-6 text-center shadow-2xl max-w-md mx-4">
                <div className="text-red-500 text-4xl mb-4">⚠️</div>
                <h3 className="text-lg font-bold text-red-800 mb-2">Đề xuất đã hết hạn</h3>
                <p className="text-red-600 mb-4">Không thể cập nhật đề xuất đã hết hạn.</p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Đóng
                </button>
              </div>
            </div>
          )}
          
          {loading || scheduleLoading ? (
            <div className="flex flex-1 overflow-hidden min-h-0">
              {/* Left side - Calendar skeleton */}
              <div className="flex-1 overflow-auto p-4">
                <div className="grid grid-cols-8 gap-1 min-w-[800px] bg-white rounded-lg border border-gray-200 overflow-hidden">
                  {/* Header row skeleton */}
                  <div className="p-2 bg-gray-50 border-b border-r border-gray-200">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="p-2 bg-gray-50 border-b border-gray-200">
                      <div className="h-3 bg-gray-200 rounded animate-pulse mb-1"></div>
                      <div className="h-2 bg-gray-200 rounded animate-pulse w-4 mx-auto"></div>
                    </div>
                  ))}
                  
                  {/* Time slots skeleton */}
                  {Array.from({ length: 48 }).map((_, slotIdx) => (
                    <React.Fragment key={slotIdx}>
                      {/* Time label skeleton */}
                      <div className="p-1 border-b border-r border-gray-200 min-h-[28px] flex items-center justify-center bg-gray-25">
                        <div className="h-2 bg-gray-200 rounded animate-pulse w-12"></div>
                      </div>
                      
                      {/* Day cells skeleton */}
                      {Array.from({ length: 7 }).map((_, dayIdx) => (
                        <div
                          key={dayIdx}
                          className="border border-gray-200 min-h-[28px] bg-gray-100 animate-pulse"
                        />
                      ))}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Right side - Sidebar skeleton */}
              <div className="w-72 border-l border-gray-200 bg-gray-50 p-4 overflow-y-auto flex-shrink-0">
                <div className="space-y-4">
                  {/* Title skeleton */}
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                  </div>
                  
                  {/* Lesson Details skeleton */}
                  <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
                    </div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-full mb-1"></div>
                    <div className="h-2 bg-gray-200 rounded animate-pulse w-3/4 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                  </div>

                  {/* Selected slots skeleton */}
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="h-2 bg-gray-200 rounded animate-pulse w-8"></div>
                              <div className="h-2 bg-gray-200 rounded animate-pulse w-6"></div>
                            </div>
                            <div className="h-2 bg-gray-200 rounded animate-pulse w-20"></div>
                          </div>
                          <div className="w-4 h-4 bg-gray-200 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary skeleton */}
                  <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="h-2 bg-gray-200 rounded animate-pulse w-16"></div>
                        <div className="h-2 bg-gray-200 rounded animate-pulse w-12"></div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="h-2 bg-gray-200 rounded animate-pulse w-12"></div>
                        <div className="h-3 bg-gray-200 rounded animate-pulse w-20"></div>
                      </div>
                      <div className="pt-2 border-t border-gray-100">
                        <div className="flex justify-between items-center">
                          <div className="h-2 bg-gray-200 rounded animate-pulse w-12"></div>
                          <div className="h-2 bg-gray-200 rounded animate-pulse w-8"></div>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="h-2 bg-gray-200 rounded animate-pulse w-12"></div>
                          <div className="h-2 bg-gray-200 rounded animate-pulse w-16"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : !pattern ? (
            <div className="flex-1 p-4 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-3">📅</div>
                <h3 className="text-base font-semibold text-gray-700 mb-1">Không có lịch trình</h3>
                <p className="text-gray-500 text-sm">Không có lịch trình khả dụng cho tuần này.</p>
                <p className="text-xs text-gray-400 mt-1">Vui lòng kiểm tra lại lịch trình của bạn</p>
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
                        const isSelected = currentWeekSelectedSlots.some(
                          (s) => s.dayInWeek === dayInWeek && s.slotIndex === slotIdx
                        );
                        
                        const slotStatus = getSlotStatus(dayInWeek, slotIdx);
                        const canSelect = canSelectSlot(dayInWeek, slotIdx);
                        const isPastSlot = isSlotInPast(dayInWeek, slotIdx);
                        const backgroundColor = getSlotBackgroundColor(dayInWeek, slotIdx, isSelected);

                        return (
                          <div
                            key={dayIdx}
                            className={`border border-gray-200 min-h-[28px] transition-all duration-200 relative ${
                              canSelect && !isPastSlot ? 'hover:bg-blue-100 hover:border-blue-300 cursor-pointer' : 'cursor-default'
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

              {/* Right side - Selected slots */}
              <AnimatePresence>
                {currentWeekSelectedSlots.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: 50, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 50, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="w-72 border-l border-gray-200 bg-gray-50 p-4 overflow-y-auto flex-shrink-0"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        <h4 className="font-semibold text-gray-900 text-base">Khung giờ đã chọn (Tuần này)</h4>
                      </div>
                      
                      {/* Lesson Details */}
                      {lessonDetails && (
                        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-base">📚</span>
                            <h5 className="font-semibold text-gray-900 text-sm">Bài học</h5>
                          </div>
                          <p className="text-xs font-medium text-gray-800 mb-1">{lessonDetails.name}</p>
                          <p className="text-xs text-gray-600 mb-1">
                            {formatLanguageCode(lessonDetails.languageCode)}
                            {lessonDetails.category && ` | ${lessonDetails.category}`}
                          </p>
                          <p className="text-xs font-bold text-blue-600">
                            {formatPriceWithCommas(lessonDetails.price)} VNĐ/slot
                          </p>
                        </div>
                      )}

                      {/* Selected slots list for current week */}
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {currentWeekSelectedSlots.map((slot, index) => {
                          // Calculate the actual date for this slot
                          let dayLabel = 'N/A';
                          let dateLabel = 'N/A';
                          
                          if (slot.slotDateTime) {
                            const slotDate = new Date(slot.slotDateTime);
                            
                            // Check if the date is valid
                            if (!isNaN(slotDate.getTime())) {
                              dayLabel = dayLabels[slotDate.getDay() === 0 ? 6 : slotDate.getDay() - 1];
                              const dayDate = slotDate.getDate();
                              const month = slotDate.getMonth() + 1;
                              const year = slotDate.getFullYear();
                              dateLabel = `${dayDate}/${month}/${year}`;
                            } else {
                              // Fallback: calculate date from weekStart and dayInWeek
                              if (weekStart) {
                                const slotDate = new Date(weekStart);
                                // dayInWeek: 2=Mon, 3=Tue, 4=Wed, 5=Thu, 6=Fri, 7=Sat, 1=Sun
                                let dayDiff;
                                if (slot.dayInWeek === 1) { // Sunday
                                  dayDiff = 6;
                                } else {
                                  dayDiff = slot.dayInWeek - 2; // 2=Mon->0, 3=Tue->1, etc.
                                }
                                slotDate.setDate(weekStart.getDate() + dayDiff);
                                
                                dayLabel = dayLabels[dayDiff];
                                const dayDate = slotDate.getDate();
                                const month = slotDate.getMonth() + 1;
                                const year = slotDate.getFullYear();
                                dateLabel = `${dayDate}/${month}/${year}`;
                              }
                            }
                          } else {
                            // Fallback: calculate date from weekStart and dayInWeek
                            if (weekStart) {
                              const slotDate = new Date(weekStart);
                              // dayInWeek: 2=Mon, 3=Tue, 4=Wed, 5=Thu, 6=Fri, 7=Sat, 1=Sun
                              let dayDiff;
                              if (slot.dayInWeek === 1) { // Sunday
                                dayDiff = 6;
                              } else {
                                dayDiff = slot.dayInWeek - 2; // 2=Mon->0, 3=Tue->1, etc.
                              }
                              slotDate.setDate(weekStart.getDate() + dayDiff);
                              
                              dayLabel = dayLabels[dayDiff];
                              const dayDate = slotDate.getDate();
                              const month = slotDate.getMonth() + 1;
                              const year = slotDate.getFullYear();
                              dateLabel = `${dayDate}/${month}/${year}`;
                            }
                          }
                          
                          const hour = Math.floor(slot.slotIndex / 2);
                          const minute = slot.slotIndex % 2 === 0 ? "00" : "30";
                          const nextHour = slot.slotIndex % 2 === 0 ? hour : hour + 1;
                          const nextMinute = slot.slotIndex % 2 === 0 ? "30" : "00";
                          const timeLabel = `${hour.toString().padStart(2, "0")}:${minute} - ${nextHour.toString().padStart(2, "0")}:${nextMinute}`;

                          // Check if this slot is in the past
                          const isPastSlot = isSlotInPastByDateTime(slot.slotDateTime, slot.slotIndex);

                          return (
                            <motion.div
                              key={`${slot.dayInWeek}-${slot.slotIndex}-${slot.slotDateTime}`}
                              initial={{ opacity: 0, x: 30, scale: 0.95 }}
                              animate={{ opacity: 1, x: 0, scale: 1 }}
                              exit={{ opacity: 0, x: -30, scale: 0.95 }}
                              transition={{ type: "spring", stiffness: 400, damping: 25, delay: index * 0.1 }}
                            >
                              <div className={`bg-white p-3 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow ${
                                isPastSlot ? 'opacity-70' : ''
                              }`}>
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-xs font-semibold text-gray-800">{dayLabel}</span>
                                      <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">{dateLabel}</span>
                                      {isSlotPartOfCurrentOffer(slot.dayInWeek, slot.slotIndex) && (
                                        <span className="text-xs text-yellow-600 bg-yellow-100 px-1.5 py-0.5 rounded-full font-medium">
                                          Từ offer hiện tại
                                        </span>
                                      )}
                                      {isPastSlot && (
                                        <span className="text-xs text-red-600 bg-red-100 px-1.5 py-0.5 rounded-full font-medium">
                                          Đã qua
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-xs font-bold text-blue-600">{timeLabel}</p>
                                  </div>
                                  <button
                                    onClick={() => handleSlotClick(slot.dayInWeek, slot.slotIndex)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-full transition-colors"
                                    title="Xóa khung giờ này"
                                    disabled={isPastSlot}
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>

                      {/* Summary for current week */}
                      <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-600">Tuần này:</span>
                            <span className="text-xs font-semibold text-gray-800">{currentWeekSelectedSlots.length} slot</span>
                          </div>
                          
                          {lessonDetails && lessonDetails.price && (
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-600">Giá tuần này:</span>
                              <span className="text-sm font-bold text-blue-600">
                                {formatPriceWithCommas(lessonDetails.price * currentWeekSelectedSlots.length)} VNĐ
                              </span>
                            </div>
                          )}
                          
                          {/* Show total across all weeks */}
                          {Object.keys(selectedSlotsByWeek).length > 1 && (
                            <div className="pt-2 border-t border-gray-100">
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500">Tổng tất cả tuần:</span>
                                <span className="text-xs font-medium text-green-600">
                                  {Object.values(selectedSlotsByWeek).flat().length} slot
                                </span>
                              </div>
                              {lessonDetails && lessonDetails.price && (
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-gray-500">Tổng giá:</span>
                                  <span className="text-xs font-bold text-green-600">
                                    {formatPriceWithCommas(lessonDetails.price * Object.values(selectedSlotsByWeek).flat().length)} VNĐ
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>

        {/* Footer - Nút "Cập nhật đề xuất" nằm ở đây */}
        <div className="border-t border-gray-200 p-4 flex-shrink-0">
          <div className="flex justify-between items-center">
            {/* Legend */}
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-green-400 border border-green-500"></div>
                <span className="text-green-700 font-medium">Lịch có sẵn</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-yellow-400 border border-yellow-500"></div>
                <span className="text-yellow-700 font-medium">Lịch đang giữ (có thể chọn nếu là offer hiện tại)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400 border border-red-500"></div>
                <span className="text-red-700 font-medium">Lịch đã đặt</span>
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
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium text-sm"
              >
                Đóng
              </button>
              <button
                onClick={handleUpdateOffer}
                disabled={currentWeekSelectedSlots.length === 0 || submitting || offer?.isExpired}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-sm hover:shadow-md text-sm"
              >
                {submitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Đang cập nhật...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Cập nhật đề xuất
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Confirm Update Dialog */}
        {confirmUpdateOpen && (
          <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1100] p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Xác nhận cập nhật đề xuất
              </h3>
              <p className="text-gray-600 mb-4">
                Bạn có chắc chắn muốn cập nhật đề xuất này không?
              </p>
              
              {lessonDetails && (
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <p className="text-sm font-medium text-gray-900 mb-3">Thông tin cập nhật:</p>
                  
                  {/* Basic info */}
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Bài học:</span>
                      <span className="text-sm font-medium text-gray-900">{lessonDetails.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Học viên:</span>
                      <span className="text-sm font-medium text-gray-900">{offer?.learner?.fullName || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Gia sư:</span>
                      <span className="text-sm font-medium text-gray-900">{tutorName || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Price and slots info */}
                  <div className="space-y-2 mb-3 pt-3 border-t border-gray-200">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Giá mỗi slot:</span>
                      <span className="text-sm font-medium text-gray-900">{formatPriceWithCommas(lessonDetails.price)} VNĐ</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Số slots:</span>
                      <span className="text-sm font-medium text-gray-900">{currentWeekSelectedSlots.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Tổng giá:</span>
                      <span className="text-sm font-bold text-blue-600">{formatPriceWithCommas(lessonDetails.price * currentWeekSelectedSlots.length)} VNĐ</span>
                    </div>
                  </div>

                  {/* Changes summary */}
                  {offer?.offeredSlots && offer.offeredSlots.length !== currentWeekSelectedSlots.length && (
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Thay đổi slots:</span>
                        <span className="text-sm font-medium text-blue-600">
                          {offer.offeredSlots.length} → {currentWeekSelectedSlots.length}
                        </span>
                      </div>
                      {offer?.totalPrice && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Thay đổi giá:</span>
                          <span className="text-sm font-medium text-blue-600">
                            {formatPriceWithCommas(offer.totalPrice)} → {formatPriceWithCommas(lessonDetails.price * currentWeekSelectedSlots.length)} VNĐ
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setConfirmUpdateOpen(false)}
                  disabled={submitting}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirmUpdate}
                  disabled={submitting}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? "Đang cập nhật..." : "Cập nhật"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Toast Container */}
      <ToastContainer 
        position="top-right"
        autoClose={5000}
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

export default OfferUpdateModal;
