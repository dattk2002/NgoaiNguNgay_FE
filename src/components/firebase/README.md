# Firebase Configuration

🔥 **Mô tả**: Cấu hình Firebase services cho ứng dụng NgoaiNguNgay - authentication, real-time database, storage, và push notifications.

## 🏗️ Cấu trúc components

```
src/components/firebase/
└── firebase.js    # Firebase configuration và initialization
```

## 🔧 Chi tiết cấu hình

### 🔥 firebase.js
**Mục đích**: Cấu hình và khởi tạo Firebase services

**Services được sử dụng**:
- 🔐 **Authentication**: Google OAuth, Email/Password
- 📁 **Storage**: Upload ảnh profile, documents
- 📊 **Analytics**: User behavior tracking
- 🔔 **Messaging**: Push notifications
- 📱 **Performance**: App performance monitoring

## 🚀 Firebase Setup

### ⚙️ Configuration
```javascript
// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
import { initializeApp } from 'firebase/app';
const app = initializeApp(firebaseConfig);
```

### 🔐 Authentication Setup
```javascript
import { 
  getAuth, 
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Configure Google provider
googleProvider.addScope('email');
googleProvider.addScope('profile');
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { auth, googleProvider };
```

### 📁 Storage Setup
```javascript
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const storage = getStorage(app);

// Upload file function
export const uploadFile = async (file, path) => {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
};

// Upload profile image
export const uploadProfileImage = async (file, userId) => {
  const path = `profile-images/${userId}/${Date.now()}_${file.name}`;
  return await uploadFile(file, path);
};
```

### 📊 Analytics Setup
```javascript
import { getAnalytics, logEvent } from 'firebase/analytics';

const analytics = getAnalytics(app);

// Custom event logging
export const logCustomEvent = (eventName, parameters) => {
  logEvent(analytics, eventName, parameters);
};

// Track user actions
export const trackUserAction = (action, details) => {
  logEvent(analytics, 'user_action', {
    action_type: action,
    ...details,
    timestamp: new Date().toISOString()
  });
};

// Track page views
export const trackPageView = (pageName) => {
  logEvent(analytics, 'page_view', {
    page_title: pageName,
    page_location: window.location.href
  });
};
```

### 🔔 Messaging Setup
```javascript
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const messaging = getMessaging(app);

// Get FCM token
export const getFCMToken = async () => {
  try {
    const currentToken = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
    });
    
    if (currentToken) {
      console.log('FCM Token:', currentToken);
      return currentToken;
    } else {
      console.warn('No registration token available.');
      return null;
    }
  } catch (error) {
    console.error('An error occurred while retrieving token:', error);
    return null;
  }
};

// Listen for foreground messages
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log('Message received in foreground:', payload);
      resolve(payload);
    });
  });
```

## 🔐 Authentication Services

### 🌐 Google OAuth
```javascript
import { auth, googleProvider } from './firebase';
import { signInWithPopup } from 'firebase/auth';

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Get ID token để gửi lên server
    const idToken = await user.getIdToken();
    
    return {
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      },
      idToken
    };
  } catch (error) {
    console.error('Google sign-in error:', error);
    throw error;
  }
};

// Sign out
export const signOutFromFirebase = async () => {
  try {
    await signOut(auth);
    console.log('User signed out from Firebase');
  } catch (error) {
    console.error('Sign-out error:', error);
    throw error;
  }
};
```

### 👤 Auth State Management
```javascript
import { onAuthStateChanged } from 'firebase/auth';

// Monitor auth state changes
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in
      callback({
        isAuthenticated: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified
        }
      });
    } else {
      // User is signed out
      callback({
        isAuthenticated: false,
        user: null
      });
    }
  });
};

// Get current user
export const getCurrentUser = () => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};
```

## 📁 Storage Services

### 🖼️ Image Upload Service
```javascript
import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// Upload image với resize
export const uploadImageWithResize = async (file, path, maxWidth = 800) => {
  try {
    // Resize image before upload
    const resizedFile = await resizeImage(file, maxWidth);
    
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, resizedFile);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return {
      url: downloadURL,
      path: path,
      size: resizedFile.size
    };
  } catch (error) {
    console.error('Image upload failed:', error);
    throw error;
  }
};

// Resize image helper
const resizeImage = (file, maxWidth) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob(resolve, file.type, 0.8);
    };
    
    img.src = URL.createObjectURL(file);
  });
};

// Delete file
export const deleteFile = async (path) => {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
    console.log('File deleted successfully');
  } catch (error) {
    console.error('Delete failed:', error);
    throw error;
  }
};
```

### 📄 Document Upload Service
```javascript
// Upload document (PDF, DOC, etc.)
export const uploadDocument = async (file, userId, category) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png'
  ];
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error('File type not allowed');
  }
  
  const path = `documents/${userId}/${category}/${Date.now()}_${file.name}`;
  return await uploadFile(file, path);
};

// Upload tutor certificate
export const uploadTutorCertificate = async (file, tutorId) => {
  return await uploadDocument(file, tutorId, 'certificates');
};

// Upload ID verification
export const uploadIDVerification = async (file, userId) => {
  return await uploadDocument(file, userId, 'id-verification');
};
```

