import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ScheduleTracking from './ScheduleTracking';
// import StudentRequests from './StudentRequests'; // Đã xóa
import TeachingHistory from './TeachingHistory';
import OfferManagement from './OfferManagement';
import TutorDisputes from './TutorDisputes';
import BookingRequests from './BookingRequests';

const TutorManagementDashboard = () => {
  const [activeTab, setActiveTab] = useState('schedule');

  const tabs = [
    { id: 'schedule', label: 'Theo dõi lịch dạy', component: ScheduleTracking },
    // { id: 'requests', label: 'Yêu cầu từ học viên', component: StudentRequests }, // Đã xóa
    { id: 'booking-requests', label: 'Quản lí booking từ học viên', component: BookingRequests },
    { id: 'offers', label: 'Quản lý yêu cầu', component: OfferManagement },
    { id: 'disputes', label: 'Quản lý khiếu nại', component: TutorDisputes },
    { id: 'history', label: 'Lịch sử dạy học', component: TeachingHistory },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lí dạy học</h1>
        <p className="text-gray-600">Quản lý lịch dạy, yêu cầu học tập và theo dõi tiến độ của bạn</p>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`no-focus-outline flex-1 px-6 py-4 text-center font-medium transition-colors relative ${
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
    </div>
  );
};

export default TutorManagementDashboard; 