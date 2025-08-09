# Modal Components

🪟 **Mô tả**: Các modal/dialog components dùng chung trong ứng dụng NgoaiNguNgay - bao gồm authentication, confirmations, và detail views.

## 🏗️ Cấu trúc components

```
src/components/modals/
├── LoginModal.jsx                      # Modal đăng nhập
├── SignUpModal.jsx                     # Modal đăng ký tài khoản
├── ForgotPasswordModal.jsx             # Modal quên mật khẩu
├── UpdateNewPassword.jsx               # Modal cập nhật mật khẩu mới
├── ConfirmEmail.jsx                    # Modal xác nhận email
├── UpdateInformationModal.jsx          # Modal cập nhật thông tin cá nhân
├── ConfirmDialog.jsx                   # Dialog xác nhận chung
├── ConfirmDeleteBankAccountModal.jsx   # Xác nhận xóa tài khoản ngân hàng
├── ConfirmDeleteWeeklyPattern.jsx      # Xác nhận xóa lịch hàng tuần
├── ConfirmRejectWithdrawalModal.jsx    # Xác nhận từ chối rút tiền
├── LessonDetailModal.jsx               # Chi tiết bài học
├── TutorWeeklyPatternDetailModal.jsx   # Chi tiết lịch tuần gia sư
├── WithdrawalDetailModal.jsx           # Chi tiết lệnh rút tiền
└── OfferDetailModal.jsx                # Chi tiết offer từ gia sư
```

## 🔧 Chi tiết components

### 🔐 Authentication Modals

#### 🚪 LoginModal.jsx
**Mục đích**: Modal đăng nhập với multiple authentication methods

**Features**:
- 📧 **Email/Password Login**: Traditional authentication
- 🔍 **Google OAuth**: Firebase integration
- 📘 **Facebook OAuth**: Social login
- 👁️ **Password Toggle**: Show/hide password
- ✅ **Form Validation**: Real-time validation
- 🔄 **Loading States**: Visual feedback during login

**Validation Rules**:
```jsx
const EMAIL_REGEX = /^\S+@\S+\.\S+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
```

**Social Login Integration**:
```jsx
// Google OAuth
const googleLogin = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  // Handle login response
};
```

#### 📝 SignUpModal.jsx
**Mục đích**: Modal đăng ký tài khoản mới

**Form Fields**:
- 👤 **Họ và tên**: Required field
- 📧 **Email**: với email validation
- 🔒 **Password**: Strength requirements
- 🔒 **Confirm Password**: Must match password
- ✅ **Terms Agreement**: Checkbox required

**Password Strength Requirements**:
- Ít nhất 8 ký tự
- 1 chữ hoa, 1 chữ thường
- 1 số và 1 ký tự đặc biệt

#### 🔑 ForgotPasswordModal.jsx
**Mục đích**: Reset password functionality

**Process Flow**:
1. User enters email
2. Validation check
3. Send reset email
4. Success confirmation

### ✅ Confirmation Modals

#### ⚠️ ConfirmDialog.jsx
**Mục đích**: Generic confirmation dialog

**Props Interface**:
```jsx
interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}
```

#### 🏦 ConfirmDeleteBankAccountModal.jsx
**Mục đích**: Xác nhận xóa tài khoản ngân hàng

**Security Features**:
- ⚠️ **Warning Message**: Clear consequences
- 🔒 **Double Confirmation**: Prevent accidental deletion
- 📋 **Account Details**: Display account info being deleted

#### 💸 ConfirmRejectWithdrawalModal.jsx
**Mục đích**: Xác nhận từ chối lệnh rút tiền (Manager use)

**Features**:
- 📝 **Rejection Reason**: Required field
- 💰 **Withdrawal Details**: Amount và bank info
- ⚠️ **Impact Warning**: Explain consequences to user

### 📋 Detail View Modals

#### 📚 LessonDetailModal.jsx  
**Mục đích**: Hiển thị chi tiết bài học

**Information Displayed**:
- 📅 **Schedule**: Ngày giờ bài học
- 👩‍🏫 **Tutor Info**: Thông tin gia sư
- 👨‍🎓 **Student Info**: Thông tin học viên
- 📝 **Lesson Content**: Nội dung bài học
- ⭐ **Rating**: Đánh giá bài học

#### 💸 WithdrawalDetailModal.jsx
**Mục đích**: Chi tiết lệnh rút tiền (Manager view)

**Details Shown**:
- 👤 **User Information**: Tên, ID
- 🏦 **Bank Details**: Tên ngân hàng, số tài khoản
- 💰 **Amount Details**: Gross amount, fees, net amount
- 📅 **Timestamps**: Created, processed dates
- 📊 **Status History**: Trạng thái changes

**Bank Info Security**:
```jsx
const maskAccountNumber = (accountNumber) => {
  if (!accountNumber || accountNumber.length <= 4) return accountNumber;
  return '****' + accountNumber.slice(-4);
};
```

#### 🎯 OfferDetailModal.jsx
**Mục đích**: Chi tiết offer từ gia sư

