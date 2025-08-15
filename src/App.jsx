import { useState, useEffect, useCallback } from "react";
import './utils/notFocusOutline.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Header from "./components/Header";
import FooterHandler from "./components/FooterHandler";
import HomePage from "./pages/HomePage";
import RecommendTutorList from "./components/tutors/RecommendTutorList";
import TutorDetail from "./components/tutors/TutorDetail";
import LoginModal from "./components/modals/LoginModal";
import SignUpModal from "./components/modals/SignUpModal";
import TutorLanguageList from "./components/tutors/TutorLanguageList";
import MessagePage from "./pages/MessageListPage";
import BecomeATutorPage from "./pages/BecomeATutorPage";
import BecomeATutorLandingPage from "./pages/BecomeATutorLandingPage";
import ConfirmEmail from "./components/modals/ConfirmEmail";
import TutorProfile from "./components/tutors/TutorProfile";
// import { fetchUsers } from "./components/api/auth";
import UpdateInformationModal from "./components/modals/UpdateInformationModal";
import UserProfile from "./components/users/UserProfile";
import EditUserProfile from "./components/users/EditUserProfile"; // Import the new component
import MyBookingPage from "./pages/MyBookingPage"; // Import at the top
import WalletPage from "./pages/WalletPage"; // Import WalletPage
import HowItWork from "./components/HowItWork";
import TutorManagementPage from "./pages/TutorManagementPage"; // Import TutorManagementPage
import ChangePasswordPage from "./pages/ChangePasswordPage";
import ForgotPasswordModal from "./components/modals/ForgotPasswordModal";

// Import the tutor API functions
import {
  login,
  register,
  confirmEmail,
  forgotPassword,
  resetPassword,
  changePassword,
  refreshToken,
  logout,
  getStoredUser,
  getAccessToken,
  getRefreshToken,
  fetchTutors,
  fetchTutorById,
  fetchTutorsBySubject,
  fetchTutorList,
  isUserAuthenticated,
  editUserProfile,
  fetchUserById,
  fetchUserProfileById,
  uploadProfileImage,
  deleteProfileImage,
  fetchTutorRegisterProfile,
  fetchAllHashtags,
  registerAsTutor,
  fetchTutorDetail,
  fetchAllTutor,
  fetchRecommendTutor,
  fetchChatConversationsByUserId,
  fetchConversationList,
  fetchTutorLesson,
  fetchTutorLessonDetailById,
  createLesson,
  updateLesson,
  deleteLesson,
  fetchTutorWeeklyPattern,
  editTutorWeeklyPattern,
  deleteTutorWeeklyPattern,
  fetchTutorWeekSchedule,
  tutorBookingTimeSlotFromLearner,
  tutorBookingTimeSlotFromLearnerDetail,
  getAllLearnerBookingTimeSlot,
  learnerBookingTimeSlotByTutorId,
  updateLearnerBookingTimeSlot,
  deleteLearnerBookingTimeSlot,
  createTutorBookingOffer,
  tutorBookingOfferDetail,
  getAllTutorBookingOffer,
  updateTutorBookingOfferByOfferId,
  deleteTutorBookingOfferByOfferId,
  getAllLearnerBookingOffer,
  learnerBookingOfferDetail,
  acceptLearnerBookingOffer,
  rejectLearnerBookingOffer,
  requestTutorVerification,
  uploadCertificate,
  fetchPendingApplications,
  fetchDocumentsByTutorId,
  deleteDocument,
  fetchTutorApplicationById,
  fetchTutorApplicationByApplicationId,
  reviewTutorApplication,
  createDepositRequest,
  fetchWalletInfo,
  fetchWalletTransactions,
  fetchDepositHistory,
  fetchLearnerBookings,
  fetchBookingDetail,
  getNotification,
  getSenderProfile,
  loginGoogleToFirebase,
  getBookingRating,
  submitBookingRating,
  createBankAccount,
  deleteBankAccount,
  fetchBankAccounts,
  fetchWithdrawalRequests,
  createWithdrawalRequest,
  completeBookedSlot,
  fetchTutorBookings,
  processWithdrawal,
  rejectWithdrawal,
  fetchTutorRating,
} from "./components/api/auth";

