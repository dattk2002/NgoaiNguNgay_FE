import React, { useState, useEffect } from 'react';
import { 
    managerHeldFunds, 
    managerHeldFundsStatistics, 
    managerHeldFundsMetadata, 
    managerHeldFundsStatisticsMetadata 
} from '../api/auth';

const HeldFundsSummary = () => {
    const [heldFundsData, setHeldFundsData] = useState(null);
    const [statisticsData, setStatisticsData] = useState(null);
    const [heldFundsMetadata, setHeldFundsMetadata] = useState(null);
    const [statisticsMetadata, setStatisticsMetadata] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTimeRange, setSelectedTimeRange] = useState(5); // Default to "All"
    const [showMetadata, setShowMetadata] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                // Fetch all data in parallel
                const [heldFundsResponse, statisticsResponse, metadataResponse, statisticsMetadataResponse] = await Promise.all([
                    managerHeldFunds(),
                    managerHeldFundsStatistics(selectedTimeRange),
                    managerHeldFundsMetadata(),
                    managerHeldFundsStatisticsMetadata()
                ]);
                
                setHeldFundsData(heldFundsResponse);
                setStatisticsData(statisticsResponse);
                setHeldFundsMetadata(metadataResponse);
                setStatisticsMetadata(statisticsMetadataResponse);
                
                setError(null);
            } catch (err) {
                console.error('Failed to fetch held funds data:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedTimeRange]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount) + ' VNĐ';
    };

    const formatNumber = (number) => {
        return new Intl.NumberFormat('vi-VN').format(number);
    };

    // Get time range options from metadata
    const getTimeRangeOptions = () => {
        if (statisticsMetadata?.TimeRange) {
            return statisticsMetadata.TimeRange.map(range => ({
                value: range.numericValue,
                label: range.name === 'Day' ? 'Ngày' :
                       range.name === 'Week' ? 'Tuần' :
                       range.name === 'Month' ? 'Tháng' :
                       range.name === 'HalfYear' ? '6 tháng' :
                       range.name === 'Year' ? 'Năm' :
                       range.name === 'All' ? 'Tất cả' : range.name
            }));
        }
        // Fallback options if metadata is not available
        return [
            { value: 0, label: 'Ngày' },
            { value: 1, label: 'Tuần' },
            { value: 2, label: 'Tháng' },
            { value: 3, label: '6 tháng' },
            { value: 4, label: 'Năm' },
            { value: 5, label: 'Tất cả' }
        ];
    };

    // Get status description from metadata
    const getStatusDescription = (statusName) => {
        if (heldFundsMetadata?.HeldFundStatus) {
            const status = heldFundsMetadata.HeldFundStatus.find(s => s.name === statusName);
            return status?.description || statusName;
        }
        return statusName;
    };

    // Get type description from metadata
    const getTypeDescription = (typeName) => {
        if (heldFundsMetadata?.HeldFundType) {
            const type = heldFundsMetadata.HeldFundType.find(t => t.name === typeName);
            return type?.description || typeName;
        }
        return typeName;
    };

    // Get component description from metadata
    const getComponentDescription = (componentName) => {
        if (heldFundsMetadata?.HeldFundComponents) {
            return heldFundsMetadata.HeldFundComponents[componentName] || componentName;
        }
        return componentName;
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

    if (!heldFundsData) {
        return (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <span className="text-yellow-800">Không có dữ liệu tiền giữ</span>
            </div>
        );
    }

    const timeRangeOptions = getTimeRangeOptions();

    return (
        <div className="space-y-6">
            {/* Header with Time Range Selector and Metadata Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Thống kê tiền giữ</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Tổng hợp tiền đang được giữ trong ví
                    </p>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <label htmlFor="timeRange" className="text-sm font-medium text-gray-700">
                            Thời gian:
                        </label>
                        <select
                            id="timeRange"
                            value={selectedTimeRange}
                            onChange={(e) => setSelectedTimeRange(parseInt(e.target.value))}
                            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                            {timeRangeOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={() => setShowMetadata(!showMetadata)}
                        className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                    >
                        {showMetadata ? 'Ẩn giải thích' : 'Hiển thị giải thích'}
                    </button>
                </div>
            </div>

            {/* Metadata Information Panel */}
            {showMetadata && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4">Giải thích dữ liệu</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Held Fund Statuses */}
                        <div>
                            <h4 className="font-medium text-blue-800 mb-2">Trạng thái tiền giữ:</h4>
                            <div className="space-y-2">
                                {heldFundsMetadata?.HeldFundStatus?.map((status) => (
                                    <div key={status.name} className="text-sm">
                                        <span className="font-medium text-gray-700">{status.name}:</span>
                                        <span className="text-gray-600 ml-2">{status.description}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        {/* Held Fund Types */}
                        <div>
                            <h4 className="font-medium text-blue-800 mb-2">Loại tiền giữ:</h4>
                            <div className="space-y-2">
                                {heldFundsMetadata?.HeldFundType?.map((type) => (
                                    <div key={type.name} className="text-sm">
                                        <span className="font-medium text-gray-700">{type.name}:</span>
                                        <span className="text-gray-600 ml-2">{type.description}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Held Amount */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">
                                {getComponentDescription('totalHeldAmount')}
                            </p>
                            <p className="text-xl font-semibold text-gray-900">{formatCurrency(heldFundsData.totalHeldAmount)}</p>
                        </div>
                    </div>
                </div>

                {/* Total Disputed Amount */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">
                                {getComponentDescription('totalDisputedAmount')}
                            </p>
                            <p className="text-xl font-semibold text-gray-900">{formatCurrency(heldFundsData.totalDisputedAmount)}</p>
                        </div>
                    </div>
                </div>

                {/* Total Held Funds Count */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">
                                {getComponentDescription('totalHeldFundsCount')}
                            </p>
                            <p className="text-xl font-semibold text-gray-900">{formatNumber(heldFundsData.totalHeldFundsCount)}</p>
                        </div>
                    </div>
                </div>

                {/* Statistics Data (if available) */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Thống kê {timeRangeOptions.find(opt => opt.value === selectedTimeRange)?.label}</p>
                            <p className="text-xl font-semibold text-gray-900">
                                {statisticsData ? formatCurrency(statisticsData.totalAmount || 0) : 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Held Amount by Type */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        {getComponentDescription('heldAmountByType')}
                    </h3>
                    <div className="space-y-4">
                        {Object.entries(heldFundsData.heldAmountByType).map(([type, amount]) => (
                            <div key={type} className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-700">
                                            {type === 'BookingPayment' ? 'Thanh toán buổi học' : 'Rút tiền'}
                                        </span>
                                        {showMetadata && (
                                            <div className="text-xs text-gray-500 mt-1">
                                                {getTypeDescription(type)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-semibold text-gray-900">{formatCurrency(amount)}</div>
                                    <div className="text-xs text-gray-500">{formatNumber(heldFundsData.heldCountByType[type])} giao dịch</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Held Amount by Status */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        {getComponentDescription('heldAmountByStatus')}
                    </h3>
                    <div className="space-y-4">
                        {Object.entries(heldFundsData.heldAmountByStatus).map(([status, amount]) => {
                            const getStatusColor = (status) => {
                                switch (status) {
                                    case 'Held': return 'bg-orange-500';
                                    case 'ReleasedToTutor': return 'bg-green-500';
                                    case 'ReleasedToTutorBank': return 'bg-blue-500';
                                    case 'RefundedToLearner': return 'bg-purple-500';
                                    case 'Disputed': return 'bg-red-500';
                                    default: return 'bg-gray-500';
                                }
                            };

                            const getStatusLabel = (status) => {
                                switch (status) {
                                    case 'Held': return 'Đang giữ';
                                    case 'ReleasedToTutor': return 'Đã chuyển cho gia sư';
                                    case 'ReleasedToTutorBank': return 'Đã chuyển về ngân hàng';
                                    case 'RefundedToLearner': return 'Đã hoàn trả học viên';
                                    case 'Disputed': return 'Đang tranh chấp';
                                    default: return status;
                                }
                            };

                            return (
                                <div key={status} className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className={`w-3 h-3 ${getStatusColor(status)} rounded-full mr-3`}></div>
                                        <div>
                                            <span className="text-sm font-medium text-gray-700">{getStatusLabel(status)}</span>
                                            {showMetadata && (
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {getStatusDescription(status)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-semibold text-gray-900">{formatCurrency(amount)}</div>
                                        <div className="text-xs text-gray-500">{formatNumber(heldFundsData.heldCountByStatus[status])} giao dịch</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Statistics Chart Section (if statistics data is available) */}
            {statisticsData && (
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Thống kê chi tiết - {timeRangeOptions.find(opt => opt.value === selectedTimeRange)?.label}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(statisticsData).map(([key, value]) => {
                            if (typeof value === 'number' && key !== 'totalAmount') {
                                const componentDescription = statisticsMetadata?.HeldFundStatisticsComponents?.[key];
                                return (
                                    <div key={key} className="bg-gray-50 rounded-lg p-4">
                                        <div className="text-sm font-medium text-gray-600 capitalize">
                                            {key.replace(/([A-Z])/g, ' $1').trim()}
                                        </div>
                                        {showMetadata && componentDescription && (
                                            <div className="text-xs text-gray-500 mt-1">
                                                {componentDescription}
                                            </div>
                                        )}
                                        <div className="text-lg font-semibold text-gray-900 mt-1">
                                            {key.toLowerCase().includes('amount') ? formatCurrency(value) : formatNumber(value)}
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default HeldFundsSummary;
