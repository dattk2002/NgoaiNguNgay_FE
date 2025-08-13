import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Paper,
  Chip,
  Button,
  Grid,
  Avatar,
  CircularProgress,
  Alert,
  GlobalStyles,
  Card,
  CardContent,
  Skeleton,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  FiPlusCircle,
  FiEdit,
  FiTrash2,
  FiCheck,
  FiUpload,
  FiDownload,
  FiEye,
  FiCloud,
  FiEdit3,
  FiClock,
  FiFileText,
  FiUser,
  FiCalendar,
  FiMessageSquare,
  FiX,
} from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  fetchUserProfileById,
  fetchUserById,
  fetchDocumentsByTutorId,
  deleteDocument,
  requestTutorVerification,
  uploadCertificate,
  fetchTutorApplicationByApplicationId,
} from "../api/auth";
import ConfirmDialog from "../modals/ConfirmDialog";

// Global styles to remove focus borders
const globalStyles = (
  <GlobalStyles
    styles={{
      "*:focus": {
        outline: "none !important",
        boxShadow: "none !important",
      },
      "button:focus": {
        outline: "none !important",
        boxShadow: "none !important",
      },
    }}
  />
);

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: "16px",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
  border: "1px solid #f1f5f9",
  background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
  transition: "all 0.3s ease",
  "&:hover": {
    boxShadow: "0 12px 40px rgba(0, 0, 0, 0.12)",
    transform: "translateY(-2px)",
  },
}));

const LargeAvatar = styled(Avatar)(({ theme }) => ({
  width: theme.spacing(20),
  height: theme.spacing(20),
  margin: "0 auto 16px",
  border: "4px solid #ffffff",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
  fontSize: "4rem",
  backgroundColor: "#e5e7eb",
  color: "#6b7280",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "scale(1.05)",
    boxShadow: "0 12px 40px rgba(0, 0, 0, 0.16)",
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  position: "relative",
  paddingBottom: theme.spacing(2),
  marginBottom: theme.spacing(3),
  fontWeight: 700,
  color: "#1e293b",
  fontSize: "1.25rem",
  "&:after": {
    content: '""',
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "60px",
    height: "4px",
    backgroundColor: "#3b82f6",
    borderRadius: "2px",
  },
}));

const InfoBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: "#f8fafc",
  borderRadius: "12px",
  border: "1px solid #e2e8f0",
  marginBottom: theme.spacing(2),
  "&:last-child": {
    marginBottom: 0,
  },
}));

const InfoLabel = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  color: "#475569",
  fontSize: "0.875rem",
  marginBottom: theme.spacing(0.5),
}));

const InfoValue = styled(Typography)(({ theme }) => ({
  color: "#1e293b",
  fontSize: "1rem",
  fontWeight: 500,
}));

// Styled components for certificate management
const CertificateCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  border: "1px solid #e2e8f0",
  borderRadius: "12px",
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    transform: "translateY(-2px)",
  },
}));

const CertificateActions = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(1),
  alignItems: "center",
}));

const UploadArea = styled(Box)(({ theme }) => ({
  border: "2px dashed #d1d5db",
  borderRadius: "16px",
  padding: theme.spacing(6),
  textAlign: "center",
  backgroundColor: "#f9fafb",
  cursor: "pointer",
  transition: "all 0.3s ease-in-out",
  position: "relative",
  overflow: "hidden",
  "&:hover": {
    borderColor: "#3b82f6",
    backgroundColor: "#f0f9ff",
    transform: "translateY(-2px)",
    boxShadow: "0 8px 25px rgba(59, 130, 246, 0.15)",
  },
  "&.drag-over": {
    borderColor: "#3b82f6",
    backgroundColor: "#dbeafe",
  },
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(147, 197, 253, 0.05) 100%)",
    opacity: 0,
    transition: "opacity 0.3s ease",
  },
  "&:hover::before": {
    opacity: 1,
  },
}));

const UploadIcon = styled(Box)(({ theme }) => ({
  width: 80,
  height: 80,
  borderRadius: "50%",
  backgroundColor: "rgba(59, 130, 246, 0.1)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: theme.spacing(2),
  transition: "all 0.3s ease",
  "&:hover": {
    backgroundColor: "rgba(59, 130, 246, 0.2)",
    transform: "scale(1.05)",
  },
}));