// Import the NotFoundPage component
import NotFoundPage from "./pages/NotFoundPage"; // Adjust the path if necessary
import StaffDashboardPage from "./pages/StaffDashboardPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import ManagerDashboardPage from "./pages/ManagerDashboardPage";
import ProtectedRoute, { AdminRoute, StaffRoute, ManagerRoute, BlockedRoute, TutorRoute } from "./components/rbac/ProtectedRoute";
import RoleBasedRedirect from "./components/rbac/RoleBasedRedirect";
import RoleBasedRouteGuard from "./components/rbac/RoleBasedRouteGuard";
import { NotificationProvider, useNotification } from "./contexts/NotificationContext";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

// New component to handle scrolling to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // "document.documentElement.scrollTo" is the modern compatible way to approach scrolling.
    document.documentElement.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth", // Optional: adds smooth scrolling animation
    });
  }, [pathname]); // Scroll to top whenever the pathname changes

  return null; // This component doesn't render anything
}

const USER_STORAGE_KEY = "loggedInUser";
const REMEMBERED_ACCOUNTS_KEY = "rememberedAccounts";
const ACCOUNTS_STORAGE_KEY = "accounts";

// Utility function to delete all cookies
function deleteAllCookies() {
  const cookies = document.cookie.split("; ");
  for (const cookie of cookies) {
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
  }
}

