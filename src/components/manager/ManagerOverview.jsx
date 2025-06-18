import React, { useState } from 'react';

const ManagerOverview = () => {
    const [stats] = useState({
        totalRevenue: 2450000,
        monthlyRevenue: 850000,
        growth: 12.5,
        totalTransactions: 1234,
        averageOrderValue: 1987,
        topPerformingTutors: [
            { name: 'Nguyễn Thị Mai', revenue: 125000, sessions: 45 },
            { name: 'Trần Văn Nam', revenue: 98000, sessions: 38 },
            { name: 'Lê Thị Hoa', revenue: 87000, sessions: 35 },
            { name: 'Phạm Văn Đức', revenue: 76000, sessions: 32 }
        ]
    });

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    return (
        <div className="space-y-6">
            {/* Revenue Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Tổng doanh thu</p>
                            <p className="text-2xl font-semibold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Doanh thu tháng này</p>
                            <p className="text-2xl font-semibold text-gray-900">{formatCurrency(stats.monthlyRevenue)}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Tăng trưởng</p>
                            <p className="text-2xl font-semibold text-green-600">+{stats.growth}%</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Tổng giao dịch</p>
                            <p className="text-2xl font-semibold text-gray-900">{stats.totalTransactions.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Revenue Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue by Category */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Doanh thu theo danh mục</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                                <span className="text-sm text-gray-700">Tiếng Anh</span>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-medium text-gray-900">40%</div>
                                <div className="text-xs text-gray-500">{formatCurrency(980000)}</div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                                <span className="text-sm text-gray-700">Toán học</span>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-medium text-gray-900">30%</div>
                                <div className="text-xs text-gray-500">{formatCurrency(735000)}</div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                                <span className="text-sm text-gray-700">Tiếng Trung</span>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-medium text-gray-900">20%</div>
                                <div className="text-xs text-gray-500">{formatCurrency(490000)}</div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                                <span className="text-sm text-gray-700">Khác</span>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-medium text-gray-900">10%</div>
                                <div className="text-xs text-gray-500">{formatCurrency(245000)}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Monthly Performance */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Hiệu suất hàng tháng</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                            <div>
                                <div className="text-sm font-medium text-gray-900">Giá trị đơn hàng trung bình</div>
                                <div className="text-xs text-gray-500">AOV tháng này</div>
                            </div>
                            <div className="text-lg font-bold text-green-600">{formatCurrency(stats.averageOrderValue)}</div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                            <div>
                                <div className="text-sm font-medium text-gray-900">Tỷ lệ tăng trưởng</div>
                                <div className="text-xs text-gray-500">So với tháng trước</div>
                            </div>
                            <div className="text-lg font-bold text-blue-600">+{stats.growth}%</div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                            <div>
                                <div className="text-sm font-medium text-gray-900">Số buổi học</div>
                                <div className="text-xs text-gray-500">Tổng buổi học tháng này</div>
                            </div>
                            <div className="text-lg font-bold text-purple-600">1,456</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Performing Tutors */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Gia sư có doanh thu cao nhất</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Gia sư</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Doanh thu</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Số buổi học</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">TB/buổi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.topPerformingTutors.map((tutor, index) => (
                                <tr key={index} className="border-b border-gray-100">
                                    <td className="py-3 px-4">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                                                <span className="text-sm font-medium text-gray-700">
                                                    {tutor.name.charAt(0)}
                                                </span>
                                            </div>
                                            <span className="text-sm font-medium text-gray-900">{tutor.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-sm font-medium text-green-600">
                                        {formatCurrency(tutor.revenue)}
                                    </td>
                                    <td className="py-3 px-4 text-sm text-gray-900">{tutor.sessions}</td>
                                    <td className="py-3 px-4 text-sm text-gray-900">
                                        {formatCurrency(Math.round(tutor.revenue / tutor.sessions))}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ManagerOverview; 