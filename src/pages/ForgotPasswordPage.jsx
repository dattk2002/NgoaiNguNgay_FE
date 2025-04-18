import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// List of countries with E.164 codes (partial list for demo)
const countryCodes = [
  { name: "Vietnam", code: "+84" },
  { name: "United States", code: "+1" },
  { name: "United Kingdom", code: "+44" },
  { name: "India", code: "+91" },
  { name: "Australia", code: "+61" },
  { name: "Canada", code: "+1" },
  { name: "Test", code: "+19" },
  // Add more countries as needed
];

function ForgotPasswordPage() {
  const [email, setEmail] = useState(""); // Separate state for email
  const [phone, setPhone] = useState(""); // Separate state for phone number
  const [countryCode, setCountryCode] = useState("+19"); // Default to Vietnam (+84)
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState(1); // 1: Enter email/phone, 2: Enter OTP, 3: Enter new password
  const navigate = useNavigate();

  const handleIdentifierSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!email && !phone) {
      setError("Please provide either an email or a phone number");
      return;
    }

    if (email && phone) {
      setError("Please provide only one: either email or phone number");
      return;
    }

    // Determine the identifier (email or phone)
    const isEmail = !!email;
    let identifier = email;
    let cleanPhone = phone;

    if (!isEmail) {
      // Clean phone number by removing non-digits
      cleanPhone = phone.replace(/\D/g, "");
      if (!/^\d{7,15}$/.test(cleanPhone)) {
        setError("Phone number must be between 7 and 15 digits");
        return;
      }
      identifier = cleanPhone;
    }

    // Retrieve accounts from localStorage
    const accounts = JSON.parse(localStorage.getItem("accounts")) || [];

    // Check if the entered identifier (email or phone) exists
    const matchedAccount = accounts.find(
      (account) =>
        (isEmail && account.email && account.email === identifier) ||
        (!isEmail &&
          account.phone &&
          account.phone === cleanPhone &&
          account.countryCode === countryCode)
    );

    if (!matchedAccount) {
      setError("No account found with this email or phone number");
      return;
    }

    if (!isEmail) {
      // Combine country code with phone number for backend (E.164 format)
      const fullIdentifier = `${countryCode}${cleanPhone}`;
      // Check if identifier is a phone number (basic validation for backend)
      const isPhoneNumber = /^\+?[1-9]\d{1,14}$/.test(fullIdentifier);
      if (!isPhoneNumber) {
        setError(
          "Please provide a valid phone number in E.164 format (e.g., +840983564074)"
        );
        return;
      }

      try {
        // Call backend API to send OTP
        const response = await fetch("http://localhost:5000/send-otp", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ identifier: fullIdentifier }),
        });

        const data = await response.json();

        if (response.ok) {
          setError("");
          setStep(2); // Move to OTP step
        } else {
          setError(data.error || "Failed to send OTP");
        }
      } catch (err) {
        setError("An error occurred while sending OTP");
      }
    } else {
      // For email, we’d send an OTP via email (not implemented in this demo)
      setError("Email-based OTP sending is not implemented in this demo");
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!otp) {
      setError("OTP is required");
      return;
    }

    // Determine if the identifier is an email or phone number
    const isEmail = !!email;
    const identifier = isEmail ? email : phone;
    const fullIdentifier = isEmail
      ? email
      : `${countryCode}${phone.replace(/\D/g, "")}`;

    try {
      // Call backend API to verify OTP
      const response = await fetch("http://localhost:5000/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier: fullIdentifier, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        setError("");
        setStep(3); // Move to password reset step
      } else {
        setError(data.error || "Invalid OTP");
      }
    } catch (err) {
      setError("An error occurred while verifying OTP");
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!newPassword || !confirmNewPassword) {
      setError("New password and confirm password are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Determine if the identifier is an email or phone number
    const isEmail = !!email;
    const identifier = isEmail ? email : phone;
    const cleanPhone = isEmail ? null : phone.replace(/\D/g, "");
    const fullIdentifier = isEmail ? email : `${countryCode}${cleanPhone}`;

    // Retrieve accounts from localStorage
    const accounts = JSON.parse(localStorage.getItem("accounts")) || [];

    // Find the account and update the password
    const updatedAccounts = accounts.map((account) => {
      if (
        (isEmail && account.email && account.email === identifier) ||
        (!isEmail &&
          account.phone &&
          account.phone === cleanPhone &&
          account.countryCode === countryCode)
      ) {
        return { ...account, password: newPassword };
      }
      return account;
    });

    // Save updated accounts back to localStorage
    localStorage.setItem("accounts", JSON.stringify(updatedAccounts));

    // Redirect to login page
    navigate("/login");
  };

  return (
    <div className="w-full min-h-[calc(100vh-60px)] flex items-center justify-center bg-gray-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
        <h2 className="text-center text-lg font-semibold mb-4">
          Reset Your Password
        </h2>
        {error && (
          <div className="bg-red-50 border border-red-500 text-red-600 p-2 rounded text-sm text-center mb-4">
            {error}
          </div>
        )}
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setPhone(""); // Clear phone number when email is being used
              }}
              className="p-3 text-base border border-gray-300 rounded focus:outline-none focus:border-gray-500"
            />
            <div className="flex gap-2">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="w-24 p-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-gray-500"
              >
                {countryCodes.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.code}
                  </option>
                ))}
              </select>
              <input
                type="tel"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setEmail(""); // Clear email when phone number is being used
                }}
                className="flex-1 p-3 text-base border border-gray-300 rounded focus:outline-none focus:border-gray-500"
              />
            </div>
            <button
              onClick={handleIdentifierSubmit}
              className="bg-black text-white p-3 rounded font-semibold text-base hover:bg-gray-800"
            >
              Send OTP
            </button>
            <div className="text-center text-sm mt-4">
              Remember your password?{" "}
              <Link to="/login" className="text-black hover:underline">
                Log in
              </Link>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="flex flex-col gap-4">
            <p className="text-center text-sm mb-2">
              An OTP has been sent to {email || phone}
            </p>
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="p-3 text-base border border-gray-300 rounded focus:outline-none focus:border-gray-500"
            />
            <button
              onClick={handleOtpSubmit}
              className="bg-black text-white p-3 rounded font-semibold text-base hover:bg-gray-800"
            >
              Verify OTP
            </button>
            <div className="text-center text-sm mt-4">
              <button
                onClick={() => setStep(1)}
                className="text-black hover:underline"
              >
                Back
              </button>
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="flex flex-col gap-4">
            <p className="text-center text-sm mb-2">Enter your new password</p>
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="p-3 text-base border border-gray-300 rounded focus:outline-none focus:border-gray-500"
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className="p-3 text-base border border-gray-300 rounded focus:outline-none focus:border-gray-500"
            />
            <button
              onClick={handlePasswordSubmit}
              className="bg-black text-white p-3 rounded font-semibold text-base hover:bg-gray-800"
            >
              Reset Password
            </button>
            <div className="text-center text-sm mt-4">
              <button
                onClick={() => setStep(2)}
                className="text-black hover:underline"
              >
                Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
