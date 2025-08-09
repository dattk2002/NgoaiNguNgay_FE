# Hooks Directory

🎣 **Mô tả**: Custom React hooks cho ứng dụng NgoaiNguNgay - tái sử dụng logic và state management across components.

## 🏗️ Cấu trúc hooks

```
src/hooks/
├── useNotificationHub.jsx    # SignalR notification hub connection
└── use-google-script.jsx     # Dynamic Google Scripts loading
```

## 🔧 Chi tiết hooks

### 🔔 useNotificationHub.jsx
**Mục đích**: Custom hook quản lý SignalR connection để nhận real-time notifications

**Core Features**:
- 🔗 **Real-time Connection**: SignalR WebSocket connection
- 🔄 **Auto Reconnection**: Tự động reconnect khi mất kết nối
- 🔐 **Token Authentication**: JWT token-based authentication
- 📢 **Notification Handling**: Receive và process notifications
- ✅ **Mark as Read**: Mark notifications as read functionality

**Hook Interface**:
```javascript
const {
  connected,           // boolean - connection status
  error,              // string | null - connection error
  notification,       // object | null - latest notification
  connection,         // HubConnection - SignalR connection instance
  connectionState,    // HubConnectionState - current connection state
  connectionStateName, // string - human readable state name
  markAsRead          // function - mark notification as read
} = useNotificationHub();
```

**Implementation Details**:
```javascript
export function useNotificationHub() {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const [connection, setConnection] = useState(null);
  const [notification, setNotification] = useState(null);
  const [connectionState, setConnectionState] = useState(HubConnectionState.Disconnected);
  const connectionRef = useRef(null);

  useEffect(() => {
    const accessToken = getAccessToken();
    if (!accessToken) {
      console.warn("No access token found. Connection will not be established.");
      setError("No access token available.");
      return;
    }

    // Create SignalR connection
    const hubConnection = new HubConnectionBuilder()
      .withUrl("https://tutorbooking-dev-065fe6ad4a6a.herokuapp.com/notification-hub", {
        accessTokenFactory: () => accessToken
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: retryContext => {
          if (retryContext.elapsedMilliseconds < 60000) {
            return Math.random() * 10000; // Random delay up to 10 seconds
          }
          return null; // Stop retrying after 1 minute
        }
      })
      .build();

    connectionRef.current = hubConnection;
    setConnection(hubConnection);

    // Event handlers
    hubConnection.onreconnecting((error) => {
      setConnected(false);
      setError("Reconnecting...");
      updateConnectionState();
    });

    hubConnection.onreconnected((connectionId) => {
      setConnected(true);
      setError(null);
      updateConnectionState();
    });

    hubConnection.onclose((error) => {
      setConnected(false);
      setError(error ? `Connection closed with error: ${error.message}` : "Connection closed.");
      updateConnectionState();
    });

    // Handle successful connection
    hubConnection.on("UserConnected", (message) => {
      if (message === "CONNECTED_TO_NOTIFICATION_HUB") {
        setConnected(true);
        setError(null);
        updateConnectionState();
        console.log("✅ Successfully connected to notification hub");
      }
    });

    // Listen for notifications
    hubConnection.on("ReceiveNotification", (notificationData) => {
      setNotification(notificationData);
    });

    // Start connection
    const startConnection = async () => {
      try {
        await hubConnection.start();
        setConnected(true);
        setError(null);
        updateConnectionState();
        console.log("🔗 Notification Hub State: Connected!");
      } catch (err) {
        setConnected(false);
        setError(err);
        updateConnectionState();
        console.error("Failed to start connection:", err);
      }
    };

    startConnection();

    // Cleanup
    return () => {
      if (connectionRef.current && connectionRef.current.state !== HubConnectionState.Disconnected) {
        connectionRef.current.stop()
          .then(() => console.log("🔗 Notification Hub connection stopped."))
          .catch(err => console.error("🔗 Error stopping connection:", err));
      }
    };
  }, []);

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    if (!connectionRef.current || connectionRef.current.state !== HubConnectionState.Connected) {
      console.error("Cannot mark as read: connection not established");
      throw new Error("Connection not established");
    }

    try {
      const result = await connectionRef.current.invoke("MarkAsRead", notificationId);
      
      if (result && result.statusCode === 200 && result.data === "SUCCESS") {
        return { success: true, message: "Notification marked as read" };
      } else {
        console.warn("Unexpected response from MarkAsRead:", result);
        return { success: false, message: "Unexpected response from server" };
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw new Error(`Failed to mark notification as read: ${error.message}`);
    }
  };

  return {
    connected,
    error,
    notification,
    connection: connectionRef.current,
    connectionState,
    connectionStateName: HubConnectionState[connectionState],
    markAsRead
  };
}
```

