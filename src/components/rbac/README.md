# RBAC (Role-Based Access Control)

🛡️ **Mô tả**: Hệ thống phân quyền dựa trên vai trò (Role-Based Access Control) cho ứng dụng NgoaiNguNgay - kiểm soát truy cập theo roles và permissions.

## 🏗️ Cấu trúc components

```
src/components/rbac/
├── ProtectedRoute.jsx          # Bảo vệ routes dựa trên authentication
├── RoleBasedRedirect.jsx       # Redirect theo role sau khi login
├── RoleBasedRouteGuard.jsx     # Guard routes dựa trên roles
├── index.js                    # Export tất cả RBAC components
└── ROLE_BASED_ACCESS_README.md # Documentation chi tiết
```

## 🎭 Role System

### 👑 Roles Hierarchy
```javascript
const ROLES = {
  ADMIN: 'Admin',           // Quản trị viên hệ thống - quyền cao nhất
  MANAGER: 'Manager',       // Quản lý tài chính - quản lý tiền bạc
  STAFF: 'Staff',          // Nhân viên - xử lý gia sư và reports
  TUTOR: 'Tutor',          // Gia sư - dạy học
  LEARNER: 'Learner'       // Học viên - học
};
```

### 🔐 Permissions Matrix
```javascript
const PERMISSIONS = {
  // Admin permissions - toàn quyền
  ADMIN: [
    'user.create',
    'user.read', 
    'user.update',
    'user.delete',
    'admin.dashboard',
    'manager.create',
    'staff.create'
  ],
  
  // Manager permissions - tài chính
  MANAGER: [
    'financial.read',
    'financial.reports',
    'withdrawal.approve',
    'withdrawal.reject',
    'revenue.analysis',
    'manager.dashboard'
  ],
  
  // Staff permissions - quản lý gia sư
  STAFF: [
    'tutor.review',
    'tutor.approve',
    'tutor.reject',
    'report.manage',
    'staff.dashboard'
  ],
  
  // Tutor permissions - dạy học
  TUTOR: [
    'profile.update',
    'schedule.manage',
    'lesson.create',
    'student.view',
    'earning.view'
  ],
  
  // Learner permissions - học
  LEARNER: [
    'profile.update',
    'booking.create',
    'lesson.join',
    'tutor.search',
    'payment.make'
  ]
};
```

## 🔧 Chi tiết components

### 🛡️ ProtectedRoute.jsx
**Mục đích**: Bảo vệ routes khỏi truy cập unauthorized

**Tính năng**:
- ✅ **Authentication Check**: Kiểm tra user đã login chưa
- 🔄 **Auto Redirect**: Tự động redirect đến login nếu chưa auth
- 🔒 **Token Validation**: Validate access token
- 📍 **Return URL**: Lưu URL để redirect sau khi login

**Implementation**:
```jsx
const ProtectedRoute = ({ children, fallback = <Navigate to="/login" /> }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          setIsAuthenticated(false);
          return;
        }

        // Validate token với server
        const response = await validateToken(token);
        setIsAuthenticated(response.valid);
        
        // Store return URL
        if (!response.valid) {
          localStorage.setItem('returnUrl', location.pathname);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [location.pathname]);

  if (loading) {
    return <div className="auth-loading">Đang kiểm tra quyền truy cập...</div>;
  }

  return isAuthenticated ? children : fallback;
};
```

### 🎯 RoleBasedRedirect.jsx
**Mục đích**: Redirect user đến dashboard phù hợp với role sau khi login

**Logic Redirect**:
```jsx
const RoleBasedRedirect = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const returnUrl = localStorage.getItem('returnUrl');
    
    // Clear return URL
    localStorage.removeItem('returnUrl');
    
    // Redirect based on role
    const redirectPath = getRedirectPath(user.role, returnUrl);
    navigate(redirectPath, { replace: true });
  }, [navigate]);

  const getRedirectPath = (role, returnUrl) => {
    // Prioritize return URL nếu có và user có quyền
    if (returnUrl && hasAccessToPath(role, returnUrl)) {
      return returnUrl;
    }

    // Default redirects by role
    switch (role) {
      case 'Admin':
        return '/admin/dashboard';
      case 'Manager':
        return '/manager/dashboard';
      case 'Staff':
        return '/staff/dashboard';
      case 'Tutor':
        return '/tutor/dashboard';
      case 'Learner':
        return '/dashboard';
      default:
        return '/';
    }
  };

  return <div className="redirecting">Đang chuyển hướng...</div>;
};
```

