// --- API Service File (No changes needed here, it correctly attaches the original error structure to `error.details`) ---
const BASE_API_URL = "https://tutorbooking-dev-065fe6ad4a6a.herokuapp.com";

const LOGIN_URL = import.meta.env.API_LOGIN_URL_PROD;
const MOCK_TUTORS_URL = import.meta.env.VITE_MOCK_API_TUTORS_URL_PROD;

if (!LOGIN_URL) {
  console.warn(
    "Warning: VITE_MOCK_API_LOGIN_URL is not set. Mock login might fail."
  );
}
if (!MOCK_TUTORS_URL) {
  console.warn(
    "Warning: VITE_MOCK_API_TUTORS_URL is not set. Fetching mock tutors might fail."
  );
}

async function callApi(endpoint, method, body, token) {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const fullUrl = `${BASE_API_URL}${endpoint}`;

  try {
    const response = await fetch(fullUrl, {
      method: method,
      headers: headers,
      body: body ? JSON.stringify(body) : null,
      credentials: 'include',
    });

    if (!response.ok) {
      let formattedErrorMessage = `API Error: ${response.status} ${response.statusText} for ${fullUrl}`;
      let originalErrorData = null;

      // Debug logging for rating API errors
    

      try {
        const errorData = await response.json();
        originalErrorData = errorData;
        console.error("API Error Details Received:", errorData);
  

        if (errorData) {
          if (typeof errorData.errorMessage === 'string') {
            formattedErrorMessage = errorData.errorMessage;
          } else if (typeof errorData.errorMessage === 'object' && errorData.errorMessage !== null) {
            const fieldErrors = Object.keys(errorData.errorMessage)
              .map(field => {
                const messages = Array.isArray(errorData.errorMessage[field])
                  ? errorData.errorMessage[field].join(', ')
                  : String(errorData.errorMessage[field]);
                return `${field}: ${messages}`;
              })
              .join('; ');
            formattedErrorMessage = `Validation Error: ${fieldErrors}`;
          } else if (typeof errorData.message === 'string') {
            formattedErrorMessage = errorData.message;
          }
        }
      } catch (jsonError) {
        console.warn("Failed to parse error response as JSON.", jsonError);
      }

      const error = new Error(originalErrorData?.errorMessage || originalErrorData?.message || formattedErrorMessage);
      error.status = response.status;
      error.details = originalErrorData;
      throw error;
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const jsonData = await response.json();
      return jsonData;
    } else {
      console.warn(
        `API response for ${fullUrl} was not JSON, content-type: ${contentType}`
      );
      return { success: true, status: response.status, rawResponse: response };
    }
  } catch (error) {
    console.error("API Call Failed:", error.message);
    throw error;
  }
}

export async function login(username, password) {
  try {
    const response = await callApi("/api/auth/login", "POST", {
      username,
      password,
    });

    if (!response?.data?.token) {
      throw new Error("Invalid login response format received.");
    }

    const { accessToken, refreshToken, user } = response.data.token;

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("user", JSON.stringify(user));

    return response;
  } catch (error) {
    console.error("Login Failed:", error.message);
    throw error;
  }
}

export async function register(
  email,
  password,
  confirmPassword,
  fullName
) {
  const body = {
    email,
    password,
    confirmPassword,
    fullName,
  };

  try {
    return await callApi("/api/auth/register", "POST", body);
  } catch (error) {
    console.error("Registration Failed:", error.message);
    throw error;
  }
}

export async function confirmEmail(email, otp) {
  const body = { email, otp };
  try {
    return await callApi("/api/auth/confirm-email", "PATCH", body);
  } catch (error) {
    console.error("Confirm Email Failed:", error.message);
    throw error;
  }
}

export async function forgotPassword(email) {
  const body = { email };
  try {
    return await callApi("/api/auth/forgot-password", "POST", body);
  } catch (error) {
    console.error("Forgot Password Failed:", error.message);
    throw error;
  }
}

export async function resetPassword(email, otp, password) {
  const body = { email, otp, password };
  try {
    return await callApi("/api/auth/reset-password", "PATCH", body);
  } catch (error) {
    console.error("Reset Password Failed:", error.message);
    throw error;
  }
}

export async function changePassword(email, otp, password) {
  const body = { email, otp, password };
  try {
    return await callApi("/api/auth/reset-password", "PATCH", body);
  } catch (error) {
    console.error("Change Password Failed:", error.message);
    throw error;
  }
}

export async function refreshToken(refreshTokenValue) {
  const body = { refreshToken: refreshTokenValue };
  try {
    const response = await callApi("/api/auth/refresh-token", "POST", body);

    if (response?.data?.token) {
      localStorage.setItem("accessToken", response.data.token.accessToken);
      localStorage.setItem("refreshToken", response.data.token.refreshToken);
      if (response.data.token.user) {
        localStorage.setItem("user", JSON.stringify(response.data.token.user));
      }
    } else {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      throw new Error(
        response?.message ||
        response?.errorMessage ||
        "Invalid refresh token response"
      );
    }

    return response;
  } catch (error) {
    console.error("Refresh Token Failed:", error.message);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    throw error;
  }
}

export async function logout(refreshTokenValue) {
  const body = { refreshToken: refreshTokenValue };
  try {
    const response = await callApi("/api/auth/logout", "POST", body);

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    return response;
  } catch (error) {
    console.error("Logout Failed:", error.message);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    throw error;
  }
}

export function getStoredUser() {
  const user = localStorage.getItem("user");
  try {
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error("Error parsing stored user data:", error);
    localStorage.removeItem("user");
    return null;
  }
}

export function getAccessToken() {
  return localStorage.getItem("accessToken");
}

export function getRefreshToken() {
  return localStorage.getItem("refreshToken");
}

/**
 * Debug function to check authentication status
 * @returns {Object} Authentication debug info
 */

export async function fetchTutors() {
  const MOCK_TUTOR_API_URL = MOCK_TUTORS_URL;

  if (!MOCK_TUTOR_API_URL) {
    console.error(
      "Mock tutors URL is not configured in .env file (VITE_MOCK_API_TUTORS_URL)."
    );
    throw new Error("Cấu hình API bị lỗi.");
  }


  try {
    const response = await fetch(MOCK_TUTOR_API_URL);
    if (!response.ok) {
      throw new Error(
        `Lỗi khi gọi MockAPI tutors: ${response.statusText} (${response.status})`
      );
    }
    const tutorsData = await response.json();
    return tutorsData;
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu tutors:", error);
    throw error;
  }
}

export async function fetchTutorById(id) {

  try {
    const response = await callApi(`/api/tutor/${id}`, "GET");

    if (response && response.data) {
      return response.data;
    } else {
      console.error("Invalid API response format for fetchTutorById:", response);
      throw new Error("API response did not contain expected tutor data.");
    }
  } catch (error) {
    console.error(`Lỗi khi lấy dữ liệu tutor với ID ${id} từ API:`, error);
    throw error;
  }
}

export async function fetchTutorsBySubject(subject) {
  try {
    const tutorsData = await fetchTutors();
    if (!subject) {
      throw new Error("Subject parameter is required.");
    }
    const normalizedSubject =
      subject.toLowerCase() === "portuguese"
        ? "brazilian portuguese"
        : subject.toLowerCase();

    const filteredTutors = tutorsData.filter(
      (tutor) =>
        tutor.nativeLanguage &&
        tutor.nativeLanguage.toLowerCase() === normalizedSubject
    );
    return filteredTutors;
  } catch (error) {
    console.error(`Error fetching tutors by subject: ${subject}`, error);
    throw error;
  }
}

export async function fetchTutorList(subject) {
  try {
    const response = await callApi("/api/tutor/list-card", "GET");
    if (response && response.data) {
      let tutors = response.data;

      if (subject) {
        const normalizedSubject =
          subject.toLowerCase() === "portuguese"
            ? "brazilian portuguese"
            : subject.toLowerCase();

        tutors = tutors.filter(
          (tutor) =>
            tutor.nativeLanguage &&
            tutor.nativeLanguage.toLowerCase() === normalizedSubject
        );
      }

      return tutors;
    } else {
      console.error("Invalid API response format for tutor list:", response);
      throw new Error("Invalid response format or missing data for tutor list.");
    }
  } catch (error) {
    console.error("Failed to fetch tutor list:", error.message);
    throw error;
  }
}

export function isUserAuthenticated(user) {
  return user.emailCode === null;
}

export async function editUserProfile(token, updateData) {
  try {
    const response = await callApi("/api/profile/user", "PATCH", updateData, token);
    return response;
  } catch (error) {
    console.error("Failed to update user profile:", error.message);
    throw error;
  }
}

export async function fetchUserById() {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Authentication token not found.");
  }

  try {
    const response = await callApi(`/api/profile/user`, "GET", null, token);

    if (response && response.data) {
      const userData = response.data;

      if (userData.gender !== undefined && typeof userData.gender === 'string') {
        userData.gender = parseInt(userData.gender, 10);
      }

      if (userData.learningProficiencyLevel !== undefined &&
        typeof userData.learningProficiencyLevel === 'string') {
        userData.learningProficiencyLevel = parseInt(userData.learningProficiencyLevel, 10);
      }

      return userData;
    } else {
      console.error("Invalid API response format:", response);
      throw new Error("Invalid response format or missing data.");
    }
  } catch (error) {
    console.error("Failed to fetch user profile:", error.message);
    throw error;
  }
}

export async function fetchUserProfileById(userId) {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Authentication token not found.");
  }

  try {
    const response = await callApi(`/api/profile/user/${userId}`, "GET", null, token);

    if (response && response.data) {
      const userData = response.data;

      if (userData.gender !== undefined && typeof userData.gender === 'string') {
        userData.gender = parseInt(userData.gender, 10);
      }

      if (userData.learningProficiencyLevel !== undefined &&
        typeof userData.learningProficiencyLevel === 'string') {
        userData.learningProficiencyLevel = parseInt(userData.learningProficiencyLevel, 10);
      }

      return userData;
    } else {
      console.error("Invalid API response format:", response);
      throw new Error("Invalid response format or missing data.");
    }
  } catch (error) {
    console.error("Failed to fetch user profile:", error.message);
    throw error;
  }
}

export async function uploadProfileImage(file) {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    const formData = new FormData();
    formData.append('file', file);

    const fullUrl = `${BASE_API_URL}/api/profile/image`;

    const response = await fetch(fullUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Failed to upload profile image: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Profile image upload failed:", error.message);
    throw error;
  }
}

export async function deleteProfileImage() {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    const response = await callApi("/api/profile/image", "DELETE", null, token);
    return response;
  } catch (error) {
    console.error("Profile image deletion failed:", error.message);
    throw error;
  }
}

export async function fetchTutorRegisterProfile() {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    const response = await callApi("/api/profile/tutor-register-profile", "GET", null, token);
    return response;
  } catch (error) {
    console.error("Fetch tutor register profile failed:", error.message);
    throw error;
  }
}

export async function fetchAllHashtags() {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    const response = await callApi("/api/hashtag/all", "GET", null, token);
    return response;
  } catch (error) {
    console.error("Fetch hashtags failed:", error.message);
    throw error;
  }
}

export async function registerAsTutor(tutorData) {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    const response = await callApi("/api/tutor/register", "POST", tutorData, token);
    return response;
  } catch (error) {
    console.error("Tutor registration failed:", error.message);
    throw error;
  }
}

export async function fetchTutorDetail(tutorId) {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    const response = await callApi(`/api/tutor/${tutorId}`, "GET", null, token);
    return response;
  } catch (error) {
    console.error(`Failed to fetch tutor details for ID ${tutorId}:`, error.message);
    throw error;
  }
}

export async function fetchAllTutor(
  page = 1, 
  size = 20, 
  languageCodes = null, 
  primaryLanguageCode = null, 
  daysInWeek = null, 
  slotIndexes = null, 
  minPrice = null, 
  maxPrice = null,
  fullName = null
) {
  try {
    // Build query parameters
    const params = new URLSearchParams();
    
    // Add pagination parameters
    params.append('page', page.toString());
    params.append('size', size.toString());
    
    // Add optional filter parameters
    if (languageCodes && Array.isArray(languageCodes) && languageCodes.length > 0) {
      languageCodes.forEach(code => params.append('languageCodes', code));
    }
    
    if (primaryLanguageCode) {
      params.append('primaryLanguageCode', primaryLanguageCode);
    }
    
    if (daysInWeek && Array.isArray(daysInWeek) && daysInWeek.length > 0) {
      daysInWeek.forEach(day => params.append('daysInWeek', day.toString()));
    }
    
    if (slotIndexes && Array.isArray(slotIndexes) && slotIndexes.length > 0) {
      slotIndexes.forEach(slot => params.append('slotIndexes', slot.toString()));
    }
    
    if (minPrice !== null && minPrice !== undefined) {
      params.append('minPrice', minPrice.toString());
    }
    
    if (maxPrice !== null && maxPrice !== undefined) {
      params.append('maxPrice', maxPrice.toString());
    }

    if (fullName) {
      params.append('fullName', fullName);
    }

    const response = await callApi(`/api/tutor/all?${params.toString()}`, "GET");

    if (response && Array.isArray(response.data)) {
      return response.data;
    } else {
      console.error("Invalid API response format for fetchAllTutor:", response);
      throw new Error("API response did not contain expected tutor data array.");
    }
  } catch (error) {
    console.error("Failed to fetch all tutors:", error.message);
    throw error;
  }
}

