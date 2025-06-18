import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ManagerOverview from './ManagerOverview';
import RevenueAnalysis from './RevenueAnalysis';
import FinancialReports from './FinancialReports';

const ManagerDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('managerToken');
        localStorage.removeItem('managerUser');
        navigate('/');
    };

    const menuItems = [
        {
            id: 'overview',
            title: 'Tổng quan doanh thu',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            ),
            description: 'Revenue Overview & Statistics'
        },
        {
            id: 'revenue-analysis',
            title: 'Phân tích doanh thu',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            ),
            description: 'Detailed Revenue Analysis'
        },
        {
            id: 'financial-reports',
            title: 'Báo cáo tài chính',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
            description: 'Financial Reports & Export'
        }
    ];

    const renderActiveComponent = () => {
        switch (activeTab) {
            case 'overview':
                return <ManagerOverview />;
            case 'revenue-analysis':
                return <RevenueAnalysis />;
            case 'financial-reports':
                return <FinancialReports />;
            default:
                return <ManagerOverview />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <div className="w-64 bg-gray-900 text-white">
                {/* Logo/Brand */}
                <div className="p-6 border-b border-gray-800">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-2xl">Manager Panel</h2>
                            <p className="text-xs text-gray-400">Financial Management</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-2">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            className={`w-full text-left p-3 rounded-lg transition-all duration-200 group ${activeTab === item.id
                                ? 'bg-green-600 text-white'
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
                                    <div className={`text-xs ${activeTab === item.id ? 'text-green-100' : 'text-gray-500 group-hover:text-gray-400'}`}>
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
                        <div className="w-8 h-8 bg-green-700 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <div className="text-sm font-medium text-white">Financial Manager</div>
                            <div className="text-xs text-gray-400">Revenue Access</div>
                        </div>
                        <button
                            className="p-1 text-gray-400 hover:text-white transition-colors"
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
                        <div className="flex items-center space-x-4">
                            {/* Notifications */}
                            <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.85 11a7 7 0 005.65-5.65A7 7 0 0010.85 11z" />
                                </svg>
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white rounded-full text-xs flex items-center justify-center">
                                    3
                                </span>
                            </button>

                            {/* Search */}
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm text-black"
                                />
                                <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
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

export default ManagerDashboard; 