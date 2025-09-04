import React, { useState, useEffect } from 'react';
import { showSuccess, showError, showInfo } from '../../utils/toastManager.js';
import { adminCreateAccount, adminFetchManagers, adminFetchStaffs, adminManageUsers } from '../api/auth';
import 'react-toastify/dist/ReactToastify.css';

const AccountCreation = () => {
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('');
    const [formData, setFormData] = useState({
        fullName: '',
        citizenId: '',
        accountType: 1,
        phoneNumber: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [managers, setManagers] = useState([]);
    const [staffs, setStaffs] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [statsLoading, setStatsLoading] = useState(true);

    // Fetch managers and staffs data on component mount
    useEffect(() => {
        const fetchAccountData = async () => {
            try {
                setStatsLoading(true);
                
                // Fetch managers
                const managersResponse = await adminFetchManagers({
                    PageIndex: 0,
                    PageSize: 100, // Get all managers for stats
                    IsActive: true
                });
                
                // Fetch staffs
                const staffsResponse = await adminFetchStaffs({
                    PageIndex: 0,
                    PageSize: 100, // Get all staffs for stats
                    IsActive: true
                });
                
                if (managersResponse && managersResponse.data) {
                    setManagers(managersResponse.data.items || []);
                }
                
                if (staffsResponse && staffsResponse.data) {
                    setStaffs(staffsResponse.data.items || []);
                }
                
                // Fetch all users to count tutors and learners
                const allUsersResponse = await adminManageUsers({
                    PageIndex: 0,
                    PageSize: 1000 // Get all users for counting
                });
                
                if (allUsersResponse && allUsersResponse.data) {
                    setAllUsers(allUsersResponse.data.items || []);
                }
                
            } catch (error) {
                console.error('Failed to fetch account data:', error);
                showError('Không thể tải dữ liệu thống kê tài khoản', {
                    position: "top-right",
                    autoClose: 3000,
                });
            } finally {
                setStatsLoading(false);
            }
        };
        
        fetchAccountData();
    }, []);

    const handleCreateAccount = (type) => {
        setModalType(type);
        setShowModal(true);
        setFormData({ 
            fullName: '', 
            citizenId: '', 
            accountType: type === 'manager' ? 1 : 2, 
            phoneNumber: '' 
        });
        setErrors({});
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        // Validate fullName
        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Họ và tên là bắt buộc';
        } else if (formData.fullName.length < 5 || formData.fullName.length > 20) {
            newErrors.fullName = 'Họ và tên phải từ 5 đến 20 ký tự';
        }
        
        // Validate citizenId
        if (!formData.citizenId.trim()) {
            newErrors.citizenId = 'Số CCCD là bắt buộc';
        } else if (formData.citizenId.length < 9 || formData.citizenId.length > 12) {
            newErrors.citizenId = 'Số CCCD phải từ 9 đến 12 số';
        } else if (!/^\d+$/.test(formData.citizenId)) {
            newErrors.citizenId = 'Số CCCD chỉ được chứa số';
        }
        
        // Validate phoneNumber
        if (!formData.phoneNumber.trim()) {
            newErrors.phoneNumber = 'Số điện thoại là bắt buộc';
        } else if (!/^0\d{9}$/.test(formData.phoneNumber)) {
            newErrors.phoneNumber = 'Số điện thoại phải bắt đầu bằng 0 và có đúng 10 số';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setIsLoading(true);
        
        try {
            const response = await adminCreateAccount(formData);
            
            if (response && response.data) {
                const accountTypeText = formData.accountType === 1 ? 'Manager' : 'Staff';
                showSuccess(`Tạo tài khoản ${accountTypeText} thành công cho ${formData.fullName}!`, {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    draggable: true,
                });
                
                // Show account details in a more detailed toast
                showInfo(
                    <div>
                        <div><strong>Tài khoản đã được tạo:</strong></div>
                        <div>Username: {response.data.username}</div>
                        <div>Email: {response.data.email}</div>
                        <div>Mật khẩu: {response.data.password}</div>
                        <div className="text-xs text-gray-600 mt-1">Vui lòng lưu lại thông tin này!</div>
                    </div>,
                    {
                        position: "top-right",
                        autoClose: 10000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        draggable: true,
                    }
                );
                
                setShowModal(false);
                setFormData({ 
                    fullName: '', 
                    citizenId: '', 
                    accountType: 1, 
                    phoneNumber: '' 
                });
                setErrors({});
                
                // Refresh account data after successful creation
                const refreshAccountData = async () => {
                    try {
                        // Fetch managers
                        const managersResponse = await adminFetchManagers({
                            PageIndex: 0,
                            PageSize: 100,
                            IsActive: true
                        });
                        
                        // Fetch staffs
                        const staffsResponse = await adminFetchStaffs({
                            PageIndex: 0,
                            PageSize: 100,
                            IsActive: true
                        });
                        
                        if (managersResponse && managersResponse.data) {
                            setManagers(managersResponse.data.items || []);
                        }
                        
                        if (staffsResponse && staffsResponse.data) {
                            setStaffs(staffsResponse.data.items || []);
                        }
                        
                        // Refresh all users to update counts
                        const allUsersResponse = await adminManageUsers({
                            PageIndex: 0,
                            PageSize: 1000
                        });
                        
                        if (allUsersResponse && allUsersResponse.data) {
                            setAllUsers(allUsersResponse.data.items || []);
                        }
                    } catch (error) {
                        console.error('Failed to refresh account data:', error);
                    }
                };
                
                refreshAccountData();
            }
        } catch (error) {
            console.error('Failed to create account:', error);
            showError(`Lỗi khi tạo tài khoản: ${error.message}`, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                draggable: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Generate recent activities from real data
    const generateRecentActivities = () => {
        const activities = [];
        
        // Add managers
        managers.slice(0, 3).forEach((manager, index) => {
            activities.push({
                id: `manager-${index}`,
                type: 'manager',
                name: manager.fullName,
                action: 'Tài khoản Manager',
                time: formatTimeAgo(manager.createdTime),
                data: manager
            });
        });
        
        // Add staffs
        staffs.slice(0, 3).forEach((staff, index) => {
            activities.push({
                id: `staff-${index}`,
                type: 'staff',
                name: staff.fullName,
                action: 'Tài khoản Staff',
                time: formatTimeAgo(staff.createdTime),
                data: staff
            });
        });
        
        // Sort by creation time (newest first)
        return activities.sort((a, b) => new Date(b.data.createdTime) - new Date(a.data.createdTime)).slice(0, 4);
    };

    // Count tutors and learners from all users
    const getTutorsCount = () => {
        return allUsers.filter(user => user.role && user.role.includes('Tutor')).length;
    };

    const getLearnersCount = () => {
        // Learner role should NOT contain 'Tutor' - they are mutually exclusive
        return allUsers.filter(user => 
            user.role && 
            user.role.includes('Learner') && 
            !user.role.includes('Tutor')
        ).length;
    };

    const formatTimeAgo = (dateString) => {
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffInMs = now - date;
            const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
            const diffInDays = Math.floor(diffInHours / 24);
            
            if (diffInDays > 0) {
                return `${diffInDays} ngày trước`;
            } else if (diffInHours > 0) {
                return `${diffInHours} giờ trước`;
            } else {
                return 'Gần đây';
            }
        } catch (error) {
            return 'Gần đây';
        }
    };

    return (
        <div className="space-y-6">
            {/* Account Creation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Create Manager Account */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="text-center">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Tạo tài khoản Manager</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Tạo tài khoản cho Manager để quản lý doanh thu và báo cáo tài chính
                        </p>
                        <ul className="text-sm text-gray-600 mb-4 text-left">
                            <li className="flex items-center mb-1">
                                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Quản lý doanh thu
                            </li>
                            <li className="flex items-center mb-1">
                                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Tạo báo cáo tài chính
                            </li>
                            <li className="flex items-center">
                                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Phân tích xu hướng
                            </li>
                        </ul>
                        <button
                            onClick={() => handleCreateAccount('manager')}
                            className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                        >
                            Tạo Manager Account
                        </button>
                    </div>
                </div>

                {/* Create Staff Account */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="text-center">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Tạo tài khoản Staff</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Tạo tài khoản cho Staff để quản lý gia sư và xử lý báo cáo
                        </p>
                        <ul className="text-sm text-gray-600 mb-4 text-left">
                            <li className="flex items-center mb-1">
                                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Quản lý gia sư
                            </li>
                            <li className="flex items-center mb-1">
                                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Xử lý báo cáo
                            </li>
                            <li className="flex items-center">
                                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Phê duyệt hồ sơ
                            </li>
                        </ul>
                        <button
                            onClick={() => handleCreateAccount('staff')}
                            className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                        >
                            Tạo Staff Account
                        </button>
                    </div>
                </div>
            </div>

            {/* Account Statistics */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Thống kê tài khoản</h3>
                {statsLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((index) => (
                            <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                                <div className="h-8 bg-gray-200 rounded animate-pulse mx-auto mb-2" style={{ width: '60px' }}></div>
                                <div className="h-4 bg-gray-200 rounded animate-pulse mx-auto" style={{ width: '80px' }}></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">{managers.length}</div>
                            <div className="text-sm text-gray-600">Manager</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">{staffs.length}</div>
                            <div className="text-sm text-gray-600">Staff</div>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">{getTutorsCount()}</div>
                            <div className="text-sm text-gray-600">Gia sư</div>
                        </div>
                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                            <div className="text-2xl font-bold text-orange-600">{getLearnersCount()}</div>
                            <div className="text-sm text-gray-600">Học viên</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Recent Account Activities */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Hoạt động tài khoản gần đây</h3>
                {statsLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3, 4].map((index) => (
                            <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                                <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse mr-3"></div>
                                <div className="flex-1">
                                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" style={{ width: '150px' }}></div>
                                    <div className="h-3 bg-gray-200 rounded animate-pulse" style={{ width: '100px' }}></div>
                                </div>
                                <div className="h-6 bg-gray-200 rounded animate-pulse" style={{ width: '80px' }}></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {generateRecentActivities().map((activity) => (
                            <div key={activity.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${activity.type === 'manager' ? 'bg-purple-100' : 'bg-green-100'
                                    }`}>
                                    <svg className={`w-4 h-4 ${activity.type === 'manager' ? 'text-purple-600' : 'text-green-600'
                                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                                    <p className="text-xs text-gray-500">{activity.name} - {activity.time}</p>
                                </div>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${activity.type === 'manager'
                                    ? 'bg-purple-100 text-purple-800'
                                    : 'bg-green-100 text-green-800'
                                    }`}>
                                    {activity.type === 'manager' ? 'Manager' : 'Staff'}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal for Account Creation */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">
                            Tạo tài khoản {modalType === 'manager' ? 'Manager' : 'Staff'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-black mb-1">Họ và tên</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    required
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black ${
                                        errors.fullName ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Nhập họ và tên (5-20 ký tự)"
                                />
                                {errors.fullName && (
                                    <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Số CCCD</label>
                                <input
                                    type="text"
                                    name="citizenId"
                                    value={formData.citizenId}
                                    onChange={handleInputChange}
                                    required
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black ${
                                        errors.citizenId ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Nhập số CCCD (9-12 số)"
                                />
                                {errors.citizenId && (
                                    <p className="text-red-500 text-xs mt-1">{errors.citizenId}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                                <input
                                    type="text"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleInputChange}
                                    required
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black ${
                                        errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Nhập số điện thoại (bắt đầu bằng 0, 10 số)"
                                />
                                {errors.phoneNumber && (
                                    <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>
                                )}
                            </div>
                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    disabled={isLoading}
                                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                        modalType === 'manager'
                                            ? 'bg-purple-600 hover:bg-purple-700'
                                            : 'bg-green-600 hover:bg-green-700'
                                    }`}
                                >
                                    {isLoading ? (
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Đang tạo...
                                        </div>
                                    ) : (
                                        'Tạo tài khoản'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccountCreation; 