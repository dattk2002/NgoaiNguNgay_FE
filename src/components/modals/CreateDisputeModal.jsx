import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaExclamationTriangle, FaPaperclip, FaTimes, FaUpload, FaTrash, FaLink, FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";
import { createDispute } from "../api/auth";
import LegalDocumentModal from "./LegalDocumentModal";

const CreateDisputeModal = ({ isOpen, onClose, bookingData, booking, onSuccess }) => {
  const [formData, setFormData] = useState({
    reason: "",
    description: "",
    evidence: [],
    evidenceUrls: []
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const fileInputRef = useRef(null);
  const modalRef = useRef(null);
  
  // Add legal document modal state
  const [showLegalDocumentModal, setShowLegalDocumentModal] = useState(false);

  const disputeReasons = [
    { value: "Giáo viên vắng mặt không thông báo trước", label: "Vắng mặt" },
    { value: "Giáo viên đến muộn quá 15 phút", label: "Trễ" },
    { value: "Vấn đề khác cần báo cáo", label: "Khác" }
  ];

  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors = {};
    
    console.log("🔍 Validating form data:", {
      reason: formData.reason,
      description: formData.description,
      descriptionLength: formData.description?.length,
      descriptionTrimLength: formData.description?.trim().length
    });

    if (!formData.reason) {
      newErrors.reason = "Vui lòng chọn lý do báo cáo";
    }

    // Bỏ validation description vì server sẽ validate evidenceUrls
    // if (!formData.description) {
    //   newErrors.description = "Vui lòng nhập mô tả chi tiết";
    // } else if (formData.description.trim().length < 10) {
    //   newErrors.description = "Mô tả chi tiết phải có ít nhất 10 ký tự";
    // }

    console.log("🔍 Validation errors:", newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const addEvidence = () => {
    if (!newUrl.trim()) {
      toast.error("Vui lòng nhập thông tin");
      return;
    }

    if (formData.evidenceUrls.includes(newUrl.trim())) {
      toast.error("Thông tin này đã được thêm");
      return;
    }

    setFormData(prev => ({
      ...prev,
      evidenceUrls: [...prev.evidenceUrls, newUrl.trim()]
    }));
    setNewUrl("");
  };

  const removeEvidence = (index) => {
    setFormData(prev => ({
      ...prev,
      evidenceUrls: prev.evidenceUrls.filter((_, i) => i !== index)
    }));
  };

  const handleFileSelect = (files) => {
    const validFiles = Array.from(files).filter(file => {
      const isValidType = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'video/mp4'].includes(file.type);
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
      
      if (!isValidType) {
        toast.error(`File ${file.name} không được hỗ trợ. Chỉ chấp nhận: JPG, PNG, GIF, PDF, MP4`);
      }
      if (!isValidSize) {
        toast.error(`File ${file.name} quá lớn. Kích thước tối đa: 10MB`);
      }
      
      return isValidType && isValidSize;
    });

    if (validFiles.length + formData.evidence.length > 5) {
      toast.error("Tối đa 5 file được phép upload");
      return;
    }

    setFormData(prev => ({
      ...prev,
      evidence: [...prev.evidence, ...validFiles]
    }));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const removeFile = (index) => {
    setFormData(prev => ({
      ...prev,
      evidence: prev.evidence.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Combine file names, URLs, and description
      const fileUrls = formData.evidence.map(file => file.name);
      const allEvidenceUrls = [...fileUrls, ...formData.evidenceUrls, formData.description];
      
      const disputeData = {
        bookedSlotId: displayData.bookedSlotId, // Sử dụng bookedSlotId thay vì bookingId
        reason: formData.reason,
        evidenceUrls: allEvidenceUrls
      };

      await createDispute(disputeData);
      
      toast.success("Báo cáo đã được gửi thành công!");
      onSuccess?.();
      handleClose();
      
    } catch (error) {
      toast.error(error.message || "Có lỗi xảy ra khi gửi báo cáo. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({ reason: "", description: "", evidence: [], evidenceUrls: [] });
      setErrors({});
      setNewUrl("");
      onClose();
    }
  };

  // Handler to open legal document modal
  const handleLegalDocumentClick = (e) => {
    e.preventDefault();
    setShowLegalDocumentModal(true);
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

  // Use bookingData or booking prop, whichever is available
  const displayData = bookingData || booking;
  
  // Extract slot details from the new structure
  const slotDetails = displayData?.slot || displayData;
  
  // Debug logging
  console.log("🔍 CreateDisputeModal - bookingData:", bookingData);
  console.log("🔍 CreateDisputeModal - booking:", booking);
  console.log("🔍 CreateDisputeModal - displayData:", displayData);
  console.log("🔍 CreateDisputeModal - slotDetails:", slotDetails);
  console.log("🔍 CreateDisputeModal - bookedSlotId:", displayData?.bookedSlotId);
  
  if (!isOpen) return null;

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
          className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
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
                <h3 className="text-xl font-semibold text-gray-900">Tạo báo cáo</h3>
                <p className="text-sm text-gray-500">
                  Slot học: {displayData?.lessonName || slotDetails?.lessonName || "N/A"}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <FaTimes className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Booking Info */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Thông tin slot học</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Giáo viên:</span>
                    <span className="ml-2 font-medium text-black">{displayData?.tutorName || displayData?.tutor?.fullName || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Slot số:</span>
                    <span className="ml-2 font-medium text-black">
                      {displayData?.slotNumber || slotDetails?.slotIndex || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Ngày học:</span>
                    <span className="ml-2 font-medium text-black">
                      {slotDetails?.bookedDate ? new Date(slotDetails.bookedDate).toLocaleDateString('vi-VN') : "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Trạng thái:</span>
                    <span className="ml-2 font-medium text-green-600">
                      Hoàn thành
                    </span>
                  </div>
                </div>
              </div>



              {/* Reason Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Lý do báo cáo <span className="text-red-500">*</span>
                </label>
                <div className="space-y-3">
                  {disputeReasons.map((reason) => (
                    <label key={reason.value} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="reason"
                        value={reason.value}
                        checked={formData.reason === reason.value}
                        onChange={(e) => handleInputChange("reason", e.target.value)}
                        disabled={isSubmitting}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-900">{reason.label}</span>
                    </label>
                  ))}
                </div>
                {errors.reason && (
                  <p className="text-sm text-red-600 mt-1">{errors.reason}</p>
                )}
              </div>

              {/* Description Details */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả chi tiết <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={4}
                  placeholder="Vui lòng mô tả chi tiết vấn đề bạn gặp phải (tối thiểu 10 ký tự)..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-black"
                  disabled={isSubmitting}
                />
                <div className="flex justify-between items-center mt-1">
                  {/* Bỏ validation error display */}
                  <p className="text-sm text-gray-500 ml-auto text-black">
                    {formData.description.length}/500
                  </p>
                </div>
              </div>



                             {/* Evidence Input */}
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   Thông tin hỗ trợ
                 </label>
                 <div className="space-y-3">
                   <div className="flex gap-2">
                     <input
                       type="text"
                       value={newUrl}
                       onChange={(e) => setNewUrl(e.target.value)}
                       placeholder="Nhập thông tin hỗ trợ (link, mô tả, bằng chứng...)"
                       className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                       disabled={isSubmitting}
                       onKeyPress={(e) => {
                         if (e.key === 'Enter') {
                           e.preventDefault();
                           addEvidence();
                         }
                       }}
                     />
                     <button
                       type="button"
                       onClick={addEvidence}
                       disabled={isSubmitting || !newUrl.trim()}
                       className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                     >
                       <FaPlus className="w-4 h-4" />
                       Thêm
                     </button>
                   </div>
                   
                   {/* Evidence List */}
                   {formData.evidenceUrls.length > 0 && (
                     <div className="space-y-2">
                       {formData.evidenceUrls.map((evidence, index) => {
                         // Check if it's a URL
                         const isUrl = evidence.startsWith('http://') || evidence.startsWith('https://');
                         return (
                           <div
                             key={index}
                             className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
                           >
                             <div className="flex items-center gap-3 flex-1">
                               {isUrl ? (
                                 <FaLink className="w-4 h-4 text-blue-500 flex-shrink-0" />
                               ) : (
                                 <FaPaperclip className="w-4 h-4 text-green-500 flex-shrink-0" />
                               )}
                               {isUrl ? (
                                 <a
                                   href={evidence}
                                   target="_blank"
                                   rel="noopener noreferrer"
                                   className="text-sm font-medium text-blue-600 hover:text-blue-700 truncate"
                                 >
                                   {evidence}
                                 </a>
                               ) : (
                                 <span className="text-sm font-medium text-gray-900 break-words">
                                   {evidence}
                                 </span>
                               )}
                             </div>
                             <button
                               type="button"
                               onClick={() => removeEvidence(index)}
                               disabled={isSubmitting}
                               className="p-1 hover:bg-red-100 rounded text-red-600 disabled:opacity-50 flex-shrink-0"
                             >
                               <FaTrash className="w-4 h-4" />
                             </button>
                           </div>
                         );
                       })}
                     </div>
                   )}
                 </div>
               </div>

              {/* Legal terms notice */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FaLink className="w-3 h-3 text-blue-600" />
                  </div>
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Điều khoản dịch vụ</p>
                    <p>
                      <button
                        type="button"
                        onClick={handleLegalDocumentClick}
                        className="text-blue-600 underline hover:text-blue-800 font-medium"
                      >
                        Điều khoản dịch vụ và Chính sách
                      </button>
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Đang gửi...
                    </>
                  ) : (
                    <>
                                        <FaExclamationTriangle className="w-4 h-4" />
                  Gửi báo cáo
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>

      {/* Legal Document Modal */}
      <LegalDocumentModal
        isOpen={showLegalDocumentModal}
        onClose={() => setShowLegalDocumentModal(false)}
        category="khiếu nại"
      />
    </AnimatePresence>
  );
};

export default CreateDisputeModal;
