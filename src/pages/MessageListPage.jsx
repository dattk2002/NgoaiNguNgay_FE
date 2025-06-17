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
} from "react-icons/fa";
import { fetchChatConversationsByUserId } from "../components/api/auth";
import { fetchConversationList } from "../components/api/auth";
import { fetchTutorById } from "../components/api/auth";
import Tooltip from "@mui/material/Tooltip";
import { HubConnectionBuilder, HubConnectionState } from "@microsoft/signalr";
import { getAccessToken } from "../components/api/auth";

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

  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const accessToken = getAccessToken();

  const refetchConversationData = async () => {
    try {
      // Refetch conversations list
      const updatedConversationsList = await fetchChatConversationsByUserId(user.id);
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
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
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
      console.warn("User or access token not available for SignalR connection.");
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

        // Handle OnConnected event
        newConnection.on("OnConnected", async (message) => {
          console.log("Connected to ChatHub:", message);
          // Fetch messages when connected
          await refetchConversationData();
        });

        // Update ReceiveMessage handler
        newConnection.on("ReceiveMessage", async (statusCode) => {
          console.log("Message received from SignalR:", { statusCode });

          // Convert the received message to match your UI format
          const formattedMessage = {
            id: statusCode.id,
            sender: statusCode.userId,
            text: statusCode.textMessage,
            createdAt: statusCode.createdTime,
            senderAvatar: user.profileImageUrl || "https://picsum.photos/300/200?random=1",
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
                return {
                  ...conv,
                  lastMessage: statusCode.textMessage,
                  timestamp: new Date(statusCode.createdTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                  actualTimestamp: new Date(statusCode.createdTime).getTime(),
                };
              }
              return conv;
            });
          });

          // Refetch conversation data
          await refetchConversationData();
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
              senderAvatar: user.profilePictureUrl || "https://via.placeholder.com/30?text=Bạn",
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
                if (conv.participantId === message.userId || conv.participantId === user.id) {
                  return {
                    ...conv,
                    lastMessage: message.textMessage,
                    timestamp: new Date(message.createdTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    }),
                    actualTimestamp: new Date(message.createdTime).getTime(),
                  };
                }
                return conv;
              });
            });

            // Refetch conversation data
            await refetchConversationData();
          } else {
            console.error("Failed to send message:", statusCode, message);
            setError("Không thể gửi tin nhắn. Vui lòng thử lại.");
          }
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

        const fetchedConversations = await fetchChatConversationsByUserId(user.id);

        let allConversations = [...fetchedConversations];
        let conversationToSelect = null;

        if (tutorId) {
          const foundExistingConv = allConversations.find(
            (conv) => conv.participantId === tutorId && conv.type === "tutor"
          );

          if (foundExistingConv) {
            conversationToSelect = foundExistingConv;
            sessionStorage.removeItem("currentTempTutorId");
            console.log(
              "Selected existing conversation via URL tutorId:",
              tutorId
            );
          } else {
            console.log(
              "Creating temporary conversation for tutorId:",
              tutorId
            );
            try {
              const tutorDetails = await fetchTutorById(tutorId);
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
                lastMessage: "Bắt đầu cuộc trò chuyện mới!",
                timestamp: "Vừa xong",
                actualTimestamp: Date.now(),
                unreadCount: 0,
                type: "tutor",
                messages: [],
              };
              allConversations = [tempConversation, ...fetchedConversations];
              conversationToSelect = tempConversation;
              sessionStorage.setItem("currentTempTutorId", tutorId);
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
    if (messagesEndRef.current && !isSelectingConversation) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isSelectingConversation]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (
      !newMessage.trim() ||
      !selectedConversation ||
      !user ||
      !hubConnection ||
      hubConnection.state !== HubConnectionState.Connected
    ) {
      console.warn(
        "Attempted to send message while SignalR connection is not connected. Current state:",
        hubConnection?.state
      );
      return;
    }

    const messagePayload = {
      senderId: user.id,
      recipientId: selectedConversation.participantId,
      text: newMessage,
      id: `temp-${Date.now()}`,
      createdAt: new Date().toISOString(),
      senderAvatar:
        user.profilePictureUrl || "https://via.placeholder.com/30?text=Bạn",
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

    try {
      // Log the message payload
      console.log("Sending message with payload:", {
        senderUserId: messagePayload.senderId,
        receiverUserId: messagePayload.recipientId,
        textMessage: messagePayload.text,
        fullMessagePayload: messagePayload,
      });

      // Send message via SignalR with the correct format
      await hubConnection.invoke("SendMessage", {
        senderUserId: messagePayload.senderId,
        receiverUserId: messagePayload.recipientId,
        textMessage: messagePayload.text,
      });

      // Refetch conversation data
      await refetchConversationData();

    } catch (apiError) {
      console.error("Failed to send message via SignalR or API:", apiError);
      setError("Không thể gửi tin nhắn. Vui lòng thử lại.");
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
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
        Đang tải cuộc trò chuyện...
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
                  <div className="flex justify-between items-center">
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
                  </div>
                  <div className="text-sm text-gray-600 truncate">
                    {conv.messages && conv.messages.length > 0 
                      ? conv.messages[conv.messages.length - 1].text 
                      : conv.lastMessage || "Chưa có tin nhắn nào"}
                  </div>
                </div>
                {conv.unreadCount > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0">
                    {conv.unreadCount}
                  </span>
                )}
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
              {selectedConversation?.participantName ||
                selectedConversation?.title ||
                "Chọn một cuộc trò chuyện"}
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

        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {!selectedConversation && (
            <div className="flex justify-center items-center h-full text-gray-500 text-center">
              <p>Vui lòng chọn một cuộc trò chuyện để xem tin nhắn.</p>
            </div>
          )}

          {selectedConversation &&
            messages.length === 0 &&
            !loading &&
            selectedConversation.type === "tutor" && (
              <div className="flex justify-center items-center h-full">
                <div className="w-8 h-8 border-4 border-[#333333] border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

          {messages.map((message, index) => {
            const currentMessageDate = new Date(message.createdAt);
            let showTimestamp = false;

            if (lastMessageDate) {
              const diffMinutes =
                (currentMessageDate.getTime() - lastMessageDate.getTime()) /
                (1000 * 60);
              if (diffMinutes > 1) {
                showTimestamp = true;
              }
            }

            lastMessageDate = currentMessageDate;

            const formattedTimestamp = currentMessageDate.toLocaleString(
              "en-US",
              {
                weekday: "short",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              }
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
                {message.sender === "system" ? (
                  <div
                    key={message.id}
                    className="flex items-center justify-center"
                  >
                    <Tooltip title={formattedTimestamp} placement="left">
                      <div className="p-3 rounded-lg bg-gray-200 text-gray-800 max-w-md text-sm break-words text-center">
                        <p>{message.text}</p>
                      </div>
                    </Tooltip>
                  </div>
                ) : (
                  <div
                    key={message.id}
                    className={`flex items-start gap-3 ${
                      message.sender === user?.id ? "flex-row-reverse" : ""
                    }`}
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
                        {/* {message.sender !== user?.id &&
                          selectedConversation?.type === "tutor" && (
                            <div className="font-semibold text-xs mb-1">
                              {selectedConversation.participantName}
                            </div>
                          )} */}
                        {message.text.split("\n").map((line, index) => (
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
                  </div>
                )}
              </React.Fragment>
            );
          })}

          <div ref={messagesEndRef} />

          {/* {selectedConversation &&
            messages.length > 0 &&
            selectedConversation.type === "tutor" && (
              <div className="text-center text-sm text-gray-500 mt-4">
                Lịch sử tin nhắn được giới hạn trong 6 tháng gần nhất.
              </div>
            )} */}
        </div>

        {selectedConversation && (
          <form
            onSubmit={handleSendMessage}
            className="p-4 bg-white border-t border-gray-200 flex items-center shadow-inner"
          >
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
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Nhập tin nhắn của bạn..."
              className="flex-1 p-3 rounded-full bg-gray-100 border border-gray-300 focus:outline-none focus:ring-[#333333] focus:border-[#333333] text-sm text-black mr-3 shadow-sm"
            />
            <button
              type="submit"
              className={`rounded-full h-full w-10 md:w-[7%] flex items-center justify-center transition-colors duration-200 ${
                newMessage.trim()
                  ? "bg-[#333333] text-white hover:bg-[#5d5d5d]"
                  : `bg-[#333333] text-white opacity-50 cursor-not-allowed`
              }`}
              disabled={!newMessage.trim()}
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
