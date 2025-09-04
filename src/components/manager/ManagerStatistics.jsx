import React, { useState, useEffect } from 'react';
import { 
  managerTransactionStatistics, 
  managerTransactionStatisticsMetadata,
  managerSystemRevenue,
  managerSystemRevenueMetadata
} from '../api/auth';
import NoFocusOutLineButton from '../../utils/noFocusOutlineButton';
import formatPriceWithCommas from '../../utils/formatPriceWithCommas';

const ManagerStatistics = () => {
  const [statisticsData, setStatisticsData] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [systemRevenueData, setSystemRevenueData] = useState(null);
  const [systemRevenueMetadata, setSystemRevenueMetadata] = useState(null);
  const [timeRange, setTimeRange] = useState(5); // Default to "All"
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [statsResponse, metadataResponse, revenueResponse, revenueMetadataResponse] = await Promise.all([
        managerTransactionStatistics(timeRange),
        managerTransactionStatisticsMetadata(),
        managerSystemRevenue(timeRange),
        managerSystemRevenueMetadata()
      ]);

      setStatisticsData(statsResponse);
      setMetadata(metadataResponse);
      setSystemRevenueData(revenueResponse);
      setSystemRevenueMetadata(revenueMetadataResponse);
    } catch (err) {
      console.error('Failed to fetch statistics data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getTimeRangeOptions = () => {
    if (metadata?.TimeRange) {
      return metadata.TimeRange.map(range => ({
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

  const getTransactionTypeDescription = (typeName) => {
    if (!metadata?.TransactionType) return typeName;
    const typeItem = metadata.TransactionType.find(item => item.name === typeName);
    return typeItem ? typeItem.description : typeName;
  };

  const getTransactionStatusDescription = (statusName) => {
    if (!metadata?.TransactionStatus) return statusName;
    const statusItem = metadata.TransactionStatus.find(item => item.name === statusName);
    return statusItem ? statusItem.description : statusName;
  };

  const getSystemRevenueComponentDescription = (componentName) => {
    if (!systemRevenueMetadata?.SystemRevenueComponents) return componentName;
    return systemRevenueMetadata.SystemRevenueComponents[componentName] || componentName;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
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
          <svg className="w-6 h-6 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="text-lg font-medium text-red-800">Error Loading Statistics</h3>
            <p className="text-red-600 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!statisticsData || !metadata || !systemRevenueData || !systemRevenueMetadata) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-center">
          <svg className="w-6 h-6 text-yellow-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div>
            <h3 className="text-lg font-medium text-yellow-800">No Data Available</h3>
            <p className="text-yellow-600 mt-1">Statistics data is not available for the selected time range.</p>
          </div>
        </div>
      </div>
    );
  }

  const timeRangeOptions = getTimeRangeOptions();

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header with Time Range Selector */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 mb-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg lg:text-2xl font-bold text-gray-900">Thống kê giao dịch & Doanh thu hệ thống</h2>
            <p className="text-sm lg:text-base text-gray-600 mt-1">
              {metadata?.TransactionStatisticsComponents?.totalTransactionCount}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
            <div className="flex items-center space-x-2">
              <label className="text-xs lg:text-sm font-medium text-gray-700">Thời gian:</label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(parseInt(e.target.value))}
                className="border border-gray-300 rounded-md px-2 lg:px-3 py-1 lg:py-2 text-xs lg:text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                {timeRangeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <NoFocusOutLineButton
              onClick={fetchData}
              className="bg-green-600 text-white px-3 lg:px-4 py-1 lg:py-2 rounded-md text-xs lg:text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Làm mới
            </NoFocusOutLineButton>
          </div>
        </div>

        {/* Transaction Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-4 lg:mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 lg:p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-blue-100 text-xs lg:text-sm font-medium">Tổng giao dịch</p>
                <p className="text-xl lg:text-3xl font-bold truncate">{statisticsData.totalTransactionCount?.toLocaleString()}</p>
              </div>
              <div className="bg-blue-400 rounded-full p-2 lg:p-3 flex-shrink-0">
                <svg className="w-4 h-4 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 lg:p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-green-100 text-xs lg:text-sm font-medium">Tổng giá trị</p>
                <p className="text-xl lg:text-3xl font-bold truncate">{formatPriceWithCommas(statisticsData.totalTransactionAmount)}</p>
              </div>
              <div className="bg-green-400 rounded-full p-2 lg:p-3 flex-shrink-0">
                <svg className="w-4 h-4 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 lg:p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-purple-100 text-xs lg:text-sm font-medium">Thành công</p>
                <p className="text-xl lg:text-3xl font-bold truncate">{statisticsData.countByStatus?.Success?.toLocaleString() || 0}</p>
              </div>
              <div className="bg-purple-400 rounded-full p-2 lg:p-3 flex-shrink-0">
                <svg className="w-4 h-4 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 lg:p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-orange-100 text-xs lg:text-sm font-medium">Đang chờ</p>
                <p className="text-xl lg:text-3xl font-bold truncate">{statisticsData.countByStatus?.Pending?.toLocaleString() || 0}</p>
              </div>
              <div className="bg-orange-400 rounded-full p-2 lg:p-3 flex-shrink-0">
                <svg className="w-4 h-4 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* System Revenue Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg p-4 lg:p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-indigo-100 text-xs lg:text-sm font-medium">Tổng doanh thu</p>
                <p className="text-xl lg:text-3xl font-bold truncate">{formatPriceWithCommas(systemRevenueData.totalRevenue)}</p>
              </div>
              <div className="bg-indigo-400 rounded-full p-2 lg:p-3 flex-shrink-0">
                <svg className="w-4 h-4 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg p-4 lg:p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-teal-100 text-xs lg:text-sm font-medium">Tổng phí dịch vụ</p>
                <p className="text-xl lg:text-3xl font-bold truncate">{formatPriceWithCommas(systemRevenueData.totalFees)}</p>
              </div>
              <div className="bg-teal-400 rounded-full p-2 lg:p-3 flex-shrink-0">
                <svg className="w-4 h-4 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-pink-500 to-pink-600 rounded-lg p-4 lg:p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-pink-100 text-xs lg:text-sm font-medium">Tổng hoa hồng</p>
                <p className="text-xl lg:text-3xl font-bold truncate">{formatPriceWithCommas(systemRevenueData.totalCommission)}</p>
              </div>
              <div className="bg-pink-400 rounded-full p-2 lg:p-3 flex-shrink-0">
                <svg className="w-4 h-4 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-lg p-4 lg:p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-cyan-100 text-xs lg:text-sm font-medium">Số dư ví hệ thống</p>
                <p className="text-xl lg:text-3xl font-bold truncate">{formatPriceWithCommas(systemRevenueData.systemWalletBalance)}</p>
              </div>
              <div className="bg-cyan-400 rounded-full p-2 lg:p-3 flex-shrink-0">
                <svg className="w-4 h-4 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Types and System Revenue Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
          <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-3 lg:mb-4">
            {metadata?.TransactionStatisticsComponents?.countByType}
          </h3>
          <div className="space-y-3 lg:space-y-4">
            {statisticsData.countByType && Object.entries(statisticsData.countByType).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between p-2 lg:p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2 lg:space-x-3 min-w-0 flex-1">
                  <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 text-sm lg:text-base truncate">{type}</p>
                    <p className="text-xs lg:text-sm text-gray-500 truncate">{getTransactionTypeDescription(type)}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className="font-semibold text-gray-900 text-sm lg:text-base">{count.toLocaleString()}</p>
                  <p className="text-xs lg:text-sm text-gray-500">
                    {formatPriceWithCommas(statisticsData.amountByType?.[type] || 0)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
          <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-3 lg:mb-4">
            {metadata?.TransactionStatisticsComponents?.countByStatus}
          </h3>
          <div className="space-y-3 lg:space-y-4">
            {statisticsData.countByStatus && Object.entries(statisticsData.countByStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between p-2 lg:p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2 lg:space-x-3 min-w-0 flex-1">
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                    status === 'Success' ? 'bg-green-500' : 
                    status === 'Pending' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 text-sm lg:text-base truncate">{status}</p>
                    <p className="text-xs lg:text-sm text-gray-500 truncate">{getTransactionStatusDescription(status)}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className="font-semibold text-gray-900 text-sm lg:text-base">{count.toLocaleString()}</p>
                  <p className="text-xs lg:text-sm text-gray-500">
                    {formatPriceWithCommas(statisticsData.amountByStatus?.[status] || 0)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
          <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-3 lg:mb-4">
            {getSystemRevenueComponentDescription('revenueByType')}
          </h3>
          <div className="space-y-3 lg:space-y-4">
            {systemRevenueData.revenueByType && Object.entries(systemRevenueData.revenueByType).map(([type, amount]) => (
              <div key={type} className="flex items-center justify-between p-2 lg:p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2 lg:space-x-3 min-w-0 flex-1">
                  <div className="w-3 h-3 bg-indigo-500 rounded-full flex-shrink-0"></div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 text-sm lg:text-base truncate">{type}</p>
                    <p className="text-xs lg:text-sm text-gray-500 truncate">Loại doanh thu</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className="font-semibold text-gray-900 text-sm lg:text-base">{formatPriceWithCommas(amount)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Daily Statistics Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
          <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-3 lg:mb-4">
            Thống kê giao dịch theo ngày
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 lg:px-6 py-2 lg:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày
                  </th>
                  <th className="px-3 lg:px-6 py-2 lg:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số lượng giao dịch
                  </th>
                  <th className="px-3 lg:px-6 py-2 lg:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tổng giá trị
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {statisticsData.countByDay && Object.entries(statisticsData.countByDay)
                  .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
                  .slice(0, 7) // Show only last 7 days
                  .map(([date, count]) => (
                    <tr key={date} className="hover:bg-gray-50">
                      <td className="px-3 lg:px-6 py-2 lg:py-4 whitespace-nowrap text-xs lg:text-sm font-medium text-gray-900">
                        {formatDate(date)}
                      </td>
                      <td className="px-3 lg:px-6 py-2 lg:py-4 whitespace-nowrap text-xs lg:text-sm text-gray-900">
                        {count.toLocaleString()}
                      </td>
                      <td className="px-3 lg:px-6 py-2 lg:py-4 whitespace-nowrap text-xs lg:text-sm text-gray-900">
                        {formatPriceWithCommas(statisticsData.amountByDay?.[date] || 0)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
          <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-3 lg:mb-4">
            {getSystemRevenueComponentDescription('revenueByDay')}
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 lg:px-6 py-2 lg:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày
                  </th>
                  <th className="px-3 lg:px-6 py-2 lg:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doanh thu
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {systemRevenueData.revenueByDay && Object.entries(systemRevenueData.revenueByDay)
                  .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
                  .slice(0, 7) // Show only last 7 days
                  .map(([date, revenue]) => (
                    <tr key={date} className="hover:bg-gray-50">
                      <td className="px-3 lg:px-6 py-2 lg:py-4 whitespace-nowrap text-xs lg:text-sm font-medium text-gray-900">
                        {formatDate(date)}
                      </td>
                      <td className="px-3 lg:px-6 py-2 lg:py-4 whitespace-nowrap text-xs lg:text-sm text-gray-900">
                        {formatPriceWithCommas(revenue)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerStatistics;
