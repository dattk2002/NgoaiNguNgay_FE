# Components Directory

📁 **Mô tả**: Thư mục chứa tất cả React components của ứng dụng NgoaiNguNgay - một nền tảng kết nối gia sư và học viên.

## 🏗️ Cấu trúc thư mục

```
src/components/
├── admin/              # Dashboard và quản lý cho admin
├── api/                # API client và authentication
├── firebase/           # Cấu hình Firebase
├── manager/            # Dashboard cho manager tài chính
├── modals/             # Các modal components
├── rbac/               # Role-based access control
├── staff/              # Dashboard cho staff
├── tutorManagement/    # Quản lý gia sư
├── tutors/             # Components liên quan đến gia sư
├── users/              # Quản lý người dùng
├── wallet/             # Hệ thống ví và thanh toán
├── Banner.jsx          # Banner component
├── Footer.jsx          # Footer component  
├── FooterHandler.jsx   # Logic xử lý footer
├── Header.jsx          # Header navigation
├── HowItWork.jsx       # Giới thiệu cách hoạt động
├── LessonManagement.jsx # Quản lý bài học
├── MyBookingTable.jsx  # Bảng đặt lịch của người dùng
└── ReviewSection.jsx   # Section đánh giá
```

## 🔧 Các component chính

### 🏠 Layout Components
- **Header.jsx**: Navigation bar chính với authentication, menu
- **Footer.jsx**: Footer thông tin liên hệ và links
- **Banner.jsx**: Hero banner trang chủ
- **FooterHandler.jsx**: Logic xử lý trạng thái footer

### 📖 Content Components  
- **HowItWork.jsx**: Giải thích quy trình sử dụng platform
- **ReviewSection.jsx**: Hiển thị đánh giá từ người dùng
- **LessonManagement.jsx**: Quản lý và hiển thị bài học
- **MyBookingTable.jsx**: Bảng lịch đặt của người dùng

## 🎯 Các thư mục chuyên biệt

### 👨‍💼 Role-based Components
- **admin/**: Dashboard quản trị tổng thể hệ thống
- **manager/**: Dashboard quản lý tài chính và doanh thu  
- **staff/**: Dashboard nhân viên quản lý gia sư và báo cáo

### 🔐 Authentication & Security
- **api/**: Client API và xử lý authentication
- **rbac/**: Role-based access control system
- **firebase/**: Cấu hình Firebase cho authentication

### 👩‍🏫 Core Features
- **tutors/**: Profile gia sư, danh sách, đặt lịch
- **tutorManagement/**: Quản lý gia sư từ phía admin/staff
- **users/**: Profile và quản lý người dùng
- **wallet/**: Hệ thống ví điện tử và thanh toán

### 🔧 UI Components
- **modals/**: Các popup và dialog (login, signup, confirmations)

## 💡 Nguyên tắc phát triển

### 🏗️ Kiến trúc
- **Separation of Concerns**: Mỗi thư mục có trách nhiệm riêng biệt
- **Role-based Structure**: Phân chia theo vai trò người dùng
- **Reusable Components**: Components có thể tái sử dụng

### 🎨 UI/UX
- **Responsive Design**: Hỗ trợ desktop và mobile
- **Accessibility**: Focus management và keyboard navigation
- **Consistent Styling**: Sử dụng Tailwind CSS và Material-UI

### 🔄 State Management
- **Local State**: React hooks cho component state
- **Global State**: Context API và localStorage
- **API State**: Custom hooks cho data fetching

## 🚀 Hướng dẫn sử dụng

### Import Components
```jsx
// Layout components
import Header from './components/Header';
import Footer from './components/Footer';

// Feature components  
import TutorCard from './components/tutors/TutorCard';
import LoginModal from './components/modals/LoginModal';

// Dashboard components
import AdminDashboard from './components/admin/AdminDashboard';
```

### Role-based Rendering
```jsx
import { ProtectedRoute } from './components/rbac/ProtectedRoute';
import { hasRole } from './components/rbac';

// Chỉ admin mới thấy
<ProtectedRoute allowedRoles={['Admin']}>
  <AdminDashboard />
</ProtectedRoute>
```

## 📝 Quy tắc đóng góp

1. **Naming Convention**: PascalCase cho components
2. **File Structure**: Một component per file
3. **Props Documentation**: Sử dụng PropTypes hoặc TypeScript
4. **Responsive**: Test trên các kích thước màn hình
5. **Performance**: Sử dụng React.memo khi cần thiết

## 🔗 Liên kết

- [Admin Components](./admin/README.md)
- [Manager Components](./manager/README.md) 
- [Staff Components](./staff/README.md)
- [Tutor Components](./tutors/README.md)
- [Modal Components](./modals/README.md)
- [Wallet Components](./wallet/README.md)
- [RBAC System](./rbac/README.md)
