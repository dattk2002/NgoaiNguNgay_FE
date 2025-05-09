// Read the API base URL from environment variables specific to Vite
const API_URL = import.meta.env.API_BASE_URL_PROD;

const BASE_API_URL = "https://localhost:7297"
// Read Mock API URLs
const LOGIN_URL = import.meta.env.API_LOGIN_URL_PROD;
const MOCK_TUTORS_URL = import.meta.env.VITE_MOCK_API_TUTORS_URL_PROD;

// Optional: Add a check or default if the variable is not set
if (!API_URL) {
  console.error(
    "Error: VITE_API_BASE_URL environment variable is not set! Check your .env file."
  );
}
// Optional: Add checks for mock URLs if they are critical
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
    "Accept": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${BASE_API_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.errorMessage || "Request failed");
    }
    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

// Mock API function for frontend testing (optional)
async function mockApi(endpoint, mockData) {
  console.log(`[Mock API] Called: ${endpoint}`);
  await new Promise((resolve) => setTimeout(resolve, 500));
  const response = {
    data: mockData,
    message: "Thành công (mock)",
    statusCode: 200,
    code: "Success",
  };
  console.log(`[Mock API] Response for ${endpoint}:`, response);
  return response;
}


// Login function - Refactored for MockAPI endpoint validation
export async function login(username, password) {
  try {
    const response = await callApi(
      "/api/auth/login",
      "POST",
      { 
        username: username,
        password: password
      }
    );

    // Kiểm tra response
    if (!response?.data?.token) {
      throw new Error(response?.message || "Invalid response format");
    }

    const { accessToken, refreshToken, user } = response.data.token;
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("user", JSON.stringify(user));

    return response;
  } catch (error) {
    console.error("Login Failed:", error);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    throw error;
  }
}

// Mock Login function (optional)
export async function mockLogin(username, password) {
  console.log(`[Mock Login] Attempting mock login for user: ${username}`);
  const mockData = {
    token: {
      accessToken: "mock_access_token_12345",
      refreshToken: "mock_refresh_token_67890",
      user: {
        id: "mock_user_id_abc",
        username: username || "mock.user@example.com",
        email: username || "mock.user@example.com",
        fullName: "Mock Test User",
        role: "Member",
      },
    },
    role: "Member",
  };
  localStorage.setItem("accessToken", mockData.token.accessToken);
  localStorage.setItem("refreshToken", mockData.token.refreshToken);
  localStorage.setItem("user", JSON.stringify(mockData.token.user));

  return mockApi("login", mockData);
}

// Register function
export async function register(
  email,
  password,
  confirmPassword,
  roleName,
  fullName,
  dateOfBirth,
  placeOfBirth
) {
  const body = {
    email,
    password,
    confirmPassword,
    roleName,
    name: fullName,
    dateOfBirth,
    placeOfBirth,
  };
  Object.keys(body).forEach(
    (key) => body[key] === undefined && delete body[key]
  );

  return callApi("register", "POST", body);
}

// Confirm Email OTP function
export async function confirmEmail(email, otp) {
  const body = { email, otp };
  return callApi("confirm-email", "PATCH", body);
}

// Forgot Password request function
export async function forgotPassword(email) {
  const body = { email };
  return callApi("forgot-password", "POST", body);
}

// Confirm Reset Password OTP function
export async function confirmResetPassword(email, otp) {
  const body = { email, otp };
  return callApi("confirm-reset-password", "PATCH", body);
}

// Reset Password function
export async function resetPassword(email, password, confirmPassword) {
  const body = { email, password, confirmPassword };
  return callApi("reset-password", "PATCH", body);
}

// Refresh Token function
export async function refreshToken(refreshTokenValue) {
  const body = { refreshToken: refreshTokenValue };
  const response = await callApi("refresh-token", "POST", body);

  if (response.data) {
    localStorage.setItem("accessToken", response.data.accessToken);
    localStorage.setItem("refreshToken", response.data.refreshToken);
  }

  return response;
}

// Logout function
export async function logout(refreshTokenValue) {
  const body = { refreshToken: refreshTokenValue };
  const response = await callApi("logout", "DELETE", body);

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

// Function to fetch a single tutor by ID from the MockAPI endpoint
export async function fetchTutorById(id) {
  const MOCK_TUTOR_API_URL = MOCK_TUTORS_URL;

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
    const response = await fetch(MOCK_TUTOR_API_URL);
    if (!response.ok) {
      throw new Error(
        `Lỗi khi gọi MockAPI tutors: ${response.statusText} (${response.status})`
      );
    }
    const tutorsData = await response.json();
    console.log("[Mock API] Tutors data:", tutorsData);

    // Find the tutor with the matching ID
    const tutor = tutorsData.find((tutor) => tutor.id === id);
    if (!tutor) {
      throw new Error(`Tutor with ID ${id} not found.`);
    }

    console.log(`[Mock API] Tutor with ID ${id} fetched successfully:`, tutor);
    return tutor;
  } catch (error) {
    console.error(`Lỗi khi lấy dữ liệu tutor với ID ${id}:`, error);
    throw error;
  }
}

// New function to fetch tutors by subject
export async function fetchTutorsBySubject(subject) {
  try {
    const tutorsData = await fetchTutors(); // Fetch all tutors
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
      `[Mock API] Tutors filtered by subject '${subject}':`,
      filteredTutors
    );
    return filteredTutors;
  } catch (error) {
    console.error(`Error fetching tutors by subject: ${subject}`, error);
    throw error;
  }
}
