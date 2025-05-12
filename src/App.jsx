// import { useState, useEffect } from "react";
// import {
//   BrowserRouter as Router,
//   Routes,
//   Route,
//   Navigate,
//   // Remove useLocation import from here
// } from "react-router-dom";
// import Header from "./components/Header";
// // Remove direct import of Footer from here
// import FooterHandler from "./components/FooterHandler"; // Import the new component
// import SignupPage from "./pages/SignUpPage";
// import ForgotPasswordPage from "./pages/ForgotPasswordPage";
// import HomePage from "./pages/HomePage";
// import TutorList from "./components/tutors/TutorList";
// import TutorProfile from "./components/tutors/TutorProfile";
// import LoginModal from "./components/modals/LoginModal";
// import SignUpModal from "./components/modals/SignUpModal";
// import TutorSubjectList from "./components/tutors/TutorSubjectList";
// import MessagePage from "./pages/MessageListPage";
// import ConfirmEmail from "./components/modals/ConfirmEmail";
// import { fetchUsers } from "./components/api/auth"; // Assuming fetchUsers is used here
// import UpdateInformationModal from "./components/modals/UpdateInformationModal";
// import UserProfile from "./components/users/UserProfile"; // Import the new UserProfile component

// const USER_STORAGE_KEY = "loggedInUser";
// const REMEMBERED_ACCOUNTS_KEY = "rememberedAccounts";
// const ACCOUNTS_STORAGE_KEY = "accounts";

// function App() {
//   const [user, setUser] = useState(null);
//   const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
//   const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
//   const [isConfirmEmailModalOpen, setIsConfirmEmailModalOpen] = useState(false);
//   const [confirmEmail, setConfirmEmail] = useState("");
//   const [isLoadingAuth, setIsLoadingAuth] = useState(true);
//   const [loginPromptMessage, setLoginPromptMessage] = useState("");
//   const [isUpdateInfoModalOpen, setIsUpdateInfoModalOpen] = useState(false);

//   useEffect(() => {
//     setIsLoadingAuth(true);
//     const storedUser = localStorage.getItem(USER_STORAGE_KEY);
//     if (storedUser) {
//       setUser(JSON.parse(storedUser));
//       setIsLoadingAuth(false);
//       // Check if the user has already updated their profile
//       const hasUpdatedProfile = localStorage.getItem("hasUpdatedProfile");
//       if (!hasUpdatedProfile) {
//         // setIsUpdateInfoModalOpen(true); // Commenting out to avoid modal on every reload if already updated
//       }
//       return;
//     }

//     const remembered = JSON.parse(
//       localStorage.getItem(REMEMBERED_ACCOUNTS_KEY) || "[]"
//     );
//     const now = Date.now();
//     const validRemembered = remembered.filter((acc) => acc.expires > now);
//     localStorage.setItem(
//       REMEMBERED_ACCOUNTS_KEY,
//       JSON.stringify(validRemembered)
//     );

//     if (validRemembered.length > 0) {
//       const accountToLogin = validRemembered[validRemembered.length - 1];
//       const allAccounts = JSON.parse(
//         localStorage.getItem(ACCOUNTS_STORAGE_KEY) || "[]"
//       );
//       const matchedAccount = allAccounts.find(
//         (acc) => acc.phone === accountToLogin.phone
//       );

//       if (matchedAccount) {
//         const userData = {
//           id: matchedAccount.id || Date.now().toString(),
//           name: matchedAccount.name,
//           phone: matchedAccount.phone,
//           avatarUrl: matchedAccount.avatarUrl || "",
//         };
//         setUser(userData);
//         localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
//       }
//     }
//     setIsLoadingAuth(false);
//   }, []);

//   const openLoginModal = (message = "") => {
//     setLoginPromptMessage(message);
//     setIsLoginModalOpen(true);
//   };

//   const closeLoginModal = () => {
//     setIsLoginModalOpen(false);
//     setLoginPromptMessage("");
//   };