export async function fetchRecommendTutor() {
  try {
    const response = await callApi("/api/tutor/recommended-tutors", "GET");

    if (response && response.data && Array.isArray(response.data)) {
      return response.data;
    } else {
      console.error("Invalid API response format for fetchRecommendTutor:", response);
      throw new Error("API response did not contain expected recommended tutor data array.");
    }
  } catch (error) {
    console.error("Failed to fetch recommended tutors:", error.message);
    throw error;
  }
}

export async function fetchChatConversationsByUserId(userId, page = 1, size = 20) {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required to fetch conversations.");
    }

    const response = await callApi(
      `/api/chat/conversations?userId=${userId}&page=${page}&size=${size}`,
      "GET",
      null,
      token
    );

    if (response && Array.isArray(response.data)) {

      const formattedConversations = response.data.map((conv) => {
        const otherParticipant = conv.participants.find(
          (p) => p.id !== userId
        );

        // Sort messages by creation time to ensure we get the latest message
        const sortedMessages = conv.messages.sort((a, b) => 
          new Date(a.createdTime).getTime() - new Date(b.createdTime).getTime()
        );
        
        const lastMessageObj =
          sortedMessages.length > 0
            ? sortedMessages[sortedMessages.length - 1]
            : null;

        let lastMessageText = "Chưa có tin nhắn nào";
        if (lastMessageObj) {
          if (lastMessageObj.textMessage === null) {
            if (lastMessageObj.userId === userId) {
              lastMessageText = "Bạn đã thu hồi 1 tin nhắn";
            } else {
              lastMessageText = `${otherParticipant?.fullName || "Người dùng"} đã thu hồi 1 tin nhắn`;
            }
          } else {
            lastMessageText = lastMessageObj.textMessage;
          }
        }

        const timestamp = lastMessageObj
          ? new Date(lastMessageObj.createdTime).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
          : "Gần đây";

        const actualTimestamp = lastMessageObj
          ? new Date(lastMessageObj.createdTime).getTime()
          : 0;

        return {
          id: conv.id,
          participantId: otherParticipant?.id || null,
          participantName: otherParticipant?.fullName || "Người dùng không xác định",
          participantAvatar: otherParticipant?.profilePictureUrl || "https://picsum.photos/300/200?random=1",
          lastMessage: lastMessageText,
          timestamp: timestamp,
          actualTimestamp: actualTimestamp,
          unreadCount: 0,
          type: "tutor",
          messages: conv.messages.map(msg => ({
            id: msg.id,
            sender: msg.userId === userId ? "user" : "tutor",
            text: msg.textMessage,
            timestamp: new Date(msg.createdTime).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            createdAt: msg.createdTime,
            senderAvatar: msg.userId === userId ? (otherParticipant?.profilePictureUrl || "https://via.placeholder.com/30?text=Bạn") : (otherParticipant?.profilePictureUrl || "https://via.placeholder.com/30?text=?"),
          })),
        };
      });

      return formattedConversations;
    } else {
      console.error("Invalid API response format for fetchChatMessageByUserId:", response);
      throw new Error("API response did not contain expected conversation data array.");
    }
  } catch (error) {
    console.error("Failed to fetch chat conversations:", error.message);
    throw error;
  }
}

export async function fetchConversationList(conversationId, page = 1, size = 20) {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required to fetch conversation messages.");
    }

    const response = await callApi(
      `/api/chat/conversation/${conversationId}?page=${page}&size=${size}`,
      "GET",
      null,
      token
    );

    if (response && response.data && Array.isArray(response.data.messages)) {

      const participants = response.data.participants;
      const getParticipantInfo = (userId) => {
        return participants.find(p => p.id === userId);
      };

      const formattedMessages = response.data.messages.map(msg => {
        const senderInfo = getParticipantInfo(msg.userId);

        return {
          id: msg.id,
          sender: msg.userId,
          text: msg.textMessage === null ? "Tin nhắn đã được thu hồi" : msg.textMessage,
          timestamp: new Date(msg.createdTime).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          createdAt: msg.createdTime,
          senderAvatar: senderInfo?.profilePictureUrl || "https://via.placeholder.com/30?text=?",
        };
      });

      return formattedMessages;
    } else {
      console.error("Invalid API response format for fetchConversationMessages:", response);
      throw new Error("API response did not contain expected message data array.");
    }
  } catch (error) {
    console.error(`Failed to fetch messages for conversation ${conversationId}:`, error.message);
    throw error;
  }
}

export async function fetchTutorLesson(tutorId) {
  try {
    const response = await callApi(`/api/lesson/tutor/${tutorId}`, "GET");
    if (response && response.data) {
      return response.data;
    } else {
      throw new Error("No lesson data found for this tutor.");
    }
  } catch (error) {
    console.error("Failed to fetch tutor lessons:", error.message);
    throw error;
  }
}

export async function fetchTutorLessonDetailById(lessonId) {
  try {
    const response = await callApi(`/api/lesson/${lessonId}`, "GET");
    if (response && response.data) {
      return response.data;
    } else {
      throw new Error("No lesson detail found for this lesson.");
    }
  } catch (error) {
    console.error("Failed to fetch lesson detail:", error.message);
    throw error;
  }
}

export async function createLesson(lessonData) {
  try {
    const token = getAccessToken();
    if (!token) throw new Error("Authentication token is required");
    const response = await callApi("/api/lesson", "POST", lessonData, token);
    return response;
  } catch (error) {
    console.error("Failed to create lesson:", error.message);
    throw error;
  }
}

export async function updateLesson(lessonId, lessonData) {
  try {
    const token = getAccessToken();
    if (!token) throw new Error("Authentication token is required");
    const response = await callApi(`/api/lesson/${lessonId}`, "PUT", lessonData, token);
    return response;
  } catch (error) {
    console.error("Failed to update lesson:", error.message);
    throw error;
  }
}

export async function deleteLesson(lessonId) {
  try {
    const token = getAccessToken();
    if (!token) throw new Error("Authentication token is required");
    const response = await callApi(`/api/lesson/${lessonId}`, "DELETE", null, token);
    return response;
  } catch (error) {
    console.error("Failed to delete lesson:", error.message);
    throw error;
  }
}

export async function fetchTutorWeeklyPattern(tutorId) {
  try {
    const response = await callApi(`/api/schedule/tutors/${tutorId}/weekly-patterns`, "GET");

    if (response && response.data) {
      return response.data;
    } else {
      throw new Error("No weekly pattern data found for this tutor.");
    }
  } catch (error) {
    console.error("Failed to fetch tutor weekly patterns:", error.message);
    throw error;
  }
}

export async function editTutorWeeklyPattern(patternData) {
  try {
    const token = getAccessToken();
    if (!token) throw new Error("Authentication token is required");
    const response = await callApi("/api/schedule/weekly-pattern", "PUT", patternData, token);
    return response;
  } catch (error) {
    console.error("Failed to edit tutor weekly pattern:", error.message);
    throw error;
  }
}

export async function fetchTutorWeekSchedule(tutorId, startDate) {
  try {
    const response = await callApi(`/api/schedule/tutors/${tutorId}/week?startDate=${startDate}`, "GET");

    if (response && response.data) {
      return response.data;
    } else {
      throw new Error("No weekly schedule data found for this tutor.");
    }
  } catch (error) {
    console.error("Failed to fetch tutor weekly schedule:", error.message);
    throw error;
  }
}

export async function tutorBookingTimeSlotFromLearner() {
  try {
    const token = getAccessToken();
    if (!token) throw new Error("Authentication token is required");
    const response = await callApi("/api/tutor-bookings/time-slots", "GET", null, token);
    return response;
  } catch (error) {
    console.error("Failed to fetch learner booking time slots:", error.message);
    throw error;
  }
}

export async function tutorBookingTimeSlotFromLearnerDetail(learnerId) {
  try {
    const token = getAccessToken();
    if (!token) throw new Error("Authentication token is required");
    const response = await callApi(`/api/tutor-bookings/learners/${learnerId}/time-slots`, "GET", null, token);
    return response;
  } catch (error) {
    console.error("Failed to fetch learner booking time slot detail:", error.message);
    throw error;
  }
}

/**
 * Get all tutors the learner has sent booking requests to.
 * @returns {Promise<Array>} List of tutor requests.
 */
export async function getAllLearnerBookingTimeSlot() {
  try {
    const token = getAccessToken();
    if (!token) throw new Error("Authentication token is required");
    const response = await callApi(
      "/api/learner-bookings/list-tutors-request",
      "GET",
      null,
      token
    );
    if (response && Array.isArray(response.data)) {
      return response.data;
    } else {
      throw new Error("Invalid response format for tutor requests.");
    }
  } catch (error) {
    console.error("Failed to fetch all learner booking time slots:", error.message);
    throw error;
  }
}

/**
 * Get learner booking time slots by tutorId.
 * @param {string} tutorId
 */
export async function learnerBookingTimeSlotByTutorId(tutorId) {
  try {
    const token = getAccessToken();
    if (!token) throw new Error("Authentication token is required");
    const response = await callApi(
      `/api/learner-bookings/tutors/${tutorId}/time-slots`,
      "GET",
      null,
      token
    );
    // Always return the array directly
    return response.data;
  } catch (error) {
    console.error("Failed to fetch learner booking time slots by tutorId:", error.message);
    throw error;
  }
}

/**
 * Update learner booking time slots for a tutor.
 * @param {string} tutorId
 * @param {string} lessonId
 * @param {string} expectedStartDate (ISO string)
 * @param {Array<{dayInWeek: number, slotIndex: number}>} timeSlots
 */
export async function updateLearnerBookingTimeSlot(tutorId, lessonId, expectedStartDate, timeSlots) {
  try {
    const token = getAccessToken();
    if (!token) throw new Error("Authentication token is required");
    const body = { tutorId, lessonId, expectedStartDate, timeSlots };
    const response = await callApi("/api/learner-bookings/time-slots", "PUT", body, token);
    return response;
  } catch (error) {
    console.error("Failed to update learner booking time slot:", error.message);
    throw error;
  }
}

/**
 * Delete learner booking time slots for a tutor.
 * @param {string} tutorId
 */
export async function deleteLearnerBookingTimeSlot(tutorId) {
  try {
    const token = getAccessToken();
    if (!token) throw new Error("Authentication token is required");
    const response = await callApi(
      `/api/learner-bookings/tutors/${tutorId}/time-slots`,
      "DELETE",
      null,
      token
    );
    return response;
  } catch (error) {
    console.error("Failed to delete learner booking time slot:", error.message);
    throw error;
  }
}

/**
 * Offer booking time slots from tutor to learner.
 * @param {Object} offerData - { learnerId, lessonId, offeredSlots }
 * @returns {Promise<Object>} API response
 */
export async function createTutorBookingOffer(offerData) {
  try {
    const token = getAccessToken();
    if (!token) throw new Error("Authentication token is required");
    
    // Clean the payload to only include required fields per API spec
    const cleanPayload = {
      learnerId: offerData.learnerId,
      lessonId: offerData.lessonId,
      offeredSlots: offerData.offeredSlots
    };
    
    console.log("Creating tutor booking offer with clean data:", cleanPayload);
    console.log("Token exists:", !!token);
    
    const response = await callApi(
      "/api/tutor-bookings/offers",
      "POST",
      cleanPayload,
      token
    );
    
    console.log("Offer creation response:", response);
    
    // Convert response from UTC+0 to UTC+7
    const convertedResponse = convertBookingOfferResponseToUTC7(response);
    console.log("Converted response to UTC+7:", convertedResponse);
    
    return convertedResponse;
  } catch (error) {
    console.error("Failed to offer booking slots:", error.message);
    console.error("Error details:", error);
    throw error;
  }
}

/**
 * Get details of a tutor's booking offer by offerId.
 * @param {string} offerId
 * @returns {Promise<Object>} API response
 */
export async function tutorBookingOfferDetail(offerId) {
  try {
    const token = getAccessToken();
    if (!token) throw new Error("Authentication token is required");
    const response = await callApi(
      `/api/tutor-bookings/offers/${offerId}`,
      "GET",
      null,
      token
    );
    return response;
  } catch (error) {
    console.error("Failed to fetch tutor booking offer detail:", error.message);
    throw error;
  }
}

