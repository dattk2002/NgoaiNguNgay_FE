import React, { useState, useEffect } from 'react';
import { adminManageUsers, adminToggleUserStatus } from '../api/auth';
import ConfirmDialog from '../modals/ConfirmDialog';
import { showSuccess, showError } from '../../utils/toastManager.js';
import 'react-toastify/dist/ReactToastify.css';

const UserManagement = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [userFilter, setUserFilter] = useState('all');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [processingUser, setProcessingUser] = useState(null); // Track which user is being processed for status toggle
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [userToToggle, setUserToToggle] = useState(null);
    const [pageLoading, setPageLoading] = useState(false); // Track pagination loading separately
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        pageSize: 10
    });
    const [activeUsersCount, setActiveUsersCount] = useState(0);
    const [inactiveUsersCount, setInactiveUsersCount] = useState(0);
    const [filters, setFilters] = useState({
        Name: '',
        IsActive: null,
        Role: ''
    });
    const [statsLoading, setStatsLoading] = useState(false);

    // Fetch users data
    const fetchUsers = async (pageIndex = 0) => {
        try {
            console.log('🔍 fetchUsers called with:', { pageIndex, userFilter });
            
            // Use pageLoading for pagination, loading for initial load
            if (pageIndex === 0) {
                setLoading(true);
            } else {
                setPageLoading(true);
            }
            setError(null);
            
            const params = {
                PageIndex: pageIndex,
                PageSize: pagination.pageSize,
                ...filters
            };

            // Add search term to Name filter if provided
            if (searchTerm) {
                params.Name = searchTerm;
            }

            // Add active filter if not "all"
            if (userFilter !== 'all') {
                params.IsActive = userFilter === 'active';
            }

            const response = await adminManageUsers(params);
            
            if (response && response.data) {
                setUsers(response.data.items || []);
                
                // Update pagination with response data, but preserve currentPage if it's a manual page change
                setPagination(prev => ({
                    currentPage: response.data.currentPageNumber || prev.currentPage || 1,
                    totalPages: response.data.totalPages || 0,
                    totalItems: response.data.totalItems || 0,
                    pageSize: response.data.pageSize || prev.pageSize || 10
                }));

                // Calculate and update active/inactive users count
                if (response.data.items && response.data.items.length > 0) {
                    // Always calculate from the current page data for display
                    const activeCount = response.data.items.filter(user => user.isActive).length;
                    const inactiveCount = response.data.items.filter(user => !user.isActive).length;
                    
                    // Update counts based on current filter
                    if (userFilter === 'active') {
                        setActiveUsersCount(response.data.totalItems || 0);
                        setInactiveUsersCount(0);
                    } else if (userFilter === 'disabled') {
                        setActiveUsersCount(0);
                        setInactiveUsersCount(response.data.totalItems || 0);
                    } else {
                        // If no filter, we need to get the total counts from all users
                        // Call fetchAllUsersForCounts to get accurate counts
                        fetchAllUsersForCounts();
                    }
                }
            }
        } catch (err) {
            console.error('Failed to fetch users:', err);
            setError(err.message);
        } finally {
            setLoading(false);
            setPageLoading(false);
        }
    };

    // Function to fetch all users for accurate counting
    const fetchAllUsersForCounts = async () => {
        try {
            console.log('🔍 fetchAllUsersForCounts called');
            setError(null);
            
            const params = {
                PageIndex: 0,
                PageSize: 10000, // Fetch a very large number to get all users
                ...filters
            };

            // Add search term to Name filter if provided
            if (searchTerm) {
                params.Name = searchTerm;
            }

            // Add active filter if not "all"
            if (userFilter !== 'all') {
                params.IsActive = userFilter === 'active';
            }

            const response = await adminManageUsers(params);
            
            if (response && response.data) {
                const allUsers = response.data.items || [];
                const totalActive = allUsers.filter(user => user.isActive).length;
                const totalInactive = allUsers.filter(user => !user.isActive).length;
                
                console.log('🔍 fetchAllUsersForCounts - Total users:', allUsers.length);
                console.log('🔍 fetchAllUsersForCounts - Active count:', totalActive);
                console.log('🔍 fetchAllUsersForCounts - Inactive count:', totalInactive);
                
                setActiveUsersCount(totalActive);
                setInactiveUsersCount(totalInactive);
            }
        } catch (err) {
            console.error('Failed to fetch all users for counts:', err);
            setError(err.message);
        }
    };

    // Function to fetch users for display only (without updating counts)
    const fetchUsersForDisplay = async (pageIndex = 0) => {
        try {
            setPageLoading(true);
            setError(null);
            
            const params = {
                PageIndex: pageIndex,
                PageSize: pagination.pageSize,
                ...filters
            };

            // Add search term to Name filter if provided
            if (searchTerm) {
                params.Name = searchTerm;
            }

            // Add active filter if not "all"
            if (userFilter !== 'all') {
                params.IsActive = userFilter === 'active';
            }

            const response = await adminManageUsers(params);
            
            if (response && response.data) {
                setUsers(response.data.items || []);
                
                // Update pagination with response data, but preserve currentPage if it's a manual page change
                setPagination(prev => ({
                    currentPage: response.data.currentPageNumber || prev.currentPage || 1,
                    totalPages: response.data.totalPages || 0,
                    totalItems: response.data.totalItems || 0,
                    pageSize: response.data.pageSize || prev.pageSize || 10
                }));

                // DON'T update counts here - keep the manually updated counts
            }
        } catch (err) {
            console.error('Failed to fetch users for display:', err);
            setError(err.message);
        } finally {
            setPageLoading(false);
        }
    };

    // Initial data fetch
    useEffect(() => {
        // First fetch all users to get accurate counts
        fetchAllUsersForCounts(); // Fetch all for initial counts
        // Then fetch the first page for display
        fetchUsers(0); // Fetch for display
    }, []);

    // Count users from fetched data
    const getTotalUsersCount = () => {
        return pagination.totalItems;
    };

    const getActiveUsersCount = () => {
        // Return the tracked active users count
        return activeUsersCount;
    };

    const getInactiveUsersCount = () => {
        // Return the tracked inactive users count
        return inactiveUsersCount;
    };

    // Handle search and filter changes
    const handleSearchAndFilter = () => {
        // Reset to first page when searching/filtering
        // This should update counts since it's a new search/filter
        fetchUsers(0);
        // Also fetch all users to get accurate counts for the new filter
        fetchAllUsersForCounts();
    };

    // Handle pagination
    const handlePageChange = (newPage) => {
        // Update current page first
        setPagination(prev => ({
            ...prev,
            currentPage: newPage
        }));
        
        const pageIndex = newPage - 1; // Convert to 0-based index
        // Use fetchUsersForDisplay to avoid overwriting counts
        fetchUsersForDisplay(pageIndex);
    };

    const handleToggleUserStatus = (userId, currentStatus) => {
        const newStatus = !currentStatus;
        const actionText = newStatus ? 'kích hoạt' : 'vô hiệu hóa';
        
        setUserToToggle({
            id: userId,
            currentStatus: currentStatus,
            newStatus: newStatus,
            actionText: actionText
        });
        setConfirmModalOpen(true);
    };

    const confirmToggleUserStatus = async () => {
        if (!userToToggle) return;
        
        try {
            setProcessingUser(userToToggle.id);
            setConfirmModalOpen(false);
            
            await adminToggleUserStatus(userToToggle.id, userToToggle.newStatus);
            
            // Update counts immediately based on the action
            if (userToToggle.newStatus) {
                // User was activated
                setActiveUsersCount(prev => prev + 1);
                setInactiveUsersCount(prev => Math.max(0, prev - 1));
            } else {
                // User was deactivated
                setActiveUsersCount(prev => Math.max(0, prev - 1));
                setInactiveUsersCount(prev => prev + 1);
            }
            
            // Refresh the user list to reflect the changes, keep current page
            // But don't update the counts again to avoid overwriting our manual updates
            await fetchUsersForDisplay(pagination.currentPage - 1);
            
            // Show success toast
            showSuccess(`Người dùng đã được ${userToToggle.actionText} thành công!`, {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                draggable: true,
            });
            
        } catch (err) {
            console.error('Failed to toggle user status:', err.message);
            // Show error toast
            showError(`Lỗi khi ${userToToggle.actionText} người dùng: ${err.message}`, {
                position: "top-right",
                autoClose: 4000,
                hideProgressBar: false,
                closeOnClick: true,
                draggable: true,
            });
        } finally {
            setProcessingUser(null);
            setUserToToggle(null);
        }
    };

    // Get role display name
    const getRoleDisplayName = (role) => {
        const roleMap = {
            'Admin': 'Quản trị viên',
            'Manager': 'Quản lý',
            'Staff': 'Nhân viên',
            'Tutor': 'Gia sư',
            'Learner': 'Học viên'
        };
        return roleMap[role] || role;
    };

    // Get role badge styling
    const getRoleBadgeStyle = (role) => {
        const styleMap = {
            'Admin': 'bg-red-100 text-red-800',
            'Manager': 'bg-purple-100 text-purple-800',
            'Staff': 'bg-green-100 text-green-800',
            'Tutor': 'bg-blue-100 text-blue-800',
            'Learner': 'bg-gray-100 text-gray-800'
        };
        return styleMap[role] || 'bg-gray-100 text-gray-800';
    };

    // Format date
    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('vi-VN');
        } catch (error) {
            return dateString;
        }
    };

    if (loading && users.length === 0) {
        return (
            <div className="space-y-6">
                {/* Filters Skeleton */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                        </div>
                        <div className="h-10 bg-gray-200 rounded-lg animate-pulse" style={{ width: '200px' }}></div>
                        <div className="h-10 bg-gray-200 rounded-lg animate-pulse" style={{ width: '120px' }}></div>
                    </div>
                </div>

                {/* User Statistics Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((index) => (
                        <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
                            <div className="text-center">
                                <div className="h-8 bg-gray-200 rounded animate-pulse mx-auto mb-2" style={{ width: '60px' }}></div>
                                <div className="h-4 bg-gray-200 rounded animate-pulse mx-auto" style={{ width: '100px' }}></div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Users Table Skeleton */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="h-6 bg-gray-200 rounded animate-pulse" style={{ width: '150px' }}></div>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {[1, 2, 3, 4, 5].map((index) => (
                            <div key={index} className="px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
                                        <div>
                                            <div className="h-5 bg-gray-200 rounded animate-pulse mb-2" style={{ width: '150px' }}></div>
                                            <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: '200px' }}></div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="h-8 bg-gray-200 rounded animate-pulse" style={{ width: '80px' }}></div>
                                        <div className="h-8 bg-gray-200 rounded animate-pulse" style={{ width: '60px' }}></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Lỗi khi tải dữ liệu</h3>
                        <p className="mt-1 text-sm text-red-700">{error}</p>
                    </div>
                </div>
                <button
                    onClick={() => fetchUsers()}
                    className="mt-4 bg-red-100 text-red-800 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors"
                >
                    Thử lại
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên hoặc email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearchAndFilter()}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                        />
                    </div>
                    <select
                        value={userFilter}
                        onChange={(e) => {
                            setUserFilter(e.target.value);
                            handleSearchAndFilter();
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="active">Hoạt động</option>
                        <option value="disabled">Bị vô hiệu hóa</option>
                    </select>
                    <button
                        onClick={handleSearchAndFilter}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Tìm kiếm
                    </button>
                </div>
            </div>

            {/* User Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{getTotalUsersCount()}</div>
                        <div className="text-sm text-gray-600">Tổng người dùng</div>
                    </div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                            {getActiveUsersCount()}
                        </div>
                        <div className="text-sm text-gray-600">Đang hoạt động</div>
                    </div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">
                            {getInactiveUsersCount()}
                        </div>
                        <div className="text-sm text-gray-600">Bị vô hiệu hóa</div>
                    </div>
                </div>
            </div>

            {/* User List */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">
                        Danh sách người dùng ({getTotalUsersCount()})
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Người dùng
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Vai trò
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Trạng thái
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ngày tham gia
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0">
                                                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                                    <span className="text-sm font-medium text-gray-700">
                                                        {user.fullName ? user.fullName.charAt(0) : '?'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {user.fullName || 'Không có tên'}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {user.email}
                                                </div>
                                                {user.phoneNumber && (
                                                    <div className="text-xs text-gray-400">
                                                        {user.phoneNumber}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-wrap gap-1">
                                            {user.role.split(', ').map((role, index) => (
                                                <span
                                                    key={index}
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeStyle(role.trim())}`}
                                                >
                                                    {getRoleDisplayName(role.trim())}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.isActive
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                            }`}>
                                            {user.isActive ? 'Hoạt động' : 'Bị vô hiệu hóa'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatDate(user.createdTime)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                                            disabled={processingUser === user.id}
                                            className={`text-sm font-medium mr-4 ${
                                                user.isActive
                                                    ? 'text-red-600 hover:text-red-900 disabled:opacity-50'
                                                    : 'text-green-600 hover:text-green-900 disabled:opacity-50'
                                            }`}
                                        >
                                            {processingUser === user.id ? (
                                                <span className="flex items-center">
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                                                    Đang xử lý...
                                                </span>
                                            ) : (
                                                user.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'
                                            )}
                                        </button>
                                        <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                                            Xem chi tiết
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                Hiển thị {((pagination.currentPage - 1) * pagination.pageSize) + 1} đến {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)} trong tổng số {pagination.totalItems} người dùng
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                                    disabled={pagination.currentPage <= 1 || pageLoading}
                                    className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-black"
                                >
                                    {pageLoading ? 'Đang tải...' : 'Trước'}
                                </button>
                                <span className="px-3 py-1 text-sm text-gray-700">
                                    Trang {pagination.currentPage} / {pagination.totalPages}
                                    {pageLoading && <span className="ml-2 text-blue-600">Đang tải...</span>}
                                </span>
                                <button
                                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                                    disabled={pagination.currentPage >= pagination.totalPages || pageLoading}
                                    className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-black"
                                >
                                    {pageLoading ? 'Đang tải...' : 'Sau'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Confirm Modal */}
            <ConfirmDialog
                open={confirmModalOpen}
                onClose={() => {
                    setConfirmModalOpen(false);
                    setUserToToggle(null);
                }}
                onConfirm={confirmToggleUserStatus}
                title="Xác nhận thay đổi trạng thái"
                description={
                    userToToggle
                        ? `Bạn có chắc chắn muốn ${userToToggle.actionText} người dùng này không?`
                        : "Bạn có chắc chắn muốn thay đổi trạng thái người dùng này không?"
                }
                confirmText="Xác nhận"
                cancelText="Hủy"
                confirmColor="primary"
            />

        </div>
    );
};

export default UserManagement;