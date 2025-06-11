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
  console.log(`Calling API: ${method} ${fullUrl}`);

  try {
    // Use fetch instead of axios
    const response = await fetch(fullUrl, {
      method: method,
      headers: headers,
      body: body ? JSON.stringify(body) : null, // fetch uses 'body' for the request body, must be stringified for JSON
      credentials: 'include', // corresponds to axios's withCredentials: true
    });

    console.log("Response status:", response.status, response.statusText);

    if (!response.ok) {
      let formattedErrorMessage = `API Error: ${response.status} ${response.statusText} for ${fullUrl}`;
      let originalErrorData = null; // To potentially store the full error body

      try {
        // Try to parse the error response body as JSON
        const errorData = await response.json();
        originalErrorData = errorData; // Store the parsed data

        console.error("API Error Details Received:", errorData); // Log raw error data

        // *** Enhanced Error Message Formatting (Still useful for general error display) ***
        // This section formats the message for the 'error.message' property of the thrown Error
        // The component's catch block will primarily use error.details for structured errors,
        // but error.message is a fallback for general errors or logging.
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
            formattedErrorMessage = `Validation Error: ${fieldErrors}`; // This is the string the user saw
          } else if (typeof errorData.message === 'string') {
            formattedErrorMessage = errorData.message;
          } else {
            console.warn("Error response body did not contain recognized 'errorMessage' or 'message' format.", errorData);
          }
          if (errorData.errorCode && !formattedErrorMessage.includes(`(${errorData.errorCode})`)) {
            // Optionally add error code to the formatted message if not already included
            // formattedErrorMessage = `${formattedErrorMessage} (${errorData.errorCode})`;
          }

        } else {
          console.warn("Error response body was empty or not JSON.");
        }
        // *** End Enhanced Error Message Formatting ***

      } catch (jsonError) {
        console.warn("Failed to parse error response as JSON.", jsonError);
        // If JSON parsing fails, the original response status/text is used for the message
      }

      // Throw an error with the formatted message and potentially attach details
      const error = new Error(originalErrorData?.errorMessage || originalErrorData?.message || formattedErrorMessage); // Use specific message from details if available, otherwise fallback to formatted message
      error.status = response.status;
      error.details = originalErrorData; // This is where the component gets the original structured data
      throw error;
    }

    // Check content type and parse JSON response
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const jsonData = await response.json();
      console.log("API JSON Response:", jsonData);
      return jsonData; // fetch returns the JSON body after parsing
    } else {
      console.warn(
        `API response for ${fullUrl} was not JSON, content-type: ${contentType}`
      );
      // Return a structure indicating success but non-JSON response
      return { success: true, status: response.status, rawResponse: response };
    }
  } catch (error) {
    // Handle network errors or errors thrown during processing
    console.error("API Call Failed:", error.message);
    // Re-throw the original error, which might have details attached by the !response.ok block
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
      // This checks if the core expected structure is missing even if status was OK (unlikely for login errors)
      throw new Error("Invalid login response format received.");
    }

    const { accessToken, refreshToken, user } = response.data.token;
    console.log("User:", user);

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("user", JSON.stringify(user));

    return response;
  } catch (error) {
    console.error("Login Failed:", error.message);
    // The important part is that the original error object (with .details) is re-thrown
    throw error;
  }
}

