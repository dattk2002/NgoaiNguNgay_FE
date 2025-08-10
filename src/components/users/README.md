# User Components

👤 **Mô tả**: Components quản lý thông tin người dùng và profile - chỉnh sửa thông tin cá nhân, upload ảnh đại diện, quản lý tài khoản.

## 🏗️ Cấu trúc components

```
src/components/users/
├── UserProfile.jsx        # Hiển thị thông tin profile người dùng
└── EditUserProfile.jsx    # Form chỉnh sửa thông tin profile
```

## 🔧 Chi tiết components

### 👤 UserProfile.jsx
**Mục đích**: Hiển thị thông tin profile chi tiết của người dùng

**Tính năng**:
- 📸 **Profile Image**: Hiển thị ảnh đại diện với fallback
- 📋 **User Information**: Hiển thị thông tin cơ bản
- ✏️ **Edit Button**: Chuyển sang mode chỉnh sửa
- 📱 **Responsive Design**: Tối ưu cho mobile và desktop

**Data Display**:
```jsx
// User information fields
const userFields = [
  'fullName',      // Họ và tên
  'email',         // Email
  'phoneNumber',   // Số điện thoại
  'dateOfBirth',   // Ngày sinh
  'address',       // Địa chỉ
  'bio'           // Tiểu sử
];
```

**State Management**:
```jsx
const [userInfo, setUserInfo] = useState({});
const [loading, setLoading] = useState(true);
const [isEditing, setIsEditing] = useState(false);
```

### ✏️ EditUserProfile.jsx
**Mục đích**: Form chỉnh sửa thông tin profile người dùng

**Tính năng**:
- 📝 **Form Fields**: Các field để chỉnh sửa thông tin
- 📸 **Image Upload**: Upload và crop ảnh đại diện
- ✅ **Validation**: Validation real-time
- 💾 **Save Changes**: Lưu thay đổi vào database
- ❌ **Cancel/Reset**: Hủy thay đổi về trạng thái ban đầu

**Form Structure**:
```jsx
const formFields = {
  personalInfo: {
    fullName: { required: true, maxLength: 100 },
    email: { required: true, type: 'email', readonly: true },
    phoneNumber: { pattern: /^\d{10,11}$/ },
    dateOfBirth: { type: 'date', max: 'today' }
  },
  contactInfo: {
    address: { maxLength: 200 },
    bio: { maxLength: 500, multiline: true }
  }
};
```

**Validation Rules**:
```jsx
const validationRules = {
  fullName: {
    required: 'Họ và tên là bắt buộc',
    minLength: { value: 2, message: 'Tên phải có ít nhất 2 ký tự' },
    maxLength: { value: 100, message: 'Tên không được quá 100 ký tự' }
  },
  phoneNumber: {
    pattern: {
      value: /^[0-9]{10,11}$/,
      message: 'Số điện thoại phải có 10-11 chữ số'
    }
  },
  dateOfBirth: {
    validate: (value) => {
      const today = new Date();
      const birthDate = new Date(value);
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 13 || 'Phải từ 13 tuổi trở lên';
    }
  }
};
```

## 🎨 UI Components

### 📸 Profile Image Upload
```jsx
const ProfileImageUpload = ({ currentImage, onImageChange }) => {
  const [preview, setPreview] = useState(currentImage);
  const [uploading, setUploading] = useState(false);
  
  const handleFileSelect = async (file) => {
    setUploading(true);
    try {
      // Upload to server
      const response = await uploadUserProfileImage(file);
      setPreview(response.imageUrl);
      onImageChange(response.imageUrl);
    } catch (error) {
      toast.error('Upload ảnh thất bại');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="profile-image-upload">
      <div className="image-preview">
        {preview ? (
          <img src={preview} alt="Profile" />
        ) : (
          <div className="placeholder">
            <FaUser size={60} />
          </div>
        )}
      </div>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => handleFileSelect(e.target.files[0])}
        disabled={uploading}
      />
      {uploading && <div className="uploading">Đang upload...</div>}
    </div>
  );
};
```

### 📝 Form Input Components
```jsx
const FormInput = ({ 
  label, 
  name, 
  type = 'text', 
  value, 
  onChange, 
  error, 
  required = false,
  disabled = false 
}) => {
  return (
    <div className="form-group">
      <label htmlFor={name}>
        {label}
        {required && <span className="required">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={error ? 'error' : ''}
      />
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};

const FormTextarea = ({ label, name, value, onChange, error, maxLength }) => {
  return (
    <div className="form-group">
      <label htmlFor={name}>{label}</label>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        className={error ? 'error' : ''}
      />
      <div className="char-count">
        {value?.length || 0}/{maxLength}
      </div>
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};
```

## 🔧 Data Management

