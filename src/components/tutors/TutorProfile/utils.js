// Utility functions for TutorProfile component

export function getNextMondayDateUTC() {
  const today = new Date();
  const day = today.getDay();
  const daysUntilMonday = day === 0 ? 1 : 8 - day; // If Sunday (0), add 1 day; otherwise, add (8 - current day)
  const nextMonday = new Date(today);
  nextMonday.setDate(today.getDate() + daysUntilMonday);

  // Convert to UTC by setting hours to 0 and adjusting for timezone
  nextMonday.setUTCHours(0, 0, 0, 0);
  return nextMonday;
}

export function getWeekRange(date = new Date()) {
  const start = new Date(date);
  const day = start.getDay();
  const diff = start.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  start.setDate(diff);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

export function formatDateRange(start, end) {
  const startStr = start.toLocaleDateString("vi-VN");
  const endStr = end.toLocaleDateString("vi-VN");
  return `${startStr} - ${endStr}`;
}

export function getPatternForWeek(weeklyPatterns, weekStart) {
  if (!weeklyPatterns || weeklyPatterns.length === 0) return null;

  const weekStartTime = weekStart.getTime();
  let selectedPattern = null;

  for (const pattern of weeklyPatterns) {
    const patternStart = new Date(pattern.appliedFrom).getTime();
    if (patternStart <= weekStartTime) {
      if (!selectedPattern || patternStart > new Date(selectedPattern.appliedFrom).getTime()) {
        selectedPattern = pattern;
      }
    }
  }

  return selectedPattern;
}

export function buildAvailabilityData(pattern, timeRanges) {
  const slots = {};
  
  if (pattern && pattern.slots) {
    pattern.slots.forEach(slot => {
      const key = `${slot.dayInWeek}-${slot.slotIndex}`;
      slots[key] = true;
    });
  }

  return Array.from({ length: 7 }, (_, dayInWeek) => ({
    dayInWeek,
    slots: timeRanges.map((_, slotIndex) => ({
      slotIndex,
      isAvailable: !!slots[`${dayInWeek}-${slotIndex}`],
    })),
  }));
}

export function buildEditPatternSlotsFromPattern(pattern) {
  const slotMap = {};
  if (pattern && pattern.slots) {
    pattern.slots.forEach(slot => {
      const key = `${slot.dayInWeek}-${slot.slotIndex}`;
      slotMap[key] = true;
    });
  }
  return slotMap;
}

export function getSlotDateTime(weekStart, dayInWeek, slotIndex) {
  const slotDate = new Date(weekStart);
  slotDate.setDate(weekStart.getDate() + dayInWeek);
  
  // Set time based on slot index (8:00 AM + slotIndex * 30 minutes)
  const hours = 8 + Math.floor(slotIndex / 2);
  const minutes = (slotIndex % 2) * 30;
  slotDate.setHours(hours, minutes, 0, 0);
  
  return slotDate.toISOString();
}

// Utility functions for proficiency and language
export const getProficiencyLabel = (level) => {
  const labels = {
    1: "Sơ cấp",
    2: "Trung cấp",
    3: "Cao cấp",
    4: "Thành thạo",
    5: "Bản ngữ",
  };
  return labels[level] || "Không xác định";
};

export const getLanguageName = (code) => {
  // This should match your existing language mapping
  const languageMap = {
    en: "English",
    vi: "Vietnamese", 
    zh: "Chinese",
    ja: "Japanese",
    ko: "Korean",
    fr: "French",
    de: "German",
    es: "Spanish",
    it: "Italian",
    pt: "Portuguese",
    ru: "Russian",
    ar: "Arabic",
    th: "Thai",
    id: "Indonesian",
    nl: "Dutch",
    in: "Hindi",
    br: "Portuguese (Brazil)"
  };
  return languageMap[code] || code;
};

// File handling utility
export const handleFileChange = (e) => {
  const files = Array.from(e.target.files);
  const validFiles = files.filter(file => {
    const isValidType = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'].includes(file.type);
    const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
    return isValidType && isValidSize;
  });
  
  if (validFiles.length !== files.length) {
    throw new Error("Some files are invalid. Please upload JPG, PNG, or PDF files under 10MB.");
  }
  
  return validFiles;
};

// Week navigation utilities
export const getWeekDates = (weekStart) => {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    days.push(date);
  }
  return days;
};

// LocalStorage utilities for temporary slots
export const getTemporarySlotsKey = (weekStart, learnerId) => {
  return `temp_slots_${weekStart.toISOString().split('T')[0]}_${learnerId}`;
};

export const saveTemporarySlots = (weekStart, learnerId, slots) => {
  const key = getTemporarySlotsKey(weekStart, learnerId);
  localStorage.setItem(key, JSON.stringify(slots));
};

export const loadTemporarySlots = (weekStart, learnerId) => {
  const key = getTemporarySlotsKey(weekStart, learnerId);
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : [];
};

export const clearTemporarySlots = (weekStart, learnerId) => {
  const key = getTemporarySlotsKey(weekStart, learnerId);
  localStorage.removeItem(key);
};

// Format date utility
export const formatDate = (date) => {
  return new Intl.DateTimeFormat("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  }).format(date);
};
