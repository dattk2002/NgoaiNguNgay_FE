/**
 * Memory management utilities to prevent R14 errors
 */

// memoryManager.js - Cải tiến
import { clearNotificationCache } from './notificationMessages';

// Track memory usage with limits
let memoryUsage = {
  notifications: 0,
  cache: 0,
  objects: 0
};

// Memory monitoring
let cleanupInterval = null;

// Improved memory tracking
export const trackMemoryUsage = (type, size, operation = 'add') => {
  if (operation === 'add') {
    memoryUsage[type] = (memoryUsage[type] || 0) + size;
  } else if (operation === 'subtract') {
    memoryUsage[type] = Math.max(0, (memoryUsage[type] || 0) - size);
  } else if (operation === 'set') {
    memoryUsage[type] = size;
  }
  
  // Log warning if memory usage is high
  const totalUsage = Object.values(memoryUsage).reduce((a, b) => a + b, 0);
  if (totalUsage > 1000000) { // 1MB threshold
    console.warn('High memory usage detected:', memoryUsage);
  }
};

// Enhanced cleanup function
export const cleanupMemory = () => {
  // Clear caches
  if (typeof clearNotificationCache === 'function') {
    clearNotificationCache();
  }

  // Reset counters with accurate values if possible
  memoryUsage = { notifications: 0, cache: 0, objects: 0 };
  
  // Try to force garbage collection in Node.js environments
  if (typeof global !== 'undefined' && global.gc) {
    global.gc();
  }
};

// Initialize memory monitoring
export const initMemoryMonitoring = () => {
  // Clear existing interval if any
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
  }
 // Set new interval
 cleanupInterval = setInterval(cleanupMemory, 5 * 60 * 1000);
   // Try to force garbage collection in Node.js environments
   if (typeof global !== 'undefined' && global.gc) {
     global.gc();
   }
 };
 
 // Initialize memory monitoring
 export const initMemoryMonitoring = () => {
   // Clear existing interval if any
   if (cleanupInterval) {
     clearInterval(cleanupInterval);
  }
  
   // Set new interval
   cleanupInterval = setInterval(cleanupMemory, 5 * 60 * 1000);
  
  // Return cleanup function
  return () => {
    if (cleanupInterval) {
      clearInterval(cleanupInterval);
      cleanupInterval = null;
    }
  };
};

// Get memory stats
export const getMemoryStats = () => {
  return { ...memoryUsage };
};

// Auto-cleanup every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(cleanupMemory, 5 * 60 * 1000);
}
