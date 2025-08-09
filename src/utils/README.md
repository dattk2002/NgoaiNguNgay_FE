# Utils Directory

🛠️ **Mô tả**: Thư mục chứa các utility functions và helper functions dùng chung trong toàn bộ ứng dụng NgoaiNguNgay.

## 🏗️ Cấu trúc utilities

```
src/utils/
├── formatCentralTimestamp.jsx      # Format timestamp theo múi giờ Việt Nam
├── formatLanguageCode.jsx          # Convert language codes sang tên đầy đủ
├── formatPriceWithCommas.jsx       # Format số tiền với dấu phẩy
├── formatPriceInputWithCommas.jsx  # Format input giá khi user typing
├── formatTutorDate.jsx            # Format ngày tháng cho tutor schedule
├── getWeekDates.jsx               # Tính toán dates trong tuần
├── languageList.js                # Danh sách ngôn ngữ và codes
├── starIconRender.jsx             # Render star rating components
├── googleLoginCallback.jsx        # Handle Google OAuth callback
├── notificationMessages.jsx       # Centralized notification messages
├── noFocusOutlineButton.jsx       # Utility for button focus styles
└── notFocusOutline.css           # CSS cho no-focus-outline styling
```

## 🔧 Chi tiết utilities

### ⏰ formatCentralTimestamp.jsx
**Mục đích**: Format timestamp thành định dạng DD/MM/YYYY HH:mm cho múi giờ Việt Nam

**Function**:
```javascript
export const formatCentralTimestamp = (timestamp) => {
  if (!timestamp) return "Không có";
  
  try {
    const date = new Date(timestamp);
    if (isNaN(date)) return "Thời gian không hợp lệ";
    
    // Format as DD/MM/YYYY HH:mm
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch (error) {
    console.error("Lỗi định dạng thời gian:", error);
    return "Thời gian không hợp lệ";
  }
};
```

**Usage Examples**:
```javascript
formatCentralTimestamp(new Date())              // "15/12/2024 14:30"
formatCentralTimestamp("2024-12-15T14:30:00Z")  // "15/12/2024 14:30"
formatCentralTimestamp(null)                     // "Không có"
formatCentralTimestamp("invalid")                // "Thời gian không hợp lệ"
```

### 🌐 formatLanguageCode.jsx
**Mục đích**: Convert language codes (en, vi, fr) thành tên ngôn ngữ đầy đủ

**Language Mapping**:
```javascript
const languageMap = {
  'en': 'English',     'vi': 'Vietnamese',  'fr': 'French',
  'ja': 'Japanese',    'ko': 'Korean',      'zh': 'Chinese',
  'es': 'Spanish',     'de': 'German',      'it': 'Italian',
  'ru': 'Russian',     'pt': 'Portuguese',  'ar': 'Arabic',
  'hi': 'Hindi',       'th': 'Thai',        'id': 'Indonesian',
  'nl': 'Dutch'
};
```

**Function**:
```javascript
export const formatLanguageCode = (languageCodeOrCodes) => {
  if (!languageCodeOrCodes) return 'N/A';
  
  const trimmedInput = languageCodeOrCodes.trim();
  
  // Handle multiple codes (comma-separated)
  if (trimmedInput.includes(',')) {
    const codes = trimmedInput.split(',');
    const formattedNames = codes
      .map(code => {
        const trimmedCode = code.trim().toLowerCase();
        return languageMap[trimmedCode] || code.trim();
      })
      .filter(name => name);
    return formattedNames.join(', ');
  } else {
    // Handle single code
    const lowerCaseCode = trimmedInput.toLowerCase();
    return languageMap[lowerCaseCode] || trimmedInput;
  }
};
```

**Usage Examples**:
```javascript
formatLanguageCode('en')           // "English"
formatLanguageCode('vi, en, fr')   // "Vietnamese, English, French"
formatLanguageCode('unknown')      // "unknown"
formatLanguageCode('')             // "N/A"
```

### 💰 formatPriceWithCommas.jsx
**Mục đích**: Format số tiền với dấu phẩy ngăn cách hàng nghìn

