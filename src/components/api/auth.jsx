const BASE_API_URL = "https://tutorbooking-dev-065fe6ad4a6a.herokuapp.com";

// Read Mock API URLs (Keep these if you still need mock functionality)
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

// Generic function for making API calls
async function callApi(endpoint, method, body, token) {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Construct the full URL using the base API URL
  const fullUrl = `${BASE_API_URL}${endpoint}`; // Use BASE_API_URL consistently
  console.log(`Calling API: ${method} ${fullUrl}`);
  if (body) console.log("Request body:", body);

  try {
    const response = await fetch(fullUrl, {
      // Use fullUrl for fetch
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
      credentials: "include", // Be cautious with 'include', ensure CORS is handled correctly
    });

    // Log the raw response status
    console.log(`API Response status: ${response.status} ${response.statusText}`);

    // It's good practice to check response status before trying to parse JSON,
    // especially for non-2xx statuses which might not return JSON.
    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      let errorMessage;

      // Try to parse JSON error response if available
      if (contentType && contentType.includes("application/json")) {
        try {
          const errorData = await response.json();
          console.error("API Error response (JSON):", errorData);
          errorMessage = errorData.errorMessage || errorData.message || `API Error: ${response.status} ${response.statusText}`;
        } catch (jsonError) {
          console.error("Failed to parse error response as JSON:", jsonError);
          errorMessage = `API Error: ${response.status} ${response.statusText}`;
        }
      } else {
        try {
          // Try to get text error if not JSON
          const errorText = await response.text();
          console.error("API Error response (text):", errorText);
          errorMessage = errorText || `API Error: ${response.status} ${response.statusText}`;
        } catch (textError) {
          console.error("Failed to get error response text:", textError);
          errorMessage = `API Error: ${response.status} ${response.statusText}`;
        }
      }

      throw new Error(errorMessage);
    }

    // Handle cases where the API might return 204 No Content or similar
    // Or if the expected successful response is not JSON
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const jsonResponse = await response.json();
      console.log("API JSON Response:", jsonResponse);
      return jsonResponse;
    } else {
      // Return raw response or a default success object if no JSON is expected
      console.warn(
        `API response for ${fullUrl} was not JSON, content-type: ${contentType}`
      );
      return { success: true, status: response.status }; // Or handle as needed
    }
  } catch (error) {
    console.error("API Error:", error);
    // Re-throw the error so the calling function can handle it (e.g., display error message)
    throw error;
  }
}

// Login function - Refactored for MockAPI endpoint validation
export async function login(username, password) {
  try {
    const response = await callApi("/api/auth/login", "POST", {
      username,
      password,
    });

    if (!response || !response.data) {
      throw new Error("Invalid login response format");
    }

    const { accessToken, refreshToken, user } = response.data.token;
    console.log("User:", user); // Debug: Log the user object

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("user", JSON.stringify(user));

    return response;
  } catch (error) {
    console.error("Login Failed:", error);
    throw error;
  }
}

// Register function - MODIFIED
export async function register(
  email,
  password,
  confirmPassword
  // Removed fullName, dateOfBirth, placeOfBirth as per required body structure
) {
  const body = {
    email,
    password,
    confirmPassword,
  };
  // No need to delete undefined keys if we only include required ones
  // Object.keys(body).forEach(
  //   (key) => body[key] === undefined && delete body[key]
  // );

  // Call callApi with the correct endpoint and the new body structure
  return callApi("/api/auth/register", "POST", body);
}

// Confirm Email OTP function
export async function confirmEmail(email, otp) {
  const body = { email, otp };
  return callApi("/api/auth/confirm-email", "PATCH", body); // Correct endpoint
}

// Forgot Password request function
export async function forgotPassword(email) {
  const body = { email };
  return callApi("/api/auth/forgot-password", "POST", body); // Correct endpoint
}

// Confirm Reset Password OTP function
export async function confirmResetPassword(email, otp) {
  const body = { email, otp };
  return callApi("/api/auth/confirm-reset-password", "PATCH", body); // Correct endpoint
}

// Reset Password function
export async function resetPassword(email, password, confirmPassword) {
  const body = { email, password, confirmPassword };
  return callApi("/api/auth/reset-password", "PATCH", body); // Correct endpoint
}

// Refresh Token function
export async function refreshToken(refreshTokenValue) {
  const body = { refreshToken: refreshTokenValue };
  const response = await callApi("/api/auth/refresh-token", "POST", body); // Correct endpoint

  // Check response structure based on expected successful refresh response
  if (response?.data?.token) {
    localStorage.setItem("accessToken", response.data.token.accessToken);
    localStorage.setItem("refreshToken", response.data.token.refreshToken);
    // Update user if it's part of the refresh response and needed
    if (response.data.token.user) {
      localStorage.setItem("user", JSON.stringify(response.data.token.user));
    }
  } else {
    // Optionally clear tokens if refresh fails or returns invalid data
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    // Use response message if available, otherwise a default error
    throw new Error(
      response?.message ||
      response?.errorMessage ||
      "Invalid refresh token response"
    );
  }

  return response;
}

// Logout function
export async function logout(refreshTokenValue) {
  const body = { refreshToken: refreshTokenValue };
  // Assuming your logout endpoint is different and expects POST
  const response = await callApi("/api/auth/logout", "POST", body); // Correct endpoint

  // Clear tokens regardless of API response success for client-side state
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");

  return response;
}

// --- Local Storage Helper Functions ---

// Get stored user data from localStorage
export function getStoredUser() {
  const user = localStorage.getItem("user");
  try {
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error("Error parsing stored user data:", error);
    // Clear invalid user data from storage
    localStorage.removeItem("user");
    return null;
  }
}

