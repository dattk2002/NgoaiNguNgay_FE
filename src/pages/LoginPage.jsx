import { useState } from "react";
import { Link } from "react-router-dom";
import { FaFacebook } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

function LoginPage({ onLogin }) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

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
          Chào mừng đến với LangConnect
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
          <input
            type="tel"
            placeholder="Số điện thoại (+84)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="p-3 text-base border border-gray-300 rounded focus:outline-none focus:border-gray-500"
          />
          <input
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 text-base border border-gray-300 rounded focus:outline-none focus:border-gray-500"
          />
          <div className="flex justify-between items-center text-sm">
            <label className="flex items-center gap-2 text-gray-600">
              <input type="checkbox" className="h-4 w-4" />
              Ghi nhớ đăng nhập
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