**Function**:
```javascript
export default function formatPriceWithCommas(value) {
  if (typeof value !== "number" && typeof value !== "string") return "";
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
```

**Usage Examples**:
```javascript
formatPriceWithCommas(1000)        // "1,000"
formatPriceWithCommas(1234567)     // "1,234,567"
formatPriceWithCommas("500000")    // "500,000"
formatPriceWithCommas("")          // ""
```

### 💸 formatPriceInputWithCommas.jsx
**Mục đích**: Format input field cho việc nhập giá tiền real-time

**Features**:
- ✅ **Real-time Formatting**: Format khi user typing
- 🚫 **Number Only**: Chỉ cho phép số và dấu phẩy
- 🔄 **Auto Comma**: Tự động thêm dấu phẩy
- ❌ **Remove Invalid**: Xóa ký tự không hợp lệ

**Function**:
```javascript
export const formatPriceInputWithCommas = (value) => {
  // Remove all non-digit characters except commas
  const cleanValue = value.replace(/[^\d,]/g, '');
  
  // Remove existing commas
  const numberOnly = cleanValue.replace(/,/g, '');
  
  // Add commas for thousands
  return numberOnly.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Parse back to number
export const parsePriceInput = (formattedValue) => {
  return parseInt(formattedValue.replace(/,/g, ''), 10) || 0;
};
```

**Usage in Components**:
```jsx
const PriceInput = () => {
  const [price, setPrice] = useState('');
  
  const handlePriceChange = (e) => {
    const formatted = formatPriceInputWithCommas(e.target.value);
    setPrice(formatted);
  };
  
  const handleSubmit = () => {
    const numericPrice = parsePriceInput(price);
    // Send numericPrice to API
  };
  
  return (
    <input 
      value={price}
      onChange={handlePriceChange}
      placeholder="Nhập giá (VND)"
    />
  );
};
```

### 📅 formatTutorDate.jsx
**Mục đích**: Format ngày tháng theo nhiều định dạng khác nhau cho tutor schedules

**Functions**:
```javascript
// Format for display in calendar
export const formatTutorDateCalendar = (date) => {
  const options = { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  };
  return new Intl.DateTimeFormat('vi-VN', options).format(date);
};

// Format for lesson history
export const formatTutorDateHistory = (date) => {
  const options = { 
    year: 'numeric',
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Intl.DateTimeFormat('vi-VN', options).format(date);
};

// Format for short display
export const formatTutorDateShort = (date) => {
  const today = new Date();
  const diffTime = date.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Hôm nay';
  if (diffDays === 1) return 'Ngày mai';
  if (diffDays === -1) return 'Hôm qua';
  if (diffDays > 0 && diffDays <= 7) return `${diffDays} ngày nữa`;
  if (diffDays < 0 && diffDays >= -7) return `${Math.abs(diffDays)} ngày trước`;
  
  return date.toLocaleDateString('vi-VN');
};
```

**Usage Examples**:
```javascript
const now = new Date();
formatTutorDateCalendar(now)    // "Th 6, 15 Th12"
formatTutorDateHistory(now)     // "15 tháng 12, 2024 lúc 14:30"
formatTutorDateShort(now)       // "Hôm nay"
```

### 📅 getWeekDates.jsx
**Mục đích**: Tính toán và lấy tất cả ngày trong tuần hiện tại hoặc tuần được chỉ định

