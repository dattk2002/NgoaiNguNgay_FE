import React, { useState, useEffect } from 'react';
import { managerTransactionSummary, managerTransactionSummaryMetadata } from '../api/auth';

const TransactionSummary = () => {
    const [transactionData, setTransactionData] = useState(null);
    const [metadata, setMetadata] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dateRange, setDateRange] = useState({
        fromDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
        toDate: new Date().toISOString().split('T')[0] // Today
    });
    // Add display states for formatted dates
    const [displayDates, setDisplayDates] = useState({
        fromDate: '',
        toDate: ''
    });

    useEffect(() => {
        // Initialize display dates
        updateDisplayDates(dateRange.fromDate, dateRange.toDate);
        fetchData();
    }, []); // Only run on mount

    // Function to format date to dd/mm/yyyy
    const formatDateToDisplay = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    // Function to update display dates
    const updateDisplayDates = (fromDate, toDate) => {
        setDisplayDates({
            fromDate: formatDateToDisplay(fromDate),
            toDate: formatDateToDisplay(toDate)
        });
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            
            // Fetch both transaction data and metadata in parallel
            const [transactionResponse, metadataResponse] = await Promise.all([
                managerTransactionSummary(dateRange.fromDate, dateRange.toDate),
                managerTransactionSummaryMetadata()
            ]);
            
            setTransactionData(transactionResponse);
            setMetadata(metadataResponse);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch transaction data:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount) + ' VNĐ';
    };

    const handleDateChange = (field, value) => {
        setDateRange(prev => ({
            ...prev,
            [field]: value
        }));
        // Update display date immediately
        if (field === 'fromDate') {
            setDisplayDates(prev => ({
                ...prev,
                fromDate: formatDateToDisplay(value)
            }));
        } else {
            setDisplayDates(prev => ({
                ...prev,
                toDate: formatDateToDisplay(value)
            }));
        }
    };

    const handleRefreshData = () => {
        fetchData();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="text-red-800">Lỗi khi tải dữ liệu: {error}</span>
                </div>
            </div>
        );
    }

    if (!transactionData || !metadata) {
        return (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <span className="text-yellow-800">Không có dữ liệu giao dịch hoặc metadata</span>
            </div>
        );
    }

    return (
        <div className="space-y-4 lg:space-y-6">
            {/* Date Range Filter */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
                <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-3 lg:mb-4">Bộ lọc thời gian</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-2">Từ ngày</label>
                        <input
                            type="date"
                            value={dateRange.fromDate}
                            onChange={(e) => handleDateChange('fromDate', e.target.value)}
                            className="w-full px-2 lg:px-3 py-1 lg:py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-xs lg:text-sm"
                        />
                        {displayDates.fromDate && (
                            <p className="text-xs lg:text-sm text-gray-500 mt-1">Đã chọn: {displayDates.fromDate}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-2">Đến ngày</label>
                        <input
                            type="date"
                            value={dateRange.toDate}
                            onChange={(e) => handleDateChange('toDate', e.target.value)}
                            className="w-full px-2 lg:px-3 py-1 lg:py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-xs lg:text-sm"
                        />
                        {displayDates.toDate && (
                            <p className="text-xs lg:text-sm text-gray-500 mt-1">Đã chọn: {displayDates.toDate}</p>
                        )}
                    </div>
                    <div className="flex items-start">
                        <button
                            onClick={handleRefreshData}
                            className="w-full px-3 lg:px-4 py-1 lg:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors mt-4 lg:mt-6 text-xs lg:text-sm"
                        >
                            Tra cứu giao dịch
                        </button>
                    </div>
                </div>
            </div>

            {/* Transaction Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {/* Total Deposit Amount */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-3 lg:ml-4 min-w-0 flex-1">
                            <p className="text-xs lg:text-sm font-medium text-gray-600">Tổng nạp tiền</p>
                            <p className="text-lg lg:text-xl font-semibold text-gray-900 truncate">{formatCurrency(transactionData.totalDepositAmount)}</p>
                        </div>
                    </div>
                </div>

                {/* Total Withdrawal Amount */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-3 lg:ml-4 min-w-0 flex-1">
                            <p className="text-xs lg:text-sm font-medium text-gray-600">Tổng rút tiền</p>
                            <p className="text-lg lg:text-xl font-semibold text-gray-900 truncate">{formatCurrency(transactionData.totalWithdrawalAmount)}</p>
                        </div>
                    </div>
                </div>

                {/* Total Payment Amount */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-3 lg:ml-4 min-w-0 flex-1">
                            <p className="text-xs lg:text-sm font-medium text-gray-600">Tổng thanh toán</p>
                            <p className="text-lg lg:text-xl font-semibold text-gray-900 truncate">{formatCurrency(transactionData.totalPaymentAmount)}</p>
                        </div>
                    </div>
                </div>

                {/* Total Transaction Count */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-3 lg:ml-4 min-w-0 flex-1">
                            <p className="text-xs lg:text-sm font-medium text-gray-600">Tổng giao dịch</p>
                            <p className="text-lg lg:text-xl font-semibold text-gray-900">{transactionData.totalTransactionCount}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Additional Transaction Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {/* Total Refund Amount */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-3 lg:ml-4 min-w-0 flex-1">
                            <p className="text-xs lg:text-sm font-medium text-gray-600">Tổng hoàn tiền</p>
                            <p className="text-lg lg:text-xl font-semibold text-gray-900 truncate">{formatCurrency(transactionData.totalRefundAmount)}</p>
                        </div>
                    </div>
                </div>

                {/* Total Commission Amount */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-3 lg:ml-4 min-w-0 flex-1">
                            <p className="text-xs lg:text-sm font-medium text-gray-600">Tổng hoa hồng</p>
                            <p className="text-lg lg:text-xl font-semibold text-gray-900 truncate">{formatCurrency(transactionData.totalCommissionAmount)}</p>
                        </div>
                    </div>
                </div>

                {/* Total Fee Amount */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-3 lg:ml-4 min-w-0 flex-1">
                            <p className="text-xs lg:text-sm font-medium text-gray-600">Tổng phí</p>
                            <p className="text-lg lg:text-xl font-semibold text-gray-900 truncate">{formatCurrency(transactionData.totalFeeAmount)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Transaction Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                {/* Transaction Count by Type */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
                    <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-3 lg:mb-4">Số lượng giao dịch theo loại</h3>
                    <div className="space-y-2 lg:space-y-3">
                        {transactionData.transactionCountByType && 
                            Object.entries(transactionData.transactionCountByType).map(([type, count]) => (
                                <div key={type} className="flex items-center justify-between p-2 lg:p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center min-w-0 flex-1">
                                        <div className={`w-3 h-3 rounded-full mr-2 lg:mr-3 flex-shrink-0 ${
                                            type === 'Deposit' ? 'bg-green-500' :
                                            type === 'Withdrawal' ? 'bg-red-500' :
                                            type === 'Payment' ? 'bg-blue-500' :
                                            type === 'Refund' ? 'bg-yellow-500' :
                                            type === 'Commission' ? 'bg-indigo-500' : 'bg-orange-500'
                                        }`}></div>
                                        <span className="text-xs lg:text-sm font-medium text-gray-900 truncate">{type}</span>
                                    </div>
                                    <div className="text-xs lg:text-sm font-medium text-gray-600 flex-shrink-0 ml-2">{count}</div>
                                </div>
                            ))
                        }
                    </div>
                </div>

                {/* Transaction Amount by Type */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
                    <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-3 lg:mb-4">Số tiền giao dịch theo loại</h3>
                    <div className="space-y-2 lg:space-y-3">
                        {transactionData.transactionAmountByType && 
                            Object.entries(transactionData.transactionAmountByType).map(([type, amount]) => (
                                <div key={type} className="flex items-center justify-between p-2 lg:p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center min-w-0 flex-1">
                                        <div className={`w-3 h-3 rounded-full mr-2 lg:mr-3 flex-shrink-0 ${
                                            type === 'Deposit' ? 'bg-green-500' :
                                            type === 'Withdrawal' ? 'bg-red-500' :
                                            type === 'Payment' ? 'bg-blue-500' :
                                            type === 'Refund' ? 'bg-yellow-500' :
                                            type === 'Commission' ? 'bg-indigo-500' : 'bg-orange-500'
                                        }`}></div>
                                        <span className="text-xs lg:text-sm font-medium text-gray-900 truncate">{type}</span>
                                    </div>
                                    <div className="text-xs lg:text-sm font-medium text-gray-600 flex-shrink-0 ml-2 truncate">{formatCurrency(amount)}</div>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>

            {/* Transaction Summary Components Explanation */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
                <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-3 lg:mb-4">Giải thích các thành phần tổng hợp giao dịch</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
                    {metadata.TransactionSummaryComponents && 
                        Object.entries(metadata.TransactionSummaryComponents).map(([key, description]) => (
                            <div key={key} className="p-3 lg:p-4 bg-gray-50 rounded-lg">
                                <h4 className="text-xs lg:text-sm font-medium text-gray-900 mb-1 lg:mb-2">
                                    {key === 'totalDepositAmount' && 'Tổng nạp tiền'}
                                    {key === 'totalWithdrawalAmount' && 'Tổng rút tiền'}
                                    {key === 'totalPaymentAmount' && 'Tổng thanh toán'}
                                    {key === 'totalRefundAmount' && 'Tổng hoàn tiền'}
                                    {key === 'totalCommissionAmount' && 'Tổng hoa hồng'}
                                    {key === 'totalFeeAmount' && 'Tổng phí'}
                                    {key === 'transactionCountByType' && 'Số lượng theo loại'}
                                    {key === 'transactionAmountByType' && 'Số tiền theo loại'}
                                </h4>
                                <p className="text-xs text-gray-600 leading-relaxed">{description}</p>
                            </div>
                        ))
                    }
                </div>
            </div>

            {/* Transaction Summary Overview */}
            <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-lg p-4 lg:p-6 text-white">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                    <div className="min-w-0 flex-1">
                        <h3 className="text-base lg:text-lg font-medium mb-1 lg:mb-2">Tổng quan giao dịch</h3>
                        <p className="text-xs lg:text-sm opacity-90">
                            {transactionData.totalTransactionCount} giao dịch trong khoảng thời gian đã chọn
                        </p>
                    </div>
                    <div className="text-left sm:text-right flex-shrink-0">
                        <div className="text-xl lg:text-2xl font-bold break-words">{formatCurrency(transactionData.totalPaymentAmount)}</div>
                        <div className="text-xs lg:text-sm opacity-90">Tổng thanh toán</div>
                    </div>
                </div>
            </div>

            {/* Information Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 lg:p-4">
                <div className="flex items-start">
                    <svg className="w-4 h-4 lg:w-5 lg:h-5 text-blue-400 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div className="min-w-0 flex-1">
                        <h4 className="text-xs lg:text-sm font-medium text-blue-900 mb-1">Lưu ý về tổng hợp giao dịch</h4>
                        <p className="text-xs lg:text-sm text-blue-700 leading-relaxed">
                            Dữ liệu giao dịch được cập nhật theo thời gian thực. Các định nghĩa loại giao dịch và trạng thái được lấy từ metadata API 
                            để đảm bảo tính nhất quán và chính xác trong báo cáo giao dịch.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransactionSummary;