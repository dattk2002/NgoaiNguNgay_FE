import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaExclamationTriangle, 
  FaClock, 
  FaUser, 
  FaFileAlt, 
  FaEye,
  FaCheck,
  FaTimes,
  FaCalendarAlt,
  FaFilter,
  FaSearch,
  FaSpinner
} from 'react-icons/fa';
import { 
  Skeleton, 
  Box, 
  Card, 
  CardContent,
  Chip,
  Typography
} from '@mui/material';
import { toast } from 'react-toastify';
import { fetchStaffDisputes } from '../api/auth';
import DisputeDetailModal from '../modals/DisputeDetailModal';
import { formatCentralTimestamp } from '../../utils/formatCentralTimestamp';

// Skeleton Component for Dispute Items
const DisputeSkeleton = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
    {Array.from({ length: 3 }).map((_, index) => (
      <Card key={index} sx={{ borderRadius: 2, boxShadow: 1 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Skeleton variant="circular" width={48} height={48} />
            <Box sx={{ flexGrow: 1 }}>
              <Skeleton variant="text" width="60%" height={24} />
              <Skeleton variant="text" width="40%" height={20} />
            </Box>
            <Skeleton variant="rectangular" width={100} height={32} sx={{ borderRadius: 1 }} />
          </Box>
        </CardContent>
      </Card>
    ))}
  </Box>
);

const StaffDisputes = () => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [disputeMetadata, setDisputeMetadata] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    search: ''
  });

  const loadDisputes = async () => {
    setLoading(true);
    try {
      console.log("🔍 Loading staff disputes...");
      console.log("🔍 Available tokens:", {
        staffToken: localStorage.getItem("staffToken") ? "Present" : "Not found",
        accessToken: localStorage.getItem("accessToken") ? "Present" : "Not found"
      });
      const response = await fetchStaffDisputes();
      console.log("🔍 Staff disputes response:", response);
      console.log("🔍 Response type:", typeof response);
      console.log("🔍 Response.data:", response?.data);
      console.log("🔍 Response.additionalData:", response?.additionalData);
      
      if (response && response.data) {
        console.log("🔍 Setting disputes:", response.data);
        console.log("🔍 Setting metadata:", response.additionalData);
        console.log("🔍 Disputes array length:", response.data.length);
        console.log("🔍 First dispute sample:", response.data[0]);
        setDisputes(response.data);
        setDisputeMetadata(response.additionalData);
      } else {
        console.log("🔍 No data in response, setting empty array");
        console.log("🔍 Response structure:", {
          hasResponse: !!response,
          hasData: !!(response && response.data),
          responseKeys: response ? Object.keys(response) : [],
          dataType: response?.data ? typeof response.data : 'undefined',
          responseData: response?.data
        });
        setDisputes([]);
      }
    } catch (error) {
      console.error('Failed to fetch staff disputes:', error);
      toast.error('Không thể tải danh sách khiếu nại');
      setDisputes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDisputes();
  }, []);

  const handleViewDetail = (dispute) => {
    console.log("🔍 handleViewDetail called with dispute:", dispute);
    console.log("🔍 Dispute ID:", dispute.id);
    console.log("🔍 Dispute case number:", dispute.caseNumber);
    console.log("🔍 Dispute status:", dispute.status);
    console.log("🔍 Dispute learner:", dispute.learner);
    console.log("🔍 Dispute tutor:", dispute.tutor);
    console.log("🔍 Dispute learner reason:", dispute.learnerReason);
    console.log("🔍 Dispute metadata available:", !!disputeMetadata);
    console.log("🔍 Setting selected dispute and opening modal...");
    setSelectedDispute(dispute);
    setShowDetailModal(true);
    console.log("🔍 Modal should now be open");
  };

  const handleDisputeUpdated = () => {
    loadDisputes();
  };

  const getStatusInfo = (status) => {
    if (!disputeMetadata?.DisputeStatus) return { text: 'Không xác định', color: 'default' };
    
    const statusInfo = disputeMetadata.DisputeStatus.find(s => s.numericValue === status);
    if (!statusInfo) return { text: 'Không xác định', color: 'default' };

    const colorMap = {
      0: 'warning', // PendingReconciliation
      1: 'default',  // ClosedWithdrawn
      2: 'default',  // ClosedResolved
      3: 'info',     // AwaitingStaffReview
      4: 'error',    // ResolvedLearnerWin
      5: 'success',  // ResolvedTutorWin
      6: 'default'   // ResolvedDraw
    };

    return {
      text: statusInfo.description,
      color: colorMap[status] || 'default'
    };
  };

  const getStatistics = () => {
    if (!disputes.length) return { total: 0, pending: 0, resolved: 0 };

    const total = disputes.length;
    const pending = disputes.filter(d => d.status === 3).length; // AwaitingStaffReview
    const resolved = disputes.filter(d => [4, 5, 6].includes(d.status)).length; // Resolved statuses

    return { total, pending, resolved };
  };

  const filteredDisputes = disputes.filter(dispute => {
    if (filters.status && dispute.status !== parseInt(filters.status)) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        dispute.caseNumber?.toLowerCase().includes(searchLower) ||
        dispute.learner?.fullName?.toLowerCase().includes(searchLower) ||
        dispute.tutor?.fullName?.toLowerCase().includes(searchLower) ||
        dispute.learnerReason?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  console.log("🔍 Current disputes state:", disputes);
  console.log("🔍 Current filters:", filters);
  console.log("🔍 Filtered disputes:", filteredDisputes);

  const stats = getStatistics();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản lý khiếu nại</h2>
          <p className="text-gray-600 mt-1">Xem xét và giải quyết các khiếu nại từ học viên</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng số khiếu nại</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FaExclamationTriangle className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Chờ xử lý</p>
              <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <FaClock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Đã giải quyết</p>
              <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <FaCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Tìm kiếm theo mã khiếu nại, tên học viên, gia sư..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
              />
            </div>
          </div>
          <div className="md:w-48">
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
            >
              <option value="">Tất cả trạng thái</option>
              {disputeMetadata?.DisputeStatus?.map(status => (
                <option key={status.numericValue} value={status.numericValue}>
                  {status.description}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Disputes List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Danh sách khiếu nại</h3>
        </div>

        <div className="divide-y divide-gray-200">
          {loading ? (
            <div className="p-6">
              <DisputeSkeleton />
            </div>
          ) : filteredDisputes.length === 0 ? (
            <div className="p-8 text-center">
              <FaExclamationTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filters.search || filters.status ? 'Không tìm thấy khiếu nại nào' : 'Không có khiếu nại nào'}
              </h3>
              <p className="text-gray-600">
                {filters.search || filters.status 
                  ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.'
                  : 'Hiện tại không có khiếu nại nào cần xử lý.'
                }
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {filteredDisputes.map((dispute, index) => {
                const statusInfo = getStatusInfo(dispute.status);
                return (
                  <motion.div
                    key={dispute.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-6 hover:bg-gray-50 transition-colors duration-200"
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
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {dispute.caseNumber}
                            </h4>
                            <Chip
                              label={statusInfo.text}
                              color={statusInfo.color}
                              size="small"
                              variant="outlined"
                            />
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <FaUser className="w-4 h-4" />
                              <span>HV: {dispute.learner?.fullName || 'Không xác định'}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <FaUser className="w-4 h-4" />
                              <span>GS: {dispute.tutor?.fullName || 'Không xác định'}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <FaCalendarAlt className="w-4 h-4" />
                              <span>{formatCentralTimestamp(dispute.createdAt)}</span>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                            {dispute.learnerReason || 'Không có lý do'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewDetail(dispute)}
                          className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200 flex items-center space-x-1"
                        >
                          <FaEye className="w-4 h-4" />
                          <span>Xem chi tiết</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Dispute Detail Modal */}
      <DisputeDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        dispute={selectedDispute}
        isStaffView={true}
        onDisputeUpdated={handleDisputeUpdated}
        disputeMetadata={disputeMetadata}
      />
      
      {/* Debug info */}
      {showDetailModal && (
        <div style={{ display: 'none' }}>
          <p>Debug: Modal is open</p>
          <p>Debug: Selected dispute: {JSON.stringify(selectedDispute)}</p>
          <p>Debug: Dispute metadata: {JSON.stringify(disputeMetadata)}</p>
        </div>
      )}
    </div>
  );
};

export default StaffDisputes;
