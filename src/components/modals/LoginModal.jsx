// LoginModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaFacebook } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { toast } from "react-toastify";
import { login as apiLogin } from '../api/auth';

const EyeIcon = () => <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;
const EyeOffIcon = () => <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7 .529-1.68 1.54-3.197 2.79-4.375M9 4.305A11.95 11.95 0 0112 4c4.478 0 8.268 2.943 9.542 7a10.054 10.054 0 01-1.875 3.825M12 15a3 3 0 110-6 3 3 0 010 6z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M1 1l22 22" /></svg>;

const LoginModal = ({ isOpen, onClose, onLogin, onSwitchToSignup, promptMessage }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;

      const header = document.querySelector('header');
      let originalHeaderPaddingRight = '';
      if (header && window.getComputedStyle(header).position === 'fixed') {
        originalHeaderPaddingRight = header.style.paddingRight;
        header.style.paddingRight = `${scrollbarWidth + parseInt(window.getComputedStyle(header).paddingRight || '0')}px`;
      }

      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;

        if (header && window.getComputedStyle(header).position === 'fixed') {
          header.style.paddingRight = originalHeaderPaddingRight;
        }
      };
    }
    return undefined;
  }, [isOpen]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError('Vui lòng nhập email và mật khẩu.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiLogin(email, password);

      if (response.data?.token?.user) {
        const userDetails = {
          id: response.data.token.user.id,
          name: response.data.token.user.fullName,
          email: email,
        };
        onLogin(userDetails);
        toast.success(response.message || "Đăng nhập thành công!");
        onClose();
      } else {
        setError(response.message || "Đăng nhập không thành công. Dữ liệu không hợp lệ.");
      }
    } catch (apiError) {
      setError(apiError.message || "Email hoặc mật khẩu không đúng hoặc đã xảy ra lỗi.");
      console.error("Login API error:", apiError);
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider).then((result) => {
      if (result.user) {
        const { uid, displayName, email, photoURL } = result.user;

        onLogin({
          id: uid,
          name: displayName,
          email: email,
          avatarUrl: photoURL
        });

        toast.success("User login successfully!", {
          position: "top-center",
        });
        onClose();
      }
    }).catch((error) => {
      console.error("Google Sign-In Error:", error);
      setError("Google Sign-In failed. Please try again.");
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
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <h2 className="text-black text-2xl font-semibold text-center mb-4">Welcome!</h2>
            {promptMessage && (
              <div className="bg-blue-50 border border-blue-500 text-blue-600 p-3 rounded text-sm text-center mb-4">
                {promptMessage}
              </div>
            )}
            <p className="text-sm text-gray-500 text-center mb-6">
              By logging in or creating an account, you agree to our{' '}
              <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700">Terms of Service</a> and{' '}
              <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700">Privacy Policy</a>.
            </p>

            {error && (
              <div className="bg-red-50 border border-red-500 text-red-600 p-3 rounded text-sm text-center mb-4">
                {error}
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
              <span className="flex-shrink mx-4 text-gray-400 text-sm">or log in with email</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label htmlFor="email" className="sr-only">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  placeholder="Email Address"
                  className="w-full px-4 py-3 border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                  required
                />
              </div>

              <div className="mb-4 relative">
                <label htmlFor="password" className="sr-only">Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Password"
                  className="w-full px-4 py-3 border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>

              <div className="flex items-center justify-between mb-6 text-sm">
                <div className="flex-grow"></div>
                <a href="#" className="font-medium text-[#333333] hover:text-black">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                className={`w-full bg-[#333333] text-white py-3 rounded-lg font-semibold hover:bg-black transition duration-200 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Log in'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              No account yet?{' '}
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