# API Components

🔌 **Mô tả**: API client và authentication service cho NgoaiNguNgay - xử lý tất cả API calls và authentication logic.

## 🏗️ Cấu trúc components

```
src/components/api/
└── auth.jsx    # Main API client và authentication service
```

## 🔧 Chi tiết components

### 🔐 auth.jsx
**Mục đích**: Central API client với authentication, error handling, và business logic

**Core Features**:
- 🌐 **HTTP Client**: Centralized API calling
- 🔑 **Authentication**: Login, registration, OAuth
- 🔄 **Token Management**: Access/refresh token handling
- ⚠️ **Error Handling**: Comprehensive error processing
- 🛡️ **Security**: Request validation và sanitization

## 🔧 API Architecture

### 🌐 Base Configuration
```javascript
const BASE_API_URL = "https://tutorbooking-dev-065fe6ad4a6a.herokuapp.com";

// Environment URLs
const LOGIN_URL = import.meta.env.API_LOGIN_URL_PROD;
const MOCK_TUTORS_URL = import.meta.env.VITE_MOCK_API_TUTORS_URL_PROD;
```

### 🔌 Core HTTP Client
```javascript
async function callApi(endpoint, method, body, token) {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_API_URL}${endpoint}`, {
    method: method,
    headers: headers,
    body: body ? JSON.stringify(body) : null,
    credentials: 'include',
  });

  // Error handling
  if (!response.ok) {
    const errorData = await response.json();
    const error = new Error(errorData?.errorMessage || 'API Error');
    error.status = response.status;
    error.details = errorData;
    throw error;
  }

  return await response.json();
}
```

## 🔐 Authentication APIs

### 🚪 Login System
```javascript
// Standard email/password login
export async function login(username, password) {
  const response = await callApi("/api/auth/login", "POST", {
    username,
    password,
  });
  
  // Process user data và roles
  const userDetails = {
    id: response.data.token.user.id,
    fullName: response.data.token.user.fullName,
    email: response.data.token.user.email,
    role: response.data.role,
    roles: response.data.roles
  };
  
  return { ...response, userDetails };
}

// Google OAuth integration
export async function loginGoogleToFirebase(googleAccessToken) {
  const response = await callApi("/api/auth/login/google", "POST", {
    idToken: googleAccessToken
  });
  
  // Store tokens
  localStorage.setItem("accessToken", response.token.accessToken);
  localStorage.setItem("refreshToken", response.token.refreshToken);
  
  return response;
}
```

### 📝 Registration System
```javascript
export async function register(email, password, confirmPassword, fullName) {
  return await callApi("/api/auth/register", "POST", {
    email,
    password,
    confirmPassword,
    fullName
  });
}

// Email confirmation
export async function confirmEmail(token) {
  return await callApi("/api/auth/confirm-email", "POST", { token });
}
```

### 🔑 Password Management
```javascript
// Forgot password
export async function forgotPassword(email) {
  return await callApi("/api/auth/forgot-password", "POST", { email });
}

// Reset password
export async function resetPassword(token, newPassword) {
  return await callApi("/api/auth/reset-password", "POST", {
    token,
    newPassword
  });
}
```

## 👥 User Management APIs

### 👤 Profile Management
```javascript
// Get user profile
export async function fetchUserById() {
  const token = localStorage.getItem("accessToken");
  return await callApi("/api/users/profile", "GET", null, token);
}

// Update user profile
export async function updateUserProfile(profileData) {
  const token = localStorage.getItem("accessToken");
  return await callApi("/api/users/profile", "PUT", profileData, token);
}

// Upload profile image
export async function uploadUserProfileImage(imageFile) {
  const token = localStorage.getItem("accessToken");
  const formData = new FormData();
  formData.append('profileImage', imageFile);
  
  // Special handling for file upload
  const response = await fetch(`${BASE_API_URL}/api/users/profile/image`, {
    method: 'POST',
    headers: { "Authorization": `Bearer ${token}` },
    body: formData
  });
  
  return await response.json();
}
```

## 👩‍🏫 Tutor Management APIs

### 📋 Tutor Applications
```javascript
// Fetch pending tutor applications (Staff use)
export async function fetchPendingApplications(pageIndex = 1, pageSize = 20) {
  const token = localStorage.getItem("accessToken");
  return await callApi(
    `/api/tutor-applications/pending?pageIndex=${pageIndex}&pageSize=${pageSize}`,
    "GET",
    null,
    token
  );
}

