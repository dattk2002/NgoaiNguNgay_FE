import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Paper,
  Chip,
  Button,
  Grid,
  Avatar,
  Divider,
  Tabs,
  Tab,
  GlobalStyles,
} from "@mui/material";
import { FiCheck } from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { styled } from "@mui/material/styles";

// Import API functions
import {
  getAccessToken,
  fetchTutorLesson,
  createLesson,
  updateLesson,
  deleteLesson,
  fetchTutorWeeklyPattern,
  editTutorWeeklyPattern,
  deleteTutorWeeklyPattern,
  tutorBookingTimeSlotFromLearner,
  tutorBookingTimeSlotFromLearnerDetail,
  createTutorBookingOffer,
  tutorBookingOfferDetail,
  getAllTutorBookingOffer,
  updateTutorBookingOfferByOfferId,
  fetchDocumentsByTutorId,
  deleteDocument,
} from "../../api/auth";

import { formatLanguageCode } from "../../../utils/formatLanguageCode";
import formatPriceWithCommas from "../../../utils/formatPriceWithCommas";
import ConfirmDialog from "../../modals/ConfirmDialog";

// Import local components
import {
  GeneralInfoTab,
  SkillsLanguagesTab,
  LessonsTab,
  BookingDetailDialog,
  LessonDialog,
  LessonSelectionDialog,
  EditPatternDialog,
  TutorProfileSkeleton,
  // Utils and constants
  getNextMondayDateUTC,
  buildAvailabilityData,
  getPatternForWeek,
  getSlotDateTime,
  buildEditPatternSlotsFromPattern,
  getProficiencyLabel,
  getLanguageName,
  handleFileChange,
  getWeekDates,
  saveTemporarySlots,
  loadTemporarySlots,
  clearTemporarySlots,
  defaultLessonForm,
  timeRanges,
} from "./index";

// Styled components
const ProfileCard = styled(Paper)(({ theme }) => ({
  textAlign: "center",
  position: "relative",
  padding: theme.spacing(4),
  borderRadius: "16px",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: "8px",
  textTransform: "none",
  fontWeight: 500,
  padding: "8px 16px",
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  "&:hover": {
    backgroundColor: theme.palette.primary.dark,
  },
}));