### 📊 User Profile API Integration
```jsx
// Fetch user profile
const fetchUserProfile = async () => {
  try {
    setLoading(true);
    const response = await fetchUserById();
    setUserInfo(response.data);
  } catch (error) {
    toast.error('Không thể tải thông tin người dùng');
    console.error('Fetch user error:', error);
  } finally {
    setLoading(false);
  }
};

// Update user profile
const updateProfile = async (formData) => {
  try {
    setUpdating(true);
    const response = await updateUserProfile(formData);
    setUserInfo(response.data);
    toast.success('Cập nhật thông tin thành công!');
    setIsEditing(false);
  } catch (error) {
    toast.error(error.message || 'Cập nhật thất bại');
  } finally {
    setUpdating(false);
  }
};
```

### 🔄 State Management
```jsx
const useUserProfile = () => {
  const [userInfo, setUserInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [errors, setErrors] = useState({});

  const validateField = (name, value) => {
    const rules = validationRules[name];
    if (!rules) return '';

    if (rules.required && !value) {
      return rules.required;
    }

    if (rules.pattern && !rules.pattern.value.test(value)) {
      return rules.pattern.message;
    }

    if (rules.validate) {
      return rules.validate(value);
    }

    return '';
  };

  const handleFieldChange = (name, value) => {
    setUserInfo(prev => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  return {
    userInfo,
    loading,
    updating,
    errors,
    handleFieldChange,
    updateProfile,
    fetchUserProfile
  };
};
```

## 🎨 Styling Guidelines

### 📱 Responsive Design
```css
.user-profile {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

@media (max-width: 768px) {
  .user-profile {
    padding: 15px;
  }
  
  .profile-form {
    grid-template-columns: 1fr;
  }
}

.profile-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group.full-width {
  grid-column: 1 / -1;
}
```

### 🎨 Visual Components
```css
.profile-image-upload {
  text-align: center;
  margin-bottom: 20px;
}

.image-preview {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 auto 10px;
  border: 3px solid #ddd;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  color: #999;
}
```

## 🛡️ Security & Validation

### 🔒 Input Sanitization
```jsx
const sanitizeInput = (value) => {
  return value
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/[<>]/g, '');
};

const handleInputChange = (e) => {
  const { name, value } = e.target;
  const sanitizedValue = sanitizeInput(value);
  handleFieldChange(name, sanitizedValue);
};
```

### ✅ Client-side Validation
```jsx
const validateForm = (data) => {
  const errors = {};
  
  Object.keys(validationRules).forEach(field => {
    const error = validateField(field, data[field]);
    if (error) {
      errors[field] = error;
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
```

## 🔄 Integration Points

### 🔗 API Integration
```jsx
// API calls from auth.jsx
import { 
  fetchUserById, 
  updateUserProfile, 
  uploadUserProfileImage 
} from '../api/auth';
```

### 🎨 Modal Integration
```jsx
// Used in modals
import { UpdateInformationModal } from '../modals/UpdateInformationModal';
```

### 🧭 Navigation Integration
```jsx
// Navigation from other components
const navigateToProfile = () => {
  navigate('/profile');
};
```

## 🚀 Usage Examples

### Basic Profile Display
```jsx
import UserProfile from './components/users/UserProfile';

const ProfilePage = () => {
  return (
    <div className="page">
      <UserProfile userId={currentUser.id} />
    </div>
  );
};
```

### Profile Editing
```jsx
import EditUserProfile from './components/users/EditUserProfile';

const EditProfilePage = () => {
  const handleSave = (updatedData) => {
    // Handle profile update
    console.log('Profile updated:', updatedData);
  };

  return (
    <EditUserProfile 
      onSave={handleSave}
      onCancel={() => navigate('/profile')}
    />
  );
};
```

## 🔧 Development Guidelines

### 📝 Component Design
- **Single Responsibility**: Mỗi component có một mục đích rõ ràng
- **Reusability**: Tái sử dụng được trong nhiều context
- **Accessibility**: Hỗ trợ screen readers và keyboard navigation
- **Performance**: Optimize rendering với React.memo và useMemo

### 🧪 Testing Strategy
- **Unit Tests**: Test form validation và data processing
- **Integration Tests**: Test API integration
- **E2E Tests**: Test complete user workflows
- **Accessibility Tests**: Ensure WCAG compliance

### 🔄 State Management
- **Local State**: Sử dụng useState cho component state
- **Form State**: Sử dụng custom hooks cho form management
- **Global State**: Integrate với Redux/Context khi cần thiết
- **Cache**: Cache user data để improve performance

## 🔗 Related Components

- [Modal Components](../modals/README.md) - UpdateInformationModal
- [API Components](../api/README.md) - User API integration
- [Wallet Components](../wallet/README.md) - User financial info
- [Auth System](../api/README.md) - Authentication integration
