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
  maxPrice = null
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

        const lastMessageObj =
          conv.messages.length > 0
            ? conv.messages[conv.messages.length - 1]
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
        const currentUser = getStoredUser();

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

export async function deleteTutorWeeklyPattern(patternId) {
  try {
    const token = getAccessToken();
    if (!token) throw new Error("Authentication token is required");
    const response = await callApi(`/api/schedule/weekly-pattern/${patternId}`, "DELETE", null, token);
    return response;
  } catch (error) {
    console.error("Failed to delete weekly pattern:", error.message);
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
    return response;
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
    if (response && response.data) {
      return response.data;
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
      return response.data;
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
      action: action, // 0 = request more info, 1 = approve, 2 = reject
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