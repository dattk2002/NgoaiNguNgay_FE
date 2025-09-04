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
  FaCalendarAlt
} from 'react-icons/fa';
import { 
  Skeleton, 
  Box, 
  Card, 
  CardContent,
  Chip,
  Typography
} from '@mui/material';
import { showSuccess, showError } from '../../utils/toastManager.js';
import { fetchTutorDisputes } from '../api/auth';
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

const TutorDisputes = () => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [disputeMetadata, setDisputeMetadata] = useState(null);

  const loadDisputes = async () => {
    setLoading(true);
    try {
      const response = await fetchTutorDisputes();
      if (response && response.data) {
        setDisputes(response.data);
        setDisputeMetadata(response.additionalData);
      } else {
        setDisputes([]);
      }
    } catch (error) {
      console.error('Failed to fetch tutor disputes:', error);
      showError('Không thể tải danh sách báo cáo');
      setDisputes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDisputes();
  }, []);

  const handleViewDetail = (dispute) => {
    setSelectedDispute(dispute);
    setShowDetailModal(true);
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
    const pending = disputes.filter(d => d.status === 0 || d.status === 3).length;
    const resolved = disputes.filter(d => d.status === 1 || d.status === 2 || d.status === 4 || d.status === 5 || d.status === 6).length;

    return { total, pending, resolved };
  };

  const stats = getStatistics();

  if (loading) {
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Skeleton variant="text" width={200} height={40} />
        </Box>
        <DisputeSkeleton />
      </Box>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
                  <h2 className="text-2xl font-bold text-gray-900">Quản lý báo cáo</h2>
        <p className="text-gray-600 mt-1">Xem và phản hồi các báo cáo từ học viên</p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
        >
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FaExclamationTriangle className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Tổng báo cáo</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
        >
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <FaClock className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Đang xử lý</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
        >
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <FaCheck className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Đã giải quyết</p>
              <p className="text-2xl font-bold text-gray-900">{stats.resolved}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Disputes List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">Danh sách báo cáo</h3>
        </div>

        <div className="divide-y divide-gray-200">
          {disputes.length === 0 ? (
            <div className="p-8 text-center">
              <FaExclamationTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">Không có báo cáo nào</h3>
            <p className="text-gray-600">Hiện tại không có báo cáo nào được gửi đến bạn.</p>
            </div>
          ) : (
            <AnimatePresence>
              {disputes.map((dispute, index) => {
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
                              <span>{dispute.learner?.fullName || 'Không xác định'}</span>
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
        isTutorView={true}
        onDisputeUpdated={handleDisputeUpdated}
      />
    </div>
  );
};

export default TutorDisputes;
