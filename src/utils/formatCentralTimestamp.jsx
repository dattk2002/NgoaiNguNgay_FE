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