**Function**:
```javascript
export const getWeekDates = (targetDate = new Date()) => {
  const date = new Date(targetDate);
  const day = date.getDay(); // 0 = Sunday, 1 = Monday, ...
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
  
  const monday = new Date(date.setDate(diff));
  const weekDates = [];
  
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(monday);
    currentDate.setDate(monday.getDate() + i);
    weekDates.push(currentDate);
  }
  
  return weekDates;
};

// Get week range string
export const getWeekRangeString = (targetDate = new Date()) => {
  const weekDates = getWeekDates(targetDate);
  const startDate = weekDates[0];
  const endDate = weekDates[6];
  
  const startStr = `${startDate.getDate()}/${startDate.getMonth() + 1}`;
  const endStr = `${endDate.getDate()}/${endDate.getMonth() + 1}/${endDate.getFullYear()}`;
  
  return `${startStr} - ${endStr}`;
};

// Check if date is in current week
export const isDateInCurrentWeek = (date) => {
  const currentWeekDates = getWeekDates();
  const targetTime = new Date(date).setHours(0, 0, 0, 0);
  
  return currentWeekDates.some(weekDate => 
    weekDate.setHours(0, 0, 0, 0) === targetTime
  );
};
```

### 🌐 languageList.js
**Mục đích**: Centralized danh sách ngôn ngữ với codes cho dropdowns và selections

**Data Structure**:
```javascript
export const languageList = [
  { code: 'vi', name: 'Vietnamese' },
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'French' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
  { code: 'es', name: 'Spanish' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'ru', name: 'Russian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
  { code: 'th', name: 'Thai' },
  { code: 'id', name: 'Indonesian' },
  { code: 'nl', name: 'Dutch' }
];
```

**Helper Functions**:
```javascript
// Get language name by code
export const getLanguageName = (code) => {
  const language = languageList.find(lang => lang.code === code);
  return language ? language.name : code;
};

// Get language code by name
export const getLanguageCode = (name) => {
  const language = languageList.find(lang => lang.name === name);
  return language ? language.code : name;
};

// Get popular languages (top 8)
export const getPopularLanguages = () => {
  return languageList.slice(0, 8);
};

// Search languages
export const searchLanguages = (query) => {
  const lowerQuery = query.toLowerCase();
  return languageList.filter(lang => 
    lang.name.toLowerCase().includes(lowerQuery) ||
    lang.code.toLowerCase().includes(lowerQuery)
  );
};
```

### ⭐ starIconRender.jsx
**Mục đích**: Render star rating components với hỗ trợ half stars

**Functions**:
```javascript
export const renderStars = (rating, maxStars = 5, size = '16px') => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  
  // Full stars
  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <span key={`full-${i}`} className="star full" style={{ fontSize: size }}>
        ★
      </span>
    );
  }
  
  // Half star
  if (hasHalfStar) {
    stars.push(
      <span key="half" className="star half" style={{ fontSize: size }}>
        ☆
      </span>
    );
  }
  
  // Empty stars
  const emptyStars = maxStars - fullStars - (hasHalfStar ? 1 : 0);
  for (let i = 0; i < emptyStars; i++) {
    stars.push(
      <span key={`empty-${i}`} className="star empty" style={{ fontSize: size }}>
        ☆
      </span>
    );
  }
  
  return <div className="star-rating">{stars}</div>;
};

// Interactive star rating
export const InteractiveStarRating = ({ 
  rating, 
  onRatingChange, 
  maxStars = 5,
  size = '20px',
  disabled = false 
}) => {
  const [hoveredRating, setHoveredRating] = useState(0);
  
  const handleStarClick = (starIndex) => {
    if (!disabled) {
      onRatingChange(starIndex + 1);
    }
  };
  
  const handleStarHover = (starIndex) => {
    if (!disabled) {
      setHoveredRating(starIndex + 1);
    }
  };
  
  const handleMouseLeave = () => {
    setHoveredRating(0);
  };
  
  const displayRating = hoveredRating || rating;
  
  return (
    <div 
      className={`interactive-star-rating ${disabled ? 'disabled' : ''}`}
      onMouseLeave={handleMouseLeave}
    >
      {Array.from({ length: maxStars }, (_, index) => (
        <span
          key={index}
          className={`star ${index < displayRating ? 'filled' : 'empty'}`}
          style={{ fontSize: size, cursor: disabled ? 'default' : 'pointer' }}
          onClick={() => handleStarClick(index)}
          onMouseEnter={() => handleStarHover(index)}
        >
          {index < displayRating ? '★' : '☆'}
        </span>
      ))}
    </div>
  );
};
```