export async function register(
  email,
  password,
  confirmPassword
) {
  const body = {
    email,
    password,
    confirmPassword,
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

export async function confirmResetPassword(email, otp) {
  const body = { email, otp };
  try {
    return await callApi("/api/auth/confirm-reset-password", "PATCH", body);
  } catch (error) {
    console.error("Confirm Reset Password Failed:", error.message);
    throw error;
  }
}

export async function resetPassword(email, password, confirmPassword) {
  const body = { email, password, confirmPassword };
  try {
    return await callApi("/api/auth/reset-password", "PATCH", body);
  } catch (error) {
    console.error("Reset Password Failed:", error.message);
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
      // Use error.message from the thrown error for the toast if details are missing
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

export async function fetchTutors() {
  const MOCK_TUTOR_API_URL = MOCK_TUTORS_URL;

  if (!MOCK_TUTOR_API_URL) {
    console.error(
      "Mock tutors URL is not configured in .env file (VITE_MOCK_API_TUTORS_URL)."
    );
    throw new Error("Cấu hình API bị lỗi.");
  }

  console.log(`[Mock API] Fetching tutors from: ${MOCK_TUTOR_API_URL}`);

  try {
    const response = await fetch(MOCK_TUTOR_API_URL);
    if (!response.ok) {
      throw new Error(
        `Lỗi khi gọi MockAPI tutors: ${response.statusText} (${response.status})`
      );
    }
    const tutorsData = await response.json();
    console.log("[Mock API] Tutors fetched successfully:", tutorsData);
    return tutorsData;
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu tutors:", error);
    throw error;
  }
}

export async function fetchTutorById(id) {
  console.log(`Fetching tutor with ID: ${id} from real API`);

  try {
    const response = await callApi(`/api/tutor/${id}`, "GET");

    if (response && response.data) {
      console.log(`Tutor with ID ${id} fetched successfully:`, response.data);
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
    console.log(
      `[Mock API] Tutors filtered by subject '${subject}' (normalized: '${normalizedSubject}'):`,
      filteredTutors.length
    );
    return filteredTutors;
  } catch (error) {
    console.error(`Error fetching tutors by subject: ${subject}`, error);
    throw error;
  }
}

export async function fetchTutorList(subject) {
  try {
    // The API URL for fetching the tutor list
    const response = await callApi("/api/tutor/list-card", "GET");
    // Assuming the actual tutor data is in response.data
    if (response && response.data) {
      let tutors = response.data; // Get the list of tutors

      // Implement filtering logic if subject is provided
      if (subject) {
        console.log(`Filtering tutor list by subject: ${subject}`);
        const normalizedSubject =
          subject.toLowerCase() === "portuguese"
            ? "brazilian portuguese"
            : subject.toLowerCase();

        tutors = tutors.filter(
          (tutor) =>
            tutor.nativeLanguage &&
            tutor.nativeLanguage.toLowerCase() === normalizedSubject
        );
        console.log(
          `Filtered tutor list by subject '${subject}' (normalized: '${normalizedSubject}'):`,
          tutors.length
        );
      }


      console.log("Fetched and potentially filtered tutor list:", tutors);
      return tutors; // Return the full or filtered list
    } else {
      console.error("Invalid API response format for tutor list:", response);
      // Throw an error if the expected data structure isn't found
      throw new Error("Invalid response format or missing data for tutor list.");
    }
  } catch (error) {
    console.error("Failed to fetch tutor list:", error.message);
    // Re-throw the error so it can be caught by the component
    throw error;
  }
}

export function isUserAuthenticated(user) {
  return user.emailCode === null;
}

export async function editUserProfile(token, updateData) {
  try {
    console.log("Sending profile update with data:", updateData);
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
    console.log("Fetching user profile data...");
    const response = await callApi(`/api/profile/user`, "GET", null, token);
    console.log("User profile API response:", response);

    if (response && response.data) {
      // Normalize data for component use
      const userData = response.data;

      // Handle response format differences if needed
      // For example, ensure gender is a number
      if (userData.gender !== undefined && typeof userData.gender === 'string') {
        userData.gender = parseInt(userData.gender, 10);
      }

      // Ensure proficiency level is a number
      if (userData.learningProficiencyLevel !== undefined &&
        typeof userData.learningProficiencyLevel === 'string') {
        userData.learningProficiencyLevel = parseInt(userData.learningProficiencyLevel, 10);
      }

      console.log("Normalized user data:", userData);
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

/**
 * Upload a profile image for the user
 * @param {File} file - The image file to upload
 * @returns {Promise<Object>} - The API response with the profile image URL
 */
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

/**
 * Delete the user's profile image
 * @returns {Promise<Object>} - The API response
 */
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

/**
 * Fetch the tutor registration profile data
 * @returns {Promise<Object>} - The API response with the profile data
 */
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

/**
 * Fetch all available hashtags
 * @returns {Promise<Array>} - The list of hashtags
 */
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

/**
 * Register as a tutor
 * @param {Object} tutorData - The tutor registration data
 * @returns {Promise<Object>} - The API response
 */
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

/**
 * Fetch tutor details by ID
 * @param {string} tutorId - The ID of the tutor to fetch
 * @returns {Promise<Object>} - The API response with the tutor data
 */
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

export async function fetchAllTutor(page = 1, size = 20) {
  try {
    // Use the existing callApi helper to fetch from the specified endpoint
    const response = await callApi(`/api/tutor/all?page=${page}&size=${size}`, "GET");

    // Check if the response contains the 'data' property which should be an array
    // callApi returns the entire JSON response object directly
    if (response && Array.isArray(response.data)) {
      console.log(`Fetched tutor list for page ${page}, size ${size}:`, response.data);
      return response.data; // Return only the array of tutors
    } else {
      console.error("Invalid API response format for fetchAllTutor:", response);
      // Throw a more specific error if the data array is missing or not an array
      throw new Error("API response did not contain expected tutor data array.");
    }
  } catch (error) {
    console.error("Failed to fetch all tutors:", error.message);
    throw error; // Re-throw the error so it can be handled by the calling component
  }
}

// New function to fetch recommended tutors
export async function fetchRecommendTutor() {
  try {
    const response = await callApi("/api/tutor/recommended-tutors", "GET");

    // The response body has a 'data' field containing the list of recommended tutors
    if (response && Array.isArray(response.data)) {
      console.log("[API] Recommended tutors fetched successfully:", response.data);
      return response.data; // Return the array of recommended tutors
    } else {
       console.error("Invalid API response format for fetchRecommendTutor:", response);
       // Throw an error if the 'data' field is missing or not an array
       throw new Error("API response did not contain expected recommended tutor data array.");
    }
  } catch (error) {
    console.error("Failed to fetch recommended tutors:", error.message);
    throw error; // Re-throw the error for error handling in components
  }
}

/**
 * Sends a chat message between a sender and a receiver.
 * @param {string} senderUserId - The ID of the user sending the message.
 * @param {string} receiverUserId - The ID of the user receiving the message.
 * @param {string} textMessage - The content of the message.
 * @returns {Promise<Object>} - The API response containing the sent message details.
 */
export async function sendMessage(senderUserId, receiverUserId, textMessage) {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("Authentication token is required to send messages.");
    }

    const body = {
      senderUserId,
      receiverUserId,
      textMessage,
    };

    const response = await callApi("/api/chat/message", "POST", body, token);

    if (response && response.data) {
      console.log("Message sent successfully:", response.data);
      return response.data; // Return the data object containing the sent message details
    } else {
      console.error("Invalid API response format for sendMessage:", response);
      throw new Error("API response did not contain expected message data.");
    }
  } catch (error) {
    console.error("Failed to send message:", error.message);
    throw error; // Re-throw the error for handling in the component
  }
}

/**
 * Fetches chat conversations for a given user.
 * @param {string} userId - The ID of the current logged-in user.
 * @param {number} page - The page number for pagination.
 * @param {number} size - The number of conversations per page.
 * @returns {Promise<Array>} - A list of formatted conversation objects.
 */
export async function fetchChatConversations(userId, page = 1, size = 20) {
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
      console.log("Chat conversations fetched successfully:", response.data);

      // Map the API response to the format expected by MessageListPage.jsx
      const formattedConversations = response.data.map((conv) => {
        // Find the other participant (not the current user)
        const otherParticipant = conv.participants.find(
          (p) => p.id !== userId
        );

        // Determine last message and timestamp
        const lastMessageObj =
          conv.messages.length > 0
            ? conv.messages[conv.messages.length - 1]
            : null;

        const lastMessageText = lastMessageObj
          ? lastMessageObj.textMessage
          : "Chưa có tin nhắn nào";

        const timestamp = lastMessageObj
          ? new Date(lastMessageObj.createdTime).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }) // Or format as desired
          : "Gần đây";

        const actualTimestamp = lastMessageObj
          ? new Date(lastMessageObj.createdTime).getTime() // Store actual timestamp for sorting
          : 0; // Default or handle no messages case

        return {
          id: conv.id, // conversation ID
          participantId: otherParticipant?.id || null, // ID of the other participant
          participantName: otherParticipant?.fullName || "Người dùng không xác định",
          participantAvatar: otherParticipant?.profilePictureUrl || "https://via.placeholder.com/40?text=Ảnh đại diện",
          lastMessage: lastMessageText,
          timestamp: timestamp,
          actualTimestamp: actualTimestamp, // New field for sorting
          unreadCount: 0, // Assuming API doesn't provide this, or can be added later
          type: "tutor", // Assuming all chat conversations are with tutors for now
          messages: conv.messages.map(msg => ({
            id: msg.id,
            sender: msg.userId === userId ? "user" : "tutor",
            text: msg.textMessage,
            timestamp: new Date(msg.createdTime).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            createdAt: msg.createdTime, // Keep this for message rendering if needed
            senderAvatar: msg.userId === userId ? (otherParticipant?.profilePictureUrl || "https://via.placeholder.com/30?text=Bạn") : (otherParticipant?.profilePictureUrl || "https://via.placeholder.com/30?text=?"),
          })),
        };
      });

      return formattedConversations;
    } else {
      console.error("Invalid API response format for fetchChatConversations:", response);
      throw new Error("API response did not contain expected conversation data array.");
    }
  } catch (error) {
    console.error("Failed to fetch chat conversations:", error.message);
    throw error;
  }
}

// New function to fetch messages for a specific conversation
/**
 * Fetches messages for a specific chat conversation.
 * @param {string} conversationId - The ID of the chat conversation.
 * @param {number} page - The page number for pagination.
 * @param {number} size - The number of messages per page.
 * @returns {Promise<Array>} - A list of formatted message objects for the conversation.
 */
export async function fetchConversationMessages(conversationId, page = 1, size = 20) {
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
      console.log(`Messages for conversation ${conversationId} fetched successfully:`, response.data.messages);

      // Extract participants for easy lookup
      const participants = response.data.participants;
      const getParticipantInfo = (userId) => {
        return participants.find(p => p.id === userId);
      };

      // Map the API response to the format expected by MessageListPage.jsx
      const formattedMessages = response.data.messages.map(msg => {
        const senderInfo = getParticipantInfo(msg.userId);
        const currentUser = getStoredUser(); // Assuming this gets the current user's data

        return {
          id: msg.id,
          sender: msg.userId, // Directly use userId as sender
          text: msg.textMessage,
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