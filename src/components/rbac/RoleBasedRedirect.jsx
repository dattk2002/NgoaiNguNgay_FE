import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { hasRole } from './ProtectedRoute';

const RoleBasedRedirect = ({ user, triggerRedirect = false, onRedirectComplete }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const hasRedirected = useRef(false);

    useEffect(() => {
        console.log("RoleBasedRedirect useEffect triggered:", {
            user: !!user,
            triggerRedirect,
            hasRedirected: hasRedirected.current,
            currentPath: location.pathname,
            userRoles: user?.roles
        });

        if (!user || !triggerRedirect || hasRedirected.current) {
            console.log("RoleBasedRedirect early return");
            return;
        }

        // Only redirect if user is on homepage or non-dashboard pages
        const currentPath = location.pathname;
        if (currentPath === '/' || (!currentPath.startsWith('/admin') && !currentPath.startsWith('/staff') && !currentPath.startsWith('/manager'))) {
            console.log("RoleBasedRedirect path check passed, checking roles");
            // Check role and redirect accordingly (handle both cases)
            if (hasRole(user, 'admin') || hasRole(user, 'Admin')) {
                console.log("RoleBasedRedirect redirecting to /admin");
                hasRedirected.current = true;
                navigate('/admin', { replace: true });
                // Delay the complete callback to ensure navigation finishes
                setTimeout(() => {
                    if (onRedirectComplete) onRedirectComplete();
                }, 100);
            } else if (hasRole(user, 'staff') || hasRole(user, 'Staff')) {
                console.log("RoleBasedRedirect redirecting to /staff");
                hasRedirected.current = true;
                navigate('/staff', { replace: true });
                setTimeout(() => {
                    if (onRedirectComplete) onRedirectComplete();
                }, 100);
            } else if (hasRole(user, 'manager') || hasRole(user, 'Manager')) {
                console.log("RoleBasedRedirect redirecting to /manager");
                hasRedirected.current = true;
                navigate('/manager', { replace: true });
                setTimeout(() => {
                    if (onRedirectComplete) onRedirectComplete();
                }, 100);
            } else {
                console.log("RoleBasedRedirect no matching role found");
            }
        } else {
            console.log("RoleBasedRedirect path check failed");
        }
    }, [user, navigate, location.pathname, triggerRedirect, onRedirectComplete]);

    // Reset redirect flag when user changes or logs out
    useEffect(() => {
        if (user?.id) {
            hasRedirected.current = false;
        }
    }, [user?.id]);

    // Reset redirect flag when triggerRedirect becomes true (new login)
    useEffect(() => {
        if (triggerRedirect) {
            hasRedirected.current = false;
        }
    }, [triggerRedirect]);

    return null; // This component doesn't render anything
};

export default RoleBasedRedirect; 