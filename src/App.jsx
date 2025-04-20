import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import SignupPage from './pages/SignUpPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import HomePage from './pages/HomePage';
import LoginModal from './components/modals/LoginModal';
import SignUpModal from './components/modals/SignUpModal';

// Key for storing logged-in user data
const USER_STORAGE_KEY = 'loggedInUser';
// Key for storing remembered accounts (for auto-login)
const REMEMBERED_ACCOUNTS_KEY = "rememberedAccounts";
// Key for storing all registered accounts
const ACCOUNTS_STORAGE_KEY = "accounts";

function App() {
  // --- State ---
  const [user, setUser] = useState(null); // Initialize user as null
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true); // To prevent flicker

  // --- Effects ---
  // Check for remembered user on initial load
  useEffect(() => {
    setIsLoadingAuth(true);
    // 1. Check direct loggedInUser storage (highest priority)
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsLoadingAuth(false);
      return; // Found user, stop checking
    }

    // 2. Check remembered accounts (for "Keep me logged in")
    const remembered = JSON.parse(localStorage.getItem(REMEMBERED_ACCOUNTS_KEY) || "[]");
    const now = Date.now();
    const validRemembered = remembered.filter(acc => acc.expires > now);
    localStorage.setItem(REMEMBERED_ACCOUNTS_KEY, JSON.stringify(validRemembered)); // Clean expired

    if (validRemembered.length > 0) {
       // Optionally auto-login the most recently remembered valid user
       const accountToLogin = validRemembered[validRemembered.length - 1];
       const allAccounts = JSON.parse(localStorage.getItem(ACCOUNTS_STORAGE_KEY) || "[]");
       const matchedAccount = allAccounts.find(acc => acc.phone === accountToLogin.phone);

       if (matchedAccount) {
           const userData = {
               id: matchedAccount.id || Date.now().toString(), // Ensure ID exists
               name: matchedAccount.name, // Ensure name is fetched
               phone: matchedAccount.phone,
               avatarUrl: matchedAccount.avatarUrl || '' // Get avatar if available
           };
           setUser(userData);
           localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData)); // Store as logged-in
       }
    }
    setIsLoadingAuth(false); // Done checking
  }, []);


  // --- Modal Handlers ---
  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);
  const openSignUpModal = () => setIsSignUpModalOpen(true);
  const closeSignUpModal = () => setIsSignUpModalOpen(false);

  // --- Auth Handlers ---
  const handleLogin = (userData) => {
    const fullUserData = {
        ...userData,
        avatarUrl: userData.avatarUrl || '' // Ensure avatarUrl exists
    };
    setUser(fullUserData);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(fullUserData)); // Store logged-in user
    closeLoginModal();
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    // Optional: Clear remembered accounts on explicit logout?
    // localStorage.removeItem(REMEMBERED_ACCOUNTS_KEY);
  };

  // --- Modal Switching Handlers ---
  const switchToSignup = () => {
    closeLoginModal();
    openSignUpModal();
  };

  const switchToLogin = () => {
    closeSignUpModal();
    openLoginModal();
  };

  // Called from SignUpModal on success
  const handleSignUpSuccess = () => {
    closeSignUpModal();
    openLoginModal(); // Immediately open login modal
  };

  // Prevent rendering main UI until auth status is checked
  if (isLoadingAuth) {
      return <div>Loading...</div>; // Or a proper spinner component
  }

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-100 overflow-x-hidden">
        {/* Pass user state and handlers to Header */}
        <Header
          user={user}
          onLogout={handleLogout}
          onLoginClick={openLoginModal} // Pass function to open modal
          onSignUpClick={openSignUpModal} // Pass function to open modal
        />
        <main className="flex-1"> {/* Changed div to main for semantics */}
          <Routes>
             {/* Redirect logged-in users away from auth pages */}
            <Route path="/signup-page" element={ user ? <Navigate to="/" /> : <SignupPage /> } /> {/* Keep distinct page route if needed */}
            <Route path="/forgot-password" element={ user ? <Navigate to="/" /> : <ForgotPasswordPage /> } />
            {/* Pass user to HomePage */}
            <Route path="/" element={<HomePage user={user} />} />
            {/* Add other routes here */}
             <Route path="*" element={<Navigate to="/" />} /> {/* Basic catch-all */}
          </Routes>
        </main>
        <Footer />

        {/* Render Modals controlled by App state */}
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={closeLoginModal}
          onLogin={handleLogin} // Use the App's login handler
          onSwitchToSignup={switchToSignup}
        />
        <SignUpModal
          isOpen={isSignUpModalOpen}
          onClose={closeSignUpModal}
          onSignUpSuccess={handleSignUpSuccess} // Connect sign-up success to login modal
          onSwitchToLogin={switchToLogin} // Allow switching back to login
        />
      </div>
    </Router>
  );
}

export default App;