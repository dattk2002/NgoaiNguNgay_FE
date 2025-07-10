import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MyBookingTable from "../components/MyBookingTable";
import { getAllLearnerBookingTimeSlot, deleteLearnerBookingTimeSlot, learnerBookingTimeSlotByTutorId } from "../components/api/auth";
import ConfirmDialog from "../components/modals/ConfirmDialog";

export default function MyBookingPage({ user }) {
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
        setSentRequests([]);
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
    } catch (error) {
      alert("Xóa yêu cầu thất bại. Vui lòng thử lại!");
    } finally {
      setConfirmDeleteOpen(false);
      setPendingDeleteTutorId(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <MyBookingTable
        sentRequests={sentRequests}
        loadingRequests={loadingRequests}
        onMessageTutor={handleMessageTutor}
        onDeleteRequest={handleDeleteRequest}
      />
      {confirmDeleteOpen && (
        <ConfirmDialog
          open={confirmDeleteOpen}
          onClose={() => setConfirmDeleteOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Xác nhận xóa yêu cầu"
          description="Bạn có chắc chắn muốn xóa yêu cầu này không?"
        />
      )}
    </div>
  );
}
