# Hệ thống Phân quyền Role-Based Access Control (RBAC)

## Tổng quan
Hệ thống phân quyền đã được triển khai để kiểm soát truy cập dựa trên vai trò người dùng với các quy tắc sau:

### Phân quyền theo Role:
- **Admin**: Chỉ có thể truy cập `/admin` và các trang con
- **Staff**: Chỉ có thể truy cập `/staff` và các trang con  
- **Manager**: Chỉ có thể truy cập `/manager` và các trang con
- **Learner/Tutor**: Có thể truy cập tất cả trang công khai, không được truy cập dashboard của admin/staff/manager

## Cấu trúc thư mục
Tất cả các components liên quan đến phân quyền được tổ chức trong thư mục `src/components/rbac/`:
- `ProtectedRoute.jsx` - Component chính để bảo vệ routes
- `RoleBasedRedirect.jsx` - Tự động redirect sau login
- `RoleBasedRouteGuard.jsx` - Giám sát và redirect liên tục
- `index.js` - Export tất cả components để dễ import
- `ROLE_BASED_ACCESS_README.md` - Tài liệu hướng dẫn

## Cách sử dụng
```jsx
// Import từ thư mục rbac
import { AdminRoute, StaffRoute, ManagerRoute, BlockedRoute } from './components/rbac';
import RoleBasedRedirect from './components/rbac/RoleBasedRedirect';
import RoleBasedRouteGuard from './components/rbac/RoleBasedRouteGuard';
```

## Các Component chính

### 1. ProtectedRoute.jsx
Component chính để bảo vệ các routes:
```jsx
// Sử dụng để bảo vệ route với roles cụ thể
<ProtectedRoute user={user} allowedRoles={['admin']} redirectTo="/">
  <AdminPage />
</ProtectedRoute>

// Các variant sẵn có:
<AdminRoute user={user}>...</AdminRoute>
<StaffRoute user={user}>...</StaffRoute>
<ManagerRoute user={user}>...</ManagerRoute>
```

### 2. BlockedRoute.jsx
Component để chặn các roles nhất định:
```jsx
// Chặn admin/staff/manager truy cập trang công khai
<BlockedRoute user={user} blockedRoles={['admin', 'staff', 'manager']}>
  <HomePage />
</BlockedRoute>
```

### 3. RoleBasedRouteGuard.jsx
Component tự động redirect user đến dashboard phù hợp khi họ cố truy cập trang không được phép.

### 4. RoleBasedRedirect.jsx
Component tự động redirect user sau khi đăng nhập thành công dựa trên role.

## Luồng hoạt động

### Khi đăng nhập:
1. User đăng nhập thành công
2. `handleLogin` trong App.jsx được gọi
3. `setTriggerRoleRedirect(true)` được set
4. `RoleBasedRedirect` nhận trigger và redirect user đến dashboard phù hợp
5. Trigger được reset sau khi redirect thành công

### Khi điều hướng thông thường:
1. `RoleBasedRouteGuard` liên tục kiểm tra URL hiện tại
2. Nếu user có role admin/staff/manager và đang ở trang không được phép
3. Tự động redirect về dashboard phù hợp

### Khi truy cập route được bảo vệ:
1. `ProtectedRoute` kiểm tra user có đăng nhập không
2. Kiểm tra user có role phù hợp không
3. Cho phép truy cập hoặc redirect đến trang không có quyền

## Cấu hình Routes trong App.jsx

```jsx
// Routes công khai (chỉ cho learner/tutor)
<Route path="/" element={
  <BlockedRoute user={user} blockedRoles={['admin', 'staff', 'manager']}>
    <HomePage user={user} onRequireLogin={openLoginModal} />
  </BlockedRoute>
} />

// Dashboard routes (có phân quyền)
<Route path="/admin" element={
  <AdminRoute user={user}>
    <AdminDashboardPage />
  </AdminRoute>
} />

<Route path="/staff" element={
  <StaffRoute user={user}>
    <StaffDashboardPage />
  </StaffRoute>
} />

<Route path="/manager" element={
  <ManagerRoute user={user}>
    <ManagerDashboardPage />
  </ManagerRoute>
} />
```

## Utility Functions

### hasRole(user, roleName)
Kiểm tra user có role cụ thể không, hỗ trợ cả string và array format.

### hasAnyRole(user, roleNames)
Kiểm tra user có bất kỳ role nào trong danh sách không.

## Logout Handling
Khi logout, tất cả các tokens và dữ liệu user được xóa:
- `loggedInUser`
- `user`
- `accessToken`
- `refreshToken`
- `adminToken`/`staffToken`/`managerToken`

## Security Features
- Tự động redirect khi user truy cập trang không được phép qua URL
- Bảo vệ tất cả routes quan trọng
- Xóa sạch authentication data khi logout
- Kiểm tra quyền liên tục trong suốt phiên làm việc

## Lưu ý khi phát triển
1. Luôn wrap route mới với appropriate protection component
2. Đảm bảo role được lưu đúng format trong user object  
3. Test cả trường hợp normal navigation và direct URL access
4. Kiểm tra logout flow có xóa sạch tất cả tokens không 