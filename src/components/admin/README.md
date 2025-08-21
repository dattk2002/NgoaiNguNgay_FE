# Admin Components

👑 **Mô tả**: Các components dành cho Admin Dashboard - quản lý tổng thể hệ thống NgoaiNguNgay.

## 🏗️ Cấu trúc components

```
src/components/admin/
├── AdminDashboard.jsx        # Layout chính admin dashboard
├── AdminOverview.jsx         # Tổng quan hệ thống và thống kê
├── UserManagement.jsx        # Quản lý danh sách người dùng
├── AccountCreation.jsx       # Tạo tài khoản Manager/Staff
└── LegalDocumentManagement.jsx # Quản lý tài liệu pháp lý
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
- 📄 **legal-documents**: Tài liệu pháp lý (với quản lý phiên bản)

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

### 📄 LegalDocumentManagement.jsx
**Mục đích**: Quản lý tài liệu pháp lý và phiên bản của hệ thống

**Tính năng**:
- 📋 **Document List**: Hiển thị danh sách tài liệu pháp lý với truncation
- ➕ **Create Document**: Tạo tài liệu pháp lý mới với modal
- ✏️ **Edit Document**: Chỉnh sửa tài liệu với modal
- 🗑️ **Delete Document**: Xóa tài liệu với confirmation modal
- 👁️ **Detail View**: Xem chi tiết tài liệu với modal riêng biệt
- 🔍 **Filter & Search**: Lọc theo danh mục và phân trang
- 📊 **Pagination**: Phân trang kết quả
- 🎨 **Modern UI**: Sử dụng Framer Motion animations
- 📱 **Responsive**: Mobile-friendly design
- 📅 **Time Display**: Hiển thị createdTime và lastUpdatedTime
- 📚 **Version Management**: Quản lý phiên bản tài liệu với CRUD operations
- 🔄 **Version Status**: Quản lý trạng thái phiên bản (Draft/Inactive/Active)

**API Integration**:
- **GET /api/legaldocument**: Lấy danh sách tài liệu với pagination
- **GET /api/legaldocument/{id}**: Lấy chi tiết tài liệu theo ID (bao gồm danh sách phiên bản)
- **POST /api/legaldocument**: Tạo tài liệu pháp lý mới
- **PUT /api/legaldocument**: Cập nhật tài liệu pháp lý (ID trong request body)
- **DELETE /api/legaldocument/:id**: Xóa tài liệu pháp lý

**Version Management APIs**:
- **GET /api/legaldocument/version/{id}**: Lấy danh sách phiên bản với pagination (id là legalDocumentId)
- **GET /api/legaldocument/version/{id}**: Lấy chi tiết phiên bản đơn lẻ (id là versionId)
- **POST /api/legaldocumentversion**: Tạo phiên bản mới
- **PUT /api/legaldocumentversion**: Cập nhật phiên bản (ID trong request body)
- **DELETE /api/legaldocumentversion/:id**: Xóa phiên bản

**State Management**:
```jsx
// Document management
const [documents, setDocuments] = useState([]);
const [loading, setLoading] = useState(false);
const [showCreateModal, setShowCreateModal] = useState(false);
const [showEditModal, setShowEditModal] = useState(false);
const [showDeleteModal, setShowDeleteModal] = useState(false);
const [showDetailModal, setShowDetailModal] = useState(false);
const [selectedDocument, setSelectedDocument] = useState(null);
const [detailedDocument, setDetailedDocument] = useState(null);
const [loadingDetail, setLoadingDetail] = useState(false);
const [generalError, setGeneralError] = useState("");
const [fieldErrors, setFieldErrors] = useState({ name: "", description: "" });