const TutorProfile = ({
  user,
  onRequireLogin,
  fetchTutorDetail,
  requestTutorVerification,
  uploadCertificate,
}) => {
  const { id } = useParams();
  
  // Main state
  const [tutorData, setTutorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  const [isOwner, setIsOwner] = useState(false);

  // Lessons state
  const [lessons, setLessons] = useState([]);
  const [lessonsLoading, setLessonsLoading] = useState(false);
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [lessonForm, setLessonForm] = useState(defaultLessonForm);
  const [editLesson, setEditLesson] = useState(null);
  const [showValidation, setShowValidation] = useState(false);
  const [lessonLoading, setLessonLoading] = useState(false);

  // Available lessons for offers
  const [availableLessons, setAvailableLessons] = useState([]);

  // Delete lesson modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState(null);

  // Documents state
  const [documents, setDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentsError, setDocumentsError] = useState(null);
  const [certificateToDelete, setCertificateToDelete] = useState(null);
  const [deleteCertificateModalOpen, setDeleteCertificateModalOpen] = useState(false);

  // Weekly patterns state
  const [weeklyPatterns, setWeeklyPatterns] = useState([]);
  const [currentWeekStart, setCurrentWeekStart] = useState(getNextMondayDateUTC());
  const [currentPattern, setCurrentPattern] = useState(null);
  const [availabilityData, setAvailabilityData] = useState([]);
  const [weeklyPatternLoading, setWeeklyPatternLoading] = useState(false);

  // Edit pattern dialog state
  const [editPatternDialogOpen, setEditPatternDialogOpen] = useState(false);
  const [editPatternSlots, setEditPatternSlots] = useState({});
  const [editPatternData, setEditPatternData] = useState({
    appliedFrom: "",
    slots: [],
  });

  // Delete pattern modal
  const [deletePatternModalOpen, setDeletePatternModalOpen] = useState(false);
  const [patternToDelete, setPatternToDelete] = useState(null);

  // Learner requests state
  const [learnerRequests, setLearnerRequests] = useState([]);
  const [learnerRequestsLoading, setLearnerRequestsLoading] = useState(false);
  const [learnerRequestsError, setLearnerRequestsError] = useState(null);

  // Booking detail dialog state
  const [bookingDetailDialogOpen, setBookingDetailDialogOpen] = useState(false);
  const [selectedLearner, setSelectedLearner] = useState(null);
  const [selectedOfferSlots, setSelectedOfferSlots] = useState([]);
  const [dialogWeekStart, setDialogWeekStart] = useState(getNextMondayDateUTC());
  const [bookingDetailLoading, setBookingDetailLoading] = useState(false);
  const [temporarilySelectedSlots, setTemporarilySelectedSlots] = useState([]);

  // Lesson selection dialog state
  const [lessonSelectionDialogOpen, setLessonSelectionDialogOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);

  // Utility functions for week navigation
  const handlePrevWeek = () => {
    const prevWeek = new Date(currentWeekStart);
    prevWeek.setDate(currentWeekStart.getDate() - 7);
    setCurrentWeekStart(prevWeek);
  };

  const handleNextWeek = () => {
    const nextWeek = new Date(currentWeekStart);
    nextWeek.setDate(currentWeekStart.getDate() + 7);
    setCurrentWeekStart(nextWeek);
  };

  const handleDialogPrevWeek = () => {
    const prevWeek = new Date(dialogWeekStart);
    prevWeek.setDate(dialogWeekStart.getDate() - 7);
    setDialogWeekStart(prevWeek);

    // Load temporary slots for the new week
    if (selectedLearner) {
      const tempSlots = loadTemporarySlots(prevWeek, selectedLearner.learnerId);
      setTemporarilySelectedSlots(tempSlots);
    }
  };

  const handleDialogNextWeek = () => {
    const nextWeek = new Date(dialogWeekStart);
    nextWeek.setDate(dialogWeekStart.getDate() + 7);
    setDialogWeekStart(nextWeek);

    // Load temporary slots for the new week
    if (selectedLearner) {
      const tempSlots = loadTemporarySlots(nextWeek, selectedLearner.learnerId);
      setTemporarilySelectedSlots(tempSlots);
    }
  };

  const handleEditPrevWeek = () => {
    const prevWeek = new Date(currentWeekStart);
    prevWeek.setDate(currentWeekStart.getDate() - 7);
    setCurrentWeekStart(prevWeek);
  };

  const handleEditNextWeek = () => {
    const nextWeek = new Date(currentWeekStart);
    nextWeek.setDate(currentWeekStart.getDate() + 7);
    setCurrentWeekStart(nextWeek);
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  // Document handling functions
  const fetchDocuments = async () => {
    setDocumentsLoading(true);
    setDocumentsError(null);
    try {
      const docs = await fetchDocumentsByTutorId(id);
      setDocuments(docs || []);
    } catch (err) {
      console.error("Failed to fetch documents:", err);
      setDocumentsError("Không thể tải danh sách chứng chỉ");
    } finally {
      setDocumentsLoading(false);
    }
  };

  const handleCertificateUpload = async (files) => {
    try {
      const validFiles = handleFileChange({ target: { files } });
      const uploadResults = await uploadCertificate(validFiles);
      
      if (uploadResults?.length > 0) {
        toast.success(`Đã upload thành công ${uploadResults.length} chứng chỉ!`);
        await fetchDocuments(); // Refresh the documents list
      }
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error("Upload thất bại: " + err.message);
    }
  };

  const handleRequestVerification = async () => {
    try {
      await requestTutorVerification();
      toast.success("Đã gửi yêu cầu xác minh thành công!");
      
      // Refresh tutor data to get updated verification status
      const freshData = await fetchTutorDetail(id);
      if (freshData) {
        setTutorData(freshData);
      }
    } catch (err) {
      console.error("Request verification failed:", err);
      toast.error("Gửi yêu cầu thất bại: " + err.message);
    }
  };

  const handleRemoveCertificate = (certificate) => {
    setCertificateToDelete(certificate);
    setDeleteCertificateModalOpen(true);
  };

  const confirmDeleteCertificate = async () => {
    try {
      await deleteDocument(certificateToDelete.id);
      toast.success("Đã xóa chứng chỉ thành công!");
      await fetchDocuments(); // Refresh the documents list
      setDeleteCertificateModalOpen(false);
      setCertificateToDelete(null);
    } catch (err) {
      console.error("Delete certificate failed:", err);
      toast.error("Xóa chứng chỉ thất bại: " + err.message);
    }
  };

  // Main data fetching useEffect
  useEffect(() => {
    const fetchTutorData = async () => {
      setLoading(true);
      try {
        // Fetch tutor profile data
        const data = await fetchTutorDetail(id);
        if (data) {
          setTutorData(data);
          setIsOwner(user?.id === data.id);
          
          // Fetch lessons for this tutor
          try {
            const lessonData = await fetchTutorLesson(id);
            console.log("Fetched lessons:", lessonData);
            if (lessonData && Array.isArray(lessonData)) {
              setLessons(lessonData);
            } else {
              setLessons([]);
            }
          } catch (lessonError) {
            console.error("Failed to fetch lessons:", lessonError);
            setLessons([]);
          }
          
        } else {
          throw new Error("Invalid data format received from server");
        }
      } catch (err) {
        console.error("Failed to fetch tutor data:", err);
        toast.error("Không thể tải thông tin gia sư");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTutorData();
      if (user?.id === parseInt(id)) {
        fetchDocuments();
      }
    }
  }, [id, user?.id, fetchTutorDetail]);

  // Weekly patterns useEffect
  useEffect(() => {
    const fetchAndSetWeeklyPatterns = async () => {
      setWeeklyPatternLoading(true);
      try {
        const patterns = await fetchTutorWeeklyPattern(id);
        setWeeklyPatterns(patterns);
      } catch (err) {
        console.error("Failed to fetch weekly patterns:", err);
      } finally {
        setWeeklyPatternLoading(false);
      }
    };
    fetchAndSetWeeklyPatterns();
  }, [id, currentWeekStart]);

  // Availability data useEffect
  useEffect(() => {
    if (!currentWeekStart || !weeklyPatterns) return;
    const pattern = getPatternForWeek(weeklyPatterns, currentWeekStart);
    setCurrentPattern(pattern);
    setAvailabilityData(buildAvailabilityData(pattern, timeRanges));
  }, [currentWeekStart, weeklyPatterns]);

  // Edit pattern dialog sync useEffect
  useEffect(() => {
    if (!editPatternDialogOpen || !currentWeekStart || !weeklyPatterns) return;
    const pattern = getPatternForWeek(weeklyPatterns, currentWeekStart);
    setEditPatternSlots(buildEditPatternSlotsFromPattern(pattern));
  }, [editPatternDialogOpen, currentWeekStart, weeklyPatterns]);

  // Learner requests useEffect
  useEffect(() => {
    const fetchLearnerRequests = async () => {
      setLearnerRequestsLoading(true);
      setLearnerRequestsError(null);
      try {
        const res = await tutorBookingTimeSlotFromLearner();
        setLearnerRequests(res?.data || []);
      } catch (err) {
        setLearnerRequestsError(
          err.message || "Lỗi khi tải yêu cầu từ học viên"
        );
      } finally {
        setLearnerRequestsLoading(false);
      }
    };
    fetchLearnerRequests();
  }, [id]);

  // Offers useEffect
  useEffect(() => {
    async function fetchOffers() {
      try {
        const offers = await getAllTutorBookingOffer();
        console.log("Fetched offers:", offers);
      } catch (err) {
        console.error("Failed to fetch offers:", err);
      }
    }
    fetchOffers();
  }, []);

  // Helper function to get nearest offer for learner
  function getNearestOfferIdForLearner(learnerId) {
    // This would need implementation based on your offers data structure
    return null;
  }

  // Booking detail handlers
  const handleOpenBookingDetail = async (learnerId) => {
    setBookingDetailLoading(true);
    try {
      const learner = learnerRequests.find(req => req.learnerId === learnerId);
      setSelectedLearner(learner);
      
      const nearestOfferId = getNearestOfferIdForLearner(learnerId);
      if (nearestOfferId) {
        const offerDetail = await tutorBookingOfferDetail(nearestOfferId);
        setSelectedOfferSlots(offerDetail?.offeredSlots || []);
      } else {
        setSelectedOfferSlots([]);
      }
      
      // Load temporary slots for current week
      const tempSlots = loadTemporarySlots(dialogWeekStart, learnerId);
      setTemporarilySelectedSlots(tempSlots);
      
      setBookingDetailDialogOpen(true);
    } catch (err) {
      console.error("Failed to fetch booking detail:", err);
      toast.error("Không thể tải chi tiết booking");
    } finally {
      setBookingDetailLoading(false);
    }
  };

  // Lesson management functions
  const fetchTutorLessons = async () => {
    setLessonsLoading(true);
    try {
      const lessons = await fetchTutorLesson(id);
      console.log("Fetched lessons:", lessons);
      if (lessons && Array.isArray(lessons)) {
        setAvailableLessons(lessons);
      } else {
        setAvailableLessons([]);
      }
    } catch (error) {
      console.error("Failed to fetch tutor lessons:", error);
      setAvailableLessons([]);
      toast.error("Không thể tải danh sách bài học");
    } finally {
      setLessonsLoading(false);
    }
  };

  const handleProceedWithOffer = async () => {
    if (temporarilySelectedSlots.length === 0) {
      toast.error("Vui lòng chọn ít nhất một slot thời gian");
      return;
    }

    try {
      await fetchTutorLessons();
      setLessonSelectionDialogOpen(true);
    } catch (err) {
      console.error("Failed to fetch lessons:", err);
      toast.error("Không thể tải danh sách bài học");
    }
  };

  const handleSlotClick = (dayInWeek, slotIdx) => {
    if (!selectedLearner) return;

    setTemporarilySelectedSlots((prev) => {
      const exists = prev.some(
        (slot) =>
          slot.dayInWeek === dayInWeek &&
          slot.slotIndex === slotIdx
      );
      
      let newSlots;
      if (exists) {
        newSlots = prev.filter(
          (slot) =>
            !(
              slot.dayInWeek === dayInWeek &&
              slot.slotIndex === slotIdx
            )
        );
      } else {
        newSlots = [
          ...prev,
          { dayInWeek, slotIndex: slotIdx },
        ];
      }
      
      // Save to localStorage
      saveTemporarySlots(dialogWeekStart, selectedLearner.learnerId, newSlots);
      
      return newSlots;
    });
  };

  const handleSendOffer = async () => {
    if (!selectedLesson || !selectedLearner || temporarilySelectedSlots.length === 0) {
      toast.error("Vui lòng chọn bài học và slot thời gian");
      return;
    }

    try {
      const offeredSlots = temporarilySelectedSlots.map((slot) => ({
        slotDateTime: getSlotDateTime(
          dialogWeekStart,
          slot.dayInWeek,
          slot.slotIndex
        ),
        slotIndex: slot.slotIndex,
      }));

      if (selectedOfferSlots.length > 0) {
        // Update existing offer
        const nearestOfferId = getNearestOfferIdForLearner(selectedLearner.learnerId);
        await updateTutorBookingOfferByOfferId(nearestOfferId, {
          lessonId: selectedLesson.id,
          offeredSlots,
        });
        toast.success("Đã cập nhật đề xuất thành công!");
      } else {
        // Create new offer
        await createTutorBookingOffer({
          learnerId: selectedLearner.learnerId,
          lessonId: selectedLesson.id,
          offeredSlots,
        });
        toast.success("Đã gửi đề xuất thành công!");
      }

      // Clear temporary slots for this week after successful offer
      clearTemporarySlots(dialogWeekStart, selectedLearner.learnerId);

      // Close all dialogs and reset state
      setLessonSelectionDialogOpen(false);
      setBookingDetailDialogOpen(false);
      setSelectedOfferSlots([]);
      setTemporarilySelectedSlots([]);
      setSelectedLearner(null);
      setSelectedLesson(null);
      
    } catch (err) {
      toast.error("Gửi đề nghị thất bại: " + err.message);
    }
  };

  // Lesson dialog handlers
  const handleCreateLesson = () => {
    setEditLesson(null);
    setLessonForm(defaultLessonForm);
    setShowValidation(false);
    setLessonDialogOpen(true);
  };

  const handleEditLesson = (lesson) => {
    setEditLesson(lesson);
    setLessonForm({
      name: lesson.name,
      description: lesson.description,
      targetAudience: lesson.targetAudience,
      prerequisites: lesson.prerequisites,
      languageCode: lesson.languageCode,
      category: lesson.category,
      price: formatPriceWithCommas(lesson.price),
    });
    setShowValidation(false);
    setLessonDialogOpen(true);
  };

  const handleDeleteLesson = (lesson) => {
    setLessonToDelete(lesson);
    setDeleteModalOpen(true);
  };

  const handleLessonFormChange = (field, value) => {
    setLessonForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveLesson = async () => {
    setShowValidation(true);
    if (
      !lessonForm.name ||
      !lessonForm.description ||
      !lessonForm.targetAudience ||
      !lessonForm.prerequisites ||
      !lessonForm.languageCode ||
      !lessonForm.category ||
      !lessonForm.price
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin bài học!");
      return;
    }

    // Validate price
    const priceValue = Number(lessonForm.price.toString().replace(/,/g, ""));
    if (isNaN(priceValue) || priceValue <= 0) {
      toast.error("Giá bài học phải là số hợp lệ và lớn hơn 0!");
      return;
    }

    setLessonLoading(true);
    try {
      // Prepare lesson data with price as a number
      const lessonData = {
        ...lessonForm,
        price: priceValue,
      };

      if (editLesson) {
        await updateLesson(editLesson.id, lessonData);
        setLessons(
          lessons.map((l) =>
            l.id === editLesson.id ? { ...l, ...lessonData } : l
          )
        );
        toast.success("Cập nhật bài học thành công!");
      } else {
        const res = await createLesson(lessonData);
        setLessons([...lessons, res.data]);
        toast.success("Tạo bài học thành công!");
      }
      setLessonDialogOpen(false);
      setShowValidation(false);
    } catch (err) {
      toast.error("Lưu bài học thất bại: " + err.message);
    } finally {
      setLessonLoading(false);
    }
  };

  const handleCancelLesson = () => {
    setLessonDialogOpen(false);
    setShowValidation(false);
    setEditLesson(null);
    setLessonForm(defaultLessonForm);
  };

  // Pattern editing handlers
  const openEditPatternDialog = () => {
    const patternForWeek = getPatternForWeek(
      weeklyPatterns,
      currentWeekStart
    ) || { slots: [] };
    const slotMap = buildEditPatternSlotsFromPattern(patternForWeek);

    setEditPatternSlots(slotMap);
    setEditPatternData({
      appliedFrom: currentWeekStart.toISOString(),
      slots: patternForWeek.slots,
    });
    setEditPatternDialogOpen(true);
  };

  const openDeletePatternDialog = (patternId) => {
    setPatternToDelete(patternId);
    setDeletePatternModalOpen(true);
  };

  const handlePatternSlotToggle = (dayInWeek, slotIndex) => {
    const key = `${dayInWeek}-${slotIndex}`;
    setEditPatternSlots((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSavePattern = async () => {
    setWeeklyPatternLoading(true);
    try {
      const selectedSlots = [];
      Object.entries(editPatternSlots).forEach(([key, isSelected]) => {
        if (isSelected) {
          const [dayInWeek, slotIndex] = key.split("-").map(Number);
          selectedSlots.push({ dayInWeek, slotIndex });
        }
      });

      const patternData = {
        appliedFrom: currentWeekStart.toISOString(),
        slots: selectedSlots,
      };

      await editTutorWeeklyPattern(patternData);
      toast.success("Lưu lịch trình thành công!");
      
      // Refresh patterns
      const patterns = await fetchTutorWeeklyPattern(id);
      setWeeklyPatterns(patterns);
      
      setEditPatternDialogOpen(false);
    } catch (err) {
      console.error("Failed to save pattern:", err);
      toast.error("Lưu lịch trình thất bại: " + err.message);
    } finally {
      setWeeklyPatternLoading(false);
    }
  };

  const handleDeletePattern = async () => {
    if (!patternToDelete) return;
    
    setWeeklyPatternLoading(true);
    try {
      await deleteTutorWeeklyPattern(patternToDelete);
      toast.success("Xóa lịch trình thành công!");
      
      // Refresh patterns
      const patterns = await fetchTutorWeeklyPattern(id);
      setWeeklyPatterns(patterns);
      
      setDeletePatternModalOpen(false);
      setPatternToDelete(null);
    } catch (err) {
      console.error("Failed to delete pattern:", err);
      toast.error("Xóa lịch trình thất bại: " + err.message);
    } finally {
      setWeeklyPatternLoading(false);
    }
  };

  // Show loading skeleton
  if (loading) {
    return <TutorProfileSkeleton />;
  }

  // Show error if no tutor data
  if (!tutorData) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h6" align="center">
          Không tìm thấy thông tin gia sư
        </Typography>
      </Container>
    );
  }

  return (
    <>
      <GlobalStyles styles={{ body: { backgroundColor: "#f5f5f5" } }} />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={4}>
          {/* Left Column - Profile Info */}
          <Grid
            item
            xs={12}
            md={4}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              minWidth: 0,
              width: "100%",
            }}
          >
            <ProfileCard>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Avatar
                  src={tutorData.avatar}
                  alt={tutorData.fullName}
                  sx={{ width: 160, height: 160, mb: 2 }}
                />
                <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold" }}>
                  {tutorData.fullName}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  @{tutorData.username}
                </Typography>
                
                {/* Verification Status */}
                <Chip
                  icon={tutorData.verificationStatus === 'VERIFIED' ? <FiCheck /> : null}
                  label={
                    tutorData.verificationStatus === 'VERIFIED'
                      ? 'Đã xác minh'
                      : tutorData.verificationStatus === 'PENDING_VERIFICATION'
                      ? 'Đang chờ xác minh'
                      : 'Chưa xác minh'
                  }
                  color={
                    tutorData.verificationStatus === 'VERIFIED'
                      ? 'success'
                      : tutorData.verificationStatus === 'PENDING_VERIFICATION'
                      ? 'warning'
                      : 'default'
                  }
                  sx={{ mt: 2 }}
                />
              </Box>
            </ProfileCard>
          </Grid>

          {/* Right Column - Tabs Content */}
          <Grid
            item
            xs={12}
            md={8}
            sx={{
              display: "flex",
              flexDirection: "column",
              minWidth: 0,
              width: "100%",
            }}
          >
            <Paper
              sx={{
                p: 0,
                minHeight: "700px",
                width: "100%",
                maxWidth: "100%",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                borderRadius: "16px",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
              }}
            >
              {/* Tabs */}
              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs
                  value={selectedTab}
                  onChange={handleTabChange}
                  sx={{
                    px: 3,
                    pt: 3,
                    "& .MuiTab-root": {
                      textTransform: "none",
                      fontWeight: 600,
                      fontSize: "1rem",
                    },
                  }}
                >
                  <Tab label="Thông tin chung" />
                  <Tab label="Kỹ năng & Ngôn ngữ" />
                  <Tab label="Bài học" />
                </Tabs>
              </Box>

              {/* Tab Content */}
              <Box sx={{ p: 3, flex: 1, overflow: "auto" }}>
                {selectedTab === 0 && (
                  <GeneralInfoTab
                    tutorData={tutorData}
                    currentWeekStart={currentWeekStart}
                    availabilityData={availabilityData}
                    weeklyPatternLoading={weeklyPatternLoading}
                    learnerRequests={learnerRequests}
                    learnerRequestsLoading={learnerRequestsLoading}
                    learnerRequestsError={learnerRequestsError}
                    isOwner={isOwner}
                    handlePrevWeek={handlePrevWeek}
                    handleNextWeek={handleNextWeek}
                    openEditPatternDialog={openEditPatternDialog}
                    handleOpenBookingDetail={handleOpenBookingDetail}
                  />
                )}

                {selectedTab === 1 && (
                  <SkillsLanguagesTab
                    tutorData={tutorData}
                    documents={documents}
                    documentsLoading={documentsLoading}
                    documentsError={documentsError}
                    isOwner={isOwner}
                    handleCertificateUpload={handleCertificateUpload}
                    handleRequestVerification={handleRequestVerification}
                    handleRemoveCertificate={handleRemoveCertificate}
                  />
                )}

                {selectedTab === 2 && (
                  <LessonsTab
                    lessons={lessons}
                    lessonsLoading={lessonsLoading}
                    isOwner={isOwner}
                    handleCreateLesson={handleCreateLesson}
                    handleEditLesson={handleEditLesson}
                    handleDeleteLesson={handleDeleteLesson}
                  />
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Dialogs */}
        <BookingDetailDialog
          open={bookingDetailDialogOpen}
          onClose={() => setBookingDetailDialogOpen(false)}
          selectedLearner={selectedLearner}
          dialogWeekStart={dialogWeekStart}
          onPrevWeek={handleDialogPrevWeek}
          onNextWeek={handleDialogNextWeek}
          selectedOfferSlots={selectedOfferSlots}
          temporarilySelectedSlots={temporarilySelectedSlots}
          availabilityData={availabilityData}
          bookingDetailLoading={bookingDetailLoading}
          onSlotClick={handleSlotClick}
          onProceedWithOffer={handleProceedWithOffer}
          onClearSlots={() => {
            setTemporarilySelectedSlots([]);
            clearTemporarySlots(dialogWeekStart, selectedLearner?.learnerId);
          }}
        />

        <LessonSelectionDialog
          open={lessonSelectionDialogOpen}
          onClose={() => setLessonSelectionDialogOpen(false)}
          availableLessons={availableLessons}
          lessonsLoading={lessonsLoading}
          selectedLesson={selectedLesson}
          onLessonSelect={setSelectedLesson}
          temporarilySelectedSlots={temporarilySelectedSlots}
          onSendOffer={handleSendOffer}
        />

        <LessonDialog
          open={lessonDialogOpen}
          onClose={() => setLessonDialogOpen(false)}
          editLesson={editLesson}
          lessonForm={lessonForm}
          onFormChange={handleLessonFormChange}
          showValidation={showValidation}
          lessonLoading={lessonLoading}
          onSave={handleSaveLesson}
          onCancel={handleCancelLesson}
        />

        <EditPatternDialog
          open={editPatternDialogOpen}
          onClose={() => setEditPatternDialogOpen(false)}
          currentWeekStart={currentWeekStart}
          onPrevWeek={handleEditPrevWeek}
          onNextWeek={handleEditNextWeek}
          editPatternSlots={editPatternSlots}
          onSlotToggle={handlePatternSlotToggle}
          onSavePattern={handleSavePattern}
          onDeletePattern={() => openDeletePatternDialog(currentPattern?.id)}
          weeklyPatternLoading={weeklyPatternLoading}
          canDelete={!!currentPattern?.id}
        />

        {/* Confirm Dialogs */}
        <ConfirmDialog
          open={deleteModalOpen}
          title="Xác nhận xóa bài học"
          content={`Bạn có chắc chắn muốn xóa bài học "${lessonToDelete?.name}"?`}
          onCancel={() => setDeleteModalOpen(false)}
          onConfirm={async () => {
            setLessonLoading(true);
            try {
              await deleteLesson(lessonToDelete.id);
              setLessons(lessons.filter((l) => l.id !== lessonToDelete.id));
              setDeleteModalOpen(false);
              toast.success("Xóa bài học thành công!");
            } catch (err) {
              toast.error("Xóa bài học thất bại: " + err.message);
            } finally {
              setLessonLoading(false);
            }
          }}
        />

        <ConfirmDialog
          open={deleteCertificateModalOpen}
          title="Xác nhận xóa chứng chỉ"
          content={`Bạn có chắc chắn muốn xóa chứng chỉ "${certificateToDelete?.documentName}"?`}
          onCancel={() => setDeleteCertificateModalOpen(false)}
          onConfirm={confirmDeleteCertificate}
        />

        <ConfirmDialog
          open={deletePatternModalOpen}
          title="Xác nhận xóa lịch trình"
          content="Bạn có chắc chắn muốn xóa lịch trình này?"
          onCancel={() => setDeletePatternModalOpen(false)}
          onConfirm={handleDeletePattern}
        />
      </Container>

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
      />
    </>
  );
};

export default TutorProfile;
