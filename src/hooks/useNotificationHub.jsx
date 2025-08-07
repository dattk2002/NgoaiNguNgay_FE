// src/hooks/useNotificationHub.jsx
import { useEffect, useRef, useState } from "react";
import { HubConnectionBuilder, HubConnectionState } from "@microsoft/signalr";
import { getAccessToken } from "../components/api/auth";

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
      console.warn(" useNotificationHub - No access token found. Connection will not be established.");
      setError("No access token available.");
      return;
    }

    // Test the token format
    try {
      const tokenParts = accessToken.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
      } else {
      }
    } catch (error) {
      console.error(" useNotificationHub - Error decoding token:", error);
    }

    const hubConnection = new HubConnectionBuilder()
      .withUrl("https://tutorbooking-dev-065fe6ad4a6a.herokuapp.com/notification-hub", {
        accessTokenFactory: () => accessToken,
        
        // Try without additional headers first
        // headers: {
        //   "Authorization": `Bearer ${accessToken}`,
        //   "Content-Type": "application/json",
        //   "Accept": "application/json"
        // }
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

    // Monitor connection state changes
    const updateConnectionState = () => {
      const state = hubConnection.state;
      setConnectionState(state);
    };

    // Initial state
    updateConnectionState();

    // Log connection state changes
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
        console.log("✅ useNotificationHub - Successfully connected to notification hub");
      }
    });

    // Listen for the "ReceiveNotification" method from the hub
    hubConnection.on("ReceiveNotification", (notificationData) => {
      setNotification(notificationData);
    });

    const startConnection = async () => {
      try {
        console.log(" useNotificationHub - Attempting to start connection...");
        console.log(" useNotificationHub - Current state before start:", hubConnection.state);
        
        await hubConnection.start();
        
        setConnected(true);
        setError(null);
        updateConnectionState();
        console.log("🔗 Notification Hub State: Connected!");
        console.log("🔗 Current HubConnectionState:", hubConnection.state);
        
      } catch (err) {
        setConnected(false);
        setError(err);
        updateConnectionState();
        console.error(" useNotificationHub - Failed to start connection:", err);
        console.log("🔗 Current HubConnectionState on error:", hubConnection.state);
        
        // Log detailed error information
        console.error(" useNotificationHub - Error details:", {
          message: err.message,
          name: err.name,
          stack: err.stack,
          state: hubConnection.state
        });
      }
    };

    startConnection();

    return () => {
      console.log(" useNotificationHub - Cleaning up connection...");
      if (connectionRef.current && connectionRef.current.state !== HubConnectionState.Disconnected) {
        connectionRef.current.stop()
          .then(() => console.log("🔗 Notification Hub connection stopped."))
          .catch(err => console.error("🔗 Error stopping connection:", err));
      }
    };
  }, []); // Empty dependency array means this runs once on mount

  // Log connection state changes
  useEffect(() => {
    console.log(" useNotificationHub - Connection state updated:", {
      state: connectionState,
      stateName: HubConnectionState[connectionState],
      connected: connected,
      error: error
    });
  }, [connectionState, connected, error]);

  // Add the markAsRead function
  const markAsRead = async (notificationId) => {
    if (!connectionRef.current || connectionRef.current.state !== HubConnectionState.Connected) {
      console.error("useNotificationHub - Cannot mark as read: connection not established");
      throw new Error("Connection not established");
    }

    try {
      
      // Invoke the MarkAsRead method on the hub
      const result = await connectionRef.current.invoke("MarkAsRead", notificationId);
      
      // Handle the response based on the API documentation
      if (result && result.statusCode === 200 && result.data === "SUCCESS") {
        return { success: true, message: "Notification marked as read" };
      } else {
        console.warn("useNotificationHub - Unexpected response from MarkAsRead:", result);
        return { success: false, message: "Unexpected response from server" };
      }
    } catch (error) {
      console.error("useNotificationHub - Error marking notification as read:", error);
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
    markAsRead // Export the new function
  };
}
