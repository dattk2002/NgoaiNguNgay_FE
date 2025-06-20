import React from 'react';
import { Link } from 'react-router-dom'; // Assuming you use react-router-dom for navigation

const NotGrantedPermissionPage = () => {
  return (
    <div className="flex items-center justify-center p-10 bg-gray-100">
      <div className="text-center rounded-lg">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-4">Truy cập bị từ chối</h1> {/* Translated */}
        <p className="text-lg text-gray-600 mb-8">Bạn không có quyền cần thiết để xem trang này.</p> {/* Translated */}
        {/* You can change '/' to your desired home or login page */}
        <Link
          to="/"
          className="inline-block px-8 py-3 text-lg font-semibold text-white bg-blue-700 rounded-lg hover:bg-blue-800 transition duration-300 ease-in-out shadow-lg"
        >
          Đi tới Trang chủ {/* Translated */}
        </Link>
      </div>
    </div>
  );
};

export default NotGrantedPermissionPage;
