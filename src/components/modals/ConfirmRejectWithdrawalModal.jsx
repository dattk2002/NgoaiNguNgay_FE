import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import NoFocusOutLineButton from "../../utils/noFocusOutlineButton";

const ConfirmRejectWithdrawalModal = ({ isOpen, onClose, onConfirm, withdrawal, isLoading }) => {
  const [rejectionReason, setRejectionReason] = useState("");
  const [error, setError] = useState("");
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

  useEffect(() => {
    if (isOpen) {
      setRejectionReason("");
      setError("");
    }
  }, [isOpen]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!rejectionReason.trim()) {
      setError("Vui lòng nhập lý do từ chối");
      return;
    }

    if (rejectionReason.trim().length < 10) {
      setError("Lý do từ chối phải có ít nhất 10 ký tự");
      return;
    }

    setError("");
    onConfirm(rejectionReason.trim());
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
            className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto relative"
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

            <div className="p-6">
              {/* Header */}
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Xác nhận từ chối
                  </h3>
                  <p className="text-sm text-gray-500">
                    Lệnh rút tiền {formatCurrency(withdrawal.grossAmount)}
                  </p>
                </div>
              </div>

              {/* Withdrawal Info */}
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Người yêu cầu:</span>
                    <span className="font-medium">{withdrawal.userFullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ngân hàng:</span>
                    <span className="font-medium">{withdrawal.bankAccount?.bankName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số tiền:</span>
                    <span className="font-semibold text-green-600">{formatCurrency(withdrawal.grossAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700 mb-2">
                    Lý do từ chối *
                  </label>
                  <textarea
                    id="rejectionReason"
                    value={rejectionReason}
                    onChange={(e) => {
                      setRejectionReason(e.target.value);
                      setError("");
                    }}
                    placeholder="Nhập lý do từ chối lệnh rút tiền này..."
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none text-black ${
                      error ? 'border-red-500' : 'border-gray-300'
                    }`}
                    rows={4}
                    disabled={isLoading}
                  />
                  {error && (
                    <p className="text-red-500 text-xs mt-1">{error}</p>
                  )}
                  <p className="text-gray-500 text-xs mt-1">
                    Tối thiểu 10 ký tự. Lý do này sẽ được gửi cho người dùng.
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex space-x-3">
                  <NoFocusOutLineButton
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={isLoading}
                  >
                    Hủy
                  </NoFocusOutLineButton>
                  <NoFocusOutLineButton
                    type="submit"
                    className={`flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium ${
                      isLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Đang xử lý...
                      </div>
                    ) : (
                      'Xác nhận từ chối'
                    )}
                  </NoFocusOutLineButton>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmRejectWithdrawalModal;