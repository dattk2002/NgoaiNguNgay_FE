// Read the API base URL from environment variables specific to Vite
const API_URL = import.meta.env.VITE_API_BASE_URL;

// Optional: Add a check or default if the variable is not set
if (!API_URL) {
  console.error("Error: VITE_API_BASE_URL environment variable is not set! Check your .env file.");
  // You might want to throw an error or set a default fallback,
  // but using a default might hide configuration issues.
}

// Generic function for making API calls
async function callApi(endpoint, method, body, token) {
  const headers = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
    });

    const result = await response.json();

    if (!response.ok) {
      // Prefer errorMessage from API, fallback to a generic message
      throw new Error(result.errorMessage || "Lỗi khi gọi API");
    }

    return result; // Assuming ApiResponse structure { data, message, statusCode, code, errorMessage? }
  } catch (error) {
    console.error(`Lỗi khi gọi API ${endpoint}:`, error);
    // Re-throw the error to be handled by the caller
    throw error;
  }
}

// Mock API function for frontend testing (optional)
async function mockApi(endpoint, mockData) {
  // Simulate network delay
  console.log(`[Mock API] Called: ${endpoint}`); // Log mock calls
  await new Promise((resolve) => setTimeout(resolve, 500));
  const response = {
    data: mockData,
    message: "Thành công (mock)",
    statusCode: 200,
    code: "Success",
  };
  console.log(`[Mock API] Response for ${endpoint}:`, response); // Log mock response
  return response;
}

// Login function - Refactored for MockAPI endpoint validation
export async function login(email, password) { // Use email as the primary identifier
  const MOCK_API_URL = "https://65f80579b4f842e80886a1dc.mockapi.io/login";

  console.log(`[Mock API Login] Attempting login for: ${email}`);

  try {
    // Fetch the predefined data from the MockAPI endpoint
    const response = await fetch(MOCK_API_URL, {
      method: "GET", // MockAPI often uses GET for retrieving predefined data
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Lỗi khi gọi MockAPI: ${response.statusText} (${response.status})`);
    }

    const mockApiResponseArray = await response.json();

    // Validate response structure (expecting an array with at least two elements)
    if (!Array.isArray(mockApiResponseArray) || mockApiResponseArray.length < 2) {
      console.error("Invalid or unexpected response structure from MockAPI:", mockApiResponseArray);
      throw new Error("Phản hồi không hợp lệ từ MockAPI.");
    }

    // Extract the potential credential data (assuming it's the second element)
    // And the actual success response data (assuming it's the first element)
    const successLoginData = mockApiResponseArray[0];
    const credentialData = mockApiResponseArray[1];

    // Validate the structure of the credential and success data objects
    if (!credentialData || typeof credentialData.email !== 'string' || typeof credentialData.password !== 'string' ||
        !successLoginData || !successLoginData.data?.token?.user || !successLoginData.data?.token?.accessToken) {
        console.error("Invalid data structure within MockAPI response elements:", mockApiResponseArray);
        throw new Error("Dữ liệu trả về từ MockAPI không đúng định dạng.");
    }

    // Perform validation: Compare input email/password with the credential data from the API
    // Using credentialData.email here because the mock data has 'email', not 'username' for the check
    if (email === credentialData.email && password === credentialData.password) {
      console.log(`[Mock API Login] Credentials validated successfully for: ${email}`);
      console.log("[Mock API Login] Mock Response Data:", successLoginData);

      // Extract token and user details from the successful login data (first element)
      const userTokenData = successLoginData.data.token;
      const userDetails = userTokenData.user;

      // Store tokens and user details in localStorage
      localStorage.setItem("accessToken", userTokenData.accessToken);
      localStorage.setItem("refreshToken", userTokenData.refreshToken);
      localStorage.setItem("user", JSON.stringify(userDetails));

      // Return the successful login data structure
      return successLoginData;
    } else {
      // Credentials don't match the ones fetched from the mock endpoint
      console.log(`[Login Failed] Invalid credentials provided for: ${email}`);
      // Use a generic error message similar to a real API
      throw new Error("Email hoặc mật khẩu không đúng.");
    }
  } catch (error) {
    console.error(`Lỗi khi đăng nhập:`, error);
    // Re-throw the error message to be caught by the component
    throw error; // Keep the specific error message (e.g., "Email hoặc mật khẩu không đúng.")
  }
}

// Mock Login function (optional) - Keep or remove as needed
export async function mockLogin(username, password) { // Added parameters for consistency, though not used in mock
  console.log(`[Mock Login] Attempting mock login for user: ${username}`);
  const mockData = {
    token: {
      accessToken: "mock_access_token_12345",
      refreshToken: "mock_refresh_token_67890",
      user: {
        id: "mock_user_id_abc",
        username: username || "mock.user@example.com", // Use provided username or default
        email: username || "mock.user@example.com",
        fullName: "Mock Test User",
        role: "Member",
      },
    },
    role: "Member", // Included role directly as in original TS example
  };
  // Simulate storing in localStorage like the real function would upon success
  localStorage.setItem("accessToken", mockData.token.accessToken);
  localStorage.setItem("refreshToken", mockData.token.refreshToken);
  localStorage.setItem("user", JSON.stringify(mockData.token.user));

  return mockApi("login", mockData); // Use mockApi to simulate structure and delay
}

// Register function
export async function register(
  email,
  password,
  confirmPassword,
  roleName,
  fullName, // Optional
  dateOfBirth, // Optional
  placeOfBirth // Optional
) {
  const body = {
    email,
    password,
    confirmPassword,
    roleName,
    name: fullName, // Map fullName to name if API expects 'name'
    dateOfBirth,
    placeOfBirth,
  };
  // Remove undefined optional fields if necessary, depending on API requirements
  Object.keys(body).forEach(key => body[key] === undefined && delete body[key]);

  return callApi("register", "POST", body);
}

// Mock Register function (optional)
// export async function mockRegister() {
//   return mockApi("register", null);
// }

// Confirm Email OTP function
export async function confirmEmail(email, otp) {
  const body = { email, otp };
  return callApi("confirm-email", "PATCH", body);
}

// Mock Confirm Email function (optional)
// export async function mockConfirmEmail() {
//   return mockApi("confirm-email", null);
// }

// Forgot Password request function
export async function forgotPassword(email) {
  const body = { email };
  return callApi("forgot-password", "POST", body);
}

// Mock Forgot Password function (optional)
// export async function mockForgotPassword() {
//   return mockApi("forgot-password", null);
// }

// Confirm Reset Password OTP function
export async function confirmResetPassword(email, otp) {
  const body = { email, otp };
  return callApi("confirm-reset-password", "PATCH", body);
}

// Mock Confirm Reset Password function (optional)
// export async function mockConfirmResetPassword() {
//   return mockApi("confirm-reset-password", null);
// }

// Reset Password function
export async function resetPassword(email, password, confirmPassword) {
  const body = { email, password, confirmPassword };
  return callApi("reset-password", "PATCH", body);
}

// Mock Reset Password function (optional)
// export async function mockResetPassword() {
//   return mockApi("reset-password", null);
// }

// Refresh Token function
export async function refreshToken(refreshTokenValue) {
  // Renamed parameter to avoid conflict with function name
  const body = { refreshToken: refreshTokenValue };
  const response = await callApi("refresh-token", "POST", body);

  // Update tokens in localStorage
  if (response.data) {
    localStorage.setItem("accessToken", response.data.accessToken);
    localStorage.setItem("refreshToken", response.data.refreshToken);
  }

  return response;
}

// Mock Refresh Token function (optional)
// export async function mockRefreshToken() {
//   const mockData = {
//     accessToken: "mock_new_access_token",
//     refreshToken: "mock_new_refresh_token",
//     user: {
//       id: "mock_id",
//       username: "test@example.com",
//       email: "test@example.com",
//       fullName: "Test User",
//       role: "Member",
//     },
//   };
//   return mockApi("refresh-token", mockData);
// }

// Logout function
export async function logout(refreshTokenValue) {
  // Renamed parameter to avoid conflict with function name
  const body = { refreshToken: refreshTokenValue };
  // Call API even if token is missing, let backend handle invalid/missing token case
  const response = await callApi("logout", "DELETE", body);

  // Clear local storage regardless of API response for logout
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");

  return response;
}

// Mock Logout function (optional)
// export async function mockLogout() {
//   // Simulate clearing local storage
//   localStorage.removeItem("accessToken");
//   localStorage.removeItem("refreshToken");
//   localStorage.removeItem("user");
//   return mockApi("logout", null);
// }


// --- Local Storage Helper Functions ---

// Get stored user data from localStorage
export function getStoredUser() {
  const user = localStorage.getItem("user");
  try {
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error("Error parsing stored user data:", error);
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

// Function to fetch tutors from the MockAPI endpoint
export async function fetchTutors() {
  const MOCK_TUTOR_API_URL = "https://65f80579b4f842e80886a1dc.mockapi.io/tutors";
  console.log(`[Mock API] Fetching tutors from: ${MOCK_TUTOR_API_URL}`);

  try {
    const response = await fetch(MOCK_TUTOR_API_URL);
    if (!response.ok) {
      throw new Error(`Lỗi khi gọi MockAPI tutors: ${response.statusText} (${response.status})`);
    }
    const tutorsData = await response.json();
    console.log("[Mock API] Tutors fetched successfully:", tutorsData);
    // We might need to adapt the data structure here if needed by the components
    // For now, return the raw data
    return tutorsData;
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu tutors:", error);
    throw error; // Re-throw to be handled by the component
  }
}