### 🚧 RoleBasedRouteGuard.jsx
**Mục đích**: Guard cụ thể cho từng route dựa trên role và permissions

**Features**:
- 🎭 **Role Checking**: Kiểm tra role của user
- 🔐 **Permission Checking**: Kiểm tra permissions cụ thể
- 🚫 **Access Denial**: Block access và show error
- 📊 **Audit Logging**: Log access attempts

**Implementation**:
```jsx
const RoleBasedRouteGuard = ({ 
  children, 
  allowedRoles = [], 
  requiredPermissions = [],
  fallback = <AccessDenied />
}) => {
  const [hasAccess, setHasAccess] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        // Check role
        const hasRole = allowedRoles.length === 0 || 
                       allowedRoles.includes(user.role);
        
        // Check permissions
        const userPermissions = PERMISSIONS[user.role] || [];
        const hasPermissions = requiredPermissions.every(
          permission => userPermissions.includes(permission)
        );
        
        const access = hasRole && hasPermissions;
        setHasAccess(access);
        
        // Audit log
        logAccess({
          userId: user.id,
          role: user.role,
          path: window.location.pathname,
          allowed: access,
          timestamp: new Date().toISOString()
        });
        
      } catch (error) {
        console.error('Access check failed:', error);
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [allowedRoles, requiredPermissions]);

  if (loading) {
    return <div className="access-checking">Kiểm tra quyền truy cập...</div>;
  }

  return hasAccess ? children : fallback;
};
```

## 🔧 Utility Functions

### 🎭 Role Utilities
```javascript
// Check if user has specific role
export const hasRole = (userRole, requiredRole) => {
  return userRole === requiredRole;
};

// Check if user has any of the roles
export const hasAnyRole = (userRole, allowedRoles) => {
  return allowedRoles.includes(userRole);
};

// Get role hierarchy level
export const getRoleLevel = (role) => {
  const hierarchy = {
    'Admin': 5,
    'Manager': 4,
    'Staff': 3,
    'Tutor': 2,
    'Learner': 1
  };
  return hierarchy[role] || 0;
};

// Check if user role is higher than required
export const hasHigherRole = (userRole, requiredRole) => {
  return getRoleLevel(userRole) >= getRoleLevel(requiredRole);
};
```

### 🔐 Permission Utilities
```javascript
// Check if user has specific permission
export const hasPermission = (userRole, permission) => {
  const rolePermissions = PERMISSIONS[userRole] || [];
  return rolePermissions.includes(permission);
};

// Check if user has all required permissions
export const hasAllPermissions = (userRole, requiredPermissions) => {
  const rolePermissions = PERMISSIONS[userRole] || [];
  return requiredPermissions.every(
    permission => rolePermissions.includes(permission)
  );
};

// Get all permissions for role
export const getRolePermissions = (role) => {
  return PERMISSIONS[role] || [];
};
```

### 🛣️ Route Utilities
```javascript
// Check if user has access to specific path
export const hasAccessToPath = (userRole, path) => {
  const routePermissions = {
    '/admin': ['Admin'],
    '/manager': ['Manager'],
    '/staff': ['Staff'],
    '/tutor': ['Tutor'],
    '/dashboard': ['Learner', 'Tutor'],
    '/wallet': ['Learner', 'Tutor', 'Manager'],
    '/profile': ['Admin', 'Manager', 'Staff', 'Tutor', 'Learner']
  };

  for (const route in routePermissions) {
    if (path.startsWith(route)) {
      return routePermissions[route].includes(userRole);
    }
  }
  
  return true; // Allow access to public routes
};
```

## 📊 Audit & Logging

### 📝 Access Logging
```javascript
const logAccess = async (accessInfo) => {
  try {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Access Log:', accessInfo);
    }
    
    // Send to analytics/monitoring service
    await fetch('/api/audit/access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(accessInfo)
    });
  } catch (error) {
    console.error('Failed to log access:', error);
  }
};

// Security event logging
const logSecurityEvent = async (event) => {
  try {
    await fetch('/api/audit/security', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...event,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        ip: await fetch('https://api.ipify.org?format=json')
          .then(r => r.json())
          .then(data => data.ip)
          .catch(() => 'unknown')
      })
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
};
```

