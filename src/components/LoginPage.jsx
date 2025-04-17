import { useState } from "react";
import { Link } from "react-router-dom";

function LoginPage({ onLogin }) {
  const [identifier, setIdentifier] = useState(""); // Email or phone number
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!identifier || !password) {
      setError("Email or phone number and password are required");
      return;
    }

    // Retrieve accounts from localStorage
    const accounts = JSON.parse(localStorage.getItem("accounts")) || [];

    // Check if the entered identifier (email or phone) and password match any account
    const matchedAccount = accounts.find(
      (account) =>
        ((account.email && account.email === identifier) ||
         (account.phone && account.phone === identifier)) &&
        account.password === password
    );

    if (matchedAccount) {
      const userData = {
        id: Date.now().toString(), // Simple unique ID
        name: matchedAccount.fullName,
        email: matchedAccount.email,
        phone: matchedAccount.phone,
      };
      onLogin(userData);
    } else {
      setError("Invalid email/phone number or password");
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-60px)] flex items-center justify-center bg-gray-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
        <h2 className="text-center text-lg font-semibold mb-4">
          Welcome to LangConnect
          <br />
          Sign in to your account
        </h2>
        {error && (
          <div className="bg-red-50 border border-red-500 text-red-600 p-2 rounded text-sm text-center mb-4">
            {error}
          </div>
        )}
        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Email or Phone Number"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="p-3 text-base border border-gray-300 rounded focus:outline-none focus:border-gray-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 text-base border border-gray-300 rounded focus:outline-none focus:border-gray-500"
          />
          <div className="flex justify-between items-center text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="h-4 w-4" />
              Remember me
            </label>
            <Link to="/forgot-password" className="text-black hover:underline">
              Forgot password?
            </Link>
          </div>
          <button
            onClick={handleSubmit}
            className="bg-black text-white p-3 rounded font-semibold text-base hover:bg-gray-800"
          >
            Log in
          </button>
          <div className="text-center text-sm my-2">Or continue with</div>
          <button className="flex items-center justify-center gap-2 border border-gray-300 p-3 rounded text-sm hover:bg-gray-100">
            <span className="text-blue-600 font-bold">G</span> Continue with Google
          </button>
          <button className="flex items-center justify-center gap-2 border border-gray-300 p-3 rounded text-sm hover:bg-gray-100">
            <span className="text-blue-800 font-bold">f</span> Continue with Facebook
          </button>
          <div className="text-center text-sm mt-4">
            Don't have an account?{" "}
            <Link to="/signup" className="text-black hover:underline">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;