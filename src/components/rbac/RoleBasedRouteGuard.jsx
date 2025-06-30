import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { hasRole } from './ProtectedRoute';

const RoleBasedRouteGuard = ({ user }) => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!user) return;

        const currentPath = location.pathname;

        // Define allowed paths for each role
        const roleRoutes = {
            admin: ['/admin'],
            staff: ['/staff'],
            manager: ['/manager']
        };

        // Check if user has admin, staff, or manager role (handle both cases)
        if (hasRole(user, 'admin') || hasRole(user, 'Admin')) {
            // Admin can only access /admin routes
            if (!currentPath.startsWith('/admin')) {
                navigate('/admin', { replace: true });
            }
        } else if (hasRole(user, 'staff') || hasRole(user, 'Staff')) {
            // Staff can only access /staff routes
            if (!currentPath.startsWith('/staff')) {
                navigate('/staff', { replace: true });
            }
        } else if (hasRole(user, 'manager') || hasRole(user, 'Manager')) {
            // Manager can only access /manager routes
            if (!currentPath.startsWith('/manager')) {
                navigate('/manager', { replace: true });
            }
        }
        // Learner and Tutor roles don't get redirected - they can access normal pages
    }, [user, location.pathname, navigate]);

    return null; // This component doesn't render anything
};

export default RoleBasedRouteGuard; 