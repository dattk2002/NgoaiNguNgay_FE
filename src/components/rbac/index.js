// Export all role-based access control components
export { default as ProtectedRoute, AdminRoute, StaffRoute, ManagerRoute, BlockedRoute, hasRole, hasAnyRole } from './ProtectedRoute';
export { default as RoleBasedRedirect } from './RoleBasedRedirect';
export { default as RoleBasedRouteGuard } from './RoleBasedRouteGuard'; 