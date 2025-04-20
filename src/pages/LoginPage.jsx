import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaFacebook } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

const REMEMBERED_ACCOUNTS_KEY = "rememberedAccounts";
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function LoginPage({ onLogin }) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [rememberedPhones, setRememberedPhones] = useState([]);
  const [showPhoneDropdown, setShowPhoneDropdown] = useState(false);

  useEffect(() => {
    const storedAccounts = JSON.parse(
      localStorage.getItem(REMEMBERED_ACCOUNTS_KEY) || "[]"
    );
    const now = Date.now();

    // Filter out expired accounts
    const validAccounts = storedAccounts.filter(
      (account) => account.expires > now
    );

    // Update localStorage with only valid accounts
    localStorage.setItem(REMEMBERED_ACCOUNTS_KEY, JSON.stringify(validAccounts));

    if (validAccounts.length === 1) {
      // If exactly one valid remembered account, pre-fill
      setPhone(validAccounts[0].phone);
      setPassword(validAccounts[0].password);
      setRememberMe(true);
      setShowPhoneDropdown(false);
      setRememberedPhones([]);
    } else if (validAccounts.length > 1) {
      // If multiple valid remembered accounts, show dropdown
      setRememberedPhones(validAccounts.map((acc) => acc.phone));
      setShowPhoneDropdown(true);
      setPhone(""); // Clear phone field initially
      setPassword("");
      setRememberMe(false);
    } else {
      // No valid remembered accounts
      setShowPhoneDropdown(false);
      setRememberedPhones([]);
      setPhone("");
      setPassword("");
      setRememberMe(false);
    }
  }, []);

  const handlePhoneChange = (e) => {
      const selectedPhone = e.target.value;
      setPhone(selectedPhone);
      // Clear password when selecting from dropdown
      setPassword("");
      setRememberMe(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!phone || !password) {
      setError("Vui lòng nhập số điện thoại và mật khẩu");
      return;
    }

    const accounts = JSON.parse(localStorage.getItem("accounts")) || [];
    const matchedAccount = accounts.find(
      (account) =>
        account.phone === phone.replace(/\D/g, "") &&
        account.password === password
    );

    if (matchedAccount) {
      const storedAccounts = JSON.parse(
        localStorage.getItem(REMEMBERED_ACCOUNTS_KEY) || "[]"
      );
      const now = Date.now();
      // Filter out expired accounts before modifying
      let validAccounts = storedAccounts.filter(
        (account) => account.expires > now
      );

      // Remove existing entry for this phone, if any
      validAccounts = validAccounts.filter(acc => acc.phone !== phone);

      if (rememberMe) {
        // Add new/updated entry if rememberMe is checked
        validAccounts.push({
            phone: phone,
            password: password,
            expires: now + SEVEN_DAYS_MS,
        });
        localStorage.setItem(REMEMBERED_ACCOUNTS_KEY, JSON.stringify(validAccounts));
      } else {
         // Save the filtered list (account removed) if rememberMe is not checked
        localStorage.setItem(REMEMBERED_ACCOUNTS_KEY, JSON.stringify(validAccounts));
      }

      // Clear old single remember items if they exist
      localStorage.removeItem("rememberedPhone");
      localStorage.removeItem("rememberedPassword");


      onLogin({
        id: Date.now().toString(),
        name: matchedAccount.fullName,
        phone: matchedAccount.phone,
      });
    } else {
      setError("Số điện thoại hoặc mật khẩu không đúng");
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-60px)] flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm">
        <h2 className="text-center text-xl font-semibold mb-6">
          Chào mừng đến với NgoaiNguNgay
          <br />
          <span className="text-gray-600 text-base font-normal">
            Đăng nhập tài khoản
          </span>
        </h2>
        {error && (
          <div className="bg-red-50 border border-red-500 text-red-600 p-3 rounded text-sm text-center mb-4">
            {error}
          </div>
        )}
        <div className="flex flex-col gap-5">
          {showPhoneDropdown ? (
             <select
               value={phone}
               onChange={handlePhoneChange}
               className="p-3 text-base border border-gray-300 rounded focus:outline-none focus:border-gray-500" // Added bg-white for consistency
             >
               <option value="" disabled>Chọn số điện thoại đã lưu</option>
               {rememberedPhones.map((p) => (
                 <option key={p} value={p}>
                   {p}
                 </option>
               ))}
             </select>
           ) : (
            <input
              type="tel"
              placeholder="Số điện thoại (+84)"
              value={phone}
              onChange={(e) => {
                const value = e.target.value;
                // Allow only digits or empty string
                if (/^\d*$/.test(value)) {
                  setPhone(value);
                  setError(""); // Clear error if input is valid
                } else {
                  setError("Số điện thoại chỉ được chứa chữ số.");
                }
              }}
              className="p-3 text-base border border-gray-300 rounded focus:outline-none focus:border-gray-500"
              // Prevent non-numeric input visually if needed, though state handles the logic
              // onKeyDown={(e) => !/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.preventDefault()}
            />
          )}
          <input
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 text-base border border-gray-300 rounded focus:outline-none focus:border-gray-500"
          />
          <div className="flex justify-between items-center text-sm">
            <label className="flex items-center gap-2 text-gray-600">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Ghi nhớ đăng nhập {/* Updated label */}
            </label>
            <Link
              to="/forgot-password"
              className="text-blue-600 hover:underline"
            >
              Quên mật khẩu?
            </Link>
          </div>
          <button
            onClick={handleSubmit}
            className="bg-black text-white p-3 rounded font-semibold text-base hover:bg-gray-800 transition-colors duration-200"
          >
            Đăng nhập
          </button>
          <div className="text-center text-sm my-2 text-gray-500">
            Hoặc tiếp tục với
          </div>
          <button className="flex items-center justify-center gap-2 border bg-gray-100 border-gray-300 p-3 rounded text-sm hover:bg-gray-300 transition-colors duration-200">
            <FcGoogle className="text-red-600" /> Login with Google
          </button>
          <button className="flex items-center justify-center gap-2 border bg-gray-100 border-gray-300 p-3 rounded text-sm hover:bg-gray-300 transition-colors duration-200">
            <FaFacebook className="text-blue-800" /> Login with Facebook
          </button>
          <div className="text-center text-sm mt-4 text-gray-600">
            Chưa có tài khoản?{" "}
            <Link to="/signup" className="text-blue-600 hover:underline">
              Đăng ký
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
