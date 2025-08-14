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
 * Convert UTC+0 timestamp to UTC+7
 * @param {string|Date} timestamp - UTC+0 timestamp
 * @returns {string} UTC+7 timestamp in ISO string format
 */
export const convertUTC0ToUTC7 = (timestamp) => {
  if (!timestamp) return null;
  
  try {
    const date = new Date(timestamp);
    if (isNaN(date)) return null;
    
    // Add 7 hours to convert from UTC+0 to UTC+7
    date.setHours(date.getHours() + 7);
    
    return date.toISOString();
  } catch (error) {
    console.error("Lỗi chuyển đổi múi giờ:", error);
    return null;
  }
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
