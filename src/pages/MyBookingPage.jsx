import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MyBookingTable from "../components/MyBookingTable";
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

  return (
    <>
      <MyBookingTable
        sentRequests={sentRequests}
        loadingRequests={loadingRequests}
        onMessageTutor={handleMessageTutor}
        onDeleteRequest={handleDeleteRequest}
        selectedBookingId={id} // pass the id to the table
      />
      
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
    </>
  );
}
