# Pages Directory

📄 **Mô tả**: Các trang chính của ứng dụng NgoaiNguNgay - page components chịu trách nhiệm routing và layout cấp cao nhất.

## 🏗️ Cấu trúc pages

```
src/pages/
├── HomePage.jsx                    # Trang chủ với banner và tutor recommendations
├── AdminDashboardPage.jsx          # Trang dashboard admin
├── ManagerDashboardPage.jsx        # Trang dashboard manager
├── StaffDashboardPage.jsx          # Trang dashboard staff
├── TutorManagementPage.jsx         # Trang quản lý gia sư (dành cho tutor)
├── BecomeATutorPage.jsx           # Trang đăng ký trở thành gia sư
├── BecomeATutorLandingPage.jsx    # Landing page cho việc trở thành gia sư
├── MyBookingPage.jsx              # Trang quản lý booking của user
├── WalletPage.jsx                 # Trang ví điện tử
├── MessageListPage.jsx            # Trang danh sách tin nhắn
├── ForgotPasswordPage.jsx         # Trang quên mật khẩu
└── NotFoundPage.jsx               # Trang 404 - không tìm thấy
```

## 🔧 Chi tiết pages

### 🏠 HomePage.jsx
**Mục đích**: Trang chủ chính của ứng dụng

**Sections**:
- 🎨 **Banner**: Hero section với call-to-action
- 👩‍🏫 **RecommendTutorList**: Danh sách gia sư được đề xuất
- ℹ️ **HowItWork**: Hướng dẫn cách sử dụng platform

**Props**:
```jsx
HomePage({ 
  user,          // Current user data
  onRequireLogin // Callback khi cần login
})
```

**Features**:
- 🎯 **Landing Experience**: First impression cho new users
- 🔍 **Tutor Discovery**: Giúp user tìm kiếm gia sư phù hợp
- 📱 **Responsive**: Tối ưu cho mọi device
- 🚀 **Performance**: Optimized loading với lazy components

### 👑 AdminDashboardPage.jsx
**Mục đích**: Dashboard tổng quát cho Admin

**Structure**:
```jsx
const AdminDashboardPage = () => {
  return <AdminDashboard />;
};
```

**Access Control**:
- 🔒 **Admin Only**: Chỉ role Admin mới truy cập được
- 🛡️ **Protected Route**: Wrapped trong ProtectedRoute
- 🔑 **Permission Check**: Validate admin permissions

### 💰 ManagerDashboardPage.jsx
**Mục đích**: Dashboard cho Manager (quản lý tài chính)

**Features**:
- 📊 **Financial Overview**: Tổng quan doanh thu
- 💸 **Withdrawal Management**: Quản lý rút tiền
- 📈 **Revenue Analytics**: Phân tích doanh thu chi tiết
- 📋 **Financial Reports**: Tạo báo cáo tài chính

**Access Control**:
- 🔒 **Manager Only**: Chỉ role Manager
- 💰 **Financial Permissions**: Quyền truy cập dữ liệu tài chính

### 👨‍💻 StaffDashboardPage.jsx
**Mục đích**: Dashboard cho Staff (quản lý operations)

**Features**:
- 👩‍🏫 **Tutor Management**: Duyệt và quản lý gia sư
- 📋 **Report Handling**: Xử lý báo cáo từ users
- 📊 **Operations Overview**: Tổng quan hoạt động hệ thống

**Access Control**:
- 🔒 **Staff Only**: Chỉ role Staff
- 🛠️ **Operational Permissions**: Quyền quản lý operations

### 👩‍🏫 TutorManagementPage.jsx
**Mục đích**: Dashboard cho Tutor quản lý profile và bookings

**Features**:
- 📅 **Schedule Management**: Quản lý lịch dạy
- 👥 **Student Requests**: Xem requests từ học viên
- 📚 **Teaching History**: Lịch sử dạy học
- 💼 **Offer Management**: Quản lý các offer

**Access Control**:
- 🔒 **Tutor Only**: Chỉ role Tutor
- 🎓 **Teaching Permissions**: Quyền quản lý việc dạy

### 🎓 BecomeATutorPage.jsx
**Mục đích**: Form đăng ký trở thành gia sư với multi-step wizard

**Form Steps**:
```jsx
const steps = [
  { id: 1, title: "Thông tin cơ bản", icon: "👤" },
  { id: 2, title: "Thông tin gia sư", icon: "👩‍🏫" },
  { id: 3, title: "Hashtags", icon: "🏷️" },
  { id: 4, title: "Ngôn ngữ", icon: "🌐" }
];
```

**Form Data Structure**:
```jsx
const formData = {
  // Basic Information
  fullName: "",
  dateOfBirth: "",
  gender: 1,
  timezone: "UTC+7",
  profilePhoto: null,
  
  // Tutor Information
  nickName: "",
  brief: "",
  description: "",
  teachingMethod: "",
  
  // Hashtags & Languages
  hashtagIds: [],
  languages: [{ 
    languageCode: "", 
    proficiency: 3, 
    isPrimary: true 
  }]
};
```