### 🔐 googleLoginCallback.jsx
**Mục đích**: Handle Google OAuth callback và token processing

**Function**:
```javascript
export const handleGoogleLoginCallback = async (credentialResponse) => {
  try {
    const token = credentialResponse.credential;
    
    // Decode JWT token để lấy user info
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    const userInfo = {
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      sub: payload.sub, // Google user ID
      email_verified: payload.email_verified
    };
    
    // Send token to backend for verification
    const response = await fetch('/api/auth/google-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ idToken: token, userInfo })
    });
    
    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        user: data.user,
        accessToken: data.accessToken
      };
    } else {
      throw new Error('Google login failed');
    }
  } catch (error) {
    console.error('Google login callback error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Initialize Google Login
export const initializeGoogleLogin = (onSuccess, onError) => {
  if (window.google) {
    window.google.accounts.id.initialize({
      client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
      callback: async (response) => {
        const result = await handleGoogleLoginCallback(response);
        if (result.success) {
          onSuccess(result);
        } else {
          onError(result.error);
        }
      }
    });
  }
};
```

### 📢 notificationMessages.jsx
**Mục đích**: Centralized notification messages với i18n support

**Message Categories**:
```javascript
export const notificationMessages = {
  auth: {
    loginSuccess: 'Đăng nhập thành công!',
    loginFailed: 'Đăng nhập thất bại. Vui lòng thử lại.',
    logoutSuccess: 'Đăng xuất thành công!',
    registerSuccess: 'Đăng ký thành công! Vui lòng kiểm tra email.',
    passwordResetSent: 'Email đặt lại mật khẩu đã được gửi.',
    passwordResetSuccess: 'Đặt lại mật khẩu thành công!'
  },
  
  booking: {
    bookingSuccess: 'Đặt lịch thành công!',
    bookingCancelled: 'Đã hủy lịch học.',
    bookingConfirmed: 'Lịch học đã được xác nhận.',
    lessonCompleted: 'Buổi học đã hoàn thành.'
  },
  
  payment: {
    paymentSuccess: 'Thanh toán thành công!',
    paymentFailed: 'Thanh toán thất bại. Vui lòng thử lại.',
    withdrawalSuccess: 'Yêu cầu rút tiền đã được gửi.',
    depositSuccess: 'Nạp tiền thành công!'
  },
  
  profile: {
    profileUpdated: 'Cập nhật hồ sơ thành công!',
    photoUploaded: 'Ảnh đại diện đã được cập nhật.',
    photoUploadFailed: 'Tải ảnh thất bại. Vui lòng thử lại.'
  },
  
  errors: {
    networkError: 'Lỗi mạng. Vui lòng kiểm tra kết nối.',
    serverError: 'Lỗi server. Vui lòng thử lại sau.',
    unauthorized: 'Bạn không có quyền thực hiện hành động này.',
    notFound: 'Không tìm thấy dữ liệu yêu cầu.',
    validation: 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.'
  }
};

// Get message by key
export const getMessage = (category, key, fallback = 'Có lỗi xảy ra') => {
  return notificationMessages[category]?.[key] || fallback;
};

// Toast helper functions
export const showSuccess = (message) => {
  toast.success(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true
  });
};

export const showError = (message) => {
  toast.error(message, {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true
  });
};

export const showInfo = (message) => {
  toast.info(message, {
    position: "top-right",
    autoClose: 4000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true
  });
};
```

### 🎨 noFocusOutlineButton.jsx & notFocusOutline.css
**Mục đích**: Utility để remove focus outline cho buttons khi click bằng mouse, nhưng giữ lại cho keyboard navigation

**CSS File**:
```css
/* notFocusOutline.css */
.no-focus-outline:focus:not(:focus-visible) {
  outline: none;
}

.no-focus-outline:focus-visible {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}

/* Button specific styles */
.no-focus-outline-button {
  transition: all 0.2s ease;
}

.no-focus-outline-button:focus:not(:focus-visible) {
  outline: none;
  box-shadow: none;
}

.no-focus-outline-button:focus-visible {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}

.no-focus-outline-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
```

