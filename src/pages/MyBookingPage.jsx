import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MyBookingTable from "../components/MyBookingTable";
import LessonManagement from "../components/LessonManagement";
import { getAllLearnerBookingTimeSlot, deleteLearnerBookingTimeSlot } from "../components/api/auth";
import ConfirmDialog from "../components/modals/ConfirmDialog";
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
  const [sentRequests, setSentRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [pendingDeleteTutorId, setPendingDeleteTutorId] = useState(null);
  const [activeTab, setActiveTab] = useState("booking-requests");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSentRequests = async () => {
      setLoadingRequests(true);
      try {
        const data = await getAllLearnerBookingTimeSlot();
        setSentRequests(data);
      } catch (err) {
        console.error("Error fetching booking requests:", err);
        setSentRequests([]);
        toast.error("Không thể tải danh sách yêu cầu. Vui lòng thử lại!", toastConfig);
      } finally {
        setLoadingRequests(false);
      }
    };
    fetchSentRequests();
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
      setSentRequests(prev => prev.filter(req => req.tutorId !== pendingDeleteTutorId));
      toast.success("Đã xóa yêu cầu thành công!", toastConfig);
    } catch (error) {
      toast.error("Xóa yêu cầu thất bại. Vui lòng thử lại!", toastConfig);
    } finally {
      setConfirmDeleteOpen(false);
      setPendingDeleteTutorId(null);
    }
  };

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
      name: "Quản lí buổi học",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
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
          <p className="mt-2 text-gray-600">Quản lý yêu cầu đặt lịch và buổi học của bạn</p>
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
                sentRequests={sentRequests}
                loadingRequests={loadingRequests}
                onMessageTutor={handleMessageTutor}
                onDeleteRequest={handleDeleteRequest}
                selectedBookingId={id} // pass the id to the table
              />
            </div>
          )}

          {activeTab === "lesson-management" && (
            <LessonManagement />
          )}
        </div>
      </div>
      
      <ConfirmDialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa yêu cầu"
        message="Bạn có chắc chắn muốn xóa yêu cầu này không?"
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
