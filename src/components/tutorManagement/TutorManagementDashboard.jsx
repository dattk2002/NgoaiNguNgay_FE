import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaInfoCircle, FaTimes, FaVideo, FaCheckCircle, FaMoneyBillWave, FaCalendarAlt } from 'react-icons/fa';
import ScheduleTracking from './ScheduleTracking';
// import StudentRequests from './StudentRequests'; // Đã xóa
import TeachingHistory from './TeachingHistory';
import OfferManagement from './OfferManagement';
import TutorDisputes from './TutorDisputes';
import BookingRequests from './BookingRequests';

const TutorManagementDashboard = () => {
  const [activeTab, setActiveTab] = useState('schedule');
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);

  const tabs = [
    { id: 'schedule', label: 'Theo dõi lịch dạy', component: ScheduleTracking },
    // { id: 'requests', label: 'Yêu cầu từ học viên', component: StudentRequests }, // Đã xóa
    { id: 'booking-requests', label: 'Book nhanh từ học viên', component: BookingRequests },
    { id: 'offers', label: 'Quản lý đề xuất đến học viên', component: OfferManagement },
            { id: 'disputes', label: 'Quản lý báo cáo', component: TutorDisputes },
    { id: 'history', label: 'Lịch sử dạy học', component: TeachingHistory },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Quản lí dạy học</h1>
          <button
            onClick={() => setIsNoteModalOpen(true)}
            className="no-focus-outline flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
          >
            <FaInfoCircle className="w-4 h-4" />
            <span className="font-medium">Lưu ý</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`no-focus-outline flex-1 px-3 py-3 text-center font-medium transition-colors relative text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                  layoutId="activeTab"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        {ActiveComponent && <ActiveComponent />}
      </motion.div>

      {/* Note Modal */}
      <AnimatePresence>
        {isNoteModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsNoteModalOpen(false)}
          >
            <motion.div 
              className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">Lưu ý quan trọng</h3>
                <button
                  type="button"
                  onClick={() => setIsNoteModalOpen(false)}
                  className="no-focus-outline p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FaTimes className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="space-y-6">
                  {/* 1. Ghi hình buổi học */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <FaVideo className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-2">1. Ghi hình buổi học</h4>
                        <p className="text-blue-800 text-sm mb-2">
                          Gia sư bắt buộc ghi lại màn hình trong suốt quá trình dạy.
                        </p>
                        <p className="text-blue-800 text-sm">
                          Video sẽ là bằng chứng trong trường hợp phát sinh khiếu nại từ Học viên.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 2. Hoàn tất buổi học */}
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <FaCheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-green-900 mb-2">2. Hoàn tất buổi học</h4>
                        <p className="text-green-800 text-sm mb-2">
                          Khi Slot kết thúc, hệ thống sẽ tự động đánh dấu hoàn thành (có thể trễ tối đa 5 phút).
                        </p>
                        <p className="text-green-800 text-sm">
                          Gia sư không cần điểm danh thủ công.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 3. Thanh toán học phí */}
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <FaMoneyBillWave className="w-4 h-4 text-yellow-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-yellow-900 mb-2">3. Thanh toán học phí</h4>
                        <p className="text-yellow-800 text-sm mb-2">
                          Học phí của Slot sẽ được chuyển về ví Gia sư sau 72h.
                        </p>
                        <p className="text-yellow-800 text-sm">
                          Quá trình có thể trễ tối đa 60 phút.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 4. Dời lịch học */}
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <FaCalendarAlt className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-purple-900 mb-2">4. Dời lịch học</h4>
                        <p className="text-purple-800 text-sm mb-2">
                          Yêu cầu dời lịch chỉ hợp lệ nếu được gửi trước 24h so với giờ bắt đầu Slot.
                        </p>
                        <p className="text-purple-800 text-sm mb-2">
                          Yêu cầu có hiệu lực tối đa 24h nếu chưa được Học viên chấp thuận.
                        </p>
                        <div className="text-purple-800 text-sm">
                          <p className="font-medium mb-1">Khi yêu cầu dời lịch tồn tại:</p>
                          <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Slot không thể được Học viên book.</li>
                            <li>Slot không thể được đưa vào Offer của Gia sư.</li>
                            <li>Nếu Học viên không chấp nhận, Slot giữ nguyên như ban đầu.</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TutorManagementDashboard; 