import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MyBookingTable from "../components/MyBookingTable";
import LessonManagement from "../components/LessonManagement";
import MyDisputes from "../components/MyDisputes";
import { getAllLearnerBookingOffer, deleteLearnerBookingTimeSlot } from "../components/api/auth";
import ConfirmDialog from "../components/modals/ConfirmDialog";
import CreateDisputeModal from "../components/modals/CreateDisputeModal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
    toast.success("Khiếu nại đã được gửi thành công!");
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
      name: "Yêu cầu đặt lịch",
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
          <p className="mt-2 text-gray-600">Quản lý yêu cầu đặt lịch, buổi học và khiếu nại của bạn</p>
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
