/**
 * Notification message mapping utility
 * Maps notification types to their display titles and content
 */

const notificationMessages = {
  // Learner accepts tutor's offer
  PUSH_ON_LEARNER_ACCEPT_OFFER: {
    title: "Bạn có 1 chấp nhận đề xuất mới",
    content: "Học viên đã chấp đề xuất lịch dạy của bạn."
  },
  
  // Tutor receives time slot request from learner
  PUSH_ON_TUTOR_RECEIVED_TIME_SLOT_REQUEST: {
    title: "Bạn có 1 yêu cầu đặt lịch mới",
    content: "1 học viên đã gửi cho bạn một yêu cầu"
  },
  
  // Also support the _BODY suffix versions
  PUSH_ON_LEARNER_ACCEPT_OFFER_BODY: {
    title: "Bạn có 1 chấp nhận đề xuất mới",
    content: "Học viên đã chấp đề xuất lịch dạy của bạn."
  },
  
  PUSH_ON_TUTOR_RECEIVED_TIME_SLOT_REQUEST_BODY: {
    title: "Bạn có 1 yêu cầu đặt lịch mới",
    content: "1 học viên đã gửi cho bạn một yêu cầu"
  }
};

/**
 * Get notification title by type
 * @param {string} notificationType - The notification type (e.g., 'PUSH_ON_LEARNER_ACCEPT_OFFER')
 * @returns {string} The display title for the notification type, or the original type if not found
 */
export const getNotificationTitle = (notificationType) => {
  if (!notificationType) {
    return 'Thông báo';
  }
  
  const message = notificationMessages[notificationType];
  return message ? message.title : notificationType;
};

/**
 * Get notification content by type
 * @param {string} notificationType - The notification type (e.g., 'PUSH_ON_LEARNER_ACCEPT_OFFER')
 * @returns {string} The display content for the notification type, or the original type if not found
 */
export const getNotificationContent = (notificationType) => {
  if (!notificationType) {
    return 'Bạn có thông báo mới';
  }
  
  const message = notificationMessages[notificationType];
  return message ? message.content : notificationType;
};

/**
 * Get both title and content for a notification type
 * @param {string} notificationType - The notification type
 * @returns {Object} Object containing title and content
 */
export const getNotificationMessage = (notificationType) => {
  if (!notificationType) {
    return {
      title: 'Thông báo',
      content: 'Bạn có thông báo mới'
    };
  }
  
  const message = notificationMessages[notificationType];
  return message || {
    title: notificationType,
    content: notificationType
  };
};

/**
 * Check if a notification type is supported
 * @param {string} notificationType - The notification type to check
 * @returns {boolean} True if the notification type is supported
 */
export const isSupportedNotificationType = (notificationType) => {
  return notificationType && notificationType in notificationMessages;
};

/**
 * Get all supported notification types
 * @returns {Array} Array of supported notification type strings
 */
export const getSupportedNotificationTypes = () => {
  return Object.keys(notificationMessages);
};

export default notificationMessages;