//   const openSignUpModal = () => setIsSignUpModalOpen(true);
//   const closeSignUpModal = () => setIsSignUpModalOpen(false);

//   const handleLogin = async (userData) => {
//     const fullUserData = {
//       ...userData,
//       avatarUrl: userData.avatarUrl || "",
//     };
//     setUser(fullUserData);
//     localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(fullUserData));

//     // Fetch the user's data to get the profilePictureUrl
//     try {
//       const users = await fetchUsers(); // Make sure fetchUsers is correctly implemented
//       const targetUser = users.find((u) => u.id === userData.id);
//       if (targetUser && targetUser.profilePictureUrl) {
//         const updatedUserData = {
//           ...fullUserData,
//           profilePictureUrl: targetUser.profilePictureUrl,
//         };
//         setUser(updatedUserData);
//         localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUserData));
//       }
//     } catch (error) {
//       console.error("Failed to fetch user data:", error);
//     }

//     closeLoginModal();
//     // setIsUpdateInfoModalOpen(true); // Consider if you still want this modal after login
//   };

//   const handleLogout = () => {
//     setUser(null);
//     localStorage.removeItem(USER_STORAGE_KEY);
//     localStorage.removeItem("hasUpdatedProfile"); // Clear this on logout too
//   };

//   const switchToSignup = () => {
//     closeLoginModal();
//     openSignUpModal();
//   };

//   const switchToLogin = () => {
//     closeSignUpModal();
//     openLoginModal();
//   };

//   const handleSignUpSuccess = (email) => {
//     setConfirmEmail(email);
//     setIsConfirmEmailModalOpen(true);
//   };

//   const handleConfirmEmailSuccess = () => {
//     setIsConfirmEmailModalOpen(false);
//     openLoginModal("Your email has been confirmed. Please log in.");
//   };

//   const handleUpdateInfoSubmit = (info) => {
//     // Update user info in state and localStorage
//     const updatedUser = {
//       ...user,
//       fullName: info.fullName,
//       dateOfBirth: info.dateOfBirth,
//       gender: info.gender
//     };
//     setUser(updatedUser);
//     localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
//     localStorage.setItem("hasUpdatedProfile", "true"); // Mark as updated
//     setIsUpdateInfoModalOpen(false);
//   };


//   // Added fetch user logic based on ID for UserProfile.
//   // You'll need a proper API endpoint for this in a real application.
//   // For now, this is a placeholder function.
//   const getUserById = async (userId) => {
//     // Replace with your actual API call to fetch a user by ID
//     try {
//         const response = await fetch(`/api/users/${userId}`); // Example API endpoint
//         if (!response.ok) {
//             throw new Error('Failed to fetch user');
//         }
//         const userData = await response.json();
//         return userData;
//     } catch (error) {
//         console.error("Error fetching user by ID:", error);
//         return null; // Or handle error appropriately
//     }
//   };


//   if (isLoadingAuth) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <Router>
//       <div className="min-h-screen flex flex-col bg-gray-100 overflow-x-hidden overflow-y-hidden">
//         <Header
//           user={user}
//           onLogout={handleLogout}
//           onLoginClick={() => openLoginModal()}
//           onSignUpClick={openSignUpModal}
//         />
//         {/* Removed mx-20 from main to allow MessagePage to use full width if needed */}
//         <main className="flex-1 py-8">
//           <Routes>
//             <Route
//               path="/signup-page"
//               element={user ? <Navigate to="/" /> : <SignupPage />}
//             />
//             <Route
//               path="/forgot-password"
//               element={user ? <Navigate to="/" /> : <ForgotPasswordPage />}
//             />
//             <Route path="/" element={<HomePage user={user} />} />
//             <Route
//               path="/languages"
//               element={
//                 <TutorList user={user} onRequireLogin={openLoginModal} />
//               }
//             />
//             <Route
//               path="/teacher/:id"
//               element={
//                 <TutorProfile
//                   user={user}
//                   onRequireLogin={openLoginModal}
//                 />
//               }
//             />
//             <Route
//               path="/tutor/:subject"
//               element={<TutorSubjectList />}
//             />

