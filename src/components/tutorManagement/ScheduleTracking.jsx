import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCalendarAlt, FaClock, FaUser, FaVideo, FaMapMarkerAlt } from 'react-icons/fa';
import { 
  Skeleton, 
  Box, 
  Card, 
  CardContent, 
  Container 
} from '@mui/material';

// Mock data - replace with API call
const mockSchedules = [
  {
    id: 1,
    studentName: 'Nguyễn Văn A',
    subject: 'Tiếng Anh',
    date: '2024-01-15',
    time: '14:00 - 15:30',
    type: 'online',
    status: 'confirmed',
    studentAvatar: 'https://avatar.iran.liara.run/public/1',
  },
  {
    id: 2,
    studentName: 'Trần Thị B',
    subject: 'Tiếng Nhật',
    date: '2024-01-15',
    time: '16:00 - 17:00',
    type: 'offline',
    status: 'pending',
    location: 'Café ABC, Quận 1',
    studentAvatar: 'https://avatar.iran.liara.run/public/2',
  },
  {
    id: 3,
    studentName: 'Lê Văn C',
    subject: 'Tiếng Hàn',
    date: '2024-01-16',
    time: '09:00 - 10:30',
    type: 'online',
    status: 'confirmed',
    studentAvatar: 'https://avatar.iran.liara.run/public/3',
  },
  {
    id: 4,
    studentName: 'Phạm Thị D',
    subject: 'Tiếng Anh',
    date: '2024-01-12',
    time: '18:00 - 19:30',
    type: 'online',
    status: 'completed',
    studentAvatar: 'https://avatar.iran.liara.run/public/4',
  },
  {
    id: 5,
    studentName: 'Hoàng Văn E',
    subject: 'Tiếng Pháp',
    date: '2024-01-14',
    time: '10:00 - 11:30',
    type: 'offline',
    location: 'Quán cà phê XYZ, Quận 2',
    status: 'cancelled',
    cancelReason: 'Học viên báo bận việc gia đình đột xuất',
    studentAvatar: 'https://avatar.iran.liara.run/public/5',
  },
];

