import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MyBookingTable from "../components/MyBookingTable";
import LessonManagement from "../components/LessonManagement";
import MyDisputes from "../components/MyDisputes";
import { getAllLearnerBookingOffer, deleteLearnerBookingTimeSlot, fetchLearnerBookings, fetchBookingDetail } from "../components/api/auth";
import ConfirmDialog from "../components/modals/ConfirmDialog";
import CreateDisputeModal from "../components/modals/CreateDisputeModal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Avatar, Typography, Skeleton, Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, TextField } from "@mui/material";
import { convertBookingDetailToUTC7 } from "../utils/formatCentralTimestamp";
import { sortSlotsByProximityToCurrentDate } from "../utils/formatSlotTime";
import { formatSlotDateTimeUTC0 } from "../utils/formatSlotTime";

// Toast configuration
const toastConfig = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

// Booking History Component
const BookingHistory = () => {
  const [historyBookings, setHistoryBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize] = useState(10);
  const [expandedItems, setExpandedItems] = useState(new Set());

  const fetchHistoryBookings = async () => {
    setLoading(true);
    try {
      const response = await fetchLearnerBookings(currentPage, pageSize);
      if (response && Array.isArray(response.items)) {
        const bookingList = response.items;
        
        // Filter only cancelled and completed bookings
        const historyBookings = bookingList.filter(booking => 
          booking.status === 3 || booking.status === 4 // 3: Đã hủy, 4: Hoàn thành
        );
        
        // Process bookings to get additional details
        const processedBookings = await Promise.all(
          historyBookings.map(async (booking) => {
            try {
              const baseBooking = {
                ...booking,
                lessonSnapshot: { name: booking.lessonName },
                bookedSlots: []
              };
              
              try {
                const detail = await fetchBookingDetail(booking.id);
                const convertedDetail = convertBookingDetailToUTC7(detail);
                if (convertedDetail.bookedSlots && Array.isArray(convertedDetail.bookedSlots)) {
                  baseBooking.bookedSlots = sortSlotsByProximityToCurrentDate(convertedDetail.bookedSlots);
                }
                baseBooking.status = booking.status;
              } catch (detailError) {
                console.error(`Failed to fetch detail for booking ${booking.id}:`, detailError);
              }
              
              return baseBooking;
            } catch (error) {
              console.error(`Failed to process booking ${booking.id}:`, error);
              return null;
            }
          })
        );
        
        const validBookings = processedBookings.filter(booking => booking !== null);
        setHistoryBookings(validBookings);
        setTotalCount(response.totalCount || validBookings.length);
      } else {
        setHistoryBookings([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error("Lỗi khi tải lịch sử booking:", error);
      setHistoryBookings([]);
      toast.error("Không thể tải lịch sử booking. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistoryBookings();
  }, [currentPage]);

  const toggleExpanded = (groupId) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedItems(newExpanded);
  };

  const getBookingStatusBadge = (status) => {
    const statusMap = {
      3: { label: "Đã hủy", class: "bg-gray-50 text-gray-700 border border-gray-200" },
      4: { label: "Hoàn thành", class: "bg-green-50 text-green-700 border border-green-200" }
    };
    const statusInfo = statusMap[status] || { label: "Không xác định", class: "bg-gray-50 text-gray-700 border border-gray-200" };
    
    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusInfo.class}`}>
        {statusInfo.label}
      </span>
    );
  };

  const getSlotStatusBadge = (status) => {
    const statusMap = {
      0: { label: "Đang chờ", class: "bg-yellow-50 text-yellow-700 border border-yellow-200" },
      1: { label: "Hoàn thành, nếu có vấn đề báo cáo trong 24h", class: "bg-blue-50 text-blue-700 border border-blue-200" },
      2: { label: "Hoàn thành", class: "bg-green-50 text-green-700 border border-green-200" },
      3: { label: "Đã hủy", class: "bg-red-50 text-red-700 border border-red-200" },
      4: { label: "Đang báo cáo", class: "bg-orange-50 text-orange-700 border border-orange-200" }
    };
    const statusInfo = statusMap[status] || { label: "Không xác định", class: "bg-gray-50 text-gray-700 border border-gray-200" };
    
    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusInfo.class}`}>
        {statusInfo.label}
      </span>
    );
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const renderSkeleton = () => {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((item) => (
          <div key={item} className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <Skeleton variant="circular" width={48} height={48} />
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
                <Skeleton variant="rectangular" width={40} height={36} />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return renderSkeleton();
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold" style={{ color: '#666666' }}>
          Lịch sử booking ({historyBookings.length} khóa học)
        </h2>
        <button
          onClick={fetchHistoryBookings}
          className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-all duration-200"
          style={{ backgroundColor: '#666666' }}
        >
          <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Làm mới
        </button>
      </div>

      {historyBookings.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-lg font-medium mb-2" style={{ color: '#666666' }}>
            Chưa có lịch sử booking
          </h3>
          <p className="text-gray-500">
            Các booking đã hủy hoặc hoàn thành sẽ xuất hiện ở đây
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {historyBookings.map((booking) => (
              <div key={booking.id} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Booking Header */}
                <div className="p-4 hover:bg-gray-50 transition-colors duration-150">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      {/* Tutor Avatar */}
                      <div className="flex-shrink-0">
                        <img
                          className="h-12 w-12 rounded-full object-cover border-2 border-gray-200"
                          src={booking.tutorAvatarUrl || "https://via.placeholder.com/48"}
                          alt={booking.tutorName}
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/48";
                          }}
                        />
                      </div>
                      
                      {/* Course Info */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold" style={{ color: '#666666' }}>
                            {booking.lessonName || booking.lessonSnapshot?.name || 'Chưa có tên khóa học'}
                          </h3>
                          {getBookingStatusBadge(booking.status || 0)}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Gia sư: <span className="font-medium">{booking.tutorName}</span>
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span>
                            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {booking.slotCount || booking.bookedSlots?.length || 0} slot học
                          </span>
                          <span>
                            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                            {(booking.totalPrice || 0).toLocaleString('vi-VN')} VND
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Expand Button */}
                    <button
                      onClick={() => toggleExpanded(booking.id)}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors duration-200"
                      style={{ color: '#666666' }}
                    >
                      <svg 
                        className={`w-5 h-5 transition-transform duration-200 ${expandedItems.has(booking.id) ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedItems.has(booking.id) && (
                  <div className="border-t border-gray-200 bg-gray-50">
                    <div className="p-4">
                      <h4 className="text-sm font-medium mb-3" style={{ color: '#666666' }}>
                        Chi tiết slot học ({booking.slotCount || booking.bookedSlots?.length || 0} slot)
                      </h4>
                      <div className="space-y-2">
                        {(() => {
                          const sortedSlots = sortSlotsByProximityToCurrentDate(booking.bookedSlots || []);
                          
                          return sortedSlots.map((slot, globalIndex) => {
                            const sequentialNumber = globalIndex + 1;
                            
                            return (
                              <div key={`${booking.id}-${slot.id}`} className="bg-white p-3 rounded-lg border border-gray-200">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3 flex-1">
                                    {/* Sequential Number */}
                                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0">
                                      {sequentialNumber}
                                    </div>
                                    
                                    <div className="flex-1">
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <span className="font-medium text-lg" style={{ color: '#666666' }}>
                                            Slot {slot.slotIndex}
                                          </span>
                                          <div className="text-xs text-gray-500 mt-1">
                                            Ngày học: {formatSlotDateTimeUTC0(slot.slotIndex, slot.bookedDate)}
                                          </div>
                                          {slot.slotNote && (
                                            <div className="text-xs text-gray-600 mt-1">
                                              Ghi chú: {slot.slotNote}
                                            </div>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                          {getSlotStatusBadge(slot.status)}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          });
                        })()}
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
    </div>
  );
};

export default function MyBookingPage({ user }) {
  const { id } = useParams(); // get booking id from URL
  const [bookingOffers, setBookingOffers] = useState([]);
  const [loadingOffers, setLoadingOffers] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [pendingDeleteTutorId, setPendingDeleteTutorId] = useState(null);
  const [activeTab, setActiveTab] = useState("booking-requests");
  const [createDisputeModalOpen, setCreateDisputeModalOpen] = useState(false);
  const [selectedBookingForDispute, setSelectedBookingForDispute] = useState(null);
  

  

  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookingOffers = async () => {
      setLoadingOffers(true);
      try {
        const data = await getAllLearnerBookingOffer();
        setBookingOffers(data);
      } catch (err) {
        console.error("Error fetching booking offers:", err);
        setBookingOffers([]);
        toast.error("Không thể tải danh sách đề xuất. Vui lòng thử lại!", toastConfig);
      } finally {
        setLoadingOffers(false);
      }
    };
    fetchBookingOffers();
  }, []);



  const handleMessageTutor = tutorId => {
    navigate(`/message/${tutorId}`);
  };

  const handleDeleteRequest = async tutorId => {
    setPendingDeleteTutorId(tutorId);
    setConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteLearnerBookingTimeSlot(pendingDeleteTutorId);
      setBookingOffers(prev => prev.filter(offer => offer.tutor.id !== pendingDeleteTutorId));
      toast.success("Đã xóa yêu cầu thành công!", toastConfig);
    } catch (error) {
      toast.error("Xóa yêu cầu thất bại. Vui lòng thử lại!", toastConfig);
    } finally {
      setConfirmDeleteOpen(false);
      setPendingDeleteTutorId(null);
    }
  };

  const handleCreateDispute = (booking) => {
    setSelectedBookingForDispute(booking);
    setCreateDisputeModalOpen(true);
  };

  const handleDisputeSuccess = () => {
    // Refresh disputes list if needed
    toast.success("Báo cáo đã được gửi thành công!");
  };

  const handleRefreshRequests = async () => {
    setLoadingOffers(true);
    try {
      const data = await getAllLearnerBookingOffer();
      setBookingOffers(data);
    } catch (err) {
      console.error("Error refreshing booking offers:", err);
      toast.error("Không thể tải lại danh sách đề xuất. Vui lòng thử lại!", toastConfig);
    } finally {
      setLoadingOffers(false);
    }
  };







  // Transform offers data to match the expected format for MyBookingTable
  const transformedOffers = bookingOffers.map(offer => ({
    id: offer.id,
    tutorId: offer.tutor.id,
    tutorName: offer.tutor.fullName,
    tutorAvatarUrl: offer.tutor.profilePictureUrl,
    latestRequestTime: offer.createdAt,
    tutorBookingOfferId: offer.id, // Use offer ID as the booking offer ID
    lessonName: offer.lessonName,
    pricePerSlot: offer.pricePerSlot,
    totalPrice: offer.totalPrice,
    durationInMinutes: offer.durationInMinutes,
    expirationTime: offer.expirationTime,
    isExpired: offer.isExpired,
    isRejected: offer.isRejected,
    offeredSlots: offer.offeredSlots || []
  }));

  const tabs = [
    {
      id: "booking-requests",
      name: "Đề xuất từ gia sư",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: "lesson-management",
      name: "Theo dõi buổi học",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    {
      id: "disputes",
              name: "Báo cáo của tôi",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      )
    },
    {
      id: "booking-history",
      name: "Lịch sử booking",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <style dangerouslySetInnerHTML={{
        __html: `
          .booking-page * {
            outline: none !important;
          }
          
          .booking-page button:focus {
            outline: none !important;
            box-shadow: none !important;
          }
          
          .booking-page button:focus-visible {
            outline: none !important;
            box-shadow: none !important;
          }
        `
      }} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 booking-page">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Đặt lịch của tôi</h1>
          <p className="mt-2 text-gray-600">Quản lý đề xuất từ gia sư, buổi học và khiếu nại của bạn</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors duration-200`}
                >
                  {tab.icon}
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm">
          {activeTab === "booking-requests" && (
            <div className="p-6">
              <MyBookingTable
                sentRequests={transformedOffers}
                loadingRequests={loadingOffers}
                onMessageTutor={handleMessageTutor}
                onDeleteRequest={handleDeleteRequest}
                onCreateDispute={handleCreateDispute}
                selectedBookingId={id} // pass the id to the table
                onRefreshRequests={handleRefreshRequests} // <-- Add this prop
              />
            </div>
          )}

          {activeTab === "lesson-management" && (
            <LessonManagement />
          )}



          {activeTab === "disputes" && (
            <div className="p-6">
              <MyDisputes />
            </div>
          )}

          {activeTab === "booking-history" && (
            <BookingHistory />
          )}
        </div>
      </div>
      
      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa yêu cầu"
        message="Bạn có chắc chắn muốn xóa yêu cầu này không?"
      />

      {/* Create Dispute Modal */}
      <CreateDisputeModal
        isOpen={createDisputeModalOpen}
        onClose={() => setCreateDisputeModalOpen(false)}
        bookingData={selectedBookingForDispute}
        onSuccess={handleDisputeSuccess}
      />



      {/* Toast Container */}
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}
