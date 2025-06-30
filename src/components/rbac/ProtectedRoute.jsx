import React from 'react';
import { Navigate } from 'react-router-dom';

// Utility function to check if user has specific role
const hasRole = (user, roleName) => {
    if (!user || !user.roles) return false;

    // Handle both string and array formats
    const roles = Array.isArray(user.roles) ? user.roles : [user.roles];

    // Handle case variations and string matching
    return roles.some(role => {
        if (typeof role === 'string') {
            return role.toLowerCase() === roleName.toLowerCase();
        }
        // Handle object format if roles are objects with name property
        if (role && role.name) {
            return role.name.toLowerCase() === roleName.toLowerCase();
        }
        return false;
    });
};

// Check if user has any of the specified roles
const hasAnyRole = (user, roleNames) => {
    return roleNames.some(roleName => hasRole(user, roleName));
};

const ProtectedRoute = ({
    children,
    user,
    allowedRoles = [],
    redirectTo = '/',
    requireAuth = true
}) => {
    // If authentication is required but user is not logged in
    if (requireAuth && !user) {
        return <Navigate to={redirectTo} replace />;
    }

    // If no specific roles are required, just check if user is authenticated
    if (allowedRoles.length === 0) {
        return children;
    }

    // Check if user has any of the allowed roles
    if (!hasAnyRole(user, allowedRoles)) {
        return <Navigate to={redirectTo} replace />;
    }

    return children;
};

// Role-specific route components for easier usage
export const AdminRoute = ({ children, user }) => (
    <ProtectedRoute
        user={user}
        allowedRoles={['admin', 'Admin']}
        redirectTo="/"
    >
        {children}
    </ProtectedRoute>
);

export const StaffRoute = ({ children, user }) => (
    <ProtectedRoute
        user={user}
        allowedRoles={['staff', 'Staff']}
        redirectTo="/"
    >
        {children}
    </ProtectedRoute>
);

export const ManagerRoute = ({ children, user }) => (
    <ProtectedRoute
        user={user}
        allowedRoles={['manager', 'Manager']}
        redirectTo="/"
    >
        {children}
    </ProtectedRoute>
);

// Component to block certain routes for specific roles
export const BlockedRoute = ({
    children,
    user,
    blockedRoles = [],
    redirectTo = '/'
}) => {
    // If user has any of the blocked roles, redirect them to appropriate dashboard
    if (user && hasAnyRole(user, blockedRoles)) {
        // Redirect to appropriate dashboard based on role
        if (hasRole(user, 'admin') || hasRole(user, 'Admin')) {
            return <Navigate to="/admin" replace />;
        } else if (hasRole(user, 'staff') || hasRole(user, 'Staff')) {
            return <Navigate to="/staff" replace />;
        } else if (hasRole(user, 'manager') || hasRole(user, 'Manager')) {
            return <Navigate to="/manager" replace />;
        } else {
            return <Navigate to={redirectTo} replace />;
        }
    }

    return children;
};

export { hasRole, hasAnyRole };
export default ProtectedRoute; 