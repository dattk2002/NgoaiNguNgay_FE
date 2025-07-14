import React, { useState } from 'react';
import BankCardManager from './BankCardManager';
import TransactionHistory from './TransactionHistory';
import DepositWithdraw from './DepositWithdraw';
import WalletDashboard from './WalletDashboard';

const WalletMain = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [walletBalance, setWalletBalance] = useState(1250000); // VND

  const tabs = [
    { id: 'dashboard', label: 'Tổng quan', icon: '📊' },
    { id: 'cards', label: 'Thẻ ngân hàng', icon: '💳' },
    { id: 'deposit', label: 'Nạp/Rút tiền', icon: '💰' },
    { id: 'transactions', label: 'Lịch sử giao dịch', icon: '📋' }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <WalletDashboard balance={walletBalance} />;
      case 'cards':
        return <BankCardManager />;
      case 'deposit':
        return <DepositWithdraw onBalanceUpdate={setWalletBalance} currentBalance={walletBalance} />;
      case 'transactions':
        return <TransactionHistory />;
      default:
        return <WalletDashboard balance={walletBalance} />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-5 font-sans">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-700 to-gray-800 rounded-3xl p-8 mb-8 text-white shadow-2xl" style={{background: 'linear-gradient(135deg, #333333 0%, #4a4a4a 100%)'}}>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">💳 Ví điện tử</h1>
            <p className="text-lg opacity-90">Quản lý tài chính của bạn</p>
          </div>
          <div className="text-center">
            <div className="text-sm opacity-90 mb-2">Số dư khả dụng</div>
            <div className="text-2xl font-bold">{formatCurrency(walletBalance)}</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-8">
        <div className="flex gap-3 overflow-x-auto py-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`flex items-center gap-3 px-6 py-4 rounded-xl font-medium whitespace-nowrap transition-all duration-300 ${
                activeTab === tab.id
                  ? 'text-white shadow-lg transform -translate-y-1'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:transform hover:-translate-y-1'
              }`}
              style={activeTab === tab.id ? {backgroundColor: '#333333'} : {}}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="text-xl">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="bg-gray-50 rounded-2xl p-8 shadow-lg">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default WalletMain; 