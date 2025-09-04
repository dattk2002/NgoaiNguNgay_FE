import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaExclamationTriangle, 
  FaTimes, 
  FaClock, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaSpinner,
  FaCalendarAlt,
  FaUser,
  FaBook,
  FaPaperclip,
  FaDownload,
  FaUndo,
  FaLink,
  FaGraduationCap,
  FaMoneyBillWave,
  FaCheck
} from "react-icons/fa";
import { showSuccess, showError } from "../../utils/toastManager.js";
import { fetchLearnerDisputeDetail, fetchTutorDisputeDetail, fetchStaffDisputeDetail, withdrawDispute, fetchBookingInfo, fetchBookingBySlotId, respondToDispute, resolveDispute } from "../api/auth";

const DisputeDetailModal = ({ isOpen, onClose, dispute, disputeId, isTutorView = false, isStaffView = false, onDisputeUpdated, disputeMetadata: propDisputeMetadata }) => {
  const [disputeDetail, setDisputeDetail] = useState(null);
  const [bookingInfo, setBookingInfo] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isLoadingBooking, setIsLoadingBooking] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [disputeMetadata, setDisputeMetadata] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [tutorResponse, setTutorResponse] = useState('');
  const [tutorResponseType, setTutorResponseType] = useState('');
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [staffResolution, setStaffResolution] = useState(3); // Default to learner 100% refund (resolution = 3)
  const [staffNotes, setStaffNotes] = useState('');
  const [isResolvingDispute, setIsResolvingDispute] = useState(false);
  const [showResolveForm, setShowResolveForm] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    } else {
      // Reset states when modal closes
      setDisputeDetail(null);
      setBookingInfo(null);
      setDisputeMetadata(null);
    }
  }, [isOpen]);

  useEffect(() => {
    console.log("🔍 useEffect triggered - isOpen:", isOpen, "dispute:", dispute, "disputeId:", disputeId, "isStaffView:", isStaffView);
    console.log("🔍 Dispute object details:", {
      id: dispute?.id,
      caseNumber: dispute?.caseNumber,
      status: dispute?.status,
      learnerReason: dispute?.learnerReason
    });
    console.log("🔍 Dispute object full:", dispute);
    console.log("🔍 Dispute object type:", typeof dispute);
    console.log("🔍 Dispute object keys:", dispute ? Object.keys(dispute) : "null");
    
    if (isOpen && (dispute?.id || disputeId)) {
      console.log("🔍 Modal is open and has dispute ID, calling loadDisputeDetail...");
      loadDisputeDetail();
    } else if (isOpen) {
      console.log("🔍 Modal is open but no dispute ID found");
      console.log("🔍 Dispute prop:", dispute);
      console.log("🔍 DisputeId prop:", disputeId);
    }
  }, [isOpen, dispute, disputeId]);

  const loadBookingInfo = async (slotId) => {
    if (!slotId) {
      console.warn("No slot ID provided to load booking info.");
      return;
    }
    
    console.log("Loading booking info for slot ID:", slotId);
    setIsLoadingBooking(true);
    try {
      const response = await fetchBookingBySlotId(slotId);
      console.log("✅ Booking info loaded by slot ID:", response);
      setBookingInfo(response);
    } catch (error) {
      console.error("❌ Error loading booking info by slot ID:", error);
      // Don't show toast error for booking info as it's not critical
      setBookingInfo(null);
    } finally {
      setIsLoadingBooking(false);
    }
  };

  const loadDisputeDetail = async () => {
    const id = dispute?.id || disputeId;
    if (!id) {
      console.warn("No dispute ID provided to load detail.");
      return;
    }
    
    console.log("Loading dispute detail for ID:", id, "isTutorView:", isTutorView, "isStaffView:", isStaffView);
    console.log("🔍 Available tokens for dispute detail:", {
      staffToken: localStorage.getItem("staffToken") ? "Present" : "Not found",
      accessToken: localStorage.getItem("accessToken") ? "Present" : "Not found"
    });
    setIsLoadingDetail(true);
    try {
      let response;
      if (isStaffView) {
        console.log("🔍 Staff view - checking available data");
        console.log("🔍 Dispute prop:", dispute);
        console.log("🔍 Prop dispute metadata:", propDisputeMetadata);
        
        // For staff view, prioritize using data from props if available
        if (dispute && dispute.id) {
          console.log("🔍 Using dispute data from props:", dispute);
          response = {
            data: {
              dispute: dispute
            },
            additionalData: propDisputeMetadata || null
          };
          console.log("🔍 Created response from props for staff view:", response);
        } else {
          // Only fetch from API if no props data available
          console.log("🔍 No props data, fetching from API...");
          try {
            response = await fetchStaffDisputeDetail(id);
            console.log("🔍 Staff detail endpoint response:", response);
          } catch (staffDetailError) {
            console.log("🔍 Staff detail endpoint failed:", staffDetailError.message);
            
            // Try learner endpoint as last resort
            console.log("🔍 Trying learner detail endpoint as last resort...");
            response = await fetchLearnerDisputeDetail(id);
            console.log("🔍 Fallback to learner detail endpoint response:", response);
          }
        }
      } else if (isTutorView) {
        response = await fetchTutorDisputeDetail(id);
      } else {
        response = await fetchLearnerDisputeDetail(id);
      }
      
      console.log("Raw API response:", response);
      console.log("Response type:", typeof response);
      console.log("Response.data:", response?.data);
      console.log("Response.data.dispute:", response?.data?.dispute);
      console.log("Response.additionalData:", response?.additionalData);
      
      // Granular checks for debugging
      if (!response) {
        console.error("Invalid response: Response object is null/undefined.");
        throw new Error("Invalid response format: Response is empty.");
      }
      
      if (!response.data) {
        console.error("Invalid response: response.data is null/undefined.", response);
        throw new Error("Invalid response format: Data object is missing.");
      }
      
      if (!response.data.dispute) {
        console.error("Invalid response: response.data.dispute is null/undefined.", response.data);
        throw new Error("Invalid response format: Dispute object is missing.");
      }

      // If all checks pass, set the state
      setDisputeDetail(response.data.dispute);
      // Use prop disputeMetadata if available (for staff view), otherwise use response.additionalData
      setDisputeMetadata(propDisputeMetadata || response.additionalData);
      console.log("✅ Successfully set dispute detail:", response.data.dispute);
      console.log("✅ Successfully set dispute metadata:", propDisputeMetadata || response.additionalData);
      
      // Additional debugging for staff view
      if (isStaffView) {
        console.log("🔍 Staff view - dispute detail set successfully");
        console.log("🔍 Dispute ID:", response.data.dispute.id);
        console.log("🔍 Case Number:", response.data.dispute.caseNumber);
        console.log("🔍 Status:", response.data.dispute.status);
        console.log("🔍 Learner Reason:", response.data.dispute.learnerReason);
        console.log("🔍 Booking ID:", response.data.dispute.bookingId);
        console.log("🔍 Learner:", response.data.dispute.learner);
        console.log("🔍 Tutor:", response.data.dispute.tutor);
        console.log("🔍 Evidence URLs:", response.data.dispute.evidenceUrls);
      }
      
      // Debug: Check if this is a tutor view and log relevant fields
      if (isTutorView) {
        console.log("🔍 Tutor view - checking dispute fields:");
        console.log("- dispute.id:", response.data.dispute.id);
        console.log("- dispute.status:", response.data.dispute.status);
        console.log("- dispute.reconciliationEndTime:", response.data.dispute.reconciliationEndTime);
        console.log("- dispute.tutorResponse:", response.data.dispute.tutorResponse);
        console.log("- canRespondToDispute():", response.data.dispute.status === 0 && new Date() < new Date(response.data.dispute.reconciliationEndTime));
      }

      // Debug: Check if this is a staff view and log relevant fields
      if (isStaffView) {
        console.log("🔍 Staff view - checking dispute fields:");
        console.log("- dispute.id:", response.data.dispute.id);
        console.log("- dispute.status:", response.data.dispute.status);
        console.log("- dispute.learnerReason:", response.data.dispute.learnerReason);
        console.log("- dispute.tutorResponse:", response.data.dispute.tutorResponse);
        console.log("- canResolveDispute():", response.data.dispute.status === 3);
      }

      // Load booking information if bookedSlotId is available
      if (response.data.dispute.bookedSlotId) {
        await loadBookingInfo(response.data.dispute.bookedSlotId);
      }

    } catch (error) {
      console.error("❌ Error loading dispute detail:", error);
      console.error("❌ Error message:", error.message);
      console.error("❌ Error stack:", error.stack);
      console.error("❌ Error context:", {
        isStaffView,
        isTutorView,
        disputeId: dispute?.id || disputeId,
        hasDisputeProp: !!dispute,
        hasDisputeId: !!disputeId,
        disputePropKeys: dispute ? Object.keys(dispute) : [],
        disputePropValues: dispute ? Object.values(dispute) : []
      });
      
             // Fallback: If API fails and we have dispute data from props, use that
       if (isStaffView && dispute && dispute.id) {
         console.log("🔍 Using fallback dispute data from props due to API error");
         setDisputeDetail(dispute);
         setDisputeMetadata(propDisputeMetadata);
         
         // Load booking info if available
         if (dispute.bookedSlotId) {
           await loadBookingInfo(dispute.bookedSlotId);
         }
       } else if (dispute && dispute.id) {
         // General fallback for any view if we have dispute data from props
         console.log("🔍 Using general fallback dispute data from props");
         setDisputeDetail(dispute);
         setDisputeMetadata(propDisputeMetadata);
         
         // Load booking info if available
         if (dispute.bookedSlotId) {
           await loadBookingInfo(dispute.bookedSlotId);
         }
       } else {
         showError(error.message || "Không thể tải chi tiết báo cáo");
       }
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const getStatusInfo = (statusNumeric) => {
    if (!disputeMetadata || !disputeMetadata.DisputeStatus) {
      return { 
        text: "Không xác định", 
        color: "bg-gray-100 text-gray-800",
        icon: <FaExclamationTriangle className="w-4 h-4" />
      };
    }

    const status = disputeMetadata.DisputeStatus.find(s => s.numericValue === statusNumeric);
    if (!status) {
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

    return statusConfig[status.name] || {
      text: status.description,
      color: "bg-gray-100 text-gray-800",
      icon: <FaExclamationTriangle className="w-4 h-4" />
    };
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return "Invalid Date";
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

  const handleWithdrawDispute = async () => {
    if (!disputeDetail || !disputeDetail.id) {
      showError("Không thể rút báo cáo");
      return;
    }

    setShowConfirmModal(true);
  };

  const confirmWithdrawDispute = async () => {
    setIsWithdrawing(true);
    setShowConfirmModal(false);
    
    try {
      await withdrawDispute({ disputeId: disputeDetail.id });
      showSuccess("Đã rút báo cáo thành công!");
      
      // Refresh dispute detail
      await loadDisputeDetail();
      
      // Notify parent component to refresh dispute list
      onDisputeUpdated?.();
      
    } catch (error) {
      console.error("Error withdrawing dispute:", error);
      showError(error.message || "Có lỗi xảy ra khi rút báo cáo. Vui lòng thử lại.");
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleClose = () => {
    if (!isWithdrawing && !isSubmittingResponse && !isResolvingDispute) {
      onClose();
    }
  };

  // Tutor response functions
  const canRespondToDispute = () => {
    console.log("🔍 Checking if tutor can respond to dispute...");
    console.log("disputeDetail:", disputeDetail);
    
    if (!disputeDetail) {
      console.log("❌ No dispute detail available");
      return false;
    }
    
    console.log("disputeDetail.status:", disputeDetail.status);
    console.log("disputeDetail.reconciliationEndTime:", disputeDetail.reconciliationEndTime);
    
    // Can only respond if status is 0 (PendingReconciliation) and within 24 hours
    if (disputeDetail.status !== 0) {
      console.log("❌ Dispute status is not 0 (PendingReconciliation)");
      return false;
    }
    
    const now = new Date();
    
    // Check if reconciliationEndTime exists and is valid
    if (!disputeDetail.reconciliationEndTime) {
      console.log("❌ reconciliationEndTime is missing or null");
      return false;
    }
    
    let reconciliationEndTime;
    try {
      reconciliationEndTime = new Date(disputeDetail.reconciliationEndTime);
      if (isNaN(reconciliationEndTime.getTime())) {
        console.log("❌ reconciliationEndTime is not a valid date:", disputeDetail.reconciliationEndTime);
        return false;
      }
    } catch (error) {
      console.log("❌ Error parsing reconciliationEndTime:", error);
      return false;
    }
    
    console.log("Current time:", now);
    console.log("Reconciliation end time:", reconciliationEndTime);
    console.log("Can respond:", now < reconciliationEndTime);
    
    return now < reconciliationEndTime;
  };

  const handleSubmitResponse = async () => {
    console.log("🚀 handleSubmitResponse called");
    console.log("disputeDetail:", disputeDetail);
    console.log("tutorResponseType:", tutorResponseType);
    console.log("tutorResponse:", tutorResponse);
    
    if (!disputeDetail || !disputeDetail.id) {
      console.log("❌ No dispute detail or ID available");
      showError("Không thể gửi phản hồi");
      return;
    }

    if (!tutorResponseType) {
      console.log("❌ No response type selected");
      showError("Vui lòng chọn quyết định");
      return;
    }

    if (tutorResponseType === 'disagree' && tutorResponse.trim().length < 10) {
      console.log("❌ Response too short for disagree:", tutorResponse.trim().length);
      showError("Bằng chứng hỗ trợ phải có ít nhất 10 ký tự");
      return;
    }

    console.log("✅ Validation passed, submitting response...");
    setIsSubmittingResponse(true);
    try {
      // Map response type to the correct resolution value based on backend logic
      let resolutionValue = 0;
      let responseValue = '';
      
      if (tutorResponseType === 'agree_100') {
        resolutionValue = 7; // TutorFullRefund - 100% refund
        responseValue = 'Tôi đồng ý hoàn 100% tiền cho học viên. Xin lỗi vì sự bất tiện này.';
      } else if (tutorResponseType === 'propose_50') {
        resolutionValue = 6; // TutorPartialRefund - 50% refund
        responseValue = 'Tôi đề xuất hoàn 50% tiền cho học viên. Mong được xem xét và thông cảm.';
      } else if (tutorResponseType === 'disagree') {
        resolutionValue = 0; // None - no resolution yet, escalate to staff
        responseValue = tutorResponse.trim(); // Use the text evidence for disagree
      }

      const responseData = {
        disputeId: disputeDetail.id,
        response: responseValue,
        resolution: resolutionValue
      };
      console.log("📤 Sending response data:", responseData);
      
      const result = await respondToDispute(responseData);
      console.log("✅ Response submitted successfully:", result);
      
      // Hiển thị toast thông báo thành công
      showSuccess("Phản hồi đã được gửi thành công! Học viên sẽ được thông báo về quyết định của bạn.");
      setTutorResponse('');
      setTutorResponseType('');
      setShowResponseForm(false);
      
      // Refresh dispute detail
      await loadDisputeDetail();
      
      // Notify parent component to refresh dispute list
      onDisputeUpdated?.();
      
      // Close modal after successful response
      onClose();
      
    } catch (error) {
      console.error("❌ Error submitting response:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      showError(error.message || "Có lỗi xảy ra khi gửi phản hồi. Vui lòng thử lại.");
    } finally {
      setIsSubmittingResponse(false);
    }
  };

  // Staff resolve functions
  const canResolveDispute = () => {
    if (!disputeDetail) return false;
    
    // Can only resolve if status is 3 (AwaitingStaffReview)
    return disputeDetail.status === 3;
  };

  const handleResolveDispute = async () => {
    if (!disputeDetail || !disputeDetail.id) {
      showError("Không thể giải quyết báo cáo");
      return;
    }

    if (!staffNotes.trim()) {
      showError("Vui lòng nhập ghi chú giải quyết");
      return;
    }

    setIsResolvingDispute(true);
    try {
      const resolveData = {
        disputeId: disputeDetail.id,
        resolution: staffResolution,
        notes: staffNotes.trim()
      };
      console.log("📤 Sending resolve data:", resolveData);
      
      const result = await resolveDispute(resolveData);
      console.log("✅ Dispute resolved successfully:", result);
      
      showSuccess("Đã giải quyết báo cáo thành công!");
      setStaffNotes('');
      setShowResolveForm(false);
      
      // Refresh dispute detail
      await loadDisputeDetail();
      
      // Notify parent component to refresh dispute list
      onDisputeUpdated?.();
      
      // Close modal after successful resolution
      onClose();
      
    } catch (error) {
      console.error("❌ Error resolving dispute:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      showError(error.message || "Có lỗi xảy ra khi giải quyết báo cáo. Vui lòng thử lại.");
    } finally {
      setIsResolvingDispute(false);
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 }
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  console.log("🔍 Modal render check - isOpen:", isOpen, "disputeDetail:", disputeDetail, "isLoadingDetail:", isLoadingDetail);
  console.log("🔍 Modal props check - dispute:", dispute, "disputeId:", disputeId, "isStaffView:", isStaffView, "propDisputeMetadata:", propDisputeMetadata);
  console.log("🔍 DisputeDetail object keys:", disputeDetail ? Object.keys(disputeDetail) : "null");
  console.log("🔍 DisputeDetail values:", disputeDetail ? Object.values(disputeDetail) : "null");
  
  // Additional debugging for staff view
  if (isStaffView && disputeDetail) {
    console.log("🔍 Staff view - disputeDetail debugging:");
    console.log("- ID:", disputeDetail.id);
    console.log("- Case Number:", disputeDetail.caseNumber);
    console.log("- Status:", disputeDetail.status);
    console.log("- Learner Reason:", disputeDetail.learnerReason);
    console.log("- Tutor Response:", disputeDetail.tutorResponse);
    console.log("- Booking ID:", disputeDetail.bookingId);
    console.log("- Learner:", disputeDetail.learner);
    console.log("- Tutor:", disputeDetail.tutor);
    console.log("- Evidence URLs:", disputeDetail.evidenceUrls);
  }
  
  // Safety check: Don't render if modal is not open
  if (!isOpen) return null;
  
  // Safety check: Show loading if still loading
  if (isLoadingDetail || isLoadingBooking) {
    return (
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={backdropVariants}
        >
          <motion.div
            className="bg-white rounded-xl shadow-2xl w-full max-w-4xl p-8"
            variants={modalVariants}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="flex items-center justify-center space-x-3">
              <FaSpinner className="w-6 h-6 text-blue-600 animate-spin" />
              <span className="text-lg font-medium text-gray-700">
                {isLoadingDetail ? "Đang tải chi tiết báo cáo..." : "Đang tải thông tin khóa học..."}
              </span>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }
  
  // Safety check: If disputeDetail is null but we have dispute props, use props data
  const displayDispute = disputeDetail || dispute;
  const displayMetadata = disputeMetadata || propDisputeMetadata;

  // Show modal even if disputeDetail is null (for error cases)
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4"
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={backdropVariants}
        onClick={handleClose}
      >
        <motion.div
          ref={modalRef}
          className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          variants={modalVariants}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <FaExclamationTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Chi tiết báo cáo</h3>
                <p className="text-sm text-gray-500">
                  Mã báo cáo: {displayDispute?.caseNumber || displayDispute?.id || "N/A"}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isWithdrawing}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <FaTimes className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                         {!displayDispute ? (
              <div className="text-center py-12">
                <FaExclamationTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Không thể tải chi tiết báo cáo
                </h3>
                <p className="text-gray-500">
                  Vui lòng thử lại sau hoặc liên hệ hỗ trợ nếu vấn đề vẫn tiếp tục.
                </p>
                <button
                  onClick={loadDisputeDetail}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Thử lại
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Status and Basic Info */}
                                 {(() => {
                   const statusInfo = getStatusInfo(displayDispute.status);
                   // Chỉ cho phép rút báo cáo khi là học viên (không phải tutor) và trạng thái là PendingReconciliation
                   const canWithdraw = displayDispute.status === 0 && !isTutorView && !isStaffView;
                  return (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 text-sm rounded-full font-medium flex items-center gap-2 ${statusInfo.color}`}>
                          {statusInfo.icon}
                          {statusInfo.text}
                        </span>
                                                 <span className="text-sm text-gray-500">
                           Tạo lúc: {formatDate(displayDispute.createdAt)}
                         </span>
                      </div>
                      {canWithdraw && (
                        <button
                          onClick={handleWithdrawDispute}
                          disabled={isWithdrawing}
                          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                        >
                          {isWithdrawing ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Đang rút...
                            </>
                          ) : (
                            <>
                              <FaUndo className="w-4 h-4" />
                              Rút báo cáo
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  );
                })()}

                {/* User Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Learner Info */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                      <FaUser className="w-4 h-4" />
                      Thông tin học viên
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600">Tên:</span>
                                                 <span className="ml-2 font-medium text-black">{displayDispute.learner?.fullName || "N/A"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tutor Info */}
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                      <FaUser className="w-4 h-4" />
                      Thông tin giáo viên
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600">Tên:</span>
                                                 <span className="ml-2 font-medium text-black">{displayDispute.tutor?.fullName || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Booking Information */}
                <div className="bg-orange-50 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
                    <FaGraduationCap className="w-4 h-4" />
                    Thông tin slot học bị báo cáo
                  </h4>
                  {isLoadingBooking ? (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FaSpinner className="w-4 h-4 animate-spin" />
                      Đang tải thông tin khóa học...
                    </div>
                  ) : bookingInfo ? (
                    <div className="space-y-4">
                      {/* Basic Booking Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Tên khóa học:</span>
                          <span className="ml-2 font-medium text-black">{bookingInfo.lessonSnapshot?.name || "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Ngôn ngữ:</span>
                          <span className="ml-2 font-medium text-black">{bookingInfo.lessonSnapshot?.languageCode?.toUpperCase() || "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Thể loại:</span>
                          <span className="ml-2 font-medium text-black">{bookingInfo.lessonSnapshot?.category || "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Thời lượng:</span>
                          <span className="ml-2 font-medium text-black">{bookingInfo.lessonSnapshot?.durationInMinutes || "N/A"} phút</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Giá mỗi buổi:</span>
                          <span className="ml-2 font-medium text-orange-600">
                            {bookingInfo.lessonSnapshot?.price ? `${bookingInfo.lessonSnapshot.price.toLocaleString('vi-VN')}VNĐ` : "N/A"}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Tổng tiền:</span>
                          <span className="ml-2 font-medium text-orange-600">
                            {bookingInfo.totalPrice ? `${bookingInfo.totalPrice.toLocaleString('vi-VN')}đ` : "N/A"}
                          </span>
                        </div>
                      </div>
                      
                      {/* Tutor and Learner Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Giáo viên:</span>
                          <span className="ml-2 font-medium text-black">{bookingInfo.tutorName || "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Học viên:</span>
                          <span className="ml-2 font-medium text-black">{bookingInfo.learnerName || "N/A"}</span>
                        </div>
                      </div>
                      
                      {/* Booking Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Số buổi học:</span>
                          <span className="ml-2 font-medium text-black">{bookingInfo.bookedSlots?.length || 0} buổi</span>
                        </div>
                        {bookingInfo.createdTime && (
                          <div>
                            <span className="text-gray-600">Ngày tạo booking:</span>
                            <span className="ml-2 font-medium text-black">
                              {new Date(bookingInfo.createdTime).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Lesson Description */}
                      {bookingInfo.lessonSnapshot?.description && (
                        <div>
                          <span className="text-gray-600">Mô tả khóa học:</span>
                          <p className="mt-1 text-sm text-gray-800 bg-gray-50 p-2 rounded">
                            {bookingInfo.lessonSnapshot.description}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">
                                             Mã slot booking: {displayDispute.bookedSlotId || "N/A"}
                    </div>
                  )}
                </div>

                {/* Dispute Details */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FaExclamationTriangle className="w-4 h-4" />
                    Chi tiết báo cáo
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Lý do:</span>
                      <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">
                        {getReasonLabel(displayDispute.reason || displayDispute.learnerReason)}
                      </p>
                    </div>
                    {displayDispute.tutorResponse && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Phản hồi của giáo viên:</span>
                        <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">{displayDispute.tutorResponse}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Evidence URLs and Description */}
                {(() => {
                  // Debug logging for all possible evidence fields
                  console.log("🔍 Evidence Debug - All fields:", {
                    evidenceUrls: displayDispute.evidenceUrls,
                    evidenceUrlsType: typeof displayDispute.evidenceUrls,
                    evidenceUrlsLength: displayDispute.evidenceUrls?.length,
                    evidenceUrlsArray: Array.isArray(displayDispute.evidenceUrls),
                    // Check other possible fields
                    evidence: displayDispute.evidence,
                    evidenceLinks: displayDispute.evidenceLinks,
                    supportInfo: displayDispute.supportInfo,
                    attachments: displayDispute.attachments,
                    // Check if there are any other fields that might contain URLs
                    allKeys: Object.keys(displayDispute || {})
                  });
                  
                  // Try multiple possible fields for evidence URLs
                  let evidenceData = null;
                  
                  if (displayDispute.evidenceUrls && Array.isArray(displayDispute.evidenceUrls)) {
                    evidenceData = displayDispute.evidenceUrls;
                  } else if (displayDispute.evidence && Array.isArray(displayDispute.evidence)) {
                    evidenceData = displayDispute.evidence;
                  } else if (displayDispute.evidenceLinks && Array.isArray(displayDispute.evidenceLinks)) {
                    evidenceData = displayDispute.evidenceLinks;
                  } else if (displayDispute.attachments && Array.isArray(displayDispute.attachments)) {
                    evidenceData = displayDispute.attachments;
                  } else if (displayDispute.supportInfo && Array.isArray(displayDispute.supportInfo)) {
                    evidenceData = displayDispute.supportInfo;
                  }
                  
                  console.log("🔍 Evidence data found:", evidenceData);
                  
                  // Check if we have evidence data
                  const hasEvidenceData = evidenceData && Array.isArray(evidenceData) && evidenceData.length > 0;
                  
                  if (!hasEvidenceData) {
                    console.log("🔍 No evidence data found in any field");
                    return null;
                  }
                  
                  // Filter and map evidence URLs
                  const validUrls = evidenceData.filter(item => {
                    if (!item || typeof item !== 'string') return false;
                    // More flexible URL detection
                    const isUrl = item.startsWith('http://') || 
                                 item.startsWith('https://') || 
                                 item.startsWith('www.') ||
                                 item.includes('.') && (item.includes('://') || item.includes('www.'));
                    console.log("🔍 URL check:", { item, isUrl });
                    return isUrl;
                  });
                  
                  console.log("🔍 Valid URLs found:", validUrls);
                  
                  if (validUrls.length === 0) {
                    console.log("🔍 No valid URLs found after filtering");
                    return null;
                  }
                  
                  return (
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                        <FaPaperclip className="w-4 h-4" />
                        Thông tin hỗ trợ
                      </h4>
                      <div className="space-y-2">
                        {validUrls.map((item, index) => {
                          // Ensure URL has protocol
                          let url = item;
                          if (!url.startsWith('http://') && !url.startsWith('https://')) {
                            url = url.startsWith('www.') ? `https://${url}` : `https://${url}`;
                          }
                          
                          return (
                            <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <FaLink className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm font-medium text-blue-600 hover:text-blue-700 truncate"
                                >
                                  {item}
                                </a>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* Timeline Information */}
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                    <FaCalendarAlt className="w-4 h-4" />
                    Thông tin thời gian
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Thời gian hòa giải kết thúc:</span>
                                             <span className="ml-2 font-medium text-black">{formatDate(displayDispute.reconciliationEndTime)}</span>
                    </div>
                                         {displayDispute.tutorRespondedAt && (
                       <div>
                         <span className="text-gray-600">Giáo viên phản hồi lúc:</span>
                         <span className="ml-2 font-medium text-black">{formatDate(displayDispute.tutorRespondedAt)}</span>
                       </div>
                     )}
                     {displayDispute.staffReviewEndTime && (
                       <div>
                         <span className="text-gray-600">Thời gian xem xét kết thúc:</span>
                         <span className="ml-2 font-medium text-black">{formatDate(displayDispute.staffReviewEndTime)}</span>
                       </div>
                     )}
                     {displayDispute.resolvedAt && (
                       <div>
                         <span className="text-gray-600">Giải quyết lúc:</span>
                         <span className="ml-2 font-medium text-black">{formatDate(displayDispute.resolvedAt)}</span>
                       </div>
                     )}
                  </div>
                </div>

                {/* Staff Notes (if any) */}
                                 {displayDispute.staffNotes && (
                   <div className="bg-yellow-50 rounded-lg p-4">
                     <h4 className="font-semibold text-yellow-900 mb-3 flex items-center gap-2">
                       <FaExclamationTriangle className="w-4 h-4" />
                       Ghi chú của nhân viên
                     </h4>
                     <p className="text-sm text-gray-900 whitespace-pre-wrap">{displayDispute.staffNotes}</p>
                   </div>
                 )}

                                 {/* Tutor Response Section - Only show in tutor view when can respond */}
                 {isTutorView && canRespondToDispute() && !displayDispute.tutorResponse && (
                   <div className="bg-blue-50 rounded-lg p-4">
                     <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                       <FaUser className="w-4 h-4" />
                       Phản hồi báo cáo
                     </h4>
                     
                     <div className="space-y-4">
                       {!showResponseForm ? (
                         <button
                           onClick={() => setShowResponseForm(true)}
                           className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                         >
                           Phản hồi báo cáo
                         </button>
                       ) : (
                         <div className="space-y-4">
                           <div>
                             <label className="block text-sm font-medium text-gray-700 mb-3">
                               Chọn quyết định <span className="text-red-500">*</span>
                             </label>
                             <div className="space-y-3">
                               <label className="flex items-center space-x-3 cursor-pointer">
                                 <input
                                   type="radio"
                                   name="tutorResponseType"
                                   value="agree_100"
                                   checked={tutorResponseType === 'agree_100'}
                                   onChange={(e) => setTutorResponseType(e.target.value)}
                                   disabled={isSubmittingResponse}
                                   className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                                 />
                                 <div>
                                   <span className="text-sm font-medium text-gray-900">Đồng ý hoàn 100% cho học viên</span>
                                   <p className="text-xs text-gray-600">Slot sẽ chuyển sang trạng thái hủy bỏ</p>
                                 </div>
                               </label>
                               
                               <label className="flex items-center space-x-3 cursor-pointer">
                                 <input
                                   type="radio"
                                   name="tutorResponseType"
                                   value="propose_50"
                                   checked={tutorResponseType === 'propose_50'}
                                   onChange={(e) => setTutorResponseType(e.target.value)}
                                   disabled={isSubmittingResponse}
                                   className="w-4 h-4 text-yellow-600 border-gray-300 focus:ring-yellow-500"
                                 />
                                 <div>
                                   <span className="text-sm font-medium text-gray-900">Đề xuất hoàn 50% cho học viên</span>
                                   <p className="text-xs text-gray-600">Slot sẽ chuyển sang trạng thái hủy bỏ</p>
                                 </div>
                               </label>
                               
                               <label className="flex items-center space-x-3 cursor-pointer">
                                 <input
                                   type="radio"
                                   name="tutorResponseType"
                                   value="disagree"
                                   checked={tutorResponseType === 'disagree'}
                                   onChange={(e) => setTutorResponseType(e.target.value)}
                                   disabled={isSubmittingResponse}
                                   className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                                 />
                                 <div>
                                   <span className="text-sm font-medium text-gray-900">Không đồng ý & Chuyển lên Staff</span>
                                   <p className="text-xs text-gray-600">Cung cấp bằng chứng và chuyển cho đội ngũ Staff xử lý</p>
                                 </div>
                               </label>
                             </div>
                           </div>
                           
                           {tutorResponseType === 'disagree' && (
                             <div>
                               <label className="block text-sm font-medium text-gray-700 mb-2">
                                 Bằng chứng hỗ trợ <span className="text-red-500">*</span>
                               </label>
                               <textarea
                                 value={tutorResponse}
                                 onChange={(e) => setTutorResponse(e.target.value)}
                                 placeholder="Cung cấp bằng chứng (link video ghi hình, tài liệu...) để chứng minh..."
                                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-black"
                                 rows={4}
                                 maxLength={1000}
                               />
                               <div className="flex justify-between items-center mt-1">
                                 <span className="text-xs text-gray-500">
                                   {tutorResponse.length}/1000 ký tự
                                 </span>
                                 <span className={`text-xs ${tutorResponse.length >= 10 ? 'text-green-600' : 'text-red-500'}`}>
                                   {tutorResponse.length >= 10 ? '✓ Đủ ký tự' : 'Cần ít nhất 10 ký tự'}
                                 </span>
                               </div>
                             </div>
                           )}
                           
                           <div className="flex gap-2">
                             <button
                               onClick={handleSubmitResponse}
                               disabled={!tutorResponseType || (tutorResponseType === 'disagree' && tutorResponse.trim().length < 10) || isSubmittingResponse}
                               className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                             >
                               {isSubmittingResponse ? (
                                 <>
                                   <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                   Đang gửi...
                                 </>
                               ) : (
                                 <>
                                   <FaCheck className="w-4 h-4" />
                                   Gửi phản hồi
                                 </>
                               )}
                             </button>
                             <button
                               onClick={() => {
                                 setShowResponseForm(false);
                                 setTutorResponse('');
                                 setTutorResponseType('');
                               }}
                               disabled={isSubmittingResponse}
                               className="px-4 py-2 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                             >
                               Hủy
                             </button>
                           </div>
                         </div>
                       )}
                       <div className="text-xs text-gray-600 bg-blue-100 rounded-lg p-3">
                         <p className="font-medium mb-1">Lưu ý:</p>
                         <ul className="space-y-1">
                           <li>• Bạn chỉ có thể phản hồi trong vòng 24 giờ kể từ khi nhận báo cáo</li>
                           <li>• Nếu không phản hồi sau 24 giờ, hệ thống tự động hoàn 100% cho học viên</li>
                           <li>• Sau khi gửi phản hồi, bạn không thể chỉnh sửa</li>
                         </ul>
                       </div>
                     </div>
                   </div>
                 )}
               </div>
             )}

             {/* Staff Resolution Section - Only show in staff view */}
             {isStaffView && (
               <div className="bg-purple-50 rounded-lg p-4">
                 <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                   <FaExclamationTriangle className="w-4 h-4" />
                   Giải quyết báo cáo
                 </h4>
                 
                 {displayDispute.resolution && displayDispute.resolution !== 0 ? (
                   <div className="bg-white rounded-lg p-4 border border-purple-200">
                     <div className="mb-3">
                       <span className="text-sm font-medium text-gray-700">Quyết định:</span>
                       <span className="ml-2 text-sm text-gray-900">
                         {displayDispute.resolution === 3 && 'Hoàn 100% cho học viên'}
                         {displayDispute.resolution === 5 && 'Hoàn 50% cho học viên, 50% cho gia sư'}
                         {displayDispute.resolution === 4 && 'Bác bỏ báo cáo, trả 100% cho gia sư'}
                       </span>
                     </div>
                     {displayDispute.staffNotes && (
                       <div>
                         <span className="text-sm font-medium text-gray-700">Ghi chú:</span>
                         <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">{displayDispute.staffNotes}</p>
                       </div>
                     )}
                     {displayDispute.resolvedAt && (
                       <p className="text-xs text-gray-500 mt-2">
                         Giải quyết lúc: {formatDate(displayDispute.resolvedAt)}
                       </p>
                     )}
                   </div>
                 ) : canResolveDispute() ? (
                   <div className="space-y-4">
                     {!showResolveForm ? (
                       <button
                         onClick={() => setShowResolveForm(true)}
                         className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                       >
                         Giải quyết báo cáo
                       </button>
                     ) : (
                       <div className="space-y-4">
                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-3">
                             Chọn quyết định <span className="text-red-500">*</span>
                           </label>
                                                        <div className="space-y-3">
                               <label className="flex items-center space-x-3 cursor-pointer">
                                 <input
                                   type="radio"
                                   name="staffResolution"
                                   value="3"
                                   checked={staffResolution === 3}
                                   onChange={(e) => setStaffResolution(parseInt(e.target.value))}
                                   disabled={isResolvingDispute}
                                   className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                                 />
                                 <div>
                                   <span className="text-sm font-medium text-gray-900">Hoàn 100% cho học viên</span>
                                   <p className="text-xs text-gray-600">Slot chuyển sang trạng thái hủy bỏ</p>
                                 </div>
                               </label>
                               
                               <label className="flex items-center space-x-3 cursor-pointer">
                                 <input
                                   type="radio"
                                   name="staffResolution"
                                   value="5"
                                   checked={staffResolution === 5}
                                   onChange={(e) => setStaffResolution(parseInt(e.target.value))}
                                   disabled={isResolvingDispute}
                                   className="w-4 h-4 text-yellow-600 border-gray-300 focus:ring-yellow-500"
                                 />
                                 <div>
                                   <span className="text-sm font-medium text-gray-900">Hoàn 50% cho học viên, 50% cho gia sư</span>
                                   <p className="text-xs text-gray-600">Slot chuyển sang trạng thái hủy bỏ</p>
                                 </div>
                               </label>
                               
                               <label className="flex items-center space-x-3 cursor-pointer">
                                 <input
                                   type="radio"
                                   name="staffResolution"
                                   value="4"
                                   checked={staffResolution === 4}
                                   onChange={(e) => setStaffResolution(parseInt(e.target.value))}
                                   disabled={isResolvingDispute}
                                   className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                                 />
                                 <div>
                                   <span className="text-sm font-medium text-gray-900">Bác bỏ báo cáo, trả 100% cho gia sư</span>
                                   <p className="text-xs text-gray-600">Slot chuyển sang trạng thái chờ thanh toán</p>
                                 </div>
                               </label>
                             </div>
                         </div>
                         
                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">
                             Ghi chú giải quyết <span className="text-red-500">*</span>
                           </label>
                           <textarea
                             value={staffNotes}
                             onChange={(e) => setStaffNotes(e.target.value)}
                             placeholder="Nhập ghi chú giải quyết báo cáo..."
                             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-black"
                             rows={4}
                             maxLength={1000}
                           />
                           <div className="flex justify-between items-center mt-1">
                             <span className="text-xs text-gray-500">
                               {staffNotes.length}/1000 ký tự
                             </span>
                           </div>
                         </div>
                         
                         <div className="flex gap-2">
                           <button
                             onClick={handleResolveDispute}
                             disabled={!staffResolution || !staffNotes.trim() || isResolvingDispute}
                             className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                           >
                             {isResolvingDispute ? (
                               <>
                                 <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                 Đang xử lý...
                               </>
                             ) : (
                               <>
                                 <FaCheck className="w-4 h-4" />
                                 Giải quyết
                               </>
                             )}
                           </button>
                           <button
                             onClick={() => {
                               setShowResolveForm(false);
                               setStaffNotes('');
                               setStaffResolution(3);
                             }}
                             disabled={isResolvingDispute}
                             className="px-4 py-2 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                           >
                             Hủy
                           </button>
                         </div>
                       </div>
                     )}
                     <div className="text-xs text-gray-600 bg-purple-100 rounded-lg p-3">
                       <p className="font-medium mb-1">Lưu ý:</p>
                       <ul className="space-y-1">
                         <li>• Chỉ có thể giải quyết báo cáo đang chờ xem xét</li>
                         <li>• Quyết định sẽ được gửi đến cả học viên và gia sư</li>
                         <li>• Nếu không xử lý sau 24 giờ, hệ thống tự động phân xử 50/50</li>
                         <li>• Ghi chú giải quyết là bắt buộc</li>
                       </ul>
                     </div>
                   </div>
                 ) : (
                   <div className="text-sm text-gray-600">
                     {displayDispute.status !== 3 ? (
                       <p>Không thể giải quyết báo cáo này vì không ở trạng thái chờ xem xét.</p>
                     ) : (
                       <p>Báo cáo này đã được giải quyết.</p>
                     )}
                   </div>
                 )}
               </div>
             )}
           </div>
         </motion.div>
       </motion.div>

      {/* Confirm Withdraw Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000] p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <FaExclamationTriangle className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Xác nhận rút báo cáo</h3>
                  <p className="text-sm text-gray-500">Mã báo cáo: {displayDispute?.caseNumber || "N/A"}</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6">
                Bạn có chắc chắn muốn rút báo cáo này? Hành động này không thể hoàn tác.
              </p>
              
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  disabled={isWithdrawing}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  onClick={confirmWithdrawDispute}
                  disabled={isWithdrawing}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isWithdrawing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <FaUndo className="w-4 h-4" />
                      Rút báo cáo
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
};

export default DisputeDetailModal;