export async function getAllTutorBookingOffer() {
  try {
    const token = getAccessToken();
    if (!token) throw new Error("Authentication token is required");
    const response = await callApi(
      "/api/tutor-bookings/offers",
      "GET",
      null,
      token
    );
    return response;
  } catch (error) {
    console.error("Failed to fetch all tutor booking offers:", error.message);
    throw error;
  }
}

/**
 * Update a tutor's booking offer by offerId.
 * @param {string} offerId
 * @param {Object} offerData - { lessonId, offeredSlots }
 * @returns {Promise<Object>} API response
 */
export async function updateTutorBookingOfferByOfferId(offerId, offerData) {
  try {
    const token = getAccessToken();
    if (!token) throw new Error("Authentication token is required");
    
    // Clean the payload to only include required fields per API spec
    const cleanPayload = {
      lessonId: offerData.lessonId,
      offeredSlots: offerData.offeredSlots
    };
    
    console.log("Updating tutor booking offer with ID:", offerId);
    console.log("Clean update data:", cleanPayload);
    console.log("Token exists:", !!token);
    
    const response = await callApi(
      `/api/tutor-bookings/offers/${offerId}`,
      "PUT",
      cleanPayload,
      token
    );
    
    console.log("Update offer response:", response);
    return response;
  } catch (error) {
    console.error("Failed to update tutor booking offer:", error.message);
    console.error("Error details:", error);
    throw error;
  }
}

/**
 * Delete a tutor's booking offer by offerId.
 * @param {string} offerId
 * @returns {Promise<Object>} API response
 */
export async function deleteTutorBookingOfferByOfferId(offerId) {
  try {
    const token = getAccessToken();
    if (!token) throw new Error("Authentication token is required");
    const response = await callApi(
      `/api/tutor-bookings/offers/${offerId}`,
      "DELETE",
      null,
      token
    );
    return response;
  } catch (error) {
    console.error("Failed to delete tutor booking offer:", error.message);
    throw error;
  }
}

/**
 * Get all booking offers sent to the learner.
 * @returns {Promise<Array>} List of booking offers.
 */
export async function getAllLearnerBookingOffer() {
  try {
    const token = getAccessToken();
    if (!token) throw new Error("Authentication token is required");
    const response = await callApi(
      "/api/learner-bookings/offers",
      "GET",
      null,
      token
    );
    if (response && Array.isArray(response.data)) {
      return response.data;
    } else {
      throw new Error("Invalid response format for learner booking offers.");
    }
  } catch (error) {
    console.error("Failed to fetch all learner booking offers:", error.message);
    throw error;
  }
}

/**
 * Get details of a learner's booking offer by offerId.
 * @param {string} offerId
 * @returns {Promise<Object>} API response
 */
export async function learnerBookingOfferDetail(offerId) {
  try {
    const token = getAccessToken();
    if (!token) throw new Error("Authentication token is required");
    const response = await callApi(
      `/api/learner-bookings/offers/${offerId}`,
      "GET",
      null,
      token
    );
    
    console.log("🔍 Raw learner booking offer response:", response);
    
    if (response && response.data) {
      // Convert response from UTC+0 to UTC+7 for proper display
      const convertedResponse = convertBookingOfferResponseToUTC7(response);
      console.log(" Converted response to UTC+7:", convertedResponse);
      
      return convertedResponse.data;
    } else {
      throw new Error("Invalid response format for learner booking offer detail.");
    }
  } catch (error) {
    console.error("Failed to fetch learner booking offer detail:", error.message);
    throw error;
  }
}

/**
 * Accept a booking offer from tutor.
 * @param {string} offerId
 * @returns {Promise<Object>} API response
 */
export async function acceptLearnerBookingOffer(offerId) {
  try {
    const token = getAccessToken();
    if (!token) throw new Error("Authentication token is required");
    const response = await callApi(
      "/api/learner-bookings/accept-offer",
      "POST",
      { offerId },
      token
    );
    return response;
  } catch (error) {
    console.error("Failed to accept booking offer:", error.message);
    throw error;
  }
}

/**
 * Reject a booking offer from tutor.
 * @param {string} offerId
 * @returns {Promise<Object>} API response
 */
export async function rejectLearnerBookingOffer(offerId) {
  try {
    const token = getAccessToken();
    if (!token) throw new Error("Authentication token is required");
    const response = await callApi(
      `/api/learner-bookings/offers/${offerId}/reject`,
      "POST",
      null,
      token
    );
    return response;
  } catch (error) {
    console.error("Failed to reject booking offer:", error.message);
    throw error;
  }
}

// New API function for requesting tutor verification
export async function requestTutorVerification(tutorApplicationId) {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    const response = await callApi(
      `/api/tutorapplication/request-verification?tutorApplicationId=${tutorApplicationId}`,
      "POST",
      null,
      token
    );

    return response;
  } catch (error) {
    console.error("Failed to request tutor verification:", error.message);
    throw error;
  }
}

// New API function for uploading certificate files
export async function uploadCertificate(files, applicationId) {
  try {
    const token = getAccessToken();
    if (!token) throw new Error("Authentication token is required");

    const formData = new FormData();

    // Support both single file and multiple files  
    if (Array.isArray(files)) {
      files.forEach((file) => {
        formData.append(`Files`, file);
      });
    } else {
      formData.append(`Files`, files);
    }

    // Add required fields based on Swagger documentation
    formData.append('ApplicationId', applicationId || ''); // Use the actual tutor application ID
    formData.append('StaffId', ''); // Empty for now
    formData.append('IsVisibleToLearner', 'false');
    formData.append('Description', 'Certificate upload from tutor profile');

    const headers = {
      Accept: "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const fullUrl = `${BASE_API_URL}/api/document/upload`;
    console.log(`Uploading certificates to: ${fullUrl}`);

    const response = await fetch(fullUrl, {
      method: "POST",
      headers: headers,
      body: formData,
      credentials: 'include',
    });


    if (!response.ok) {
      let formattedErrorMessage = `Certificate Upload Error: ${response.status} ${response.statusText}`;
      let originalErrorData = null;

      try {
        const errorData = await response.json();
        originalErrorData = errorData;
        console.error("Certificate Upload Error Details:", errorData);

        if (errorData) {
          if (typeof errorData.errorMessage === 'string') {
            formattedErrorMessage = errorData.errorMessage;
          } else if (typeof errorData.message === 'string') {
            formattedErrorMessage = errorData.message;
          }
        }
      } catch (jsonError) {
        console.warn("Failed to parse error response as JSON.", jsonError);
      }

      const error = new Error(originalErrorData?.errorMessage || originalErrorData?.message || formattedErrorMessage);
      error.status = response.status;
      error.details = originalErrorData;
      throw error;
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const jsonData = await response.json();
      return jsonData;
    } else {
      return { success: true, status: response.status };
    }
  } catch (error) {
    console.error("Failed to upload certificates:", error.message);
    throw error;
  }
}

export async function fetchPendingApplications(page = 1, size = 20) {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    const response = await callApi(
      `/api/tutorapplication/staff/pending-applications?page=${page}&size=${size}`,
      "GET",
      null,
      token
    );

    if (response && response.data) {
      return response.data;
    } else {
      throw new Error("No pending applications data found.");
    }
  } catch (error) {
    console.error("Failed to fetch pending applications:", error.message);
    throw error;
  }
}

export async function fetchDocumentsByTutorId(tutorId) {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    const response = await callApi(`/api/document/tutor/${tutorId}`, "GET", null, token);

    if (response && response.data) {
      return response.data;
    } else {
      throw new Error("No documents data found for this tutor.");
    }
  } catch (error) {
    console.error("Failed to fetch documents:", error.message);
    throw error;
  }
}

export async function deleteDocument(documentId) {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    const response = await callApi(`/api/document/${documentId}`, "DELETE", null, token);
    return response;
  } catch (error) {
    console.error("Failed to delete document:", error.message);
    throw error;
  }
}

export async function fetchTutorApplicationById(applicationId) {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    const response = await callApi(`/api/tutorapplication/staff/${applicationId}`, "GET", null, token);

    if (response && response.data) {
      return response.data;
    } else {
      throw new Error("No tutor application data found for this ID.");
    }
  } catch (error) {
    console.error("Failed to fetch tutor application details:", error.message);
    throw error;
  }
}

// New API function to fetch tutor application by application ID
export async function fetchTutorApplicationByApplicationId(applicationId) {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    const response = await callApi(`/api/tutorapplication/staff/${applicationId}`, "GET", null, token);

    if (response && response.data) {
      // Implement defensive coding to ensure languages and hashtags are always arrays
      const data = response.data;
      
      // According to the API response structure, languages and hashtags are at the root level
      // Ensure they are always arrays
      data.languages = data.languages || [];
      data.hashtags = data.hashtags || [];
      
      // Convert hashtags to consistent format (handle both string and object formats)
      if (data.hashtags && Array.isArray(data.hashtags)) {
        data.hashtags = data.hashtags.map(tag => {
          if (typeof tag === 'string') {
            return { name: tag, value: tag };
          }
          return tag;
        });
      }
      
      // Ensure tutor object exists
      if (!data.tutor) {
        data.tutor = {};
      }
      
      // Also copy languages and hashtags to tutor object for backward compatibility
      data.tutor.languages = data.languages;
      data.tutor.hashtags = data.hashtags;
      
      console.log("🔍 Processed tutor application data:", data);
      console.log("🔍 Languages (processed):", data.languages);
      console.log("🔍 Hashtags (processed):", data.hashtags);
      
      return data;
    } else {
      throw new Error("No tutor application data found for this application ID.");
    }
  } catch (error) {
    console.error("Failed to fetch tutor application by application ID:", error.message);
    throw error;
  }
}

export async function reviewTutorApplication(applicationId, action, notes = "") {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }
    
    const requestBody = {
      applicationId: applicationId,
      action: action, // 0 = RequestRevision (Yêu cầu chỉnh sửa), 1 = Approve (Phê duyệt), 2 = Reject (Từ chối)
      notes: notes
    };

    const response = await callApi("/api/tutorapplication/staff/review", "POST", requestBody, token);

    if (response) {
      return response;
    } else {
      throw new Error("No response data from review API.");
    }
  } catch (error) {
    console.error("Failed to review tutor application:", error.message);
    throw error;
  }
}

// Payment return URL configuration
const BASE_URL = "https://ngoai-ngu-ngay.vercel.app";
const PAYMENT_RETURN_PATH = "/payment-return";

// Deposit API function
export async function createDepositRequest(amount) {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    const paymentReturnUrl = `${BASE_URL}${PAYMENT_RETURN_PATH}`;
    
    const requestBody = {
      amount: amount,
      returnUrl: paymentReturnUrl,
      cancelUrl: paymentReturnUrl
    };

    const response = await callApi("/api/deposit", "POST", requestBody, token);

    if (response && response.data) {
      return response.data;
    } else {
      throw new Error("Invalid response format for deposit request.");
    }
  } catch (error) {
    console.error("Failed to create deposit request:", error.message);
    throw error;
  }
}

// Wallet API functions
export async function fetchWalletInfo() {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    const response = await callApi("/api/wallet/info", "GET", null, token);

    if (response && response.data) {
      return response.data;
    } else {
      throw new Error("Invalid response format for wallet info.");
    }
  } catch (error) {
    console.error("Failed to fetch wallet info:", error.message);
    throw error;
  }
}

export async function fetchWalletTransactions() {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    const response = await callApi("/api/wallet/transactions", "GET", null, token);

    if (response && response.data) {
      // Handle paginated response structure
      if (response.data.items && Array.isArray(response.data.items)) {
        return response.data.items;
      }
      // Fallback to direct array or data
      return Array.isArray(response.data) ? response.data : [];
    } else {
      throw new Error("Invalid response format for wallet transactions.");
    }
  } catch (error) {
    console.error("Failed to fetch wallet transactions:", error.message);
    throw error;
  }
}

export async function fetchDepositHistory() {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    const response = await callApi("/api/deposit/history", "GET", null, token);

    if (response && response.data) {
      // Handle paginated response structure
      if (response.data.items && Array.isArray(response.data.items)) {
        return response.data.items;
      }
      // Fallback to direct array or data
      return Array.isArray(response.data) ? response.data : [];
    } else {
      throw new Error("Invalid response format for deposit history.");
    }
  } catch (error) {
    console.error("Failed to fetch deposit history:", error.message);
    throw error;
  }
}

/**
 * Fetch learner bookings with pagination.
 * @param {number} page - Page number (default: 1)
 * @param {number} pageSize - Number of items per page (default: 10)
 * @returns {Promise<Object>} API response with booking data
 */
export async function fetchLearnerBookings(page = 1, pageSize = 10) {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    const response = await callApi(
      `/api/booking/learner?page=${page}&pageSize=${pageSize}`,
      "GET",
      null,
      token
    );

    if (response && response.data) {
      return response.data;
    } else {
      throw new Error("Invalid response format for learner bookings.");
    }
  } catch (error) {
    console.error("Failed to fetch learner bookings:", error.message);
    throw error;
  }
}

