import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaFacebook } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { motion, AnimatePresence } from 'framer-motion';

// Placeholder icons - replace with actual icons or components if needed, similar to LoginModal
const EyeIcon = () => <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;
const EyeOffIcon = () => <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7 .529-1.68 1.54-3.197 2.79-4.375M9 4.305A11.95 11.95 0 0112 4c4.478 0 8.268 2.943 9.542 7a10.054 10.054 0 01-1.875 3.825M12 15a3 3 0 110-6 3 3 0 010 6z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M1 1l22 22" /></svg>;

// Assume isOpen, onClose, onSwitchToLogin, and onSignUpSuccess are passed as props
function SignUpModal({ isOpen, onClose, onSwitchToLogin, onSignUpSuccess }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;

       // Also apply padding to the header if it's fixed
      const header = document.querySelector('header'); // Adjust selector if needed
      let originalHeaderPaddingRight = '';
      if (header && window.getComputedStyle(header).position === 'fixed') {
        originalHeaderPaddingRight = header.style.paddingRight;
        // Calculate new padding right, considering existing padding
        const currentHeaderPaddingRight = parseInt(window.getComputedStyle(header).paddingRight || '0');
        header.style.paddingRight = `${scrollbarWidth + currentHeaderPaddingRight}px`;
      }

      // Cleanup function to restore original styles
      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;

        if (header && window.getComputedStyle(header).position === 'fixed') {
            header.style.paddingRight = originalHeaderPaddingRight;
        }
      };
    }
    // No cleanup needed if modal wasn't open
    return undefined;
  }, [isOpen]); // Re-run effect when isOpen changes

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!name || !phone || !password || !confirmPassword) {
      setError("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    if (!/^\d*$/.test(phone)) {
      setError("Số điện thoại chỉ được chứa chữ số.");
      return;
    }

    if (password !== confirmPassword) {
        setError("Mật khẩu xác nhận không khớp.");
        return;
    }

    if (!termsAgreed) {
        setError("Bạn phải đồng ý với Điều khoản dịch vụ và Chính sách bảo mật.");
        return;
    }

    const accountData = {
      name,
      phone,
      password,
      id: Date.now().toString(),
      avatarUrl: ''
    };

    const existingAccounts =
      JSON.parse(localStorage.getItem("accounts")) || [];
    const duplicate = existingAccounts.some(
      (account) => account.phone === phone
    );

    if (duplicate) {
      setError("Số điện thoại này đã được đăng ký.");
      return;
    }

    existingAccounts.push(accountData);
    localStorage.setItem("accounts", JSON.stringify(existingAccounts));
    console.log("Simulated sign up successful:", accountData);
    onSignUpSuccess();
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

                <h2 className="text-2xl font-semibold text-center mb-3">Create Account</h2>
                <p className="text-sm text-gray-500 text-center mb-3">
                    Join NgoaiNguNgay today. By creating an account, you agreed to our{' '}
                    <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700">Terms of Service</a> and{' '}
                    <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700">Privacy Policy</a>.
                </p>

                {error && (
                <div className="bg-red-50 border border-red-500 text-red-600 p-3 rounded text-sm text-center mb-4">
                    {error}
                </div>
                )}

                 <div className="grid grid-cols-2 gap-4 mb-2">
                    <button className="flex justify-center items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <FaFacebook className="w-6 h-6 text-blue-800" />
                    </button>
                    <button className="flex justify-center items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <FcGoogle className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex items-center mb-6">
                    <div className="flex-grow border-t border-gray-200"></div>
                    <span className="flex-shrink mx-4 text-gray-400 text-sm">or sign up with phone</span>
                    <div className="flex-grow border-t border-gray-200"></div>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="mb-1">
                    <label htmlFor="name" className="sr-only">Full Name</label>
                    <input
                        type="text"
                        id="name"
                        placeholder="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                        required
                    />
                 </div>
                 <div className="mb-1">
                    <label htmlFor="phone" className="sr-only">Phone</label>
                    <input
                        type="tel"
                        id="phone"
                        placeholder="Phone Number (+84)"
                        value={phone}
                        onChange={(e) => {
                            const value = e.target.value;
                            if (/^\d*$/.test(value)) {
                                setPhone(value);
                                setError("");
                            } else {
                                setError("Số điện thoại chỉ được chứa chữ số.");
                            }
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                        required
                    />
                 </div>
                 <div className="mb-1 relative">
                    <label htmlFor="password" className="sr-only">Password</label>
                    <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black pr-10"
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
                 <div className="mb-4 relative">
                    <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
                    <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black pr-10"
                        required
                    />
                     <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500"
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                        {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
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
                        I agree to the{' '}
                        <a href="/terms" target="_blank" rel="noopener noreferrer" className="font-medium text-[#333333] hover:text-black underline">
                            Terms of Service
                        </a> and{' '}
                         <a href="/privacy" target="_blank" rel="noopener noreferrer" className="font-medium text-[#333333] hover:text-black underline">
                            Privacy Policy
                        </a>
                    </label>
                </div>


                <button
                    type="submit"
                    className="w-full bg-[#333333] text-white py-3 rounded-lg font-semibold hover:bg-black transition duration-200"
                >
                    Sign Up
                </button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-2">
                    Already have an account?{' '}
                    <button
                        onClick={onSwitchToLogin}
                        className="font-medium text-[#333333] hover:text-black underline"
                    >
                        Log in
                    </button>
                </p>

            </motion.div>
            </motion.div>
        )}
    </AnimatePresence>

  );
}

export default SignUpModal;