**Offer Information**:
- 👩‍🏫 **Tutor Profile**: Basic info
- 💰 **Pricing**: Giá tiền per session  
- 📅 **Schedule**: Available time slots
- 📝 **Description**: Offer details
- ⏰ **Validity**: Offer expiration

### 🔄 Update Modals

#### ✏️ UpdateInformationModal.jsx
**Mục đích**: Cập nhật thông tin cá nhân

**Editable Fields**:
- 👤 **Personal Info**: Name, phone, DOB
- 🌍 **Location**: Address, timezone
- 🎯 **Interests**: Skills và preferences
- 🌐 **Languages**: Language skills

#### 🔑 UpdateNewPassword.jsx
**Mục đích**: Cập nhật mật khẩu mới

**Security Flow**:
1. Current password verification
2. New password input
3. Confirm new password
4. Password strength validation
5. Secure update

## 🎨 UI/UX Features

### 🌟 Design Consistency
- **Framer Motion**: Smooth enter/exit animations
- **Backdrop**: Semi-transparent overlay
- **Responsive**: Mobile-friendly layouts
- **Focus Management**: Keyboard accessibility

### 📱 Responsive Design
```jsx
// Mobile-first modal sizing
className="w-full max-w-md mx-auto relative overflow-y-auto max-h-[95vh]"

// Tablet/Desktop adaptations
@media (min-width: 768px) {
  max-width: 500px;
}
```

### ✨ Animations
```jsx
// Modal enter/exit animations
const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 }
};

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};
```

## 🔐 Security & Validation

### 🛡️ Input Validation
```jsx
// Email validation
const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

// Password strength
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

// Real-time validation
const [fieldErrors, setFieldErrors] = useState({
  email: '',
  password: ''
});
```

### 🔒 Security Measures
- **XSS Prevention**: Input sanitization
- **CSRF Protection**: Token validation
- **Password Security**: Hashing on backend
- **Session Management**: Secure token handling

## 📊 State Management

### 🗂️ Modal State Pattern
```jsx
// Common modal state pattern
const [isOpen, setIsOpen] = useState(false);
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');
const [formData, setFormData] = useState({});

// Modal lifecycle
const handleOpen = () => setIsOpen(true);
const handleClose = () => {
  setIsOpen(false);
  setError('');
  setFormData({});
};
```

### 🔄 Form State Management
```jsx
// Form handling pattern
const handleInputChange = (field, value) => {
  setFormData(prev => ({
    ...prev,
    [field]: value
  }));
  
  // Clear field-specific errors
  setFieldErrors(prev => ({
    ...prev,
    [field]: ''
  }));
};
```

## 📡 API Integration

### 🔐 Authentication APIs
```javascript
// Login/Registration
POST /api/auth/login - User login
POST /api/auth/register - User registration
POST /api/auth/forgot-password - Password reset
POST /api/auth/reset-password - New password

// Social OAuth
POST /api/auth/google - Google OAuth
POST /api/auth/facebook - Facebook OAuth
```

### 💰 Financial APIs
```javascript
// Withdrawal management
GET /api/withdrawals/:id - Get withdrawal details
PUT /api/withdrawals/:id/reject - Reject withdrawal

// Bank accounts
DELETE /api/bank-accounts/:id - Delete bank account
```

## 🚀 Usage Examples

### Basic Modal Usage
```jsx
import { LoginModal } from './components/modals';

const App = () => {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      <button onClick={() => setShowLogin(true)}>
        Đăng nhập
      </button>
      
      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onLogin={handleLogin}
        onSwitchToSignup={() => {
          setShowLogin(false);
          setShowSignup(true);
        }}
      />
    </>
  );
};
```

### Confirmation Dialog
```jsx
import { ConfirmDialog } from './components/modals';

const DeleteButton = () => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = () => {
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    await deleteItem();
    setShowConfirm(false);
  };

  return (
    <>
      <button onClick={handleDelete}>Xóa</button>
      
      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmDelete}
        title="Xác nhận xóa"
        message="Bạn có chắc chắn muốn xóa?"
        danger={true}
      />
    </>
  );
};
```

## 🔧 Development Guidelines

### 📋 Modal Best Practices
- **Focus Management**: Auto-focus first input
- **Escape Key**: Close on ESC key press
- **Click Outside**: Close when clicking backdrop
- **Body Scroll**: Prevent background scroll
- **Accessibility**: Proper ARIA attributes

### 🎨 Styling Guidelines
- **Consistent Sizing**: Standard modal widths
- **Z-index Management**: Proper layering
- **Animation Timing**: Smooth, not distracting
- **Color Scheme**: Match app theme

### 🧪 Testing Strategy
- **Form Validation**: Test all validation rules
- **API Integration**: Mock API responses
- **User Interactions**: Keyboard và mouse events
- **Error Handling**: Invalid inputs và network errors

## 🔗 Related Components

- [Authentication API](../api/README.md) - Backend auth integration
- [User Components](../users/README.md) - User profile management
- [Wallet Components](../wallet/README.md) - Financial operations
- [RBAC System](../rbac/README.md) - Role-based access control