## 📊 Analytics & Tracking

### 📈 Event Tracking
```javascript
import { analytics } from './firebase';
import { logEvent } from 'firebase/analytics';

// Track lesson booking
export const trackLessonBooking = (lessonData) => {
  logEvent(analytics, 'lesson_booked', {
    tutor_id: lessonData.tutorId,
    subject: lessonData.subject,
    duration: lessonData.duration,
    price: lessonData.price,
    currency: 'VND'
  });
};

// Track payment
export const trackPayment = (paymentData) => {
  logEvent(analytics, 'payment_completed', {
    transaction_id: paymentData.transactionId,
    value: paymentData.amount,
    currency: 'VND',
    payment_method: paymentData.method
  });
};

// Track user registration
export const trackUserRegistration = (method) => {
  logEvent(analytics, 'sign_up', {
    method: method // 'email', 'google'
  });
};

// Track search
export const trackSearch = (searchTerm, category) => {
  logEvent(analytics, 'search', {
    search_term: searchTerm,
    category: category
  });
};
```

### 🎯 User Properties
```javascript
import { setUserProperties } from 'firebase/analytics';

// Set user properties for analytics
export const setAnalyticsUserProperties = (user) => {
  setUserProperties(analytics, {
    user_role: user.role,
    user_type: user.type,
    registration_date: user.createdAt,
    preferred_language: user.language || 'vi'
  });
};
```

## 🔔 Push Notifications

### 📱 Notification Service
```javascript
import { messaging } from './firebase';
import { getToken, onMessage } from 'firebase/messaging';

// Request notification permission
export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('Notification permission granted.');
      const token = await getFCMToken();
      return token;
    } else {
      console.log('Notification permission denied.');
      return null;
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return null;
  }
};

// Handle foreground notifications
export const setupForegroundNotifications = (onNotificationReceived) => {
  onMessage(messaging, (payload) => {
    console.log('Message received:', payload);
    
    // Show custom notification UI
    onNotificationReceived({
      title: payload.notification?.title || 'New Notification',
      body: payload.notification?.body || '',
      data: payload.data || {}
    });
  });
};

// Send token to server
export const sendTokenToServer = async (token) => {
  try {
    const response = await fetch('/api/fcm/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      },
      body: JSON.stringify({ fcmToken: token })
    });
    
    if (response.ok) {
      console.log('FCM token registered successfully');
    }
  } catch (error) {
    console.error('Failed to register FCM token:', error);
  }
};
```

## 🛡️ Security Rules

### 🔒 Storage Security Rules
```javascript
// Firestore Security Rules (firestore.rules)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Public tutor profiles
    match /tutors/{tutorId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == tutorId;
    }
  }
}

// Storage Security Rules (storage.rules)
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Profile images
    match /profile-images/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Documents - private
    match /documents/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🚀 Usage Examples

### Basic Firebase Integration
```jsx
import { useEffect, useState } from 'react';
import { onAuthStateChange, signInWithGoogle } from './firebase/firebase';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange((authState) => {
      setUser(authState.user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithGoogle();
      console.log('Google login successful:', result);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {user ? (
        <div>Welcome, {user.displayName}!</div>
      ) : (
        <button onClick={handleGoogleLogin}>
          Sign in with Google
        </button>
      )}
    </div>
  );
};
```

### Image Upload Component
```jsx
import { useState } from 'react';
import { uploadProfileImage } from './firebase/firebase';

const ProfileImageUpload = ({ userId, onUploadComplete }) => {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const imageUrl = await uploadProfileImage(file, userId);
      onUploadComplete(imageUrl);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        disabled={uploading}
      />
      {uploading && <div>Uploading...</div>}
    </div>
  );
};
```

## 🔧 Environment Variables

### 📝 Required Environment Variables
```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
VITE_FIREBASE_VAPID_KEY=your_vapid_key
```

## 🧪 Testing Strategy

### Unit Tests
```javascript
import { uploadFile, signInWithGoogle } from './firebase';

// Mock Firebase for testing
jest.mock('firebase/app');
jest.mock('firebase/auth');
jest.mock('firebase/storage');

describe('Firebase Services', () => {
  test('should upload file successfully', async () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const result = await uploadFile(mockFile, 'test-path');
    expect(result).toBeDefined();
  });

  test('should handle Google sign-in', async () => {
    const result = await signInWithGoogle();
    expect(result.user).toBeDefined();
    expect(result.idToken).toBeDefined();
  });
});
```

## 🔗 Related Components

- [API Components](../api/README.md) - Google OAuth integration
- [Modal Components](../modals/README.md) - Login/Register với Firebase
- [User Components](../users/README.md) - Profile image upload
- [Notification System](../../hooks/README.md) - Push notifications
