import React, { useState, useEffect } from 'react';
import { fetchWalletTransactions, fetchDepositHistory, fetchWithdrawalRequests } from '../api/auth';

const WalletDashboard = ({ balance, availableBalance, onRefresh, onViewAllTransactions }) => {
  const [transactions, setTransactions] = useState([]);
  const [depositHistory, setDepositHistory] = useState([]);
  const [withdrawalHistory, setWithdrawalHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Simple description formatter - no translation needed as backend returns Vietnamese
  const formatDescription = (description) => {
    if (!description) return 'Giao dịch ví';
    
    let formattedDescription = String(description);
    
    // Special handling for booking slot IDs - make them more readable
    formattedDescription = formattedDescription.replace(
      /([a-f0-9]{32})/g,
      (match) => `#${match.substring(0, 8)}...`
    );

    return formattedDescription;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount) + ' VNĐ';
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
            description: formatDescription(t.description || t.transactionType || t.note)
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
          description: `Rút tiền về ${w.bankAccount?.bankName || 'ngân hàng'} ${statusText}`
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
      {/* Balance Card */}
      <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl p-8 text-white">
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
                    <div className="font-medium text-gray-800 text-sm leading-relaxed">{transaction.description}</div>
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