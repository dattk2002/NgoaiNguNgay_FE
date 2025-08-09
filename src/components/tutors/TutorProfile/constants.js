// Constants for TutorProfile component

// Time ranges for scheduling
export const timeRanges = [
  "8:00", "8:30", "9:00", "9:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30", "18:00", "18:30", "19:00", "19:30",
  "20:00", "20:30", "21:00", "21:30", "22:00", "22:30"
];

// Days of the week
export const daysOfWeek = [
  "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"
];

// Status options for offers
export const statusOptions = [
  { value: 'CONFIRMED', label: 'CONFIRMED', color: 'success' },
  { value: 'PENDING', label: 'PENDING', color: 'warning' },
  { value: 'REJECTED', label: 'REJECTED', color: 'error' },
  { value: 'CANCELLED', label: 'CANCELLED', color: 'default' }
];

// Default lesson form data
export const defaultLessonForm = {
  name: "",
  description: "",
  targetAudience: "",
  prerequisites: "",
  languageCode: "",
  category: "",
  price: "",
};

// Verification status colors
export const verificationColors = {
  UNVERIFIED: '#f44336',
  PENDING_VERIFICATION: '#ff9800', 
  VERIFIED: '#4caf50'
};

// File upload constraints
export const fileUploadConstraints = {
  maxSize: 10 * 1024 * 1024, // 10MB
  acceptedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],
  maxFiles: 10
};
