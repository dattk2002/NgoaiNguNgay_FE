import React, { useState, useEffect } from 'react';
import { fetchWalletTransactions, fetchDepositHistory } from '../api/auth';

const TransactionHistory = () => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const itemsPerPage = 10;

  // Load data on component mount
  useEffect(() => {
    loadTransactionData();
  }, []);

  const loadTransactionData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [walletTransactions, depositHistory] = await Promise.all([
        fetchWalletTransactions().catch(err => {
          console.warn('Failed to fetch wallet transactions:', err);
          return [];
        }),
        fetchDepositHistory().catch(err => {
          console.warn('Failed to fetch deposit history:', err);
          return [];
        })
      ]);

      console.log('Debug - Raw wallet transactions:', walletTransactions);
      console.log('Debug - Raw deposit history:', depositHistory);

      // APIs now return arrays directly from auth.jsx after handling pagination
      let normalizedWalletTransactions = Array.isArray(walletTransactions) ? walletTransactions : [];
      let normalizedDepositHistory = Array.isArray(depositHistory) ? depositHistory : [];

      console.log('Debug - Normalized wallet transactions:', normalizedWalletTransactions);
      console.log('Debug - Normalized deposit history:', normalizedDepositHistory);

      // Combine and normalize transaction data
      const allTransactions = [
        // Wallet transactions (filter out deposits to avoid duplication)
        ...normalizedWalletTransactions
          .filter(t => {
            const description = t.description || t.transactionType || t.note || '';
            const type = t.type || t.transactionType || '';
            // Skip transactions that look like deposits
            return !description.toLowerCase().includes('nạp') && 
                   !type.toLowerCase().includes('deposit') &&
                   !type.toLowerCase().includes('nạp');
          })
          .map(t => {
          // Handle transaction type safely
          let transactionType = 'transaction';
          if (t.transactionType && typeof t.transactionType === 'string') {
            transactionType = t.transactionType.toLowerCase();
          } else if (t.type && typeof t.type === 'string') {
            transactionType = t.type.toLowerCase();
          }

          // Handle status safely
          let statusValue = 'failed';
          if (typeof t.status === 'number') {
            statusValue = t.status === 1 ? 'success' : t.status === 0 ? 'failed' : 'pending';
          } else if (t.status && typeof t.status === 'string') {
            const statusLower = t.status.toLowerCase();
            if (statusLower === 'success' || statusLower === 'completed' || statusLower === 'successful') {
              statusValue = 'success';
            } else if (statusLower === 'pending') {
              statusValue = 'pending';
            } else {
              statusValue = 'failed';
            }
          }

          const transaction = {
            id: t.id || t.transactionId || Math.random(),
            type: transactionType,
            amount: parseFloat(t.amount) || 0,
            description: t.description || t.transactionType || t.note || 'Giao dịch ví',
            date: t.createdAt || t.transactionDate || t.createdTime || new Date().toISOString(),
            status: statusValue
          };
          console.log('Debug - Processed wallet transaction:', transaction);
          return transaction;
        }),
        // Deposit history
        ...normalizedDepositHistory.map(d => {
          // Handle status as number or string
          let statusText = '';
          let statusValue = '';
          
          if (typeof d.status === 'number') {
            // API returns status as number: 1 = success, 0 = failed, etc.
            if (d.status === 1) {
              statusText = '- Thành công';
              statusValue = 'success';
            } else if (d.status === 0) {
              statusText = '- Thất bại';
              statusValue = 'failed';
            } else {
              statusText = '- Đang xử lý';
              statusValue = 'pending';
            }
          } else if (typeof d.status === 'string') {
            // Fallback for string status
            const statusLower = d.status.toLowerCase();
            if (statusLower === 'success' || statusLower === 'successful') {
              statusText = '- Thành công';
              statusValue = 'success';
            } else if (statusLower === 'pending') {
              statusText = '- Đang xử lý';
              statusValue = 'pending';
            } else {
              statusText = '- Thất bại';
              statusValue = 'failed';
            }
          } else {
            statusText = '- Thất bại';
            statusValue = 'failed';
          }

          const deposit = {
            id: d.id || d.depositId || Math.random(),
            type: 'deposit',
            amount: parseFloat(d.amount) || 0,
            description: `Nạp tiền qua ${d.paymentGateway || 'PayOS'} ${statusText}`,
            date: d.createdTime || d.createdAt || d.requestTime || new Date().toISOString(),
            status: statusValue
          };
          console.log('Debug - Processed deposit:', deposit);
          return deposit;
        })
      ];

      console.log('Debug - Final all transactions:', allTransactions);

      // Sort by date (newest first)
      allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      setTransactions(allTransactions);
    } catch (err) {
      console.error('Failed to load transaction data:', err);
      setError('Không thể tải lịch sử giao dịch. Vui lòng thử lại.');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getFilteredTransactions = () => {
    return transactions.filter(transaction => {
      const matchesFilter = filter === 'all' || transaction.type === filter || transaction.status === filter;
      const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  };

  const filteredTransactions = getFilteredTransactions();
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const currentTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (status) => {
    const statusConfig = {
      success: { label: 'Thành công', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
      pending: { label: 'Đang xử lý', color: 'bg-amber-100 text-amber-800 border-amber-200' },
      failed: { label: 'Thất bại', color: 'bg-rose-100 text-rose-800 border-rose-200' }
    };
    return statusConfig[status] || statusConfig.pending;
  };

  const getTransactionIcon = (type) => {
    return type === 'deposit' ? '⬇' : '⬆';
  };

  const getAmountColor = (type) => {
    return type === 'deposit' ? 'text-emerald-600' : 'text-rose-600';
  };

  const filterOptions = [
    { key: 'all', label: 'Tất cả', icon: '📋' },
    { key: 'deposit', label: 'Nạp tiền', icon: '⬇️' },
    { key: 'withdraw', label: 'Rút tiền', icon: '⬆️' },
    { key: 'success', label: 'Thành công', icon: '✅' },
    { key: 'pending', label: 'Đang xử lý', icon: '⏳' },
    { key: 'failed', label: 'Thất bại', icon: '❌' }
  ];

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">📋 Lịch sử giao dịch</h2>
        <p className="text-gray-600">Xem tất cả các giao dịch đã thực hiện</p>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col lg:flex-row gap-6 justify-between">
        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((filterOption) => (
            <button
              key={filterOption.key}
              onClick={() => setFilter(filterOption.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm outline-none ${
                filter === filterOption.key
                  ? 'bg-gray-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>{filterOption.icon}</span>
              <span>{filterOption.label}</span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="w-full lg:w-80">
          <input
            type="text"
            placeholder="Tìm kiếm giao dịch..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-gray-800 transition-all outline-none"
          />
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-200">
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
            <span className="ml-3 text-gray-600">Đang tải lịch sử giao dịch...</span>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Lỗi tải dữ liệu</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <button
              onClick={loadTransactionData}
              className="px-6 py-3 bg-gray-600 text-white rounded-xl font-medium hover:bg-gray-700 transition-all outline-none"
            >
              Thử lại
            </button>
          </div>
        ) : currentTransactions.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {currentTransactions.map((transaction) => (
              <div key={transaction.id} className="p-6 hover:bg-gray-100 transition-colors duration-150">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-medium ${
                      transaction.type === 'deposit' ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}>
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">{transaction.description}</div>
                      <div className="text-sm text-gray-600">
                        {new Date(transaction.date).toLocaleString('vi-VN')}
                      </div>
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-end sm:items-end gap-2">
                    <div className={`text-lg font-bold ${getAmountColor(transaction.type)}`}>
                      {transaction.type === 'deposit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(transaction.status).color}`}>
                      {getStatusBadge(transaction.status).label}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-gray-300 text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {searchTerm || filter !== 'all' ? 'Không tìm thấy giao dịch' : 'Chưa có giao dịch nào'}
            </h3>
            <p className="text-gray-500">
              {searchTerm || filter !== 'all' 
                ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm' 
                : 'Hãy thực hiện giao dịch đầu tiên của bạn'}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 outline-none"
          >
            Trước
          </button>
          
          <div className="flex gap-1">
            {[...Array(Math.min(5, totalPages))].map((_, index) => {
              const pageNumber = currentPage <= 3 ? index + 1 : currentPage - 2 + index;
              if (pageNumber > totalPages) return null;
              
              return (
                <button
                  key={pageNumber}
                  onClick={() => setCurrentPage(pageNumber)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 outline-none ${
                    currentPage === pageNumber
                      ? 'bg-gray-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 outline-none"
          >
            Sau
          </button>
        </div>
      )}

      {/* Summary Stats */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">⬇️</span>
              <span className="font-medium text-emerald-800">Tổng nạp</span>
            </div>
            <div className="text-2xl font-bold text-emerald-600">
              {formatCurrency(
                filteredTransactions
                  .filter(t => t.type === 'deposit' && t.status === 'success')
                  .reduce((sum, t) => sum + t.amount, 0)
              )}
            </div>
          </div>
          
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">⬆️</span>
              <span className="font-medium text-rose-800">Tổng rút</span>
            </div>
            <div className="text-2xl font-bold text-rose-600">
              {formatCurrency(
                filteredTransactions
                  .filter(t => (t.type === 'withdraw' || t.type === 'withdrawal') && t.status === 'success')
                  .reduce((sum, t) => sum + t.amount, 0)
              )}
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">📊</span>
              <span className="font-medium text-blue-800">Tổng giao dịch</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {filteredTransactions.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory; 