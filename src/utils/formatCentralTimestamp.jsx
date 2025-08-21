export const formatCentralTimestamp = (timestamp) => {
  if (!timestamp) return "Không có";
  
  try {
    const date = new Date(timestamp);
    if (isNaN(date)) return "Thời gian không hợp lệ";
    
    // Format as DD/MM/YYYY HH:mm
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch (error) {
    console.error("Lỗi định dạng thời gian:", error);
    return "Thời gian không hợp lệ";
  }
};

/**
 * Convert UTC+0 timestamp to UTC+7 for display
 * @param {string|Date} timestamp - UTC+0 timestamp from backend
 * @returns {Date} UTC+7 date object
 */
export const convertUTC0ToUTC7 = (timestamp) => {
  if (!timestamp) return null;
  
  try {
    const date = new Date(timestamp);
    if (isNaN(date)) return null;
    
    // Create a new date object and add 7 hours to convert from UTC+0 to UTC+7
    const utc7Date = new Date(date.getTime() + (7 * 60 * 60 * 1000));
    
    return utc7Date;
  } catch (error) {
    console.error("Lỗi chuyển đổi múi giờ UTC+0 sang UTC+7:", error);
    return null;
  }
};

/**
 * Convert UTC+7 timestamp to UTC+0 for backend communication
 * @param {string|Date} timestamp - UTC+7 timestamp from frontend
 * @returns {Date} UTC+0 date object
 */
export const convertUTC7ToUTC0 = (timestamp) => {
  if (!timestamp) return null;
  
  try {
    const date = new Date(timestamp);
    if (isNaN(date)) return null;
    
    // Create a new date object and subtract 7 hours to convert from UTC+7 to UTC+0
    const utc0Date = new Date(date.getTime() - (7 * 60 * 60 * 1000));
    
    return utc0Date;
  } catch (error) {
    console.error("Lỗi chuyển đổi múi giờ UTC+7 sang UTC+0:", error);
    return null;
  }
};

/**
 * Format UTC+0 timestamp to UTC+7 for display
 * @param {string|Date} timestamp - UTC+0 timestamp from backend
 * @returns {string} Formatted UTC+7 timestamp
 */
export const formatUTC0ToUTC7 = (timestamp) => {
  const utc7Date = convertUTC0ToUTC7(timestamp);
  if (!utc7Date) return "Không có";
  
  return formatCentralTimestamp(utc7Date);
};

/**
 * Convert response data from UTC+0 to UTC+7 for booking offers
 * @param {Object} response - API response object
 * @returns {Object} Response with converted timestamps
 */
export const convertBookingOfferResponseToUTC7 = (response) => {
  if (!response) return response;
  
  try {
    // Deep clone the response to avoid mutating the original
    const convertedResponse = JSON.parse(JSON.stringify(response));
    
    // Convert offeredSlots timestamps if they exist
    if (convertedResponse.data && Array.isArray(convertedResponse.data.offeredSlots)) {
      convertedResponse.data.offeredSlots = convertedResponse.data.offeredSlots.map(slot => ({
        ...slot,
        slotDateTime: convertUTC0ToUTC7(slot.slotDateTime)
      }));
    }
    
    // Convert createdTime if it exists
    if (convertedResponse.data && convertedResponse.data.createdTime) {
      convertedResponse.data.createdTime = convertUTC0ToUTC7(convertedResponse.data.createdTime);
    }
    
    // Convert updatedTime if it exists
    if (convertedResponse.data && convertedResponse.data.updatedTime) {
      convertedResponse.data.updatedTime = convertUTC0ToUTC7(convertedResponse.data.updatedTime);
    }
    
    return convertedResponse;
  } catch (error) {
    console.error("Lỗi chuyển đổi response sang UTC+7:", error);
    return response; // Return original response if conversion fails
  }
};

/**
 * Sort booked slots by chronological order (UTC+7)
 * @param {Array} bookedSlots - Array of booked slot objects
 * @returns {Array} Sorted array of booked slots
 */
export const sortBookedSlotsByDateTime = (bookedSlots) => {
  if (!Array.isArray(bookedSlots)) return bookedSlots;
  
  try {
    return [...bookedSlots].sort((a, b) => {
      // Convert both slots to UTC+7 for comparison
      const dateA = convertUTC0ToUTC7(a.bookedDate);
      const dateB = convertUTC0ToUTC7(b.bookedDate);
      
      if (!dateA || !dateB) return 0;
      
      // If dates are the same, sort by slotIndex
      if (dateA.getTime() === dateB.getTime()) {
        return (a.slotIndex || 0) - (b.slotIndex || 0);
      }
      
      // Sort by date (earliest first)
      return dateA.getTime() - dateB.getTime();
    });
  } catch (error) {
    console.error("Lỗi sắp xếp booked slots:", error);
    return bookedSlots;
  }
};

/**
 * Convert and sort booking detail response from UTC+0 to UTC+7
 * @param {Object} bookingDetail - Booking detail response from backend
 * @returns {Object} Booking detail with converted timestamps and sorted slots
 */
export const convertBookingDetailToUTC7 = (bookingDetail) => {
  if (!bookingDetail) return bookingDetail;
  
  try {
    // Deep clone the booking detail to avoid mutating the original
    const convertedDetail = JSON.parse(JSON.stringify(bookingDetail));
    
    // Sort booked slots by chronological order
    if (convertedDetail.bookedSlots && Array.isArray(convertedDetail.bookedSlots)) {
      convertedDetail.bookedSlots = sortBookedSlotsByDateTime(convertedDetail.bookedSlots);
    }
    
    return convertedDetail;
  } catch (error) {
    console.error("Lỗi chuyển đổi booking detail sang UTC+7:", error);
    return bookingDetail; // Return original if conversion fails
  }
};
