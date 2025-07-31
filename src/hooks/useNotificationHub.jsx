// src/hooks/useNotificationHub.jsx
import { useEffect, useRef, useState } from "react";
import { HubConnectionBuilder, HubConnectionState } from "@microsoft/signalr";
import { getAccessToken } from "../components/api/auth";

// Try different possible notification hub URLs

export function useNotificationHub() {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const [connection, setConnection] = useState(null);
  const [notification, setNotification] = useState(null);
  const [connectionState, setConnectionState] = useState(HubConnectionState.Disconnected);
  const connectionRef = useRef(null);

  useEffect(() => {
    console.log(" useNotificationHub - Starting connection setup...");

    // Get the real access token
    const accessToken = getAccessToken();
    console.log("Ạc sét tô cần: ", accessToken);
    
    if (!accessToken) {
      console.warn(" useNotificationHub - No access token found. Connection will not be established.");
      setError("No access token available.");
      return;
    }

    // Debug: Log the token being used
    console.log(" useNotificationHub - Using token:", accessToken ? `${accessToken}` : "No token");

    // Test the token format
    try {
      const tokenParts = accessToken.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        console.log(" useNotificationHub - Token payload:", payload);
        console.log(" useNotificationHub - Token contains user ID:", payload.sub || payload.userId || payload.id);
        console.log(" useNotificationHub - Token expiration:", new Date(payload.exp * 1000));
      } else {
        console.log(" useNotificationHub - Token doesn't appear to be a JWT");
      }
    } catch (error) {
      console.error(" useNotificationHub - Error decoding token:", error);
    }

    const hubConnection = new HubConnectionBuilder()
      .withUrl("https://tutorbooking-dev-065fe6ad4a6a.herokuapp.com/notification-hub", {
        accessTokenFactory: () => {
          console.log(" useNotificationHub - Token: ", accessToken);
          return accessToken;
        },
        // Try without additional headers first
        // headers: {
        //   "Authorization": `Bearer ${accessToken}`,
        //   "Content-Type": "application/json",
        //   "Accept": "application/json"
        // }
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: retryContext => {
          console.log(` useNotificationHub - Reconnect attempt ${retryContext.elapsedMilliseconds}ms, retries: ${retryContext.retryReason}`);
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
      console.log(" useNotificationHub - Connection state changed to:", {
        state: state,
        stateName: HubConnectionState[state],
        timestamp: new Date().toISOString()
      });
    };

    // Initial state
    updateConnectionState();

    // Log connection state changes
    hubConnection.onreconnecting((error) => {
      console.log(" useNotificationHub - Reconnecting:", error);
      setConnected(false);
      setError("Reconnecting...");
      updateConnectionState();
    });

    hubConnection.onreconnected((connectionId) => {
      console.log(" useNotificationHub - Reconnected. ConnectionId:", connectionId);
      setConnected(true);
      setError(null);
      updateConnectionState();
    });

    hubConnection.onclose((error) => {
      console.log(" useNotificationHub - Connection closed:", error);
      setConnected(false);
      setError(error ? `Connection closed with error: ${error.message}` : "Connection closed.");
      updateConnectionState();
    });

    // Handle successful connection
    hubConnection.on("UserConnected", (message) => {
      console.log(" useNotificationHub - UserConnected event received:", message);
      if (message === "CONNECTED_TO_NOTIFICATION_HUB") {
        setConnected(true);
        setError(null);
        updateConnectionState();
        console.log("✅ useNotificationHub - Successfully connected to notification hub");
      }
    });

    // Listen for the "ReceiveNotification" method from the hub
    hubConnection.on("ReceiveNotification", (notificationData) => {
      console.log(" useNotificationHub - Received Notification:", notificationData);
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
        
        // If the hub has a "UserConnected" method, invoke it here
        // await hubConnection.invoke("UserConnected");
        // console.log("🔗 Invoked UserConnected method.");
        
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

  return {
    connected,
    error,
    notification,
    connection: connectionRef.current,
    connectionState,
    connectionStateName: HubConnectionState[connectionState]
  };
}
