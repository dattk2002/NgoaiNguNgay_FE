import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  TextField, 
  Button, 
  IconButton, 
  InputAdornment,
  CircularProgress,
  Alert,
  Divider
} from "@mui/material";
import { 
  FaEye, 
  FaEyeSlash, 
  FaLock, 
  FaEnvelope, 
  FaKey,
  FaArrowLeft,
  FaCheckCircle
} from "react-icons/fa";
import { forgotPassword, changePassword } from "../components/api/auth";

// Password validation constants (same as SignUpModal)
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
const PASSWORD_STRENGTH_MESSAGE = "Mật khẩu phải có ít nhất 8 ký tự, 1 chữ hoa, 1 chữ thường, 1 số, và 1 ký tự đặc biệt.";
const PASSWORD_MISMATCH_MESSAGE = "Mật khẩu xác nhận không khớp.";

function ChangePasswordPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  
  // State management
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Request OTP, 2: Enter OTP, 3: Enter new password
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(true);
  
  // Error states
  const [emailError, setEmailError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  // Get user email from localStorage on component mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user.email) {
          setEmail(user.email);
        }
      }
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
    }
  }, []);

  // Countdown timer for resend OTP
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Handle request OTP
  const handleRequestOtp = async () => {
    // Validate email
    if (!email) {
      setEmailError("Email không được để trống");
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Email không hợp lệ");
      return;
    }

    setEmailError("");
    setIsLoading(true);

    try {
      const response = await forgotPassword(email);
      
      if (response && response.statusCode === 200) {
        toast.success(response.message || "Đã gửi OTP đến email của bạn");
        setStep(2);
        setCountdown(60); // Start 60 second countdown
        setCanResend(false);
      } else {
        toast.error(response?.message || "Có lỗi xảy ra khi gửi OTP");
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      toast.error(error.message || "Có lỗi xảy ra khi gửi OTP");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle resend OTP
  const handleResendOtp = async () => {
    if (!canResend) return;
    
    setIsLoading(true);
    try {
      const response = await forgotPassword(email);
      
      if (response && response.statusCode === 200) {
        toast.success("Đã gửi lại OTP đến email của bạn");
        setCountdown(60);
        setCanResend(false);
      } else {
        toast.error(response?.message || "Có lỗi xảy ra khi gửi lại OTP");
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      toast.error(error.message || "Có lỗi xảy ra khi gửi lại OTP");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle verify OTP and proceed to password reset
  const handleVerifyOtp = async () => {
    if (!otp) {
      setOtpError("OTP không được để trống");
      return;
    }
    
    if (otp.length !== 6) {
      setOtpError("OTP phải có 6 chữ số");
      return;
    }

    setOtpError("");
    setStep(3); // Proceed to password reset step
  };

  // Handle password validation
  const validatePassword = (password) => {
    if (!password) return "Mật khẩu không được để trống";
    if (!PASSWORD_REGEX.test(password)) return PASSWORD_STRENGTH_MESSAGE;
    return "";
  };

  const validateConfirmPassword = (confirmPassword, password) => {
    if (!confirmPassword) return "Xác nhận mật khẩu không được để trống";
    if (confirmPassword !== password) return PASSWORD_MISMATCH_MESSAGE;
    return "";
  };

  // Handle change password
  const handleChangePassword = async () => {
    const passwordValidation = validatePassword(newPassword);
    const confirmPasswordValidation = validateConfirmPassword(confirmNewPassword, newPassword);

    setPasswordError(passwordValidation);
    setConfirmPasswordError(confirmPasswordValidation);

    if (passwordValidation || confirmPasswordValidation) {
      return;
    }

    setIsLoading(true);

    try {
      // Call changePassword with correct parameters: email, otp, password
      const response = await changePassword(email, otp, newPassword);
      
      if (response && response.statusCode === 200) {
        toast.success("Đổi mật khẩu thành công");
        navigate("/");
      } else {
        toast.error(response?.message || "Có lỗi xảy ra khi đổi mật khẩu");
      }
    } catch (error) {
      console.error("Change password error:", error);
      // Handle specific validation errors from API response
      if (error.details && error.details.errorMessage) {
        const errorMessage = error.details.errorMessage;
        
        // Handle OTP errors
        if (errorMessage.OTP) {
          const otpErrors = Array.isArray(errorMessage.OTP) ? errorMessage.OTP : [errorMessage.OTP];
          setOtpError(otpErrors[0]);
        }
        
        // Handle Password errors
        if (errorMessage.Password) {
          const passwordErrors = Array.isArray(errorMessage.Password) ? errorMessage.Password : [errorMessage.Password];
          setPasswordError(passwordErrors[0]);
        }
        
        toast.error("Vui lòng kiểm tra lại thông tin");
      } else {
        toast.error(error.message || "Có lỗi xảy ra khi đổi mật khẩu");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input changes
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setEmailError("");
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
    setOtpError("");
  };

  const handlePasswordChange = (e) => {
    setNewPassword(e.target.value);
    setPasswordError("");
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmNewPassword(e.target.value);
    setConfirmPasswordError("");
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        bgcolor: 'grey.50',
        py: 4,
        px: 2,
        pt: 6
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 600,
          mx: 2,
          boxShadow: 3,
          borderRadius: 2,
          minHeight: 'fit-content'
        }}
      >
        <CardContent sx={{ p: 5 }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
              <FaLock sx={{ fontSize: 40, color: 'primary.main', mr: 1 }} />
            </Box>
            <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
              Đổi mật khẩu
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
              {step === 1 && "Nhập email để nhận mã OTP"}
              {step === 2 && "Nhập mã OTP đã được gửi đến email"}
              {step === 3 && "Nhập mật khẩu mới"}
            </Typography>
          </Box>

          {/* Step 1: Request OTP */}
          {step === 1 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={handleEmailChange}
                error={!!emailError}
                helperText={emailError}
                size="large"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FaEnvelope color="action" />
                    </InputAdornment>
                  ),
                }}
                disabled={isLoading}
                sx={{ 
                  '& .MuiInputBase-root': { 
                    fontSize: '1.1rem',
                    padding: '12px 16px'
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: '1.1rem'
                  }
                }}
              />
              
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleRequestOtp}
                disabled={isLoading}
                startIcon={isLoading ? <CircularProgress size={24} /> : <FaKey />}
                sx={{ 
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 'bold'
                }}
              >
                {isLoading ? "Đang gửi..." : "Gửi OTP"}
              </Button>
            </Box>
          )}

          {/* Step 2: Enter OTP */}
          {step === 2 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <Alert severity="info" sx={{ mb: 3, fontSize: '1rem' }}>
                Mã OTP đã được gửi đến <strong>{email}</strong>
              </Alert>
              
              <TextField
                fullWidth
                label="Mã OTP (6 chữ số)"
                value={otp}
                onChange={handleOtpChange}
                error={!!otpError}
                helperText={otpError}
                size="large"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FaKey color="action" />
                    </InputAdornment>
                  ),
                }}
                disabled={isLoading}
                sx={{ 
                  '& .MuiInputBase-root': { 
                    fontSize: '1.1rem',
                    padding: '12px 16px'
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: '1.1rem'
                  }
                }}
              />
              
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleVerifyOtp}
                disabled={isLoading || !otp || otp.length !== 6}
                startIcon={isLoading ? <CircularProgress size={24} /> : <FaCheckCircle />}
                sx={{ 
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 'bold'
                }}
              >
                {isLoading ? "Đang xác thực..." : "Tiếp tục"}
              </Button>
              
              <Divider sx={{ my: 3 }}>
                <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1rem' }}>
                  Hoặc
                </Typography>
              </Divider>
              
              <Button
                fullWidth
                variant="outlined"
                onClick={handleResendOtp}
                disabled={!canResend || isLoading}
                startIcon={canResend ? <FaEnvelope /> : <CircularProgress size={24} />}
                sx={{ 
                  py: 2,
                  fontSize: '1.1rem'
                }}
              >
                {canResend 
                  ? "Gửi lại OTP" 
                  : `Gửi lại OTP (${countdown}s)`
                }
              </Button>
            </Box>
          )}

          {/* Step 3: Enter new password */}
          {step === 3 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <Alert severity="info" sx={{ mb: 3, fontSize: '1rem' }}>
                Nhập mật khẩu mới cho tài khoản <strong>{email}</strong>
              </Alert>
              
              <TextField
                fullWidth
                label="Nhập mật khẩu mới"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={handlePasswordChange}
                error={!!passwordError}
                helperText={passwordError}
                size="large"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FaLock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="large"
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                disabled={isLoading}
                sx={{ 
                  '& .MuiInputBase-root': { 
                    fontSize: '1.1rem',
                    padding: '12px 16px'
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: '1.1rem'
                  }
                }}
              />
              
              <TextField
                fullWidth
                label="Nhập lại mật khẩu mới"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmNewPassword}
                onChange={handleConfirmPasswordChange}
                error={!!confirmPasswordError}
                helperText={confirmPasswordError}
                size="large"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FaLock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                        size="large"
                      >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                disabled={isLoading}
                sx={{ 
                  '& .MuiInputBase-root': { 
                    fontSize: '1.1rem',
                    padding: '12px 16px'
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: '1.1rem'
                  }
                }}
              />
              
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleChangePassword}
                disabled={isLoading || !newPassword || !confirmNewPassword}
                startIcon={isLoading ? <CircularProgress size={24} /> : <FaCheckCircle />}
                sx={{ 
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 'bold'
                }}
              >
                {isLoading ? "Đang đổi mật khẩu..." : "Đổi mật khẩu"}
              </Button>
            </Box>
          )}

          {/* Back button */}
          {(step === 2 || step === 3) && (
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Button
                variant="text"
                startIcon={<FaArrowLeft />}
                onClick={() => setStep(step - 1)}
                disabled={isLoading}
                sx={{ fontSize: '1rem' }}
              >
                Quay lại
              </Button>
            </Box>
          )}

          {/* Footer */}
          <Box sx={{ mt: 5, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1rem' }}>
              Nhớ mật khẩu?{" "}
              <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
                <Typography
                  component="span"
                  variant="body1"
                  sx={{ 
                    color: 'primary.main', 
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    '&:hover': { color: 'primary.dark' }
                  }}
                >
                  Đăng nhập
                </Typography>
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default ChangePasswordPage; 