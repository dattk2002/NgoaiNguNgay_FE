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
  FaFilter
} from "react-icons/fa";
import { toast } from "react-toastify";
import { fetchLearnerDisputes } from "./api/auth";
import DisputeDetailModal from "./modals/DisputeDetailModal";

const MyDisputes = () => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [onlyActive, setOnlyActive] = useState(false);
  const [disputeMetadata, setDisputeMetadata] = useState(null);

  useEffect(() => {
    loadDisputes();
  }, [onlyActive]);

  const loadDisputes = async () => {
    try {
      setLoading(true);
      const response = await fetchLearnerDisputes(onlyActive);
      console.log("Learner disputes response:", response);
      
      if (response && response.data) {
        console.log("Setting disputes:", response.data);
        setDisputes(response.data || []);
        console.log("Setting metadata:", response.additionalData);
        setDisputeMetadata(response.additionalData);
      } else {
        setDisputes([]);
        setDisputeMetadata(null);
      }
    } catch (error) {
      console.error("Error loading disputes:", error);
      toast.error("Không thể tải danh sách báo cáo. Vui lòng thử lại!");
      setDisputes([]);
      setDisputeMetadata(null);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (dispute) => {
    console.log("Opening dispute detail for:", dispute);
    setSelectedDispute(dispute);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedDispute(null);
  };

  const handleOnlyActiveChange = (value) => {
    setOnlyActive(value);
  };

  const getStatusInfo = (statusNumeric) => {
    console.log("Getting status info for:", statusNumeric, "Metadata:", disputeMetadata);
    if (!disputeMetadata || !disputeMetadata.DisputeStatus) {
      console.log("No metadata available, returning default");
      return { 
        text: "Không xác định", 
        color: "bg-gray-100 text-gray-800",
        icon: <FaExclamationTriangle className="w-4 h-4" />
      };
    }

    const status = disputeMetadata.DisputeStatus.find(s => s.numericValue === statusNumeric);
    console.log("Found status:", status);
    if (!status) {
      console.log("Status not found, returning default");
      return { 
        text: "Không xác định", 
        color: "bg-gray-100 text-gray-800",
        icon: <FaExclamationTriangle className="w-4 h-4" />
      };
    }

    // Map status to colors and icons
    const statusConfig = {
      "PendingReconciliation": {
        text: status.description,
        color: "bg-yellow-100 text-yellow-800",
        icon: <FaClock className="w-4 h-4" />
      },
      "ClosedWithdrawn": {
        text: status.description,
        color: "bg-gray-100 text-gray-800",
        icon: <FaTimesCircle className="w-4 h-4" />
      },
      "ClosedResolved": {
        text: status.description,
        color: "bg-green-100 text-green-800",
        icon: <FaCheckCircle className="w-4 h-4" />
      },
      "AwaitingStaffReview": {
        text: status.description,
        color: "bg-blue-100 text-blue-800",
        icon: <FaSpinner className="w-4 h-4" />
      },
      "ResolvedLearnerWin": {
        text: status.description,
        color: "bg-green-100 text-green-800",
        icon: <FaCheckCircle className="w-4 h-4" />
      },
      "ResolvedTutorWin": {
        text: status.description,
        color: "bg-red-100 text-red-800",
        icon: <FaTimesCircle className="w-4 h-4" />
      },
      "ResolvedDraw": {
        text: status.description,
        color: "bg-purple-100 text-purple-800",
        icon: <FaCheckCircle className="w-4 h-4" />
      }
    };

    const result = statusConfig[status.name] || {
      text: status.description,
      color: "bg-gray-100 text-gray-800",
      icon: <FaExclamationTriangle className="w-4 h-4" />
    };
    console.log("Returning status info:", result);
    return result;
  };

  const getReasonLabel = (reason) => {
    // Map reason dài về label ngắn
    const reasonMap = {
      "Giáo viên vắng mặt không thông báo trước": "Vắng mặt",
      "Giáo viên đến muộn quá 15 phút": "Trễ",
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

  // Calculate statistics
  const getStatistics = () => {
    const total = disputes.length;
    const pending = disputes.filter(d => d.status === 0).length; // PendingReconciliation
    const investigating = disputes.filter(d => d.status === 3).length; // AwaitingStaffReview
    const resolved = disputes.filter(d => 
      d.status === 2 || d.status === 4 || d.status === 5 || d.status === 6
    ).length; // ClosedResolved, ResolvedLearnerWin, ResolvedTutorWin, ResolvedDraw

    return { total, pending, investigating, resolved };
  };

  const stats = getStatistics();

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
          <h2 className="text-2xl font-bold text-gray-900">Báo cáo của tôi</h2>
          <p className="text-gray-600 mt-1">Quản lý các báo cáo bạn đã gửi</p>
        </div>
        
        {/* Active Filter */}
        <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <FaFilter className="w-4 h-4" />
              Chỉ hiển thị báo cáo đang hoạt động:
            </label>
          <select
            value={onlyActive.toString()}
            onChange={(e) => handleOnlyActiveChange(e.target.value === 'true')}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
          >
            <option value="false">Tất cả</option>
            <option value="true">Đang hoạt động</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng cộng</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <FaExclamationTriangle className="w-5 h-5 text-gray-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Chờ xử lý</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <FaClock className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Đang điều tra</p>
              <p className="text-2xl font-bold text-blue-600">{stats.investigating}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <FaSpinner className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Đã giải quyết</p>
              <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <FaCheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Disputes List */}
      {disputes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <FaExclamationTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {onlyActive ? "Không có báo cáo đang hoạt động" : "Chưa có báo cáo nào"}
          </h3>
          <p className="text-gray-500">
            {onlyActive 
              ? "Không có báo cáo nào đang hoạt động."
              : "Các báo cáo bạn gửi sẽ hiển thị tại đây."
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {disputes.map((dispute) => {
            console.log("Rendering dispute:", dispute);
            const statusInfo = getStatusInfo(dispute.status);
            console.log("Status info for dispute:", dispute.status, statusInfo);
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
                          {dispute.learnerReason || "N/A"}
                        </h3>
                        <span className={`px-2 py-1 text-xs rounded-full font-medium flex items-center gap-1 ${statusInfo.color}`}>
                          {statusInfo.icon}
                          {statusInfo.text}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <FaBook className="w-4 h-4 text-blue-500" />
                          <span className="truncate">
                            {(() => {
                              console.log("Case number:", dispute.caseNumber);
                              return dispute.caseNumber || "N/A";
                            })()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaUser className="w-4 h-4 text-green-500" />
                          <span className="truncate">
                            {(() => {
                              console.log("Tutor:", dispute.tutor);
                              return dispute.tutor?.fullName || "N/A";
                            })()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaCalendarAlt className="w-4 h-4 text-purple-500" />
                          <span>
                            {(() => {
                              console.log("Created at:", dispute.createdAt);
                              return formatDate(dispute.createdAt);
                            })()}
                          </span>
                        </div>
                      </div>
                      
                      {dispute.learnerReason && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                          {dispute.learnerReason}
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

      {/* Detail Modal */}
      <DisputeDetailModal
        isOpen={isDetailModalOpen}
        onClose={closeDetailModal}
        dispute={selectedDispute}
        onDisputeUpdated={loadDisputes}
      />
    </div>
  );
};

export default MyDisputes;