// Get access token from localStorage
export function getAccessToken() {
  return localStorage.getItem("accessToken");
}

// Get refresh token from localStorage
export function getRefreshToken() {
  return localStorage.getItem("refreshToken");
}

// --- Tutor API Functions ---
// NOTE: These mock tutor functions currently bypass callApi and fetch directly
// from a mock URL. If you have a real API for tutors, you should refactor
// these to use callApi with the appropriate base URL and endpoints.

// Function to fetch tutors from the MockAPI endpoint - Keep if needed
export async function fetchTutors() {
  const MOCK_TUTOR_API_URL = MOCK_TUTORS_URL; // This still uses the Mock URL

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
    return tutorsData; // Mock API might return an array directly
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu tutors:", error);
    throw error;
  }
}

// Function to fetch a single tutor by ID from the MockAPI endpoint - Keep if needed
export async function fetchTutorById(id) {
  const MOCK_TUTOR_API_URL = MOCK_TUTORS_URL; // This still uses the Mock URL

  if (!MOCK_TUTOR_API_URL) {
    console.error(
      "Mock tutors URL is not configured in .env file (VITE_MOCK_API_TUTORS_URL)."
    );
    throw new Error("Cấu hình API bị lỗi.");
  }

  console.log(
    `[Mock API] Fetching tutor with ID: ${id} from: ${MOCK_TUTOR_API_URL}`
  );

  try {
    // NOTE: This fetches ALL tutors from the mock API and then filters.
    // A real API would typically have an endpoint like /tutors/{id}
    const response = await fetch(MOCK_TUTOR_API_URL);
    if (!response.ok) {
      throw new Error(
        `Lỗi khi gọi MockAPI tutors: ${response.statusText} (${response.status})`
      );
    }
    const tutorsData = await response.json();
    console.log("[Mock API] Tutors data:", tutorsData);

    // Find the tutor with the matching ID
    // Ensure ID matching is robust (e.g., compare numbers if IDs are numbers)
    const tutor = tutorsData.find((tutor) => String(tutor.id) === String(id));
    if (!tutor) {
      throw new Error(`Tutor with ID ${id} not found in mock data.`);
    }

    console.log(`[Mock API] Tutor with ID ${id} fetched successfully:`, tutor);
    return tutor;
  } catch (error) {
    console.error(`Lỗi khi lấy dữ liệu tutor với ID ${id}:`, error);
    throw error;
  }
}

// New function to fetch tutors by subject - Keep if needed
export async function fetchTutorsBySubject(subject) {
  // *** IMPORTANT: This currently uses the MOCK_TUTORS_URL ***
  // If you have a real API endpoint to filter tutors by subject,
  // update this to use callApi with the correct endpoint and parameters.
  // Example: return callApi(`/api/tutors/by-subject?subject=${encodeURIComponent(subject)}`, 'GET');
  try {
    // NOTE: This fetches ALL tutors from the mock API and then filters.
    // A real API would typically handle filtering on the server side.
    const tutorsData = await fetchTutors(); // Fetch all tutors from mock
    if (!subject) {
      // Consider returning all tutors or throwing a different error if subject is optional
      throw new Error("Subject parameter is required.");
    }
    const normalizedSubject =
      subject.toLowerCase() === "portuguese"
        ? "brazilian portuguese" // Adjusting for specific mock data quirk
        : subject.toLowerCase();

    const filteredTutors = tutorsData.filter(
      (tutor) =>
        tutor.nativeLanguage && // Check if nativeLanguage exists
        tutor.nativeLanguage.toLowerCase() === normalizedSubject
    );
    console.log(
      `[Mock API] Tutors filtered by subject '${subject}' (normalized: '${normalizedSubject}'):`,
      filteredTutors.length
    ); // Log count instead of full array
    // console.log(filteredTutors); // Uncomment to see the actual data

    return filteredTutors;
  } catch (error) {
    console.error(`Error fetching tutors by subject: ${subject}`, error);
    throw error;
  }
}

// Function to check if a user's email is authenticated (emailCode is null)
export function isUserAuthenticated(user) {
  return user.emailCode === null;
}

// Function to edit user profile
export async function editUserProfile(token, userData) {
  // Loại bỏ các trường có giá trị undefined hoặc null
  const body = { ...userData };
  Object.keys(body).forEach(key => {
    if (body[key] === undefined || body[key] === null) {
      delete body[key];
    }
  });

  try {
    console.log("Sending profile update with data:", body);
    const response = await callApi("/api/profile/user", "PATCH", body, token);
    return response;
  } catch (error) {
    console.error("Failed to update user profile:", error);
    throw error;
  }
}

// Function to fetch user by ID
export async function fetchUserById(id) {
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
    console.error("Failed to fetch user profile:", error);
    throw error;
  }
}

// Function to upload profile image
export async function uploadProfileImage(file) {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Authentication token not found.");
  }

  try {
    // Create FormData object for file upload
    const formData = new FormData();
    formData.append('file', file);

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
        const newImageUrl = result.data.profileImageUrl || result.data.profilePictureUrl;
        const user = getStoredUser();

        if (user) {
          user.profileImageUrl = newImageUrl;
          localStorage.setItem('user', JSON.stringify(user));
          console.log('Updated user in localStorage with new profileImageUrl:', newImageUrl);
        }
      } catch (error) {
        console.error('Error updating user in localStorage:', error);
      }
    }

    return result;
  } catch (error) {
    console.error("Failed to upload profile image:", error);
    throw error;
  }
}
