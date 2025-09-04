import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaExclamationTriangle, FaClock, FaCheckCircle, FaTimesCircle, FaEye, FaCalendarAlt, FaUser, FaBook, FaSpinner, FaFilter, FaSearch } from "react-icons/fa";
import { showSuccess, showError } from "../../utils/toastManager.js";
import { fetchStaffDisputes, resolveDispute } from "../api/auth";
import DisputeDetailModal from "../modals/DisputeDetailModal";

const DisputeManagement = () => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [pagination, setPagination] = useState({
    pageIndex: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false
  });
  const [filters, setFilters] = useState({
    status: "",
    search: ""
  });

  useEffect(() => {
    loadDisputes();
  }, [pagination.pageIndex, filters]);

  const loadDisputes = async () => {
    try {
      setLoading(true);
      const response = await fetchStaffDisputes({
        page: pagination.pageIndex,
        pageSize: pagination.pageSize,
        status: filters.status || undefined,
        search: filters.search || undefined
      });
      setDisputes(response.items || []);
      setPagination({
        pageIndex: response.pageIndex,
        pageSize: response.pageSize,
        totalItems: response.totalItems,
        totalPages: response.totalPages,
        hasNextPage: response.hasNextPage,
        hasPreviousPage: response.hasPreviousPage
      });
    } catch (error) {
      console.error("Error loading disputes:", error);
      showError("Không thể tải danh sách báo cáo. Vui lòng thử lại!");
      setDisputes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (dispute) => {
    setSelectedDispute(dispute);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedDispute(null);
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, pageIndex: newPage }));
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
    setPagination(prev => ({ ...prev, pageIndex: 1 }));
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case "pending":
        return { 
          text: "Chờ xử lý", 
          color: "bg-yellow-100 text-yellow-800",
          icon: <FaClock className="w-4 h-4" />
        };
      case "investigating":
        return { 
          text: "Đang điều tra", 
          color: "bg-blue-100 text-blue-800",
          icon: <FaSpinner className="w-4 h-4" />
        };
      case "resolved":
        return { 
          text: "Đã giải quyết", 
          color: "bg-green-100 text-green-800",
          icon: <FaCheckCircle className="w-4 h-4" />
        };
      case "closed":
        return { 
          text: "Đã đóng", 
          color: "bg-gray-100 text-gray-800",
          icon: <FaTimesCircle className="w-4 h-4" />
        };
      default:
        return { 
          text: "Không xác định", 
          color: "bg-gray-100 text-gray-800",
          icon: <FaExclamationTriangle className="w-4 h-4" />
        };
    }
  };

  const getReasonLabel = (reason) => {
    // Map reason dài về label ngắn
    const reasonMap = {
      "Giáo viên vắng mặt": "Vắng mặt",
      "Giáo viên đến muộn": "Trễ",
      "Vấn đề khác cần báo cáo": "Khác"
    };
    return reasonMap[reason] || reason || "Không xác định";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatistics = () => {
    const total = disputes.length;
    const pending = disputes.filter(d => d.status === 'pending').length;
    const investigating = disputes.filter(d => d.status === 'investigating').length;
    const resolved = disputes.filter(d => d.status === 'resolved').length;
    const closed = disputes.filter(d => d.status === 'closed').length;

    return { total, pending, investigating, resolved, closed };
  };

  const stats = getStatistics();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý báo cáo</h1>
          <p className="text-gray-600 mt-1">Quản lý và xử lý các báo cáo từ học viên và giáo viên</p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FaExclamationTriangle className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Tổng cộng</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <FaClock className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Chờ xử lý</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FaSpinner className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Đang điều tra</p>
              <p className="text-2xl font-bold text-blue-600">{stats.investigating}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <FaCheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Đã giải quyết</p>
              <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <FaTimesCircle className="w-5 h-5 text-gray-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Đã đóng</p>
              <p className="text-2xl font-bold text-gray-600">{stats.closed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 shadow-sm border">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tìm kiếm
            </label>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Tìm theo ID, tên học viên, giáo viên..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="sm:w-48">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trạng thái
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tất cả</option>
              <option value="pending">Chờ xử lý</option>
              <option value="investigating">Đang điều tra</option>
              <option value="resolved">Đã giải quyết</option>
              <option value="closed">Đã đóng</option>
            </select>
          </div>
        </div>
      </div>

      {/* Disputes List */}
      <div className="bg-white rounded-lg shadow-sm border">
        {loading ? (
          <div className="p-6">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="w-20 h-6 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : disputes.length === 0 ? (
          <div className="p-8 text-center">
            <FaExclamationTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không có báo cáo nào</h3>
            <p className="text-gray-500">Hiện tại không có báo cáo nào trong hệ thống.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {disputes.map((dispute) => {
              const statusInfo = getStatusInfo(dispute.status);
              return (
                <motion.div
                  key={dispute.id}
                  className="p-6 hover:bg-gray-50 transition-colors duration-200"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                          <FaExclamationTriangle className="w-6 h-6 text-red-600" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Báo cáo #{dispute.id}
                          </h3>
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${statusInfo.color}`}>
                            {statusInfo.text}
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center space-x-1">
                              <FaUser className="w-3 h-3" />
                              <span>Người báo cáo: {dispute.complainantName || 'N/A'}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <FaBook className="w-3 h-3" />
                              <span>Lý do: {getReasonLabel(dispute.reason)}</span>
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center space-x-1">
                              <FaCalendarAlt className="w-3 h-3" />
                              <span>Tạo lúc: {formatDate(dispute.createdAt)}</span>
                            </span>
                            {dispute.updatedAt && dispute.updatedAt !== dispute.createdAt && (
                              <span className="flex items-center space-x-1">
                                <FaClock className="w-3 h-3" />
                                <span>Cập nhật: {formatDate(dispute.updatedAt)}</span>
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {dispute.description && (
                          <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                            {dispute.description}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewDetail(dispute)}
                        className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200 flex items-center space-x-1"
                      >
                        <FaEye className="w-4 h-4" />
                        <span>Chi tiết</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 border-t border-gray-200 sm:px-6 rounded-lg shadow-sm">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(pagination.pageIndex - 1)}
              disabled={!pagination.hasPreviousPage}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trước
            </button>
            <button
              onClick={() => handlePageChange(pagination.pageIndex + 1)}
              disabled={!pagination.hasNextPage}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Hiển thị <span className="font-medium">{((pagination.pageIndex - 1) * pagination.pageSize) + 1}</span> đến{' '}
                <span className="font-medium">
                  {Math.min(pagination.pageIndex * pagination.pageSize, pagination.totalItems)}
                </span>{' '}
                trong tổng số <span className="font-medium">{pagination.totalItems}</span> kết quả
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(pagination.pageIndex - 1)}
                  disabled={!pagination.hasPreviousPage}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Trước</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        pageNum === pagination.pageIndex
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(pagination.pageIndex + 1)}
                  disabled={!pagination.hasNextPage}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Sau</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Dispute Detail Modal */}
      <DisputeDetailModal
        isOpen={isDetailModalOpen}
        onClose={closeDetailModal}
        dispute={selectedDispute}
        isStaffView={true}
      />
    </div>
  );
};

export default DisputeManagement;
