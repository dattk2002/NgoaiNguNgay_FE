import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaCalendarAlt,
  FaLightbulb,
  FaPaperclip,
  FaArrowCircleUp,
  FaArrowLeft,
  FaEllipsisV,
  FaEdit,
  FaTrash,
  FaChevronDown,
} from "react-icons/fa";
import { fetchChatConversationsByUserId } from "../components/api/auth";
import { fetchConversationList } from "../components/api/auth";
import { fetchTutorById } from "../components/api/auth";
import Tooltip from "@mui/material/Tooltip";
import { HubConnectionBuilder, HubConnectionState } from "@microsoft/signalr";
import { getAccessToken } from "../components/api/auth";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { FaUser, FaBan, FaFlag, FaTimes } from "react-icons/fa";

const MessagePage = ({ user }) => {
  const { id: tutorId } = useParams();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSelectingConversation, setIsSelectingConversation] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [messagesPerPage] = useState(20);
  const [hubConnection, setHubConnection] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingMessageText, setEditingMessageText] = useState("");
  const [hoveredMessageId, setHoveredMessageId] = useState(null);
  const [showMessageMenu, setShowMessageMenu] = useState(null);
  const [showConvMenu, setShowConvMenu] = useState(null);
  const [connectionBadge, setConnectionBadge] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);

  const handleTutorMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleTutorMenuClose = () => {
    setAnchorEl(null);
  };

  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const accessToken = getAccessToken();

  // Add useEffect to handle clicking outside the message menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMessageMenu && !event.target.closest(".message-menu-container")) {
        setShowMessageMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMessageMenu]);

  const refetchConversationData = async () => {
    try {
      // Refetch conversations list
      const updatedConversationsList = await fetchChatConversationsByUserId(
        user.id
      );
      if (updatedConversationsList && Array.isArray(updatedConversationsList)) {
        const sortedConversations = [...updatedConversationsList].sort(
          (a, b) => b.actualTimestamp - a.actualTimestamp
        );
        setConversations(sortedConversations);
      }

      // If there's a selected conversation, refetch its messages
      if (selectedConversation?.id) {
        const updatedMessages = await fetchConversationList(
          selectedConversation.id,
          currentPage,
          messagesPerPage
        );
        if (updatedMessages && Array.isArray(updatedMessages)) {
          const sortedMessages = updatedMessages.sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          setMessages(sortedMessages);
        }
      }
    } catch (error) {
      console.error("Error refetching conversation data:", error);
    }
  };

  useEffect(() => {
    if (!user || !accessToken) {
      console.warn(
        "User or access token not available for SignalR connection."
      );
      return;
    }

    const newConnection = new HubConnectionBuilder()
      .withUrl("https://tutorbooking-dev-065fe6ad4a6a.herokuapp.com/chathub", {
        accessTokenFactory: () => accessToken,
      })
      .withAutomaticReconnect()
      .build();

    setHubConnection(newConnection);

    newConnection
      .start()
      .then(() => {
        console.log("SignalR Connected! Current state:", newConnection.state);

        // Add connection state logging
        newConnection.onreconnecting((error) => {
          console.log("SignalR Reconnecting:", error);
        });

        newConnection.onreconnected((connectionId) => {
          console.log("SignalR Reconnected. ConnectionId:", connectionId);
        });

        newConnection.onclose((error) => {
          console.log("SignalR Connection Closed:", error);
        });

        // Handle OnConnected event
        newConnection.on("OnConnected", async (message) => {
          console.log("Connected to ChatHub:", message);
          // Fetch messages when connected
          await refetchConversationData();
        });

        // Add a catch-all handler to see what methods are being called
        newConnection.on("*", (methodName, ...args) => {
          console.log("SignalR method called:", methodName, "with args:", args);
        });

        // Update ReceiveMessage handler
        newConnection.on("ReceiveMessage", async (statusCode) => {
          console.log("Message received from SignalR:", { statusCode });
          console.log("ReceiveMessage handler triggered with data:", statusCode);

          // Convert the received message to match your UI format
          const formattedMessage = {
            id: statusCode.id,
            sender: statusCode.userId,
            text: statusCode.textMessage,
            createdAt: statusCode.createdTime,
            senderAvatar:
              user.profileImageUrl || "https://picsum.photos/300/200?random=1",
          };

          // Update messages list immediately
          setMessages((prevMessages) => {
            if (prevMessages.some((msg) => msg.id === formattedMessage.id)) {
              return prevMessages;
            }
            return [...prevMessages, formattedMessage];
          });

          // Update the conversation's last message in real-time
          setConversations((prevConversations) => {
            return prevConversations.map((conv) => {
              // Check if this message belongs to this conversation
              if (conv.id === statusCode.chatConversationId) {
                const isCurrentConv = selectedConversation && conv.id === selectedConversation.id;
                return {
                  ...conv,
                  lastMessage: statusCode.textMessage,
                  timestamp: new Date(statusCode.createdTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                  actualTimestamp: new Date(statusCode.createdTime).getTime(),
                  unreadCount: isCurrentConv ? 0 : (conv.unreadCount || 0) + 1, // <--- This is correct!
                };
              }
              return conv;
            });
          });

          // Refetch conversation data
          await refetchConversationData();
          if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "auto" });
          }
        });

        // Update SendMessageResult handler
        newConnection.on("SendMessageResult", async (statusCode, message) => {
          console.log("SendMessageResult received:", { statusCode, message });

          if (statusCode === 200) {
            // Message was sent successfully
            const formattedMessage = {
              id: message.id,
              sender: message.userId,
              text: message.textMessage,
              createdAt: message.createdTime,
              senderAvatar:
                user.profilePictureUrl ||
                "https://via.placeholder.com/30?text=Bạn",
            };

            // Update messages list
            setMessages((prevMessages) => {
              if (prevMessages.some((msg) => msg.id === formattedMessage.id)) {
                return prevMessages;
              }
              return [...prevMessages, formattedMessage];
            });

            // Update the conversation's last message in real-time
            setConversations((prevConversations) => {
              return prevConversations.map((conv) => {
                if (
                  conv.participantId === message.userId ||
                  conv.participantId === user.id
                ) {
                  return {
                    ...conv,
                    lastMessage: message.textMessage,
                    timestamp: new Date(message.createdTime).toLocaleTimeString(
                      [],
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    ),
                    actualTimestamp: new Date(message.createdTime).getTime(),
                  };
                }
                return conv;
              });
            });

            // Refetch conversation data
            await refetchConversationData();
            if (messagesEndRef.current) {
              messagesEndRef.current.scrollIntoView({ behavior: "auto" });
            }
          } else {
            console.error("Failed to send message:", statusCode, message);
            setError("Không thể gửi tin nhắn. Vui lòng thử lại.");
          }
        });

        // Add UpdateMessageResult handler
        newConnection.on("UpdateMessageResult", async (statusCode, message) => {
          console.log("UpdateMessageResult received:", { statusCode, message });

          if (statusCode === 200) {
            // Message was updated successfully
            const formattedMessage = {
              id: message.id,
              sender: message.userId,
              text: message.textMessage,
              createdAt: message.createdTime,
              senderAvatar:
                user.profilePictureUrl ||
                "https://via.placeholder.com/30?text=Bạn",
            };

            // Update messages list
            setMessages((prevMessages) => {
              return prevMessages.map((msg) => {
                if (msg.id === formattedMessage.id) {
                  return formattedMessage;
                }
                return msg;
              });
            });

            // Update the conversation's last message if this was the last message
            setConversations((prevConversations) => {
              return prevConversations.map((conv) => {
                if (conv.id === message.chatConversationId) {
                  const lastMessage = messages[messages.length - 1];
                  if (lastMessage && lastMessage.id === message.id) {
                    return {
                      ...conv,
                      lastMessage: message.textMessage,
                      timestamp: new Date(
                        message.createdTime
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      }),
                      actualTimestamp: new Date(message.createdTime).getTime(),
                    };
                  }
                }
                return conv;
              });
            });

            // Clear editing state
            setEditingMessageId(null);
            setEditingMessageText("");
            setShowMessageMenu(null);

            // Refetch conversation data
            await refetchConversationData();
          } else {
            console.error("Failed to update message:", statusCode, message);
            setError("Không thể cập nhật tin nhắn. Vui lòng thử lại.");
          }
        });

        // Add DeleteMessageResult handler
        newConnection.on("DeleteMessageResult", async (statusCode, message) => {
          console.log("DeleteMessageResult received:", { statusCode, message });

          if (statusCode === 200) {
            // Mark the message as deleted in the UI
            setMessages((prevMessages) =>
              prevMessages.map((msg) =>
                msg.id === message.id
                  ? { ...msg, isDeleted: true }
                  : msg
              )
            );
            // Optionally, update conversations as well if needed
            // await refetchConversationData(); // You can keep this if you want to refresh everything
          } else {
            console.error("Failed to delete message:", statusCode, message);
            setError(message || "Không thể xóa tin nhắn. Vui lòng thử lại.");
          }
        });

        // Add OnMessageDeleted handler for real-time updates
        newConnection.on("OnMessageDeleted", async (response) => {
          console.log("OnMessageDeleted received:", response);
          const { messageId } = response;

          setMessages((prevMessages) =>
            prevMessages.map((msg) => {
              if (msg.id === messageId) {
                return {
                  ...msg,
                  isDeleted: true,
                };
              }
              return msg;
            })
          );
          await refetchConversationData();
        });

        // Add OnMessageUpdated handler for real-time updates
        newConnection.on("OnMessageUpdated", async (message) => {
          console.log("OnMessageUpdated received:", message);

          const formattedMessage = {
            id: message.id,
            sender: message.userId,
            text: message.textMessage,
            createdAt: message.createdTime,
            senderAvatar:
              user.profileImageUrl || "https://picsum.photos/300/200?random=1",
          };

          // Update messages list
          setMessages((prevMessages) => {
            return prevMessages.map((msg) => {
              if (msg.id === formattedMessage.id) {
                return formattedMessage;
              }
              return msg;
            });
          });

          // Update conversation if this was the last message
          setConversations((prevConversations) => {
            return prevConversations.map((conv) => {
              if (conv.id === message.chatConversationId) {
                const lastMessage = messages[messages.length - 1];
                if (lastMessage && lastMessage.id === message.id) {
                  return {
                    ...conv,
                    lastMessage: message.textMessage,
                    timestamp: new Date(message.createdTime).toLocaleTimeString(
                      [],
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    ),
                    actualTimestamp: new Date(message.createdTime).getTime(),
                  };
                }
              }
              return conv;
            });
          });
        });

        // Add MarkAsReadResult handler
        newConnection.on("MarkAsReadResult", (statusCode, message) => {
          console.log("MarkAsReadResult:", statusCode, message);
          // Optionally show a toast or update UI
        });

        // Add OnMessageRead handler
        newConnection.on("OnMessageRead", (messageId) => {
          console.log("OnMessageRead:", messageId);
          // Optionally update message state to mark as read
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === messageId ? { ...msg, isRead: true } : msg
            )
          );
        });
      })
      .catch((err) => console.error("SignalR Connection Error: ", err));

    return () => {
      if (newConnection) {
        newConnection
          .stop()
          .then(() => console.log("SignalR Disconnected."))
          .catch((err) => console.error("SignalR Disconnection Error: ", err));
      }
    };
  }, [user, selectedConversation, currentPage, messagesPerPage]);

  useEffect(() => {
    const loadConversations = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!user) {
          setError("User not logged in or user ID not available.");
          setLoading(false);
          return;
        }

        const fetchedConversations = await fetchChatConversationsByUserId(
          user.id
        );

        let allConversations = [...fetchedConversations];
        let conversationToSelect = null;

        const tempConvStr = sessionStorage.getItem("currentTempConversation");
        let tempConversation = null;
        if (tempConvStr) {
          tempConversation = JSON.parse(tempConvStr);
        }

        if (tutorId) {
          const foundExistingConv = allConversations.find(
            (conv) => conv.participantId === tutorId && conv.type === "tutor"
          );

          if (foundExistingConv) {
            conversationToSelect = foundExistingConv;
            sessionStorage.removeItem("currentTempConversation");
          } else {
            console.log(
              "Creating temporary conversation for tutorId:",
              tutorId
            );
            try {
              const tutorDetails = await fetchTutorById(tutorId);
              const now = new Date();
              const formattedTime = now.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });

              const tempConversation = {
                id: `temp-${tutorId}`,
                participantId: tutorId,
                participantName:
                  tutorDetails.fullName ||
                  tutorDetails.nickName ||
                  "Gia sư mới",
                participantAvatar:
                  tutorDetails.profileImageUrl ||
                  "https://picsum.photos/300/200?random=1",
                lastMessage: "Bắt đầu cuộc trò chuyện",
                timestamp: formattedTime,
                actualTimestamp: now.getTime(),
                unreadCount: 0,
                type: "tutor",
                messages: [],
              };
              conversationToSelect = tempConversation;
              
              // Set connection badge for new conversation
              setConnectionBadge({
                text: `Bạn và ${
                  tutorDetails.fullName || tutorDetails.nickName || "gia sư"
                } vừa được kết nối trên NgoaiNguNgay`,
                tutorName: tutorDetails.fullName || tutorDetails.nickName || "gia sư"
              });
              
              sessionStorage.setItem(
                "currentTempConversation",
                JSON.stringify(tempConversation)
              );
            } catch (tutorError) {
              console.error(
                "Failed to fetch tutor details for temporary chat:",
                tutorError
              );
            }
          }
        } else {
          const storedTempTutorId =
            sessionStorage.getItem("currentTempTutorId");
          if (storedTempTutorId) {
            console.log(
              "Clearing previous temporary chat flag as no tutorId in URL."
            );
            sessionStorage.removeItem("currentTempTutorId");
          }

          if (allConversations.length > 0) {
            const sortedAvailableConversations = allConversations.sort(
              (a, b) => b.actualTimestamp - a.actualTimestamp
            );
            conversationToSelect = sortedAvailableConversations[0];
          }
        }

        const finalSortedConversations = allConversations.sort((a, b) => {
          return b.actualTimestamp - a.actualTimestamp;
        });

        setConversations(finalSortedConversations);

        if (conversationToSelect) {
          setIsSelectingConversation(true);
          setSelectedConversation(conversationToSelect);
        } else {
          setSelectedConversation(null);
        }
      } catch (err) {
        console.error("Failed to load conversations:", err);
        setError(err.message || "Không thể tải cuộc trò chuyện.");
      } finally {
        setLoading(false);
        setIsSelectingConversation(false);
      }
    };

    loadConversations();
  }, [tutorId, user]);

  useEffect(() => {
    const loadMessagesForSelectedConversation = async () => {
      if (selectedConversation) {
        if (
          selectedConversation.type === "tutor" &&
          !selectedConversation.id.startsWith("temp-")
        ) {
          try {
            const fetchedMessages = await fetchConversationList(
              selectedConversation.id,
              currentPage,
              messagesPerPage
            );
            if (fetchedMessages && Array.isArray(fetchedMessages)) {
              const sortedMessages = fetchedMessages.sort(
                (a, b) =>
                  new Date(a.createdAt).getTime() -
                  new Date(b.createdAt).getTime()
              );
              setMessages(sortedMessages);
            } else {
              console.warn(
                "API response for messages is not in expected format or messages array is missing:",
                fetchedMessages
              );
              setMessages([]);
            }
          } catch (err) {
            console.error(
              "Failed to load messages for selected conversation:",
              err
            );
            setError(err.message || "Không thể tải tin nhắn.");
          }
        } else if (selectedConversation.id.startsWith("temp-")) {
          const sortedMessages = (selectedConversation.messages || []).sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          setMessages(sortedMessages);
        }
      }
    };

    loadMessagesForSelectedConversation();
  }, [selectedConversation, currentPage, messagesPerPage]);

  useEffect(() => {
    if (selectedConversation && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "auto" });
    }
  }, [selectedConversation]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (
      !newMessage.trim() ||
      !selectedConversation ||
      !user ||
      !hubConnection ||
      hubConnection.state !== HubConnectionState.Connected
    ) {
      return;
    }

    const messagePayload = {
      senderId: user.id,
      recipientId: selectedConversation.participantId,
      text: newMessage,
      id: `temp-${Date.now()}`,
      createdAt: new Date().toISOString(),
      senderAvatar: user.profilePictureUrl || "https://via.placeholder.com/30?text=Bạn",
    };

    // Optimistically add message to UI
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        ...messagePayload,
        sender: user.id,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
    setNewMessage("");
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "auto" });
    }

    try {
      await hubConnection.invoke("SendMessage", {
        senderUserId: messagePayload.senderId,
        receiverUserId: messagePayload.recipientId,
        textMessage: messagePayload.text,
      });

      // Optionally, refetch in the background (do not set loading)
      // refetchConversationData(); // Remove or run in background if needed
    } catch (apiError) {
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg.id !== messagePayload.id)
      );
    }
  };

  const handleSelectConversation = (conversation) => {
    console.log("Selected conversation:", conversation);
    setIsSelectingConversation(true);
    setSelectedConversation(conversation);
    setNewMessage("");
    setCurrentPage(1);
    setMessages([]);
    setIsSelectingConversation(false);
    
    // Clear connection badge when selecting a different conversation
    if (!conversation.id.startsWith("temp-")) {
      setConnectionBadge(null);
    }

    // Find unread message IDs (for example, all messages not sent by the user and not marked as read)
    const unreadMessageIds = (conversation.messages || [])
      .filter(
        (msg) =>
          msg.sender !== user.id &&
          !msg.isRead // or whatever property indicates read status
      )
      .map((msg) => msg.id);

    if (unreadMessageIds.length > 0) {
      handleMarkAsRead(unreadMessageIds, conversation.participantId);
    }

    if (conversation.type === "tutor" && !conversation.id.startsWith("temp-")) {
      console.log(
        "Selected an existing real tutor conversation, clearing temp chat flag."
      );
      sessionStorage.removeItem("currentTempTutorId");
    } else if (
      conversation.type === "tutor" &&
      conversation.id.startsWith("temp-")
    ) {
      console.log(
        "Selected a temporary tutor conversation, setting temp chat flag."
      );
      sessionStorage.setItem("currentTempTutorId", conversation.participantId);
    }

    setConversations((prevConversations) =>
      prevConversations.map((conv) =>
        conv.id === conversation.id ? { ...conv, unreadCount: 0 } : conv
      )
    );
  };

  function formatMessageTimestamp(date) {
    const now = new Date();
    const messageDate = new Date(date);

    const isToday = now.toDateString() === messageDate.toDateString();

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = yesterday.toDateString() === messageDate.toDateString();

    const daysAgo = Math.floor((now - messageDate) / (1000 * 60 * 60 * 24));

    if (isToday) {
      return messageDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } else if (isYesterday) {
      return (
        "Yesterday " +
        messageDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      );
    } else if (daysAgo < 7) {
      return (
        messageDate.toLocaleDateString([], {
          weekday: "long",
        }) +
        " " +
        messageDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      );
    } else {
      return messageDate.toLocaleDateString([], {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }
  }

  const handleUpdateMessage = async (e) => {
    e.preventDefault();
    if (
      !editingMessageText.trim() ||
      !editingMessageId ||
      !selectedConversation ||
      !user ||
      !hubConnection ||
      hubConnection.state !== HubConnectionState.Connected
    ) {
      console.warn(
        "Attempted to update message while SignalR connection is not connected. Current state:",
        hubConnection?.state
      );
      return;
    }

    try {
      // Find the message to update
      const messageToUpdate = messages.find(
        (msg) => msg.id === editingMessageId
      );
      if (!messageToUpdate) {
        setError("Không tìm thấy tin nhắn cần cập nhật.");
        return;
      }

      console.log("Updating message with payload:", {
        id: editingMessageId,
        receiverUserId: selectedConversation.participantId,
        textMessage: editingMessageText,
      });

      // Send update message via SignalR
      await hubConnection.invoke("UpdateMessage", {
        id: editingMessageId,
        receiverUserId: selectedConversation.participantId,
        textMessage: editingMessageText,
      });

      // Clear editing state
      setEditingMessageId(null);
      setEditingMessageText("");
      setShowMessageMenu(null);
      setNewMessage("");
    } catch (apiError) {
      console.error("Failed to update message via SignalR:", apiError);
      setError("Không thể cập nhật tin nhắn. Vui lòng thử lại.");
    }
  };

  const handleEditMessage = (message) => {
    setEditingMessageId(message.id);
    setEditingMessageText(message.text);
    setShowMessageMenu(null);
    // Focus on the input field
    setTimeout(() => {
      const input = document.querySelector(
        'input[placeholder="Chỉnh sửa tin nhắn..."]'
      );
      if (input) {
        input.focus();
      }
    }, 100);
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditingMessageText("");
    setShowMessageMenu(null);
    setNewMessage("");
  };

  const handleDeleteMessage = async (messageId) => {
    if (
      !messageId ||
      !selectedConversation ||
      !user ||
      !hubConnection ||
      hubConnection.state !== HubConnectionState.Connected
    ) {
      console.warn(
        "Attempted to delete message with conditions not met:",
        {
          messageId,
          selectedConversation: !!selectedConversation,
          user: !!user,
          hubConnectionState: hubConnection?.state,
        }
      );
      setError(
        "Không thể xóa tin nhắn lúc này. Vui lòng kiểm tra kết nối và thử lại."
      );
      return;
    }

    try {
      console.log("Attempting to delete message via SignalR:", {
        id: messageId,
        receiverUserId: selectedConversation.participantId,
      });

      await hubConnection.invoke("DeleteMessage", {
        id: messageId,
        receiverUserId: selectedConversation.participantId,
      });

      setShowMessageMenu(null);
    } catch (apiError) {
      console.error("Failed to invoke DeleteMessage on SignalR hub:", apiError);
      setError("Không thể gửi yêu cầu xóa tin nhắn. Vui lòng thử lại.");
    }
  };

  const handleMarkAsRead = async (messageIds, receiverUserId) => {
    if (
      !hubConnection ||
      hubConnection.state !== HubConnectionState.Connected ||
      !messageIds.length ||
      !receiverUserId
    ) {
      return;
    }
    try {
      // SignalR expects the first argument as an array of message IDs, and the second as receiverUserId
      await hubConnection.invoke("MarkAsRead", messageIds, receiverUserId);
    } catch (err) {
      console.error("Failed to mark messages as read:", err);
    }
  };

  const handleMarkAsUnread = (conversationId) => {
    setConversations((prevConversations) =>
      prevConversations.map((conv) =>
        conv.id === conversationId
          ? { ...conv, unreadCount: 1 }
          : conv
      )
    );
    setShowConvMenu(null);
  };

  if (loading)
    return (
      <div className="container mx-auto flex flex-col md:flex-row h-full md:h-[calc(100vh-8rem)] border border-gray-300 rounded-lg overflow-hidden shadow-lg max-w-6xl">
        {/* Skeleton for conversation list */}
        <div className="w-full md:w-80 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 h-full">
          <div className="p-4 border-b border-gray-200">
            <div className="h-10 bg-gray-200 rounded-full animate-pulse" />
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center p-3 border-b border-gray-100">
                <div className="w-10 h-10 bg-gray-200 rounded-full mr-3 animate-pulse" />
                <div className="flex-1 min-w-0">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" />
                  <div className="h-3 bg-gray-100 rounded w-1/2 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Skeleton for message area */}
        <div className="flex-1 flex flex-col bg-gray-50 h-full">
          <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200 shadow-sm">
            <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse" />
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                <div className="p-3 rounded-lg bg-gray-200 w-1/2 animate-pulse" />
              </div>
            ))}
          </div>
          <div className="p-4 bg-white border-t border-gray-200 flex items-center shadow-inner">
            <div className="h-10 bg-gray-200 rounded-full flex-1 animate-pulse" />
          </div>
        </div>
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center items-center h-[calc(100vh-8rem)] text-red-500">
        Lỗi: {error}
      </div>
    );
  if (!user)
    return (
      <div className="flex justify-center items-center h-[calc(100vh-8rem)] text-red-500">
        Vui lòng đăng nhập để xem tin nhắn của bạn.
      </div>
    );

  let lastMessageDate = null;

  return (
    <div className="container mx-auto flex flex-col md:flex-row h-full md:h-[calc(100vh-8rem)] border border-gray-300 rounded-lg overflow-hidden shadow-lg max-w-6xl ">
      <div
        className={`w-full md:w-80 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 h-full ${
          selectedConversation ? "hidden md:flex" : "flex"
        }`}
      >
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên"
              className="w-full pl-10 pr-4 py-2 rounded-full text-black bg-gray-100 border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {conversations.length > 0 ? (
            conversations.map((conv) => (
              <div
                key={conv.id}
                className={`flex items-center p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition ${
                  selectedConversation?.id === conv.id ? "bg-gray-100" : ""
                }`}
                onClick={() => {
                  // Prevent default navigation behavior
                  handleSelectConversation(conv);
                  // Update URL without page reload using history API
                  window.history.pushState(
                    {},
                    "",
                    `/message/${conv.participantId}`
                  );
                }}
              >
                {conv.type === "tutor" ? (
                  <img
                    src={
                      conv.participantAvatar ||
                      "https://avatar.iran.liara.run/public"
                    }
                    alt={conv.participantName}
                    className="w-10 h-10 rounded-full object-cover mr-3"
                  />
                ) : (
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 mr-3 text-lg">
                    {conv.icon || "💬"}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex gap-2 items-center">
                    {conv.type === "tutor" ? (
                      <div className="font-semibold text-gray-800 text-sm truncate">
                        {conv.participantName}
                      </div>
                    ) : (
                      <div className="font-semibold text-gray-800 text-sm truncate">
                        {conv.title}
                      </div>
                    )}

                    <div className="text-xs text-gray-500 flex-shrink-0 ml-2">
                      {conv.timestamp}
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="ml-2 w-2 h-2 bg-red-500 rounded-full inline-block"></span>
                    )}
                  </div>
                  <div
                    className={`text-sm truncate ${
                      conv.unreadCount > 0 ? "font-bold text-black" : "text-gray-600"
                    }`}
                  >
                    {conv.lastMessage || "Chưa có tin nhắn nào"}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 mt-4 text-sm">
              Không tìm thấy cuộc trò chuyện nào.
            </p>
          )}
        </div>
      </div>

      <div
        className={`flex-1 flex flex-col bg-gray-50 h-full ${
          selectedConversation ? "flẽx" : "hidden md:flex"
        }`}
      >
        <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center">
            {selectedConversation && (
              <button
                onClick={() => {
                  setSelectedConversation(null);
                  navigate(`/messages`);
                }}
                className="md:hidden mr-3 p-2 rounded-full hover:bg-gray-100"
                title="Quay lại cuộc trò chuyện"
              >
                <FaArrowLeft className="text-gray-600 text-lg" />
              </button>
            )}
            <div className="text-lg font-semibold text-gray-800">
              {selectedConversation?.type === "tutor" ? (
                <>
                  <button
                    onClick={handleTutorMenuClick}
                    className="text-lg font-semibold text-gray-800 flex items-center gap-2 focus:outline-none focus:ring-0"
                    style={{
                      background: "none",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                      fontWeight: 600,
                      outline: "none",
                      boxShadow: "none",
                    }}
                  >
                    {selectedConversation?.participantName}
                    <FaChevronDown className="text-gray-500 text-base" />
                  </button>
                  <Menu
                    anchorEl={anchorEl}
                    open={menuOpen}
                    onClose={handleTutorMenuClose}
                    PaperProps={{
                      elevation: 8,
                      sx: {
                        borderRadius: 3,
                        minWidth: 240,
                        boxShadow: "0 8px 32px rgba(60,60,60,0.18)",
                        mt: 1,
                        p: 1,
                        outline: "none",
                        "&:focus": {
                          outline: "none",
                        },
                      },
                    }}
                    slotProps={{
                      paper: {
                        sx: {
                          borderRadius: 3,
                          minWidth: 240,
                          boxShadow: "0 8px 32px rgba(60,60,60,0.18)",
                          mt: 1,
                          p: 1,
                          outline: "none",
                          "&:focus": {
                            outline: "none",
                          },
                        },
                      },
                      root: {
                        sx: {
                          outline: "none",
                          boxShadow: "none",
                          "&:focus": {
                            outline: "none",
                          },
                        },
                      },
                    }}
                    anchorOrigin={{
                      vertical: "bottom",
                      horizontal: "left",
                    }}
                    transformOrigin={{
                      vertical: "top",
                      horizontal: "left",
                    }}
                  >
                    <MenuItem
                      onClick={() => {
                        navigate(`/teacher/${selectedConversation.participantId}`);
                        handleTutorMenuClose();
                      }}
                      sx={{
                        fontWeight: 500,
                        fontSize: "1rem",
                        color: "#444",
                        py: 1.5,
                        px: 2.5,
                        borderRadius: 2,
                      }}
                    >
                      <FaUser className="mr-3 text-gray-500" /> Xem hồ sơ gia sư
                    </MenuItem>
                    <MenuItem
                      onClick={() => { /* handle block */ handleTutorMenuClose(); }}
                      sx={{
                        fontWeight: 500,
                        fontSize: "1rem",
                        color: "#444",
                        py: 1.5,
                        px: 2.5,
                        borderRadius: 2,
                      }}
                    >
                      <FaBan className="mr-3 text-gray-500" /> Chặn
                    </MenuItem>
                    <MenuItem
                      onClick={() => { /* handle report */ handleTutorMenuClose(); }}
                      sx={{
                        fontWeight: 500,
                        fontSize: "1rem",
                        color: "#444",
                        py: 1.5,
                        px: 2.5,
                        borderRadius: 2,
                      }}
                    >
                      <FaFlag className="mr-3 text-gray-500" /> Báo cáo
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <div className="text-lg font-semibold text-gray-800">
                  {selectedConversation?.title || "Chọn một cuộc trò chuyện"}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center">
            {selectedConversation?.type === "tutor" && (
              <div
                className="text-gray-600 cursor-pointer hover:text-blue-600 transition"
                title="Xem lịch"
              >
                <FaCalendarAlt />
              </div>
            )}
          </div>
        </div>

        {/* Connection Badge */}
        {connectionBadge && selectedConversation?.id.startsWith("temp-") && (
          <div className="flex justify-center py-3">
            <div className="text-[#333333] px-4 py-2 rounded-full text-sm font-medium shadow-sm">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                {connectionBadge.text}
              </span>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {!selectedConversation && (
            <div className="flex justify-center items-center h-full text-gray-500 text-center">
              <p>Vui lòng chọn một cuộc trò chuyện để xem tin nhắn.</p>
            </div>
          )}

          {selectedConversation &&
            messages.length === 0 &&
            !loading &&
            selectedConversation.type === "tutor" &&
            !selectedConversation.id.startsWith("temp-") && ( // <-- Only show for real tutor conversations
              <div className="flex justify-center items-center h-full text-gray-500 text-center">
                {messages[0]?.text ? (
                  <p>{messages[0].text}</p>
                ) : (
                  <svg
                    className="animate-spin h-8 w-8 text-[#333333]"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l2-2.647z"
                    ></path>
                  </svg>
                )}
              </div>
            )}

          {messages.map((message, index) => {
            const currentMessageDate = new Date(message.createdAt);
            let showTimestamp = false;

            if (index === 0) {
              showTimestamp = true;
            } else if (lastMessageDate) {
              const diffMinutes =
                (currentMessageDate.getTime() - lastMessageDate.getTime()) /
                (1000 * 60);
              if (diffMinutes > 1) {
                showTimestamp = true;
              }
            }

            lastMessageDate = currentMessageDate;

            const formattedTimestamp = formatMessageTimestamp(
              message.createdAt
            );

            return (
              <React.Fragment key={message.id}>
                {showTimestamp && (
                  <div className="flex justify-center my-4">
                    <span className="text-xs text-gray-500 px-3 py-1 rounded-full bg-gray-100">
                      {formattedTimestamp}
                    </span>
                  </div>
                )}
                {message.text === "Tin nhắn đã được thu hồi" ? (
                  <div
                    key={message.id}
                    className={`flex items-start gap-3 ${message.sender === user?.id ? "flex-row-reverse" : ""}`}
                  >
                    <img
                      src={
                        message.sender === user?.id
                          ? user?.profileImageUrl || "https://via.placeholder.com/30?text=Bạn"
                          : message.senderAvatar || "https://via.placeholder.com/30?text=?"
                      }
                      alt={
                        message.sender === user?.id
                          ? "Bạn"
                          : selectedConversation?.participantName || "Người tham gia"
                      }
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    />
                    <div
                      className={`p-3 italic border ${
                        message.sender === user?.id
                          ? "bg-transparent text-gray-700 border-gray-400 rounded-full"
                          : "bg-transparent text-gray-700 border-gray-400 rounded-full"
                      } max-w-[70%] break-words`}
                      style={{
                        fontStyle: "italic",
                        backgroundColor: "transparent",
                      }}
                    >
                      <p>Tin nhắn đã được thu hồi</p>
                    </div>
                  </div>
                ) : message.isDeleted ? (
                  <div
                    key={message.id}
                    className={`flex items-start gap-3 ${
                      message.sender === user?.id ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div
                      className={`p-3 rounded-lg border italic ${
                        message.sender === user?.id
                          ? "bg-[#00FF66] bg-opacity-80 text-black border-[#00FF66] rounded-br-none"
                          : "bg-gray-100 text-gray-500 border-gray-200 rounded-bl-none"
                      } max-w-[70%] break-words`}
                      style={{
                        fontStyle: "italic",
                        color: message.sender === user?.id ? "#222" : undefined,
                        backgroundColor: message.sender === user?.id ? "#00FF66" : undefined,
                        opacity: message.sender === user?.id ? 0.8 : undefined,
                      }}
                    >
                      <p>
                        {message.sender === user?.id
                          ? "Bạn đã thu hồi tin nhắn này"
                          : "Tin nhắn đã được thu hồi"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div
                    key={message.id}
                    className={`flex items-start gap-3 ${
                      message.sender === user?.id ? "flex-row-reverse" : ""
                    }`}
                    onMouseEnter={() => setHoveredMessageId(message.id)}
                    onMouseLeave={() => setHoveredMessageId(null)}
                  >
                    <img
                      src={
                        message.sender === user?.id
                          ? user?.profileImageUrl ||
                            "https://via.placeholder.com/30?text=Bạn"
                          : message.senderAvatar ||
                            "https://via.placeholder.com/30?text=?"
                      }
                      alt={
                        message.sender === user?.id
                          ? "Bạn"
                          : selectedConversation?.participantName ||
                            "Người tham gia"
                      }
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    />

                    <Tooltip
                      title={formattedTimestamp}
                      placement={message.sender === user?.id ? "left" : "right"}
                    >
                      <div
                        className={`p-3 rounded-lg ${
                          message.sender === user?.id
                            ? "bg-[#333333] text-white rounded-br-none"
                            : "bg-gray-200 text-gray-800 rounded-bl-none"
                        } max-w-[70%] break-words shadow`}
                      >
                        {(message.text || "").split("\n").map((line, index) => (
                          <p key={index}>{line}</p>
                        ))}
                        <div
                          className={`text-xs mt-1 ${
                            message.sender === user?.id
                              ? "text-blue-200 text-right"
                              : "text-gray-500 text-left"
                          }`}
                        ></div>
                      </div>
                    </Tooltip>

                    {/* Message Actions Menu - Only show for user's own messages */}
                    {message.sender === user?.id &&
                      hoveredMessageId === message.id && (
                        <div className="relative message-menu-container self-center">
                          <div
                            onClick={() =>
                              setShowMessageMenu(
                                showMessageMenu === message.id
                                  ? null
                                  : message.id
                              )
                            }
                            className="p-1 rounded-full cursor-pointer"
                            title="Tùy chọn tin nhắn"
                          >
                            <FaEllipsisV className="text-gray-500 text-sm" />
                          </div>

                          {showMessageMenu === message.id && (
                            <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                              <button
                                onClick={() => handleEditMessage(message)}
                                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                              >
                                Chỉnh sửa
                              </button>
                              <button
                                onClick={() => handleDeleteMessage(message.id)}
                                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
                              >
                                Xóa
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                  </div>
                )}
              </React.Fragment>
            );
          })}

          <div ref={messagesEndRef} />
        </div>

        {selectedConversation && (
          <form
            onSubmit={
              editingMessageId ? handleUpdateMessage : handleSendMessage
            }
            className="p-4 bg-white border-t border-gray-200 flex items-center shadow-inner"
          >
            {editingMessageId && (
              <div className="mr-3 px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                Đang chỉnh sửa tin nhắn
              </div>
            )}

            <FaPaperclip
              className="text-gray-500 text-lg mr-3 cursor-pointer"
              title="Đính kèm"
            />
            <FaLightbulb
              className="text-gray-500 text-lg mr-3 cursor-pointer"
              title="Gợi ý"
            />

            <input
              type="text"
              value={editingMessageId ? editingMessageText : newMessage}
              onChange={(e) =>
                editingMessageId
                  ? setEditingMessageText(e.target.value)
                  : setNewMessage(e.target.value)
              }
              placeholder={
                editingMessageId
                  ? "Chỉnh sửa tin nhắn..."
                  : "Nhập tin nhắn của bạn..."
              }
              className="flex-1 p-3 rounded-full bg-gray-100 border border-gray-300 focus:outline-none focus:ring-[#333333] focus:border-[#333333] text-sm text-black mr-3 shadow-sm"
            />

            {editingMessageId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="mr-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Hủy
              </button>
            )}

            <button
              type="submit"
              className={`rounded-full h-full w-10 md:w-[7%] flex items-center justify-center transition-colors duration-200 ${
                (
                  editingMessageId
                    ? editingMessageText.trim()
                    : newMessage.trim()
                )
                  ? "bg-[#333333] text-white hover:bg-[#5d5d5d]"
                  : `bg-[#333333] text-white opacity-50 cursor-not-allowed`
              }`}
              disabled={
                editingMessageId
                  ? !editingMessageText.trim()
                  : !newMessage.trim()
              }
            >
              <FaArrowCircleUp className="text-lg text-white" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default MessagePage;
