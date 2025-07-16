import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MyBookingTable from "../components/MyBookingTable";
import { getAllLearnerBookingTimeSlot, deleteLearnerBookingTimeSlot } from "../components/api/auth";
import ConfirmDialog from "../components/modals/ConfirmDialog";

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
    <MyBookingTable
      sentRequests={sentRequests}
      loadingRequests={loadingRequests}
      onMessageTutor={handleMessageTutor}
      onDeleteRequest={handleDeleteRequest}
      selectedBookingId={id} // pass the id to the table
    />
  );
}
