import React, { useState } from 'react';

const TransactionHistory = () => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const transactions = [
    { id: 1, type: 'deposit', amount: 500000, description: 'Nạp tiền từ Techcombank', date: '2024-01-15 14:30', status: 'success' },
    { id: 2, type: 'withdraw', amount: 200000, description: 'Thanh toán khóa học', date: '2024-01-14 10:20', status: 'success' },
    { id: 3, type: 'deposit', amount: 1000000, description: 'Nạp tiền từ Vietcombank', date: '2024-01-13 16:45', status: 'success' },
    { id: 4, type: 'withdraw', amount: 150000, description: 'Thanh toán gia sư', date: '2024-01-12 09:15', status: 'pending' },
    { id: 5, type: 'deposit', amount: 300000, description: 'Nạp tiền từ BIDV', date: '2024-01-11 11:30', status: 'success' },
    { id: 6, type: 'withdraw', amount: 75000, description: 'Rút tiền về ví', date: '2024-01-10 15:45', status: 'failed' },
    { id: 7, type: 'deposit', amount: 800000, description: 'Nạp tiền từ MB Bank', date: '2024-01-09 08:20', status: 'success' },
    { id: 8, type: 'withdraw', amount: 250000, description: 'Thanh toán course', date: '2024-01-08 13:10', status: 'success' }
  ];

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
      success: { label: 'Thành công', color: 'bg-green-100 text-green-800' },
      pending: { label: 'Đang xử lý', color: 'bg-yellow-100 text-yellow-800' },
      failed: { label: 'Thất bại', color: 'bg-red-100 text-red-800' }
    };
    return statusConfig[status] || statusConfig.pending;
  };

  const getTransactionIcon = (type) => {
    return type === 'deposit' ? '⬇️' : '⬆️';
  };

  const getAmountColor = (type) => {
    return type === 'deposit' ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">📋 Lịch sử giao dịch</h2>
        <p className="text-gray-600">Xem tất cả các giao dịch đã thực hiện</p>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'Tất cả', icon: '📋' },
            { key: 'deposit', label: 'Nạp tiền', icon: '⬇️' },
            { key: 'withdraw', label: 'Rút tiền', icon: '⬆️' },
            { key: 'success', label: 'Thành công', icon: '✅' },
            { key: 'pending', label: 'Đang xử lý', icon: '⏳' },
            { key: 'failed', label: 'Thất bại', icon: '❌' }
          ].map((filterOption) => (
            <button
              key={filterOption.key}
              onClick={() => setFilter(filterOption.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                filter === filterOption.key
                  ? 'text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={filter === filterOption.key ? {backgroundColor: '#333333'} : {}}
            >
              <span>{filterOption.icon}</span>
              <span>{filterOption.label}</span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="w-full md:w-auto">
          <input
            type="text"
            placeholder="Tìm kiếm giao dịch..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-gray-800"
            style={{focusRingColor: '#333333'}}
          />
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-gray-50 rounded-2xl overflow-hidden shadow-lg">
        {currentTransactions.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {currentTransactions.map((transaction) => (
              <div key={transaction.id} className="p-6 hover:bg-gray-100 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${
                      transaction.type === 'deposit' ? 'bg-green-500' : 'bg-red-500'
                    }`}>
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">{transaction.description}</div>
                      <div className="text-sm text-gray-600">{transaction.date}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={`text-lg font-bold ${getAmountColor(transaction.type)}`}>
                      {transaction.type === 'deposit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(transaction.status).color}`}>
                      {getStatusBadge(transaction.status).label}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Không tìm thấy giao dịch</h3>
            <p className="text-gray-500">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Trước
          </button>
          
          <div className="flex gap-1">
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index + 1)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  currentPage === index + 1
                    ? 'text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                style={currentPage === index + 1 ? {backgroundColor: '#333333'} : {}}
              >
                {index + 1}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Sau
          </button>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">⬇️</span>
            <span className="font-medium text-green-800">Tổng nạp</span>
          </div>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(
              transactions
                .filter(t => t.type === 'deposit' && t.status === 'success')
                .reduce((sum, t) => sum + t.amount, 0)
            )}
          </div>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">⬆️</span>
            <span className="font-medium text-red-800">Tổng rút</span>
          </div>
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(
              transactions
                .filter(t => t.type === 'withdraw' && t.status === 'success')
                .reduce((sum, t) => sum + t.amount, 0)
            )}
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">📊</span>
            <span className="font-medium text-blue-800">Tổng giao dịch</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {transactions.length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory; 