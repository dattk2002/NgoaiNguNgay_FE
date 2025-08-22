import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TutorManagement from './TutorManagement';
import DashboardOverview from './DashboardOverview';
import StaffDisputes from './StaffDisputes';
import VideoManagement from './VideoManagement';

const StaffDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const navigate = useNavigate();

    const handleLogout = () => {
        // Clear all authentication tokens and user data
        localStorage.removeItem('staffToken');
        localStorage.removeItem('staffUser');
        localStorage.removeItem('loggedInUser');
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');

        // Add a small delay to ensure localStorage is fully cleared before navigation
        setTimeout(() => {
            navigate('/', { replace: true });
            // Force page reload to ensure all components re-render with cleared state
            window.location.reload();
        }, 100);
    };

    const menuItems = [
        {
            id: 'overview',
            title: 'Tổng quan',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            ),
            description: 'Analytics & Overview'
        },
        {
            id: 'tutor-management',
            title: 'Quản lý gia sư',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
            ),
            description: 'Tutor Management'
        },
        {
            id: 'dispute-management',
            title: 'Quản lý khiếu nại',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
            ),
            description: 'Dispute Management'
        },
        {
            id: 'video-management',
            title: 'Quản lý Video',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
            ),
            description: 'Video Management'
        }
    ];

    const renderActiveComponent = () => {
        switch (activeTab) {
            case 'overview':
                return <DashboardOverview />;
            case 'tutor-management':
                return <TutorManagement />;
            case 'report-management':
                return <ReportManagement />;
            case 'dispute-management':
                return <StaffDisputes />;
            case 'video-management':
                return <VideoManagement />;
            default:
                return <DashboardOverview />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-50">
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
            {/* Sidebar */}
            <div className="w-64 bg-gray-900 text-white">
                {/* Logo/Brand */}
                <div className="p-6 border-b border-gray-800">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="font-semibold whitespace-nowrap text-2xl">Staff Panel</h2>
                            <p className="text-xs text-gray-400">Management System</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-2">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            className={`w-full text-left p-3 rounded-lg transition-all duration-200 group outline-none ${activeTab === item.id
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                }`}
                            onClick={() => setActiveTab(item.id)}
                        >
                            <div className="flex items-center space-x-3">
                                <div className={`${activeTab === item.id ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                                    {item.icon}
                                </div>
                                <div>
                                    <div className="font-medium text-sm">{item.title}</div>
                                    <div className={`text-xs ${activeTab === item.id ? 'text-blue-100' : 'text-gray-500 group-hover:text-gray-400'}`}>
                                        {item.description}
                                    </div>
                                </div>
                            </div>
                        </button>
                    ))}
                </nav>

                {/* User Info */}
                <div className="absolute bottom-0 left-0 right-0 w-64 p-4 border-t border-gray-800">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <div className="text-sm font-medium text-white">Staff User</div>
                            <div className="text-xs text-gray-400">Staff Member</div>
                        </div>
                        <button
                            className="p-1 text-gray-400 hover:text-white transition-colors outline-none"
                            onClick={handleLogout}
                            title="Đăng xuất"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Top Header */}
                <header className="bg-white border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">
                                {menuItems.find(item => item.id === activeTab)?.title}
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                {menuItems.find(item => item.id === activeTab)?.description}
                            </p>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 overflow-auto bg-gray-50 p-6">
                    {renderActiveComponent()}
                </main>
            </div>
        </div>
    );
};

export default StaffDashboard; 