/**
 * Fetch booking details by booking ID.
 * @param {string} bookingId - The booking ID
 * @returns {Promise<Object>} API response with detailed booking data
 */
export async function fetchBookingDetail(bookingId) {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    const response = await callApi(
      `/api/booking/${bookingId}`,
      "GET",
      null,
      token
    );

    if (response && response.data) {
      return response.data;
    } else {
      throw new Error("Invalid response format for booking detail.");
    }
  } catch (error) {
    console.error("Failed to fetch booking detail:", error.message);
    throw error;
  }
}

/**
 * Fetch booking information by booking ID
 * @param {string} bookingId - The booking ID
 * @returns {Promise<Object>} API response with booking data
 */
export async function fetchBookingInfo(bookingId) {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    const response = await callApi(
      `/api/booking/${bookingId}`,
      "GET",
      null,
      token
    );

    if (response && response.data) {
      console.log("✅ Booking info fetched successfully:", response.data);
      return response.data;
    } else {
      throw new Error("Invalid response format for booking info.");
    }
  } catch (error) {
    console.error("❌ Failed to fetch booking info:", error.message);
    throw error;
  }
}

/**
 * Fetch notifications for the current user.
 * @param {number} page - The page number (default: 1)
 * @param {number} size - The number of notifications per page (default: 10)
 * @param {boolean} isUnreadOnly - Whether to fetch only unread notifications
 * @returns {Promise<Object>} API response
 */
export async function getNotification(page = 1, size = 10, isUnreadOnly = false) {
  try {
    const token = getAccessToken();
    if (!token) throw new Error("Authentication token is required");

    const url = `/api/notification/user?page=${page}&size=${size}&isUnreadOnly=${isUnreadOnly}`;
    const response = await callApi(url, "GET", null, token);
    return response;
    
  } catch (error) {
    console.error("Failed to fetch notifications:", error.message);
    throw error;
  }
}

/**
 * Fetch sender profile information by user ID.
 * @param {string} userId - The user ID to get profile information for
 * @returns {Promise<Object>} API response with sender profile data
 */
export async function getSenderProfile(userId) {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    if (!userId) {
      throw new Error("User ID is required");
    }

    const response = await callApi(
      `/api/notification/sender?userId=${userId}`,
      "GET",
      null,
      token
    );

    if (response && response.data) {
      return response.data;
    } else {
      throw new Error("Invalid response format for sender profile.");
    }
  } catch (error) {
    console.error("Failed to fetch sender profile:", error.message);
    throw error;
  }
}

/**
 * Login with Firebase authentication.
 * @returns {Promise<Object>} API response with authentication data
 */
export async function loginGoogleToFirebase(googleAccessToken) {
  try {
    const response = await callApi(
      "/api/auth/login-firebase",
      "POST",
      null,
      googleAccessToken
    );

    if (response?.data?.token) {
      const { accessToken, refreshToken, user } = response.data.token;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(user));
    }

    return response;
  } catch (error) {
    console.error("Firebase login failed:", error.message);
    throw error;
  }
}

/**
 * Get existing rating for a booking
 * @param {string} bookingId - The booking ID to get rating for
 * @returns {Promise<Object>} Rating data or null if no rating exists
 */
export async function getBookingRating(bookingId) {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    const response = await callApi(`/api/booking-slot-rating/booking/${bookingId}`, "GET", null, token);
    
    if (response && response.data) {
      console.log("✅ Booking rating fetched successfully:", response.data);
      return response.data;
    }
    
    return null; // No rating found
  } catch (error) {
    // If rating doesn't exist, API might return 404 - this is normal
    if (error.status === 404) {
      console.log("📝 No rating found for booking:", bookingId);
      return null;
    }
    
    console.error("❌ Failed to fetch booking rating:", error.message);
    throw error;
  }
}

/**
 * Rate a complete booking/course after at least one slot is completed.
 * @param {Object} ratingData - { bookingId, teachingQuality, attitude, commitment, comment }
 * @returns {Promise<Object>} API response
 */
export async function submitBookingRating(ratingData) {
  try {
    const token = getAccessToken();
    console.log("🔍 Debug submitBookingRating - Token exists:", !!token);
    console.log("🔍 Debug submitBookingRating - Token preview:", token ? `${token.substring(0, 20)}...` : 'null');
    console.log("🔍 Debug submitBookingRating - Rating data (bookingSlotId contains bookingId):", ratingData);
    
    if (!token) {
      throw new Error("Authentication token is required");
    }

    const response = await callApi("/api/booking-slot-rating", "POST", ratingData, token);

    if (response) {
      console.log("✅ Booking rating submitted successfully:", response);
      return response;
    } else {
      throw new Error("Invalid response format for booking rating.");
    }
  } catch (error) {
    console.error("❌ Failed to submit booking rating:", error.message);
    console.error("❌ Error status:", error.status);
    console.error("❌ Error details:", error.details);
    throw error;
  }
}

/**
 * Create a new bank account for withdrawals.
 * @param {Object} accountData - { bankName, accountNumber, accountHolderName }
 * @returns {Promise<Object>} API response
 */
export async function createBankAccount(accountData) {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    const response = await callApi("/api/withdrawals/bank-accounts", "POST", accountData, token);

    if (response) {
      console.log("Bank account created successfully:", response);
      return response;
    } else {
      throw new Error("Invalid response format for bank account creation.");
    }
  } catch (error) {
    console.error("Failed to create bank account:", error.message);
    throw error;
  }
}

/**
 * Delete a bank account by ID.
 * @param {string} bankAccountId - The ID of the bank account to delete
 * @returns {Promise<Object>} API response
 */
export async function deleteBankAccount(bankAccountId) {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    const response = await callApi(`/api/withdrawals/bank-accounts/${bankAccountId}`, "DELETE", null, token);

    console.log("Bank account deleted successfully:", response);
    return response;
  } catch (error) {
    console.error("Failed to delete bank account:", error.message);
    throw error;
  }
}

/**
 * Fetch bank accounts for withdrawals.
 * @returns {Promise<Object>} API response with bank accounts data
 */
export async function fetchBankAccounts() {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    const response = await callApi("/api/withdrawals/bank-accounts", "GET", null, token);

    if (response && response.data) {
      console.log("Bank accounts fetched successfully:", response.data);
      return response.data;
    } else {
      return [];
    }
  } catch (error) {
    console.error("Failed to fetch bank accounts:", error.message);
    throw error;
  }
}

/**
 * Fetch withdrawal requests with pagination.
 * @param {Object} params - Query parameters { pageIndex, pageSize, status, etc. }
 * @returns {Promise<Object>} API response with withdrawal requests data
 */
export async function fetchWithdrawalRequests(params = {}) {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    const queryParams = new URLSearchParams({
      pageIndex: params.pageIndex || 1,
      pageSize: params.pageSize || 10,
      ...params
    });
    
    const response = await callApi(`/api/withdrawals?${queryParams.toString()}`, "GET", null, token);

    if (response && response.data) {
      console.log("Withdrawal requests fetched successfully:", response.data);
      return response.data;
    } else {
      throw new Error("Invalid response format for withdrawal requests.");
    }
  } catch (error) {
    console.error("Failed to fetch withdrawal requests:", error.message);
    throw error;
  }
}

/**
 * Create a withdrawal request.
 * @param {Object} withdrawalData - { bankAccountId, grossAmount }
 * @returns {Promise<Object>} API response
 */
export async function createWithdrawalRequest(withdrawalData) {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    const response = await callApi("/api/withdrawals", "POST", withdrawalData, token);

    if (response) {
      console.log("Withdrawal request created successfully:", response);
      return response;
    } else {
      throw new Error("Invalid response format for withdrawal request.");
    }
  } catch (error) {
    console.error("Failed to create withdrawal request:", error.message);
    throw error;
  }
}

/**
 * Complete a booked slot by changing its status to completed.
 * @param {string} bookedSlotId - The booked slot ID to complete
 * @returns {Promise<Object>} API response
 */
export async function completeBookedSlot(bookedSlotId) {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    const response = await callApi(
      `/api/tutor-bookings/booked-slots/${bookedSlotId}/complete`,
      "PATCH",
      null,
      token
    );

    if (response) {
      console.log("Booked slot completed successfully:", response);
      return response;
    } else {
      throw new Error("Invalid response format for completing booked slot.");
    }
  } catch (error) {
    console.error("Failed to complete booked slot:", error.message);
    throw error;
  }
}

/**
 * Fetch tutor bookings with pagination.
 * @param {number} page - Page number (default: 1)
 * @param {number} pageSize - Number of items per page (default: 10)
 * @returns {Promise<Object>} API response with tutor booking data
 */
export async function fetchTutorBookings(page = 1, pageSize = 10) {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    const response = await callApi(
      `/api/booking/tutor?page=${page}&pageSize=${pageSize}`,
      "GET",
      null,
      token
    );

    if (response && response.data) {
      console.log("Tutor bookings fetched successfully:", response.data);
      return response.data;
    } else {
      throw new Error("Invalid response format for tutor bookings.");
    }
  } catch (error) {
    console.error("Failed to fetch tutor bookings:", error.message);
    throw error;
  }
}

/**
 * Process a withdrawal request (approve: 0 -> 2).
 * @param {string} withdrawalId - The ID of the withdrawal request to process
 * @returns {Promise<Object>} API response
 */
export async function processWithdrawal(withdrawalId) {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    const response = await callApi("/api/withdrawals/process", "POST", { withdrawalId }, token);

    if (response) {
      console.log("Withdrawal processed successfully:", response);
      return response;
    } else {
      throw new Error("Invalid response format for withdrawal processing.");
    }
  } catch (error) {
    console.error("Failed to process withdrawal:", error.message);
    throw error;
  }
}

/**
 * Reject a withdrawal request (reject: 0 -> 3).
 * @param {string} withdrawalId - The ID of the withdrawal request to reject
 * @param {string} rejectionReason - The reason for rejection
 * @returns {Promise<Object>} API response
 */
export async function rejectWithdrawal(withdrawalId, rejectionReason) {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    const response = await callApi("/api/withdrawals/reject", "POST", { 
      withdrawalId, 
      rejectionReason 
    }, token);

    if (response) {
      console.log("Withdrawal rejected successfully:", response);
      return response;
    } else {
      throw new Error("Invalid response format for withdrawal rejection.");
    }
  } catch (error) {
    console.error("Failed to reject withdrawal:", error.message);
    throw error;
  }
}

/**
 * Get tutor ratings and reviews
 * @param {string} tutorId - The tutor ID to get ratings for
 * @param {number} page - Page number (default: 1)
 * @param {number} size - Number of items per page (default: 10)
 * @returns {Promise<Object>} Tutor rating data with averages and reviews
 */
export async function fetchTutorRating(tutorId, page = 1, size = 10) {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    const response = await callApi(
      `/api/booking-slot-rating/tutor/${tutorId}?page=${page}&size=${size}`,
      "GET",
      null,
      token
    );
    
    if (response && response.data) {
      console.log("✅ Tutor rating fetched successfully:", response.data);
      return response.data;
    } else {
      throw new Error("Invalid response format for tutor rating.");
    }
  } catch (error) {
    console.error("❌ Failed to fetch tutor rating:", error.message);
    throw error;
  }
}

// ==================== DISPUTE API FUNCTIONS ====================

/**
 * Create a new dispute/complaint
 * @param {Object} disputeData - { bookingId, reason, evidenceUrls }
 * @returns {Promise<Object>} API response
 */
export async function createDispute(disputeData) {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    // Validate reason length (minimum 10 characters)
    if (!disputeData.reason || disputeData.reason.length < 10) {
      throw new Error("Reason must be at least 10 characters long");
    }

    const response = await callApi("/api/disputes", "POST", disputeData, token);

    if (response) {
      console.log("✅ Dispute created successfully:", response);
      return response;
    } else {
      throw new Error("Invalid response format for dispute creation.");
    }
  } catch (error) {
    console.error("❌ Failed to create dispute:", error.message);
    throw error;
  }
}

/**
 * Fetch disputes for learners
 * @param {boolean} onlyActive - Only show active disputes (default: false)
 * @returns {Promise<Object>} API response with dispute data and metadata
 */
export async function fetchLearnerDisputes(onlyActive = false) {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    const params = new URLSearchParams({
      onlyActive: onlyActive.toString()
    });

    const response = await callApi(
      `/api/disputes/learner?${params.toString()}`,
      "GET",
      null,
      token
    );

    if (response) {
      console.log("✅ Learner disputes fetched successfully:", response);
      return response;
    } else {
      throw new Error("Invalid response format for learner disputes.");
    }
  } catch (error) {
    console.error("❌ Failed to fetch learner disputes:", error.message);
    throw error;
  }
}

/**
 * Fetch disputes for tutors with pagination
 * @param {number} page - Page number (default: 1)
 * @param {number} pageSize - Number of items per page (default: 10)
 * @param {string} status - Filter by status (optional)
 * @returns {Promise<Object>} API response with dispute data
 */
