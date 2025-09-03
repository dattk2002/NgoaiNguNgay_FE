import React, { useState, useEffect } from 'react';
import BankCardManager from './BankCardManager';
import TransactionHistory from './TransactionHistory';
import DepositWithdraw from './DepositWithdraw';
import WalletDashboard from './WalletDashboard';
import PaymentReturn from './PaymentReturn';
import { fetchWalletInfo } from '../api/auth';

const WalletMain = ({ showPaymentReturn = false }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [walletBalance, setWalletBalance] = useState(0);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const tabs = [
    { id: 'dashboard', label: 'Tổng quan', icon: '📊' },
    { id: 'cards', label: 'Thẻ ngân hàng', icon: '💳' },
    { id: 'deposit', label: 'Nạp/Rút tiền', icon: '💰' },
    { id: 'transactions', label: 'Lịch sử giao dịch', icon: '📋' }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount) + ' VNĐ';
  };

  // Fetch wallet info on component mount
  useEffect(() => {
    loadWalletInfo();
  }, []);

  const loadWalletInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      const walletInfo = await fetchWalletInfo();
      setWalletBalance(walletInfo.balance || 0);
      setAvailableBalance(walletInfo.availableBalance || 0);
    } catch (err) {
      console.error('Failed to load wallet info:', err);
      setError('Không thể tải thông tin ví. Vui lòng thử lại.');
      // Set default values on error
      setWalletBalance(0);
      setAvailableBalance(0);
    } finally {
      setLoading(false);
    }
  };

  const handleViewAllTransactions = () => {
    setActiveTab('transactions');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <WalletDashboard 
          balance={walletBalance} 
          availableBalance={availableBalance} 
          onRefresh={loadWalletInfo}
          onViewAllTransactions={handleViewAllTransactions}
        />;
      case 'cards':
        return <BankCardManager />;
      case 'deposit':
        return <DepositWithdraw onBalanceUpdate={loadWalletInfo} currentBalance={availableBalance} />;
      case 'transactions':
        return <TransactionHistory />;
      default:
        return <WalletDashboard 
          balance={walletBalance} 
          availableBalance={availableBalance} 
          onRefresh={loadWalletInfo}
          onViewAllTransactions={handleViewAllTransactions}
        />;
    }
  };

  // If showing payment return, render PaymentReturn component
  if (showPaymentReturn) {
    return <PaymentReturn onReturn={loadWalletInfo} />;
  }

  return (
    <div className="max-w-7xl mx-auto p-6 font-sans bg-gray-50 min-h-screen">
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
          }
          
          select:focus {
            outline: none !important;
          }
          
          textarea:focus {
            outline: none !important;
          }
          
          a:focus {
            outline: none !important;
            box-shadow: none !important;
          }
        `
      }} />
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-8 mb-8 shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-gray-800">💳 Ví điện tử</h1>
            <p className="text-gray-600">Quản lý tài chính thông minh và tiện lợi</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-6 min-w-[240px]">
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600"></div>
                <span className="ml-2 text-sm text-gray-600">Đang tải...</span>
              </div>
            ) : error ? (
              <div className="text-center">
                <div className="text-sm text-red-600 mb-2">Lỗi tải dữ liệu</div>
                <button 
                  onClick={loadWalletInfo}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Thử lại
                </button>
              </div>
            ) : (
              <>
                <div className="text-sm text-gray-600 mb-2">Số dư khả dụng</div>
                <div className="text-2xl font-bold text-gray-800">{formatCurrency(availableBalance)}</div>
                {walletBalance !== availableBalance && (
                  <div className="text-xs text-gray-500 mt-1">
                    Tổng: {formatCurrency(walletBalance)}
                  </div>
                )}
                <div className="text-xs text-gray-500 mt-1">Cập nhật: {new Date().toLocaleString('vi-VN')}</div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-8">
        <div className="flex gap-2 overflow-x-auto py-2 bg-white rounded-xl p-2 shadow-sm border border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`flex items-center gap-3 px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-all duration-200 outline-none ${
                activeTab === tab.id
                  ? 'bg-gray-100 text-gray-800 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="text-sm">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default WalletMain; 