**Connection States**:
```javascript
const ConnectionStates = {
  Disconnected: 0,    // "Disconnected"
  Connecting: 1,      // "Connecting"
  Connected: 2,       // "Connected"  
  Disconnecting: 3,   // "Disconnecting"
  Reconnecting: 4     // "Reconnecting"
};
```

**Usage Examples**:
```jsx
// Basic notification handling
const NotificationHandler = () => {
  const { connected, notification, markAsRead } = useNotificationHub();
  
  useEffect(() => {
    if (notification) {
      console.log('New notification:', notification);
      
      // Show toast notification
      toast.info(notification.message);
      
      // Auto mark as read after 5 seconds
      setTimeout(() => {
        markAsRead(notification.id);
      }, 5000);
    }
  }, [notification, markAsRead]);
  
  return (
    <div className="notification-status">
      Status: {connected ? 'Connected' : 'Disconnected'}
    </div>
  );
};

// Advanced notification component
const NotificationComponent = () => {
  const { 
    connected, 
    error, 
    notification, 
    connectionState,
    connectionStateName,
    markAsRead 
  } = useNotificationHub();
  
  const [notifications, setNotifications] = useState([]);
  
  useEffect(() => {
    if (notification) {
      setNotifications(prev => [notification, ...prev]);
    }
  }, [notification]);
  
  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, isRead: true }
            : notif
        )
      );
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };
  
  return (
    <div className="notification-component">
      <div className="connection-status">
        <span className={`status ${connected ? 'connected' : 'disconnected'}`}>
          {connectionStateName}
        </span>
        {error && <span className="error">{error}</span>}
      </div>
      
      <div className="notifications-list">
        {notifications.map(notif => (
          <div 
            key={notif.id} 
            className={`notification ${notif.isRead ? 'read' : 'unread'}`}
          >
            <div className="message">{notif.message}</div>
            <button onClick={() => handleMarkAsRead(notif.id)}>
              Mark as Read
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
```

### 📜 use-google-script.jsx
**Mục đích**: Custom hook để load Google scripts dynamically (Maps, Analytics, etc.)

**Hook Interface**:
```javascript
const { loaded, error } = useGoogleScript(scriptId, src, options);
```

**Implementation**:
```javascript
import { useState, useEffect } from 'react';

export const useGoogleScript = (scriptId, src, options = {}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Check if script already exists
    const existingScript = document.getElementById(scriptId);
    if (existingScript) {
      setLoaded(true);
      return;
    }
    
    // Create script element
    const script = document.createElement('script');
    script.id = scriptId;
    script.src = src;
    script.async = options.async ?? true;
    script.defer = options.defer ?? false;
    
    // Handle load success
    script.onload = () => {
      setLoaded(true);
      setError(null);
      console.log(`✅ Google script loaded: ${scriptId}`);
    };
    
    // Handle load error
    script.onerror = (event) => {
      setError(`Failed to load script: ${scriptId}`);
      console.error(`❌ Failed to load Google script: ${scriptId}`, event);
    };
    
    // Add to document
    document.head.appendChild(script);
    
    // Cleanup
    return () => {
      const scriptToRemove = document.getElementById(scriptId);
      if (scriptToRemove) {
        document.head.removeChild(scriptToRemove);
      }
    };
  }, [scriptId, src, options.async, options.defer]);
  
  return { loaded, error };
};

// Specific Google services hooks
export const useGoogleMaps = (apiKey) => {
  return useGoogleScript(
    'google-maps-api',
    `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`,
    { async: true, defer: true }
  );
};

export const useGoogleAnalytics = (trackingId) => {
  return useGoogleScript(
    'google-analytics',
    `https://www.googletagmanager.com/gtag/js?id=${trackingId}`,
    { async: true }
  );
};

export const useGoogleLogin = (clientId) => {
  return useGoogleScript(
    'google-login',
    'https://accounts.google.com/gsi/client',
    { async: true, defer: true }
  );
};