//             {/* NEW ROUTE for Messaging */}
//             <Route
//               path="/message/:id"
//               element={
//                 user ? <MessagePage user={user} /> : <Navigate to="/" replace />
//               }
//             />

//             {/* NEW ROUTE for User Profile */}
//             {/* Pass getUserById function to UserProfile or fetch inside UserProfile */}
//             <Route
//               path="/user/:id"
//               element={user ? <UserProfile loggedInUser={user} getUserById={getUserById} /> : <Navigate to="/signup-page" replace />}
//             />


//             <Route path="*" element={<Navigate to="/" />} />
//           </Routes>
//         </main>
//         <FooterHandler /> {/* Use the new component here */}
//         <LoginModal
//           isOpen={isLoginModalOpen}
//           onClose={closeLoginModal}
//           onLogin={handleLogin}
//           onSwitchToSignup={switchToSignup}
//           promptMessage={loginPromptMessage}
//         />
//         <SignUpModal
//           isOpen={isSignUpModalOpen}
//           onClose={closeSignUpModal}
//           onSignUpSuccess={handleSignUpSuccess}
//           onSwitchToLogin={switchToLogin}
//         />
//         <ConfirmEmail
//           isOpen={isConfirmEmailModalOpen}
//           onClose={() => setIsConfirmEmailModalOpen(false)}
//           email={confirmEmail}
//           onConfirmSuccess={handleConfirmEmailSuccess}
//         />
//         <UpdateInformationModal
//           isOpen={isUpdateInfoModalOpen}
//           onClose={() => setIsUpdateInfoModalOpen(false)}
//           onSubmit={handleUpdateInfoSubmit}
//           user={user}
//         />
//       </div>
//     </Router>
//   );
// }

// export default App;

import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Header from "./components/Header";
import FooterHandler from "./components/FooterHandler";
import SignupPage from "./pages/SignUpPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import HomePage from "./pages/HomePage";
import TutorList from "./components/tutors/TutorList";
import TutorProfile from "./components/tutors/TutorProfile";
import LoginModal from "./components/modals/LoginModal";
import SignUpModal from "./components/modals/SignUpModal";
import TutorSubjectList from "./components/tutors/TutorSubjectList";
import MessagePage from "./pages/MessageListPage";
import ConfirmEmail from "./components/modals/ConfirmEmail";
import { fetchUsers } from "./components/api/auth";
import UpdateInformationModal from "./components/modals/UpdateInformationModal";
import UserProfile from "./components/users/UserProfile";

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

  const handleLogin = async (userData) => {
    const fullUserData = {
      ...userData,
      avatarUrl: userData.avatarUrl || "",
    };
    setUser(fullUserData);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(fullUserData));

    try {
      const users = await fetchUsers();
      const targetUser = users.find((u) => u.id === userData.id);
      if (targetUser && targetUser.profilePictureUrl) {
        const updatedUserData = {
          ...fullUserData,
          profilePictureUrl: targetUser.profilePictureUrl,
        };
        setUser(updatedUserData);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUserData));
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    }

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

  const handleUpdateInfoSubmit = (info) => {
    const updatedUser = {
      ...user,
      fullName: info.fullName,
      dateOfBirth: info.dateOfBirth,
      gender: info.gender,
    };
    setUser(updatedUser);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
    localStorage.setItem("hasUpdatedProfile", "true");
    setIsUpdateInfoModalOpen(false);
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
            <Route
              path="/message/:id"
              element={
                user ? <MessagePage user={user} /> : <Navigate to="/" replace />
              }
            />
            <Route
              path="/user/:id"
              element={user ? <UserProfile loggedInUser={user} getUserById={getUserById} /> : <Navigate to="/signup-page" replace />}
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