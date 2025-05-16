import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Header from "./components/Header";
import FooterHandler from "./components/FooterHandler";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import HomePage from "./pages/HomePage";
import TutorList from "./components/tutors/TutorList";
import TutorProfile from "./components/tutors/TutorProfile";
import LoginModal from "./components/modals/LoginModal";
import SignUpModal from "./components/modals/SignUpModal";
import TutorSubjectList from "./components/tutors/TutorSubjectList";
import MessagePage from "./pages/MessageListPage";
import BecomeATutorPage from "./pages/BecomeATutorPage";
import ConfirmEmail from "./components/modals/ConfirmEmail";
// import { fetchUsers } from "./components/api/auth";
import UpdateInformationModal from "./components/modals/UpdateInformationModal";
import UserProfile from "./components/users/UserProfile";
import EditUserProfile from "./components/users/EditUserProfile"; // Import the new component

// Import the NotFoundPage component
import NotFoundPage from "./pages/NotFoundPage"; // Adjust the path if necessary

const USER_STORAGE_KEY = "loggedInUser";
const REMEMBERED_ACCOUNTS_KEY = "rememberedAccounts";
const ACCOUNTS_STORAGE_KEY = "accounts";

function App() {
  const [user, setUser] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  const [isConfirmEmailModalOpen, setIsConfirmEmailModalOpen] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [loginPromptMessage, setLoginPromptMessage] = useState("");
  const [isUpdateInfoModalOpen, setIsUpdateInfoModalOpen] = useState(false);

  console.log("Hello: ", user);

  useEffect(() => {
    setIsLoadingAuth(true);
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (storedUser) {
      setUser(JSON.parse(storedUser));
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

  const openLoginModal = (message = "") => {
    setLoginPromptMessage(message);
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
    setLoginPromptMessage("");
  };

  const openSignUpModal = () => setIsSignUpModalOpen(true);
  const closeSignUpModal = () => setIsSignUpModalOpen(false);

  const handleLogin = async (userData) => {
    // Ensure all relevant user data is included upon login
    const fullUserData = {
      ...userData,
      profileImageUrl: userData.profileImageUrl || "",
      fullName: userData.fullName || '',
      dateOfBirth: userData.dateOfBirth || '',
      gender: userData.gender || '',
      bio: userData.bio || '',
      learningLanguages: userData.learningLanguages || [],
      interestsType: userData.interestsType || '',
      languageSkills: userData.languageSkills || [],
      interests: userData.interests || [],
      // Include other fields here
    };
    setUser(fullUserData);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(fullUserData));
    closeLoginModal();
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem("hasUpdatedProfile");
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
      <div className="min-h-screen flex flex-col bg-gray-100 overflow-x-hidden overflow-y-hidden">
        <Header
          user={user}
          onLogout={handleLogout}
          onLoginClick={() => openLoginModal()}
          onSignUpClick={openSignUpModal}
        />
        <main className="flex-1 py-8">
          <Routes>
            <Route
              path="/forgot-password"
              element={user ? <Navigate to="/" /> : <ForgotPasswordPage />}
            />
            <Route path="/" element={<HomePage user={user} />} />
            <Route
              path="/languages"
              element={
                <TutorList user={user} onRequireLogin={openLoginModal} />
              }
            />
            <Route
              path="/teacher/:id"
              element={
                <TutorProfile
                  user={user}
                  onRequireLogin={openLoginModal}
                />
              }
            />
            <Route
              path="/tutor/:subject"
              element={<TutorSubjectList />}
            />
            <Route
              path="/become-tutor"
              element={<BecomeATutorPage />}
            />

            {/* NEW ROUTE for Messaging */}
            <Route
              path="/message/:id"
              element={
                user ? <MessagePage user={user} /> : <Navigate to="/" replace />
              }
            />
            {/* Route for viewing a user profile */}
            <Route
              path="/user/:id"
              element={user ? <UserProfile loggedInUser={user} getUserById={getUserById} /> : <Navigate to="/signup-page" replace />}
            />
            {/* NEW ROUTE for editing a user profile */}
            <Route
              path="/user/edit/:id"
              // Pass loggedInUser to EditUserProfile for authorization and initial data
              element={user ? <EditUserProfile loggedInUser={user} /> : <Navigate to="/signup-page" replace />}
            />

            {/* This route catches all other paths and renders the NotFoundPage */}
            <Route path="*" element={<NotFoundPage />} />

          </Routes>
        </main>
        <FooterHandler />
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
    </Router>
  );
}

export default App;