export const useGoogleRecaptcha = (siteKey) => {
  return useGoogleScript(
    'google-recaptcha',
    `https://www.google.com/recaptcha/api.js?render=${siteKey}`,
    { async: true, defer: true }
  );
};
```

**Usage Examples**:
```jsx
// Google Maps integration
const MapComponent = () => {
  const { loaded, error } = useGoogleMaps(process.env.REACT_APP_GOOGLE_MAPS_API_KEY);
  const mapRef = useRef();
  
  useEffect(() => {
    if (loaded && window.google) {
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: 10.8231, lng: 106.6297 }, // Ho Chi Minh City
        zoom: 13
      });
    }
  }, [loaded]);
  
  if (error) return <div>Error loading Google Maps: {error}</div>;
  if (!loaded) return <div>Loading Google Maps...</div>;
  
  return <div ref={mapRef} style={{ width: '100%', height: '400px' }} />;
};

// Google Analytics tracking
const AnalyticsProvider = ({ children }) => {
  const { loaded } = useGoogleAnalytics(process.env.REACT_APP_GA_TRACKING_ID);
  
  useEffect(() => {
    if (loaded) {
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', process.env.REACT_APP_GA_TRACKING_ID);
    }
  }, [loaded]);
  
  return children;
};

// Google Login integration
const LoginComponent = () => {
  const { loaded } = useGoogleLogin(process.env.REACT_APP_GOOGLE_CLIENT_ID);
  
  useEffect(() => {
    if (loaded && window.google) {
      window.google.accounts.id.initialize({
        client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse
      });
      
      window.google.accounts.id.renderButton(
        document.getElementById("google-signin-button"),
        { theme: "outline", size: "large" }
      );
    }
  }, [loaded]);
  
  const handleCredentialResponse = (response) => {
    console.log("Encoded JWT ID token: " + response.credential);
    // Handle login
  };
  
  if (!loaded) return <div>Loading Google Login...</div>;
  
  return <div id="google-signin-button"></div>;
};
```

## 🎯 Hook Design Patterns

### 🔄 State Management Hook Pattern
```javascript
export const useApiState = (initialState = null) => {
  const [data, setData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const execute = useCallback(async (apiCall) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  const reset = useCallback(() => {
    setData(initialState);
    setError(null);
    setLoading(false);
  }, [initialState]);
  
  return { data, loading, error, execute, reset };
};
```

### 🎣 Custom Hook with Cleanup Pattern
```javascript
export const useWebSocket = (url, options = {}) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [message, setMessage] = useState(null);
  
  useEffect(() => {
    const ws = new WebSocket(url);
    
    ws.onopen = () => {
      setConnected(true);
      setSocket(ws);
    };
    
    ws.onmessage = (event) => {
      setMessage(JSON.parse(event.data));
    };
    
    ws.onclose = () => {
      setConnected(false);
      setSocket(null);
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    return () => {
      ws.close();
    };
  }, [url]);
  
  const sendMessage = useCallback((data) => {
    if (socket && connected) {
      socket.send(JSON.stringify(data));
    }
  }, [socket, connected]);
  
  return { connected, message, sendMessage };
};
```

### 🔄 Subscription Hook Pattern
```javascript
export const useEventSubscription = (eventName, handler) => {
  useEffect(() => {
    const eventHandler = (event) => {
      handler(event.detail);
    };
    
    window.addEventListener(eventName, eventHandler);
    
    return () => {
      window.removeEventListener(eventName, eventHandler);
    };
  }, [eventName, handler]);
};

// Usage
const Component = () => {
  useEventSubscription('notification-received', (data) => {
    console.log('Notification:', data);
  });
  
  return <div>Component content</div>;
};
```

## 🔧 Advanced Hook Patterns

### 🎯 Compound Hook Pattern
```javascript
export const useNotificationSystem = () => {
  const hub = useNotificationHub();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  useEffect(() => {
    if (hub.notification) {
      setNotifications(prev => [hub.notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    }
  }, [hub.notification]);
  
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await hub.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, isRead: true }
            : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  }, [hub.markAsRead]);
  
  const markAllAsRead = useCallback(async () => {
    const unreadNotifications = notifications.filter(n => !n.isRead);
    
    try {
      await Promise.all(
        unreadNotifications.map(notif => hub.markAsRead(notif.id))
      );
      
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  }, [notifications, hub.markAsRead]);
  
  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);
  
  return {
    // Hub connection status
    connected: hub.connected,
    error: hub.error,
    connectionState: hub.connectionState,
    
    // Notifications data
    notifications,
    unreadCount,
    latestNotification: hub.notification,
    
    // Actions
    markAsRead,
    markAllAsRead,
    clearNotifications
  };
};
```

### 🔄 Persistent State Hook
```javascript
export const usePersistentState = (key, initialValue) => {
  const [state, setState] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });
  
  const setValue = useCallback((value) => {
    try {
      setState(value);
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key]);
  
  const removeValue = useCallback(() => {
    try {
      setState(initialValue);
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);
  
  return [state, setValue, removeValue];
};
```

## 🧪 Testing Hooks

### 🔬 Hook Testing Pattern
```javascript
import { renderHook, act } from '@testing-library/react';
import { useNotificationHub } from './useNotificationHub';

// Mock SignalR
jest.mock('@microsoft/signalr', () => ({
  HubConnectionBuilder: jest.fn(() => ({
    withUrl: jest.fn().mockReturnThis(),
    withAutomaticReconnect: jest.fn().mockReturnThis(),
    build: jest.fn(() => ({
      start: jest.fn().mockResolvedValue(undefined),
      stop: jest.fn().mockResolvedValue(undefined),
      on: jest.fn(),
      onreconnecting: jest.fn(),
      onreconnected: jest.fn(),
      onclose: jest.fn(),
      invoke: jest.fn(),
      state: 2 // Connected
    }))
  })),
  HubConnectionState: {
    Disconnected: 0,
    Connecting: 1,
    Connected: 2,
    Disconnecting: 3,
    Reconnecting: 4
  }
}));

describe('useNotificationHub', () => {
  beforeEach(() => {
    localStorage.setItem('accessToken', 'mock-token');
  });
  
  afterEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });
  
  test('should initialize connection', async () => {
    const { result } = renderHook(() => useNotificationHub());
    
    expect(result.current.connected).toBe(false);
    expect(result.current.error).toBe(null);
    
    // Wait for connection to be established
    await act(async () => {
      // Simulate connection
    });
  });
  
  test('should handle mark as read', async () => {
    const { result } = renderHook(() => useNotificationHub());
    
    await act(async () => {
      const response = await result.current.markAsRead('notification-id');
      expect(response.success).toBe(true);
    });
  });
});
```

### 🔄 Integration Testing
```javascript
import { render, screen } from '@testing-library/react';
import { useNotificationSystem } from './hooks';

