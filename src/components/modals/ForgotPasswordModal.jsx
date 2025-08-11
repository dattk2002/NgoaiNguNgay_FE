import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { forgotPassword, resetPassword } from "../api/auth";
import NoFocusOutLineButton from "../../utils/noFocusOutlineButton";

const EyeIcon = () => (
  <svg
    className="w-5 h-5 text-gray-500"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
);

const EyeOffIcon = () => (
  <svg
    className="w-5 h-5 text-gray-500"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7 .529-1.68 1.54-3.197 2.79-4.375M9 4.305A11.95 11.95 0 0112 4c4.478 0 8.268 2.943 9.542 7a10.054 10.054 0 01-1.875 3.825M12 15a3 3 0 110-6 3 3 0 010 6z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M1 1l22 22"
    />
  </svg>
);

const SpinnerIcon = () => (
  <div role="status" className="flex items-center justify-center">
    <svg
      aria-hidden="true"
      className="w-6 h-6 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-[#333333]"
      viewBox="0 0 100 101"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
        fill="currentColor"
      />
      <path
        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
        fill="currentFill"
      />
    </svg>
    <span className="sr-only">Processing...</span>
  </div>
);

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;
const OTP_REGEX = /^\d{6}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

const FIELD_REQUIRED_MESSAGE = (fieldName) => `${fieldName} không được để trống.`;
const INVALID_EMAIL_MESSAGE = "Vui lòng nhập địa chỉ email hợp lệ.";
const INVALID_OTP_MESSAGE = "OTP phải có 6 chữ số.";
const PASSWORD_STRENGTH_MESSAGE = "Mật khẩu phải có ít nhất 8 ký tự, 1 chữ hoa, 1 chữ thường, 1 số, và 1 ký tự đặc biệt.";
const PASSWORDS_NOT_MATCH_MESSAGE = "Mật khẩu xác nhận không khớp.";

