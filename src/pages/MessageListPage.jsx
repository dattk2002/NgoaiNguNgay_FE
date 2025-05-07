import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  FaSearch,
  FaCalendarAlt,
  FaLightbulb,
  FaPaperclip,
  FaArrowUp,
} from "react-icons/fa";
import { CgMoreVerticalO } from "react-icons/cg";
import { fetchTutors } from "../components/api/auth";

const MessagePage = ({ user }) => {
  const { id: tutorId } = useParams();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSelectingConversation, setIsSelectingConversation] = useState(false); // New state variable

  const messagesEndRef = useRef(null);

  useEffect(() => {
    const loadConversations = async () => {
      try {
        setLoading(true);
        setError(null);

        const tutorsData = await fetchTutors();

        const tutorConversations = tutorsData.map((tutor) => ({
          id: tutor.id,
          participantId: tutor.id,
          participantName: tutor.name,
          participantAvatar: tutor.imageUrl,
          lastMessage: tutor.description || "No messages yet",
          timestamp: "Recent",
          unreadCount: 0,
          type: "tutor",
        }));

        const systemConversations = [
          {
            id: "tips-promotions",
            participantName: "Tips & Promotions",
            title: "Tips & Promotions",
            lastMessage: "Haven't decided w...",
            timestamp: "Yesterday",
            unreadCount: 0,
            type: "system",
            icon: <FaLightbulb className="text-yellow-500" />,
          },
          {
            id: "service-notification",
            participantName: "Service Notification",
            title: "Service Notification",
            lastMessage: "We want to hear fro...",
            timestamp: "May 1",
            unreadCount: 0,
            type: "system",
            icon: "📣",
          },
          {
            id: "learning-tools",
            participantName: "Learning Tools",
            title: "Learning Tools",
            lastMessage: "Come and listen to o...",
            timestamp: "Apr 24",
            unreadCount: 0,
            type: "system",
            icon: "📚",
          },
          {
            id: "learning-plan",
            participantName: "Learning Plan",
            title: "Learning Plan",
            lastMessage: "Alert! AI Learning Pla...",
            timestamp: "Apr 12",
            unreadCount: 0,
            type: "system",
            icon: "📅",
          },
          {
            id: "account-notification",
            participantName: "Account Notification",
            title: "Account Notification",
            lastMessage: "Ready to try out som...",
            timestamp: "Apr 10",
            unreadCount: 0,
            type: "system",
            icon: "🔔",
          },
        ];

        const allConversations = [
          ...tutorConversations,
          ...systemConversations,
        ];
        if (!allConversations.find((c) => c.participantName === "Guy")) {
          allConversations.unshift({
            id: "guy",
            participantId: "guy",
            participantName: "Guy",
            participantAvatar: "https://randomuser.me/api/portraits/men/32.jpg",
            lastMessage: "Hi! I noticed that y...",
            timestamp: "Yesterday",
            unreadCount: 0,
            type: "tutor",
          });
        }

        if (
          !allConversations.find((c) => c.participantName === "KyongSup Song")
        ) {
          allConversations.unshift({
            id: "kyongsup-song",
            participantId: "kyongsup-song",
            participantName: "KyongSup Song",
            participantAvatar: "https://randomuser.me/api/portraits/men/40.jpg",
            lastMessage: "Thank you! I'm glad to...",
            timestamp: "11:14",
            unreadCount: 0,
            type: "tutor",
          });
        }

        const sortedConversations = allConversations.sort((a, b) => {
          if (a.participantName === "KyongSup Song") return -1;
          if (b.participantName === "KyongSup Song") return 1;
          if (a.participantName === "Guy") return -1;
          if (b.participantName === "Guy") return 1;
          return 0;
        });

        setConversations(sortedConversations);

        if (tutorId) {
          const conversationToSelect = sortedConversations.find(
            (conv) => conv.participantId === tutorId && conv.type === "tutor"
          );
          if (conversationToSelect) {
            // Set flag before selecting conversation
            setIsSelectingConversation(true);
            setSelectedConversation(conversationToSelect);
            if (conversationToSelect.participantName === "KyongSup Song") {
              setMessages([
                {
                  id: 1,
                  sender: "tutor",
                  text: "Nice to see you, I'm a Korean teacher, KyongSup.\nAre you interested in learning Korean?\nYou are in the right place.\nI was a Top 1% award teacher.\nOne of my strong points is that I have many long-term students for years.\nI'd like to give you a free lesson (50 minutes) after the trial lesson. We can talk about it in more detail in the trial lesson.\nI hope to see you in the trial.\n수업에서 뵙겠습니다. 😊",
                  timestamp: "11:14",
                  senderAvatar: conversationToSelect.participantAvatar,
                },
                {
                  id: 2,
                  sender: "user",
                  text: "Thank you! I'm glad to hear you, but now I'm not interested in Korean, maybe later I will, thanks for contacting with me. Have a great day!",
                  timestamp: "11:14",
                  senderAvatar:
                    user?.avatarUrl ||
                    "https://via.placeholder.com/30?text=You",
                },
              ]);
            } else if (conversationToSelect.participantName === "Guy") {
              setMessages([
                {
                  id: 1,
                  sender: "tutor",
                  text: "Hi! I noticed that y...",
                  timestamp: "Yesterday",
                  senderAvatar: conversationToSelect.participantAvatar,
                },
              ]);
            } else {
              const placeholderMessages = [
                {
                  id: 1,
                  sender: "tutor",
                  text: `Hello! I'm ${conversationToSelect.participantName}. How can I help you today?`,
                  timestamp: "Just now",
                  senderAvatar: conversationToSelect.participantAvatar,
                },
              ];
              setMessages(placeholderMessages);
            }
             // Reset flag after messages are set
             setIsSelectingConversation(false);
          } else {
            setError(
              `Tutor with ID ${tutorId} not found or is not a tutor conversation.`
            );
            if (sortedConversations.length > 0) {
                // Set flag before selecting conversation
                setIsSelectingConversation(true);
              setSelectedConversation(sortedConversations[0]);
              const firstConv = sortedConversations[0];
              let firstConvMessages = [];
              if (firstConv.type === "tutor") {
                firstConvMessages = [
                  {
                    id: 1,
                    sender: "tutor",
                    text: `Hello! I'm ${firstConv.participantName}. How can I help you today?`,
                    timestamp: "Just now",
                    senderAvatar: firstConv.participantAvatar,
                  },
                ];
              } else {
                firstConvMessages = [
                  {
                    id: 1,
                    sender: "system",
                    text: `Welcome to ${firstConv.title}. This is a system notification channel.`,
                    timestamp: "Just now",
                    senderAvatar: null,
                  },
                ];
              }
              setMessages(firstConvMessages);
               // Reset flag after messages are set
               setIsSelectingConversation(false);
            }
          }
        } else if (sortedConversations.length > 0) {
             // Set flag before selecting conversation
             setIsSelectingConversation(true);
          setSelectedConversation(sortedConversations[0]);
          const firstConv = sortedConversations[0];
          let firstConvMessages = [];
          if (firstConv.type === "tutor") {
            firstConvMessages = [
              {
                id: 1,
                sender: "tutor",
                text: `Hello! I'm ${firstConv.participantName}. How can I help you today?`,
                timestamp: "Just now",
                senderAvatar: firstConv.participantAvatar,
              },
            ];
          } else {
            firstConvMessages = [
              {
                id: 1,
                sender: "system",
                text: `Welcome to ${firstConv.title}. This is a system notification channel.`,
                timestamp: "Just now",
                senderAvatar: null,
              },
            ];
          }
          setMessages(firstConvMessages);
           // Reset flag after messages are set
           setIsSelectingConversation(false);
        }
      } catch (err) {
        console.error("Failed to load conversations:", err);
        setError(err.message || "Could not load conversations.");
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, [tutorId, user]);

  useEffect(() => {
    // Only scroll to bottom if we are NOT in the process of selecting a conversation
    if (messagesEndRef.current && !isSelectingConversation) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isSelectingConversation]); // Add isSelectingConversation to dependency array

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (
      newMessage.trim() &&
      selectedConversation &&
      user &&
      selectedConversation.type === "tutor"
    ) {
      console.log(
        "Sending message:",
        newMessage,
        "to conversation:",
        selectedConversation.id
      );
      const sentMessage = {
        id: messages.length + 1,
        sender: "user",
        text: newMessage,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        senderAvatar:
          user.avatarUrl || "https://via.placeholder.com/30?text=You",
      };
      // No need to set isSelectingConversation here, as sending a message
      // should trigger scrolling to the latest message.
      setMessages([...messages, sentMessage]);
      setNewMessage("");
    }
  };

  const handleSelectConversation = (conversation) => {
    console.log("Selected conversation:", conversation);
    // Set flag to prevent auto-scroll when updating messages
    setIsSelectingConversation(true);
    setSelectedConversation(conversation);
    setNewMessage("");

    let convMessages = [];
    if (conversation.type === "tutor") {
      if (conversation.participantName === "KyongSup Song") {
        convMessages = [
          {
            id: 1,
            sender: "tutor",
            text: "Nice to see you, I'm a Korean teacher, KyongSup.\nAre you interested in learning Korean?\nYou are in the right place.\nI was a Top 1% award teacher.\nOne of my strong points is that I have many long-term students for years.\nI'd like to give you a free lesson (50 minutes) after the trial lesson. We can talk about it in more detail in the trial lesson.\nI hope to see you in the trial.\n수업에서 뵙겠습니다. 😊",
            timestamp: "11:14",
            senderAvatar: conversation.participantAvatar,
          },
          {
            id: 2,
            sender: "user",
            text: "Thank you! I'm glad to hear you, but now I'm not interested in Korean, maybe later I will, thanks for contacting with me. Have a great day!",
            timestamp: "11:14",
            senderAvatar:
              user?.avatarUrl || "https://via.placeholder.com/30?text=You",
          },
        ];
      } else if (conversation.participantName === "Guy") {
        convMessages = [
          {
            id: 1,
            sender: "tutor",
            text: "Hi! I noticed that you recently visited my profile, and I wanted to take a moment to reach out and introduce myself. My name is Guy, and I'm a professional English teacher from the UK. I would love to help you with your English. If you are still looking for a teacher, then I would be happy to do a trial lesson with you. This session will give you the opportunity to get to know my teaching style, discuss your objectives, and outline a personalized plan. Or you can send me a message if you prefer :) Best regards, Guy",
            timestamp: "Yesterday",
            senderAvatar: conversation.participantAvatar,
          },
        ];
      } else {
        convMessages = [
          {
            id: 1,
            sender: "tutor",
            text: `You are now chatting with ${conversation.participantName}. Say hello!`,
            timestamp: "Just now",
            senderAvatar:
              conversation.participantAvatar ||
              "https://via.placeholder.com/30?text=?",
          },
        ];
      }
    } else {
      convMessages = [
        {
          id: 1,
          sender: "system",
          text: `This is the ${conversation.title} channel. This is typically for notifications and information. Messaging is not available here.`,
          timestamp: "Just now",
          senderAvatar: null,
        },
        {
          id: 2,
          sender: "system",
          text: conversation.lastMessage,
          timestamp: conversation.timestamp,
          senderAvatar: null,
        },
      ];
    }

    setMessages(convMessages);
    // Reset flag after messages are set, allowing subsequent message additions to scroll
    setIsSelectingConversation(false);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        Loading conversations...
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        Error: {error}
      </div>
    );
  if (!user)
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        Please log in to view your messages.
      </div>
    );

  return (
    <div className="container mx-auto flex h-[calc(100vh-8rem)] border my-4 border-gray-300 rounded-lg overflow-hidden shadow-lg max-w-6xl">
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 h-full">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Search by name"
              className="w-full pl-10 pr-4 py-2 rounded-full text-black bg-gray-100 border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
        </div>

        {/* Optional: Add max-height: 480px (8 * 60px) if you want to enforce scrolling after 8 rows */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {conversations.length > 0 ? (
            conversations.map((conv) => (
              <div
                key={conv.id}
                className={`flex items-center p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition ${
                  selectedConversation?.id === conv.id ? "bg-gray-100" : ""
                }`}
                onClick={() => handleSelectConversation(conv)}
              >
                {conv.type === "tutor" ? (
                  <img
                    src={
                      conv.participantAvatar ||
                      "https://via.placeholder.com/40?text=Avatar"
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
                    {conv.lastMessage || "No messages yet"}
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
              No conversations found.
            </p>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-gray-50 h-full">
        <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200 shadow-sm">
          <div className="text-lg font-semibold text-gray-800">
            {selectedConversation?.participantName ||
              selectedConversation?.title ||
              "Select a Conversation"}
          </div>
          <div className="flex items-center">
            {selectedConversation?.type === "tutor" && (
              <div
                className="text-gray-600 cursor-pointer hover:text-blue-600 transition"
                title="View Calendar"
              >
                <FaCalendarAlt />
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {!selectedConversation && (
            <div className="flex justify-center items-center h-full text-gray-500 text-center">
              <p>Please select a conversation to view messages.</p>
            </div>
          )}

          {selectedConversation &&
            messages.length === 0 &&
            !loading &&
            selectedConversation.type === "tutor" && (
              <div className="flex justify-center items-center h-full text-gray-500 text-center">
                <p>No messages yet. Start a conversation!</p>
              </div>
            )}

          {selectedConversation &&
            messages.length === 0 &&
            !loading &&
            selectedConversation.type !== "tutor" && (
              <div className="flex justify-center items-center h-full text-gray-500 text-center">
                <p>
                  This is a notification channel. There are no interactive
                  messages here.
                </p>
              </div>
            )}

          {messages.map((message) =>
            message.sender === "system" ? (
              <div
                key={message.id}
                className="flex items-center justify-center"
              >
                <div className="p-3 rounded-lg bg-gray-200 text-gray-800 max-w-md text-sm break-words text-center">
                  <p>{message.text}</p>
                  <div className="text-xs mt-1 text-gray-500">
                    {message.timestamp}
                  </div>
                </div>
              </div>
            ) : (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${
                  message.sender === "user" ? "flex-row-reverse" : ""
                }`}
              >
                <img
                  src={
                    message.senderAvatar ||
                    (message.sender === "user"
                      ? user?.avatarUrl ||
                        "https://via.placeholder.com/30?text=You"
                      : selectedConversation?.participantAvatar ||
                        "https://via.placeholder.com/30?text=?")
                  }
                  alt={
                    message.sender === "user"
                      ? "You"
                      : selectedConversation?.participantName || "Participant"
                  }
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                />
                <div
                  className={`p-3 rounded-lg ${
                    message.sender === "user"
                      ? "bg-blue-500 text-white rounded-br-none"
                      : "bg-gray-200 text-gray-800 rounded-bl-none"
                  } max-w-[70%] break-words shadow`}
                >
                  {message.sender !== "user" &&
                    selectedConversation?.type === "tutor" && (
                      <div className="font-semibold text-xs mb-1">
                        {selectedConversation.participantName}
                      </div>
                    )}
                  {message.text.split("\n").map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
                  <div
                    className={`text-xs mt-1 ${
                      message.sender === "user"
                        ? "text-blue-200 text-right"
                        : "text-gray-500 text-left"
                    }`}
                  >
                    {message.timestamp}
                  </div>
                </div>
              </div>
            )
          )}

          <div ref={messagesEndRef} />

          {selectedConversation &&
            messages.length > 0 &&
            selectedConversation.type === "tutor" && (
              <div className="text-center text-sm text-gray-500 mt-4">
                Message history is limited to last 6 months.
              </div>
            )}
        </div>

        {selectedConversation && selectedConversation.type === "tutor" ? (
          <form
            onSubmit={handleSendMessage}
            className="p-4 bg-white border-t border-gray-200 flex items-center gap-3"
          >
            <FaLightbulb
              className="text-gray-500 w-5 h-5 cursor-pointer hover:text-yellow-600 transition"
              title="Suggestions"
            />
            <FaPaperclip
              className="text-gray-500 w-5 h-5 cursor-pointer hover:text-gray-600 transition"
              title="Attach File"
            />
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 rounded-lg text-gray-800 bg-gray-100 border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button
              type="submit"
              className="bg-blue-500 text-white rounded-full p-2 w-9 h-9 flex items-center justify-center hover:bg-blue-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              title="Send"
              disabled={!newMessage.trim()}
            >
              <FaArrowUp className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <div className="p-4 bg-white border-t border-gray-200 flex items-center justify-center text-gray-500 text-sm italic">
            Messaging is not available for this type of conversation.
          </div>
        )}

        <div className="text-center text-xs text-gray-400 py-2 bg-white border-t border-gray-100">
          © 2025 NgoaiNguNgay Limited.
        </div>
      </div>
    </div>
  );
};

export default MessagePage;