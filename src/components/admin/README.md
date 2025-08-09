# Admin Components

👑 **Mô tả**: Các components dành cho Admin Dashboard - quản lý tổng thể hệ thống NgoaiNguNgay.

## 🏗️ Cấu trúc components

```
src/components/admin/
├── AdminDashboard.jsx        # Layout chính admin dashboard
├── AdminOverview.jsx         # Tổng quan hệ thống và thống kê
├── UserManagement.jsx        # Quản lý danh sách người dùng
└── AccountCreation.jsx       # Tạo tài khoản Manager/Staff
```

## 🔧 Chi tiết components

### 🏠 AdminDashboard.jsx
**Mục đích**: Layout chính của admin dashboard với sidebar navigation

**Tính năng**:
- ✅ Sidebar menu với 3 tab chính
- ✅ Authentication state management 
- ✅ Logout functionality với cleanup
- ✅ Responsive design
- ✅ Breadcrumb navigation

**State Management**:
```jsx
const [activeTab, setActiveTab] = useState('overview');
```

**Menu Items**:
- 📊 **overview**: Tổng quan hệ thống
- 👥 **user-management**: Quản lý người dùng
- ➕ **account-creation**: Tạo tài khoản

### 📊 AdminOverview.jsx
**Mục đích**: Hiển thị thống kê tổng quan và tình trạng hệ thống

**Metrics hiển thị**:
- 👥 **Tổng người dùng**: 1,250 users
- ✅ **Người dùng hoạt động**: 1,100 users
- 🆕 **Người dùng mới tháng này**: 85 users
- ❌ **Người dùng bị vô hiệu hóa**: 150 users

**Phân bố vai trò**:
- 👨‍💼 **Manager**: 5 tài khoản
- 👨‍💻 **Staff**: 12 tài khoản  
- 👩‍🏫 **Gia sư**: 350 tài khoản
- 👨‍🎓 **Học viên**: 883 tài khoản

**System Health**:
- 🟢 **Server Status**: Online
- 🟢 **Database**: Connected
- 🟡 **Payment Gateway**: Maintenance

### 👥 UserManagement.jsx
**Mục đích**: Quản lý danh sách người dùng và thao tác trên tài khoản

**Tính năng**:
- 🔍 **Tìm kiếm**: Theo tên hoặc email
- 🏷️ **Filter**: Theo trạng thái (active/disabled)
- 📊 **Statistics**: Hiển thị số lượng user theo trạng thái
- ⚙️ **Actions**: Vô hiệu hóa/kích hoạt tài khoản

**User Actions**:
```jsx
const handleDisableUser = (userId) => {
  // Toggle user status between active/disabled
};
```

**Table Columns**:
- 👤 Thông tin người dùng (tên, email)
- 🏷️ Vai trò (Manager, Staff, Gia sư, Học viên)
- ✅ Trạng thái (Hoạt động/Bị vô hiệu hóa)
- 📅 Ngày tham gia
- ⚙️ Thao tác

### ➕ AccountCreation.jsx
**Mục đích**: Tạo tài khoản mới cho Manager và Staff

**Tính năng**:
- 👨‍💼 **Create Manager**: Tạo tài khoản quản lý tài chính
- 👨‍💻 **Create Staff**: Tạo tài khoản nhân viên
- 📝 **Form validation**: Validate thông tin đầu vào
- 📊 **Statistics**: Hiển thị số lượng tài khoản theo role
- 📋 **Activity log**: Lịch sử tạo tài khoản gần đây

**Manager Permissions**:
- 📈 Quản lý doanh thu
- 📊 Tạo báo cáo tài chính  
- 📉 Phân tích xu hướng

**Staff Permissions**:
- 👩‍🏫 Quản lý gia sư
- 📋 Xử lý báo cáo
- ✅ Phê duyệt hồ sơ

**Form Fields**:
```jsx
const [formData, setFormData] = useState({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
});
```

## 🎨 UI/UX Features

### 🎯 Design System
- **Color Scheme**: Dark sidebar với blue accent
- **Typography**: Clean, readable font hierarchy
- **Icons**: SVG icons cho mỗi action
- **Responsive**: Mobile-friendly layout

### 📱 Responsive Design
```css
/* Desktop: Full sidebar */
.w-64 /* 256px sidebar */

/* Mobile: Collapsed/overlay sidebar */
@media (max-width: 768px) {
  /* Responsive breakpoints */
}
```

### ✨ Interactions
- **Hover Effects**: Subtle transitions trên buttons/cards
- **Loading States**: Spinners khi xử lý actions
- **Toast Notifications**: Feedback cho user actions
- **Modal Dialogs**: Confirm dialogs cho destructive actions

## 🔐 Permissions & Security

### 🛡️ Access Control
- **Role Required**: Chỉ users có role "Admin"
- **Token Validation**: Check valid admin token
- **Session Management**: Auto logout khi token expired

### 🔒 Security Features
```jsx
// Token cleanup on logout
localStorage.removeItem('adminToken');
localStorage.removeItem('adminUser');
localStorage.removeItem('accessToken');
localStorage.removeItem('refreshToken');
```

## 📊 State Management

### 🗂️ Local State
```jsx
// AdminDashboard
const [activeTab, setActiveTab] = useState('overview');

// UserManagement  
const [searchTerm, setSearchTerm] = useState('');
const [userFilter, setUserFilter] = useState('all');
const [users, setUsers] = useState([]);

// AccountCreation
const [showModal, setShowModal] = useState(false);
const [modalType, setModalType] = useState('');
const [formData, setFormData] = useState({});
```

### 🔄 Data Flow
1. **Load dashboard** → Fetch user statistics
2. **Filter/Search** → Update displayed users
3. **User actions** → API call → Update local state
4. **Account creation** → Validate → API call → Success feedback

## 📡 API Integration

### 🔌 Endpoints sử dụng
```javascript
// User management
GET /api/users - Fetch user list
PUT /api/users/:id/status - Toggle user status

// Account creation  
POST /api/auth/register/manager - Create manager
POST /api/auth/register/staff - Create staff

// Statistics
GET /api/admin/stats - System overview stats
```

## 🚀 Usage Examples

### Basic Dashboard Setup
```jsx
import AdminDashboard from './components/admin/AdminDashboard';

// Protected route chỉ cho admin
<ProtectedRoute allowedRoles={['Admin']}>
  <AdminDashboard />
</ProtectedRoute>
```

### User Management Integration
```jsx
// Trong parent component
const handleUserUpdate = (updatedUser) => {
  // Update global user state
  updateUserInStore(updatedUser);
};

<UserManagement onUserUpdate={handleUserUpdate} />
```

## 🔧 Development Guidelines

### 📁 File Organization
- **Single Responsibility**: Mỗi component có 1 mục đích rõ ràng
- **Reusable Logic**: Extract custom hooks cho business logic
- **Consistent Naming**: PascalCase cho components, camelCase cho functions

### 🎨 Styling Conventions
- **Tailwind CSS**: Utility-first styling
- **Consistent Colors**: Sử dụng color palette đồng nhất
- **Accessible**: ARIA labels và keyboard navigation

### 🧪 Testing Considerations
- **Mock API calls**: Sử dụng MSW cho integration tests
- **User Interactions**: Test form submissions và user actions
- **Responsive**: Test trên các viewport sizes

## 🔗 Related Components

- [Manager Dashboard](../manager/README.md) - Dashboard cho financial managers
- [Staff Dashboard](../staff/README.md) - Dashboard cho staff members  
- [RBAC System](../rbac/README.md) - Role-based access control
- [Modal Components](../modals/README.md) - Shared modal components
