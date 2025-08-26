import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ManagerOverview from './ManagerOverview';
import RevenueAnalysis from './RevenueAnalysis';
import WithdrawalManagement from './WithdrawalManagement';
import WalletManagement from './WalletManagement';
import TransactionSummary from './TransactionSummary';
import HeldFundsSummary from './HeldFundsSummary';
import ManagerStatistics from './ManagerStatistics';
import TopTutorsRevenue from './TopTutorsRevenue';
import FeeManagement from './FeeManagement';
import NoFocusOutLineButton from '../../utils/noFocusOutlineButton';

console.log('ManagerDashboard loaded, FeeManagement imported:', !!FeeManagement);

const ManagerDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const navigate = useNavigate();

    const handleLogout = () => {
        // Clear all authentication tokens and user data
        localStorage.removeItem('managerToken');
        localStorage.removeItem('managerUser');
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
            title: 'Tổng quan doanh thu',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            ),
            description: 'Revenue Overview & Statistics'
        },
        {
            id: 'statistics',
            title: 'Thống kê',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            ),
            description: 'Transaction Statistics & Analytics'
        },
        {
            id: 'top-tutors-revenue',
            title: 'Xếp hạng doanh thu gia sư',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
            description: 'Top Tutors Revenue Ranking'
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
            id: 'transaction-summary',
            title: 'Tổng hợp giao dịch',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
            ),
            description: 'Transaction Summary & Analytics'
        },
        {
            id: 'held-funds-summary',
            title: 'Thống kê tiền giữ',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
            ),
            description: 'Held Funds Summary & Statistics'
        },
        {
            id: 'withdrawal-management',
            title: 'Quản lý rút tiền',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
            description: 'Withdrawal Requests Management'
        },
        {
            id: 'wallet-management',
            title: 'Quản lý ví',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
            ),
            description: 'Wallet System Management'
        },
        {
            id: 'fee-management',
            title: 'Quản lý phí',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
            ),
            description: 'System Fee Management'
        }
    ];

    const renderActiveComponent = () => {
        console.log('Active tab:', activeTab);
        switch (activeTab) {
            case 'overview':
                return <ManagerOverview />;
            case 'statistics':
                return <ManagerStatistics />;
            case 'top-tutors-revenue':
                return <TopTutorsRevenue />;
            case 'revenue-analysis':
                return <RevenueAnalysis />;
            case 'transaction-summary':
                return <TransactionSummary />;
            case 'held-funds-summary':
                return <HeldFundsSummary />;
            case 'withdrawal-management':
                return <WithdrawalManagement />;
            case 'wallet-management':
                return <WalletManagement />;
            case 'fee-management':
                console.log('Rendering FeeManagement component');
                return <FeeManagement />;
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
                    {console.log('Menu items count:', menuItems.length)}
                    {menuItems.map((item) => (
                        <NoFocusOutLineButton
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
                        </NoFocusOutLineButton>
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
                        <NoFocusOutLineButton
                            className="p-1 text-gray-400 hover:text-white transition-colors"
                            onClick={handleLogout}
                            title="Đăng xuất"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </NoFocusOutLineButton>
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

export default ManagerDashboard; 