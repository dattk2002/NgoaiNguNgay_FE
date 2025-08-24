import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MyBookingTable from "../components/MyBookingTable";
import LessonManagement from "../components/LessonManagement";
import MyDisputes from "../components/MyDisputes";
import { getAllLearnerBookingOffer, deleteLearnerBookingTimeSlot, learnerBookingList, learnerCancelBookingByBookingId } from "../components/api/auth";
import ConfirmDialog from "../components/modals/ConfirmDialog";
import CreateDisputeModal from "../components/modals/CreateDisputeModal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Avatar, Typography, Skeleton, Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, TextField } from "@mui/material";

// Toast configuration
const toastConfig = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
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
  
  // Instant booking states
  const [instantBookings, setInstantBookings] = useState([]);
  const [loadingInstantBookings, setLoadingInstantBookings] = useState(false);
  const [instantBookingPage, setInstantBookingPage] = useState(1);
  const [instantBookingTotalPages, setInstantBookingTotalPages] = useState(0);
  const [instantBookingTotalItems, setInstantBookingTotalItems] = useState(0);
  
  // Cancel booking states
  const [cancelBookingModalOpen, setCancelBookingModalOpen] = useState(false);
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancellingBooking, setCancellingBooking] = useState(false);
  
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

  // Fetch instant bookings when tab changes to instant-bookings
  useEffect(() => {
    if (activeTab === "instant-bookings") {
      fetchInstantBookings();
    }
  }, [activeTab, instantBookingPage]);

  const fetchInstantBookings = async () => {
    setLoadingInstantBookings(true);
    try {
      const response = await learnerBookingList(instantBookingPage, 10);
      if (response && response.data) {
        setInstantBookings(response.data.items || []);
        setInstantBookingTotalPages(response.data.totalPages || 0);
        setInstantBookingTotalItems(response.data.totalItems || 0);
      }
    } catch (err) {
      console.error("Error fetching instant bookings:", err);
      setInstantBookings([]);
      toast.error("Không thể tải danh sách lịch đã book thẳng. Vui lòng thử lại!", toastConfig);
    } finally {
      setLoadingInstantBookings(false);
    }
  };

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
    toast.success("Khiếu nại đã được gửi thành công!");
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

  const handleInstantBookingPageChange = (newPage) => {
    setInstantBookingPage(newPage);
  };

  const handleCancelBooking = (booking) => {
    setSelectedBookingForCancel(booking);
    setCancelReason("");
    setCancelBookingModalOpen(true);
  };

  const handleConfirmCancelBooking = async () => {
    if (!selectedBookingForCancel || !cancelReason.trim()) {
      toast.error("Vui lòng nhập lý do hủy booking!", toastConfig);
      return;
    }

    setCancellingBooking(true);
    try {
      await learnerCancelBookingByBookingId(selectedBookingForCancel.id, cancelReason.trim());
      toast.success("Đã hủy booking thành công!", toastConfig);
      
      // Remove the cancelled booking from the list
      setInstantBookings(prev => prev.filter(booking => booking.id !== selectedBookingForCancel.id));
      
      // Update total items count
      setInstantBookingTotalItems(prev => prev - 1);
      
      setCancelBookingModalOpen(false);
      setSelectedBookingForCancel(null);
      setCancelReason("");
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast.error("Hủy booking thất bại. Vui lòng thử lại!", toastConfig);
    } finally {
      setCancellingBooking(false);
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
      id: "instant-bookings",
      name: "Lịch đã book thẳng",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: "disputes",
      name: "Khiếu nại của tôi",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
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
          <p className="mt-2 text-gray-600">Quản lý đề xuất từ gia sư, buổi học, lịch đã book thẳng và khiếu nại của bạn</p>
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

          {activeTab === "instant-bookings" && (
            <div className="p-6">
              <div className="overflow-x-auto rounded-lg shadow-md">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Ảnh gia sư
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Tên gia sư
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Tên bài học
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Tổng giá đặt lịch
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Số slot đã đặt lịch
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Ngày đặt lịch
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Ngày đặt lịch sớm nhất
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {loadingInstantBookings ? (
                      [...Array(5)].map((_, idx) => (
                        <tr key={idx}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Skeleton variant="circular" width={44} height={44} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Skeleton variant="text" width={120} height={28} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Skeleton variant="text" width={100} height={28} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Skeleton variant="text" width={80} height={28} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Skeleton variant="text" width={100} height={28} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Skeleton variant="text" width={160} height={28} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Skeleton variant="text" width={160} height={28} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Skeleton variant="rectangular" width={80} height={32} />
                          </td>
                        </tr>
                      ))
                    ) : instantBookings.length === 0 ? (
                      <tr>
                        <td colSpan={8} align="center" className="py-8">
                          <div className="flex flex-col items-center justify-center">
                            <svg
                              width="64"
                              height="64"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              className="text-gray-300 mb-2"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M12 4v16m8-8H4"
                              />
                            </svg>
                            <span className="text-gray-400 text-sm">
                              Không có lịch đã book thẳng nào.
                            </span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      instantBookings.map((booking, idx) => (
                        <tr
                          key={booking.id}
                          className={
                            (idx % 2 === 0
                              ? "bg-white hover:bg-blue-50 transition-colors duration-150"
                              : "bg-gray-50 hover:bg-blue-50 transition-colors duration-150")
                          }
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Avatar
                              src={booking.tutorAvatarUrl}
                              alt={booking.tutorName}
                              sx={{
                                width: 44,
                                height: 44,
                                border: "2px solid #e0e7ef",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                              }}
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Typography className="text-[#333333] font-medium">
                              {booking.tutorName}
                            </Typography>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Typography className="text-gray-700 text-sm">
                              {booking.lessonName}
                            </Typography>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Typography className="text-green-600 font-medium">
                              {booking.totalPrice?.toLocaleString()} VNĐ
                            </Typography>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Typography className="text-gray-700 text-sm">
                              {booking.slotCount} slots
                            </Typography>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Typography className="text-gray-700 text-sm">
                              {new Date(booking.createdTime).toLocaleDateString()}
                            </Typography>
                            <Typography className="text-gray-500 text-xs">
                              {new Date(booking.createdTime).toLocaleTimeString()}
                            </Typography>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Typography className="text-gray-700 text-sm">
                              {new Date(booking.earliestBookedDate).toLocaleDateString()}
                            </Typography>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleCancelBooking(booking)}
                              title="Hủy booking"
                              className="text-red-500 hover:text-red-700 focus:outline-none px-3 py-1 border border-red-500 hover:border-red-700 rounded-md text-sm font-medium transition-colors duration-200"
                            >
                              Hủy booking
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {instantBookingTotalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button 
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      onClick={() => handleInstantBookingPageChange(instantBookingPage - 1)}
                      disabled={instantBookingPage === 1}
                    >
                      Trước
                    </button>
                    <button 
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      onClick={() => handleInstantBookingPageChange(instantBookingPage + 1)}
                      disabled={instantBookingPage === instantBookingTotalPages}
                    >
                      Sau
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Hiển thị <span className="font-medium">{((instantBookingPage - 1) * 10) + 1}</span> đến{' '}
                        <span className="font-medium">{Math.min(instantBookingPage * 10, instantBookingTotalItems)}</span> trong tổng số{' '}
                        <span className="font-medium">{instantBookingTotalItems}</span> kết quả
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button 
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => handleInstantBookingPageChange(instantBookingPage - 1)}
                          disabled={instantBookingPage === 1}
                        >
                          <span className="sr-only">Trước</span>
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        
                        {/* Page numbers */}
                        {Array.from({ length: Math.min(5, instantBookingTotalPages) }, (_, i) => {
                          const pageNum = i + 1;
                          return (
                            <button
                              key={pageNum}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                pageNum === instantBookingPage
                                  ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                              onClick={() => handleInstantBookingPageChange(pageNum)}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                        
                        <button 
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => handleInstantBookingPageChange(instantBookingPage + 1)}
                          disabled={instantBookingPage === instantBookingTotalPages}
                        >
                          <span className="sr-only">Sau</span>
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "disputes" && (
            <div className="p-6">
              <MyDisputes />
            </div>
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

      {/* Cancel Booking Modal */}
      <Dialog open={cancelBookingModalOpen} onClose={() => setCancelBookingModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6" component="div" sx={{ color: "#dc2626", fontWeight: 600 }}>
            Xác nhận hủy booking
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedBookingForCancel && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Thông tin booking:
              </Typography>
              <Box sx={{ p: 2, backgroundColor: "#f8fafc", borderRadius: 1, border: "1px solid #e2e8f0" }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Gia sư:</strong> {selectedBookingForCancel.tutorName}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Bài học:</strong> {selectedBookingForCancel.lessonName}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Tổng giá:</strong> {selectedBookingForCancel.totalPrice?.toLocaleString()} VNĐ
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Số slot:</strong> {selectedBookingForCancel.slotCount} slots
                </Typography>
                <Typography variant="body2" sx={{ color: "#dc2626", fontWeight: 600 }}>
                  <strong>Ngày đặt lịch sớm nhất:</strong> {new Date(selectedBookingForCancel.earliestBookedDate).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>
          )}
          
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Lý do hủy booking: *
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Vui lòng nhập lý do hủy booking..."
            variant="outlined"
            sx={{ mb: 2 }}
          />
          
          <Box sx={{ p: 2, backgroundColor: "#fef2f2", borderRadius: 1, border: "1px solid #fecaca" }}>
            <Typography variant="body2" sx={{ color: "#dc2626", fontWeight: 500 }}>
              ⚠️ Lưu ý: Việc hủy booking sẽ không thể hoàn tác. Vui lòng cân nhắc kỹ trước khi thực hiện.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setCancelBookingModalOpen(false)} 
            disabled={cancellingBooking}
            variant="outlined"
          >
            Hủy
          </Button>
          <Button 
            onClick={handleConfirmCancelBooking} 
            variant="contained"
            disabled={cancellingBooking || !cancelReason.trim()}
            sx={{ 
              bgcolor: "#dc2626", 
              "&:hover": { bgcolor: "#b91c1c" },
              fontWeight: 600
            }}
          >
            {cancellingBooking ? "Đang xử lý..." : "Xác nhận hủy"}
          </Button>
        </DialogActions>
      </Dialog>

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
