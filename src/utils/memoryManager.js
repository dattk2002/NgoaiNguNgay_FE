/**
 * Memory management utilities to prevent R14 errors
 */

// Track memory usage
let memoryUsage = {
  notifications: 0,
  cache: 0,
  objects: 0
};

// Memory monitoring
export const trackMemoryUsage = (type, size) => {
  memoryUsage[type] = (memoryUsage[type] || 0) + size;
  
  // Log warning if memory usage is high
  const totalUsage = Object.values(memoryUsage).reduce((a, b) => a + b, 0);
  if (totalUsage > 1000000) { // 1MB threshold
    console.warn('High memory usage detected:', memoryUsage);
  }
};

// Cleanup function
export const cleanupMemory = () => {
  // Clear caches
  if (typeof clearNotificationCache === 'function') {
    clearNotificationCache();
  }
  
  // Force garbage collection if available
  if (typeof window !== 'undefined' && window.gc) {
    window.gc();
  }
  
  // Reset counters
  memoryUsage = { notifications: 0, cache: 0, objects: 0 };
  
  console.log('Memory cleanup completed');
};

// Get memory stats
export const getMemoryStats = () => {
  return { ...memoryUsage };
};

// Auto-cleanup every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(cleanupMemory, 5 * 60 * 1000);
}
