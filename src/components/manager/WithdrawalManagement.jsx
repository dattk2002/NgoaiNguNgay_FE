import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { fetchWithdrawalRequests, processWithdrawal, rejectWithdrawal } from '../api/auth';
import NoFocusOutLineButton from '../../utils/noFocusOutlineButton';
import WithdrawalDetailModal from '../modals/WithdrawalDetailModal';
import ConfirmRejectWithdrawalModal from '../modals/ConfirmRejectWithdrawalModal';

const WithdrawalManagement = () => {
    const [withdrawalRequests, setWithdrawalRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [filters, setFilters] = useState({
        status: '', // Empty means all statuses
        pageSize: 10
    });
    const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [withdrawalToReject, setWithdrawalToReject] = useState(null);
    const [processingId, setProcessingId] = useState(null);
    const [rejectingId, setRejectingId] = useState(null);

    // Status mapping from API response
    const statusOptions = [
        { name: 'Pending', value: 0, color: 'bg-yellow-100 text-yellow-800', label: 'Chờ xử lý' },
        { name: 'Processing', value: 1, color: 'bg-blue-100 text-blue-800', label: 'Đang xử lý' },
        { name: 'Completed', value: 2, color: 'bg-green-100 text-green-800', label: 'Hoàn thành' },
        { name: 'Failed', value: 3, color: 'bg-red-100 text-red-800', label: 'Từ chối' }
    ];

    const getStatusInfo = (statusValue) => {
        return statusOptions.find(s => s.value === statusValue) || statusOptions[0];
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const maskAccountNumber = (accountNumber) => {
        if (!accountNumber || accountNumber.length <= 4) return accountNumber;
        return '****' + accountNumber.slice(-4);
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const params = {
                pageIndex: currentPage,
                pageSize: filters.pageSize,
                ...(filters.status !== '' && { status: filters.status })
            };

            const response = await fetchWithdrawalRequests(params);
            
            if (response && response.items) {
                setWithdrawalRequests(response.items);
                setTotalPages(response.totalPages || 1);
                setTotalItems(response.totalItems || 0);
            }
        } catch (error) {
            console.error('Error fetching withdrawal requests:', error);
            toast.error('Lỗi khi tải danh sách lệnh rút tiền: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [currentPage, filters]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setCurrentPage(1); // Reset to first page when filter changes
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleRefresh = () => {
        fetchData();
        toast.success('Đã làm mới dữ liệu');
    };

    const handleViewDetail = (withdrawal) => {
        setSelectedWithdrawal(withdrawal);
        setShowDetailModal(true);
    };

    const handleCloseDetailModal = () => {
        setShowDetailModal(false);
        setSelectedWithdrawal(null);
    };

    const handleApproveWithdrawal = async (withdrawal) => {
        try {
            setProcessingId(withdrawal.id);
            await processWithdrawal(withdrawal.id);
            
            toast.success(`Đã xác nhận lệnh rút tiền ${formatCurrency(withdrawal.grossAmount)} của ${withdrawal.userFullName}`);
            
            // Refresh data
            await fetchData();
        } catch (error) {
            console.error('Error approving withdrawal:', error);
            toast.error('Lỗi khi xác nhận lệnh rút tiền: ' + error.message);
        } finally {
            setProcessingId(null);
        }
    };

    const handleRejectWithdrawal = (withdrawal) => {
        setWithdrawalToReject(withdrawal);
        setShowRejectModal(true);
    };

    const handleConfirmReject = async (rejectionReason) => {
        if (!withdrawalToReject) return;

        try {
            setRejectingId(withdrawalToReject.id);
            await rejectWithdrawal(withdrawalToReject.id, rejectionReason);
            
            toast.success(`Đã từ chối lệnh rút tiền ${formatCurrency(withdrawalToReject.grossAmount)} của ${withdrawalToReject.userFullName}`);
            
            // Close modal and refresh data
            setShowRejectModal(false);
            setWithdrawalToReject(null);
            await fetchData();
        } catch (error) {
            console.error('Error rejecting withdrawal:', error);
            toast.error('Lỗi khi từ chối lệnh rút tiền: ' + error.message);
        } finally {
            setRejectingId(null);
        }
    };

    const handleCloseRejectModal = () => {
        if (rejectingId) return; // Prevent closing while processing
        setShowRejectModal(false);
        setWithdrawalToReject(null);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-semibold text-gray-900">Quản lý lệnh rút tiền</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Tổng số: {totalItems} lệnh rút tiền
                    </p>
                </div>
                <NoFocusOutLineButton
                    onClick={handleRefresh}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Làm mới</span>
                </NoFocusOutLineButton>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
                        >
                            <option value="">Tất cả trạng thái</option>
                            {statusOptions.map((status) => (
                                <option key={status.value} value={status.value}>
                                    {status.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Số lượng mỗi trang</label>
                        <select
                            value={filters.pageSize}
                            onChange={(e) => handleFilterChange('pageSize', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg border border-gray-200">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                        <span className="ml-2 text-gray-600">Đang tải...</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm uppercase tracking-wider">Người dùng</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm uppercase tracking-wider">Ngân hàng</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm uppercase tracking-wider">Số tiền</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm uppercase tracking-wider">Trạng thái</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm uppercase tracking-wider">Ngày tạo</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm uppercase tracking-wider">Ngày hoàn thành</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm uppercase tracking-wider">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {withdrawalRequests.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-12 text-gray-500">
                                            <div className="flex flex-col items-center">
                                                <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m4-8v12m4-12v12" />
                                                </svg>
                                                <p>Không có lệnh rút tiền nào</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    withdrawalRequests.map((request) => {
                                        const statusInfo = getStatusInfo(request.status);
                                        return (
                                            <tr key={request.id} className="hover:bg-gray-50">
                                                <td className="py-3 px-4">
                                                    <div className="text-sm">
                                                        <div className="font-medium text-gray-900">{request.userFullName}</div>
                                                        <div className="text-gray-500 font-mono text-xs">{request.userId.substring(0, 8)}...</div>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="text-sm">
                                                        <div className="font-medium text-gray-900">{request.bankAccount?.bankName}</div>
                                                        <div className="text-gray-500">{maskAccountNumber(request.bankAccount?.accountNumber)}</div>
                                                        <div className="text-gray-500 text-xs">{request.bankAccount?.accountHolderName}</div>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="text-sm">
                                                        <div className="font-medium text-gray-900">{formatCurrency(request.grossAmount)}</div>
                                                        <div className="text-gray-500 text-xs">
                                                            Thực nhận: {formatCurrency(request.netAmount)}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                                                        {statusInfo.label}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-900">
                                                    {formatDate(request.createdTime)}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-900">
                                                    {formatDate(request.completedAt)}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center space-x-2">
                                                        {/* Approve/Reject buttons for pending status */}
                                                        {request.status === 0 && (
                                                            <>
                                                                <NoFocusOutLineButton
                                                                    onClick={() => handleApproveWithdrawal(request)}
                                                                    disabled={processingId === request.id || rejectingId === request.id}
                                                                    className={`px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center space-x-1 ${
                                                                        processingId === request.id ? 'opacity-50 cursor-not-allowed' : ''
                                                                    }`}
                                                                >
                                                                    {processingId === request.id ? (
                                                                        <>
                                                                            <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                                                                            <span>Đang xử lý...</span>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                            </svg>
                                                                            <span>Xác nhận</span>
                                                                        </>
                                                                    )}
                                                                </NoFocusOutLineButton>
                                                                <NoFocusOutLineButton
                                                                    onClick={() => handleRejectWithdrawal(request)}
                                                                    disabled={processingId === request.id || rejectingId === request.id}
                                                                    className={`px-3 py-1.5 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center space-x-1 ${
                                                                        rejectingId === request.id ? 'opacity-50 cursor-not-allowed' : ''
                                                                    }`}
                                                                >
                                                                    {rejectingId === request.id ? (
                                                                        <>
                                                                            <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                                                                            <span>Đang xử lý...</span>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                            </svg>
                                                                            <span>Từ chối</span>
                                                                        </>
                                                                    )}
                                                                </NoFocusOutLineButton>
                                                            </>
                                                        )}

                                                        {/* View detail button */}
                                                        <NoFocusOutLineButton
                                                            onClick={() => handleViewDetail(request)}
                                                            className="text-blue-600 hover:text-blue-900 text-xs font-medium flex items-center space-x-1"
                                                        >
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            </svg>
                                                            <span>Xem</span>
                                                        </NoFocusOutLineButton>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                        <div className="flex items-center justify-between">
                            <div className="flex-1 flex justify-between sm:hidden">
                                <NoFocusOutLineButton
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                                        currentPage === 1 
                                            ? 'text-gray-400 bg-gray-100 cursor-not-allowed' 
                                            : 'text-gray-700 bg-white hover:bg-gray-50'
                                    }`}
                                >
                                    Trước
                                </NoFocusOutLineButton>
                                <NoFocusOutLineButton
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                                        currentPage === totalPages 
                                            ? 'text-gray-400 bg-gray-100 cursor-not-allowed' 
                                            : 'text-gray-700 bg-white hover:bg-gray-50'
                                    }`}
                                >
                                    Sau
                                </NoFocusOutLineButton>
                            </div>
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Hiển thị{' '}
                                        <span className="font-medium">{((currentPage - 1) * filters.pageSize) + 1}</span>
                                        {' '}đến{' '}
                                        <span className="font-medium">
                                            {Math.min(currentPage * filters.pageSize, totalItems)}
                                        </span>
                                        {' '}trong tổng số{' '}
                                        <span className="font-medium">{totalItems}</span>
                                        {' '}kết quả
                                    </p>
                                </div>
                                <div>
                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                        <NoFocusOutLineButton
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                                                currentPage === 1 
                                                    ? 'text-gray-400 bg-gray-100 cursor-not-allowed' 
                                                    : 'text-gray-500 bg-white hover:bg-gray-50'
                                            }`}
                                        >
                                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </NoFocusOutLineButton>
                                        
                                        {/* Page numbers */}
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            let pageNum;
                                            if (totalPages <= 5) {
                                                pageNum = i + 1;
                                            } else if (currentPage <= 3) {
                                                pageNum = i + 1;
                                            } else if (currentPage >= totalPages - 2) {
                                                pageNum = totalPages - 4 + i;
                                            } else {
                                                pageNum = currentPage - 2 + i;
                                            }
                                            
                                            return (
                                                <NoFocusOutLineButton
                                                    key={pageNum}
                                                    onClick={() => handlePageChange(pageNum)}
                                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                        pageNum === currentPage
                                                            ? 'z-10 bg-green-50 border-green-500 text-green-600'
                                                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {pageNum}
                                                </NoFocusOutLineButton>
                                            );
                                        })}

                                        <NoFocusOutLineButton
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                                                currentPage === totalPages 
                                                    ? 'text-gray-400 bg-gray-100 cursor-not-allowed' 
                                                    : 'text-gray-500 bg-white hover:bg-gray-50'
                                            }`}
                                        >
                                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </NoFocusOutLineButton>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            <WithdrawalDetailModal 
                isOpen={showDetailModal}
                onClose={handleCloseDetailModal}
                withdrawal={selectedWithdrawal}
            />

            {/* Reject Confirmation Modal */}
            <ConfirmRejectWithdrawalModal
                isOpen={showRejectModal}
                onClose={handleCloseRejectModal}
                onConfirm={handleConfirmReject}
                withdrawal={withdrawalToReject}
                isLoading={!!rejectingId}
            />
        </div>
    );
};

export default WithdrawalManagement;