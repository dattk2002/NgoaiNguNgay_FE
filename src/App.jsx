import { useState, useEffect } from "react";
import './utils/notFocusOutline.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Header from "./components/Header";
import FooterHandler from "./components/FooterHandler";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
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

// Import the tutor API functions
import {
  fetchTutorRegisterProfile,
  fetchAllHashtags,
  uploadProfileImage,
  deleteProfileImage,
  registerAsTutor,
  fetchTutorDetail,
  fetchChatConversationsByUserId,
  requestTutorVerification,
  uploadCertificate
} from "./components/api/auth";

// Import the NotFoundPage component
import NotFoundPage from "./pages/NotFoundPage"; // Adjust the path if necessary
import StaffDashboardPage from "./pages/StaffDashboardPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import ManagerDashboardPage from "./pages/ManagerDashboardPage";
import ProtectedRoute, { AdminRoute, StaffRoute, ManagerRoute, BlockedRoute, TutorRoute } from "./components/rbac/ProtectedRoute";
import RoleBasedRedirect from "./components/rbac/RoleBasedRedirect";
import RoleBasedRouteGuard from "./components/rbac/RoleBasedRouteGuard";

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
  setTriggerRoleRedirect
}) {
  const location = useLocation();
  const isStaffRoute = location.pathname.startsWith('/staff');
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isManagerRoute = location.pathname.startsWith('/manager');

  const [firstTutorId, setFirstTutorId] = useState(null);

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
          <Route
            path="/forgot-password"
            element={user ? <Navigate to="/" /> : <ForgotPasswordPage />}
          />
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
                  <UserProfile loggedInUser={user} getUserById={getUserById} />
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

          {/* NEW ROUTE for How It Works */}
          <Route
            path="/how-it-works"
            element={
              <BlockedRoute user={user} blockedRoles={['admin', 'Admin', 'staff', 'Staff', 'manager', 'Manager']}>
                <HowItWork />
              </BlockedRoute>
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
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  const [isConfirmEmailModalOpen, setIsConfirmEmailModalOpen] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [loginPromptMessage, setLoginPromptMessage] = useState("");
  const [isUpdateInfoModalOpen, setIsUpdateInfoModalOpen] = useState(false);
  const [loginModalCallbacks, setLoginModalCallbacks] = useState({ // New state for callbacks
    onLoginSuccess: null,
    onCloseWithoutLogin: null,
  });
  const [firstTutorId, setFirstTutorId] = useState(null);
  const [triggerRoleRedirect, setTriggerRoleRedirect] = useState(false);

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
          phone: matchedAccount.phone,
          avatarUrl: matchedAccount.avatarUrl || "",
          // Include other relevant user data from storage here
          fullName: matchedAccount.fullName || '',
          dateOfBirth: matchedAccount.dateOfBirth || '',
          gender: matchedAccount.gender || '',
          bio: matchedAccount.bio || '',
          learningLanguages: matchedAccount.learningLanguages || [],
          interestsType: matchedAccount.interestsType || '',
          languageSkills: matchedAccount.languageSkills || [],
          interests: matchedAccount.interests || [],
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
            console.log("Updated user from storage in App:", parsedUser.profileImageUrl);
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

  const openLoginModal = (message = "", onLoginSuccess = null, onCloseWithoutLogin = null) => {
    setLoginPromptMessage(message);
    setLoginModalCallbacks({ onLoginSuccess, onCloseWithoutLogin }); // Store callbacks
    setIsLoginModalOpen(true);
  };

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
      phone: userData.phone,
      avatarUrl: userData.avatarUrl || "",
      // Include all other relevant user data here
      fullName: userData.fullName || '',
      dateOfBirth: userData.dateOfBirth || '',
      gender: userData.gender || '',
      bio: userData.bio || '',
      learningLanguages: userData.learningLanguages || [],
      interestsType: userData.interestsType || '',
      languageSkills: userData.languageSkills || [],
      interests: userData.interests || [],
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
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem("hasUpdatedProfile");
    setTriggerRoleRedirect(false);
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
      />
    </Router>
  );
}

export default App;