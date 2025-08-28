import React, { useState, useEffect } from 'react';
import { fetchWalletTransactions, fetchDepositHistory, fetchWithdrawalRequests } from '../api/auth';
import NoFocusOutLineButton from '../../utils/noFocusOutlineButton';
// Import React Icons
import { 
  HiClipboardList, 
  HiArrowDown, 
  HiArrowUp, 
  HiRefresh, 
  HiCheck, 
  HiClock, 
  HiX,
  HiExclamation,
  HiChartBar,
  HiDownload,
  HiUpload
} from 'react-icons/hi';

const TransactionHistory = () => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const itemsPerPage = 10;

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

  // Load data on component mount
  useEffect(() => {
    loadTransactionData();
  }, []);

  const loadTransactionData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Starting to load transaction data...');
      
      // Fetch wallet transactions
      let walletTransactions = [];
      try {
        const walletResult = await fetchWalletTransactions();
        console.log('✅ Wallet transactions result:', walletResult);
        walletTransactions = walletResult || [];
      } catch (err) {
        console.warn('⚠️ Failed to fetch wallet transactions:', err);
        walletTransactions = [];
      }

      // Fetch deposit history  
      let depositHistory = [];
      try {
        const depositResult = await fetchDepositHistory();
        console.log('✅ Deposit history result:', depositResult);
        depositHistory = depositResult || [];
      } catch (err) {
        console.warn('⚠️ Failed to fetch deposit history:', err);
        depositHistory = [];
      }

      // Fetch withdrawal history
      let withdrawalHistory = [];
      try {
        const withdrawalResult = await fetchWithdrawalRequests({ pageSize: 100 });
        console.log('✅ Withdrawal history result:', withdrawalResult);
        // API returns { data: [...], totalItems, totalPages } format
        withdrawalHistory = withdrawalResult?.data || withdrawalResult || [];
      } catch (err) {
        console.warn('⚠️ Failed to fetch withdrawal history:', err);
        withdrawalHistory = [];
      }

      console.log('📊 Raw data summary:', {
        walletTransactions: {
          type: typeof walletTransactions,
          isArray: Array.isArray(walletTransactions),
          length: Array.isArray(walletTransactions) ? walletTransactions.length : 'N/A',
          data: walletTransactions
        },
        depositHistory: {
          type: typeof depositHistory,
          isArray: Array.isArray(depositHistory),
          length: Array.isArray(depositHistory) ? depositHistory.length : 'N/A',
          data: depositHistory
        },
        withdrawalHistory: {
          type: typeof withdrawalHistory,
          isArray: Array.isArray(withdrawalHistory),
          length: Array.isArray(withdrawalHistory) ? withdrawalHistory.length : 'N/A',
          data: withdrawalHistory
        }
      });

      // Ensure arrays
      let normalizedWalletTransactions = Array.isArray(walletTransactions) ? walletTransactions : [];
      let normalizedDepositHistory = Array.isArray(depositHistory) ? depositHistory : [];
      let normalizedWithdrawalHistory = Array.isArray(withdrawalHistory) ? withdrawalHistory : [];

      console.log('🔧 Normalized data:', {
        walletCount: normalizedWalletTransactions.length,
        depositCount: normalizedDepositHistory.length,
        withdrawalCount: normalizedWithdrawalHistory.length
      });

      // Process transactions safely
      let processedTransactions = [];
      
      try {
        console.log('🔄 Processing wallet transactions...');
        
        // Process wallet transactions (include all except deposits to avoid duplication)
        const walletTxs = normalizedWalletTransactions
          .filter(t => {
            if (!t) return false;
            const description = String(t.description || t.transactionType || t.note || '').toLowerCase();
            const type = String(t.type || t.transactionType || '').toLowerCase();
            // Skip transactions that look like deposits (they come from deposit history)
            return !description.includes('nạp') && 
                   !type.includes('deposit') &&
                   !type.includes('nạp');
          })
          .map((t, index) => {
            try {
              // Handle transaction type safely
              let transactionType = 'transaction';
              if (t.transactionType && typeof t.transactionType === 'string') {
                transactionType = t.transactionType.toLowerCase();
              } else if (t.type && typeof t.type === 'string') {
                transactionType = t.type.toLowerCase();
              }

              // Improved categorization logic - include withdrawal fees
              const description = String(t.description || t.transactionType || t.note || '').toLowerCase();
              if (description.includes('rút tiền về') || description.includes('withdraw to') || description.includes('withdrawal to') || description.includes('phí rút tiền')) {
                transactionType = 'withdraw';
              } else if (description.includes('nạp') || description.includes('deposit')) {
                transactionType = 'deposit';
              }

              // Translate English descriptions to Vietnamese
              const translatedDescription = translateDescription(t.description || t.transactionType || t.note);

              // Handle status safely
              let statusValue = 'pending';
              if (typeof t.status === 'number') {
                statusValue = t.status === 1 ? 'success' : t.status === 0 ? 'pending' : 'failed';
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
                id: t.id || t.transactionId || `wallet_${index}_${Date.now()}`,
                type: transactionType,
                amount: parseFloat(t.amount) || 0,
                description: translatedDescription,
                date: t.createdAt || t.transactionDate || t.createdTime || new Date().toISOString(),
                status: statusValue
              };
              
              console.log('✅ Processed wallet transaction:', transaction);
              return transaction;
            } catch (err) {
              console.error('❌ Error processing wallet transaction:', err, t);
              return null;
            }
          })
          .filter(t => t !== null);

        console.log(`✅ Processed ${walletTxs.length} wallet transactions`);
        processedTransactions.push(...walletTxs);
      } catch (err) {
        console.error('❌ Error processing wallet transactions:', err);
      }

      try {
        console.log('🔄 Processing deposit history...');
        
        // Process deposit history
        const depositTxs = normalizedDepositHistory
          .map((d, index) => {
            try {
              if (!d) return null;
              
              // Handle status as number or string
              let statusText = '';
              let statusValue = 'pending';
              
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
                id: d.id || d.depositId || `deposit_${index}_${Date.now()}`,
                type: 'deposit',
                amount: parseFloat(d.amount) || 0,
                description: `Nạp tiền qua ${d.paymentGateway || 'PayOS'} ${statusText}`,
                date: d.createdTime || d.createdAt || d.requestTime || new Date().toISOString(),
                status: statusValue
              };
              
              console.log('✅ Processed deposit:', deposit);
              return deposit;
            } catch (err) {
              console.error('❌ Error processing deposit:', err, d);
              return null;
            }
          })
          .filter(d => d !== null);

        console.log(`✅ Processed ${depositTxs.length} deposits`);
        processedTransactions.push(...depositTxs);
      } catch (err) {
        console.error('❌ Error processing deposit history:', err);
      }

      try {
        console.log('🔄 Processing withdrawal history...');
        
        // Process withdrawal history
        const withdrawalTxs = normalizedWithdrawalHistory
          .map((w, index) => {
            try {
              if (!w) return null;
              
              // Handle status for withdrawals: 0 = pending, 1 = processing, 2 = completed, 3 = failed/rejected
              let statusValue = 'pending';
              let statusText = '';
              
              if (typeof w.status === 'number') {
                switch (w.status) {
                  case 0:
                    statusValue = 'pending';
                    statusText = '- Chờ xử lý';
                    break;
                  case 1:
                    statusValue = 'pending';
                    statusText = '- Đang xử lý';
                    break;
                  case 2:
                    statusValue = 'success';
                    statusText = '- Thành công';
                    break;
                  case 3:
                    statusValue = 'failed';
                    statusText = '- Từ chối';
                    break;
                  default:
                    statusValue = 'pending';
                    statusText = '- Đang xử lý';
                }
              } else if (typeof w.status === 'string') {
                const statusLower = w.status.toLowerCase();
                if (statusLower === 'completed' || statusLower === 'success') {
                  statusValue = 'success';
                  statusText = '- Thành công';
                } else if (statusLower === 'rejected' || statusLower === 'failed') {
                  statusValue = 'failed';
                  statusText = '- Từ chối';
                } else {
                  statusValue = 'pending';
                  statusText = '- Đang xử lý';
                }
              }

              const withdrawal = {
                id: w.id || w.withdrawalId || `withdrawal_${index}_${Date.now()}`,
                type: 'withdraw',
                amount: parseFloat(w.grossAmount || w.amount) || 0,
                description: `Rút tiền về ${w.bankAccount?.bankName || 'ngân hàng'} ${statusText}`,
                date: w.createdTime || w.createdAt || w.requestTime || new Date().toISOString(),
                status: statusValue
              };
              
              console.log('✅ Processed withdrawal:', withdrawal);
              return withdrawal;
            } catch (err) {
              console.error('❌ Error processing withdrawal:', err, w);
              return null;
            }
          })
          .filter(w => w !== null);

        console.log(`✅ Processed ${withdrawalTxs.length} withdrawals`);
        processedTransactions.push(...withdrawalTxs);
      } catch (err) {
        console.error('❌ Error processing withdrawal history:', err);
      }

      console.log(`📊 Total processed transactions: ${processedTransactions.length}`);

      // Sort by date (newest first)
      processedTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      console.log('✅ Final processed transactions:', processedTransactions);
      
      setTransactions(processedTransactions);
      
      // Success message
      console.log(`🎉 Successfully loaded ${processedTransactions.length} transactions`);
      
    } catch (err) {
      console.error('❌ Critical error in loadTransactionData:', err);
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
    if (type === 'deposit') return <HiDownload className="w-6 h-6" />;
    if (type === 'withdraw') return <HiUpload className="w-6 h-6" />;
    return <HiRefresh className="w-6 h-6" />;
  };

  const getAmountColor = (type) => {
    if (type === 'deposit') return 'text-emerald-600';
    if (type === 'withdraw') return 'text-rose-600';
    return 'text-blue-600';
  };

  const filterOptions = [
    { key: 'all', label: 'Tất cả', icon: <HiClipboardList className="w-5 h-5" /> },
    { key: 'deposit', label: 'Nạp tiền', icon: <HiArrowDown className="w-5 h-5" /> },
    { key: 'withdraw', label: 'Rút tiền', icon: <HiArrowUp className="w-5 h-5" /> },
    { key: 'transaction', label: 'Giao dịch khác', icon: <HiRefresh className="w-5 h-5" /> },
    { key: 'success', label: 'Thành công', icon: <HiCheck className="w-5 h-5" /> },
    { key: 'pending', label: 'Đang xử lý', icon: <HiClock className="w-5 h-5" /> },
    { key: 'failed', label: 'Thất bại', icon: <HiX className="w-5 h-5" /> }
  ];

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <HiClipboardList className="w-7 h-7 text-gray-600" />
          Lịch sử giao dịch
        </h2>
        <p className="text-gray-600">Xem tất cả các giao dịch đã thực hiện</p>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col lg:flex-row gap-6 justify-between">
        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((filterOption) => (
            <NoFocusOutLineButton
              key={filterOption.key}
              onClick={() => setFilter(filterOption.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                filter === filterOption.key
                  ? 'bg-gray-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filterOption.icon}
              <span>{filterOption.label}</span>
            </NoFocusOutLineButton>
          ))}
        </div>

        {/* Search Input */}
        <div className="w-full lg:w-80">
          <input
            type="text"
            placeholder="Tìm kiếm giao dịch..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-black transition-all focus:outline-none"
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
            <HiExclamation className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Lỗi tải dữ liệu</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <NoFocusOutLineButton
              onClick={loadTransactionData}
              className="px-6 py-3 bg-gray-600 text-white rounded-xl font-medium hover:bg-gray-700 transition-all"
            >
              Thử lại
            </NoFocusOutLineButton>
          </div>
        ) : currentTransactions.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {currentTransactions.map((transaction) => (
              <div key={transaction.id} className="p-6 hover:bg-gray-100 transition-colors duration-150">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${
                      transaction.type === 'deposit' ? 'bg-emerald-500' : 
                      transaction.type === 'withdraw' ? 'bg-rose-500' : 'bg-blue-500'
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
                      {transaction.type === 'deposit' ? '+' : 
                       transaction.type === 'withdraw' ? '-' : ''}{formatCurrency(transaction.amount)}
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
            <HiClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
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
          <NoFocusOutLineButton
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            Trước
          </NoFocusOutLineButton>
          
          <div className="flex gap-1">
            {[...Array(Math.min(5, totalPages))].map((_, index) => {
              const pageNumber = currentPage <= 3 ? index + 1 : currentPage - 2 + index;
              if (pageNumber > totalPages) return null;
              
              return (
                <NoFocusOutLineButton
                  key={pageNumber}
                  onClick={() => setCurrentPage(pageNumber)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    currentPage === pageNumber
                      ? 'bg-gray-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {pageNumber}
                </NoFocusOutLineButton>
              );
            })}
          </div>
          
          <NoFocusOutLineButton
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            Sau
          </NoFocusOutLineButton>
        </div>
      )}

      {/* Summary Stats */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <HiDownload className="w-8 h-8 text-emerald-600" />
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
              <HiUpload className="w-8 h-8 text-rose-600" />
              <span className="font-medium text-rose-800">Tổng rút</span>
            </div>
            <div className="text-2xl font-bold text-rose-600">
              {formatCurrency(
                filteredTransactions
                  .filter(t => t.type === 'withdraw' && t.status === 'success')
                  .reduce((sum, t) => sum + t.amount, 0)
              )}
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <HiChartBar className="w-8 h-8 text-blue-600" />
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