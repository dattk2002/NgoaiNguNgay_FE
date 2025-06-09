import React from 'react';
// Import necessary icons
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import logo from '../assets/logo.png';

function Footer() {
  return (
    <footer className="bg-gray-100 py-8"> {/* Increased vertical padding slightly */}
      <div className="container mx-auto px-4">
        {/* Use Flexbox for layout - Column on small, Row on medium+ */}
        <div className="flex flex-col md:flex-row mb-8"> {/* Changed to flex, removed gap */}
          {/* NgoaiNguNgay Section */}
          {/* Added width, right margin for large gap, and bottom margin for small screens */}
          <div className="md:w-1/4 md:mr-100 mb-8 md:mb-0"> {/* Added md:w-1/4, md:mr-12, mb-8, md:mb-0 */}
            <h5 className="text-gray-700 text-lg font-bold mb-2"><img src={logo} alt="logo" className="w-20 h-20" /></h5>
            <p className="text-gray-600">Kết nối với giáo viên ngôn ngữ trên toàn thế giới</p> {/* Translated */}
          </div>

          {/* Company Section */}
          {/* Added width, right margin for small gap, and bottom margin for small screens */}
          <div className="md:w-1/4 md:mr-2 mb-8 md:mb-0"> {/* Added md:w-1/4, md:mr-2, mb-8, md:mb-0 */}
            <h5 className="text-gray-700 text-lg font-bold mb-2">Công ty</h5> {/* Translated */}
            <ul className="space-y-1">
              <li><a href="#" className="text-gray-600 hover:text-gray-900 hover:underline">Về chúng tôi</a></li> {/* Translated */}
              <li><a href="#" className="text-gray-600 hover:text-gray-900 hover:underline">Tuyển dụng</a></li> {/* Translated */}
              <li><a href="#" className="text-gray-600 hover:text-gray-900 hover:underline">Blog</a></li>
            </ul>
          </div>

          {/* Support Section */}
          {/* Added width, right margin for small gap, and bottom margin for small screens */}
          <div className="md:w-1/4 md:mr-2 mb-8 md:mb-0"> {/* Added md:w-1/4, md:mr-2, mb-8, md:mb-0 */}
            <h5 className="text-gray-700 text-lg font-bold mb-2">Hỗ trợ</h5> {/* Translated */}
            <ul className="space-y-1">
              <li><a href="#" className="text-gray-600 hover:text-gray-900 hover:underline">Trung tâm trợ giúp</a></li> {/* Translated */}
              <li><a href="#" className="text-gray-600 hover:text-gray-900 hover:underline">An toàn</a></li> {/* Translated */}
              <li><a href="#" className="text-gray-600 hover:text-gray-900 hover:underline">Điều khoản dịch vụ</a></li> {/* Translated */}
            </ul>
          </div>

          {/* Follow Us Section */}
          {/* Added width, no right margin needed, no bottom margin needed */}
          <div className="md:w-1/4"> {/* Added md:w-1/4 */}
            <h5 className="text-gray-700 text-lg font-bold mb-2">Theo dõi chúng tôi</h5> {/* Translated */}
            <ul className="flex gap-4">
              <li><a href="#" aria-label="Facebook" className="text-gray-600 hover:text-gray-900"><FaFacebookF size={20} /></a></li>
              <li><a href="#" aria-label="Twitter" className="text-gray-600 hover:text-gray-900"><FaTwitter size={20} /></a></li>
              <li><a href="#" aria-label="Instagram" className="text-gray-600 hover:text-gray-900"><FaInstagram size={20} /></a></li>
              <li><a href="#" aria-label="LinkedIn" className="text-gray-600 hover:text-gray-900"><FaLinkedinIn size={20} /></a></li>
            </ul>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="text-center text-gray-600 border-t border-gray-300 pt-6"> {/* Adjusted text color, border color, and padding */}
          <p>&copy; 2025 NgoaiNguNgay. Đã đăng ký bản quyền.</p> {/* Translated */}
        </div>
      </div>
    </footer>
  );
}

export default Footer;