export async function fetchTutorDisputes(page = 1, pageSize = 10, status = null) {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString()
    });

    if (status) {
      params.append('status', status);
    }

    const response = await callApi(
      `/api/disputes/tutor?${params.toString()}`,
      "GET",
      null,
      token
    );

    if (response) {
      console.log("✅ Tutor disputes fetched successfully:", response);
      return response; // Return the entire response object
    } else {
      throw new Error("Invalid response format for tutor disputes.");
    }
  } catch (error) {
    console.error("❌ Failed to fetch tutor disputes:", error.message);
    throw error;
  }
}

/**
 * Fetch dispute details by ID for learners
 * @param {string} disputeId - The dispute ID
 * @returns {Promise<Object>} API response with detailed dispute data
 */
export async function fetchLearnerDisputeDetail(disputeId) {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    const response = await callApi(
      `/api/disputes/learner/${disputeId}`,
      "GET",
      null,
      token
    );

    if (response) {
      console.log("✅ Learner dispute detail fetched successfully:", response);
      return response; // Return the entire response object
    } else {
      throw new Error("Invalid response format for learner dispute detail.");
    }
  } catch (error) {
    console.error("❌ Failed to fetch learner dispute detail:", error.message);
    throw error;
  }
}

/**
 * Fetch dispute details by ID for tutors
 * @param {string} disputeId - The dispute ID
 * @returns {Promise<Object>} API response with detailed dispute data
 */
export async function fetchTutorDisputeDetail(disputeId) {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    const response = await callApi(
      `/api/disputes/tutor/${disputeId}`,
      "GET",
      null,
      token
    );

    if (response) {
      console.log("✅ Tutor dispute detail fetched successfully:", response);
      return response; // Return the entire response object
    } else {
      throw new Error("Invalid response format for tutor dispute detail.");
    }
  } catch (error) {
    console.error("❌ Failed to fetch tutor dispute detail:", error.message);
    throw error;
  }
}

/**
 * Respond to a dispute (add comment/response)
 * @param {Object} responseData - { disputeId, response }
 * @returns {Promise<Object>} API response
 */
export async function respondToDispute(responseData) {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    const response = await callApi(
      `/api/disputes/respond`,
      "POST",
      responseData,
      token
    );

    if (response) {
      console.log("✅ Dispute response added successfully:", response);
      return response;
    } else {
      throw new Error("Invalid response format for adding dispute response.");
    }
  } catch (error) {
    console.error("❌ Failed to add dispute response:", error.message);
    throw error;
  }
}

/**
 * Resolve a dispute (for staff/admin only)
 * @param {Object} resolveData - { disputeId, resolution, notes }
 * @returns {Promise<Object>} API response
 */
export async function resolveDispute(resolveData) {
  try {
    // Try staff token first, then fall back to regular access token
    const staffToken = localStorage.getItem("staffToken");
    const token = staffToken || getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    console.log("🔍 Calling resolve dispute API with data:", resolveData);
    console.log("🔍 Using token:", token ? "Present" : "Not found");
    const response = await callApi(
      `/api/disputes/resolve`,
      "POST",
      resolveData,
      token
    );

    if (response) {
      console.log("✅ Dispute resolved successfully:", response);
      return response;
    } else {
      throw new Error("Invalid response format for resolving dispute.");
    }
  } catch (error) {
    console.error("❌ Failed to resolve dispute:", error.message);
    throw error;
  }
}

/**
 * Withdraw a dispute
 * @param {Object} withdrawData - { disputeId }
 * @returns {Promise<Object>} API response
 */
export async function withdrawDispute(withdrawData) {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    const response = await callApi(
      `/api/disputes/withdraw`,
      "POST",
      withdrawData,
      token
    );

    if (response) {
      console.log("✅ Dispute withdrawn successfully:", response);
      return response;
    } else {
      throw new Error("Invalid response format for withdrawing dispute.");
    }
  } catch (error) {
    console.error("❌ Failed to withdraw dispute:", error.message);
    throw error;
  }
}

// ==================== BACKWARD COMPATIBILITY ALIASES ====================

/**
 * @deprecated Use fetchLearnerDisputes instead
 */
export const fetchDisputes = fetchLearnerDisputes;

/**
 * @deprecated Use fetchLearnerDisputeDetail instead
 */
export const fetchDisputeDetail = fetchLearnerDisputeDetail;

/**
 * @deprecated Use addDisputeComment instead
 */
export const addDisputeComment = respondToDispute;

/**
 * @deprecated Use updateDisputeStatus instead
 */
export const updateDisputeStatus = resolveDispute;

/**
 * @deprecated Use fetchAllDisputes instead
 */
export const fetchAllDisputes = fetchStaffDisputes;

/**
 * Fetch dispute metadata (reasons, statuses, etc.)
 * @returns {Promise<Object>} API response with dispute metadata
 */
export async function fetchDisputeMetadata() {
  try {
    // Try staff token first, then fall back to regular access token
    const staffToken = localStorage.getItem("staffToken");
    const token = staffToken || getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    const response = await callApi(
      `/api/disputes/metadata`,
      "GET",
      null,
      token
    );

    if (response) {
      console.log("✅ Dispute metadata fetched successfully:", response);
      return response; // Return the entire response object
    } else {
      throw new Error("Invalid response format for dispute metadata.");
    }
  } catch (error) {
    console.error("❌ Failed to fetch dispute metadata:", error.message);
    throw error;
  }
}

/**
 * Fetch all disputes for staff/admin management
 * @param {Object} params - Query parameters { page, pageSize, status, priority, etc. }
 * @returns {Promise<Object>} API response with all disputes data
 */
export async function fetchStaffDisputes(params = {}) {
  try {
    // Try staff token first, then fall back to regular access token
    const staffToken = localStorage.getItem("staffToken");
    const token = staffToken || getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    // Only include non-pagination parameters
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append("status", params.status);
    if (params.search) queryParams.append("search", params.search);
    
    const url = `/api/disputes/staff${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    console.log("🔍 Calling staff disputes API:", url);
    console.log("🔍 Using token:", token ? "Present" : "Not found");
    const response = await callApi(url, "GET", null, token);

    if (response) {
      console.log("✅ Staff disputes fetched successfully:", response);
      return response; // Return the entire response object
    } else {
      throw new Error("Invalid response format for staff disputes.");
    }
  } catch (error) {
    console.error("❌ Failed to fetch staff disputes:", error.message);
    throw error;
  }
}

/**
 * Fetch filtered disputes for staff/admin management with advanced filtering
 * @param {Object} params - Query parameters { 
 *   ResolutionFilter: array[integer], 
 *   CaseNumber: string, 
 *   PageIndex: integer, 
 *   PageSize: integer 
 * }
 * @returns {Promise<Object>} API response with filtered disputes data and metadata
 */
export async function fetchStaffDisputesFilter(params = {}) {
  try {
    // Try staff token first, then fall back to regular access token
    const staffToken = localStorage.getItem("staffToken");
    const token = staffToken || getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    // Build query parameters
    const queryParams = new URLSearchParams();
    
    // Add ResolutionFilter (array of integers)
    if (params.ResolutionFilter && Array.isArray(params.ResolutionFilter) && params.ResolutionFilter.length > 0) {
      params.ResolutionFilter.forEach(resolution => {
        queryParams.append("ResolutionFilter", resolution.toString());
      });
    }
    
    // Add CaseNumber (string)
    if (params.CaseNumber) {
      queryParams.append("CaseNumber", params.CaseNumber);
    }
    
    // Add PageIndex (integer)
    if (params.PageIndex !== undefined && params.PageIndex !== null) {
      queryParams.append("PageIndex", params.PageIndex.toString());
    }
    
    // Add PageSize (integer)
    if (params.PageSize !== undefined && params.PageSize !== null) {
      queryParams.append("PageSize", params.PageSize.toString());
    }
    
    const url = `/api/disputes/staff/filter${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    console.log("🔍 Calling staff disputes filter API:", url);
    console.log("🔍 Using token:", token ? "Present" : "Not found");
    console.log("🔍 Filter params:", params);
    
    const response = await callApi(url, "GET", null, token);

    if (response) {
      console.log("✅ Staff disputes filter fetched successfully:", response);
      return response; // Return the entire response object
    } else {
      throw new Error("Invalid response format for staff disputes filter.");
    }
  } catch (error) {
    console.error("❌ Failed to fetch staff disputes filter:", error.message);
    throw error;
  }
}

/**
 * Fetch dispute details by ID for staff
 * @param {string} disputeId - The dispute ID
 * @returns {Promise<Object>} API response with detailed dispute data
 */
export async function fetchStaffDisputeDetail(disputeId) {
  try {
    // Try staff token first, then fall back to regular access token
    const staffToken = localStorage.getItem("staffToken");
    const token = staffToken || getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    console.log("🔍 Calling staff dispute detail API:", `/api/disputes/staff/${disputeId}`);
    console.log("🔍 Using token:", token ? "Present" : "Not found");
    const response = await callApi(
      `/api/disputes/staff/${disputeId}`,
      "GET",
      null,
      token
    );

    if (response) {
      console.log("✅ Staff dispute detail fetched successfully:", response);
      return response; // Return the entire response object
    } else {
      throw new Error("Invalid response format for staff dispute detail.");
    }
  } catch (error) {
    console.error("❌ Failed to fetch staff dispute detail:", error.message);
    throw error;
  }
}



/**
 * Get manager financial overview data
 * @returns {Promise<Object>} Financial overview data including totals and status definitions
 */
export async function managerFinancialOverview() {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    const response = await callApi("/api/manager/financial-overview", "GET", null, token);

    if (response && response.data) {
      console.log("✅ Manager financial overview fetched successfully:", response.data);
      return response.data;
    } else {
      console.error("Invalid API response format for managerFinancialOverview:", response);
      throw new Error("API response did not contain expected financial overview data.");
    }
  } catch (error) {
    console.error("❌ Failed to fetch manager financial overview:", error.message);
    throw error;
  }
}

/**
 * Get manager financial overview metadata
 * @returns {Promise<Object>} Financial overview metadata including status definitions and component descriptions
 */
export async function managerFinancialOverviewMetadata() {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    const response = await callApi("/api/manager/financial-overview/metadata", "GET", null, token);

    if (response && response.data) {
      console.log("✅ Manager financial overview metadata fetched successfully:", response.data);
      return response.data;
    } else {
      console.error("Invalid API response format for managerFinancialOverviewMetadata:", response);
      throw new Error("API response did not contain expected financial overview metadata.");
    }
  } catch (error) {
    console.error("❌ Failed to fetch manager financial overview metadata:", error.message);
    throw error;
  }
}

/**
 * Get manager wallet balances data
 * @returns {Promise<Object>} Wallet balances data including totals and wallet information
 */
export async function managerWalletBalances() {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    const response = await callApi("/api/manager/wallet-balances", "GET", null, token);

    if (response && response.data) {
      console.log("✅ Manager wallet balances fetched successfully:", response.data);
      return response.data;
    } else {
      console.error("Invalid API response format for managerWalletBalances:", response);
      throw new Error("API response did not contain expected wallet balances data.");
    }
  } catch (error) {
    console.error("❌ Failed to fetch manager wallet balances:", error.message);
    throw error;
  }
}

/**
 * Get manager wallet balances metadata
 * @returns {Promise<Object>} Wallet balances metadata including wallet types and status definitions
 */
export async function managerWalletBalancesMetadata() {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    const response = await callApi("/api/manager/wallet-balances/metadata", "GET", null, token);

    if (response && response.data) {
      console.log("✅ Manager wallet balances metadata fetched successfully:", response.data);
      return response.data;
    } else {
      console.error("Invalid API response format for managerWalletBalancesMetadata:", response);
      throw new Error("API response did not contain expected wallet balances metadata.");
    }
  } catch (error) {
    console.error("❌ Failed to fetch manager wallet balances metadata:", error.message);
    throw error;
  }
}

/**
 * Get manager transaction summary data
 * @param {string} fromDate - Start date in ISO format (YYYY-MM-DD)
 * @param {string} toDate - End date in ISO format (YYYY-MM-DD)
 * @returns {Promise<Object>} Transaction summary data including totals and transaction information
 */
export async function managerTransactionSummary(fromDate, toDate) {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    // Build query parameters with proper UTC date formatting
    const params = new URLSearchParams();
    if (fromDate) {
      // Convert date to UTC midnight for the start of the day
      const fromDateUTC = new Date(fromDate + 'T00:00:00.000Z').toISOString();
      params.append('fromDate', fromDateUTC);
    }
    if (toDate) {
      // Convert date to UTC end of day (23:59:59.999)
      const toDateUTC = new Date(toDate + 'T23:59:59.999Z').toISOString();
      params.append('toDate', toDateUTC);
    }

    const url = `/api/manager/transaction-summary${params.toString() ? `?${params.toString()}` : ''}`;
    console.log("🔍 Calling transaction summary API with URL:", url);
    console.log("🔍 Date parameters:", { fromDate, toDate, fromDateUTC: fromDate ? new Date(fromDate + 'T00:00:00.000Z').toISOString() : null, toDateUTC: toDate ? new Date(toDate + 'T23:59:59.999Z').toISOString() : null });
    
    const response = await callApi(url, "GET", null, token);

    if (response && response.data) {
      console.log("✅ Manager transaction summary fetched successfully:", response.data);
      return response.data;
    } else {
      console.error("Invalid API response format for managerTransactionSummary:", response);
      throw new Error("API response did not contain expected transaction summary data.");
    }
  } catch (error) {
    console.error("❌ Failed to fetch manager transaction summary:", error.message);
    throw error;
  }
}

/**
 * Get manager transaction summary metadata
 * @returns {Promise<Object>} Transaction summary metadata including transaction types and status definitions
 */
export async function managerTransactionSummaryMetadata() {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    const response = await callApi("/api/manager/transaction-summary/metadata", "GET", null, token);

    if (response && response.data) {
      console.log("✅ Manager transaction summary metadata fetched successfully:", response.data);
      return response.data;
    } else {
      console.error("Invalid API response format for managerTransactionSummaryMetadata:", response);
      throw new Error("API response did not contain expected transaction summary metadata.");
    }
  } catch (error) {
    console.error("❌ Failed to fetch manager transaction summary metadata:", error.message);
    throw error;
  }
}

/**
 * Get manager held funds summary data
 * @returns {Promise<Object>} Held funds summary data including totals, amounts by type/status, and metadata
 */
export async function managerHeldFunds() {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    const response = await callApi("/api/manager/held-funds-summary", "GET", null, token);

    if (response && response.data) {
      console.log("✅ Manager held funds summary fetched successfully:", response.data);
      return response.data;
    } else {
      console.error("Invalid API response format for managerHeldFunds:", response);
      throw new Error("API response did not contain expected held funds summary data.");
    }
  } catch (error) {
    console.error("❌ Failed to fetch manager held funds summary:", error.message);
    throw error;
  }
}

/**
 * Get manager held funds statistics data
 * @param {number} timeRange - Time range enum: 0=Day, 1=Week, 2=Month, 3=HalfYear, 4=Year, 5=All
 * @returns {Promise<Object>} Held funds statistics data for the specified time range
 */
export async function managerHeldFundsStatistics(timeRange = 5) {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    // Validate timeRange parameter
    if (timeRange < 0 || timeRange > 5) {
      throw new Error("Invalid timeRange parameter. Must be between 0-5 (0=Day, 1=Week, 2=Month, 3=HalfYear, 4=Year, 5=All)");
    }

    const params = new URLSearchParams({
      timeRange: timeRange.toString()
    });

    const url = `/api/manager/held-fund-statistics?${params.toString()}`;
    console.log(" Calling held funds statistics API with URL:", url);
    console.log("🔍 Time range parameter:", timeRange);
    
    const response = await callApi(url, "GET", null, token);

    if (response && response.data) {
      console.log("✅ Manager held funds statistics fetched successfully:", response.data);
      return response.data;
    } else {
      console.error("Invalid API response format for managerHeldFundsStatistics:", response);
      throw new Error("API response did not contain expected held funds statistics data.");
    }
  } catch (error) {
    console.error("❌ Failed to fetch manager held funds statistics:", error.message);
    throw error;
  }
}

/**
 * Get manager held funds summary metadata
 * @returns {Promise<Object>} Held funds summary metadata including status definitions, types, and component descriptions
 */
export async function managerHeldFundsMetadata() {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    const response = await callApi("/api/manager/held-funds-summary/metadata", "GET", null, token);

    if (response && response.data) {
      console.log("✅ Manager held funds summary metadata fetched successfully:", response.data);
      return response.data;
    } else {
      console.error("Invalid API response format for managerHeldFundsMetadata:", response);
      throw new Error("API response did not contain expected held funds summary metadata.");
    }
  } catch (error) {
    console.error("❌ Failed to fetch manager held funds summary metadata:", error.message);
    throw error;
  }
}

/**
 * Get manager held funds statistics metadata
 * @returns {Promise<Object>} Held funds statistics metadata including time ranges, status definitions, types, and component descriptions
 */
export async function managerHeldFundsStatisticsMetadata() {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    const response = await callApi("/api/manager/held-fund-statistics/metadata", "GET", null, token);

    if (response && response.data) {
      console.log("✅ Manager held funds statistics metadata fetched successfully:", response.data);
      return response.data;
    } else {
      console.error("Invalid API response format for managerHeldFundsStatisticsMetadata:", response);
      throw new Error("API response did not contain expected held funds statistics metadata.");
    }
  } catch (error) {
    console.error("❌ Failed to fetch manager held funds statistics metadata:", error.message);
    throw error;
  }
}

/**
 * Get manager transaction statistics data
 * @param {number} timeRange - Time range enum: 0=Day, 1=Week, 2=Month, 3=HalfYear, 4=Year, 5=All
 * @returns {Promise<Object>} Transaction statistics data for the specified time range
 */
export async function managerTransactionStatistics(timeRange = 5) {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    // Validate timeRange parameter
    if (timeRange < 0 || timeRange > 5) {
      throw new Error("Invalid timeRange parameter. Must be between 0-5 (0=Day, 1=Week, 2=Month, 3=HalfYear, 4=Year, 5=All)");
    }

    const params = new URLSearchParams({
      timeRange: timeRange.toString()
    });

    const url = `/api/manager/transaction-statistics?${params.toString()}`;
    console.log("🔍 Calling transaction statistics API with URL:", url);
    console.log("🔍 Time range parameter:", timeRange);
    
    const response = await callApi(url, "GET", null, token);

    if (response && response.data) {
      console.log("✅ Manager transaction statistics fetched successfully:", response.data);
      return response.data;
    } else {
      console.error("Invalid API response format for managerTransactionStatistics:", response);
      throw new Error("API response did not contain expected transaction statistics data.");
    }
  } catch (error) {
    console.error("❌ Failed to fetch manager transaction statistics:", error.message);
    throw error;
  }
}

/**
 * Get manager transaction statistics metadata
 * @returns {Promise<Object>} Transaction statistics metadata including time ranges, transaction types, statuses, and component descriptions
 */
export async function managerTransactionStatisticsMetadata() {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    const response = await callApi("/api/manager/transaction-statistics/metadata", "GET", null, token);

    if (response && response.data) {
      console.log("✅ Manager transaction statistics metadata fetched successfully:", response.data);
      return response.data;
    } else {
      console.error("Invalid API response format for managerTransactionStatisticsMetadata:", response);
      throw new Error("API response did not contain expected transaction statistics metadata.");
    }
  } catch (error) {
    console.error("❌ Failed to fetch manager transaction statistics metadata:", error.message);
    throw error;
  }
}

/**
 * Get manager system revenue data
 * @param {number} timeRange - Time range enum: 0=Day, 1=Week, 2=Month, 3=HalfYear, 4=Year, 5=All
 * @returns {Promise<Object>} System revenue data for the specified time range
 */
export async function managerSystemRevenue(timeRange = 5) {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    // Validate timeRange parameter
    if (timeRange < 0 || timeRange > 5) {
      throw new Error("Invalid timeRange parameter. Must be between 0-5 (0=Day, 1=Week, 2=Month, 3=HalfYear, 4=Year, 5=All)");
    }

    const params = new URLSearchParams({
      timeRange: timeRange.toString()
    });

    const url = `/api/manager/system-revenue?${params.toString()}`;
    console.log("🔍 Calling system revenue API with URL:", url);
    console.log("🔍 Time range parameter:", timeRange);
    
    const response = await callApi(url, "GET", null, token);

    if (response && response.data) {
      console.log("✅ Manager system revenue fetched successfully:", response.data);
      return response.data;
    } else {
      console.error("Invalid API response format for managerSystemRevenue:", response);
      throw new Error("API response did not contain expected system revenue data.");
    }
  } catch (error) {
    console.error("❌ Failed to fetch manager system revenue:", error.message);
    throw error;
  }
}

/**
 * Get manager system revenue metadata
 * @returns {Promise<Object>} System revenue metadata including time ranges and component descriptions
 */
export async function managerSystemRevenueMetadata() {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    const response = await callApi("/api/manager/system-revenue/metadata", "GET", null, token);

    if (response && response.data) {
      console.log("✅ Manager system revenue metadata fetched successfully:", response.data);
      return response.data;
    } else {
      console.error("Invalid API response format for managerSystemRevenueMetadata:", response);
      throw new Error("API response did not contain expected system revenue metadata.");
    }
  } catch (error) {
    console.error("❌ Failed to fetch manager system revenue metadata:", error.message);
    throw error;
  }
}

/**
 * Get manager recent transactions data
 * @param {number} page - Page number (default: 1)
 * @param {number} pageSize - Number of items per page (default: 10)
 * @returns {Promise<Object>} Recent transactions data including items and pagination info
 */
export async function managerRecentTransactions(page = 1, pageSize = 10) {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString()
    });

    const url = `/api/manager/recent-transactions?${params.toString()}`;
    console.log("🔍 Calling recent transactions API with URL:", url);
    console.log("🔍 Parameters:", { page, pageSize });
    
    const response = await callApi(url, "GET", null, token);

    if (response && response.data) {
      console.log("✅ Manager recent transactions fetched successfully:", response.data);
      return response.data;
    } else {
      console.error("Invalid API response format for managerRecentTransactions:", response);
      throw new Error("API response did not contain expected recent transactions data.");
    }
  } catch (error) {
    console.error("❌ Failed to fetch manager recent transactions:", error.message);
    throw error;
  }
}

/**
 * Get manager recent transactions metadata
 * @returns {Promise<Object>} Recent transactions metadata including transaction types, statuses, and component descriptions
 */
export async function managerRecentTransactionsMetadata() {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    const response = await callApi("/api/manager/recent-transactions/metadata", "GET", null, token);

    if (response && response.data) {
      console.log("✅ Manager recent transactions metadata fetched successfully:", response.data);
      return response.data;
    } else {
      console.error("Invalid API response format for managerRecentTransactionsMetadata:", response);
      throw new Error("API response did not contain expected recent transactions metadata.");
    }
  } catch (error) {
    console.error("❌ Failed to fetch manager recent transactions metadata:", error.message);
    throw error;
  }
}

/**
 * Get manager top tutors data
 * @param {number} top - Number of top tutors to fetch (default: 10)
 * @param {number} timeRange - Time range enum: 0=Day, 1=Week, 2=Month, 3=HalfYear, 4=Year, 5=All (default: 5)
 * @returns {Promise<Object>} Top tutors data including tutor information and revenue statistics
 */
export async function managerTopTutors(top = 10, timeRange = 5) {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    // Validate parameters
    if (top < 1 || top > 100) {
      throw new Error("Top parameter must be between 1 and 100");
    }
    if (timeRange < 0 || timeRange > 5) {
      throw new Error("Invalid timeRange parameter. Must be between 0-5 (0=Day, 1=Week, 2=Month, 3=HalfYear, 4=Year, 5=All)");
    }

    const params = new URLSearchParams({
      top: top.toString(),
      timeRange: timeRange.toString()
    });

    const url = `/api/manager/top-tutors?${params.toString()}`;
    console.log(" Calling top tutors API with URL:", url);
    console.log("🔍 Parameters:", { top, timeRange });
    
    const response = await callApi(url, "GET", null, token);

    if (response && response.data) {
      console.log("✅ Manager top tutors fetched successfully:", response.data);
      return response.data;
    } else {
      console.error("Invalid API response format for managerTopTutors:", response);
      throw new Error("API response did not contain expected top tutors data.");
    }
  } catch (error) {
    console.error("❌ Failed to fetch manager top tutors:", error.message);
    throw error;
  }
}

/**
 * Get manager top tutors metadata
 * @returns {Promise<Object>} Top tutors metadata including time ranges and component descriptions
 */
export async function managerTopTutorsMetadata() {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    const response = await callApi("/api/manager/top-tutors/metadata", "GET", null, token);

    if (response && response.data) {
      console.log("✅ Manager top tutors metadata fetched successfully:", response.data);
      return response.data;
    } else {
      console.error("Invalid API response format for managerTopTutorsMetadata:", response);
      throw new Error("API response did not contain expected top tutors metadata.");
    }
  } catch (error) {
    console.error("❌ Failed to fetch manager top tutors metadata:", error.message);
    throw error;
  }
}

/**
 * Get admin users management data with filtering and pagination
 * @param {Object} params - Query parameters { Name, IsActive, Role, PageIndex, PageSize }
 * @returns {Promise<Object>} API response with users data and metadata
 */
