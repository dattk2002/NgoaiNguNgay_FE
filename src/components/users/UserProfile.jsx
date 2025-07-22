import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Skeleton } from "@mui/material";
import {
  Box,
  Container,
  Typography,
  Paper,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Grid,
  Avatar,
  Divider,
  CircularProgress,
  Alert,
  GlobalStyles,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  learnerBookingTimeSlotByTutorId,
  getAllLearnerBookingTimeSlot,
  deleteLearnerBookingTimeSlot,
  fetchUserProfileById,
  fetchUserById,
} from "../api/auth";

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

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: "12px",
  padding: "12px 24px",
  fontWeight: 600,
  fontSize: "0.95rem",
  textTransform: "none",
  transition: "all 0.3s ease",
  boxShadow: "0 4px 12px rgba(59, 130, 246, 0.2)",
  "&:hover": {
    transform: "translateY(-1px)",
    boxShadow: "0 6px 20px rgba(59, 130, 246, 0.3)",
  },
  "&:focus": {
    outline: "none",
    boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.2)",
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
      {/* Left Column Skeleton */}
      <Grid item xs={12} md={4} sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
        {/* Avatar Section Skeleton */}
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

        {/* Profile Details Skeleton */}
        <StyledPaper sx={{ width: "100%" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Skeleton variant="text" width={100} height={32} />
            <Skeleton variant="rectangular" width={120} height={40} sx={{ borderRadius: 2 }} />
          </Box>
          
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {Array.from({ length: 6 }).map((_, index) => (
              <Box
                key={index}
                sx={{
                  p: 2,
                  backgroundColor: "#f8fafc",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <Skeleton variant="text" width={80} height={20} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="90%" height={24} />
              </Box>
            ))}
            
            {/* Interest/Language chips skeleton */}
            <Box
              sx={{
                p: 2,
                backgroundColor: "#f8fafc",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
              }}
            >
              <Skeleton variant="text" width={80} height={20} sx={{ mb: 1 }} />
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
                {Array.from({ length: 3 }).map((_, idx) => (
                  <Skeleton 
                    key={idx} 
                    variant="rectangular" 
                    width={80} 
                    height={24} 
                    sx={{ borderRadius: "8px" }} 
                  />
                ))}
              </Box>
            </Box>
          </Box>
        </StyledPaper>
      </Grid>

      {/* Right Column Skeleton */}
      <Grid item xs={12} md={8} sx={{ display: "flex", flexDirection: "column", minWidth: 0, width: "100%" }}>
        <StyledPaper
          sx={{
            minHeight: "700px",
            width: "100%",
            maxWidth: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Skeleton variant="text" width={200} height={32} sx={{ mb: 3 }} />

          {/* Lesson History Section Skeleton */}
          <Box sx={{ mb: 4 }}>
            <Skeleton variant="text" width={160} height={28} sx={{ mb: 2 }} />
            <Box
              sx={{
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                backgroundColor: "#ffffff",
              }}
            >
              {/* Table Header */}
              <Box
                sx={{
                  display: "flex",
                  backgroundColor: "#f8fafc",
                  p: 2,
                  borderBottom: "1px solid #e2e8f0",
                }}
              >
                <Box sx={{ flex: "1 1 25%" }}>
                  <Skeleton variant="text" width="60%" height={20} />
                </Box>
                <Box sx={{ flex: "1 1 25%", textAlign: "center" }}>
                  <Skeleton variant="text" width="80%" height={20} sx={{ mx: "auto" }} />
                </Box>
                <Box sx={{ flex: "1 1 25%", textAlign: "center" }}>
                  <Skeleton variant="text" width="80%" height={20} sx={{ mx: "auto" }} />
                </Box>
                <Box sx={{ flex: "1 1 25%", textAlign: "center" }}>
                  <Skeleton variant="text" width="60%" height={20} sx={{ mx: "auto" }} />
                </Box>
              </Box>
              
              {/* Table Rows */}
              {Array.from({ length: 2 }).map((_, rowIdx) => (
                <Box
                  key={rowIdx}
                  sx={{
                    display: "flex",
                    p: 2,
                    borderBottom: rowIdx === 1 ? "none" : "1px solid #e2e8f0",
                  }}
                >
                  <Box sx={{ flex: "1 1 25%" }}>
                    <Skeleton variant="text" width="90%" height={20} />
                  </Box>
                  <Box sx={{ flex: "1 1 25%", textAlign: "center" }}>
                    <Skeleton variant="text" width="40%" height={20} sx={{ mx: "auto" }} />
                  </Box>
                  <Box sx={{ flex: "1 1 25%", textAlign: "center" }}>
                    <Skeleton variant="text" width="40%" height={20} sx={{ mx: "auto" }} />
                  </Box>
                  <Box sx={{ flex: "1 1 25%", textAlign: "center" }}>
                    <Skeleton variant="text" width="40%" height={20} sx={{ mx: "auto" }} />
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Teacher Reviews Section Skeleton */}
          <Box>
            <Skeleton variant="text" width={160} height={28} sx={{ mb: 2 }} />
            <Box
              sx={{
                p: 3,
                backgroundColor: "#f8fafc",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
              }}
            >
              {Array.from({ length: 2 }).map((_, reviewIdx) => (
                <Box
                  key={reviewIdx}
                  sx={{
                    borderBottom: reviewIdx === 1 ? "none" : "1px solid #e2e8f0",
                    pb: reviewIdx === 1 ? 0 : 2,
                    pt: reviewIdx === 0 ? 0 : 2,
                  }}
                >
                  <Skeleton variant="text" width={150} height={24} sx={{ mb: 1 }} />
                  <Skeleton variant="text" width="100%" height={20} sx={{ mb: 1 }} />
                  <Skeleton variant="text" width="70%" height={20} />
                </Box>
              ))}
            </Box>
          </Box>
        </StyledPaper>
      </Grid>
    </Grid>
  </Container>
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

function UserProfile({ loggedInUser, getUserById }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profileUser, setProfileUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentAvatar, setCurrentAvatar] = useState(null);
  const [avatarKey, setAvatarKey] = useState(Date.now());
  const avatarRef = useRef(null);
  const [submittedRequests, setSubmittedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

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
      } catch (error) {
        console.error("Error loading user profile:", error);
        setError(error.message || "Failed to load user profile.");
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [id, loggedInUser]);

  // Fetch submitted requests if user is pure learner and viewing own profile
  useEffect(() => {
    const fetchRequests = async () => {
      if (
        profileUser &&
        loggedInUser &&
        profileUser.id === loggedInUser.id &&
        hasOnlyLearnerRole(loggedInUser)
      ) {
        try {
          const res = await learnerBookingTimeSlotByTutorId(loggedInUser.id);
          setSubmittedRequests(res.data || []);
        } catch (e) {
          setSubmittedRequests([]);
        }
      }
    };
    fetchRequests();
  }, [profileUser, loggedInUser]);

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

  useEffect(() => {
    const fetchSentRequests = async () => {
      setLoadingRequests(true);
      try {
        const data = await getAllLearnerBookingTimeSlot();
        setSentRequests(data);
      } catch (err) {
        console.error("Error fetching sent requests:", err);
      } finally {
        setLoadingRequests(false);
      }
    };
    
    if (profileUser && loggedInUser && profileUser.id === loggedInUser.id && hasOnlyLearnerRole(loggedInUser)) {
      fetchSentRequests();
    }
  }, [profileUser, loggedInUser]);

  const handleDeleteRequest = async (tutorId) => {
    try {
      await deleteLearnerBookingTimeSlot(tutorId);
      setSentRequests((prev) => prev.filter((req) => req.tutorId !== tutorId));
    } catch (error) {
      console.error("Failed to delete booking request:", error);
      alert("Xóa yêu cầu thất bại. Vui lòng thử lại!");
    }
  };

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
            <StyledPaper
              sx={{
                textAlign: "center",
                position: "relative",
                mb: 3,
                width: "100%",
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  pb: 2,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Box
                  sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <LargeAvatar
                    ref={avatarRef}
                    key={avatarKey}
                    src={
                      currentAvatar ||
                      profileUser?.profileImageUrl ||
                      "https://avatar.iran.liara.run/public"
                    }
                    alt="Ảnh đại diện"
                    onError={(e) => {
                      console.error("Error loading profile image:", e);
                      e.target.src = "https://avatar.iran.liara.run/public";
                    }}
                  >
                    {profileUser.fullName
                      ? profileUser.fullName.charAt(0).toUpperCase()
                      : "N"}
                  </LargeAvatar>
                </Box>

                <Typography
                  variant="h4"
                  sx={{
                    mt: 2,
                    fontWeight: 700,
                    color: "#1e293b",
                    width: "100%",
                    textAlign: "center",
                  }}
                >
                  {profileUser.fullName || profileUser.name || "Người dùng"}
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    mt: 1,
                    color: "#64748b",
                    width: "100%",
                    textAlign: "center",
                  }}
                >
                </Typography>

              </Box>
            </StyledPaper>

            {/* Profile Details Section */}
            <StyledPaper sx={{ width: "100%" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <SectionTitle variant="h6">Hồ sơ</SectionTitle>
                {shouldShowEditButton && (
                  <Button
                    variant="contained"
                    onClick={handleEditClick}
                    sx={{
                      backgroundColor: "#f3f4f6", // gray-100
                      color: "#374151", // gray-700
                      "&:hover": {
                        backgroundColor: "#e5e7eb", // gray-200
                      },
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      minWidth: "120px",
                      height: "40px",
                      textTransform: "none",
                      boxShadow: "none",
                    }}
                  >
                    Chỉnh sửa hồ sơ
                  </Button>
                )}
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <InfoBox>
                  <InfoLabel>Email</InfoLabel>
                  <InfoValue>{profileUser.email || "Chưa cập nhật"}</InfoValue>
                </InfoBox>

                <InfoBox>
                  <InfoLabel>Số điện thoại</InfoLabel>
                  <InfoValue>{profileUser.phoneNumber || "Chưa cập nhật"}</InfoValue>
                </InfoBox>

                <InfoBox>
                  <InfoLabel>Ngày sinh</InfoLabel>
                  <InfoValue>
                    {profileUser.dateOfBirth 
                      ? new Date(profileUser.dateOfBirth).toLocaleDateString('vi-VN')
                      : "Chưa cập nhật"}
                  </InfoValue>
                </InfoBox>

                <InfoBox>
                  <InfoLabel>Giới tính</InfoLabel>
                  <InfoValue>{formatGender(profileUser.gender) || "Chưa cập nhật"}</InfoValue>
                </InfoBox>

                <InfoBox>
                  <InfoLabel>Múi giờ</InfoLabel>
                  <InfoValue>{formatTimezone(profileUser.timezone)}</InfoValue>
                </InfoBox>

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

          {/* Right Column - Lesson Feedback */}
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
              }}
            >
              <SectionTitle variant="h6">Phản hồi buổi học</SectionTitle>

              {/* Lesson History */}
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: "#374151",
                    mb: 2,
                  }}
                >
                  Lịch sử buổi học
                </Typography>
                <TableContainer 
                  component={Paper}
                  sx={{ 
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                  }}
                >
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                        <TableCell></TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600, color: "#374151" }}>
                          Tháng trước
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600, color: "#374151" }}>
                          3 tháng gần nhất
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600, color: "#374151" }}>
                          Mọi lúc
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, color: "#1f2937" }}>
                          Số buổi đã hoàn thành
                        </TableCell>
                        <TableCell align="center" sx={{ color: "#6b7280" }}>
                          {profileUser.lessonStats?.completedLastMonth || 0}
                        </TableCell>
                        <TableCell align="center" sx={{ color: "#6b7280" }}>
                          {profileUser.lessonStats?.completedLast3Months || 0}
                        </TableCell>
                        <TableCell align="center" sx={{ color: "#6b7280" }}>
                          {profileUser.lessonStats?.completedAllTime || 0}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, color: "#1f2937" }}>
                          Tỷ lệ tham gia
                        </TableCell>
                        <TableCell align="center" sx={{ color: "#6b7280" }}>
                          {profileUser.lessonStats?.attendanceLastMonth || "N/A"}%
                        </TableCell>
                        <TableCell align="center" sx={{ color: "#6b7280" }}>
                          {profileUser.lessonStats?.attendanceLast3Months || "N/A"}%
                        </TableCell>
                        <TableCell align="center" sx={{ color: "#6b7280" }}>
                          {profileUser.lessonStats?.attendanceAllTime || "N/A"}%
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              {/* Teacher Reviews */}
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: "#374151",
                    mb: 2,
                  }}
                >
                  Đánh giá giáo viên
                </Typography>
                <Box
                  sx={{
                    p: 3,
                    backgroundColor: "#f8fafc",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  {profileUser.teacherReviews && profileUser.teacherReviews.length > 0 ? (
                    <Box>
                      {profileUser.teacherReviews.map((review, index) => (
                        <Box
                          key={index}
                          sx={{
                            borderBottom: index < profileUser.teacherReviews.length - 1 ? "1px solid #e2e8f0" : "none",
                            pb: index < profileUser.teacherReviews.length - 1 ? 2 : 0,
                            pt: index > 0 ? 2 : 0,
                          }}
                        >
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight: 600,
                              color: "#1f2937",
                              mb: 1,
                            }}
                          >
                            {review.reviewerName}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: "#4b5563",
                              lineHeight: 1.6,
                            }}
                          >
                            {review.comment}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#6b7280",
                        fontStyle: "italic",
                        textAlign: "center",
                      }}
                    >
                      Chưa có bản ghi nào
                    </Typography>
                  )}
                </Box>
              </Box>
            </StyledPaper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

export default UserProfile;

