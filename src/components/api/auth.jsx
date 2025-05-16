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
    const response = await fetch(fullUrl, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
      credentials: "include",
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
      const jsonResponse = await response.json();
      console.log("API JSON Response:", jsonResponse);
      return jsonResponse;
    } else {
      console.warn(
        `API response for ${fullUrl} was not JSON, content-type: ${contentType}`
      );
      return { success: true, status: response.status, rawResponse: response };
    }
  } catch (error) {
    console.error("API Call Failed:", error.details || error.message);
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