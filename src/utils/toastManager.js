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
  containerId: "main-toast",
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
  try {
    // Clear any existing toasts first to prevent conflicts
    dismissAll();
    // Small delay to ensure cleanup
    setTimeout(() => {
      toast.success(message, { 
        ...successConfig, 
        ...options
      });
    }, 50);
  } catch (error) {
    console.error("Error showing success toast:", error);
  }
};

// Show error toast
export const showError = (message, options = {}) => {
  try {
    // Clear any existing toasts first to prevent conflicts
    dismissAll();
    // Small delay to ensure cleanup
    setTimeout(() => {
      toast.error(message, { 
        ...errorConfig, 
        ...options
      });
    }, 50);
  } catch (error) {
    console.error("Error showing error toast:", error);
  }
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
  try {
    toast.dismiss();
  } catch (error) {
    console.error("Error dismissing all toasts:", error);
  }
};

// Force clear all toasts (more aggressive)
export const forceClearAll = () => {
  try {
    toast.dismiss();
    // Also try to clear any stuck toasts
    const toastElements = document.querySelectorAll('.Toastify__toast');
    toastElements.forEach(element => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });
  } catch (error) {
    console.error("Error force clearing toasts:", error);
  }
};

// Dismiss specific toast by ID
export const dismissToast = (toastId) => {
  toast.dismiss(toastId);
};

// Test function to verify toast is working
export const testToast = () => {
  console.log("🧪 Testing toast...");
  showSuccess("Toast test thành công! Nếu bạn thấy message này, toast đã hoạt động bình thường.");
};

// Debug function to check toast configuration
export const debugToast = () => {
  console.log("🔍 Toast Debug Info:");
  console.log("- Default config:", defaultConfig);
  console.log("- Success config:", successConfig);
  console.log("- Error config:", errorConfig);
  console.log("- Container ID:", defaultConfig.containerId);
};

export default {
  showSuccess,
  showError,
  showWarning,
  showInfo,
  dismissAll,
  forceClearAll,
  dismissToast,
  testToast,
  debugToast,
};