export async function adminManageUsers(params = {}) {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    // Build query parameters
    const queryParams = new URLSearchParams();
    
    // Add optional filter parameters
    if (params.Name) {
      queryParams.append('Name', params.Name);
    }
    
    if (params.IsActive !== undefined && params.IsActive !== null) {
      queryParams.append('IsActive', params.IsActive.toString());
    }
    
    if (params.Role) {
      queryParams.append('Role', params.Role);
    }
    
    // Add pagination parameters with defaults
    queryParams.append('PageIndex', (params.PageIndex || 0).toString());
    queryParams.append('PageSize', (params.PageSize || 10).toString());

    const url = `/api/admin/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    console.log("🔍 Calling admin manage users API:", url);
    console.log("🔍 Parameters:", params);
    
    const response = await callApi(url, "GET", null, token);

    if (response) {
      console.log("✅ Admin users management data fetched successfully:", response);
      return response; // Return the entire response object
    } else {
      throw new Error("Invalid response format for admin users management.");
    }
  } catch (error) {
    console.error("❌ Failed to fetch admin users management data:", error.message);
    throw error;
  }
}

/**
 * Delete/disable a user by admin
 * @param {string} userId - The ID of the user to delete/disable
 * @returns {Promise<Object>} API response
 */
export async function adminDeleteUsers(userId) {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    if (!userId) {
      throw new Error("User ID is required");
    }

    const response = await callApi(`/api/admin/${userId}`, "DELETE", null, token);

    if (response) {
      console.log("✅ User deleted/disabled successfully:", response);
      return response;
    } else {
      throw new Error("Invalid response format for user deletion.");
    }
  } catch (error) {
    console.error("❌ Failed to delete/disable user:", error.message);
    throw error;
  }
}

/**
 * Get staff tutor applications with filtering and pagination
 * @param {Object} params - Query parameters { status, page, size }
 * @returns {Promise<Object>} API response with tutor applications data and pagination info
 */
export async function staffFetchTutorApplications(params = {}) {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    // Build query parameters
    const queryParams = new URLSearchParams();
    
    // Add optional filter parameters
    if (params.status !== undefined && params.status !== null) {
      queryParams.append('status', params.status.toString());
    }
    
    // Add pagination parameters with defaults
    queryParams.append('page', (params.page || 1).toString());
    queryParams.append('size', (params.size || 20).toString());

    const url = `/api/tutorapplication/staff/applications${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    console.log("🔍 Calling staff tutor applications API:", url);
    console.log("🔍 Parameters:", params);
    
    const response = await callApi(url, "GET", null, token);

    if (response) {
      console.log("✅ Staff tutor applications fetched successfully:", response);
      return response; // Return the entire response object
    } else {
      throw new Error("Invalid response format for staff tutor applications.");
    }
  } catch (error) {
    console.error("❌ Failed to fetch staff tutor applications:", error.message);
    throw error;
  }
}

/**
 * Get staff tutor applications metadata
 * @returns {Promise<Object>} API response with tutor applications metadata including status definitions and process descriptions
 */
export async function staffFetchTutorApplicationsMetadata() {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    const response = await callApi("/api/tutorapplication/staff/metadata", "GET", null, token);

    if (response && response.data) {
      console.log("✅ Staff tutor applications metadata fetched successfully:", response.data);
      return response.data;
    } else {
      console.error("Invalid API response format for staffFetchTutorApplicationsMetadata:", response);
      throw new Error("API response did not contain expected tutor applications metadata.");
    }
  } catch (error) {
    console.error("❌ Failed to fetch staff tutor applications metadata:", error.message);
    throw error;
  }
}

/**
 * Fetch tutor weekly patterns list by tutor ID
 * @param {string} tutorId - The tutor ID to fetch weekly patterns for
 * @returns {Promise<Object>} API response with weekly patterns data including id, endDate, and appliedFrom
 */
export async function fetchTutorListWeeklyPatternsByTutorId(tutorId) {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    if (!tutorId) {
      throw new Error("Tutor ID is required");
    }

    const response = await callApi(
      `/api/schedule/tutors/${tutorId}/list-weekly-patterns`,
      "GET",
      null,
      token
    );

    if (response && response.data) {
      console.log("✅ Tutor weekly patterns list fetched successfully:", response.data);
      return response.data;
    } else {
      console.error("Invalid API response format for fetchTutorListWeeklyPatternsByTutorId:", response);
      throw new Error("API response did not contain expected weekly patterns data.");
    }
  } catch (error) {
    console.error("❌ Failed to fetch tutor weekly patterns list:", error.message);
    throw error;
  }
}

/**
 * Create a new weekly pattern for tutor
 * @param {Object} patternData - { appliedFrom, slots }
 * @returns {Promise<Object>} API response
 */
export async function createTutorWeeklyPattern(patternData) {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    // Validate required fields
    if (!patternData.appliedFrom) {
      throw new Error("AppliedFrom date is required");
    }
    if (!patternData.slots || !Array.isArray(patternData.slots) || patternData.slots.length === 0) {
      throw new Error("At least one slot is required");
    }

    console.log("🔍 Creating tutor weekly pattern with data:", patternData);
    
    const response = await callApi(
      "/api/schedule/weekly-pattern/create",
      "POST",
      patternData,
      token
    );

    if (response) {
      console.log("✅ Tutor weekly pattern created successfully:", response);
      return response;
    } else {
      throw new Error("Invalid response format for weekly pattern creation.");
    }
  } catch (error) {
    console.error("❌ Failed to create tutor weekly pattern:", error.message);
    throw error;
  }
}

/**
 * Fetch tutor weekly pattern detail by pattern ID
 * @param {string} patternId - The pattern ID to fetch details for
 * @returns {Promise<Object>} API response with weekly pattern detail data
 */
export async function fetchTutorWeeklyPatternDetailByPatternId(patternId) {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    if (!patternId) {
      throw new Error("Pattern ID is required");
    }

    const response = await callApi(
      `/api/schedule/weekly-pattern/detail/${patternId}`,
      "GET",
      null,
      token
    );

    if (response && response.data) {
      console.log("✅ Tutor weekly pattern detail fetched successfully:", response.data);
      return response.data;
    } else {
      console.error("Invalid API response format for fetchTutorWeeklyPatternDetailByPatternId:", response);
      throw new Error("API response did not contain expected weekly pattern detail data.");
    }
  } catch (error) {
    console.error("❌ Failed to fetch tutor weekly pattern detail:", error.message);
    throw error;
  }
}

/**
 * Update a tutor's weekly pattern by pattern ID
 * @param {string} patternId - The pattern ID to update
 * @param {Array} slots - Array of slot objects with dayInWeek and slotIndex
 * @returns {Promise<Object>} API response
 */
export async function updateTutorWeeklyPattern(patternId, slots) {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    if (!patternId) {
      throw new Error("Pattern ID is required");
    }

    if (!slots || !Array.isArray(slots) || slots.length === 0) {
      throw new Error("At least one slot is required");
    }

    // Validate slot structure
    const isValidSlot = slots.every(slot => 
      typeof slot.dayInWeek === 'number' && 
      typeof slot.slotIndex === 'number'
    );
    
    if (!isValidSlot) {
      throw new Error("Each slot must have dayInWeek and slotIndex as numbers");
    }

    console.log("🔍 Updating tutor weekly pattern with ID:", patternId);
    console.log("🔍 Slots data:", slots);
    
    const response = await callApi(
      `/api/schedule/weekly-pattern/${patternId}`,
      "PUT",
      slots,
      token
    );

    if (response) {
      console.log("✅ Tutor weekly pattern updated successfully:", response);
      return response;
    } else {
      throw new Error("Invalid response format for weekly pattern update.");
    }
  } catch (error) {
    console.error("❌ Failed to update tutor weekly pattern:", error.message);
    throw error;
  }
}

/**
 * Delete a tutor's weekly pattern by pattern ID
 * @param {string} patternId - The pattern ID to delete
 * @returns {Promise<Object>} API response
 */
export async function deleteTutorWeeklyPattern(patternId) {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    if (!patternId) {
      throw new Error("Pattern ID is required");
    }

    console.log("🔍 Deleting tutor weekly pattern with ID:", patternId);
    
    const response = await callApi(
      `/api/schedule/weekly-pattern/${patternId}`,
      "DELETE",
      null,
      token
    );

    if (response) {
      console.log("✅ Tutor weekly pattern deleted successfully:", response);
      return response;
    } else {
      throw new Error("Invalid response format for weekly pattern deletion.");
    }
  } catch (error) {
    console.error("❌ Failed to delete tutor weekly pattern:", error.message);
    throw error;
  }
}

/**
 * Fetch blocked slots for a weekly pattern by pattern ID
 * @param {string} patternId - The pattern ID to fetch blocked slots for
 * @returns {Promise<Object>} API response with blocked slots data and metadata
 */
export async function fetchWeeklyPatternBlockedSlotsByPatternId(patternId) {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    if (!patternId) {
      throw new Error("Pattern ID is required");
    }

    console.log("🔍 Fetching blocked slots for weekly pattern with ID:", patternId);
    
    const response = await callApi(
      `/api/schedule/weekly-pattern/${patternId}/blocked-slots`,
      "GET",
      null,
      token
    );

    if (response) {
      console.log("✅ Weekly pattern blocked slots fetched successfully:", response);
      return response; // Return the entire response object
    } else {
      throw new Error("Invalid response format for weekly pattern blocked slots.");
    }
  } catch (error) {
    console.error("❌ Failed to fetch weekly pattern blocked slots:", error.message);
    throw error;
  }
}

/**
 * Fetch tutor schedule for offering and booking
 * @param {string} tutorId - The tutor ID
 * @param {string} startDate - Start date in ISO format (YYYY-MM-DD)
 * @param {string} endDate - End date in ISO format (YYYY-MM-DD)
 * @returns {Promise<Object>} API response with schedule data and metadata
 */
export async function fetchTutorScheduleToOfferAndBook(tutorId, startDate, endDate) {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    if (!tutorId) {
      throw new Error("Tutor ID is required");
    }

    if (!startDate || !endDate) {
      throw new Error("Start date and end date are required");
    }

    // Build query parameters
    const params = new URLSearchParams({
      startDate: startDate,
      endDate: endDate
    });

    const url = `/api/schedule/tutors/${tutorId}/schedule?${params.toString()}`;
    console.log("🔍 Calling tutor schedule API:", url);
    console.log("🔍 Parameters:", { tutorId, startDate, endDate });
    
    const response = await callApi(url, "GET", null, token);

    if (response && response.data) {
      console.log("✅ Tutor schedule fetched successfully:", response.data);
      return response.data;
    } else {
      console.error("Invalid API response format for fetchTutorScheduleToOfferAndBook:", response);
      throw new Error("API response did not contain expected schedule data.");
    }
  } catch (error) {
    console.error("❌ Failed to fetch tutor schedule:", error.message);
    throw error;
  }
}

/**
 * Fetch tutor booking configuration by tutor ID
 * @param {string} tutorId - The tutor ID to fetch booking configuration for
 * @returns {Promise<Object>} API response with booking configuration data
 */
export async function fetchTutorBookingConfigByTutorId(tutorId) {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    if (!tutorId) {
      throw new Error("Tutor ID is required");
    }

    console.log("🔍 Fetching tutor booking config for tutor ID:", tutorId);
    
    const response = await callApi(
      `/api/tutor/${tutorId}/booking-config`,
      "GET",
      null,
      token
    );

    if (response && response.data) {
      console.log("✅ Tutor booking config fetched successfully:", response.data);
      return response.data;
    } else {
      console.error("Invalid API response format for fetchTutorBookingConfigByTutorId:", response);
      throw new Error("API response did not contain expected booking configuration data.");
    }
  } catch (error) {
    console.error("❌ Failed to fetch tutor booking config:", error.message);
    throw error;
  }
}

/**
 * Update tutor booking configuration
 * @param {Object} configData - { allowInstantBooking: boolean, maxInstantBookingSlots: number }
 * @returns {Promise<Object>} API response
 */
export async function updateTutorBookingConfig(configData) {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    // Validate required fields
    if (typeof configData.allowInstantBooking !== 'boolean') {
      throw new Error("allowInstantBooking must be a boolean value");
    }
    
    if (typeof configData.maxInstantBookingSlots !== 'number' || configData.maxInstantBookingSlots < 0) {
      throw new Error("maxInstantBookingSlots must be a non-negative number");
    }

    console.log("🔍 Updating tutor booking config with data:", configData);
    
    const response = await callApi(
      "/api/tutor/booking-config",
      "PUT",
      configData,
      token
    );

    if (response) {
      console.log("✅ Tutor booking config updated successfully:", response);
      return response;
    } else {
      throw new Error("Invalid response format for booking configuration update.");
    }
  } catch (error) {
    console.error("❌ Failed to update tutor booking config:", error.message);
    throw error;
  }
}

/**
 * Create an instant booking for a learner
 * @param {Object} bookingData - { tutorId: string, lessonId: string, slots: Array<{slotDate: string, slotIndex: number}> }
 * @returns {Promise<Object>} API response
 */