const ForgotPasswordModal = ({
  isOpen,
  onClose,
  onBackToLogin,
}) => {
  const [step, setStep] = useState(1); // 1: email, 2: OTP, 3: new password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
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
        header.style.paddingRight = `${scrollbarWidth + parseInt(window.getComputedStyle(header).paddingRight || "0")}px`;
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

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setEmail("");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      setIsLoading(false);
      setGeneralError("");
      setFieldErrors({
        email: "",
        otp: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  }, [isOpen]);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setGeneralError("");
    setFieldErrors(prev => ({ ...prev, email: "" }));

    // Validate email
    if (!email.trim()) {
      setFieldErrors(prev => ({ ...prev, email: FIELD_REQUIRED_MESSAGE("Địa chỉ email") }));
      return;
    } else if (!EMAIL_REGEX.test(email)) {
      setFieldErrors(prev => ({ ...prev, email: INVALID_EMAIL_MESSAGE }));
      return;
    }

    setIsLoading(true);

    try {
      const response = await forgotPassword(email);
      toast.success("OTP đã được gửi đến email của bạn!");
      setStep(2);
    } catch (error) {
      console.error("Send OTP error:", error);
      setGeneralError(error.message || "Không thể gửi OTP. Vui lòng thử lại.");
      toast.error(error.message || "Không thể gửi OTP. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setGeneralError("");
    setFieldErrors(prev => ({ ...prev, otp: "" }));

    // Validate OTP
    if (!otp.trim()) {
      setFieldErrors(prev => ({ ...prev, otp: FIELD_REQUIRED_MESSAGE("OTP") }));
      return;
    } else if (!OTP_REGEX.test(otp)) {
      setFieldErrors(prev => ({ ...prev, otp: INVALID_OTP_MESSAGE }));
      return;
    }

    setIsLoading(true);

    try {
      // For now, just move to next step. In a real implementation, you might want to verify OTP here
      setStep(3);
    } catch (error) {
      console.error("Verify OTP error:", error);
      setGeneralError(error.message || "OTP không hợp lệ. Vui lòng thử lại.");
      toast.error(error.message || "OTP không hợp lệ. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setGeneralError("");
    setFieldErrors({
      newPassword: "",
      confirmPassword: "",
    });

    // Validate new password
    if (!newPassword) {
      setFieldErrors(prev => ({ ...prev, newPassword: FIELD_REQUIRED_MESSAGE("Mật khẩu mới") }));
      return;
    } else if (!PASSWORD_REGEX.test(newPassword)) {
      setFieldErrors(prev => ({ ...prev, newPassword: PASSWORD_STRENGTH_MESSAGE }));
      return;
    }

    // Validate confirm password
    if (!confirmPassword) {
      setFieldErrors(prev => ({ ...prev, confirmPassword: FIELD_REQUIRED_MESSAGE("Xác nhận mật khẩu") }));
      return;
    } else if (newPassword !== confirmPassword) {
      setFieldErrors(prev => ({ ...prev, confirmPassword: PASSWORDS_NOT_MATCH_MESSAGE }));
      return;
    }

    setIsLoading(true);

    try {
      const response = await resetPassword(email, otp, newPassword);
      toast.success("Đặt lại mật khẩu thành công!");
      onClose();
      onBackToLogin();
    } catch (error) {
      console.error("Reset password error:", error);
      setGeneralError(error.message || "Không thể đặt lại mật khẩu. Vui lòng thử lại.");
      toast.error(error.message || "Không thể đặt lại mật khẩu. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setOtp("");
      setFieldErrors(prev => ({ ...prev, otp: "" }));
    } else if (step === 3) {
      setStep(2);
      setNewPassword("");
      setConfirmPassword("");
      setFieldErrors(prev => ({ ...prev, newPassword: "", confirmPassword: "" }));
    }
    setGeneralError("");
  };

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return "Quên mật khẩu";
      case 2:
        return "Nhập mã OTP";
      case 3:
        return "Đặt lại mật khẩu";
      default:
        return "Quên mật khẩu";
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 1:
        return "Nhập địa chỉ email của bạn để nhận mã OTP";
      case 2:
        return `Mã OTP đã được gửi đến ${email}`;
      case 3:
        return "Nhập mật khẩu mới của bạn";
      default:
        return "";
    }
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
            className="bg-white rounded-lg shadow-xl p-6 sm:p-8 w-full max-w-md mx-auto relative overflow-y-auto max-h-[95vh]"
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

            <h2 className="text-black text-2xl font-semibold text-center mb-2">
              {getStepTitle()}
            </h2>

            <p className="text-sm text-gray-500 text-center mb-6">
              {getStepDescription()}
            </p>

            {generalError && (
              <div className="bg-red-50 border border-red-500 text-red-600 p-3 rounded text-sm text-center mb-4">
                {generalError}
              </div>
            )}

            {/* Step 1: Email Input */}
            {step === 1 && (
              <form onSubmit={handleSendOTP}>
                <div className="mb-4">
                  <label htmlFor="email" className="sr-only">
                    Địa chỉ email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setFieldErrors(prev => ({ ...prev, email: "" }));
                      setGeneralError("");
                    }}
                    placeholder="Địa chỉ Email"
                    className={`w-full px-4 py-3 border text-black rounded-lg focus:outline-none focus:ring-1
                      ${fieldErrors.email
                        ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-300 focus:ring-black focus:border-black"
                      }`}
                    required
                  />
                  {fieldErrors.email && (
                    <p className="text-red-500 text-xs italic mt-1">{fieldErrors.email}</p>
                  )}
                </div>

                <NoFocusOutLineButton
                  type="submit"
                  className={`w-full bg-[#333333] text-white py-3 rounded-lg font-semibold hover:bg-black transition duration-200 ${
                    isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <SpinnerIcon />
                      Đang gửi OTP...
                    </div>
                  ) : (
                    "Gửi OTP"
                  )}
                </NoFocusOutLineButton>
              </form>
            )}

            {/* Step 2: OTP Input */}
            {step === 2 && (
              <form onSubmit={handleVerifyOTP}>
                <div className="mb-4">
                  <label htmlFor="otp" className="sr-only">
                    Mã OTP
                  </label>
                  <input
                    type="text"
                    id="otp"
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value);
                      setFieldErrors(prev => ({ ...prev, otp: "" }));
                      setGeneralError("");
                    }}
                    placeholder="Nhập mã OTP 6 chữ số"
                    maxLength={6}
                    className={`w-full px-4 py-3 border text-black rounded-lg focus:outline-none focus:ring-1
                      ${fieldErrors.otp
                        ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-300 focus:ring-black focus:border-black"
                      }`}
                    required
                  />
                  {fieldErrors.otp && (
                    <p className="text-red-500 text-xs italic mt-1">{fieldErrors.otp}</p>
                  )}
                </div>

                <div className="flex gap-3">
                  <NoFocusOutLineButton
                    type="button"
                    onClick={handleBack}
                    className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-400 transition duration-200"
                  >
                    Quay lại
                  </NoFocusOutLineButton>
                  <NoFocusOutLineButton
                    type="submit"
                    className={`flex-1 bg-[#333333] text-white py-3 rounded-lg font-semibold hover:bg-black transition duration-200 ${
                      isLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <SpinnerIcon />
                        Xác thực...
                      </div>
                    ) : (
                      "Xác thực OTP"
                    )}
                  </NoFocusOutLineButton>
                </div>
              </form>
            )}

            {/* Step 3: New Password Input */}
            {step === 3 && (
              <form onSubmit={handleResetPassword}>
                <div className="mb-4">
                  <div className="relative">
                    <label htmlFor="newPassword" className="sr-only">
                      Mật khẩu mới
                    </label>
                    <input
                      type={showNewPassword ? "text" : "password"}
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setFieldErrors(prev => ({ ...prev, newPassword: "" }));
                        setGeneralError("");
                      }}
                      placeholder="Mật khẩu mới"
                      className={`w-full px-4 py-3 border text-black rounded-lg focus:outline-none focus:ring-1 pr-10
                        ${fieldErrors.newPassword
                          ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                          : "border-gray-300 focus:ring-black focus:border-black"
                        }`}
                      required
                    />
                    <NoFocusOutLineButton
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 cursor-pointer"
                      aria-label={showNewPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
                    >
                      {showNewPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </NoFocusOutLineButton>
                  </div>
                  {fieldErrors.newPassword && (
                    <p className="text-red-500 text-xs italic mt-1">{fieldErrors.newPassword}</p>
                  )}
                </div>

                <div className="mb-6">
                  <div className="relative">
                    <label htmlFor="confirmPassword" className="sr-only">
                      Xác nhận mật khẩu
                    </label>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setFieldErrors(prev => ({ ...prev, confirmPassword: "" }));
                        setGeneralError("");
                      }}
                      placeholder="Xác nhận mật khẩu mới"
                      className={`w-full px-4 py-3 border text-black rounded-lg focus:outline-none focus:ring-1 pr-10
                        ${fieldErrors.confirmPassword
                          ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                          : "border-gray-300 focus:ring-black focus:border-black"
                        }`}
                      required
                    />
                    <NoFocusOutLineButton
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 cursor-pointer"
                      aria-label={showConfirmPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
                    >
                      {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </NoFocusOutLineButton>
                  </div>
                  {fieldErrors.confirmPassword && (
                    <p className="text-red-500 text-xs italic mt-1">{fieldErrors.confirmPassword}</p>
                  )}
                </div>

                <div className="flex gap-3">
                  <NoFocusOutLineButton
                    type="button"
                    onClick={handleBack}
                    className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-400 transition duration-200"
                  >
                    Quay lại
                  </NoFocusOutLineButton>
                  <NoFocusOutLineButton
                    type="submit"
                    className={`flex-1 bg-[#333333] text-white py-3 rounded-lg font-semibold hover:bg-black transition duration-200 ${
                      isLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <SpinnerIcon />
                        Đang đặt lại...
                      </div>
                    ) : (
                      "Đặt lại mật khẩu"
                    )}
                  </NoFocusOutLineButton>
                </div>
              </form>
            )}

            <div className="text-center mt-6">
              <NoFocusOutLineButton
                onClick={() => {
                  onClose();
                  onBackToLogin();
                }}
                className="text-sm text-[#333333] hover:text-black underline"
              >
                Quay lại đăng nhập
              </NoFocusOutLineButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ForgotPasswordModal;