**Features**:
- 📝 **Multi-step Form**: 4 bước đăng ký chi tiết
- 📸 **Photo Upload**: Upload và preview ảnh profile
- 🏷️ **Hashtag Selection**: Chọn các hashtag mô tả skills
- 🌐 **Language Management**: Quản lý ngôn ngữ và trình độ
- ✅ **Validation**: Validate từng bước và tổng thể
- 💾 **Auto Save**: Lưu progress tự động

**Validation Rules**:
```jsx
const validationRules = {
  fullName: { required: true, minLength: 2 },
  dateOfBirth: { required: true, minAge: 18 },
  nickName: { required: true, maxLength: 50 },
  brief: { required: true, maxLength: 200 },
  description: { required: true, maxLength: 1000 },
  languages: { required: true, minCount: 1 }
};
```

### 🌟 BecomeATutorLandingPage.jsx
**Mục đích**: Landing page marketing để attract tutors

**Sections**:
- 🎯 **Hero Section**: Call-to-action chính
- 💰 **Benefits**: Lợi ích khi trở thành gia sư
- 📈 **Success Stories**: Câu chuyện thành công
- 🚀 **Getting Started**: Hướng dẫn bắt đầu

**CTA Flow**:
```jsx
const handleGetStarted = () => {
  if (user) {
    navigate('/become-a-tutor');
  } else {
    onRequireLogin();
  }
};
```

### 📚 MyBookingPage.jsx
**Mục đích**: Trang quản lý booking cho cả Learner và Tutor

**Features for Learners**:
- 📅 **Booking History**: Lịch sử đặt lịch
- ⏰ **Upcoming Lessons**: Các buổi học sắp tới
- ❌ **Cancel Booking**: Hủy booking
- ⭐ **Rate Tutor**: Đánh giá gia sư sau buổi học

**Features for Tutors**:
- 👥 **Student Bookings**: Booking từ học viên
- ✅ **Accept/Reject**: Chấp nhận hoặc từ chối
- 📝 **Lesson Notes**: Ghi chú cho buổi học
- 💰 **Earnings**: Thu nhập từ các buổi học

**Booking Status Flow**:
```jsx
const bookingStatuses = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận', 
  IN_PROGRESS: 'Đang diễn ra',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
  NO_SHOW: 'Không tham gia'
};
```

### 💰 WalletPage.jsx
**Mục đích**: Trang quản lý ví điện tử và thanh toán

**Props**:
```jsx
WalletPage({ 
  showPaymentReturn = false  // Show payment result after transaction
})
```

**Integration**:
- 💳 **Payment Gateway**: Integration với VNPay/MoMo
- 🏦 **Bank Account**: Quản lý tài khoản ngân hàng
- 📊 **Transaction History**: Lịch sử giao dịch
- 💸 **Withdrawal**: Rút tiền về tài khoản

### 💬 MessageListPage.jsx
**Mục đích**: Trang danh sách và chat messages

**Features**:
- 💬 **Message Threading**: Conversation threads
- 🔔 **Real-time Updates**: WebSocket integration
- 🔍 **Search Messages**: Tìm kiếm tin nhắn
- 📎 **File Sharing**: Chia sẻ files trong chat

### 🔑 ForgotPasswordPage.jsx
**Mục đích**: Trang reset mật khẩu

**Flow**:
```jsx
const resetFlow = [
  'Enter email',      // Nhập email
  'Check email',      // Kiểm tra email
  'Enter new password', // Nhập mật khẩu mới
  'Success'           // Thành công
];
```

**Features**:
- 📧 **Email Verification**: Xác thực qua email
- 🔒 **Secure Reset**: Token-based reset
- ⏱️ **Token Expiry**: Thời hạn token
- ✅ **Password Validation**: Validate mật khẩu mới

### ❌ NotFoundPage.jsx
**Mục đích**: Trang 404 - không tìm thấy

**Features**:
- 🎨 **Friendly UI**: Giao diện thân thiện với user
- 🏠 **Navigation Options**: Links về trang chủ
- 🔍 **Search Suggestions**: Gợi ý tìm kiếm
- 📊 **Error Tracking**: Track 404 errors for analytics

**Design Elements**:
```jsx
const NotFoundPage = () => {
  return (
    <div className="not-found">
      <img src="/assets/not_found.gif" alt="Not Found" />
      <h1>Trang không tồn tại</h1>
      <p>Trang bạn tìm kiếm không tồn tại hoặc đã được di chuyển.</p>
      <div className="actions">
        <button onClick={() => navigate('/')}>
          Về trang chủ
        </button>
        <button onClick={() => navigate(-1)}>
          Quay lại
        </button>
      </div>
    </div>
  );
};
```

## 🎨 Page Layout Patterns

