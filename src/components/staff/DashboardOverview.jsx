import React from 'react';

const DashboardOverview = () => {
    const stats = [
        {
            title: 'Tổng số gia sư',
            value: '156',
            change: '+12%',
            changeType: 'increase',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
            )
        },
        {
            title: 'Gia sư chờ duyệt',
            value: '23',
            change: '+5',
            changeType: 'increase',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        {
            title: 'Báo cáo chờ xử lý',
            value: '8',
            change: '-2',
            changeType: 'decrease',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            )
        },
        {
            title: 'Yêu cầu thông tin',
            value: '15',
            change: '+3',
            changeType: 'increase',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
            )
        }
    ];

    const recentActivities = [
        {
            id: 1,
            type: 'tutor_approval',
            message: 'Gia sư Nguyễn Văn A đã được phê duyệt',
            time: '2 giờ trước',
            priority: 'success'
        },
        {
            id: 2,
            type: 'report_received',
            message: 'Nhận được báo cáo từ học viên về gia sư Trần Thị B',
            time: '3 giờ trước',
            priority: 'warning'
        },
        {
            id: 3,
            type: 'info_request',
            message: 'Yêu cầu thông tin bổ sung từ gia sư Lê Văn C',
            time: '5 giờ trước',
            priority: 'normal'
        },
        {
            id: 4,
            type: 'tutor_registration',
            message: 'Gia sư mới Phạm Thị D đăng ký tham gia',
            time: '1 ngày trước',
            priority: 'normal'
        }
    ];

    return (
        <div className="space-y-8">
            <style dangerouslySetInnerHTML={{
                __html: `
                    * {
                        outline: none !important;
                    }
                    
                    button:focus {
                        outline: none !important;
                        box-shadow: none !important;
                    }
                    
                    button:focus-visible {
                        outline: none !important;
                        box-shadow: none !important;
                    }
                    
                    input:focus {
                        outline: none !important;
                        box-shadow: none !important;
                    }
                    
                    select:focus {
                        outline: none !important;
                        box-shadow: none !important;
                    }
                    
                    textarea:focus {
                        outline: none !important;
                        box-shadow: none !important;
                    }
                    
                    a:focus {
                        outline: none !important;
                        box-shadow: none !important;
                    }
                `
            }} />
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-xl border border-gray-100 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                <div className="flex items-center mt-2">
                                    <span className={`text-sm font-medium ${stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        {stat.change}
                                    </span>
                                    <span className="text-sm text-gray-500 ml-1">từ tuần trước</span>
                                </div>
                            </div>
                            <div className={`p-3 rounded-lg ${index === 0 ? 'bg-blue-50 text-blue-600' :
                                index === 1 ? 'bg-orange-50 text-orange-600' :
                                    index === 2 ? 'bg-red-50 text-red-600' :
                                        'bg-green-50 text-green-600'
                                }`}>
                                {stat.icon}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Dashboard Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activities */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">Hoạt động gần đây</h3>
                        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium outline-none">
                            Xem tất cả
                        </button>
                    </div>
                    <div className="space-y-4">
                        {recentActivities.map((activity) => (
                            <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                                <div className={`p-2 rounded-lg ${activity.priority === 'success' ? 'bg-green-100 text-green-600' :
                                    activity.priority === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                                        'bg-blue-100 text-blue-600'
                                    }`}>
                                    {activity.priority === 'success' ? (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : activity.priority === 'warning' ? (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white p-6 rounded-xl border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Thao tác nhanh</h3>
                    <div className="space-y-3">
                        <button className="w-full p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-between group outline-none">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium text-gray-900">Phê duyệt gia sư</span>
                            </div>
                            <span className="bg-green-500 text-white rounded-full px-2 py-1 text-xs font-semibold">23</span>
                        </button>
                        <button className="w-full p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-between group">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium text-gray-900">Xử lý báo cáo</span>
                            </div>
                            <span className="bg-red-500 text-white rounded-full px-2 py-1 text-xs font-semibold">8</span>
                        </button>
                        <button className="w-full p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-between group">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium text-gray-900">Yêu cầu thông tin</span>
                            </div>
                            <span className="bg-yellow-500 text-white rounded-full px-2 py-1 text-xs font-semibold">15</span>
                        </button>
                        <button className="w-full p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-between group">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium text-gray-900">Xem hồ sơ</span>
                            </div>
                            <span className="bg-blue-500 text-white rounded-full px-2 py-1 text-xs font-semibold">45</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Chart Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Line Chart */}
                <div className="bg-white p-6 rounded-xl border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Đăng ký gia sư</h3>
                            <p className="text-sm text-gray-500">Xu hướng theo tháng trong 6 tháng</p>
                        </div>
                        <select className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                            <option>6 tháng gần đây</option>
                            <option>Năm trước</option>
                        </select>
                    </div>
                    <div className="h-64 flex items-end justify-between space-x-2 px-4">
                        {[65, 85, 70, 95, 80, 75].map((height, index) => (
                            <div key={index} className="flex-1 flex flex-col items-center">
                                <div
                                    className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all hover:opacity-80"
                                    style={{ height: `${height}%` }}
                                ></div>
                                <span className="text-xs text-gray-500 mt-2">
                                    {['T7', 'T8', 'T9', 'T10', 'T11', 'T12'][index]}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Calendar */}
                <div className="bg-white p-6 rounded-xl border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">Lịch</h3>
                        <div className="flex items-center space-x-2">
                            <button className="p-1 hover:bg-gray-100 rounded">
                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <span className="text-sm font-medium text-gray-900">Tháng 12, 2023</span>
                            <button className="p-1 hover:bg-gray-100 rounded">
                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-xs">
                        {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day) => (
                            <div key={day} className="p-2 text-gray-500 font-medium">{day}</div>
                        ))}
                        {Array.from({ length: 35 }, (_, i) => {
                            const day = i - 6 + 1;
                            const isToday = day === 15;
                            const isCurrentMonth = day > 0 && day <= 31;
                            return (
                                <div
                                    key={i}
                                    className={`p-2 text-sm ${!isCurrentMonth ? 'text-gray-300' :
                                        isToday ? 'bg-blue-600 text-white rounded-lg' :
                                            'text-gray-700 hover:bg-gray-100 rounded-lg'
                                        } cursor-pointer`}
                                >
                                    {isCurrentMonth ? day : ''}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview; 