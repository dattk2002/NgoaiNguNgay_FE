/**
 * Optimized Notification Message Utility
 * Memory-efficient notification handling with caching and normalization
 */

// Cache for parsed additionalData to avoid repeated JSON.parse
const additionalDataCache = new Map();
const CACHE_SIZE_LIMIT = 100; // Limit cache size to prevent memory bloat

// Normalized notification types for memory efficiency
const NOTIFICATION_KEYS = {
  LEARNER_ACCEPT_OFFER: 'PUSH_ON_LEARNER_ACCEPT_OFFER',
  TUTOR_RECEIVED_REQUEST: 'PUSH_ON_TUTOR_RECEIVED_TIME_SLOT_REQUEST',
  LEARNER_ACCEPT_OFFER_BODY: 'PUSH_ON_LEARNER_ACCEPT_OFFER_BODY',
  TUTOR_RECEIVED_REQUEST_BODY: 'PUSH_ON_TUTOR_RECEIVED_TIME_SLOT_REQUEST_BODY'
};

// Memory-efficient message mapping
const notificationMessages = new Map([
  [NOTIFICATION_KEYS.LEARNER_ACCEPT_OFFER, {
    title: "Bạn có 1 chấp nhận đề xuất mới",
    content: "Học viên đã chấp đề xuất lịch dạy của bạn."
  }],
  [NOTIFICATION_KEYS.TUTOR_RECEIVED_REQUEST, {
    title: "Bạn có 1 đề xuất mới từ gia sư",
    content: "1 học viên đã gửi cho bạn một yêu cầu"
  }],
  [NOTIFICATION_KEYS.LEARNER_ACCEPT_OFFER_BODY, {
    title: "Bạn có 1 chấp nhận đề xuất mới",
    content: "Học viên đã chấp đề xuất lịch dạy của bạn."
  }],
  [NOTIFICATION_KEYS.TUTOR_RECEIVED_REQUEST_BODY, {
    title: "Bạn có 1 đề xuất mới từ gia sư",
    content: "1 học viên đã gửi cho bạn một yêu cầu"
  }]
]);

/**
 * Memory-efficient function to get notification title
 * @param {string} notificationType - The notification type or title
 * @returns {string} The display title
 */
export const getNotificationTitle = (notificationType) => {
  if (!notificationType) return 'Thông báo';
  
  // Check if it's a system notification key
  const message = notificationMessages.get(notificationType);
  if (message) return message.title;
  
  // Return original if it's already user-friendly text
  return notificationType;
};

/**
 * Memory-efficient function to get notification content
 * @param {string} notificationType - The notification type or content
 * @returns {string} The display content
 */
export const getNotificationContent = (notificationType) => {
  if (!notificationType) return 'Bạn có thông báo mới';
  
  // Check if it's a system notification key
  if (notificationMessages.has(notificationType)) {
    return notificationMessages.get(notificationType).content;
  }
  
  // Return original if it's already user-friendly text
  return notificationType;
};

/**
 * Get both title and content efficiently
 * @param {string} title - The notification title
 * @param {string} content - The notification content
 * @returns {Object} Object containing title and content
 */
export const getNotificationMessage = (title, content) => {
  return {
    title: getNotificationTitle(title),
    content: getNotificationContent(content)
  };
};

/**
 * Check if a notification type is supported
 * @param {string} notificationType - The notification type to check
 * @returns {boolean} True if the notification type is supported
 */
export const isSupportedNotificationType = (notificationType) => {
  return notificationType && notificationMessages.has(notificationType);
};

/**
 * Get all supported notification types
 * @returns {Array} Array of supported notification type strings
 */
export const getSupportedNotificationTypes = () => {
  return Array.from(notificationMessages.keys());
};

/**
 * Memory-efficient JSON.parse with caching
 * @param {string} jsonString - JSON string to parse
 * @param {string} cacheKey - Unique key for caching
 * @returns {Object} Parsed object or empty object if invalid
 */
export const parseAdditionalData = (jsonString, cacheKey) => {
  if (!jsonString || typeof jsonString !== 'string') {
    return {};
  }
  
  // Check cache first
  if (additionalDataCache.has(cacheKey)) {
    return additionalDataCache.get(cacheKey);
  }
  
  try {
    const parsed = JSON.parse(jsonString);
    
    // Cache the result (with size limit)
    if (additionalDataCache.size >= CACHE_SIZE_LIMIT) {
      // Remove oldest entries if cache is full
      const firstKey = additionalDataCache.keys().next().value;
      additionalDataCache.delete(firstKey);
    }
    
    additionalDataCache.set(cacheKey, parsed);
    return parsed;
  } catch (error) {
    console.warn('Failed to parse additionalData:', error);
    return {};
  }
};

/**
 * Clear cache to free memory
 */
export const clearNotificationCache = () => {
  additionalDataCache.clear();
};

/**
 * Get cache statistics for debugging
 * @returns {Object} Cache statistics
 */
export const getCacheStats = () => {
  return {
    size: additionalDataCache.size,
    limit: CACHE_SIZE_LIMIT,
    keys: Array.from(additionalDataCache.keys())
  };
};

export default notificationMessages;
