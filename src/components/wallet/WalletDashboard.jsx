import React, { useState, useEffect } from 'react';
import { fetchWalletTransactions, fetchDepositHistory, fetchWithdrawalRequests } from '../api/auth';

const WalletDashboard = ({ balance, availableBalance, onRefresh, onViewAllTransactions }) => {
  const [transactions, setTransactions] = useState([]);
  const [depositHistory, setDepositHistory] = useState([]);
  const [withdrawalHistory, setWithdrawalHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Translation function for transaction descriptions
  const translateDescription = (description) => {
    if (!description) return 'Giao dịch ví';
    
    let translatedDescription = String(description);
    
    // Common English patterns to Vietnamese translations
    const translations = {
      'payment release from escrow for booking slot': 'Giải phóng tiền từ ký quỹ cho lịch học',
      'payment for completed lesson': 'Thanh toán cho buổi học đã hoàn thành',
      'heldfund': 'Ký quỹ',
      'booking slot': 'Lịch học',
      'completed lesson': 'Buổi học đã hoàn thành',
      'lesson payment': 'Thanh toán buổi học',
      'tutor payment': 'Thanh toán cho gia sư',
      'student payment': 'Thanh toán của học viên',
      'refund': 'Hoàn tiền',
      'fee': 'Phí',
      'commission': 'Hoa hồng',
      'service fee': 'Phí dịch vụ',
      'transaction fee': 'Phí giao dịch',
      'withdrawal fee': 'Phí rút tiền',
      'deposit fee': 'Phí nạp tiền',
      'escrow': 'Ký quỹ',
      'release': 'Giải phóng',
      'payment': 'Thanh toán',
      'for': 'cho',
      'from': 'từ',
      'to': 'về',
      'withdrawal': 'Rút tiền',
      'deposit': 'Nạp tiền',
      'transfer': 'Chuyển khoản',
      'wallet transaction': 'Giao dịch ví',
      'transaction': 'Giao dịch',
      'successful': 'Thành công',
      'pending': 'Đang xử lý',
      'failed': 'Thất bại',
      'completed': 'Đã hoàn thành',
      'cancelled': 'Đã hủy',
      'rejected': 'Bị từ chối',
      'payos': 'PayOS',
      'vnpay': 'VNPay',
      'momo': 'MoMo',
      'zalopay': 'ZaloPay',
      'bank transfer': 'Chuyển khoản ngân hàng',
      'cash deposit': 'Nạp tiền mặt',
      'online payment': 'Thanh toán trực tuyến'
    };

    // Apply translations in order of specificity (longer phrases first)
    const sortedTranslations = Object.entries(translations).sort((a, b) => b[0].length - a[0].length);
    
    sortedTranslations.forEach(([english, vietnamese]) => {
      translatedDescription = translatedDescription.replace(
        new RegExp(english, 'gi'),
        vietnamese
      );
    });

    // Special handling for HeldFund IDs - replace with more readable format
    translatedDescription = translatedDescription.replace(
      /(HeldFund:\s*)([a-f0-9]+)/gi,
      'Ký quỹ: $2'
    );

    // Special handling for booking slot IDs - make them more readable
    translatedDescription = translatedDescription.replace(
      /([a-f0-9]{32})/g,
      (match) => `#${match.substring(0, 8)}...`
    );

    // Special handling for specific patterns
    if (translatedDescription.toLowerCase().includes('payment release from escrow for booking slot')) {
      translatedDescription = translatedDescription.replace(
        /payment release from escrow for booking slot ([a-f0-9]+)/gi,
        'Giải phóng tiền từ ký quỹ cho lịch học #$1...'
      );
    }

    return translatedDescription;
  };

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
      
      const [walletTransactions, deposits, withdrawals] = await Promise.all([
        fetchWalletTransactions().catch(err => {
          console.warn('Failed to fetch wallet transactions:', err);
          return [];
        }),
        fetchDepositHistory().catch(err => {
          console.warn('Failed to fetch deposit history:', err);
          return [];
        }),
        fetchWithdrawalRequests({ pageSize: 50 }).catch(err => {
          console.warn('Failed to fetch withdrawal history:', err);
          return [];
        })
      ]);

      console.log('Debug Dashboard - Raw wallet transactions:', walletTransactions);
      console.log('Debug Dashboard - Raw deposits:', deposits);
      console.log('Debug Dashboard - Raw withdrawals:', withdrawals);

      // Handle different data structures - APIs now return arrays directly from auth.jsx
      let normalizedTransactions = Array.isArray(walletTransactions) ? walletTransactions : [];
      let normalizedDeposits = Array.isArray(deposits) ? deposits : [];
      let normalizedWithdrawals = Array.isArray(withdrawals?.data || withdrawals) ? (withdrawals?.data || withdrawals) : [];

      console.log('Debug Dashboard - Normalized transactions:', normalizedTransactions);
      console.log('Debug Dashboard - Normalized deposits:', normalizedDeposits);
      console.log('Debug Dashboard - Normalized withdrawals:', normalizedWithdrawals);

      setTransactions(normalizedTransactions);
      setDepositHistory(normalizedDeposits);
      setWithdrawalHistory(normalizedWithdrawals);
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
    console.log('Debug Stats - Withdrawal History:', withdrawalHistory);

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
    
    // Calculate from both wallet transactions and dedicated withdrawal history
    const walletWithdrawals = transactions
      .filter(t => {
        const description = String(t.description || t.transactionType || t.note || '').toLowerCase();
        // Skip deposit-like transactions
        if (description.includes('nạp')) {
          return false;
        }
        
        const type = String(t.type || t.transactionType || '').toLowerCase();
        return type.includes('withdraw') || type.includes('withdrawal') || type.includes('rut');
      })
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

    const withdrawalHistoryAmount = withdrawalHistory
      .filter(w => w.status === 2) // Only completed withdrawals
      .reduce((sum, w) => sum + (parseFloat(w.grossAmount || w.amount) || 0), 0);

    const totalWithdrawals = walletWithdrawals + withdrawalHistoryAmount;
    
    // Filter out deposit-like transactions from wallet transactions for counting
    const filteredTransactions = transactions.filter(t => {
      const description = String(t.description || t.transactionType || t.note || '').toLowerCase();
      return !description.includes('nạp');
    });
    
    const allTransactionsCount = filteredTransactions.length + depositHistory.length + withdrawalHistory.length;
    
    const thisMonthTransactions = [...filteredTransactions, ...depositHistory, ...withdrawalHistory].filter(t => {
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
          const description = String(t.description || t.transactionType || t.note || '').toLowerCase();
          const type = String(t.type || t.transactionType || '').toLowerCase();
          // Skip transactions that look like deposits (they should come from deposit history instead)
          return !description.includes('nạp') && 
                 !type.includes('deposit') &&
                 !type.includes('nạp');
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
            description: translateDescription(t.description || t.transactionType || t.note)
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
           description: translateDescription(`Nạp tiền qua ${d.paymentGateway || 'PayOS'} ${statusText}`)
         };
       }),
      // Add withdrawal history
      ...withdrawalHistory.map(w => {
        let statusText = '';
        if (typeof w.status === 'number') {
          switch (w.status) {
            case 0: statusText = '- Chờ xử lý'; break;
            case 1: statusText = '- Đang xử lý'; break;
            case 2: statusText = '- Thành công'; break;
            case 3: statusText = '- Từ chối'; break;
            default: statusText = '- Đang xử lý';
          }
        } else {
          statusText = '- Đang xử lý';
        }

        return {
          id: w.id || w.withdrawalId || Math.random(),
          type: 'withdraw',
          amount: parseFloat(w.grossAmount || w.amount) || 0,
          date: w.createdTime || w.createdAt || w.requestTime || new Date().toISOString(),
          description: translateDescription(`Rút tiền về ${w.bankAccount?.bankName || 'ngân hàng'} ${statusText}`)
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
          <button 
            onClick={onViewAllTransactions}
            className="text-sm text-gray-600 hover:text-gray-800 font-medium outline-none"
          >
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
                    transaction.type === 'deposit' ? 'bg-emerald-500' : 
                    transaction.type === 'withdraw' ? 'bg-rose-500' : 'bg-blue-500'
                  }`}>
                    {transaction.type === 'deposit' ? '↗' : 
                     transaction.type === 'withdraw' ? '↙' : '↔'}
                  </div>
                  <div>
                    <div className="font-medium text-gray-800 text-sm">{transaction.description}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(transaction.date).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                </div>
                <div className={`font-bold ${
                  transaction.type === 'deposit' ? 'text-emerald-600' : 
                  transaction.type === 'withdraw' ? 'text-rose-600' : 'text-blue-600'
                }`}>
                  {transaction.type === 'deposit' ? '+' : 
                   transaction.type === 'withdraw' ? '-' : ''}{formatCurrency(transaction.amount)}
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
            onClick={onViewAllTransactions}
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