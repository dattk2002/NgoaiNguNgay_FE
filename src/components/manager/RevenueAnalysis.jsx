import React, { useState, useEffect } from 'react';
import NoFocusOutLineButton from '../../utils/noFocusOutlineButton';
import { managerRecentTransactions, managerRecentTransactionsMetadata } from '../api/auth';

const RevenueAnalysis = () => {
    const [dateFilter, setDateFilter] = useState('all'); // Changed from 'month' to 'all'
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [allTransactions, setAllTransactions] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [transactionsMetadata, setTransactionsMetadata] = useState(null);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTransactionTypeColor = (type) => {
        switch (type) {
            case 'Deposit': return 'bg-blue-100 text-blue-800';
            case 'Withdrawal': return 'bg-red-100 text-red-800';
            case 'Payment': return 'bg-green-100 text-green-800';
            case 'Refund': return 'bg-yellow-100 text-yellow-800';
            case 'Commission': return 'bg-purple-100 text-purple-800';
            case 'Fee': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getTransactionStatusColor = (status) => {
        switch (status) {
            case 'Success': return 'bg-green-100 text-green-800';
            case 'Pending': return 'bg-yellow-100 text-yellow-800';
            case 'Failed': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Function to get date range based on filter
    const getDateRange = (filter) => {
        const now = new Date();
        let startDate = new Date();
        
        switch (filter) {
            case 'week':
                startDate.setDate(now.getDate() - 7);
                break;
            case 'month':
                startDate.setDate(now.getDate() - 30);
                break;
            case 'quarter':
                startDate.setMonth(now.getMonth() - 3);
                break;
            case 'year':
                startDate.setFullYear(now.getFullYear() - 1);
                break;
            case 'all':
            default:
                // For 'all', return a very old date to include all transactions
                startDate = new Date('1970-01-01');
                break;
        }
        
        return { startDate, endDate: now };
    };

    // Function to filter transactions based on date range
    const filterTransactionsByDate = (transactions, dateFilter) => {
        if (!transactions || transactions.length === 0) return [];
        
        // If filter is 'all', return all transactions
        if (dateFilter === 'all') return transactions;
        
        const { startDate, endDate } = getDateRange(dateFilter);
        
        return transactions.filter(transaction => {
            const transactionDate = new Date(transaction.createdAt);
            return transactionDate >= startDate && transactionDate <= endDate;
        });
    };

    // Function to filter transactions by category
    const filterTransactionsByCategory = (transactions, category) => {
        if (category === 'all' || !transactions) return transactions;
        
        return transactions.filter(transaction => {
            // Assuming transaction has a category field, adjust based on your data structure
            return transaction.category === category || transaction.type === category;
        });
    };

    // Function to apply all filters
    const applyFilters = () => {
        let filtered = [...allTransactions];
        
        // Apply date filter
        filtered = filterTransactionsByDate(filtered, dateFilter);
        
        // Apply category filter
        filtered = filterTransactionsByCategory(filtered, selectedCategory);
        
        setFilteredTransactions(filtered);
        setCurrentPage(1); // Reset to first page when filters change
    };

    const fetchRecentTransactions = async (page = 1) => {
        try {
            setLoading(true);
            const [transactionsData, metadataData] = await Promise.all([
                managerRecentTransactions(page, pageSize),
                managerRecentTransactionsMetadata()
            ]);
            
            // Store all transactions for client-side filtering
            const transactions = transactionsData.items || [];
            setAllTransactions(transactions);
            setTransactionsMetadata(metadataData);
            
            // Set filtered transactions to all transactions initially
            setFilteredTransactions(transactions);
        } catch (error) {
            console.error('Failed to fetch recent transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecentTransactions(currentPage);
    }, []);

    // Apply filters when dateFilter or selectedCategory changes, but only if we have data
    useEffect(() => {
        if (allTransactions.length > 0) {
            applyFilters();
        }
    }, [dateFilter, selectedCategory, allTransactions]);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const handleDateFilterChange = (newDateFilter) => {
        setDateFilter(newDateFilter);
    };

    const handleCategoryChange = (newCategory) => {
        setSelectedCategory(newCategory);
    };

    // Calculate pagination for filtered results
    const getPaginatedTransactions = () => {
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        return filteredTransactions.slice(startIndex, endIndex);
    };

    const totalPages = Math.ceil(filteredTransactions.length / pageSize);
    const hasPreviousPage = currentPage > 1;
    const hasNextPage = currentPage < totalPages;
    const paginatedTransactions = getPaginatedTransactions();

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Khoảng thời gian</label>
                        <select
                            value={dateFilter}
                            onChange={(e) => handleDateFilterChange(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
                        >
                            <option value="all">Tất cả thời gian</option>
                            <option value="week">7 ngày qua</option>
                            <option value="month">30 ngày qua</option>
                            <option value="quarter">3 tháng qua</option>
                            <option value="year">12 tháng qua</option>
                        </select>
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Danh mục</label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => handleCategoryChange(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
                        >
                            <option value="all">Tất cả danh mục</option>
                            <option value="english">Tiếng Anh</option>
                            <option value="math">Toán học</option>
                            <option value="chinese">Tiếng Trung</option>
                            <option value="physics">Vật lý</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                        <NoFocusOutLineButton className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                            Xuất báo cáo
                        </NoFocusOutLineButton>
                    </div>
                </div>
            </div>

            {/* Recent Transactions Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Giao dịch gần đây</h3>
                    <div className="text-sm text-gray-500">
                        Tổng cộng: {filteredTransactions.length} giao dịch
                        {dateFilter && dateFilter !== 'all' && (
                            <span className="ml-2">
                                ({dateFilter === 'week' ? '7 ngày' : 
                                  dateFilter === 'month' ? '30 ngày' : 
                                  dateFilter === 'quarter' ? '3 tháng' : '12 tháng'} qua)
                            </span>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                        <span className="ml-2 text-gray-600">Đang tải...</span>
                    </div>
                ) : filteredTransactions.length > 0 ? (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Thời gian</th>
                                        <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Loại</th>
                                        <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Từ</th>
                                        <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Đến</th>
                                        <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Số tiền</th>
                                        <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Trạng thái</th>
                                        <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Mô tả</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedTransactions.map((transaction) => (
                                        <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-4 text-sm text-gray-900">
                                                {formatDate(transaction.createdAt)}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTransactionTypeColor(transaction.type)}`}>
                                                    {transaction.type}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-900 font-medium">
                                                {transaction.sourceUser}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-900 font-medium">
                                                {transaction.targetUser}
                                            </td>
                                            <td className="py-3 px-4 text-sm font-medium text-green-600">
                                                {formatCurrency(transaction.amount)}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTransactionStatusColor(transaction.status)}`}>
                                                    {transaction.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-600 max-w-xs truncate" title={transaction.description}>
                                                {transaction.description}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between mt-6">
                                <div className="text-sm text-gray-700">
                                    Hiển thị {((currentPage - 1) * pageSize) + 1} đến {Math.min(currentPage * pageSize, filteredTransactions.length)} trong tổng số {filteredTransactions.length} giao dịch
                                </div>
                                <div className="flex space-x-2">
                                    <NoFocusOutLineButton
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={!hasPreviousPage}
                                        className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Trước
                                    </NoFocusOutLineButton>
                                    <span className="px-3 py-1 text-sm text-gray-700">
                                        Trang {currentPage} / {totalPages}
                                    </span>
                                    <NoFocusOutLineButton
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={!hasNextPage}
                                        className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Sau
                                    </NoFocusOutLineButton>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        {loading ? 'Đang tải...' : 'Không có dữ liệu giao dịch'}
                    </div>
                )}
            </div>

            {/* Revenue Chart Placeholder */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Biểu đồ doanh thu theo thời gian</h3>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <p className="text-gray-500">Biểu đồ doanh thu sẽ được hiển thị ở đây</p>
                        <p className="text-sm text-gray-400 mt-1">Tích hợp với thư viện chart như Chart.js hoặc Recharts</p>
                    </div>
                </div>
            </div>

            {/* Category Analysis */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Phân tích theo danh mục</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                </div>
            </div>

            {/* Performance Insights */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin chi tiết</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <svg className="w-8 h-8 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            <div>
                                <p className="text-sm font-medium text-green-800">Danh mục tăng trưởng mạnh nhất</p>
                                <p className="text-lg font-bold text-green-900">Tiếng Trung (+22.1%)</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <svg className="w-8 h-8 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                            <div>
                                <p className="text-sm font-medium text-blue-800">Doanh thu cao nhất</p>
                                <p className="text-lg font-bold text-blue-900">Tiếng Anh</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <svg className="w-8 h-8 text-orange-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <p className="text-sm font-medium text-orange-800">Cần cải thiện</p>
                                <p className="text-lg font-bold text-orange-900">Vật lý (-3.2%)</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RevenueAnalysis; 