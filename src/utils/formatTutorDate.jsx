export const formatTutorDate = (dateString) => {
    if (!dateString) return "Không có";
    try {
      const date = new Date(dateString);
      if (isNaN(date)) return "Ngày không hợp lệ";
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    } catch (e) {
      console.error("Lỗi định dạng ngày:", e);
      return "Ngày không hợp lệ";
    }
  };