import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaFacebook } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { motion, AnimatePresence } from "framer-motion";
import { register } from "../api/auth"; // Adjust the import path to your API file
import LegalDocumentModal from "./LegalDocumentModal";

// Placeholder icons
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

// Spinner Icon - matching LoginModal
const SpinnerIcon = () => (
  <div role="status" className="flex items-center justify-center">
    <svg
      aria-hidden="true"
      className="w-6 h-6 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-[#333333]" // Adjusted size and color to fit button
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
        fill="currentFill" // This will be the fill color from className, e.g., fill-[#333333]
      />
    </svg>
    <span className="sr-only">Signing up...</span>
  </div>
);

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
const PASSWORD_STRENGTH_MESSAGE = "Mật khẩu phải có ít nhất 8 ký tự, 1 chữ hoa, 1 chữ thường, 1 số, và 1 ký tự đặc biệt.";
const PASSWORD_MISMATCH_MESSAGE = "Mật khẩu xác nhận không khớp.";
const FIELD_REQUIRED_MESSAGE = (fieldName) => `${fieldName} không được để trống.`;

function SignUpModal({ isOpen, onClose, onSwitchToLogin, onSignUpSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordValidationError, setPasswordValidationError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [fullName, setFullName] = useState("");
  const [fullNameError, setFullNameError] = useState("");
  const [showLegalDocumentModal, setShowLegalDocumentModal] = useState(false);

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
        const currentHeaderPaddingRight = parseInt(
          window.getComputedStyle(header).paddingRight || "0"
        );
        header.style.paddingRight = `${
          scrollbarWidth + currentHeaderPaddingRight
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

  const handleLegalDocumentClick = (e) => {
    e.preventDefault();
    setShowLegalDocumentModal(true);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(""); // Clear general error
    let localPasswordError = "";
    let localConfirmPasswordError = "";
    let localFullNameError = "";
    let formIsValid = true;

    // 1. Validate presence of all required fields
    if (!fullName) {
      localFullNameError = "Họ và tên là bắt buộc";
      formIsValid = false;
    }
    if (!email) {
      // Assuming you might want an email error state too: setEmailError(FIELD_REQUIRED_MESSAGE("Email"));
      setError("Vui lòng điền đầy đủ thông tin.");
      formIsValid = false;
    }
    if (!password) {
      localPasswordError = FIELD_REQUIRED_MESSAGE("Mật khẩu");
      formIsValid = false;
    }
    if (!confirmPassword) {
      localConfirmPasswordError = FIELD_REQUIRED_MESSAGE("Xác nhận mật khẩu");
      formIsValid = false;
    }

    // If any core field is empty, set general error and update specific errors.
    if (!email || !password || !confirmPassword) {
        setError("Vui lòng điền đầy đủ thông tin.");
        // Set errors even if we return early, so fields are highlighted
        setPasswordValidationError(localPasswordError);
        setConfirmPasswordError(localConfirmPasswordError);
        setFullNameError(localFullNameError);
        setIsLoading(false);
        return;
    }
    
    // 2. Validate terms agreed
    if (!termsAgreed) {
      setError("Bạn phải đồng ý với Điều khoản dịch vụ và Chính sách bảo mật.");
      formIsValid = false; // Keep this to prevent submission if other checks pass somehow
    }

    // 3. Validate password strength (only if password is not empty)
    if (password && !PASSWORD_REGEX.test(password)) {
      localPasswordError = PASSWORD_STRENGTH_MESSAGE;
      formIsValid = false;
    }

    // 4. Validate password confirmation (only if confirmPassword is not empty)
    if (password && confirmPassword && password !== confirmPassword) {
      localConfirmPasswordError = PASSWORD_MISMATCH_MESSAGE;
      formIsValid = false;
    }

    setPasswordValidationError(localPasswordError);
    setConfirmPasswordError(localConfirmPasswordError);
    setFullNameError(localFullNameError);

    if (!formIsValid) {
      // If specific errors are set, and no general error from terms/emptiness, set a generic one.
      if (!error && (localPasswordError || localConfirmPasswordError || localFullNameError)) {
        setError("Vui lòng sửa các lỗi được đánh dấu.");
      }
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await register(email, password, confirmPassword, fullName);
      onSignUpSuccess(email);
      onClose();
    } catch (errorResponse) {
      console.error("Sign Up Failed:", errorResponse);
      setError(errorResponse.message || "Đăng ký không thành công. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
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
            className="bg-white rounded-lg shadow-xl p-6 sm:p-8 w-full max-w-lg mx-auto relative overflow-y-auto max-h-[95vh]"
            variants={modalVariants}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
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
            </button>

            <h2 className="text-black text-2xl font-semibold text-center mb-3">
              Tạo tài khoản
            </h2>
                        <p className="text-sm text-gray-500 text-center mb-3">
              Tham gia NgoaiNguNgay ngay hôm nay. Bằng cách tạo tài khoản, bạn đồng ý với
              <a
                onClick={handleLegalDocumentClick}
                className="no-underline hover:text-blue-700 hover:cursor-pointer text-[#333333]"
              >
                {" "}Điều khoản dịch vụ và Chính sách bảo mật
              </a>{" "}

              .
            </p>

            {error && (
              <div className="bg-red-50 border border-red-500 text-red-600 p-3 rounded text-sm text-center mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSignUp} className="flex flex-col gap-4">
              <div className="relative">
                <label htmlFor="fullName" className="sr-only">
                  Họ và tên
                </label>
                <input
                  type="text"
                  id="fullName"
                  placeholder="Họ và tên"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    setFullNameError("");
                    setError("");
                  }}
                  className={`w-full px-4 py-3 border text-black rounded-lg focus:outline-none focus:ring-1 ${fullNameError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-black focus:border-black'}`}
                  required
                />
              </div>

                  <div className="relative">
                    <div className="relative">
                      <label htmlFor="email" className="sr-only">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        placeholder="Địa chỉ Email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setError(""); }}
                        className="w-full px-4 py-3 border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                        required
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <div className="relative">
                      <label htmlFor="password" className="sr-only">
                        Mật khẩu
                      </label>
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        placeholder="Mật khẩu"
                        value={password}
                        onChange={(e) => {
                          const newPassword = e.target.value;
                          setPassword(newPassword);
                          setError("");
                          if (newPassword && !PASSWORD_REGEX.test(newPassword)) {
                            setPasswordValidationError(PASSWORD_STRENGTH_MESSAGE);
                          } else {
                            setPasswordValidationError("");
                          }
                          // Re-validate confirm password if it exists and password is not empty
                          if (confirmPassword && newPassword) {
                            if (newPassword !== confirmPassword) {
                              setConfirmPasswordError(PASSWORD_MISMATCH_MESSAGE);
                            } else {
                              setConfirmPasswordError("");
                            }
                          } else if (!newPassword && confirmPassword) {
                            // If password becomes empty, but confirm has value, confirm is now "mismatched" or should be re-evaluated based on new empty password
                             setConfirmPasswordError(PASSWORD_MISMATCH_MESSAGE); // Or clear it if that's preferred UX
                          } else {
                             setConfirmPasswordError(""); // Clear if confirmPassword is empty or matches empty newPassword
                          }
                        }}
                        className={`w-full px-4 py-3 border text-black rounded-lg focus:outline-none focus:ring-1 pr-10 ${passwordValidationError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-black focus:border-black'}`}
                        required
                      />
                      <div
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 cursor-pointer"
                        aria-label={showPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
                      >
                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </div>
                    </div>
                    {passwordValidationError && (
                      <p className="text-red-500 text-xs mt-1 italic">{passwordValidationError}</p>
                    )}
                  </div>

                  <div className="relative">
                    <div className="relative">
                      <label htmlFor="confirmPassword" className="sr-only">
                        Xác nhận mật khẩu
                      </label>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        placeholder="Xác nhận mật khẩu"
                        value={confirmPassword}
                        onChange={(e) => {
                          const newConfirmPassword = e.target.value;
                          setConfirmPassword(newConfirmPassword);
                          setError("");
                          if (password && newConfirmPassword && password !== newConfirmPassword) {
                            setConfirmPasswordError(PASSWORD_MISMATCH_MESSAGE);
                          } else if (password && !newConfirmPassword) { // Confirm pass is being cleared but main pass has value
                              setConfirmPasswordError(PASSWORD_MISMATCH_MESSAGE); // Or "Field required"
                          }
                           else {
                            setConfirmPasswordError("");
                          }
                        }}
                        className={`w-full px-4 py-3 border text-black rounded-lg focus:outline-none focus:ring-1 pr-10 ${confirmPasswordError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-black focus:border-black'}`}
                        required
                      />
                      <div
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 cursor-pointer"
                        aria-label={
                          showConfirmPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"
                        }
                      >
                        {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </div>
                    </div>
                    {confirmPasswordError && (
                      <p className="text-red-500 text-xs mt-1 italic">{confirmPasswordError}</p>
                    )}
                  </div>

                  <div className="flex items-center mb-4">
                    <input
                      id="terms"
                      type="checkbox"
                      checked={termsAgreed}
                      onChange={(e) => setTermsAgreed(e.target.checked)}
                      className="h-4 w-4 text-black border-gray-300 rounded focus:ring-black"
                    />
                    <label htmlFor="terms" className="ml-2 text-sm text-gray-700">
                      Tôi đồng ý với{" "}
                      <a
                        onClick={handleLegalDocumentClick}
                        className="font-medium text-[#333333] hover:text-blue-700 hover:cursor-pointer"
                      >
                        Điều khoản dịch vụ và Chính sách bảo mật
                      </a>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className={`w-full flex justify-center items-center py-3 rounded-lg font-semibold transition duration-200 ${
                      isLoading || !termsAgreed 
                        ? 'opacity-50 cursor-not-allowed bg-gray-400 text-gray-600' 
                        : 'bg-[#333333] text-white hover:bg-black'
                    }`}
                    disabled={isLoading || !termsAgreed}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <SpinnerIcon />
                        Đang đăng ký...
                      </div>
                    ) : (
                      'Đăng ký'
                    )}
                  </button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-2">
                  Đã có tài khoản?{" "}
                  <button
                    onClick={() => {
                      onClose();
                      onSwitchToLogin();
                    }}
                    className="font-medium text-[#333333] hover:text-black underline"
                  >
                    Đăng nhập
                  </button>
                </p>
              </motion.div>
            </motion.div>
          )}

          {/* Legal Document Modal */}
          <LegalDocumentModal
            isOpen={showLegalDocumentModal}
            onClose={() => setShowLegalDocumentModal(false)}
            category="Đăng ký"
          />
        </AnimatePresence>
      );
    }

    export default SignUpModal;