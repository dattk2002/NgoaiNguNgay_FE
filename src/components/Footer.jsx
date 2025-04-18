import React from 'react';
// Import necessary icons
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';

function Footer() {
  return (
    <footer className="bg-gray-100 py-8"> {/* Increased vertical padding slightly */}
      <div className="container mx-auto px-4">
        {/* Use Flexbox for layout - Column on small, Row on medium+ */}
        <div className="flex flex-col md:flex-row mb-8"> {/* Changed to flex, removed gap */}
          {/* NgoaiNguNgay Section */}
          {/* Added width, right margin for large gap, and bottom margin for small screens */}
          <div className="md:w-1/4 md:mr-100 mb-8 md:mb-0"> {/* Added md:w-1/4, md:mr-12, mb-8, md:mb-0 */}
            <h5 className="text-lg font-semibold mb-2">NgoaiNguNgay</h5>
            <p className="text-gray-600">Connect with language teachers worldwide</p>
          </div>

          {/* Company Section */}
          {/* Added width, right margin for small gap, and bottom margin for small screens */}
          <div className="md:w-1/4 md:mr-2 mb-8 md:mb-0"> {/* Added md:w-1/4, md:mr-2, mb-8, md:mb-0 */}
            <h5 className="text-lg font-semibold mb-2">Company</h5>
            <ul className="space-y-1">
              <li><a href="#" className="text-gray-600 hover:text-gray-900 hover:underline">About Us</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900 hover:underline">Careers</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900 hover:underline">Blog</a></li>
            </ul>
          </div>

          {/* Support Section */}
          {/* Added width, right margin for small gap, and bottom margin for small screens */}
          <div className="md:w-1/4 md:mr-2 mb-8 md:mb-0"> {/* Added md:w-1/4, md:mr-2, mb-8, md:mb-0 */}
            <h5 className="text-lg font-semibold mb-2">Support</h5>
            <ul className="space-y-1">
              <li><a href="#" className="text-gray-600 hover:text-gray-900 hover:underline">Help Center</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900 hover:underline">Safety</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900 hover:underline">Terms of Service</a></li>
            </ul>
          </div>

          {/* Follow Us Section */}
          {/* Added width, no right margin needed, no bottom margin needed */}
          <div className="md:w-1/4"> {/* Added md:w-1/4 */}
            <h5 className="text-lg font-semibold mb-2">Follow Us</h5>
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
          <p>&copy; 2025 NgoaiNguNgay. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;