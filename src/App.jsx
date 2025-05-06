import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  // Remove useLocation import from here
} from "react-router-dom";
import Header from "./components/Header";
// Remove direct import of Footer from here
import FooterHandler from "./components/FooterHandler"; // Import the new component
import SignupPage from "./pages/SignUpPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import HomePage from "./pages/HomePage";
import TutorList from "./components/tutors/TutorList";
import TutorProfile from "./components/tutors/TutorProfile";
import LoginModal from "./components/modals/LoginModal";
import SignUpModal from "./components/modals/SignUpModal";
import TutorSubjectList from "./components/tutors/TutorSubjectList";
import MessagePage from "./pages/MessageListPage";

const USER_STORAGE_KEY = "loggedInUser";
const REMEMBERED_ACCOUNTS_KEY = "rememberedAccounts";
const ACCOUNTS_STORAGE_KEY = "accounts";

function App() {
  const [user, setUser] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [loginPromptMessage, setLoginPromptMessage] = useState("");

  // Remove useLocation() call from here

  useEffect(() => {
    setIsLoadingAuth(true);
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsLoadingAuth(false);
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
        };
        setUser(userData);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
      }
    }
    setIsLoadingAuth(false);
  }, []);

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

  const handleLogin = (userData) => {
    const fullUserData = {
      ...userData,
      avatarUrl: userData.avatarUrl || "",
    };
    setUser(fullUserData);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(fullUserData));
    closeLoginModal();
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
  };

  const switchToSignup = () => {
    closeLoginModal();
    openSignUpModal();
  };

  const switchToLogin = () => {
    closeSignUpModal();
    openLoginModal();
  };

  const handleSignUpSuccess = () => {
    closeSignUpModal();
    openLoginModal();
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
        {/* Removed mx-20 from main to allow MessagePage to use full width if needed */}
        <main className="flex-1">
          <Routes>
            <Route
              path="/signup-page"
              element={user ? <Navigate to="/" /> : <SignupPage />}
            />
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

            {/* NEW ROUTE for Messaging */}
            <Route
              path="/message/:id"
              element={
                user ? <MessagePage user={user} /> : <Navigate to="/" replace />
              }
            />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <FooterHandler /> {/* Use the new component here */}
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
      </div>
    </Router>
  );
}

export default App;