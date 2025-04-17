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

function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+19"); // Default to Vietnam (+84)
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!fullName || (!email && !phone) || !password || !confirmPassword) {
      setError(
        "Full name, password, and either email or phone number are required"
      );
      return;
    }

    if (phone && !/^\d{7,15}$/.test(phone.replace(/\D/g, ""))) {
      setError("Phone number must be between 7 and 15 digits");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Clean phone number by removing non-digits
    const cleanPhone = phone ? phone.replace(/\D/g, "") : null;

    // Save account to localStorage
    const accountData = {
      fullName,
      email: email || null,
      phone: cleanPhone, // Store only the local phone number (e.g., "0983564074")
      countryCode, // Store the country code separately
      password,
    };

    // Retrieve existing accounts or initialize an empty array
    const existingAccounts = JSON.parse(localStorage.getItem("accounts")) || [];
    // Check for duplicate email or phone
    const duplicate = existingAccounts.some(
      (account) =>
        (email && account.email === email) ||
        (cleanPhone &&
          account.phone === cleanPhone &&
          account.countryCode === countryCode)
    );
    if (duplicate) {
      setError("An account with this email or phone number already exists");
      return;
    }
    // Add new account to the array
    existingAccounts.push(accountData);
    // Save updated accounts array back to localStorage
    localStorage.setItem("accounts", JSON.stringify(existingAccounts));

    // Redirect to login page
    navigate("/login");
  };

  return (
    <div className="w-full min-h-[calc(100vh-60px)] flex items-center justify-center bg-gray-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
        <h2 className="text-center text-lg font-semibold mb-4">
          Create an Account
          <br />
          Join LangConnect today
        </h2>
        {error && (
          <div className="bg-red-50 border border-red-500 text-red-600 p-2 rounded text-sm text-center mb-4">
            {error}
          </div>
        )}
        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="p-3 text-base border border-gray-300 rounded focus:outline-none focus:border-gray-500"
          />
          <input
            type="email"
            placeholder="Email (optional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 text-base border border-gray-300 rounded focus:outline-none focus:border-gray-500"
          />
          <div className="flex gap-2">
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="p-3 text-base border border-gray-300 rounded focus:outline-none focus:border-gray-500"
            >
              {countryCodes.map((country) => (
                <option key={country.code} value={country.code}>
                  ({country.code})
                </option>
              ))}
            </select>
            <input
              type="tel"
              placeholder="Phone Number (optional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="flex-1 p-3 text-base border border-gray-300 rounded focus:outline-none focus:border-gray-500"
            />
          </div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 text-base border border-gray-300 rounded focus:outline-none focus:border-gray-500"
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="p-3 text-base border border-gray-300 rounded focus:outline-none focus:border-gray-500"
          />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="h-4 w-4" />I agree to the{" "}
            <a href="#" className="text-black hover:underline">
              Terms of Service & Privacy Policy
            </a>
          </label>
          <button
            onClick={handleSubmit}
            className="bg-black text-white p-3 rounded font-semibold text-base hover:bg-gray-800"
          >
            Create Account
          </button>
          <div className="text-center text-sm my-2">Or register with</div>
          <button className="flex items-center justify-center gap-2 border border-gray-300 p-3 rounded text-sm hover:bg-gray-100">
            <span className="text-blue-600 font-bold">G</span> Continue with
            Google
          </button>
          <button className="flex items-center justify-center gap-2 border border-gray-300 p-3 rounded text-sm hover:bg-gray-100">
            <span className="text-blue-800 font-bold">f</span> Continue with
            Facebook
          </button>
          <div className="text-center text-sm mt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-black hover:underline">
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