## 🎨 UI Components

### 🚫 AccessDenied Component
```jsx
const AccessDenied = ({ message, canGoBack = true }) => {
  const navigate = useNavigate();
  
  return (
    <div className="access-denied">
      <div className="icon">🚫</div>
      <h2>Truy cập bị từ chối</h2>
      <p>{message || 'Bạn không có quyền truy cập vào trang này.'}</p>
      
      <div className="actions">
        {canGoBack && (
          <button onClick={() => navigate(-1)} className="btn-secondary">
            Quay lại
          </button>
        )}
        <button onClick={() => navigate('/')} className="btn-primary">
          Trang chủ
        </button>
      </div>
    </div>
  );
};
```

### ⏳ Loading Components
```jsx
const AuthLoading = () => (
  <div className="auth-loading">
    <div className="spinner"></div>
    <p>Đang kiểm tra quyền truy cập...</p>
  </div>
);

const AccessChecking = () => (
  <div className="access-checking">
    <div className="spinner"></div>
    <p>Đang xác thực...</p>
  </div>
);
```

## 🚀 Usage Examples

### Basic Protected Route
```jsx
import { ProtectedRoute } from './components/rbac';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
```

### Role-Based Route Guard
```jsx
import { RoleBasedRouteGuard } from './components/rbac';

function AdminRoutes() {
  return (
    <RoleBasedRouteGuard 
      allowedRoles={['Admin']}
      fallback={<AccessDenied message="Chỉ Admin mới có quyền truy cập" />}
    >
      <AdminDashboard />
    </RoleBasedRouteGuard>
  );
}
```

### Multiple Route Protection
```jsx
function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      
      {/* Protected routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute>
            <RoleBasedRouteGuard allowedRoles={['Admin']}>
              <AdminRoutes />
            </RoleBasedRouteGuard>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/manager/*"
        element={
          <ProtectedRoute>
            <RoleBasedRouteGuard allowedRoles={['Manager']}>
              <ManagerRoutes />
            </RoleBasedRouteGuard>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
```

## 🔒 Security Best Practices

### 🛡️ Client-Side Security
```javascript
// Never trust client-side role checking alone
// Always validate on server-side

// Encode sensitive data
const encodeUserData = (userData) => {
  return btoa(JSON.stringify(userData));
};

// Validate token periodically
const validateTokenPeriodically = () => {
  setInterval(async () => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        await validateToken(token);
      } catch (error) {
        // Token invalid, redirect to login
        localStorage.clear();
        window.location.href = '/login';
      }
    }
  }, 5 * 60 * 1000); // Check every 5 minutes
};
```

### 🔐 Token Security
```javascript
// Secure token storage
const storeTokenSecurely = (token) => {
  // In production, consider using httpOnly cookies
  localStorage.setItem('accessToken', token);
  
  // Set expiration
  const expirationTime = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
  localStorage.setItem('tokenExpiration', expirationTime.toString());
};

// Check token expiration
const isTokenExpired = () => {
  const expiration = localStorage.getItem('tokenExpiration');
  return expiration && Date.now() > parseInt(expiration);
};
```

## 🧪 Testing Strategy

### Unit Tests
```javascript
import { hasRole, hasPermission } from './rbac-utils';

describe('RBAC Utils', () => {
  test('hasRole should return true for matching role', () => {
    expect(hasRole('Admin', 'Admin')).toBe(true);
    expect(hasRole('User', 'Admin')).toBe(false);
  });

  test('hasPermission should check user permissions', () => {
    expect(hasPermission('Admin', 'user.create')).toBe(true);
    expect(hasPermission('Learner', 'user.create')).toBe(false);
  });
});
```

### Integration Tests
```javascript
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

describe('ProtectedRoute', () => {
  test('should render children when authenticated', () => {
    localStorage.setItem('accessToken', 'valid-token');
    
    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );
    
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});
```

## 🔗 Related Components

- [API Components](../api/README.md) - Authentication API
- [Admin Dashboard](../admin/README.md) - Admin role implementation
- [Manager Dashboard](../manager/README.md) - Manager role implementation
- [Staff Dashboard](../staff/README.md) - Staff role implementation