// Skeleton Components
const UserProfileSkeleton = () => (
  <Container
    maxWidth="lg"
    sx={{
      py: 6,
      backgroundColor: "#f8fafc",
      minHeight: "100vh",
      width: "100%",
      maxWidth: "100%",
      display: "flex",
      flexDirection: "column",
    }}
  >
    <Grid container spacing={4} sx={{ width: "100%", flex: "1 1 auto", margin: 0 }}>
      <Grid item xs={12} md={4} sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
        <StyledPaper sx={{ textAlign: "center", position: "relative", mb: 3, width: "100%" }}>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 2 }}>
            <Skeleton 
              variant="circular" 
              width={160} 
              height={160} 
              sx={{ 
                mb: 2,
                border: "4px solid #ffffff",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
              }} 
            />
            <Skeleton variant="text" width={180} height={40} sx={{ mb: 1 }} />
            <Skeleton variant="text" width={120} height={24} />
          </Box>
        </StyledPaper>

        <StyledPaper sx={{ width: "100%" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Skeleton variant="text" width={100} height={32} />
            <Skeleton variant="rectangular" width={120} height={40} sx={{ borderRadius: "8px" }} />
          </Box>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Box key={item} sx={{ mb: 2 }}>
              <Skeleton variant="text" width="40%" height={20} sx={{ mb: 1 }} />
              <Skeleton variant="text" width="80%" height={24} />
              </Box>
            ))}
        </StyledPaper>
      </Grid>

      <Grid item xs={12} md={8} sx={{ display: "flex", flexDirection: "column", minWidth: 0, width: "100%" }}>
        <StyledPaper sx={{ minHeight: "700px", width: "100%", maxWidth: "100%", display: "flex", flexDirection: "column" }}>
          <Skeleton variant="text" width={150} height={32} sx={{ mb: 3 }} />
          <Skeleton variant="rectangular" width="100%" height={200} sx={{ mb: 3, borderRadius: "12px" }} />
          <Skeleton variant="text" width={120} height={24} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" width="100%" height={300} sx={{ borderRadius: "12px" }} />
        </StyledPaper>
      </Grid>
    </Grid>
  </Container>
);

const CertificateSkeleton = () => (
  <Box sx={{ p: 2 }}>
    <Skeleton variant="text" width="40%" height={24} sx={{ mb: 2 }} />
    <Skeleton variant="rectangular" width="100%" height={80} sx={{ mb: 2, borderRadius: "8px" }} />
    <Skeleton variant="rectangular" width="100%" height={80} sx={{ mb: 2, borderRadius: "8px" }} />
    <Skeleton variant="rectangular" width="100%" height={80} sx={{ borderRadius: "8px" }} />
  </Box>
);

// Helper functions
function hasOnlyLearnerRole(user) {
  if (!user || !user.roles) return false;
  const roles = Array.isArray(user.roles) ? user.roles : [user.roles];
  return (
    roles.length === 1 &&
    (roles[0] === "Learner" || roles[0]?.name === "Learner")
  );
}