const TestComponent = () => {
  const { notifications, unreadCount, markAsRead } = useNotificationSystem();
  
  return (
    <div>
      <div data-testid="unread-count">{unreadCount}</div>
      <div data-testid="notifications-list">
        {notifications.map(notif => (
          <div key={notif.id}>
            {notif.message}
            <button onClick={() => markAsRead(notif.id)}>
              Mark as Read
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

describe('useNotificationSystem Integration', () => {
  test('should handle notification flow', () => {
    render(<TestComponent />);
    
    expect(screen.getByTestId('unread-count')).toHaveTextContent('0');
    
    // Test notification receiving and marking as read
  });
});
```

## 🚀 Performance Optimization

### ⚡ Hook Optimization
```javascript
// Memoized hook
export const useOptimizedNotifications = () => {
  const hub = useNotificationHub();
  
  const notificationData = useMemo(() => {
    if (!hub.notification) return null;
    
    return {
      ...hub.notification,
      formattedTime: formatCentralTimestamp(hub.notification.createdAt),
      isImportant: hub.notification.priority === 'high'
    };
  }, [hub.notification]);
  
  const markAsRead = useCallback(async (id) => {
    await hub.markAsRead(id);
  }, [hub.markAsRead]);
  
  return {
    connected: hub.connected,
    notification: notificationData,
    markAsRead
  };
};

// Debounced hook
export const useDebouncedValue = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
};
```

## 🔗 Related Components

- [API Components](../components/api/README.md) - API authentication integration
- [Utils Directory](../utils/README.md) - Utility functions used in hooks
- [Components Directory](../components/README.md) - Components using these hooks
- [Firebase Configuration](../components/firebase/README.md) - Firebase service integration
