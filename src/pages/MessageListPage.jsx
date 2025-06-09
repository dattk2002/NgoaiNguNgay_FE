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
          lastMessage: tutor.description || "Chưa có tin nhắn nào",
          timestamp: "Gần đây",
          unreadCount: 0,
          type: "tutor",
        }));

        const systemConversations = [
          {
            id: "tips-promotions",
            participantName: "Mẹo & Khuyến mãi",
            title: "Mẹo & Khuyến mãi",
            lastMessage: "Chưa quyết định...",
            timestamp: "Hôm qua",
            unreadCount: 0,
            type: "system",
            icon: <FaLightbulb className="text-yellow-500" />,
          },
          {
            id: "service-notification",
            participantName: "Thông báo dịch vụ",
            title: "Thông báo dịch vụ",
            lastMessage: "Chúng tôi muốn nghe ý kiến từ...",
            timestamp: "Ngày 1 tháng 5",
            unreadCount: 0,
            type: "system",
            icon: "📣",
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
            lastMessage: "Chào bạn! Tôi nhận thấy bạn gần đây đã ghé thăm hồ sơ của tôi, và tôi muốn dành chút thời gian để liên hệ và giới thiệu bản thân. Tên tôi là Guy, và tôi là một giáo viên tiếng Anh chuyên nghiệp đến từ Vương quốc Anh. Tôi rất muốn giúp bạn với tiếng Anh của bạn. Nếu bạn vẫn đang tìm kiếm một giáo viên, thì tôi rất vui được thực hiện một buổi học thử với bạn. Buổi này sẽ cho bạn cơ hội làm quen với phong cách giảng dạy của tôi, thảo luận mục tiêu của bạn, và phác thảo một kế hoạch cá nhân hóa. Hoặc bạn có thể gửi tin nhắn cho tôi nếu bạn thích :) Trân trọng, Guy",
            timestamp: "Hôm qua",
            unreadCount: 0,
            type: "system",
            icon: <FaLightbulb className="text-yellow-500" />,
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
            lastMessage: "Cảm ơn bạn! Tôi rất vui khi nghe bạn nói vậy, nhưng hiện tại tôi không hứng thú với tiếng Hàn, có lẽ sau này tôi sẽ quan tâm, cảm ơn bạn đã liên hệ với tôi. Chúc bạn một ngày tốt lành!",
            timestamp: "11:14",
            unreadCount: 0,
            type: "system",
            icon: <FaLightbulb className="text-yellow-500" />,
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
                  text: "Rất vui được gặp bạn, tôi là giáo viên tiếng Hàn, KyongSup.\nBạn có hứng thú học tiếng Hàn không?\nBạn đang ở đúng nơi rồi.\nTôi muốn tặng bạn một buổi học miễn phí (50 phút) sau buổi học thử. Chúng ta có thể nói chi tiết hơn trong buổi học thử.\nTôi hy vọng sẽ gặp bạn trong buổi thử.\n수업에서 뵙겠습니다. 😊",
                  timestamp: "11:14",
                  senderAvatar: conversationToSelect.participantAvatar,
                },
              ]);
            } else if (conversationToSelect.participantName === "Guy") {
              setMessages([
                {
                  id: 1,
                  sender: "tutor",
                  text: "Chào bạn! Tôi nhận thấy bạn gần đây đã ghé thăm hồ sơ của tôi, và tôi muốn dành chút thời gian để liên hệ và giới thiệu bản thân. Tên tôi là Guy, và tôi là một giáo viên tiếng Anh chuyên nghiệp đến từ Vương quốc Anh. Tôi rất muốn giúp bạn với tiếng Anh của bạn. Nếu bạn vẫn đang tìm kiếm một giáo viên, thì tôi rất vui được thực hiện một buổi học thử với bạn. Buổi này sẽ cho bạn cơ hội làm quen với phong cách giảng dạy của tôi, thảo luận mục tiêu của bạn, và phác thảo một kế hoạch cá nhân hóa. Hoặc bạn có thể gửi tin nhắn cho tôi nếu bạn thích :) Trân trọng, Guy",
                  timestamp: "11:14",
                  senderAvatar: conversationToSelect.participantAvatar,
                },
              ]);
            }
          }
        } else if (sortedConversations.length > 0) {
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
                  text: "Rất vui được gặp bạn, tôi là giáo viên tiếng Hàn, KyongSup.\nBạn có hứng thú học tiếng Hàn không?\nBạn đang ở đúng nơi rồi.\nTôi muốn tặng bạn một buổi học miễn phí (50 phút) sau buổi học thử. Chúng ta có thể nói chi tiết hơn trong buổi học thử.\nTôi hy vọng sẽ gặp bạn trong buổi thử.\n수업에서 뵙겠습니다. 😊",
                  timestamp: "11:14",
                  senderAvatar: conversationToSelect.participantAvatar,
                },
              ]);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load conversations:", err);
        setError(err.message || "Không thể tải cuộc trò chuyện.");
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
          user.avatarUrl || "https://via.placeholder.com/30?text=Bạn",
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
            text: "Rất vui được gặp bạn, tôi là giáo viên tiếng Hàn, KyongSup.\nBạn có hứng thú học tiếng Hàn không?\nBạn đang ở đúng nơi rồi.\nTôi muốn tặng bạn một buổi học miễn phí (50 phút) sau buổi học thử. Chúng ta có thể nói chi tiết hơn trong buổi học thử.\nTôi hy vọng sẽ gặp bạn trong buổi thử.\n수업에서 뵙겠습니다. 😊",
            timestamp: "11:14",
            senderAvatar: conversation.participantAvatar,
          },
        ];
      } else if (conversation.participantName === "Guy") {
        convMessages = [
          {
            id: 1,
            sender: "tutor",
            text: "Chào bạn! Tôi nhận thấy bạn gần đây đã ghé thăm hồ sơ của tôi, và tôi muốn dành chút thời gian để liên hệ và giới thiệu bản thân. Tên tôi là Guy, và tôi là một giáo viên tiếng Anh chuyên nghiệp đến từ Vương quốc Anh. Tôi rất muốn giúp bạn với tiếng Anh của bạn. Nếu bạn vẫn đang tìm kiếm một giáo viên, thì tôi rất vui được thực hiện một buổi học thử với bạn. Buổi này sẽ cho bạn cơ hội làm quen với phong cách giảng dạy của tôi, thảo luận mục tiêu của bạn, và phác thảo một kế hoạch cá nhân hóa. Hoặc bạn có thể gửi tin nhắn cho tôi nếu bạn thích :) Trân trọng, Guy",
            timestamp: "Hôm qua",
            senderAvatar: conversation.participantAvatar,
          },
        ];
      }
    } else {
      convMessages = [
        {
          id: 1,
          sender: "system",
          text: `Đây là kênh thông báo hệ thống. Không có tin nhắn tương tác ở đây.`,
          timestamp: "Vừa xong",
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
        Đang tải cuộc trò chuyện...
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        Lỗi: {error}
      </div>
    );
  if (!user)
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        Vui lòng đăng nhập để xem tin nhắn của bạn.
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
              placeholder="Tìm kiếm theo tên"
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
                      "https://via.placeholder.com/40?text=Ảnh đại diện"
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
                    {conv.lastMessage || "Chưa có tin nhắn nào"}
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

      <div className="flex-1 flex flex-col bg-gray-50 h-full">
        <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200 shadow-sm">
          <div className="text-lg font-semibold text-gray-800">
            {selectedConversation?.participantName ||
              selectedConversation?.title ||
              "Chọn một cuộc trò chuyện"}
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
              <div className="flex justify-center items-center h-full text-gray-500 text-center">
                <p>Chưa có tin nhắn nào. Bắt đầu cuộc trò chuyện!</p>
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
                        "https://via.placeholder.com/30?text=Bạn"
                      : selectedConversation?.participantAvatar ||
                        "https://via.placeholder.com/30?text=?")
                  }
                  alt={
                    message.sender === "user"
                      ? "Bạn"
                      : selectedConversation?.participantName || "Người tham gia"
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
                Lịch sử tin nhắn được giới hạn trong 6 tháng gần nhất.
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default MessagePage;