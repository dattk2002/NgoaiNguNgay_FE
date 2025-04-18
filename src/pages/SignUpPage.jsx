import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaFacebook } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!fullName || !phone || !password || !confirmPassword) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (!/^\d{7,15}$/.test(phone.replace(/\D/g, ""))) {
      setError("Số điện thoại phải từ 7 đến 15 chữ số");
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu không khớp");
      return;
    }

    const cleanPhone = phone.replace(/\D/g, "");
    const accountData = {
      fullName,
      phone: cleanPhone,
      countryCode: "+84",
      password,
    };

    const existingAccounts = JSON.parse(localStorage.getItem("accounts")) || [];
    const duplicate = existingAccounts.some(
      (account) => account.phone === cleanPhone && account.countryCode === "+84"
    );
    if (duplicate) {
      setError("Số điện thoại đã được đăng ký");
      return;
    }

    existingAccounts.push(accountData);
    localStorage.setItem("accounts", JSON.stringify(existingAccounts));
    navigate("/login");
  };

  return (
    <div className="w-full min-h-[calc(100vh-60px)] py-8 flex items-center justify-center bg-gray-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
        <h2 className="text-center text-lg font-semibold mb-4">
          Tạo tài khoản
          <br />
          Tham gia NgoaiNguNgay ngay
        </h2>
        {error && (
          <div className="bg-red-50 border border-red-500 text-red-600 p-2 rounded text-sm text-center mb-4">
            {error}
          </div>
        )}
        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Họ và tên"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="p-3 text-base border border-gray-300 rounded focus:outline-none focus:border-gray-500"
          />
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
          <input
            type="password"
            placeholder="Xác nhận mật khẩu"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="p-3 text-base border border-gray-300 rounded focus:outline-none focus:border-gray-500"
          />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="h-4 w-4" />
            Tôi đồng ý với{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Điều khoản dịch vụ
            </a>
          </label>
          <button
            onClick={handleSubmit}
            className="bg-black text-white p-3 rounded font-semibold text-base hover:bg-gray-800"
          >
            Đăng ký
          </button>
          <div className="text-center text-sm my-2">Hoặc đăng ký với</div>
          <button className="flex items-center justify-center gap-2 border bg-gray-100 border-gray-300 p-3 rounded text-sm hover:bg-gray-300">
            <FcGoogle className="text-red-600" /> Sign up with Google
          </button>
          <button className="flex items-center justify-center gap-2 border bg-gray-100 border-gray-300 p-3 rounded text-sm hover:bg-gray-300">
            <FaFacebook className="text-blue-800" /> Sign up with Facebook
          </button>
          <div className="text-center text-sm mt-4">
            Đã có tài khoản?{" "}
            <Link to="/login" className="text-blue-600 hover:underline">
              Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
