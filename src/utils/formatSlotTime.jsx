import { convertUTC0ToUTC7 } from './formatCentralTimestamp';

/**
 * Calculate UTC+7 slot index from UTC+0 slot index and booked date
 * @param {number} slotIndexUTC0 - Slot index in UTC+0 (0-47)
 * @param {string|Date} bookedDate - The date of the booking (UTC+0 from backend)
 * @returns {number} Slot index in UTC+7 (0-47)
 */
export const calculateUTC7SlotIndex = (slotIndexUTC0, bookedDate) => {
  if (!bookedDate || slotIndexUTC0 === undefined || slotIndexUTC0 === null) {
    return slotIndexUTC0;
  }
  
  try {
    // Calculate the actual time in UTC+0 based on slotIndex
    const slotHour = Math.floor(slotIndexUTC0 / 2);
    const slotMinute = slotIndexUTC0 % 2 === 0 ? 0 : 30;
    
    // Create a new date object for the slot time in UTC+0
    const slotDateUTC0 = new Date(bookedDate);
    slotDateUTC0.setHours(slotHour, slotMinute, 0, 0);
    
    // Convert the slot time from UTC+0 to UTC+7
    const slotDateUTC7 = convertUTC0ToUTC7(slotDateUTC0);
    if (!slotDateUTC7) {
      return slotIndexUTC0;
    }
    
    // Calculate the UTC+7 slot index
    const utc7Hour = slotDateUTC7.getHours();
    const utc7Minute = slotDateUTC7.getMinutes();
    const utc7SlotIndex = (utc7Hour * 2) + (utc7Minute === 30 ? 1 : 0);
    
    return utc7SlotIndex;
  } catch (error) {
    console.error("Lỗi tính toán slot index UTC+7:", error);
    return slotIndexUTC0;
  }
};

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
 * @param {string|Date} bookedDate - The date of the booking (UTC+0 from backend)
 * @returns {string} Formatted date and time (e.g., "16/08/2025 14:00 - 14:30")
 */
export const formatSlotDateTime = (slotIndex, bookedDate) => {
  if (!bookedDate) {
    return formatSlotTime(slotIndex);
  }
  
  try {
    // Convert UTC+0 to UTC+7 for display
    const utc7Date = convertUTC0ToUTC7(bookedDate);
    if (!utc7Date) {
      return formatSlotTime(slotIndex);
    }
    
    // Calculate the actual time in UTC+7 based on slotIndex
    // slotIndex represents 30-minute intervals starting from 00:00 UTC+0
    const slotHour = Math.floor(slotIndex / 2);
    const slotMinute = slotIndex % 2 === 0 ? 0 : 30;
    
    // Create a new date object for the slot time in UTC+0
    const slotDateUTC0 = new Date(bookedDate);
    slotDateUTC0.setHours(slotHour, slotMinute, 0, 0);
    
    // Convert the slot time from UTC+0 to UTC+7
    const slotDateUTC7 = convertUTC0ToUTC7(slotDateUTC0);
    if (!slotDateUTC7) {
      return formatSlotTime(slotIndex);
    }
    
    // Calculate the end time (30 minutes later)
    const endDateUTC7 = new Date(slotDateUTC7.getTime() + (30 * 60 * 1000));
    
    // Format the time range in UTC+7
    const startHours = slotDateUTC7.getHours().toString().padStart(2, '0');
    const startMinutes = slotDateUTC7.getMinutes().toString().padStart(2, '0');
    const endHours = endDateUTC7.getHours().toString().padStart(2, '0');
    const endMinutes = endDateUTC7.getMinutes().toString().padStart(2, '0');
    
    const timeRange = `${startHours}:${startMinutes} - ${endHours}:${endMinutes}`;
    
    // Format date as DD/MM/YYYY
    const day = slotDateUTC7.getDate().toString().padStart(2, '0');
    const month = (slotDateUTC7.getMonth() + 1).toString().padStart(2, '0');
    const year = slotDateUTC7.getFullYear();
    
    return `${day}/${month}/${year} ${timeRange}`;
  } catch (error) {
    console.error("Lỗi định dạng thời gian slot:", error);
    return formatSlotTime(slotIndex);
  }
};

/**
 * Format slot date time from full timestamp (for offers)
 * @param {string|Date} slotDateTime - Full timestamp of the slot (UTC+0 from backend)
 * @returns {string} Formatted date and time (e.g., "16/08/2025 14:00")
 */
export const formatSlotDateTimeFromTimestamp = (slotDateTime) => {
  if (!slotDateTime) {
    return "Thời gian không hợp lệ";
  }
  
  try {
    // Convert UTC+0 to UTC+7 for display
    const utc7Date = convertUTC0ToUTC7(slotDateTime);
    if (!utc7Date) {
      return "Thời gian không hợp lệ";
    }
    
    // Format as DD/MM/YYYY HH:mm
    const day = utc7Date.getDate().toString().padStart(2, '0');
    const month = (utc7Date.getMonth() + 1).toString().padStart(2, '0');
    const year = utc7Date.getFullYear();
    const hours = utc7Date.getHours().toString().padStart(2, '0');
    const minutes = utc7Date.getMinutes().toString().padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch (error) {
    console.error("Lỗi định dạng thời gian slot:", error);
    return "Thời gian không hợp lệ";
  }
};

// Format slot date time in UTC+0
export function formatSlotDateTimeUTC0(slotIndex, bookedDate) {
  if (slotIndex === undefined || !bookedDate) {
    return 'N/A';
  }

  // Parse the booked date (already in UTC+0)
  const date = new Date(bookedDate);
  
  // Calculate hour and minute from slotIndex (UTC+0)
  const hour = Math.floor(slotIndex / 2);
  const minute = slotIndex % 2 === 0 ? 0 : 30;
  
  // Calculate next hour and minute
  const nextHour = slotIndex % 2 === 0 ? hour : hour + 1;
  const nextMinute = slotIndex % 2 === 0 ? 30 : 0;
  
  // Format the date and time in UTC+0
  const formattedDate = date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  
  const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  const endTime = `${nextHour.toString().padStart(2, '0')}:${nextMinute.toString().padStart(2, '0')}`;
  
  return `${formattedDate} ${startTime} - ${endTime}`;
}
