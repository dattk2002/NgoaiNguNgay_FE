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

    // Axios throws for non-2xx status codes, so success case is simpler
    const contentType = response.headers["content-type"];
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

export function isUserAuthenticated(user) {
  return user.emailCode === null;
}

export async function editUserProfile(token, fullName, dateOfBirth, gender) {
  const body = {
    fullName,
    dateOfBirth,
    gender,
  };

  try {
    console.log("Sending profile update with data:", body);
    const response = await callApi("/api/profile/user", "PATCH", body, token);
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

export async function uploadProfileImage(file) {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Authentication token not found.");
  }

  try {
    // Create FormData object for file upload
    const formData = new FormData();
    formData.append('file', file);
    console.log("Form data:", formData);

    // For file uploads, we need to use the fetch API directly
    // since our callApi function is designed for JSON data
    const fullUrl = `${BASE_API_URL}/api/profile/image`;
    console.log(`Uploading profile image to: ${fullUrl}`);

    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      let errorMessage = `Upload failed with status: ${response.status}`;

      try {
        // Try to parse error response
        const errorData = await response.json();
        errorMessage = errorData.errorMessage || errorMessage;
      } catch (e) {
        // If we can't parse JSON, use the default error message
      }

      throw new Error(errorMessage);
    }

    // Parse the response
    const result = await response.json();
    console.log("Profile image upload response:", result);

    // Update user in localStorage to reflect the change globally
    if (result.data && (result.data.profileImageUrl || result.data.profilePictureUrl)) {
      try {
        // Get image URL from API result
        let newImageUrl = result.data.profileImageUrl || result.data.profilePictureUrl;

        // Make sure we have a clean URL without query parameters
        newImageUrl = newImageUrl.split('?')[0];

        // Add unique timestamp to ensure URL is always different
        const uniqueTimestamp = Date.now();
        const timestampedImageUrl = `${newImageUrl}?t=${uniqueTimestamp}`;

        console.log("Original image URL:", newImageUrl);
        console.log("Timestamped image URL:", timestampedImageUrl);

        // Update in localStorage
        const user = getStoredUser();
        if (user) {
          // Update the user object with the new avatar URL
          user.profileImageUrl = timestampedImageUrl;

          // Remove existing user data from localStorage
          localStorage.removeItem('user');

          // Save updated user with new avatar URL
          localStorage.setItem('user', JSON.stringify(user));
          console.log('Updated user in localStorage with new profileImageUrl:', timestampedImageUrl);

          // Forcing browser to reload tokens to break any caching
          const accessToken = getAccessToken();
          const refreshToken = getRefreshToken();

          if (accessToken) {
            localStorage.removeItem('accessToken');
            localStorage.setItem('accessToken', accessToken);
          }

          if (refreshToken) {
            localStorage.removeItem('refreshToken');
            localStorage.setItem('refreshToken', refreshToken);
          }
        }

        // Preload the image to ensure browser cache is updated
        const preloadImage = new Image();
        preloadImage.crossOrigin = "anonymous"; // Prevent CORS issues
        preloadImage.src = timestampedImageUrl;

        // Send avatar-updated event when image is loaded
        preloadImage.onload = () => {
          console.log('New avatar image preloaded successfully');

          // Remove any previous image from browser cache if possible
          const oldSrc = localStorage.getItem('previous_avatar_url');
          if (oldSrc) {
            try {
              caches.open('avatar-cache').then(cache => cache.delete(oldSrc));
            } catch (e) {
              console.log('Cache API not available or error clearing cache:', e);
            }
          }

          // Store current URL for future reference
          localStorage.setItem('previous_avatar_url', timestampedImageUrl);

          // Dispatch avatar-updated event for all components
          window.dispatchEvent(new CustomEvent('avatar-updated', {
            detail: {
              profileImageUrl: timestampedImageUrl,
              timestamp: uniqueTimestamp
            }
          }));

          // Try dispatching again after a delay to ensure all components receive it
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('avatar-updated', {
              detail: {
                profileImageUrl: timestampedImageUrl,
                timestamp: uniqueTimestamp + 1
              }
            }));

            // Dispatch storage event to notify other tabs
            window.dispatchEvent(new Event('storage'));

            // Add another timestamp to document.cookie
            document.cookie = "avatar_updated=" + uniqueTimestamp + "; path=/";

            // Updating DOM elements directly if needed
            const avatarElements = document.querySelectorAll('img[alt="User avatar"], img[alt="Profile Avatar"], img[alt="Profile"]');
            avatarElements.forEach(img => {
              // Force reload by adding a unique timestamp
              img.src = timestampedImageUrl + '&reload=' + uniqueTimestamp;
            });
          }, 300);
        };

        // Handle image loading error
        preloadImage.onerror = () => {
          console.error('Failed to preload new avatar image:', timestampedImageUrl);
          // Still try to update UI even if preload fails
          window.dispatchEvent(new CustomEvent('avatar-updated', {
            detail: {
              profileImageUrl: timestampedImageUrl,
              timestamp: uniqueTimestamp
            }
          }));
        };
      } catch (error) {
        console.error('Error updating user in localStorage:', error);
      }
    }

    // Create enhanced result with timestamped URLs
    const enhancedResult = { ...result };

    // Add timestamp to image URLs in result
    if (enhancedResult.data) {
      const timestamp = Date.now();
      if (enhancedResult.data.profileImageUrl) {
        const baseUrl = enhancedResult.data.profileImageUrl.split('?')[0];
        enhancedResult.data.profileImageUrl = `${baseUrl}?t=${timestamp}`;
      }
      if (enhancedResult.data.profilePictureUrl) {
        const baseUrl = enhancedResult.data.profilePictureUrl.split('?')[0];
        enhancedResult.data.profilePictureUrl = `${baseUrl}?t=${timestamp}`;
      }
    }

    return enhancedResult;
  } catch (error) {
    console.error("Failed to upload profile image:", error);
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