import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { confirmEmail } from "../api/auth";

const ConfirmEmail = ({ isOpen, onClose, email, onConfirmSuccess }) => {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP.");
      setIsLoading(false);
      return;
    }

    try {
      await confirmEmail(email, otp);
      toast.success("Email confirmed successfully!");
      onConfirmSuccess();
      onClose();
    } catch (error) {
      setError(error.message || "OTP verification failed. Please try again.");
      console.error("OTP verification error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000] p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-lg shadow-xl p-6 sm:p-8 w-full max-w-md mx-auto relative overflow-y-auto max-h-[95vh]"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="text-black text-2xl font-semibold text-center mb-4">Xác nhận Email của bạn</h2>
            <p className="text-sm text-gray-500 text-center mb-6">
              Mã OTP gồm 6 chữ số đã được gửi đến <span className="font-medium">{email}</span>. Vui lòng nhập mã dưới đây.
            </p>

            {error && (
              <div className="bg-red-50 border border-red-500 text-red-600 p-3 rounded text-sm text-center mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="mb-4">
                <label htmlFor="otp" className="sr-only">Mã OTP</label>
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Nhập mã OTP gồm 6 chữ số"
                  className="w-full px-4 py-3 border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                  maxLength={6}
                  required
                />
              </div>

              <button
                type="submit"
                className={`w-full bg-[#333333] text-white py-3 rounded-lg font-semibold hover:bg-black transition duration-200 ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={isLoading}
              >
                {isLoading ? "Đang xác minh..." : "Xác minh mã OTP"}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmEmail;