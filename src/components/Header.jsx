import { Link } from "react-router-dom";
import { useState } from "react";

function Header({ user, onLogout }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm w-full border-b border-gray-200">
      <div className="w-full px-4 sm:px-6 py-3 flex justify-between items-center">
        {/* Logo and Navigation Links */}
        <div className="flex items-center gap-4 sm:gap-6">
          <Link to="/" className="text-black text-lg sm:text-xl font-semibold">
            LangConnect
          </Link>
          {/* Navigation Links - Hidden on mobile, visible on larger screens */}
          <div className="hidden md:flex items-center gap-4 sm:gap-6">
            <Link to="/teachers" className="text-gray-700 hover:text-black text-sm sm:text-base">
              Find teachers
            </Link>
            <Link to="/languages" className="text-gray-700 hover:text-black text-sm sm:text-base">
              Languages
            </Link>
            <Link to="/how-it-works" className="text-gray-700 hover:text-black text-sm sm:text-base">
              How it works
            </Link>
            <Link to="/pricing" className="text-gray-700 hover:text-black text-sm sm:text-base">
              Pricing
            </Link>
          </div>
        </div>

        {/* Right Side: User Actions and Hamburger Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* User Actions - Adjust padding and font size responsively */}
          {user ? (
            <button
              onClick={onLogout}
              className="text-black px-3 sm:px-4 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm font-semibold border border-gray-300 hover:bg-gray-100"
            >
              Log out
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="text-black px-3 sm:px-4 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm font-semibold border border-gray-300 hover:bg-gray-100"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="bg-black text-white px-3 sm:px-4 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm font-semibold hover:bg-gray-800"
              >
                Sign up
              </Link>
            </>
          )}
          {/* Hamburger Menu - Visible on mobile only */}
          <button
            className="md:hidden p-2 text-gray-700 hover:text-black"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu - Visible when hamburger is clicked */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200">
          <div className="flex flex-col px-4 py-2 space-y-2">
            <Link
              to="/teachers"
              className="text-gray-700 hover:text-black text-sm py-2"
              onClick={toggleMenu}
            >
              Find teachers
            </Link>
            <Link
              to="/languages"
              className="text-gray-700 hover:text-black text-sm py-2"
              onClick={toggleMenu}
            >
              Languages
            </Link>
            <Link
              to="/how-it-works"
              className="text-gray-700 hover:text-black text-sm py-2"
              onClick={toggleMenu}
            >
              How it works
            </Link>
            <Link
              to="/pricing"
              className="text-gray-700 hover:text-black text-sm py-2"
              onClick={toggleMenu}
            >
              Pricing
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;