// Get detailed tutor application
export async function fetchTutorApplicationById(applicationId) {
  const token = localStorage.getItem("accessToken");
  return await callApi(
    `/api/tutor-applications/${applicationId}`,
    "GET",
    null,
    token
  );
}

// Review tutor application (Staff use)
export async function reviewTutorApplication(applicationId, status, reviewNotes) {
  const token = localStorage.getItem("accessToken");
  return await callApi(
    `/api/tutor-applications/${applicationId}/review`,
    "PUT",
    { status, reviewNotes },
    token
  );
}
```

### 👨‍🎓 Student Requests
```javascript
// Learner booking time slot requests
export async function learnerBookingTimeSlotByTutorId(tutorId) {
  const token = localStorage.getItem("accessToken");
  return await callApi(
    `/api/learner-booking-timeslot/tutor/${tutorId}`,
    "GET",
    null,
    token
  );
}

// Delete booking request
export async function deleteLearnerBookingTimeSlot(tutorId) {
  const token = localStorage.getItem("accessToken");
  return await callApi(
    `/api/learner-booking-timeslot/tutor/${tutorId}`,
    "DELETE",
    null,
    token
  );
}
```

## 💰 Financial APIs

### 💸 Wallet Management
```javascript
// Get wallet balance
export async function fetchWalletBalance() {
  const token = localStorage.getItem("accessToken");
  return await callApi("/api/wallet/balance", "GET", null, token);
}

// Get wallet transactions
export async function fetchWalletTransactions() {
  const token = localStorage.getItem("accessToken");
  const response = await callApi("/api/wallet/transactions", "GET", null, token);
  return Array.isArray(response?.data) ? response.data : [];
}

// Get deposit history
export async function fetchDepositHistory() {
  const token = localStorage.getItem("accessToken");
  const response = await callApi("/api/wallet/deposits", "GET", null, token);
  return Array.isArray(response?.data) ? response.data : [];
}
```

### 💸 Withdrawal Management
```javascript
// Fetch withdrawal requests (Manager use)
export async function fetchWithdrawalRequests(params = {}) {
  const token = localStorage.getItem("accessToken");
  const queryString = new URLSearchParams(params).toString();
  const url = `/api/withdrawals${queryString ? `?${queryString}` : ''}`;
  
  return await callApi(url, "GET", null, token);
}

// Process withdrawal (Manager approve)
export async function processWithdrawal(withdrawalId) {
  const token = localStorage.getItem("accessToken");
  return await callApi(
    `/api/withdrawals/${withdrawalId}/approve`,
    "PUT",
    null,
    token
  );
}

// Reject withdrawal (Manager reject)
export async function rejectWithdrawal(withdrawalId, rejectionReason) {
  const token = localStorage.getItem("accessToken");
  return await callApi(
    `/api/withdrawals/${withdrawalId}/reject`,
    "PUT",
    { rejectionReason },
    token
  );
}
```

## 🔄 Error Handling System

### ⚠️ Error Processing
```javascript
// Comprehensive error handling
if (!response.ok) {
  let formattedErrorMessage = `API Error: ${response.status} ${response.statusText}`;
  let originalErrorData = null;

  try {
    const errorData = await response.json();
    originalErrorData = errorData;

    if (errorData) {
      if (typeof errorData.errorMessage === 'string') {
        formattedErrorMessage = errorData.errorMessage;
      } else if (typeof errorData.errorMessage === 'object') {
        // Handle validation errors
        const fieldErrors = Object.keys(errorData.errorMessage)
          .map(field => {
            const messages = Array.isArray(errorData.errorMessage[field])
              ? errorData.errorMessage[field].join(', ')
              : String(errorData.errorMessage[field]);
            return `${field}: ${messages}`;
          })
          .join('; ');
        formattedErrorMessage = `Validation Error: ${fieldErrors}`;
      }
    }
  } catch (jsonError) {
    console.warn("Failed to parse error response as JSON.");
  }

  const error = new Error(originalErrorData?.errorMessage || formattedErrorMessage);
  error.status = response.status;
  error.details = originalErrorData;
  throw error;
}
```

### 🔄 Token Management
```javascript
// Automatic token refresh
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  const response = await callApi("/api/auth/refresh", "POST", {
    refreshToken
  });

  localStorage.setItem("accessToken", response.accessToken);
  return response.accessToken;
};

