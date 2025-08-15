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
import { fetchStaffDisputes, fetchStaffDisputesFilter } from '../api/auth';
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
    search: '',
    resolutionFilter: [], // Ensure this is empty by default
    pageIndex: 1,
    pageSize: 10
  });
  const [paginationInfo, setPaginationInfo] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    hasNextPage: false,
    hasPreviousPage: false
  });

  const loadDisputes = async () => {
    setLoading(true);
    try {
      console.log("🔍 Loading staff disputes with filter...");
      console.log("🔍 Available tokens:", {
        staffToken: localStorage.getItem("staffToken") ? "Present" : "Not found",
        accessToken: localStorage.getItem("accessToken") ? "Present" : "Not found"
      });
      
             // Build filter parameters
       const filterParams = {
         PageIndex: filters.pageIndex - 1, // Convert to 0-based indexing
         PageSize: filters.pageSize
       };
      
      // Add ResolutionFilter if specified
      if (filters.resolutionFilter && filters.resolutionFilter.length > 0) {
        filterParams.ResolutionFilter = filters.resolutionFilter;
      }
      
      // Add CaseNumber if search is provided
      if (filters.search && filters.search.trim()) {
        filterParams.CaseNumber = filters.search.trim();
      }
      
             console.log("🔍 Filter params:", filterParams);
       console.log("🔍 Current filters state:", filters);
      
      let response;
      try {
        // Try the new filter endpoint first
        response = await fetchStaffDisputesFilter(filterParams);
        console.log("✅ Using fetchStaffDisputesFilter endpoint");
      } catch (filterError) {
        console.warn("⚠️ Filter endpoint failed, falling back to regular endpoint:", filterError);
        // Fallback to regular endpoint
        response = await fetchStaffDisputes();
        console.log("✅ Using fetchStaffDisputes endpoint as fallback");
      }
      
      if (response && response.data) {
        // Handle new endpoint structure: response.data.items
        let disputesData = [];
        let metadata = null;
        
        if (response.data.items && Array.isArray(response.data.items)) {
          // New endpoint structure
          disputesData = response.data.items;
          metadata = response.additionalData;
          console.log("✅ Using new endpoint structure (response.data.items)");
        } else if (Array.isArray(response.data)) {
          // Old endpoint structure
          disputesData = response.data;
          metadata = response.additionalData;
          console.log("✅ Using old endpoint structure (response.data)");
        } else {
          console.log("⚠️ Unknown response structure");
        }
        
        setDisputes(disputesData);
        setDisputeMetadata(metadata);
        
                 // Update pagination info from response
         if (response.data) {
           const paginationData = {
             totalItems: response.data.totalItems || response.data.totalitems || 0,
             totalPages: response.data.totalPages || 1,
             currentPage: (response.data.currentPageNumber || response.data.pageIndex || 0) + 1, // Convert back to 1-based
             hasNextPage: response.data.hasNextPage || false,
             hasPreviousPage: response.data.hasPreviousPage || false
           };
           setPaginationInfo(paginationData);
           console.log("📄 Pagination info updated:", paginationData);
         }
        
                 console.log("✅ Disputes loaded successfully:", disputesData.length, "items");
         console.log("🔍 Full response data:", response?.data);
         console.log("🔍 Response structure:", {
           hasResponse: !!response,
           hasData: !!(response && response.data),
           hasItems: !!(response?.data?.items),
           dataType: response?.data ? typeof response.data : 'undefined',
           itemsType: response?.data?.items ? typeof response.data.items : 'undefined',
           itemsIsArray: Array.isArray(response?.data?.items),
           itemsLength: response?.data?.items?.length || 0,
           totalItems: response?.data?.totalItems || response?.data?.totalitems || 0,
           pageIndex: response?.data?.pageIndex || 0,
           currentPageNumber: response?.data?.currentPageNumber || 0
         });
      } else {
        console.log("🔍 No data in response, setting empty array");
        console.log("🔍 Response structure:", {
          hasResponse: !!response,
          hasData: !!(response && response.data),
          responseKeys: response ? Object.keys(response) : [],
          dataKeys: response?.data ? Object.keys(response.data) : [],
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
  }, [filters.pageIndex, filters.pageSize, filters.resolutionFilter, filters.search]);

  // Reset filters on component mount to ensure clean state
  useEffect(() => {
    console.log("🔄 Component mounted, ensuring clean filter state");
    resetFilters();
  }, []);

  const handleViewDetail = (dispute) => {
    setSelectedDispute(dispute);
    setShowDetailModal(true);
    console.log("🔍 Modal should now be open");
  };

  const handleDisputeUpdated = () => {
    loadDisputes();
  };

  const resetFilters = () => {
    setFilters({
      status: '',
      search: '',
      resolutionFilter: [],
      pageIndex: 1,
      pageSize: 10
    });
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
    // Use total items from pagination info for total count
    const total = paginationInfo.totalItems;
    
    if (!Array.isArray(disputes) || !disputes.length) {
      return { total, pending: 0, resolved: 0 };
    }

    // Calculate pending and resolved from current page data
    const pending = disputes.filter(d => d.status === 3).length; // AwaitingStaffReview
    const resolved = disputes.filter(d => [4, 5, 6].includes(d.status)).length; // Resolved statuses

    return { total, pending, resolved };
  };

  // Ensure filteredDisputes is always an array
  const filteredDisputes = Array.isArray(disputes) ? disputes : [];

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
           {/* Search input: chiếm 60% */}
           <div className="w-full md:w-[60%]">
             <div className="relative">
               <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
               <input
                 type="text"
                 placeholder="Tìm kiếm khiếu nại..."
                 value={filters.search}
                 onChange={(e) => setFilters(prev => ({ 
                   ...prev, 
                   search: e.target.value,
                   pageIndex: 1 // Reset to first page when search changes
                 }))}
                 className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
               />
             </div>
           </div>
           {/* Status filter: chiếm 40% */}
           <div className="w-full md:w-[40%] flex gap-4">
             <select
               value={filters.status}
               onChange={(e) => {
                 const status = e.target.value;
                 setFilters(prev => ({ 
                   ...prev, 
                   status: status,
                   resolutionFilter: status ? [parseInt(status)] : [],
                   pageIndex: 1 // Reset to first page when filter changes
                 }));
               }}
               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
             >
               <option value="">Tất cả trạng thái</option>
               {disputeMetadata?.DisputeStatus?.map(status => (
                 <option key={status.numericValue} value={status.numericValue}>
                   {status.description}
                 </option>
               ))}
             </select>
             <button
               onClick={resetFilters}
               className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center space-x-1"
             >
               <FaFilter className="w-4 h-4" />
               <span>Reset</span>
             </button>
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

      {/* Pagination Controls */}
      {filteredDisputes.length > 0 && (
        <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              Hiển thị {((filters.pageIndex - 1) * filters.pageSize) + 1} - {Math.min(filters.pageIndex * filters.pageSize, paginationInfo.totalItems)} của {paginationInfo.totalItems} khiếu nại
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFilters(prev => ({ ...prev, pageIndex: Math.max(1, prev.pageIndex - 1) }))}
              disabled={!paginationInfo.hasPreviousPage}
              className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trước
            </button>
            <span className="px-3 py-1 text-sm text-gray-600">
              Trang {filters.pageIndex} / {paginationInfo.totalPages}
            </span>
            <button
              onClick={() => setFilters(prev => ({ ...prev, pageIndex: prev.pageIndex + 1 }))}
              disabled={!paginationInfo.hasNextPage}
              className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau
            </button>
          </div>
        </div>
      )}

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