### 📱 Responsive Layout
```jsx
const PageLayout = ({ children, title, showHeader = true }) => {
  return (
    <div className="page-layout">
      {showHeader && <Header />}
      <main className="page-content">
        {title && <h1 className="page-title">{title}</h1>}
        {children}
      </main>
      <Footer />
    </div>
  );
};
```

### 🛡️ Protected Page Pattern
```jsx
import { ProtectedRoute, RoleBasedRouteGuard } from '../components/rbac';

const ProtectedPage = ({ allowedRoles, children }) => {
  return (
    <ProtectedRoute>
      <RoleBasedRouteGuard allowedRoles={allowedRoles}>
        {children}
      </RoleBasedRouteGuard>
    </ProtectedRoute>
  );
};
```

### 📊 Dashboard Page Pattern
```jsx
const DashboardPage = ({ role }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({});

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const dashboardData = await fetchDashboardData(role);
        setData(dashboardData);
      } catch (error) {
        console.error('Failed to load dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [role]);

  if (loading) return <DashboardSkeleton />;

  return <DashboardComponent data={data} />;
};
```

## 🔄 Data Flow & State Management

### 🎯 Props Drilling Pattern
```jsx
// Parent Page
const ParentPage = () => {
  const [user, setUser] = useState(null);
  const [globalState, setGlobalState] = useState({});

  return (
    <ChildComponent 
      user={user}
      onUserUpdate={setUser}
      globalState={globalState}
      onStateUpdate={setGlobalState}
    />
  );
};
```

### 🔄 API Integration Pattern
```jsx
const DataPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await apiCall();
        setData(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return <DataDisplay data={data} />;
};
```

## 🛣️ Routing Integration

### 🎯 Route Definitions
```jsx
// App.jsx routing setup
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/become-a-tutor-landing" element={<BecomeATutorLandingPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      
      {/* Protected Routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute>
            <RoleBasedRouteGuard allowedRoles={['Admin']}>
              <AdminDashboardPage />
            </RoleBasedRouteGuard>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/my-bookings"
        element={
          <ProtectedRoute>
            <MyBookingPage />
          </ProtectedRoute>
        }
      />
      
      {/* 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
```

### 🔄 Navigation Patterns
```jsx
const usePageNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigateWithState = (path, state = {}) => {
    navigate(path, { state: { ...state, from: location.pathname } });
  };

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return { navigateWithState, goBack };
};
```

## 🎨 Styling & Theming

### 📱 Page-specific Styles
```css
/* Each page has its own CSS module */
.homepage {
  --page-bg: #ffffff;
  --primary-color: #007bff;
}

.admin-dashboard-page {
  --page-bg: #f8f9fa;
  --sidebar-width: 280px;
}

.wallet-page {
  --money-green: #28a745;
  --money-red: #dc3545;
}
```

### 🎨 Responsive Breakpoints
```css
.page-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

@media (max-width: 768px) {
  .page-content {
    padding: 15px;
  }
}

@media (max-width: 480px) {
  .page-content {
    padding: 10px;
  }
}
```

## 🧪 Testing Strategy

### 📝 Page Testing Pattern
```javascript
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomePage from './HomePage';

describe('HomePage', () => {
  const renderWithRouter = (component) => {
    return render(
      <MemoryRouter>
        {component}
      </MemoryRouter>
    );
  };

  test('should render homepage sections', () => {
    renderWithRouter(<HomePage />);
    
    expect(screen.getByTestId('banner')).toBeInTheDocument();
    expect(screen.getByTestId('tutor-list')).toBeInTheDocument();
    expect(screen.getByTestId('how-it-works')).toBeInTheDocument();
  });
});
```

### 🔒 Protected Route Testing
```javascript
describe('Protected Pages', () => {
  test('should redirect to login when not authenticated', () => {
    localStorage.removeItem('accessToken');
    
    renderWithRouter(<AdminDashboardPage />);
    
    expect(screen.getByText(/đăng nhập/i)).toBeInTheDocument();
  });
});
```

## 🚀 Performance Optimization

### ⚡ Code Splitting
```jsx
// Lazy load heavy pages
const BecomeATutorPage = lazy(() => import('./BecomeATutorPage'));
const WalletPage = lazy(() => import('./WalletPage'));

const App = () => {
  return (
    <Suspense fallback={<PageLoadingSpinner />}>
      <Routes>
        <Route path="/become-a-tutor" element={<BecomeATutorPage />} />
        <Route path="/wallet" element={<WalletPage />} />
      </Routes>
    </Suspense>
  );
};
```

### 🎯 SEO Optimization
```jsx
const SEOPage = ({ title, description, keywords }) => {
  useEffect(() => {
    document.title = title;
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.content = description;
    }
    
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.content = keywords;
    }
  }, [title, description, keywords]);

  return <PageContent />;
};
```

## 🔗 Related Components

- [Component Directory](../components/README.md) - Tất cả reusable components
- [RBAC System](../components/rbac/README.md) - Route protection
- [API Integration](../components/api/README.md) - Data fetching
- [Utilities](../utils/README.md) - Helper functions