// Skeleton Component for Schedule Items
const ScheduleTrackingSkeleton = () => (
  <Box>
    {/* Header skeleton */}
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
      <Skeleton variant="text" width={200} height={40} />
      <Box sx={{ display: 'flex', gap: 1 }}>
        {Array.from({ length: 3 }).map((_, idx) => (
          <Skeleton key={idx} variant="rectangular" width={80} height={36} sx={{ borderRadius: 2 }} />
        ))}
      </Box>
    </Box>

    {/* Schedule items skeleton */}
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Card key={index} sx={{ borderRadius: 2, boxShadow: 1 }}>
          <CardContent sx={{ p: 3 }}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '80px 1fr 1fr 1fr 120px' },
                gap: 3,
                alignItems: 'center',
              }}
            >
              {/* Avatar skeleton */}
              <Skeleton variant="circular" width={56} height={56} />
              
              {/* Subject & Student Info skeleton */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Skeleton variant="text" width="80%" height={24} />
                <Skeleton variant="text" width="60%" height={20} />
              </Box>
              
              {/* Date & Time skeleton */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Skeleton variant="text" width="70%" height={20} />
                <Skeleton variant="text" width="80%" height={20} />
              </Box>
              
              {/* Learning Type skeleton */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Skeleton variant="text" width="90%" height={20} />
              </Box>
              
              {/* Actions skeleton */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-end' }}>
                <Skeleton variant="rectangular" width={100} height={32} sx={{ borderRadius: 1 }} />
                <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 1 }} />
              </Box>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  </Box>
);

const ScheduleTracking = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, today, upcoming
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setSchedules(mockSchedules);
      setLoading(false);
    }, 1000);
  }, []);

  const handleMarkCompleted = (scheduleId) => {
    setSchedules(schedules.map(schedule => 
      schedule.id === scheduleId 
        ? { ...schedule, status: 'completed' }
        : schedule
    ));
  };

  const openCancelModal = (schedule) => {
    setSelectedSchedule(schedule);
    setIsCancelModalOpen(true);
    setCancelReason('');
    // Focus textarea after modal opens
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  };

  const closeCancelModal = () => {
    setIsCancelModalOpen(false);
    setSelectedSchedule(null);
    setCancelReason('');
  };

  const handleCancelSchedule = () => {
    if (!cancelReason.trim()) {
      alert('Vui lòng nhập lý do hủy lịch');
      return;
    }

    setSchedules(schedules.map(schedule => 
      schedule.id === selectedSchedule.id 
        ? { ...schedule, status: 'cancelled', cancelReason: cancelReason.trim() }
        : schedule
    ));
    
    closeCancelModal();
  };

  const filteredSchedules = schedules.filter(schedule => {
    const today = new Date().toISOString().split('T')[0];
    if (filter === 'today') {
      return schedule.date === today;
    }
    if (filter === 'upcoming') {
      return schedule.date > today;
    }
    return true;
  });

  if (loading) {
    return <ScheduleTrackingSkeleton />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Lịch dạy của tôi</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`no-focus-outline px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setFilter('today')}
            className={`no-focus-outline px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'today'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Hôm nay
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`no-focus-outline px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'upcoming'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Sắp tới
          </button>
        </div>
      </div>

      {filteredSchedules.length === 0 ? (
        <div className="text-center py-12">
          <FaCalendarAlt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Không có lịch dạy</h3>
          <p className="text-gray-500">Bạn chưa có lịch dạy nào trong khoảng thời gian này.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSchedules.map((schedule) => (
            <div
              key={schedule.id}
              className={`border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow ${
                schedule.status === 'completed' 
                  ? 'bg-green-50 border-green-200' 
                  : schedule.status === 'cancelled'
                  ? 'bg-red-50 border-red-200'
                  : 'bg-white'
              }`}
            >
              <div className="grid grid-cols-12 gap-4 items-center">
                {/* Avatar */}
                <div className="col-span-1">
                  <img
                    src={schedule.studentAvatar}
                    alt={schedule.studentName}
                    className="w-14 h-14 rounded-full object-cover border-2 border-gray-200"
                  />
                </div>
                
                {/* Subject & Student Info */}
                <div className="col-span-3">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {schedule.subject}
                    </h3>
                    <div className="flex items-center text-gray-600">
                      <FaUser className="w-4 h-4 mr-2 text-blue-500" />
                      <span className="font-medium">{schedule.studentName}</span>
                    </div>
                  </div>
                </div>
                
                {/* Date & Time */}
                <div className="col-span-3">
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-600">
                      <FaCalendarAlt className="w-4 h-4 mr-2 text-purple-500" />
                      <span>{schedule.date}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FaClock className="w-4 h-4 mr-2 text-orange-500" />
                      <span>{schedule.time}</span>
                    </div>
                  </div>
                </div>
                
                {/* Learning Type */}
                <div className="col-span-2">
                  <div className="space-y-2">
                    {schedule.type === 'online' ? (
                      <div className="flex items-center text-gray-600">
                        <FaVideo className="w-4 h-4 mr-2 text-green-500" />
                        <span>Học trực tuyến</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-gray-600">
                        <FaMapMarkerAlt className="w-4 h-4 mr-2 text-red-500" />
                        <span className="truncate">{schedule.location}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Actions */}
                <div className="col-span-3 flex flex-col items-end justify-center space-y-2">
                  {schedule.status === 'cancelled' ? (
                    <div className="text-right">
                      <span className="px-4 py-2 text-sm bg-red-100 text-red-700 rounded-lg font-medium block mb-2">
                        ✗ Đã hủy
                      </span>
                      {schedule.cancelReason && (
                        <div className="text-xs text-gray-500 max-w-xs">
                          <strong>Lý do:</strong> {schedule.cancelReason}
                        </div>
                      )}
                    </div>
                  ) : schedule.status === 'completed' ? (
                    <span className="px-4 py-2 text-sm bg-green-100 text-green-700 rounded-lg font-medium">
                      ✓ Đã hoàn thành
                    </span>
                  ) : (
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleMarkCompleted(schedule.id)}
                        className="no-focus-outline px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                      >
                        Hoàn thành
                      </button>
                      <button 
                        onClick={() => openCancelModal(schedule)}
                        className="no-focus-outline px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                      >
                        Hủy lịch
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancel Modal */}
      <AnimatePresence>
        {isCancelModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCancelModal}
          >
            <motion.div 
              className="bg-white rounded-lg p-6 w-full max-w-md mx-auto"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Xác nhận hủy lịch</h3>
                <p className="text-gray-600">
                  Bạn có chắc chắn muốn hủy lịch học <strong>{selectedSchedule?.subject}</strong> với{' '}
                  <strong>{selectedSchedule?.studentName}</strong> vào {selectedSchedule?.date} lúc {selectedSchedule?.time}?
                </p>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lý do hủy lịch <span className="text-red-500">*</span>
                </label>
                <textarea
                  ref={textareaRef}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Vui lòng nhập lý do hủy lịch..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none text-black"
                  rows="3"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={closeCancelModal}
                  className="no-focus-outline flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleCancelSchedule}
                  className="no-focus-outline flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Xác nhận hủy
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ScheduleTracking; 