// API call với automatic retry on 401
const callApiWithRetry = async (endpoint, method, body, token) => {
  try {
    return await callApi(endpoint, method, body, token);
  } catch (error) {
    if (error.status === 401) {
      // Try to refresh token và retry
      const newToken = await refreshAccessToken();
      return await callApi(endpoint, method, body, newToken);
    }
    throw error;
  }
};
```

## 🛡️ Security Features

### 🔐 Request Security
```javascript
// CSRF protection
const addCSRFToken = (headers) => {
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
  if (csrfToken) {
    headers['X-CSRF-TOKEN'] = csrfToken;
  }
  return headers;
};

// Input sanitization
const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return input.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }
  return input;
};
```

### 🔒 Token Security
```javascript
// Secure token storage
const storeSecureToken = (token) => {
  // Use httpOnly cookies in production
  if (typeof window !== 'undefined') {
    localStorage.setItem("accessToken", token);
  }
};

// Clear sensitive data on logout
export const clearAuthData = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  localStorage.removeItem("loggedInUser");
};
```

## 🔧 Data Transformation

### 📊 Response Normalization
```javascript
// Normalize API responses
const normalizeUserResponse = (apiResponse) => {
  return {
    id: apiResponse.id,
    fullName: apiResponse.fullName || apiResponse.name,
    email: apiResponse.email,
    profileImageUrl: apiResponse.profileImageUrl,
    role: apiResponse.role,
    roles: Array.isArray(apiResponse.roles) ? apiResponse.roles : [apiResponse.role]
  };
};

// Handle different response formats
const extractData = (response) => {
  // Handle paginated responses
  if (response.data && Array.isArray(response.data)) {
    return response.data;
  }
  
  // Handle direct arrays
  if (Array.isArray(response)) {
    return response;
  }
  
  // Handle single objects
  return response;
};
```

## 🚀 Usage Examples

### Basic API Call
```javascript
import { callApi } from './components/api/auth';

const fetchData = async () => {
  try {
    const data = await callApi('/api/users', 'GET', null, accessToken);
    console.log('Users:', data);
  } catch (error) {
    console.error('API Error:', error.message);
    // Handle specific error cases
    if (error.status === 401) {
      // Redirect to login
    }
  }
};
```

### Authentication Flow
```javascript
import { login, register } from './components/api/auth';

// Login
const handleLogin = async (email, password) => {
  try {
    const response = await login(email, password);
    // Store user data
    localStorage.setItem('user', JSON.stringify(response.userDetails));
    // Redirect based on role
    if (response.userDetails.role === 'Admin') {
      navigate('/admin');
    }
  } catch (error) {
    setError(error.message);
  }
};

// Registration
const handleRegister = async (formData) => {
  try {
    await register(
      formData.email,
      formData.password,
      formData.confirmPassword,
      formData.fullName
    );
    // Show success message
    toast.success('Registration successful!');
  } catch (error) {
    setError(error.message);
  }
};
```

## 🔧 Development Guidelines

### 📡 API Design Principles
- **Consistent Endpoints**: RESTful API design
- **Error Handling**: Comprehensive error responses
- **Security**: Authentication on all protected endpoints
- **Validation**: Input validation on both client và server
- **Documentation**: Clear API documentation

### 🧪 Testing Strategy
- **Unit Tests**: Test individual API functions
- **Integration Tests**: Test API workflows
- **Mock Services**: Use MSW for testing
- **Error Cases**: Test error handling scenarios

### 🔄 Performance Optimization
- **Request Batching**: Combine multiple requests when possible
- **Caching**: Cache frequently accessed data
- **Retry Logic**: Intelligent retry on failures
- **Loading States**: Proper loading indicators

## 🔗 Related Components

- [Modal Components](../modals/README.md) - Authentication modals
- [Wallet Components](../wallet/README.md) - Financial API integration
- [Admin Dashboard](../admin/README.md) - Admin API functions
- [Manager Dashboard](../manager/README.md) - Manager API functions
- [Staff Dashboard](../staff/README.md) - Staff API functions
