import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import NoFocusOutLineButton from "../../utils/noFocusOutlineButton";
import '../../utils/notFocusOutline.css';

const ConfirmDeleteBankAccountModal = ({
  isOpen,
  onClose,
  onConfirm,
  bankAccount,
  isLoading = false
}) => {
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;

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

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm();
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  if (!bankAccount) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000] p-4"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={backdropVariants}
          onClick={handleClose}
        >
          <motion.div
            ref={modalRef}
            className="bg-white rounded-lg shadow-xl p-6 sm:p-8 w-full max-w-md mx-auto relative"
            variants={modalVariants}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <NoFocusOutLineButton
              onClick={handleClose}
              disabled={isLoading}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 disabled:opacity-50"
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

            {/* Warning Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-black text-xl font-semibold text-center mb-4">
              Xóa tài khoản ngân hàng
            </h2>

            {/* Content */}
            <div className="text-center mb-6">
              <p className="text-gray-600 mb-4">
                Bạn có chắc chắn muốn xóa tài khoản ngân hàng này không?
              </p>
              
              {/* Bank Account Info */}
              <div className="bg-gray-50 rounded-lg p-4 text-left">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Ngân hàng:</span>
                    <span className="text-gray-900">{bankAccount.bankName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Số tài khoản:</span>
                    <span className="text-gray-900 font-mono">
                      {bankAccount.accountNumber ? `**** **** **** ${bankAccount.accountNumber.slice(-4)}` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Chủ tài khoản:</span>
                    <span className="text-gray-900">{bankAccount.accountHolderName}</span>
                  </div>
                </div>
              </div>

              <p className="text-red-600 text-sm mt-4 font-medium">
                ⚠️ Hành động này không thể hoàn tác!
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <NoFocusOutLineButton
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Hủy
              </NoFocusOutLineButton>
              
              <NoFocusOutLineButton
                onClick={handleConfirm}
                disabled={isLoading}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang xóa...
                  </div>
                ) : (
                  "Xóa tài khoản"
                )}
              </NoFocusOutLineButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDeleteBankAccountModal;