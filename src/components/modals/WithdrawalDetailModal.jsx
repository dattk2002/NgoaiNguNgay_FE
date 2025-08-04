import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import NoFocusOutLineButton from "../../utils/noFocusOutlineButton";

const WithdrawalDetailModal = ({ isOpen, onClose, withdrawal }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;

      const header = document.querySelector("header");
      let originalHeaderPaddingRight = "";
      if (header && window.getComputedStyle(header).position === "fixed") {
        originalHeaderPaddingRight = header.style.paddingRight;
        header.style.paddingRight = `${scrollbarWidth + 
          parseInt(window.getComputedStyle(header).paddingRight || "0")
        }px`;
      }

      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;

        if (header && window.getComputedStyle(header).position === "fixed") {
          header.style.paddingRight = originalHeaderPaddingRight;
        }
      };
    }
    return undefined;
  }, [isOpen]);

  const statusOptions = [
    { name: 'Pending', value: 0, color: 'bg-yellow-100 text-yellow-800', label: 'Chờ xử lý' },
    { name: 'Processing', value: 1, color: 'bg-blue-100 text-blue-800', label: 'Đang xử lý' },
    { name: 'Completed', value: 2, color: 'bg-green-100 text-green-800', label: 'Hoàn thành' },
    { name: 'Failed', value: 3, color: 'bg-red-100 text-red-800', label: 'Thất bại' }
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
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  if (!withdrawal) return null;

  const statusInfo = getStatusInfo(withdrawal.status);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000] p-4"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={backdropVariants}
          onClick={onClose}
        >
          <motion.div
            ref={modalRef}
            className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-auto relative overflow-y-auto max-h-[95vh]"
            variants={modalVariants}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <NoFocusOutLineButton
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              aria-label="Close modal"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </NoFocusOutLineButton>

            <div className="p-6 sm:p-8">
              <div className="flex items-center mb-6">
                <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Chi tiết lệnh rút tiền
                  </h3>
                  <p className="text-sm text-gray-500 font-mono">
                    ID: {withdrawal.id}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Status */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900">Trạng thái</h4>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                </div>

                {/* User Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Người dùng</label>
                    <p className="mt-1 text-sm text-gray-900">{withdrawal.userFullName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">User ID</label>
                    <p className="mt-1 text-sm text-gray-900 font-mono">{withdrawal.userId}</p>
                  </div>
                </div>

                {/* Bank Information */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Thông tin ngân hàng</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tên ngân hàng</label>
                      <p className="mt-1 text-sm text-gray-900">{withdrawal.bankAccount?.bankName || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Số tài khoản</label>
                      <p className="mt-1 text-sm text-gray-900 font-mono">{withdrawal.bankAccount?.accountNumber || 'N/A'}</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Chủ tài khoản</label>
                      <p className="mt-1 text-sm text-gray-900">{withdrawal.bankAccount?.accountHolderName || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Amount Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Số tiền yêu cầu</label>
                    <p className="mt-1 text-lg font-semibold text-gray-900">{formatCurrency(withdrawal.grossAmount)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Số tiền thực nhận</label>
                    <p className="mt-1 text-lg font-semibold text-green-600">{formatCurrency(withdrawal.netAmount)}</p>
                  </div>
                </div>

                {/* Date Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Ngày tạo</label>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(withdrawal.createdTime)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Ngày hoàn thành</label>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(withdrawal.completedAt)}</p>
                  </div>
                </div>

                {/* Rejection Reason */}
                {withdrawal.rejectionReason && (
                  <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-red-800 mb-2">Lý do từ chối</h4>
                    <p className="text-sm text-red-700">{withdrawal.rejectionReason}</p>
                  </div>
                )}

                {/* Close Button */}
                <div className="mt-8 flex justify-end">
                  <NoFocusOutLineButton
                    onClick={onClose}
                    className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                  >
                    Đóng
                  </NoFocusOutLineButton>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WithdrawalDetailModal;