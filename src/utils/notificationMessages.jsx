/**
 * Notification message utility
 * Since backend now handles message parsing, this file is simplified
 */

/**
 * Get notification title - now just returns the original title
 * @param {string} title - The notification title from backend
 * @returns {string} The original title
 */
export const getNotificationTitle = (title) => {
  return title || 'Thông báo';
};

/**
 * Get notification content - now just returns the original content
 * @param {string} content - The notification content from backend
 * @returns {string} The original content
 */
export const getNotificationContent = (content) => {
  return content || 'Bạn có thông báo mới';
};

/**
 * Get both title and content for a notification
 * @param {string} title - The notification title
 * @param {string} content - The notification content
 * @returns {Object} Object containing title and content
 */
export const getNotificationMessage = (title, content) => {
  return {
    title: title || 'Thông báo',
    content: content || 'Bạn có thông báo mới'
  };
};

/**
 * Check if a notification type is supported (legacy function, now always returns true)
 * @param {string} notificationType - The notification type to check
 * @returns {boolean} Always returns true since backend handles parsing
 */
export const isSupportedNotificationType = (notificationType) => {
  return true;
};

/**
 * Get all supported notification types (legacy function, now returns empty array)
 * @returns {Array} Empty array since backend handles all types
 */
export const getSupportedNotificationTypes = () => {
  return [];
};

// Keep empty object for backward compatibility
const notificationMessages = {};

export default notificationMessages;
