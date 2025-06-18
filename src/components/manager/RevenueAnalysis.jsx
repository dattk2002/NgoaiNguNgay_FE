import React, { useState } from 'react';

const RevenueAnalysis = () => {
    const [dateFilter, setDateFilter] = useState('month');
    const [selectedCategory, setSelectedCategory] = useState('all');

    const revenueData = {
        daily: [
            { date: '2024-01-01', revenue: 45000, sessions: 12 },
            { date: '2024-01-02', revenue: 52000, sessions: 15 },
            { date: '2024-01-03', revenue: 38000, sessions: 10 },
            { date: '2024-01-04', revenue: 61000, sessions: 18 },
            { date: '2024-01-05', revenue: 47000, sessions: 13 },
            { date: '2024-01-06', revenue: 55000, sessions: 16 },
            { date: '2024-01-07', revenue: 49000, sessions: 14 }
        ],
        categories: [
            { name: 'Tiếng Anh', revenue: 980000, sessions: 245, growth: 15.2 },
            { name: 'Toán học', revenue: 735000, sessions: 198, growth: 8.7 },
            { name: 'Tiếng Trung', revenue: 490000, sessions: 132, growth: 22.1 },
            { name: 'Vật lý', revenue: 245000, sessions: 89, growth: -3.2 }
        ]
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Khoảng thời gian</label>
                        <select
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
                        >
                            <option value="week">7 ngày qua</option>
                            <option value="month">30 ngày qua</option>
                            <option value="quarter">3 tháng qua</option>
                            <option value="year">12 tháng qua</option>
                        </select>
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Danh mục</label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
                        >
                            <option value="all">Tất cả danh mục</option>
                            <option value="english">Tiếng Anh</option>
                            <option value="math">Toán học</option>
                            <option value="chinese">Tiếng Trung</option>
                            <option value="physics">Vật lý</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                            Xuất báo cáo
                        </button>
                    </div>
                </div>
            </div>

            {/* Revenue Chart Placeholder */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Biểu đồ doanh thu theo thời gian</h3>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <p className="text-gray-500">Biểu đồ doanh thu sẽ được hiển thị ở đây</p>
                        <p className="text-sm text-gray-400 mt-1">Tích hợp với thư viện chart như Chart.js hoặc Recharts</p>
                    </div>
                </div>
            </div>

            {/* Daily Revenue Breakdown */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Doanh thu hàng ngày (7 ngày gần nhất)</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Ngày</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Doanh thu</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Số buổi học</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">TB/buổi</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {revenueData.daily.map((day, index) => (
                                <tr key={index} className="border-b border-gray-100">
                                    <td className="py-3 px-4 text-sm text-gray-900">
                                        {new Date(day.date).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td className="py-3 px-4 text-sm font-medium text-green-600">
                                        {formatCurrency(day.revenue)}
                                    </td>
                                    <td className="py-3 px-4 text-sm text-gray-900">{day.sessions}</td>
                                    <td className="py-3 px-4 text-sm text-gray-900">
                                        {formatCurrency(Math.round(day.revenue / day.sessions))}
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${day.revenue > 50000
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {day.revenue > 50000 ? 'Cao' : 'Trung bình'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Category Analysis */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Phân tích theo danh mục</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {revenueData.categories.map((category, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-base font-medium text-gray-900">{category.name}</h4>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${category.growth > 0
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                    }`}>
                                    {category.growth > 0 ? '+' : ''}{category.growth}%
                                </span>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Doanh thu:</span>
                                    <span className="text-sm font-medium text-gray-900">
                                        {formatCurrency(category.revenue)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Số buổi học:</span>
                                    <span className="text-sm font-medium text-gray-900">{category.sessions}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">TB/buổi:</span>
                                    <span className="text-sm font-medium text-gray-900">
                                        {formatCurrency(Math.round(category.revenue / category.sessions))}
                                    </span>
                                </div>
                            </div>
                            <div className="mt-3">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-green-600 h-2 rounded-full"
                                        style={{ width: `${(category.revenue / 980000) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Performance Insights */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin chi tiết</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <svg className="w-8 h-8 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            <div>
                                <p className="text-sm font-medium text-green-800">Danh mục tăng trưởng mạnh nhất</p>
                                <p className="text-lg font-bold text-green-900">Tiếng Trung (+22.1%)</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <svg className="w-8 h-8 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                            <div>
                                <p className="text-sm font-medium text-blue-800">Doanh thu cao nhất</p>
                                <p className="text-lg font-bold text-blue-900">Tiếng Anh</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <svg className="w-8 h-8 text-orange-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <p className="text-sm font-medium text-orange-800">Cần cải thiện</p>
                                <p className="text-lg font-bold text-orange-900">Vật lý (-3.2%)</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RevenueAnalysis; 