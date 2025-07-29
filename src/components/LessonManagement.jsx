import React, { useState, useEffect } from "react";
import { fetchLearnerBookings, fetchBookingDetail } from "./api/auth";
import { formatCentralTimestamp } from "../utils/formatCentralTimestamp";
import { Skeleton } from "@mui/material";

const LessonManagement = () => {
  const [lessons, setLessons] = useState([]);
  const [groupedLessons, setGroupedLessons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize] = useState(10);
  const [expandedGroups, setExpandedGroups] = useState(new Set());
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [selectedLessonInfo, setSelectedLessonInfo] = useState(null);
  const [loadingLessonInfo, setLoadingLessonInfo] = useState(false);

  useEffect(() => {
    fetchLessons();
  }, [currentPage]);

  const fetchLessons = async () => {
    setLoading(true);
    try {
      const response = await fetchLearnerBookings(currentPage, pageSize);
      if (response && Array.isArray(response.items)) {
        const bookingList = response.items;
        console.log("API Response booking list:", bookingList);
        
        // Fetch detailed booking info for each booking
        const detailedBookings = await Promise.all(
          bookingList.map(async (booking) => {
            try {
              const detail = await fetchBookingDetail(booking.id);
              return detail;
            } catch (error) {
              console.error(`Failed to fetch detail for booking ${booking.id}:`, error);
              return null;
            }
          })
        );
        
        // Filter out failed requests
        const validBookings = detailedBookings.filter(booking => booking !== null);
        console.log("Detailed bookings:", validBookings);
        
        setLessons(validBookings);
        setTotalCount(response.totalCount || validBookings.length);
        
        // Group lessons by lessonName + tutorName
        const grouped = groupLessons(validBookings);
        console.log("Grouped lessons:", grouped);
        setGroupedLessons(grouped);
      } else {
        setLessons([]);
        setGroupedLessons([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách buổi học:", error);
      setLessons([]);
      setGroupedLessons([]);
    } finally {
      setLoading(false);
    }
  };

  const groupLessons = (bookings) => {
    const groups = {};
    
    bookings.forEach(booking => {
      const lessonName = booking.lessonSnapshot?.name || 'Chưa có tên khóa học';
      const tutorName = booking.tutorName || 'Chưa có tên';
      const key = `${lessonName}_${tutorName}`;
      
      if (!groups[key]) {
        groups[key] = {
          id: key,
          lessonName: lessonName,
          tutorName: tutorName,
          tutorAvatarUrl: booking.tutorAvatarUrl,
          tutorId: booking.tutorId,
          bookings: [],
          // Use data from booking detail API
          slotCount: booking.bookedSlots?.length || 0,
          totalPrice: booking.totalPrice || 0,
          lessonSnapshot: booking.lessonSnapshot,
          latestStatus: booking.bookedSlots?.[0]?.status || 0,
          latestCreatedTime: booking.createdTime
        };
      } else {
        // For groups with multiple bookings, combine the data
        groups[key].slotCount += (booking.bookedSlots?.length || 0);
        groups[key].totalPrice += (booking.totalPrice || 0);
      }
      
      groups[key].bookings.push(booking);
      
      // Use the latest status and time
      if (booking.createdTime && booking.createdTime > groups[key].latestCreatedTime) {
        if (booking.bookedSlots?.[0]) {
          groups[key].latestStatus = booking.bookedSlots[0].status;
        }
        groups[key].latestCreatedTime = booking.createdTime;
      }
    });
    
    return Object.values(groups);
  };

  const toggleExpanded = (groupId) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const getStatusBadge = (status) => {
    // Based on backend SlotStatus enum:
    // Pending = 0, AwaitingConfirmation = 1, Completed = 2, Cancelled = 3
    const statusMap = {
      0: { label: "Đang chờ", class: "bg-yellow-50 text-yellow-700 border border-yellow-200" },
      1: { label: "Chờ xác nhận", class: "bg-blue-50 text-blue-700 border border-blue-200" },
      2: { label: "Hoàn thành", class: "bg-green-50 text-green-700 border border-green-200" },
      3: { label: "Đã hủy", class: "bg-red-50 text-red-700 border border-red-200" }
    };
    const statusInfo = statusMap[status] || { label: "Không xác định", class: "bg-gray-50 text-gray-700 border border-gray-200" };
    
    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusInfo.class}`}>
        {statusInfo.label}
      </span>
    );
  };

  const handleViewCourseInfo = async (group) => {
    try {
      setLoadingLessonInfo(true);
      setShowLessonModal(true);
      
      // Use lesson data from lessonSnapshot (already available from booking detail)
      if (group.lessonSnapshot) {
        console.log("Using lesson data from lessonSnapshot:", group.lessonSnapshot);
        
        setSelectedLessonInfo({
          group,
          lessonData: group.lessonSnapshot,
          error: null
        });
      } else {
        console.log("No lessonSnapshot found in group");
        setSelectedLessonInfo({
          group,
          lessonData: null,
          error: `Không tìm thấy thông tin khóa học "${group.lessonName}"`
        });
      }
    } catch (error) {
      console.error("Error handling course info:", error);
      setSelectedLessonInfo({
        group,
        lessonData: null,
        error: `Không thể hiển thị thông tin khóa học "${group.lessonName}". Lỗi: ${error.message}`
      });
    } finally {
      setLoadingLessonInfo(false);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const renderLessonSkeleton = () => {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <Skeleton variant="text" width={300} height={40} />
          <Skeleton variant="rectangular" width={120} height={40} />
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    {/* Avatar Skeleton */}
                    <Skeleton variant="circular" width={48} height={48} />
                    
                    {/* Content Skeleton */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Skeleton variant="text" width={200} height={28} />
                        <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: '12px' }} />
                      </div>
                      <Skeleton variant="text" width={150} height={20} />
                      <div className="flex items-center space-x-4 mt-2">
                        <Skeleton variant="text" width={100} height={16} />
                        <Skeleton variant="text" width={120} height={16} />
                      </div>
                    </div>
                  </div>
                  
                  {/* Action buttons skeleton */}
                  <div className="flex items-center space-x-2">
                    <Skeleton variant="rectangular" width={120} height={36} />
                    <Skeleton variant="rectangular" width={40} height={36} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return renderLessonSkeleton();
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold" style={{ color: '#666666' }}>
          Quản lí slot học ({groupedLessons.length} khóa học)
        </h2>
        <button
          onClick={fetchLessons}
          className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-all duration-200"
          style={{ backgroundColor: '#666666' }}
        >
          <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Làm mới
        </button>
      </div>

      {groupedLessons.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-lg font-medium mb-2" style={{ color: '#666666' }}>
            Chưa có khóa học nào
          </h3>
          <p className="text-gray-500">
            Các slot học đã đặt sẽ xuất hiện ở đây
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {groupedLessons.map((group) => (
              <div key={group.id} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Group Header */}
                <div className="p-4 hover:bg-gray-50 transition-colors duration-150">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      {/* Tutor Avatar */}
                      <div className="flex-shrink-0">
                        <img
                          className="h-12 w-12 rounded-full object-cover border-2 border-gray-200"
                          src={group.tutorAvatarUrl || "https://via.placeholder.com/48"}
                          alt={group.tutorName}
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/48";
                          }}
                        />
                      </div>
                      
                      {/* Course Info */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold" style={{ color: '#666666' }}>
                            {group.lessonName}
                          </h3>
                          {getStatusBadge(group.latestStatus)}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Gia sư: <span className="font-medium">{group.tutorName}</span>
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span>
                            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {group.slotCount} slot học
                          </span>
                          <span>
                            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                            {group.totalPrice.toLocaleString('vi-VN')} VND
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewCourseInfo(group)}
                        className="px-3 py-2 text-sm rounded-lg border text-white hover:opacity-90 transition-all duration-200"
                        style={{ backgroundColor: '#666666', borderColor: '#666666' }}
                      >
                        <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Thông tin khóa học
                      </button>
                      <button
                        onClick={() => toggleExpanded(group.id)}
                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors duration-200"
                        style={{ color: '#666666' }}
                      >
                        <svg 
                          className={`w-5 h-5 transition-transform duration-200 ${expandedGroups.has(group.id) ? 'rotate-180' : ''}`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedGroups.has(group.id) && (
                  <div className="border-t border-gray-200 bg-gray-50">
                    <div className="p-4">
                      <h4 className="text-sm font-medium mb-3" style={{ color: '#666666' }}>
                        Chi tiết slot học ({group.slotCount} slot)
                      </h4>
                      <div className="space-y-2">
                        {group.bookings.flatMap((booking, bookingIndex) => 
                          booking.bookedSlots?.map((slot, slotIndex) => (
                            <div key={`${booking.id}-${slot.id}`} className="bg-white p-3 rounded-lg border border-gray-200">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <span className="font-medium text-lg" style={{ color: '#666666' }}>
                                        Slot {slot.slotIndex}
                                      </span>
                                      <div className="text-xs text-gray-500 mt-1">
                                        Ngày học: {slot.bookedDate ? formatCentralTimestamp(slot.bookedDate) : 'N/A'}
                                      </div>
                                      {slot.slotNote && (
                                        <div className="text-xs text-gray-600 mt-1">
                                          Ghi chú: {slot.slotNote}
                                        </div>
                                      )}
                                    </div>
                                    <div className="text-right">
                                      {getStatusBadge(slot.status)}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )) || []
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-6">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ borderColor: '#666666', color: '#666666' }}
                >
                  Trước
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative ml-3 inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ borderColor: '#666666', color: '#666666' }}
                >
                  Sau
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm" style={{ color: '#666666' }}>
                    Hiển thị{" "}
                    <span className="font-medium">
                      {(currentPage - 1) * pageSize + 1}
                    </span>{" "}
                    đến{" "}
                    <span className="font-medium">
                      {Math.min(currentPage * pageSize, totalCount)}
                    </span>{" "}
                    trong số{" "}
                    <span className="font-medium">{totalCount}</span> kết quả
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center rounded-l-md px-2 py-2 ring-1 ring-inset hover:bg-gray-50 focus:z-20 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ color: '#666666', borderColor: '#666666' }}
                    >
                      <span className="sr-only">Trang trước</span>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    {[...Array(totalPages)].map((_, index) => {
                      const page = index + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                            currentPage === page
                              ? "z-10 text-white focus:z-20"
                              : "ring-1 ring-inset hover:bg-gray-50 focus:z-20"
                          }`}
                          style={currentPage === page 
                            ? { backgroundColor: '#666666', borderColor: '#666666' }
                            : { color: '#666666', borderColor: '#666666' }
                          }
                        >
                          {page}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center rounded-r-md px-2 py-2 ring-1 ring-inset hover:bg-gray-50 focus:z-20 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ color: '#666666', borderColor: '#666666' }}
                    >
                      <span className="sr-only">Trang sau</span>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      
      {/* Lesson Info Modal */}
      {showLessonModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowLessonModal(false)}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold" style={{ color: '#666666' }}>
                📚 Thông tin khóa học
              </h3>
              <button
                onClick={() => setShowLessonModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                style={{ color: '#666666' }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {loadingLessonInfo ? (
                <div className="space-y-6">
                  {/* Course Header Skeleton */}
                  <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <Skeleton variant="circular" width={64} height={64} />
                    <div className="flex-1">
                      <Skeleton variant="text" width={250} height={32} sx={{ mb: 1 }} />
                      <Skeleton variant="text" width={180} height={20} />
                    </div>
                  </div>

                  {/* Course Details Grid Skeleton */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4, 5].map((item) => (
                      <div key={item} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center mb-2">
                          <Skeleton variant="text" width={24} height={24} sx={{ mr: 1 }} />
                          <Skeleton variant="text" width={120} height={24} />
                        </div>
                        <Skeleton variant="text" width="80%" height={28} />
                      </div>
                    ))}
                  </div>

                  {/* Description Skeleton */}
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center mb-3">
                      <Skeleton variant="text" width={24} height={24} sx={{ mr: 1 }} />
                      <Skeleton variant="text" width={150} height={24} />
                    </div>
                    <Skeleton variant="text" width="100%" height={20} sx={{ mb: 1 }} />
                    <Skeleton variant="text" width="90%" height={20} sx={{ mb: 1 }} />
                    <Skeleton variant="text" width="75%" height={20} />
                  </div>

                  {/* Prerequisites Skeleton */}
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center mb-3">
                      <Skeleton variant="text" width={24} height={24} sx={{ mr: 1 }} />
                      <Skeleton variant="text" width={180} height={24} />
                    </div>
                    <Skeleton variant="text" width="60%" height={20} />
                  </div>

                  {/* Booking Summary Skeleton */}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <Skeleton variant="text" width={200} height={24} sx={{ mb: 2 }} />
                    <div className="grid grid-cols-2 gap-4">
                      <Skeleton variant="text" width="100%" height={20} />
                      <Skeleton variant="text" width="100%" height={20} />
                      <div className="col-span-2">
                        <Skeleton variant="text" width="50%" height={20} />
                      </div>
                    </div>
                  </div>
                </div>
              ) : selectedLessonInfo?.error ? (
                <div className="text-center py-12">
                  <div className="text-red-500 text-6xl mb-4">⚠️</div>
                  <h4 className="text-lg font-medium text-red-600 mb-2">Không thể tải thông tin</h4>
                  <p className="text-gray-600">{selectedLessonInfo.error}</p>
                </div>
              ) : selectedLessonInfo?.lessonData ? (
                <div className="space-y-6">
                  {/* Course Header */}
                  <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <img
                        className="h-16 w-16 rounded-full object-cover border-2 border-gray-200"
                        src={selectedLessonInfo.group.tutorAvatarUrl || "https://via.placeholder.com/64"}
                        alt={selectedLessonInfo.group.tutorName}
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/64";
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-2xl font-bold mb-2" style={{ color: '#666666' }}>
                        {selectedLessonInfo.lessonData.name || selectedLessonInfo.group.lessonName}
                      </h4>
                      <p className="text-gray-600 flex items-center">
                        <span className="font-medium">Gia sư:</span>
                        <span className="ml-2">{selectedLessonInfo.group.tutorName}</span>
                      </p>
                    </div>
                  </div>

                  {/* Course Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Price per slot */}
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center mb-2">
                        <span className="text-2xl mr-2">💰</span>
                        <h5 className="font-semibold" style={{ color: '#666666' }}>Giá mỗi slot</h5>
                      </div>
                      <p className="text-lg font-bold text-green-600">
                        {selectedLessonInfo.lessonData.price 
                          ? `${Number(selectedLessonInfo.lessonData.price).toLocaleString('vi-VN')} VND/slot`
                          : 'Chưa cập nhật giá'
                        }
                      </p>
                    </div>

                    {/* Duration per slot */}
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center mb-2">
                        <span className="text-2xl mr-2">⏱️</span>
                        <h5 className="font-semibold" style={{ color: '#666666' }}>Thời lượng mỗi slot</h5>
                      </div>
                      <p className="text-lg text-black">
                        {selectedLessonInfo.lessonData.durationInMinutes 
                          ? `${selectedLessonInfo.lessonData.durationInMinutes} phút/slot`
                          : 'Chưa cập nhật thời lượng'
                        }
                      </p>
                    </div>

                    {/* Total Duration */}
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center mb-2">
                        <span className="text-2xl mr-2">⏰</span>
                        <h5 className="font-semibold" style={{ color: '#666666' }}>Tổng thời lượng</h5>
                      </div>
                      <p className="text-lg font-bold text-blue-600">
                        {selectedLessonInfo.lessonData.durationInMinutes && selectedLessonInfo.group.slotCount
                          ? `${selectedLessonInfo.group.slotCount * selectedLessonInfo.lessonData.durationInMinutes} phút`
                          : 'Chưa tính được'
                        }
                      </p>
                    </div>

                    {/* Category */}
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center mb-2">
                        <span className="text-2xl mr-2">📊</span>
                        <h5 className="font-semibold" style={{ color: '#666666' }}>Danh mục</h5>
                      </div>
                      <p className="text-lg text-black">
                        {selectedLessonInfo.lessonData.category || 'Chưa phân loại'}
                      </p>
                    </div>

                    {/* Target Audience */}
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center mb-2">
                        <span className="text-2xl mr-2">🎯</span>
                        <h5 className="font-semibold" style={{ color: '#666666' }}>Đối tượng</h5>
                      </div>
                      <p className="text-lg text-black">
                        {selectedLessonInfo.lessonData.targetAudience || 'Tất cả học viên'}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center mb-3">
                      <span className="text-2xl mr-2">📝</span>
                      <h5 className="font-semibold" style={{ color: '#666666' }}>Mô tả khóa học</h5>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      {selectedLessonInfo.lessonData.description || 'Chưa có mô tả chi tiết cho khóa học này.'}
                    </p>
                  </div>

                  {/* Prerequisites */}
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center mb-3">
                      <span className="text-2xl mr-2">📋</span>
                      <h5 className="font-semibold" style={{ color: '#666666' }}>Yêu cầu tiên quyết</h5>
                    </div>
                    <p className="text-gray-700">
                      {selectedLessonInfo.lessonData.prerequisites || 'Không có yêu cầu đặc biệt'}
                    </p>
                  </div>

                                    {/* Booking Summary */}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h5 className="font-semibold text-blue-800 mb-3">📈 Thông tin đặt lịch</h5>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-blue-600 font-medium">Tổng slot học:</span>
                        <span className="ml-2" style={{ color: '#666666' }}>{selectedLessonInfo.group.slotCount} slot</span>
                      </div>
                      <div>
                        <span className="text-blue-600 font-medium">Tổng tiền:</span>
                        <span className="ml-2 font-bold" style={{ color: '#666666' }}>{selectedLessonInfo.group.totalPrice.toLocaleString('vi-VN')} VND</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-blue-600 font-medium">Trạng thái:</span>
                        <span className="ml-2">{getStatusBadge(selectedLessonInfo.group.latestStatus)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end p-6 border-t border-gray-200">
              <button
                onClick={() => setShowLessonModal(false)}
                className="px-6 py-2 text-white rounded-lg hover:opacity-90 transition-all duration-200"
                style={{ backgroundColor: '#666666' }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
      

    </div>
  );
};

export default LessonManagement; 