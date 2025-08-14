// src/contexts/NotificationContext.jsx
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { HubConnectionBuilder, HubConnectionState } from "@microsoft/signalr";
import { getAccessToken } from "../components/api/auth";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [connectionState, setConnectionState] = useState(HubConnectionState.Disconnected);
  const connectionRef = useRef(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    // Prevent multiple initializations
    if (isInitialized.current) {
      return;
    }

    const initializeConnection = () => {
      const accessToken = getAccessToken();
      if (!accessToken) {
        console.warn("NotificationProvider - No access token found. Connection will not be established.");
        setError("No access token available.");
        return;
      }

      // Test the token format
      try {
        const tokenParts = accessToken.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          console.log("NotificationProvider - Token is valid JWT format");
        }
      } catch (error) {
        console.error("NotificationProvider - Error decoding token:", error);
      }

      const hubConnection = new HubConnectionBuilder()
        .withUrl("https://tutorbooking-dev-065fe6ad4a6a.herokuapp.com/notification-hub", {
          accessTokenFactory: () => getAccessToken(), // Always get fresh token
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: retryContext => {
            // Progressive backoff: 0, 2, 10, 30 seconds then null
            if (retryContext.previousRetryCount === 0) {
              return 0;
            } else if (retryContext.previousRetryCount === 1) {
              return 2000;
            } else if (retryContext.previousRetryCount === 2) {
              return 10000;
            } else if (retryContext.previousRetryCount === 3) {
              return 30000;
            }
            return null; // Stop retrying after 4 attempts
          }
        })
        .build();

      connectionRef.current = hubConnection;

      // Monitor connection state changes
      const updateConnectionState = () => {
        const state = hubConnection.state;
        setConnectionState(state);
        console.log("NotificationProvider - Connection state updated:", HubConnectionState[state]);
      };

      // Initial state
      updateConnectionState();

      // Connection event handlers
      hubConnection.onreconnecting((error) => {
        console.log("NotificationProvider - Reconnecting...", error?.message);
        setConnected(false);
        setError("Reconnecting...");
        updateConnectionState();
      });

      hubConnection.onreconnected((connectionId) => {
        console.log("✅ NotificationProvider - Reconnected with ID:", connectionId);
        setConnected(true);
        setError(null);
        updateConnectionState();
      });

      hubConnection.onclose((error) => {
        console.log("NotificationProvider - Connection closed:", error?.message);
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
          console.log("✅ NotificationProvider - Successfully connected to notification hub");
        }
      });

      // Listen for notifications
      hubConnection.on("ReceiveNotification", (notificationData) => {
        console.log("📨 NotificationProvider - Received notification:", notificationData);
        setNotification(notificationData);
      });

      // Start connection
      const startConnection = async () => {
        try {
          console.log("NotificationProvider - Attempting to start connection...");
          
          if (hubConnection.state === HubConnectionState.Connected) {
            console.log("NotificationProvider - Already connected, skipping start");
            return;
          }

          await hubConnection.start();
          
          setConnected(true);
          setError(null);
          updateConnectionState();
          console.log("🔗 NotificationProvider - Connection established successfully");
          
        } catch (err) {
          setConnected(false);
          setError(err);
          updateConnectionState();
          console.error("❌ NotificationProvider - Failed to start connection:", err);
        }
      };

      startConnection();
      isInitialized.current = true;
    };

    initializeConnection();

    // Cleanup function
    return () => {
      console.log("NotificationProvider - Cleaning up connection...");
      if (connectionRef.current && connectionRef.current.state !== HubConnectionState.Disconnected) {
        connectionRef.current.stop()
          .then(() => {
            console.log("🔗 NotificationProvider - Connection stopped successfully");
            isInitialized.current = false;
          })
          .catch(err => console.error("❌ NotificationProvider - Error stopping connection:", err));
      }
    };
  }, []); // Empty dependency array is OK here since we use ref to prevent re-initialization

  // Mark notification as read function
  const markAsRead = async (notificationId) => {
    console.log("NotificationProvider - markAsRead called with ID:", notificationId);
    console.log("NotificationProvider - Connection state:", HubConnectionState[connectionState]);
    console.log("NotificationProvider - Connected state:", connected);
    console.log("NotificationProvider - Connection ref:", connectionRef.current);
    
    if (!connectionRef.current) {
      console.error("NotificationProvider - No connection reference available");
      throw new Error("Connection not available");
    }
    
    if (connectionRef.current.state !== HubConnectionState.Connected) {
      console.error("NotificationProvider - Connection not established. Current state:", HubConnectionState[connectionRef.current.state]);
      
      // Try to reconnect if not connected
      try {
        console.log("NotificationProvider - Attempting to reconnect...");
        await connectionRef.current.start();
        console.log("NotificationProvider - Reconnection successful");
      } catch (reconnectError) {
        console.error("NotificationProvider - Reconnection failed:", reconnectError);
        throw new Error("Connection not established and reconnection failed");
      }
    }

    try {
      console.log("NotificationProvider - Marking notification as read:", notificationId);
      
      // Call the SignalR hub method
      const result = await connectionRef.current.invoke("MarkAsRead", notificationId);
      console.log("NotificationProvider - MarkAsRead result:", result);
      
      console.log("✅ NotificationProvider - MarkAsRead invoked successfully for:", notificationId);
      return { success: true, message: "Notification marked as read" };
    } catch (error) {
      console.error("NotificationProvider - Error marking notification as read:", error);
      throw new Error(`Failed to mark notification as read: ${error.message}`);
    }
  };

  // Mark all notifications as read function
  const markAllAsRead = async () => {
    console.log("NotificationProvider - markAllAsRead called");
    console.log("NotificationProvider - Connection state:", HubConnectionState[connectionState]);
    console.log("NotificationProvider - Connected state:", connected);
    console.log("NotificationProvider - Connection ref:", connectionRef.current);
    
    if (!connectionRef.current) {
      console.error("NotificationProvider - No connection reference available");
      throw new Error("Connection not available");
    }
    
    if (connectionRef.current.state !== HubConnectionState.Connected) {
      console.error("NotificationProvider - Connection not established. Current state:", HubConnectionState[connectionRef.current.state]);
      
      // Try to reconnect if not connected
      try {
        console.log("NotificationProvider - Attempting to reconnect...");
        await connectionRef.current.start();
        console.log("NotificationProvider - Reconnection successful");
      } catch (reconnectError) {
        console.error("NotificationProvider - Reconnection failed:", reconnectError);
        throw new Error("Connection not established and reconnection failed");
      }
    }

    try {
      console.log("NotificationProvider - Marking all notifications as read");
      
      // Call the SignalR hub method
      const result = await connectionRef.current.invoke("MarkAllAsRead");
      console.log("NotificationProvider - MarkAllAsRead result:", result);
      
      console.log("✅ NotificationProvider - MarkAllAsRead invoked successfully");
      return { success: true, message: "All notifications marked as read" };
    } catch (error) {
      console.error("NotificationProvider - Error marking all notifications as read:", error);
      throw new Error(`Failed to mark all notifications as read: ${error.message}`);
    }
  };

  // Clear notification function
  const clearNotification = () => {
    setNotification(null);
  };

  const contextValue = {
    connected,
    error,
    notification,
    connection: connectionRef.current,
    connectionState,
    connectionStateName: HubConnectionState[connectionState],
    markAsRead,
    markAllAsRead,
    clearNotification
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook to use the notification context
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
};

export default NotificationContext;
