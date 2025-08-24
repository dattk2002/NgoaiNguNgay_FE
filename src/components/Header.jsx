import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCommentDots,
  FaWallet,
  FaBell,
  FaCheck,
  FaCheckDouble,
  FaTimes,
  FaInfoCircle,
  FaExclamationTriangle,
  FaExclamationCircle,
  FaBellSlash,
  FaClock,
  FaRegBell,
} from "react-icons/fa";
import { toast } from "react-toastify";
import logo from "../assets/logo.png";
import NoFocusOutLineButton from "../utils/noFocusOutlineButton";
import { useNotification } from "../contexts/NotificationContext";
import { getNotification } from "./api/auth";
import { getSenderProfile } from "./api/auth";
import {
  Badge,
  Menu,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  IconButton,
  CircularProgress,
  Box,
  Divider,
  Button,
  Chip,
  Tooltip,
  Fade,
  Skeleton,
} from "@mui/material";
import {
  getNotificationTitle,
  getNotificationContent,
  getNotificationMessage,
  isSupportedNotificationType,
} from "../utils/notificationMessages";
import ChangePasswordPage from "../pages/ChangePasswordPage";

// Utility functions for role checking
const hasRole = (user, roleName) => {
  if (!user || !user.roles) return false;

  // Handle both string and array formats
  const roles = Array.isArray(user.roles) ? user.roles : [user.roles];

  // Handle case variations and string matching
  return roles.some((role) => {
    if (typeof role === "string") {
      return role.toLowerCase() === roleName.toLowerCase();
    }
    // Handle object format if roles are objects with name property
    if (role && role.name) {
      return role.name.toLowerCase() === roleName.toLowerCase();
    }
    return false;
  });
};

const isTutor = (user) => hasRole(user, "Tutor");
const isLearner = (user) => {
  if (!user || !user.roles) return false;
  const roles = Array.isArray(user.roles) ? user.roles : [user.roles];
  // Only return true if the user has exactly one role and it is "Learner"
  return roles.length === 1 && hasRole(user, "Learner");
};

