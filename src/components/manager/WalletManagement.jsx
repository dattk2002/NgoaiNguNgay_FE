import React, { useState, useEffect } from 'react';
import { managerWalletBalances, managerWalletBalancesMetadata } from '../api/auth';

const WalletManagement = () => {
    const [walletData, setWalletData] = useState(null);
    const [metadata, setMetadata] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                // Fetch both wallet data and metadata in parallel
                const [walletResponse, metadataResponse] = await Promise.all([
                    managerWalletBalances(),
                    managerWalletBalancesMetadata()
                ]);
                
                setWalletData(walletResponse);
                setMetadata(metadataResponse);
                setError(null);
            } catch (err) {
                console.error('Failed to fetch wallet data:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount) + ' VNĐ';
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

    if (!walletData || !metadata) {
        return (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <span className="text-yellow-800">Không có dữ liệu ví hoặc metadata</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Wallet Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {/* Total User Wallet Balances */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Ví người dùng</p>
                            <p className="text-xl font-semibold text-gray-900">{formatCurrency(walletData.totalUserWalletBalances)}</p>
                        </div>
                    </div>
                </div>

                {/* System Wallet Balance */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Ví hệ thống</p>
                            <p className="text-xl font-semibold text-gray-900">{formatCurrency(walletData.systemWalletBalance)}</p>
                        </div>
                    </div>
                </div>

                {/* Escrow Wallet Balance */}
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
                            <p className="text-sm font-medium text-gray-600">Ví ký quỹ</p>
                            <p className="text-xl font-semibold text-gray-900">{formatCurrency(walletData.escrowWalletBalance)}</p>
                        </div>
                    </div>
                </div>

                {/* Total Active Wallets */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Ví hoạt động</p>
                            <p className="text-xl font-semibold text-gray-900">{walletData.totalActiveWallets}</p>
                        </div>
                    </div>
                </div>

                {/* Total Locked Wallets */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Ví bị khóa</p>
                            <p className="text-xl font-semibold text-gray-900">{walletData.totalLockedWallets}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Wallet Summary */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-medium mb-2">Tổng quan hệ thống ví</h3>
                        <p className="text-sm opacity-90">
                            {walletData.totalActiveWallets} ví đang hoạt động, {walletData.totalLockedWallets} ví bị khóa
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold">{formatCurrency(walletData.totalUserWalletBalances)}</div>
                        <div className="text-sm opacity-90">Tổng số dư ví người dùng</div>
                    </div>
                </div>
            </div>

            {/* Wallet Balance Components Explanation */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Giải thích các thành phần số dư ví</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {metadata.WalletBalanceComponents && 
                        Object.entries(metadata.WalletBalanceComponents).map(([key, description]) => (
                            <div key={key} className="p-4 bg-gray-50 rounded-lg">
                                <h4 className="text-sm font-medium text-gray-900 mb-2">
                                    {key === 'totalUserWalletBalances' && 'Ví người dùng'}
                                    {key === 'systemWalletBalance' && 'Ví hệ thống'}
                                    {key === 'escrowWalletBalance' && 'Ví ký quỹ'}
                                    {key === 'totalActiveWallets' && 'Ví hoạt động'}
                                    {key === 'totalLockedWallets' && 'Ví bị khóa'}
                                </h4>
                                <p className="text-xs text-gray-600">{description}</p>
                            </div>
                        ))
                    }
                </div>
            </div>

            {/* Information Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                    <svg className="w-5 h-5 text-blue-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div>
                        <h4 className="text-sm font-medium text-blue-900 mb-1">Lưu ý về quản lý ví</h4>
                        <p className="text-sm text-blue-700">
                            Dữ liệu ví được cập nhật theo thời gian thực. Các định nghĩa loại ví và trạng thái được lấy từ metadata API 
                            để đảm bảo tính nhất quán và chính xác trong quản lý hệ thống ví.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WalletManagement; 