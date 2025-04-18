import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignUpPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import HomePage from './pages/HomePage';

function App() {
  const [user, setUser] = useState(localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-100 overflow-x-hidden">
        <Header user={user} onLogout={handleLogout} />
        <div className="flex-1">
          <Routes>
            <Route path="/login" element={
              user ? <Navigate to="/" /> : <LoginPage onLogin={handleLogin} />
            } />
            <Route path="/signup" element={
              user ? <Navigate to="/" /> : <SignupPage />
            } />
            <Route path="/forgot-password" element={
              user ? <Navigate to="/" /> : <ForgotPasswordPage />
            } />
            <Route path="/" element={<HomePage user={user} />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;