import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaExclamationTriangle, 
  FaClock, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaEye, 
  FaCalendarAlt,
  FaUser,
  FaBook,
  FaSpinner,
  FaFilter,
  FaSearch
} from "react-icons/fa";
import { showSuccess, showError } from "../../utils/toastManager.js";
import { fetchAllDisputes, updateDisputeStatus } from "../api/auth";
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
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false
  });
  
  // Filters
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    searchTerm: ""
  });

  useEffect(() => {
    loadDisputes();
  }, [pagination.pageIndex, filters]);

  const loadDisputes = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.pageIndex,
        pageSize: pagination.pageSize,
        ...filters
      };
      
      const response = await fetchAllDisputes(params);
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

  const getPriorityInfo = (priority) => {
    switch (priority) {
      case "high":
        return { text: "Cao", color: "bg-red-100 text-red-800" };
      case "medium":
        return { text: "Trung bình", color: "bg-yellow-100 text-yellow-800" };
      case "low":
        return { text: "Thấp", color: "bg-green-100 text-green-800" };
      default:
        return { text: "Không xác định", color: "bg-gray-100 text-gray-800" };
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-48"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-6 bg-gray-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản lý báo cáo</h2>
          <p className="text-gray-600 mt-1">Xử lý và quản lý các báo cáo từ học viên và giáo viên</p>
        </div>
        
        {/* Stats */}
        <div className="flex items-center gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {disputes.filter(d => d.status === "pending").length}
            </div>
            <div className="text-gray-500">Chờ xử lý</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {disputes.filter(d => d.status === "investigating").length}
            </div>
            <div className="text-gray-500">Đang điều tra</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {disputes.filter(d => d.status === "resolved").length}
            </div>
            <div className="text-gray-500">Đã giải quyết</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Tìm kiếm theo ID, tên học viên, giáo viên..."
                value={filters.searchTerm}
                onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          {/* Status Filter */}
          <div className="flex gap-2">
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="pending">Chờ xử lý</option>
              <option value="investigating">Đang điều tra</option>
              <option value="resolved">Đã giải quyết</option>
              <option value="closed">Đã đóng</option>
            </select>
            
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange("priority", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tất cả mức độ</option>
              <option value="high">Cao</option>
              <option value="medium">Trung bình</option>
              <option value="low">Thấp</option>
            </select>
          </div>
        </div>
      </div>

      {/* Disputes List */}
      {disputes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <FaExclamationTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filters.status || filters.priority || filters.searchTerm ? "Không có báo cáo nào" : "Chưa có báo cáo nào"}
          </h3>
          <p className="text-gray-500">
            {filters.status || filters.priority || filters.searchTerm 
              ? "Không có báo cáo nào phù hợp với bộ lọc hiện tại."
              : "Các báo cáo sẽ hiển thị tại đây khi có người gửi."
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {disputes.map((dispute) => {
            const statusInfo = getStatusInfo(dispute.status);
            const priorityInfo = getPriorityInfo(dispute.priority);
            return (
              <motion.div
                key={dispute.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between">
                  {/* Left side - Dispute Info */}
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <FaExclamationTriangle className="w-6 h-6 text-red-600" />
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {getReasonLabel(dispute.reason)}
                        </h3>
                        <span className={`px-2 py-1 text-xs rounded-full font-medium flex items-center gap-1 ${statusInfo.color}`}>
                          {statusInfo.icon}
                          {statusInfo.text}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${priorityInfo.color}`}>
                          {priorityInfo.text}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <FaBook className="w-4 h-4 text-blue-500" />
                          <span className="truncate">{dispute.booking?.lessonName || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaUser className="w-4 h-4 text-green-500" />
                          <span className="truncate">{dispute.complainantName || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaUser className="w-4 h-4 text-purple-500" />
                          <span className="truncate">{dispute.respondentName || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaCalendarAlt className="w-4 h-4 text-orange-500" />
                          <span>{formatDate(dispute.createdAt)}</span>
                        </div>
                      </div>
                      
                      {dispute.description && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                          {dispute.description}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Right side - Action */}
                  <div className="flex-shrink-0 ml-4">
                    <button
                      onClick={() => handleViewDetail(dispute)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <FaEye className="w-3 h-3" />
                      Chi tiết
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => handlePageChange(pagination.pageIndex - 1)}
            disabled={!pagination.hasPreviousPage}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Trước
          </button>
          
          <span className="px-4 py-2 text-sm text-gray-600">
            Trang {pagination.pageIndex} / {pagination.totalPages}
          </span>
          
          <button
            onClick={() => handlePageChange(pagination.pageIndex + 1)}
            disabled={!pagination.hasNextPage}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Sau
          </button>
        </div>
      )}

      {/* Detail Modal */}
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