function Header({ user, onLogout, onLoginClick, onSignUpClick, firstTutorId }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState(null);
  const [avatarKey, setAvatarKey] = useState(Date.now());
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const imgRef = useRef(null);
  const navigate = useNavigate();
  const [anchorNotif, setAnchorNotif] = useState(null);
  const [senderProfiles, setSenderProfiles] = useState({});

  // Use the notification context
  const { connected, notification, markAsRead: markAsReadFromContext, markAllAsRead: markAllAsReadFromContext } = useNotification();

  // Function to add a new notification
  const addNotification = useCallback(
    (notificationData) => {
      const newNotification = {
        id: Date.now(),
        title: notificationData.title || "Thông báo mới",
        message: notificationData.message || "Bạn có thông báo mới",
        timestamp: new Date().toISOString(),
        isRead: false,
        type: notificationData.type || "success",
        senderProfile: notificationData.senderProfile || null,
      };

      setNotifications((prev) => [newNotification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Save to local storage
      try {
        const storageKey = `notifications_${user?.id || "anonymous"}`;
        const existingNotifications = JSON.parse(
          localStorage.getItem(storageKey) || "[]"
        );
        const updatedNotifications = [
          newNotification,
          ...existingNotifications,
        ];

        // Keep only the last 100 notifications to prevent storage bloat
        const trimmedNotifications = updatedNotifications.slice(0, 100);

        localStorage.setItem(storageKey, JSON.stringify(trimmedNotifications));
      } catch (error) {
        console.error("Error saving notification to local storage:", error);
      }
    },
    [user?.id]
  );

  // Expose the addNotification function globally
  useEffect(() => {
    window.addNotification = addNotification;

    return () => {
      delete window.addNotification;
    };
  }, [addNotification]);

  useEffect(() => {
    if (user?.profileImageUrl) {
      const urlWithTimestamp = user.profileImageUrl.includes("?")
        ? user.profileImageUrl
        : `${user.profileImageUrl}?t=${Date.now()}`;

      setCurrentAvatar(urlWithTimestamp);
      setAvatarKey(Date.now());

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = urlWithTimestamp;
    }
  }, [user]);

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const updatedUser = JSON.parse(localStorage.getItem("user"));
        if (updatedUser && updatedUser.profileImageUrl) {
          const timestamp = Date.now();
          let newUrl = updatedUser.profileImageUrl;
          if (!newUrl.includes("?")) {
            newUrl = `${newUrl}?t=${timestamp}`;
          }

          setCurrentAvatar(newUrl);
          setAvatarKey(timestamp);

          const img = new Image();
          img.crossOrigin = "anonymous";
          img.src = newUrl;

          if (imgRef.current) {
            imgRef.current.src = newUrl;
          }
        }
      } catch (error) {
        console.error("Error parsing user from localStorage:", error);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const handleAvatarUpdate = (event) => {
      if (event.detail && event.detail.profileImageUrl) {
        let newUrl = event.detail.profileImageUrl;
        if (!newUrl.includes("?")) {
          newUrl = `${newUrl}?t=${Date.now()}`;
        }

        setCurrentAvatar(newUrl);
        setAvatarKey(Date.now());

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = newUrl;
        img.onload = () => {
          setAvatarKey(Date.now() + 1);

          if (imgRef.current) {
            imgRef.current.src = newUrl + "&reload=" + Date.now();
          }
        };
      }
    };

    window.addEventListener("avatar-updated", handleAvatarUpdate);

    return () => {
      window.removeEventListener("avatar-updated", handleAvatarUpdate);
    };
  }, []);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.profileImageUrl) {
          const timestamp = Date.now();
          let newUrl = parsedUser.profileImageUrl;

          if (!newUrl.includes("?")) {
            newUrl = `${newUrl}?t=${timestamp}`;
          }

          setCurrentAvatar(newUrl);
          setAvatarKey(timestamp);

          const img = new Image();
          img.crossOrigin = "anonymous";
          img.src = newUrl;
        }
      }
    } catch (error) {
      console.error("Error parsing user from localStorage in Header:", error);
    }
  }, []);

  // Fetch notifications from API
  const fetchNotifications = async () => {
    if (!user) return;

    try {
      setLoadingNotifications(true);

      // Load notifications from local storage first
      const storageKey = `notifications_${user.id}`;
      const localNotifications = JSON.parse(
        localStorage.getItem(storageKey) || "[]"
      );

      // Fetch from API
      const response = await getNotification(1, 50, false); // Fetch all notifications

      if (response && response.data) {
        const fetchedNotifications = response.data.items || response.data || [];

        // Transform API response to match our notification format
        const transformedNotifications = await Promise.all(
          fetchedNotifications.map(async (notif) => {
            // Extract sender information from additionalData
            let senderId = null;
            let senderProfile = null;

            if (notif.additionalData) {
              try {
                const additionalData = JSON.parse(notif.additionalData);
                senderId = additionalData.SenderId;

                // Fetch sender profile if we have a senderId and haven't fetched it yet
                if (senderId && !senderProfiles[senderId]) {
                  try {
                    const senderResponse = await getSenderProfile(senderId);
                    if (senderResponse) {
                      setSenderProfiles((prev) => ({
                        ...prev,
                        [senderId]: senderResponse,
                      }));
                      senderProfile = senderResponse;
                    }
                  } catch (error) {
                    console.error(
                      `Failed to fetch sender profile for ${senderId}:`,
                      error
                    );
                  }
                } else if (senderId && senderProfiles[senderId]) {
                  senderProfile = senderProfiles[senderId];
                }
              } catch (error) {
                console.error("Failed to parse additionalData:", error);
              }
            }

            // Check if title needs conversion (is a notification key)
            const titleNeedsConversion =
              notif.title &&
              (notif.title.startsWith("PUSH_ON_") ||
                notif.title.includes("_BODY"));

            // Check if content needs conversion (is a notification key)
            const contentNeedsConversion =
              notif.content &&
              (notif.content.startsWith("PUSH_ON_") ||
                notif.content.includes("_BODY"));

            // Convert title
            let convertedTitle;
            if (titleNeedsConversion) {
              convertedTitle = getNotificationTitle(notif.title.trim());
            } else {
              convertedTitle = notif.title; // Use original if already user-friendly
            }

            // Convert content and include sender name if available
            let convertedContent;
            if (contentNeedsConversion) {
              convertedContent = getNotificationContent(notif.content.trim());

              // Customize content based on notification type and sender info
              if (
                notif.title === "PUSH_ON_TUTOR_RECEIVED_TIME_SLOT_REQUEST" ||
                notif.title === "PUSH_ON_TUTOR_RECEIVED_TIME_SLOT_REQUEST_BODY"
              ) {
                if (senderProfile && senderProfile.fullName) {
                  convertedContent = `${senderProfile.fullName} đã gửi cho bạn một yêu cầu`;
                } else {
                  convertedContent = "1 học viên đã gửi cho bạn một yêu cầu";
                }
              }
            } else {
              convertedContent = notif.content; // Use original if already user-friendly
            }

            return {
              id: notif.id,
              title: convertedTitle,
              message: convertedContent,
              timestamp:
                notif.createdTime ||
                notif.createdAt ||
                new Date().toISOString(),
              isRead: notif.isRead || false,
              type: notif.type || "info",
              senderId: senderId,
              senderProfile: senderProfile,
            };
          })
        );

        // Merge API notifications with local notifications
        // Use a Map to avoid duplicates based on ID
        const notificationMap = new Map();

        // Add API notifications first (they have priority)
        transformedNotifications.forEach((notif) => {
          notificationMap.set(notif.id, notif);
        });

        // Add local notifications (only if not already present)
        localNotifications.forEach((notif) => {
          if (!notificationMap.has(notif.id)) {
            notificationMap.set(notif.id, notif);
          }
        });

        // Convert back to array and sort by timestamp (newest first)
        const mergedNotifications = Array.from(notificationMap.values()).sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        );

        setNotifications(mergedNotifications);

        // Calculate unread count
        const unread = mergedNotifications.filter((n) => !n.isRead).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      toast.error("Không thể tải thông báo");
    } finally {
      setLoadingNotifications(false);
    }
  };

  // Fetch notifications when user is available
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  // Handle new notifications from the hub
  useEffect(() => {
    if (notification) {
      const newNotification = {
        id: Date.now(),
        title: notification.title || "Thông báo mới",
        message:
          notification.message ||
          notification.content ||
          "Bạn có thông báo mới",
        timestamp: new Date().toISOString(),
        isRead: false,
        type: notification.type || "info",
      };

      setNotifications((prev) => [newNotification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Save to local storage
      try {
        const storageKey = `notifications_${user?.id || "anonymous"}`;
        const existingNotifications = JSON.parse(
          localStorage.getItem(storageKey) || "[]"
        );
        const updatedNotifications = [
          newNotification,
          ...existingNotifications,
        ];

        // Keep only the last 100 notifications to prevent storage bloat
        const trimmedNotifications = updatedNotifications.slice(0, 100);

        localStorage.setItem(storageKey, JSON.stringify(trimmedNotifications));
      } catch (error) {
        console.error("Error saving hub notification to local storage:", error);
      }
    }
  }, [notification, user?.id]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
    setIsMenuOpen(false);
  };

  const toggleNotification = () => {
    setIsNotificationOpen(!isNotificationOpen);
    setIsDropdownOpen(false);
    setIsMenuOpen(false);

    // Refresh notifications when opening dropdown
    if (!isNotificationOpen && user) {
      fetchNotifications();
    }
  };

  const markAsRead = async (notificationId) => {
    console.log("Header - markAsRead called with ID:", notificationId);
    console.log("Header - Connected state:", connected);
    console.log("Header - markAsReadFromContext available:", !!markAsReadFromContext);
    
    try {
      // Update local state immediately for better UX
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      // Call the SignalR hub method through context
      if (markAsReadFromContext) {
        try {
          await markAsReadFromContext(notificationId);
          console.log("✅ Header - Notification marked as read via SignalR:", notificationId);
        } catch (signalRError) {
          console.error("Header - SignalR error:", signalRError);
          // Don't throw here, just log the error but continue with local updates
        }
      } else {
        console.warn("Header - markAsReadFromContext not available");
      }

      // Update local storage
      try {
        const storageKey = `notifications_${user?.id || "anonymous"}`;
        const existingNotifications = JSON.parse(
          localStorage.getItem(storageKey) || "[]"
        );
        const updatedNotifications = existingNotifications.map((notif) =>
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        );
        localStorage.setItem(storageKey, JSON.stringify(updatedNotifications));
      } catch (error) {
        console.error("Error updating notification in local storage:", error);
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      toast.error("Không thể cập nhật trạng thái thông báo");
      
      // Revert local state on error
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, isRead: false } : notif
        )
      );
      setUnreadCount((prev) => prev + 1);
    }
  };

  const markAllAsRead = async () => {
    console.log("Header - markAllAsRead called");
    console.log("Header - Connected state:", connected);
    console.log("Header - markAllAsReadFromContext available:", !!markAllAsReadFromContext);
    
    try {
      // Update local state immediately for better UX
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true }))
      );
      setUnreadCount(0);

      // Call the SignalR hub method through context
      if (markAllAsReadFromContext) {
        try {
          await markAllAsReadFromContext();
          console.log("✅ Header - All notifications marked as read via SignalR");
        } catch (signalRError) {
          console.error("Header - SignalR error:", signalRError);
          // Don't throw here, just log the error but continue with local updates
        }
      } else {
        console.warn("Header - markAllAsReadFromContext not available");
      }

      // Update local storage
      try {
        const storageKey = `notifications_${user?.id || "anonymous"}`;
        const existingNotifications = JSON.parse(
          localStorage.getItem(storageKey) || "[]"
        );
        const updatedNotifications = existingNotifications.map((notif) => ({
          ...notif,
          isRead: true,
        }));
        localStorage.setItem(storageKey, JSON.stringify(updatedNotifications));
      } catch (error) {
        console.error("Error updating notifications in local storage:", error);
      }
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      toast.error("Không thể cập nhật trạng thái thông báo");
      
      // Revert local state on error
      const originalUnreadCount = notifications.filter((n) => !n.isRead).length;
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: false }))
      );
      setUnreadCount(originalUnreadCount);
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setIsNotificationOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef, notificationRef]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Open/close handlers for MUI Menu
  const handleNotifClick = (event) => {
    setAnchorNotif(event.currentTarget);
    setIsNotificationOpen(true);
    fetchNotifications();
  };

  const handleNotifClose = () => {
    setAnchorNotif(null);
    setIsNotificationOpen(false);
  };

  // Get notification icon based on type
  const getNotificationIcon = (type, isRead) => {
    const iconProps = {
      size: 20,
      style: {
        color: isRead ? "#9e9e9e" : "#1976d2",
      },
    };

    switch (type?.toLowerCase()) {
      case "success":
        return <FaCheck {...iconProps} />;
      case "warning":
        return <FaExclamationTriangle {...iconProps} />;
      case "error":
        return <FaExclamationCircle {...iconProps} />;
      case "info":
      default:
        return <FaInfoCircle {...iconProps} />;
    }
  };

  // Get notification color based on type
  const getNotificationColor = (type, isRead) => {
    if (isRead) return "#e0e0e0";

    switch (type?.toLowerCase()) {
      case "success":
        return "#4caf50";
      case "warning":
        return "#ff9800";
      case "error":
        return "#f44336";
      case "info":
      default:
        return "#333333";
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const notifDate = new Date(timestamp);
    const diffInHours = (now - notifDate) / (1000 * 60 * 60);
    const diffInMinutes = (now - notifDate) / (1000 * 60);

    // Format the date part
    const dateStr = notifDate.toLocaleDateString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (diffInMinutes < 1) {
      return `Vừa xong lúc ${dateStr}`;
    } else if (diffInMinutes < 60) {
      return `Vài phút trước lúc ${dateStr}`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} giờ trước lúc ${dateStr}`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} ngày trước lúc ${dateStr}`;
    }
  };

  const dropdownVariants = {
    hidden: {
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: { duration: 0.15, ease: "easeOut" },
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.2, ease: "easeIn" },
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: { duration: 0.15, ease: "easeOut" },
    },
  };

  const headerVariants = {
    top: {
      position: "relative",
      backgroundColor: "rgba(255, 255, 255, 0)",
      boxShadow: "0 0px 0px 0px rgba(0, 0, 0, 0)",
      borderBottomWidth: "0px",
    },
    scrolled: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: "rgba(255, 255, 255, 1)",
      boxShadow:
        "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
      borderColor: "rgb(229 231 235)",
    },
  };

  const notificationVariants = {
    hidden: {
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: { duration: 0.15, ease: "easeOut" },
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.2, ease: "easeIn" },
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: { duration: 0.15, ease: "easeOut" },
    },
  };

  return (
    <>
      <motion.header
        className="w-full z-50"
        variants={headerVariants}
        initial="top"
        animate={isScrolled ? "scrolled" : "top"}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="w-full px-4 sm:px-6 flex justify-between items-center">
          <div className="flex items-center gap-4 sm:gap-6">
            <Link
              to="/"
              className="text-black text-lg sm:text-xl font-semibold"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              <img src={logo} alt="logo" className="w-20 h-20" />
            </Link>
            <div className="hidden md:flex items-center gap-4 sm:gap-6">
              {isTutor(user) ? (
                <Link
                  to="/tutor-management"
                  className="text-gray-700 hover:text-black text-sm sm:text-base"
                >
                  Quản lí dạy học
                </Link>
              ) : (
                <Link
                  to="/become-tutor"
                  className="text-gray-700 hover:text-black text-sm sm:text-base"
                >
                  Trở thành gia sư
                </Link>
              )}

              <Link
                to="/languages"
                className="text-gray-700 hover:text-black text-sm sm:text-base"
              >
                Ngôn ngữ
              </Link>

              <Link
                to="/how-it-works"
                className="text-gray-700 hover:text-black text-sm sm:text-base"
              >
                Cách hoạt động
              </Link>

              <Link
                to="/pricing"
                className="text-gray-700 hover:text-black text-sm sm:text-base"
              >
                Giá cả
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <>
                {/* Enhanced Notification Icon with MUI Badge */}
                <Tooltip title="Thông báo" arrow>
                  <IconButton
                    color="inherit"
                    onClick={handleNotifClick}
                    aria-label="show notifications"
                    size="large"
                    className="no-focus-outline"
                    sx={{
                      position: "relative",
                      color: "#333333",
                      outline: "none",
                      "&:hover": {
                        color: "#000000",
                      },
                    }}
                  >
                    <Badge
                      badgeContent={unreadCount > 9 ? "9+" : unreadCount}
                      color="error"
                      max={99}
                      sx={{
                        "& .MuiBadge-badge": {
                          fontSize: "0.75rem",
                          fontWeight: "bold",
                          minWidth: "20px",
                          height: "20px",
                        },
                      }}
                    >
                      {unreadCount > 0 ? <FaBell /> : <FaRegBell />}
                    </Badge>
                  </IconButton>
                </Tooltip>

                {/* Enhanced Notification Menu */}
                <Menu
                  anchorEl={anchorNotif}
                  open={Boolean(anchorNotif)}
                  onClose={handleNotifClose}
                  PaperProps={{
                    sx: {
                      width: 500, // Increased from 400 to 500
                      maxHeight: 600, // Increased from 500 to 600
                      p: 0,
                      borderRadius: 2,
                      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
                      border: "1px solid rgba(0, 0, 0, 0.08)",
                      overflow: "hidden", // Prevent horizontal scroll
                    },
                  }}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                  }}
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  TransitionComponent={Fade}
                  transitionDuration={200}
                >
                  {/* Header */}
                  <Box
                    sx={{
                      px: 3,
                      py: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
                      backgroundColor: "rgba(0, 0, 0, 0.02)",
                      minWidth: 0, // Prevent horizontal scroll
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        minWidth: 0,
                        flex: 1,
                      }}
                    >
                      <FaBell
                        style={{
                          color: "#1976d2",
                          fontSize: 20,
                          flexShrink: 0,
                        }}
                      />
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        color="text.primary"
                        sx={{
                          flex: 1,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Thông báo
                      </Typography>
                      {unreadCount > 0 && (
                        <Chip
                          label={unreadCount}
                          size="small"
                          color="primary"
                          sx={{ ml: 1, flexShrink: 0 }}
                        />
                      )}
                    </Box>
                    {unreadCount > 0 && (
                      <Tooltip title="Đánh dấu đã đọc tất cả" arrow>
                        <IconButton
                          size="small"
                          onClick={markAllAsRead}
                          sx={{
                            color: "primary.main",
                            flexShrink: 0,
                            "&:hover": {
                              backgroundColor: "primary.light",
                              color: "white",
                            },
                          }}
                        >
                          <FaCheckDouble />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>

                  {/* Content */}
                  <Box
                    sx={{
                      maxHeight: 500,
                      overflow: "auto",
                      overflowX: "hidden",
                    }}
                  >
                    {loadingNotifications ? (
                      <Box sx={{ p: 2 }}>
                        {/* Skeleton for notification items */}
                        {[1, 2, 3, 4].map((index) => (
                          <Box key={index} sx={{ mb: 2 }}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: 2,
                              }}
                            >
                              {/* Avatar skeleton */}
                              <Skeleton
                                variant="circular"
                                width={40}
                                height={40}
                                sx={{ flexShrink: 0 }}
                              />

                              {/* Content skeleton */}
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                {/* Title skeleton */}
                                <Skeleton
                                  variant="text"
                                  width="60%"
                                  height={20}
                                  sx={{ mb: 1 }}
                                />

                                {/* Message skeleton */}
                                <Skeleton
                                  variant="text"
                                  width="100%"
                                  height={16}
                                  sx={{ mb: 0.5 }}
                                />
                                <Skeleton
                                  variant="text"
                                  width="80%"
                                  height={16}
                                  sx={{ mb: 1 }}
                                />

                                {/* Timestamp skeleton */}
                                <Skeleton
                                  variant="text"
                                  width="40%"
                                  height={14}
                                />
                              </Box>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    ) : notifications.length === 0 ? (
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          py: 6,
                          px: 3,
                        }}
                      >
                        <FaBellSlash
                          style={{
                            fontSize: 48,
                            color: "#e0e0e0",
                            marginBottom: 16,
                            display: "block",
                          }}
                        />
                        <Typography
                          variant="body1"
                          color="text.secondary"
                          sx={{
                            mb: 1,
                            textAlign: "center",
                          }}
                        >
                          Không có thông báo nào
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.disabled"
                          sx={{ textAlign: "center" }}
                        >
                          Bạn sẽ thấy thông báo mới ở đây
                        </Typography>
                      </Box>
                    ) : (
                      <List dense disablePadding>
                        {notifications.map((notif, index) => (
                          <ListItem
                            key={notif.id}
                            alignItems="flex-start"
                            button
                            onClick={() => markAsRead(notif.id)}
                            sx={{
                              py: 2,
                              px: 3,
                              borderBottom:
                                index < notifications.length - 1
                                  ? "1px solid rgba(0, 0, 0, 0.04)"
                                  : "none",
                              backgroundColor: !notif.isRead
                                ? "rgba(25, 118, 210, 0.04)"
                                : "inherit",
                              borderLeft: !notif.isRead
                                ? "4px solid #1976d2"
                                : "4px solid transparent",
                              "&:hover": {
                                backgroundColor: !notif.isRead
                                  ? "rgba(25, 118, 210, 0.08)"
                                  : "rgba(0, 0, 0, 0.04)",
                              },
                              transition: "all 0.2s ease-in-out",
                              minWidth: 0,
                              width: "100%",
                            }}
                          >
                            <ListItemAvatar sx={{ flexShrink: 0 }}>
                              {notif.senderProfile &&
                              notif.senderProfile.profilePictureUrl ? (
                                <Avatar
                                  src={notif.senderProfile.profilePictureUrl}
                                  sx={{
                                    width: 40,
                                    height: 40,
                                    opacity: notif.isRead ? 0.6 : 1,
                                  }}
                                />
                              ) : (
                                <Avatar
                                  sx={{
                                    bgcolor: getNotificationColor(
                                      notif.type,
                                      notif.isRead
                                    ),
                                    width: 40,
                                    height: 40,
                                    opacity: notif.isRead ? 0.6 : 1,
                                  }}
                                >
                                  {getNotificationIcon(
                                    notif.type,
                                    notif.isRead
                                  )}
                                </Avatar>
                              )}
                            </ListItemAvatar>

                            <ListItemText
                              sx={{
                                minWidth: 0,
                                flex: 1,
                              }}
                              primary={
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    mb: 0.5,
                                    minWidth: 0,
                                  }}
                                >
                                  <Typography
                                    variant="subtitle2"
                                    fontWeight={
                                      notif.isRead ? "normal" : "bold"
                                    }
                                    color={
                                      notif.isRead
                                        ? "text.primary"
                                        : "primary.main"
                                    }
                                    sx={{
                                      flex: 1,
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {notif.title}
                                  </Typography>
                                  {!notif.isRead && (
                                    <Box
                                      sx={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: "50%",
                                        bgcolor: "error.main",
                                        flexShrink: 0,
                                      }}
                                    />
                                  )}
                                </Box>
                              }
                              secondary={
                                <Box sx={{ minWidth: 0 }}>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                      mb: 1,
                                      display: "-webkit-box",
                                      WebkitLineClamp: 3,
                                      WebkitBoxOrient: "vertical",
                                      overflow: "hidden",
                                      lineHeight: 1.4,
                                      wordBreak: "break-word",
                                    }}
                                  >
                                    {notif.message}
                                  </Typography>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1,
                                      minWidth: 0,
                                    }}
                                  >
                                    <FaClock
                                      style={{
                                        fontSize: 14,
                                        color: "#9e9e9e",
                                        flexShrink: 0,
                                      }}
                                    />
                                    <Typography
                                      variant="caption"
                                      color="text.disabled"
                                      sx={{
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      {formatTimestamp(notif.timestamp)}
                                    </Typography>
                                  </Box>
                                </Box>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </Box>

                  {/* Footer */}
                  {notifications.length > 0 && (
                    <Box
                      sx={{
                        px: 3,
                        py: 1.5,
                        borderTop: "1px solid rgba(0, 0, 0, 0.08)",
                        backgroundColor: "rgba(0, 0, 0, 0.02)",
                        textAlign: "center",
                        minWidth: 0, // Prevent horizontal scroll
                      }}
                    >
                      <Typography variant="caption" color="text.disabled">
                        {notifications.length} thông báo
                      </Typography>
                    </Box>
                  )}
                </Menu>

                {/* Message Icon - Updated to use IconButton */}
                <Tooltip title="Tin nhắn" arrow>
                  <IconButton
                    color="inherit"
                    onClick={(e) => {
                      e.preventDefault();
                      if (firstTutorId) {
                        navigate(`/message/${firstTutorId}`);
                      } else {
                        toast.info("Bạn chưa từng nhắn tin với gia sư nào.");
                      }
                    }}
                    aria-label="show messages"
                    size="large"
                    className="no-focus-outline"
                    sx={{
                      position: "relative",
                      color: "#333333",
                      outline: "none",
                      "&:hover": {
                        color: "#000000",
                      },
                    }}
                  >
                    <FaCommentDots />
                  </IconButton>
                </Tooltip>

                {/* Wallet Icon - Updated to use IconButton */}
                <Tooltip title="Ví điện tử" arrow>
                  <IconButton
                    color="inherit"
                    onClick={() => navigate("/wallet")}
                    aria-label="show wallet"
                    size="large"
                    className="no-focus-outline"
                    sx={{
                      position: "relative",
                      color: "#333333",
                      outline: "none",
                      "&:hover": {
                        color: "#000000",
                      },
                    }}
                  >
                    <FaWallet />
                  </IconButton>
                </Tooltip>

                <div className="relative" ref={dropdownRef}>
                  <div
                    onClick={toggleDropdown}
                    className="relative group flex items-center gap-1 sm:gap-1.5 p-0.5 focus:outline-none z-10 cursor-pointer"
                    aria-expanded={isDropdownOpen}
                    aria-label="Menu người dùng"
                  >
                    <div className="absolute inset-0 bg-[#333333] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-150 -z-10"></div>

                    <span className="p-1">
                      <svg
                        className="w-6 h-6 text-gray-700 group-hover:text-white transition-colors duration-150"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </span>
                    <div className="relative rounded-full border border-gray-300 group-hover:border-transparent transition-colors duration-150">
                      <img
                        ref={imgRef}
                        key={avatarKey}
                        src={
                          currentAvatar ||
                          "https://avatar.iran.liara.run/public"
                        }
                        alt="Ảnh đại diện người dùng"
                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover block"
                        onError={(e) => {
                          console.error("Image error in Header:", e.target.src);
                          e.target.src = "https://avatar.iran.liara.run/public";
                        }}
                        referrerPolicy="no-referrer"
                        crossOrigin="anonymous"
                        style={{ maxWidth: "100%" }}
                        loading="eager"
                      />
                    </div>
                  </div>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200 origin-top-right"
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={dropdownVariants}
                      >
                        <div className="block px-4 py-2 text-sm text-gray-700 font-bold">{`${
                          user.name || user.fullName
                        }`}</div>
                        <Link
                          to="/wallet"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-medium"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          Ví điện tử
                        </Link>
                        <Link
                          to="/messages"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-medium"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          Tin nhắn & Buổi học
                        </Link>
                        {isTutor(user) && (
                          <Link
                            to="/create-ad"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-medium"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            Tạo quảng cáo
                          </Link>
                        )}
                        <div className="border-t border-gray-100 my-1"></div>
                        <Link
                          to={user && user.id ? `/user/${user.id}` : "/"}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          Hồ sơ của tôi
                        </Link>
                        {isLearner(user) && (
                          <Link
                            to="/my-bookings"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            Booking của tôi
                          </Link>
                        )}
                        {isTutor(user) && (
                          <Link
                            to={`/tutor-profile/${user?.id}`}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            Hồ sơ gia sư
                          </Link>
                        )}
                        <Link
                          to={`/change-password/${user?.id}`}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          Đổi mật khẩu
                        </Link>
                        <button
                          onClick={() => {
                            onLogout();
                            setIsDropdownOpen(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Đăng xuất
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <NoFocusOutLineButton
                  onClick={onLoginClick}
                  className="text-black px-3 sm:px-4 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm font-semibold border border-gray-300 hover:bg-gray-100"
                >
                  Đăng nhập
                </NoFocusOutLineButton>
                <NoFocusOutLineButton
                  onClick={onSignUpClick}
                  className="bg-black text-white px-3 sm:px-4 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm font-semibold hover:bg-[#333333]"
                >
                  Đăng ký
                </NoFocusOutLineButton>
              </>
            )}
            <button
              className="md:hidden p-2 text-gray-700 hover:text-black"
              onClick={toggleMenu}
              aria-label="Chuyển đổi menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d={
                    isMenuOpen
                      ? "M6 18L18 6M6 6l12 12"
                      : "M4 6h16M4 12h16M4 18h16"
                  }
                />
              </svg>
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="md:hidden bg-white border-b border-gray-200 overflow-hidden"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <div className="flex flex-col px-4 py-2 space-y-2">
                {isTutor(user) ? (
                  <Link
                    to="/tutor-management"
                    className="text-gray-700 hover:text-black text-sm py-2"
                    onClick={toggleMenu}
                  >
                    Quản lí dạy học
                  </Link>
                ) : (
                  <Link
                    to="/become-tutor"
                    className="text-gray-700 hover:text-black text-sm py-2"
                    onClick={toggleMenu}
                  >
                    Trở thành gia sư
                  </Link>
                )}
                <Link
                  to="/languages"
                  className="text-gray-700 hover:text-black text-sm py-2"
                  onClick={toggleMenu}
                >
                  Ngôn ngữ
                </Link>
                <Link
                  to="/how-it-works"
                  className="text-gray-700 hover:text-black text-sm py-2"
                  onClick={toggleMenu}
                >
                  Cách hoạt động
                </Link>
                <Link
                  to="/pricing"
                  className="text-gray-700 hover:text-black text-sm py-2"
                  onClick={toggleMenu}
                >
                  Giá cả
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
}

export default Header;