**JavaScript Helper**:
```javascript
// noFocusOutlineButton.jsx
export const applyNoFocusOutline = (element) => {
  if (!element) return;
  
  element.classList.add('no-focus-outline-button');
  
  // Remove focus on mouse click
  element.addEventListener('mousedown', (e) => {
    e.preventDefault();
    element.blur();
  });
  
  // Allow focus for keyboard navigation
  element.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      element.focus();
    }
  });
};

// React hook version
export const useNoFocusOutline = () => {
  const ref = useRef();
  
  useEffect(() => {
    if (ref.current) {
      applyNoFocusOutline(ref.current);
    }
  }, []);
  
  return ref;
};

// HOC version
export const withNoFocusOutline = (Component) => {
  return React.forwardRef((props, ref) => {
    const internalRef = useRef();
    const componentRef = ref || internalRef;
    
    useEffect(() => {
      if (componentRef.current) {
        applyNoFocusOutline(componentRef.current);
      }
    }, []);
    
    return <Component {...props} ref={componentRef} />;
  });
};
```

## 🚀 Usage Examples

### Basic Utility Usage
```jsx
import { formatCentralTimestamp, formatLanguageCode, formatPriceWithCommas } from '../utils';

const TutorCard = ({ tutor }) => {
  return (
    <div className="tutor-card">
      <h3>{tutor.name}</h3>
      <p>Languages: {formatLanguageCode(tutor.languages)}</p>
      <p>Price: {formatPriceWithCommas(tutor.price)} VND/hour</p>
      <p>Last active: {formatCentralTimestamp(tutor.lastActive)}</p>
    </div>
  );
};
```

### Advanced Usage with Multiple Utils
```jsx
import { 
  getWeekDates, 
  renderStars, 
  showSuccess,
  getMessage 
} from '../utils';

const LessonScheduler = () => {
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const weekDates = getWeekDates(selectedWeek);
  
  const handleBookingSuccess = () => {
    showSuccess(getMessage('booking', 'bookingSuccess'));
  };
  
  return (
    <div className="lesson-scheduler">
      {weekDates.map(date => (
        <div key={date.toISOString()} className="day-slot">
          {date.toLocaleDateString('vi-VN')}
        </div>
      ))}
    </div>
  );
};
```

## 🔧 Development Guidelines

### 📝 Adding New Utilities
1. **Single Responsibility**: Mỗi utility function một mục đích rõ ràng
2. **Pure Functions**: Không có side effects
3. **Error Handling**: Handle edge cases và invalid inputs
4. **Documentation**: JSDoc comments cho tất cả functions
5. **Testing**: Unit tests cho logic phức tạp

### 🧪 Testing Pattern
```javascript
import { formatPriceWithCommas } from '../formatPriceWithCommas';

describe('formatPriceWithCommas', () => {
  test('should format numbers with commas', () => {
    expect(formatPriceWithCommas(1000)).toBe('1,000');
    expect(formatPriceWithCommas(1234567)).toBe('1,234,567');
  });
  
  test('should handle edge cases', () => {
    expect(formatPriceWithCommas('')).toBe('');
    expect(formatPriceWithCommas(null)).toBe('');
    expect(formatPriceWithCommas(undefined)).toBe('');
  });
});
```

### 🔄 Performance Considerations
```javascript
// Memoize expensive calculations
import { useMemo } from 'react';

const useFormattedData = (data) => {
  return useMemo(() => {
    return data.map(item => ({
      ...item,
      formattedPrice: formatPriceWithCommas(item.price),
      formattedDate: formatCentralTimestamp(item.date),
      formattedLanguages: formatLanguageCode(item.languages)
    }));
  }, [data]);
};
```

## 🔗 Related Components

- [Pages Directory](../pages/README.md) - Page-level usage
- [Components Directory](../components/README.md) - Component-level integration
- [Hooks Directory](../hooks/README.md) - Custom React hooks
- [API Components](../components/api/README.md) - Data formatting for API responses
