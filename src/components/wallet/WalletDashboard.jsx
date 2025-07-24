import React, { useState, useEffect } from 'react';
import { fetchWalletTransactions, fetchDepositHistory } from '../api/auth';

const WalletDashboard = ({ balance, availableBalance, onRefresh }) => {
  const [transactions, setTransactions] = useState([]);
  const [depositHistory, setDepositHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Load transactions and deposit history
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [walletTransactions, deposits] = await Promise.all([
        fetchWalletTransactions().catch(err => {
          console.warn('Failed to fetch wallet transactions:', err);
          return [];
        }),
        fetchDepositHistory().catch(err => {
          console.warn('Failed to fetch deposit history:', err);
          return [];
        })
      ]);

      console.log('Debug Dashboard - Raw wallet transactions:', walletTransactions);
      console.log('Debug Dashboard - Raw deposits:', deposits);

      // Handle different data structures - APIs now return arrays directly from auth.jsx
      let normalizedTransactions = Array.isArray(walletTransactions) ? walletTransactions : [];
      let normalizedDeposits = Array.isArray(deposits) ? deposits : [];

      console.log('Debug Dashboard - Normalized transactions:', normalizedTransactions);
      console.log('Debug Dashboard - Normalized deposits:', normalizedDeposits);

      setTransactions(normalizedTransactions);
      setDepositHistory(normalizedDeposits);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Không thể tải dữ liệu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats from real data
  const calculateStats = () => {
    console.log('Debug Stats - Transactions:', transactions);
    console.log('Debug Stats - Deposit History:', depositHistory);

    const totalDeposits = depositHistory
      .filter(d => {
        if (typeof d.status === 'number') {
          return d.status === 1; // 1 = success
        } else if (typeof d.status === 'string') {
          const statusLower = d.status.toLowerCase();
          return statusLower === 'success' || statusLower === 'successful';
        }
        return false;
      })
      .reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
    
    const totalWithdrawals = transactions
      .filter(t => {
        const description = t.description || t.transactionType || t.note || '';
        // Skip deposit-like transactions
        if (description.toLowerCase().includes('nạp')) {
          return false;
        }
        
        let type = '';
        if (t.type && typeof t.type === 'string') {
          type = t.type.toLowerCase();
        } else if (t.transactionType && typeof t.transactionType === 'string') {
          type = t.transactionType.toLowerCase();
        }
        return type.includes('withdraw') || type.includes('withdrawal') || type.includes('rut');
      })
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    
    // Filter out deposit-like transactions from wallet transactions for counting
    const filteredTransactions = transactions.filter(t => {
      const description = t.description || t.transactionType || t.note || '';
      return !description.toLowerCase().includes('nạp');
    });
    
    const allTransactionsCount = filteredTransactions.length + depositHistory.length;
    
    const thisMonthTransactions = [...filteredTransactions, ...depositHistory].filter(t => {
      const date = t.createdAt || t.date || t.createdTime || t.requestTime;
      if (!date) return false;
      const transactionDate = new Date(date);
      const now = new Date();
      return transactionDate.getMonth() === now.getMonth() && 
             transactionDate.getFullYear() === now.getFullYear();
    }).length;

    console.log('Debug Stats - Total deposits:', totalDeposits);
    console.log('Debug Stats - Total withdrawals:', totalWithdrawals);
    console.log('Debug Stats - All transactions count:', allTransactionsCount);
    console.log('Debug Stats - This month transactions:', thisMonthTransactions);

    return [
      { label: 'Tổng tiền nạp', value: formatCurrency(totalDeposits), icon: '📈', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
      { label: 'Tổng tiền rút', value: formatCurrency(totalWithdrawals), icon: '📉', color: 'bg-rose-50 border-rose-200 text-rose-700' },
      { label: 'Giao dịch tháng này', value: thisMonthTransactions.toString(), icon: '📊', color: 'bg-blue-50 border-blue-200 text-blue-700' },
      { label: 'Thẻ đã liên kết', value: '0', icon: '💳', color: 'bg-purple-50 border-purple-200 text-purple-700' }
    ];
  };

  const stats = calculateStats();

  // Get recent transactions (combine wallet transactions and deposits)
  const getRecentTransactions = () => {
    const allTransactions = [
      // Filter out deposit transactions from wallet API to avoid duplication with deposit history
      ...transactions
        .filter(t => {
          const description = t.description || t.transactionType || t.note || '';
          const type = t.type || t.transactionType || '';
          // Skip transactions that look like deposits (they should come from deposit history instead)
          return !description.toLowerCase().includes('nạp') && 
                 !type.toLowerCase().includes('deposit') &&
                 !type.toLowerCase().includes('nạp');
        })
        .map(t => {
          let transactionType = 'transaction';
          if (t.type && typeof t.type === 'string') {
            transactionType = t.type.toLowerCase();
          } else if (t.transactionType && typeof t.transactionType === 'string') {
            transactionType = t.transactionType.toLowerCase();
          }

          return {
            id: t.id || t.transactionId || Math.random(),
            type: transactionType,
            amount: parseFloat(t.amount) || 0,
            date: t.createdAt || t.date || t.createdTime || new Date().toISOString(),
            description: t.description || t.transactionType || t.note || 'Giao dịch ví'
          };
        }),
             ...depositHistory.map(d => {
         let statusText = '';
         if (typeof d.status === 'number') {
           statusText = d.status === 1 ? '- Thành công' : d.status === 0 ? '- Thất bại' : '- Đang xử lý';
         } else if (typeof d.status === 'string') {
           const statusLower = d.status.toLowerCase();
           statusText = statusLower === 'success' || statusLower === 'successful' ? '- Thành công' :
                       statusLower === 'pending' ? '- Đang xử lý' : '- Thất bại';
         } else {
           statusText = '- Thất bại';
         }

         return {
           id: d.id || d.depositId || Math.random(),
           type: 'deposit',
           amount: parseFloat(d.amount) || 0,
           date: d.createdTime || d.createdAt || d.requestTime || new Date().toISOString(),
           description: `Nạp tiền qua ${d.paymentGateway || 'PayOS'} ${statusText}`
         };
       })
    ];

    console.log('Debug Recent - All transactions:', allTransactions);

    return allTransactions
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 3);
  };

  const recentTransactions = getRecentTransactions();

  return (
    <div className="p-8 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Balance Card */}
        <div className="lg:col-span-2 bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl p-8 text-white">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-lg font-medium opacity-90 mb-2">💰 Số dư hiện tại</h3>
              <div className="text-4xl font-bold mb-2">{formatCurrency(availableBalance || balance)}</div>
              {balance !== availableBalance && (
                <div className="text-sm opacity-75 mb-2">Tổng số dư: {formatCurrency(balance)}</div>
              )}
              <div className="text-sm opacity-75">Cập nhật: {new Date().toLocaleString('vi-VN')}</div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-4">
          {stats.slice(0, 2).map((stat, index) => (
            <div key={index} className={`p-5 rounded-xl border ${stat.color}`}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xl">{stat.icon}</span>
                <span className="text-sm font-medium">{stat.label}</span>
              </div>
              <div className="text-xl font-bold">{stat.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.slice(2).map((stat, index) => (
          <div key={index} className={`p-5 rounded-xl border ${stat.color}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{stat.icon}</span>
              <span className="text-xs font-medium">{stat.label}</span>
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
          </div>
        ))}
        {stats.slice(0, 2).map((stat, index) => (
          <div key={index + 2} className={`p-5 rounded-xl border ${stat.color}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{stat.icon}</span>
              <span className="text-xs font-medium">{stat.label}</span>
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Recent Transactions */}
      <div className="bg-gray-50 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">📋 Giao dịch gần đây</h3>
          <button className="text-sm text-gray-600 hover:text-gray-800 font-medium outline-none">
            Xem tất cả →
          </button>
        </div>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600"></div>
            <span className="ml-2 text-gray-600">Đang tải giao dịch...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-red-600 mb-2">Lỗi tải dữ liệu</div>
            <button 
              onClick={loadData}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Thử lại
            </button>
          </div>
        ) : recentTransactions.length > 0 ? (
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 bg-white rounded-xl hover:shadow-sm transition-all border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm ${
                    transaction.type === 'deposit' ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}>
                    {transaction.type === 'deposit' ? '↗' : '↙'}
                  </div>
                  <div>
                    <div className="font-medium text-gray-800 text-sm">{transaction.description}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(transaction.date).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                </div>
                <div className={`font-bold ${
                  transaction.type === 'deposit' ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {transaction.type === 'deposit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📭</div>
            <p>Chưa có giao dịch nào</p>
          </div>
        )}
        <div className="text-center mt-6">
          <button 
            className="px-8 py-3 bg-gray-600 text-white rounded-xl font-medium hover:bg-gray-700 transition-all duration-200 outline-none"
          >
            Xem tất cả giao dịch
          </button>
        </div>
      </div>
    </div>
  );
};

export default WalletDashboard; 