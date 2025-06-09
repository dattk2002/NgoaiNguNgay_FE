import React from 'react';
import { FaSearch, FaRegCalendarAlt, FaVideo } from 'react-icons/fa'; // Import icons

const HowItWork = () => {
  return (
    <div className="py-16 bg-white"> {/* Main container */}
      <div className="container mx-auto px-4">

        {/* "How It Works" Section */}
        <div className="text-center mb-12">
          <h2 className="text-black text-3xl font-semibold mb-10">Cách hoạt động</h2> {/* Translated */}
          <div className="flex flex-col md:flex-row justify-around items-start space-y-8 md:space-y-0 md:space-x-4">

            {/* Feature 1: Find Your Teacher */}
            <div className="flex flex-col items-center md:w-1/3 px-4">
              <div className="bg-gray-100 rounded-full p-4 inline-block mb-4">
                <FaSearch className="text-2xl text-gray-700" />
              </div>
              <h3 className="text-gray-900 text-xl font-medium mb-2">Tìm giáo viên của bạn</h3> {/* Translated */}
              <p className="text-gray-600 text-center">
                Duyệt hồ sơ, đọc đánh giá và tìm giáo viên hoàn hảo cho mục tiêu của bạn.
              </p> {/* Translated */}
            </div>

            {/* Feature 2: Schedule Lessons */}
            <div className="flex flex-col items-center md:w-1/3 px-4">
              <div className="bg-gray-100 rounded-full p-4 inline-block mb-4">
                <FaRegCalendarAlt className="text-2xl text-gray-700" />
              </div>
              <h3 className="text-gray-900 text-xl font-medium mb-2">Đặt lịch buổi học</h3> {/* Translated */}
              <p className="text-gray-600 text-center">
                Đặt lịch buổi học vào thời gian phù hợp với bạn bằng cách sử dụng hệ thống đặt lịch linh hoạt của chúng tôi.
              </p> {/* Translated */}
            </div>

            {/* Feature 3: Start Learning */}
            <div className="flex flex-col items-center md:w-1/3 px-4">
              <div className="bg-gray-100 rounded-full p-4 inline-block mb-4">
                <FaVideo className="text-2xl text-gray-700" />
              </div>
              <h3 className="text-gray-900 text-xl font-medium mb-2">Bắt đầu học</h3> {/* Translated */}
              <p className="text-gray-600 text-center">
                Kết nối qua trò chuyện video và bắt đầu cải thiện kỹ năng ngôn ngữ của bạn.
              </p> {/* Translated */}
            </div>
          </div>
        </div>

        {/* Separator (using margin/padding) */}
        <div className="mt-16"></div> {/* Adds space */}

        {/* "Ready to Start" Section */}
        <div className="text-center pt-12 border-t border-gray-200"> {/* Added top border */}
          <h2 className="text-black text-3xl font-semibold mb-4">Sẵn sàng bắt đầu hành trình ngôn ngữ của bạn?</h2> {/* Translated */}
          <p className="text-gray-600 mb-8">
            Tham gia cùng hàng ngàn sinh viên học ngôn ngữ mới mỗi ngày
          </p> {/* Translated */}
          <button className="bg-black text-white font-semibold py-3 px-8 rounded-lg hover:bg-gray-800 transition duration-300">
            Bắt đầu ngay
          </button> {/* Translated */}
        </div>

      </div>
    </div>
  );
};

export default HowItWork;