// Version management
const [showVersionModal, setShowVersionModal] = useState(false);
const [showCreateVersionModal, setShowCreateVersionModal] = useState(false);
const [showEditVersionModal, setShowEditVersionModal] = useState(false);
const [showDeleteVersionModal, setShowDeleteVersionModal] = useState(false);
const [versions, setVersions] = useState([]);
const [loadingVersions, setLoadingVersions] = useState(false);
const [selectedVersion, setSelectedVersion] = useState(null);
const [newVersion, setNewVersion] = useState({
    legalDocumentId: '', version: '', status: 0, content: '', contentType: ''
});
const [editVersion, setEditVersion] = useState({
    legalDocumentId: '', version: '', status: 0, content: '', contentType: ''
});
const [versionFieldErrors, setVersionFieldErrors] = useState({
    version: "", content: "", contentType: ""
});
```

**Document Fields**:
```jsx
const [newDocument, setNewDocument] = useState({
  name: '',        // Tên tài liệu (required)
  description: ''  // Mô tả tài liệu (optional)
});

// Detailed document includes:
// - id, name, description, category
// - createdTime, lastUpdatedTime
// - createdAt, updatedAt (fallback fields)
```

**Version Fields**:
```jsx
const [newVersion, setNewVersion] = useState({
  legalDocumentId: '',  // ID tài liệu pháp lý (required)
  version: '',          // Phiên bản (required)
  status: 0,            // Trạng thái: 0=draft, 1=inactive, 2=active (required)
  content: '',          // Nội dung phiên bản (required)
  contentType: ''       // Loại nội dung (required)
});
```

**Filter Options**:
- **Category**: Lọc theo danh mục tài liệu
- **Page Size**: 5, 10, 20, 50 items per page
- **Pagination**: Navigation giữa các trang

**Modal Features**:
- **Create Modal**: Form tạo tài liệu mới với validation
- **Edit Modal**: Form chỉnh sửa tài liệu với pre-filled data
- **Delete Modal**: Confirmation dialog với warning icon
- **Detail Modal**: Hiển thị đầy đủ thông tin tài liệu và danh sách phiên bản (nếu có)
- **Version Management Modal**: Quản lý phiên bản với table view
- **Create Version Modal**: Form tạo phiên bản mới với status selection
- **Edit Version Modal**: Form chỉnh sửa phiên bản với pre-filled data
- **Delete Version Modal**: Confirmation dialog cho xóa phiên bản
- **Version Detail Modal**: Hiển thị chi tiết đầy đủ của một phiên bản
- **Animations**: Smooth transitions với Framer Motion
- **Error Handling**: Field-level và general error display

**Table Columns**:
- 📄 Tên tài liệu
- 📝 Mô tả (truncated với "Xem thêm" link)
- 🏷️ Danh mục
- 📅 Ngày tạo (createdTime)
- 📅 Cập nhật lần cuối (lastUpdatedTime)
- ⚙️ Thao tác (Xem chi tiết/Quản lý phiên bản/Chỉnh sửa/Xóa)

**Version Table Columns**:
- 📚 Phiên bản
- 🏷️ Trạng thái (Draft/Inactive/Active với color coding)
- 📄 Loại nội dung
- 📝 Nội dung (truncated)
- ⚙️ Thao tác (Xem chi tiết/Chỉnh sửa/Xóa)

**Text Truncation**:
- **Description**: Truncate ở 80 ký tự với "Xem thêm" button
- **Detail View**: Hiển thị đầy đủ mô tả trong modal
- **Responsive**: Tự động điều chỉnh theo màn hình

**Error Handling**:
- **Field Validation**: Real-time validation với error messages
- **API Error Handling**: Parse và hiển thị server errors
- **Toast Notifications**: Success/error feedback
- **Loading States**: Spinner icons cho async operations

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

// Legal documents
GET /api/legaldocument - Fetch legal documents with pagination
POST /api/legaldocument - Create new legal document
PUT /api/legaldocument - Update legal document (ID in request body)
DELETE /api/legaldocument/:id - Delete legal document
GET /api/legaldocument/:id - Get single legal document details

// Legal document versions
GET /api/legaldocument/version/{id} - Fetch legal document versions with pagination (id is legalDocumentId)
GET /api/legaldocument/version/{id} - Get single version details (id is versionId)
POST /api/legaldocumentversion - Create new legal document version
PUT /api/legaldocumentversion - Update legal document version (ID in request body)
DELETE /api/legaldocumentversion/:id - Delete legal document version

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
