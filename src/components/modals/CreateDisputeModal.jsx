import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaExclamationTriangle, FaPaperclip, FaTimes, FaUpload, FaTrash, FaLink, FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";
import { createDispute } from "../api/auth";

const CreateDisputeModal = ({ isOpen, onClose, bookingData, booking, onSuccess }) => {
  const [formData, setFormData] = useState({
    reason: "",
    evidence: [],
    evidenceUrls: []
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const fileInputRef = useRef(null);
  const modalRef = useRef(null);

  const disputeReasons = [
    { value: "poor_teaching_quality", label: "Chất lượng giảng dạy kém" },
    { value: "no_show", label: "Giáo viên không xuất hiện" },
    { value: "late_arrival", label: "Giáo viên đến muộn" },
    { value: "technical_issues", label: "Vấn đề kỹ thuật" },
    { value: "inappropriate_behavior", label: "Hành vi không phù hợp" },
    { value: "content_mismatch", label: "Nội dung không đúng với mô tả" },
    { value: "payment_issues", label: "Vấn đề thanh toán" },
    { value: "other", label: "Khác" }
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

    if (!formData.reason.trim()) {
      newErrors.reason = "Vui lòng mô tả chi tiết lý do khiếu nại";
    } else if (formData.reason.trim().length < 10) {
      newErrors.reason = "Mô tả lý do phải có ít nhất 10 ký tự";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const addUrl = () => {
    if (!newUrl.trim()) {
      toast.error("Vui lòng nhập URL");
      return;
    }
    
    // Basic URL validation
    try {
      new URL(newUrl.trim());
    } catch {
      toast.error("URL không hợp lệ");
      return;
    }

    if (formData.evidenceUrls.includes(newUrl.trim())) {
      toast.error("URL này đã được thêm");
      return;
    }

    setFormData(prev => ({
      ...prev,
      evidenceUrls: [...prev.evidenceUrls, newUrl.trim()]
    }));
    setNewUrl("");
  };

  const removeUrl = (index) => {
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
      // Combine file names and URLs
      const fileUrls = formData.evidence.map(file => file.name);
      const allEvidenceUrls = [...fileUrls, ...formData.evidenceUrls];
      
             const disputeData = {
         bookingId: displayData.bookingId || displayData.id,
         reason: formData.reason,
         evidenceUrls: allEvidenceUrls
       };

      await createDispute(disputeData);
      
      toast.success("Khiếu nại đã được gửi thành công!");
      onSuccess?.();
      handleClose();
      
    } catch (error) {
      toast.error(error.message || "Có lỗi xảy ra khi gửi khiếu nại. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({ reason: "", evidence: [], evidenceUrls: [] });
      setErrors({});
      setNewUrl("");
      onClose();
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

  // Use bookingData or booking prop, whichever is available
  const displayData = bookingData || booking;
  
  // Extract booking details from nested structure
  const bookingDetails = displayData?.group?.bookings?.[0] || displayData;
  
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
                <h3 className="text-xl font-semibold text-gray-900">Tạo khiếu nại</h3>
                                 <p className="text-sm text-gray-500">
                   Khóa học: {displayData?.LessonName || displayData?.lessonName || bookingDetails?.lessonSnapshot?.name || "N/A"}
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
                <h4 className="font-medium text-blue-900 mb-2">Thông tin khóa học</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Giáo viên:</span>
                    <span className="ml-2 font-medium text-black">{displayData?.tutorName || displayData?.tutor?.fullName || "N/A"}</span>
                  </div>
                                     <div>
                     <span className="text-gray-600">Ngày tạo:</span>
                     <span className="ml-2 font-medium text-black">
                       {bookingDetails?.createdTime ? new Date(bookingDetails.createdTime).toLocaleDateString('vi-VN') : "N/A"}
                     </span>
                   </div>
                   <div>
                     <span className="text-gray-600">Số buổi:</span>
                     <span className="ml-2 font-medium text-black">
                       {`${bookingDetails?.bookedSlots?.length || 0} buổi`}
                     </span>
                   </div>
                   <div>
                     <span className="text-gray-600">Tổng tiền:</span>
                     <span className="ml-2 font-medium text-blue-600">
                       {bookingDetails?.totalPrice ? `${bookingDetails.totalPrice.toLocaleString('vi-VN')}đ` : "N/A"}
                     </span>
                   </div>
                </div>
              </div>



              {/* Reason Details */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lý do khiếu nại <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => handleInputChange("reason", e.target.value)}
                  rows={4}
                  placeholder="Vui lòng mô tả chi tiết vấn đề bạn gặp phải (tối thiểu 10 ký tự)..."
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-black ${
                    errors.reason ? "border-red-500" : "border-gray-300"
                  }`}
                  disabled={isSubmitting}
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.reason && (
                    <p className="text-sm text-red-600">{errors.reason}</p>
                  )}
                  <p className="text-sm text-gray-500 ml-auto text-black">
                    {formData.reason.length}/500
                  </p>
                </div>
              </div>



              {/* Evidence URLs Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Liên kết hỗ trợ
                </label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={newUrl}
                      onChange={(e) => setNewUrl(e.target.value)}
                      placeholder="Nhập URL tài liệu hỗ trợ..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                      disabled={isSubmitting}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addUrl();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={addUrl}
                      disabled={isSubmitting || !newUrl.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      <FaPlus className="w-4 h-4" />
                      Thêm
                    </button>
                  </div>
                  
                  {/* URL List */}
                  {formData.evidenceUrls.length > 0 && (
                    <div className="space-y-2">
                      {formData.evidenceUrls.map((url, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <FaLink className="w-4 h-4 text-blue-500" />
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-medium text-blue-600 hover:text-blue-700 truncate max-w-xs"
                            >
                              {url}
                            </a>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeUrl(index)}
                            disabled={isSubmitting}
                            className="p-1 hover:bg-red-100 rounded text-red-600 disabled:opacity-50"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
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
                      Gửi khiếu nại
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CreateDisputeModal;
