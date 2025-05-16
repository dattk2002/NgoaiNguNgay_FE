// --- React Component File (LoginModal.jsx) ---
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaFacebook } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { toast } from "react-toastify";
import { login } from "../api/auth"; // Assuming your API service file is named auth.js or similar

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

// Spinner Icon - matching SignUpModal
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
    <span className="sr-only">Logging in...</span>
  </div>
);

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;
const FIELD_REQUIRED_MESSAGE = (fieldName) => `${fieldName} không được để trống.`;
const INVALID_EMAIL_MESSAGE = "Vui lòng nhập địa chỉ email hợp lệ.";
const GENERIC_VALIDATION_ERROR_MESSAGE = "Vui lòng sửa các lỗi được đánh dấu.";
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
const PASSWORD_STRENGTH_MESSAGE = "Mật khẩu phải có ít nhất 8 ký tự, 1 chữ hoa, 1 chữ thường, 1 số, và 1 ký tự đặc biệt.";

const LoginModal = ({
  isOpen,
  onClose,
  onLogin,
  onSwitchToSignup,
  promptMessage,
}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    username: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
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
        header.style.paddingRight = `${
          scrollbarWidth +
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

  const handleLogin = async (e) => {
    e.preventDefault();
    setGeneralError("");
    setFieldErrors({ username: "", password: "" });

    let currentFieldErrors = { username: "", password: "" };
    let formIsValid = true;

    // 1. Validate Email (username)
    if (!username.trim()) {
      currentFieldErrors.username = FIELD_REQUIRED_MESSAGE("Địa chỉ email");
      formIsValid = false;
    } else if (!EMAIL_REGEX.test(username)) {
      currentFieldErrors.username = INVALID_EMAIL_MESSAGE;
      formIsValid = false;
    }

    // 2. Validate Password
    if (!password) {
      currentFieldErrors.password = FIELD_REQUIRED_MESSAGE("Mật khẩu");
      formIsValid = false;
    } else if (!PASSWORD_REGEX.test(password)) {
      currentFieldErrors.password = PASSWORD_STRENGTH_MESSAGE;
      formIsValid = false;
    }

    setFieldErrors(currentFieldErrors);

    if (!formIsValid) {
      setGeneralError(GENERIC_VALIDATION_ERROR_MESSAGE);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const response = await login(username, password);
      console.log("Login Response:", response);

      if (response?.data?.token?.user) {
        const { id, fullName, email, profileImageUrl } =
          response.data.token.user;
        const userDetails = {
          id,
          fullName,
          email,
          profileImageUrl,
        };
        onLogin(userDetails);
        toast.success(response.message || "Đăng nhập thành công!");
        onClose();
      } else {
        setGeneralError(
          "Đăng nhập không thành công. Dữ liệu phản hồi không hợp lệ."
        );
        toast.error("Đăng nhập không thành công. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Login error:", error);
      if (
        error.details &&
        error.details.errorCode === "validation_error" &&
        typeof error.details.errorMessage === "object"
      ) {
        const apiFieldErrors = error.details.errorMessage;
        const updatedFieldErrors = { username: "", password: "" };

        if (apiFieldErrors.Email) {
          updatedFieldErrors.username = Array.isArray(apiFieldErrors.Email)
            ? apiFieldErrors.Email.join(", ")
            : String(apiFieldErrors.Email);
        }
        if (apiFieldErrors.Password) {
          updatedFieldErrors.password = Array.isArray(apiFieldErrors.Password)
            ? apiFieldErrors.Password.join(", ")
            : String(apiFieldErrors.Password);
        }
        setFieldErrors(updatedFieldErrors);
        if (updatedFieldErrors.username || updatedFieldErrors.password) {
          setGeneralError(GENERIC_VALIDATION_ERROR_MESSAGE);
        }
        toast.error(
          "Thông tin đăng nhập không hợp lệ. Vui lòng kiểm tra lại các trường."
        );
      } else {
        setGeneralError(
          error.message ||
            "Tên đăng nhập hoặc mật khẩu không đúng hoặc đã xảy ra lỗi."
        );
        setFieldErrors({ username: "", password: "" });
        toast.error(error.message || "Đăng nhập không thành công.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((result) => {
        if (result.user) {
          const { uid, displayName, email, photoURL } = result.user;

          onLogin({
            id: uid,
            name: displayName,
            email: email,
            profileImageUrl: photoURL,
          });

          toast.success("User login successfully!", {
            position: "top-center",
          });
          onClose();
        }
      })
      .catch((error) => {
        console.error("Google Sign-In Error:", error);
        setGeneralError("Google Sign-In failed. Please try again.");
        toast.error("Đăng nhập Google thất bại. Vui lòng thử lại.");
      });
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 1 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1 },
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

            <h2 className="text-black text-2xl font-semibold text-center mb-4">
              Welcome!
            </h2>

            {promptMessage && (
              <div className="bg-blue-50 border border-blue-500 text-blue-600 p-3 rounded text-sm text-center mb-4">
                {promptMessage}
              </div>
            )}

            <p className="text-sm text-gray-500 text-center mb-6">
              By logging in or creating an account, you agree to our&nbsp;
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-gray-700"
              >
                Terms of Service&nbsp;
              </a>
               and&nbsp;
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-gray-700"
              >
                Privacy Policy
              </a>
              .
            </p>

            {generalError && (
              <div className="bg-red-50 border border-red-500 text-red-600 p-3 rounded text-sm text-center mb-4">
                {generalError}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-6">
              <button className="flex justify-center items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <FaFacebook className="w-6 h-6 text-blue-800" />
              </button>

              <button
                onClick={googleLogin}
                className="flex justify-center items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <FcGoogle className="w-6 h-6" />
              </button>
            </div>

            <div className="flex items-center mb-6">
              <div className="flex-grow border-t border-gray-200"></div>

              <span className="flex-shrink mx-4 text-gray-400 text-sm">
                or log in with email
              </span>

              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <form onSubmit={handleLogin}>
              <div className="relative mb-4">
                <label htmlFor="username" className="sr-only">
                  Tên đăng nhập
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, username: "" }));
                    setGeneralError("");
                  }}
                  placeholder="Email Address"
                  className={`w-full px-4 py-3 border text-black rounded-lg focus:outline-none focus:ring-1
                    ${
                      fieldErrors.username
                        ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-300 focus:ring-black focus:border-black"
                    }`}
                  required
                />
                {fieldErrors.username && (
                  <p className="text-red-500 text-xs italic">{fieldErrors.username}</p>
                )}
              </div>

              <div className="relative mb-4">
                <div className="relative">
                  <label htmlFor="password" className="sr-only">
                    Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setFieldErrors((prev) => ({ ...prev, password: "" }));
                      setGeneralError("");
                    }}
                    placeholder="Mật khẩu"
                    className={`w-full px-4 py-3 border text-black rounded-lg focus:outline-none focus:ring-1 pr-10
                      ${
                        fieldErrors.password
                          ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                          : "border-gray-300 focus:ring-black focus:border-black"
                      }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-red-500 text-xs italic">{fieldErrors.password}</p>
                )}
              </div>

              <div className="flex items-center justify-between mb-6 text-sm">
                <div className="flex-grow"></div>
                <a
                  href="#"
                  className="font-medium text-[#333333] hover:text-black"
                >
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                className={`w-full bg-[#333333] text-white py-3 rounded-lg font-semibold hover:bg-black transition duration-200 ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <SpinnerIcon />
                    Logging in...
                  </div>
                ) : (
                  "Log in"
                )}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              No account yet?
              <button
                onClick={() => {
                  onClose();
                  onSwitchToSignup();
                }}
                className="font-medium text-[#333333] hover:text-black underline"
              >
                Sign up
              </button>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;