export async function learnerCreateInstantBooking(bookingData) {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    // Validate required fields
    if (!bookingData.tutorId) {
      throw new Error("Tutor ID is required");
    }
    
    if (!bookingData.lessonId) {
      throw new Error("Lesson ID is required");
    }
    
    if (!bookingData.slots || !Array.isArray(bookingData.slots) || bookingData.slots.length === 0) {
      throw new Error("At least one slot is required");
    }

    // Validate slot structure
    const isValidSlot = bookingData.slots.every(slot => 
      slot.slotDate && 
      typeof slot.slotIndex === 'number' && 
      slot.slotIndex >= 0
    );
    
    if (!isValidSlot) {
      throw new Error("Each slot must have slotDate and slotIndex as a non-negative number");
    }

    console.log("🔍 Creating instant booking with data:", bookingData);
    
    const response = await callApi(
      "/api/learner-bookings/instant-booking",
      "POST",
      bookingData,
      token
    );

    if (response) {
      console.log("✅ Instant booking created successfully:", response);
      return response;
    } else {
      throw new Error("Invalid response format for instant booking creation.");
    }
  } catch (error) {
    console.error("❌ Failed to create instant booking:", error.message);
    throw error;
  }
}

import { convertBookingOfferResponseToUTC7 } from '../../utils/formatCentralTimestamp';

// ==================== LEGAL DOCUMENT API FUNCTIONS ====================

/**
 * Fetch legal documents with pagination and filtering
 * @param {Object} params - Query parameters { category, page, size }
 * @returns {Promise<Object>} API response with legal documents data
 */
export async function fetchLegalDocuments(params = {}) {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    // Build query parameters
    const queryParams = new URLSearchParams();
    
    // Add pagination parameters with defaults
    queryParams.append('page', (params.page || 1).toString());
    queryParams.append('size', (params.size || 10).toString());
    
    // Add optional filter parameters
    if (params.category) {
      queryParams.append('category', params.category);
    }

    const url = `/api/legaldocument${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    console.log("🔍 Calling legal documents API:", url);
    console.log("🔍 Parameters:", params);
    
    const response = await callApi(url, "GET", null, token);

    if (response) {
      console.log("✅ Legal documents fetched successfully:", response);
      return response; // Return the entire response object
    } else {
      throw new Error("Invalid response format for legal documents.");
    }
  } catch (error) {
    console.error("❌ Failed to fetch legal documents:", error.message);
    throw error;
  }
}

/**
 * Create a new legal document
 * @param {Object} documentData - { name, description, category }
 * @returns {Promise<Object>} API response
 */
export async function createLegalDocument(documentData) {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    // Validate required fields
    if (!documentData.name || !documentData.name.trim()) {
      throw new Error("Document name is required");
    }

    console.log("🔍 Creating legal document with data:", documentData);
    console.log("🔍 Using token:", token ? "Present" : "Not found");
    
    const response = await callApi("/api/legaldocument", "POST", documentData, token);

    if (response) {
      console.log("✅ Legal document created successfully:", response);
      return response;
    } else {
      throw new Error("Invalid response format for legal document creation.");
    }
  } catch (error) {
    console.error("❌ Failed to create legal document:", error.message);
    throw error;
  }
}

/**
 * Update an existing legal document
 * @param {string} documentId - The ID of the document to update
 * @param {Object} documentData - { name, description, category }
 * @returns {Promise<Object>} API response
 */
export async function updateLegalDocument(documentId, documentData) {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    if (!documentId) {
      throw new Error("Document ID is required");
    }

    // Validate required fields
    if (!documentData.name || !documentData.name.trim()) {
      throw new Error("Document name is required");
    }

    // Prepare request body with ID included as per API specification
    const requestBody = {
      id: documentId,
      name: documentData.name,
      description: documentData.description || '',
      category: documentData.category || ''
    };

    console.log("🔍 Updating legal document with ID:", documentId);
    console.log("🔍 Update data:", requestBody);
    console.log("🔍 Using token:", token ? "Present" : "Not found");
    
    const response = await callApi("/api/legaldocument", "PUT", requestBody, token);

    if (response) {
      console.log("✅ Legal document updated successfully:", response);
      return response;
    } else {
      throw new Error("Invalid response format for legal document update.");
    }
  } catch (error) {
    console.error("❌ Failed to update legal document:", error.message);
    throw error;
  }
}

/**
 * Delete a legal document
 * @param {string} documentId - The ID of the document to delete
 * @returns {Promise<Object>} API response
 */
export async function deleteLegalDocument(documentId) {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    if (!documentId) {
      throw new Error("Document ID is required");
    }

    console.log("🔍 Deleting legal document with ID:", documentId);
    console.log("🔍 Using token:", token ? "Present" : "Not found");
    
    const response = await callApi(`/api/legaldocument/${documentId}`, "DELETE", null, token);

    if (response) {
      console.log("✅ Legal document deleted successfully:", response);
      return response;
    } else {
      throw new Error("Invalid response format for legal document deletion.");
    }
  } catch (error) {
    console.error("❌ Failed to delete legal document:", error.message);
    throw error;
  }
}

/**
 * Get a single legal document by ID
 * @param {string} documentId - The ID of the document to fetch
 * @returns {Promise<Object>} API response
 */
export async function getLegalDocumentById(documentId) {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    if (!documentId) {
      throw new Error("Document ID is required");
    }

    console.log("🔍 Fetching legal document with ID:", documentId);
    console.log("🔍 Using token:", token ? "Present" : "Not found");
    
    const response = await callApi(`/api/legaldocument/${documentId}`, "GET", null, token);

    if (response) {
      console.log("✅ Legal document fetched successfully:", response);
      return response;
    } else {
      throw new Error("Invalid response format for legal document fetch.");
    }
  } catch (error) {
    console.error("❌ Failed to fetch legal document:", error.message);
    throw error;
  }
}

// ==================== LEGAL DOCUMENT VERSION API FUNCTIONS ====================

/**
 * Fetch legal document versions with pagination and filtering
 * @param {Object} params - Query parameters { legalDocumentId, page, size }
 * @returns {Promise<Object>} API response with legal document versions data
 */
export async function fetchLegalDocumentVersions(params = {}) {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    // Check for both camelCase and PascalCase versions of the parameter
    const legalDocumentId = params.legalDocumentId || params.LegalDocumentId;
    
    if (!legalDocumentId) {
      throw new Error("Legal document ID is required");
    }

    // Build query parameters
    const queryParams = new URLSearchParams();
    
    // Add pagination parameters with defaults
    queryParams.append('page', (params.page || 1).toString());
    queryParams.append('size', (params.size || 10).toString());

    const url = `/api/legaldocument/version/${legalDocumentId}`;
    console.log("🔍 Calling legal document versions API:", url);
    console.log("🔍 Parameters:", params);
    console.log("🔍 Using legalDocumentId:", legalDocumentId);
    
    const response = await callApi(url, "GET", null, token);

    if (response) {
      console.log("✅ Legal document versions fetched successfully:", response);
      return response;
    } else {
      throw new Error("Invalid response format for legal document versions.");
    }
  } catch (error) {
    console.error("❌ Failed to fetch legal document versions:", error.message);
    throw error;
  }
}

/**
 * Create a new legal document version
 * @param {Object} versionData - { legalDocumentId, version, status, content, contentType }
 * @returns {Promise<Object>} API response
 */
export async function createLegalDocumentVersion(versionData) {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    // Validate required fields
    if (!versionData.legalDocumentId || !versionData.legalDocumentId.trim()) {
      throw new Error("Legal document ID is required");
    }
    if (!versionData.version || !versionData.version.trim()) {
      throw new Error("Version is required");
    }
    if (versionData.status === undefined || versionData.status === null) {
      throw new Error("Status is required");
    }
    if (!versionData.content || !versionData.content.trim()) {
      throw new Error("Content is required");
    }
    if (!versionData.contentType || !versionData.contentType.trim()) {
      throw new Error("Content type is required");
    }

    console.log("🔍 Creating legal document version with data:", versionData);
    console.log("🔍 Using token:", token ? "Present" : "Not found");
    
    const response = await callApi("/api/legaldocument/version", "POST", versionData, token);

    if (response) {
      console.log("✅ Legal document version created successfully:", response);
      return response;
    } else {
      throw new Error("Invalid response format for legal document version creation.");
    }
  } catch (error) {
    console.error("❌ Failed to create legal document version:", error.message);
    throw error;
  }
}

/**
 * Update an existing legal document version
 * @param {string} versionId - The ID of the version to update
 * @param {Object} versionData - { legalDocumentId, version, status, content, contentType }
 * @returns {Promise<Object>} API response
 */
export async function updateLegalDocumentVersion(versionId, versionData) {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    if (!versionId) {
      throw new Error("Version ID is required");
    }

    // Validate required fields
    if (!versionData.legalDocumentId || !versionData.legalDocumentId.trim()) {
      throw new Error("Legal document ID is required");
    }
    if (!versionData.version || !versionData.version.trim()) {
      throw new Error("Version is required");
    }
    if (versionData.status === undefined || versionData.status === null) {
      throw new Error("Status is required");
    }
    if (!versionData.content || !versionData.content.trim()) {
      throw new Error("Content is required");
    }
    if (!versionData.contentType || !versionData.contentType.trim()) {
      throw new Error("Content type is required");
    }

    // Prepare request body with ID included
    const requestBody = {
      id: versionId,
      legalDocumentId: versionData.legalDocumentId,
      version: versionData.version,
      status: versionData.status,
      content: versionData.content,
      contentType: versionData.contentType
    };

    console.log("🔍 Updating legal document version with ID:", versionId);
    console.log("🔍 Update data:", requestBody);
    console.log("🔍 Using token:", token ? "Present" : "Not found");
    
    const response = await callApi("/api/legaldocument/version", "PUT", requestBody, token);

    if (response) {
      console.log("✅ Legal document version updated successfully:", response);
      return response;
    } else {
      throw new Error("Invalid response format for legal document version update.");
    }
  } catch (error) {
    console.error("❌ Failed to update legal document version:", error.message);
    throw error;
  }
}

/**
 * Delete a legal document version
 * @param {string} versionId - The ID of the version to delete
 * @returns {Promise<Object>} API response
 */
export async function deleteLegalDocumentVersion(versionId) {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    if (!versionId) {
      throw new Error("Version ID is required");
    }

    console.log("🔍 Deleting legal document version with ID:", versionId);
    console.log("🔍 Using token:", token ? "Present" : "Not found");
    
    const response = await callApi(`/api/legaldocument/version/${versionId}`, "DELETE", null, token);

    if (response) {
      console.log("✅ Legal document version deleted successfully:", response);
      return response;
    } else {
      throw new Error("Invalid response format for legal document version deletion.");
    }
  } catch (error) {
    console.error("❌ Failed to delete legal document version:", error.message);
    throw error;
  }
}

/**
 * Fetch a single legal document version by ID
 * @param {string} versionId - The ID of the version to fetch
 * @returns {Promise<Object>} The version data
 */
export async function fetchLegalDocumentVersionById(versionId) {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    if (!versionId) {
      throw new Error("Version ID is required");
    }

    console.log("🔍 Fetching legal document version with ID:", versionId);
    console.log("🔍 Using token:", token ? "Present" : "Not found");
    
    const response = await callApi(`/api/legaldocument/version/${versionId}`, "GET", null, token);

    if (response) {
      console.log("✅ Legal document version fetched successfully:", response);
      return response;
    } else {
      throw new Error("Invalid response format for legal document version fetch.");
    }
  } catch (error) {
    console.error("❌ Failed to fetch legal document version:", error.message);
    throw error;
  }
}

/**
 * Update tutor profile information
 * @param {Object} profileData - { nickName, brief, description, teachingMethod }
 * @returns {Promise<Object>} API response
 */
export async function updateTutorProfile(profileData) {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    // Validate required fields
    if (!profileData.nickName || !profileData.nickName.trim()) {
      throw new Error("Nickname is required");
    }
    if (!profileData.brief || !profileData.brief.trim()) {
      throw new Error("Brief description is required");
    }
    if (!profileData.description || !profileData.description.trim()) {
      throw new Error("Detailed description is required");
    }
    if (!profileData.teachingMethod || !profileData.teachingMethod.trim()) {
      throw new Error("Teaching method is required");
    }

    console.log("🔍 Updating tutor profile with data:", profileData);
    console.log("🔍 Using token:", token ? "Present" : "Not found");
    
    const response = await callApi("/api/tutor/update-profile", "PUT", profileData, token);

    if (response) {
      console.log("✅ Tutor profile updated successfully:", response);
      return response;
    } else {
      throw new Error("Invalid response format for tutor profile update.");
    }
  } catch (error) {
    console.error("❌ Failed to update tutor profile:", error.message);
    throw error;
  }
}