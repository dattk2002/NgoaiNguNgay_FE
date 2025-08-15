import React, { useState, useEffect } from 'react';
import { managerFinancialOverview, managerFinancialOverviewMetadata } from '../api/auth';

const ManagerOverview = () => {
    const [financialData, setFinancialData] = useState(null);
    const [metadata, setMetadata] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                // Fetch both financial data and metadata in parallel
                const [financialResponse, metadataResponse] = await Promise.all([
                    managerFinancialOverview(),
                    managerFinancialOverviewMetadata()
                ]);
                
                setFinancialData(financialResponse);
                setMetadata(metadataResponse);
                setError(null);
            } catch (err) {
                console.error('Failed to fetch financial data:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
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

    if (!financialData || !metadata) {
        return (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <span className="text-yellow-800">Không có dữ liệu tài chính hoặc metadata</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {/* Total Money in Circulation */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Tiền lưu hành</p>
                            <p className="text-xl font-semibold text-gray-900">{formatCurrency(financialData.totalMoneyInCirculation)}</p>
                        </div>
                    </div>
                </div>

                {/* Total Successful Deposits */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Nạp tiền thành công</p>
                            <p className="text-xl font-semibold text-gray-900">{formatCurrency(financialData.totalSuccessfulDeposits)}</p>
                        </div>
                    </div>
                </div>

                {/* Total Completed Withdrawals */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Rút tiền hoàn thành</p>
                            <p className="text-xl font-semibold text-gray-900">{formatCurrency(financialData.totalCompletedWithdrawals)}</p>
                        </div>
                    </div>
                </div>

                {/* Total Wallet Balances */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Số dư ví</p>
                            <p className="text-xl font-semibold text-gray-900">{formatCurrency(financialData.totalWalletBalances)}</p>
                        </div>
                    </div>
                </div>

                {/* Total Held Funds */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Tiền đang giữ</p>
                            <p className="text-xl font-semibold text-gray-900">{formatCurrency(financialData.totalHeldFunds)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Status Definitions from Metadata */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Deposit Request Status */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Trạng thái yêu cầu nạp tiền</h3>
                    <div className="space-y-3">
                        {metadata.DepositRequestStatus?.map((status, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center">
                                    <div className={`w-3 h-3 rounded-full mr-3 ${
                                        status.numericValue === 0 ? 'bg-yellow-500' :
                                        status.numericValue === 1 ? 'bg-green-500' : 'bg-red-500'
                                    }`}></div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">{status.name}</div>
                                        <div className="text-xs text-gray-500">{status.description}</div>
                                    </div>
                                </div>
                                <div className="text-sm font-medium text-gray-600">
                                    #{status.numericValue}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Withdrawal Request Status */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Trạng thái yêu cầu rút tiền</h3>
                    <div className="space-y-3">
                        {metadata.WithdrawalRequestStatus?.map((status, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center">
                                    <div className={`w-3 h-3 rounded-full mr-3 ${
                                        status.numericValue === 0 ? 'bg-yellow-500' :
                                        status.numericValue === 1 ? 'bg-blue-500' :
                                        status.numericValue === 2 ? 'bg-green-500' : 'bg-red-500'
                                    }`}></div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">{status.name}</div>
                                        <div className="text-xs text-gray-500">{status.description}</div>
                                    </div>
                                </div>
                                <div className="text-sm font-medium text-gray-600">
                                    #{status.numericValue}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Financial Components Explanation from Metadata */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Giải thích các thành phần tài chính</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {metadata.FinancialComponents && 
                        Object.entries(metadata.FinancialComponents).map(([key, description]) => (
                            <div key={key} className="p-4 bg-gray-50 rounded-lg">
                                <h4 className="text-sm font-medium text-gray-900 mb-2">
                                    {key === 'totalMoneyInCirculation' && 'Tiền lưu hành'}
                                    {key === 'totalSuccessfulDeposits' && 'Nạp tiền thành công'}
                                    {key === 'totalCompletedWithdrawals' && 'Rút tiền hoàn thành'}
                                    {key === 'totalWalletBalances' && 'Số dư ví'}
                                    {key === 'totalHeldFunds' && 'Tiền đang giữ'}
                                </h4>
                                <p className="text-xs text-gray-600">{description}</p>
                            </div>
                        ))
                    }
                </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-medium mb-2">Tổng quan tài chính hệ thống</h3>
                        <p className="text-sm opacity-90">
                            Hệ thống đang quản lý {formatCurrency(financialData.totalWalletBalances)} tổng số dư ví
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold">{formatCurrency(financialData.totalMoneyInCirculation)}</div>
                        <div className="text-sm opacity-90">Tiền lưu hành</div>
                    </div>
                </div>
            </div>

            {/* Metadata Information Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                    <svg className="w-5 h-5 text-blue-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div>
                        <h4 className="text-sm font-medium text-blue-900 mb-1">Lưu ý về dữ liệu</h4>
                        <p className="text-sm text-blue-700">
                            Dữ liệu tài chính được cập nhật theo thời gian thực. Các định nghĩa trạng thái và mô tả thành phần 
                            được lấy từ metadata API để đảm bảo tính nhất quán và chính xác.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManagerOverview; 