// Component to handle conditional layout
function AppContent({
  user,
  isLoginModalOpen,
  isSignUpModalOpen,
  isConfirmEmailModalOpen,
  confirmEmail,
  isUpdateInfoModalOpen,
  loginPromptMessage,
  handleLogout,
  openLoginModal,
  openSignUpModal,
  closeLoginModal,
  closeSignUpModal,
  handleLogin,
  switchToSignup,
  switchToLogin,
  handleSignUpSuccess,
  handleConfirmEmailSuccess,
  handleUpdateInfoSubmit,
  getUserById,
  triggerRoleRedirect,
  setTriggerRoleRedirect,
  isForgotPasswordModalOpen,
  setIsForgotPasswordModalOpen,
  handleBackToLogin,
  shouldAutoOpenLogin,
  setShouldAutoOpenLogin,
  setIsConfirmEmailModalOpen, // Add this prop
}) {
  const location = useLocation();
  const isStaffRoute = location.pathname.startsWith('/staff');
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isManagerRoute = location.pathname.startsWith('/manager');

  const [firstTutorId, setFirstTutorId] = useState(null);

  // Effect to handle auto-opening login modal after logout from change password page
  useEffect(() => {
    if (shouldAutoOpenLogin && !user) {
      openLoginModal("Vui lòng đăng nhập để tiếp tục.");
      setShouldAutoOpenLogin(false);
    }
  }, [shouldAutoOpenLogin, user, openLoginModal]);

  useEffect(() => {
    const fetchMostRecentTutorId = async () => {
      if (user && user.id) {
        try {
          const conversations = await fetchChatConversationsByUserId(user.id);
          const sorted = conversations
            .filter(conv => conv.type === "tutor")
            .sort((a, b) => b.actualTimestamp - a.actualTimestamp);
          if (sorted.length > 0) {
            setFirstTutorId(sorted[0].participantId);
          } else {
            setFirstTutorId(null);
          }
        } catch (err) {
          setFirstTutorId(null);
        }
      }
    };
    fetchMostRecentTutorId();
  }, [user]);

  return (
    <div className={(isStaffRoute || isAdminRoute || isManagerRoute) ? "" : "min-h-screen flex flex-col bg-gray-100"}>
      {!(isStaffRoute || isAdminRoute || isManagerRoute) && (
        <Header
          user={user}
          onLogout={handleLogout}
          onLoginClick={() => openLoginModal()}
          onSignUpClick={openSignUpModal}
          firstTutorId={firstTutorId}
        />
      )}

      <main className={(isStaffRoute || isAdminRoute || isManagerRoute) ? "" : "flex-1 py-8"}>
        <RoleBasedRedirect
          user={user}
          triggerRedirect={triggerRoleRedirect}
          onRedirectComplete={() => setTriggerRoleRedirect(false)}
        />
        <RoleBasedRouteGuard user={user} />
        <Routes>
          <Route path="/" element={
            <BlockedRoute user={user} blockedRoles={['admin', 'Admin', 'staff', 'Staff', 'manager', 'Manager']}>
              <HomePage user={user} onRequireLogin={openLoginModal} />
            </BlockedRoute>
          } />
          <Route
            path="/languages"
            element={
              <BlockedRoute user={user} blockedRoles={['admin', 'Admin', 'staff', 'Staff', 'manager', 'Manager']}>
                <RecommendTutorList user={user} onRequireLogin={openLoginModal} />
              </BlockedRoute>
            }
          />
          <Route
            path="/teacher/:id"
            element={
              <BlockedRoute user={user} blockedRoles={['admin', 'Admin', 'staff', 'Staff', 'manager', 'Manager']}>
                <TutorDetail
                  user={user}
                  onRequireLogin={openLoginModal}
                />
              </BlockedRoute>
            }
          />
          <Route
            path="/tutor-profile/:id"
            element={
              <BlockedRoute user={user} blockedRoles={['admin', 'Admin', 'staff', 'Staff', 'manager', 'Manager']}>
                <TutorRoute user={user}>
                  <TutorProfile
                    user={user}
                    onRequireLogin={openLoginModal}
                    fetchTutorDetail={fetchTutorDetail}
                    requestTutorVerification={requestTutorVerification}
                    uploadCertificate={uploadCertificate}
                  />
                </TutorRoute>
              </BlockedRoute>
            }
          />
          <Route
            path="/tutor"
            element={
              <BlockedRoute user={user} blockedRoles={['admin', 'Admin', 'staff', 'Staff', 'manager', 'Manager']}>
                <TutorLanguageList />
              </BlockedRoute>
            }
          />
          <Route
            path="/tutor/:subject"
            element={
              <BlockedRoute user={user} blockedRoles={['admin', 'Admin', 'staff', 'Staff', 'manager', 'Manager']}>
                <TutorLanguageList />
              </BlockedRoute>
            }
          />
          <Route
            path="/become-tutor"
            element={
              <BlockedRoute user={user} blockedRoles={['admin', 'Admin', 'staff', 'Staff', 'manager', 'Manager']}>
                <BecomeATutorLandingPage />
              </BlockedRoute>
            }
          />
          <Route
            path="/become-tutor/register"
            element={
              <BlockedRoute user={user} blockedRoles={['admin', 'Admin', 'staff', 'Staff', 'manager', 'Manager']}>
                <BecomeATutorPage
                  user={user}
                  onRequireLogin={openLoginModal}
                  fetchProfileData={fetchTutorRegisterProfile}
                  fetchHashtags={fetchAllHashtags}
                  uploadProfileImage={uploadProfileImage}
                  deleteProfileImage={deleteProfileImage}
                  registerAsTutor={registerAsTutor}
                />
              </BlockedRoute>
            }
          />

          {/* NEW ROUTE for Messaging */}
          <Route
            path="/message/:id"
            element={
              <BlockedRoute user={user} blockedRoles={['admin', 'Admin', 'staff', 'Staff', 'manager', 'Manager']}>
                <ProtectedRoute user={user} requireAuth={true} redirectTo="/">
                  <MessagePage user={user} />
                </ProtectedRoute>
              </BlockedRoute>
            }
          />
          {/* Route for viewing a user profile */}
          <Route
            path="/user/:id"
            element={
              <BlockedRoute user={user} blockedRoles={['admin', 'Admin', 'staff', 'Staff', 'manager', 'Manager']}>
                <ProtectedRoute user={user} requireAuth={true} redirectTo="/">
                  <UserProfile 
                    loggedInUser={user} 
                    getUserById={getUserById}
                    requestTutorVerification={requestTutorVerification}
                    uploadCertificate={uploadCertificate}
                    fetchTutorDetail={fetchTutorDetail}
                    fetchTutorApplicationByApplicationId={fetchTutorApplicationByApplicationId}
                  />
                </ProtectedRoute>
              </BlockedRoute>
            }
          />
          {/* NEW ROUTE for editing a user profile */}
          <Route
            path="/user/edit/:id"
            element={
              <BlockedRoute user={user} blockedRoles={['admin', 'Admin', 'staff', 'Staff', 'manager', 'Manager']}>
                <ProtectedRoute user={user} requireAuth={true} redirectTo="/">
                  <EditUserProfile loggedInUser={user} />
                </ProtectedRoute>
              </BlockedRoute>
            }
          />

          {/* NEW ROUTE for Tutor Management */}
          <Route
            path="/tutor-management"
            element={
              <BlockedRoute user={user} blockedRoles={['admin', 'Admin', 'staff', 'Staff', 'manager', 'Manager']}>
                <TutorRoute user={user}>
                  <TutorManagementPage user={user} />
                </TutorRoute>
              </BlockedRoute>
            }
          />

          {/* Staff Dashboard Route */}
          <Route
            path="/staff"
            element={
              <StaffRoute user={user}>
                <StaffDashboardPage />
              </StaffRoute>
            }
          />

          {/* Admin Dashboard Route */}
          <Route
            path="/admin"
            element={
              <AdminRoute user={user}>
                <AdminDashboardPage />
              </AdminRoute>
            }
          />

          {/* Manager Dashboard Route */}
          <Route
            path="/manager"
            element={
              <ManagerRoute user={user}>
                <ManagerDashboardPage />
              </ManagerRoute>
            }
          />

          {/* NEW ROUTE for My Bookings */}
          <Route
            path="/my-bookings/:id"
            element={
              <ProtectedRoute user={user} requireAuth={true} redirectTo="/">
                <MyBookingPage user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute user={user} requireAuth={true} redirectTo="/">
                <MyBookingPage user={user} />
              </ProtectedRoute>
            }
          />

          {/* NEW ROUTE for Wallet */}
          <Route
            path="/wallet"
            element={
              <ProtectedRoute user={user} requireAuth={true} redirectTo="/">
                <WalletPage user={user} />
              </ProtectedRoute>
            }
          />

          {/* ROUTE for Payment Return */}
          <Route
            path="/payment-return"
            element={
              <ProtectedRoute user={user} requireAuth={true} redirectTo="/">
                <WalletPage user={user} showPaymentReturn={true} />
              </ProtectedRoute>
            }
          />

          {/* NEW ROUTE for How It Works */}
          <Route
            path="/how-it-works"
            element={
              <BlockedRoute user={user} blockedRoles={['admin', 'Admin', 'staff', 'Staff', 'manager', 'Manager']}>
                <HowItWork />
              </BlockedRoute>
            }
          />

          {/* NEW ROUTE for Change Password */}
          <Route
            path="/change-password"
            element={
              <ProtectedRoute user={user} requireAuth={true} redirectTo="/">
                <ChangePasswordPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/change-password/:userId"
            element={
              <ProtectedRoute user={user} requireAuth={true} redirectTo="/">
                <ChangePasswordPage />
              </ProtectedRoute>
            }
          />

          {/* This route catches all other paths and renders the NotFoundPage */}
          <Route path="*" element={<NotFoundPage />} />

        </Routes>
      </main>

      {!(isStaffRoute || isAdminRoute || isManagerRoute) && <FooterHandler />}

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={closeLoginModal}
        onLogin={handleLogin}
        onSwitchToSignup={switchToSignup}
        promptMessage={loginPromptMessage}
        onForgotPassword={() => {
          closeLoginModal();
          setIsForgotPasswordModalOpen(true);
        }}
      />
      <SignUpModal
        isOpen={isSignUpModalOpen}
        onClose={closeSignUpModal}
        onSignUpSuccess={handleSignUpSuccess}
        onSwitchToLogin={switchToLogin}
      />
      <ConfirmEmail
        isOpen={isConfirmEmailModalOpen}
        onClose={() => setIsConfirmEmailModalOpen(false)}
        email={confirmEmail}
        onConfirmSuccess={handleConfirmEmailSuccess}
      />
      <UpdateInformationModal
        isOpen={isUpdateInfoModalOpen}
        onClose={() => setIsUpdateInfoModalOpen(false)}
        onSubmit={handleUpdateInfoSubmit}
        user={user}
      />
      <ForgotPasswordModal
        isOpen={isForgotPasswordModalOpen}
        onClose={() => setIsForgotPasswordModalOpen(false)}
        onBackToLogin={handleBackToLogin}
      />
      {/* Remove the Snackbar from here */}
    </div>
  );
}

// AppWithNotifications component that uses the notification context
function AppWithNotifications() {
  const [user, setUser] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  const [isConfirmEmailModalOpen, setIsConfirmEmailModalOpen] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [loginPromptMessage, setLoginPromptMessage] = useState("");
  const [isUpdateInfoModalOpen, setIsUpdateInfoModalOpen] = useState(false);
  const [loginModalCallbacks, setLoginModalCallbacks] = useState({
    onLoginSuccess: null,
    onCloseWithoutLogin: null,
  });
  const [firstTutorId, setFirstTutorId] = useState(null);
  const [triggerRoleRedirect, setTriggerRoleRedirect] = useState(false);
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);
  
  // Add the missing shouldAutoOpenLogin state
  const [shouldAutoOpenLogin, setShouldAutoOpenLogin] = useState(false);

  // Add notification state here
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarContent, setSnackbarContent] = useState(null);

  // Use the notification context at the top level
  const { notification, connected, error, connectionState, connectionStateName } = useNotification();

  // Debug: Log connection status with state details
  useEffect(() => {
    console.log("🔗 Notification Hub Connection Status:", {
      connected,
      connectionState,
      connectionStateName,
      error,
      userId: user?.id,
      userRoles: user?.roles
    });
  }, [connected, connectionState, connectionStateName, error, user]);

  // Handle notifications globally with detailed debugging
  useEffect(() => {
    console.log("📨 App.jsx - Notification Effect Triggered:", {
      hasNotification: !!notification,
      notificationData: notification,
      hasUser: !!user,
      userId: user?.id,
      userRoles: user?.roles
    });

    if (notification && user && user.id) {
      console.log("✅ App.jsx - Processing Notification:", {
        notificationId: notification.id,
        title: notification.title,
        content: notification.content,
        priority: notification.notificationPriority,
        isRead: notification.isRead,
        createdAt: notification.createdAt,
        additionalData: notification.additionalData
      });
      
      // Parse the notification data based on the API structure
      let displayTitle = notification.title || "Thông báo mới";
      let displayContent = notification.content || "";
      let priority = "Normal";

      // Handle different notification types based on title
      if (notification.title === "PUSH_ON_LEARNER_ACCEPT_OFFER") {
        try {
          const additionalData = notification.additionalData ? JSON.parse(notification.additionalData) : {};
          displayTitle = "Học viên đã chấp nhận đề nghị";
          displayContent = `Học viên đã chấp nhận đề nghị cho bài học "${additionalData.LessonName || 'không xác định'}"`;
          priority = "Success";
        } catch (error) {
          console.error("Error parsing PUSH_ON_LEARNER_ACCEPT_OFFER data:", error);
          displayTitle = "Học viên đã chấp nhận đề nghị";
          displayContent = "Học viên đã chấp nhận đề nghị của bạn";
          priority = "Success";
        }
      } else if (notification.title === "PUSH_ON_TUTOR_RECEIVED_TIME_SLOT_REQUEST") {
        try {
          const additionalData = notification.additionalData ? JSON.parse(notification.additionalData) : {};
          displayTitle = "Yêu cầu đặt lịch mới";
          displayContent = `Bạn có yêu cầu đặt lịch mới cho bài học. Ngày bắt đầu dự kiến: ${new Date(additionalData.ExpectedStartDate).toLocaleDateString('vi-VN')}`;
          priority = "Info";
        } catch (error) {
          console.error("Error parsing PUSH_ON_TUTOR_RECEIVED_TIME_SLOT_REQUEST data:", error);
          displayTitle = "Yêu cầu đặt lịch mới";
          displayContent = "Bạn có yêu cầu đặt lịch mới";
          priority = "Info";
        }
      } else if (notification.title === "Bạn có 1 yêu cầu đặt lịch mới") {
        displayTitle = notification.title;
        displayContent = notification.content;
        priority = "Warning";
      } else {
        // Handle other notification types
        displayTitle = notification.title;
        displayContent = notification.content;
        
        // Set priority based on notificationPriority
        switch (notification.notificationPriority) {
          case 1:
            priority = "Critical";
            break;
          case 2:
            priority = "Warning";
            break;
          case 3:
            priority = "Info";
            break;
          default:
            priority = "Normal";
        }
      }
      
      setSnackbarContent({
        title: displayTitle,
        body: displayContent,
        priority: priority,
        id: notification.id,
        additionalData: notification.additionalData,
        createdAt: notification.createdAt
      });
      
      console.log("🎯 App.jsx - Setting Snackbar Content:", {
        title: displayTitle,
        body: displayContent,
        priority: priority,
        originalTitle: notification.title,
        originalContent: notification.content
      });
      
      setSnackbarOpen(true);
      console.log(" App.jsx - Snackbar Opened");
    } else {
      console.log("❌ App.jsx - Notification Conditions Not Met:", {
        hasNotification: !!notification,
        hasUser: !!user,
        hasUserId: !!(user && user.id)
      });
    }
  }, [notification, user]);

  // Debug: Log snackbar state changes
  useEffect(() => {
    console.log("🍿 Snackbar State Changed:", {
      isOpen: snackbarOpen,
      content: snackbarContent
    });
  }, [snackbarOpen, snackbarContent]);

  console.log("User state in App.jsx:", user);

  useEffect(() => {
    setIsLoadingAuth(true);
    // Try to get user from both keys for backward compatibility
    let storedUser = localStorage.getItem(USER_STORAGE_KEY) || localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setIsLoadingAuth(false);
      const hasUpdatedProfile = localStorage.getItem("hasUpdatedProfile");
      if (!hasUpdatedProfile) {
        // setIsUpdateInfoModalOpen(true);
      }
      return;
    }

    const remembered = JSON.parse(
      localStorage.getItem(REMEMBERED_ACCOUNTS_KEY) || "[]"
    );
    const now = Date.now();
    const validRemembered = remembered.filter((acc) => acc.expires > now);
    localStorage.setItem(
      REMEMBERED_ACCOUNTS_KEY,
      JSON.stringify(validRemembered)
    );

    if (validRemembered.length > 0) {
      const accountToLogin = validRemembered[validRemembered.length - 1];
      const allAccounts = JSON.parse(
        localStorage.getItem(ACCOUNTS_STORAGE_KEY) || "[]"
      );
      const matchedAccount = allAccounts.find(
        (acc) => acc.phone === accountToLogin.phone
      );

      if (matchedAccount) {
        const userData = {
          id: matchedAccount.id || Date.now().toString(),
          name: matchedAccount.name,
          email: matchedAccount.email,
          phone: matchedAccount.phone,
          // Include other relevant user data from storage here
          fullName: matchedAccount.fullName || '',
          dateOfBirth: matchedAccount.dateOfBirth || '',
          gender: matchedAccount.gender || '',
          bio: matchedAccount.bio || '',
          learningLanguages: matchedAccount.learningLanguages || [],
        };
        setUser(userData);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
      }
    }
    setIsLoadingAuth(false);
  }, []);

  useEffect(() => {
    // Handle avatar update events to update the global user state
    const handleAvatarUpdate = (event) => {
      console.log("Avatar update event received in App:", event.detail);

      if (event.detail && event.detail.profileImageUrl && user) {
        // Update user state with the new avatar URL
        const updatedUser = {
          ...user,
          profileImageUrl: event.detail.profileImageUrl
        };

        // Update state and localStorage
        setUser(updatedUser);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
        console.log("User state updated with new avatar in App component");

        // Update document title with a small change to trigger browser reactions
        const currentTitle = document.title;
        document.title = "Avatar Updated";
        setTimeout(() => {
          document.title = currentTitle;
        }, 100);
      }
    };

    // Listen for avatar-updated events
    window.addEventListener('avatar-updated', handleAvatarUpdate);

    // Listen for storage events (for cross-tab updates)
    const handleStorageChange = () => {
      try {
        const storedUser = localStorage.getItem(USER_STORAGE_KEY);
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser && parsedUser.profileImageUrl !== user?.profileImageUrl) {
            setUser(parsedUser);
          }
        }
      } catch (error) {
        console.error("Error handling storage event in App:", error);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Clean up event listeners on component unmount
    return () => {
      window.removeEventListener('avatar-updated', handleAvatarUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user]); // Dependency is user to re-attach when user changes

  useEffect(() => {
    const fetchMostRecentTutorId = async () => {
      if (user && user.id) {
        try {
          const conversations = await fetchChatConversationsByUserId(user.id);
          // Only consider tutor conversations, sort by most recent
          const sorted = conversations
            .filter(conv => conv.type === "tutor")
            .sort((a, b) => b.actualTimestamp - a.actualTimestamp);
          if (sorted.length > 0) {
            setFirstTutorId(sorted[0].participantId);
          } else {
            setFirstTutorId(null);
          }
        } catch (err) {
          setFirstTutorId(null);
        }
      }
    };
    fetchMostRecentTutorId();
  }, [user]);

  const openLoginModal = useCallback((message = "", onLoginSuccess = null, onCloseWithoutLogin = null) => {
    setLoginPromptMessage(message);
    setLoginModalCallbacks({ onLoginSuccess, onCloseWithoutLogin }); // Store callbacks
    setIsLoginModalOpen(true);
  }, []);

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
    setLoginPromptMessage("");
    // If the user didn't log in (user state is still null), execute the onCloseWithoutLogin callback
    if (!user && loginModalCallbacks.onCloseWithoutLogin) {
      loginModalCallbacks.onCloseWithoutLogin();
    }
    // Clear callbacks after potential execution
    setLoginModalCallbacks({ onLoginSuccess: null, onCloseWithoutLogin: null });
  };

  const openSignUpModal = () => setIsSignUpModalOpen(true);
  const closeSignUpModal = () => setIsSignUpModalOpen(false);

  const handleLogin = async (userData) => {
    const fullUserData = {
      id: userData.id || Date.now().toString(),
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      // Include all other relevant user data here
      fullName: userData.fullName || '',
      dateOfBirth: userData.dateOfBirth || '',
      gender: userData.gender || '',
      bio: userData.bio || '',
      profileImageUrl: userData.profileImageUrl || '',
      roles: userData.roles || [], // Make sure roles are included
    };

    setUser(fullUserData);
    // Store in both keys to ensure consistency
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(fullUserData));
    localStorage.setItem("user", JSON.stringify(fullUserData));

    // Trigger role-based redirect for dashboard roles
    setTriggerRoleRedirect(true);

    // Execute the success callback BEFORE closing the modal and clearing callbacks
    if (loginModalCallbacks.onLoginSuccess) {
      loginModalCallbacks.onLoginSuccess();
    }
    closeLoginModal(); // This will also clear the callbacks via setLoginModalCallbacks
  };

  const handleLogout = () => {
    const currentPath = window.location.pathname;
    
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem("user");
    localStorage.removeItem("hasUpdatedProfile");
    sessionStorage.clear();
    deleteAllCookies();
    setTriggerRoleRedirect(false);
    
    // If user was on change password page, redirect to home and open login modal
    if (currentPath.startsWith('/change-password')) {
      setShouldAutoOpenLogin(true);
    }
  };

  const switchToSignup = () => {
    closeLoginModal();
    openSignUpModal();
  };

  const switchToLogin = () => {
    closeSignUpModal();
    openLoginModal();
  };

  const handleSignUpSuccess = (email) => {
    setConfirmEmail(email);
    setIsConfirmEmailModalOpen(true);
  };

  const handleConfirmEmailSuccess = () => {
    setIsConfirmEmailModalOpen(false);
    openLoginModal("Your email has been confirmed. Please log in.");
  };

  // Keep handleUpdateInfoSubmit if you still use the UpdateInformationModal for initial profile setup
  const handleUpdateInfoSubmit = (info) => {
    const updatedUser = {
      ...user,
      fullName: info.fullName,
      dateOfBirth: info.dateOfBirth,
      gender: info.gender,
      // You might want to update other fields here too
    };
    setUser(updatedUser);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
    localStorage.setItem("hasUpdatedProfile", "true");
    setIsUpdateInfoModalOpen(false);
  };

  // Function to update user state after editing (used by EditUserProfile)
  const handleProfileUpdate = (updatedUserData) => {
    setUser(updatedUserData);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUserData));
  };


  const getUserById = async (userId) => {
    try {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }
      const userData = await response.json();
      return userData;
    } catch (error) {
      console.error("Error fetching user by ID:", error);
      return null;
    }
  };

  const handleBackToLogin = () => {
    setIsForgotPasswordModalOpen(false);
    openLoginModal();
  };

  if (isLoadingAuth) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <ScrollToTop />
      <AppContent
        user={user}
        isLoginModalOpen={isLoginModalOpen}
        isSignUpModalOpen={isSignUpModalOpen}
        isConfirmEmailModalOpen={isConfirmEmailModalOpen}
        confirmEmail={confirmEmail}
        isUpdateInfoModalOpen={isUpdateInfoModalOpen}
        loginPromptMessage={loginPromptMessage}
        handleLogout={handleLogout}
        openLoginModal={openLoginModal}
        openSignUpModal={openSignUpModal}
        closeLoginModal={closeLoginModal}
        closeSignUpModal={closeSignUpModal}
        handleLogin={handleLogin}
        switchToSignup={switchToSignup}
        switchToLogin={switchToLogin}
        handleSignUpSuccess={handleSignUpSuccess}
        handleConfirmEmailSuccess={handleConfirmEmailSuccess}
        handleUpdateInfoSubmit={handleUpdateInfoSubmit}
        getUserById={getUserById}
        triggerRoleRedirect={triggerRoleRedirect}
        setTriggerRoleRedirect={setTriggerRoleRedirect}
        isForgotPasswordModalOpen={isForgotPasswordModalOpen}
        setIsForgotPasswordModalOpen={setIsForgotPasswordModalOpen}
        handleBackToLogin={handleBackToLogin}
        shouldAutoOpenLogin={shouldAutoOpenLogin}
        setShouldAutoOpenLogin={setShouldAutoOpenLogin}
        setIsConfirmEmailModalOpen={setIsConfirmEmailModalOpen} // Add this prop
      />
      
      {/* Global Snackbar with enhanced content */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => {
          console.log("🔒 Snackbar Closed by User");
          setSnackbarOpen(false);
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        sx={{
          zIndex: 9999,
        }}
      >
        <MuiAlert
          onClose={() => {
            console.log("🔒 Snackbar Alert Closed");
            setSnackbarOpen(false);
          }}
          severity={
            snackbarContent?.priority === "Critical" ? "error" :
            snackbarContent?.priority === "Warning" ? "warning" :
            snackbarContent?.priority === "Success" ? "success" :
            "info"
          }
          sx={{ 
            width: "100%", 
            alignItems: "flex-start",
            backgroundColor: 
              snackbarContent?.priority === "Critical" ? "#f44336" :
              snackbarContent?.priority === "Warning" ? "#ff9800" :
              snackbarContent?.priority === "Success" ? "#4caf50" :
              "#2196f3",
            color: "white",
            "& .MuiAlert-message": {
              color: "white"
            }
          }}
          icon={false}
        >
          <div style={{ fontWeight: 600, color: "white", marginBottom: "4px" }}>
            {snackbarContent?.title}
          </div>
          <div style={{ color: "white", fontSize: "14px", lineHeight: "1.4" }}>
            {snackbarContent?.body}
          </div>
          {snackbarContent?.createdAt && (
            <div style={{ 
              color: "rgba(255, 255, 255, 0.8)", 
              fontSize: "12px", 
              marginTop: "4px",
              fontStyle: "italic"
            }}>
              {new Date(snackbarContent.createdAt).toLocaleString('vi-VN')}
            </div>
          )}
        </MuiAlert>
      </Snackbar>
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{ zIndex: 99999 }}
        toastStyle={{
          backgroundColor: '#28a745',
          color: 'white',
        }}
        bodyStyle={{
          color: 'white',
          fontSize: '14px',
          fontWeight: '400',
        }}
        closeButton={{
          style: {
            color: 'white',
          },
        }}
        progressStyle={{
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
        }}
      />
    </Router>
  );
}

// Main App component wrapped with NotificationProvider
function App() {
  return (
    <NotificationProvider>
      <AppWithNotifications />
    </NotificationProvider>
  );
}

export default App;