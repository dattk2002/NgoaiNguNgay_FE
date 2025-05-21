import axios from 'axios';

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
    const response = await axios({
      method: method,
      url: fullUrl,
      headers: headers,
      data: body, // axios uses 'data' for the request body
      withCredentials: true, // corresponds to fetch's credentials: 'include'
    });

    console.log("Response:", response);

    if (!response.ok) {
      let formattedErrorMessage = `API Error: ${response.status} ${response.statusText} for ${fullUrl}`;
      let originalErrorData = null; // To potentially store the full error body

      try {
        // Clone the response before trying to read the body
        const errorResponse = response.clone();
        const errorData = await errorResponse.json();
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
      }

      // Throw an error with the formatted message and potentially attach details
      const error = new Error(formattedErrorMessage); // This error object's message property will contain the formatted string
      error.status = response.status;
      error.details = originalErrorData; // This is where the component gets the original structured data
      throw error;
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      console.log("API JSON Response:", response.data);
      return response.data; // axios puts the JSON body in response.data
    } else {
      console.warn(
        `API response for ${fullUrl} was not JSON, content-type: ${contentType}`
      );
      // Return a structure similar to the fetch non-json case
      return { success: true, status: response.status, rawResponse: response };
    }
  } catch (error) {
    console.error("API Call Failed:", error.message);

    // Axios error handling
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const formattedErrorMessage = `API Error: ${error.response.status} ${error.response.statusText} for ${fullUrl}`;
      const originalErrorData = error.response.data; // Axios puts error details in error.response.data

      console.error("API Error Details Received:", originalErrorData); // Log raw error data

      // Re-throw a new Error object similar to the original fetch implementation
      const customError = new Error(originalErrorData?.errorMessage || originalErrorData?.message || formattedErrorMessage);
      customError.status = error.response.status;
      customError.details = originalErrorData; // Attach original data for components
      throw customError;
    } else if (error.request) {
      // The request was made but no response was received
      console.error("No response received:", error.request);
      throw new Error(`API request failed: No response received for ${fullUrl}`);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Axios request setup error:", error.message);
      throw new Error(`API request setup failed: ${error.message}`);
    }
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