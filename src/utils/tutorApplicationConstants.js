// Tutor Application Status Constants
export const APPLICATION_STATUS = {
  UNSUBMITTED: 0,
  PENDING_VERIFICATION: 1,
  REVISION_REQUESTED: 2,
  PENDING_REVERIFICATION: 3,
  VERIFIED: 4
};

// Tutor Application Status Text
export const APPLICATION_STATUS_TEXT = {
  [APPLICATION_STATUS.UNSUBMITTED]: "Chưa gửi hồ sơ",
  [APPLICATION_STATUS.PENDING_VERIFICATION]: "Đang chờ xác minh",
  [APPLICATION_STATUS.REVISION_REQUESTED]: "Yêu cầu chỉnh sửa",
  [APPLICATION_STATUS.PENDING_REVERIFICATION]: "Đang chờ xác minh lại",
  [APPLICATION_STATUS.VERIFIED]: "Đã xác minh"
};

// Tutor Application Status Descriptions
export const APPLICATION_STATUS_DESCRIPTIONS = {
  [APPLICATION_STATUS.UNSUBMITTED]: "Hồ sơ đã được tạo nhưng chưa gửi cho hệ thống xác minh",
  [APPLICATION_STATUS.PENDING_VERIFICATION]: "Hồ sơ đã gửi và đang chờ nhân viên xác minh",
  [APPLICATION_STATUS.REVISION_REQUESTED]: "Nhân viên yêu cầu chỉnh sửa hồ sơ",
  [APPLICATION_STATUS.PENDING_REVERIFICATION]: "Hồ sơ đã chỉnh sửa và đang chờ xác minh lại",
  [APPLICATION_STATUS.VERIFIED]: "Hồ sơ đã được xác minh thành công"
};

// Revision Action Constants
export const REVISION_ACTION = {
  REQUEST_REVISION: 0,
  APPROVE: 1,
  REJECT: 2
};

// Revision Action Text
export const REVISION_ACTION_TEXT = {
  [REVISION_ACTION.REQUEST_REVISION]: "Yêu cầu chỉnh sửa",
  [REVISION_ACTION.APPROVE]: "Phê duyệt",
  [REVISION_ACTION.REJECT]: "Từ chối"
};

// Revision Action Descriptions
export const REVISION_ACTION_DESCRIPTIONS = {
  [REVISION_ACTION.REQUEST_REVISION]: "Yêu cầu gia sư chỉnh sửa hồ sơ",
  [REVISION_ACTION.APPROVE]: "Phê duyệt hồ sơ và xác minh gia sư",
  [REVISION_ACTION.REJECT]: "Từ chối hồ sơ"
};

// Status Color Classes for UI
export const STATUS_COLOR_CLASSES = {
  [APPLICATION_STATUS.UNSUBMITTED]: "bg-gray-100 text-gray-800",
  [APPLICATION_STATUS.PENDING_VERIFICATION]: "bg-yellow-100 text-yellow-800",
  [APPLICATION_STATUS.REVISION_REQUESTED]: "bg-blue-100 text-blue-800",
  [APPLICATION_STATUS.PENDING_REVERIFICATION]: "bg-yellow-100 text-yellow-800",
  [APPLICATION_STATUS.VERIFIED]: "bg-green-100 text-green-800"
};

// Helper functions
export const getStatusText = (status) => {
  return APPLICATION_STATUS_TEXT[status] || "Không xác định";
};

export const getStatusDescription = (status) => {
  return APPLICATION_STATUS_DESCRIPTIONS[status] || "";
};

export const getActionText = (action) => {
  return REVISION_ACTION_TEXT[action] || "Không xác định";
};

export const getActionDescription = (action) => {
  return REVISION_ACTION_DESCRIPTIONS[action] || "";
};

export const getStatusColorClass = (status) => {
  return STATUS_COLOR_CLASSES[status] || "bg-gray-100 text-gray-800";
};
