/**
 * Format slot time based on slotIndex (0-47 for 48 slots per day, 30 minutes each)
 * @param {number} slotIndex - Slot index from 0 to 47
 * @returns {string} Formatted time range (e.g., "14:00 - 14:30")
 */
export const formatSlotTime = (slotIndex) => {
  if (slotIndex === undefined || slotIndex === null || slotIndex < 0 || slotIndex > 47) {
    return "Thời gian không hợp lệ";
  }
  
  const hour = Math.floor(slotIndex / 2);
  const minute = slotIndex % 2 === 0 ? "00" : "30";
  const nextHour = slotIndex % 2 === 0 ? hour : hour + 1;
  const nextMinute = slotIndex % 2 === 0 ? "30" : "00";
  
  return `${hour.toString().padStart(2, "0")}:${minute} - ${nextHour.toString().padStart(2, "0")}:${nextMinute}`;
};

/**
 * Format slot time with date based on slotIndex and bookedDate
 * @param {number} slotIndex - Slot index from 0 to 47
 * @param {string|Date} bookedDate - The date of the booking
 * @returns {string} Formatted date and time (e.g., "16/08/2025 14:00 - 14:30")
 */
export const formatSlotDateTime = (slotIndex, bookedDate) => {
  if (!bookedDate) {
    return formatSlotTime(slotIndex);
  }
  
  try {
    const date = new Date(bookedDate);
    if (isNaN(date)) {
      return formatSlotTime(slotIndex);
    }
    
    // Format date as DD/MM/YYYY
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    const timeRange = formatSlotTime(slotIndex);
    
    return `${day}/${month}/${year} ${timeRange}`;
  } catch (error) {
    console.error("Lỗi định dạng thời gian slot:", error);
    return formatSlotTime(slotIndex);
  }
};

/**
 * Format slot date time from full timestamp (for offers)
 * @param {string|Date} slotDateTime - Full timestamp of the slot
 * @returns {string} Formatted date and time (e.g., "16/08/2025 14:00")
 */
export const formatSlotDateTimeFromTimestamp = (slotDateTime) => {
  if (!slotDateTime) {
    return "Thời gian không hợp lệ";
  }
  
  try {
    const date = new Date(slotDateTime);
    if (isNaN(date)) {
      return "Thời gian không hợp lệ";
    }
    
    // Format as DD/MM/YYYY HH:mm
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch (error) {
    console.error("Lỗi định dạng thời gian slot:", error);
    return "Thời gian không hợp lệ";
  }
};
