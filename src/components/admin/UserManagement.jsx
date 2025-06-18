import React, { useState } from 'react';

const UserManagement = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [userFilter, setUserFilter] = useState('all');

    const [users, setUsers] = useState([
        { id: 1, name: 'Nguyễn Văn A', email: 'nguyenvana@email.com', role: 'Học viên', status: 'active', joinDate: '2024-01-15' },
        { id: 2, name: 'Trần Thị B', email: 'tranthib@email.com', role: 'Gia sư', status: 'active', joinDate: '2024-01-10' },
        { id: 3, name: 'Lê Văn C', email: 'levanc@email.com', role: 'Học viên', status: 'disabled', joinDate: '2024-01-05' },
        { id: 4, name: 'Phạm Thị D', email: 'phamthid@email.com', role: 'Manager', status: 'active', joinDate: '2024-01-01' },
        { id: 5, name: 'Hoàng Văn E', email: 'hoangvane@email.com', role: 'Staff', status: 'active', joinDate: '2024-01-08' },
        { id: 6, name: 'Vũ Thị F', email: 'vuthif@email.com', role: 'Gia sư', status: 'active', joinDate: '2024-01-12' },
        { id: 7, name: 'Đặng Văn G', email: 'dangvang@email.com', role: 'Học viên', status: 'disabled', joinDate: '2024-01-03' },
        { id: 8, name: 'Bùi Thị H', email: 'buithih@email.com', role: 'Gia sư', status: 'active', joinDate: '2024-01-14' }
    ]);

    const handleDisableUser = (userId) => {
        setUsers(users.map(user =>
            user.id === userId
                ? { ...user, status: user.status === 'active' ? 'disabled' : 'active' }
                : user
        ));
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = userFilter === 'all' || user.status === userFilter;
        return matchesSearch && matchesFilter;
    });

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
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                        />
                    </div>
                    <select
                        value={userFilter}
                        onChange={(e) => setUserFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="active">Hoạt động</option>
                        <option value="disabled">Bị vô hiệu hóa</option>
                    </select>
                </div>
            </div>

            {/* User Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{users.length}</div>
                        <div className="text-sm text-gray-600">Tổng người dùng</div>
                    </div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                            {users.filter(user => user.status === 'active').length}
                        </div>
                        <div className="text-sm text-gray-600">Đang hoạt động</div>
                    </div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">
                            {users.filter(user => user.status === 'disabled').length}
                        </div>
                        <div className="text-sm text-gray-600">Bị vô hiệu hóa</div>
                    </div>
                </div>
            </div>

            {/* User List */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">
                        Danh sách người dùng ({filteredUsers.length})
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
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0">
                                                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                                    <span className="text-sm font-medium text-gray-700">
                                                        {user.name.charAt(0)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {user.name}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {user.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'Manager' ? 'bg-purple-100 text-purple-800' :
                                            user.role === 'Staff' ? 'bg-green-100 text-green-800' :
                                                user.role === 'Gia sư' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-gray-100 text-gray-800'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.status === 'active'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                            }`}>
                                            {user.status === 'active' ? 'Hoạt động' : 'Bị vô hiệu hóa'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {user.joinDate}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => handleDisableUser(user.id)}
                                            className={`text-sm font-medium mr-4 ${user.status === 'active'
                                                ? 'text-red-600 hover:text-red-900'
                                                : 'text-green-600 hover:text-green-900'
                                                }`}
                                        >
                                            {user.status === 'active' ? 'Vô hiệu hóa' : 'Kích hoạt'}
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
            </div>
        </div >
    );
};

export default UserManagement; 