function UserProfile({ loggedInUser, getUserById, requestTutorVerification, uploadCertificate, fetchTutorDetail }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profileUser, setProfileUser] = useState(null);
  const [tutorData, setTutorData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentAvatar, setCurrentAvatar] = useState(null);
  const [avatarKey, setAvatarKey] = useState(Date.now());
  const avatarRef = useRef(null);
  
  // Certificate management states
  const [uploadedCertificates, setUploadedCertificates] = useState([]);
  const [certificateUploading, setCertificateUploading] = useState(false);
  const [verificationRequesting, setVerificationRequesting] = useState(false);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [deleteCertificateDialogOpen, setDeleteCertificateDialogOpen] = useState(false);
  const [certificateToDelete, setCertificateToDelete] = useState(null);
  const [tutorApplication, setTutorApplication] = useState(null);
  const [applicationLoading, setApplicationLoading] = useState(false);
  const [applicationDetailDialogOpen, setApplicationDetailDialogOpen] = useState(false);

  // Listen for avatar updates through custom event
  useEffect(() => {
    const handleAvatarUpdate = (event) => {
      if (event.detail && event.detail.profileImageUrl && profileUser) {
        let newUrl = event.detail.profileImageUrl;
        if (!newUrl.includes("?")) {
          newUrl = `${newUrl}?t=${Date.now()}`;
        }

        setCurrentAvatar(newUrl);
        setAvatarKey(Date.now());

        setProfileUser((prev) => ({
          ...prev,
          profileImageUrl: newUrl,
        }));

        if (avatarRef.current) {
          avatarRef.current.src = newUrl + "&reload=" + Date.now();
        }

        const preloadImg = new Image();
        preloadImg.crossOrigin = "anonymous";
        preloadImg.src = newUrl;
        preloadImg.onload = () => {
          setAvatarKey(Date.now() + 1);
        };
      }
    };

    window.addEventListener("avatar-updated", handleAvatarUpdate);
    return () => {
      window.removeEventListener("avatar-updated", handleAvatarUpdate);
    };
  }, [profileUser]);

  // Listen for storage events (for cross-tab updates)
  useEffect(() => {
    const handleStorageChange = () => {
      if (profileUser) {
        try {
          const storedUser = JSON.parse(localStorage.getItem("user"));
          if (
            storedUser &&
            storedUser.id === profileUser.id &&
            storedUser.profileImageUrl
          ) {
            let newUrl = storedUser.profileImageUrl;
            if (!newUrl.includes("?")) {
              newUrl = `${newUrl}?t=${Date.now()}`;
            }
            setCurrentAvatar(newUrl);
            setAvatarKey(Date.now());

            if (avatarRef.current) {
              avatarRef.current.src = newUrl + "&reload=" + Date.now();
            }
          }
        } catch (error) {
          console.error("Error handling storage event in UserProfile:", error);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [profileUser]);

  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (loggedInUser && loggedInUser.id === id) {
          const currentUserData = await fetchUserById();
          setProfileUser(currentUserData);
          let avatarUrl = currentUserData.profileImageUrl;
          if (avatarUrl && !avatarUrl.includes("?")) {
            avatarUrl = `${avatarUrl}?t=${Date.now()}`;
          }
          setCurrentAvatar(avatarUrl);
        } else {
          const data = await fetchUserProfileById(id);
          if (!data) {
            throw new Error("User not found.");
          }
          setProfileUser(data);
          let avatarUrl = data.profileImageUrl;
          if (avatarUrl && !avatarUrl.includes("?")) {
            avatarUrl = `${avatarUrl}?t=${Date.now()}`;
          }
          setCurrentAvatar(avatarUrl);
        }

        // Fetch tutor data if user is a tutor
        if (fetchTutorDetail) {
          try {
            const tutorResponse = await fetchTutorDetail(id);
            if (tutorResponse && tutorResponse.data) {
              setTutorData(tutorResponse.data);
            }
          } catch (error) {
            console.log("User is not a tutor or tutor data not available");
          }
        }
      } catch (error) {
        console.error("Error loading user profile:", error);
        setError(error.message || "Failed to load user profile.");
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [id, loggedInUser, fetchTutorDetail]);

  // Fetch application data when tutorData is available
  useEffect(() => {
    if (tutorData?.applicationId) {
      fetchApplicationData();
    }
  }, [tutorData?.applicationId]);

  // Fetch documents when component mounts
  useEffect(() => {
    const fetchDocuments = async () => {
      if (!id) return;

      setDocumentsLoading(true);
      try {
        const documents = await fetchDocumentsByTutorId(id);

        // Transform API response to match our certificate format
        const transformedDocuments = [];

        documents.forEach((doc) => {
          // Handle nested files structure
          if (doc.files && Array.isArray(doc.files) && doc.files.length > 0) {
            doc.files.forEach((file) => {
              transformedDocuments.push({
                id: doc.id,
                name:
                  file.originalFileName ||
                  doc.fileName ||
                  doc.name ||
                  "Unknown file",
                size: file.fileSize || doc.fileSize || 0,
                type:
                  file.contentType ||
                  doc.mimeType ||
                  "application/octet-stream",
                uploadedAt: doc.uploadedAt || new Date().toISOString(),
                url: file.cloudinaryUrl || doc.fileUrl || null,
                description: doc.description || "",
                isVisibleToLearner: doc.isVisibleToLearner || false,
              });
            });
          } else {
            // Fallback for documents without nested files array
            transformedDocuments.push({
              id: doc.id,
              name: doc.fileName || doc.name || "Unknown file",
              size: doc.fileSize || 0,
              type: doc.mimeType || "application/octet-stream",
              uploadedAt: doc.uploadedAt || new Date().toISOString(),
              url: doc.fileUrl || null,
              description: doc.description || "",
              isVisibleToLearner: doc.isVisibleToLearner || false,
            });
          }
        });

        setUploadedCertificates(transformedDocuments);
      } catch (error) {
        console.error("Error fetching documents:", error);
        // Don't show error for missing documents, just keep empty array
        setUploadedCertificates([]);
      } finally {
        setDocumentsLoading(false);
      }
    };

    fetchDocuments();
  }, [id]);

  // Handler for the Edit Profile button click
  const handleEditClick = () => {
    navigate(`/user/edit/${profileUser.id}`);
  };

  // Helper function to calculate age from dateOfBirth
  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  // Helper function to format gender
  const formatGender = (gender) => {
    if (gender === 1) return "Nam";
    if (gender === 2) return "Nữ";
    return "Khác";
  };

  // Helper function to format learning proficiency level
  const formatProficiencyLevel = (level) => {
    switch (level) {
      case 1: return "Sơ cấp";
      case 2: return "Trung cấp";
      case 3: return "Cao cấp";
      default: return "Chưa xác định";
    }
  };

  // Helper function to format timezone
  const formatTimezone = (timezone) => {
    if (!timezone) return "Chưa cập nhật";
    return timezone.replace("UTC", "GMT");
  };

  // Helper function to parse additional data
  const parseAdditionalData = (additionalData) => {
    if (!additionalData) return null;
    try {
      return typeof additionalData === 'string' ? JSON.parse(additionalData) : additionalData;
    } catch (error) {
      console.error('Error parsing additional data:', error);
      return null;
    }
  };

  // Recalculate age whenever profileUser changes and has a dateOfBirth
  useEffect(() => {
    if (profileUser && profileUser.dateOfBirth) {
      setProfileUser((prev) => ({
        ...prev,
        age: calculateAge(prev.dateOfBirth),
      }));
    }
  }, [profileUser?.dateOfBirth]);

  // Certificate management functions
  const handleCertificateUpload = async (files) => {
    if (!uploadCertificate) {
      toast.error("Chức năng tải lên chứng chỉ không khả dụng");
      return;
    }

    setCertificateUploading(true);
    try {
      const filesToUpload = Array.from(files);

      // Validate files
      for (const file of filesToUpload) {
        if (file.size > 25 * 1024 * 1024) {
          // 25MB limit
          toast.error(`File ${file.name} quá lớn. Kích thước tối đa là 25MB.`);
          setCertificateUploading(false);
          return;
        }

        if (!file.type.includes("pdf") && !file.type.startsWith("image/")) {
          toast.error(
            `File ${file.name} không đúng định dạng. Chỉ chấp nhận PDF và hình ảnh.`
          );
          setCertificateUploading(false);
          return;
        }
      }

      // Use tutorData.applicationId like in TutorProfile
      console.log(
        "Uploading certificates with applicationId:",
        tutorData?.applicationId
      );

      if (!tutorData?.applicationId) {
        toast.error("Không tìm thấy Application ID. Vui lòng đăng ký làm gia sư trước khi tải lên chứng chỉ.");
        setCertificateUploading(false);
        return;
      }

      const response = await uploadCertificate(
        filesToUpload,
        tutorData?.applicationId
      );
      console.log("Certificates uploaded successfully:", response);

      // Refresh documents list after upload
      const updatedDocuments = await fetchDocumentsByTutorId(id);
      const transformedDocuments = [];

      updatedDocuments.forEach((doc) => {
        // Handle nested files structure
        if (doc.files && Array.isArray(doc.files) && doc.files.length > 0) {
          doc.files.forEach((file) => {
            transformedDocuments.push({
              id: doc.id,
              name:
                file.originalFileName ||
                doc.fileName ||
                doc.name ||
                "Unknown file",
              size: file.fileSize || doc.fileSize || 0,
              type:
                file.contentType ||
                doc.mimeType ||
                "application/octet-stream",
              uploadedAt: doc.uploadedAt || new Date().toISOString(),
              url: file.cloudinaryUrl || doc.fileUrl || null,
              description: doc.description || "",
              isVisibleToLearner: doc.isVisibleToLearner || false,
            });
          });
        } else {
          // Fallback for documents without nested files array
          transformedDocuments.push({
            id: doc.id,
            name: doc.fileName || doc.name || "Unknown file",
            size: doc.fileSize || 0,
            type: doc.mimeType || "application/octet-stream",
            uploadedAt: doc.uploadedAt || new Date().toISOString(),
            url: doc.fileUrl || null,
            description: doc.description || "",
            isVisibleToLearner: doc.isVisibleToLearner || false,
          });
        }
      });

      setUploadedCertificates(transformedDocuments);
      toast.success("Tải lên chứng chỉ thành công!");
    } catch (error) {
      console.error("Certificate upload failed:", error);
      toast.error(`Tải lên chứng chỉ thất bại: ${error.message}`);
      } finally {
      setCertificateUploading(false);
    }
  };

  const handleRequestVerification = async () => {
    if (!requestTutorVerification) {
      toast.error("Chức năng yêu cầu xác minh không khả dụng");
      return;
    }

    if (uploadedCertificates.length === 0) {
      toast.error(
        "Vui lòng tải lên ít nhất một chứng chỉ trước khi yêu cầu xác minh."
      );
      return;
    }

    if (!tutorData?.applicationId) {
      toast.error("Không tìm thấy Application ID. Vui lòng đăng ký làm gia sư trước khi yêu cầu xác minh.");
      return;
    }

    setVerificationRequesting(true);
    try {
      // Using tutorData.applicationId as the tutorApplicationId like in TutorProfile
      await requestTutorVerification(tutorData?.applicationId);
      toast.success("Yêu cầu xác minh đã được gửi thành công!");
    } catch (error) {
      console.error("Verification request failed:", error);
      toast.error(`Yêu cầu xác minh thất bại: ${error.message}`);
    } finally {
      setVerificationRequesting(false);
    }
  };

  const handleRemoveCertificate = (certificate) => {
    setCertificateToDelete(certificate);
    setDeleteCertificateDialogOpen(true);
  };

  const confirmDeleteCertificate = async () => {
    if (!certificateToDelete) return;

    try {
      await deleteDocument(certificateToDelete.id);

      // Remove from local state
      setUploadedCertificates((prev) =>
        prev.filter((cert) => cert.id !== certificateToDelete.id)
      );
      toast.success("Xóa chứng chỉ thành công!");
    } catch (error) {
      console.error("Failed to delete certificate:", error);
      toast.error(`Xóa chứng chỉ thất bại: ${error.message}`);
    } finally {
      setDeleteCertificateDialogOpen(false);
      setCertificateToDelete(null);
    }
  };

  const fetchApplicationData = async () => {
    if (!tutorData?.applicationId) return;
    
    setApplicationLoading(true);
    try {
      const response = await fetchTutorApplicationByApplicationId(tutorData.applicationId);
      setTutorApplication(response);
    } catch (error) {
      console.log("User is not a tutor or no application found");
    } finally {
      setApplicationLoading(false);
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 0: return "Chưa nộp";
      case 1: return "Chờ xác minh";
      case 2: return "Yêu cầu chỉnh sửa";
      case 3: return "Chờ xác minh lại";
      case 4: return "Đã xác minh";
      default: return "Không xác định";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 0: return "#6b7280"; // gray - chưa nộp
      case 1: return "#f59e0b"; // amber - chờ xác minh
      case 2: return "#3b82f6"; // blue - yêu cầu chỉnh sửa
      case 3: return "#f59e0b"; // amber - chờ xác minh lại
      case 4: return "#10b981"; // green - đã xác minh
      default: return "#6b7280"; // gray
    }
  };

  // Helper function to get file icon and color


  if (isLoading) {
    return (
      <>
        {globalStyles}
        <UserProfileSkeleton />
      </>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 8 }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!profileUser) {
    return (
      <Container sx={{ py: 8 }}>
        <Alert severity="warning">
          Không tìm thấy người dùng.
        </Alert>
      </Container>
    );
  }

  // Determine if the logged-in user is viewing their own profile
  const isOwnProfile = loggedInUser && loggedInUser.id === profileUser.id;
  
  // Alternative check with string comparison to handle different data types
  const isOwnProfileAlt = loggedInUser && profileUser && 
    (String(loggedInUser.id) === String(profileUser.id) || 
     String(loggedInUser.id) === String(id));
  
  // Final determination - should show edit button
  const shouldShowEditButton = isOwnProfile || isOwnProfileAlt;

  return (
    <>
      {globalStyles}
      <Container
        maxWidth="lg"
        sx={{
          py: 6,
          backgroundColor: "#f8fafc",
          minHeight: "100vh",
          width: "100%",
          maxWidth: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Grid
          container
          spacing={4}
          sx={{
            width: "100%",
            flex: "1 1 auto",
            margin: 0,
          }}
        >
          {/* Left Column - Avatar + Profile Details */}
          <Grid
            item
            xs={12}
            md={4}
            sx={{ display: "flex", flexDirection: "column", width: "100%" }}
          >
            {/* Avatar Section */}
            <StyledPaper sx={{ textAlign: "center", position: "relative", mb: 3 }}>
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 2 }}>
                {currentAvatar ? (
                  <LargeAvatar
                    ref={avatarRef}
                    key={avatarKey}
                    src={currentAvatar}
                    alt={profileUser.fullName || profileUser.nickName || "User"}
                    sx={{
                      backgroundImage: `url(${currentAvatar})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                ) : (
                  <LargeAvatar>
                    {(profileUser.fullName || profileUser.nickName || "U").charAt(0).toUpperCase()}
                  </LargeAvatar>
                )}
                
                <Typography variant="h5" sx={{ fontWeight: 700, color: "#1e293b", mb: 1 }}>
                  {profileUser.fullName || profileUser.nickName || "Không có tên"}
                </Typography>
                
                {profileUser.fullName && profileUser.nickName && profileUser.fullName !== profileUser.nickName && (
                  <Typography variant="body1" sx={{ color: "#64748b", fontWeight: 500 }}>
                    Biệt danh: {profileUser.nickName}
                  </Typography>
                )}
                
                {shouldShowEditButton && (
                  <Button
                    variant="outlined"
                    startIcon={<FiEdit3 />}
                    onClick={handleEditClick}
                    sx={{
                      mt: 2,
                      borderRadius: "12px",
                      textTransform: "none",
                      fontWeight: 600,
                      borderColor: "#3b82f6",
                      color: "#3b82f6",
                      "&:hover": {
                        borderColor: "#2563eb",
                        backgroundColor: "rgba(59, 130, 246, 0.04)",
                      },
                    }}
                  >
                    Chỉnh sửa hồ sơ
                  </Button>
                )}
              </Box>
            </StyledPaper>

            {/* Profile Information */}
            <StyledPaper>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <SectionTitle variant="h6" sx={{ mb: 0, "&:after": { display: "none" } }}>
                  Thông tin cá nhân
                </SectionTitle>
              </Box>

              <Box>
                <InfoBox>
                  <InfoLabel>Email</InfoLabel>
                  <InfoValue>{profileUser.email || "Không có email"}</InfoValue>
                </InfoBox>

                {profileUser.dateOfBirth && (
                  <InfoBox>
                    <InfoLabel>Ngày sinh</InfoLabel>
                    <InfoValue>
                      {new Date(profileUser.dateOfBirth).toLocaleDateString("vi-VN")} ({calculateAge(profileUser.dateOfBirth)} tuổi)
                    </InfoValue>
                  </InfoBox>
                )}

                {profileUser.gender !== undefined && (
                  <InfoBox>
                    <InfoLabel>Giới tính</InfoLabel>
                    <InfoValue>{formatGender(profileUser.gender)}</InfoValue>
                  </InfoBox>
                )}

                {profileUser.phoneNumber && (
                  <InfoBox>
                    <InfoLabel>Số điện thoại</InfoLabel>
                    <InfoValue>{profileUser.phoneNumber}</InfoValue>
                  </InfoBox>
                )}

                {profileUser.address && (
                  <InfoBox>
                    <InfoLabel>Địa chỉ</InfoLabel>
                    <InfoValue>{profileUser.address}</InfoValue>
                  </InfoBox>
                )}

                {profileUser.timezone && (
                  <InfoBox>
                    <InfoLabel>Múi giờ</InfoLabel>
                    <InfoValue>{formatTimezone(profileUser.timezone)}</InfoValue>
                  </InfoBox>
                )}

                {profileUser.learningProficiencyLevel !== undefined && (
                  <InfoBox>
                    <InfoLabel>Trình độ học tập</InfoLabel>
                    <InfoValue>{formatProficiencyLevel(profileUser.learningProficiencyLevel)}</InfoValue>
                  </InfoBox>
                )}

                {profileUser.interests && profileUser.interests.length > 0 && (
                  <InfoBox>
                    <InfoLabel>Sở thích</InfoLabel>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
                      {profileUser.interests.map((interest, index) => (
                        <Chip
                          key={index}
                          label={interest}
                          sx={{
                            backgroundColor: "#f3e8ff",
                            color: "#7c3aed",
                            borderRadius: "8px",
                            fontWeight: 600,
                          }}
                        />
                      ))}
                    </Box>
                  </InfoBox>
                )}

                {profileUser.languageSkills && profileUser.languageSkills.length > 0 && (
                  <InfoBox>
                    <InfoLabel>Kỹ năng ngôn ngữ</InfoLabel>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
                      {profileUser.languageSkills.map((skill, index) => (
                        <Chip
                          key={index}
                          label={`${skill.language} - ${formatProficiencyLevel(skill.level)}`}
                          sx={{
                            backgroundColor: "#fef3c7",
                            color: "#92400e",
                            borderRadius: "8px",
                            fontWeight: 600,
                          }}
                        />
                      ))}
                    </Box>
                  </InfoBox>
                )}
              </Box>
            </StyledPaper>
          </Grid>

          {/* Right Column - Certificate Management */}
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
            <StyledPaper
              sx={{
                minHeight: "700px",
                width: "100%",
                maxWidth: "100%",
                display: "flex",
                flexDirection: "column",
                p: 4,
              }}
            >
              <SectionTitle variant="h6">Quản lý chứng chỉ</SectionTitle>

              {/* Application Status Section */}
              {tutorData && (
              <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: "#374151" }}>
                    Trạng thái đăng ký gia sư
                  </Typography>
                  
                  {applicationLoading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                      <CircularProgress />
                    </Box>
                  ) : tutorApplication ? (
                    <Card sx={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                      <CardContent>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: "#1e293b", mb: 1 }}>
                              Đơn đăng ký gia sư
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              Ngày nộp: {new Date(tutorApplication.submittedAt).toLocaleDateString('vi-VN')}
                            </Typography>
                          </Box>
                          <Chip
                            label={getStatusText(tutorApplication.status)}
                  sx={{
                              backgroundColor: getStatusColor(tutorApplication.status),
                              color: "white",
                    fontWeight: 600,
                            }}
                          />
                        </Box>
                        
                        {tutorApplication.revisionNotes && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: "#374151", mb: 0.5 }}>
                              Ghi chú từ staff:
                            </Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                              {tutorApplication.revisionNotes}
                            </Typography>
                          </Box>
                        )}
                        
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => setApplicationDetailDialogOpen(true)}
                            startIcon={<FiEye />}
                            sx={{ textTransform: "none" }}
                          >
                            Xem chi tiết
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  ) : (
                    <Box sx={{ textAlign: "center", py: 3, color: "#64748b" }}>
                      <Typography variant="body2">
                        Chưa có đơn đăng ký gia sư
                </Typography>
                    </Box>
                  )}
                </Box>
              )}
              
              {/* Upload Section */}
              <Box sx={{ mb: 6 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: "#374151" }}>
                  Tải lên chứng chỉ
                </Typography>
                
                <UploadArea
                  component="label"
                  htmlFor="certificate-upload"
                  sx={{ 
                    minHeight: "200px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <input
                    id="certificate-upload"
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.gif"
                    style={{ display: "none" }}
                    onChange={(e) => handleCertificateUpload(e.target.files)}
                    disabled={certificateUploading}
                  />
                  
                  {certificateUploading ? (
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                      <CircularProgress size={50} />
                      <Typography variant="body1" color="textSecondary" sx={{ fontWeight: 500 }}>
                        Đang tải lên chứng chỉ...
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                      <UploadIcon>
                        <FiCloud size={40} color="#3b82f6" />
                      </UploadIcon>
                      <Box sx={{ textAlign: "center" }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: "#374151", mb: 1 }}>
                          Nhấp để tải lên hoặc kéo và thả
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                          PDF, JPG, PNG (Tối đa 25MB mỗi file)
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Có thể chọn nhiều file cùng lúc
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </UploadArea>
              </Box>

              {/* Certificates List */}
              <Box sx={{ mb: 6 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: "#374151" }}>
                  Chứng chỉ đã tải lên ({uploadedCertificates.length})
                </Typography>
                
                {documentsLoading ? (
                  <CertificateSkeleton />
                ) : uploadedCertificates.length === 0 ? (
                  <Box sx={{ mb: 3, textAlign: "center", py: 2 }}>
                <Typography
                      variant="body2"
                      sx={{ color: "#64748b", fontStyle: "italic" }}
                    >
                      Chưa có chứng chỉ nào được tải lên
                </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {uploadedCertificates.map((certificate) => (
                <Box
                        key={certificate.id}
                  sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          p: 2,
                    backgroundColor: "#f8fafc",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                  }}
                >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                          }}
                        >
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: "8px",
                              backgroundColor: certificate.type.includes("pdf")
                                ? "#dc2626"
                                : "#3b82f6",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "white",
                              fontWeight: 600,
                              fontSize: "12px",
                            }}
                          >
                            {certificate.type.includes("pdf") ? "PDF" : "IMG"}
                          </Box>
                          <Box>
                          <Typography
                            variant="body2"
                              sx={{ fontWeight: 600, color: "#1e293b" }}
                            >
                              {certificate.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: "#64748b" }}
                            >
                              {certificate.size > 0
                                ? `${(certificate.size / 1024 / 1024).toFixed(2)} MB`
                                : "Không xác định"}{" "}
                              •{" "}
                              {new Date(certificate.uploadedAt).toLocaleDateString("vi-VN")}
                            </Typography>
                            {certificate.description && (
                              <Typography
                                variant="caption"
                            sx={{
                                  color: "#64748b",
                                  display: "block",
                                  mt: 0.5,
                            }}
                          >
                                {certificate.description}
                          </Typography>
                            )}
                        </Box>
                    </Box>
                        <Box
                      sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          {certificate.url && (
                            <IconButton
                              onClick={() => window.open(certificate.url, "_blank")}
                              sx={{ color: "#3b82f6" }}
                              size="small"
                              title="Xem file"
                            >
                              <svg
                                width="16"
                                height="16"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </svg>
                            </IconButton>
                          )}
                          <IconButton
                            onClick={() => handleRemoveCertificate(certificate)}
                            sx={{ color: "#dc2626" }}
                            size="small"
                            title="Xóa file"
                          >
                            <FiTrash2 size={16} />
                          </IconButton>
                </Box>
              </Box>
                    ))}
                  </Box>
                )}
              </Box>

              {/* Verification Request Button */}
              {uploadedCertificates.length > 0 && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    mt: 3,
                  }}
                >
                  <Button
                    variant="contained"
                    onClick={handleRequestVerification}
                    disabled={verificationRequesting}
                    sx={{
                      backgroundColor: "#10b981",
                      color: "white",
                      "&:hover": {
                        backgroundColor: "#059669",
                      },
                      px: 4,
                      py: 1.5,
                      borderRadius: "8px",
                      fontWeight: 600,
                      textTransform: "none",
                    }}
                  >
                    {verificationRequesting ? (
                      <>
                        <CircularProgress
                          size={20}
                          sx={{ mr: 1, color: "white" }}
                        />
                        Đang gửi yêu cầu...
                      </>
                    ) : (
                      "Yêu cầu xác minh chứng chỉ"
                    )}
                  </Button>
                </Box>
              )}
            </StyledPaper>
          </Grid>
        </Grid>
      </Container>

      {/* Application Detail Dialog */}
      <Dialog
        open={applicationDetailDialogOpen}
        onClose={() => setApplicationDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Chi tiết đơn đăng ký gia sư
          </Typography>
          <IconButton onClick={() => setApplicationDetailDialogOpen(false)}>
            <FiX />
          </IconButton>
        </DialogTitle>
        
        <DialogContent>
          {tutorApplication && (
            <Box>
              {/* Basic Information */}
              <Card sx={{ mb: 3, backgroundColor: "#f8fafc" }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: "#1e293b" }}>
                    Thông tin cơ bản
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                        <FiCalendar size={16} style={{ marginRight: 8, color: "#64748b" }} />
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "#374151" }}>
                          Ngày nộp:
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ ml: 1 }}>
                          {new Date(tutorApplication.submittedAt).toLocaleDateString('vi-VN')}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                        <FiUser size={16} style={{ marginRight: 8, color: "#64748b" }} />
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "#374151" }}>
                          Trạng thái:
                        </Typography>
                        <Chip
                          label={getStatusText(tutorApplication.status)}
                          size="small"
                          sx={{
                            ml: 1,
                            backgroundColor: getStatusColor(tutorApplication.status),
                            color: "white",
                            fontWeight: 600,
                          }}
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Tutor Information */}
              {tutorApplication.tutor && (
                <Card sx={{ mb: 3, backgroundColor: "#f8fafc" }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: "#1e293b" }}>
                      Thông tin gia sư
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "#374151" }}>
                          Họ tên:
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {tutorApplication.tutor.fullName}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "#374151" }}>
                          Biệt danh:
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {tutorApplication.tutor.nickName}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "#374151" }}>
                          Mô tả ngắn:
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {tutorApplication.tutor.brief}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "#374151" }}>
                          Mô tả chi tiết:
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {tutorApplication.tutor.description}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "#374151" }}>
                          Phương pháp giảng dạy:
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {tutorApplication.tutor.teachingMethod}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              )}

              {/* Application Revisions */}
              {tutorApplication.applicationRevisions && tutorApplication.applicationRevisions.length > 0 && (
                <Card sx={{ mb: 3, backgroundColor: "#f8fafc" }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: "#1e293b" }}>
                      Lịch sử xử lý
                    </Typography>
                    
                    <List>
                      {tutorApplication.applicationRevisions.map((revision, index) => (
                        <React.Fragment key={revision.id}>
                          <ListItem sx={{ px: 0 }}>
                            <ListItemText
                              primary={
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                  <Typography variant="body2" sx={{ fontWeight: 600, color: "#374151" }}>
                                    {getStatusText(revision.status)}
                                  </Typography>
                                  <Typography variant="caption" color="textSecondary">
                                    {new Date(revision.createdTime).toLocaleDateString('vi-VN')}
                                  </Typography>
                                </Box>
                              }
                              secondary={
                                <Box sx={{ mt: 1 }}>
                                  <Typography variant="body2" color="textSecondary">
                                    {revision.revisionNotes}
                                  </Typography>
                                </Box>
                              }
                            />
                          </ListItem>
                          {index < tutorApplication.applicationRevisions.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              )}

              {/* Documents */}
              {tutorApplication.documents && tutorApplication.documents.length > 0 && (
                <Card sx={{ backgroundColor: "#f8fafc" }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: "#1e293b" }}>
                      Chứng chỉ đã nộp ({tutorApplication.documents.length})
                    </Typography>
                    
                    <List>
                      {tutorApplication.documents.map((doc, index) => (
                        <React.Fragment key={doc.id}>
                          <ListItem sx={{ px: 0 }}>
                            <ListItemText
                              primary={
                                <Typography variant="body2" sx={{ fontWeight: 600, color: "#374151" }}>
                                  {doc.description}
                                </Typography>
                              }
                              secondary={
                                <Box>
                                  {doc.files && doc.files.map((file) => (
                                    <Box key={file.id} sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                                      <Box
                                        sx={{
                                          width: 32,
                                          height: 32,
                                          borderRadius: "6px",
                                          backgroundColor: file.contentType.includes("pdf") ? "#dc2626" : "#3b82f6",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          color: "white",
                                          fontWeight: 600,
                                          fontSize: "10px",
                                          mr: 2,
                                        }}
                                      >
                                        {file.contentType.includes("pdf") ? "PDF" : "IMG"}
                                      </Box>
                                      <Box sx={{ flex: 1 }}>
                                        <Typography variant="body2" color="textSecondary">
                                          {file.originalFileName}
                                        </Typography>
                                        <Typography variant="caption" color="textSecondary">
                                          {(file.fileSize / 1024 / 1024).toFixed(2)} MB
                                        </Typography>
                                      </Box>
                                      {file.cloudinaryUrl && (
                                        <IconButton
                                          size="small"
                                          onClick={() => window.open(file.cloudinaryUrl, '_blank')}
                                          sx={{ color: "#3b82f6" }}
                                        >
                                          <FiEye size={16} />
                                        </IconButton>
                                      )}
                                    </Box>
                                  ))}
                                </Box>
                              }
                            />
                          </ListItem>
                          {index < tutorApplication.documents.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              )}
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setApplicationDetailDialogOpen(false)}>
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog for Certificate Deletion */}
      <ConfirmDialog
        open={deleteCertificateDialogOpen}
        onClose={() => {
          setDeleteCertificateDialogOpen(false);
          setCertificateToDelete(null);
        }}
        onConfirm={confirmDeleteCertificate}
        title="Xác nhận xóa chứng chỉ"
        description={
          certificateToDelete
            ? `Bạn có chắc chắn muốn xóa chứng chỉ "${certificateToDelete.name}" không? Hành động này không thể hoàn tác.`
            : "Bạn có chắc chắn muốn xóa chứng chỉ này không? Hành động này không thể hoàn tác."
        }
        confirmText="Xóa"
        cancelText="Hủy"
        confirmColor="error"
      />

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

export default UserProfile;
