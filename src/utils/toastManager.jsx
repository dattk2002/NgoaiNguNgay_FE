import { toast } from 'react-toastify';

// Default toast configuration
const defaultConfig = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  newestOnTop: false,
  closeOnClick: true,
  rtl: false,
  draggable: true,
  pauseOnHover: true,
  pauseOnFocusLoss: true,
  theme: "light",
  style: {
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  }
};

// Success toast configuration
const successConfig = {
  ...defaultConfig,
  toastStyle: {
    backgroundColor: '#28a745',
    color: 'white',
  },
  bodyStyle: {
    color: 'white',
    fontSize: '14px',
    fontWeight: '400',
  },
  closeButton: {
    style: {
      color: 'white',
      opacity: 0.8,
    },
  },
  progressStyle: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
};

// Error toast configuration
const errorConfig = {
  ...defaultConfig,
  autoClose: 4000,
  toastStyle: {
    backgroundColor: '#dc3545',
    color: 'white',
  },
  bodyStyle: {
    color: 'white',
    fontSize: '14px',
    fontWeight: '400',
  },
  closeButton: {
    style: {
      color: 'white',
      opacity: 0.8,
    },
  },
  progressStyle: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
};

// Show success toast
export const showSuccess = (message, options = {}) => {
  toast.success(message, { ...successConfig, ...options });
};

// Show error toast
export const showError = (message, options = {}) => {
  toast.error(message, { ...errorConfig, ...options });
};

// Show warning toast
export const showWarning = (message, options = {}) => {
  toast.warn(message, { ...defaultConfig, ...options });
};

// Show info toast
export const showInfo = (message, options = {}) => {
  toast.info(message, { ...defaultConfig, ...options });
};

// Dismiss all toasts
export const dismissAll = () => {
  toast.dismiss();
};

// Dismiss specific toast by ID
export const dismissToast = (toastId) => {
  toast.dismiss(toastId);
};

export default {
  showSuccess,
  showError,
  showWarning,
  showInfo,
  dismissAll,
  dismissToast,
};
