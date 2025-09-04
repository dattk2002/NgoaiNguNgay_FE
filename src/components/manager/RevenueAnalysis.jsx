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
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount) + ' VNĐ';
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
        <div className="space-y-4 lg:space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1">
                        <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-2">Khoảng thời gian</label>
                        <select
                            value={dateFilter}
                            onChange={(e) => handleDateFilterChange(e.target.value)}
                            className="w-full px-2 lg:px-3 py-1 lg:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-black text-xs lg:text-sm"
                        >
                            <option value="all">Tất cả thời gian</option>
                            <option value="week">7 ngày qua</option>
                            <option value="month">30 ngày qua</option>
                            <option value="quarter">3 tháng qua</option>
                            <option value="year">12 tháng qua</option>
                        </select>
                    </div>
                    <div className="flex-1">
                        <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-2">Danh mục</label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => handleCategoryChange(e.target.value)}
                            className="w-full px-2 lg:px-3 py-1 lg:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-black text-xs lg:text-sm"
                        >
                            <option value="all">Tất cả danh mục</option>
                            <option value="english">Tiếng Anh</option>
                            <option value="math">Toán học</option>
                            <option value="chinese">Tiếng Trung</option>
                            <option value="physics">Vật lý</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                        <NoFocusOutLineButton className="px-3 lg:px-4 py-1 lg:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs lg:text-sm">
                            Xuất báo cáo
                        </NoFocusOutLineButton>
                    </div>
                </div>
            </div>

            {/* Recent Transactions Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
                    <h3 className="text-base lg:text-lg font-medium text-gray-900">Giao dịch gần đây</h3>
                    <div className="text-xs lg:text-sm text-gray-500">
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
                    <div className="flex items-center justify-center py-6 lg:py-8">
                        <div className="animate-spin rounded-full h-6 w-6 lg:h-8 lg:w-8 border-b-2 border-green-600"></div>
                        <span className="ml-2 text-gray-600 text-sm lg:text-base">Đang tải...</span>
                    </div>
                ) : filteredTransactions.length > 0 ? (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-2 lg:py-3 px-2 lg:px-4 font-medium text-gray-500 text-xs lg:text-sm">Thời gian</th>
                                        <th className="text-left py-2 lg:py-3 px-2 lg:px-4 font-medium text-gray-500 text-xs lg:text-sm">Loại</th>
                                        <th className="text-left py-2 lg:py-3 px-2 lg:px-4 font-medium text-gray-500 text-xs lg:text-sm hidden sm:table-cell">Từ</th>
                                        <th className="text-left py-2 lg:py-3 px-2 lg:px-4 font-medium text-gray-500 text-xs lg:text-sm hidden md:table-cell">Đến</th>
                                        <th className="text-left py-2 lg:py-3 px-2 lg:px-4 font-medium text-gray-500 text-xs lg:text-sm">Số tiền</th>
                                        <th className="text-left py-2 lg:py-3 px-2 lg:px-4 font-medium text-gray-500 text-xs lg:text-sm">Trạng thái</th>
                                        <th className="text-left py-2 lg:py-3 px-2 lg:px-4 font-medium text-gray-500 text-xs lg:text-sm hidden lg:table-cell">Mô tả</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedTransactions.map((transaction) => (
                                        <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-2 lg:py-3 px-2 lg:px-4 text-xs lg:text-sm text-gray-900">
                                                {formatDate(transaction.createdAt)}
                                            </td>
                                            <td className="py-2 lg:py-3 px-2 lg:px-4">
                                                <span className={`inline-flex items-center px-1.5 lg:px-2.5 py-0.5 rounded-full text-xs font-medium ${getTransactionTypeColor(transaction.type)}`}>
                                                    {transaction.type}
                                                </span>
                                            </td>
                                            <td className="py-2 lg:py-3 px-2 lg:px-4 text-xs lg:text-sm text-gray-900 font-medium hidden sm:table-cell">
                                                {transaction.sourceUser}
                                            </td>
                                            <td className="py-2 lg:py-3 px-2 lg:px-4 text-xs lg:text-sm text-gray-900 font-medium hidden md:table-cell">
                                                {transaction.targetUser}
                                            </td>
                                            <td className="py-2 lg:py-3 px-2 lg:px-4 text-xs lg:text-sm font-medium text-green-600">
                                                {formatCurrency(transaction.amount)}
                                            </td>
                                            <td className="py-2 lg:py-3 px-2 lg:px-4">
                                                <span className={`inline-flex items-center px-1.5 lg:px-2.5 py-0.5 rounded-full text-xs font-medium ${getTransactionStatusColor(transaction.status)}`}>
                                                    {transaction.status}
                                                </span>
                                            </td>
                                            <td className="py-2 lg:py-3 px-2 lg:px-4 text-xs lg:text-sm text-gray-600 max-w-xs truncate hidden lg:table-cell" title={transaction.description}>
                                                {transaction.description}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 lg:mt-6 space-y-3 sm:space-y-0">
                                <div className="text-xs lg:text-sm text-gray-700">
                                    Hiển thị {((currentPage - 1) * pageSize) + 1} đến {Math.min(currentPage * pageSize, filteredTransactions.length)} trong tổng số {filteredTransactions.length} giao dịch
                                </div>
                                <div className="flex space-x-2">
                                    <NoFocusOutLineButton
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={!hasPreviousPage}
                                        className="px-2 lg:px-3 py-1 text-xs lg:text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Trước
                                    </NoFocusOutLineButton>
                                    <span className="px-2 lg:px-3 py-1 text-xs lg:text-sm text-gray-700">
                                        Trang {currentPage} / {totalPages}
                                    </span>
                                    <NoFocusOutLineButton
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={!hasNextPage}
                                        className="px-2 lg:px-3 py-1 text-xs lg:text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Sau
                                    </NoFocusOutLineButton>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-6 lg:py-8 text-gray-500">
                        <div className="text-sm lg:text-base">
                            {loading ? 'Đang tải...' : 'Không có dữ liệu giao dịch'}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RevenueAnalysis; 